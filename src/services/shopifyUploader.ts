import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { ShopifyProduct } from '../types';
import { config } from '../config';

/**
 * Servicio para subir productos a Shopify usando Admin API
 */
export class ShopifyUploaderService {
  private shopify: any;
  private session: Session;

  constructor() {
    // Validar que existan las credenciales de Shopify
    if (!config.shopifyShopDomain) {
      throw new Error('SHOPIFY_SHOP_DOMAIN no está configurado en .env');
    }
    if (!config.shopifyAccessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN no está configurado en .env');
    }

    // Extraer hostname (sin .myshopify.com)
    const hostname = config.shopifyShopDomain.replace('.myshopify.com', '');

    // Inicializar cliente de Shopify
    this.shopify = shopifyApi({
      apiKey: 'not-needed-for-custom-app',
      apiSecretKey: 'not-needed-for-custom-app',
      scopes: ['read_products', 'write_products'],
      hostName: hostname,
      adminApiAccessToken: config.shopifyAccessToken,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      isCustomStoreApp: true,
    });

    // Crear sesión con token de acceso
    this.session = new Session({
      id: `offline_${config.shopifyShopDomain}`,
      shop: config.shopifyShopDomain,
      state: 'online',
      isOnline: false,
      accessToken: config.shopifyAccessToken,
    });
  }

  /**
   * Sube un producto a Shopify
   */
  async uploadProduct(product: ShopifyProduct): Promise<any> {
    try {
      const client = new this.shopify.clients.Rest({ session: this.session });

      const productData: {
        product: {
          title: string;
          body_html: string;
          vendor: string;
          product_type: string;
          tags: string;
          published: boolean;
          status: string;
          variants: any[];
          images?: any[];
        }
      } = {
        product: {
          title: product.Title,
          body_html: product['Body (HTML)'],
          vendor: product.Vendor,
          product_type: product.Type,
          tags: product.Tags,
          published: product.Published === 'TRUE',
          status: product.Status || 'active',
          variants: [
            {
              sku: product['Variant SKU'],
              price: product['Variant Price'],
              compare_at_price: product['Variant Compare At Price'] || null,
              barcode: product['Variant Barcode'],
              weight: parseFloat(product['Variant Grams']) / 1000 || 0,
              weight_unit: product['Variant Weight Unit'] || 'kg',
              inventory_management: 'shopify',
              inventory_policy: product['Variant Inventory Policy'] || 'deny',
              fulfillment_service: product['Variant Fulfillment Service'] || 'manual',
              requires_shipping: product['Variant Requires Shipping'] === 'TRUE',
              taxable: product['Variant Taxable'] === 'TRUE',
            }
          ]
        }
      };

      // Añadir imagen si existe
      if (product['Image Src']) {
        productData.product.images = [
          {
            src: product['Image Src'],
            alt: product['Image Alt Text']
          }
        ];
      }

      const response = await client.post({
        path: 'products',
        data: productData,
        type: 'application/json',
      });

      // Configurar inventario en 20 unidades para cada variante
      const createdProduct = response.body.product;
      if (createdProduct && createdProduct.variants) {
        await this.setInventoryLevels(client, createdProduct.variants, 20);
      }

      return response.body;
    } catch (error) {
      console.error(`❌ Error subiendo producto ${product.Handle}:`, error);
      throw error;
    }
  }

  /**
   * Configura niveles de inventario para las variantes
   */
  private async setInventoryLevels(client: any, variants: any[], quantity: number): Promise<void> {
    try {
      for (const variant of variants) {
        if (variant.inventory_item_id) {
          // Primero obtener las locations
          const locationsResponse = await client.get({
            path: 'locations',
          });

          const locations = locationsResponse.body.locations || [];
          if (locations.length > 0) {
            const locationId = locations[0].id; // Usar la primera ubicación

            // Configurar inventario
            await client.post({
              path: 'inventory_levels/set',
              data: {
                location_id: locationId,
                inventory_item_id: variant.inventory_item_id,
                available: quantity
              },
              type: 'application/json',
            });
          }
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  No se pudo configurar inventario: ${error}`);
    }
  }

  /**
   * Actualiza un producto existente en Shopify
   */
  async updateProduct(productId: string, product: ShopifyProduct): Promise<any> {
    try {
      const client = new this.shopify.clients.Rest({ session: this.session });

      const productData = {
        product: {
          id: productId,
          title: product.Title,
          body_html: product['Body (HTML)'],
          vendor: product.Vendor,
          product_type: product.Type,
          tags: product.Tags,
        }
      };

      const response = await client.put({
        path: `products/${productId}`,
        data: productData,
        type: 'application/json',
      });

      return response.body;
    } catch (error) {
      console.error(`❌ Error actualizando producto ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Busca un producto por handle
   */
  async findProductByHandle(handle: string): Promise<any> {
    try {
      const client = new this.shopify.clients.Rest({ session: this.session });

      const response = await client.get({
        path: 'products',
        query: { handle: handle },
      });

      const products = response.body['products'] || [];
      return products.length > 0 ? products[0] : null;
    } catch (error) {
      console.error(`❌ Error buscando producto ${handle}:`, error);
      return null;
    }
  }

  /**
   * Sube múltiples productos con control de rate limit
   */
  async uploadProducts(
    products: ShopifyProduct[],
    options: {
      batchSize?: number;
      delayMs?: number;
      updateExisting?: boolean;
    } = {}
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ handle: string; error: string }>;
  }> {
    const { batchSize = 10, delayMs = 1000, updateExisting = true } = options;

    console.log('\n📤 Subiendo productos a Shopify...');
    console.log(`   Total: ${products.length} productos`);
    console.log(`   Batch size: ${batchSize}`);
    console.log(`   Delay: ${delayMs}ms entre batches`);

    let success = 0;
    let failed = 0;
    const errors: Array<{ handle: string; error: string }> = [];

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      console.log(`\n   Procesando batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}...`);

      const promises = batch.map(async (product) => {
        try {
          // Buscar si el producto ya existe
          if (updateExisting) {
            const existing = await this.findProductByHandle(product.Handle);
            if (existing) {
              await this.updateProduct(existing.id, product);
              console.log(`   ✅ Actualizado: ${product.Handle}`);
            } else {
              await this.uploadProduct(product);
              console.log(`   ✅ Creado: ${product.Handle}`);
            }
          } else {
            await this.uploadProduct(product);
            console.log(`   ✅ Creado: ${product.Handle}`);
          }

          success++;
        } catch (error) {
          failed++;
          const errorMsg = error instanceof Error ? error.message : String(error);
          errors.push({ handle: product.Handle, error: errorMsg });
          console.error(`   ❌ Error: ${product.Handle} - ${errorMsg}`);
        }
      });

      await Promise.all(promises);

      // Esperar entre batches para respetar rate limits
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    console.log('\n📊 Resumen de subida:');
    console.log(`   ✅ Exitosos: ${success}`);
    console.log(`   ❌ Fallidos: ${failed}`);

    return { success, failed, errors };
  }

  /**
   * Actualiza solo los precios de productos existentes
   */
  async updatePricesOnly(products: ShopifyProduct[]): Promise<void> {
    console.log('\n💰 Actualizando solo precios...');

    for (const product of products) {
      try {
        const existing = await this.findProductByHandle(product.Handle);

        if (existing && existing.variants && existing.variants.length > 0) {
          const client = new this.shopify.clients.Rest({ session: this.session });
          const variantId = existing.variants[0].id;

          await client.put({
            path: `variants/${variantId}`,
            data: {
              variant: {
                id: variantId,
                price: product['Variant Price'],
                compare_at_price: product['Variant Compare At Price'] || null,
              }
            },
            type: 'application/json',
          });

          console.log(`   ✅ Precio actualizado: ${product.Handle} -> $${product['Variant Price']}`);
        } else {
          console.log(`   ⚠️  Producto no encontrado: ${product.Handle}`);
        }
      } catch (error) {
        console.error(`   ❌ Error actualizando precio de ${product.Handle}:`, error);
      }

      // Pequeño delay para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
