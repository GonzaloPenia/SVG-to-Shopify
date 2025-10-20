# 🚀 BYTE - Panel de Control Shopify

![BYTE Logo](../src/media/Byte.png)

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Guía de Uso para Rodavial](#guía-de-uso-para-rodavial)
5. [Funcionalidades](#funcionalidades)
6. [Sincronización Automática](#sincronización-automática)
7. [Preguntas Frecuentes](#preguntas-frecuentes)
8. [Soporte Técnico](#soporte-técnico)

---

## Descripción General

### ¿Qué es BYTE Panel de Control?

**BYTE Panel de Control** es una solución integral desarrollada por **BYTE** para gestionar el catálogo completo de productos Shopify desde Google Sheets de forma simple, eficiente y totalmente **gratuita/opensource**.

### Características Principales

✅ **Sincronización Bidireccional**
- Shopify → Google Sheets (cada 15 minutos)
- Google Sheets → Shopify (cada 15 minutos)

✅ **Gestión Completa**
- Editar títulos y descripciones
- Actualizar precios y stock
- Activar/desactivar productos
- Ver estadísticas en tiempo real

✅ **100% Gratuito/Opensource**
- Google Sheets (gratis)
- n8n self-hosted (gratuito)
- Google Apps Script (incluido en Sheets)

✅ **Automatización Inteligente**
- Detección automática de cambios
- Validación de datos en tiempo real
- Historial completo de modificaciones

✅ **Interfaz Amigable**
- Diseñada específicamente para Rodavial
- Sin necesidad de conocimientos técnicos
- Protecciones contra errores

---

## Arquitectura del Sistema

### Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     BYTE PANEL                          │
│                  Powered by BYTE 🚀                     │
└─────────────────────────────────────────────────────────┘
                           │
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│              │  │              │  │              │
│   Shopify    │◄─┤     n8n      ├──┤ Google       │
│   Store      │──┤  Workflow    │─►│ Sheets       │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
      ▲                  │                  │
      │                  │                  │
      │                  ▼                  ▼
      │          ┌──────────────┐  ┌──────────────┐
      │          │              │  │              │
      └──────────┤ Google Apps  │  │ Dashboard &  │
                 │   Script     │  │ Estadísticas │
                 │              │  │              │
                 └──────────────┘  └──────────────┘
```

### Flujo de Datos

1. **Shopify → Sheets (Importación)**
   - n8n obtiene productos de Shopify cada 15 min
   - Transforma datos al formato del panel
   - Actualiza Google Sheets
   - Mantiene sincronizado el catálogo

2. **Sheets → Shopify (Exportación)**
   - Usuario edita productos en Google Sheets
   - Google Apps Script detecta cambios
   - Marca productos modificados
   - n8n sincroniza cambios con Shopify

3. **Automatización**
   - Sin intervención manual necesaria
   - Validación automática de datos
   - Logs y reportes completos

---

## Instalación y Configuración

### Requisitos Previos

- ✅ Cuenta de Google (para Google Sheets)
- ✅ n8n instalado (self-hosted o cloud)
- ✅ Acceso admin a Shopify
- ✅ Conexión a internet

### Paso 1: Crear Google Sheet

1. **Crear nuevo Google Sheet**
   - Ve a: https://sheets.google.com
   - Click en "Blank spreadsheet"
   - Nombra: "BYTE - Panel Control Shopify - Rodavial"

2. **Copiar estructura de hojas**

   Crear las siguientes hojas:

   **Hoja "Productos"** (Principal):
   ```
   Columna A: ID Producto
   Columna B: ID Variante
   Columna C: Handle
   Columna D: SKU
   Columna E: Tipo
   Columna F: Título ✏️ (EDITABLE)
   Columna G: Marca
   Columna H: Modelo
   Columna I: Descripción ✏️ (EDITABLE)
   Columna J: Precio ✏️ (EDITABLE)
   Columna K: Precio Comparación ✏️ (EDITABLE)
   Columna L: Stock ✏️ (EDITABLE)
   Columna M: # Variantes
   Columna N: Estado ✏️ (EDITABLE)
   Columna O: Categoría
   Columna P: Proveedor
   Columna Q: URL Imagen
   Columna R: Última Sync
   Columna S: Modificado (auto)
   Columna T: Sincronizar (auto)
   ```

   **Hoja "Dashboard"**:
   - Se crea automáticamente por Google Apps Script

   **Hoja "Historial"**:
   - Se crea automáticamente al primer cambio

   **Hoja "Ayuda"**:
   - Documentación de uso

3. **Aplicar formato visual BYTE**

   **Encabezado (Fila 1)**:
   - Color de fondo: `#003366` (BYTE Dark Blue)
   - Color de texto: `#FFFFFF` (Blanco)
   - Fuente: Bold, 11pt
   - Alineación: Centrado

   **Título principal (Cell A1 en Dashboard)**:
   - Merge A1:F1
   - Texto: "🚀 BYTE - Panel de Control Shopify"
   - Fuente: 24pt, Bold
   - Color: `#0066CC` (BYTE Blue)

4. **Aplicar formato condicional**

   - **Productos PADRE**: Color de fondo `#E3F2FD` (Azul claro)
   - **Productos INDIVIDUAL**: Color de fondo `#FFF3E0` (Naranja claro)
   - **Estado ACTIVO**: Color de fondo `#C8E6C9` (Verde claro)
   - **Estado INACTIVO**: Color de fondo `#FFCDD2` (Rojo claro)
   - **Modificados**: Color de fondo `#FFF9C4` (Amarillo)

### Paso 2: Instalar Google Apps Script

1. **Abrir Script Editor**
   - En Google Sheets: Extensions → Apps Script
   - Se abre el editor de código

2. **Copiar el código**
   - Borra el código existente
   - Copia todo el contenido de: `google-apps-script-panel.gs`
   - Pega en el editor

3. **Guardar el proyecto**
   - Click en 💾 o Ctrl+S
   - Nombra: "BYTE Panel - Shopify Manager"

4. **Ejecutar configuración inicial**
   - En el editor, selecciona función: `onOpen`
   - Click en "Run" ▶️
   - Autoriza permisos (primera vez)
   - Acepta los permisos solicitados

5. **Verificar instalación**
   - Vuelve a Google Sheets
   - Deberías ver menú: "🚀 BYTE Panel"
   - Si no aparece, refresca la página

### Paso 3: Configurar n8n

1. **Importar workflow**
   - En n8n: Workflows → Import from File
   - Selecciona: `n8n-workflow-control-panel.json`
   - Click "Import"

2. **Configurar credenciales**

   **Google Sheets Service Account**:
   ```
   1. Ve a: https://console.cloud.google.com
   2. Crea Service Account
   3. Descarga JSON credentials
   4. En n8n: Credentials → New → Google Service Account
   5. Pega el contenido del JSON
   ```

   **Shopify API**:
   ```
   1. En Shopify Admin: Settings → Apps → Develop apps
   2. Create app: "BYTE Panel"
   3. Admin API scopes:
      - read_products
      - write_products
      - read_inventory
      - write_inventory
   4. Copia Access Token
   5. En n8n: Credentials → New → Shopify API
   6. Pega:
      - Shop Subdomain: aby0mb-0a
      - Access Token: (tu token)
      - API Version: 2024-01
   ```

3. **Configurar variables de entorno**

   En n8n (Settings → Variables):
   ```
   SHOPIFY_SHOP_DOMAIN=aby0mb-0a.myshopify.com
   CONTROL_PANEL_SHEET_ID=(ID de tu Google Sheet)
   ```

   Para obtener el Sheet ID:
   ```
   URL del sheet:
   https://docs.google.com/spreadsheets/d/AQUI_ESTA_EL_ID/edit
                                           ^^^^^^^^^^^^^^^^
   ```

4. **Activar el workflow**
   - En el workflow, toggle "Active" ON
   - Verifica que se ejecute correctamente

### Paso 4: Primera Sincronización

1. **Ejecutar manualmente**
   - En n8n, click "Execute Workflow"
   - Espera a que termine (puede tardar varios minutos)

2. **Verificar en Google Sheets**
   - Ve a tu Google Sheet
   - Hoja "Productos" debe tener datos
   - Verifica que todos los productos aparezcan

3. **Revisar Dashboard**
   - En Google Sheets: 🚀 BYTE Panel → Ver Dashboard
   - Verifica estadísticas

---

## Guía de Uso para Rodavial

### 🎯 Para el equipo de Rodavial

**BYTE Panel** fue diseñado para ser simple y no requiere conocimientos técnicos.

### Editar Productos

1. **Abrir Google Sheet**
   - Ve a la hoja "Productos"

2. **Buscar producto**
   - Usa los filtros de columna
   - O busca con Ctrl+F

3. **Editar campos permitidos**

   **✏️ Campos EDITABLES**:
   - **Título (F)**: Nombre del producto
   - **Descripción (I)**: Descripción corta
   - **Precio (J)**: Precio de venta
   - **Precio Comparación (K)**: Precio tachado
   - **Stock (L)**: Cantidad disponible
   - **Estado (N)**: ACTIVO o INACTIVO

   **🔒 Campos de SOLO LECTURA** (no editar):
   - ID Producto, ID Variante, Handle, SKU
   - Tipo, Marca, Modelo
   - Total Variantes, Categoría
   - Etc.

4. **Sistema detecta cambio automáticamente**
   - La fila se marca en amarillo
   - Columna "Modificado" cambia a "SÍ"

5. **Sincronizar cambios**

   **Opción A: Automática** (recomendada)
   - No hagas nada
   - Los cambios se sincronizan en 15 minutos

   **Opción B: Manual** (inmediata)
   - Menú: 🚀 BYTE Panel → Sincronizar Ahora
   - Confirma
   - Los cambios se aplican inmediatamente

### Ver Estadísticas

1. **Dashboard completo**
   - Menú: 🚀 BYTE Panel → Ver Dashboard
   - Muestra estadísticas actualizadas

2. **Estadísticas rápidas**
   - Menú: 🚀 BYTE Panel → Ver Estadísticas
   - Popup con resumen

### Ver Historial de Cambios

- Menú: 🚀 BYTE Panel → Ver Historial de Cambios
- Muestra todos los cambios realizados con:
  - Fecha y hora
  - Usuario que modificó
  - Producto modificado
  - Campo modificado
  - Valor anterior y nuevo

### Consejos de Uso

**💡 TIPS**:

1. **Usa filtros**
   - Filtra por Marca, Modelo o Tipo
   - Facilita encontrar productos

2. **Ordena inteligentemente**
   - Ordena por Precio para revisar precios
   - Ordena por Stock para ver inventario bajo

3. **Revisa Dashboard regularmente**
   - Ver productos pendientes de sync
   - Monitorear valor de inventario

4. **Valida antes de guardar**
   - El sistema valida automáticamente:
     - Precios no negativos
     - Stock números enteros
     - Estado solo ACTIVO/INACTIVO

5. **No edites campos bloqueados**
   - Intentar editar campos protegidos muestra advertencia
   - Solo edita columnas marcadas con ✏️

### Errores Comunes

**❌ "Precio debe ser positivo"**
- Ingresaste precio negativo
- Usa solo números positivos

**❌ "Stock debe ser número entero"**
- Ingresaste decimal en stock
- Stock solo acepta números enteros (0, 1, 2, etc.)

**❌ "Estado debe ser ACTIVO o INACTIVO"**
- Escribiste mal el estado
- Solo válidos: `ACTIVO` o `INACTIVO` (mayúsculas)

**❌ "Campo protegido"**
- Intentaste editar columna de solo lectura
- Verifica que estés en columna editable

---

## Funcionalidades

### 📊 Dashboard

**Información Mostrada**:
- Total de productos
- Productos padre vs individuales
- Productos activos vs inactivos
- Productos pendientes de sincronización
- Stock total
- Valor total de inventario
- Top marcas

**Actualización**: Automática al abrir

### 🔄 Sincronización Automática

**Shopify → Sheets**:
- Frecuencia: Cada 15 minutos
- Obtiene todos los productos
- Actualiza datos en Google Sheets
- Mantiene sincronizado el catálogo

**Sheets → Shopify**:
- Frecuencia: Cada 15 minutos
- Lee productos modificados
- Actualiza en Shopify
- Marca como sincronizado

### ✅ Validaciones

**Automáticas en tiempo real**:
- Precios no negativos
- Stock números enteros positivos
- Estado solo ACTIVO/INACTIVO
- Formato de datos correcto

### 📜 Historial

**Registro completo**:
- Fecha y hora de cada cambio
- Usuario que modificó
- Producto afectado
- Campo modificado
- Valor anterior y nuevo

**Usos**:
- Auditoría de cambios
- Deshacer modificaciones
- Seguimiento de actualizaciones

### 🎨 Formato Visual BYTE

**Colores corporativos**:
- `#0066CC` - BYTE Blue (principal)
- `#003366` - BYTE Dark (encabezados)

**Color coding**:
- 🟦 Azul claro: Productos PADRE
- 🟧 Naranja claro: Productos INDIVIDUALES
- 🟩 Verde: Estado ACTIVO
- 🟥 Rojo: Estado INACTIVO
- 🟨 Amarillo: Modificado (pendiente sync)

### 🔒 Protecciones

**Campos protegidos**:
- IDs de Shopify
- Handle (identificador único)
- SKU
- Tipo de producto
- Marca y Modelo
- Categoría
- Metadata del sistema

**Advertencias**:
- Al intentar editar campo protegido
- Al ingresar dato inválido
- Antes de sincronización masiva

---

## Sincronización Automática

### Configuración n8n

**Workflow**: `n8n-workflow-control-panel.json`

**Trigger**: Cada 15 minutos

**Nodos principales**:

1. **⏰ Trigger** - Schedule cada 15 min
2. **📦 Fetch Shopify** - Obtiene productos
3. **🔄 Transform** - Convierte formato
4. **📝 Write Sheets** - Escribe en Google Sheets
5. **📖 Read Modified** - Lee productos modificados
6. **⬆️ Update Shopify** - Actualiza Shopify

### Rate Limiting

**Configuración segura**:
- Delay: 600ms entre requests
- Velocidad: ~1.66 req/seg
- Límite Shopify: 2 req/seg
- ✅ Margen de seguridad del 17%

**Sin cargos adicionales**:
- Dentro de límites gratuitos de Shopify
- Sin riesgo de throttling
- Estable y confiable

### Logs y Monitoreo

**En n8n**:
- Ver ejecuciones: Executions
- Logs detallados por nodo
- Errores y warnings
- Tiempo de ejecución

**En Google Sheets**:
- Columna "Última Sync" muestra fecha
- Dashboard muestra productos pendientes
- Historial registra todos los cambios

---

## Preguntas Frecuentes

### General

**¿Es realmente gratis?**
Sí, 100% gratis:
- Google Sheets: Gratis (hasta 5M celdas)
- n8n self-hosted: Gratis (código abierto)
- Google Apps Script: Incluido en Sheets
- Shopify API: Incluida en tu plan

**¿Necesito conocimientos técnicos?**
No para usar el panel:
- Interfaz simple tipo Excel
- Solo edita campos permitidos
- Sincronización automática

Sí para instalación inicial:
- Requiere configurar n8n (una sola vez)
- Configurar Google Apps Script (una sola vez)
- BYTE puede hacerlo por ti

**¿Qué pasa si cometo un error?**
- Validaciones evitan errores comunes
- Historial registra todos los cambios
- Puedes revisar y corregir
- La sincronización es reversible

### Sincronización

**¿Cada cuánto se sincroniza?**
Cada 15 minutos automáticamente.
También puedes sincronizar manualmente.

**¿Puedo cambiar la frecuencia?**
Sí, en el workflow de n8n:
- Mínimo recomendado: 15 minutos
- Máximo: Lo que necesites

**¿Qué pasa si hay conflictos?**
El sistema prioriza:
1. Cambios en Sheets sobre Shopify
2. Último cambio gana
3. Se registra en historial

**¿Puedo pausar la sincronización?**
Sí:
- En n8n: Desactiva el workflow
- Temporalmente: Marca "Sincronizar" como "NO"

### Productos

**¿Cuántos productos soporta?**
- Google Sheets: Hasta 5,000,000 celdas
- Con 20 columnas: ~250,000 productos
- Más que suficiente para Rodavial

**¿Qué productos se muestran?**
Todos los productos de Shopify:
- Productos padre (con variantes)
- Productos individuales
- Activos e inactivos

**¿Puedo crear productos nuevos?**
No desde el panel (por ahora).
Para crear productos:
1. Usa Shopify Admin
2. O el script de carga masiva
3. El panel los sincronizará automáticamente

**¿Puedo eliminar productos?**
No desde el panel (por seguridad).
Para eliminar:
1. Marca como INACTIVO
2. O elimina desde Shopify Admin

### Seguridad

**¿Quién puede acceder?**
- Solo usuarios con acceso al Google Sheet
- Configura permisos en: Share → Add people

**¿Se guardan los cambios?**
Sí:
- Google Sheets: Auto-save
- Historial: Registro permanente
- n8n: Logs de ejecución

**¿Qué pasa si pierdo internet?**
- Google Sheets trabaja offline (cambios locales)
- Sincronización se reanuda al reconectar
- Sin pérdida de datos

---

## Soporte Técnico

### BYTE Support

**Contacto**:
- 📧 Email: contacto@byte.com.ar
- 🌐 Web: www.byte.com.ar
- 📱 WhatsApp: +54 9 11 XXXX-XXXX
- 📞 Tel: (011) XXXX-XXXX

**Horario de Atención**:
- Lunes a Viernes: 9:00 - 18:00 hs
- Sábados: 9:00 - 13:00 hs

### Niveles de Soporte

**🟢 Básico** (Incluido):
- Instalación inicial
- Configuración de workflow
- Guía de uso
- Resolución de dudas

**🟡 Standard** (Opcional):
- Soporte prioritario
- Personalizaciones simples
- Capacitación del equipo

**🔴 Premium** (Opcional):
- Soporte 24/7
- Desarrollos custom
- Integraciones adicionales
- SLA garantizado

### Documentación Adicional

- **Guía de Usuario**: `BYTE_USER_GUIDE.pdf`
- **Manual Técnico**: `BYTE_TECH_MANUAL.pdf`
- **Video Tutoriales**: YouTube BYTE Channel

---

## 🚀 Powered by BYTE

**BYTE** - Soluciones tecnológicas a medida

Desarrollamos software personalizado para empresas que buscan:
- ✅ Automatización de procesos
- ✅ Integración de sistemas
- ✅ Optimización de flujos de trabajo
- ✅ Soluciones escalables y mantenibles

**Otros servicios BYTE**:
- Desarrollo de aplicaciones web
- Integraciones de APIs
- Automatización con n8n
- Consultoría tecnológica

---

## Licencia

© 2025 BYTE. Todos los derechos reservados.

Este software fue desarrollado específicamente para **Rodavial** por **BYTE**.

El uso, modificación o distribución está sujeto a los términos del contrato de servicio.

---

**¿Preguntas? ¿Sugerencias?**

Contacta a BYTE:
📧 contacto@byte.com.ar
🌐 www.byte.com.ar

---

<div align="center">

![BYTE Logo](../src/media/Byte.png)

**Desarrollado con ❤️ por BYTE**

[🌐 Web](https://www.byte.com.ar) | [📧 Email](mailto:contacto@byte.com.ar) | [💼 LinkedIn](#) | [📱 WhatsApp](#)

</div>
