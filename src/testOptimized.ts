import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { OptimizedTransformerService } from './services/optimizedTransformer';
import { OptimizedSyncService } from './services/optimizedSync';

/**
 * Prueba del Sistema Optimizado: 1 Modelo Completo (Padre + Todos sus Individuales)
 *
 * Este script:
 * 1. Lee datos de Google Sheets
 * 2. Encuentra el modelo con más variantes
 * 3. Sincroniza ese modelo completo (padre + individuales)
 * 4. Muestra resumen detallado
 */
async function testOptimized() {
  try {
    console.log('🧪 PRUEBA: Sistema Optimizado - 1 Modelo Completo\n');
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

    // 3. Seleccionar el modelo con más variantes para prueba
    let selectedModel = modelGroups[0];
    let maxVariants = selectedModel.variants.length;

    modelGroups.forEach(modelGroup => {
      if (modelGroup.variants.length > maxVariants) {
        maxVariants = modelGroup.variants.length;
        selectedModel = modelGroup;
      }
    });

    console.log('═'.repeat(60));
    console.log('📦 MODELO SELECCIONADO PARA PRUEBA:');
    console.log('═'.repeat(60));
    console.log(`   Marca: ${selectedModel.marca}`);
    console.log(`   Modelo: ${selectedModel.modelo}`);
    console.log(`   Variantes: ${selectedModel.variants.length}`);
    console.log(`\n   Primeras 5 medidas:`);
    selectedModel.variants.slice(0, 5).forEach((v, idx) => {
      const medida = v['Medida'];
      const precio = v['Precio con IVA'];
      console.log(`      ${idx + 1}. ${medida} - $${precio}`);
    });
    if (selectedModel.variants.length > 5) {
      console.log(`      ... y ${selectedModel.variants.length - 5} más`);
    }

    console.log('\n═'.repeat(60));
    console.log('⏳ Se subirá el siguiente contenido:');
    console.log('═'.repeat(60));
    console.log(`   1️⃣  Producto PADRE: ${selectedModel.marca} ${selectedModel.modelo}`);
    console.log(`       Con ${selectedModel.variants.length} variantes (medidas)`);
    console.log(`       📦 Stock: 20 unidades por variante`);
    console.log(`\n   2️⃣  Productos INDIVIDUALES: ${selectedModel.variants.length}`);
    console.log(`       Cada medida como producto separado`);
    console.log(`       📦 Stock: 20 unidades cada uno`);

    console.log('\n═'.repeat(60));
    console.log('⏳ Iniciando sincronización en 3 segundos...');
    console.log('   (Presiona Ctrl+C para cancelar)');
    console.log('═'.repeat(60));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Sincronizar modelo completo
    const result = await syncService.syncModel(selectedModel);

    // 5. Resumen detallado
    console.log('\n═'.repeat(60));
    console.log('📊 RESUMEN DETALLADO');
    console.log('═'.repeat(60));

    console.log(`\n✅ Producto PADRE: ${selectedModel.marca} ${selectedModel.modelo}`);
    if (result.parentSuccess) {
      console.log(`   ✅ Creado exitosamente`);
      console.log(`   ID: ${result.parentProductId}`);
      console.log(`   Variantes creadas: ${result.parentVariantCount}`);
      console.log(`   📦 Stock: 20 unidades por variante`);
    } else {
      console.log(`   ❌ FALLÓ`);
      result.errors
        .filter(e => e.startsWith('Padre:'))
        .forEach(e => console.log(`      ${e}`));
    }

    console.log(`\n✅ Productos INDIVIDUALES:`);
    console.log(`   ✅ Creados: ${result.individualsSuccess}`);
    console.log(`   ❌ Fallidos: ${result.individualsFailed}`);
    console.log(`   📦 Stock: 20 unidades cada uno`);

    if (result.errors.length > 0) {
      console.log(`\n⚠️  ERRORES (${result.errors.length}):`);
      result.errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err}`);
      });
      if (result.errors.length > 5) {
        console.log(`   ... y ${result.errors.length - 5} más`);
      }
    }

    console.log(`\n🔗 Ver en Shopify:`);
    console.log(`   https://${config.shopifyShopDomain}/admin/products`);
    console.log('═'.repeat(60));

    // Limpieza
    syncService.cleanup();

    // Verificar si todo fue exitoso
    const allSuccess = result.parentSuccess && result.individualsFailed === 0;
    if (allSuccess) {
      console.log('\n🎉 ¡PRUEBA EXITOSA! El sistema optimizado funciona correctamente.\n');
      console.log('💡 Para sincronizar TODOS los modelos, ejecuta:');
      console.log('   npm run sync:all\n');
    } else {
      console.log('\n⚠️  La prueba se completó con algunos errores. Revisa los logs arriba.\n');
    }

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);
    process.exit(1);
  }
}

testOptimized();
