import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { SimpleDataTransformerService } from './services/dataTransformerSimple';
import { CsvExporterService } from './services/csvExporter';
import { ShopifyUploaderService } from './services/shopifyUploader';

/**
 * Aplicación principal para sincronizar precios de Google Sheets a Shopify
 */
class App {
  private googleSheets: GoogleSheetsService;
  private transformer: SimpleDataTransformerService;
  private csvExporter: CsvExporterService;
  private shopifyUploader: ShopifyUploaderService;

  constructor() {
    this.googleSheets = new GoogleSheetsService();
    this.transformer = new SimpleDataTransformerService();
    this.csvExporter = new CsvExporterService();
    this.shopifyUploader = new ShopifyUploaderService();
  }

  /**
   * Flujo principal de sincronización
   */
  async sync(mode: 'csv' | 'upload' | 'prices-only' = 'csv'): Promise<void> {
    try {
      console.log('🚀 Iniciando sincronización Google Sheets → Shopify\n');
      console.log('═'.repeat(60));

      // Validar configuración
      validateConfig();
      console.log('✅ Configuración validada');

      // 1. Leer datos de Google Sheets
      console.log('\n📥 PASO 1: Leyendo datos de Google Sheets');
      console.log('─'.repeat(60));
      const { panelPrecios } = await this.googleSheets.readAllData();

      // 2. Transformar datos a formato Shopify
      console.log('\n🔄 PASO 2: Transformando datos a formato Shopify');
      console.log('─'.repeat(60));
      const shopifyProducts = this.transformer.transformToShopify(panelPrecios);

      // 3. Validar productos
      console.log('\n✅ PASO 3: Validando productos');
      console.log('─'.repeat(60));
      const { valid, invalid } = this.transformer.validateProducts(shopifyProducts);

      console.log(`✅ Productos válidos: ${valid.length}`);
      if (invalid.length > 0) {
        console.log(`⚠️  Productos inválidos: ${invalid.length} (serán omitidos)`);
      }

      // 4. Ejecutar acción según el modo
      if (mode === 'csv') {
        console.log('\n📝 PASO 4: Generando archivo CSV');
        console.log('─'.repeat(60));
        await this.csvExporter.exportToCsv(valid, config.outputCsvPath);
        console.log('\n✅ Archivo CSV generado exitosamente');
        console.log(`📁 Ubicación: ${config.outputCsvPath}`);
        console.log('\n💡 Siguiente paso: Importa el archivo CSV manualmente en Shopify Admin');
      } else if (mode === 'upload') {
        console.log('\n📤 PASO 4: Subiendo productos a Shopify');
        console.log('─'.repeat(60));
        const result = await this.shopifyUploader.uploadProducts(valid, {
          batchSize: 10,
          delayMs: 1000,
          updateExisting: true
        });

        if (result.errors.length > 0) {
          console.log('\n⚠️  Errores encontrados:');
          result.errors.slice(0, 10).forEach(({ handle, error }) => {
            console.log(`   - ${handle}: ${error}`);
          });
        }
      } else if (mode === 'prices-only') {
        console.log('\n💰 PASO 4: Actualizando solo precios en Shopify');
        console.log('─'.repeat(60));
        await this.shopifyUploader.updatePricesOnly(valid);
      }

      console.log('\n═'.repeat(60));
      console.log('✅ Sincronización completada exitosamente');
      console.log('═'.repeat(60));
    } catch (error) {
      console.error('\n❌ Error durante la sincronización:');
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * Genera un CSV de muestra
   */
  async generateSample(): Promise<void> {
    console.log('📝 Generando CSV de muestra...');
    this.csvExporter.generateSampleCsv('./output/sample.csv');
  }
}

// Ejecutar aplicación
const main = async () => {
  const app = new App();

  // Obtener modo desde argumentos de línea de comandos
  const mode = process.argv[2] as 'csv' | 'upload' | 'prices-only' | 'sample';

  switch (mode) {
    case 'sample':
      await app.generateSample();
      break;
    case 'csv':
    case 'upload':
    case 'prices-only':
      await app.sync(mode);
      break;
    default:
      console.log(`
🛠️  Google Sheets to Shopify Sync Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uso:
  npm run sync [modo]

Modos disponibles:
  csv          - Genera archivo CSV para importar manualmente (por defecto)
  upload       - Sube productos directamente a Shopify vía API
  prices-only  - Actualiza solo los precios de productos existentes
  sample       - Genera un CSV de muestra

Ejemplos:
  npm run sync           # Genera CSV
  npm run sync upload    # Sube productos a Shopify
  npm run sync prices-only   # Solo actualiza precios
  npm run sync sample    # Genera archivo de ejemplo

Configuración:
  1. Copia .env.example a .env
  2. Configura tus credenciales de Google Sheets y Shopify
  3. Ejecuta el comando según el modo deseado
      `);
      await app.sync('csv');
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no manejado:', error);
  process.exit(1);
});

main();
