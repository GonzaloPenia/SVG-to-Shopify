import { PanelPreciosRow, ShopifyProduct } from '../types';

/**
 * Transformer SIMPLE: Solo usa Panel_Precios
 *
 * Usa este transformer cuando la hoja "Padres" no tenga información completa
 * y quieras generar todo desde Panel_Precios
 */
export class SimpleDataTransformerService {
  /**
   * Transforma datos solo desde Panel_Precios a formato Shopify
   */
  transformToShopify(panelPrecios: PanelPreciosRow[]): ShopifyProduct[] {
    console.log('\n🔄 Transformando datos desde Panel_Precios...');

    const shopifyProducts: ShopifyProduct[] = [];

    panelPrecios.forEach((row, index) => {
      try {
        const handle = String(row['Handle'] || '').trim().toLowerCase();

        if (!handle) {
          console.warn(`   ⚠️  Fila ${index + 2}: Handle vacío, omitiendo...`);
          return;
        }

        // Extraer datos de Panel_Precios
        const sku = String(row['SKU/CAI'] || '');
        const marca = String(row['Marca'] || '');
        const modelo = String(row['Modelo'] || '');
        const medida = String(row['Medida'] || '');
        const descripcion = String(row['Descripción'] || '');
        const precioConIVA = row['Precio con IVA'];
        const stock = row['Cantidad en stock'] || 0;
        const estado = String(row['Estado'] || 'active').toLowerCase();
        const tags = String(row['Tag'] || marca);
        const imgUrl = String(row['IMG Url'] || '');

        // Construir título
        const title = row['Title']
          ? String(row['Title'])
          : `${marca} ${modelo} ${medida}`.trim();

        // Crear producto Shopify
        const product: ShopifyProduct = {
          Handle: handle,
          Title: title,
          'Body (HTML)': descripcion ? `<p>${descripcion}</p>` : `<p>${marca} ${modelo} - ${medida}</p>`,
          Vendor: marca,
          'Product Category': 'Neumáticos',
          Type: 'Neumático',
          Tags: tags,
          Published: estado === 'active' ? 'TRUE' : 'FALSE',
          'Option1 Name': 'Medida',
          'Option1 Value': medida || 'Default',
          'Option2 Name': '',
          'Option2 Value': '',
          'Option3 Name': '',
          'Option3 Value': '',
          'Variant SKU': sku,
          'Variant Grams': '10000', // 10kg por defecto para neumáticos
          'Variant Inventory Tracker': 'shopify',
          'Variant Inventory Policy': 'deny',
          'Variant Fulfillment Service': 'manual',
          'Variant Price': this.formatPrice(precioConIVA),
          'Variant Compare At Price': '', // Opcional: puedes calcular un precio mayor
          'Variant Requires Shipping': 'TRUE',
          'Variant Taxable': 'TRUE',
          'Variant Barcode': sku,
          'Image Src': imgUrl,
          'Image Position': imgUrl ? '1' : '',
          'Image Alt Text': imgUrl ? title : '',
          'Gift Card': 'FALSE',
          'SEO Title': title,
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
          Status: estado
        };

        shopifyProducts.push(product);
      } catch (error) {
        console.warn(`   ⚠️  Error procesando fila ${index + 2}:`, error);
      }
    });

    console.log(`\n   ✅ ${shopifyProducts.length} productos transformados desde Panel_Precios`);

    return shopifyProducts;
  }

  /**
   * Formatea valores de precio para Shopify
   */
  private formatPrice(value: any): string {
    if (!value) return '';

    // Convierte a número y formatea con 2 decimales
    const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));

    if (isNaN(numValue)) return '';

    return numValue.toFixed(2);
  }

  /**
   * Valida que los productos tengan los campos mínimos requeridos
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
      if (!product.Title) errors.push('Title es requerido');
      if (!product['Variant Price']) errors.push('Variant Price es requerido');

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
