import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { SimpleDataTransformerService } from './services/dataTransformerSimple';
import { ShopifyUploaderService } from './services/shopifyUploader';

/**
 * Script para subir los primeros 10 productos a Shopify
 */
async function uploadFirst10() {
  try {
    console.log('🚀 Subiendo primeros 10 productos a Shopify\n');
    console.log('═'.repeat(60));

    // Validar configuración
    validateConfig();
    console.log('✅ Configuración validada\n');

    // Servicios
    const googleSheets = new GoogleSheetsService();
    const transformer = new SimpleDataTransformerService();
    const shopifyUploader = new ShopifyUploaderService();

    // 1. Leer datos
    console.log('📥 Leyendo datos de Google Sheets...');
    const { panelPrecios } = await googleSheets.readAllData();

    // 2. Transformar
    console.log('\n🔄 Transformando datos...');
    const allProducts = transformer.transformToShopify(panelPrecios);

    // 3. Validar
    const { valid } = transformer.validateProducts(allProducts);

    if (valid.length === 0) {
      console.error('❌ No hay productos válidos para subir');
      return;
    }

    // 4. Tomar solo los primeros 10
    const first10 = valid.slice(0, 10);
    console.log(`\n📤 Subiendo ${first10.length} productos a Shopify...`);
    console.log('─'.repeat(60));

    // 5. Subir uno por uno
    let success = 0;
    let failed = 0;

    for (let i = 0; i < first10.length; i++) {
      const product = first10[i];
      const num = i + 1;

      try {
        console.log(`\n[${num}/10] Subiendo: ${product.Title}`);
        console.log(`        Handle: ${product.Handle}`);
        console.log(`        Precio: $${product['Variant Price']}`);
        console.log(`        SKU: ${product['Variant SKU']}`);

        const result = await shopifyUploader.uploadProduct(product);

        console.log(`        ✅ Creado exitosamente (ID: ${result.product.id})`);
        success++;

        // Pequeño delay entre productos para evitar rate limits
        if (i < first10.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error: any) {
        failed++;
        console.error(`        ❌ Error: ${error.message}`);

        // Si es un error de rate limit, esperamos más tiempo
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          console.log('        ⏳ Esperando 5 segundos debido a rate limit...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    // Resumen final
    console.log('\n═'.repeat(60));
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('═'.repeat(60));
    console.log(`✅ Exitosos: ${success}`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log(`📦 Total procesados: ${first10.length}`);

    if (success > 0) {
      console.log('\n🎉 ¡Productos creados exitosamente en Shopify!');
      console.log(`\n🔗 Ver en Shopify Admin:`);
      console.log(`   https://${config.shopifyShopDomain}/admin/products`);
    }

    console.log('\n═'.repeat(60));
  } catch (error) {
    console.error('\n❌ Error durante la importación:', error);
    process.exit(1);
  }
}

// Ejecutar
uploadFirst10();
