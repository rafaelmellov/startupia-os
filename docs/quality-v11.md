# Comprobación de la revisión 11.0

## Verificación funcional

- MVP interactivo: de dos a tres funciones, retirada hasta una, protección de la última función y contador coherente. El cambio de caso restablece la selección.
- Casos: restaurante y entrenador cambian el problema y las respuestas del ejemplo; el Copiloto propone el formato correspondiente.
- Operators: elegir una fuente muestra su aportación. Manager: ciclo real de estados 0 → 1 → 2 → 0.
- Etapas: el tercer paso muestra la secuencia funciones → prioridades → MVP y conserva la entrada al diagnóstico.
- Mentoría: el reto de primeros clientes rellena decisión y resultado esperado. Tras editar una pregunta y volver a elegir otro reto, la redacción propia se conserva.
- Móvil a 320 px: cambios de funciones y tarea con ancho desplazable igual al ancho disponible de cada panel. Mentoría a 390 px y página a 768 px revisadas, sin desbordamiento horizontal observado.
- Movimiento reducido: los tres nodos gráficos de las etapas tienen `animation-name: none` y opacidad 1. Las decisiones del ejemplo siguen funcionando de forma manual.
- No se observaron errores propios de la página en los registros examinados.

## Comprobación de fuente

- `verify-live-examples.cjs`: 12 combinaciones entre casos y herramientas, ejemplos distintos por negocio, contadores de una y cuatro funciones y ausencia de controles activos dentro de las escenas pasivas del dashboard.
- `verify-checkout.cjs`: rutas directas, aviso cuando falta el enlace, cuatro URLs no seguras o inválidas rechazadas, ocho scripts válidos y exportación idéntica.
- `verify-diagnostic.cjs`: 65.536 perfiles distintos y 262.144 casos de recomendación. La revisión de copy no modifica los criterios del análisis.
- IDs estáticos únicos, anclas internas resueltas y recursos incrustados. Los cambios de los estudios citados se limitan a su presentación; no se alteran cifras, muestras ni enlaces originales.

## Referencias consultadas

Hostinger y G4 OS: organización por necesidades, ejemplos de uso y transiciones entre estados. Notion: su página pública, porque la URL de la app requiere JavaScript para leer su contenido. G4 Business: páginas públicas indexadas de programas y emprendimiento; la portada con los parámetros facilitados no se pudo recuperar. No se reutilizan recursos ni afirmaciones comerciales de esas marcas.

Las comprobaciones son representativas, no una garantía universal. No se conectaron pagos, recepción de solicitudes ni IA en vivo.
