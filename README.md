# Contractor Pro

Plataforma integral de gestión para contratistas, empresas de construcción, profesionales y clientes en Panamá.

---

## 🚀 Estructura del Monorepo

Contractor Pro está construido sobre una arquitectura **Monorepo** moderna con npm workspaces:

- [`apps/api`](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/apps/api): Backend REST de alto rendimiento en **Node.js 22**, **Fastify** y **TypeScript**.
- [`apps/admin-web`](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/apps/admin-web): Panel administrativo web desarrollado con **React 19**, **Vite** y **TypeScript**.
- [`apps/mobile`](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/apps/mobile): Aplicación móvil y web multiplataforma con **Expo 52**, **React Native** y **Expo Router**.
- [`database`](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/database): Scripts de administración PostgreSQL con migraciones SQL seguras (checksums SHA-256) y catálogo oficial Panamá.

---

## 🛠️ Módulos de la Aplicación

1. **Gestión Comercial y Presupuestos**: Creación de presupuestos con partidas, desgloses, estados de aprobación y exportación.
2. **Calculadoras de Construcción Especializadas**: Bloques, repello, concreto, gypsum, cielo raso PVC, pintura, electricidad, pisos, muebles MDF, AC y domótica.
3. **Facturación, Cobros y Notas de Crédito**: Emisión de facturas con snapshots inmutables, registro de abonos y notas de crédito.
4. **Gestión de Proyectos y Avances**: Tareas, porcentaje de avance e historial multimedia con imágenes privadas protegidas por URLs firmadas.
5. **Agenda y Calendario de Campo**: Programación de visitas, entregas e inspecciones.
6. **Gestión de Clientes y Equipos**: Miembros de empresa, roles y control de acceso RBAC.
7. **Privacidad, Legal y Derechos ARCO**: Exportación de datos en formato JSON (`GET /account/export`), eliminación y anonimización de cuenta (`DELETE /account`), Términos de Uso y Política de Privacidad.

---

## 📚 Documentación del Sistema

- 🏛️ [**Arquitectura del Sistema**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/architecture.md)
- 💻 [**Guía de Instalación Local**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/local-installation.md)
- 🗄️ [**Migraciones y Semillas**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/migrations-and-seeds.md)
- 🚢 [**Guía de Despliegue**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/deployment.md)
- 📜 [**Términos de Uso**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/terms-of-service.md)
- 🔒 [**Política de Privacidad**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/privacy-policy.md)
- ⏱️ [**Política de Retención de Documentos**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/document-retention-policy.md)
- 🛡️ [**Informe de Auditoría de Seguridad**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/security-audit-report.md)
- 💾 [**Verificación de Backups**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/backup-restore-verification.md)
- 🔄 [**Procedimiento de Rollback**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/rollback-procedure.md)
- 🧪 [**Informe de Prueba Piloto**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/pilot-testing-report.md)
- 📊 [**Monitoreo y Alertas**](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/docs/monitoring-and-alerts.md)

---

## ⚡ Comandos Rápidos

### Validación y Despliegue Seguro
```bash
# Validación completa del código (tipos y builds)
npm run validate

# Despliegue seguro interactivo sin push automático a main
npm run deploy:safe

# Despliegue directo a Cloudflare Pages
npm run deploy:admin
npm run deploy:mobile
```

### Base de Datos PostgreSQL
```bash
npm run db:bootstrap  # Creación inicial de esquemas y roles
npm run db:migrate    # Aplicar migraciones SQL pendientes
npm run db:status     # Estado de migraciones (aplicadas vs pendientes)
npm run db:seed       # Importación del catálogo de rubros Panamá
```

### Pruebas de Sistema
```bash
npm run test:api             # Pruebas integrales de API backend
npm run test:database-tools  # Pruebas de herramientas de base de datos
```

---

## 🔒 Licencia y Confidencialidad

Propiedad privada de Contractor Pro - Todos los derechos reservados.
