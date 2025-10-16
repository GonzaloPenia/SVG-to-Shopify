<<<<<<< HEAD
# SVG-to-Shopify
App que permite subir un SVG con un listado de productos y agregarlos a una tienda online de Shopify 
=======
# Google Sheets to Shopify Sync

Aplicación Node.js con TypeScript para sincronizar precios desde Google Sheets a Shopify.

## Características

- Lee datos desde Google Sheets (hojas "Panel_Precios" y "Padres")
- Transforma datos al formato CSV compatible con Shopify
- Exporta CSV para importación manual
- Sube productos directamente a Shopify vía Admin API
- Actualiza solo precios de productos existentes
- Validación de datos antes de procesar
- Control de rate limits para API de Shopify

## Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Google Cloud con acceso a Google Sheets API
- Tienda de Shopify con acceso a Admin API

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd AppSVGtoShopify
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales.

## Configuración

### Google Sheets API

**Tienes 2 opciones para autenticarte con Google Sheets:**

#### Opción 1: API Key (Más Simple) ⭐

**Si conseguiste una API Key:**
- 👉 Lee [COMO_USAR_API_KEY.md](COMO_USAR_API_KEY.md)
- Requiere que el Google Sheet sea público
- Configuración en 4 pasos
- Perfecto para empezar rápidamente

#### Opción 2: Service Account (Más Seguro)

**Si prefieres sheets privados:**
- 👉 Lee [DONDE_OBTENER_CREDENTIALS.md](DONDE_OBTENER_CREDENTIALS.md)
- Permite sheets privados
- Requiere crear `credentials.json`
- Recomendado para producción

**Resumen del método Service Account:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita la Google Sheets API
4. Crea una cuenta de servicio (Service Account)
5. Descarga las credenciales JSON → `credentials.json`
6. Comparte tu Sheet con el email de la cuenta de servicio

### Shopify Admin API

#### Opción 1: Custom App (Recomendado)

1. En tu Shopify Admin, ve a **Settings > Apps and sales channels**
2. Clic en **Develop apps**
3. Crea una nueva app
4. En **Configuration**, activa:
   - `read_products`
   - `write_products`
5. Instala la app y copia el **Admin API access token**

#### Opción 2: Private App (Método antiguo)

1. Ve a **Apps > Manage private apps**
2. Crea una nueva private app
3. Activa los permisos necesarios
4. Copia el **API Password**

### Variables de entorno

```env
# Google Sheets
GOOGLE_SHEET_ID=1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
GOOGLE_CREDENTIALS_PATH=./credentials.json
PANEL_PRECIOS_SHEET_NAME=Panel_Precios
PADRES_SHEET_NAME=Padres

# Shopify
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu_access_token
SHOPIFY_API_VERSION=2024-01

# Output
OUTPUT_CSV_PATH=./output/shopify_products.csv
```

## Uso

### Modo 1: Generar CSV (Recomendado para primera vez)

Genera un archivo CSV que puedes importar manualmente en Shopify:

```bash
npm run sync
# o específicamente:
npm run sync csv
```

El archivo se generará en `./output/shopify_products.csv`

**Para importar en Shopify:**
1. Ve a **Products > Import**
2. Sube el archivo CSV generado
3. Mapea las columnas si es necesario
4. Confirma la importación

### Modo 2: Subir directamente a Shopify

Sube productos automáticamente vía API:

```bash
npm run sync upload
```

Este modo:
- Crea productos nuevos
- Actualiza productos existentes (busca por Handle)
- Respeta rate limits de Shopify
- Procesa en batches de 10 productos

### Modo 3: Actualizar solo precios

Actualiza únicamente los precios de productos existentes:

```bash
npm run sync prices-only
```

Útil para sincronizaciones frecuentes de precios sin modificar otros datos.

### Generar CSV de muestra

Para ver la estructura esperada:

```bash
npm run sync sample
```

## Estructura del Proyecto

```
AppSVGtoShopify/
├── src/
│   ├── config/
│   │   └── index.ts           # Configuración y variables de entorno
│   ├── services/
│   │   ├── googleSheets.ts    # Lectura de Google Sheets
│   │   ├── dataTransformer.ts # Transformación de datos
│   │   ├── csvExporter.ts     # Exportación a CSV
│   │   └── shopifyUploader.ts # Subida a Shopify API
│   ├── types/
│   │   └── index.ts           # Tipos TypeScript
│   └── index.ts               # Punto de entrada principal
├── output/                     # Archivos CSV generados
├── .env                        # Variables de entorno (no versionar)
├── .env.example                # Ejemplo de configuración
├── credentials.json            # Credenciales de Google (no versionar)
├── package.json
├── tsconfig.json
└── README.md
```

## Mapeo de Datos

### Estructura del Google Sheet

Esta aplicación trabaja con un Google Sheet de catálogo de neumáticos que contiene:

1. **Panel_Precios**: Fuente de precios e inventario actualizado
   - Columnas principales: SKU/CAI, Marca, Modelo, Medida, Precio con IVA, Precio sin IVA, Stock, Estado, Handle
   - Se actualiza frecuentemente con datos del sistema de gestión

2. **Padres**: Plantilla completa en formato Shopify (47 columnas)
   - Contiene toda la estructura de productos lista para Shopify
   - Incluye: descripciones, imágenes, SEO, metafields, etc.
   - Se actualiza manualmente cuando hay cambios en información de productos

### Lógica de Sincronización

La aplicación hace un **merge inteligente**:

```
Panel_Precios (precios) + Padres (plantilla) = CSV Shopify
```

**Proceso:**
1. Lee la hoja **Padres** (estructura completa del producto)
2. Busca precios actualizados en **Panel_Precios** usando el **Handle** como clave
3. Si encuentra el producto en Panel_Precios:
   - Actualiza: `Variant Price` → **Precio con IVA** (precio de venta final)
   - Mantiene: `Variant Compare At Price` desde Padres (precio tachado/antes)
   - Actualiza: `Status` → Estado del producto
4. Mantiene todo lo demás desde Padres (título, descripción, imágenes, etc.)

**Nota:** Shopify siempre trabaja con precios con IVA incluido.

**Campo clave:** El `Handle` debe ser idéntico en ambas hojas para vincular los datos.

Ver [ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md) para detalles completos de las columnas y el flujo de datos.

## Formato CSV de Shopify

El archivo CSV generado incluye todas las columnas requeridas por Shopify:

- Handle (identificador único)
- Title, Description, Vendor, Type, Tags
- Variantes (SKU, Price, Compare At Price)
- Inventario y envío
- Imágenes
- SEO y Google Shopping
- Y más...

Ver [documentación oficial de Shopify](https://help.shopify.com/en/manual/products/import-export/using-csv) para más detalles.

## Solución de Problemas

### Error: "Archivo de credenciales no encontrado"

Asegúrate de que `credentials.json` está en la raíz del proyecto y la ruta en `.env` es correcta.

### Error: "No autenticado con Google Sheets"

Verifica que compartiste el Google Sheet con el email de la cuenta de servicio.

### Error: "Shopify API authentication failed"

- Verifica que el `SHOPIFY_ACCESS_TOKEN` es correcto
- Confirma que tu app tiene los permisos `read_products` y `write_products`
- Asegúrate de que `SHOPIFY_SHOP_DOMAIN` tiene el formato correcto: `tienda.myshopify.com`

### Productos no se importan en Shopify

- Revisa que los campos requeridos (Handle, Title, Price) estén presentes
- Verifica el formato del CSV con la opción `sample`
- Consulta los logs para ver errores de validación

### Rate Limit de Shopify

Si recibes errores 429 (Too Many Requests):
- Aumenta el `delayMs` en [src/services/shopifyUploader.ts](src/services/shopifyUploader.ts)
- Reduce el `batchSize`

## Scripts disponibles

```bash
npm run build     # Compila TypeScript a JavaScript
npm run start     # Ejecuta la versión compilada
npm run dev       # Ejecuta en modo desarrollo
npm run sync      # Ejecuta sincronización (varios modos)
```

## Seguridad

- **NUNCA** versiones archivos sensibles:
  - `.env` (credenciales)
  - `credentials.json` (cuenta de servicio Google)
  - `token.json` (tokens de OAuth)
  - `/output/` (archivos con datos de productos)

Estos archivos ya están incluidos en [.gitignore](.gitignore).

## Licencia

ISC

## Soporte

Para problemas o preguntas, abre un issue en el repositorio.

---

**Nota importante**: Esta aplicación está diseñada como punto de partida. Deberás ajustar el mapeo de columnas en [src/services/dataTransformer.ts](src/services/dataTransformer.ts) según la estructura específica de tus hojas de Google Sheets.
>>>>>>> d96d7ac (first commit)
"# SVG-to-Shopify" 
