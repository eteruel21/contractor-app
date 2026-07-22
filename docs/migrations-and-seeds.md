# Control de Migraciones y Seeds - Contractor Pro

Este documento especifica el funcionamiento del sistema de migraciones, seeds y gestión del esquema de PostgreSQL en **Contractor Pro**.

---

## 1. Visión General del Sistema

Contractor Pro utiliza un motor personalizado de migraciones y semillas escrito en Node.js ESM (`database/scripts/`), diseñado para garantizar:

1. **Inmutabilidad y Control de Integridad**: Cada script SQL aplicado se registra con su suma de comprobación (SHA-256) en la tabla `app_migrations.schema_migrations`.
2. **Segregación de Roles**: Diferenciación estricta entre el rol migrador (`DB_MIGRATOR_USER`) y el rol de aplicación en runtime (`DB_APP_USER`).
3. **Control Transaccional**: Ejecución de cada migración dentro de un bloque transaccional atómico (`BEGIN ... COMMIT`).

---

## 2. Estructura de Directorios

```
database/
├── migrations/         # Scripts SQL de estructura (001_*.sql a 019_*.sql...)
├── seeds/              # Scripts SQL de datos de catálogo e inicialización
├── scripts/
│   ├── bootstrap.mjs   # Creación inicial de esquemas, roles y extensiones
│   ├── migrate.mjs     # Ejecutor de migraciones con validación de checksums
│   ├── seed.mjs        # Ejecutor de seeds de catálogo
│   ├── baseline.mjs    # Registro de estado base y reparación de checksums
│   └── db-utils.mjs    # Utilidades comunes de conexión PostgreSQL y hashing
└── .env.example        # Plantilla de variables de conexión PostgreSQL
```

---

## 3. Scripts de Administración y Comandos `npm`

| Comando | Script Ejecutado | Propósito |
| :--- | :--- | :--- |
| `npm run db:bootstrap` | `bootstrap.mjs` | Crea esquemas (`app_auth`, `app_commercial`, `app_migrations`), roles con permisos mínimos y extensiones SQL |
| `npm run db:migrate` | `migrate.mjs` | Aplica únicamente las migraciones pendientes y valida los checksums de las ya aplicadas |
| `npm run db:status` | `migrate.mjs --status` | Muestra una tabla comparativa con el estado (APPLIED / PENDING) de cada archivo de migración |
| `npm run db:seed` | `seed.mjs` | Aplica semillas pendientes (ej. catálogo oficial de construcción Panamá) |
| `npm run db:baseline` | `baseline.mjs` | Registra el estado actual del esquema sin volver a ejecutar migraciones históricas |
| `npm run db:repair-checksums` | `baseline.mjs --repair-checksums` | Actualiza la huella SHA-256 de archivos en entornos donde se autorizó un ajuste controlado |

---

## 4. Registro Histórico de Migraciones Actuales

| Archivo | Contenido / Alcance |
| :--- | :--- |
| `001_auth_foundation.sql` | Creación de esquemas base, tabla de usuarios y funciones auxiliares de autenticación. |
| `002_auth_identities.sql` | Identidades de autenticación (email/password, OAuth provider links). |
| `003_commercial_schema.sql` | Tablas comerciales principales: empresas, presupuestos, clientes, proyectos, facturación. |
| `004_api_permissions.sql` | Asignación de permisos `GRANT` y políticas iniciales RLS para la API. |
| `005_auth_sessions.sql` | Gestión de sesiones activas y control de estado de usuarios. |
| `006_catalog_api_permissions.sql` | Permisos de lectura pública/autenticada sobre el catálogo de construcción. |
| `007_company_client_api_permissions.sql` | Permisos de API para la gestión multi-tenant de clientes por empresa. |
| `008_install_user_profile_trigger.sql` | Trigger automático para la creación de perfiles al registrar un nuevo usuario. |
| `009_remaining_mobile_backend.sql` | Tablas y campos adicionales requeridos por la app móvil (ajustes, notificaciones). |
| `010_admin_web_api_permissions.sql` | Permisos específicos para el panel de administración web. |
| `011_remove_legacy_profile_rpc.sql` | Limpieza de funciones RPC heredadas de versiones anteriores. |
| `012_authorization_and_rls.sql` | Hardening de seguridad, políticas RLS en PostgreSQL y helper `app.current_user_id()`. |
| `013_auth_security_tokens.sql` | Tokens de refresco, restablecimiento de contraseña e invitaciones. |
| `014_budget_approval_and_calculations.sql` | Estados de aprobación de presupuestos e integración con desgloses de cálculo. |
| `015_invoice_snapshots_and_history.sql` | Snapshots inmutables de facturas y auditoría de cambios de estado. |
| `016_invoice_payments_and_receipts.sql` | Registro de cobros, parciales/totales, comprobantes y actualización de saldos. |
| `017_invoice_cancellations_and_credit_notes.sql` | Anulación de facturación, emisión de notas de crédito y reversión contable. |
| `018_agenda_and_projects.sql` | Gestión de proyectos, asignación de tareas, avances con fotos y eventos de agenda. |
| `019_teams_clients_audit.sql` | Invitaciones de equipo, roles por empresa, auditoría de clientes y seguridad RLS. |

---

## 5. Semillas de Datos (`database/seeds/`)

- `001_import_contraloria_catalog.sql`: Carga el catálogo oficial de rubros de construcción de Panamá (Contraloría / precios de referencia del mercado panameño), que incluye códigos, descripciones, unidades de medida (m², m³, global, c/u) y valores de costo directo de referencia.

---

## 6. Reglas e Invariantes para Desarrolladores

> [!IMPORTANT]
> **REGLA DE INMUTABILIDAD**: NUNCA edites ni elimines un archivo `.sql` dentro de `database/migrations/` o `database/seeds/` que ya haya sido aplicado en algún entorno. 

### Pasos para añadir una nueva migración:
1. Crea un nuevo archivo en `database/migrations/` siguiendo el patrón numérico de 3 dígitos:
   `020_nombre_descriptivo.sql`
2. Incluye comentarios explicativos al inicio del archivo SQL.
3. Asegúrate de incluir las declaraciones de seguridad `GRANT` necesarias para los roles `contractor_api` o `contractor_admin`.
4. Ejecuta `npm run db:migrate` en tu entorno local.
5. Verifica el resultado con `npm run db:status`.
6. Incluye el nuevo archivo SQL en tu commit de Git.
