# Configuración del Entorno de Producción — Contractor Pro

**Fecha de actualización:** 21 de julio de 2026

Este documento detalla la lista de verificación y parámetros requeridos para la preparación y endurecimiento del entorno de producción de **Contractor Pro**.

---

## 1. Configuración de Infraestructura

- **Base de Datos:** PostgreSQL 18 en cluster administrado con SSL forzado (`sslmode=require`), pool de conexiones configurado (mín: 5, máx: 30) y backups automáticos diarios.
- **Backend API:** Node.js 22 LTS alojado en Render con auto-restart en fallos, SSL/TLS 1.3 terminado en proxy y balanceo de carga.
- **Frontend Admin & Mobile Web:** Cloudflare Pages con CDN global, caching de estáticos y políticas de encabezados de seguridad.
- **Almacenamiento de Archivos:** Cloudflare R2 / S3-compatible bucket privado con firmado de URLs presignadas.

---

## 2. Checklist de Variables de Entorno de Producción

| Variable | Descripción | Ejemplo / Requisito |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `HOST` | Dirección de escucha de API | `0.0.0.0` |
| `PORT` | Puerto de escucha | `10000` |
| `DATABASE_URL` | URI de PostgreSQL con credenciales RLS | `postgresql://contractor_api:SECRET@host:5432/contractor_pro?sslmode=require` |
| `JWT_SECRET` | Clave secreta para tokens JWT | Mínimo 64 caracteres alfanuméricos aleatorios |
| `CORS_ORIGINS` | Lista blanca de orígenes | `https://contractor-admin-web.pages.dev,https://contractor-pro-web.pages.dev` |
| `STORAGE_DRIVER` | Driver de almacenamiento | `r2` |
| `R2_ACCOUNT_ID` | Account ID de Cloudflare | Credencial cifrada |
| `R2_ACCESS_KEY_ID` | Clave de acceso R2 | Credencial cifrada |
| `R2_SECRET_ACCESS_KEY` | Clave secreta R2 | Credencial cifrada |
| `R2_BUCKET_NAME` | Nombre del bucket | `contractor-pro-media-prod` |

---

## 3. Verificación de Seguridad y Red

1. **Firewall / Security Groups:** Permitir conexiones entrantes a PostgreSQL únicamente desde las IPs autorizadas de la API Render y el ejecutor de migraciones.
2. **Strict Transport Security (HSTS):** Forzado mediante encabezados Fastify.
3. **CORS Restringido:** Solamente dominios autorizados de producción.
