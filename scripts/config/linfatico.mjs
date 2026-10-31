// Sistema linfatico: la lista de estructuras sale de las fichas (scripts/datos/linfatico).
import datos from '../datos/linfatico/index.mjs';
import { configDesdeDatos } from './desde-datos.mjs';

// Mallas pequeñas y de pocos polígonos: no se simplifican.
export default configDesdeDatos('linfatico', datos, { simplificar: 1 });
