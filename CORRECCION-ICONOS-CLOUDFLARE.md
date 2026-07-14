# Corrección de iconos en Cloudflare Pages

Cloudflare no estaba publicando la fuente de Ionicons porque Expo la generaba dentro de una ruta que contenía `node_modules`. El nuevo proceso copia la fuente a `/fonts` y actualiza el bundle automáticamente.

## Compilar y desplegar

Desde `apps/mobile` ejecuta:

```powershell
npm install
npm run build:web
npx wrangler pages deploy dist --project-name contractor-pro-web --branch main
```

Después abre `https://contractor-pro-web.pages.dev` en una pestaña privada o recarga la página ignorando la caché.

## Configuración de Cloudflare con Git

Si Cloudflare compila automáticamente desde GitHub, utiliza:

- Build command: `npm run build:web`
- Build output directory: `dist`
- Root directory: `apps/mobile`
