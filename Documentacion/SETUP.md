# Guía de Configuración Paso a Paso

Esta guía te llevará desde cero hasta tener la aplicación funcionando.

## Paso 1: Configurar Google Sheets API

### 1.1 Crear proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Clic en el selector de proyectos (arriba a la izquierda)
3. Clic en **NEW PROJECT**
4. Nombre: "Shopify Sync" (o el que prefieras)
5. Clic en **CREATE**

### 1.2 Habilitar Google Sheets API

1. En el menú lateral, ve a **APIs & Services > Library**
2. Busca "Google Sheets API"
3. Clic en **ENABLE**

### 1.3 Crear cuenta de servicio

1. Ve a **APIs & Services > Credentials**
2. Clic en **CREATE CREDENTIALS > Service account**
3. Completa el formulario:
   - Service account name: "shopify-sync-bot"
   - Description: "Cuenta para sincronizar datos con Shopify"
4. Clic en **CREATE AND CONTINUE**
5. En "Grant this service account access to project":
   - Role: **Editor** (o solo permisos de Sheets si prefieres)
6. Clic en **DONE**

### 1.4 Descargar credenciales

1. En la lista de Service Accounts, busca la que acabas de crear
2. Clic en el email de la cuenta de servicio
3. Ve a la pestaña **KEYS**
4. Clic en **ADD KEY > Create new key**
5. Selecciona **JSON**
6. Clic en **CREATE**
7. El archivo se descargará automáticamente
8. Renombra el archivo a `credentials.json`
9. Muévelo a la raíz de tu proyecto

### 1.5 Compartir Google Sheet

1. Abre el archivo `credentials.json` que descargaste
2. Busca el campo `client_email` (algo como: `nombre@proyecto.iam.gserviceaccount.com`)
3. Copia ese email
4. Abre tu Google Sheet
5. Clic en **Share** (Compartir)
6. Pega el email de la cuenta de servicio
7. Permisos: **Viewer** (solo lectura)
8. Clic en **Send** (o desmarca "Notify people" si no quieres enviar email)

## Paso 2: Configurar Shopify Admin API

### Opción A: Custom App (Recomendado)

Esta es la forma moderna y recomendada por Shopify.

#### 2.1 Habilitar desarrollo de apps

1. En tu Shopify Admin, ve a **Settings**
2. Clic en **Apps and sales channels**
3. Clic en **Develop apps** (esquina superior derecha)
4. Si es tu primera vez, clic en **Allow custom app development**
5. Lee y acepta los términos

#### 2.2 Crear app

1. Clic en **Create an app**
2. App name: "Google Sheets Sync"
3. Clic en **Create app**

#### 2.3 Configurar permisos

1. En la pantalla de tu app, clic en **Configuration**
2. En "Admin API integration", clic en **Configure**
3. Busca y activa estos permisos:
   - ✅ `read_products`
   - ✅ `write_products`
4. Clic en **Save**

#### 2.4 Instalar app y obtener token

1. Clic en la pestaña **API credentials**
2. En "Access tokens", clic en **Install app**
3. Confirma la instalación
4. Se mostrará el **Admin API access token**
5. **IMPORTANTE**: Copia este token inmediatamente (solo se muestra una vez)
6. Guárdalo en un lugar seguro

### Opción B: Private App (Método antiguo - aún funciona)

Si tu tienda tiene habilitadas las Private Apps:

1. Ve a **Settings > Apps and sales channels**
2. Busca **Develop apps for your store**
3. Si ves la opción, sigue los pasos de la Opción A
4. Si no, contacta soporte de Shopify para más información

## Paso 3: Configurar el Proyecto

### 3.1 Instalar Node.js

Si no tienes Node.js instalado:

1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión LTS (Long Term Support)
3. Instala siguiendo el asistente
4. Verifica la instalación:
```bash
node --version
npm --version
```

### 3.2 Instalar dependencias del proyecto

```bash
cd AppSVGtoShopify
npm install
```

Esto instalará todas las librerías necesarias.

### 3.3 Configurar variables de entorno

1. Abre el archivo `.env` en tu editor de texto favorito

2. Completa cada campo:

```env
# Google Sheets
GOOGLE_SHEET_ID=1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
GOOGLE_CREDENTIALS_PATH=./credentials.json
PANEL_PRECIOS_SHEET_NAME=Panel_Precios
PADRES_SHEET_NAME=Padres

# Shopify
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com  # ← CAMBIA ESTO
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx      # ← PEGA TU TOKEN AQUÍ
SHOPIFY_API_VERSION=2024-01

# Output
OUTPUT_CSV_PATH=./output/shopify_products.csv
```

**Cómo obtener el GOOGLE_SHEET_ID:**

De esta URL:
```
https://docs.google.com/spreadsheets/d/1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI/edit
```

El ID es la parte entre `/d/` y `/edit`:
```
1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
```

## Paso 4: Ajustar el Mapeo de Columnas

**MUY IMPORTANTE**: Debes ajustar el código para que coincida con los nombres de tus columnas.

### 4.1 Identificar tus columnas

Abre tu Google Sheet y anota los nombres exactos de las columnas en ambas hojas:

**Panel_Precios:**
- ¿Cómo se llama la columna de precio?
- ¿Cómo se llama la columna de SKU?
- ¿Cómo se llama la columna de código de barras?
- etc.

**Padres:**
- ¿Cómo se llama la columna de título?
- ¿Cómo se llama la columna de descripción?
- ¿Cómo se llama la columna de vendor?
- etc.

### 4.2 Editar dataTransformer.ts

Abre el archivo [src/services/dataTransformer.ts](src/services/dataTransformer.ts) y busca la función `transformToShopify`.

Reemplaza los nombres de columna genéricos con los tuyos:

```typescript
// ANTES (ejemplo genérico):
const handle = String(precioRow['Handle'] || precioRow['SKU']);
const price = this.formatPrice(precioRow['Price'] || precioRow['Precio']);

// DESPUÉS (con tus columnas reales):
const handle = String(precioRow['codigo_producto']);  // ← TU COLUMNA
const price = this.formatPrice(precioRow['precio_venta']);  // ← TU COLUMNA
```

Haz lo mismo para todas las columnas que uses.

## Paso 5: Probar la Aplicación

### 5.1 Generar CSV de prueba

Primero, genera un CSV para verificar que todo funciona:

```bash
npm run sync csv
```

Si todo está bien, verás:
```
✅ Configuración validada
📊 Leyendo datos de Google Sheets...
✅ X registros procesados
🔄 Transformando datos...
✅ Y productos transformados
📝 Generando archivo CSV...
✅ Archivo CSV generado: ./output/shopify_products.csv
```

### 5.2 Revisar el CSV

Abre el archivo `output/shopify_products.csv` en Excel o Google Sheets y verifica:
- ¿Los datos se ven correctos?
- ¿Los precios están bien formateados?
- ¿Los handles son únicos?
- ¿Los títulos tienen sentido?

### 5.3 Importar manualmente en Shopify (primera vez)

Para estar seguro, la primera vez importa manualmente:

1. En Shopify Admin, ve a **Products**
2. Clic en **Import**
3. Sube el archivo CSV generado
4. Revisa el preview
5. Si se ve bien, confirma la importación

### 5.4 Usar subida automática (una vez probado)

Cuando estés seguro de que funciona:

```bash
npm run sync upload
```

Esto subirá productos directamente vía API.

### 5.5 Solo actualizar precios

Para sincronizaciones frecuentes (por ejemplo, diarias):

```bash
npm run sync prices-only
```

Esto es más rápido y solo actualiza los precios sin tocar otros datos.

## Paso 6: Automatización (Opcional)

### En Windows (Task Scheduler)

1. Abre **Task Scheduler**
2. Crea una tarea nueva
3. Trigger: Diario, a la hora que prefieras
4. Action: Start a program
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `dist/index.js prices-only`
   - Start in: `C:\ruta\a\tu\proyecto`

### En Linux/Mac (Cron)

Edita tu crontab:
```bash
crontab -e
```

Añade una línea (ejemplo: cada día a las 2 AM):
```cron
0 2 * * * cd /ruta/a/tu/proyecto && /usr/bin/node dist/index.js prices-only
```

## Resolución de Problemas Comunes

### "Module not found"
```bash
npm install
```

### "credentials.json not found"
Verifica que el archivo está en la raíz del proyecto.

### "Permission denied" en Google Sheets
Verifica que compartiste el Sheet con el email de la cuenta de servicio.

### "Invalid access token" en Shopify
- Verifica que copiaste el token correctamente en `.env`
- Asegúrate de que no hay espacios extra
- Verifica que la app tiene los permisos correctos

### Datos vacíos o incorrectos
Ajusta los nombres de columnas en [src/services/dataTransformer.ts](src/services/dataTransformer.ts).

## Próximos Pasos

1. **Prueba con pocos productos primero**: Filtra tu Google Sheet a 5-10 productos para las primeras pruebas
2. **Revisa los logs**: La aplicación muestra mensajes detallados de lo que hace
3. **Haz backups**: Antes de actualizaciones masivas, exporta tus productos desde Shopify
4. **Configura alertas**: Si automatizas, configura notificaciones por email en caso de errores

## Soporte

Si tienes problemas:
1. Revisa los logs en la consola
2. Verifica cada paso de esta guía
3. Abre un issue en el repositorio con los detalles del error
