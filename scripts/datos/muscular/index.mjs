// Datos del sistema muscular (músculos pares; los que no tienen malla en BodyParts3D quedan pendientes).
import cabezaCuello from './cabeza-cuello.mjs';
import tronco from './tronco.mjs';
import miembroSuperior from './miembro-superior.mjs';
import miembroInferior from './miembro-inferior.mjs';

// Cada musculo() devuelve la pareja derecha/izquierda: se aplana.
export default [...cabezaCuello, ...tronco, ...miembroSuperior, ...miembroInferior].flat();
