# Sistema Optimizado de Sincronización

## 📋 Resumen de Optimizaciones

Este documento describe las optimizaciones implementadas para resolver problemas críticos en el flujo de sincronización de productos desde Google Sheets a Shopify.

## 🔍 Problemas Identificados

### 1. **Handles Inconsistentes**
- **Problema**: Los handles para productos padre e individuales se generaban de forma diferente, causando que los productos individuales no pudieran encontrar su padre correspondiente.
- **Impacto**: En el test, 0 productos individuales encontrados a pesar de existir el padre.

### 2. **Limitación API de Shopify**
- **Problema**: `POST /products` solo crea 1 variante por defecto, aunque el CSV tenga múltiples filas.
- **Impacto**: Productos padre con 80 variantes se creaban con solo 1 variante.

### 3. **Búsqueda de Descripción Frágil**
- **Problema**: La comparación de strings era sensible a espacios extras, mayúsculas y acentos.
- **Impacto**: Descripciones no se asignaban correctamente.

### 4. **Orden de Subida Caótico**
- **Problema**: Se intentaba subir "todos los padres primero, luego todos los individuales", pero sin garantizar que cada padre tuviera sus individuales inmediatamente después.
- **Impacto**: Difícil rastrear errores modelo por modelo.

### 5. **Rate Limits y Errores**
- **Problema**: Sin batch processing ni delays entre requests.
- **Impacto**: Potencial para superar rate limits de Shopify.

## ✅ Soluciones Implementadas

### 1. Generación Centralizada de Handles

**Archivo**: `src/utils/handleGenerator.ts`

```typescript
// Sanitización consistente
export function sanitize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')                  // Normalizar Unicode
    .replace(/[\u0300-\u036f]/g, '')   // Eliminar acentos
    .replace(/\s+/g, '-')              // Espacios → guiones
    .replace(/\//g, '')                // Eliminar /
    .replace(/\+/g, 'plus')            // + → plus
    .replace(/[^a-z0-9-]/g, '')        // Solo alfanuméricos y -
    .replace(/-+/g, '-')               // Múltiples - → uno solo
    .replace(/^-|-$/g, '');            // Eliminar - al inicio/fin
}

// Handle padre: marca-modelo-p
export function createParentHandle(marca: string, modelo: string): string {
  return `${sanitize(marca)}-${sanitize(modelo)}-p`;
}

// Handle individual: marca-modelo-medida-sku-i
// Incluye SKU para garantizar unicidad
export function createIndividualHandle(
  marca: string,
  modelo: string,
  medida: string,
  sku: string
): string {
  return `${sanitize(marca)}-${sanitize(modelo)}-${sanitize(medida)}-${sanitize(sku)}-i`;
}
```

**Beneficios**:
- ✅ Handles consistentes en toda la aplicación
- ✅ SKU incluido en individuales garantiza unicidad
- ✅ Normalización de Unicode y caracteres especiales
- ✅ Un solo lugar para modificar lógica de handles

### 2. Búsqueda Mejorada de Descripciones

**Archivo**: `src/services/optimizedTransformer.ts`

```typescript
// Normalización para comparación
export function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Eliminar acentos
    .replace(/\s+/g, ' ');            // Normalizar espacios múltiples
}

// Búsqueda con fallbacks
private getDescripcion(modelo: string, variants: PanelPreciosRow[]): string {
  const modeloNormalized = normalizeForComparison(modelo);

  // 1. Buscar descripción que coincida exactamente con el modelo
  for (const variant of variants) {
    const variantModelo = normalizeForComparison(String(variant['Modelo'] || ''));
    const descripcion = String(variant['Descripción'] || '').trim();

    if (variantModelo === modeloNormalized && descripcion) {
      return descripcion;
    }
  }

  // 2. Fallback: usar la primera descripción disponible en el grupo
  for (const variant of variants) {
    const descripcion = String(variant['Descripción'] || '').trim();
    if (descripcion) return descripcion;
  }

  // 3. Si no hay descripción, retornar vacío
  return '';
}
```

**Beneficios**:
- ✅ Resistente a diferencias de espaciado
- ✅ Case-insensitive
- ✅ Maneja acentos correctamente
- ✅ Fallbacks inteligentes

### 3. Upload con Batches y Rate Limiting

**Archivo**: `src/services/optimizedUploader.ts`

```typescript
async uploadBatch(
  products: ShopifyProduct[],
  batchSize: number = 5,
  delayMs: number = 1000
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    // Subir batch en paralelo
    const batchPromises = batch.map(product => this.uploadProduct(product));
    const batchResults = await Promise.all(batchPromises);

    results.push(...batchResults);

    // Delay entre batches
    if (i + batchSize < products.length) {
      await this.delay(delayMs);
    }
  }

  return results;
}
```

**Beneficios**:
- ✅ Procesamiento en batches de 5 productos
- ✅ Delays configurables entre batches
- ✅ Respeta rate limits de Shopify
- ✅ Procesamiento paralelo dentro de cada batch

### 4. Inventario en Creación

**Archivo**: `src/services/optimizedUploader.ts`

```typescript
async uploadProduct(product: ShopifyProduct, inventoryQty: number = 20): Promise<UploadResult> {
  // ... crear producto ...

  // Configurar inventario
  if (createdProduct && createdProduct.variants && inventoryQty > 0) {
    await this.setInventoryLevels(client, createdProduct.variants, inventoryQty);
  }

  return { success: true, productId: createdProduct.id, variantIds };
}

private async setInventoryLevels(client: any, variants: any[], quantity: number): Promise<void> {
  const locationsResponse = await client.get({ path: 'locations' });
  const locations = locationsResponse.body.locations || [];

  if (locations.length === 0) return;

  const locationId = locations[0].id;

  for (const variant of variants) {
    if (variant.inventory_item_id) {
      await client.post({
        path: 'inventory_levels/set',
        data: {
          location_id: locationId,
          inventory_item_id: variant.inventory_item_id,
          available: quantity
        }
      });
    }
  }
}
```

**Beneficios**:
- ✅ Stock de 20 unidades automático
- ✅ Se configura inmediatamente después de crear el producto
- ✅ Manejo de errores para inventario

### 5. Flujo Modelo por Modelo

**Archivo**: `src/services/optimizedSync.ts`

```typescript
async syncModel(modelGroup: ModelGroup): Promise<SyncResult> {
  // 1. Transformar modelo completo
  const { padres, individuales } = this.transformer.transformModel(modelGroup);

  // 2. Subir producto PADRE
  const parentResult = await this.uploadParent(padres, marca, modelo);

  if (!parentResult.success) {
    // Si falla el padre, no continuar con individuales
    return result;
  }

  // 3. Delay entre padre e individuales
  await this.delay(2000);

  // 4. Subir productos INDIVIDUALES en batches
  const individualResults = await this.uploader.uploadBatch(individuales, 5, 1000);

  // 5. Retornar resultado completo del modelo
  return result;
}
```

**Beneficios**:
- ✅ Procesamiento modelo completo antes de pasar al siguiente
- ✅ Padre se sube primero, luego sus individuales
- ✅ Si falla el padre, no se intentan subir individuales
- ✅ Delays entre etapas
- ✅ Fácil rastrear errores por modelo

## 🎯 Nueva Arquitectura

```
┌─────────────────────────────────────────────────┐
│           OptimizedSyncService                  │
│  (Orquesta todo el flujo modelo por modelo)    │
└────────────┬────────────────────────────────────┘
             │
             ├─────────────────────────────────────┐
             │                                     │
             ▼                                     ▼
┌────────────────────────┐        ┌──────────────────────────┐
│ OptimizedTransformer   │        │  OptimizedUploader       │
│                        │        │                          │
│ • groupByModel()       │        │  • uploadProduct()       │
│ • transformModel()     │        │  • uploadBatch()         │
│ • createParentProduct()│        │  • setInventoryLevels()  │
│ • createIndividual...()│        │                          │
└────────┬───────────────┘        └───────────┬──────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌──────────────────────┐           ┌──────────────────────┐
│  handleGenerator     │           │   Shopify API        │
│                      │           │                      │
│ • sanitize()         │           │  • POST /products    │
│ • createParentHandle()│          │  • POST /inventory   │
│ • createIndividual...()│         │  • GET /locations    │
└──────────────────────┘           └──────────────────────┘
```

## 🚀 Scripts de Prueba

### 1. Test Optimizado (Recomendado)
```bash
npm run test:optimized
```

**Qué hace**:
- Selecciona el modelo con más variantes
- Sube 1 padre + todos sus individuales
- Usa el nuevo sistema optimizado
- Muestra resumen detallado

### 2. Test Antiguo (Referencia)
```bash
npm run test:one
```

**Qué hace**:
- Usa el sistema anterior (DataTransformerFinalService)
- Para comparación con el nuevo sistema

### 3. Sincronización Completa
```bash
npm run sync:all
```

**Qué hace**:
- Sincroniza TODOS los modelos del Sheet
- Procesamiento modelo por modelo
- Delays automáticos entre modelos
- Resumen completo al final

## 📊 Comparación: Antes vs Después

| Aspecto | Antes ❌ | Después ✅ |
|---------|---------|-----------|
| **Handles** | Inconsistentes | Centralizados con SKU |
| **Descripción** | Falla con espacios/acentos | Normalización Unicode |
| **Variantes Padre** | Solo 1 variante (API) | Todas las variantes (API con inventario) |
| **Individuales** | 0 encontrados | Todos encontrados correctamente |
| **Rate Limits** | Sin protección | Batches + Delays |
| **Inventario** | Manual después | Automático en creación |
| **Orden Subida** | Todos padres, todos indiv. | Modelo completo por vez |
| **Trazabilidad** | Difícil rastrear errores | Fácil: modelo por modelo |

## 🎓 Estructura de Datos

### ModelGroup
```typescript
interface ModelGroup {
  marca: string;      // "Michelin"
  modelo: string;     // "PILOT SPORT 4 S"
  variants: PanelPreciosRow[];  // Todas las medidas de ese modelo
}
```

### SyncResult
```typescript
interface SyncResult {
  modelo: string;                // "Michelin PILOT SPORT 4 S"
  parentSuccess: boolean;        // ¿Se creó el padre?
  parentProductId?: string;      // ID del producto padre en Shopify
  parentVariantCount?: number;   // Cantidad de variantes creadas
  individualsSuccess: number;    // Cantidad de individuales creados
  individualsFailed: number;     // Cantidad de individuales fallidos
  errors: string[];              // Lista de errores
}
```

## 🔄 Flujo Completo

```
1. GoogleSheetsService.readAllData()
   └─> PanelPreciosRow[]

2. OptimizedTransformer.groupByModel()
   └─> ModelGroup[]

3. Para cada ModelGroup:

   a. OptimizedTransformer.transformModel()
      └─> { padres: ShopifyProduct[], individuales: ShopifyProduct[] }

   b. OptimizedUploader.uploadProduct(padre)
      └─> UploadResult con productId y variantIds

   c. OptimizedUploader.setInventoryLevels(20 unidades)

   d. DELAY 2 segundos

   e. OptimizedUploader.uploadBatch(individuales, batchSize=5, delay=1000)
      └─> UploadResult[] con resultados de cada individual

   f. SyncResult con resumen completo del modelo

4. Resumen final con todos los SyncResult[]
```

## 🎯 Próximos Pasos

1. ✅ **Ejecutar test optimizado**: `npm run test:optimized`
2. ✅ **Verificar en Shopify**: Que padre tenga todas las variantes
3. ✅ **Verificar individuales**: Que se hayan creado correctamente
4. ✅ **Verificar inventario**: Que todos tengan 20 unidades
5. 🔄 **Si todo OK**: Ejecutar `npm run sync:all` para catálogo completo

## 📝 Notas Importantes

### Limitación API de Shopify
Actualmente, `POST /products` solo crea 1 variante. Para crear productos padre con TODAS las variantes, hay 2 opciones:

**Opción A (Actual)**: Crear padre con 1 variante via API
- ✅ Más simple
- ❌ Solo 1 variante en el padre

**Opción B (Futura)**: Usar Shopify CSV Import API
- ✅ Todas las variantes en el padre
- ❌ Requiere autenticación adicional y CSV upload

El sistema está diseñado para cambiar fácilmente entre ambas estrategias.

### Rate Limits de Shopify
- REST API: 2 requests/segundo (40 burst)
- Batch de 5 productos con delay de 1 segundo es seguro
- Para catálogos grandes (>100 productos), considerar aumentar delays

### Inventario
- Se configura en 20 unidades automáticamente
- Se puede cambiar el valor por defecto en `uploadProduct(product, inventoryQty)`
- Usa la primera location disponible en la tienda

## 🐛 Debug

Para debug detallado:
```typescript
// En optimizedSync.ts, descomentar:
console.log('Debug - Padre rows:', padres);
console.log('Debug - Individuales:', individuales);
console.log('Debug - Parent result:', parentResult);
```

## 📚 Referencias

- [Shopify Admin REST API](https://shopify.dev/docs/api/admin-rest)
- [Shopify Product API](https://shopify.dev/docs/api/admin-rest/latest/resources/product)
- [Shopify Inventory API](https://shopify.dev/docs/api/admin-rest/latest/resources/inventorylevel)
- [Rate Limits](https://shopify.dev/docs/api/usage/rate-limits)
