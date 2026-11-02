# Comprobación de la revisión 8.0

## Fallo reproducido y corregido

En la versión anterior, activar «Pausar movimiento» y abrir otra escena dejaba `.work-content` con `opacity: 0.2` y `animation-play-state: paused`. Después de la corrección, las cinco escenas conservan opacidad 1 tanto en su contenido como en el resultado. La pausa ya no congela una entrada que hace invisible la información.

## Navegador

- Cinco escenas mediante Home, End y flechas; selección mantenida entre llamadas y cambios por scroll al retomar navegación vertical.
- Hover activado por movimiento real, evitando cambios por la redistribución de paneles bajo un cursor quieto.
- Anchos 320, 390, 768 y 1280 px, con altura 650 px. Ancho desplazable de la página igual a su ancho disponible. El desplazamiento horizontal de tarjetas móviles es intencional.
- Contenido opaco y resultados dentro del panel. Se corrigieron los recortes transitorios encontrados en tablet y escritorio bajo; la última comprobación de las cinco escenas de escritorio registra cero desbordamiento inferior durante su apertura.
- Formulario: apertura, cierre y campos obligatorios siguen funcionando. Nombre válido y foco de email activan las variantes S8 de validación y foco. Contacto vacío permanece inválido; no se envía solicitud.
- Guía de ejecución: selección del tercer paso sigue mostrando 03/07. Movimiento reducido deja cero animaciones activas en la capa integrada.
- Sin errores propios observados en la consola y sin errores de la capa de movimiento registrados. La captura final muestra las tarjetas con el movimiento pausado.

## Fuente y entrega

Cinco scripts pasan `node --check`. IDs estáticos únicos, anclas válidas y catálogo con 220 IDs únicos (108 conservados y 112 nuevos). No se añade Startupia Academy. HTML descargable idéntico al publicado, con recursos incrustados. El archivo temporal de revisión adaptable no se publica.

Son comprobaciones representativas en Chromium, no una garantía de ausencia absoluta de errores ni una certificación de compatibilidad universal. Se mantienen los límites descritos en README: la guía es explicativa y las interacciones locales no conectan IA, pagos ni recepción de solicitudes.
