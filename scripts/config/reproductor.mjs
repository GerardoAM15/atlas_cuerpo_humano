// Sistema reproductor: la lista de estructuras sale de las fichas (scripts/datos/reproductor).
import datos from '../datos/reproductor/index.mjs';
import { configDesdeDatos } from './desde-datos.mjs';

// Mallas pequeñas y de pocos polígonos: no se simplifican.
export default configDesdeDatos('reproductor', datos, { simplificar: 1 });
