import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import * as path from 'path';
import { ShopifyProduct } from '../types';

/**
 * Servicio para exportar datos a formato CSV de Shopify
 */
export class CsvExporterService {
  /**
   * Genera archivo CSV compatible con Shopify
   */
  async exportToCsv(products: ShopifyProduct[], outputPath: string): Promise<void> {
    console.log('\n📝 Generando archivo CSV...');

    try {
      // Asegurar que el directorio existe
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Definir columnas en el orden correcto para Shopify
      const columns: (keyof ShopifyProduct)[] = [
        'Handle',
        'Title',
        'Body (HTML)',
        'Vendor',
        'Product Category',
        'Type',
        'Tags',
        'Published',
        'Option1 Name',
        'Option1 Value',
        'Option2 Name',
        'Option2 Value',
        'Option3 Name',
        'Option3 Value',
        'Variant SKU',
        'Variant Grams',
        'Variant Inventory Tracker',
        'Variant Inventory Policy',
        'Variant Fulfillment Service',
        'Variant Price',
        'Variant Compare At Price',
        'Variant Requires Shipping',
        'Variant Taxable',
        'Variant Barcode',
        'Image Src',
        'Image Position',
        'Image Alt Text',
        'Gift Card',
        'SEO Title',
        'SEO Description',
        'Google Shopping / Google Product Category',
        'Google Shopping / Gender',
        'Google Shopping / Age Group',
        'Google Shopping / MPN',
        'Google Shopping / AdWords Grouping',
        'Google Shopping / AdWords Labels',
        'Google Shopping / Condition',
        'Google Shopping / Custom Product',
        'Google Shopping / Custom Label 0',
        'Google Shopping / Custom Label 1',
        'Google Shopping / Custom Label 2',
        'Google Shopping / Custom Label 3',
        'Google Shopping / Custom Label 4',
        'Variant Image',
        'Variant Weight Unit',
        'Variant Tax Code',
        'Cost per item',
        'Status'
      ];

      // Generar CSV
      const csv = stringify(products, {
        header: true,
        columns: columns,
        quoted: true,
        quoted_empty: true,
        escape: '"'
      });

      // Escribir archivo
      fs.writeFileSync(outputPath, csv, 'utf-8');

      const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
      console.log(`✅ Archivo CSV generado: ${outputPath}`);
      console.log(`   📦 Tamaño: ${fileSize} KB`);
      console.log(`   📊 Productos: ${products.length}`);
    } catch (error) {
      console.error('❌ Error generando CSV:', error);
      throw error;
    }
  }

  /**
   * Genera un CSV de muestra con la estructura esperada
   */
  generateSampleCsv(outputPath: string): void {
    const sampleProduct: ShopifyProduct = {
      Handle: 'ejemplo-producto',
      Title: 'Producto de Ejemplo',
      'Body (HTML)': '<p>Descripción del producto</p>',
      Vendor: 'Mi Tienda',
      'Product Category': 'Categoría Principal',
      Type: 'Tipo de Producto',
      Tags: 'etiqueta1, etiqueta2',
      Published: 'TRUE',
      'Option1 Name': 'Title',
      'Option1 Value': 'Default Title',
      'Option2 Name': '',
      'Option2 Value': '',
      'Option3 Name': '',
      'Option3 Value': '',
      'Variant SKU': 'SKU-001',
      'Variant Grams': '1000',
      'Variant Inventory Tracker': 'shopify',
      'Variant Inventory Policy': 'deny',
      'Variant Fulfillment Service': 'manual',
      'Variant Price': '99.99',
      'Variant Compare At Price': '129.99',
      'Variant Requires Shipping': 'TRUE',
      'Variant Taxable': 'TRUE',
      'Variant Barcode': '1234567890',
      'Image Src': 'https://example.com/image.jpg',
      'Image Position': '1',
      'Image Alt Text': 'Imagen del producto',
      'Gift Card': 'FALSE',
      'SEO Title': 'Producto de Ejemplo - Mi Tienda',
      'SEO Description': 'Descripción SEO del producto',
      'Google Shopping / Google Product Category': '',
      'Google Shopping / Gender': '',
      'Google Shopping / Age Group': '',
      'Google Shopping / MPN': '',
      'Google Shopping / AdWords Grouping': '',
      'Google Shopping / AdWords Labels': '',
      'Google Shopping / Condition': 'new',
      'Google Shopping / Custom Product': 'FALSE',
      'Google Shopping / Custom Label 0': '',
      'Google Shopping / Custom Label 1': '',
      'Google Shopping / Custom Label 2': '',
      'Google Shopping / Custom Label 3': '',
      'Google Shopping / Custom Label 4': '',
      'Variant Image': '',
      'Variant Weight Unit': 'kg',
      'Variant Tax Code': '',
      'Cost per item': '50.00',
      Status: 'active'
    };

    this.exportToCsv([sampleProduct], outputPath);
    console.log('✅ CSV de muestra generado');
  }
}
