# Checklist de Pruebas en Dispositivo Móvil Real (T-069)

Esta guía detalla el protocolo de pruebas manuales end-to-end a ejecutar desde un dispositivo móvil real (iOS o Android) conectado al entorno de **Staging**.

---

## Pre-requisitos
1. La API de Fastify en Staging está desplegada y accesible públicamente vía HTTPS (`https://staging-api.contractor.app`).
2. El paquete o Build de desarrollo de Expo Mobile tiene configurada la variable `EXPO_PUBLIC_API_URL`.
3. El dispositivo móvil cuenta con conexión a Internet y la aplicación instalada vía Expo Go / TestFlight / APK de preview.

---

## Matriz de Pruebas

| ID | Módulo | Acción / Flujo | Criterio de Aceptación | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | **Registro** | Abrir la app en el teléfono -> Seleccionar "Registrarse" -> Ingresar nombre, correo corporativo, teléfono y contraseña segura -> Enviar. | Se crea la cuenta y la empresa, el usuario recibe confirmación y pasa al estado autenticado. | [ ] |
| **TC-02** | **Login** | Cerrar sesión -> Ingresar credenciales recién creadas -> Pulsar "Iniciar Sesión". | Inicia sesión correctamente, recibe Access Token y Refresh Token en SecureStore de Expo. | [ ] |
| **TC-03** | **Clientes** | Navegar al módulo de Clientes -> Presionar "+ Nuevo Cliente" -> Llenar datos de prueba (Nombre, RUC/Cédula, Teléfono, Correo) -> Guardar. | El cliente aparece inmediatamente en el catálogo y persiste al recargar la vista. | [ ] |
| **TC-04** | **Presupuestos** | Crear presupuesto -> Seleccionar el cliente registrado -> Añadir partidas de prueba (ej. Cálculo de Concreto o Gypsum) -> Calcular subtotales e impuestos -> Guardar. | El presupuesto calcula los valores correctamente sin errores de redondeo o UI. | [ ] |
| **TC-05** | **PDF** | En el detalle del presupuesto -> Pulsar "Generar PDF" -> Exportar / Visualizar documento. | Se genera el documento PDF formateado con los datos de la empresa, cliente y desglose de montos. | [ ] |
