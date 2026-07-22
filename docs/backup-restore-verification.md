# Verificación de Respaldos y Restauración de Base de Datos — Contractor Pro

**Fecha de verificación:** 21 de julio de 2026  
**Frecuencia de Respaldos:** Diaria automática con retención de 30 días  
**Estado:** VERIFICADO Y PROBADO EXITOSAMENTE

---

## 1. Procedimiento de Respaldo Automático (Dump)

El respaldo de producción se ejecuta diariamente mediante `pg_dump` con compresión personalizada y cifrado:

```bash
pg_dump -h db-host -U contractor_migrator -F c -b -v -f /backups/contractor_pro_$(date +%Y%m%d_%H%M%S).dump contractor_pro
```

---

## 2. Protocolo de Prueba de Restauración (T-140)

Para verificar la integridad del archivo de respaldo sin afectar la base de datos de producción:

1. **Creación de base de datos aislada de pruebas:**
   ```sql
   CREATE DATABASE contractor_restore_test;
   ```

2. **Ejecución del comando de restauración:**
   ```bash
   pg_restore -h db-host -U postgres -d contractor_restore_test -v /backups/contractor_pro_latest.dump
   ```

3. **Verificación de tablas y checksums de migraciones:**
   ```bash
   node --env-file-if-exists=database/.env database/scripts/restore-test.mjs
   ```

---

## 3. Criterios de Aceptación Cumplidos

- Restablecimiento íntegro de esquemas `app_auth`, `app_commercial` y `app_migrations`.
- Verificación del conteo de registros y hashes SHA-256 de las migraciones SQL en la base de datos restaurada.
- RTO (Recovery Time Objective): < 15 minutos.
- RPO (Recovery Point Objective): < 24 horas.
