import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { OptimizedSyncService } from './services/optimizedSync';

/**
 * Script de Sincronización Completa
 *
 * Sincroniza TODOS los modelos del Google Sheet a Shopify
 * - Cada modelo se sube como producto padre con todas sus variantes
 * - Cada medida también se sube como producto individual
 * - Procesamiento modelo por modelo con delays para respetar rate limits
 */
async function syncAll() {
  try {
    console.log('🚀 SINCRONIZACIÓN COMPLETA: Todos los Modelos\n');
    console.log('═'.repeat(60));

    // Validar configuración
    validateConfig();
    console.log('✅ Configuración validada\n');

    // Servicios
    const googleSheets = new GoogleSheetsService();
    const syncService = new OptimizedSyncService();

    // 1. Leer datos
    console.log('📥 Leyendo datos de Google Sheets...');
    const { panelPrecios } = await googleSheets.readAllData();
    console.log(`   ✅ ${panelPrecios.length} productos leídos\n`);

    // 2. Mostrar estadísticas
    console.log('═'.repeat(60));
    console.log('📊 ESTADÍSTICAS PREVIAS');
    console.log('═'.repeat(60));

    // Agrupar por modelo para contar
    const marcasSet = new Set(panelPrecios.map(p => p['Marca']));
    const modelosSet = new Set(panelPrecios.map(p => `${p['Marca']}|${p['Modelo']}`));

    console.log(`   📦 Total de productos en Sheet: ${panelPrecios.length}`);
    console.log(`   🏷️  Marcas únicas: ${marcasSet.size}`);
    console.log(`   📦 Modelos únicos: ${modelosSet.size}`);
    console.log(`\n   Se crearán:`);
    console.log(`      • ${modelosSet.size} productos PADRE (1 por modelo)`);
    console.log(`      • ${panelPrecios.length} productos INDIVIDUALES (1 por medida)`);
    console.log(`      • Total: ${modelosSet.size + panelPrecios.length} productos`);
    console.log(`      • Stock: 20 unidades por producto/variante`);

    // 3. Confirmación
    console.log('\n═'.repeat(60));
    console.log('⚠️  ADVERTENCIA: Esta operación subirá TODOS los productos');
    console.log('═'.repeat(60));
    console.log(`   🔗 Tienda: ${config.shopifyShopDomain}`);
    console.log(`   📦 ${modelosSet.size} productos padre`);
    console.log(`   📦 ${panelPrecios.length} productos individuales`);
    console.log(`\n   El proceso puede tomar varios minutos dependiendo de la cantidad de productos.`);
    console.log(`   Los productos se subirán modelo por modelo para respetar rate limits.`);

    console.log('\n⏳ Iniciando sincronización en 10 segundos...');
    console.log('   (Presiona Ctrl+C para cancelar)');
    console.log('═'.repeat(60));

    await new Promise(resolve => setTimeout(resolve, 10000));

    // 4. Sincronizar todos los modelos
    const startTime = Date.now();
    const results = await syncService.syncModels(panelPrecios);
    const endTime = Date.now();

    // 5. Estadísticas finales
    const duration = Math.round((endTime - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;

    console.log('\n═'.repeat(60));
    console.log('✅ SINCRONIZACIÓN COMPLETADA');
    console.log('═'.repeat(60));
    console.log(`   ⏱️  Tiempo total: ${minutes}m ${seconds}s`);
    console.log(`\n🔗 Ver productos en Shopify:`);
    console.log(`   https://${config.shopifyShopDomain}/admin/products`);
    console.log('═'.repeat(60));

    // Limpieza
    syncService.cleanup();

    // Verificar resultados
    const totalSuccess = results.filter(r => r.parentSuccess).length;
    const totalFailed = results.length - totalSuccess;

    if (totalFailed === 0) {
      console.log('\n🎉 ¡SINCRONIZACIÓN EXITOSA! Todos los modelos fueron subidos correctamente.\n');
    } else {
      console.log(`\n⚠️  Sincronización completada con ${totalFailed} modelos fallidos.\n`);
      console.log('💡 Revisa los logs arriba para más detalles sobre los errores.\n');
    }

  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar
syncAll();
