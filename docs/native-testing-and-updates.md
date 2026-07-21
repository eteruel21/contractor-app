# Guía de Pruebas de Lanzamiento Nativo y Actualizaciones

Este documento detalla el procedimiento para generar los builds nativos de prueba de **Contractor Pro**, instalarlos en dispositivos reales (Android e iOS) y validar la estrategia de actualizaciones (Over-The-Air y binarios nativos).

---

## 1. Identidad de la Aplicación (Configuración Expo)

La aplicación móvil nativa está configurada en `apps/mobile/app.json`:

- **Nombre Definitivo**: `Contractor Pro`
- **Slug Definitivo**: `contractor-pro`
- **Esquema de URL (Deep Linking)**: `contractorpro`
- **iOS Bundle Identifier**: `com.contractorpro.app`
- **Android Package Name**: `com.contractorpro.app`

### Iconos y Splash Screen (Assets)
- **App Icon**: `assets/images/icon.png` (1024x1024 px)
- **Splash Screen**: `assets/images/splash-icon.png` sobre fondo `#208AEF`
- **Iconos Adaptativos Android**:
  - `assets/images/android-icon-foreground.png`
  - `assets/images/android-icon-background.png` (`#E6F4FE`)
  - `assets/images/android-icon-monochrome.png`

---

## 2. Perfiles de Compilación (`eas.json`)

El archivo `eas.json` define tres perfiles:

1. **`development`**:
   - Incluye cliente de desarrollo de Expo para depuración en caliente.
   - Apunta a la API local `http://localhost:8787/api`.

2. **`preview`**:
   - Genera binarios independientes para pruebas internas (APK para Android, AdHoc / TestFlight para iOS).
   - Apunta al backend de Staging: `https://contractor-api-staging.eteruel21.workers.dev/api`.

3. **`production`**:
   - Genera paquetes de producción (Android AAB para Google Play Store, iOS App Store Bundle).
   - Apunta al backend de Producción: `https://contractor-api.eteruel21.workers.dev/api`.

---

## 3. Generación de Builds de Prueba

### A. Generar Build de Prueba Android (T-123)

1. **Requisito previo**: Iniciar sesión en EAS CLI (`npx eas login`).
2. **Generar APK de prueba (Perfil Preview)**:
   ```bash
   cd apps/mobile
   npm run build:android:preview
   ```
   *Nota: EAS procesará la compilación en la nube y proporcionará un enlace de descarga directa del archivo `.apk`.*

3. **Validación de Prebuild Local (Opcional sin EAS CLI)**:
   ```bash
   npx expo prebuild --platform android
   ```

### B. Generar Build de Prueba iOS (T-124)

1. **Generar Build de prueba para TestFlight / AdHoc (Perfil Preview)**:
   ```bash
   cd apps/mobile
   npm run build:ios:preview
   ```
2. **Validación de Prebuild Local (Opcional sin Xcode)**:
   ```bash
   npx expo prebuild --platform ios
   ```

---

## 4. Protocolo de Pruebas de Instalación y Actualizaciones (T-125)

### Paso 1: Instalación Limpia (Clean Install)
1. Transferir e instalar el archivo `.apk` generado en un dispositivo Android de prueba (activar "Instalar aplicaciones de fuentes desconocidas").
2. Abrir **Contractor Pro**, verificar que el splash screen `#208AEF` se muestre correctamente y que la pantalla principal cargue sin parpadeos.
3. Iniciar sesión o registrar un usuario de prueba en el entorno de Staging.

### Paso 2: Validación de Deep Links y Almacenamiento Seguro
1. Minimizar la aplicación y volver a abrirla desde una URL con esquema `contractorpro://`.
2. Cerrar la app completamente y reabrirla para comprobar la persistencia de la sesión mediante `expo-secure-store`.

### Paso 3: Prueba de Actualizaciones Over-The-Air (OTA) con EAS Update
1. Publicar una actualización de canal `preview`:
   ```bash
   npx eas update --auto --channel preview
   ```
2. Reabrir la aplicación en el dispositivo físico conectado a Wi-Fi.
3. Verificar en la segunda apertura de la app que la nueva versión OTA se descargue e instale transparentemente sin requerir reinstalación del APK/IPA.

### Paso 4: Prueba de Actualización Binaria (In-Place Upgrade)
1. Incrementar el campo `version` o `buildNumber` en `app.json`.
2. Compilar un nuevo APK de prueba (`npm run build:android:preview`).
3. Instalar el nuevo APK sobre la versión existente en el dispositivo.
4. Confirmar que la sesión del usuario no se destruya y la base de datos local / SecureStore permanezca intacta.
