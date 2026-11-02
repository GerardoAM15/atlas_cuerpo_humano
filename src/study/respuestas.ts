// Evaluación de respuestas escritas: sin distinguir acentos ni mayúsculas, en español, latín o inglés.
import { normalizar } from '@/data/texto';
import type { ResumenEstructura } from '@/data/esquemas';
import { nombreBase } from './conceptos';

export type ResultadoEscrito = 'correcta' | 'falta-lado' | 'casi' | 'incorrecta';

/** Distancia de edición de Levenshtein. */
export function levenshtein(a: string, b: string): number {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = fila[0]!;
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j]!;
      fila[j] = Math.min(fila[j]! + 1, fila[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = arriba;
    }
  }
  return fila[b.length]!;
}

/** Quita lo que va entre paréntesis y la puntuación: «Cúbito (ulna)» → «cubito». */
const limpiar = (s: string) =>
  normalizar(s)
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Formas aceptadas de un nombre: sin paréntesis, con ellos y con la alternativa entre paréntesis
 * en lugar del término principal: «Cúbito (ulna) izquierdo» → «cubito izquierdo»,
 * «cubito ulna izquierdo», «ulna izquierdo» y «ulna».
 */
function formas(nombre: string): string[] {
  const res = new Set([limpiar(nombre), limpiar(nombre.replace(/[()]/g, ' '))]);
  const m = /^(.*?)\s*\(([^)]*)\)(.*)$/.exec(nombre);
  if (m) {
    const [, , alternativa = '', despues = ''] = m;
    res.add(limpiar(`${alternativa}${despues}`));
    res.add(limpiar(alternativa));
  }
  return [...res].filter(Boolean);
}

/** Tolerancia a erratas: una letra en nombres cortos, una más por cada 8 caracteres. */
const tolerancia = (s: string) => Math.max(1, Math.floor(s.length / 8));

/**
 * Evalúa lo escrito frente a una estructura. Si la estructura es par y la respuesta acierta el
 * nombre pero no el lado, devuelve «falta-lado».
 */
export function evaluarEscrita(texto: string, e: Pick<ResumenEstructura, 'nombre' | 'latin' | 'ingles' | 'lado'>): ResultadoEscrito {
  const r = limpiar(texto);
  if (!r) return 'incorrecta';
  // El nombre latino no lleva lado: en las estructuras pares solo acredita el concepto.
  const completas = [...formas(e.nombre), ...formas(e.ingles), ...(e.lado ? [] : formas(e.latin))];
  const base = e.lado ? [...formas(nombreBase(e)), ...formas(e.latin)] : [];
  if (completas.includes(r)) return 'correcta';
  if (base.includes(r)) return 'falta-lado';
  if (completas.some((f) => levenshtein(r, f) <= tolerancia(f))) return 'casi';
  if (base.some((f) => levenshtein(r, f) <= tolerancia(f))) return 'falta-lado';
  return 'incorrecta';
}

/** Calidad SM-2 asociada a cada resultado. */
export const CALIDAD_ESCRITA: Record<ResultadoEscrito, number> = { correcta: 5, 'falta-lado': 3, casi: 4, incorrecta: 1 };
