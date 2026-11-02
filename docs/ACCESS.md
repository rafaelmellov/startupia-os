# Acceso a funciones de Startupia OS

La identidad puede registrarse antes de pagar. Cuenta, onboarding, elección comercial, estado de facturación y solicitudes de mentoría permanecen disponibles para preparar la contratación. Una selección de plan o un retorno a la página de éxito no concede acceso.

## Condición de acceso

`deriveEntitlements()` exige todos estos datos del registro de suscripción escrito por el servidor: plan Build o Growth, proveedor Stripe, identificador de suscripción válido, estado **active**, período de suscripción futuro y `payment_verified_until` futuro. Trialing, incompleto, impago, cancelado, vencido o una suscripción sin evidencia de pago no activan funciones. El cliente y user_metadata no pueden escribir esa evidencia.

El reconciliador de facturación debe comprobar la factura pagada y escribir `payment_verified_until` según su período de servicio; `active` por sí solo no basta. Esta integración requiere la correspondiente actualización del escritor de billing. La migración no concede períodos de pago a registros antiguos automáticamente.

`requirePaidAccess(db,userId)` es el contrato común para páginas e IA. Devuelve organizationId, subscription y entitlements o falla con 402. Errores de verificación fallan cerrados con 503.

## Aplicación y base de datos

- `/os` redirige al checkout del plan elegido si falta acceso; después verifica onboarding. `/growth` y `/integrations` también verifican el acceso antes de servir sus herramientas.
- API protege workspace, investigación, informes, Growth, integraciones y operaciones sobre originales.
- La metadata de archivos sigue listándose en Cuenta; los bytes, carga y eliminación requieren acceso activo. Un flujo privilegiado para exportar o borrar originales tras cancelación no está implementado en esta fase.
- RLS y RPC aplican la condición a workspace, historial de IA, mutaciones de archivos y Storage. Así se evita eludir la API llamando directamente al servicio de datos.
- El vencimiento no elimina datos ni los cambia. Reactivar un período pagado restaura el acceso correspondiente.

## Continuidad del onboarding

El onboarding puede completarse antes del pago guardando únicamente su metadata. El primer GET autorizado del workspace lo crea desde ese contexto si aún no existe. El guardado usa comparación de versión: dos solicitudes concurrentes no duplican el workspace. Editar onboarding con acceso activo conserva registros existentes y añade cada objetivo inicial una sola vez.

## Límites operativos iniciales

Build reserva hasta 10 ejecuciones de IA por día UTC y 1800 tokens de salida por consulta; Growth, 60 y 3600. Son límites técnicos iniciales, sujetos a la matriz comercial final; no equivalen a resultados garantizados. La reserva está serializada en la base para evitar carreras.

## Verificación

- `tests/entitlements.test.mjs`: períodos, estados, proveedor, plan, errores de lectura, presupuestos y bootstrap sin perder trabajo.
- `supabase/tests/paid-access.sql`: prueba transaccional con rollback para acceso sin pago, factura no verificada, usuario externo, autoascenso, Storage, trial y vencimiento.
- `supabase/tests/tenant-isolation.sql`: actualizada para que el tenant propietario tenga un período pagado de fixture.

No se ha aplicado esta migración ni ejecutado SQL contra el proyecto remoto desde esta subtarea. El propietario de la publicación debe revisar/aplicar y ejecutar las pruebas antes de declarar el gate verificado.
