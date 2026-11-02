# Revisión 14

## Cambios

- Quinta herramienta en galería, navegación con flechas y Home/End, guía del workspace, enlace desde el mapa, FAQ y guía local del chat. No se cambia la tarifa de OS ni se asigna un plan sin definición comercial. La mentoría conserva el CTA gratuito sin precio.
- Taller con tres formatos, tres colores, campos de nombre y propuesta, tres secciones opcionales, vistas de producto/estructura/lanzamiento y ancho de preview. Generación por plantillas locales, sin llamadas a IA.
- SaaS: tareas añadibles y completables. Tienda: carrito y total local. Web: formulario validado sin envío. Navegación interior interceptada para no cargar la landing dentro del iframe.
- Exportación como HTML autónomo mediante enlace Blob con atributo download. Texto escapado, paleta permitida, iframe sin acceso al origen padre y CSP sin conexiones o envíos de red.
- 312 presets nuevos: 13 familias de feedback y 24 variantes parametrizadas por familia. No son 312 efectos simultáneos ni 312 conceptos visuales distintos. Se conservan los 220 presets del motor previo sin modificarlo. El motor adicional se limita a seis capas, no mueve el contenido, cancela al ocultar página o reducir movimiento y limpia sus capas al terminar.
- Tarjetas de investigación más breves, con base y año a la vista, proporciones exactas en sus barras y contexto accesible. Fuentes en research-v14.md.

## Verificación

- Navegador: selección de quinto módulo, contador 05/05, avance por teclado hasta 01/05 y acceso al taller; vista Digital Creator del workspace.
- Carrito actualizado, tareas añadidas y completadas, nombre/color/secciones personalizados. Navegación interior mantiene el producto en su visor.
- Marcos de 320, 390, 768 y 1024 px: sin desbordamientos en los bloques del taller y la investigación. Fotografía de mentoría mantiene 3:2. Galería de escritorio: cinco tarjetas de 234 px y altura común de 309 px, sin texto desbordado.
- Reducción de movimiento: presets nuevos activos = 0 y capas adicionales = 0; motor anterior conserva sus contadores 108 y 112.
- Sin errores de consola de la página en la última revisión. Se corrigió el escape de etiquetas de cierre en plantillas para que la recarga de la vista previa no inyecte código dentro del generador.
- IDs únicos, exportación igual a dist/index.html, motor anterior intacto.
- verify-creator.cjs: 72 combinaciones de tipo, color y módulos, texto malicioso escapado, configuración no admitida normalizada, scripts exportados sintácticamente válidos y 312 presets registrados.
- verify-live-examples.cjs amplía la regresión a 15 combinaciones de caso y herramienta. Las comprobaciones de pago y diagnóstico se ejecutan al empaquetar.

## Límites

La demo no genera productos con IA en vivo ni conecta usuarios, bases de datos, pagos o publicación comercial. La agenda de mentoría y los enlaces de checkout siguen sujetos a su configuración existente. No se obtuvo un evento verificable de recepción de descarga en el navegador de QA: se comprobaron el enlace Blob, su atributo download y el contenido generado, pero no se afirma haber recibido el archivo en ese navegador.

Las pruebas cubren los escenarios enumerados; no constituyen una garantía de ausencia de defectos en todo navegador.
