# Revisión 7.0 — 22 de octubre de 2026

## Cambios comprobados

- Guía inicial de siete pasos: selección de cada paso y su tercera acción; también acciones primera/segunda, anterior/siguiente, Home/End y cambio de foco con teclado. Cuatro agentes con su entrada, proceso y resultados diferenciados.
- Reproducción opcional: avance observado de 01 a 03; selección manual la detiene. El control de reducir movimiento cambia inmediatamente la reproducción a detenida. Cambio de caso vuelve al inicio con el contexto correcto.
- Enlace de un paso al MVP y apertura de su explicación; propuesta local con formato, funcionalidades elegidas/excluidas y plan de validación.
- Creación de tarea, contador incrementado y búsqueda que devuelve la tarea creada. El editor valida y se cierra tras guardar.
- Diez vistas revisadas a 320 px: ancho del panel igual a su ancho desplazable en todas. Guía revisada también a 390 y 768 px. Las tiras de pasos y navegación tienen desplazamiento local intencional.
- Ilustración de resultado de tablet: tras la corrección, borde inferior dentro del panel (365 px de alto). Contador móvil igual a la tarjeta más cercana al centro tras cambiar de escena; alternativa Enter avanza a la siguiente.
- Isotipo: giro Y cambia de 0° a 49,47° al bajar media pantalla, sin arrastre.
- Cuestionario: elección inicial avanza a la etapa. Formulario de mentoría: apertura, campos y cierre. Chat: giro/carga y respuesta local completa explicando Operators como agentes de IA.
- Exportación descargada y analizada como JSON válido. Identifica «Guía de ejecución de Startupia. Caso ilustrativo.» y contiene los datos de Mesa Clara al seleccionar ese caso.
- Sin errores propios observados en la consola; se excluyen avisos de la extensión del navegador. Imágenes con src cargadas; el único elemento img sin recurso es un elemento oculto de arrastre.

## Comprobaciones estáticas

Cinco scripts JavaScript pasan `node --check`. IDs estáticos únicos y destinos de anclas válidos. No se incluye Startupia Academy. El catálogo contiene 108 IDs únicos y el DOM identifica la capa con `data-motion-v7="108"`. HTML exportado idéntico al publicado.

## Límites de la revisión

Pruebas funcionales representativas y revisión visual en Chromium; no constituye certificación de accesibilidad, compatibilidad con todos los navegadores o rendimiento. Las interacciones que no cambiaron conservan la implementación de 6.0 y sus comprobaciones documentadas en el historial. No hay backend de IA, recepción de solicitudes ni pagos desplegado que pueda verificarse.
