# Guía de Instalación Local - Contractor Pro

Esta guía detalla los pasos para instalar, configurar y ejecutar el entorno de desarrollo local de **Contractor Pro**.

---

## 1. Requisitos del Sistema

Antes de comenzar, asegúrate de contar con los siguientes componentes instalados en tu sistema:

- **Node.js**: v22.0.0 o posterior.
- **npm**: v10.0.0 o posterior.
- **PostgreSQL**: v18 (o PostgreSQL 16+ con compatibilidad habilitada).
- **Git**: v2.30 o posterior.
- **Expo Go / Emulador Android / Simulaor iOS** (Opcional, para desarrollo móvil nativo).

---

## 2. Clonación e Instalación de Dependencias

1. Clona el repositorio e ingresa al directorio raíz:
   ```bash
   git clone https://github.com/eteruel21/contractor-app.git
   cd contractor-app
   ```

2. Instala todas las dependencias del monorepo desde la raíz:
   ```bash
   npm install
   ```

---

## 3. Configuración de Base de Datos

### 3.1 Crear la base de datos en PostgreSQL
Accede a PostgreSQL mediante `psql` o tu cliente de preferencia (PGAdmin, DBeaver) y crea la base de datos:
```sql
CREATE DATABASE contractor_pro;
```

### 3.2 Configurar variables de entorno de la base de datos
Crea el archivo `database/.env` copiando el ejemplo:
```bash
cp database/.env.example database/.env
```

Ajusta los parámetros según tu entorno local:
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=contractor_pro
DB_SUPERUSER=postgres
DB_SUPERPASSWORD=tu_contraseña_postgres
DB_APP_USER=contractor_api
DB_APP_PASSWORD=password_seguro_api
DB_MIGRATOR_USER=contractor_migrator
DB_MIGRATOR_PASSWORD=password_seguro_migrator
```

### 3.3 Inicialización del Esquema y Datos
Ejecuta en orden los comandos de base de datos desde la raíz del proyecto:

1. **Bootstrap** (Crea roles de base de datos con privilegios mínimos y extensiones):
   ```bash
   npm run db:bootstrap
   ```

2. **Migraciones** (Aplica todas las migraciones SQL pendientes):
   ```bash
   npm run db:migrate
   ```

3. **Seeds** (Carga el catálogo oficial de rubros y costos de Panamá):
   ```bash
   npm run db:seed
   ```

4. **Verificar estado**:
   ```bash
   npm run db:status
   ```

---

## 4. Configuración de Aplicaciones

### 4.1 Backend API (`apps/api/.env`)
Crea el archivo `apps/api/.env`:
```bash
cp apps/api/.env.example apps/api/.env
```

Configuración requerida:
```env
NODE_ENV=development
API_HOST=127.0.0.1
API_PORT=3001
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=contractor_pro
PGUSER=contractor_api
PGPASSWORD=password_seguro_api
PGSSL=disable
JWT_SECRET=tu_secreto_local_de_al_menos_43_caracteres
JWT_ISSUER=contractor-api
JWT_AUDIENCE=contractor-app
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8081,http://127.0.0.1:8081
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
TURNSTILE_ALLOWED_HOSTNAMES=localhost,127.0.0.1,app.leurettech.com
```

El comando `npm run dev -w apps/api` carga además `apps/api/.env.development`, que fija las credenciales públicas de prueba de Turnstile para evitar usar secretos de producción en local.

### 4.2 Aplicación Móvil / Web (`apps/mobile/.env`)
Crea el archivo `apps/mobile/.env`:
```bash
cp apps/mobile/.env.example apps/mobile/.env
```

Configuración requerida:
```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:3001
EXPO_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
EXPO_PUBLIC_TURNSTILE_CHALLENGE_URL=https://app.leurettech.com/turnstile
```

### 4.3 Panel Administrativo (`apps/admin-web/.env`)
Crea el archivo `apps/admin-web/.env`:
```bash
cp apps/admin-web/.env.example apps/admin-web/.env
```

Configuración requerida:
```env
VITE_API_URL=http://127.0.0.1:3001
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
VITE_TURNSTILE_CHALLENGE_URL=/turnstile
```

Los archivos `.env.development` versionados mantienen emparejadas la clave pública y la clave secreta de prueba durante el desarrollo. Los despliegues de staging y producción deben inyectar su propio par real y conservar sus hostnames restringidos.

---

## 5. Ejecución en Desarrollo

Puedes iniciar los servicios individualmente desde la raíz del monorepo:

- **API Backend** (Puerto 3001):
  ```bash
  npm run dev -w apps/api
  ```

- **Panel Administrativo** (Puerto 3000 / Vite dev):
  ```bash
  npm run dev -w apps/admin-web
  ```

- **Aplicación Móvil / Web**:
  ```bash
  npm run start -w apps/mobile
  ```
  *(Presiona `w` para abrir en el navegador web, `a` para emulador Android, o `i` para simulador iOS)*.

---

## 6. Comandos de Verificación y Pruebas

Para comprobar la integridad del código y las compilaciones:

- **Validación completa del proyecto**:
  ```bash
  npm run validate
  ```

- **Comprobación de tipos TypeScript**:
  ```bash
  npm run typecheck
  ```

- **Pruebas automatizadas de la API**:
  ```bash
  npm run test:api
  ```

- **Pruebas de herramientas de base de datos**:
  ```bash
  npm run test:database-tools
  ```
