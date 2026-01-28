import fs from 'node:fs';
import path from 'node:path';

// 1. CONFIGURACIÓN
const DIR_PRODUCTOS = './public/productos';
const FILE_DESCRIPCIONES = './src/data/descripciones.json';

// Helper: Convierte "RAMOS_PARADOS" o "RamosParados" a "Ramos Parados"
const formatearTexto = (texto) => {
    return texto
        // 1. Reemplaza guiones bajos y medios por espacios
        .replace(/[_-]/g, ' ')
        // 2. Separa CamelCase (ej: RamosParados -> Ramos Parados)
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        // 3. Convierte todo a formato Título (Primera Mayúscula, resto minúscula)
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .trim();
};

export function cargarProductos() {
    if (!fs.existsSync(DIR_PRODUCTOS)) return { productos: [], categorias: [] };

    const archivos = fs.readdirSync(DIR_PRODUCTOS);
    
    let descripciones = {};
    if (fs.existsSync(FILE_DESCRIPCIONES)) {
        const rawDesc = fs.readFileSync(FILE_DESCRIPCIONES, 'utf-8');
        descripciones = JSON.parse(rawDesc);
    }

    // Regex Ajustado: Permite guiones en la categoría (Grupo 3)
    const regex = /^(.+)_ID(\w+)_([^_]+)_(\d+)_(\d+)\.(jpg|jpeg|png|webp)$/i;
    
    const mapaProductos = new Map();
    const setCategorias = new Set();

    archivos.forEach(archivo => {
        const match = archivo.match(regex);
        if (match) {
            const [_, nombreRaw, id, categoriaRaw, variante, precio] = match;
            
            // APLICAMOS EL FORMATEO AQUÍ
            const nombreLimpio = formatearTexto(nombreRaw);
            const catLimpia = formatearTexto(categoriaRaw); 
            
            setCategorias.add(catLimpia);

            if (!mapaProductos.has(id)) {
                mapaProductos.set(id, {
                    id: id,
                    nombre: nombreLimpio,
                    categoria: catLimpia,
                    precio: parseInt(precio),
                    descripcion: descripciones[id] || "Diseño exclusivo de BouquetBoutique.",
                    imagenes: [] 
                });
            }

            const producto = mapaProductos.get(id);
            producto.imagenes.push({
                ruta: `/productos/${archivo}`,
                variante: parseInt(variante)
            });
        }
    });

    const productosFinales = Array.from(mapaProductos.values()).map(p => {
        p.imagenes.sort((a, b) => a.variante - b.variante);
        p.imgPrincipal = p.imagenes[0].ruta;
        return p;
    });

    return {
        productos: productosFinales,
        categorias: Array.from(setCategorias).sort()
    };
}