# Contractor App — Monorepositorio

Plataforma multicanal para contratistas y clientes de la industria de la construcción en Panamá. Incluye una app móvil/web y un panel de superadministración.

---

## 📦 Apps

| App | Tecnología | Descripción |
|-----|-----------|-------------|
| `apps/mobile` | Expo SDK 57 + React Native + Expo Router | App principal para contratistas y clientes (iOS, Android y Web) |
| `apps/admin-web` | Vite + React + TypeScript | Panel de superadministración (SPA web) |

**Base de datos**: Supabase (PostgreSQL + RLS). Ver `supabase/migrations/` para el esquema completo.

---

## ⚙️ Requisitos

- Node.js ≥ 20
- npm ≥ 10
- Cuenta y proyecto en [Supabase](https://supabase.com)

---

## 🚀 Instalación

```bash
# En la raíz del monorepositorio
npm install
```

---

## 🔑 Variables de entorno

### `apps/mobile` — crear `apps/mobile/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=tu_anon_key
```

### `apps/admin-web` — crear `apps/admin-web/.env`

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

## 🧑‍💻 Desarrollo local

```bash
# App móvil/web (Expo)
cd apps/mobile
npm run start          # Metro bundler (iOS/Android)
npm run web            # Versión web en http://localhost:8081

# Panel de administración (Vite)
cd apps/admin-web
npm run dev            # Vite dev server en http://localhost:5173
```

---

## 🏗️ Build y despliegue

```bash
# Verificar tipos en ambas apps
npm run typecheck

# Build del admin web
npm run build:admin

# Build de la app web (Expo)
npm run build:mobile

# Desplegar en Cloudflare Pages (ver deplyer.tex para referencia)
cd apps/admin-web && npx wrangler pages deploy dist --project-name contractor-admin-web --branch main
cd apps/mobile    && npx wrangler pages deploy dist --project-name contractor-pro-web  --branch main
```

---

## 🛢️ Base de datos

Las migraciones están en `supabase/migrations/`. Aplica las migraciones en orden usando el CLI de Supabase:

```bash
supabase db push
```

Para regenerar los tipos TypeScript desde el esquema actual:

```bash
supabase gen types typescript --linked > apps/mobile/src/types/database.ts
```

---

## 🗂️ Arquitectura

Ver [`Arquitectura.md`](./Arquitectura.md) para la documentación detallada de la estructura del proyecto, contextos, servicios y flujos de autenticación.
