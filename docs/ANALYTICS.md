# Medición opcional

PostHog proyecto 695566. Variables exclusivas del servidor: `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST` (`https://us.i.posthog.com` o `https://eu.i.posthog.com`). Sin configuración no se envían eventos.

`AnalyticsConsent` en el layout ofrece aceptar/rechazar y permite retirar la preferencia. Se respeta DNT/GPC en cliente y servidor. La aceptación se conserva en localStorage; el identificador aleatorio en sessionStorage, se elimina al rechazar. Navegación transmite solo rutas de lista cerrada, nunca query/hash/referrer. No se usa el SDK, autocapture ni replay. El servidor no transmite identidad autenticada, IP del cliente, contenido ni cabeceras entrantes. Las propiedades desactivan perfiles y geolocalización.

Eventos conectados: `page_view` y `workspace_saved` después de confirmación de guardado. El helper `trackAnalytics` admite además `onboarding_completed` y `mentor_requested` para conectar a confirmaciones de sus flujos. No inferir completitud desde visitas. Solo el endpoint autenticado del mismo origen puede transmitir; por eso no se mide el tráfico anónimo de marketing.

`POST /api/analytics` acepta exclusivamente `{consent:true,event,sessionId,path}` con UUID v4 aleatorio prefijado `anon_`, evento y ruta permitidos. Body máximo 1000 bytes. Límite por cuenta de 30 eventos/minuto en memoria: mejor esfuerzo, no distribuido entre réplicas/reinicios. Máximo 10000 cuentas por proceso dentro de la ventana; al llenarse se rechazan nuevas. El consentimiento es declaración explícita del cliente, no prueba criptográfica. Nunca se reintenta el envío ni se bloquea la operación del usuario.

Validación: `tests/analytics.test.mjs` verifica rechazo de PII, propiedades adicionales, query/hash, identificadores arbitrarios y eventos fuera de lista, payload de salida exacto, señales de privacidad y límites/expiración/capacidad. TypeScript validado. No se enviaron eventos reales durante estas pruebas; la verificación de ingesta debe usar un fixture autorizado sin información privada.

Referencias verificadas con el conector PostHog:
- https://posthog.com/docs/api/capture#single-event
- https://posthog.com/docs/data/anonymous-vs-identified-events#how-to-capture-anonymous-events
