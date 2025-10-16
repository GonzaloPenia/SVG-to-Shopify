# ¿Dónde Obtener credentials.json?

El archivo `credentials.json` **NO viene con el proyecto**. Debes crearlo tú siguiendo estos pasos:

## 📋 Pasos para Obtener credentials.json

### 1. Ve a Google Cloud Console

Abre: [https://console.cloud.google.com/](https://console.cloud.google.com/)

### 2. Crea un Proyecto (si no tienes uno)

1. Clic en el selector de proyectos (arriba a la izquierda)
2. Clic en **NEW PROJECT**
3. Nombre: "Shopify Sync" (o el que prefieras)
4. Clic en **CREATE**

### 3. Habilita Google Sheets API

1. En el menú lateral: **APIs & Services > Library**
2. Busca: "Google Sheets API"
3. Clic en el resultado
4. Clic en **ENABLE**

### 4. Crea una Service Account

1. En el menú lateral: **APIs & Services > Credentials**
2. Clic en **CREATE CREDENTIALS**
3. Selecciona **Service account**
4. Completa:
   - **Service account name**: "shopify-sync-bot"
   - **Service account ID**: se genera automáticamente
   - **Description**: "Bot para sincronizar Google Sheets con Shopify"
5. Clic en **CREATE AND CONTINUE**
6. En **Grant this service account access to project**:
   - **Role**: Selecciona **Editor** (o solo permisos de Google Sheets si prefieres)
7. Clic en **CONTINUE**
8. Clic en **DONE**

### 5. Descarga el Archivo JSON (credentials.json)

1. En la lista de **Service Accounts**, busca la que acabas de crear
2. Clic en el **email** de la service account (ej: `shopify-sync-bot@tu-proyecto.iam.gserviceaccount.com`)
3. Ve a la pestaña **KEYS**
4. Clic en **ADD KEY > Create new key**
5. Selecciona formato: **JSON**
6. Clic en **CREATE**

**¡El archivo se descarga automáticamente!** 📥

### 6. Guarda el Archivo en el Proyecto

1. El archivo descargado tiene un nombre largo como:
   ```
   tu-proyecto-123456-abcdef123456.json
   ```

2. **Renómbralo** a simplemente:
   ```
   credentials.json
   ```

3. **Muévelo** a la raíz de este proyecto:
   ```
   AppSVGtoShopify/
   ├── credentials.json  ← AQUÍ
   ├── package.json
   ├── src/
   └── ...
   ```

### 7. Comparte tu Google Sheet con la Service Account

Este paso es **CRÍTICO** 🔑:

1. Abre el archivo `credentials.json` que descargaste
2. Busca la línea `"client_email"`, será algo como:
   ```json
   "client_email": "shopify-sync-bot@tu-proyecto.iam.gserviceaccount.com"
   ```
3. **Copia ese email completo**
4. Abre tu [Google Sheet](https://docs.google.com/spreadsheets/d/1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI/edit)
5. Clic en **Share** (Compartir)
6. Pega el email de la service account
7. Permisos: **Viewer** (solo lectura es suficiente)
8. Desmarca "Notify people" (no es necesario)
9. Clic en **Share**

## ✅ Verificación

Después de seguir estos pasos, deberías tener:

```
AppSVGtoShopify/
├── credentials.json          ← ✅ Archivo de Google Cloud
├── .env                      ← ✅ Copiado de .env.example y editado
├── package.json
└── src/
```

El archivo `credentials.json` se ve así:

```json
{
  "type": "service_account",
  "project_id": "tu-proyecto-123456",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "shopify-sync-bot@tu-proyecto.iam.gserviceaccount.com",
  "client_id": "...",
  ...
}
```

## 🔒 Seguridad

⚠️ **MUY IMPORTANTE:**

- **NUNCA** subas `credentials.json` a GitHub o repositorios públicos
- Este archivo ya está en `.gitignore` para protegerte
- Contiene claves privadas que dan acceso a tu Google Cloud

## 🆘 Problemas Comunes

### "credentials.json not found"
→ Verifica que el archivo está en la raíz del proyecto (junto a `package.json`)

### "Permission denied" al leer Google Sheets
→ Asegúrate de compartir el Sheet con el email de `client_email` del archivo credentials.json

### "Invalid credentials"
→ Descarga nuevamente las credenciales desde Google Cloud Console

## 📚 Más Información

- [Documentación oficial de Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Google Sheets API Quickstart](https://developers.google.com/sheets/api/quickstart/nodejs)

---

## 🎬 Resumen Visual

```
Google Cloud Console
       ↓
   Crear Service Account
       ↓
   Descargar JSON
       ↓
   Renombrar a credentials.json
       ↓
   Guardar en raíz del proyecto
       ↓
   Compartir Google Sheet con el email
       ↓
   ¡Listo! 🎉
```

---

**Siguiente paso:** Una vez tengas `credentials.json`, continúa con [INICIO_RAPIDO.md](INICIO_RAPIDO.md) para configurar Shopify y probar la sincronización.
