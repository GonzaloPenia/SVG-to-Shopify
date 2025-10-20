/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    🚀 BYTE - Panel de Control                ║
 * ║                   Shopify Products Manager                   ║
 * ║                                                              ║
 * ║  Desarrollado por: BYTE                                      ║
 * ║  Cliente: Rodavial                                           ║
 * ║  Versión: 1.0.0                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  SHEET_NAMES: {
    PRODUCTOS: 'Productos',
    DASHBOARD: 'Dashboard',
    HISTORIAL: 'Historial',
    AYUDA: 'Ayuda'
  },
  COLORS: {
    BYTE_BLUE: '#0066CC',
    BYTE_DARK: '#003366',
    HEADER: '#003366',
    PADRE: '#E3F2FD',
    INDIVIDUAL: '#FFF3E0',
    ACTIVO: '#C8E6C9',
    INACTIVO: '#FFCDD2',
    MODIFIED: '#FFF9C4',
    WARNING: '#FFEB3B',
    ERROR: '#F44336'
  },
  COLUMNS: {
    // Columnas no editables
    READONLY: ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'M', 'Q', 'R'],
    // Columnas editables
    EDITABLE: ['F', 'I', 'J', 'K', 'L', 'N'],
    // Columnas de flags
    FLAGS: ['S', 'T']
  }
};

// ═══════════════════════════════════════════════════════════════
// INICIALIZACIÓN Y SETUP
// ═══════════════════════════════════════════════════════════════

/**
 * Evento que se ejecuta cuando se abre el documento
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu('🚀 BYTE Panel')
    .addItem('📊 Ver Dashboard', 'mostrarDashboard')
    .addItem('🔄 Sincronizar Ahora', 'sincronizarManual')
    .addSeparator()
    .addItem('✅ Marcar Modificados para Sync', 'marcarModificadosParaSync')
    .addItem('🗑️ Limpiar Flags de Sync', 'limpiarFlags')
    .addSeparator()
    .addItem('📈 Ver Estadísticas', 'mostrarEstadisticas')
    .addItem('📜 Ver Historial de Cambios', 'mostrarHistorial')
    .addSeparator()
    .addItem('❓ Ayuda', 'mostrarAyuda')
    .addItem('ℹ️ Acerca de BYTE Panel', 'mostrarAcercaDe')
    .addToUi();

  // Configurar protecciones
  configurarProtecciones();

  // Aplicar formato inicial
  aplicarFormatoInicial();
}

/**
 * Configura las hojas y protecciones necesarias
 */
function configurarProtecciones() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productosSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!productosSheet) return;

  // Proteger columnas de solo lectura
  const rangesProteger = [];

  // Columnas de IDs y metadata (A-E)
  rangesProteger.push(productosSheet.getRange('A:E'));

  // Columnas de información calculada (G-H, M, Q-R)
  rangesProteger.push(productosSheet.getRange('G:H'));
  rangesProteger.push(productosSheet.getRange('M:M'));
  rangesProteger.push(productosSheet.getRange('Q:R'));

  // Aplicar protecciones
  rangesProteger.forEach(range => {
    const protection = range.protect();
    protection.setDescription('🔒 BYTE Panel - Campo de solo lectura');
    protection.setWarningOnly(true);
  });
}

/**
 * Aplica el formato inicial a la hoja de productos
 */
function aplicarFormatoInicial() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!sheet) return;

  // Configurar encabezados
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground(CONFIG.COLORS.HEADER);
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');

  // Congelar fila de encabezado
  sheet.setFrozenRows(1);

  // Auto-resize columnas
  sheet.autoResizeColumns(1, sheet.getLastColumn());

  // Aplicar filtros
  const dataRange = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  dataRange.createFilter();
}

// ═══════════════════════════════════════════════════════════════
// DETECCIÓN DE CAMBIOS
// ═══════════════════════════════════════════════════════════════

/**
 * Evento que se ejecuta cuando se edita una celda
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();

  // Solo procesar ediciones en hoja de Productos
  if (sheetName !== CONFIG.SHEET_NAMES.PRODUCTOS) return;

  const range = e.range;
  const row = range.getRow();
  const col = range.getColumn();

  // Ignorar ediciones en la fila de encabezado
  if (row === 1) return;

  // Verificar si la columna editada es editable
  const columnLetter = columnToLetter(col);
  if (!CONFIG.COLUMNS.EDITABLE.includes(columnLetter)) return;

  // Marcar fila como modificada
  marcarFilaModificada(sheet, row);

  // Aplicar validaciones
  aplicarValidaciones(sheet, row, col);

  // Registrar cambio en historial
  registrarCambio(sheet, row, col, e.oldValue, e.value);
}

/**
 * Marca una fila como modificada
 */
function marcarFilaModificada(sheet, row) {
  // Columna S (19): Modificado
  sheet.getRange(row, 19).setValue('SÍ');

  // Aplicar color de fondo amarillo a la fila
  const numColumns = sheet.getLastColumn();
  sheet.getRange(row, 1, 1, numColumns).setBackground(CONFIG.COLORS.MODIFIED);

  Logger.log(`✏️ Fila ${row} marcada como modificada`);
}

/**
 * Aplica validaciones a los datos editados
 */
function aplicarValidaciones(sheet, row, col) {
  const value = sheet.getRange(row, col).getValue();

  // Validación de precio (columna J y K)
  if (col === 10 || col === 11) { // Precio o Precio Comparación
    if (isNaN(value) || value < 0) {
      SpreadsheetApp.getUi().alert(
        '⚠️ Error de Validación',
        'El precio debe ser un número positivo.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      sheet.getRange(row, col).setValue(0);
      return;
    }
  }

  // Validación de stock (columna L)
  if (col === 12) {
    if (!Number.isInteger(value) || value < 0) {
      SpreadsheetApp.getUi().alert(
        '⚠️ Error de Validación',
        'El stock debe ser un número entero positivo.',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      sheet.getRange(row, col).setValue(0);
      return;
    }
  }

  // Validación de estado (columna N)
  if (col === 14) {
    if (value !== 'ACTIVO' && value !== 'INACTIVO') {
      SpreadsheetApp.getUi().alert(
        '⚠️ Error de Validación',
        'El estado debe ser "ACTIVO" o "INACTIVO".',
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      sheet.getRange(row, col).setValue('ACTIVO');
      return;
    }
  }
}

/**
 * Registra un cambio en el historial
 */
function registrarCambio(sheet, row, col, oldValue, newValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let historialSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.HISTORIAL);

  // Crear hoja de historial si no existe
  if (!historialSheet) {
    historialSheet = ss.insertSheet(CONFIG.SHEET_NAMES.HISTORIAL);
    historialSheet.appendRow([
      'Timestamp',
      'Usuario',
      'Handle',
      'Producto',
      'Campo',
      'Valor Anterior',
      'Valor Nuevo'
    ]);
  }

  const handle = sheet.getRange(row, 3).getValue(); // Columna C: Handle
  const titulo = sheet.getRange(row, 6).getValue(); // Columna F: Título
  const campo = sheet.getRange(1, col).getValue(); // Nombre de la columna
  const usuario = Session.getActiveUser().getEmail();

  historialSheet.appendRow([
    new Date(),
    usuario,
    handle,
    titulo,
    campo,
    oldValue || '(vacío)',
    newValue || '(vacío)'
  ]);

  Logger.log(`📝 Cambio registrado: ${campo} de "${oldValue}" a "${newValue}"`);
}

// ═══════════════════════════════════════════════════════════════
// SINCRONIZACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Marca todos los productos modificados para sincronización
 */
function marcarModificadosParaSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  let count = 0;

  for (let i = 2; i <= lastRow; i++) {
    const modificado = sheet.getRange(i, 19).getValue(); // Columna S

    if (modificado === 'SÍ') {
      sheet.getRange(i, 20).setValue('SÍ'); // Columna T: Sincronizar
      count++;
    }
  }

  SpreadsheetApp.getUi().alert(
    '✅ Marcado Completo',
    `${count} producto(s) marcado(s) para sincronización.\\n\\nLa próxima ejecución de n8n los sincronizará con Shopify.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  Logger.log(`✅ ${count} productos marcados para sincronización`);
}

/**
 * Limpia los flags de sincronización
 */
function limpiarFlags() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!sheet) return;

  const lastRow = sheet.getLastRow();

  // Limpiar columnas S y T
  sheet.getRange(2, 19, lastRow - 1, 2).setValue('NO');

  // Restaurar color de fondo blanco
  sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).setBackground('#FFFFFF');

  // Re-aplicar colores según tipo
  aplicarColoresPorTipo();

  SpreadsheetApp.getUi().alert(
    '✅ Limpieza Completa',
    'Todos los flags de sincronización han sido limpiados.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );

  Logger.log('🗑️ Flags limpiados');
}

/**
 * Trigger de sincronización manual
 */
function sincronizarManual() {
  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    '🔄 Sincronización Manual',
    '¿Desea sincronizar los cambios ahora?\\n\\nEsto marcará todos los productos modificados y ejecutará la sincronización con Shopify.',
    ui.ButtonSet.YES_NO
  );

  if (response === ui.Button.YES) {
    marcarModificadosParaSync();

    // Aquí se puede agregar llamada a webhook de n8n para trigger inmediato
    // triggerN8nWebhook();

    ui.alert(
      '✅ Sincronización Iniciada',
      'Los productos han sido marcados para sincronización.\\n\\nLa sincronización con Shopify se completará en los próximos minutos.',
      ui.ButtonSet.OK
    );
  }
}

// ═══════════════════════════════════════════════════════════════
// FORMATEO Y VISUALIZACIÓN
// ═══════════════════════════════════════════════════════════════

/**
 * Aplica colores según tipo de producto
 */
function aplicarColoresPorTipo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!sheet) return;

  const lastRow = sheet.getLastRow();

  for (let i = 2; i <= lastRow; i++) {
    const tipo = sheet.getRange(i, 5).getValue(); // Columna E: Tipo
    const estado = sheet.getRange(i, 14).getValue(); // Columna N: Estado
    const modificado = sheet.getRange(i, 19).getValue(); // Columna S: Modificado

    let color = '#FFFFFF';

    if (modificado === 'SÍ') {
      color = CONFIG.COLORS.MODIFIED;
    } else if (tipo === 'PADRE') {
      color = CONFIG.COLORS.PADRE;
    } else if (tipo === 'INDIVIDUAL') {
      color = CONFIG.COLORS.INDIVIDUAL;
    }

    sheet.getRange(i, 1, 1, sheet.getLastColumn()).setBackground(color);

    // Color en columna de estado
    if (estado === 'ACTIVO') {
      sheet.getRange(i, 14).setBackground(CONFIG.COLORS.ACTIVO);
    } else {
      sheet.getRange(i, 14).setBackground(CONFIG.COLORS.INACTIVO);
    }
  }

  Logger.log('🎨 Colores aplicados según tipo de producto');
}

/**
 * Aplica formato de moneda a columnas de precio
 */
function aplicarFormatoMoneda() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!sheet) return;

  const lastRow = sheet.getLastRow();

  // Columna J: Precio
  sheet.getRange(2, 10, lastRow - 1, 1).setNumberFormat('$#,##0.00');

  // Columna K: Precio Comparación
  sheet.getRange(2, 11, lastRow - 1, 1).setNumberFormat('$#,##0.00');

  Logger.log('💰 Formato de moneda aplicado');
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD Y ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════

/**
 * Muestra el dashboard con estadísticas
 */
function mostrarDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let dashboardSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.DASHBOARD);

  if (!dashboardSheet) {
    dashboardSheet = crearDashboard();
  }

  actualizarDashboard(dashboardSheet);
  ss.setActiveSheet(dashboardSheet);
}

/**
 * Crea la hoja de dashboard
 */
function crearDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = ss.insertSheet(CONFIG.SHEET_NAMES.DASHBOARD, 0);

  // Logo y título
  dashboard.getRange('A1:F1').merge();
  dashboard.getRange('A1').setValue('🚀 BYTE - Panel de Control Shopify');
  dashboard.getRange('A1').setFontSize(24);
  dashboard.getRange('A1').setFontWeight('bold');
  dashboard.getRange('A1').setBackground(CONFIG.COLORS.BYTE_BLUE);
  dashboard.getRange('A1').setFontColor('#FFFFFF');
  dashboard.getRange('A1').setHorizontalAlignment('center');

  // Sección de estadísticas
  dashboard.getRange('A3').setValue('📊 ESTADÍSTICAS GENERALES');
  dashboard.getRange('A3').setFontSize(16);
  dashboard.getRange('A3').setFontWeight('bold');

  return dashboard;
}

/**
 * Actualiza los datos del dashboard
 */
function actualizarDashboard(dashboard) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productosSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!productosSheet) return;

  const data = productosSheet.getDataRange().getValues();
  const stats = calcularEstadisticas(data);

  let row = 5;

  // Total de productos
  dashboard.getRange(row, 1).setValue('Total de Productos:');
  dashboard.getRange(row, 2).setValue(stats.total);
  row++;

  // Productos padre
  dashboard.getRange(row, 1).setValue('Productos Padre:');
  dashboard.getRange(row, 2).setValue(stats.padres);
  row++;

  // Productos individuales
  dashboard.getRange(row, 1).setValue('Productos Individuales:');
  dashboard.getRange(row, 2).setValue(stats.individuales);
  row++;

  // Productos activos
  dashboard.getRange(row, 1).setValue('Productos Activos:');
  dashboard.getRange(row, 2).setValue(stats.activos);
  row++;

  // Productos modificados
  dashboard.getRange(row, 1).setValue('Modificados (pendientes sync):');
  dashboard.getRange(row, 2).setValue(stats.modificados);
  dashboard.getRange(row, 2).setBackground(stats.modificados > 0 ? CONFIG.COLORS.WARNING : CONFIG.COLORS.ACTIVO);
  row++;

  // Stock total
  row++;
  dashboard.getRange(row, 1).setValue('Stock Total:');
  dashboard.getRange(row, 2).setValue(stats.stockTotal);
  row++;

  // Valor de inventario
  dashboard.getRange(row, 1).setValue('Valor de Inventario:');
  dashboard.getRange(row, 2).setValue(stats.valorInventario);
  dashboard.getRange(row, 2).setNumberFormat('$#,##0.00');

  // Marcas
  row += 2;
  dashboard.getRange(row, 1).setValue('📦 TOP MARCAS');
  dashboard.getRange(row, 1).setFontWeight('bold');
  row++;

  const marcas = Object.entries(stats.marcas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  marcas.forEach(([marca, count]) => {
    dashboard.getRange(row, 1).setValue(marca);
    dashboard.getRange(row, 2).setValue(count);
    row++;
  });

  // Última actualización
  row += 2;
  dashboard.getRange(row, 1).setValue('🕐 Última actualización:');
  dashboard.getRange(row, 2).setValue(new Date());
  dashboard.getRange(row, 2).setNumberFormat('dd/mm/yyyy hh:mm:ss');

  // Footer BYTE
  row += 2;
  dashboard.getRange(row, 1, 1, 2).merge();
  dashboard.getRange(row, 1).setValue('Powered by BYTE 🚀');
  dashboard.getRange(row, 1).setHorizontalAlignment('center');
  dashboard.getRange(row, 1).setFontColor(CONFIG.COLORS.BYTE_BLUE);
  dashboard.getRange(row, 1).setFontWeight('bold');

  dashboard.autoResizeColumns(1, 2);
}

/**
 * Calcula estadísticas de los productos
 */
function calcularEstadisticas(data) {
  const stats = {
    total: 0,
    padres: 0,
    individuales: 0,
    activos: 0,
    inactivos: 0,
    modificados: 0,
    stockTotal: 0,
    valorInventario: 0,
    marcas: {}
  };

  // Saltar encabezado
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    stats.total++;

    // Tipo
    if (row[4] === 'PADRE') stats.padres++;
    if (row[4] === 'INDIVIDUAL') stats.individuales++;

    // Estado
    if (row[13] === 'ACTIVO') stats.activos++;
    else stats.inactivos++;

    // Modificado
    if (row[18] === 'SÍ') stats.modificados++;

    // Stock
    const stock = parseInt(row[11]) || 0;
    stats.stockTotal += stock;

    // Valor inventario
    const precio = parseFloat(row[9]) || 0;
    stats.valorInventario += precio * stock;

    // Marcas
    const marca = row[6] || 'Sin marca';
    stats.marcas[marca] = (stats.marcas[marca] || 0) + 1;
  }

  return stats;
}

/**
 * Muestra estadísticas en un alert
 */
function mostrarEstadisticas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const productosSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTOS);

  if (!productosSheet) return;

  const data = productosSheet.getDataRange().getValues();
  const stats = calcularEstadisticas(data);

  const mensaje = `
📊 ESTADÍSTICAS DEL CATÁLOGO

Total de Productos: ${stats.total}
  • Productos Padre: ${stats.padres}
  • Productos Individuales: ${stats.individuales}

Estado:
  • Activos: ${stats.activos}
  • Inactivos: ${stats.inactivos}

Modificados (pendientes sync): ${stats.modificados}

Inventario:
  • Stock Total: ${stats.stockTotal} unidades
  • Valor Total: $${stats.valorInventario.toLocaleString('es-AR', {minimumFractionDigits: 2})}

Powered by BYTE 🚀
  `;

  SpreadsheetApp.getUi().alert('📊 Estadísticas', mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ═══════════════════════════════════════════════════════════════
// HISTORIAL
// ═══════════════════════════════════════════════════════════════

/**
 * Muestra el historial de cambios
 */
function mostrarHistorial() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const historialSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.HISTORIAL);

  if (!historialSheet) {
    SpreadsheetApp.getUi().alert(
      'ℹ️ Sin Historial',
      'No hay historial de cambios registrado todavía.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }

  ss.setActiveSheet(historialSheet);
}

// ═══════════════════════════════════════════════════════════════
// AYUDA Y ACERCA DE
// ═══════════════════════════════════════════════════════════════

/**
 * Muestra la ayuda
 */
function mostrarAyuda() {
  const mensaje = `
╔══════════════════════════════════════════════════════════╗
║           🚀 BYTE - Panel de Control Shopify             ║
║                    GUÍA RÁPIDA                           ║
╚══════════════════════════════════════════════════════════╝

📝 CAMPOS EDITABLES:
  • Título (F)
  • Descripción Corta (I)
  • Precio (J)
  • Precio Comparación (K)
  • Stock (L)
  • Estado (N): ACTIVO / INACTIVO

🔒 CAMPOS DE SOLO LECTURA:
  • ID Producto, ID Variante, Handle, SKU
  • Tipo, Marca, Modelo
  • Total Variantes, Categoría, Proveedor
  • Imagen URL, Fecha Modificación

🔄 CÓMO FUNCIONA:
  1. Edita los campos permitidos
  2. El sistema marca automáticamente como "Modificado"
  3. Ve a menú: BYTE Panel → Marcar Modificados para Sync
  4. n8n sincronizará automáticamente cada 15 minutos

⚡ SINCRONIZACIÓN:
  • Automática: Cada 15 minutos
  • Manual: BYTE Panel → Sincronizar Ahora

📊 CARACTERÍSTICAS:
  • Detección automática de cambios
  • Validación de datos
  • Historial completo de modificaciones
  • Dashboard con estadísticas
  • Protección de campos críticos

💡 CONSEJOS:
  • Usa filtros para buscar productos
  • Ordena por marca o modelo
  • Revisa el Dashboard regularmente

────────────────────────────────────────────────────────────
Desarrollado por BYTE 🚀
Para soporte: contacto@byte.com.ar
  `;

  SpreadsheetApp.getUi().alert('❓ Ayuda - BYTE Panel', mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Muestra información acerca de BYTE Panel
 */
function mostrarAcercaDe() {
  const mensaje = `
╔══════════════════════════════════════════════════════════╗
║              🚀 BYTE - Panel de Control                  ║
║                  Shopify Products Manager                ║
╚══════════════════════════════════════════════════════════╝

Versión: 1.0.0
Desarrollado por: BYTE
Cliente: Rodavial
Fecha: Enero 2025

────────────────────────────────────────────────────────────

CARACTERÍSTICAS:
  ✅ Sincronización bidireccional Shopify ↔ Google Sheets
  ✅ Actualización automática cada 15 minutos
  ✅ Detección inteligente de cambios
  ✅ Validación de datos en tiempo real
  ✅ Historial completo de modificaciones
  ✅ Dashboard con estadísticas
  ✅ Interfaz intuitiva y amigable

TECNOLOGÍAS:
  • Google Apps Script
  • n8n (Automatización)
  • Shopify Admin API
  • Google Sheets API

────────────────────────────────────────────────────────────

BYTE - Soluciones tecnológicas a medida
Web: www.byte.com.ar
Email: contacto@byte.com.ar
Tel: +54 9 11 XXXX-XXXX

────────────────────────────────────────────────────────────

© 2025 BYTE. Todos los derechos reservados.
  `;

  SpreadsheetApp.getUi().alert('ℹ️ Acerca de BYTE Panel', mensaje, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ═══════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════

/**
 * Convierte número de columna a letra
 */
function columnToLetter(column) {
  let temp, letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

/**
 * Convierte letra de columna a número
 */
function letterToColumn(letter) {
  let column = 0, length = letter.length;
  for (let i = 0; i < length; i++) {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}
