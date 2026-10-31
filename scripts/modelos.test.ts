// @vitest-environment node
// Integridad de los modelos generados por el pipeline (public/models) y de la configuración.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { beforeAll, describe, expect, it } from 'vitest';
import configEsqueletico, { HUESOS_ESPERADOS } from './config/esqueletico.mjs';

interface EntradaManifest {
  id: string;
  nodo: string | null;
  tipo: string;
  estado: 'disponible' | 'pendiente';
  fma?: string[];
  caja?: { min: number[]; max: number[] };
  motivo?: string;
}
interface Manifest {
  sistemas: Record<string, { archivo: string; bytes: number; estructuras: EntradaManifest[] }>;
  bytesTotales: number;
  fuentes: Record<string, { licencia: string; atribucion: string }>;
}

const DIR_PUBLIC = path.resolve(__dirname, '..', 'public');
const manifest: Manifest = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'src', 'data', 'manifest-modelos.json'), 'utf8'),
);
const MB = 1024 * 1024;

describe('configuración del sistema esquelético', () => {
  it(`declara exactamente ${HUESOS_ESPERADOS} huesos con ids únicos`, () => {
    const ids = configEsqueletico.estructuras.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(configEsqueletico.estructuras.filter((e) => e.tipo === 'hueso')).toHaveLength(HUESOS_ESPERADOS);
  });

  it('usa ids válidos como nombres de nodo (GLTFLoader elimina «.», «:», «/» y espacios)', () => {
    for (const e of configEsqueletico.estructuras) expect(e.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});

describe('manifest', () => {
  const esq = manifest.sistemas.esqueletico;

  it('incluye el sistema esquelético con todas las estructuras de la configuración', () => {
    expect(esq).toBeDefined();
    expect(esq!.estructuras.map((e) => e.id).sort()).toEqual(configEsqueletico.estructuras.map((e) => e.id).sort());
  });

  it('las estructuras pendientes no tienen nodo y explican el motivo', () => {
    for (const e of esq!.estructuras.filter((x) => x.estado === 'pendiente')) {
      expect(e.nodo).toBeNull();
      expect(e.motivo).toBeTruthy();
    }
  });

  it('las disponibles tienen id FMA y una caja envolvente coherente', () => {
    for (const e of esq!.estructuras.filter((x) => x.estado === 'disponible')) {
      expect(e.fma?.every((f) => /^FMA\d+$/.test(f))).toBe(true);
      for (let k = 0; k < 3; k++) expect(e.caja!.max[k]).toBeGreaterThanOrEqual(e.caja!.min[k]!);
    }
  });

  it('respeta la orientación: derecha del paciente en −X, anterior en +Z, cabeza arriba', () => {
    const caja = (id: string) => esq!.estructuras.find((e) => e.id === id)!.caja!;
    const centro = (id: string, k: number) => (caja(id).min[k]! + caja(id).max[k]!) / 2;
    expect(centro('femur-d', 0)).toBeLessThan(0);
    expect(centro('femur-i', 0)).toBeGreaterThan(0);
    expect(centro('esternon', 2)).toBeGreaterThan(centro('vertebra-t6', 2));
    expect(centro('frontal', 1)).toBeGreaterThan(centro('femur-d', 1));
  });

  it('cumple el presupuesto: < 8 MB por sistema y < 80 MB en total', () => {
    for (const s of Object.values(manifest.sistemas)) {
      expect(s.bytes).toBeLessThan(8 * MB);
      expect(fs.statSync(path.join(DIR_PUBLIC, s.archivo)).size).toBe(s.bytes);
    }
    expect(manifest.bytesTotales).toBeLessThan(80 * MB);
  });

  it('declara la licencia vigente de BodyParts3D (CC BY 4.0) con su atribución', () => {
    expect(manifest.fuentes.bodyparts3d?.licencia).toBe('CC BY 4.0');
    expect(manifest.fuentes.bodyparts3d?.atribucion).toContain('The Database Center for Life Science');
  });
});

describe('esqueletico.glb', () => {
  let nodos: Set<string>;

  beforeAll(async () => {
    await MeshoptDecoder.ready;
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
    const doc = await io.read(path.join(DIR_PUBLIC, manifest.sistemas.esqueletico!.archivo));
    nodos = new Set(doc.getRoot().listNodes().map((n) => n.getName()));
  });

  it('cada estructura disponible del manifest existe como nodo en el modelo', () => {
    const faltan = manifest.sistemas
      .esqueletico!.estructuras.filter((e) => e.estado === 'disponible')
      .filter((e) => !nodos.has(e.nodo!));
    expect(faltan.map((e) => e.id)).toEqual([]);
  });

  it('no contiene nodos de estructuras pendientes', () => {
    for (const e of manifest.sistemas.esqueletico!.estructuras.filter((x) => x.estado === 'pendiente')) {
      expect(nodos.has(e.id)).toBe(false);
    }
  });
});
