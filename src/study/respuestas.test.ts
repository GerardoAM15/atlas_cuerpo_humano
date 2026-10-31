import { describe, expect, it } from 'vitest';
import { POR_ID } from '@/data/catalogo';
import { conceptoDe, conceptoId, conceptos, nombreBase } from './conceptos';
import { evaluarEscrita, levenshtein } from './respuestas';

const femurD = POR_ID.get('femur-d')!;
const cubitoI = POR_ID.get('cubito-i')!;

describe('conceptos', () => {
  it('agrupan derecha e izquierda bajo un mismo id y nombre sin lado', () => {
    expect(conceptoId(femurD)).toBe('femur');
    expect(nombreBase(femurD)).toBe('Fémur');
    expect(nombreBase(POR_ID.get('timo-i')!)).toBe('Lóbulo del timo');
    const c = conceptoDe('femur-i')!;
    expect(c.lados.map((e) => e.id).sort()).toEqual(['femur-d', 'femur-i']);
    expect(c.e.id).toBe('femur-d');
  });

  it('las estructuras impares son su propio concepto', () => {
    expect(conceptos().get('esternon')?.lados).toHaveLength(1);
  });
});

describe('respuestas escritas', () => {
  it('acepta español, latín e inglés con o sin acentos', () => {
    expect(evaluarEscrita('Fémur derecho', femurD)).toBe('correcta');
    expect(evaluarEscrita('femur derecho', femurD)).toBe('correcta');
    expect(evaluarEscrita('FEMUR', femurD)).toBe('falta-lado');
    expect(evaluarEscrita('right femur', femurD)).toBe('correcta');
    expect(evaluarEscrita('Femur', { ...femurD, lado: undefined, nombre: 'Fémur' })).toBe('correcta');
  });

  it('acepta los nombres alternativos entre paréntesis', () => {
    expect(evaluarEscrita('ulna izquierdo', { ...cubitoI, nombre: 'Cúbito (ulna) izquierdo' })).toBe('correcta');
    expect(evaluarEscrita('cúbito', cubitoI)).toBe('falta-lado');
  });

  it('tolera erratas leves y rechaza respuestas distintas', () => {
    expect(evaluarEscrita('femr derecho', femurD)).toBe('casi');
    expect(evaluarEscrita('tibia derecha', femurD)).toBe('incorrecta');
    expect(evaluarEscrita('', femurD)).toBe('incorrecta');
  });

  it('levenshtein', () => {
    expect(levenshtein('casa', 'cosa')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
});
