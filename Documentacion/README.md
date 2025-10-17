# 📚 Documentación - Índice

Bienvenido a la documentación completa del sistema de sincronización Google Sheets → Shopify.

## 🚀 Para Empezar

Si es tu primera vez, empieza por aquí:

1. **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)** ⭐
   - Guía para empezar en 5 minutos
   - Configuración mínima
   - Primer test exitoso

2. **[VERIFICAR_ANTES_DE_EJECUTAR.md](VERIFICAR_ANTES_DE_EJECUTAR.md)**
   - Checklist pre-ejecución
   - Validación de credenciales
   - Verificación de accesos

3. **[SETUP.md](SETUP.md)**
   - Instalación paso a paso
   - Configuración detallada
   - Troubleshooting

## 🔧 Configuración

### Autenticación con Google Sheets

**Opción 1 - API Key (Más Simple):**
- **[COMO_USAR_API_KEY.md](COMO_USAR_API_KEY.md)** ⭐ Recomendado para empezar
  - Configuración en 4 pasos
  - Requiere Sheet público
  - Perfecto para testing

**Opción 2 - Service Account (Más Seguro):**
- **[DONDE_OBTENER_CREDENTIALS.md](DONDE_OBTENER_CREDENTIALS.md)**
  - Sheets privados
  - Más pasos de configuración
  - Recomendado para producción

## 📊 Estructura de Datos

- **[ESTRUCTURA_DATOS.md](ESTRUCTURA_DATOS.md)**
  - Columnas del Google Sheet
  - Mapeo a formato Shopify
  - Ejemplos de datos
  - Validaciones

## 🚀 Sistema Optimizado

### Guía del Usuario
- **[SISTEMA_OPTIMIZADO.md](SISTEMA_OPTIMIZADO.md)** ⭐ **LÉEME PRIMERO**
  - ¿Qué se optimizó?
  - Scripts disponibles
  - Cómo probar el sistema
  - Qué esperar en los logs
  - FAQ

### Documentación Técnica
- **[OPTIMIZACIONES.md](OPTIMIZACIONES.md)**
  - Problemas identificados
  - Soluciones implementadas
  - Arquitectura del sistema
  - Detalles de implementación
  - Comparación antes/después
  - Referencias a APIs

## 🗂️ Navegación Rápida por Tema

### Para Desarrolladores
```
1. SETUP.md                      → Instalación
2. ESTRUCTURA_DATOS.md           → Estructura de datos
3. OPTIMIZACIONES.md             → Arquitectura técnica
4. Código fuente en /src/        → Implementación
```

### Para Usuarios Finales
```
1. INICIO_RAPIDO.md              → Empezar rápido
2. VERIFICAR_ANTES_DE_EJECUTAR.md → Checklist
3. SISTEMA_OPTIMIZADO.md         → Usar el sistema
4. COMO_USAR_API_KEY.md          → Configurar API Key
```

### Para Testing
```
1. VERIFICAR_ANTES_DE_EJECUTAR.md → Pre-test checklist
2. SISTEMA_OPTIMIZADO.md          → Scripts de test
3. npm run test:optimized         → Ejecutar test
```

## 📋 Resumen de Archivos

| Archivo | Propósito | Audiencia |
|---------|-----------|-----------|
| **INICIO_RAPIDO.md** | Empezar en minutos | 👤 Usuario |
| **SETUP.md** | Instalación completa | 👤 Usuario / 👨‍💻 Dev |
| **VERIFICAR_ANTES_DE_EJECUTAR.md** | Checklist pre-test | 👤 Usuario |
| **COMO_USAR_API_KEY.md** | Configurar API Key | 👤 Usuario |
| **DONDE_OBTENER_CREDENTIALS.md** | Service Account setup | 👤 Usuario |
| **ESTRUCTURA_DATOS.md** | Mapeo de datos | 👨‍💻 Dev |
| **SISTEMA_OPTIMIZADO.md** | Guía del sistema optimizado | 👤 Usuario |
| **OPTIMIZACIONES.md** | Detalles técnicos | 👨‍💻 Dev |

## 🎯 Flujos Recomendados

### Flujo 1: Primera Instalación
```
1. SETUP.md
   ↓
2. COMO_USAR_API_KEY.md
   ↓
3. VERIFICAR_ANTES_DE_EJECUTAR.md
   ↓
4. npm run test:optimized
```

### Flujo 2: Uso Diario
```
1. VERIFICAR_ANTES_DE_EJECUTAR.md
   ↓
2. npm run test:optimized (opcional)
   ↓
3. npm run sync:all
```

### Flujo 3: Troubleshooting
```
1. VERIFICAR_ANTES_DE_EJECUTAR.md
   ↓
2. SISTEMA_OPTIMIZADO.md (FAQ)
   ↓
3. SETUP.md (Solución de Problemas)
```

### Flujo 4: Desarrollo
```
1. ESTRUCTURA_DATOS.md
   ↓
2. OPTIMIZACIONES.md
   ↓
3. Código en /src/
   ↓
4. npm run test:optimized
```

## 🔗 Enlaces Útiles

- **Repositorio**: [Volver al README principal](../README.md)
- **Código fuente**: `../src/`
- **Google Sheet**: [1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI](https://docs.google.com/spreadsheets/d/1XghMdKq5defsbHlISVkDry0TEoR9Wsr1KFxmjO_ZeAI)
- **Tienda Shopify**: [aby0mb-0a.myshopify.com/admin](https://aby0mb-0a.myshopify.com/admin)

## ❓ ¿Por Dónde Empiezo?

### Si es tu primera vez:
👉 **[INICIO_RAPIDO.md](INICIO_RAPIDO.md)**

### Si ya está configurado:
👉 **[SISTEMA_OPTIMIZADO.md](SISTEMA_OPTIMIZADO.md)**

### Si necesitas configurar desde cero:
👉 **[SETUP.md](SETUP.md)**

### Si estás desarrollando:
👉 **[OPTIMIZACIONES.md](OPTIMIZACIONES.md)**

---

**¿Necesitas ayuda?** Revisa la sección "Solución de Problemas" en [SETUP.md](SETUP.md) o consulta el FAQ en [SISTEMA_OPTIMIZADO.md](SISTEMA_OPTIMIZADO.md).
