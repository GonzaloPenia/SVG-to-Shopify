# 📗 BYTE Panel - Guía de Usuario

## Para el Equipo de Rodavial

![BYTE Logo](../src/media/Byte.png)

---

## 📋 Índice

1. [Introducción](#introducción)
2. [Primeros Pasos](#primeros-pasos)
3. [Gestión de Productos](#gestión-de-productos)
4. [Dashboard y Estadísticas](#dashboard-y-estadísticas)
5. [Historial de Cambios](#historial-de-cambios)
6. [Buenas Prácticas](#buenas-prácticas)
7. [Problemas Comunes](#problemas-comunes)

---

## 🌟 Introducción

### ¿Qué es BYTE Panel?

BYTE Panel es tu **herramienta de control central** para gestionar todos los productos de Rodavial en Shopify. Desde una interfaz familiar (Google Sheets), puedes:

- ✏️ Editar títulos y descripciones
- 💰 Actualizar precios
- 📦 Controlar stock
- 🔄 Activar/desactivar productos

### ¿Por qué es más fácil que Shopify Admin?

| Shopify Admin | BYTE Panel |
|---------------|------------|
| Abrir producto uno por uno | Ver todos los productos en una tabla |
| Editar formularios complejos | Editar como en Excel |
| Cambios uno a uno | Cambios masivos con copiar/pegar |
| Sin vista general | Dashboard con estadísticas |
| Sin historial detallado | Historial completo de cambios |

---

## 🚀 Primeros Pasos

### Acceder al Panel

1. Abre el link de Google Sheets que te compartieron
2. Verás varias hojas:
   - **Productos**: Donde editarás
   - **Dashboard**: Estadísticas
   - **Historial**: Registro de cambios
   - **Ayuda**: Guía rápida

### Entender la Estructura

La hoja **Productos** tiene estas columnas:

| Columna | ¿Se puede editar? | Descripción |
|---------|-------------------|-------------|
| **ID Producto** | 🔒 No | Identificador interno de Shopify |
| **ID Variante** | 🔒 No | Identificador de la variante |
| **Handle** | 🔒 No | URL única del producto |
| **SKU** | 🔒 No | Código de producto |
| **Tipo** | 🔒 No | PADRE o INDIVIDUAL |
| **Título** | ✏️ Sí | Nombre del producto |
| **Descripción** | ✏️ Sí | Descripción breve |
| **Marca** | 🔒 No | Michelin, BFGoodrich, etc. |
| **Modelo** | 🔒 No | PILOT SPORT 4, etc. |
| **Precio** | ✏️ Sí | Precio de venta |
| **Compare At** | ✏️ Sí | Precio tachado (descuentos) |
| **Stock** | ✏️ Sí | Cantidad disponible |
| **Vendor** | 🔒 No | Proveedor |
| **Estado** | ✏️ Sí | ACTIVO o INACTIVO |
| **Modificado** | 🔒 No | Marca automática de cambios |

**Regla de Oro**: Solo edita las columnas marcadas con ✏️

---

## ✏️ Gestión de Productos

### Editar un Producto Individual

**Paso a paso**:

1. **Buscar el producto**:
   - Usa `Ctrl + F` (Windows) o `Cmd + F` (Mac)
   - O usa los filtros de Google Sheets (icono de embudo)

2. **Editar el campo deseado**:
   - Click en la celda
   - Modificar el valor
   - Presionar `Enter`

3. **Verificar cambios**:
   - La columna "Modificado" cambiará a `TRUE` automáticamente
   - La fila se marcará con color amarillo

4. **Esperar sincronización**:
   - Los cambios se sincronizan automáticamente cada 15 minutos
   - No necesitas hacer nada más

**Ejemplo**: Cambiar precio de Michelin PS4

```
Antes:
| Título          | Precio  | Modificado |
| Michelin PS4    | 197471  | FALSE      |

Después de editar:
| Título          | Precio  | Modificado |
| Michelin PS4    | 199500  | TRUE       | ← Marcado automáticamente
                    ↑
              Editaste esto
```

### Editar Múltiples Productos a la Vez

**Método 1: Copiar y Pegar**

1. Edita el primer producto
2. Copia la celda (`Ctrl + C`)
3. Selecciona las otras celdas
4. Pega (`Ctrl + V`)

**Método 2: Arrastrar**

1. Edita una celda
2. Selecciona la celda
3. Arrastra desde la esquina inferior derecha (punto azul)
4. Suelta sobre las celdas que quieres cambiar

**Método 3: Buscar y Reemplazar**

1. `Ctrl + H` (Buscar y reemplazar)
2. Buscar: valor antiguo
3. Reemplazar: valor nuevo
4. Click en "Reemplazar todo"

### Aumentar Precios en Porcentaje

**Ejemplo**: Aumentar todos los precios 10%

1. Crea una columna auxiliar (por ejemplo, columna Z)
2. En la primera celda (Z2): `=J2*1.10` (si J es la columna de precios)
3. Arrastra la fórmula hacia abajo
4. Copia toda la columna Z
5. Pega en columna J como "Valores solamente" (click derecho → Pegado especial → Solo valores)
6. Elimina la columna Z

### Marcar Productos como Inactivos

1. Busca los productos que quieres desactivar
2. En la columna "Estado", cambia `ACTIVO` a `INACTIVO`
3. Se sincronizará en 15 min y desaparecerán de la tienda

**⚠️ Advertencia**: Los productos INACTIVOS no se muestran en la tienda online

### Actualizar Stock

**Método directo**:

1. Encuentra el producto
2. Edita la columna "Stock"
3. Ingresa el nuevo valor (número entero)

**Método por diferencia** (suma/resta):

Si quieres sumar 10 unidades:

1. Columna auxiliar: `=L2+10` (si L es Stock)
2. Arrastra
3. Copia y pega como valores

---

## 📊 Dashboard y Estadísticas

### Ver el Dashboard

**Método 1: Menú BYTE**

```
🚀 BYTE Panel → 📊 Ver Dashboard
```

**Método 2: Cambiar de hoja**

Click en la pestaña "Dashboard" abajo

### ¿Qué información muestra?

#### Estadísticas Generales

```
Total de Productos:           791
Productos Padre:              70
Productos Individuales:       721

Estado:
  ✅ Activos:                 785
  ❌ Inactivos:               6

Modificados (pendientes):     3    ⚠️
```

**Interpretación**:
- **Total**: Cuántos productos hay en total
- **Padre**: Productos con múltiples medidas
- **Individuales**: Productos únicos
- **Activos**: Visibles en la tienda
- **Inactivos**: Ocultos en la tienda
- **Modificados**: Pendientes de sincronizar a Shopify

#### Inventario

```
Inventario:
  📦 Stock Total:             15,820 unidades
  💰 Valor Total:             $45,234,567.89
```

**Interpretación**:
- **Stock Total**: Suma de todas las unidades disponibles
- **Valor Total**: Stock × Precio (valor total del inventario)

#### Top Marcas

```
📦 TOP MARCAS
────────────────────────────────────────────────────────────
  Michelin                    458
  BFGoodrich                  333
```

Muestra cuántos productos hay de cada marca

#### Última Actualización

```
🕐 Última actualización:      17/01/2025 14:35:22
```

Cuándo fue la última sincronización con Shopify

### Usar el Dashboard para Decisiones

**Ejemplos prácticos**:

1. **Control de Stock**:
   - Si el Stock Total baja mucho → Pedir más mercadería
   - Si Valor Total sube → Buena gestión de inventario

2. **Productos Inactivos**:
   - Si hay muchos inactivos → Revisar por qué
   - Posiblemente productos sin stock o discontinuados

3. **Modificados Pendientes**:
   - Si hay muchos pendientes → Esperar próxima sincronización
   - Si hay demasiados → Verificar que no haya errores

---

## 📜 Historial de Cambios

### ¿Para qué sirve?

El historial te permite:

- ✅ Ver **quién** modificó cada producto
- ✅ Ver **qué** campo se modificó
- ✅ Ver **cuándo** se hizo el cambio
- ✅ Ver el **valor anterior** y **nuevo**
- ✅ Detectar errores y revertirlos

### Acceder al Historial

**Método 1**: Click en la pestaña "Historial"

**Método 2**: Menú BYTE
```
🚀 BYTE Panel → Ver Historial de Cambios
```

### Estructura del Historial

| Fecha/Hora | Usuario | Handle | Campo | Valor Anterior | Valor Nuevo |
|------------|---------|--------|-------|----------------|-------------|
| 17/01 14:30 | Juan | michelin-ps4-p | Precio | 197471 | 199500 |
| 17/01 14:15 | María | bfg-ko2-p | Stock | 10 | 15 |
| 17/01 14:00 | Pedro | michelin-ps4-p | Estado | ACTIVO | INACTIVO |

### Buscar en el Historial

**Por usuario**:
1. Usa el filtro de Google Sheets
2. Columna "Usuario" → Filtrar por nombre

**Por producto**:
1. Filtro en columna "Handle"
2. Busca el producto específico

**Por fecha**:
1. Filtro en columna "Fecha/Hora"
2. Rango de fechas

**Por campo modificado**:
1. Filtro en columna "Campo"
2. Selecciona: Precio, Stock, etc.

### Detectar y Corregir Errores

**Ejemplo**: Juan cambió el precio por error

1. Busca en historial por usuario "Juan"
2. Encuentra: Precio cambió de 197471 a 19500 (olvidó un dígito)
3. Ve a la hoja "Productos"
4. Busca el producto por Handle
5. Corrige el precio a 197471
6. El sistema registrará la corrección

---

## 🎯 Buenas Prácticas

### Antes de Editar

✅ **Verifica que tienes el producto correcto**
   - Revisa el Handle y SKU
   - Confirma marca y modelo

✅ **Usa filtros para trabajar**
   - Filtra por marca si editarás solo Michelin
   - Filtra por tipo si editarás solo PADRES

✅ **Haz un "backup mental"**
   - Fíjate el valor anterior antes de cambiar
   - Si te equivocas, sabrás a qué volver

### Durante la Edición

✅ **Edita un grupo pequeño primero**
   - Prueba con 5-10 productos
   - Verifica que funcionó
   - Luego edita masivamente

✅ **No edites columnas bloqueadas**
   - Respeta los campos de solo lectura 🔒
   - Si necesitas editar algo bloqueado, contacta a BYTE

✅ **Valida formatos**
   - Precios: números sin puntos de miles (197471, no 197.471)
   - Stock: números enteros (20, no 20.5)
   - Estado: exactamente "ACTIVO" o "INACTIVO"

### Después de Editar

✅ **Revisa la columna "Modificado"**
   - Debe decir `TRUE` en las filas que editaste
   - Si no, puede que el cambio no se sincronice

✅ **Verifica el Dashboard**
   - Cantidad de "Modificados pendientes"
   - Debe coincidir con lo que editaste

✅ **Espera la próxima sincronización**
   - Máximo 15 minutos
   - Luego verifica en Shopify Admin que se aplicó

### Sincronización Manual (opcional)

Si necesitas que se sincronice YA (no esperar 15 min):

```
🚀 BYTE Panel → 🔄 Sincronizar Ahora
```

**⚠️ Úsalo solo cuando sea urgente**, la sincronización automática es suficiente

---

## 🐛 Problemas Comunes

### Problema 1: "No puedo editar una celda"

**Síntoma**: Al hacer click, no se puede escribir

**Causas posibles**:
1. ✅ La columna es de solo lectura (🔒)
2. ✅ No tienes permisos de edición en el Sheet

**Solución**:
1. Verifica que la columna sea editable (mira la tabla de columnas arriba)
2. Si es editable pero sigue bloqueada, contacta al administrador del Sheet
3. Puede que no tengas permisos de "Editor", solo de "Viewer"

---

### Problema 2: "Edité pero no se sincronizó"

**Síntoma**: Hiciste cambios, esperaste 15+ min, pero no se ven en Shopify

**Diagnóstico**:

1. ✅ **Verifica columna "Modificado"**:
   - ¿Dice `TRUE`?
   - Si dice `FALSE`, el sistema no detectó el cambio

2. ✅ **Verifica Dashboard**:
   - ¿Aparece en "Modificados pendientes"?
   - Si no, no está marcado para sincronizar

3. ✅ **Verifica formato del dato**:
   - Precio: ¿es un número válido?
   - Stock: ¿es un entero?
   - Estado: ¿dice exactamente "ACTIVO" o "INACTIVO"?

**Solución**:

Si el problema es que no se marcó:
```
🚀 BYTE Panel → ✅ Marcar Modificados para Sync
```

Si el formato es incorrecto:
- Corrige el formato
- La celda se marcará automáticamente

Si todo está bien pero no sincroniza:
- Contacta a BYTE Support
- Pueden haber problemas con n8n o Shopify API

---

### Problema 3: "Cambié un precio y ahora es 0"

**Síntoma**: Editaste el precio y el sistema lo cambió a 0

**Causa**: Validación automática detectó un formato incorrecto

**Solución**:

1. Verifica que el precio sea un **número** (sin letras, sin símbolos)
2. Usa punto decimal si es necesario: `199500.50`
3. NO uses:
   - Signos de pesos: ~~$199500~~
   - Puntos de miles: ~~199.500~~
   - Comas: ~~199,500~~

**Formato correcto**: `199500` o `199500.50`

---

### Problema 4: "Borré una fila por error"

**Síntoma**: Borraste una fila completa de productos

**Solución inmediata**:

1. `Ctrl + Z` (deshacer)
2. Si no funciona, la fila se perdió del Sheet

**Recuperación**:

1. No te preocupes, el producto sigue en Shopify
2. Espera la próxima sincronización (15 min)
3. n8n volverá a traer el producto de Shopify al Sheet
4. La fila reaparecerá

**Prevención**:

- NO borres filas completas
- Si quieres "eliminar" un producto, márcalo como `INACTIVO`

---

### Problema 5: "El stock es negativo"

**Síntoma**: Stock muestra -5, -10, etc.

**Causa**: Error de edición o cálculo

**Solución**:

1. El sistema debería validar y rechazar stock negativo
2. Si pasó, edítalo manualmente a 0 o al valor correcto
3. Si el problema persiste, contacta a BYTE

**Importante**: Stock negativo en Shopify no es válido, corregir siempre

---

### Problema 6: "Veo productos duplicados"

**Síntoma**: El mismo producto aparece 2 o más veces

**Causa**: Error en sincronización o handles duplicados

**Solución**:

1. NO borres ninguna fila
2. Toma una captura de pantalla
3. Contacta a BYTE Support inmediatamente
4. Ellos limpiarán la duplicación desde n8n

**Prevención**: No crear filas manualmente, solo editar las existentes

---

### Problema 7: "Mensaje de error al editar"

**Síntoma**: Al cambiar una celda, aparece un mensaje de error

**Ejemplos comunes**:

**Error**: "⚠️ El precio debe ser un número positivo"
**Solución**: Ingresa un número mayor a 0

**Error**: "⚠️ El stock debe ser un número entero positivo"
**Solución**: Ingresa un número entero (sin decimales), mayor o igual a 0

**Error**: "⚠️ El estado debe ser ACTIVO o INACTIVO"
**Solución**: Escribe exactamente "ACTIVO" o "INACTIVO" (mayúsculas)

Estas validaciones **previenen errores**, no las ignores

---

## 💡 Casos de Uso Reales

### Caso 1: Actualización Mensual de Precios

**Situación**: Todos los meses, Michelin ajusta precios un 5%

**Proceso**:

1. Filtra productos por Marca = "Michelin"
2. Crea columna auxiliar con fórmula: `=J2*1.05`
3. Copia y pega como valores en columna Precio
4. Elimina columna auxiliar
5. Espera sincronización

**Tiempo**: 10 minutos (vs 3 horas manualmente en Shopify)

---

### Caso 2: Stock Bajo - Reposición

**Situación**: Necesitas ver qué productos tienen menos de 10 unidades

**Proceso**:

1. Click en columna "Stock"
2. Filtro → "Menor que" → 10
3. Exporta la lista o anótala
4. Haz pedido de reposición
5. Cuando llegue, actualiza stock desde el Sheet

**Tiempo**: 2 minutos (vs 30 min revisando Shopify Admin)

---

### Caso 3: Desactivar Productos Discontinuados

**Situación**: BFGoodrich discontinúa el modelo "MUD TERRAIN KM2"

**Proceso**:

1. Filtra por Modelo = "MUD TERRAIN T/A KM2"
2. Selecciona todas las filas
3. En columna "Estado", cambia todas a "INACTIVO"
4. Sincronización automática

**Resultado**: Todos los KM2 desaparecen de la tienda

**Tiempo**: 1 minuto (vs 15 min en Shopify Admin)

---

### Caso 4: Cambio de Proveedor

**Situación**: Cambias de distribuidor y los precios cambian

**Proceso**:

1. Tienes un Excel con los nuevos precios
2. Abre ambos archivos (Google Sheets + Excel)
3. Usa `VLOOKUP` o `BUSCARV` para emparejar por SKU
4. Copia los nuevos precios
5. Pega en columna Precio del BYTE Panel
6. Espera sincronización

**Tiempo**: 15 minutos (vs manual imposible o varios días)

---

## 📞 Contacto y Soporte

### ¿Cuándo contactar a BYTE Support?

✅ **Contacta cuando**:
- No puedes resolver un problema siguiendo esta guía
- Ves comportamiento extraño (duplicados, datos incorrectos)
- Necesitas agregar/quitar columnas
- Quieres nuevas funcionalidades
- Problemas con sincronización

❌ **NO es necesario contactar para**:
- Dudas sobre cómo editar (revisa esta guía primero)
- Cambios que hiciste por error (usa Ctrl+Z o historial)
- Preguntas sobre Google Sheets (busca en ayuda de Google)

### Información de Contacto

```
📧 Email:      contacto@byte.com.ar
📱 WhatsApp:   +54 9 11 XXXX-XXXX
📞 Teléfono:   (011) XXXX-XXXX
🌐 Web:        www.byte.com.ar

Horario:
  Lunes a Viernes: 9:00 - 18:00 hs
  Sábados: 9:00 - 13:00 hs
```

### ¿Qué información enviar al contactar?

Para ayudarte más rápido, incluye:

1. ✅ **Descripción del problema**: ¿Qué pasó?
2. ✅ **Pasos para reproducir**: ¿Cómo llegaste al error?
3. ✅ **Captura de pantalla**: Si es un error visual
4. ✅ **Handle del producto**: Si es sobre un producto específico
5. ✅ **Tu nombre**: Para identificar quién reporta

**Ejemplo de mensaje**:

> Hola BYTE,
>
> Soy María de Rodavial.
>
> Problema: Cambié el precio del producto "michelin-ps4-p" de 197471 a 199500, la columna Modificado dice TRUE, esperé 30 minutos, pero en Shopify sigue apareciendo el precio viejo.
>
> Adjunto captura del Sheet.
>
> Gracias,
> María

---

## 🎓 Recursos de Aprendizaje

### Videos Tutoriales

- 🎥 [BYTE Panel: Primeros Pasos (5 min)](#)
- 🎥 [Cómo editar productos masivamente (8 min)](#)
- 🎥 [Usar el Dashboard (3 min)](#)
- 🎥 [Historial: detectar y corregir errores (6 min)](#)

### Documentación Complementaria

- 📘 [Instalación Técnica](BYTE_CONTROL_PANEL.md)
- 📕 [Manual Técnico](BYTE_TECH_MANUAL.md)
- 📙 [FAQ](BYTE_FAQ.md)

### Ayuda de Google Sheets

- [Google Sheets: Formulas básicas](https://support.google.com/docs/answer/3093275)
- [Google Sheets: Filtros](https://support.google.com/docs/answer/3540681)
- [Google Sheets: Buscar y reemplazar](https://support.google.com/docs/answer/62754)

---

## ✅ Checklist de Tareas Comunes

### Actualización Mensual de Precios

- [ ] Recibir lista de nuevos precios
- [ ] Abrir BYTE Panel
- [ ] Filtrar productos a actualizar
- [ ] Aplicar fórmula de ajuste o copiar nuevos precios
- [ ] Verificar que columna "Modificado" = TRUE
- [ ] Revisar Dashboard → Modificados pendientes
- [ ] Esperar 15 min (sincronización automática)
- [ ] Verificar en Shopify que se aplicaron los cambios

### Control de Stock Semanal

- [ ] Abrir Dashboard
- [ ] Revisar Stock Total
- [ ] Filtrar productos con Stock < 10
- [ ] Exportar/anotar lista
- [ ] Hacer pedido de reposición
- [ ] Al recibir, actualizar stock en BYTE Panel
- [ ] Sincronización automática

### Desactivar Productos

- [ ] Identificar productos a desactivar
- [ ] Filtrar por marca/modelo
- [ ] Cambiar Estado a "INACTIVO"
- [ ] Verificar Dashboard → Productos Inactivos
- [ ] Confirmar en Shopify que no aparecen

### Revisión de Historial (Mensual)

- [ ] Abrir hoja Historial
- [ ] Revisar cambios del último mes
- [ ] Identificar errores o anomalías
- [ ] Corregir si es necesario
- [ ] Documentar lecciones aprendidas

---

<div align="center">

![BYTE Logo](../src/media/Byte.png)

## 🚀 ¿Listo para trabajar?

**Abre tu BYTE Panel y comienza a gestionar tu tienda** ✨

[📖 Volver al Índice](#-índice) •
[📧 Contactar Soporte](mailto:contacto@byte.com.ar) •
[🌐 BYTE Website](https://www.byte.com.ar)

---

**BYTE - Soluciones Tecnológicas a Medida**

*Desarrollamos software que impulsa tu negocio* 🚀

---

© 2025 BYTE. Desarrollado con ❤️ para Rodavial.

</div>
