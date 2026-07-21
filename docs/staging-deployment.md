# Guía de Alojamiento y Despliegue en Staging — Contractor App

Este documento define la arquitectura de hosting, configuración de seguridad y procedimientos para el entorno de **Staging** de Contractor App.

---

## 1. Selección de Alojamiento

### PostgreSQL (T-061)
- **Proveedor Recomendado**: Neon PostgreSQL / Render Managed PostgreSQL (Standard tier+).
- **Justificación**:
  - **Permanencia**: Almacenamiento persistente redundante con alta disponibilidad.
  - **Conexiones Seguras**: Requiere transporte cifrado obligatorio SSL/TLS (`PGSSL=require`).
  - **Backups**: Respaldo automático diario automatizado y soporte de recuperación punto en el tiempo (PITR).
  - **Connection Pooling**: PgBouncer integrado nativo para optimizar el número de conexiones simultáneas.

### Fastify API (T-062)
- **Proveedor Recomendado**: Render Web Service / Railway / Fly.io (Node.js runtime o Docker).
- **Justificación**:
  - **Disponibilidad Permanente**: Instancia activa sin suspensión ("no cold start") garantizando respuesta continua a peticiones HTTP.
  - **HTTPS & SSL**: Terminación TLS automática mediante certificados wildcard de Let's Encrypt / Cloudflare.
  - **Variables Secretas**: Gestor seguro de entorno aislado en el panel de hosting (encriptación en reposo).
  - **Logs**: Captura de logs en tiempo real (`stdout`/`stderr` en JSON vía Pino logger) exportables a recolectores de eventos.

---

## 2. Configuración de Variables de Entorno de Staging

### API Fastify (T-065)

| Variable | Descripción / Ejemplo |
| :--- | :--- |
| `NODE_ENV` | `staging` |
| `API_HOST` | `0.0.0.0` |
| `API_PORT` | `3001` |
| `PGHOST` | `ep-staging-db.neon.tech` (o host provisto por Render) |
| `PGPORT` | `5432` |
| `PGDATABASE` | `contractor_staging` |
| `PGUSER` | `contractor_api` |
| `PGPASSWORD` | `<secret_strong_password>` |
| `PGSSL` | `require` |
| `JWT_SECRET` | Secret de 256 bits (cadena aleatoria de alta entropía >= 43 caracteres) |
| `JWT_ISSUER` | `contractor-api-staging` |
| `JWT_AUDIENCE` | `contractor-app-staging` |
| `CORS_ORIGINS` | Dominios exactos de staging (ver T-068) |
| `SMTP_HOST` | `smtp.resend.com` (o servidor SMTP de staging) |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | `resend` |
| `SMTP_PASS` | `<secret_smtp_key>` |
| `EMAIL_FROM` | `no-reply-staging@contractor.app` |
| `CAPTCHA_SECRET` | Secret de Cloudflare Turnstile / hCaptcha de Staging |
| `CAPTCHA_ENABLED` | `true` |

---

### Frontends (T-066)

#### Admin Web (`apps/admin-web`)
- `VITE_API_URL`: `https://staging-api.contractor.app`

#### Mobile / Expo (`apps/mobile`)
- `EXPO_PUBLIC_API_URL`: `https://staging-api.contractor.app`

---

## 3. Configuración de CORS Restrictivo (T-068)

En Staging, la API rechazará cualquier origen no incluido explícitamente en la variable `CORS_ORIGINS`.

**Ejemplo de `CORS_ORIGINS` en Staging:**
```env
CORS_ORIGINS=https://staging-admin.contractor.app,https://staging-app.contractor.app
```

---

## 4. Flujo de Despliegue de Staging (T-063 y T-064)

1. **Despliegue de PostgreSQL**:
   - Crear la base de datos `contractor_staging`.
   - Ejecutar la migración automática desde CI/CD o consola de administración:
     ```bash
     MIGRATOR_DATABASE_URL="postgresql://contractor_migrator:<pass>@<host>:5432/contractor_staging?sslmode=require" npm run db:migrate
     ```

2. **Despliegue de API Fastify**:
   - Construir la imagen Docker usando el Dockerfile del repositorio o mediante el runner de Node.js 22.
   - Compilar el proyecto TypeScript:
     ```bash
     npm run build:api
     ```
   - Iniciar el servidor:
     ```bash
     npm run start -w apps/api
     ```
