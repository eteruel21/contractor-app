# Estrategia de Monitoreo y Alertas — Producción (T-147)

Este documento define la configuración y activación de monitoreo continuo de disponibilidad, captura de errores, salud de la base de datos y alertas operativas para **Contractor Pro**.

---

## 1. Monitoreo de Disponibilidad (Uptime Activation)

- **Endpoint API Primario**: `GET https://api.contractor.com.pa/health`
- **Endpoint Database Check**: `GET https://api.contractor.com.pa/health/database`
- **Frecuencia de Muestreo**: Cada 60 segundos.
- **Criterio de Alerta Crítica**:
  - Código HTTP != 200 por más de 2 intervalos consecutivos (2 minutos).
  - Latencia de respuesta > 2000 ms.
- **Servicios de Monitoreo Configurados**: Better Stack / UptimeRobot / Cloudflare Health Checks.

---

## 2. Alertas de Base de Datos PostgreSQL

- **Métrica Evaluada**: Conexiones activas, latencia de consulta y estado del pool.
- **Regla de Alerta**:
  - Estado HTTP 503 (`"No se pudo conectar con PostgreSQL"`).
  - Uso de conexiones de base de datos > 85% del límite configurado.

---

## 3. Logs y Registro de Errores

- **Formato de Logs**: Salida JSON estructurada mediante logger de Fastify (Pino) enviada a almacenamiento de auditoría.
- **Rastreo de Excepciones**: Agregación de errores 5xx con alerta directa si la tasa supera 1% en un intervalo de 5 minutos.

---

## 4. Alertas de Seguridad y Rate Limiting

- **Monitoreo de Endpoints de Autenticación**: `/auth/login`, `/auth/refresh`, `/account/delete`.
- **Regla de Seguridad**:
  - Disparo de bloqueo por rate limiting (respuestas `429 Too Many Requests`) > 15 eventos por minuto.
  - Alerta inmediata a canales de guardia ante múltiples intentos fallidos de autenticación.
