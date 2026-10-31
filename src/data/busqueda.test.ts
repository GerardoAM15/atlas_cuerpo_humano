import { describe, expect, it } from 'vitest';
import { crearBuscador, normalizar } from './busqueda';
import { ESTRUCTURAS } from './catalogo';

const buscar = crearBuscador(ESTRUCTURAS);
const ids = (q: string, n = 5) => buscar(q, n).map((e) => e.id);

describe('normalizar', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalizar('Fémur')).toBe('femur');
    expect(normalizar('CÚBITO')).toBe('cubito');
    expect(normalizar('Vómer')).toBe('vomer');
  });
});

describe('búsqueda de estructuras', () => {
  it('encuentra por nombre en español, con y sin acentos', () => {
    expect(ids('fémur')).toEqual(expect.arrayContaining(['femur-d', 'femur-i']));
    expect(ids('femur')).toEqual(expect.arrayContaining(['femur-d', 'femur-i']));
    expect(ids('esternon')[0]).toBe('esternon');
    expect(ids('clavícula derecha')[0]).toBe('clavicula-d');
  });

  it('encuentra por latín (Terminologia Anatomica)', () => {
    expect(ids('os hyoideum')[0]).toBe('hioides');
    expect(ids('mandibula')[0]).toBe('mandibula');
    expect(ids('os scaphoideum')).toEqual(expect.arrayContaining(['escafoides-d']));
  });

  it('encuentra por inglés', () => {
    expect(ids('collarbone').length + ids('clavicle').length).toBeGreaterThan(0);
    expect(ids('clavicle')).toEqual(expect.arrayContaining(['clavicula-d', 'clavicula-i']));
    expect(ids('left femur')[0]).toBe('femur-i');
    expect(ids('hip bone')).toEqual(expect.arrayContaining(['coxal-d']));
  });

  it('tolera errores de escritura', () => {
    expect(ids('esfenoide')).toContain('esfenoides');
    expect(ids('humeor')).toEqual(expect.arrayContaining(['humero-d']));
  });

  it('no devuelve nada con consultas demasiado cortas', () => {
    expect(buscar('a')).toEqual([]);
  });
});
