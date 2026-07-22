# Protección de la Rama Main y Flujo de Trabajo CI/CD

Este documento establece las políticas de protección de ramas y las guías de integración para el proyecto **Contractor Pro**.

---

## 1. Política de Protección de Rama (`main`)

Para garantizar que el código enviado a producción sea siempre estable y seguro:

1. **Restricción de Push Directo**:
   - No se permite realizar `git push` directo a la rama `main` desde el entorno local.
   - El script `scripts/protect-main.sh` y el hook git `pre-push` previenen automáticamente el envío de commits directamente a `main`.

2. **Requisito de Pull Request**:
   - Todo cambio o nueva funcionalidad debe crearse en una rama secundaria (`feat/*`, `fix/*`, `chore/*`).
   - Se debe abrir un **Pull Request (PR)** hacia la rama `main`.

3. **Verificación de CI (GitHub Actions)**:
   - El workflow `.github/workflows/validate.yml` se ejecuta automáticamente en cada PR y push a `main`.
   - Secuencia estricta de ejecución:
     1. Iniciar contenedor de servicio `postgres:18.4-bookworm`.
     2. Instalar dependencias con `npm ci`.
     3. Verificar tipos en todos los workspaces (`npm run typecheck`).
     4. Crear roles y base de datos de pruebas (`npm run db:bootstrap`).
     5. Aplicar todas las migraciones SQL (`npm run db:migrate`).
     6. Poblar datos de catálogo (`npm run db:seed`).
     7. Ejecutar pruebas unitarias, RLS y autenticación de la API (`npm run test:api`).
     8. Ejecutar pruebas de herramientas de base de datos (`npm run test:database-tools`).
     9. Ejecutar pruebas de ciclo financiero (`npm run test:invoice-db`).
     10. Compilar backend API (`npm run build:api`).
     11. Ejecutar pruebas de app móvil (`npm run test -w apps/mobile`).
     12. Compilar aplicación Admin Web (`npm run build:admin`).
     13. Compilar aplicación Mobile Web (`npm run build:mobile`).

---

## 2. Configuración en GitHub (Branch Protection Rules)

Para habilitar la protección en la interfaz de GitHub:

1. Ir a **Settings** -> **Branches** en el repositorio de GitHub.
2. Hacer clic en **Add branch protection rule**.
3. En **Branch name pattern**, escribir: `main`.
4. Marcar las siguientes opciones:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
     - Seleccionar el check obligatorio: `Validate Codebase & Build` (definido en `.github/workflows/validate.yml`).
   - ✅ **Do not allow bypassing the above settings**

---

## 3. Instalación de Hooks Locales

Para instalar manualmente el protector local pre-push:

```bash
npm run install-hooks
```

---

## 4. Despliegues Seguros

Para preparar un despliegue sin realizar pushes involuntarios a `main`:

```bash
npm run deploy:safe
```
