# Configuración del Workflow n8n para Sincronización Automática

## 📋 Descripción

Este workflow automatiza la sincronización de cambios desde Google Sheets a Shopify. Se ejecuta cada 30 minutos y solo actualiza productos que han cambiado, optimizando el uso de la API de Shopify.

## 🎯 Características

- ✅ **Detección inteligente de cambios**: Usa hash para identificar solo productos modificados
- ✅ **Rate limiting automático**: 600ms entre requests (1.66 req/seg)
- ✅ **Retry automático**: 3 reintentos en caso de error
- ✅ **Caché con Redis**: Almacena estado de productos por 24 horas
- ✅ **Logs detallados**: Reportes completos de cada sincronización
- ✅ **Manejo de errores**: Continúa ejecución aunque fallen algunos productos

## 📦 Requisitos Previos

### 1. Redis (para caché)

**Opción A: Redis local (recomendado para desarrollo)**
```bash
# Windows (con Chocolatey)
choco install redis-64

# macOS
brew install redis
brew services start redis

# Linux
sudo apt-get install redis-server
sudo systemctl start redis
```

**Opción B: Redis Cloud (gratuito)**
- Crea cuenta en: https://redis.com/try-free/
- Obtén la URL de conexión
- Usa en n8n credentials

**Opción C: Sin Redis (alternativa simple)**
Si no quieres usar Redis, puedes usar una variable de entorno o archivo JSON para el caché. En ese caso:
1. Elimina los nodos "Get Products Cache" y "Update Cache"
2. Modifica "Detect Changes" para comparar siempre todos los productos

### 2. n8n instalado

```bash
# Instalación global
npm install n8n -g

# O con Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## 🔧 Instalación del Workflow

### Paso 1: Importar el workflow

1. Abre n8n: http://localhost:5678
2. Click en **"Workflows"** → **"Import from File"**
3. Selecciona el archivo: `n8n-workflow-shopify-sync.json`
4. Click en **"Import"**

### Paso 2: Configurar credenciales

#### Google Sheets API

1. En n8n, ve a **"Credentials"** → **"New"**
2. Busca **"Google Sheets API"**
3. Nombre: `Google Sheets API`
4. Ingresa tu **API Key**: `AIzaSyCPAB-hmY9wffRkiSH2S-7W7We5OzNx7f0`
5. **Save**

**Alternativa con Service Account:**
Si prefieres usar Service Account en vez de API Key:
1. Sube tu archivo `credentials.json`
2. Selecciona "Service Account" como método
3. Copia el contenido del JSON

#### Shopify API

1. En n8n, ve a **"Credentials"** → **"New"**
2. Busca **"Shopify API"**
3. Nombre: `Shopify API`
4. Completa:
   - **Shop Subdomain**: `aby0mb-0a`
   - **Access Token**: `shpat_tu_token_aqui`
   - **API Version**: `2024-01`
5. **Save**

#### Redis (para caché)

1. En n8n, ve a **"Credentials"** → **"New"**
2. Busca **"Redis"**
3. Nombre: `Redis Local`
4. Completa:
   - **Host**: `localhost` (o tu URL de Redis Cloud)
   - **Port**: `6379`
   - **Password**: (vacío para Redis local sin password)
   - **Database**: `0`
5. **Save**

### Paso 3: Configurar variables de entorno

En n8n, configura las siguientes variables:

```bash
# En el archivo .env de n8n o en Settings → Variables
SHOPIFY_SHOP_DOMAIN=aby0mb-0a.myshopify.com
GOOGLE_SHEET_ID=1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI
```

### Paso 4: Verificar conexiones

1. Abre el workflow importado
2. Click en cada nodo de credenciales (Google Sheets, Shopify, Redis)
3. Verifica que estén conectados correctamente
4. **Test Workflow**: Click en "Execute Workflow" para probar

## 🚀 Activación del Workflow

1. En el workflow, click en el toggle **"Active"** (arriba a la derecha)
2. El workflow ahora se ejecutará automáticamente cada 30 minutos
3. Ver ejecuciones: **"Executions"** en el menú lateral

## 📊 Monitoreo

### Ver logs de ejecución

1. Ve a **"Executions"** en el menú lateral
2. Click en cualquier ejecución para ver detalles
3. Los logs muestran:
   - Total de productos procesados
   - Productos nuevos detectados
   - Productos modificados
   - Productos sin cambios
   - Errores (si los hay)

### Ejemplo de log exitoso

```
=============================================================
DETECCIÓN DE CAMBIOS
=============================================================
Total productos: 791
✨ Nuevos: 0
🔄 Modificados: 5
✓ Sin cambios: 786
=============================================================
⚡ Sincronizando 5 productos...

🔄 Actualizando modificado: michelin-pilot-sport-4-205-40-zr18-xl-i
   Precio: 197471.00 → 199500.00
✅ Actualizado: michelin-pilot-sport-4-205-40-zr18-xl-i
...

=============================================================
📊 RESUMEN DE SINCRONIZACIÓN
=============================================================
Total procesados: 5
✅ Exitosos: 5
   - Modificados: 5
❌ Fallidos: 0
=============================================================
```

## 🔄 Modificar la Frecuencia de Ejecución

Por defecto: cada 30 minutos

Para cambiar:
1. Abre el workflow
2. Click en el nodo **"Every 30 Minutes"**
3. Modifica el intervalo:
   - **15 minutos**: Más frecuente (recomendado para alta actividad)
   - **1 hora**: Menos frecuente (recomendado para bajo tráfico)
   - **Cron expression**: Para horarios específicos

Ejemplos de Cron:
```
0 */30 * * * *    # Cada 30 minutos
0 */15 * * * *    # Cada 15 minutos
0 0 9,17 * * *    # A las 9 AM y 5 PM
0 0 * * * *       # Cada hora
```

## ⚙️ Optimizaciones Adicionales

### 1. Ajustar Rate Limiting

Si tienes un plan Shopify Plus con límites más altos:

1. Abre el workflow
2. Click en nodos "Update Shopify Product" y "Update Shopify Variant"
3. En **Options → Batching → Batch Interval**, cambia `600` a un valor menor:
   - Shopify Plus: `300ms` (3.33 req/seg)
   - Basic/Advanced: `600ms` (1.66 req/seg) ← **ACTUAL**

### 2. Filtrar por cambios específicos

Si solo quieres sincronizar cambios de precio (no descripción, etc.):

1. Abre el nodo **"Merge & Transform Data"**
2. Modifica el código del hash para incluir solo campos deseados:

```javascript
const hashData = JSON.stringify({
  price: producto.price,
  inventoryQty: producto.inventoryQty
  // Removido: title, bodyHtml, compareAtPrice, status
});
```

### 3. Agregar notificaciones

Para recibir notificaciones de errores:

1. Agrega un nodo **"Gmail"** o **"Slack"** después de "Generate Summary Report"
2. Configura para enviar solo si hay errores:
   - Condición: `{{ $json.stats.fallidos > 0 }}`

## 🐛 Solución de Problemas

### Error: "Redis connection failed"

**Causa**: Redis no está corriendo o credenciales incorrectas

**Solución**:
```bash
# Verificar si Redis está corriendo
redis-cli ping
# Debería responder: PONG

# Si no responde, iniciar Redis
# Windows
redis-server

# macOS/Linux
redis-server
# o
sudo systemctl start redis
```

### Error: "Rate limit exceeded"

**Causa**: Demasiadas requests a Shopify

**Solución**:
1. Aumenta el delay en los nodos de actualización de Shopify
2. Verifica que el "Batch Interval" esté en 600ms o más

### Error: "Product not found in Shopify"

**Causa**: El producto no existe en Shopify (aún no se ha creado)

**Solución**:
- Este workflow solo **actualiza** productos existentes
- Para crear nuevos productos, ejecuta el script inicial:
  ```bash
  npm run sync:all
  ```
- Luego el workflow mantendrá actualizados todos los productos

### Warning: "No changes detected"

**Causa**: No hay cambios en Google Sheets desde la última ejecución

**Solución**:
- Esto es **normal y esperado** si no hay cambios
- El workflow simplemente omite la sincronización
- Reduce la frecuencia de ejecución si esto sucede con frecuencia

## 📈 Escalabilidad

### Para más de 1000 productos

Si tu catálogo crece:

1. **Aumenta el timeout**:
   - En cada nodo HTTP, aumenta `timeout` de 10000ms a 30000ms

2. **Implementa paginación**:
   - Modifica "Read Panel_Precios" para leer en chunks
   - Procesa en lotes de 500 productos

3. **Usa webhooks** en vez de polling:
   - Google Sheets no tiene webhooks nativos
   - Alternativa: Usa Google Apps Script para enviar webhook a n8n cuando hay cambios

## 🔐 Seguridad

### Buenas prácticas

1. **No compartas credenciales**:
   - Las credenciales de n8n están encriptadas
   - No exportes workflows con credenciales

2. **Usa Service Account** para Google Sheets:
   - Más seguro que API Key
   - Permite permisos granulares

3. **Rotación de tokens**:
   - Rota el Access Token de Shopify cada 90 días
   - Actualiza en n8n credentials

4. **Logs**:
   - Revisa logs regularmente
   - Configura alertas para errores repetidos

## 📚 Recursos Adicionales

- [Documentación n8n](https://docs.n8n.io/)
- [Shopify API Docs](https://shopify.dev/docs/api/admin-rest)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)
- [Redis Quick Start](https://redis.io/docs/getting-started/)

## 💡 Próximos Pasos

Una vez que el workflow esté funcionando:

1. **Monitorea las primeras ejecuciones**:
   - Verifica logs durante las primeras 24 horas
   - Asegúrate de que no haya errores

2. **Ajusta la frecuencia**:
   - Si no hay muchos cambios, aumenta a 1 hora
   - Si hay cambios frecuentes, reduce a 15 minutos

3. **Configura alertas**:
   - Agrega notificaciones por email/Slack para errores
   - Crea un dashboard de monitoreo

4. **Considera webhooks**:
   - Para sincronización en tiempo real
   - Requiere configuración adicional pero es más eficiente

---

**¿Necesitas ayuda?** Revisa los logs de ejecución en n8n o contacta a soporte.
