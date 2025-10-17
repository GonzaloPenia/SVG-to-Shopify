import { config, validateConfig } from './config';
import { GoogleSheetsService } from './services/googleSheets';
import { DataTransformerFinalService } from './services/dataTransformerFinal';
import { ShopifyUploaderService } from './services/shopifyUploader';

/**
 * Prueba: 1 producto padre + todos sus individuales
 */
async function testOneFull() {
  try {
    console.log('🧪 Prueba: 1 Padre + Todos sus Individuales\n');
    console.log('═'.repeat(60));

    validateConfig();
    console.log('✅ Configuración validada\n');

    const googleSheets = new GoogleSheetsService();
    const transformer = new DataTransformerFinalService();
    const shopifyUploader = new ShopifyUploaderService();

    // 1. Leer datos
    console.log('📥 Leyendo datos...');
    const { panelPrecios } = await googleSheets.readAllData();

    // 2. Transformar
    console.log('\n🔄 Transformando datos...');
    const { padres, individuales } = transformer.transformToShopify(panelPrecios);

    // 3. Agrupar padres por handle (para identificar cuál tiene más variantes)
    const padresGrouped = new Map<string, typeof padres>();
    padres.forEach(p => {
      if (!padresGrouped.has(p.Handle)) {
        padresGrouped.set(p.Handle, []);
      }
      padresGrouped.get(p.Handle)!.push(p);
    });

    // 4. Seleccionar el padre con más variantes para prueba
    let selectedHandle = '';
    let maxVariants = 0;

    padresGrouped.forEach((rows, handle) => {
      if (rows.length > maxVariants) {
        maxVariants = rows.length;
        selectedHandle = handle;
      }
    });

    const padrePrueba = padresGrouped.get(selectedHandle)!;
    const mainPadre = padrePrueba[0];

    console.log(`\n📦 Producto padre seleccionado para prueba:`);
    console.log(`   Título: ${mainPadre.Title}`);
    console.log(`   Handle: ${selectedHandle}`);
    console.log(`   Variantes: ${padrePrueba.length}`);

    // 5. Encontrar todos los individuales relacionados
    // Los individuales tienen handle que empieza con el mismo base
    const baseHandle = selectedHandle.replace('-p', '');
    const individualesRelacionados = individuales.filter(ind =>
      ind.Handle.startsWith(baseHandle) && ind.Handle.endsWith('-i')
    );

    console.log(`   Productos individuales relacionados: ${individualesRelacionados.length}\n`);

    // 6. Mostrar resumen
    console.log('═'.repeat(60));
    console.log('📋 RESUMEN DE PRUEBA:');
    console.log('═'.repeat(60));
    console.log(`1️⃣  Producto PADRE: ${mainPadre.Title}`);
    console.log(`    Variantes: ${padrePrueba.length}`);
    padrePrueba.forEach((v, idx) => {
      if (v['Option1 Value']) {
        console.log(`      ${idx + 1}. ${v['Option1 Value']} - $${v['Variant Price']}`);
      }
    });

    console.log(`\n2️⃣  Productos INDIVIDUALES: ${individualesRelacionados.length}`);
    individualesRelacionados.slice(0, 5).forEach((ind, idx) => {
      console.log(`      ${idx + 1}. ${ind.Title} - $${ind['Variant Price']}`);
    });
    if (individualesRelacionados.length > 5) {
      console.log(`      ... y ${individualesRelacionados.length - 5} más`);
    }

    console.log('\n═'.repeat(60));
    console.log('⏳ Subiendo a Shopify en 3 segundos...');
    console.log('   (Presiona Ctrl+C para cancelar)');
    console.log('═'.repeat(60));

    await new Promise(resolve => setTimeout(resolve, 3000));

    // 7. Subir PADRE primero
    console.log('\n📤 PASO 1: Subiendo producto PADRE...\n');

    try {
      const resultPadre = await shopifyUploader.uploadProduct(mainPadre);
      console.log(`✅ Padre creado: ${mainPadre.Title}`);
      console.log(`   ID: ${resultPadre.product.id}`);
      console.log(`   Variantes creadas: ${resultPadre.product.variants?.length || 0}`);
      console.log(`   📦 Stock: 20 unidades por variante\n`);
    } catch (error: any) {
      console.error(`❌ Error creando padre: ${error.message}\n`);
      return;
    }

    // Esperar un poco entre padre e individuales
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 8. Subir INDIVIDUALES
    console.log('\n📤 PASO 2: Subiendo productos INDIVIDUALES...\n');

    let success = 0;
    let failed = 0;

    for (let i = 0; i < individualesRelacionados.length; i++) {
      const individual = individualesRelacionados[i];

      try {
        console.log(`[${i + 1}/${individualesRelacionados.length}] ${individual.Title}`);

        const result = await shopifyUploader.uploadProduct(individual);

        console.log(`   ✅ Creado (ID: ${result.product.id})`);
        success++;

        // Delay entre productos
        if (i < individualesRelacionados.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error: any) {
        failed++;
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    // 9. Resumen final
    console.log('\n═'.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('═'.repeat(60));
    console.log(`✅ Producto PADRE: 1 creado`);
    console.log(`   Con ${padrePrueba.length} variantes`);
    console.log(`\n✅ Productos INDIVIDUALES: ${success} creados`);
    console.log(`❌ Fallidos: ${failed}`);
    console.log(`\n🔗 Ver en Shopify:`);
    console.log(`   https://${config.shopifyShopDomain}/admin/products`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

testOneFull();
