/**
 * Generador de Handles Optimizado
 *
 * Garantiza consistencia y unicidad en los handles de Shopify
 */

/**
 * Sanitiza texto para usar en handles de Shopify
 * Elimina caracteres especiales, normaliza espacios y convierte a lowercase
 */
export function sanitize(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')                  // Normalizar caracteres Unicode
    .replace(/[\u0300-\u036f]/g, '')   // Eliminar acentos
    .replace(/\s+/g, '-')              // Espacios → guiones
    .replace(/\//g, '')                // Eliminar /
    .replace(/\+/g, 'plus')            // + → plus
    .replace(/[^a-z0-9-]/g, '')        // Solo alfanuméricos y -
    .replace(/-+/g, '-')               // Múltiples - → uno solo
    .replace(/^-|-$/g, '');            // Eliminar - al inicio/fin
}

/**
 * Crea handle para producto PADRE
 * Formato: marca-modelo-p
 */
export function createParentHandle(marca: string, modelo: string): string {
  const marcaSanitized = sanitize(marca);
  const modeloSanitized = sanitize(modelo);

  if (!marcaSanitized || !modeloSanitized) {
    throw new Error(`Cannot create parent handle: marca="${marca}", modelo="${modelo}"`);
  }

  return `${marcaSanitized}-${modeloSanitized}-p`;
}

/**
 * Crea handle para producto INDIVIDUAL
 * Formato: marca-modelo-medida-sku-i
 * Incluye SKU para garantizar unicidad
 */
export function createIndividualHandle(
  marca: string,
  modelo: string,
  medida: string,
  sku: string
): string {
  const marcaSanitized = sanitize(marca);
  const modeloSanitized = sanitize(modelo);
  const medidaSanitized = sanitize(medida);
  const skuSanitized = sanitize(sku);

  if (!marcaSanitized || !modeloSanitized) {
    throw new Error(`Cannot create individual handle: marca="${marca}", modelo="${modelo}"`);
  }

  // Construir handle base
  let handle = `${marcaSanitized}-${modeloSanitized}`;

  // Agregar medida si existe
  if (medidaSanitized) {
    handle += `-${medidaSanitized}`;
  }

  // Agregar SKU para unicidad
  if (skuSanitized) {
    handle += `-${skuSanitized}`;
  }

  // Sufijo -i para individual
  handle += '-i';

  return handle;
}

/**
 * Extrae el handle base desde un handle completo
 * Ejemplo: "michelin-pilot-sport-4-s-p" → "michelin-pilot-sport-4-s"
 */
export function extractBaseHandle(handle: string): string {
  return handle.replace(/-[pi]$/, '');
}

/**
 * Verifica si un handle es de producto padre
 */
export function isParentHandle(handle: string): boolean {
  return handle.endsWith('-p');
}

/**
 * Verifica si un handle es de producto individual
 */
export function isIndividualHandle(handle: string): boolean {
  return handle.endsWith('-i');
}

/**
 * Normaliza texto para comparaciones (usado en búsqueda de descripciones)
 */
export function normalizeForComparison(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Eliminar acentos
    .replace(/\s+/g, ' ');            // Normalizar espacios múltiples
}
