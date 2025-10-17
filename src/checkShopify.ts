import { config, validateConfig } from './config';
import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

/**
 * Script para verificar el estado actual de la tienda Shopify
 * Muestra cuántos productos hay antes del test
 */
async function checkShopify() {
  try {
    console.log('🔍 VERIFICANDO ESTADO ACTUAL DE SHOPIFY\n');
    console.log('═'.repeat(60));

    // Validar configuración
    validateConfig();
    console.log('✅ Configuración validada\n');

    // Inicializar Shopify API
    const hostname = config.shopifyShopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

    const shopify = shopifyApi({
      apiKey: 'not-needed-for-custom-app',
      apiSecretKey: 'not-needed-for-custom-app',
      scopes: ['read_products', 'write_products'],
      hostName: hostname,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      adminApiAccessToken: config.shopifyAccessToken,
    });

    const session = new Session({
      id: `offline_${hostname}`,
      shop: hostname,
      state: 'online',
      isOnline: false,
      accessToken: config.shopifyAccessToken,
    });

    const client = new shopify.clients.Rest({ session });

    // Obtener productos
    console.log('📦 Obteniendo lista de productos...\n');

    const response = await client.get({
      path: 'products',
      query: { limit: '250' }
    });

    const products = (response.body as any).products || [];

    console.log('═'.repeat(60));
    console.log('📊 ESTADO ACTUAL DE LA TIENDA');
    console.log('═'.repeat(60));
    console.log(`\n🏪 Tienda: ${config.shopifyShopDomain}`);
    console.log(`📦 Total de productos: ${products.length}`);

    if (products.length > 0) {
      console.log(`\n📝 Últimos 10 productos creados:\n`);

      products
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .forEach((product: any, idx: number) => {
          const variantCount = product.variants?.length || 0;
          const createdAt = new Date(product.created_at).toLocaleString('es-AR');
          console.log(`   ${idx + 1}. ${product.title}`);
          console.log(`      Handle: ${product.handle}`);
          console.log(`      Variantes: ${variantCount}`);
          console.log(`      Vendor: ${product.vendor || 'N/A'}`);
          console.log(`      Creado: ${createdAt}`);
          console.log('');
        });

      // Estadísticas
      console.log('═'.repeat(60));
      console.log('📊 ESTADÍSTICAS');
      console.log('═'.repeat(60));

      // Agrupar por vendor
      const byVendor = products.reduce((acc: any, p: any) => {
        const vendor = p.vendor || 'Sin marca';
        acc[vendor] = (acc[vendor] || 0) + 1;
        return acc;
      }, {});

      console.log('\n📦 Productos por marca:');
      Object.entries(byVendor)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .forEach(([vendor, count]) => {
          console.log(`   ${vendor}: ${count} productos`);
        });

      // Contar padres vs individuales
      const parents = products.filter((p: any) => p.handle?.endsWith('-p')).length;
      const individuals = products.filter((p: any) => p.handle?.endsWith('-i')).length;
      const others = products.length - parents - individuals;

      console.log('\n📦 Distribución por tipo:');
      console.log(`   Productos PADRE (handle -p): ${parents}`);
      console.log(`   Productos INDIVIDUALES (handle -i): ${individuals}`);
      console.log(`   Otros: ${others}`);

      // Total de variantes
      const totalVariants = products.reduce((sum: number, p: any) => sum + (p.variants?.length || 0), 0);
      console.log(`\n📦 Total de variantes: ${totalVariants}`);

    } else {
      console.log('\n⚠️  No hay productos en la tienda actualmente.');
      console.log('   La tienda está vacía, perfecta para empezar el test.');
    }

    console.log('\n═'.repeat(60));
    console.log('✅ Verificación completada');
    console.log('═'.repeat(60));

    console.log('\n💡 Para ejecutar el test optimizado:');
    console.log('   npm run test:optimized\n');

  } catch (error: any) {
    console.error('\n❌ Error verificando Shopify:', error.message);
    if (error.response) {
      console.error('Detalles:', JSON.stringify(error.response.body, null, 2));
    }
    process.exit(1);
  }
}

checkShopify();
