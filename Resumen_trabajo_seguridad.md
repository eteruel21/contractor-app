# Resumen de Trabajo: Estabilización, Autenticación y Autorización (P0)

Este documento resume de manera legible y estructurada todo el trabajo de estabilización, autenticación, autorización y organización realizado en el monorepositorio **Contractor App** desde ayer a las 13:00 horas.

---

## 🔐 1. Fase de Autenticación (P0)
Se transformó el sistema de autenticación de stubs de desarrollo a flujos de producción robustos y seguros.

### Cambios en la App Móvil (`apps/mobile`)
*   **Eliminación de OTP Fijo**: Se eliminó por completo el modal con el código cableado (`123456`) que autoconfirmaba las cuentas ficticiamente.
*   **Bypass de Ipify**: Se retiró la llamada externa a `ipify` en el cliente. La dirección IP de registro ahora se lee de forma segura desde la cabecera HTTP capturada en el servidor API.
*   **Integración de CAPTCHA**: Se incorporó el envío de tokens CAPTCHA desde la app hacia la API de registro para prevención de spam.

### Cambios en la API Backend (`apps/api`)
*   **Confirmación de Correo Real**: Se quitó la confirmación de correo automático al registrarse. Ahora la API crea un token de verificación de un solo uso con validez temporal en la base de datos (migración `013_auth_security_tokens.sql`) e impide iniciar sesión si no se ha llamado previamente al endpoint `/auth/verify-email`.
*   **Recuperación y Restablecimiento**:
    *   `/auth/recover-password`: Genera tokens de recuperación efímeros.
    *   `/auth/reset-password`: Habilita el cambio de clave cifrando contraseñas con `bcryptjs` y revoca todas las sesiones previas de forma instantánea.
*   **Control y Revocación de Sesiones**:
    *   Endpoint `/auth/sessions`: Retorna detalles de las sesiones abiertas (IP, navegador, dispositivo).
    *   Soporte para revocación selectiva de una sesión por ID o cierre de todas las demás sesiones excepto la actual.
*   **Rate Limits en Rutas Críticas**: Límite estricto de frecuencia de solicitudes (ej. 60s entre solicitudes de reenvío de email de verificación) para evitar abusos.

---

## 🛡️ 2. Fase de Autorización y RLS (P0)
Implementamos la separación lógica y física de datos (Multi-tenant) y controles granulares de privilegios por usuario.

### API Guards (Middlewares en Fastify)
*   **`requireActiveUser`**: Valida que el perfil esté verificado por email, aprobado por el administrador central y que no se encuentre suspendido o desactivado antes de procesar cualquier endpoint comercial.
*   **`requireCompanyRole(allowedRoles)`**: Asegura el aislamiento de compañías. Valida que el usuario pertenezca a la empresa que consulta y posea un rol autorizado (`owner`, `admin`, `estimator`, `sales`, `member`) para efectuar la acción.

### Endurecimiento de PostgreSQL
*   **Row Level Security (RLS)**: Activamos políticas en cascada (migración `012_authorization_and_rls.sql`) en todas las tablas comerciales (clientes, proyectos, presupuestos, facturas, etc.).
*   **Funciones Invoker**: Cambiamos la firma de funciones auxiliares (`private.is_active_platform_user` y `public.has_company_role`) a `SECURITY INVOKER` para forzar que hereden las políticas de RLS de la conexión del pool de Fastify.
*   **Bootstrapping Seguro**: Configuramos `public.create_company` como `SECURITY DEFINER` con search_path estricto y privilegios restringidos de lectura sobre `app_auth.users` para permitir el registro inicial del propietario.
*   **Inicialización de Contexto**: La API abre una transacción que asigna la variable de base de datos `app.user_id` antes de realizar búsquedas, permitiendo que PostgreSQL filtre automáticamente los datos que no correspondan al usuario conectado.

---

## ⚙️ 3. Fase de Organización y Base de Datos (P0)
Sincronizamos la gestión de tareas con GitHub y normalizamos el ciclo de instalación.

*   **Hitos de GitHub**: Creados los 5 hitos oficiales del repositorio:
    1. `Seguridad`
    2. `Producción v1`
    3. `Estabilización PostgreSQL`
    4. `Staging`
    5. `Facturación`
*   **Automatización de Incidencias**: Ejecutamos un script de análisis interactivo que creó automáticamente **147 incidencias (issues)** detalladas con sus respectivos criterios de aceptación y los asignó a sus hitos específicos.
*   **Protección de Rama `main`**: Aplicamos reglas de protección forzada exigiendo revisión formal de PRs por al menos 1 aprobador, resolución de comentarios, y CI exitoso antes de fusionar.
*   **Limpieza de Codificación SQL (UTF-8)**: Corregimos secuencias rotas de caracteres de doble codificación (como `catÃ¡logo` -> `catálogo`) en todos los scripts del esquema comercial y archivos de referencia.
*   **Log y Respaldos**: Eliminamos archivos de registros del versionamiento de Git y omitimos de forma explícita el directorio de copias de seguridad locales en `.gitignore`.
*   **Prueba de Instalación Limpia**: Creamos [test_clean_install.js](file:///c:/Users/Eliel%20Teruel/CONTRACTOR-APP/apps/api/src/auth/test_clean_install.js) para simular la instalación desde cero de una base de datos vacía (bootstrap, migraciones ordenadas con `db:migrate`, seeds y validación del trigger de registro de perfiles).

---

## 🔬 4. Resumen de Pruebas Realizadas

| Suite de Pruebas | Archivo de Prueba | Propósito | Estado |
| :--- | :--- | :--- | :--- |
| **Autenticación** | `test_auth_endpoints.js` | Validar flujos de registro, tokens, inicio de sesión, sesiones y cambio de contraseñas. | **PASADO (100% Verde)** |
| **Aislamiento y Roles (RLS)** | `test_rls_permissions.js` | Verificar aislamiento entre compañías y restricciones de la matriz de permisos. | **PASADO (100% Verde)** |
| **Instalación Limpia** | `test_clean_install.js` | Validar re-creación de base de datos vacía, migraciones sucesivas, seeds y triggers. | **PASADO (100% Verde)** |
