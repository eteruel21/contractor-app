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
- **`(tabs)/`**: Pestañas de control del **Contratista**:
  - `index.tsx` (Dashboard de inicio).
  - `calculos.tsx` (Acceso rápido a herramientas de cálculo).
  - `clientes.tsx` (Catálogo y gestión de clientes).
  - `agenda.tsx` (Actividades de visitas técnicas y cobros).
- **`(client-tabs)/`**: Pestañas exclusivas del **Cliente Final** (Inicio, Proyectos, Presupuestos y Perfil).
- **`admin/`**: Ruta protegida de administración interna de la empresa del contratista (precios, fórmulas, catálogo).
- **`calculos/`**: Motores e interfaces de las 10 calculadoras de obra (concreto, gypsum, bloques, pintura, etc.).
- **`empresa/`**: Creación y selección de la empresa activa del contratista.

### Servicios, Contextos y Utilidades (`src/`)
- **`contexts/`**:
  - `AuthContext.tsx`: Control de la sesión en Supabase y rol global (`super_admin`, `contractor`, `client`).
  - `CompanyContext.tsx`: Control de la empresa activa para la que trabaja el contratista.
- **`services/`**: Módulos de conexión con las tablas de Supabase:
  - `client-service.ts`: CRUD de clientes y consultas de empresas asociadas.
  - `project-service.ts`: Control de avance, estados y asignación de proyectos.
  - `budget-service.ts`: Creación y control de presupuestos y partidas de cotización.
- **`utils/`**:
  - `calculations.ts`: Motor matemático y lógico que ejecuta las fórmulas de obra para estimar materiales y costos de mano de obra.
  - `appointment-notifications.ts`: Lógica de permisos y calendarización de notificaciones nativas en el dispositivo.

---

## 🖥️ 2. Panel Super Admin — `apps/admin-web`

Aplicación web independiente tipo SPA desarrollada en **Vite + React + TypeScript** que sirve como consola centralizada del sistema.

- **`src/App.tsx`**: Dashboard responsivo en modo oscuro que provee:
  - Métricas de uso global (total de contratistas, proyectos activos y clientes auto-vinculados).
  - Tabla de control y auditoría de contratistas y empresas en Contractor Pro.
  - Ajustes generales de la plataforma.

---

## 🛢️ 3. Base de Datos — `supabase/`

Contiene los scripts SQL y esquemas ejecutados en PostgreSQL:
- **`migrations/`**: Migraciones que definen el comportamiento de las tablas del negocio (`profiles`, `companies`, `clients`, `projects`, `budgets`) y configuran los triggers automáticos (como el auto-enlace de clientes registrados con su registro correspondiente en la tabla del contratista usando su correo electrónico).