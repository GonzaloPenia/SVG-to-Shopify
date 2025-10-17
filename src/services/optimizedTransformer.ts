import { PanelPreciosRow, ShopifyProduct } from '../types';
import {
  createParentHandle,
  createIndividualHandle,
  normalizeForComparison
} from '../utils/handleGenerator';

/**
 * Grupo de datos por modelo
 */
export interface ModelGroup {
  marca: string;
  modelo: string;
  variants: PanelPreciosRow[];
}

/**
 * Transformer Optimizado
 *
 * Mejoras:
 * - Handles consistentes y únicos
 * - Búsqueda de descripción mejorada con normalización
 * - Inventario incluido en creación
 * - Estructura preparada para CSV + API
 */
export class OptimizedTransformerService {
  /**
   * Agrupa productos por modelo
   */
  groupByModel(products: PanelPreciosRow[]): ModelGroup[] {
    const grouped = new Map<string, ModelGroup>();

    products.forEach(product => {
      const marca = String(product['Marca'] || '').trim();
      const modelo = String(product['Modelo'] || '').trim();

      if (!marca || !modelo) return;

      const key = `${marca}|${modelo}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          marca,
          modelo,
          variants: []
        });
      }

      grouped.get(key)!.variants.push(product);
    });

    return Array.from(grouped.values());
  }

  /**
   * Transforma un modelo completo (padre + individuales)
   */
  transformModel(modelGroup: ModelGroup): {
    padres: ShopifyProduct[];
    individuales: ShopifyProduct[];
  } {
    const padres = this.createParentProduct(modelGroup);
    const individuales = this.createIndividualProducts(modelGroup);

    return { padres, individuales };
  }

  /**
   * Obtiene descripción desde columna E con búsqueda mejorada
   */
  private getDescripcion(modelo: string, variants: PanelPreciosRow[]): string {
    const modeloNormalized = normalizeForComparison(modelo);

    // 1. Buscar descripción que coincida exactamente con el modelo
    for (const variant of variants) {
      const variantModelo = normalizeForComparison(String(variant['Modelo'] || ''));
      const descripcion = String(variant['Descripción'] || '').trim();

      if (variantModelo === modeloNormalized && descripcion) {
        return descripcion;
      }
    }

    // 2. Fallback: usar la primera descripción disponible en el grupo
    for (const variant of variants) {
      const descripcion = String(variant['Descripción'] || '').trim();
      if (descripcion) {
        return descripcion;
      }
    }

    // 3. Si no hay descripción, retornar vacío
    return '';
  }

  /**
   * Crea producto PADRE con todas sus variantes
   * Retorna array de filas para CSV (primera fila = producto, resto = variantes)
   */
  createParentProduct(modelGroup: ModelGroup): ShopifyProduct[] {
    const { marca, modelo, variants } = modelGroup;
    const rows: ShopifyProduct[] = [];

    // Obtener datos comunes
    const descripcion = this.getDescripcion(modelo, variants);
    const descripcionHtml = descripcion
      ? `<p>${descripcion}</p>`
      : `<p>${marca} ${modelo} - Neumático de alta calidad disponible en múltiples medidas</p>`;

    const handle = createParentHandle(marca, modelo);
    const tags = String(variants[0]['Tag'] || marca);
    const imgUrl = String(variants[0]['IMG Url'] || '');

    // Primera fila: Producto principal con primera variante
    const firstVariant = variants[0];
    const baseSku = String(firstVariant['SKU/CAI'] || '');
    const parentSku = baseSku ? `${baseSku}-p` : '';  // ✅ SKU con sufijo -p

    const mainProduct: ShopifyProduct = {
      Handle: handle,
      Title: `${marca} ${modelo}`,
      'Body (HTML)': descripcionHtml,
      Vendor: marca,
      'Product Category': 'Neumáticos',
      Type: 'Neumático',
      Tags: tags,
      Published: 'TRUE',
      'Option1 Name': 'Medida',
      'Option1 Value': String(firstVariant['Medida'] || 'Default'),
      'Option2 Name': '',
      'Option2 Value': '',
      'Option3 Name': '',
      'Option3 Value': '',
      'Variant SKU': parentSku,  // ✅ SKU con sufijo -p
      'Variant Grams': '10000',
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Policy': 'continue',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': this.formatPrice(firstVariant['Precio con IVA']),
      'Variant Compare At Price': '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Variant Barcode': '',  // ✅ Código de barras vacío
      'Image Src': imgUrl,
      'Image Position': imgUrl ? '1' : '',
      'Image Alt Text': imgUrl ? `${marca} ${modelo}` : '',
      'Gift Card': 'FALSE',
      'SEO Title': `${marca} ${modelo} - Neumáticos`,
      'SEO Description': descripcion || `${marca} ${modelo} - Neumático de alta calidad`,
      'Google Shopping / Google Product Category': '',
      'Google Shopping / Gender': '',
      'Google Shopping / Age Group': '',
      'Google Shopping / MPN': parentSku,  // ✅ MPN con sufijo -p
      'Google Shopping / AdWords Grouping': '',
      'Google Shopping / AdWords Labels': '',
      'Google Shopping / Condition': 'new',
      'Google Shopping / Custom Product': 'FALSE',
      'Google Shopping / Custom Label 0': marca,
      'Google Shopping / Custom Label 1': '',
      'Google Shopping / Custom Label 2': '',
      'Google Shopping / Custom Label 3': '',
      'Google Shopping / Custom Label 4': '',
      'Variant Image': '',
      'Variant Weight Unit': 'kg',
      'Variant Tax Code': '',
      'Cost per item': this.formatPrice(firstVariant['Precio con IVA']),
      Status: 'active'
    };

    rows.push(mainProduct);

    // Filas adicionales: Variantes restantes
    for (let i = 1; i < variants.length; i++) {
      const variant = variants[i];
      const variantBaseSku = String(variant['SKU/CAI'] || '');
      const variantParentSku = variantBaseSku ? `${variantBaseSku}-p` : '';  // ✅ SKU con sufijo -p

      const variantRow: ShopifyProduct = {
        Handle: handle, // Mismo handle = variante del mismo producto
        Title: '',
        'Body (HTML)': '',
        Vendor: '',
        'Product Category': '',
        Type: '',
        Tags: '',
        Published: '',
        'Option1 Name': '',
        'Option1 Value': String(variant['Medida'] || ''),
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': variantParentSku,  // ✅ SKU con sufijo -p
        'Variant Grams': '10000',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': this.formatPrice(variant['Precio con IVA']),
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',  // ✅ Código de barras vacío
        'Image Src': '',
        'Image Position': '',
        'Image Alt Text': '',
        'Gift Card': '',
        'SEO Title': '',
        'SEO Description': '',
        'Google Shopping / Google Product Category': '',
        'Google Shopping / Gender': '',
        'Google Shopping / Age Group': '',
        'Google Shopping / MPN': '',
        'Google Shopping / AdWords Grouping': '',
        'Google Shopping / AdWords Labels': '',
        'Google Shopping / Condition': '',
        'Google Shopping / Custom Product': '',
        'Google Shopping / Custom Label 0': '',
        'Google Shopping / Custom Label 1': '',
        'Google Shopping / Custom Label 2': '',
        'Google Shopping / Custom Label 3': '',
        'Google Shopping / Custom Label 4': '',
        'Variant Image': '',
        'Variant Weight Unit': '',
        'Variant Tax Code': '',
        'Cost per item': this.formatPrice(variant['Precio con IVA']),
        Status: ''
      };

      rows.push(variantRow);
    }

    return rows;
  }

  /**
   * Crea productos INDIVIDUALES (uno por cada variante del modelo)
   */
  createIndividualProducts(modelGroup: ModelGroup): ShopifyProduct[] {
    const { marca, modelo, variants } = modelGroup;
    const products: ShopifyProduct[] = [];

    const descripcion = this.getDescripcion(modelo, variants);
    const descripcionHtml = descripcion
      ? `<p>${descripcion}</p>`
      : `<p>${marca} ${modelo} - Neumático de alta calidad</p>`;

    const tags = String(variants[0]['Tag'] || marca);

    variants.forEach(variant => {
      const medida = String(variant['Medida'] || '');
      const baseSku = String(variant['SKU/CAI'] || '');
      const individualSku = baseSku ? `${baseSku}-i` : '';  // ✅ SKU con sufijo -i
      const precioConIVA = variant['Precio con IVA'];
      const imgUrl = String(variant['IMG Url'] || '');

      const handle = createIndividualHandle(marca, modelo, medida, baseSku);

      const product: ShopifyProduct = {
        Handle: handle,
        Title: `${marca} ${modelo} ${medida}`,
        'Body (HTML)': descripcionHtml,
        Vendor: marca,
        'Product Category': 'Neumáticos',
        Type: 'Neumático',
        Tags: tags,
        Published: 'TRUE',
        'Option1 Name': 'Medida',
        'Option1 Value': medida || 'Default',
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': individualSku,  // ✅ SKU con sufijo -i
        'Variant Grams': '10000',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': this.formatPrice(precioConIVA),
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': '',  // ✅ Código de barras vacío
        'Image Src': imgUrl,
        'Image Position': imgUrl ? '1' : '',
        'Image Alt Text': imgUrl ? `${marca} ${modelo} ${medida}` : '',
        'Gift Card': 'FALSE',
        'SEO Title': `${marca} ${modelo} ${medida}`,
        'SEO Description': descripcion || `${marca} ${modelo} ${medida} - Neumático de alta calidad`,
        'Google Shopping / Google Product Category': '',
        'Google Shopping / Gender': '',
        'Google Shopping / Age Group': '',
        'Google Shopping / MPN': individualSku,  // ✅ MPN con sufijo -i
        'Google Shopping / AdWords Grouping': '',
        'Google Shopping / AdWords Labels': '',
        'Google Shopping / Condition': 'new',
        'Google Shopping / Custom Product': 'FALSE',
        'Google Shopping / Custom Label 0': marca,
        'Google Shopping / Custom Label 1': '',
        'Google Shopping / Custom Label 2': '',
        'Google Shopping / Custom Label 3': '',
        'Google Shopping / Custom Label 4': '',
        'Variant Image': '',
        'Variant Weight Unit': 'kg',
        'Variant Tax Code': '',
        'Cost per item': this.formatPrice(precioConIVA),
        Status: 'active'
      };

      products.push(product);
    });

    return products;
  }

  /**
   * Formatea precio
   */
  private formatPrice(value: any): string {
    if (!value) return '';
    const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toFixed(2);
  }
}
