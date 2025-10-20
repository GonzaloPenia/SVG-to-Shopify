<div align="center">

![BYTE Logo](src/media/Byte.png)

# 🚀 BYTE - Panel de Control Shopify

### Gestiona tu tienda Shopify desde Google Sheets

**Desarrollado por BYTE para Rodavial**

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![BYTE](https://img.shields.io/badge/Powered%20by-BYTE-0066CC.svg)](https://www.byte.com.ar)

[🚀 Inicio Rápido](#inicio-rápido) •
[📖 Documentación](#documentación) •
[💡 Características](#características) •
[🎯 Uso](#uso) •
[🛠️ Soporte](#soporte)

</div>

---

## 🌟 Descripción

**BYTE Panel de Control** es una solución completa que permite a Rodavial gestionar todo su catálogo de productos Shopify directamente desde Google Sheets, sin necesidad de conocimientos técnicos.

### ¿Por qué BYTE Panel?

- ✅ **Simple**: Interfaz familiar tipo Excel
- ✅ **Gratis**: 100% opensource y sin costos
- ✅ **Automático**: Sincronización cada 15 minutos
- ✅ **Seguro**: Validaciones y protecciones integradas
- ✅ **Completo**: Dashboard, estadísticas e historial

---

## 🎯 Características

### Gestión Integral

- 📝 Editar títulos y descripciones
- 💰 Actualizar precios y descuentos
- 📦 Controlar stock
- 🔄 Activar/desactivar productos

### Sincronización Bidireccional

```
Shopify ←────┬────→ Google Sheets
             │
             │ n8n (cada 15 min)
             │
             ▼
      Actualizaciones
      automáticas
```

### Dashboard en Tiempo Real

- 📊 Estadísticas del catálogo
- 💵 Valor total de inventario
- 📦 Stock por marca
- 🔄 Productos pendientes de sync

### Protecciones y Validaciones

- 🔒 Campos críticos protegidos
- ✅ Validación automática de datos
- 📜 Historial completo de cambios
- ⚠️ Advertencias preventivas

---

## 🚀 Inicio Rápido

### Requisitos

- ✅ Google Account
- ✅ n8n (self-hosted o cloud)
- ✅ Shopify Store con Admin API access

### Instalación en 3 Pasos

#### 1️⃣ Importar Workflow n8n

```bash
# En n8n:
Workflows → Import from File → n8n-workflow-control-panel.json
```

#### 2️⃣ Configurar Google Sheets

```bash
# Crear nuevo Sheet
# Copiar estructura de Documentacion/BYTE_CONTROL_PANEL.md
# Instalar Google Apps Script:
Extensions → Apps Script → Pegar código de google-apps-script-panel.gs
```

#### 3️⃣ Activar Sincronización

```bash
# En n8n:
# - Configurar credenciales (Google Sheets + Shopify)
# - Activar workflow
# - Ejecutar primera sync
```

**¡Listo! Tu panel está funcionando** ✅

---

## 📖 Documentación

### Documentación Completa

- 📘 **[Guía de Instalación](Documentacion/BYTE_CONTROL_PANEL.md)** - Paso a paso completo
- 📗 **[Guía de Usuario](Documentacion/BYTE_USER_GUIDE.md)** - Para equipo de Rodavial
- 📕 **[Manual Técnico](Documentacion/BYTE_TECH_MANUAL.md)** - Detalles técnicos
- 📙 **[FAQ](Documentacion/BYTE_FAQ.md)** - Preguntas frecuentes

### Archivos del Proyecto

```
AppSVGtoShopify/
├── 📄 n8n-workflow-control-panel.json    # Workflow n8n
├── 📄 google-apps-script-panel.gs        # Script Google Sheets
├── 📂 Documentacion/
│   ├── BYTE_CONTROL_PANEL.md            # Documentación principal
│   ├── BYTE_USER_GUIDE.md               # Guía usuario
│   └── BYTE_TECH_MANUAL.md              # Manual técnico
├── 📂 src/
│   └── media/
│       └── Byte.png                     # Logo BYTE
└── 📄 BYTE_README.md                    # Este archivo
```

---

## 💡 Características Técnicas

### Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                  BYTE PANEL v1.0                    │
│              Powered by BYTE 🚀                     │
└─────────────────────────────────────────────────────┘
              │
              ├─── n8n Workflow (Automatización)
              │    └─ Sincronización bidireccional
              │
              ├─── Google Apps Script (Lógica)
              │    ├─ Detección de cambios
              │    ├─ Validaciones
              │    └─ Historial
              │
              ├─── Google Sheets (Interface)
              │    ├─ Hoja Productos
              │    ├─ Dashboard
              │    └─ Historial
              │
              └─── Shopify API (Backend)
                   └─ Admin REST API 2024-01
```

### Stack Tecnológico

| Componente | Tecnología | Costo |
|------------|------------|-------|
| **Frontend** | Google Sheets | Gratis |
| **Backend** | Shopify Admin API | Incluido |
| **Automatización** | n8n (self-hosted) | Gratis |
| **Lógica** | Google Apps Script | Gratis |
| **Storage** | Google Drive | Gratis |

**TOTAL: $0 USD/mes** 🎉

### Especificaciones

- **Capacidad**: Hasta 250,000 productos
- **Sincronización**: Cada 15 minutos
- **Rate Limiting**: 1.66 req/seg (dentro de límites)
- **Validaciones**: Tiempo real
- **Historial**: Ilimitado

---

## 🎯 Uso

### Para el Equipo de Rodavial

#### 1. Editar Productos

```
1. Abrir Google Sheet
2. Buscar producto (filtros o Ctrl+F)
3. Editar campos permitidos ✏️:
   - Título
   - Descripción
   - Precio
   - Stock
   - Estado
4. Sistema detecta cambios automáticamente
5. Sincronización automática en 15 min
```

#### 2. Ver Estadísticas

```
Menú: 🚀 BYTE Panel → Ver Dashboard

Muestra:
- Total productos
- Productos activos/inactivos
- Stock total
- Valor inventario
- Top marcas
```

#### 3. Revisar Historial

```
Menú: 🚀 BYTE Panel → Ver Historial de Cambios

Ver:
- Quién modificó
- Qué modificó
- Cuándo
- Valores anteriores/nuevos
```

### Campos Editables vs Solo Lectura

| Campo | Tipo | Descripción |
|-------|------|-------------|
| 🔒 ID Producto | Solo Lectura | Identificador Shopify |
| 🔒 Handle | Solo Lectura | URL del producto |
| ✏️ Título | Editable | Nombre del producto |
| ✏️ Descripción | Editable | Descripción corta |
| ✏️ Precio | Editable | Precio de venta |
| ✏️ Stock | Editable | Cantidad disponible |
| ✏️ Estado | Editable | ACTIVO/INACTIVO |
| 🔒 Marca | Solo Lectura | Calculado automáticamente |

---

## 🔧 Configuración Avanzada

### Cambiar Frecuencia de Sincronización

En n8n workflow, editar nodo "⏰ Trigger":

```javascript
// Cada 15 minutos (default)
minutesInterval: 15

// Cada 30 minutos
minutesInterval: 30

// Cada 1 hora
minutesInterval: 60
```

### Personalizar Validaciones

En Google Apps Script, función `aplicarValidaciones()`:

```javascript
// Precio mínimo
if (col === 10 && value < 1000) {
  alert('Precio debe ser mayor a $1000');
  return;
}

// Stock mínimo de seguridad
if (col === 12 && value < 5) {
  alert('Advertencia: Stock bajo (< 5 unidades)');
}
```

### Agregar Campos Custom

1. Agregar columna en Google Sheets
2. Actualizar n8n workflow (transform node)
3. Actualizar Apps Script (onEdit function)

---

## 📊 Dashboard

### Vista Dashboard

```
╔══════════════════════════════════════════════════════╗
║       🚀 BYTE - Panel de Control Shopify             ║
╚══════════════════════════════════════════════════════╝

📊 ESTADÍSTICAS GENERALES
────────────────────────────────────────────────────────
Total de Productos:           791
Productos Padre:              70
Productos Individuales:       721

Estado:
  ✅ Activos:                 785
  ❌ Inactivos:               6

Modificados (pendientes):     3    ⚠️

Inventario:
  📦 Stock Total:             15,820 unidades
  💰 Valor Total:             $45,234,567.89

📦 TOP MARCAS
────────────────────────────────────────────────────────
  Michelin                    458
  BFGoodrich                  333

🕐 Última actualización:      17/01/2025 14:35:22
────────────────────────────────────────────────────────
              Powered by BYTE 🚀
```

---

## 🛡️ Seguridad

### Protecciones Implementadas

- 🔒 **Campos críticos protegidos**: IDs, Handles, SKUs
- ✅ **Validación de datos**: Precios, stock, estados
- 📜 **Auditoría completa**: Historial de todos los cambios
- 👤 **Control de acceso**: Permisos de Google Sheet
- 🔐 **API segura**: Shopify Admin API con tokens

### Buenas Prácticas

1. **Acceso limitado**: Solo personal autorizado
2. **Revisión regular**: Dashboard y estadísticas
3. **Backup**: Google Sheets auto-save
4. **Historial**: Revisar cambios sospechosos
5. **Validar antes de sincronizar**: Marcar solo cuando esté seguro

---

## 🐛 Troubleshooting

### Problemas Comunes

#### ❌ "No se sincroniza"

**Solución**:
```
1. Verificar n8n workflow está activo
2. Revisar logs de ejecución en n8n
3. Verificar credenciales válidas
4. Check internet connection
```

#### ❌ "Error al editar campo"

**Solución**:
```
1. Verificar que el campo sea editable ✏️
2. Validar formato del dato
3. Refrescar página
```

#### ❌ "Productos duplicados"

**Solución**:
```
1. Verificar handles únicos
2. Limpiar hoja y re-sincronizar
3. Contactar soporte BYTE
```

### Logs y Debugging

**En n8n**:
- Executions → Ver ejecución fallida
- Check error message
- Revisar node específico

**En Google Apps Script**:
- View → Logs
- Ver errores de ejecución

**En Google Sheets**:
- Hoja "Historial"
- Columna "Modificado"

---

## 🆘 Soporte

### BYTE Support

<div align="center">

📧 **Email**: contacto@byte.com.ar
🌐 **Web**: www.byte.com.ar
📱 **WhatsApp**: +54 9 11 XXXX-XXXX
📞 **Tel**: (011) XXXX-XXXX

**Horario**
Lunes a Viernes: 9:00 - 18:00 hs
Sábados: 9:00 - 13:00 hs

</div>

### Canales de Soporte

| Canal | Tiempo de Respuesta | Disponibilidad |
|-------|---------------------|----------------|
| 📧 Email | < 24 horas | 24/7 |
| 📱 WhatsApp | < 2 horas | Horario laboral |
| 📞 Teléfono | Inmediato | Horario laboral |

### Niveles de Soporte

**🟢 Básico** (Incluido):
- Instalación inicial
- Configuración básica
- Guía de uso
- Resolución de dudas comunes

**🟡 Standard** (Opcional):
- Soporte prioritario
- Personalizaciones simples
- Capacitación equipo (2 horas)

**🔴 Premium** (Opcional):
- Soporte 24/7
- Desarrollos custom
- Integraciones adicionales
- SLA garantizado

---

## 📝 Changelog

### v1.0.0 (Enero 2025)

**✨ Features**:
- Sincronización bidireccional Shopify ↔ Google Sheets
- Dashboard con estadísticas en tiempo real
- Historial completo de cambios
- Validaciones automáticas
- Protección de campos críticos
- Formato visual con branding BYTE

**🐛 Bug Fixes**:
- N/A (primera versión)

**📚 Documentación**:
- Guía completa de instalación
- Manual de usuario
- Manual técnico
- FAQ

---

## 🗺️ Roadmap

### v1.1 (Q1 2025)

- [ ] Webhooks para sincronización en tiempo real
- [ ] Notificaciones por email de cambios
- [ ] Exportación a Excel
- [ ] Filtros avanzados

### v1.2 (Q2 2025)

- [ ] Creación de productos desde Sheets
- [ ] Gestión de imágenes
- [ ] Multi-idioma
- [ ] App móvil

### v2.0 (Q3 2025)

- [ ] AI para sugerencias de precios
- [ ] Análisis predictivo de stock
- [ ] Integración con ERP
- [ ] Multi-tienda

---

## 👥 Equipo BYTE

<div align="center">

**Desarrollado con ❤️ por BYTE**

| Rol | Responsable |
|-----|-------------|
| 💻 Desarrollo | Equipo BYTE Dev |
| 🎨 Diseño | Equipo BYTE Design |
| 📚 Documentación | Equipo BYTE Docs |
| 🛠️ Soporte | BYTE Support Team |

</div>

---

## 📜 Licencia

© 2025 BYTE. Todos los derechos reservados.

Este software fue desarrollado específicamente para **Rodavial** por **BYTE**.

El uso, modificación o distribución está sujeto a los términos del contrato de servicio entre BYTE y Rodavial.

---

## 🎓 Recursos Adicionales

### Tutoriales

- 🎥 [Video: Instalación completa](https://youtube.com/byte)
- 🎥 [Video: Guía de uso para usuarios](https://youtube.com/byte)
- 🎥 [Video: Configuración avanzada](https://youtube.com/byte)

### Documentación Externa

- [n8n Documentation](https://docs.n8n.io/)
- [Shopify Admin API](https://shopify.dev/docs/api/admin-rest)
- [Google Apps Script](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)

### Comunidad

- 💬 [BYTE Community Forum](#)
- 🐦 [Twitter @BYTE](#)
- 💼 [LinkedIn BYTE](#)

---

## 🙏 Agradecimientos

**Gracias a**:
- **Rodavial** - Por confiar en BYTE
- **n8n Community** - Por la plataforma increíble
- **Shopify** - Por su excelente API
- **Google** - Por Apps Script y Sheets

---

<div align="center">

## 🚀 ¿Listo para empezar?

[📥 Descargar](https://github.com/byte/shopify-panel) •
[📖 Documentación](Documentacion/BYTE_CONTROL_PANEL.md) •
[💬 Soporte](mailto:contacto@byte.com.ar)

---

![BYTE Logo](src/media/Byte.png)

**BYTE - Soluciones Tecnológicas a Medida**

[🌐 Website](https://www.byte.com.ar) |
[📧 Email](mailto:contacto@byte.com.ar) |
[💼 LinkedIn](#) |
[📱 WhatsApp](#)

**Desarrollamos software que impulsa tu negocio** 🚀

---

⭐ Si te gusta BYTE Panel, compártelo con otros comercios

</div>
