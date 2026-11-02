# Suscripciones Stripe (sandbox)

Se implementan Checkout alojado, Customer Portal y webhook real. Esta entrega no habilita cobros: necesita configuración y validación del flujo en sandbox. Rechaza claves live y eventos livemode. No crea productos ni precios automáticamente. La cuenta conectada en el plugin no suministra credenciales al servidor.

## Configuración del servidor

Aplicar después del schema fundacional `supabase/migrations/20261030042735_billing.sql`. Conserva las tablas existentes; `public.subscriptions` ya incluye `provider_subscription_id`. La migración crea tablas privadas y una única RPC `billing_operation` con permiso exclusivo para `service_role`, también comprobado dentro de la función. El navegador y las sesiones authenticated no pueden escribir suscripciones ni el ledger.

Guardar en el almacén de secretos del despliegue (en Vercel, variables Sensitive), nunca en archivos públicos ni prefijos NEXT_PUBLIC:

- `STRIPE_BILLING_ENABLED=true`, únicamente cuando las demás opciones estén verificadas.
- `STRIPE_RESTRICTED_KEY`: RAK sandbox `rk_test_…`. Permisos mínimos para leer precios, suscripciones, facturas, Checkout Sessions y cargos; crear clientes, Checkout Sessions y sesiones del Billing Portal. Ajustar los permisos usando registros de solicitudes en sandbox; no ampliar al modo live.
- `STRIPE_WEBHOOK_SECRET`: secreto `whsec_…` del endpoint, del mismo sandbox.
- `SUPABASE_SERVICE_ROLE_KEY`: exclusivamente del servidor. Se usa para la RPC de reconciliación; nunca se devuelve, registra, ni envía a Stripe.
- `STRIPE_PRICE_BUILD`: precio recurrente mensual de USD 17,00 (1700 centavos).
- `STRIPE_PRICE_GROWTH`: precio recurrente mensual de USD 37,00 (3700 centavos).
- `APP_ORIGIN`: origen canónico, HTTPS en el despliegue.
- Conexión existente: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Cada plan debe tener su propio producto. Configurar el Customer Portal en el mismo sandbox, con los dos precios admitidos y cantidad fija de una unidad. Checkout comprueba importe, moneda, recurrencia mensual y modo test antes de abrirse. No se activa Stripe Tax automáticamente: revisar registros fiscales y [configuración de impuestos recurrentes](https://docs.stripe.com/billing/taxes/collect-taxes) antes de ofrecer un lanzamiento comercial.

## Contrato HTTP

- `POST /api/billing/checkout`: JSON `{ "plan": "build" }` o `growth`; devuelve `{ "url": "…" }` hacia Stripe Checkout.
- `POST /api/billing/portal`: JSON `{}`; devuelve `{ "url": "…" }` hacia Customer Portal.
- Ambas rutas exigen sesión válida, propietario de la organización y Origin válido. No aceptan IDs de cliente, precios, importes ni destinos de retorno del navegador.
- `POST /api/billing/webhook`: cuerpo original firmado por Stripe. No requiere sesión web ni Origin. Límite 1 MiB y tolerancia de firma 300 segundos. Responde 400 a firmas inválidas, 503 a fallo temporal/configuración ausente y 200 solo tras guardar de forma atómica (o evento ajeno/no suscrito/duplicado).

El retorno de Checkout solo indica que la reconciliación está en curso. Los permisos nunca se conceden desde parámetros de URL ni desde el frontend.

Registrar el webhook con API `2026-09-30.endive`, los eventos siguientes y acceso sin barrera de login del despliegue:

`checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_failed`, `charge.dispute.created`, `charge.refunded`, `radar.early_fraud_warning.created`.

## Idempotencia, orden y recuperación

Un cliente Stripe por organización, creación con clave idempotente estable. El checkout abierto queda guardado para reutilizarlo al hacer doble clic; mientras exista cualquier suscripción no finalizada el usuario debe usar el portal. Las llamadas mutables Checkout llevan clave idempotente. Stripe conserva claves como mínimo 24 horas: si falla la persistencia de una sesión tras crearla, los reintentos dentro de ese período recuperan la misma sesión; después de ese período puede existir otro checkout sin completar. La búsqueda de suscripciones evita iniciar otro si ya se completó el primero. No activar enlace de recuperación de checkouts expirados.

Una lease persistida por organización serializa Checkout y webhooks durante 120 segundos. Cada escritura verifica el token y su vencimiento para que un proceso antiguo no sobrescriba a otro. Una lease ocupada devuelve 503 y Stripe reintenta. Fallos de proceso liberan la lease o permiten recuperarla al vencer.

El webhook consulta las suscripciones actuales de Stripe después de adquirir la lease; no considera el orden de entrega ni `event.created` como versión del estado. El ledger y la suscripción se escriben en una transacción. Una falla revierte ambas escrituras; un reenvío del mismo evento no aplica dos veces. La cancelación de una suscripción anterior no revoca otra vigente del mismo cliente. Precios ajenos o cantidades distintas de 1 no conceden acceso.

Política de riesgo conservadora: cualquier reembolso (incluso parcial), disputa o alerta de fraude bloquea los permisos de pago del cliente para revisión humana, sin cancelar automáticamente ni reembolsar en Stripe. La marca `private.billing_customers.risk_blocked` persiste y los siguientes eventos no la levantan. Tras revisión administrativa, un operador autorizado puede eliminar esa marca y reenviar un evento de suscripción desde Stripe para reconciliar. Consultar `private.billing_events` para auditoría; no almacena datos de tarjetas ni payloads íntegros. No hay bandeja administrativa de riesgo en esta fase.

Si Stripe agota sus reintentos, revisar los fallos en Workbench y reenviar los eventos después de corregir la configuración. No hay cron de reconciliación programado en esta fase. La fecha `valid_until` limita permisos incluso si se interrumpe la entrega de renovaciones. No se concede gracia a past_due/unpaid.

## Validación pendiente en sandbox

La suite `tests/billing.test.mjs` cubre firma original, manipulación, tolerancia, firma de rotación, rechazo live, allowlist, bloqueo de riesgo, eventos desordenados, escritura fallida/reintento y duplicados. No sustituye una prueba DB + Stripe real.

Antes de habilitar: aplicar migración; comprobar que anon/authenticated no ejecutan RPC; completar Checkout de ambos planes; verificar estado en la app tras webhook; renovar y fallar pago con reloj de pruebas; cancelar por portal; reenviar y desordenar eventos; probar concurrencia/lease y fallo de DB; provocar eventos de riesgo y revisar bloqueo. La migración fue aplicada y billing-isolation.sql pasó en la base real con rollback. Esta fase no ha realizado cobros de prueba ni aplicado credenciales.

Fuentes oficiales: [Checkout de suscripciones](https://docs.stripe.com/billing/subscriptions/build-subscriptions), [webhooks](https://docs.stripe.com/webhooks), [eventos de Billing](https://docs.stripe.com/billing/subscriptions/webhooks), [Customer Portal](https://docs.stripe.com/customer-management/integrate-customer-portal). Cliente REST por instancia sin nuevas dependencias; versión API fijada. El `integration_identifier` identifica el flujo Checkout según la guía Stripe para versiones posteriores a 2026-03-25.dahlia.


## Pago previo verificado (revisión 31/10)

Migraciones `20261101042650_paid_access_gate.sql` y `20261101043553_verified_invoice_billing.sql` aplicadas y verificadas en el proyecto remoto. El estado active no basta: se requiere `payment_verified_until` y `valid_until` futuros. La evidencia proviene de una factura test pagada, con importe positivo, del mismo cliente y suscripción, línea positiva del precio y del item actuales, cantidad uno y periodo válido. Una factura marcada pagada fuera del proveedor no concede prueba; las facturas con líneas incompletas se rechazan de forma conservadora. El periodo pagado se limita al periodo actual de la suscripción. Los trials y un cambio a GROWTH sin factura pagada para ese precio no dan acceso.

Las pruebas transaccionales `paid-access.sql`, `billing-isolation.sql` y `tenant-isolation.sql` pasaron con rollback en la base real. Comprueban además que ausencia de evidencia se conserva como NULL; la fecha de vigencia nunca se convierte por sí sola en prueba de pago. Estas pruebas usan fixtures y no acreditan una transacción Stripe externa.
