# Estado comprobable — 2026-10-29

## Arquitectura

Una aplicación Next.js: landing → acceso Supabase → onboarding → Build, Mentors, Growth y cuenta. Todas las APIs de negocio verifican al usuario; la organización se deriva del usuario autenticado. PostgreSQL aplica RLS a diez tablas. Los archivos se guardan en un bucket privado. El rol de administrador utiliza app_metadata, nunca user_metadata. Los accesos Growth dependen de suscripciones vigentes, no de la elección comercial.

## Evidencia

- Compilación Next.js con webpack completada; Turbopack no acepta el import remoto usado por el motor local heredado.
- 19 suites superadas: 16 heredadas, seguridad HTTP, privacidad analítica y facturación.
- Prueba SQL real: lectura del propietario, aislamiento entre organizaciones, escritura obsoleta rechazada, autoasignación de suscripción denegada y privilegios vía user_metadata denegados. Fixtures revertidos.
- Asesor de seguridad Supabase: sin hallazgos tras crear el esquema. Esto no equivale a una auditoría independiente.
- Navegador: inicio de sesión con cuenta sintética, seis pasos de onboarding y creación de tarea mediante la interfaz.

## Límites y próximas comprobaciones

- Vercel: creación de proyecto devuelve 403. No hay despliegue nuevo verificado.
- OpenAI: el archivo recibido contiene ejemplos SDK; no se encontró una clave utilizable. No se hizo una llamada remota ni se escogió un modelo no verificado.
- Stripe: conexión disponible en modo de prueba. Checkout, portal y webhook implementados para pruebas; migración aplicada. Secretos de servidor y prueba completa con Stripe pendientes. Elegibilidad comercial sin verificar.
- PostHog: instrumentación consentida activa en pruebas; recepción de page_view /os y /growth confirmada por consulta al proyecto695566.
- Figma: acceso de visualización; no se ha sincronizado un sistema de diseño editable.
- Slack: canal localizado, sin notificaciones enviadas.
- Linear: proyecto y bloqueos registrados. GitHub: rama de integración para revisión.
- Movimiento: se conservan 320 variantes existentes (80 superficies × 4 estados). No se presenta esa cifra como 320 comportamientos independientes validados.
- Recuperación y confirmación por correo requieren verificar configuración SMTP, enlaces permitidos y entrega real.
- Análisis avanzado de Growth, validación integral de facturación, monitorización y pruebas exhaustivas de accesibilidad siguen pendientes.

Las credenciales y archivos .env quedan excluidos del repositorio. No se considera terminado el producto completo.

- Comprobación posterior del asesor Supabase: protección contra contraseñas filtradas desactivada. Resolver antes de producción: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- La tarea creada en la interfaz reaparece después de recargar; evidencia local en audit/evidence/workspace-persistence.png.

## Comprobaciones de esta continuación

- API real: identidad falsificada401, acceso autenticado200, guardado200, versión obsoleta409, interés comercial sin acceso Growth403, administración403, IA sin clave503, origen externo403 y logout401.
- Archivos: carga201, descarga de bytes idénticos200, descarga anónima401, eliminación200 y posterior404.
- Mentoría: solicitud201, reenvío200 con mismo ID, total calculado por servidor y sin cobro.
- Growth: un experimento creado en interfaz reaparece tras recargar con entitlement temporal de QA. El entitlement temporal y la cuenta sintética se retiraron tras verificar.
- SQL billing-isolation: RPC denegada a cliente, reconciliación y ledger atómicos, reenvío duplicado, cliente no modifica suscripción. Todo con rollback.
- Asesor: tablas privadas billing con RLS y sin políticas (denegación intencional a clientes); función de servidor restringida a service_role. Aviso de contraseñas filtradas sigue pendiente.
- GitHub: revisión automática rechazó publicar el árbol amplio en repositorio público sin autorización de destino/visibilidad. No se movió la rama con el código completo. Fuente y snapshot local conservados.

- Compilación final Next.js webpack y TypeScript superados, 17 páginas generadas y rutas de autenticación/billing/analítica. API crítica repetida sobre next start: todos los resultados esperados.
- Growth móvil390px: scrollWidth390, h1 único, lang es, cero campos sin etiqueta y cero imágenes sin alt. Comprobación DOM básica, no auditoría WCAG completa. Consola de producción sin errores en la sesión comprobada.
- Cuenta QA y fixtures retirados; consulta confirma cero usuarios de prueba restantes. No se conservaron credenciales sintéticas en el repositorio.

## Publicación Sites y nueva política comercial — 30 de octubre

- Site unificado: https://startupia-platform-os.contact-rafaelmello.chatgpt.site (audiencia privada conservada).
- 31 rutas entre producto, planes, registro, acceso, recuperación, onboarding, workspace, Growth, mentoría, pago, retorno y ayuda.
- Build17USD/mes y Growth37USD/mes por nueva confirmación del propietario. Presentación «Oferta de lanzamiento» sin precio anterior ni urgencia inventados.
- Compilación Next28 páginas generadas, compilación Worker Sites y19 suites superadas con el precio17.
- Worker E2E con cuenta sintética: login/cookies, selección de Growth sin otorgar acceso, onboarding/workspace persistentes y logout.
- Detectado fallo de next/link en Vinext en producción; se sustituyeron los enlaces de páginas comerciales y acceso por navegación nativa compatible con ambos despliegues.
- Fuente Sites de esta versión: ec9e92dd7be11a29e75f28f6d5851422840f0f6c.
- GitHub aún no contiene la implementación: la revisión automática rechazó nuevamente el árbol por exigir autorización literal para publicar código en repositorio público, aun después de verificar propiedad y visibilidad. No se cambió la rama.
- Checkout real, IA remota y correo de confirmación/recuperación siguen sujetos a credenciales y verificación de configuración.

- Segunda publicación Sites confirmada succeeded: appgdep_6ae52a0f4b808191945180f36d724e21; precios17/37 y navegación nativa.
- Navegación publicada verificada: pricing → checkout Build17 → acceso, conserva plan y retorno.
- La subida GitHub fue rechazada de nuevo después de confirmar repo público y permisos admin/push; no se ha intentado un camino alternativo para eludir la revisión.

- Prueba final publicada: elegir Build17 → login real con cuenta sintética → retorno al checkout Build17; plan guardado en Supabase y sin suscripción concedida. Consola sin errores nuevos después de la corrección.
