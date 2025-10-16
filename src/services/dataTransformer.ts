import { PanelPreciosRow, PadresRow, ShopifyProduct } from '../types';

/**
 * Servicio para transformar datos de Google Sheets a formato Shopify CSV
 *
 * ESTRUCTURA DE DATOS:
 * - Panel_Precios: SKU/CAI, Marca, Modelo, Medida, Descripción, Precio con IVA, Precio sin IVA, Stock, Estado, Handle, etc.
 * - Padres: Ya contiene la estructura completa de Shopify (47 columnas)
 */
export class DataTransformerService {
  /**
   * Sincroniza precios desde Panel_Precios actualizando la plantilla de Padres
   *
   * Este método toma los datos de "Padres" (que ya está en formato Shopify)
   * y actualiza los precios desde "Panel_Precios" usando el Handle como clave
   */
  transformToShopify(
    panelPrecios: PanelPreciosRow[],
    padres: PadresRow[]
  ): ShopifyProduct[] {
    console.log('\n🔄 Sincronizando precios desde Panel_Precios...');

    // Crear un mapa de precios por Handle para búsqueda rápida
    const preciosMap = new Map<string, PanelPreciosRow>();
    panelPrecios.forEach(precio => {
      const handle = String(precio['Handle'] || '').trim().toLowerCase();
      if (handle) {
        preciosMap.set(handle, precio);
      }
    });

    console.log(`   📊 ${preciosMap.size} productos con precios en Panel_Precios`);

    const shopifyProducts: ShopifyProduct[] = [];
    let updated = 0;
    let notFound = 0;

    // Procesar cada producto de la hoja Padres
    padres.forEach((padre, index) => {
      try {
        const handle = String(padre['Handle'] || '').trim().toLowerCase();

        if (!handle) {
          console.warn(`   ⚠️  Fila ${index + 2}: Handle vacío, omitiendo...`);
          return;
        }

        // Buscar precios actualizados en Panel_Precios
        const precioData = preciosMap.get(handle);

        // Crear producto base desde Padres (que ya está en formato Shopify)
        const product: ShopifyProduct = {
          Handle: String(padre['Handle'] || ''),
          Title: String(padre['Title'] || ''),
          'Body (HTML)': String(padre['Body (HTML)'] || ''),
          Vendor: String(padre['Vendor'] || ''),
          'Product Category': String(padre['Product Category'] || ''),
          Type: String(padre['Type'] || ''),
          Tags: String(padre['Tags'] || ''),
          Published: String(padre['Published'] || 'TRUE'),
          'Option1 Name': String(padre['Option1 Name'] || ''),
          'Option1 Value': String(padre['Option1 Value'] || ''),
          'Option2 Name': String(padre['Option2 Name'] || ''),
          'Option2 Value': String(padre['Option2 Value'] || ''),
          'Option3 Name': String(padre['Option3 Name'] || ''),
          'Option3 Value': String(padre['Option3 Value'] || ''),
          'Variant SKU': String(padre['Variant SKU'] || ''),
          'Variant Grams': String(padre['Variant Grams'] || '0'),
          'Variant Inventory Tracker': String(padre['Variant Inventory Tracker'] || 'shopify'),
          'Variant Inventory Policy': String(padre['Variant Inventory Policy'] || 'deny'),
          'Variant Fulfillment Service': String(padre['Variant Fulfillment Service'] || 'manual'),

          // ACTUALIZAR PRECIOS desde Panel_Precios (si existe)
          // Shopify siempre usa precios CON IVA incluido
          // Variant Price = Precio de venta final (con IVA)
          // Variant Compare At Price = Precio tachado/antes (opcional, para mostrar descuento)
          'Variant Price': precioData
            ? this.formatPrice(precioData['Precio con IVA'])
            : String(padre['Variant Price'] || ''),
          'Variant Compare At Price': String(padre['Variant Compare At Price'] || ''),

          'Variant Requires Shipping': String(padre['Variant Requires Shipping'] || 'TRUE'),
          'Variant Taxable': String(padre['Variant Taxable'] || 'TRUE'),
          'Variant Barcode': String(padre['Variant Barcode'] || ''),
          'Image Src': String(padre['Image Src'] || ''),
          'Image Position': String(padre['Image Position'] || '1'),
          'Image Alt Text': String(padre['Image Alt Text'] || ''),
          'Gift Card': String(padre['Gift Card'] || 'FALSE'),
          'SEO Title': String(padre['SEO Title'] || ''),
          'SEO Description': String(padre['SEO Description'] || ''),
          'Google Shopping / Google Product Category': String(padre['Google Shopping / Google Product Category'] || ''),
          'Google Shopping / Gender': String(padre['Google Shopping / Gender'] || ''),
          'Google Shopping / Age Group': String(padre['Google Shopping / Age Group'] || ''),
          'Google Shopping / MPN': String(padre['Google Shopping / MPN'] || ''),
          'Google Shopping / AdWords Grouping': String(padre['Google Shopping / AdWords Grouping'] || ''),
          'Google Shopping / AdWords Labels': String(padre['Google Shopping / AdWords Labels'] || ''),
          'Google Shopping / Condition': String(padre['Google Shopping / Condition'] || 'new'),
          'Google Shopping / Custom Product': String(padre['Google Shopping / Custom Product'] || 'FALSE'),
          'Google Shopping / Custom Label 0': String(padre['Google Shopping / Custom Label 0'] || ''),
          'Google Shopping / Custom Label 1': String(padre['Google Shopping / Custom Label 1'] || ''),
          'Google Shopping / Custom Label 2': String(padre['Google Shopping / Custom Label 2'] || ''),
          'Google Shopping / Custom Label 3': String(padre['Google Shopping / Custom Label 3'] || ''),
          'Google Shopping / Custom Label 4': String(padre['Google Shopping / Custom Label 4'] || ''),
          'Variant Image': String(padre['Variant Image'] || ''),
          'Variant Weight Unit': String(padre['Variant Weight Unit'] || 'kg'),
          'Variant Tax Code': String(padre['Variant Tax Code'] || ''),
          'Cost per item': precioData
            ? this.formatPrice(precioData['Precio con IVA'])
            : String(padre['Cost per item'] || ''),
          Status: String(precioData?.['Estado'] || padre['Status'] || 'active').toLowerCase()
        };

        if (precioData) {
          updated++;
        } else {
          notFound++;
        }

        shopifyProducts.push(product);
      } catch (error) {
        console.warn(`   ⚠️  Error procesando fila ${index + 2}:`, error);
      }
    });

    console.log(`\n   ✅ ${shopifyProducts.length} productos procesados`);
    console.log(`   🔄 ${updated} precios actualizados desde Panel_Precios`);
    if (notFound > 0) {
      console.log(`   ℹ️  ${notFound} productos mantuvieron precios de Padres (no encontrados en Panel_Precios)`);
    }

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
   * Agrupa productos por Handle (útil para variantes)
   */
  groupByHandle(products: ShopifyProduct[]): Map<string, ShopifyProduct[]> {
    const grouped = new Map<string, ShopifyProduct[]>();

    products.forEach(product => {
      const handle = product.Handle;
      if (!grouped.has(handle)) {
        grouped.set(handle, []);
      }
      grouped.get(handle)!.push(product);
    });

    return grouped;
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
