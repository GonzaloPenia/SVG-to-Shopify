# 🔐 Cómo Obtener credentials.json (Service Account de Google Cloud)

## ⚠️ Importante

Este archivo **solo es necesario para el sistema Node.js original** (subida masiva de productos).

**Para el BYTE Panel NO necesitas este archivo.** El BYTE Panel usa autenticación OAuth2 directamente en n8n.

---

## 📋 ¿Cuándo Necesitas Este Archivo?

✅ **SÍ necesitas** si vas a usar:
- `npm run sync` (sincronización masiva Node.js)
- `npm run test:optimized` (test con Node.js)
- Scripts TypeScript del sistema original

❌ **NO necesitas** si solo usarás:
- BYTE Panel de Control (Google Sheets + n8n)
- Workflows de n8n
- Google Apps Script

---

## 🚀 Paso a Paso para Obtener credentials.json

### Paso 1: Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear un Proyecto Nuevo

1. En la parte superior, click en el selector de proyectos
2. Click en **"New Project"**
3. Configuración:
   - **Project name**: `Shopify-Rodavial-Sync` (o el nombre que prefieras)
   - **Organization**: Dejar en blanco (o seleccionar si tienes)
   - **Location**: Dejar por defecto
4. Click **"Create"**
5. Espera 10-20 segundos mientras se crea
6. Selecciona el proyecto recién creado

### Paso 3: Habilitar Google Sheets API

1. En el menú lateral (☰), ve a: **APIs & Services → Library**
2. En el buscador, escribe: `Google Sheets API`
3. Click en **"Google Sheets API"**
4. Click en **"Enable"**
5. Espera que se habilite (5-10 segundos)

### Paso 4: Crear Service Account

1. En el menú lateral, ve a: **APIs & Services → Credentials**
2. Click en **"+ CREATE CREDENTIALS"** (arriba)
3. Selecciona: **"Service account"**
4. Llenar formulario:

   **Service account details**:
   - **Service account name**: `shopify-sync-bot`
   - **Service account ID**: (se genera automáticamente, ej: `shopify-sync-bot@...`)
   - **Description**: `Service account para sincronización Shopify-Google Sheets`
   - Click **"CREATE AND CONTINUE"**

   **Grant this service account access to project** (Paso 2):
   - **Role**: Selecciona **"Editor"** (o "Owner" si necesitas permisos completos)
   - Click **"CONTINUE"**

   **Grant users access to this service account** (Paso 3):
   - Dejar en blanco
   - Click **"DONE"**

### Paso 5: Generar Clave JSON

1. En la página de **Credentials**, verás tu service account en la sección **"Service Accounts"**
2. Click en el email de la service account (ej: `shopify-sync-bot@tu-proyecto.iam.gserviceaccount.com`)
3. Ve a la pestaña **"KEYS"**
4. Click en **"ADD KEY"** → **"Create new key"**
5. Selecciona formato: **JSON**
6. Click **"CREATE"**
7. Se descargará automáticamente un archivo JSON (ej: `tu-proyecto-abc123.json`)

### Paso 6: Configurar el Archivo

1. Renombra el archivo descargado a: `credentials.json`
2. Muévelo a la carpeta raíz del proyecto: `c:\Users\gonza\Desktop\Proyectos\AppEmi\AppSVGtoShopify\`
3. El archivo debería verse así:

```json
{
  "type": "service_account",
  "project_id": "shopify-rodavial-sync-123456",
  "private_key_id": "abc123def456...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB... (clave muy larga) ...XYZ\n-----END PRIVATE KEY-----\n",
  "client_email": "shopify-sync-bot@shopify-rodavial-sync-123456.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Paso 7: Dar Acceso al Google Sheet

⚠️ **MUY IMPORTANTE**: La service account necesita permisos en tu Google Sheet.

1. Abre tu Google Sheet (Panel_Precios y Padres)
2. Click en **"Share"** (Compartir) arriba a la derecha
3. En el campo de email, pega el **client_email** de tu `credentials.json`
   - Ejemplo: `shopify-sync-bot@shopify-rodavial-sync-123456.iam.gserviceaccount.com`
4. Permisos: Selecciona **"Editor"**
5. **DESACTIVA** la casilla "Notify people" (no enviar notificación)
6. Click **"Share"**

Repite esto para TODAS las hojas de Google Sheets que use el sistema.

---

## ✅ Verificar que Funciona

### Prueba 1: Verificar Archivo

```bash
cd c:\Users\gonza\Desktop\Proyectos\AppEmi\AppSVGtoShopify
node -e "console.log(require('./credentials.json').client_email)"
```

Debería mostrar el email de la service account.

### Prueba 2: Ejecutar Test

```bash
npm run test:10
```

Si funciona correctamente, debería:
- Conectar con Google Sheets
- Leer 10 productos
- Transformarlos
- Subirlos a Shopify (si ejecutas sync)

---

## 🔒 Seguridad

### ⚠️ MUY IMPORTANTE

**NUNCA subas `credentials.json` a GitHub** o repositorios públicos.

El archivo ya está en `.gitignore`:

```gitignore
# Credentials
credentials.json
.env
```

### Verificar que NO está en git

```bash
git check-ignore credentials.json
```

Debería mostrar: `credentials.json` (significa que está ignorado ✅)

### Si accidentalmente lo subiste

1. Elimínalo del repositorio:
   ```bash
   git rm --cached credentials.json
   git commit -m "Remove credentials.json"
   git push
   ```

2. **Genera una nueva clave** en Google Cloud:
   - Ve a Service Account → Keys → Elimina la clave vieja
   - Crea una nueva clave
   - Reemplaza el archivo local

---

## 🆘 Problemas Comunes

### Error: "Permission denied" o "403 Forbidden"

**Causa**: La service account no tiene acceso al Google Sheet

**Solución**:
1. Verifica que compartiste el Sheet con el email de la service account
2. El email debe tener permisos de **"Editor"**, no "Viewer"
3. Verifica el email exacto en `credentials.json` (campo `client_email`)

---

### Error: "API has not been used in project... before or it is disabled"

**Causa**: Google Sheets API no está habilitada

**Solución**:
1. Ve a: https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. Selecciona tu proyecto
3. Click **"Enable"**
4. Espera 1-2 minutos

---

### Error: "Invalid credentials" o "invalid_grant"

**Causa**: La clave privada está mal formateada o corrupta

**Solución**:
1. Descarga una nueva clave JSON de Google Cloud
2. NO edites manualmente el archivo
3. Asegúrate de que está en formato JSON válido

---

### Error: "Cannot find module './credentials.json'"

**Causa**: El archivo no está en la ubicación correcta

**Solución**:
1. El archivo debe estar en la raíz del proyecto:
   ```
   AppSVGtoShopify/
   ├── credentials.json    ← Aquí
   ├── src/
   ├── package.json
   └── ...
   ```

2. Verifica el nombre exacto: `credentials.json` (no `credential.json` ni `credentials.json.ejemplo`)

---

## 📊 Estructura del Archivo

```json
{
  // Tipo de credencial
  "type": "service_account",

  // ID del proyecto de Google Cloud
  "project_id": "shopify-rodavial-sync-123456",

  // ID de la clave privada (identificador único)
  "private_key_id": "abc123def456...",

  // Clave privada RSA (muy larga, ~1600+ caracteres)
  // Incluye \n para saltos de línea
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",

  // Email de la service account
  // Este es el que debes compartir en Google Sheets
  "client_email": "shopify-sync-bot@shopify-rodavial-sync-123456.iam.gserviceaccount.com",

  // ID único del cliente
  "client_id": "123456789012345678901",

  // URIs de autenticación (no cambiar)
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

---

## 🆚 Alternativa: Usar BYTE Panel (Sin Service Account)

Si encuentras complicado configurar la service account, **usa el BYTE Panel**:

### Ventajas del BYTE Panel

✅ **No requiere** `credentials.json`
✅ **No requiere** Google Cloud Console
✅ Autenticación OAuth2 simple en n8n (login con Google)
✅ Interfaz amigable en Google Sheets
✅ Todo el equipo puede usarlo sin conocimientos técnicos

### Ver Documentación

- [BYTE_CONTROL_PANEL.md](BYTE_CONTROL_PANEL.md) - Setup completo
- [N8N_SETUP.md](N8N_SETUP.md) - Configuración de n8n
- [BYTE_USER_GUIDE.md](BYTE_USER_GUIDE.md) - Guía de usuario

---

## 📞 Soporte BYTE

Si tienes problemas configurando las credenciales:

📧 **Email**: contacto@byte.com.ar
📱 **WhatsApp**: +54 9 11 XXXX-XXXX
🌐 **Web**: www.byte.com.ar

**Horario**: Lunes a Viernes 9:00-18:00 | Sábados 9:00-13:00

---

<div align="center">

![BYTE Logo](../src/media/Byte.png)

**BYTE - Soluciones Tecnológicas a Medida**

*Desarrollamos software que impulsa tu negocio* 🚀

</div>
