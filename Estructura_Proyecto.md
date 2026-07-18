# Estructura del Proyecto — Contractor App

Este documento presenta una radiografía detallada de la estructura de archivos y componentes del monorepositorio **Contractor App** tras las optimizaciones del 17 de julio de 2026.

---

## 📂 Árbol General del Proyecto

```
CONTRACTOR-APP/
├── apps/
│   ├── mobile/          # Aplicación principal en Expo (React Native) para móvil y web
│   └── admin-web/       # Panel de control web para Super Admins (React + Vite)
├── supabase/
│   └── migrations/      # Esquemas de BD Postgres, políticas RLS y triggers de Supabase
├── package.json         # Configuración del monorepositorio (npm workspaces)
├── package-lock.json    # Candado de dependencias raíz
├── README.md            # Documentación general de bienvenida
├── Arquitectura.md      # Descripción técnica de flujos y arquitectura lógica
└── deplyer.tex          # Script auxiliar de despliegue y control
```

---

## 📱 1. Aplicación Móvil — `apps/mobile`

Desarrollada bajo el SDK 57 de **Expo**, utilizando TypeScript, Expo Router para el enrutamiento y Tailwind/estilos nativos.

### Directorios Principales
*   **`src/app/`**: Sistema de enrutamiento basado en archivos (Expo Router).
    *   **`(auth)/`**: Flujos de acceso (`login.tsx`, `registro.tsx`).
    *   **`(tabs)/`**: Pestañas de control operativas para el **Contratista**:
        *   `index.tsx`: Dashboard / Vista de control principal.
        *   `calculos.tsx`: Acceso directo al catálogo de calculadoras de obra.
        *   `clientes.tsx`: Directorio y listado de clientes activos.
        *   `agenda.tsx`: Actividades diarias, visitas técnicas y tareas de cobro.
    *   **`(client-tabs)/`**: Vistas simplificadas exclusivas para el **Cliente Final** que ha sido vinculado a proyectos.
    *   **`calculos/`**: Interfaces de usuario específicas para las **10 calculadoras de construcción**:
        *   `concreto.tsx` | `gypsum.tsx` | `bloques-repello.tsx` | `pintura.tsx` | `pisos.tsx`
        *   `aire-acondicionado.tsx` | `electricidad.tsx` | `cielo-raso-pvc.tsx` | `muebles-mdf.tsx`
        *   `sistemas-especiales.tsx`
    *   **`empresa/`**: Asistente de selección y registro de empresa activa del contratista.
    *   **`facturas/`**: Módulo de listado, detalles (`[id].tsx`) y configuración de facturación (`settings.tsx`).
    *   **`presupuestos/`**: Flujo de visualización detallada (`[id].tsx`) y listado general.
    *   **`proyectos/`**: Avance físico y estado general de proyectos en curso.
    *   **`pendiente.tsx`**: Pantalla de bloqueo si el contratista se registró pero espera la aprobación del Super Admin.
    *   **`perfil-profesional.tsx`**: Registro de especialidades, áreas de cobertura y documentos legales del contratista.

*   **`src/services/`**: Módulos de persistencia, consultas y comunicación directa con la API de Supabase.
    *   `supabase.ts`: Inicialización del cliente Supabase y persistencia de sesión segura en el dispositivo móvil.
    *   `client-service.ts`: Gestión de direcciones de clientes, datos de contacto y enlace atómico de direcciones mediante RPC.
    *   `project-service.ts`: Creación y consulta optimizada de proyectos mediante combinaciones de JOIN.
    *   `budget-service.ts`: Estructuración de secciones de presupuestos y partidas de cobro.
    *   `invoice-service.ts`: Emisión atómica libre de race conditions.
    *   `pricing-service.ts`: Actualización y ajuste de precios del catálogo.
    *   *Stubs pendientes por completar:* `admin-service.ts`, `users-service.ts`, `realtime-service.ts`.

*   **`src/contexts/`**: Abstracciones de estados globales.
    *   `AuthContext.tsx`: Carga del perfil del usuario, roles (`client`, `contractor`, `super_admin`) y control de estado de aprobación.
    *   `CompanyContext.tsx`: Empresa activa del contratista y membresías asignadas.

*   **`src/types/`**: Definiciones y contratos de TypeScript (`database.ts`, `client.ts`, `project.ts`, `budget.ts`, `invoice.ts`, `catalog.ts`, `company.ts`).

*   **`src/utils/`**:
    *   `calculations.ts`: El **motor de cálculos de obra**, encargado de aplicar la matemática constructiva a los insumos ingresados por el usuario.

---

## 🖥️ 2. Panel Super Admin — `apps/admin-web`

Aplicación tipo Web SPA ligera en **Vite + React + TypeScript** que opera como consola de administración central del backend.

*   **`src/App.tsx`**: Concentra la interfaz administrativa (dashboard) en un solo archivo reactivo que provee:
    *   Lista de solicitudes de registro pendientes de aprobación.
    *   Aprobación/Rechazo/Suspensión de contratistas.
    *   Configuración del catálogo base maestro de la plataforma.
    *   Ajuste masivo de precios porcentuales con historial general.
    *   Visualizador y editor de fórmulas de las calculadoras.
*   **`src/admin-data.ts`**: Métodos CRUD y RPC administrativos directos a Supabase con rol de super admin.
*   **`src/index.css`**: Hoja de estilos basada en Vanilla CSS con el sistema de temas oscuros y tokens visuales.

---

## 🛢️ 3. Base de Datos — `supabase/migrations`

Scripts SQL ordenados secuencialmente que componen las bases del sistema.

*   **`20260713000000_enhance_profiles_and_clients.sql`**: Creación de perfiles, roles iniciales e integración automática de clientes por correo.
*   **`20260713010000_admin_web_super_admin_rls.sql`** y **`_secure_roles_and_client_access.sql`**: Políticas RLS iniciales y control de acceso.
*   **`20260714010000_platform_approval_and_admin_editing.sql`**: Políticas RLS restrictivas para usuarios inactivos y habilitación del rol Super Admin.
*   **`20260714020000_global_catalog_prices_and_user_overrides.sql`**: Catálogo base, sobreescrituras privadas del usuario y la vista de precios efectivos.
*   **`20260714030000_atomic_admin_writes_and_catalog_guards.sql`**: Procedimientos almacenados para manipulación masiva de precios y guardias del catálogo.
*   **`20260714040000_create_invoices_table.sql`**: Tabla de facturación y RLS básico.
*   **`20260717000000_optimizations.sql`** (Última): Índices compuestos rápidos, creación de facturas seguras y transacciones atómicas de direcciones.
