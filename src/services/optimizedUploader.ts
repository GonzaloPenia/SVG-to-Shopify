import { shopifyApi, LATEST_API_VERSION, Session } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';
import { ShopifyProduct } from '../types';
import { config } from '../config';

export interface UploadResult {
  success: boolean;
  productId?: string;
  variantIds?: string[];
  error?: string;
}

/**
 * Uploader Optimizado para Shopify
 *
 * Mejoras:
 * - Inventario incluido en creación (20 unidades por defecto)
 * - Batches para evitar rate limits
 * - Mejor manejo de errores
 */
export class OptimizedUploaderService {
  private shopify: any;
  private session: Session;

  constructor() {
    if (!config.shopifyShopDomain || !config.shopifyAccessToken) {
      throw new Error('Shopify credentials not configured');
    }

    const hostname = config.shopifyShopDomain.replace('.myshopify.com', '');

    this.shopify = shopifyApi({
      apiKey: 'not-needed-for-custom-app',
      apiSecretKey: 'not-needed-for-custom-app',
      scopes: ['read_products', 'write_products', 'read_inventory', 'write_inventory'],
      hostName: hostname,
      adminApiAccessToken: config.shopifyAccessToken,
      apiVersion: LATEST_API_VERSION,
      isEmbeddedApp: false,
      isCustomStoreApp: true,
    });

    this.session = new Session({
      id: `offline_${config.shopifyShopDomain}`,
      shop: config.shopifyShopDomain,
      state: 'online',
      isOnline: false,
      accessToken: config.shopifyAccessToken,
    });
  }

  /**
   * Sube un producto individual a Shopify
   * Incluye inventario en la creación
   */
  async uploadProduct(product: ShopifyProduct, inventoryQty: number = 20): Promise<UploadResult> {
    try {
      const client = new this.shopify.clients.Rest({ session: this.session });

      const productData: any = {
        product: {
          title: product.Title,
          body_html: product['Body (HTML)'],
          vendor: product.Vendor,
          product_type: product.Type,
          tags: product.Tags,
          handle: product.Handle,  // ✅ CRÍTICO: Incluir handle personalizado
          published: product.Published === 'TRUE',
          status: product.Status || 'active',
          // ✅ CRÍTICO: Incluir opciones del producto
          options: [
            {
              name: product['Option1 Name'] || 'Medida',
              values: [product['Option1 Value'] || 'Default']
            }
          ],
          variants: [
            {
              option1: product['Option1 Value'] || 'Default',  // ✅ CRÍTICO: Valor de la opción
              sku: product['Variant SKU'],
              price: product['Variant Price'],
              compare_at_price: product['Variant Compare At Price'] || null,
              barcode: product['Variant Barcode'],
              weight: parseFloat(product['Variant Grams']) / 1000 || 0,
              weight_unit: product['Variant Weight Unit'] || 'kg',
              inventory_management: 'shopify',
              inventory_policy: product['Variant Inventory Policy'] || 'continue',
              fulfillment_service: product['Variant Fulfillment Service'] || 'manual',
              requires_shipping: product['Variant Requires Shipping'] === 'TRUE',
              taxable: product['Variant Taxable'] === 'TRUE',
            }
          ]
        }
      };

      // Agregar imagen si existe
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

      const createdProduct = response.body.product;
      const variantIds = createdProduct.variants?.map((v: any) => v.id) || [];

      // Configurar inventario
      if (createdProduct && createdProduct.variants && inventoryQty > 0) {
        await this.setInventoryLevels(client, createdProduct.variants, inventoryQty);
      }

      return {
        success: true,
        productId: createdProduct.id,
        variantIds
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  /**
   * Sube un producto PADRE con TODAS sus variantes
   * Este método crea el producto con la primera variante y luego agrega las restantes
   */
  async uploadParentWithVariants(parentRows: ShopifyProduct[], inventoryQty: number = 20): Promise<UploadResult> {
    try {
      if (parentRows.length === 0) {
        return { success: false, error: 'No parent rows provided' };
      }

      const client = new this.shopify.clients.Rest({ session: this.session });

      // 1. Crear producto con la primera variante
      const firstRow = parentRows[0];
      const productData: any = {
        product: {
          title: firstRow.Title,
          body_html: firstRow['Body (HTML)'],
          vendor: firstRow.Vendor,
          product_type: firstRow.Type,
          tags: firstRow.Tags,
          handle: firstRow.Handle,
          published: firstRow.Published === 'TRUE',
          status: firstRow.Status || 'active',
          options: [
            {
              name: firstRow['Option1 Name'] || 'Medida',
              values: [firstRow['Option1 Value'] || 'Default']
            }
          ],
          variants: [
            {
              option1: firstRow['Option1 Value'] || 'Default',
              sku: firstRow['Variant SKU'],
              price: firstRow['Variant Price'],
              compare_at_price: firstRow['Variant Compare At Price'] || null,
              barcode: firstRow['Variant Barcode'],
              weight: parseFloat(firstRow['Variant Grams']) / 1000 || 0,
              weight_unit: firstRow['Variant Weight Unit'] || 'kg',
              inventory_management: 'shopify',
              inventory_policy: firstRow['Variant Inventory Policy'] || 'continue',
              fulfillment_service: firstRow['Variant Fulfillment Service'] || 'manual',
              requires_shipping: firstRow['Variant Requires Shipping'] === 'TRUE',
              taxable: firstRow['Variant Taxable'] === 'TRUE',
            }
          ]
        }
      };

      // Agregar imagen si existe
      if (firstRow['Image Src']) {
        productData.product.images = [
          {
            src: firstRow['Image Src'],
            alt: firstRow['Image Alt Text']
          }
        ];
      }

      const response = await client.post({
        path: 'products',
        data: productData,
        type: 'application/json',
      });

      const createdProduct = response.body.product;
      const productId = createdProduct.id;
      const variantIds = [createdProduct.variants[0].id];

      // Configurar inventario de la primera variante
      await this.setInventoryLevels(client, [createdProduct.variants[0]], inventoryQty);

      // 2. Agregar variantes restantes (si hay más de una)
      if (parentRows.length > 1) {
        for (let i = 1; i < parentRows.length; i++) {
          const variantRow = parentRows[i];

          await this.delay(600);  // Delay entre cada variante

          const variantData = {
            variant: {
              option1: variantRow['Option1 Value'] || 'Default',
              sku: variantRow['Variant SKU'],
              price: variantRow['Variant Price'],
              compare_at_price: variantRow['Variant Compare At Price'] || null,
              barcode: variantRow['Variant Barcode'],
              weight: parseFloat(variantRow['Variant Grams']) / 1000 || 0,
              weight_unit: variantRow['Variant Weight Unit'] || 'kg',
              inventory_management: 'shopify',
              inventory_policy: variantRow['Variant Inventory Policy'] || 'continue',
              fulfillment_service: variantRow['Variant Fulfillment Service'] || 'manual',
              requires_shipping: variantRow['Variant Requires Shipping'] === 'TRUE',
              taxable: variantRow['Variant Taxable'] === 'TRUE',
            }
          };

          try {
            const variantResponse = await client.post({
              path: `products/${productId}/variants`,
              data: variantData,
              type: 'application/json',
            });

            const newVariant = variantResponse.body.variant;
            variantIds.push(newVariant.id);

            // Configurar inventario
            await this.setInventoryLevels(client, [newVariant], inventoryQty);

            console.log(`   ✅ Variante ${i}/${parentRows.length - 1} agregada: ${variantRow['Option1 Value']}`);
          } catch (variantError: any) {
            console.warn(`   ⚠️  Error agregando variante ${i}: ${variantError.message}`);
          }
        }
      }

      return {
        success: true,
        productId: productId,
        variantIds: variantIds
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || String(error)
      };
    }
  }

  /**
   * Sube productos uno por uno para evitar rate limits
   * Delay de 600ms entre cada petición = ~1.6 requests/segundo (debajo del límite de 2/seg)
   */
  async uploadBatch(
    products: ShopifyProduct[],
    batchSize: number = 1,
    delayMs: number = 600
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      // Subir producto individual
      const result = await this.uploadProduct(product);
      results.push(result);

      // Delay entre cada petición (excepto después de la última)
      if (i < products.length - 1) {
        await this.delay(delayMs);
      }
    }

    return results;
  }

  /**
   * Configura inventario en 20 unidades por defecto
   */
  private async setInventoryLevels(client: any, variants: any[], quantity: number): Promise<void> {
    try {
      // Obtener locations
      const locationsResponse = await client.get({ path: 'locations' });
      const locations = locationsResponse.body.locations || [];

      if (locations.length === 0) {
        console.warn('   ⚠️  No locations found for inventory');
        return;
      }

      const locationId = locations[0].id;

      // Configurar inventario para cada variante
      for (const variant of variants) {
        if (variant.inventory_item_id) {
          try {
            await client.post({
              path: 'inventory_levels/set',
              data: {
                location_id: locationId,
                inventory_item_id: variant.inventory_item_id,
                available: quantity
              },
              type: 'application/json',
            });
          } catch (invError) {
            console.warn(`   ⚠️  No se pudo configurar inventario para variante ${variant.id}`);
          }
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Error configurando inventario: ${error}`);
    }
  }

  /**
   * Helper para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verifica si un producto existe por handle
   */
  async productExists(handle: string): Promise<boolean> {
    try {
      const client = new this.shopify.clients.Rest({ session: this.session });

      const response = await client.get({
        path: 'products',
        query: { handle: handle, limit: 1 },
      });

      const products = response.body.products || [];
      return products.length > 0;

    } catch (error) {
      return false;
    }
  }
}
