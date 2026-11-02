// Construye la configuración del pipeline 3D a partir de las fichas de scripts/datos/<sistema>/,
// para que haya una sola lista de estructuras por sistema (id + nombres de la fuente + material).
//
// En cada ficha:
//   fuente           nombres ingleses de BodyParts3D (elementos o conceptos compuestos)
//   fuenteZA         objetos de Z-Anatomy (exportados con npm run modelos:zanatomy) si BodyParts3D no la tiene
//   material         clave de material del .glb (por defecto, el tipo)
//   pendienteModelo  motivo si se sabe que no hay modelo
export function configDesdeDatos(sistema, datos, { simplificar = 0.5 } = {}) {
  return {
    sistema,
    simplificar,
    estructuras: datos.map((d) => ({
      id: d.id,
      tipo: d.tipo ?? 'organo',
      ...(d.fuente?.length ? { fuente: d.fuente } : {}),
      ...(d.fuenteZA?.length ? { fuenteZA: d.fuenteZA } : {}),
      ...(d.material ? { material: d.material } : {}),
      ...(d.pendienteModelo || !(d.fuente?.length || d.fuenteZA?.length)
        ? { pendiente: d.pendienteModelo ?? 'Sin modelo en BodyParts3D 4.0.' }
        : {}),
    })),
  };
}
