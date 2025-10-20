# 📥 Instrucciones para Importar BYTE Panel a Google Sheets

## Archivos Generados

Se han creado 4 archivos CSV con la estructura completa del panel:

1. ✅ **BYTE_Panel_Productos.csv** - Hoja principal de productos
2. ✅ **BYTE_Panel_Dashboard.csv** - Dashboard con estadísticas
3. ✅ **BYTE_Panel_Historial.csv** - Historial de cambios
4. ✅ **BYTE_Panel_Ayuda.csv** - Guía de uso

---

## 📋 Paso a Paso para Importar

### Opción 1: Importar Todo en un Solo Google Sheet (RECOMENDADO)

#### 1. Crear Google Sheet Base

1. Ve a: https://sheets.google.com
2. Click en ➕ **Blank spreadsheet**
3. Nombra el archivo: **"BYTE - Panel Control Shopify - Rodavial"**

#### 2. Importar Primera Hoja (Productos)

1. En Google Sheets, ve a: **File → Import**
2. Click en **Upload** tab
3. Arrastra o selecciona: `BYTE_Panel_Productos.csv`
4. Configuración de importación:
   - **Import location**: Replace current sheet
   - **Separator type**: Comma
   - **Convert text to numbers, dates**: ✅ (checked)
5. Click **Import data**
6. Renombra la hoja (abajo) de "Sheet1" a: **"Productos"**

#### 3. Importar Hoja Dashboard

1. Click en el ➕ (abajo) para agregar nueva hoja
2. Ve a: **File → Import**
3. Click en **Upload** tab
4. Selecciona: `BYTE_Panel_Dashboard.csv`
5. Configuración:
   - **Import location**: **Insert new sheet(s)**
   - **Separator type**: Comma
6. Click **Import data**
7. Renombra la nueva hoja a: **"Dashboard"**

#### 4. Importar Hoja Historial

1. Click en el ➕ para agregar nueva hoja
2. Ve a: **File → Import**
3. Selecciona: `BYTE_Panel_Historial.csv`
4. Configuración:
   - **Import location**: **Insert new sheet(s)**
   - **Separator type**: Comma
5. Click **Import data**
6. Renombra a: **"Historial"**

#### 5. Importar Hoja Ayuda

1. Click en el ➕ para agregar nueva hoja
2. Ve a: **File → Import**
3. Selecciona: `BYTE_Panel_Ayuda.csv`
4. Configuración:
   - **Import location**: **Insert new sheet(s)**
   - **Separator type**: Comma
5. Click **Import data**
6. Renombra a: **"Ayuda"**

---

### 🎨 Aplicar Formato BYTE (Opcional pero Recomendado)

#### Hoja "Productos"

1. **Encabezado (Fila 1)**:
   - Selecciona toda la fila 1
   - Color de fondo: `#003366` (BYTE Dark Blue)
   - Color de texto: Blanco
   - Fuente: Bold
   - Alineación: Centro

2. **Freezar encabezado**:
   - Click en fila 1
   - View → Freeze → 1 row

3. **Ajustar anchos de columna** (opcional):
   - Doble click en el borde entre letras de columnas para auto-ajustar

#### Hoja "Dashboard"

1. **Título principal (A1)**:
   - Selecciona celdas A1:B1
   - Click derecho → Merge cells
   - Color de fondo: `#0066CC` (BYTE Blue)
   - Color de texto: Blanco
   - Fuente: 18pt, Bold
   - Alineación: Centro

2. **Secciones**:
   - Las filas con "📊 ESTADÍSTICAS GENERALES", "📦 INVENTARIO", "🏆 TOP MARCAS":
     - Color de fondo: `#003366`
     - Color de texto: Blanco
     - Bold

#### Hoja "Historial"

1. **Encabezado (Fila 1)**:
   - Color de fondo: `#003366`
   - Color de texto: Blanco
   - Bold, Centro

2. **Freezar encabezado**:
   - View → Freeze → 1 row

#### Hoja "Ayuda"

1. **Ajustar anchos**:
   - Columna A: 400px
   - Columna C: 400px

---

## 🔧 Instalar Google Apps Script

Una vez que hayas importado todas las hojas:

1. En Google Sheets, ve a: **Extensions → Apps Script**
2. Se abrirá el editor de código
3. Borra el código por defecto (`function myFunction() {...}`)
4. Abre el archivo: `google-apps-script-panel.gs`
5. Copia TODO el contenido
6. Pega en el editor de Apps Script
7. Click en 💾 **Save** (o Ctrl+S)
8. Nombra el proyecto: **"BYTE Panel - Shopify Manager"**
9. Cierra el editor
10. Cierra y vuelve a abrir el Google Sheet
11. Deberías ver un nuevo menú: **"🚀 BYTE Panel"**

---

## ✅ Verificación

Tu Google Sheet debería tener:

- ✅ 4 hojas: Productos, Dashboard, Historial, Ayuda
- ✅ Headers con formato BYTE (azul oscuro #003366)
- ✅ Filas de ejemplo en hoja Productos
- ✅ Fórmulas funcionando en Dashboard
- ✅ Menú "🚀 BYTE Panel" (después de instalar Apps Script)

---

## 🎯 Próximos Pasos

1. ✅ Importar archivos CSV → Google Sheets
2. ✅ Aplicar formato BYTE
3. ✅ Instalar Google Apps Script
4. ⏭️ Configurar n8n workflow (ver: `Documentacion/N8N_SETUP.md`)
5. ⏭️ Primera sincronización
6. ⏭️ Capacitar equipo de Rodavial

---

## 🆘 Problemas Comunes

### Las fórmulas no funcionan en Dashboard

**Solución**: Las fórmulas hacen referencia a la hoja "Productos". Asegúrate de que:
- La hoja se llame exactamente **"Productos"** (con mayúscula inicial)
- Hay datos en la hoja Productos

### No veo el menú "🚀 BYTE Panel"

**Solución**:
1. Verifica que instalaste el Apps Script correctamente
2. Cierra y vuelve a abrir el Google Sheet
3. Puede tardar 5-10 segundos en aparecer

### Los archivos CSV tienen caracteres raros

**Solución**:
- Al importar, asegúrate de seleccionar encoding: **UTF-8**
- Si hay problemas, abre los CSV en Notepad y guarda como UTF-8

---

## 📞 Soporte BYTE

Si tienes problemas con la importación:

📧 **Email**: contacto@byte.com.ar
📱 **WhatsApp**: +54 9 11 XXXX-XXXX
🌐 **Web**: www.byte.com.ar

---

<div align="center">

![BYTE Logo](src/media/Byte.png)

**BYTE - Soluciones Tecnológicas a Medida**

*Desarrollamos software que impulsa tu negocio* 🚀

</div>
