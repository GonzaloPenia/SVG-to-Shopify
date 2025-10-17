# Estructura de Datos del Google Sheet

Este documento explica la estructura de las hojas del Google Sheet y cómo se procesan.

## Google Sheet ID
```
1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
```

## Hoja 1: Panel_Precios

Esta hoja contiene los **precios e inventario actualizados** de los productos.

### Columnas:
1. **SKU/CAI** - Código único del producto
2. **Marca** - Fabricante del neumático (ej: Michelin, BFGoodrich)
3. **Modelo** - Modelo específico (ej: PILOT SPORT 4)
4. **Medida** - Medida del neumático (ej: 205/40 ZR18 XL)
5. **Descripción** - Descripción completa del producto
6. **Precio con IVA** - Precio final con impuestos
7. **Precio sin IVA** - Precio base sin impuestos
8. **Cantidad en stock** - Inventario disponible
9. **Estado** - Estado del producto (Active, Draft, etc.)
10. **Tag** - Etiquetas del producto
11. **Handle** - Identificador único para Shopify (clave de vinculación)
12. **Title** - Título del producto
13. **Shopify Product ID** - ID interno de Shopify
14. **Shopify Variant ID** - ID de variante en Shopify
15. **UpdatedAt** - Fecha de última actualización
16. **Sync Status** - Estado de sincronización
17. **Variant Title** - Título de la variante
18. **Option Name** - Nombre de la opción
19. **Option Value Name** - Valor de la opción
20. **IMG Url** - URL de la imagen del producto

### Ejemplo de datos:
| SKU | Marca | Modelo | Medida | Precio IVA | Precio sin IVA | Stock | Handle |
|-----|-------|--------|--------|-----------|----------------|-------|--------|
| 208195 | Michelin | PILOT SPORT 4 | 205/40 ZR18 XL | 197471 | 163364 | 30 | michelin-pilot-sport-4-205-40-zr18-xl |

### Propósito:
Esta hoja es la **fuente de verdad** para precios e inventario. Se actualiza frecuentemente con datos del sistema de gestión de inventario.

---

## Hoja 2: Padres

Esta hoja contiene la **estructura completa de productos** en formato Shopify CSV.

### Columnas (47 total):

#### Información básica del producto:
1. **Handle** - Identificador único (ej: `michelin-pilot-sport-4`)
2. **Title** - Título completo del producto
3. **Body (HTML)** - Descripción en HTML
4. **Vendor** - Proveedor/Marca
5. **Product Category** - Categoría del producto
6. **Type** - Tipo de producto
7. **Tags** - Etiquetas separadas por comas
8. **Published** - Si está publicado (TRUE/FALSE)

#### Opciones de variantes:
9. **Option1 Name** - Nombre de opción 1 (ej: "Medida")
10. **Option1 Value** - Valor de opción 1 (ej: "205/40 ZR18")
11. **Option1 Linked To** - Vinculación de opción
12. **Option2 Name** - Nombre de opción 2
13. **Option2 Value** - Valor de opción 2
14. **Option2 Linked To** - Vinculación de opción 2
15. **Option3 Name** - Nombre de opción 3
16. **Option3 Value** - Valor de opción 3
17. **Option3 Linked To** - Vinculación de opción 3

#### Información de variante:
18. **Variant SKU** - SKU de la variante
19. **Variant Grams** - Peso en gramos
20. **Variant Inventory Tracker** - Sistema de inventario (shopify)
21. **Variant Inventory Qty** - Cantidad en inventario
22. **Variant Inventory Policy** - Política de inventario (deny/continue)
23. **Variant Fulfillment Service** - Servicio de cumplimiento (manual)
24. **Variant Price** - Precio de venta
25. **Variant Compare At Price** - Precio de comparación (antes)
26. **Variant Requires Shipping** - Requiere envío (TRUE/FALSE)
27. **Variant Taxable** - Es gravable (TRUE/FALSE)
28. **Variant Barcode** - Código de barras

#### Imágenes:
29. **Image Src** - URL de la imagen principal
30. **Image Position** - Posición de la imagen
31. **Image Alt Text** - Texto alternativo
32. **Variant Image** - Imagen específica de variante

#### SEO:
33. **SEO Title** - Título para SEO
34. **SEO Description** - Descripción para SEO

#### Google Shopping:
35. **Google Shopping / Google Product Category**
36. **Google Shopping / Gender**
37. **Google Shopping / Age Group**
38. **Google Shopping / MPN**
39. **Google Shopping / AdWords Grouping**
40. **Google Shopping / AdWords Labels**
41. **Google Shopping / Condition**
42. **Google Shopping / Custom Product**
43. **Google Shopping / Custom Label 0-4** (5 campos)

#### Metafields de Shopify:
- **Color** (product.metafields.shopify.color-pattern)
- **Estado del artículo** (product.metafields.shopify.item-condition)
- **Material del artículo** (product.metafields.shopify.item-material)
- **Tipo de fabricante** (product.metafields.shopify.manufacturer-type)
- **Diseño de llanta/rueda** (product.metafields.shopify.rim-wheel-design)
- **Características de conducción** (product.metafields.shopify.vehicle-drive-handling-features)
- **Tipo de neumático** (product.metafields.shopify.vehicle-tire-type)

#### Otros:
44. **Gift Card** - Es tarjeta de regalo (FALSE)
45. **Variant Weight Unit** - Unidad de peso (kg/lb)
46. **Variant Tax Code** - Código de impuestos
47. **Cost per item** - Costo por unidad
48. **Status** - Estado (active/draft/archived)

### Propósito:
Esta hoja actúa como **plantilla base** con toda la información de productos. Se actualiza manualmente cuando se añaden nuevos productos o se cambian descripciones, imágenes, etc.

---

## Lógica de Sincronización

### Flujo de datos:

```
┌─────────────────────┐
│  Panel_Precios      │  ← Actualizado frecuentemente (precios, stock)
│  (Fuente de precios)│
└──────────┬──────────┘
           │
           │ Handle (clave)
           ▼
┌─────────────────────┐
│  Padres             │  ← Actualizado manualmente (info completa)
│  (Plantilla base)   │
└──────────┬──────────┘
           │
           │ Merge
           ▼
┌─────────────────────┐
│  CSV Shopify        │  ← Output final para importar
│  o API Upload       │
└─────────────────────┘
```

### Proceso:

1. **Leer Padres**: Se obtiene la estructura completa del producto
2. **Buscar en Panel_Precios**: Se busca el producto por `Handle`
3. **Actualizar precios**: Si existe en Panel_Precios, se actualizan:
   - `Variant Price` → **Precio con IVA** (precio de venta final)
   - `Variant Compare At Price` → Mantiene de Padres (precio tachado/antes)
   - `Cost per item` → **Precio con IVA**
   - `Status` → `Estado`
4. **Mantener original**: Si NO existe en Panel_Precios, se mantienen los valores de Padres

### Campo clave: Handle

El **Handle** es el campo que vincula ambas hojas. Debe ser:
- Único por producto
- Consistente entre ambas hojas
- Formato: minúsculas, separado por guiones (ej: `michelin-pilot-sport-4-205-40-zr18-xl`)

### Columnas actualizadas desde Panel_Precios:

| Campo Shopify | Columna en Panel_Precios | Descripción |
|---------------|--------------------------|-------------|
| Variant Price | Precio con IVA | Precio de venta final (con IVA incluido) |
| Variant Compare At Price | (mantiene de Padres) | Precio tachado/antes - se configura en Padres |
| Cost per item | Precio con IVA | Costo del producto (con IVA) |
| Status | Estado | Estado del producto (active/draft) |

**Nota:** Shopify siempre trabaja con precios con IVA incluido. El "Precio sin IVA" de Panel_Precios es solo informativo y no se usa en Shopify.

### Columnas que se mantienen de Padres:

Todas las demás columnas (título, descripción, imágenes, SEO, metafields, etc.) se mantienen desde la hoja **Padres**.

---

## Flujos de trabajo recomendados

### Actualización diaria de precios:
```bash
npm run sync prices-only
```
- Lee Panel_Precios
- Actualiza solo precios en Shopify
- Rápido y seguro

### Importación completa de productos:
```bash
npm run sync csv
```
- Genera CSV con toda la información
- Importar manualmente en Shopify Admin
- Recomendado para primera carga o cambios grandes

### Sincronización automática:
```bash
npm run sync upload
```
- Sube productos completos vía API
- Actualiza productos existentes
- Útil para automatización

---

## Notas importantes

1. **Handle debe coincidir**: Asegúrate de que los handles sean idénticos en ambas hojas
2. **Formato de precios**: Los precios deben ser numéricos (sin símbolos de moneda)
3. **Estado activo**: Solo productos con `Status: active` se mostrarán en la tienda
4. **Imágenes**: Las URLs de imágenes deben ser accesibles públicamente
5. **Backup**: Siempre exporta tus productos de Shopify antes de actualizaciones masivas

---

## Ejemplo de vinculación

### Panel_Precios:
```csv
Handle,Precio sin IVA,Precio con IVA,Estado
michelin-pilot-sport-4-205-40-zr18-xl,163364,197471,Active
```

### Padres:
```csv
Handle,Title,Vendor,Variant Price,Variant Compare At Price
michelin-pilot-sport-4-205-40-zr18-xl,Michelin Pilot Sport 4 205/40 ZR18 XL,Michelin,0,220000
```

### Resultado (CSV generado):
```csv
Handle,Title,Vendor,Variant Price,Variant Compare At Price,Status
michelin-pilot-sport-4-205-40-zr18-xl,Michelin Pilot Sport 4 205/40 ZR18 XL,Michelin,197471,220000,active
```

**Explicación:**
- `Variant Price` (197471) = Precio de venta con IVA desde **Panel_Precios**
- `Variant Compare At Price` (220000) = Precio tachado/antes desde **Padres** (para mostrar descuento)
- `Title`, `Vendor` = Se mantienen de **Padres**
- `Status` = Se actualiza desde **Panel_Precios**

En la tienda se mostrará: ~~$220.000~~ **$197.471** (ahorro de $22.529)
