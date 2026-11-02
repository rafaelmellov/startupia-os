# Startupia AI: ejecución verificable

La IA de servidor usa la API oficial Responses mediante HTTPS. No se sustituye una consulta fallida o no configurada por una respuesta prefabricada. La interfaz se presenta como Startupia AI. El motor opcional del dispositivo sigue disponible por elección explícita y no se descarga al abrir la aplicación.

## Configuración y disponibilidad

Sólo el servidor lee `OPENAI_API_KEY`. El modelo se selecciona mediante `OPENAI_MODEL_BUILD` y `OPENAI_MODEL_GROWTH`; `OPENAI_MODEL` funciona como alternativa de configuración para ambos. No hay un modelo inventado ni un modelo seleccionable desde el cuerpo de la solicitud. Deben configurarse identificadores disponibles para el proyecto y verificarse con una credencial válida antes de declarar la conexión probada.

`GET /api/ai/status` distingue `configured_unverified` de `unconfigured`. La presencia de variables no demuestra una llamada satisfactoria. No expone credenciales. La validación de esta entrega usa pruebas aisladas; la primera llamada real requiere una credencial segura disponible y autorizada. Las respuestas y las propuestas fallidas no se presentan como ejecuciones completas.

## Acceso, límites y coste

Las rutas específicas `/api/ai`, `/api/ai/status` y `/api/ai/actions` verifican identidad y la suscripción desde el servidor. Una redirección de Checkout o una preferencia de plan no habilitan acceso. Se exige suscripción activa, identificador del proveedor, vigencia y periodo de pago verificado. BUILD cuesta USD 17/mes y GROWTH USD 37/mes; el precio no determina por sí solo el acceso.

Los límites operativos iniciales definidos en el helper de permisos son 10 ejecuciones diarias por organización y 1.800 tokens de salida para BUILD; 60 y 3.600 para GROWTH. El contexto documental seleccionado admite respectivamente 6.500 y 14.000 caracteres. Las propuestas de IA contienen como máximo 6 o 12 operaciones. La reserva de ejecución es atómica en base de datos y consume un intento incluso si el proveedor falla; así se evita un bucle de reintentos gratuitos. Los fallos y tokens se registran sin almacenar la clave ni copiar el prompt en analítica. No se ofrece consumo ilimitado.

## Contexto, fuentes y resultados

Antes de consultar, el cliente espera la confirmación del guardado de su contexto. El servidor vuelve a leer únicamente el workspace de la organización autorizada. Incluye perfil, registros seleccionados, conversación reciente y texto de documentos guardados con límites. Los documentos son datos no confiables y no pueden cambiar instrucciones ni dar permisos. Los enlaces aportados no se consideran páginas leídas.

La investigación opcional consulta fuentes públicas fijas (Wikipedia y Crossref) y devuelve URL, fragmento y fecha de recuperación. No equivale a navegación web general ni verificación editorial. Si las fuentes no están disponibles, la IA recibe esa limitación; no se generan citas inexistentes. El informe se construye en el servidor a partir de la versión concreta del workspace utilizada para responder y conserva esa procedencia.

La respuesta se transmite conforme llegan deltas reales. El cliente no simula una respuesta remota con una animación de escritura. Sólo un evento completo crea un informe final; cancelaciones, negativas, límites o interrupciones se identifican como tales y cualquier texto parcial no recibe estado de resultado completo. La solicitud tiene un máximo de 60 segundos y se cancela al detenerla desde la interfaz.

## Acciones con efectos reales

El modelo sólo puede llamar a `propose_workspace_changes`, una función con esquema estricto. Esta función prepara datos; no dispone de SQL, claves, correo, comandos, redes arbitrarias ni integraciones implícitas. El servidor valida intención explícita, tipo de registro, campos, IDs, tamaños, fechas, número de operaciones y permisos. Crear, editar o archivar requiere una instrucción compatible; no se toma el contenido de un archivo como autorización.

Cada propuesta se previsualiza antes de aplicarla. El botón de aplicar envía una confirmación explícita a `/api/ai/actions`. El servidor verifica nuevamente pago, versión y huellas de los registros, ejecuta el mismo motor validado y guarda mediante comparación de versión atómica. Sólo entonces responde con un recibo de cambios reales. Un reintento de una acción ya registrada devuelve su recibo y no duplica cambios. Los conflictos conservan las ediciones locales y requieren revisar el contexto. El historial permite deshacer mientras no haya cambios posteriores incompatibles.

Los documentos generados se guardan como páginas del workspace al confirmar una propuesta. Exportar o crear tareas desde informes reutiliza las funciones reales de documentos y registros. No se afirma haber enviado mensajes, publicado contenido o ejecutado operaciones externas que no estén disponibles.

## Pruebas y límites pendientes

`tests/ai-next.test.mjs` cubre validación de solicitudes, selección de modelo por plan, propuestas sin mutación, aplicación/repetición/conflictos, datos de métricas, límites, operaciones no solicitadas, contexto documental guardado, negativas y Responses incompletas, además de SSE fragmentado y UTF-8. `tests/ai-server.test.mjs` ejecuta los handlers reales con identidad, base de datos y proveedor aislados: denegación sin pago/origen válido, falta de configuración, presupuestos, cuota, streaming e interrupciones, y confirmación/guardado/repetición de acciones. Estas pruebas no hacen llamadas de pago.

Los flujos reales de proveedor, identidad, pago y cuotas requieren entorno configurado y pruebas integrales con una cuenta de prueba antes de habilitar cobros reales. La investigación está limitada a las fuentes descritas y el modelo sólo realiza las operaciones de workspace admitidas. No se declara la plataforma completa ni una integración externa probada basándose en estas pruebas aisladas.

Documentación primaria consultada: [Responses y herramientas](https://developers.openai.com/api/docs/guides/function-calling), [streaming](https://developers.openai.com/api/docs/guides/streaming-responses) y [generación de texto](https://developers.openai.com/api/docs/guides/text).
