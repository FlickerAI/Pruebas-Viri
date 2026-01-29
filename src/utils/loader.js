import descripciones from '../data/descripciones.json';

const formatearTexto = (texto) => {
    return texto
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .trim();
};

export function cargarProductos() {
    // 1. CARGA DE IMÁGENES
    const glob = import.meta.glob('/src/assets/productos/*.{jpeg,jpg,png,webp}', { eager: true });
    
    // NUEVO REGEX: Ya no busca el precio al final.
    // Estructura: Nombre_IDxxx_Categoria_Variante.ext
    const regex = /^(.+)_ID(\w+)_([^_]+)_(\d+)\.(jpg|jpeg|png|webp)$/i;
    
    const mapaProductos = new Map();
    const setCategorias = new Set();

    Object.keys(glob).forEach(rutaCompleta => {
        const nombreArchivo = rutaCompleta.split('/').pop();
        const moduloImagen = glob[rutaCompleta].default; 

        const match = nombreArchivo.match(regex);
        
        if (match) {
            // Nota: "precio" ya no existe en el match
            const [_, nombreRaw, id, categoriaRaw, variante] = match;
            
            const nombreLimpio = formatearTexto(nombreRaw);
            const catLimpia = formatearTexto(categoriaRaw); 
            
            setCategorias.add(catLimpia);

            if (!mapaProductos.has(id)) {
                mapaProductos.set(id, {
                    id: id,
                    nombre: nombreLimpio,
                    categoria: catLimpia,
                    // precio: Eliminado
                    descripcion: descripciones[id] || "Diseño exclusivo de BouquetBoutique.",
                    imagenes: [] 
                });
            }

            const producto = mapaProductos.get(id);
            producto.imagenes.push({
                imgObj: moduloImagen,
                ruta: moduloImagen.src,
                variante: parseInt(variante)
            });
        }
    });

    const productosFinales = Array.from(mapaProductos.values()).map(p => {
        p.imagenes.sort((a, b) => a.variante - b.variante);
        p.imgPrincipal = p.imagenes[0].imgObj;
        return p;
    });

    return {
        productos: productosFinales,
        categorias: Array.from(setCategorias).sort()
    };
}