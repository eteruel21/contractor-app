# Guía de Despliegue - Contractor Pro

Este documento especifica la estrategia, procedimientos y comandos estandarizados para el despliegue a producción y staging de **Contractor Pro**, incorporando políticas de **Despliegue Seguro sin Push Automático a Main** (T-131).

---

## 1. Arquitectura de Despliegue

```mermaid
graph TD
    A[Repositorio Git Local / CI] -->|npm run deploy:safe| B[Validación TypeScript + Tests]
    B -->|Previa Confirmación| C[Render: Backend API]
    B -->|npm run deploy:admin| D[Cloudflare Pages: contractor-admin-web]
    B -->|npm run deploy:mobile| E[Cloudflare Pages: contractor-pro-web]
    B -->|EAS Build| F[App Stores / OTA Updates]

    C --> G[(PostgreSQL 18 Database)]
    C --> H[Cloudflare R2 Storage]
```

---

## 2. Componentes y Servicios

| Componente | Plataforma | Proyecto / Dominio Producción | Comando de Despliegue |
| :--- | :--- | :--- | :--- |
| **API Backend** | Render / Web Service | `https://api.contractor.com.pa` | Validar con `npm run deploy:safe` y push manual |
| **Panel Admin Web** | Cloudflare Pages | `contractor-admin-web` | `npm run deploy:admin` |
| **App Móvil (Web)** | Cloudflare Pages | `contractor-pro-web` | `npm run deploy:mobile` |
| **App Móvil (Nativa)** | Expo / EAS Build | iOS / Android Binaries | `npx eas build` |

---

## 3. Política de Despliegue Seguro (T-131)

> [!IMPORTANT]
> **REGLA DE SEGURIDAD**: Los scripts de despliegue `npm run deploy:safe` y `scripts/deploy-safe.sh` ejecutan la validación previa de tipos y pruebas, pero **NO realizan un git push automático a la rama `main`**. El push hacia `main` debe ser realizado de forma explícita y consciente por el desarrollador responsable.

```bash
# Paso 1: Ejecutar verificación y preparación segura de despliegue
npm run deploy:safe

# Paso 2: Desplegar aplicaciones web a Cloudflare Pages
npm run deploy:admin
npm run deploy:mobile
```

---

## 4. Despliegue del Backend API (`apps/api`)

### 4.1 Variables de Entorno de Producción
```env
HOST=0.0.0.0
PORT=10000
DATABASE_URL=postgresql://contractor_api:PASSWORD@db-host:5432/contractor_pro?sslmode=require
JWT_SECRET=SECRETO_CRIPTOGRAFICO_DE_ALTA_ENTROPIA
CORS_ORIGINS=https://contractor-admin-web.pages.dev,https://contractor-pro-web.pages.dev
STORAGE_DRIVER=r2
```

---

## 5. Verificación Post-Despliegue

1. **Health Check API**: `curl -I https://api.contractor.com.pa/health`
2. **Health Check Database**: `curl -I https://api.contractor.com.pa/health/database`
3. **Migraciones**: Ejecutar `npm run db:status` para confirmar 0 migraciones pendientes.
