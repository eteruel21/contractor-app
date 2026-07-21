# Estrategia de Monitoreo y Alertas — Staging y Producción (T-072)

Este documento define la configuración de monitoreo continuo de disponibilidad, captura de errores, salud de la base de datos y alertas de fallos de autenticación para Contractor App.

---

## 1. Monitoreo de Disponibilidad (Uptime)

- **Endpoint Primario**: `GET https://staging-api.contractor.app/health`
- **Frecuencia de Muestreo**: Cada 60 segundos.
- **Criterio de Alerta**:
  - Código HTTP != 200 por más de 2 intervalos consecutivos (2 minutos).
  - Tiempo de respuesta > 2000 ms.
- **Herramienta Recomendada**: Better Stack / UptimeRobot / Datadog.

---

## 2. Diagnóstico de Base de Datos y Recursos

- **Endpoint de Base de Datos**: `GET https://staging-api.contractor.app/health/database`
- **Criterio de Alerta**:
  - Estado 503 Service Unavailable ("No se pudo conectar con PostgreSQL").
  - Agotamiento de pool de conexiones o incremento anómalo en la latencia de consulta (`server_time`).

---

## 3. Captura y Rastreo de Errores

- **Formato de Logs**: Salida estructurada JSON mediante el logger de Fastify (Pino) a `stdout`.
- **Integración de Telemetría**: Sentry / Datadog APM.
- **Criterio de Alerta**:
  - Tasa de errores 5xx > 1% en un periodo de 5 minutos.
  - Excepciones no capturadas (`uncaughtException` / `unhandledRejection`).

---

## 4. Alertas de Fallos de Autenticación y Seguridad

- **Monitoreo de Endpoints Críticos**: `/api/auth/login` y `/api/auth/refresh`.
- **Regla de Alerta por Fuerza Bruta / Ataque**:
  - Más de 20 respuestas `401 Unauthorized` o `429 Too Many Requests` desde un mismo bloque de IP en 5 minutos.
  - Disparo de notificación automática a Slack/Discord/Email para el equipo de Operaciones y Seguridad.
