// ELIMINAMOS LA IMPORTACIÓN DE './data' QUE CAUSABA EL ERROR

// Importamos directamente el JSON de descripciones
// Nota: Si el archivo no existe, esta línea fallará. Asegúrate de tener src/data/descripciones.json
// Si prefieres que sea opcional, avísame, pero importarlo así es lo más eficiente.
import descripciones from '../data/descripciones.json';

// Helper de formato de texto
const formatearTexto = (texto) => {
    return texto
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .trim();
};

export function cargarProductos() {
    // 1. CARGA DE IMÁGENES (Vite/Astro Assets)
    const glob = import.meta.glob('/src/assets/productos/*.{jpeg,jpg,png,webp}', { eager: true });
    
    // Regex para descomponer el nombre del archivo
    const regex = /^(.+)_ID(\w+)_([^_]+)_(\d+)_(\d+)\.(jpg|jpeg|png|webp)$/i;
    
    const mapaProductos = new Map();
    const setCategorias = new Set();

    // 2. PROCESAR CADA IMAGEN ENCONTRADA
    Object.keys(glob).forEach(rutaCompleta => {
        const nombreArchivo = rutaCompleta.split('/').pop();
        const moduloImagen = glob[rutaCompleta].default; // La imagen optimizada

        const match = nombreArchivo.match(regex);
        
        if (match) {
            const [_, nombreRaw, id, categoriaRaw, variante, precio] = match;
            
            const nombreLimpio = formatearTexto(nombreRaw);
            const catLimpia = formatearTexto(categoriaRaw); 
            
            setCategorias.add(catLimpia);

            // Si es la primera vez que vemos este ID, creamos el producto base
            if (!mapaProductos.has(id)) {
                mapaProductos.set(id, {
                    id: id,
                    nombre: nombreLimpio,
                    categoria: catLimpia,
                    precio: parseInt(precio),
                    // Usamos el JSON importado. Si no hay descripción para ese ID, usa la genérica.
                    descripcion: descripciones[id] || "Diseño exclusivo de BouquetBoutique con flores seleccionadas.",
                    imagenes: [] 
                });
            }

            // Agregamos la variante (imagen) al producto
            const producto = mapaProductos.get(id);
            producto.imagenes.push({
                imgObj: moduloImagen, // Objeto para <Image /> de Astro
                ruta: moduloImagen.src, // String URL para scripts (JS cliente)
                variante: parseInt(variante)
            });
        }
    });

    // 3. ORDENAR Y PREPARAR DATOS FINALES
    const productosFinales = Array.from(mapaProductos.values()).map(p => {
        // Ordenar variantes por número (01, 02, 03...)
        p.imagenes.sort((a, b) => a.variante - b.variante);
        
        // Definir imagen principal
        p.imgPrincipal = p.imagenes[0].imgObj;
        return p;
    });

    return {
        productos: productosFinales,
        categorias: Array.from(setCategorias).sort()
    };
}