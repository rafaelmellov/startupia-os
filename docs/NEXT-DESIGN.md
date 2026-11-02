# Startupia OS — dirección espacial y narrativa

## Implementación de esta fase

`experience/landing.html`, `public/next-landing.css` y `public/next-landing.js`. La landing se sirve como HTML completo y no depende del router de cliente para navegar. El propietario del despliegue debe regenerar `lib/experience-html.ts` mediante el script existente antes de construir.

La marca conserva logotipo e isotipo originales, azul/cyan, fondo oscuro y el eslogan exacto «Piensa en grande. Empieza inteligente.». No se sustituyó la marca por un símbolo generado. Se reutilizan las fuentes locales existentes con sus licencias. El vídeo original está acotado a580281bytes y se carga al abrir el reproductor. No hay librería de animación, fuente remota, imagen copiada de una referencia ni descarga de un modelo al entrar en la landing.

## Composición

1. **Hero / ambición en órbita.** Titular completo legible, CTA Build y exploración. Isotipo original con anillos en perspectiva, capas de contexto y un campo de estrellas Canvas. El fondo responde suavemente al puntero de dispositivos precisos; no intercepta el scroll.
2. **Manifiesto.** Explica el problema de perder contexto, sin métricas de mercado no verificadas.
3. **Película de marca.** Clip original de9segundos sin audio, portada local y expansión a un reproductor real. Se carga al abrir y se reproduce mediante el control del visitante. Una capa diagonal se desplaza de forma acotada y reversible según el scroll vertical nativo.
4. **Un mismo universo.** Consola accesible de cinco módulos. Cambia la explicación, el mapa conceptual, las referencias de entrada/salida y el destino real. Está rotulada como representación del sistema, no como actividad real de una cuenta.
5. **Método.** Tres pasos: definir contexto, comprobar una hipótesis, registrar evidencia. Cada uno conduce a información o un plan real.
6. **Primer enfoque.** Orientación local de tres preguntas. No usa IA, no confirma demanda y no presenta resultados como acciones ejecutadas. El texto se incorpora con `textContent`, sin HTML, red ni almacenamiento.
7. **Planes.** Build USD17/mes y Growth USD37/mes, frecuencia y moneda visibles. Oferta de lanzamiento sin precio anterior, contador, cupo, testimonios ni descuento inventados. La activación depende de la comprobación de suscripción.
8. **Perspectiva humana, preguntas y cierre.** Mentorías separadas y coordinación confirmada; FAQ nativa; una acción primaria para continuar.

## Referencias analizadas

- [United Carriers](https://unitedcarriers.com/): progresión de un viaje y capítulos con una idea principal por bloque.
- [Wearebrand](https://wearebrand.io/): profundidad y superposición de piezas visuales alrededor de una narrativa.
- [Pear](https://pear.no/): tipografía, capítulos y términos explicados junto a la propuesta de valor.

La implementación es original. Las referencias orientan principios de composición; sus textos, imágenes, gráficos, productos y afirmaciones no se reutilizan. El análisis visual completo de su movimiento en navegador no se presenta como verificado por esta subtarea: la inspección de las referencias se hizo mediante fuentes web, y la revisión del navegador corresponde al agente propietario.

## Movimiento real y límites

Se conservan las **320 variantes de superficie/evento del OS existente** (80 superficies × hover/focus/press/return, inventario anterior). Son variantes de interacción, no 320 animaciones visualmente independientes. Esta landing añade los siguientes34 comportamientos; no se cuentan cambios de color como efectos distintos ni se afirma que todos se ejecuten simultáneamente:

| ID | Disparador / propósito | Implementación |
|---|---|---|
| L01 | Entrada del contenido principal | `hero-arrive`, 1s una vez |
| L02 | Entrada del mapa orbital | `orbit-arrive`, 1.5s una vez |
| L03 | Profundidad del isotipo | `star-float`, ±12px y 4° |
| L04 | Respiración del anillo vertical | `ring-breathe`, variación limitada |
| L05 | Puntero preciso sobre el hero | Fondo y capas con interpolación amortiguada |
| L06 | Puntero sale del hero | Retorno amortiguado al centro |
| L07 | Campo de estrellas visible | Brillo sutil, máximo30fps,88/40 puntos |
| L08 | Hero sale del viewport | Suspende Canvas y animación ambiente |
| L09 | Pestaña pierde visibilidad | Cancela requestAnimationFrame |
| L10 | Contenido entra en viewport | Reveal una vez, sin scroll secuestrado |
| L11 | Progreso de lectura | Línea transformada según posición real |
| L12 | Sección entra en zona de lectura | Actualiza el contexto activo de navegación |
| L13 | Hover en destino de navegación | Subrayado que muestra el enlace apuntado |
| L14 | Hover en CTA | Desplazamiento de flecha y elevación limitada |
| L15 | Presión en CTA | Descenso breve; regreso al soltar |
| L16 | Foco por teclado | Contorno visible, sin depender del hover |
| L17 | Abrir/cerrar menú móvil | Icono cambia a cierre y disclosure real |
| L18 | Selección de módulo | Indicador, descripción, mapa y destino sincronizados |
| L19 | Cambio de panel | Fundido/desplazamiento de5px,280ms |
| L20 | Método entra en vista | Línea conecta los tres pasos una vez |
| L21 | Respuesta a un campo válido | Progreso0–3 basado en respuestas reales |
| L22 | Envío válido del enfoque | Reemplazo del formulario por orientación con foco |
| L23 | Revisión de respuestas | Restablece formulario y foco preservando entradas |
| L24 | Abrir FAQ | Disclosure nativo y aparición breve del contenido |
| L25 | Primera lectura del titular | Dos líneas se descubren con máscara tipográfica una sola vez |
| L26 | Scroll en la película | Pista diagonal ligada a posición real; reversible y acotada |
| L27 | Aproximación al clip | Portada se amplía hasta4%, sin modificar el scroll |
| L28 | Puntero preciso / foco del clip | Reflejo localizado; foco revela el mismo acento sin esconder contenido |
| L29 | Hover / foco de CTA | Relleno orgánico recortado dentro del botón, sin deformar el texto |
| L30 | Hover / foco dentro de un plan | Superficie líquida y reflexión de metal/vidrio solo en el precio |
| L31 | Selección de módulo | Readout split-flap muestra el módulo seleccionado; letras decorativas para lector de pantalla |
| L32 | Hover / foco en método | Separación acotada de planos y registros de evidencia, sin barras de métricas ficticias |
| L33 | Abrir/cerrar película | Diálogo nativo, expansión breve, controles de reproducción reales, Escape y foco restaurado |
| L34 | Cerrar / ocultar película | Pausa real del vídeo; no reanuda automáticamente |

Los34 comportamientos se documentan como casos funcionales; algunos comparten curvas y técnicas. La suma354 describe el inventario OS+landing, no una medición de diversidad perceptual ni una promesa de rendimiento. La QA debe confirmar los selectores y estados del inventario global antes de anunciar cualquier cifra comercial.

### Salvaguardas

- `prefers-reduced-motion` tiene prioridad; el control al pie conserva preferencia local y es compatible con la clave usada por el OS.
- El campo Canvas usa DPR máximo1.5 y30fps;40 puntos en móvil,88 en escritorio. Se detiene fuera del hero, en pestaña oculta y al salir de página.
- Interacciones principales, textos, enlaces y FAQ funcionan sin animación. Sin JavaScript permanecen disponibles el contenido, los planes, la cuenta y la ayuda; el mapa y la orientación local lo indican en `noscript`.
- No se importa `motion-v5.js` ni `landing-journey.js` en esta landing, para evitar listeners duplicados o reescritura de CTA.
- El menú es un disclosure inline, no un modal que bloquee la página. Escape cierra y devuelve el foco; los tabs soportan flechas, Home y End.
- Ningún elemento usa `transition:all`, temporizadores de urgencia, seguimiento del puntero en móvil ni contenido privado dentro del fondo.

## Peso medido y verificación

Antes: HTML acumulado2,462,413bytes. Ahora: HTML23601bytes + CSS/JS externos. Los tamaños de esta fase deben verificarse de nuevo después de cualquier edición del propietario. La reducción del HTML no equivale por sí sola a un resultado Lighthouse o a una métrica de red de producción.

Realizado en esta subtarea: sintaxis JavaScript con `node --check`, contratos HTML/activos/enlaces y revisión estática de privacidad del formulario. La orientación se habilita solo después de instalar sus controles; sin JavaScript no expone un envío HTML predeterminado y ofrece un enlace a planes.

### QA de navegador ejecutada

Chrome local aislado, sin instalar dependencias ni acceder a una cuenta: vista de escritorio1440×1000 y móvil390×844. Pasaron16 grupos de comprobaciones: documento y eslogan, activos/etiquetas/sin overflow, tabs por flechas/Home/End, validación de espacios, texto HTML mostrado literal, foco/restablecimiento de respuestas, tres rutas de recomendación, FAQ por teclado, Canvas activo y pausa al salir del hero, movimiento reducido manual y persistente, menú/Escape/foco, prioridad de la preferencia del sistema y ausencia de errores o solicitudes externas. Además se verificó ausencia de overflow en320,768 y1024px y la alternativa sin JavaScript: formulario local inaccesible, explicación y enlace a planes visibles, CTA y FAQ nativa funcionales.

Capturas: `audit/evidence/next-landing-desktop.png` y `audit/evidence/next-landing-mobile.png` (respecto al workspace superior). Registros: `audit/evidence/next-landing-qa.json` y `audit/evidence/next-landing-extra-qa.json`. Capturas adicionales de consola y precios: `audit/evidence/next-landing-desktop-system.png` y `audit/evidence/next-landing-desktop-plans.png`. Las capturas fueron revisadas visualmente. Esta revisión no equivale a una auditoría WCAG completa, medición de rendimiento con usuarios o prueba de la facturación/IA del producto. La pausa por visibilidad de pestaña está implementada y revisada estáticamente; se midió la pausa al abandonar el hero.

### QA para el propietario

1. Abrir desktop y390px: slogan completo, sin overflow horizontal y con texto legible.
2. Tabular: skip link, navegación, CTA, módulos, formulario y FAQ; foco visible.
3. Tabs: flechas/Home/End cambian selección, contexto y enlace; solo el seleccionado entra en el orden de tabulación.
4. Enfoque:3 rutas por etapa; campos vacíos o espacios se rechazan; texto con etiquetas HTML se muestra literal; revisión preserva entradas.
5. Movimiento reducido: preferencia del sistema y control local; Canvas deja de dibujar, contenido revelado permanece visible.
6. Canvas: pestaña oculta y hero fuera de vista detienen RAF; volver reanuda una sola cadena.
7. Enlaces: Build/Growth llegan al checkout correcto; módulos llevan a destinos existentes; Mentors y ayuda funcionan.
8. Confirmar que no existen errores de consola, saltos de layout relevantes ni demandas de red a terceros desde el diagnóstico.

## Ampliación editorial — 1 de noviembre de2026

Se eligió un único lenguaje oscuro, editorial y cyan. El titular utiliza un acento plano, el cierre se alinea a la izquierda y las superficies principales conservan radios pequeños. El metal/vidrio queda localizado en precios; el reflejo luminoso queda localizado en la película. No se mezclan estilos retro, no se añadieron tarjetas dentro de tarjetas ni gráficas de rendimiento sin datos. Los iconos de los módulos son SVG lineales. La perspectiva3D se construye con CSS; no se anuncia como un motor WebGL ni como una simulación física de líquido.

El scroll no se intercepta: rueda, touch y teclado siguen moviendo el documento. Solo se transforman capas decorativas. El contenido importante siempre es visible con foco/touch; ninguna propuesta o prestación se oculta tras un efecto de puntero. El control de movimiento detiene tipografía cinética, split-flap y expansión ligada al scroll. El vídeo requiere abrir el diálogo y después iniciar reproducción; sin autoplay, sin audio y con controles nativos. Sin JavaScript, su enlace lleva al MP4 real.

El clip original y su fuente son responsabilidad del agente propietario: `public/media/startupia-orbit.mp4`, `public/media/startupia-orbit-poster.jpg` y `creative/brand-film.html`. El reproductor utiliza diálogo nativo con nombre, descripción, cierre visible, Escape, modalidad, devolución de foco y pausa al cerrar/ocultar la página. No se presenta la película como una demostración de operaciones de una cuenta.

## QA final y fuente congelada — 2 de noviembre de2026

Pasaron **30 grupos de comprobaciones en Chrome local**: los16 anteriores y14 correspondientes a efectos/película. El único defecto detectado en esta ampliación fue el desbordamiento de la elipse decorativa de precios al apilar los planes en320px; se retiró esa decoración en móvil. La verificación final no encontró overflow en320,390,768,1024 y1440px.

Se verificaron reproducción y decodificación del MP4 real1280×720 de9segundos, carga diferida sin autoplay, controles nativos, modalidad que bloquea el foco del fondo, cierre visible, Escape, foco restaurado y pausa al cerrar/ocultar. También pasaron el progreso diagonal reversible sin interceptar scroll, reflejo disponible con foco, readout split-flap vinculado al módulo y eliminación del movimiento al activar la preferencia reducida. No hubo errores de página/consola ni solicitudes externas.

Registros finales en el workspace superior: `audit/evidence/next-landing-qa.json` (14), `audit/evidence/next-landing-extra-qa.json` (2) y `audit/evidence/next-editorial-qa.json` (14). Capturas: `next-editorial-desktop.png`, `next-editorial-film.png`, `next-editorial-player.png`, `next-editorial-mobile-film.png` y `next-editorial-mobile-player.png` en esa misma carpeta. La pausa por visibilidad de la película se ejercitó con un evento sintético de página oculta, no con un cambio de pestaña del sistema operativo. Esto no equivale a una auditoría WCAG completa ni a una medición de rendimiento con usuarios reales.

`node --check public/next-landing.js` pasó y `lib/experience-html.ts` quedó regenerado con `scripts/generate-experience.mjs`. HTML/CSS/JS y helper quedan congelados para publicación. Sin cambios a pagos, autenticación o servicios en esta subtarea.
