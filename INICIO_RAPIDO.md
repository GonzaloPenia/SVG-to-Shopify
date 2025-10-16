# Inicio Rápido - Sincronización Google Sheets → Shopify

Esta guía te lleva de 0 a tener la aplicación funcionando en minutos.

## ⚡ Instalación Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Google Sheets API

**Elige UN método (el que prefieras):**

#### Opción A: API Key (Más Simple) ⭐ RECOMENDADO

**Si conseguiste la API Key de Google:**

1. Ve a [COMO_USAR_API_KEY.md](COMO_USAR_API_KEY.md) para pasos detallados
2. Haz tu Google Sheet público (Anyone with link - Viewer)
3. Crea y edita tu `.env`:
   ```bash
   cp .env.example .env
   ```
4. Agrega tu API Key al `.env`:
   ```env
   GOOGLE_SHEET_ID=1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
   GOOGLE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### Opción B: Service Account (Más Seguro)

**Si prefieres sheets privados:**

1. Ve a [DONDE_OBTENER_CREDENTIALS.md](DONDE_OBTENER_CREDENTIALS.md)
2. Crea una Service Account en Google Cloud
3. Descarga `credentials.json` y guárdalo en la raíz del proyecto
4. Comparte tu Sheet con el email de la Service Account
5. Crea y edita tu `.env`:
   ```bash
   cp .env.example .env
   ```
6. Configura la ruta a credentials:
   ```env
   GOOGLE_SHEET_ID=1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
   GOOGLE_CREDENTIALS_PATH=./credentials.json
   ```

### 3. Configurar Shopify

Edita tu `.env` y completa los datos de Shopify:
```env
# Shopify (completa estos)
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxx
```

**Para obtener el Shopify Access Token:**
1. En Shopify Admin: **Settings > Apps and sales channels**
2. Clic en **Develop apps**
3. Crea una app nueva
4. Activa permisos: `read_products` y `write_products`
5. Instala la app y copia el token

### 4. ¡Listo! Prueba la aplicación

```bash
npm run sync csv
```

Esto generará `output/shopify_products.csv` listo para importar.

---

## 📋 Comandos Disponibles

### Generar CSV (recomendado para empezar)
```bash
npm run sync csv
```
- Genera archivo CSV
- Revísalo antes de subir a Shopify
- Importa manualmente en **Products > Import**

### Subir directamente a Shopify
```bash
npm run sync upload
```
- Sube productos vía API
- Actualiza existentes
- Crea nuevos si no existen

### Actualizar solo precios (rápido)
```bash
npm run sync prices-only
```
- Solo actualiza precios
- Ideal para sincronización diaria
- No toca descripciones ni imágenes

---

## 🔄 Cómo Funciona

Tu Google Sheet tiene 2 hojas:

### Panel_Precios (Precios actualizados)
```
Handle: michelin-pilot-sport-4-205-40-zr18-xl
Precio con IVA: 197471  ← Se usa este
Precio sin IVA: 163364  ← Solo informativo
Estado: Active
```

### Padres (Plantilla completa Shopify)
```
Handle: michelin-pilot-sport-4-205-40-zr18-xl
Title: Michelin Pilot Sport 4 205/40 ZR18 XL
Vendor: Michelin
Variant Price: 0  ← Se reemplaza con Panel_Precios
Variant Compare At Price: 220000  ← Se mantiene (precio tachado)
```

### Resultado Final
```
Handle: michelin-pilot-sport-4-205-40-zr18-xl
Title: Michelin Pilot Sport 4 205/40 ZR18 XL (de Padres)
Vendor: Michelin (de Padres)
Variant Price: 197471 (de Panel_Precios - CON IVA)
Variant Compare At Price: 220000 (de Padres)
Status: active (de Panel_Precios)
```

**En tu tienda se mostrará:**
~~$220.000~~ **$197.471** (ahorro de $22.529)

---

## ✅ Verificación Rápida

Antes de subir a Shopify, verifica:

1. **Handles coinciden**: Los handles deben ser iguales en ambas hojas
2. **Precios son numéricos**: Sin símbolos de moneda ($, puntos, comas)
3. **Estado activo**: Solo productos con `Estado: Active` se publicarán
4. **Imágenes públicas**: Las URLs de imágenes deben ser accesibles

---

## 🎯 Flujo Recomendado

### Primera vez:
1. `npm run sync csv` - Genera CSV
2. Revisa el archivo en Excel/Google Sheets
3. Importa manualmente en Shopify Admin
4. Verifica que todo se vea bien

### Uso diario:
```bash
npm run sync prices-only
```
Actualiza solo precios en segundos.

### Cambios grandes:
```bash
npm run sync upload
```
Sube todo vía API (incluye descripciones, imágenes, etc.)

---

## ❓ Solución de Problemas Rápida

### Error: "credentials.json not found"
→ Asegúrate de que el archivo está en la raíz del proyecto

### Error: "Permission denied" en Google Sheets
→ Verifica que compartiste el Sheet con el email de la Service Account

### Error: "Invalid Shopify token"
→ Verifica que el token en `.env` es correcto y tiene permisos

### Precios en $0
→ Verifica que los handles coinciden entre Panel_Precios y Padres

### Productos no aparecen
→ Verifica que `Estado` sea "Active" en Panel_Precios

---

## 📚 Documentación Completa

- [README.md](README.md) - Documentación completa
- [SETUP.md](SETUP.md) - Guía detallada paso a paso
- [ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md) - Explicación de las hojas

---

## 💡 Notas Importantes

1. **Shopify usa precios CON IVA**: El campo "Precio sin IVA" es solo informativo
2. **Variant Compare At Price**: Se configura en la hoja "Padres" para mostrar descuentos
3. **Handle es la clave**: Vincula ambas hojas, debe ser idéntico
4. **Backup siempre**: Exporta tus productos antes de importaciones masivas

---

## 🚀 ¿Listo para empezar?

### Paso a paso:

**1. Instala dependencias:**
```bash
npm install
```

**2. Configura Google Sheets:**
- **¿No sabes cómo obtener credentials.json?** 👉 Lee [DONDE_OBTENER_CREDENTIALS.md](DONDE_OBTENER_CREDENTIALS.md)
- Sigue la sección "Configurar Google Sheets API" más arriba
- Descarga `credentials.json` desde Google Cloud
- Guarda el archivo en la raíz del proyecto (junto a package.json)

**3. Configura Shopify:**
- Crea una Custom App en tu tienda Shopify
- Copia el Access Token
- Crea el archivo `.env`:
  ```bash
  cp .env.example .env
  ```
- Edita `.env` y pega tu token

**4. Prueba la sincronización:**
```bash
npm run sync csv
```

**5. Revisa el resultado:**
- Abre `output/shopify_products.csv`
- Verifica que los precios y datos sean correctos

**6. Importa en Shopify:**
- Ve a **Products > Import** en Shopify Admin
- Sube el archivo CSV

¿Problemas? Revisa [SETUP.md](SETUP.md) para instrucciones detalladas paso a paso.
