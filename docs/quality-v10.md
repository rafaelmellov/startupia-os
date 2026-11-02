# Comprobación de la revisión 10.0

## Funcionalidad comprobada

- Navegador de escritorio: cuatro escenas de producto, selección de etapas, reproducción y fin automático en la tercera etapa. MVP distingue funciones esenciales y pospuestas. Manager cambia el estado y la presentación de la tarea.
- Dashboard: selección de agentes y las tres acciones del proceso. En móvil se recorrieron los siete pasos y su tercera acción; el ancho del escenario y el ancho desplazable coinciden en todos los casos revisados.
- Selección directa de Growth y Build sin cuestionario. El panel muestra el nombre y precio correctos, aviso de enlace pendiente, vuelta a los planes y cierre.
- Resumen gráfico del diagnóstico: ocho indicadores; cada uno abre el análisis correspondiente. La cuarta semana muestra su acción correcta. Las interpretaciones completas y la descarga se conservan.
- Página revisada en contenedores de 320, 390 y 768 px sin desbordamiento horizontal. Diagnóstico y revisión de plan de 320 px: ancho desplazable igual al ancho disponible.
- Se corrigió la estrechez de la tarea del tablero móvil: estados en una fila y tarjeta de tarea a todo el ancho. Se compactaron el encabezado y los controles del dossier móvil.
- Movimiento reducido: el ejemplo avanza manualmente, con `animation-name: none`. Los temporizadores comprueban esa preferencia y se detienen al salir de la sección o cambiar de pestaña.
- Registros observados: cero errores propios de la página; se excluyen los mensajes de la extensión del navegador.

## Comprobaciones de fuente

`node scripts/verify-checkout.cjs` comprueba el acceso directo a enlaces HTTPS configurados, la selección local cuando falta el enlace, el rechazo de cuatro formatos inseguros o inválidos, los siete scripts y la igualdad del HTML publicado y descargable. Usa destinos de ejemplo dentro de un sandbox de Node, sin visitar ni efectuar transacciones.

El motor del diagnóstico es idéntico al de la revisión 9, donde se verificaron 65.536 perfiles y 262.144 casos de recomendación. No se repitieron esos cálculos porque esta revisión modifica presentación y acceso al checkout, no el análisis.

Las comprobaciones son representativas, no una garantía universal de ausencia de errores. Los cobros reales quedan pendientes de los enlaces oficiales, tal como se eligió en esta solicitud. Se mantienen los límites de IA y recepción de solicitudes descritos en README.
