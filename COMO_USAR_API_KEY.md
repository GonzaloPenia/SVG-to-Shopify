# Cómo Usar Google API Key (Método Simple)

Si no pudiste crear el `credentials.json`, puedes usar una **API Key** de Google. Es más simple, pero requiere que tu Google Sheet sea público.

## 📋 Pasos para Obtener la API Key

### 1. Ve a Google Cloud Console

Abre: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Crea un Proyecto (si no tienes uno)

1. Clic en el selector de proyectos (arriba a la izquierda)
2. Clic en **NEW PROJECT**
3. Nombre: "Shopify Sync"
4. Clic en **CREATE**

### 3. Habilita Google Sheets API

1. En el menú lateral: **APIs & Services > Library**
2. Busca: "Google Sheets API"
3. Clic en el resultado
4. Clic en **ENABLE**

### 4. Crea una API Key

1. En el menú lateral: **APIs & Services > Credentials**
2. Clic en **CREATE CREDENTIALS**
3. Selecciona **API key**
4. **¡Se creará y mostrará tu API Key inmediatamente!** 🎉

Ejemplo:
```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. (Opcional) Clic en **RESTRICT KEY** para mayor seguridad:
   - En "API restrictions":
     - Selecciona **Restrict key**
     - Marca solo **Google Sheets API**
   - Clic en **SAVE**

### 5. Haz tu Google Sheet Público

**IMPORTANTE:** Con API Key, el Sheet DEBE ser público para lectura.

1. Abre tu [Google Sheet](https://docs.google.com/spreadsheets/d/1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI/edit)
2. Clic en **Share** (Compartir)
3. En "General access":
   - Cambia a **Anyone with the link**
   - Permisos: **Viewer**
4. Clic en **Done**

### 6. Configura tu .env

Edita tu archivo `.env` y agrega tu API Key:

```env
# Google Sheets Configuration
GOOGLE_SHEET_ID=1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI

# Método de autenticación: API Key
GOOGLE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx

# No necesitas credentials.json con API Key
# GOOGLE_CREDENTIALS_PATH=./credentials.json

# Nombres de las hojas
PANEL_PRECIOS_SHEET_NAME=Panel_Precios
PADRES_SHEET_NAME=Padres

# Shopify Configuration
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=tu_access_token_aqui
SHOPIFY_API_VERSION=2024-01

# Output Configuration
OUTPUT_CSV_PATH=./output/shopify_products.csv
```

### 7. ¡Listo! Prueba la aplicación

```bash
npm run sync csv
```

Si todo está bien, verás:
```
🔑 Usando Google API Key para autenticación...
✅ Autenticación con API Key configurada
📊 Leyendo hoja "Panel_Precios"...
✅ Leídas X filas...
```

## 🔄 Comparación: API Key vs Service Account

| Característica | API Key | Service Account (credentials.json) |
|----------------|---------|-----------------------------------|
| **Dificultad** | ⭐ Muy fácil | ⭐⭐⭐ Más complejo |
| **Pasos** | 4 pasos | 7 pasos |
| **Archivo necesario** | Ninguno | credentials.json |
| **Sheet público** | ✅ Requerido | ❌ No necesario (puede ser privado) |
| **Seguridad** | ⚠️ Menor (sheet público) | ✅ Mayor (sheet privado) |
| **Recomendado para** | Pruebas, desarrollo | Producción, datos sensibles |

## ⚠️ Consideraciones de Seguridad

### Con API Key:

**Ventajas:**
- Muy fácil de configurar
- No requiere archivos adicionales
- Perfecto para empezar rápido

**Desventajas:**
- Tu Google Sheet debe ser **público**
- Cualquiera con el link puede ver los datos
- No recomendado para datos sensibles

### Cuándo usar cada método:

**Usa API Key si:**
- Estás probando la aplicación
- Los datos no son sensibles
- Quieres empezar rápidamente

**Usa Service Account si:**
- Es para producción
- Los datos son privados/sensibles
- Quieres máxima seguridad

## 🆘 Problemas Comunes

### Error: "Permission denied" o 403

**Solución:** Asegúrate de que el Google Sheet sea público:
1. Abre el Sheet
2. Clic en **Share**
3. "General access" debe ser **Anyone with the link - Viewer**

### Error: "Invalid API key"

**Soluciones:**
1. Verifica que copiaste la API Key completa (sin espacios)
2. Verifica que habilitaste Google Sheets API en Google Cloud
3. Si restringiste la API Key, asegúrate de permitir Google Sheets API

### La aplicación usa credentials.json en lugar de API Key

**Solución:**
- La aplicación prioriza API Key sobre credentials.json
- Si configuraste `GOOGLE_API_KEY` en .env, debería usarlo
- Verifica que el archivo .env esté en la raíz del proyecto

## 📚 Próximos Pasos

Una vez configurada la API Key:

1. **Configura Shopify:**
   - Crea una Custom App en Shopify
   - Obtén el Access Token
   - Agrégalo a `.env`

2. **Prueba la sincronización:**
   ```bash
   npm run sync csv
   ```

3. **Revisa el resultado:**
   - Abre `output/shopify_products.csv`
   - Verifica que los datos sean correctos

4. **Importa en Shopify:**
   - Ve a **Products > Import**
   - Sube el CSV

---

## 🔐 ¿Necesitas Mayor Seguridad?

Si luego necesitas que el Sheet sea privado, puedes migrar a Service Account:

1. Sigue la guía [DONDE_OBTENER_CREDENTIALS.md](DONDE_OBTENER_CREDENTIALS.md)
2. Descarga `credentials.json`
3. En `.env`, comenta la API Key y descomenta la ruta a credentials:
   ```env
   # GOOGLE_API_KEY=AIzaSyDxxx...  ← Comenta esto
   GOOGLE_CREDENTIALS_PATH=./credentials.json  ← Descomenta esto
   ```
4. Haz el Sheet privado y compártelo con el email de la Service Account

La aplicación automáticamente usará credentials.json en lugar de la API Key.

---

## ✅ Resumen Visual

```
Google Cloud Console
       ↓
   Habilitar Google Sheets API
       ↓
   Crear API Key
       ↓
   Copiar la Key
       ↓
   Hacer Sheet público
       ↓
   Pegar en .env (GOOGLE_API_KEY=...)
       ↓
   npm run sync csv
       ↓
   ¡Funciona! 🎉
```

¿Problemas? Abre un issue o revisa [README.md](README.md) para más información.
