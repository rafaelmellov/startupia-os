# Despliegue y configuración Auth

## Estado comprobado el 30 de octubre de 2026

- Equipo Vercel: `Startupia`, slug `startupia1`, ID `team_vXVMU27XhByZZusaHm51Fhpm`. La consulta devolvió cero proyectos y un miembro confirmado con rol `OWNER`.
- `git_namespaces(provider: github)` devolvió una lista vacía. Esto confirma que el conector no ve un namespace GitHub; no demuestra por sí solo por qué falló la creación anterior con HTTP 403.
- Supabase: `gvezjivvhpmdmmjvdqzi`, URL `https://gvezjivvhpmdmmjvdqzi.supabase.co`.
- Advisors de seguridad devolvió únicamente dos avisos INFO: RLS sin políticas en `private.billing_customers` y `private.billing_events`. Mantener estas tablas privadas; no añadir políticas públicas solo para eliminar el aviso.
- La respuesta actual de advisors no incluye leaked-password. Esto **no verifica** el valor de `password_hibp_enabled` ni SMTP ni las URLs Auth. El conector Supabase disponible no incluye lectura/escritura de la configuración Auth.
- Esta auditoría no creó proyectos/despliegues, modificó Auth, cambió roles ni generó credenciales. No hay URL de producción verificada en esta auditoría.

## Preparar el código y crear el proyecto

1. Publicar el código completo y el lockfile de `startupia-os` en `rafaelmellov/startupia-os`, rama `integration/saas-foundation`. Confirmar el SHA que se va a desplegar y que el repositorio ya contiene `package.json`, `app/`, `lib/` y el lockfile.
2. En Vercel seleccionar explícitamente `startupia1`. Para importación Git, comprobar primero que Vercel puede ver ese repositorio mediante su integración GitHub. La conexión GitHub de Codex no implica que la integración GitHub de Vercel esté instalada.
3. Crear el proyecto con framework `nextjs`, comando de build `pnpm build` y directorio raíz donde esté `package.json` (raíz del repositorio si se publicó el contenido de esta carpeta). No usar export estático: la aplicación contiene rutas de servidor.
4. Ruta API documentada: `POST /v11/projects`, `teamId=team_vXVMU27XhByZZusaHm51Fhpm`, cuerpo `{ "name": "startupia-os", "framework": "nextjs", "gitRepository": { "type": "github", "repo": "rafaelmellov/startupia-os" } }`. El conector ofrece `create_project` con esos campos. Esta ruta requiere permiso efectivo de escritura del conector además del rol del usuario.
5. Alternativa documentada para una sesión CLI ya autenticada y autorizada: `vercel --scope startupia1 project add startupia-os` crea el proyecto vacío sin integración Git. Después se enlaza el código y se configura el entorno. No es un mecanismo para eludir un 403: si el permiso falta, conservar el error y corregir la conexión autorizada.
6. Comprobar el ID del proyecto creado, rama de producción y SHA antes de desplegar. La rama de integración debe ser preview mientras no se decida explícitamente usarla como producción. Un push Git posterior puede disparar un build automáticamente.

Referencias: [crear proyecto](https://vercel.com/docs/rest-api/projects/create-a-new-project), [creación por CLI](https://vercel.com/docs/git/vercel-for-azure-pipelines), [integración Git](https://vercel.com/docs/git).

## Variables de aplicación

Configurar por separado Preview y Production; usar `.env.example` como inventario. Nunca copiar `.env.local` al repositorio.

| Variable | Valor o función |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gvezjivvhpmdmmjvdqzi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key existente del mismo proyecto, obtenida por el canal autorizado; es una clave pública de cliente |
| `APP_ORIGIN` | Origen HTTPS exacto del despliegue, sin ruta; obligatorio para redirecciones y comprobaciones de origen |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Solo servidor; opcionales hasta activar IA real |
| `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST` | Analytics opcional; ver `docs/ANALYTICS.md` |
| `STRIPE_BILLING_ENABLED` | `false` hasta completar la configuración y verificación de `docs/BILLING.md` |
| `STRIPE_RESTRICTED_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_BUILD`, `STRIPE_PRICE_GROWTH`, `SUPABASE_SERVICE_ROLE_KEY` | Solo para billing habilitado, según `docs/BILLING.md`; nunca prefijar secretos con `NEXT_PUBLIC_` |

Los valores públicos se incorporan al build: un cambio requiere un nuevo despliegue. `APP_ORIGIN` de Preview debe corresponder al host en el que se prueba; un valor de producción bloquea mutaciones desde otra preview por diseño. Preferir una URL estable para validar Auth.

## Supabase Auth: configuración soportada

Abrir [URL Configuration del proyecto](https://supabase.com/dashboard/project/gvezjivvhpmdmmjvdqzi/auth/url-configuration). Establecer Site URL al origen final y permitir las dos redirecciones reales del código, reemplazando `<ORIGEN>`:

```text
<ORIGEN>/auth/callback?next=/onboarding
<ORIGEN>/auth/callback?next=/access?mode=password
```

Para desarrollo se usa `http://127.0.0.1:3000`; mantenerlo solo donde se necesite. Las previews requieren sus URLs explícitas o un patrón estrictamente limitado al proyecto. Evitar un comodín global de todos los sitios Vercel. Ver [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

La vía programática oficial de inspección es `GET https://api.supabase.com/v1/projects/gvezjivvhpmdmmjvdqzi/config/auth`, con una credencial Management API autorizada (`auth:read` o permiso `auth_config_read`). Inspeccionar únicamente `site_url`, `uri_allow_list`, `external_email_enabled`, `disable_signup`, `mailer_autoconfirm`, `smtp_host`, `smtp_port`, `smtp_admin_email`, `smtp_sender_name`, `password_hibp_enabled` y `password_min_length`; no registrar la respuesta completa, que puede contener secretos. La clave publishable y la service-role de la aplicación no sustituyen la autenticación Management API. La actualización oficial se realiza con la operación Update auth service config o Dashboard, conservando los campos ajenos al cambio. Ver [referencia de lectura Auth](https://supabase.com/docs/reference/api/v1-get-auth-service-config).

En Email/Auth, comprobar que registro y confirmación de correo coinciden con el flujo del producto. Antes de abrir el registro al público, verificar un SMTP propio y un remitente autorizado. El SMTP predeterminado de Supabase limita los destinatarios a miembros del equipo y no es adecuado para alta pública. Validar entrega real de confirmación y recuperación en un buzón de prueba externo autorizado. Ver [SMTP](https://supabase.com/docs/guides/auth/auth-smtp).

Comprobar leaked-password en configuración, no inferirlo de advisors. Supabase documenta la función en Pro o superior; un cambio de plan requiere decisión comercial aparte. No alterar roles Postgres ni instalar funciones para simular ese ajuste. Ver [Password security](https://supabase.com/docs/guides/auth/password-security).

## Verificación antes de anunciar disponibilidad

1. Ejecutar `pnpm test`, `pnpm typecheck` y `pnpm build` con el código final; registrar resultado y SHA.
2. Revisar estado READY y logs del despliegue. Abrir `/access`, registrar una cuenta de QA y completar la confirmación en el mismo navegador para conservar el verificador PKCE.
3. Completar onboarding, guardar datos, recargar y verificar persistencia. Cerrar sesión y comprobar que el workspace ya no es accesible.
4. Probar recuperación por email, cambio de contraseña y acceso con la nueva contraseña. Verificar que ningún enlace termina en localhost o en otra preview.
5. Con una cuenta QA sin permisos admin, onboarding completo y sin Growth, puede ejecutarse `pnpm test:live` con `TEST_ORIGIN`, `TEST_EMAIL`, `TEST_PASSWORD` inyectados de forma segura. El script escribe el workspace y solicitudes de interés y espera IA sin configurar (503); no usarlo con una cuenta real ni después de habilitar IA sin adaptar esa expectativa.
6. Comprobar aislamiento entre dos usuarios, ausencia de secretos en cliente y respuestas 401/403 para accesos no autorizados. Rerun advisors tras cambios de esquema.
7. Registrar URL final, project ID, deployment ID, SHA y resultado de las pruebas. Solo entonces marcar el despliegue como validado. La entrega SMTP y el flujo Auth completo siguen pendientes hasta probarlos en el host publicado.


## Revisión del 31/10/2026

Las migraciones de acceso tras pago y prueba de factura están aplicadas; pasaron las tres pruebas SQL transaccionales de acceso, aislamiento y billing, conservando los datos reales. La revisión actual de seguridad devuelve dos INFO esperados en tablas privadas de billing y un WARN: protección contra contraseñas filtradas deshabilitada. La conexión disponible no permite cambiar la configuración Auth; revisar [protección de contraseñas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se ha verificado SMTP ni la entrega de recuperación.

La IA admite `OPENAI_MODEL_BUILD` y `OPENAI_MODEL_GROWTH`, con `OPENAI_MODEL` como fallback. Se comprobó ausencia de clave utilizable en los materiales de esta fase; no se hizo una generación externa. Los secretos de billing siguen sin instalar y los cobros reales están deshabilitados.
