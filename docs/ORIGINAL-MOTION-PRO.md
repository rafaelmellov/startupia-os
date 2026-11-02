# Startupia — evolución de la landing original

## Base y contenido conservados

El archivo adjunto `Startupia (4).html` contiene520bytes y una redirección a la landing original. No contiene el prototipo de41KB descrito por el README adjunto. Se recuperó la fuente íntegra de la landing oficial desde el commit local `1b97a95`, conservando la copia original fuera del directorio de publicación. Su SHA-256 es `a510921804b6fd84fede1ea9435e07fe6e3237dfd63e877bdb752c70e742eea7`.

La fuente recuperada conserva todos los bloques empresariales: hero, Pathfinder, evidencia con sus fuentes y límites, etapas, contexto compartido, recorrido de herramientas, Digital Creator, guía del OS, tablero ilustrativo, Mentors, Academy como fase futura, planes, comparación, preguntas y cierre. BUILD permanece en USD17/mes; GROWTH en USD37/mes; Mentors conserva su referencia de USD197/hora. No se ha creado Academy ni se ha cambiado su condición futura.

`experience/original-landing.html` conserva la base sin la nueva capa de movimiento, con los recursos embebidos externalizados sin alterar sus bytes. `experience/landing.html` es la versión activa. El informe `original-content-preservation.json` registra la igualdad de770 fragmentos de texto originales y su orden. La prueba automatizada también comprueba los scripts funcionales conservados. Los nombres, descripciones, condiciones y capacidades comerciales no se reescribieron.

## Intervención visual

La nueva capa está separada en `public/original-motion-pro.css` y `public/original-motion-pro.js`. Se retiraron motores decorativos solapados de la copia original; se conservaron los scripts de diagnóstico, escenas, mapa, demostraciones, taller, formularios y guía local. Esto evita añadir otra biblioteca que compita por los mismos eventos.

| Recurso | Implementación y finalidad |
|---|---|
| Transición cromática | Una escena entre el hero y la evidencia evoluciona de fondo oscuro a azul y blanco según la posición del documento. El degradado se desplaza e interpola visualmente; el resto conserva superficies sólidas. |
| Desplazamiento diagonal | Las capas decorativas se mueven en ambos ejes dentro de la escena. No se modifica la posición del scroll ni se intercepta la rueda. |
| Reveal | Aparición acotada de encabezados y grupos con un observador de intersección. La información sigue disponible sin el efecto. |
| Partículas | Canvas original de40puntos en móvil y88en escritorio, con resolución limitada,30fps aproximados y pausa fuera del hero o con pestaña oculta. Reacción pequeña al puntero preciso. |
| Vidrio y metal | Precios translúcidos con desenfoque moderado y reflejo localizado; perspectiva limitada. Es una aproximación de material con CSS, no refracción óptica o simulación física de fluidos. |
| Botón líquido | Deformación pequeña del contorno y reflejo al interactuar; el texto permanece legible. |
| Revelación de puntero | Trama decorativa en herramientas, también disponible con foco. No se ocultan descripciones o acciones necesarias. |
| Tipografía cinética | Desplazamiento vertical pequeño del título ligado a la lectura; no se cambian sus palabras. |
| Split-flap | Giro breve del indicador de escena existente cuando cambia su valor real. No representa una métrica empresarial inventada. |
| Vídeo expansivo | Película original de identidad, silenciosa,9segundos,1280×720, con controles reales. Apertura voluntaria, sin autoplay; cierre con Escape, pausa y retorno de foco. Botón de pantalla completa sujeto al soporte del navegador. |
| Profundidad | Se conserva el isotipo original de vidrio y sus órbitas; capas, perspectiva y trama de puntos propias. No se copiaron recursos de otras marcas. |

Las estéticas de cómic, VHS, pixel, art déco y otras referencias no se superponen indiscriminadamente. Se conserva un lenguaje espacial y editorial de Startupia. Las páginas de trabajo mantienen radios discretos, iconos vectoriales, superficies claras u oscuras funcionales y transiciones cortas. Los degradados se reservan para una transición y materiales concretos.

## Referencias inspeccionadas

Se revisó [United Carriers](https://unitedcarriers.com/) en navegador: hero espacial, gran escala tipográfica, transición desde escena oscura a una sección clara y movimiento ligado al recorrido. Se observó específicamente el tramo de azul a blanco solicitado. La implementación de Startupia utiliza su propio código y recursos; no reproduce el globo, imágenes, textos o código de esa empresa.

[Wearebrand](https://wearebrand.io/) se consultó como referencia de composición e identidad. `https://pear.no/pero` no respondió mediante la consulta web disponible; no se atribuyen efectos concretos a esa ruta inaccesible.

## Pruebas de esta revisión

- Igualdad de los770fragmentos originales; secciones y scripts funcionales retenidos; precios17/37 y recursos reales del vídeo comprobados automáticamente.
- Las22suites existentes y TypeScript pasan; la nueva suite de conservación también pasa. Compilación Next completada.
- Navegador real:1280px y390px; comprobación adicional sin desbordamiento a320,768y1440px.
- Etapas de startup, avance de escenas y actualización real de la vista previa de Digital Creator probados.
- Vídeo MP4 reconocido con duración9s; reproducción con control de teclado, cierre/Escape, pausa y retorno de foco comprobados. Sin autoplay.
- Control de movimiento reducido comprobado: título sin transformación y escena cromática abreviada. La regla del sistema está implementada; no se modificó la preferencia global del equipo para simularla.
- Diagnóstico original abre su diálogo; no se enviaron datos personales ni solicitudes comerciales durante la revisión.
- No se observaron errores de consola en la revisión local. Esta comprobación no constituye una auditoría WCAG completa ni una medición de rendimiento con usuarios.

## Integración y límites

Las llamadas a planes conservan el recorrido real hacia checkout y la identidad del mismo sistema. El acceso de pago, la persistencia y la IA se sirven desde la aplicación existente. Los ejemplos de la landing siguen explícitamente rotulados como locales o ilustrativos: restaurarlos no los convierte en llamadas de IA ni en acciones ejecutadas en una startup real.

La versión anterior se publicó mediante Sites como versión3. Esta actualización debe registrar su nuevo resultado de publicación antes de presentarse como desplegada. Los ZIP y las copias HTML deben regenerarse con esta fuente, conservando el aviso de que un archivo HTML de revisión no sustituye el servidor autenticado.

Siguen pendientes la credencial/modelo de IA, el ciclo externo de pagos de prueba, configuración de correo y un endpoint público de webhook adecuado. La audiencia de Sites se conserva privada para su propietario. El desarrollo de esta revisión visual no acredita esas integraciones pendientes ni habilita cobros reales.
