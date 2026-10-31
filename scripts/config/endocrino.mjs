// Sistema endocrino: la lista de estructuras sale de las fichas (scripts/datos/endocrino).
import datos from '../datos/endocrino/index.mjs';
import { configDesdeDatos } from './desde-datos.mjs';

// Mallas pequeñas y de pocos polígonos: no se simplifican.
export default configDesdeDatos('endocrino', datos, { simplificar: 1 });
