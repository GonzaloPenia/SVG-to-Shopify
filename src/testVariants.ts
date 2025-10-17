import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { DataTransformerWithVariantsService } from './services/dataTransformerWithVariants';
import { ShopifyUploaderService } from './services/shopifyUploader';
import { CsvExporterService } from './services/csvExporter';

/**
 * Script de prueba: Estructura con productos padre e individuales
 */
async function testVariants() {
  try {
    console.log('🧪 Probando estructura: Productos Padre + Individuales\n');
    console.log('═'.repeat(60));

    // Validar configuración
    validateConfig();
    console.log('✅ Configuración validada\n');

    // Servicios
    const googleSheets = new GoogleSheetsService();
    const transformer = new DataTransformerWithVariantsService();
    const csvExporter = new CsvExporterService();
    const shopifyUploader = new ShopifyUploaderService();

    // 1. Leer datos
    console.log('📥 Leyendo datos de Google Sheets...');
    const { panelPrecios } = await googleSheets.readAllData();

    // 2. Tomar solo los primeros 20 productos para prueba
    const first20 = panelPrecios.slice(0, 20);
    console.log(`\n🔬 Usando ${first20.length} productos para la prueba\n`);

    // 3. Transformar con estructura padre + individuales
    console.log('🔄 Transformando con estructura padre + individuales...');
    const shopifyProducts = transformer.transformToShopify(first20);

    // 4. Validar
    const { valid } = transformer.validateProducts(shopifyProducts);
    console.log(`\n✅ ${valid.length} filas generadas (padre + variantes + individuales)`);

    // 5. Generar CSV para revisar
    console.log('\n📝 Generando CSV de prueba...');
    await csvExporter.exportToCsv(valid, './output/test_variants.csv');
    console.log('✅ CSV generado: ./output/test_variants.csv');
    console.log('\n💡 Revisa el CSV para ver la estructura antes de subirlo');

    // 6. Preguntar si desea continuar
    console.log('\n═'.repeat(60));
    console.log('📤 ¿Deseas subir estos productos a Shopify?');
    console.log('   (Este script subirá automáticamente en 5 segundos)');
    console.log('   Presiona Ctrl+C para cancelar');
    console.log('═'.repeat(60));

    // Esperar 5 segundos
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 7. Subir a Shopify (solo primeros 5 productos completos para prueba)
    console.log('\n📤 Subiendo primeros 5 modelos a Shopify...\n');

    // Agrupar por handle para subir productos completos (padre + variantes)
    const groupedByHandle = new Map<string, typeof valid>();
    valid.forEach(product => {
      if (!groupedByHandle.has(product.Handle)) {
        groupedByHandle.set(product.Handle, []);
      }
      groupedByHandle.get(product.Handle)!.push(product);
    });

    const handles = Array.from(groupedByHandle.keys()).slice(0, 5);
    console.log(`📦 Subiendo ${handles.length} productos (cada uno puede tener múltiples variantes):\n`);

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const handle of handles) {
      const productRows = groupedByHandle.get(handle)!;
      const mainProduct = productRows[0]; // Primera fila = producto principal

      try {
        console.log(`\n📦 Subiendo: ${mainProduct.Title || handle}`);
        console.log(`   Handle: ${handle}`);
        console.log(`   Filas en CSV: ${productRows.length} (1 principal + ${productRows.length - 1} variantes)`);

        // Solo subir la primera fila (Shopify creará el producto con todas las variantes del CSV)
        const result = await shopifyUploader.uploadProduct(mainProduct);

        console.log(`   ✅ Creado exitosamente (ID: ${result.product.id})`);
        console.log(`   📦 Stock configurado: 20 unidades`);
        totalSuccess++;

        // Delay entre productos
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        totalFailed++;
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    // Resumen
    console.log('\n═'.repeat(60));
    console.log('📊 RESUMEN DE PRUEBA');
    console.log('═'.repeat(60));
    console.log(`✅ Exitosos: ${totalSuccess}`);
    console.log(`❌ Fallidos: ${totalFailed}`);
    console.log(`\n📁 CSV generado: ./output/test_variants.csv`);
    console.log(`🔗 Ver en Shopify: https://${config.shopifyShopDomain}/admin/products`);
    console.log('\n💡 Si la estructura se ve bien, puedes proceder a subir todos los productos');
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

// Ejecutar
testVariants();
