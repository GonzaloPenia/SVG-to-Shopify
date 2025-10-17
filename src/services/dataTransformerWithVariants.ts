import { PanelPreciosRow, ShopifyProduct } from '../types';

/**
 * Transformer con variantes: Crea productos padre e individuales
 *
 * - Productos Padre: Un producto por modelo con todas sus medidas como variantes
 * - Productos Individuales: Cada medida como producto separado
 */
export class DataTransformerWithVariantsService {
  /**
   * Transforma datos creando productos padre e individuales
   */
  transformToShopify(panelPrecios: PanelPreciosRow[]): ShopifyProduct[] {
    console.log('\n🔄 Transformando datos con estructura padre + individuales...');

    const shopifyProducts: ShopifyProduct[] = [];

    // 1. Agrupar por modelo
    const groupedByModel = this.groupByModel(panelPrecios);

    console.log(`   📦 ${groupedByModel.size} modelos encontrados`);

    // 2. Crear productos padre (un producto por modelo con variantes)
    groupedByModel.forEach((variants, modelKey) => {
      const parentProducts = this.createParentProduct(modelKey, variants);
      shopifyProducts.push(...parentProducts);
    });

    console.log(`   ✅ ${shopifyProducts.length} productos generados (padre + individuales)`);

    return shopifyProducts;
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
   * Crea producto padre con variantes + productos individuales
   */
  private createParentProduct(modelKey: string, variants: PanelPreciosRow[]): ShopifyProduct[] {
    const [marca, modelo] = modelKey.split('|');
    const products: ShopifyProduct[] = [];

    // Handle base para el padre
    const baseHandle = this.createHandle(`${marca} ${modelo}`);
    const parentHandle = `${baseHandle}-p`; // -p = padre

    // Tomar datos del primer producto como base
    const firstVariant = variants[0];
    const tags = String(firstVariant['Tag'] || marca);
    const imgUrl = String(firstVariant['IMG Url'] || '');

    // PRODUCTO PADRE con todas las variantes
    if (variants.length > 1) {
      // Solo crear padre si hay más de una variante
      const parentProduct: ShopifyProduct = {
        Handle: parentHandle,
        Title: `${marca} ${modelo}`,
        'Body (HTML)': `<p>${marca} ${modelo} - Disponible en múltiples medidas</p>`,
        Vendor: marca,
        'Product Category': 'Neumáticos',
        Type: 'Neumático',
        Tags: tags,
        Published: 'TRUE',
        'Option1 Name': 'Medida',
        'Option1 Value': String(variants[0]['Medida'] || 'Default'),
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': String(variants[0]['SKU/CAI'] || ''),
        'Variant Grams': '10000',
        'Variant Inventory Tracker': 'shopify',
        'Variant Inventory Policy': 'continue',
        'Variant Fulfillment Service': 'manual',
        'Variant Price': this.formatPrice(variants[0]['Precio con IVA']),
        'Variant Compare At Price': '',
        'Variant Requires Shipping': 'TRUE',
        'Variant Taxable': 'TRUE',
        'Variant Barcode': String(variants[0]['SKU/CAI'] || ''),
        'Image Src': imgUrl,
        'Image Position': imgUrl ? '1' : '',
        'Image Alt Text': imgUrl ? `${marca} ${modelo}` : '',
        'Gift Card': 'FALSE',
        'SEO Title': `${marca} ${modelo} - Neumáticos`,
        'SEO Description': `${marca} ${modelo} - Neumático de alta calidad. Disponible en múltiples medidas.`,
        'Google Shopping / Google Product Category': '',
        'Google Shopping / Gender': '',
        'Google Shopping / Age Group': '',
        'Google Shopping / MPN': String(variants[0]['SKU/CAI'] || ''),
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
        'Cost per item': this.formatPrice(variants[0]['Precio con IVA']),
        Status: 'active'
      };

      products.push(parentProduct);

      // Agregar variantes adicionales al padre (filas adicionales con mismo handle)
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
          'Option1 Value': String(variant['Medida'] || `Variante ${i + 1}`),
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

        products.push(variantRow);
      }
    }

    // PRODUCTOS INDIVIDUALES (cada medida como producto separado)
    variants.forEach(variant => {
      const medida = String(variant['Medida'] || '');
      const sku = String(variant['SKU/CAI'] || '');
      const precioConIVA = variant['Precio con IVA'];
      const descripcion = String(variant['Descripción'] || '');
      const imgUrlIndividual = String(variant['IMG Url'] || '');

      const individualHandle = `${baseHandle}-${this.sanitizeHandle(medida)}-i`; // -i = individual

      const individualProduct: ShopifyProduct = {
        Handle: individualHandle,
        Title: `${marca} ${modelo} ${medida}`,
        'Body (HTML)': descripcion ? `<p>${descripcion}</p>` : `<p>${marca} ${modelo} - ${medida}</p>`,
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

      products.push(individualProduct);
    });

    return products;
  }

  /**
   * Crea un handle limpio para Shopify
   */
  private createHandle(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .trim();
  }

  /**
   * Sanitiza texto para usar en handle (mantiene algunos caracteres)
   */
  private sanitizeHandle(text: string): string {
    return text
      .toLowerCase()
      .replace(/\//g, '-') // / a -
      .replace(/\s+/g, '-') // espacios a -
      .replace(/[^a-z0-9-]/g, '') // eliminar otros caracteres
      .replace(/-+/g, '-'); // múltiples - a uno
  }

  /**
   * Formatea valores de precio para Shopify
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

      // Solo validar Title y Price en productos principales (no en variantes)
      if (product.Title) { // Es un producto principal
        if (!product['Variant Price']) errors.push('Variant Price es requerido');
      }

      if (errors.length > 0) {
        invalid.push({ product, errors });
      } else {
        valid.push(product);
      }
    });

    if (invalid.length > 0) {
      console.warn(`⚠️  ${invalid.length} productos con errores de validación`);
      invalid.slice(0, 5).forEach(({ product, errors }) => {
        console.warn(`   - ${product.Handle}: ${errors.join(', ')}`);
      });
    }

    return { valid, invalid };
  }
}
