# Revisión visual 12

## Problema y corrección

La figura de mentoría combinaba una relación de aspecto cuadrada con `height:100%` y alturas mínimas de 610/670 px. Al crecer la columna de texto, su altura transferida a través de la relación de aspecto aumentaba también el ancho de la figura: se observaron 817 px, invadiendo la columna contigua.

Se retiran esas alturas y se restringen las columnas con `minmax(0, …)`. La imagen mantiene la relación original 1536:1024 (3:2), con altura automática; el pie editorial y la atribución quedan en el flujo bajo la fotografía. La composición se apila a partir de 900 px.

## Verificación

- Navegador de escritorio: figura de 661 px de ancho; fotografía de 659×439 px aproximadamente. No invade el texto.
- Marcos de 320, 390, 768 y 1024 px, con anchos útiles de 305, 375, 753 y 1009 px por sus barras de desplazamiento: relación 3:2 conservada en todos, sin solapamiento de imagen y texto, ni entre fotografía, leyenda y atribución.
- Inspección de las imágenes renderizadas y de los anchos de las secciones: sin desbordamientos del contenido. Los anillos decorativos de cierre exceden su contenedor intencionalmente y permanecen recortados por este.
- Ampliar y cerrar imagen: proporción original conservada en el diálogo.
- Cambiar reto de mentoría en escritorio y móvil: contenido actualizado, controles dentro de su tarjeta.
- Sin errores de consola de la página durante la revisión.
- `node scripts/verify-checkout.cjs`: rutas y estados de pago, cuatro URL inseguras rechazadas, ocho scripts válidos, exportación idéntica.
- `node scripts/verify-live-examples.cjs`: doce combinaciones de caso/herramienta y sus verificaciones existentes superadas.

El motor de diagnóstico y la configuración comercial no cambian en esta revisión. La inspección es representativa de los tamaños y estados enumerados, no una garantía de ausencia de defectos en todo navegador.
