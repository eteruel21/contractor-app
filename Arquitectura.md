# Arquitectura del Proyecto — Contractor App (Monorepositorio)

Este documento describe la estructura y organización del monorepositorio **Contractor App**, que abarca la aplicación multicanal (móvil y web) para contratistas y clientes, el panel web de superadministración y la base de datos de Supabase.

---

## 📂 Estructura General del Monorepositorio

```
CONTRACTOR-APP/
├── apps/
│   ├── mobile/          # Aplicación principal en Expo (iOS, Android y Web)
│   └── admin-web/       # Panel web de Super Admin (Vite + React + TS)
├── supabase/
│   └── migrations/      # Migraciones SQL y triggers de base de datos
├── package.json         # Configuración de workspaces de npm
└── .gitignore           # Exclusiones de Git a nivel de monorepo
```

---

## 📱 1. Aplicación Principal — `apps/mobile`

Desarrollada en **React Native + Expo SDK 57**, utiliza **Expo Router** para el enrutamiento basado en archivos (compatible con compilación nativa en móviles y renderizado web).

### Estructura Clave de Rutas (`src/app/`)
- **`(auth)/`**: Flujos de inicio de sesión (`login.tsx`) y registro (`registro.tsx`).
- **`pendiente.tsx`**: Pantalla de espera para cuentas registradas que todavía no han sido aprobadas.
- **`(tabs)/`**: Pestañas de control del **Contratista**:
  - `index.tsx` (Dashboard de inicio).
  - `calculos.tsx` (Acceso rápido a herramientas de cálculo).
  - `clientes.tsx` (Catálogo y gestión de clientes).
  - `agenda.tsx` (Actividades de visitas técnicas y cobros).
- **`(client-tabs)/`**: Pestañas exclusivas del **Cliente Final** (Inicio, Proyectos, Presupuestos y Perfil).
- **`calculos/`**: Motores e interfaces de las 10 calculadoras de obra (concreto, gypsum, bloques, pintura, etc.).
- **`empresa/`**: Creación y selección de la empresa activa del contratista.

### Servicios, Contextos y Utilidades (`src/`)
- **`contexts/`**:
  - `AuthContext.tsx`: Control de la sesión, rol global (`super_admin`, `contractor`, `client`) y estado de aprobación.
  - `CompanyContext.tsx`: Control de la empresa activa; solo consulta datos para cuentas aprobadas.
- **`services/`**: Módulos de conexión con las tablas de Supabase:
  - `client-service.ts`: CRUD de clientes y consultas de empresas asociadas.
  - `project-service.ts`: Control de avance, estados y asignación de proyectos.
  - `budget-service.ts`: Creación y control de presupuestos y partidas de cotización.
  - `catalog-service.ts`: Lee el catálogo maestro global con el precio efectivo del usuario. Si existe un ajuste personal usa ese valor; de lo contrario usa el predeterminado global.
- **`utils/`**:
  - `calculations.ts`: Motor matemático y lógico que ejecuta las fórmulas de obra para estimar materiales y costos de mano de obra.
  - `appointment-notifications.ts`: Lógica de permisos y calendarización de notificaciones nativas en el dispositivo.

---

## 🖥️ 2. Panel Super Admin — `apps/admin-web`

Aplicación web independiente tipo SPA desarrollada en **Vite + React + TypeScript** que sirve como consola centralizada del sistema.

- **`src/App.tsx`**: Dashboard responsivo en modo oscuro que provee:
  - Métricas globales y solicitudes de registro pendientes.
  - Aprobación, suspensión, reactivación y edición de usuarios.
  - Edición del catálogo operativo, unidades y rendimientos por empresa.
  - Edición central de precios globales para materiales y mano de obra, sin asociarlos a una empresa.
  - Edición de fórmulas y parámetros consumidos por las calculadoras.
  - Ajustes porcentuales masivos de precios con historial.
- **`src/admin-data.ts`**: Capa de consultas, validaciones y mutaciones administrativas contra Supabase.

---

## 🛢️ 3. Base de Datos — `supabase/`

Contiene los scripts SQL y esquemas ejecutados en PostgreSQL:
- **`migrations/`**: Migraciones que definen las tablas del negocio, sus triggers y políticas RLS.
- **Aprobación de plataforma**: Las cuentas nuevas quedan inactivas hasta que un `super_admin` las aprueba; mientras esperan no pueden acceder a los datos operativos.
- **Configuración editable**: La migración `20260714010000_platform_approval_and_admin_editing.sql` añade fórmulas, parámetros, auditoría de precios y funciones administrativas seguras.
- **Precios globales y privados**: La migración `20260714020000_global_catalog_prices_and_user_overrides.sql` crea el catálogo maestro de la plataforma, conserva los precios predeterminados administrados centralmente y guarda los ajustes de cada usuario de forma privada. Las calculadoras consumen una vista de precio efectivo mediante la regla `ajuste personal → precio global`.
