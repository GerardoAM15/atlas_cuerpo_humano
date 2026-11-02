import { beforeAll, describe, expect, it } from 'vitest';
import { ArchivoEstructuras, ManifestModelos, ResumenModelos, type Estructura } from './esquemas';
import { INDICE, MODELOS, POR_ID as INDICE_POR_ID, cajaDe, cargarSistemas, fichasCargadas } from './catalogo';
import manifestJson from './manifest-modelos.json';
import { REGIONES } from './regiones';
import { SISTEMAS } from './sistemas';
import esqueletico from './estructuras/esqueletico.json';

// El manifest completo (con elementos y nombres de la fuente) solo lo leen los tests y los scripts.
const MANIFEST = ManifestModelos.parse(manifestJson);
let ESTRUCTURAS: Estructura[] = [];
let POR_ID = new Map<string, Estructura>();
const estructurasDe = (s: string) => ESTRUCTURAS.filter((e) => e.sistema === s);

beforeAll(async () => {
  await cargarSistemas(SISTEMAS.map((s) => s.id));
  ESTRUCTURAS = fichasCargadas();
  POR_ID = new Map(ESTRUCTURAS.map((e) => [e.id, e]));
});

describe('datos de estructuras', () => {
  it('el JSON del esqueleto cumple el esquema Zod', () => {
    const res = ArchivoEstructuras.safeParse(esqueletico);
    expect(res.success ? [] : res.error.issues.slice(0, 5)).toEqual([]);
  });

  it('los ids son únicos en todos los sistemas', () => {
    const ids = ESTRUCTURAS.map((e) => e.id);
    expect(ids.length - new Set(ids).size).toBe(0);
  });

  it('el sistema esquelético tiene los 206 huesos', () => {
    expect(estructurasDe('esqueletico').filter((e) => e.tipo === 'hueso')).toHaveLength(206);
  });

  it('cada nodoModelo existe en el manifest como estructura disponible', () => {
    for (const e of ESTRUCTURAS) {
      const entradas = MANIFEST.sistemas[e.sistema]?.estructuras ?? [];
      const m = entradas.find((x) => x.id === e.id);
      if (e.nodoModelo === null) {
        // Sin modelo: debe figurar como pendiente (no se inventa geometría).
        expect(m?.estado, e.id).toBe('pendiente');
      } else {
        expect(m?.estado, e.id).toBe('disponible');
        expect(entradas.some((x) => x.nodo === e.nodoModelo), e.id).toBe(true);
      }
    }
  });

  it('toda estructura del manifest tiene ficha de datos', () => {
    for (const [sistema, s] of Object.entries(MANIFEST.sistemas)) {
      for (const m of s.estructuras) expect(POR_ID.has(m.id), `${sistema}/${m.id}`).toBe(true);
    }
  });

  it('las relaciones y articulaciones apuntan a ids válidos y no a sí mismas', () => {
    const rotas: string[] = [];
    for (const e of ESTRUCTURAS) {
      const destinos = [...e.relaciones, ...('articulaciones' in e && e.articulaciones ? e.articulaciones.flatMap((a) => a.con) : [])];
      for (const r of destinos) if (!POR_ID.has(r) || r === e.id) rotas.push(`${e.id} → ${r}`);
    }
    expect(rotas).toEqual([]);
  });

  it('las articulaciones son recíprocas entre huesos', () => {
    const faltan: string[] = [];
    for (const e of ESTRUCTURAS) {
      if (e.tipo !== 'hueso') continue;
      for (const otro of e.articulaciones.flatMap((a) => a.con)) {
        const o = POR_ID.get(otro);
        if (o?.tipo === 'hueso' && !o.articulaciones.some((a) => a.con.includes(e.id))) faltan.push(`${e.id} ↔ ${otro}`);
      }
    }
    expect(faltan).toEqual([]);
  });

  it('cada región pertenece al catálogo de regiones de su sistema', () => {
    for (const e of ESTRUCTURAS) {
      expect(REGIONES[e.sistema]?.map((r) => r.id), e.id).toContain(e.region);
    }
  });

  it('el sistema muscular tiene al menos 150 músculos con origen, inserción, inervación, irrigación y acción', () => {
    // El esquema Zod ya obliga a que los cinco campos existan y no estén vacíos.
    expect(estructurasDe('muscular').filter((e) => e.tipo === 'musculo').length).toBeGreaterThanOrEqual(150);
  });

  it('cada vaso indica si es arteria o vena y qué sangre lleva', () => {
    const vasos = estructurasDe('cardiovascular').filter((e) => e.tipo === 'vaso');
    expect(vasos.length).toBeGreaterThan(50);
    for (const v of vasos) expect('vaso' in v && v.vaso, v.id).toBeTruthy();
    // Las arterias pulmonares llevan sangre desoxigenada y las venas pulmonares, oxigenada.
    const ap = vasos.find((v) => v.id === 'arteria-pulmonar-d');
    const vp = vasos.find((v) => v.id === 'vena-pulmonar-superior-d');
    expect(ap && 'vaso' in ap && ap.vaso?.sangre).toBe('desoxigenada');
    expect(vp && 'vaso' in vp && vp.vaso?.sangre).toBe('oxigenada');
  });

  it('los pulmones figuran como pendientes de modelo (BodyParts3D no los incluye)', () => {
    expect(POR_ID.get('pulmon-d')?.nodoModelo).toBeNull();
    expect(POR_ID.get('pulmon-i')?.nodoModelo).toBeNull();
  });

  it('los 11 sistemas tienen fichas y modelo 3D', () => {
    for (const s of SISTEMAS) {
      expect(estructurasDe(s.id).length, s.id).toBeGreaterThan(0);
      expect(MANIFEST.sistemas[s.id], s.id).toBeDefined();
    }
  });

  it('el aparato genital femenino figura como pendiente (el modelo de BodyParts3D es masculino)', () => {
    for (const id of ['ovarios', 'trompas-uterinas', 'utero', 'vagina']) expect(POR_ID.get(id)?.nodoModelo, id).toBeNull();
  });

  it('las estructuras pares están completas (derecha e izquierda)', () => {
    for (const e of ESTRUCTURAS.filter((x) => x.lado)) {
      const pareja = e.id.replace(/-(d|i)$/, (_, s: string) => (s === 'd' ? '-i' : '-d'));
      expect(POR_ID.has(pareja), e.id).toBe(true);
    }
  });
});

describe('índice y resumen de modelos (lo que la app carga al inicio)', () => {
  it('el índice coincide con las fichas completas', () => {
    expect(INDICE.map((e) => e.id).sort()).toEqual(ESTRUCTURAS.map((e) => e.id).sort());
    for (const r of INDICE) {
      const e = POR_ID.get(r.id)!;
      expect([r.nombre, r.latin, r.ingles, r.sistema, r.region, r.tipo, r.lado, r.nodoModelo], r.id).toEqual([e.nombre, e.latin, e.ingles, e.sistema, e.region, e.tipo, e.lado, e.nodoModelo]);
    }
  });

  it('las cajas y los motivos del índice salen del manifest', () => {
    for (const s of Object.values(MANIFEST.sistemas)) {
      for (const m of s.estructuras) {
        const r = INDICE_POR_ID.get(m.id)!;
        if (m.estado === 'disponible') {
          const c = cajaDe(m.id)!;
          for (let k = 0; k < 3; k++) {
            expect(c.min[k], m.id).toBeCloseTo(m.caja.min[k]!, 3);
            expect(c.max[k], m.id).toBeCloseTo(m.caja.max[k]!, 3);
          }
        } else {
          expect(r.motivo, m.id).toBe(m.motivo);
        }
      }
    }
  });

  it('el resumen de modelos cumple su esquema y coincide con el manifest', () => {
    expect(ResumenModelos.safeParse(MODELOS).success).toBe(true);
    expect(MODELOS.bytesTotales).toBe(MANIFEST.bytesTotales);
    for (const [id, s] of Object.entries(MANIFEST.sistemas)) expect(MODELOS.sistemas[id], id).toMatchObject({ archivo: s.archivo, bytes: s.bytes, triangulos: s.triangulos });
  });
});
