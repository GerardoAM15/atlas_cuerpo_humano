// Construye la configuración del pipeline 3D a partir de las fichas de scripts/datos/<sistema>/,
// para que haya una sola lista de estructuras por sistema (id + nombres de la fuente + material).
//
// En cada ficha:
//   fuente           nombres ingleses de BodyParts3D (elementos o conceptos compuestos)
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
      ...(d.material ? { material: d.material } : {}),
      ...(d.pendienteModelo || !d.fuente?.length
        ? { pendiente: d.pendienteModelo ?? 'Sin modelo en BodyParts3D 4.0.' }
        : {}),
    })),
  };
}
