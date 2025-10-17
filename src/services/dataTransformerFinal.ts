import { PanelPreciosRow, ShopifyProduct } from '../types';

/**
 * Transformer FINAL: Productos Padre + Individuales (versión corregida)
 *
 * - Productos Padre: SIEMPRE se crean (incluso con 1 sola medida)
 * - Productos Individuales: Cada medida como producto separado
 * - Descripción: Tomada de columna E (Descripción)
 * - Precios: SIEMPRE en las variantes, NO en el producto general
 */
export class DataTransformerFinalService {
  /**
   * Transforma datos creando productos padre e individuales
   */
  transformToShopify(panelPrecios: PanelPreciosRow[]): {
    padres: ShopifyProduct[];
    individuales: ShopifyProduct[];
  } {
    console.log('\n🔄 Transformando con estructura FINAL...');

    const padres: ShopifyProduct[] = [];
    const individuales: ShopifyProduct[] = [];

    // 1. Agrupar por modelo
    const groupedByModel = this.groupByModel(panelPrecios);
    console.log(`   📦 ${groupedByModel.size} modelos encontrados`);

    // 2. Crear productos padre E individuales para cada modelo
    groupedByModel.forEach((variants, modelKey) => {
      const { padre, indiv } = this.createProductsForModel(modelKey, variants);

      padres.push(...padre);
      individuales.push(...indiv);
    });

    console.log(`   ✅ Productos PADRE: ${padres.length} filas (productos + variantes)`);
    console.log(`   ✅ Productos INDIVIDUALES: ${individuales.length} productos`);

    return { padres, individuales };
  }

  /**
   * Agrupa productos por marca-modelo
   */
  private groupByModel(products: PanelPreciosRow[]): Map<string, PanelPreciosRow[]> {
    const grouped = new Map<string, PanelPreciosRow[]>();

    products.forEach(product => {
      const marca = String(product['Marca'] || '').trim();
      const modelo = String(product['Modelo'] || '').trim();

      if (!marca || !modelo) return;

      const key = `${marca}|${modelo}`;

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(product);
    });

    return grouped;
  }

  /**
   * Obtiene descripción desde columna E (Descripción)
   */
  private getDescripcion(modelo: string, variants: PanelPreciosRow[]): string {
    // Buscar en las variantes si alguna tiene descripción
    for (const variant of variants) {
      const variantModelo = String(variant['Modelo'] || '').trim();
      const descripcion = String(variant['Descripción'] || '').trim();

      if (variantModelo === modelo && descripcion) {
        return descripcion;
      }
    }

    // Si no hay descripción específica, generar una básica
    return '';
  }

  /**
   * Crea producto padre + productos individuales para un modelo
   */
  private createProductsForModel(modelKey: string, variants: PanelPreciosRow[]): {
    padre: ShopifyProduct[];
    indiv: ShopifyProduct[];
  } {
    const [marca, modelo] = modelKey.split('|');
    const padre: ShopifyProduct[] = [];
    const indiv: ShopifyProduct[] = [];

    // Obtener descripción
    const descripcion = this.getDescripcion(modelo, variants);
    const descripcionHtml = descripcion
      ? `<p>${descripcion}</p>`
      : `<p>${marca} ${modelo} - Neumático de alta calidad</p>`;

    // Handle base
    const baseHandle = this.createHandle(`${marca} ${modelo}`);
    const parentHandle = `${baseHandle}-p`; // -p = padre

    // Tags e imagen
    const tags = String(variants[0]['Tag'] || marca);
    const imgUrl = String(variants[0]['IMG Url'] || '');

    // ===== PRODUCTO PADRE =====
    // Primera fila del padre (producto principal)
    const firstVariant = variants[0];
    const padreMain: ShopifyProduct = {
      Handle: parentHandle,
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
      'Variant SKU': String(firstVariant['SKU/CAI'] || ''),
      'Variant Grams': '10000',
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Policy': 'continue',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': this.formatPrice(firstVariant['Precio con IVA']),
      'Variant Compare At Price': '',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Variant Barcode': String(firstVariant['SKU/CAI'] || ''),
      'Image Src': imgUrl,
      'Image Position': imgUrl ? '1' : '',
      'Image Alt Text': imgUrl ? `${marca} ${modelo}` : '',
      'Gift Card': 'FALSE',
      'SEO Title': `${marca} ${modelo}`,
      'SEO Description': descripcion || `${marca} ${modelo} - Neumático de alta calidad`,
      'Google Shopping / Google Product Category': '',
      'Google Shopping / Gender': '',
      'Google Shopping / Age Group': '',
      'Google Shopping / MPN': String(firstVariant['SKU/CAI'] || ''),
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

    padre.push(padreMain);

    // Variantes adicionales del padre (filas 2 en adelante)
    for (let i = 1; i < variants.length; i++) {
      const variant = variants[i];
      const variantRow: ShopifyProduct = {
        Handle: parentHandle, // Mismo handle = variante del mismo producto
        Title: '', // Vacío para variantes
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
        'Variant SKU': String(variant['SKU/CAI'] || ''),
        'Variant Grams': '10000',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': this.formatPrice(variant['Precio con IVA']),
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': String(variant['SKU/CAI'] || ''),
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

      padre.push(variantRow);
    }

    // ===== PRODUCTOS INDIVIDUALES =====
    variants.forEach(variant => {
      const medida = String(variant['Medida'] || '');
      const sku = String(variant['SKU/CAI'] || '');
      const precioConIVA = variant['Precio con IVA'];
      const imgUrlIndividual = String(variant['IMG Url'] || '');

      const individualHandle = `${baseHandle}-${this.sanitizeHandle(medida)}-i`; // -i = individual

      const individualProduct: ShopifyProduct = {
        Handle: individualHandle,
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
        'Variant SKU': sku,
        'Variant Grams': '10000',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': this.formatPrice(precioConIVA),
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': sku,
        'Image Src': imgUrlIndividual,
        'Image Position': imgUrlIndividual ? '1' : '',
        'Image Alt Text': imgUrlIndividual ? `${marca} ${modelo} ${medida}` : '',
        'Gift Card': 'FALSE',
        'SEO Title': `${marca} ${modelo} ${medida}`,
        'SEO Description': descripcion || `${marca} ${modelo} ${medida} - Neumático de alta calidad`,
        'Google Shopping / Google Product Category': '',
        'Google Shopping / Gender': '',
        'Google Shopping / Age Group': '',
        'Google Shopping / MPN': sku,
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

      indiv.push(individualProduct);
    });

    return { padre, indiv };
  }

  /**
   * Crea un handle limpio para Shopify
   */
  private createHandle(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Sanitiza texto para usar en handle
   */
  private sanitizeHandle(text: string): string {
    return text
      .toLowerCase()
      .replace(/\//g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');
  }

  /**
   * Formatea valores de precio
   */
  private formatPrice(value: any): string {
    if (!value) return '';
    const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    if (isNaN(numValue)) return '';
    return numValue.toFixed(2);
  }

  /**
   * Valida productos
   */
  validateProducts(products: ShopifyProduct[]): {
    valid: ShopifyProduct[];
    invalid: Array<{ product: ShopifyProduct; errors: string[] }>;
  } {
    const valid: ShopifyProduct[] = [];
    const invalid: Array<{ product: ShopifyProduct; errors: string[] }> = [];

    products.forEach(product => {
      const errors: string[] = [];

      if (!product.Handle) errors.push('Handle es requerido');

      // Solo validar en productos principales (tienen Title)
      if (product.Title && !product['Variant Price']) {
        errors.push('Variant Price es requerido');
      }

      if (errors.length > 0) {
        invalid.push({ product, errors });
      } else {
        valid.push(product);
      }
    });

    if (invalid.length > 0) {
      console.warn(`⚠️  ${invalid.length} productos con errores`);
    }

    return { valid, invalid };
  }
}
