# Tareas Pendientes para Finalizar el Proyecto — Contractor App

Este documento establece la hoja de ruta detallada paso a paso para completar el desarrollo y llevar a producción el monorepositorio **Contractor App**.

---

## 📋 Fase 1: Base de Datos y Backend (Supabase)

### Paso 1.1: Desplegar y probar la migración de optimizaciones
*   **Acción:** Ejecutar en el servidor de base de datos la migración `20260717000000_optimizations.sql` (`supabase db push`).
*   **Verificación:** Asegurar que las RLS restrictivas para la tabla `invoices` y los nuevos índices compuestos operan correctamente sin degradación de rendimiento.

### Paso 1.2: Configurar el servicio de correos de autenticación (SMTP)
*   **Acción:** Reemplazar el proveedor de correos predeterminado de Supabase (límite de 3 o 4 correos por hora) por un servicio SMTP de producción (SendGrid, Resend o Amazon SES).
*   **Propósito:** Garantizar que los enlaces de registro y los códigos de verificación OTP (One-Time Password) lleguen a los contratistas y clientes de manera instantánea.

---

## 📱 Fase 2: Aplicación Móvil (`apps/mobile`)

### Paso 2.1: Implementar los servicios TypeScript incompletos (Stubs)
Actualmente, existen tres archivos de servicios clave definidos como stubs vacíos con marcas `TODO` que deben desarrollarse:
1.  **`admin-service.ts`**: Programar la obtención de configuraciones generales del sistema (ej. tasas de interés por defecto, términos y condiciones base).
2.  **`users-service.ts`**: Implementar los flujos para gestionar el equipo del contratista (invitaciones a unirse a la empresa mediante enlace/email, cambio de rol dentro de la empresa: `owner`, `admin`, `member`, `supervisor`, `sales`, `estimator`).
3.  **`realtime-service.ts`**: Inicializar canales de escucha en tiempo real de Supabase (`supabase.channel`) para mantener actualizadas las pantallas de agenda, presupuestos y notificaciones de chat de forma reactiva sin necesidad de recargar la aplicación manualmente.

### Paso 2.2: Implementar la exportación nativa de PDFs y Compartir
*   **Acción:** Instalar `expo-print` y `expo-sharing` en `apps/mobile`.
*   **Desarrollo:**
    *   Diseñar una plantilla HTML/CSS limpia e interactiva para presupuestos y otra para facturas.
    *   Implementar un botón "Compartir PDF" en `app/presupuestos/[id].tsx` y `app/facturas/[id].tsx` que convierta los datos a PDF localmente y abra la hoja nativa del sistema (WhatsApp, Correo, etc.).

### Paso 2.3: Integración de Geolocalización y Mapas para Clientes
*   **Acción:** Configurar Google Maps SDK mediante `react-native-maps`.
*   **Desarrollo:** En la sección de clientes, permitir que al registrar o editar una dirección (`client_addresses`) el usuario pueda ubicar un marcador sobre un mapa interactivo para guardar las coordenadas latitud/longitud precisas de la obra, facilitando la navegación de la cuadrilla mediante GPS.

### Paso 2.4: Persistencia y Enlace de Cálculos de Obra
*   **Acción:** 
    *   Implementar persistencia local (ej. AsyncStorage o SQLite) en el módulo de calculadoras para que el contratista pueda guardar y recuperar cálculos previos de materiales sin crear un presupuesto formal.
    *   Habilitar un botón "Añadir a Presupuesto" dentro de los resultados de cada calculadora para insertar automáticamente la estimación de materiales y mano de obra como partidas de presupuesto en un proyecto activo.

---

## 🖥️ Fase 3: Panel de Control Web (`apps/admin-web`)

### Paso 3.1: Descomponer el archivo monolítico `App.tsx` (57KB)
El archivo principal es demasiado pesado y difícil de mantener. Debe refactorizarse fragmentándolo en componentes funcionales independientes en una nueva carpeta `src/components/`:
*   `UserApprovalList.tsx`: Tabla y acciones para autorizar y auditar nuevos contratistas.
*   `CatalogManager.tsx`: Editor de catálogos base de la plataforma, permitiendo cambiar costos predeterminados de materiales y rendimientos de mano de obra.
*   `FormulaEditor.tsx`: Panel visual para cambiar parámetros y variables de las calculadoras de obra en caliente sin tocar el código fuente.
*   `AuditHistory.tsx`: Listado de historial de cambios y ajustes de precios masivos.

### Paso 3.2: Implementar tipado seguro basado en Supabase
*   **Acción:** Reemplazar el uso de `any` en `apps/admin-web/src/admin-data.ts` y en el resto del panel administrativo importando el archivo de definición de base de datos generado (`Database`) para sincronizar los contratos de datos en ambos extremos del monorepositorio.

---

## 🧪 Fase 4: Calidad y Pruebas (QA)

### Paso 4.1: Pruebas integrales de flujo de negocio (End-to-End)
Realizar pruebas manuales o automatizadas simulando el ciclo completo del sistema:
1.  **Registro:** Nuevo contratista se registra en la app móvil.
2.  **Bloqueo:** Verifica que la app muestra la pantalla `pendiente.tsx` y no le permite acceder al menú.
3.  **Aprobación:** Super Admin aprueba la cuenta en la web.
4.  **Desbloqueo:** Contratista recibe acceso, crea su empresa y define un catálogo de precios.
5.  **Cotización:** Contratista crea un cliente, realiza un cálculo en la calculadora de gypsum y genera un presupuesto.
6.  **Viculación:** Contratista invita al cliente final por correo.
7.  **Cliente:** Cliente final inicia sesión en su versión de la app (`client-tabs`) y aprueba el presupuesto.
8.  **Facturación:** Contratista emite una factura atómica basada en el presupuesto aprobado.

### Paso 4.2: Compilaciones de producción
*   **Acción:** Ejecutar compilaciones para Android (.aab) e iOS (.ipa) utilizando EAS Build (`eas build --platform all`).
