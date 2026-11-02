# Revisión 13 — Primera llamada gratis

## Experiencia

- Precio de mentoría retirado de la sección, FAQ, guías locales, resumen comercial, formulario y recomendador. No hay cálculo de horas ni precio oculto en los datos de la solicitud. OS conserva Build USD 17/mes y Growth USD 37/mes.
- CTA «Agenda tu llamada gratis» conectado al formulario de primera llamada. La sesión inicial gratuita y las mentorías posteriores se presentan como pasos distintos.
- Tres situaciones seleccionables muestran el bloqueo, una pregunta concreta y tres puntos que se pueden explorar con un mentor. Conservan el contexto al preparar el formulario.
- Comienzo y cierre orientados al tiempo invertido sin comprobar demanda. Se conserva literalmente la frase solicitada previamente. Contexto metodológico de los estudios disponible en un desplegable.
- El formulario mantiene validación y consentimiento, presenta contexto opcional en un desplegable, no solicita horas ni calcula una tarifa.
- El recomendador dirige a la llamada gratuita cuando se prefiere orientación humana, incluso con presupuesto cero para OS.

## Verificación

- Tres pasos del formulario completados en navegador con datos ficticios; resumen gratuito y sin tarifa. No se envió información.
- Diagnóstico completo, formulario de preferencias con apoyo humano y presupuesto cero, recomendación gratuita y apertura del formulario desde su CTA.
- Marcos de 320, 390, 768 y 1024 px: los bloques modificados no desbordan; fotografía 3:2 conservada. Formulario móvil revisado sin desbordamiento horizontal.
- Controles de los retos y selección móvil actualizan la explicación. Los efectos nuevos respetan reducción de movimiento.
- Sin errores de consola de la página durante la revisión.
- IDs únicos y exportación HTML idéntica a la landing. Tarifa antigua y variables de cálculo retiradas del HTML y JavaScript funcional.
- Se ejecutan las verificaciones existentes de pago, ejemplos y diagnóstico antes de empaquetar. El diagnóstico sigue cubriendo 65.536 perfiles distintos; el recomendador prueba 196.608 combinaciones de presupuesto y perfiles, además de regresiones de la llamada gratuita.

## Límite de integración conservado

No se dispone de un servicio de agenda o receptor de solicitudes configurado. El formulario lo indica en la revisión; no fabrica citas confirmadas. Si se configura el receptor del mismo origen admitido, se enviará una solicitud con `requestType: free_intro_call`, sin importes.
