# Doit — Menos pantalla. Más vida real.

Doit convierte conversaciones en planes y encuentros presenciales. Es una red social tranquila y mobile-first: feed finito y elegido por la persona, agenda, conexiones mutuas, grupos privados, chat y controles de tiempo. No usa scroll infinito, métricas públicas de popularidad ni publicidad.

## Stack y funcionalidades
- Next.js App Router, TypeScript y Supabase Auth.
- Perfiles, búsqueda y solicitudes mutuas de conexión.
- Feed limitado a amistades y grupos que la persona selecciona.
- Planes con fecha, hora, ubicación, invitados y confirmación de asistencia.
- Grupos privados y chat grupal.
- Notificaciones dentro de la app y límite diario configurable.

## Desarrollo
1. Instala Node.js 22 o superior.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env.local`.
4. Ejecuta `npm run dev`.

El proyecto Supabase `doit-social` ya está provisionado en São Paulo y contiene 13 tablas, 44 políticas RLS y permisos de tabla restringidos a usuarios autenticados. Consulta `DEPLOYMENT.md` para configurar Vercel y Auth Redirect URLs.

No expongas claves `service_role` o secret keys. La publishable key usada en el navegador es pública por diseño y todas las operaciones están protegidas por RLS.