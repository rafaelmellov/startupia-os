# Movimiento de Startupia

La ampliación añade cinco canales a las superficies interactivas del recorrido completo:

1. Luz que sigue el puntero dentro de la superficie.
2. Elevación y halo al explorar una acción.
3. Compresión breve al pulsar y foco visible al usar teclado.
4. Anillo y cinco partículas acotadas para confirmar la interacción.
5. Entrada progresiva de elementos y transición entre vistas.

Se conservan los sistemas de movimiento anteriores, incluidos el escenario de marca y las 320 variantes del workspace. Cinco canales adicionales no equivalen a medir cinco veces más keyframes ni cinco veces más efectos simultáneos.

El motor compartido se encuentra en `public/motion-v5.js` y `public/motion-v5.css`. Usa delegación de eventos, IntersectionObserver y animaciones de corta duración. Limita la cantidad de partículas activas, elimina sus nodos y cancela animaciones al ocultarse la página.

La preferencia reducida del sistema tiene prioridad. También hay un control visible en todas las vistas y una preferencia del workspace. La reducción desactiva las transiciones de la experiencia anterior mediante `html.reduce-motion`, además de los efectos nuevos. La interfaz sigue siendo utilizable con teclado y en dispositivos sin hover.

Verificado en navegador: cambio de preferencia, clase global de reducción, formulario, navegación y vistas de 375 píxeles útiles dentro de marcos de 390 píxeles.
