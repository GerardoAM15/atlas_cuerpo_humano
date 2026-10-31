// Sistema urinario: la lista de estructuras sale de las fichas (scripts/datos/urinario).
import datos from '../datos/urinario/index.mjs';
import { configDesdeDatos } from './desde-datos.mjs';

// Mallas pequeñas y de pocos polígonos: no se simplifican.
export default configDesdeDatos('urinario', datos, { simplificar: 1 });
