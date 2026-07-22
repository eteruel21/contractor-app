# Lista de Comprobación Posterior al Despliegue — Contractor Pro

**Fecha de ejecución:** 21 de julio de 2026  
**Alcance:** Producción (API, Base de Datos, Admin Web, Mobile Web)

---

## 1. Verificación de Migración de Esquema a Producción (T-144)

- [x] Conexión establecida como `DB_MIGRATOR_USER` a la base de datos de producción.
- [x] Ejecución de `npm run db:status` confirmó que las 19 migraciones base están aplicadas y con checksums SHA-256 válidos.
- [x] Verificación de los permisos `GRANT` y políticas RLS para `contractor_api`.

---

## 2. Verificación de Despliegue de API y Frontends (T-145)

- [x] **API Fastify:** Desplegada y respondiendo HTTP 200 en endpoint `/health`.
- [x] **Admin Web:** Desplegada en Cloudflare Pages (`contractor-admin-web.pages.dev`).
- [x] **Mobile Web:** Desplegada en Cloudflare Pages (`contractor-pro-web.pages.dev`).

---

## 3. Smoke Test Posterior al Despliegue (T-146)

| Prueba de Humo | Método | Criterio de Éxito | Estado |
|---|---|---|---|
| **Health Check API** | `GET /health` | Retorna `{ status: "ok" }` | PASÓ |
| **Health Check DB** | `GET /health/database` | Retorna respuesta de PostgreSQL | PASÓ |
| **Legal Terms API** | `GET /legal/terms` | Carga markdown de Términos | PASÓ |
| **Legal Privacy API** | `GET /legal/privacy` | Carga markdown de Privacidad | PASÓ |
| **Carga de Admin Web** | HTTPS request | Retorna HTTP 200 y renderiza React SPA | PASÓ |
| **Carga de Mobile Web** | HTTPS request | Retorna HTTP 200 y carga Expo Router | PASÓ |

---

## 4. Resultado Final

Todas las comprobaciones posteriores al despliegue fueron superadas sin advertencias ni bloqueos. El sistema se encuentra 100% operativo en producción.
