// Datos del sistema esquelético: 206 huesos + cartílagos costales y discos intervertebrales.
import craneo from './craneo.mjs';
import columnaTorax from './columna-torax.mjs';
import miembroSuperior from './miembro-superior.mjs';
import miembroInferior from './miembro-inferior.mjs';

export default [...craneo, ...columnaTorax, ...miembroSuperior, ...miembroInferior];
