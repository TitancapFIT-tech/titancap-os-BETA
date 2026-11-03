# Configuración de despliegue

## Supabase provisionado
- Proyecto: `doit-social`
- Región: `sa-east-1` (São Paulo)
- Ref: `myxczqevsbeniwscdxhz`
- URL: `https://myxczqevsbeniwscdxhz.supabase.co`
- Esquema: 13 tablas; RLS habilitado en todas; 44 políticas. El rol `anon` y `PUBLIC` no tienen privilegios de tabla.

## Vercel
1. En el panel de Vercel, importa el repositorio `TitancapFIT-tech/titancap-os-BETA`.
2. Usa el directorio raíz y el framework Next.js.
3. Configura `npm install` y `npm run build`.
4. Añade las variables de `.env.example` en Production, Preview y Development.
5. Después de crear el dominio de Vercel, actualiza Supabase Auth > URL Configuration: Site URL con el dominio de producción y Redirect URLs con el dominio y `http://localhost:3000/**`.
6. Verifica la confirmación de correo y configura SMTP propio antes de abrir el registro al público.

El intento de crear el proyecto Vercel mediante la conexión actual devolvió HTTP 403 (permisos insuficientes). Por eso hay que importar el repositorio desde una cuenta/rol de Vercel que permita crear proyectos. No se reutilizó ninguno de los proyectos de otros productos.

Nunca se deben usar claves `service_role` o secret keys en el navegador. La publishable key de `.env.example` es pública por diseño.
