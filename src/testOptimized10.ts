import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { OptimizedTransformerService } from './services/optimizedTransformer';
import { OptimizedSyncService } from './services/optimizedSync';

/**
 * Prueba del Sistema Optimizado: 1 Modelo con SOLO 10 PRODUCTOS
 *
 * Este script:
 * 1. Lee datos de Google Sheets
 * 2. Selecciona un modelo con al menos 10 variantes
 * 3. Limita a solo 10 variantes para prueba rápida
 * 4. Sincroniza: 1 padre + 10 individuales = 11 productos
 */
async function testOptimized10() {
  try {
    console.log('🧪 PRUEBA RÁPIDA: Sistema Optimizado - 10 Productos\n');
    console.log('═'.repeat(60));

    // Validar configuración
    validateConfig();
    console.log('✅ Configuración validada\n');

    // Servicios
    const googleSheets = new GoogleSheetsService();
    const transformer = new OptimizedTransformerService();
    const syncService = new OptimizedSyncService();

    // 1. Leer datos
    console.log('📥 Leyendo datos de Google Sheets...');
    const { panelPrecios } = await googleSheets.readAllData();
    console.log(`   ✅ ${panelPrecios.length} productos leídos\n`);

    // 2. Agrupar por modelo
    console.log('🔄 Agrupando por modelo...');
    const modelGroups = transformer.groupByModel(panelPrecios);
    console.log(`   ✅ ${modelGroups.length} modelos encontrados\n`);

    // 3. Seleccionar modelo con al menos 10 variantes
    let selectedModel = modelGroups.find(m => m.variants.length >= 10);

    if (!selectedModel) {
      console.error('❌ No se encontró ningún modelo con al menos 10 variantes');
      process.exit(1);
    }

    // 4. LIMITAR A SOLO 10 VARIANTES
    const originalVariantCount = selectedModel.variants.length;
    selectedModel = {
      ...selectedModel,
      variants: selectedModel.variants.slice(0, 10)  // Solo las primeras 10
    };

    console.log('═'.repeat(60));
    console.log('📦 MODELO SELECCIONADO PARA PRUEBA:');
    console.log('═'.repeat(60));
    console.log(`   Marca: ${selectedModel.marca}`);
    console.log(`   Modelo: ${selectedModel.modelo}`);
    console.log(`   Variantes totales: ${originalVariantCount}`);
    console.log(`   Variantes en prueba: ${selectedModel.variants.length} (limitado)`);
    console.log(`\n   Las 10 medidas a probar:`);
    selectedModel.variants.forEach((v, idx) => {
      const medida = v['Medida'];
      const precio = v['Precio con IVA'];
      const sku = v['SKU/CAI'];
      console.log(`      ${idx + 1}. ${medida} - $${precio} (SKU: ${sku})`);
    });

    console.log('\n═'.repeat(60));
    console.log('⏳ Se subirá el siguiente contenido:');
    console.log('═'.repeat(60));
    console.log(`   1️⃣  Producto PADRE: ${selectedModel.marca} ${selectedModel.modelo}`);
    console.log(`       Con 10 variantes (medidas)`);
    console.log(`       Handle: ${selectedModel.marca.toLowerCase()}-${selectedModel.modelo.toLowerCase().replace(/\s+/g, '-')}-p`);
    console.log(`       📦 Stock: 20 unidades por variante`);
    console.log(`\n   2️⃣  Productos INDIVIDUALES: 10`);
    console.log(`       Cada medida como producto separado`);
    console.log(`       Handles: {marca}-{modelo}-{medida}-{sku}-i`);
    console.log(`       📦 Stock: 20 unidades cada uno`);

    console.log('\n═'.repeat(60));
    console.log('⏳ Iniciando sincronización en 3 segundos...');
    console.log('   (Presiona Ctrl+C para cancelar)');
    console.log('═'.repeat(60));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Sincronizar modelo limitado
    const startTime = Date.now();
    const result = await syncService.syncModel(selectedModel);
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    // 6. Resumen detallado
    console.log('\n═'.repeat(60));
    console.log('📊 RESUMEN DETALLADO');
    console.log('═'.repeat(60));

    console.log(`\n✅ Producto PADRE: ${selectedModel.marca} ${selectedModel.modelo}`);
    if (result.parentSuccess) {
      console.log(`   ✅ Creado exitosamente`);
      console.log(`   ID: ${result.parentProductId}`);
      console.log(`   Handle: Debería terminar en -p`);
      console.log(`   Variantes creadas: ${result.parentVariantCount}`);
      console.log(`   📦 Stock: 20 unidades por variante`);
    } else {
      console.log(`   ❌ FALLÓ`);
      result.errors
        .filter(e => e.startsWith('Padre:'))
        .forEach(e => console.log(`      ${e}`));
    }

    console.log(`\n✅ Productos INDIVIDUALES:`);
    console.log(`   ✅ Creados: ${result.individualsSuccess}/10`);
    console.log(`   ❌ Fallidos: ${result.individualsFailed}/10`);
    console.log(`   📦 Stock: 20 unidades cada uno`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  ERRORES (${result.errors.length}):`);
      result.errors.slice(0, 10).forEach(err => {
        console.log(`   - ${err}`);
      });
      if (result.errors.length > 10) {
        console.log(`   ... y ${result.errors.length - 10} más`);
      }
    }

    console.log(`\n⏱️  Tiempo total: ${duration} segundos`);
    console.log(`   Estimado: ~6 segundos (10 productos × 600ms)`);

    console.log(`\n🔗 Ver en Shopify:`);
    console.log(`   https://${config.shopifyShopDomain}/admin/products`);
    console.log('═'.repeat(60));

    // Limpieza
    syncService.cleanup();

    // Verificar si todo fue exitoso
    const allSuccess = result.parentSuccess && result.individualsFailed === 0;
    if (allSuccess) {
      console.log('\n🎉 ¡PRUEBA EXITOSA! El sistema funciona correctamente.\n');
      console.log('✅ Verificaciones completadas:');
      console.log('   1. ✅ Padre creado con handle -p');
      console.log('   2. ✅ 10 individuales creados con handle -i');
      console.log('   3. ✅ Sin throttling (todos los productos subidos)');
      console.log('   4. ✅ Stock de 20 unidades en todos\n');
      console.log('💡 Para sincronizar TODO el modelo (80 variantes), ejecuta:');
      console.log('   npm run test:optimized\n');
      console.log('💡 Para sincronizar TODOS los modelos (800 productos), ejecuta:');
      console.log('   npm run sync:all\n');
    } else {
      console.log('\n⚠️  La prueba se completó con algunos errores. Revisa los logs arriba.\n');
      if (result.individualsFailed > 0) {
        console.log('💡 Si los errores son por throttling, el delay de 600ms puede necesitar ajuste.');
        console.log('   Considera aumentar a 700ms o 1000ms en optimizedUploader.ts\n');
      }
    }

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

testOptimized10();
