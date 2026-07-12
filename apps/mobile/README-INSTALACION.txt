MÓDULO ADMINISTRATIVO DEL CATÁLOGO
==================================

Este paquete conecta Administración > Catálogo con Supabase.

ARCHIVOS INCLUIDOS

- src\services\admin-catalog-service.ts
- src\components\admin\CatalogItemForm.tsx
- src\app\admin\catalogo\index.tsx
- src\app\admin\catalogo\crear.tsx
- src\app\admin\catalogo\categorias.tsx
- src\app\admin\catalogo\[id].tsx

INSTALACIÓN

1. Extrae el ZIP.
2. Copia la carpeta "src" sobre:

   C:\Users\Eliel Teruel\CONTRACTOR-APP\apps\mobile\src

3. Permite reemplazar los cuatro archivos de admin\catalogo.
4. Los otros dos archivos son nuevos.

VALIDACIÓN

cd "C:\Users\Eliel Teruel\CONTRACTOR-APP\apps\mobile"
npx tsc --noEmit
npx expo start --clear

FUNCIONES

- Lista activos e inactivos.
- Busca por nombre, SKU, categoría, unidad y tipo.
- Muestra costo, venta y margen.
- Crea y edita elementos.
- Desactiva y restaura elementos.
- Crea, edita, desactiva y restaura categorías.
- Recibe cambios en tiempo real mediante Supabase Realtime.

NOTA SOBRE REALTIME

Las tablas catalog_items, catalog_categories y units deben estar
habilitadas en la publicación supabase_realtime. Si la pantalla funciona
pero no se actualiza automáticamente, se habilitará en el siguiente paso.
