# Startupia OS

**Piensa en grande. Empieza inteligente.**

## Fase 1 — Fundación técnica (NO verificada en producción)

La rama `feature/startupia-saas-foundation-20261029` incorpora una base Next.js + TypeScript. Incluye Landing, Login, OAuth callback, Onboarding, panel OS, workspace con persistencia en tablas existentes, Copiloto protegido (desactivado por defecto) y catálogo de Mentors vinculado a Supabase.

**No** se ha migrado el código fuente de los cuatro prototipos de Sites. **No** se han ejecutado aún compilación, pruebas E2E ni despliegue. Tampoco se han habilitado pagos, no se garantizan funcionalidades nuevas sin suscripción activa y no hay historial persistente de chat ni adjuntos.

## Configuración

1. Utilizar una versión compatible de Node.js y ejecutar `npm install`.
2. Copiar `.env.example` a `.env.local`; completar la URL del proyecto Supabase y su clave publicable (no la clave secreta).
3. Ejecutar `npm run typecheck`, `npm run build` y `npm run dev`.
4. Para habilitar IA **después** de verificar modelo, crédito y límites, configurar `OPENAI_API_KEY` y `OPENAI_MODEL` en variables **del servidor**, luego `ENABLE_LIVE_AI=true`.

## Tareas críticas pendientes

- Recuperar el código de los prototipos existentes; incorporar los logos originales como assets y comparar visualmente.
- Verificar el flujo completo de inicio de sesión y OAuth (Google/Apple) con proveedores configurados.
- Probar RLS entre usuarios de distintas organizaciones, políticas de almacenamiento y creación segura de organizaciones.
- Proteger la API contra abuso y gastos no controlados: cuotas por organización, límites de frecuencia, registro real de uso, historial y ficheros seguros.
- Habilitar la protección de contraseñas filtradas en Supabase Auth.
- Integrar Stripe solo tras verificación jurídica, elegibilidad, precios, modo prueba y webhooks idempotentes; no se han hecho cobros.
- Conectar Vercel, PostHog, Slack y flujo de incidencias en Linear. El conector de Vercel no mostró proyectos.
- Fijar dependencias en lockfile real y completar CI, pruebas unitarias, integración, E2E, accesibilidad y seguridad.
- Revisar y fusionar desde PR antes de producir cambios en `main`.

El endpoint `/api/health` únicamente confirma que responde la aplicación, no que los proveedores externos funcionen.
