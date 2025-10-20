# ❓ BYTE Panel - Preguntas Frecuentes (FAQ)

![BYTE Logo](../src/media/Byte.png)

---

## 📋 Índice

- [General](#general)
- [Funcionalidad](#funcionalidad)
- [Sincronización](#sincronización)
- [Seguridad](#seguridad)
- [Técnico](#técnico)
- [Costos](#costos)
- [Soporte](#soporte)

---

## 🌟 General

### ¿Qué es BYTE Panel?

BYTE Panel es un sistema de gestión que permite controlar todos los productos de Shopify desde Google Sheets, facilitando ediciones masivas, análisis de datos y control de inventario sin necesidad de conocimientos técnicos.

### ¿Por qué usar Google Sheets en lugar de Shopify Admin?

**Ventajas de Google Sheets**:
- ✅ Interfaz familiar (tipo Excel)
- ✅ Ediciones masivas fáciles (copiar/pegar)
- ✅ Vista general de todo el catálogo
- ✅ Filtros y búsquedas potentes
- ✅ Exportación a Excel/CSV
- ✅ Acceso desde cualquier dispositivo
- ✅ Colaboración en tiempo real

**Shopify Admin es mejor para**:
- Crear productos nuevos
- Subir imágenes
- Configuraciones avanzadas

**BYTE Panel combina lo mejor de ambos mundos**.

### ¿Necesito conocimientos técnicos para usar BYTE Panel?

**No**. Si sabes usar Excel o Google Sheets, puedes usar BYTE Panel.

La instalación inicial requiere soporte técnico de BYTE, pero el uso diario es 100% sin código.

### ¿BYTE Panel reemplaza Shopify?

**No**. BYTE Panel es un **complemento** de Shopify, no un reemplazo.

- Shopify sigue siendo tu tienda online
- BYTE Panel es una herramienta para gestionar productos más fácilmente
- Los datos se sincronizan bidireccionalmente

### ¿Funciona con cualquier tienda Shopify?

**Sí**. BYTE Panel funciona con cualquier plan de Shopify (Basic, Shopify, Advanced, Plus) que tenga acceso a la Admin API.

---

## ⚙️ Funcionalidad

### ¿Qué puedo editar desde BYTE Panel?

**Campos editables** ✏️:
- Título del producto
- Descripción
- Precio
- Precio de comparación (tachado)
- Stock (inventario)
- Estado (ACTIVO/INACTIVO)

**Campos de solo lectura** 🔒:
- ID del producto
- Handle (URL)
- SKU
- Marca
- Modelo
- Vendor
- Tipo (Padre/Individual)

### ¿Puedo crear productos nuevos desde BYTE Panel?

**No en la versión 1.0**. BYTE Panel v1.0 solo permite **editar** productos existentes.

Para crear productos nuevos:
1. Créalos en Shopify Admin
2. Espera 15 min (sincronización automática)
3. Aparecerán en BYTE Panel para editar

**Roadmap v1.2**: Creación de productos desde Sheets está planeado para Q2 2025.

### ¿Puedo subir imágenes desde BYTE Panel?

**No**. La gestión de imágenes debe hacerse desde Shopify Admin.

BYTE Panel v1.0 está enfocado en datos (precios, stock, textos), no en medios.

**Roadmap v1.2**: Gestión de imágenes vía URLs está planeado.

### ¿Puedo eliminar productos?

**No directamente**. No se pueden eliminar productos desde BYTE Panel.

**Alternativa**: Marca el producto como `INACTIVO` para ocultarlo de la tienda.

Para eliminar permanentemente:
1. Ve a Shopify Admin
2. Elimina el producto
3. En la próxima sync, desaparecerá de BYTE Panel

### ¿Qué pasa si borro una fila por error?

**No hay problema**. El producto sigue existiendo en Shopify.

En la próxima sincronización (máx 15 min), la fila reaparecerá automáticamente.

**Consejo**: Usa `Ctrl + Z` para deshacer si borras por error.

### ¿Puedo exportar los datos a Excel?

**Sí**. Desde Google Sheets:

```
File → Download → Microsoft Excel (.xlsx)
```

O copia y pega directamente en Excel.

---

## 🔄 Sincronización

### ¿Cada cuánto se sincroniza?

**Cada 15 minutos** por defecto.

Puedes cambiarlo a:
- 30 minutos
- 1 hora
- El intervalo que prefieras

Contacta a BYTE para cambiar la frecuencia.

### ¿Puedo forzar una sincronización inmediata?

**Sí**. Usa el menú BYTE:

```
🚀 BYTE Panel → 🔄 Sincronizar Ahora
```

**⚠️ Úsalo solo cuando sea urgente**. La sincronización automática es suficiente para uso normal.

### ¿La sincronización es bidireccional?

**Sí**.

**Shopify → Google Sheets**:
- Cada 15 min, n8n trae todos los productos de Shopify
- Actualiza datos en Google Sheets
- Detecta productos nuevos o eliminados

**Google Sheets → Shopify**:
- Cada 15 min, n8n busca productos marcados como "Modificado"
- Actualiza solo esos productos en Shopify
- Marca como sincronizados

### ¿Qué pasa si edito en Shopify y en BYTE Panel al mismo tiempo?

**Shopify siempre gana** en caso de conflicto.

**Ejemplo**:
1. En BYTE Panel, cambias precio a $100 (12:00)
2. En Shopify Admin, alguien cambia precio a $200 (12:05)
3. Sincronización ocurre (12:15)
4. Resultado: Precio = $200 (última modificación en Shopify)

**Recomendación**: Usa BYTE Panel como única fuente de edición para evitar conflictos.

### ¿Se sincronizan todos los productos o solo los modificados?

**Depende de la dirección**:

**Shopify → Sheets**: TODOS los productos (para mantener Sheet actualizado)

**Sheets → Shopify**: Solo los marcados como "Modificado = TRUE"

Esto optimiza la sincronización y evita sobrecargar Shopify API.

### ¿Qué pasa si la sincronización falla?

**n8n tiene reintentos automáticos**:
1. Intento 1: Falla
2. Espera 1 minuto
3. Intento 2: Si falla
4. Espera 5 minutos
5. Intento 3: Si falla
6. Envía notificación de error

**Si falla 3 veces**:
- Los datos quedan en Google Sheets
- No se pierden
- Se intentará en la próxima ejecución (15 min)

**Causas comunes de fallo**:
- Shopify API caído (raro)
- Límite de rate exceeded (resuelto con delays)
- Internet caído
- Credenciales expiradas

### ¿Hay límite de productos que se pueden sincronizar?

**No en teoría**. BYTE Panel soporta hasta **250,000 productos** (límite de Google Sheets).

**En la práctica**:
- Rodavial tiene ~800 productos
- La sincronización toma ~3 minutos
- Sin problemas de performance

Si el catálogo crece mucho (>10,000 productos):
- La sincronización puede tomar más tiempo
- Considerar optimizaciones (contactar BYTE)

---

## 🔒 Seguridad

### ¿Mis datos están seguros?

**Sí**. BYTE Panel implementa múltiples capas de seguridad:

1. **Google Sheets**:
   - Permisos controlados
   - Solo usuarios autorizados
   - Historial de versiones

2. **n8n**:
   - Tokens de API encriptados
   - Conexión HTTPS
   - Self-hosted (tus servidores)

3. **Shopify API**:
   - Tokens con permisos limitados
   - Solo lectura/escritura de productos
   - No acceso a pagos ni clientes

### ¿Quién puede ver/editar los datos?

**Depende de los permisos de Google Sheets**:

- **Owner**: Control total (BYTE al configurar, luego Rodavial)
- **Editor**: Puede editar productos
- **Viewer**: Solo puede ver

**Recomendación**:
- Owner: Gerente o administrador
- Editor: Personal de ventas/inventario
- Viewer: Consultores externos

### ¿Hay historial de cambios?

**Sí, completo**.

Cada cambio registra:
- ✅ Usuario que editó
- ✅ Fecha y hora exacta
- ✅ Producto modificado
- ✅ Campo modificado
- ✅ Valor anterior
- ✅ Valor nuevo

**Beneficios**:
- Auditoría completa
- Detectar errores
- Responsabilidad individual

### ¿Puedo restringir qué campos puede editar cada usuario?

**No directamente en v1.0**.

Google Sheets no permite permisos por columna, solo por hoja completa.

**Alternativas**:
1. **Proteger rangos**: Protege columnas específicas (requiere configuración manual)
2. **Hojas separadas**: Editor A solo accede Hoja 1, Editor B solo Hoja 2
3. **Apps Script**: Validación adicional (contactar BYTE para personalizar)

**Roadmap**: Control de permisos por rol está en evaluación.

### ¿Qué pasa si alguien borra todo el Sheet por error?

**Google Sheets tiene protección**:

1. **Historial de versiones**:
   ```
   File → Version history → See version history
   ```
   Restaura a versión anterior (hasta 30 días atrás)

2. **Papelera de Google Drive**:
   Si se borra el archivo completo, se puede restaurar de la papelera (30 días)

3. **Sincronización automática**:
   Si se borran filas, se recargarán desde Shopify en la próxima sync

**Prevención**: Configurar permisos adecuados (no dar Owner a todos)

---

## 🔧 Técnico

### ¿Qué tecnologías usa BYTE Panel?

| Componente | Tecnología |
|------------|------------|
| Frontend | Google Sheets |
| Backend | Shopify Admin REST API |
| Automatización | n8n (workflow automation) |
| Lógica | Google Apps Script |
| Storage | Google Drive |

Todo **100% opensource/gratuito**.

### ¿Necesito instalar software?

**No**. Todo funciona en la nube:

- Google Sheets: navegador web
- n8n: self-hosted (servidor) o cloud
- Shopify: ya lo tienes

**Requisitos**:
- Navegador web (Chrome, Firefox, Safari, Edge)
- Internet
- Cuenta Google
- Tienda Shopify

### ¿Funciona en celular/tablet?

**Sí**. Google Sheets tiene app móvil para:
- iOS (iPhone/iPad)
- Android

**Limitaciones móviles**:
- Ediciones masivas son más difíciles (pantalla pequeña)
- Mejor usar para consultas rápidas o ediciones puntuales

**Recomendación**: Usa computadora para ediciones masivas, móvil para emergencias.

### ¿Qué es n8n?

**n8n** es una plataforma de automatización opensource (alternativa a Zapier/Make).

**En BYTE Panel, n8n**:
- Ejecuta workflows cada 15 min
- Lee productos de Shopify
- Escribe en Google Sheets
- Lee cambios de Google Sheets
- Actualiza Shopify

**Ventajas**:
- 100% gratis (self-hosted)
- Sin límite de ejecuciones
- Personalizable
- Código abierto

### ¿Puedo personalizar BYTE Panel?

**Sí**. BYTE Panel es completamente personalizable:

**Personalizaciones comunes**:
- Agregar columnas custom
- Cambiar frecuencia de sync
- Modificar validaciones
- Agregar notificaciones
- Crear reportes específicos

**Contacta a BYTE** con tus necesidades.

### ¿Qué pasa si Google Sheets se cae?

**Raro pero posible**. Si Google Sheets está down:

- No podrás editar temporalmente
- Los datos están seguros
- Shopify sigue funcionando normalmente
- Cuando Google se recupere, todo vuelve a la normalidad

**Historial**: Google Sheets tiene 99.9% uptime (muy confiable)

### ¿Qué pasa si Shopify API se cae?

**También raro**. Si Shopify API está down:

- La sincronización fallará temporalmente
- Los datos en Google Sheets siguen disponibles para consulta
- Puedes seguir editando (se sincronizará cuando Shopify se recupere)
- n8n reintentará automáticamente

**Historial**: Shopify API tiene 99.98% uptime

---

## 💰 Costos

### ¿Cuánto cuesta BYTE Panel?

**Setup inicial**: Inversión única (consultar con BYTE)

**Costos recurrentes**: **$0 USD/mes** ✅

| Componente | Costo Mensual |
|------------|---------------|
| Google Sheets | Gratis |
| Google Apps Script | Gratis |
| Shopify Admin API | Gratis (incluido) |
| n8n (self-hosted) | Gratis |
| **TOTAL** | **$0/mes** |

### ¿Hay costos ocultos?

**No**.

**Único costo posible**:
- Si n8n se hostea en servidor cloud (ej. AWS, DigitalOcean)
- Costo del servidor: ~$5-10 USD/mes
- PERO si ya tienes un servidor, $0 adicionales

**Alternativa 100% gratis**:
- n8n Cloud Free Plan (5,000 ejecuciones/mes)
- Suficiente para 2-3 sincronizaciones por hora

### ¿Qué incluye el setup inicial?

**Setup incluye**:
- ✅ Instalación completa de n8n
- ✅ Configuración de workflows
- ✅ Creación de Google Sheet
- ✅ Instalación de Apps Script
- ✅ Primera sincronización
- ✅ Capacitación (2 horas)
- ✅ Documentación completa
- ✅ Soporte 30 días

### ¿Hay planes de soporte?

**Básico** (incluido en setup):
- Soporte 30 días post-instalación
- Email/WhatsApp
- Resolución de bugs
- Respuesta < 24 horas

**Standard** (opcional):
- Soporte extendido (3-6-12 meses)
- Personalizaciones simples
- Capacitación adicional
- Respuesta < 12 horas

**Premium** (opcional):
- Soporte 24/7
- Desarrollos custom
- SLA garantizado
- Respuesta < 2 horas

Consultar precios con BYTE.

### ¿Es más barato que una app de Shopify?

**Sí, mucho**.

**Comparación**:

| Solución | Costo Setup | Costo Mensual | Total Año 1 |
|----------|-------------|---------------|-------------|
| **BYTE Panel** | $XXX | $0 | $XXX |
| App Shopify similar | $0 | $30-50 | $360-600 |
| Desarrollo custom | $2,000+ | $100+ | $3,200+ |

**Ahorro año 1**: ~$300-500 USD
**Ahorro años siguientes**: ~$360-600 USD/año

**ROI**: Recuperas inversión en 2-3 meses (por ahorro de tiempo)

---

## 🆘 Soporte

### ¿Cómo contacto a BYTE Support?

```
📧 Email:      contacto@byte.com.ar
📱 WhatsApp:   +54 9 11 XXXX-XXXX
📞 Teléfono:   (011) XXXX-XXXX
🌐 Web:        www.byte.com.ar

Horario:
  Lunes a Viernes: 9:00 - 18:00 hs
  Sábados: 9:00 - 13:00 hs
```

### ¿Cuánto demora la respuesta?

**Plan Básico** (incluido):
- Email: < 24 horas
- WhatsApp: < 2 horas (horario laboral)
- Teléfono: Inmediato (horario laboral)

**Planes pagos**: Respuesta más rápida según nivel

### ¿Qué información debo incluir al contactar soporte?

**Para resolver más rápido**:

1. ✅ Descripción del problema
2. ✅ Pasos para reproducir
3. ✅ Captura de pantalla (si aplica)
4. ✅ Handle del producto (si es sobre un producto)
5. ✅ Tu nombre y empresa

**Ejemplo**:
> Hola, soy María de Rodavial.
>
> Cambié el precio del producto "michelin-ps4-p" de 197471 a 199500, esperé 30 min, pero no se sincronizó a Shopify.
>
> La columna "Modificado" dice TRUE.
>
> Adjunto captura.
>
> Gracias.

### ¿Hay documentación adicional?

**Sí**:

- 📘 **[Guía de Instalación](BYTE_CONTROL_PANEL.md)**: Setup técnico completo
- 📗 **[Guía de Usuario](BYTE_USER_GUIDE.md)**: Manual para equipo Rodavial
- 📕 **[Manual Técnico](BYTE_TECH_MANUAL.md)**: Detalles técnicos avanzados
- 📙 **[FAQ](BYTE_FAQ.md)**: Este documento

### ¿Puedo solicitar nuevas funcionalidades?

**¡Sí, por favor!** BYTE valora el feedback.

**Cómo solicitar**:
1. Contacta a BYTE (email/WhatsApp)
2. Describe la funcionalidad deseada
3. Explica el caso de uso
4. BYTE evaluará:
   - Viabilidad técnica
   - Esfuerzo de desarrollo
   - Costo (si aplica)
5. Si se aprueba, se agrega al roadmap

**Ejemplos de requests comunes**:
- Agregar campo custom
- Cambiar validaciones
- Notificaciones por email
- Reportes específicos

### ¿BYTE ofrece capacitación?

**Sí**. Incluido en setup:

**Sesión 1** (1 hora) - Uso básico:
- Navegación del panel
- Edición de productos
- Dashboard y estadísticas

**Sesión 2** (1 hora) - Avanzado:
- Filtros y búsquedas
- Ediciones masivas
- Historial de cambios

**Capacitación adicional** (opcional):
- Sesiones personalizadas
- Casos de uso específicos
- Consultar con BYTE

---

## 📊 Casos de Uso

### ¿Para qué tipos de negocios es útil BYTE Panel?

**Ideal para**:
- ✅ Tiendas con muchos productos (>100)
- ✅ Actualizaciones frecuentes de precios
- ✅ Control estricto de inventario
- ✅ Múltiples usuarios editando
- ✅ Necesidad de reportes/análisis

**Menos útil para**:
- ❌ Tiendas pequeñas (<20 productos)
- ❌ Productos que no cambian nunca
- ❌ Solo 1 usuario administrador

### ¿Qué tiempo ahorra BYTE Panel?

**Ejemplos reales**:

| Tarea | Shopify Admin | BYTE Panel | Ahorro |
|-------|---------------|------------|--------|
| Actualizar 100 precios | 3 horas | 15 min | 94% |
| Ver stock bajo | 30 min | 1 min | 97% |
| Análisis por marca | 1 hora | 5 min | 92% |
| Desactivar 50 productos | 1 hora | 5 min | 92% |

**Promedio: 90% ahorro de tiempo**

---

## 🎯 Roadmap

### ¿Qué nuevas funcionalidades están planeadas?

**v1.1** (Q1 2025):
- Webhooks para sync en tiempo real
- Notificaciones por email
- Exportación avanzada
- Filtros guardados

**v1.2** (Q2 2025):
- Creación de productos desde Sheets
- Gestión de imágenes vía URL
- Multi-idioma
- Dashboard avanzado

**v2.0** (Q3 2025):
- AI para sugerencias de precios
- Análisis predictivo de stock
- Integración con ERP
- Multi-tienda

### ¿Puedo influir en el roadmap?

**¡Sí!** Solicitudes de clientes tienen prioridad.

Si muchos clientes piden la misma funcionalidad, se prioriza en el roadmap.

---

## 🔍 Troubleshooting Rápido

### ❌ No puedo editar

**Solución**:
1. Verifica que la columna sea editable
2. Verifica permisos de Google Sheet
3. Intenta refrescar página

### ❌ No se sincroniza

**Solución**:
1. Verifica "Modificado" = TRUE
2. Espera 15 min
3. Revisa Dashboard → Modificados pendientes
4. Usa "Sincronizar Ahora" si es urgente
5. Contacta BYTE si persiste

### ❌ Datos incorrectos

**Solución**:
1. Verifica formato (números sin símbolos)
2. Revisa historial para ver qué cambió
3. Usa Ctrl+Z si fue reciente
4. Edita manualmente el valor correcto

### ❌ Producto duplicado

**Solución**:
1. NO borres ninguna fila
2. Toma captura de pantalla
3. Contacta BYTE inmediatamente

### ❌ Fila borrada por error

**Solución**:
1. Ctrl+Z para deshacer
2. Si no funciona, espera 15 min (se recarga de Shopify)
3. Si no reaparece, contacta BYTE

---

## 📞 Más Preguntas

**¿No encontraste tu respuesta?**

Contacta a BYTE Support:

<div align="center">

📧 **contacto@byte.com.ar**

📱 **WhatsApp**: +54 9 11 XXXX-XXXX

🌐 **www.byte.com.ar**

---

![BYTE Logo](../src/media/Byte.png)

**BYTE - Soluciones Tecnológicas a Medida**

*Desarrollamos software que impulsa tu negocio* 🚀

---

© 2025 BYTE. Desarrollado con ❤️ para Rodavial.

</div>
