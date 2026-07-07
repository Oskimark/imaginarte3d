# Plan de Implementación - E-commerce de Impresiones 3D

Este documento detalla el plan para construir un e-commerce completo para la venta de impresiones 3D, siguiendo las especificaciones del archivo `implementation_plan.md` del usuario.

El proyecto se estructurará sobre **Next.js 14 (App Router)** usando **TypeScript**, **Tailwind CSS**, **Shadcn/ui**, **Prisma** (con PostgreSQL), y la integración de **Mercado Pago** como pasarela de pago.

---

## User Review Required

> [!IMPORTANT]
> **Autenticación del Administrador**: Se implementará un login simple basado en contraseña almacenada en la variable de entorno `ADMIN_PASSWORD`. La sesión se gestionará mediante una cookie segura y HTTP-only (`admin_session`) y se protegerá con un Middleware de Next.js.
> 
> **Lógica de Descuento**: Los precios de los productos pueden tener un descuento porcentual. Mostraremos el precio tachado en el frontend, pero la validación y cálculo final del costo se realizará en el backend al procesar la orden para evitar manipulaciones.
> 
> **Gestión de Stock**: El stock se reservará/descontará **únicamente** cuando el webhook de Mercado Pago confirme el pago (transición a estado `PAID`).

---

## Open Questions

> [!NOTE]
> **Base de Datos para Desarrollo**: Dado que la especificación requiere PostgreSQL (por ejemplo, Supabase), ¿tienes alguna base de datos activa para probar? Si no, podemos configurar inicialmente SQLite para desarrollo local y luego cambiar a PostgreSQL para producción.
>
> **Subida de Imágenes**: La especificación menciona subida a Cloudinary o URL directa. Proponemos usar un campo de URL de imagen simple para el formulario en la primera etapa y, si lo requieres, agregar la integración directa de Cloudinary. ¿Es aceptable usar URLs de imágenes (por ejemplo, de Unsplash o subidas previamente)?

---

## Proposed Changes

Proponemos la creación de la siguiente estructura de archivos y carpetas en el espacio de trabajo:

### 1. Configuración de Base de Datos y Modelos (Prisma)

#### [NEW] [schema.prisma](file:///g:/proyectos/imaginarte3d/prisma/schema.prisma)
Definirá los modelos necesarios:
*   `Product`: `id`, `name`, `description`, `price`, `discount` (porcentaje opcional), `stock`, `category`, `imageUrl`, `createdAt`, `updatedAt`.
*   `Order`: `id`, `customerName`, `customerEmail`, `customerPhone`, `customerAddress`, `total`, `status` (PENDING, PAID, SHIPPED, CANCELLED), `createdAt`, `updatedAt`, `items` (relación).
*   `OrderItem`: `id`, `orderId`, `productId`, `quantity`, `price` (precio cobrado al momento de la compra), `product` (relación).

#### [NEW] [seed.ts](file:///g:/proyectos/imaginarte3d/prisma/seed.ts)
Script para poblar la base de datos con los 5 productos iniciales:
1.  Dragón articulado
2.  Maceta geométrica
3.  Llavero personalizado
4.  Miniatura de D&D
5.  Soporte para auriculares

---

### 2. Autenticación y Seguridad

#### [NEW] [middleware.ts](file:///g:/proyectos/imaginarte3d/src/middleware.ts)
Middleware que interceptará todas las rutas bajo `/admin/*` (excepto `/admin/login` y las APIs de login). Si la cookie `admin_session` no está presente o no es válida, redirigirá al login.

#### [NEW] [route.ts (login)](file:///g:/proyectos/imaginarte3d/src/app/api/admin/login/route.ts)
Endpoint API para verificar la contraseña ingresada contra `ADMIN_PASSWORD` y emitir la cookie de sesión cifrada.

#### [NEW] [route.ts (logout)](file:///g:/proyectos/imaginarte3d/src/app/api/admin/logout/route.ts)
Endpoint API para borrar la cookie de sesión del administrador.

---

### 3. Integración con Mercado Pago y Checkout

#### [NEW] [mp.ts](file:///g:/proyectos/imaginarte3d/src/lib/mp.ts)
Inicialización del SDK de Mercado Pago usando `MERCADOPAGO_ACCESS_TOKEN`.

#### [NEW] [route.ts (checkout)](file:///g:/proyectos/imaginarte3d/src/app/api/checkout/route.ts)
1. Recibe el carrito de compras y los datos del cliente.
2. Valida la existencia y stock de cada producto en la base de datos.
3. Calcula el total aplicando los descuentos desde el backend.
4. Crea la orden en la base de datos en estado `PENDING`.
5. Genera la preferencia de pago en Mercado Pago indicando URLs de retorno (`success`, `failure`) y el ID de la orden en `external_reference`.
6. Retorna el ID de la preferencia para redireccionar en el frontend.

#### [NEW] [route.ts (webhook)](file:///g:/proyectos/imaginarte3d/src/app/api/mercadopago/webhook/route.ts)
1. Recibe notificaciones de pago de Mercado Pago.
2. Valida la firma del webhook si corresponde.
3. Si el estado es aprobado/approved:
    *   Cambia el estado de la orden a `PAID`.
    *   Resta del stock de los productos correspondientes las cantidades compradas.
4. Responde con HTTP 200.

---

### 4. Componentes y Estado Global del Carrito

#### [NEW] [cart-provider.tsx](file:///g:/proyectos/imaginarte3d/src/components/cart-provider.tsx)
Contexto de React que maneja el estado del carrito en `localStorage` con la clave `cart_3d`. Expondrá métodos para:
*   `addToCart(product, quantity)`
*   `removeFromCart(productId)`
*   `updateQuantity(productId, quantity)`
*   `clearCart()`
*   `cartItems`, `cartTotal`, `cartCount`

#### [NEW] [navbar.tsx](file:///g:/proyectos/imaginarte3d/src/components/navbar.tsx)
Header responsivo con el menú de navegación y un botón del carrito que muestra la cantidad de items.

#### [NEW] [product-card.tsx](file:///g:/proyectos/imaginarte3d/src/components/product-card.tsx)
Tarjeta visual para productos que muestra imagen, nombre, categoría, precio normal y precio rebajado si tiene descuento.

---

### 5. Páginas Públicas (Frontend)

#### [NEW] [page.tsx (Home)](file:///g:/proyectos/imaginarte3d/src/app/page.tsx)
Muestra un banner hero moderno y atractivo y una sección con los 4 productos destacados (más recientes).

#### [NEW] [page.tsx (Catalog)](file:///g:/proyectos/imaginarte3d/src/app/productos/page.tsx)
Listado completo de productos con:
*   Barra de búsqueda por nombre.
*   Filtro por categorías dinámico.
*   Diseño grid responsivo.

#### [NEW] [page.tsx (Detail)](file:///g:/proyectos/imaginarte3d/src/app/productos/[id]/page.tsx)
Vista individual del producto con detalles, galería (o imagen principal), cálculo dinámico de precio con descuento, selector de cantidad y validación de stock disponible.

#### [NEW] [page.tsx (Cart & Checkout)](file:///g:/proyectos/imaginarte3d/src/app/carrito/page.tsx)
Página dividida en dos secciones (responsiva):
1.  **Resumen del Carrito**: listado de items, controles de cantidad y eliminación.
2.  **Formulario de Checkout**: Nombre, Email, Teléfono y Dirección. Integración directa con el endpoint `/api/checkout`.

#### [NEW] [success/page.tsx](file:///g:/proyectos/imaginarte3d/src/app/checkout/success/page.tsx) & [failure/page.tsx](file:///g:/proyectos/imaginarte3d/src/app/checkout/failure/page.tsx)
Páginas de agradecimiento y estado de pago.

---

### 6. Panel de Administración (`/admin`)

#### [NEW] [page.tsx (Admin Login)](file:///g:/proyectos/imaginarte3d/src/app/admin/login/page.tsx)
Formulario de acceso para el administrador con diseño elegante y validaciones.

#### [NEW] [page.tsx (Admin Dashboard)](file:///g:/proyectos/imaginarte3d/src/app/admin/page.tsx)
Vista general que muestra tarjetas con:
*   Total de ingresos estimados (ventas completadas).
*   Cantidad total de órdenes.
*   Cantidad de productos en catálogo.
*   Menú de navegación lateral hacia "Productos" y "Pedidos".

#### [NEW] [page.tsx (Admin Products)](file:///g:/proyectos/imaginarte3d/src/app/admin/productos/page.tsx)
Tabla interactiva con paginación para ver los productos, y un modal/formulario para Crear, Editar o Eliminar (con diálogo de confirmación).

#### [NEW] [page.tsx (Admin Orders)](file:///g:/proyectos/imaginarte3d/src/app/admin/pedidos/page.tsx)
Listado de órdenes con filtros de estado. Al hacer clic en una orden, se abre un modal con el detalle del cliente, los productos comprados y un selector para cambiar el estado (`PENDING` → `PAID` → `SHIPPED` → `CANCELLED`).

---

## Verification Plan

### Automated Tests
*   **Pruebas de compilación**: Ejecutaremos `npm run build` para asegurar que no haya errores de TypeScript ni de compilación estática.
*   **Validación de Schema**: Correremos `npx prisma validate` y generaremos el cliente con `npx prisma generate` para validar la integridad de la base de datos.

### Manual Verification
1.  **Flujo del Carrito**: Añadir productos, modificar cantidades y validar que no se supere el stock disponible.
2.  **Validación de Precios**: Comprobar que los descuentos se apliquen correctamente tanto en el frontend como en el backend.
3.  **Middleware de Admin**: Intentar acceder a `/admin` directamente sin sesión y comprobar que redirija a `/admin/login`.
4.  **Checkout simulado**: Enviar datos al checkout y verificar que se genere la orden en la base de datos con estado `PENDING` y se retorne la url de Mercado Pago.
