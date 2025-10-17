# ✅ Verificación Antes de Ejecutar

Antes de ejecutar `npm run sync`, verifica lo siguiente:

## 1. ✅ Archivo .env creado

- [x] El archivo `.env` existe (ya lo creamos)
- [x] Contiene tu API Key de Google
- [x] Contiene tu dominio de Shopify
- [x] Contiene tu Access Token de Shopify

## 2. ⚠️ Google Sheet DEBE ser público

**IMPORTANTE:** Como estás usando API Key (no Service Account), tu Google Sheet DEBE ser público.

### Verificar si es público:

1. Abre tu Google Sheet en el navegador
2. Clic en **Share** (Compartir)
3. Verifica que "General access" sea: **Anyone with the link - Viewer**

### Si NO es público:

1. Clic en **Share**
2. En "General access" cambia a: **Anyone with the link**
3. Permisos: **Viewer**
4. Clic en **Done**

## 3. ✅ Credenciales de Shopify

Tu archivo `.env` tiene:
```
SHOPIFY_SHOP_DOMAIN=tu-tienda.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_tu_token_de_acceso_aqui
```

### Verificar que son correctas:

1. El dominio debe ser tu tienda de Shopify (parece correcto)
2. El Access Token debe empezar con `shpat_` (correcto ✓)

## 4. 🚀 Probar la aplicación

Una vez que el Sheet sea público, ejecuta:

```bash
npm run sync csv
```

### Resultado esperado:

```
🔑 Usando Google API Key para autenticación...
✅ Autenticación con API Key configurada

📊 Leyendo hoja "Panel_Precios"...
✅ Leídas X filas de la hoja "Panel_Precios"
✅ X registros procesados de Panel_Precios

📊 Leyendo hoja "Padres"...
✅ Leídas Y filas de la hoja "Padres"
✅ Y registros procesados de Padres

🔄 Sincronizando precios desde Panel_Precios...
   📊 Z productos con precios en Panel_Precios

   ✅ W productos procesados
   🔄 V precios actualizados desde Panel_Precios

✅ W productos válidos

📝 Generando archivo CSV...
✅ Archivo CSV generado: ./output/shopify_products.csv
   📦 Tamaño: XX KB
   📊 Productos: W

✅ Archivo CSV generado exitosamente
📁 Ubicación: ./output/shopify_products.csv
```

## 5. ❌ Posibles errores y soluciones

### Error: "Permission denied" o código 403
**Causa:** El Sheet no es público
**Solución:** Sigue el paso 2 de arriba para hacerlo público

### Error: "Invalid API key"
**Causa:** La API Key es incorrecta o no tiene permisos
**Solución:**
- Verifica en Google Cloud Console que la API Key sea correcta
- Verifica que Google Sheets API esté habilitada

### Error: "SHOPIFY_SHOP_DOMAIN no está configurado"
**Causa:** El archivo `.env` no existe o no se está leyendo
**Solución:** Este error ya está resuelto (creamos el .env)

### Error de Shopify al subir productos
**Causa:** El Access Token no tiene permisos o es inválido
**Solución:**
- Verifica que la Custom App tenga permisos: `read_products` y `write_products`
- Regenera el Access Token si es necesario

## 6. 📁 Resultado final

Si todo funciona, encontrarás el archivo CSV en:
```
AppSVGtoShopify/output/shopify_products.csv
```

Puedes abrirlo en Excel o Google Sheets para revisarlo antes de importar a Shopify.

## 7. 📤 Importar en Shopify

1. Abre Shopify Admin
2. Ve a **Products > Import**
3. Sube el archivo `shopify_products.csv`
4. Revisa el preview
5. Confirma la importación

---

## 🔐 Seguridad

⚠️ **NO COMPARTAS** estos archivos:
- `.env` (contiene tus credenciales)
- Capturas de pantalla con API Keys o Access Tokens

Ya están en `.gitignore` para protegerte si usas Git.

---

## ✅ Checklist Rápido

Antes de ejecutar `npm run sync csv`:

- [ ] El archivo `.env` existe (✓ ya lo creamos)
- [ ] El Google Sheet es PÚBLICO (verifica esto)
- [ ] Las credenciales de Shopify son correctas
- [ ] Ejecuté `npm install` previamente

¡Listo para ejecutar! 🚀
