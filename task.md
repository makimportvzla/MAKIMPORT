# Tareas — MAKIMPORT

## Módulo Proveedores & Campos Privados
- [x] Revisar estructura del proyecto
- [x] Crear plan de implementación
- [x] Agregar interfaz `ProveedorDbRow` en `supabase.ts`
- [x] Crear componente `ProveedoresTab.tsx`
- [x] Modificar `AdminDashboard.tsx` para incluir la pestaña de proveedores
- [x] Agregar campos privados de vendedor/dueño en formularios Admin:
  - [x] `AdminPublishModal.tsx` (Navbar publicación)
  - [x] `AdminEditModal.tsx` (Edición de maquinaria)
  - [x] `AdminDashboard.tsx` (Formulario de adición inline)
- [x] Renderizar "Proveedor Directo" en tabla de inventario en `AdminDashboard.tsx`
- [x] Asegurar exclusión de campos privados en mapper público (`CatalogMarketplace.tsx`)

## Módulo Alquiler de Maquinaria Pesada
- [x] Agregar interfaz `RentalRequestDbRow` en `supabase.ts`
- [x] Crear página pública de solicitud de alquiler `/alquiler` (`src/app/alquiler/page.tsx`)
- [x] Modificar `Navbar.tsx` para incluir enlaces al módulo de Alquiler de Equipos
- [x] Modificar `AdminDashboard.tsx` para incluir pestaña "7. Alquileres" con listado, filtros de estado y difusión automatizada
- [x] Crear ruta de administración de alquileres `/admin/alquileres` (`src/app/admin/alquileres/page.tsx`)
- [x] Modificar `ProveedoresTab.tsx` para aceptar pre-rellenado de mensajes en la difusión
- [x] Verificar compilación de Next.js y TypeScript
