# 📕 BYTE Panel - Manual Técnico

## Documentación para Desarrolladores y Administradores de Sistemas

![BYTE Logo](../src/media/Byte.png)

---

## 📋 Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [n8n Workflows](#n8n-workflows)
3. [Google Apps Script](#google-apps-script)
4. [Shopify Admin API](#shopify-admin-api)
5. [Estructura de Datos](#estructura-de-datos)
6. [Flujos de Sincronización](#flujos-de-sincronización)
7. [Gestión de Errores](#gestión-de-errores)
8. [Seguridad](#seguridad)
9. [Performance y Optimización](#performance-y-optimización)
10. [Deployment y Configuración](#deployment-y-configuración)
11. [Monitoring y Logs](#monitoring-y-logs)
12. [Troubleshooting Avanzado](#troubleshooting-avanzado)

---

## 🏗️ Arquitectura del Sistema

### Diagrama de Componentes

```
┌──────────────────────────────────────────────────────────────┐
│                    BYTE PANEL ARCHITECTURE                   │
└──────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  Google Sheets  │◄────────┤   Google Apps   │
│   (Frontend)    │         │     Script      │
│                 │         │   (Logic)       │
└────────┬────────┘         └─────────────────┘
         │                           │
         │                           │
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│              n8n Workflows                   │
│  ┌──────────┐          ┌──────────┐         │
│  │ Schedule │──────────│Transform │         │
│  │ Trigger  │          │  Data    │         │
│  └──────────┘          └──────────┘         │
│                                              │
│  ┌──────────┐          ┌──────────┐         │
│  │  Redis   │          │   HTTP   │         │
│  │  Cache   │          │ Requests │         │
│  └──────────┘          └──────────┘         │
└──────────────┬──────────────┬───────────────┘
               │              │
               │              │
               ▼              ▼
     ┌─────────────────────────────┐
     │   Shopify Admin REST API    │
     │                             │
     │  ┌──────────────────────┐   │
     │  │  Products            │   │
     │  │  Variants            │   │
     │  │  Inventory           │   │
     │  └──────────────────────┘   │
     └─────────────────────────────┘
```

### Stack Tecnológico

| Layer | Tecnología | Versión | Licencia |
|-------|------------|---------|----------|
| **Frontend** | Google Sheets | Latest | Gratis |
| **Business Logic** | Google Apps Script | V8 Runtime | Gratis |
| **Orchestration** | n8n | 1.0+ | Fair-code (gratis self-hosted) |
| **Cache** | Redis (n8n) | 7.0+ | BSD (gratis) |
| **Backend API** | Shopify Admin REST API | 2024-01 | Incluido en plan Shopify |
| **Data Format** | JSON | - | Open Standard |
| **Protocol** | HTTPS/REST | - | Standard |

### Flujo de Datos

**Shopify → Google Sheets** (READ):
```
1. n8n Schedule Trigger (cada 15 min)
2. HTTP Request → GET /products.json (Shopify)
3. Pagination loop (max 250 productos/request)
4. Transform JSON → Google Sheets format
5. Clear existing data in Google Sheets
6. Write transformed data to Google Sheets
```

**Google Sheets → Shopify** (WRITE):
```
1. n8n Schedule Trigger (cada 15 min)
2. Read Google Sheets → Get all rows
3. Filter rows where "Modificado" = TRUE
4. For each modified row:
   a. Transform to Shopify format
   b. HTTP Request → PUT /products/{id}.json
   c. Delay 600ms (rate limiting)
   d. Update "Modificado" to FALSE
5. Summary report
```

---

## 🔄 n8n Workflows

### Workflow 1: Control Panel Sync

**Archivo**: `n8n-workflow-control-panel.json`

**Trigger**: Schedule (cron: every 15 minutes)

**Nodes**:

1. **⏰ Trigger Schedule**
   - Type: Schedule
   - Interval: 15 minutes
   - Description: Ejecuta el workflow cada 15 min

2. **📥 Fetch Shopify Products**
   - Type: HTTP Request
   - Method: GET
   - URL: `https://{{$env.SHOPIFY_SHOP_DOMAIN}}/admin/api/2024-01/products.json?limit=250`
   - Authentication: Header
   - Headers:
     ```json
     {
       "X-Shopify-Access-Token": "{{$env.SHOPIFY_ACCESS_TOKEN}}"
     }
     ```
   - Pagination:
     - Type: Next page from response
     - Field: `link` header (rel="next")

3. **🔄 Transform to Sheets Format**
   - Type: Code (JavaScript)
   - Input: Shopify products JSON
   - Output: Array of rows for Google Sheets
   - Code:
     ```javascript
     const products = [];

     for (const product of $input.all()) {
       const item = product.json;

       for (const variant of item.variants || []) {
         const handle = item.handle || '';
         const isPadre = handle.endsWith('-p');
         const isIndividual = handle.endsWith('-i');
         const tipo = isPadre ? 'PADRE' : (isIndividual ? 'INDIVIDUAL' : 'OTRO');

         products.push({
           productId: item.id,
           variantId: variant.id,
           handle: handle,
           sku: variant.sku || '',
           tipo: tipo,
           titulo: item.title,
           descripcion: item.body_html || '',
           marca: item.vendor || '',
           modelo: item.product_type || '',
           precio: parseFloat(variant.price || 0),
           compareAt: parseFloat(variant.compare_at_price || 0),
           stock: variant.inventory_quantity || 0,
           vendor: item.vendor || '',
           estado: item.status === 'active' ? 'ACTIVO' : 'INACTIVO',
           modificado: false,
           lastSync: new Date().toISOString()
         });
       }
     }

     return products.map(p => ({ json: p }));
     ```

4. **📊 Clear Google Sheets**
   - Type: Google Sheets
   - Operation: Clear
   - Sheet: Productos
   - Range: A2:Z (mantiene headers)

5. **📝 Write to Google Sheets**
   - Type: Google Sheets
   - Operation: Append
   - Sheet: Productos
   - Mapping:
     - Column A → productId
     - Column B → variantId
     - Column C → handle
     - ... (según estructura)

6. **📤 Read Modified from Sheets**
   - Type: Google Sheets
   - Operation: Read
   - Sheet: Productos
   - Filter: `Modificado = TRUE`

7. **🔄 Transform to Shopify Format**
   - Type: Code (JavaScript)
   - Input: Modified rows
   - Output: Shopify PUT requests
   - Code:
     ```javascript
     const updates = [];

     for (const row of $input.all()) {
       const data = row.json;

       updates.push({
         productId: data.productId,
         variantId: data.variantId,
         body: {
           variant: {
             id: data.variantId,
             price: String(data.precio),
             compare_at_price: data.compareAt > 0 ? String(data.compareAt) : null,
             inventory_quantity: parseInt(data.stock)
           },
           product: {
             id: data.productId,
             title: data.titulo,
             body_html: data.descripcion,
             status: data.estado === 'ACTIVO' ? 'active' : 'draft'
           }
         }
       });
     }

     return updates.map(u => ({ json: u }));
     ```

8. **⏱️ Rate Limit Delay**
   - Type: Wait
   - Amount: 600ms
   - Description: Previene Shopify rate limiting

9. **🔄 Update Shopify Product**
   - Type: HTTP Request
   - Method: PUT
   - URL: `https://{{$env.SHOPIFY_SHOP_DOMAIN}}/admin/api/2024-01/products/{{$json.productId}}.json`
   - Authentication: Header
   - Headers:
     ```json
     {
       "X-Shopify-Access-Token": "{{$env.SHOPIFY_ACCESS_TOKEN}}",
       "Content-Type": "application/json"
     }
     ```
   - Body: `{{$json.body}}`

10. **✅ Mark as Synced**
    - Type: Google Sheets
    - Operation: Update
    - Sheet: Productos
    - Find by: productId
    - Set: `Modificado = FALSE`

11. **📊 Summary**
    - Type: Code
    - Generate summary report
    - Log statistics

**Error Handling**:
- Try/Catch en cada HTTP Request
- Retry on 429 (rate limit): 3 attempts, exponential backoff
- Retry on 5xx: 2 attempts
- Continue on error (no detener todo el workflow)

---

### Workflow 2: Change Detection Sync

**Archivo**: `n8n-workflow-shopify-sync.json`

**Diferencias con Workflow 1**:
- Usa Redis para cache
- Hash-based change detection
- Solo actualiza productos modificados
- Más eficiente para actualizaciones frecuentes

**Nodes adicionales**:

1. **Redis Get Hash**
   - Type: Redis
   - Operation: GET
   - Key: `shopify:products:hash`

2. **Compute Hash**
   - Type: Code
   - Compute MD5/SHA256 hash of product data

3. **Compare Hashes**
   - Type: IF
   - Condition: `current_hash !== stored_hash`
   - True: Update Shopify
   - False: Skip

4. **Redis Set Hash**
   - Type: Redis
   - Operation: SET
   - Key: `shopify:products:hash`
   - Value: `{{$json.hash}}`

---

## 📜 Google Apps Script

### Archivo Principal

**Nombre**: `google-apps-script-panel.gs`

**Despliegue**: Extensiones → Apps Script → Copiar código → Guardar

### Configuración Global

```javascript
const CONFIG = {
  // Nombres de hojas
  SHEET_NAMES: {
    PRODUCTOS: 'Productos',
    DASHBOARD: 'Dashboard',
    HISTORIAL: 'Historial',
    AYUDA: 'Ayuda'
  },

  // Columnas (letras)
  COLUMNS: {
    PRODUCT_ID: 'A',
    VARIANT_ID: 'B',
    HANDLE: 'C',
    SKU: 'D',
    TIPO: 'E',
    TITULO: 'F',
    DESCRIPCION: 'G',
    MARCA: 'H',
    MODELO: 'I',
    PRECIO: 'J',
    COMPARE_AT: 'K',
    STOCK: 'L',
    VENDOR: 'M',
    ESTADO: 'N',
    MODIFICADO: 'O',

    // Columnas editables
    EDITABLE: ['F', 'G', 'J', 'K', 'L', 'N']
  },

  // Colores BYTE
  COLORS: {
    BYTE_BLUE: '#0066CC',
    BYTE_DARK: '#003366',
    HEADER: '#003366',
    HEADER_TEXT: '#FFFFFF',
    PADRE: '#E3F2FD',
    INDIVIDUAL: '#FFF3E0',
    ACTIVO: '#C8E6C9',
    INACTIVO: '#FFCDD2',
    MODIFIED: '#FFF9C4',
    WARNING: '#FFF3E0',
    ERROR: '#FFCDD2'
  }
};
```

### Funciones Principales

#### 1. `onOpen()`

**Trigger**: Al abrir el spreadsheet

**Función**: Crear menú personalizado

```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('🚀 BYTE Panel')
    .addItem('📊 Ver Dashboard', 'mostrarDashboard')
    .addItem('🔄 Sincronizar Ahora', 'sincronizarManual')
    .addSeparator()
    .addItem('📜 Ver Historial de Cambios', 'mostrarHistorial')
    .addItem('✅ Marcar Modificados para Sync', 'marcarModificadosParaSync')
    .addSeparator()
    .addItem('🎨 Aplicar Formato', 'aplicarFormato')
    .addItem('🔒 Proteger Campos Críticos', 'protegerCamposCriticos')
    .addSeparator()
    .addItem('❓ Ayuda', 'mostrarAyuda')
    .addToUi();

  Logger.log('BYTE Panel menú creado');
}
```

---

#### 2. `onEdit(e)`

**Trigger**: Al editar cualquier celda

**Función**: Detectar cambios, validar, marcar como modificado, registrar en historial

```javascript
function onEdit(e) {
  if (!e) return;

  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();

  // Solo procesar hoja de productos
  if (sheetName !== CONFIG.SHEET_NAMES.PRODUCTOS) return;

  const row = e.range.getRow();
  const col = e.range.getColumn();

  // Ignorar header
  if (row === 1) return;

  // Verificar si es columna editable
  const columnLetter = columnToLetter(col);
  if (!CONFIG.COLUMNS.EDITABLE.includes(columnLetter)) {
    // Intentó editar columna bloqueada
    SpreadsheetApp.getUi().alert(
      '⚠️ Campo de Solo Lectura',
      'Este campo no puede ser editado. Solo puedes modificar: Título, Descripción, Precio, Compare At, Stock, Estado.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    // Revertir cambio
    e.range.setValue(e.oldValue);
    return;
  }

  // Marcar fila como modificada
  marcarFilaModificada(sheet, row);

  // Aplicar validaciones
  aplicarValidaciones(sheet, row, col, e.value);

  // Registrar en historial
  registrarCambio(sheet, row, col, e.oldValue, e.value);

  // Aplicar formato condicional
  aplicarColorPorEstado(sheet, row);
}
```

---

#### 3. `aplicarValidaciones()`

**Función**: Validar datos según tipo de campo

```javascript
function aplicarValidaciones(sheet, row, col, value) {
  const columnLetter = columnToLetter(col);
  const ui = SpreadsheetApp.getUi();

  // Validación de PRECIO (columna J)
  if (columnLetter === CONFIG.COLUMNS.PRECIO) {
    if (isNaN(value) || value < 0) {
      ui.alert('⚠️ Error de Validación', 'El precio debe ser un número positivo.', ui.ButtonSet.OK);
      sheet.getRange(row, col).setValue(0);
      return false;
    }
  }

  // Validación de COMPARE AT (columna K)
  if (columnLetter === CONFIG.COLUMNS.COMPARE_AT) {
    if (value !== '' && (isNaN(value) || value < 0)) {
      ui.alert('⚠️ Error de Validación', 'El precio de comparación debe ser un número positivo o estar vacío.', ui.ButtonSet.OK);
      sheet.getRange(row, col).setValue('');
      return false;
    }
  }

  // Validación de STOCK (columna L)
  if (columnLetter === CONFIG.COLUMNS.STOCK) {
    if (!Number.isInteger(value) || value < 0) {
      ui.alert('⚠️ Error de Validación', 'El stock debe ser un número entero positivo.', ui.ButtonSet.OK);
      sheet.getRange(row, col).setValue(0);
      return false;
    }
  }

  // Validación de ESTADO (columna N)
  if (columnLetter === CONFIG.COLUMNS.ESTADO) {
    const valueUpper = String(value).toUpperCase();
    if (valueUpper !== 'ACTIVO' && valueUpper !== 'INACTIVO') {
      ui.alert('⚠️ Error de Validación', 'El estado debe ser "ACTIVO" o "INACTIVO".', ui.ButtonSet.OK);
      sheet.getRange(row, col).setValue('ACTIVO');
      return false;
    }
    // Normalizar a mayúsculas
    if (value !== valueUpper) {
      sheet.getRange(row, col).setValue(valueUpper);
    }
  }

  return true;
}
```

---

#### 4. `marcarFilaModificada()`

**Función**: Marcar fila con TRUE en columna "Modificado"

```javascript
function marcarFilaModificada(sheet, row) {
  const modificadoCol = letterToColumn(CONFIG.COLUMNS.MODIFICADO);
  const cell = sheet.getRange(row, modificadoCol);

  // Marcar como modificado
  cell.setValue(true);

  // Aplicar color de fondo
  sheet.getRange(row, 1, 1, sheet.getLastColumn())
    .setBackground(CONFIG.COLORS.MODIFIED);

  Logger.log(`Fila ${row} marcada como modificada`);
}
```

---

#### 5. `registrarCambio()`

**Función**: Guardar cambio en hoja de historial

```javascript
function registrarCambio(sheet, row, col, oldValue, newValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let historialSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.HISTORIAL);

  // Crear hoja si no existe
  if (!historialSheet) {
    historialSheet = ss.insertSheet(CONFIG.SHEET_NAMES.HISTORIAL);

    // Headers
    historialSheet.getRange(1, 1, 1, 7).setValues([[
      'Fecha/Hora', 'Usuario', 'Handle', 'Campo', 'Valor Anterior', 'Valor Nuevo', 'Row'
    ]]);

    // Formato headers
    historialSheet.getRange(1, 1, 1, 7)
      .setBackground(CONFIG.COLORS.HEADER)
      .setFontColor(CONFIG.COLORS.HEADER_TEXT)
      .setFontWeight('bold');
  }

  // Obtener datos de la fila
  const handle = sheet.getRange(row, letterToColumn(CONFIG.COLUMNS.HANDLE)).getValue();
  const columnLetter = columnToLetter(col);
  const columnName = getColumnName(columnLetter);
  const user = Session.getActiveUser().getEmail();
  const timestamp = new Date();

  // Agregar registro
  historialSheet.appendRow([
    timestamp,
    user,
    handle,
    columnName,
    oldValue || '',
    newValue || '',
    row
  ]);

  Logger.log(`Cambio registrado: ${user} modificó ${columnName} de "${oldValue}" a "${newValue}"`);
}
```

---

#### 6. `mostrarDashboard()`

**Función**: Crear/actualizar hoja de dashboard con estadísticas

```javascript
function mostrarDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productosSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  let dashboardSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DASHBOARD);

  // Crear hoja si no existe
  if (!dashboardSheet) {
    dashboardSheet = ss.insertSheet(CONFIG.SHEET_NAMES.DASHBOARD);
  } else {
    dashboardSheet.clear();
  }

  // Calcular estadísticas
  const stats = calcularEstadisticas(productosSheet);

  // Diseñar dashboard
  dashboardSheet.setColumnWidth(1, 300);
  dashboardSheet.setColumnWidth(2, 150);

  let currentRow = 1;

  // Header
  dashboardSheet.getRange(currentRow, 1, 1, 2).merge();
  dashboardSheet.getRange(currentRow, 1)
    .setValue('🚀 BYTE - Panel de Control Shopify')
    .setFontSize(18)
    .setFontWeight('bold')
    .setBackground(CONFIG.COLORS.BYTE_BLUE)
    .setFontColor('#FFFFFF')
    .setHorizontalAlignment('center');
  currentRow += 2;

  // Estadísticas Generales
  dashboardSheet.getRange(currentRow, 1, 1, 2).merge();
  dashboardSheet.getRange(currentRow, 1)
    .setValue('📊 ESTADÍSTICAS GENERALES')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground(CONFIG.COLORS.BYTE_DARK)
    .setFontColor('#FFFFFF');
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('Total de Productos:');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.totalProductos);
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('Productos Padre:');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.productosPadre);
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('Productos Individuales:');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.productosIndividuales);
  currentRow += 2;

  // Estado
  dashboardSheet.getRange(currentRow, 1).setValue('✅ Activos:');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.productosActivos);
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('❌ Inactivos:');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.productosInactivos);
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('⚠️ Modificados (pendientes):');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.productosModificados)
    .setFontWeight('bold')
    .setBackground(stats.productosModificados > 0 ? CONFIG.COLORS.WARNING : '#FFFFFF');
  currentRow += 2;

  // Inventario
  dashboardSheet.getRange(currentRow, 1, 1, 2).merge();
  dashboardSheet.getRange(currentRow, 1)
    .setValue('📦 INVENTARIO')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground(CONFIG.COLORS.BYTE_DARK)
    .setFontColor('#FFFFFF');
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('Stock Total:');
  dashboardSheet.getRange(currentRow, 2).setValue(stats.stockTotal + ' unidades');
  currentRow++;

  dashboardSheet.getRange(currentRow, 1).setValue('Valor Total:');
  dashboardSheet.getRange(currentRow, 2).setValue('$' + stats.valorTotal.toLocaleString('es-AR', {minimumFractionDigits: 2}));
  currentRow += 2;

  // Top Marcas
  dashboardSheet.getRange(currentRow, 1, 1, 2).merge();
  dashboardSheet.getRange(currentRow, 1)
    .setValue('📦 TOP MARCAS')
    .setFontWeight('bold')
    .setFontSize(12)
    .setBackground(CONFIG.COLORS.BYTE_DARK)
    .setFontColor('#FFFFFF');
  currentRow++;

  for (const [marca, count] of Object.entries(stats.topMarcas)) {
    dashboardSheet.getRange(currentRow, 1).setValue(marca);
    dashboardSheet.getRange(currentRow, 2).setValue(count);
    currentRow++;
  }
  currentRow++;

  // Última actualización
  dashboardSheet.getRange(currentRow, 1).setValue('🕐 Última actualización:');
  dashboardSheet.getRange(currentRow, 2).setValue(new Date().toLocaleString('es-AR'));
  currentRow += 2;

  // Footer
  dashboardSheet.getRange(currentRow, 1, 1, 2).merge();
  dashboardSheet.getRange(currentRow, 1)
    .setValue('Powered by BYTE 🚀')
    .setFontStyle('italic')
    .setHorizontalAlignment('center');

  // Mostrar hoja
  dashboardSheet.activate();

  SpreadsheetApp.getUi().alert(
    '✅ Dashboard Actualizado',
    'El dashboard ha sido generado con las estadísticas más recientes.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
```

---

#### 7. `calcularEstadisticas()`

**Función**: Procesar datos y calcular métricas

```javascript
function calcularEstadisticas(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();

  const stats = {
    totalProductos: data.length,
    productosPadre: 0,
    productosIndividuales: 0,
    productosActivos: 0,
    productosInactivos: 0,
    productosModificados: 0,
    stockTotal: 0,
    valorTotal: 0,
    topMarcas: {}
  };

  for (const row of data) {
    const tipo = row[letterToColumn(CONFIG.COLUMNS.TIPO) - 1];
    const estado = row[letterToColumn(CONFIG.COLUMNS.ESTADO) - 1];
    const modificado = row[letterToColumn(CONFIG.COLUMNS.MODIFICADO) - 1];
    const stock = row[letterToColumn(CONFIG.COLUMNS.STOCK) - 1] || 0;
    const precio = row[letterToColumn(CONFIG.COLUMNS.PRECIO) - 1] || 0;
    const marca = row[letterToColumn(CONFIG.COLUMNS.MARCA) - 1] || 'Sin Marca';

    // Tipo
    if (tipo === 'PADRE') stats.productosPadre++;
    if (tipo === 'INDIVIDUAL') stats.productosIndividuales++;

    // Estado
    if (estado === 'ACTIVO') stats.productosActivos++;
    if (estado === 'INACTIVO') stats.productosInactivos++;

    // Modificado
    if (modificado === true || modificado === 'TRUE') stats.productosModificados++;

    // Inventario
    stats.stockTotal += Number(stock);
    stats.valorTotal += Number(stock) * Number(precio);

    // Marcas
    if (!stats.topMarcas[marca]) stats.topMarcas[marca] = 0;
    stats.topMarcas[marca]++;
  }

  // Ordenar marcas por cantidad
  const sortedMarcas = Object.entries(stats.topMarcas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5) // Top 5
    .reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});

  stats.topMarcas = sortedMarcas;

  return stats;
}
```

---

### Utilidades

```javascript
// Convertir letra a número de columna
function letterToColumn(letter) {
  let column = 0;
  const length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

// Convertir número de columna a letra
function columnToLetter(column) {
  let temp;
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

// Obtener nombre de columna
function getColumnName(letter) {
  const names = {
    'A': 'ID Producto',
    'B': 'ID Variante',
    'C': 'Handle',
    'D': 'SKU',
    'E': 'Tipo',
    'F': 'Título',
    'G': 'Descripción',
    'H': 'Marca',
    'I': 'Modelo',
    'J': 'Precio',
    'K': 'Compare At',
    'L': 'Stock',
    'M': 'Vendor',
    'N': 'Estado',
    'O': 'Modificado'
  };
  return names[letter] || letter;
}
```

---

## 🔌 Shopify Admin API

### Versión

**API Version**: `2024-01`

### Authentication

**Tipo**: Custom App Access Token

**Header**:
```
X-Shopify-Access-Token: shpat_xxxxxxxxxxxxx
```

### Endpoints Usados

#### GET /admin/api/2024-01/products.json

**Propósito**: Listar todos los productos

**Parameters**:
- `limit`: 250 (máximo permitido)
- `status`: any (incluir activos e inactivos)
- `fields`: product_id,title,handle,variants,... (opcional, optimización)

**Response**:
```json
{
  "products": [
    {
      "id": 123456789,
      "title": "Michelin PILOT SPORT 4 205/40R17",
      "handle": "michelin-ps4-p",
      "body_html": "<p>Descripción</p>",
      "vendor": "Michelin",
      "product_type": "PILOT SPORT 4",
      "status": "active",
      "variants": [
        {
          "id": 987654321,
          "sku": "MICH-PS4-205-40-17",
          "price": "197471.00",
          "compare_at_price": null,
          "inventory_quantity": 20
        }
      ]
    }
  ]
}
```

**Pagination**:
- Header `Link` contiene `rel="next"`
- Máximo 250 productos por página
- Para catálogo de 800: 4 requests

---

#### PUT /admin/api/2024-01/products/{product_id}.json

**Propósito**: Actualizar producto (título, descripción, estado)

**Request Body**:
```json
{
  "product": {
    "id": 123456789,
    "title": "Nuevo Título",
    "body_html": "<p>Nueva descripción</p>",
    "status": "active"
  }
}
```

**Response**: Producto actualizado

---

#### PUT /admin/api/2024-01/variants/{variant_id}.json

**Propósito**: Actualizar variante (precio, stock)

**Request Body**:
```json
{
  "variant": {
    "id": 987654321,
    "price": "199500.00",
    "compare_at_price": "220000.00",
    "inventory_quantity": 15
  }
}
```

**Response**: Variante actualizada

---

### Rate Limiting

**Límites Shopify**:
- **REST Admin API**: 2 requests/second por tienda
- **Burst**: Hasta 40 requests en 20 segundos
- **Exceed**: HTTP 429 Too Many Requests

**BYTE Panel Strategy**:
- Delay de **600ms** entre requests = 1.66 req/sec
- Mantiene margen de seguridad (< 2 req/sec)
- Para 800 productos: ~8 minutos de sync

**Retry Logic**:
```javascript
if (response.status === 429) {
  const retryAfter = response.headers['Retry-After'] || 2;
  wait(retryAfter * 1000);
  retry();
}
```

---

## 📊 Estructura de Datos

### Google Sheets Schema

| Col | Campo | Tipo | Editable | Validación | Descripción |
|-----|-------|------|----------|------------|-------------|
| A | productId | Number | ❌ | - | ID de Shopify (producto) |
| B | variantId | Number | ❌ | - | ID de Shopify (variante) |
| C | handle | String | ❌ | - | URL slug (único) |
| D | sku | String | ❌ | - | Código de producto |
| E | tipo | Enum | ❌ | PADRE/INDIVIDUAL/OTRO | Tipo de producto |
| F | titulo | String | ✅ | Max 255 chars | Nombre del producto |
| G | descripcion | String | ✅ | - | HTML permitido |
| H | marca | String | ❌ | - | Michelin, BFGoodrich, etc. |
| I | modelo | String | ❌ | - | PILOT SPORT 4, etc. |
| J | precio | Number | ✅ | > 0 | Precio de venta |
| K | compareAt | Number | ✅ | >= 0 o vacío | Precio tachado |
| L | stock | Integer | ✅ | >= 0 | Cantidad disponible |
| M | vendor | String | ❌ | - | Proveedor |
| N | estado | Enum | ✅ | ACTIVO/INACTIVO | Visibilidad en tienda |
| O | modificado | Boolean | ❌ (auto) | TRUE/FALSE | Marcador de cambios |

---

### Shopify API Schema

**Product Object**:
```typescript
interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  status: 'active' | 'draft' | 'archived';
  variants: ShopifyVariant[];
}

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  sku: string;
  price: string; // decimal as string
  compare_at_price: string | null;
  inventory_quantity: number;
  inventory_management: 'shopify' | null;
}
```

---

## 🔐 Seguridad

### API Credentials

**Storage**:
- n8n: Environment variables (`.env` o UI)
- Google Apps Script: No almacena credentials (solo ejecuta)

**Best Practices**:
- ✅ Shopify token con permisos mínimos (`read_products`, `write_products`)
- ✅ No commits de `.env` en git
- ✅ Rotación de tokens cada 6 meses
- ✅ Acceso a n8n restringido (VPN, IP whitelist)

### Google Sheets Access

**Permisos recomendados**:
- Owner: 1-2 administradores
- Editor: 3-5 usuarios de confianza (staff)
- Viewer: 5-10 usuarios (consulta)

**Protected Ranges**:
- Columnas A-E, H-I, M, O: Solo lectura (todos los usuarios)
- Fila 1 (headers): Protegida

### Data Validation

**Client-side** (Google Apps Script):
- Validación en tiempo real (`onEdit`)
- Previene errores de formato
- Feedback inmediato

**Server-side** (n8n):
- Re-validación antes de enviar a Shopify
- Sanitización de HTML
- Truncado de strings largos

---

## ⚡ Performance y Optimización

### Optimizaciones Implementadas

1. **Pagination en Shopify**:
   - Fetch 250 productos/request (máximo)
   - Reduce número total de requests

2. **Batch Updates en Google Sheets**:
   - Usar `setValues()` en lugar de `setValue()` en loops
   - Escribe 100+ filas en 1 operación

3. **Selective Sync**:
   - Solo sincronizar productos marcados "Modificado = TRUE"
   - Ahorra 90% de requests en Shopify

4. **Rate Limiting**:
   - Delay de 600ms previene throttling
   - Evita reintentos que aumentan latencia

5. **Caching (con Redis)**:
   - Almacena hash de productos
   - Detecta cambios sin procesar todos los datos

### Métricas de Performance

| Operación | Tiempo | Detalles |
|-----------|--------|----------|
| **Full Sync (Shopify → Sheets)** | 3-5 min | 800 productos, 4 requests de 250 |
| **Partial Sync (Sheets → Shopify)** | 1-2 min | 10-20 productos modificados |
| **Dashboard Generation** | 5-10 seg | Cálculo de estadísticas en Apps Script |
| **Single Product Update** | 1-2 seg | 1 request a Shopify API |

---

## 🚀 Deployment y Configuración

### Requisitos Previos

1. **Google Account** con acceso a:
   - Google Sheets
   - Google Apps Script

2. **Shopify Store** con:
   - Admin API access
   - Custom App creada
   - Access Token generado

3. **n8n Instance**:
   - Self-hosted (VPS, Docker) o
   - n8n Cloud (plan Free o pago)

### Paso 1: Crear Google Sheet

1. Crear nuevo Google Sheet
2. Nombrar: "BYTE Panel - Rodavial"
3. Crear hojas: "Productos", "Dashboard", "Historial", "Ayuda"
4. En hoja "Productos", crear headers (fila 1):
   ```
   A: ID Producto
   B: ID Variante
   C: Handle
   D: SKU
   E: Tipo
   F: Título
   G: Descripción
   H: Marca
   I: Modelo
   J: Precio
   K: Compare At
   L: Stock
   M: Vendor
   N: Estado
   O: Modificado
   ```

### Paso 2: Instalar Google Apps Script

1. En el Sheet: `Extensions → Apps Script`
2. Copiar contenido de `google-apps-script-panel.gs`
3. Pegar en el editor
4. Guardar (Ctrl+S)
5. Cerrar y reabrir el Sheet
6. Verificar que aparece menú "🚀 BYTE Panel"

### Paso 3: Configurar n8n

**Opción A: n8n Cloud**

1. Crear cuenta en [n8n.cloud](https://n8n.cloud)
2. Plan Free: 5,000 ejecuciones/mes

**Opción B: Self-hosted (Docker)**

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

Acceso: `http://localhost:5678`

### Paso 4: Importar Workflows

1. En n8n: `Workflows → Import from File`
2. Seleccionar: `n8n-workflow-control-panel.json`
3. Click "Import"

### Paso 5: Configurar Credentials

**Google Sheets Credential**:
1. `Credentials → Create New → Google Sheets`
2. OAuth2 flow (seguir pasos de Google)
3. Guardar

**Shopify Credential**:
1. `Credentials → Create New → Header Auth`
2. Name: `Shopify Admin API`
3. Header Name: `X-Shopify-Access-Token`
4. Header Value: `shpat_xxxxxxxxxxxxx`
5. Guardar

### Paso 6: Configurar Variables

En cada nodo HTTP Request de Shopify:
- URL: Reemplazar `{{$env.SHOPIFY_SHOP_DOMAIN}}` con `tu-tienda.myshopify.com`

O usar variables de entorno en n8n.

### Paso 7: Activar Workflow

1. Verificar configuración
2. Click en "Activate" (toggle arriba a la derecha)
3. El workflow se ejecutará cada 15 min

### Paso 8: Primera Sincronización

1. Click en "Execute Workflow" (ejecutar manualmente)
2. Esperar 3-5 min
3. Verificar Google Sheet se llenó con productos
4. Verificar Dashboard

---

## 📊 Monitoring y Logs

### n8n Execution Logs

**Acceder**:
```
Executions (menú lateral) → Ver ejecución
```

**Información disponible**:
- Timestamp de inicio/fin
- Duración total
- Nodos ejecutados
- Errores (si los hubo)
- Datos de entrada/salida de cada nodo

**Alertas**:
- Configurar webhook para notificar errores
- Integración con Slack/Email

### Google Apps Script Logs

**Acceder**:
```
Apps Script Editor → View → Logs
```

**Logger.log() usage**:
```javascript
Logger.log('Fila ' + row + ' marcada como modificada');
Logger.log('Error: ' + error.message);
```

**Stackdriver Logging** (avanzado):
```javascript
console.log('Info message');
console.error('Error message');
```

### Shopify API Logs

**Shopify Admin**:
```
Apps → (Tu Custom App) → API call logs
```

Muestra:
- Requests realizados
- Rate limit consumido
- Errores 4xx/5xx

---

## 🐛 Troubleshooting Avanzado

### Error: "Too Many Requests" (429)

**Causa**: Excediste 2 requests/segundo en Shopify API

**Solución**:
1. Verificar delay en n8n (debe ser >= 600ms)
2. Agregar retry logic con exponential backoff
3. Reducir productos sincronizados por ejecución

**n8n Retry Config**:
```json
{
  "retry": {
    "maxRetries": 3,
    "retryInterval": 1000,
    "retryOn": [429]
  }
}
```

---

### Error: "Unauthorized" (401)

**Causa**: Access Token inválido o expirado

**Solución**:
1. Verificar token en `.env` o n8n credentials
2. Regenerar token en Shopify Admin
3. Actualizar en n8n

---

### Error: "Data Sync Conflict"

**Causa**: Producto editado en Shopify y Google Sheets simultáneamente

**Solución**:
1. Establecer "Shopify como fuente de verdad" o viceversa
2. Implementar conflict resolution:
   - Timestamp-based: Gana el más reciente
   - Source-based: Shopify siempre gana

---

### Error: Google Apps Script Timeout

**Causa**: Script tarda >6 minutos (límite de Google)

**Solución**:
1. Optimizar `calcularEstadisticas()`:
   - Usar `getValues()` en lugar de `getValue()` en loop
   - Procesar en batches
2. Mover cálculos pesados a n8n

---

### Productos No Se Sincronizan

**Diagnóstico**:
1. Verificar columna "Modificado" = TRUE
2. Ver n8n execution logs: ¿Se ejecutó el workflow?
3. Ver errores en nodo "Update Shopify Product"
4. Verificar formato de datos (precio debe ser número, estado debe ser "ACTIVO"/"INACTIVO")

**Solución**:
- Corregir datos si formato incorrecto
- Re-marcar producto como modificado
- Esperar próxima ejecución o forzar sincronización

---

## 📞 Soporte BYTE

Para soporte técnico avanzado:

```
📧 Email:      soporte@byte.com.ar
📱 WhatsApp:   +54 9 11 XXXX-XXXX
🌐 Web:        www.byte.com.ar

Horario:
  Lunes a Viernes: 9:00 - 18:00 hs
```

---

<div align="center">

![BYTE Logo](../src/media/Byte.png)

## 🚀 BYTE Panel - Manual Técnico

**Desarrollado con ❤️ por BYTE para Rodavial**

[📖 Documentación](BYTE_CONTROL_PANEL.md) •
[📗 Guía de Usuario](BYTE_USER_GUIDE.md) •
[📙 FAQ](BYTE_FAQ.md)

---

**BYTE - Soluciones Tecnológicas a Medida**

*Impulsamos tu negocio con tecnología* 🚀

---

© 2025 BYTE. Todos los derechos reservados.

</div>
