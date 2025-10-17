# Google Sheets to Shopify Sync

Aplicación Node.js con TypeScript para sincronizar productos de neumáticos desde Google Sheets a Shopify con estructura dual (productos padre + individuales).

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (ya está configurado)
# Ver .env con tus credenciales

# 3. Probar el sistema optimizado
npm run test:optimized
```

## ✨ Características

- ✅ Lectura de datos desde Google Sheets (API Key o Service Account)
- ✅ **Estructura dual de productos**:
  - **Productos PADRE**: 1 por modelo con todas las medidas como variantes
  - **Productos INDIVIDUALES**: 1 por medida como producto separado
- ✅ Handles únicos y consistentes con SKU
- ✅ Inventario automático (20 unidades por defecto)
- ✅ Batch processing con rate limiting
- ✅ Sincronización modelo por modelo
- ✅ Precios con IVA incluido
- ✅ Descripción desde columna E (Descripción)

## 📦 Requisitos

- Node.js 18+
- npm o yarn
- Google Sheets API (API Key o Service Account)
- Tienda de Shopify con Admin API access

## 🧪 Scripts Disponibles

```bash
# Test del sistema optimizado (RECOMENDADO)
npm run test:optimized

# Sincronización completa de todos los modelos
npm run sync:all

# Test con un solo modelo (sistema anterior)
npm run test:one

# Desarrollo
npm run dev

# Build
npm run build
```

## 📚 Documentación

Toda la documentación está en la carpeta **[Documentacion/](Documentacion/)**:

### Guías de Inicio
- **[INICIO_RAPIDO.md](Documentacion/INICIO_RAPIDO.md)**: Guía para empezar en minutos
- **[SETUP.md](Documentacion/SETUP.md)**: Configuración detallada paso a paso
- **[VERIFICAR_ANTES_DE_EJECUTAR.md](Documentacion/VERIFICAR_ANTES_DE_EJECUTAR.md)**: Checklist pre-ejecución

### Configuración
- **[COMO_USAR_API_KEY.md](Documentacion/COMO_USAR_API_KEY.md)**: Autenticación con API Key (más simple)
- **[DONDE_OBTENER_CREDENTIALS.md](Documentacion/DONDE_OBTENER_CREDENTIALS.md)**: Service Account (más seguro)

### Estructura de Datos
- **[ESTRUCTURA_DATOS.md](Documentacion/ESTRUCTURA_DATOS.md)**: Columnas del Google Sheet y mapeo a Shopify

### Sistema Optimizado
- **[SISTEMA_OPTIMIZADO.md](Documentacion/SISTEMA_OPTIMIZADO.md)**: ⭐ Guía del sistema optimizado
- **[OPTIMIZACIONES.md](Documentacion/OPTIMIZACIONES.md)**: Detalles técnicos de las optimizaciones

## 🎯 Flujo de Sincronización

```
Google Sheet (Panel_Precios)
        ↓
Agrupación por Modelo
        ↓
┌──────────────────────┐
│  Por cada Modelo:    │
│                      │
│  1. Crear PADRE      │
│     (con variantes)  │
│                      │
│  2. Delay (2s)       │
│                      │
│  3. Crear INDIV.     │
│     (en batches)     │
└──────────────────────┘
        ↓
    Shopify
```

## 📊 Estructura del Proyecto

```
AppSVGtoShopify/
├── src/
│   ├── config/
│   │   └── index.ts                   # Configuración
│   ├── services/
│   │   ├── googleSheets.ts            # Lectura de Google Sheets
│   │   ├── optimizedTransformer.ts    # ⭐ Transformer optimizado
│   │   ├── optimizedUploader.ts       # ⭐ Uploader con batches
│   │   └── optimizedSync.ts           # ⭐ Orquestador
│   ├── utils/
│   │   └── handleGenerator.ts         # ⭐ Generación de handles
│   ├── types/
│   │   └── index.ts                   # Tipos TypeScript
│   ├── testOptimized.ts               # ⭐ Test del sistema optimizado
│   └── syncAll.ts                     # ⭐ Sincronización completa
├── Documentacion/                      # 📚 Toda la documentación
├── .env                                # Credenciales (no versionar)
└── README.md                           # Este archivo
```

## 🔧 Configuración Rápida

El archivo `.env` ya está configurado con tus credenciales:

```env
GOOGLE_SHEET_ID=tu_google_sheet_id_aqui
GOOGLE_API_KEY=tu_google_api_key_aqui
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_tu_access_token_aqui
```

## 🎓 Sistema Dual de Productos

Cada producto del Sheet se sube **dos veces**:

### 1. Producto PADRE
- **Title**: `Marca + Modelo` (ej: "Michelin PILOT SPORT 4 S")
- **Handle**: `marca-modelo-p` (sufijo `-p`)
- **Variantes**: TODAS las medidas del modelo
- **Stock**: 20 unidades por variante

### 2. Productos INDIVIDUALES
- **Title**: `Marca + Modelo + Medida` (ej: "Michelin PILOT SPORT 4 S 225/40 R18")
- **Handle**: `marca-modelo-medida-sku-i` (sufijo `-i`, incluye SKU)
- **Variantes**: 1 sola (la medida específica)
- **Stock**: 20 unidades

## 🚀 Primer Uso

1. **Ejecuta el test optimizado**:
   ```bash
   npm run test:optimized
   ```

2. **Verifica en Shopify**:
   - Ve a: https://tu-tienda.myshopify.com/admin/products
   - Busca el modelo que se subió
   - Verifica que el padre tenga las variantes
   - Verifica que los individuales se hayan creado

3. **Si todo funciona, sincroniza todo**:
   ```bash
   npm run sync:all
   ```

## 💡 Ventajas del Sistema Optimizado

| Aspecto | Antes ❌ | Ahora ✅ |
|---------|---------|---------|
| **Handles** | Inconsistentes | Centralizados con SKU |
| **Descripción** | Falla con espacios | Normalización Unicode |
| **Individuales** | 0 encontrados | Todos correctos |
| **Rate Limits** | Sin protección | Batches + Delays |
| **Inventario** | Manual | Automático (20 unidades) |
| **Orden** | Caótico | Modelo completo por vez |
| **Trazabilidad** | Difícil | Modelo por modelo |

## 🐛 Solución de Problemas

### Error: "Cannot initialize Shopify API"
- Verifica `SHOPIFY_ACCESS_TOKEN` en `.env`
- Confirma que `SHOPIFY_SHOP_DOMAIN` tiene el formato correcto

### Error: Google Sheets API
- Verifica que el Sheet es público (si usas API Key)
- Verifica `GOOGLE_API_KEY` en `.env`

### Rate Limits
- Los delays están configurados para ser seguros
- Si recibes 429 errors, el sistema tiene retry automático

## 📖 Más Información

- **[SISTEMA_OPTIMIZADO.md](Documentacion/SISTEMA_OPTIMIZADO.md)**: Guía completa del sistema optimizado
- **[OPTIMIZACIONES.md](Documentacion/OPTIMIZACIONES.md)**: Documentación técnica detallada

## 🔒 Seguridad

Archivos que **NUNCA** debes versionar:
- `.env` (credenciales)
- `credentials.json` (Service Account)
- `/temp/` (archivos temporales)

Ya están en `.gitignore`.

## 📝 Licencia

ISC

---

**¿Listo para empezar?** 🚀

```bash
npm run test:optimized
```
