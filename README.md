# Contractor Pro

Plataforma para contratistas y clientes de la industria de la construcción en Panamá.

## Aplicaciones

- `apps/mobile`: Expo, React Native y Expo Router.
- `apps/admin-web`: React, Vite y TypeScript.
- `apps/api`: Node.js, Fastify y TypeScript.

## Arquitectura

- PostgreSQL 18.
- API REST propia con Fastify.
- Autenticación mediante JWT.
- Sesiones renovables almacenadas en PostgreSQL.
- Row Level Security con `app.current_user_id()`.
- Cloudflare Pages para las interfaces web.

## Requisitos

- Node.js 22 o posterior.
- npm 10 o posterior.
- PostgreSQL 18.
- Base de datos `contractor_pro`.

## Instalación

Ejecutar desde la raíz:

`npm install`

## Variables de entorno

API, en `apps/api/.env`:

- `HOST=0.0.0.0`
- `PORT=3001`
- `DATABASE_URL=postgresql://contractor_api:password@127.0.0.1:5432/contractor_pro`
- `JWT_SECRET=replace-with-a-secure-secret`
- `JWT_ISSUER=contractor-api`
- `JWT_AUDIENCE=contractor-app`

Aplicación móvil, en `apps/mobile/.env`:

- `EXPO_PUBLIC_API_URL=http://127.0.0.1:3001`

Panel administrativo, en `apps/admin-web/.env`:

- `VITE_API_URL=http://127.0.0.1:3001`

## Desarrollo

- API: `npm run dev -w apps/api`
- Panel: `npm run dev -w apps/admin-web`
- Móvil: `npm run start -w apps/mobile`

## Base de datos

Las migraciones PostgreSQL están en `database/migrations` y se registran con
checksum en `app_migrations.schema_migrations`.

1. Copiar las variables de `database/.env.example` al entorno local.
2. Ejecutar `npm run db:bootstrap` con una conexión administrativa.
3. Ejecutar `npm run db:migrate` con la conexión del migrador.
4. Ejecutar `npm run db:seed` para importar el catálogo oficial.

Comandos disponibles:

- `npm run db:bootstrap`: crea la base y los roles con privilegios mínimos.
- `npm run db:baseline`: registra, después de verificarlo, un esquema existente.
- `npm run db:migrate`: aplica únicamente migraciones pendientes.
- `npm run db:status`: muestra migraciones aplicadas y pendientes.
- `npm run db:seed`: aplica seeds pendientes y verifica sus checksums.

No se deben modificar migraciones o seeds ya aplicados. Cualquier cambio de
esquema o datos debe añadirse en un archivo nuevo.

## Verificaciones

- `npm run typecheck -w apps/api`
- `npm run build -w apps/api`
- `npm run build -w apps/admin-web`
- `npx tsc --noEmit -p apps/mobile/tsconfig.json`

Los archivos `.env` contienen información privada y no deben subirse al repositorio.
