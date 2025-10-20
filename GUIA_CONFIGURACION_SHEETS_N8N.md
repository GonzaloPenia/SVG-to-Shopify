# 🔧 Guía de Configuración: Google Sheets + n8n

## 🚨 Problemas Detectados en tu Configuración

He analizado tu workflow de n8n y he identificado varios problemas críticos. Aquí está la solución paso a paso.

---

## ❌ Problema 1: Desajuste de Columnas

### Error Detectado

El workflow de n8n está mapeando estos campos desde Shopify:

```javascript
// Campos que transforma el workflow:
- id (product ID)
- variant_id
- title
- body_html
- vendor
- product_type
- handle
- tags
- status
- variant_price
- variant_sku
- variant_compare_at_price
- variant_option1/2/3
- image_src
- tipo
- marca
- modelo
```

**PERO** el nodo "📝 Escribir en Google Sheets" espera estas columnas:

```
ID Producto, ID Variante, Handle, SKU, Tipo, Título, Marca, Modelo,
Descripción, Precio, Precio Comparación, Stock, # Variantes, Estado,
Categoría, Proveedor, URL Imagen, Última Sync, Modificado, Sincronizar
```

### ✅ Solución

Los campos transformados NO coinciden con las columnas del Sheet. Necesitamos corregir el código de transformación.

---

## ❌ Problema 2: Código de Transformación Incompleto

El código actual en el nodo "🔄 Transformar a Formato Sheets" (línea 77-88) transforma a formato incorrecto.

### ✅ Código Correcto

Reemplaza el código en el nodo **"🔄 Transformar a Formato Sheets"** con:

```javascript
// === Transform Shopify products to Google Sheets format ===

// Asegurar que el input sea un array de items
const inputData = $input.all();

// Recopilar todos los productos desde todos los items previos
const allProducts = inputData.flatMap(item => item.json.products || []);

// Transformar cada producto al formato del Sheet
const transformed = allProducts.flatMap(product => {
  // Procesar cada variante como una fila independiente
  return (product.variants || []).map(variant => {
    // --- Determinar tipo según handle ---
    const handle = product.handle || '';
    const isPadre = handle.endsWith('-p');
    const isIndividual = handle.endsWith('-i');
    const tipo = isPadre ? 'PADRE' : (isIndividual ? 'INDIVIDUAL' : 'OTRO');

    // --- Extraer marca del vendor ---
    const marca = product.vendor || '';

    // --- Extraer modelo del product_type ---
    const modelo = product.product_type || '';

    // --- Estado mapeado ---
    const estadoMap = {
      'active': 'ACTIVO',
      'draft': 'INACTIVO',
      'archived': 'INACTIVO'
    };
    const estado = estadoMap[product.status] || 'OTRO';

    // --- Contar número de variantes ---
    const numVariantes = product.variants ? product.variants.length : 1;

    // --- Mapear a estructura del Sheet ---
    return {
      json: {
        // Columnas en orden del Sheet
        'id': String(product.id || ''),
        'variant_id': String(variant.id || ''),
        'handle': handle,
        'sku': variant.sku || '',
        'tipo': tipo,
        'title': product.title || '',
        'marca': marca,
        'modelo': modelo,
        'body_html': (product.body_html || '').replace(/<[^>]*>/g, '').substring(0, 200), // Sin HTML, max 200 chars
        'variant_price': variant.price || '0',
        'variant_compare_at_price': variant.compare_at_price || '',
        'variant_inventory_quantity': variant.inventory_quantity || 0,
        'num_variantes': numVariantes,
        'status': estado,
        'product_type': producto.product_type || 'Neumáticos', // Categoría
        'vendor': product.vendor || '',
        'image_src': product.image?.src || (product.images && product.images[0]?.src) || '',
        'updated_at': new Date().toLocaleString('es-AR'),
        'modificado': 'NO',
        'sincronizar': 'NO'
      }
    };
  });
});

return transformed;
```

---

## ❌ Problema 3: Mapeo Incorrecto en "📝 Escribir en Google Sheets"

### Error Detectado

El nodo tiene configurado el mapeo manual pero solo mapea "ID Variante". Necesita mapear TODOS los campos.

### ✅ Solución

En n8n, nodo **"📝 Escribir en Google Sheets"**:

1. **Operation**: Cambiar a `Append or Update`
2. **Mapping Mode**: Seleccionar `Map Each Column Manually`
3. **Matching Columns**: Usar `ID Variante` (para identificar filas existentes)

**Configurar mapeo completo**:

| Columna del Sheet | Campo del Input | Expresión n8n |
|-------------------|-----------------|---------------|
| ID Producto | id | `={{ $json.id }}` |
| ID Variante | variant_id | `={{ $json.variant_id }}` |
| Handle | handle | `={{ $json.handle }}` |
| SKU | sku | `={{ $json.sku }}` |
| Tipo | tipo | `={{ $json.tipo }}` |
| Título | title | `={{ $json.title }}` |
| Marca | marca | `={{ $json.marca }}` |
| Modelo | modelo | `={{ $json.modelo }}` |
| Descripción | body_html | `={{ $json.body_html }}` |
| Precio | variant_price | `={{ $json.variant_price }}` |
| Precio Comparación | variant_compare_at_price | `={{ $json.variant_compare_at_price }}` |
| Stock | variant_inventory_quantity | `={{ $json.variant_inventory_quantity }}` |
| # Variantes | num_variantes | `={{ $json.num_variantes }}` |
| Estado | status | `={{ $json.status }}` |
| Categoría | product_type | `={{ $json.product_type }}` |
| Proveedor | vendor | `={{ $json.vendor }}` |
| URL Imagen | image_src | `={{ $json.image_src }}` |
| Última Sync | updated_at | `={{ $json.updated_at }}` |
| Modificado | modificado | `={{ $json.modificado }}` |
| Sincronizar | sincronizar | `={{ $json.sincronizar }}` |

---

## ❌ Problema 4: Estructura del Google Sheet

### ✅ Headers Requeridos (Fila 1)

Tu Google Sheet **DEBE** tener estos headers EXACTOS en la fila 1:

```
A: ID Producto
B: ID Variante
C: Handle
D: SKU
E: Tipo
F: Título
G: Marca
H: Modelo
I: Descripción
J: Precio
K: Precio Comparación
L: Stock
M: # Variantes
N: Estado
O: Categoría
P: Proveedor
Q: URL Imagen
R: Última Sync
S: Modificado
T: Sincronizar
```

### Verificar tu Sheet

1. Abre: https://docs.google.com/spreadsheets/d/1Hv1rQgQfbg6xKBpcfdTtEopZU9K3bkG5XQwePzz49y4
2. Ve a la hoja **"BYTE_Panel_Productos"** (GID: 1258877334)
3. Verifica que la fila 1 tenga EXACTAMENTE esos headers
4. Si faltan o están en otro orden, corrígelo

---

## ❌ Problema 5: Nodo "📖 Leer Productos Modificados"

### Error Detectado

El nodo lee de la hoja correcta pero luego filtra por `sincronizar = "SÍ"`.

Sin embargo, el campo escrito es `sincronizar = "NO"`.

### ✅ Solución

**Opción A: Cambiar lógica de marcado**

En Google Sheets, cuando el usuario edite un producto, debe cambiar **manualmente** la columna "Sincronizar" de `NO` a `SÍ`.

**Opción B: Usar Google Apps Script (RECOMENDADO)**

Instalar el script para que automáticamente marque `sincronizar = SÍ` cuando se edite un campo.

Ver archivo: `google-apps-script-panel.gs`

---

## ❌ Problema 6: Actualización a Shopify (Sheets → Shopify)

### Errores Detectados

Los nodos de actualización hacen referencia a campos que NO existen:

```javascript
// Nodo "⬆️ Actualizar Producto Shopify" (línea 394):
"title": "{{ $json.titulo }}"  // ❌ Campo incorrecto
"body_html": "{{ $json.descripcionCorta }}"  // ❌ Campo incorrecto

// Nodo "⬆️ Actualizar Variante Shopify" (línea 429):
"price": "{{ $json.precio }}"  // ❌ Campo incorrecto
"compare_at_price": {{ $json.precioComparacion }}  // ❌ Campo incorrecto
"inventory_quantity": {{ $json.stock }}  // ❌ Campo incorrecto
```

### ✅ Solución

**Nodo "⬆️ Actualizar Producto Shopify"**:

Reemplazar JSON Body con:

```json
{
  "product": {
    "id": {{ $json['ID Producto'] }},
    "title": "{{ $json['Título'] }}",
    "body_html": "{{ $json['Descripción'] }}",
    "status": "{{ $json['Estado'] === 'ACTIVO' ? 'active' : 'draft' }}"
  }
}
```

**Nodo "⬆️ Actualizar Variante Shopify"**:

Reemplazar JSON Body con:

```json
{
  "variant": {
    "id": {{ $json['ID Variante'] }},
    "price": "{{ $json['Precio'] }}",
    "compare_at_price": {{ $json['Precio Comparación'] ? '"' + $json['Precio Comparación'] + '"' : 'null' }},
    "inventory_quantity": {{ $json['Stock'] }}
  }
}
```

**⚠️ IMPORTANTE**: Los nombres de columnas con espacios deben usarse con corchetes: `$json['ID Producto']`

---

## ❌ Problema 7: Nodo "🔄 Resetear Flags" Incorrecto

### Error Detectado

El nodo intenta usar una variable de entorno que no existe:

```javascript
"documentId": "={{ $env.CONTROL_PANEL_SHEET_ID }}"  // ❌ Variable no definida
```

### ✅ Solución

Reemplazar con el ID directo:

```json
{
  "documentId": {
    "__rl": true,
    "value": "1Hv1rQgQfbg6xKBpcfdTtEopZU9K3bkG5XQwePzz49y4",
    "mode": "id"
  }
}
```

---

## 📋 Plan de Acción Paso a Paso

### Paso 1: Corregir Google Sheet

1. Abre el Sheet: https://docs.google.com/spreadsheets/d/1Hv1rQgQfbg6xKBpcfdTtEopZU9K3bkG5XQwePzz49y4
2. Ve a la hoja **"BYTE_Panel_Productos"**
3. Verifica que la fila 1 tenga los 20 headers exactos (listados arriba)
4. Si faltan columnas, agrégalas
5. Si están en otro orden, reordénalas

### Paso 2: Corregir Workflow n8n (Shopify → Sheets)

1. Abre n8n
2. Abre el workflow: **"🎛️ BYTE - Panel de Control Shopify (Bidireccional)"**
3. Edita el nodo: **"🔄 Transformar a Formato Sheets"**
4. Reemplaza el código completo con el código corregido (ver Problema 2)
5. Guarda

### Paso 3: Corregir Mapeo en "📝 Escribir en Google Sheets"

1. Edita el nodo: **"📝 Escribir en Google Sheets"**
2. En **Columns**, selecciona **"Map Each Column Manually"**
3. Configura los 20 mapeos (ver Problema 3)
4. En **Matching Columns**, selecciona: `ID Variante`
5. Guarda

### Paso 4: Corregir Workflow n8n (Sheets → Shopify)

1. Edita el nodo: **"⬆️ Actualizar Producto Shopify"**
2. Reemplaza el JSON Body (ver Problema 6)
3. Guarda

4. Edita el nodo: **"⬆️ Actualizar Variante Shopify"**
5. Reemplaza el JSON Body (ver Problema 6)
6. Guarda

### Paso 5: Corregir Nodo "🔄 Resetear Flags"

1. Edita el nodo: **"🔄 Resetear Flags"**
2. En **Document ID**, cambia de variable a ID directo
3. Pega: `1Hv1rQgQfbg6xKBpcfdTtEopZU9K3bkG5XQwePzz49y4`
4. Guarda

### Paso 6: Test Inicial (Shopify → Sheets)

1. En n8n, desactiva la rama "Sheets → Shopify" temporalmente
   - Click derecho en el nodo "📖 Leer Productos Modificados" → Disable
2. Click en **"Execute Workflow"** manualmente
3. Verifica que los productos se escriban en Google Sheets
4. Revisa que todas las columnas tengan datos

### Paso 7: Test de Sincronización (Sheets → Shopify)

1. Re-activa el nodo "📖 Leer Productos Modificados"
2. En Google Sheets, edita un producto:
   - Cambia el título
   - Cambia la columna "Sincronizar" de `NO` a `SÍ`
3. Ejecuta el workflow manualmente
4. Verifica en Shopify que el producto se actualizó
5. Verifica en Sheets que "Sincronizar" volvió a `NO`

### Paso 8: Activar Automatización

1. Si todo funciona correctamente, activa el workflow
2. Toggle **"Active"** en la parte superior
3. El workflow se ejecutará cada 15 minutos automáticamente

---

## 🔍 Verificación Final

### Checklist

- [ ] Google Sheet tiene 20 columnas con nombres exactos
- [ ] Hoja se llama **"BYTE_Panel_Productos"**
- [ ] Código de transformación actualizado
- [ ] Mapeo de 20 columnas configurado en nodo "Escribir"
- [ ] JSON de actualización de producto corregido
- [ ] JSON de actualización de variante corregido
- [ ] Nodo "Resetear Flags" usa ID directo
- [ ] Test Shopify → Sheets funciona
- [ ] Test Sheets → Shopify funciona
- [ ] Workflow activado

---

## 📊 Estructura Visual del Flujo

```
⏰ Trigger (15 min)
    ├─→ 📦 Fetch Shopify Products
    │       ↓
    │   🔄 Transform to Sheets Format (CORREGIR CÓDIGO)
    │       ↓
    │   ⏳ Wait 2 sec
    │       ↓
    │   📝 Append/Update Sheet (CORREGIR MAPEO)
    │       ↓
    │   📝 Write to Sheet
    │
    └─→ 📖 Read Modified Products
            ↓
        🔍 Filter (sincronizar = "SÍ")
            ↓
        ⬆️ Update Product (CORREGIR JSON)
            ↓
        ⬆️ Update Variant (CORREGIR JSON)
            ↓
        ✅ Process Result
            ↓
        🔄 Reset Flags (CORREGIR ID)
```

---

## 🆘 Problemas Comunes Después de Corregir

### Error: "Column not found"

**Causa**: Los headers del Sheet no coinciden exactamente

**Solución**: Verifica mayúsculas, acentos y espacios en los headers

### Error: "Cannot read property of undefined"

**Causa**: El mapeo de campos está mal

**Solución**: Verifica que usas `$json['Nombre Columna']` (con corchetes y comillas)

### Productos no se actualizan en Shopify

**Causa**: El filtro de "Sincronizar = SÍ" no encuentra productos

**Solución**:
1. Verifica que la columna "Sincronizar" existe
2. Verifica que pusiste exactamente `SÍ` (con acento)
3. Prueba cambiar el filtro a `=== "SI"` (sin acento) si usas teclado US

### Datos se duplican en el Sheet

**Causa**: El matching column (ID Variante) no funciona

**Solución**: Verifica que "ID Variante" está como matching column en la configuración

---

## 📞 Soporte BYTE

Si sigues teniendo problemas después de aplicar todas las correcciones:

📧 **Email**: contacto@byte.com.ar
📱 **WhatsApp**: +54 9 11 XXXX-XXXX

Incluye:
- Captura de pantalla del error en n8n
- Captura de los headers de tu Google Sheet
- Logs de ejecución del workflow

---

<div align="center">

![BYTE Logo](src/media/Byte.png)

**BYTE - Soluciones Tecnológicas a Medida**

*Impulsamos tu negocio con tecnología* 🚀

</div>
