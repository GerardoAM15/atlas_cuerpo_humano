import { describe, expect, it } from 'vitest';
import { POR_ID } from '@/data/catalogo';
import { DURACION_TOTAL, SEGMENTOS, inicioSegmento, posicionBolo } from './modelo';

describe('recorrido del bolo', () => {
  it('sigue el orden anatómico de boca a ano', () => {
    expect(SEGMENTOS.map((s) => s.id)).toEqual(['boca', 'esofago', 'estomago', 'duodeno', 'intestino-delgado', 'intestino-grueso', 'recto']);
  });

  it('avanza por los segmentos en orden y vuelve a empezar', () => {
    const indices = Array.from({ length: 200 }, (_, i) => posicionBolo((i / 200) * DURACION_TOTAL).indice);
    for (let i = 1; i < indices.length; i++) expect(indices[i]!).toBeGreaterThanOrEqual(indices[i - 1]!);
    expect(posicionBolo(DURACION_TOTAL + 0.01).indice).toBe(0);
  });

  it('inicioSegmento sitúa el bolo al principio de cada tramo', () => {
    SEGMENTOS.forEach((_, i) => expect(posicionBolo(inicioSegmento(i) + 0.001).indice).toBe(i));
  });
});

describe('enzimas', () => {
  const todas = SEGMENTOS.flatMap((s) => s.enzimas.map((e) => ({ ...e, segmento: s.id })));

  it('la digestión del almidón empieza en la boca y la de las proteínas en el estómago', () => {
    expect(todas.find((e) => e.sustrato === 'Almidón')?.segmento).toBe('boca');
    expect(todas.find((e) => e.sustrato === 'Proteínas')?.segmento).toBe('estomago');
  });

  it('el páncreas aporta enzimas para proteínas, hidratos de carbono y grasas', () => {
    const pancreas = todas.filter((e) => e.origen === 'Páncreas').map((e) => e.sustrato);
    expect(pancreas.some((s) => s.includes('Proteínas'))).toBe(true);
    expect(pancreas).toContain('Almidón');
    expect(pancreas).toContain('Triglicéridos');
  });

  it('las estructuras citadas existen en el atlas', () => {
    for (const s of SEGMENTOS) for (const id of s.estructuras) expect(POR_ID.has(id), id).toBe(true);
  });
});
