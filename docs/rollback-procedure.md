# Procedimiento de Rollback de Producción — Contractor Pro

**Fecha de vigencia:** 21 de julio de 2026  
**Objetivo:** Establecer los pasos sistemáticos para revertir cambios en caso de fallo crítico en despliegue de API, Base de Datos o Frontends.

---

## 1. Trigger de Activación de Rollback

Se iniciará el procedimiento de rollback si dentro de los 30 minutos posteriores a un despliegue ocurre:
- Tasa de error HTTP 5xx > 2% en la API.
- Fallo en el inicio de la API o pérdida de conexión con PostgreSQL.
- Corrupción de datos o incompatibilidad crítica en la migración de base de datos.
- Imposibilidad de inicio de sesión o bloqueo general de usuarios.

---

## 2. Rollback del Backend API (Render)

1. Ingresar al Dashboard de **Render** -> Servicio `contractor-api`.
2. Ir a la pestaña **Events / Deploy History**.
3. Seleccionar la versión anterior que estuvo 100% estable (ejemplo: `Commit abc1234`).
4. Hacer clic en **Rollback to this deploy**.
5. Confirmar en el log de Render que el servicio volvió a responder HTTP 200 en `/health`.

---

## 3. Rollback de Base de Datos PostgreSQL

En caso de que una migración SQL haya generado errores:

1. **Reversión con Backup Inmediato:**
   Si la migración no es reversible de forma limpia:
   ```bash
   # Restablecer estado inmediatamente desde el último snapshot válido pre-despliegue
   pg_restore -h db-host -U postgres -d contractor_pro --clean /backups/pre_deploy_snapshot.dump
   ```

2. **Verificación de Checksums:**
   ```bash
   npm run db:status
   ```

---

## 4. Rollback de Interfaces Web (Cloudflare Pages)

1. Ingresar al panel de **Cloudflare Pages** -> Proyectos `contractor-admin-web` / `contractor-pro-web`.
2. Ir a la pestaña **Deployments**.
3. En el despliegue anterior estable, seleccionar los tres puntos `...` -> **Rollback to this deployment**.
4. La actualización tomará efecto en la red CDN global de Cloudflare en menos de 5 segundos.

---

## 5. Comunicación y Cierre

1. Notificar al equipo técnico y partes interesadas sobre la restauración del estado anterior.
2. Abrir ticket post-mortem para investigación de causa raíz (RCA).
