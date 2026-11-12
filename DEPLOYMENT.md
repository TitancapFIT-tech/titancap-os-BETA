# Doit — guía de despliegue

## 1. Backend Supabase ya provisionado

- Proyecto: `doit-social`
- Ref: `myxczqevsbeniwscdxhz`
- Región: `sa-east-1` (São Paulo)
- URL: `https://myxczqevsbeniwscdxhz.supabase.co`
- Esquema: 13 tablas de producto.
- Seguridad: RLS activado en las 13 tablas; las políticas restringen los datos por propietario, amistad, invitación o pertenencia a grupo.
- Realtime: publicación habilitada para publicaciones, amistades, eventos, invitaciones, mensajes y notificaciones.
- Última comprobación: el proyecto fue restaurado y volvió a estado `ACTIVE_HEALTHY`.

**Importante sobre el plan gratuito:** Supabase puede pausar proyectos Free tras una semana de inactividad. Si Doit no se usa durante varios días, comprueba el estado del proyecto antes de asumir que el código falló. La restauración conserva datos y configuración.

## 2. Importar el repositorio a Vercel

La conexión de Vercel utilizada por el asistente devuelve HTTP 403 al crear proyectos. Por eso la importación inicial debe hacerse desde el panel de la cuenta:

1. Abre https://vercel.com/new e inicia sesión.
2. En Import Git Repository, selecciona `TitancapFIT-tech/titancap-os-BETA`.
3. Si no aparece, conecta GitHub y autoriza el acceso a ese repositorio.
4. Nombre del proyecto: `doit-social`.
5. Framework: Next.js.
6. Root Directory: `./`.
7. Node.js: 22.x.
8. Install Command: `npm install`.
9. Build Command: `npm run build`.
10. Deja el Output Directory en automático y pulsa Deploy.

El repositorio contiene un flujo de GitHub Actions que recompone los archivos fuente, compila Next.js y comprueba los recursos PWA.

## 3. Variables de entorno obligatorias

En Vercel, abre Project > Settings > Environment Variables. Añade las dos variables en **Production, Preview y Development**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://myxczqevsbeniwscdxhz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Zb1QFuLVEflu0inHQd7qDQ_CWtFo5JR
```

Después de guardarlas, vuelve a Deployments y crea un nuevo despliegue (Redeploy). Sin estas dos variables `getSupabase()` devuelve `null` y la aplicación deshabilita el acceso y el registro. La publishable key está diseñada para usarse en el cliente; **no añadas nunca una clave `service_role` ni una secret key al frontend**.

## 4. Configurar redirecciones de autenticación

Cuando Vercel entregue el dominio final (por ejemplo, `https://doit-social.vercel.app`):

1. Abre el proyecto en Supabase > Authentication > URL Configuration.
2. Define Site URL con el dominio HTTPS real de Doit.
3. En Redirect URLs añade `https://TU-DOMINIO/**` y `http://localhost:3000/**`.
4. Guarda y verifica el flujo de confirmación de correo en el dominio publicado.
5. Antes de abrir registros al público, configura un proveedor SMTP propio para que los correos de confirmación y recuperación sean confiables.

No uses el ejemplo de dominio si Vercel asignó uno diferente.

## 5. Interfaz y PWA incluidas

- Identidad verde Doit, tarjetas y superficies redondeadas, transiciones suaves y diseño adaptable a móvil.
- Navegación: Inicio, Planes, Crear, Grupos y Perfil.
- Manifiesto PWA, service worker, pantalla offline y guía de instalación después del inicio de sesión.
- iPhone/iPad: abrir en Safari > Compartir > Añadir a pantalla de inicio > Añadir.
- Android: abrir en Chrome > menú ⋮ > Instalar aplicación o Añadir a pantalla de inicio.
- Los datos de autenticación y las respuestas de Supabase no se guardan en la caché offline.

## 6. Alcance y comprobaciones

La app incorpora perfiles, amistades, publicaciones, eventos e invitaciones, grupos privados, mensajes, notificaciones dentro de Doit y preferencias de bienestar digital. La base está preparada para varios usuarios concurrentes y aplica RLS en el servidor.

El flujo actual de chat usa Realtime con consulta periódica de respaldo. Los avisos del producto son notificaciones internas; no se ha configurado todavía envío de push nativo ni sincronización con calendarios externos. Estas funciones requieren permisos y configuración adicional.

Antes de anunciar Doit como producto público, prueba con dos cuentas reales el registro/confirmación, inicio de sesión, solicitudes de amistad, creación de eventos, invitaciones, grupos, chat, permisos y recuperación de contraseña. La compilación de producción y los smoke tests PWA pasan en GitHub Actions; no sustituyen esa prueba funcional con usuarios.


## 7. Corrección de configuración y marca (noviembre de 2026)

La aplicación ya incorpora valores públicos de respaldo para el proyecto Supabase Doit. Si Vercel no inyecta las variables de entorno, el navegador utiliza la URL y la publishable key del proyecto Doit en lugar de mostrar la pantalla de “Configuración inicial”. Si se configuran variables propias, se aceptan únicamente URL Supabase y claves de cliente públicas compatibles. Nunca se debe colocar `service_role` en el navegador.

La identidad recuperada utiliza el emblema original de Doit, el logotipo y el lema “Real connections”. También se incorporó un sistema de motion con movimiento ambiental lento, transiciones de entrada, microinteracciones y soporte para `prefers-reduced-motion`. Los recursos PWA, el icono y el favicon utilizan el mismo símbolo.
