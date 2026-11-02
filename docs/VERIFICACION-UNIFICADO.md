# Verificación de Startupia unificado

Fecha: 27 de octubre de 2026, America/Bogota.

## Comprobaciones automáticas

`node scripts/check-quality.mjs`: **16 suites y TypeScript aprobados**. Comprueba los contratos existentes del workspace, concurrencia, informes, adjuntos, acciones revisables, recuperación y motor local, además del nuevo recorrido.

`node tests/journey.test.mjs`: identidad y origen, recuperación del onboarding, finalización, contexto compartido sin borrar tareas, conflictos de versión, separación de cuentas, precios, selección sin activar derechos de pago, cola de mentorías, reintentos idempotentes, permisos de administración, originales privados y límites de tamaño.

Build de producción mediante el helper oficial de Sites. Migración adicional `0003_nice_blue_blade.sql`, generada con Drizzle; migraciones aplicadas en la base local antes de las pruebas de navegador. No se ejecutan migraciones durante solicitudes.

## Comprobaciones de navegador

- Landing con el eslogan exacto: «Piensa en grande. Empieza inteligente».
- Build USD 9, Growth USD 37 y selección guardada sin cobro.
- Recorrido acceso → onboarding → perfil → Startupia OS.
- Recuperación del paso y del contexto al recargar el onboarding.
- Finalización con nombre, problema, propuesta, segmento, etapa y prioridades.
- Dos tareas propuestas desde el Copiloto, revisadas y aplicadas; el contador cambia de cuatro a seis.
- Adjunto TXT sintético almacenado antes de enviarlo; respuesta identificada como lectura del archivo.
- Original visible en Plan y uso; la descarga coincide byte por byte con el archivo cargado.
- Solicitud de mentoría de dos horas: USD 394, registro persistente y estado «Por confirmar», sin cobro.
- Movimiento reducido y ausencia de desbordamiento horizontal en landing, acceso, onboarding, OS y Mentors a 375 píxeles útiles de ancho.

Solo se utilizaron datos sintéticos en la base de vista previa. No se cargaron registros de clientes reales en las pruebas. Un fallo de compatibilidad de `crypto.randomUUID` en HTTP de vista previa se corrigió reutilizando el generador de identificadores existente.

## Límites pendientes

| Dependencia | Estado |
|---|---|
| IA remota con los ejemplos suministrados | Sin credencial operativa ni modelo verificado; no se probó una llamada real. El motor local existente se conserva. |
| Cobros, webhooks, renovaciones y portal | No activados. Falta proveedor autorizado, configuración y matriz comercial. |
| Registro directo con correo/Google y contraseña propia de Startupia | Se utiliza el acceso administrado de Sites con ChatGPT; no se muestra un formulario desconectado. |
| Mentores disponibles | Catálogo vacío hasta publicar perfiles reales confirmados desde administración. |
| Notificaciones externas de mentorías | No se envían correos ni mensajes automáticamente; la cola se administra dentro de Startupia. |
| Aplicaciones externas y OAuth | No se presentan como conectadas. |
| Academy | Fase futura; no desarrollada durante el MVP. |
| Generador autónomo de aplicaciones digitales | Taller ilustrativo conservado y etiquetado; no se ofrece como sistema completo de generación y despliegue. |

Las comprobaciones descritas no constituyen una garantía de ausencia absoluta de errores ni una validación comercial del negocio. Los adaptadores de proveedores cuentan con pruebas simuladas; no se confunden con verificación en vivo.
