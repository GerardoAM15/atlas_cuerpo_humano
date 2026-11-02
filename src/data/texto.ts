/** Quita acentos y diéresis y pasa a minúsculas: «Fémur» → «femur», «Cúbito» → «cubito». */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}
