// CONFIGURACIÓN
export const MODO_PRODUCCION = false; 

export const obtenerRutaImagen = (id, nombreArchivo) => {
  return MODO_PRODUCCION 
    ? `/productos/${nombreArchivo}` 
    : `https://picsum.photos/seed/${id}/400/500`;
};

// CATEGORÍAS EXACTAS
export const categorias = [
  "Ramos", 
  "Arreglos", 
  "Ramos Buchones", 
  "Corazón Pedida", 
  "Cajas", 
  "Fúnebres", 
  "Especiales"
];

// GENERADOR DE PRODUCTOS
// Asigna categorías en orden para asegurar que NINGUNA categoría esté vacía
export const productos = Array.from({ length: 80 }, (_, i) => {
  const id = (i + 1).toString();
  const catIndex = i % categorias.length; // 0, 1, 2... ciclico
  
  return {
    id: id,
    nombre: `Diseño ${id}`,
    precio: 850 + (i * 50),
    categoria: categorias[catIndex], // Asignación estricta
    archivo: `producto-${id}.webp`,
    descripcion: "Diseño exclusivo de BouquetBoutique.",
    rating: "5.0"
  };
});

export const obtenerProductoPorId = (id) => productos.find(p => p.id === id);