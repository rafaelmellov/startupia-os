# Startupia OS — Manual integral del sistema y de la entrega

Documento de producto, arquitectura, operación y transferencia. Edición de trabajo: 1 de noviembre de 2026. Lema: **Piensa en grande. Empieza inteligente.**

Este manual explica qué contiene Startupia OS, cómo se conectan sus partes, cómo se opera de forma verificable y qué depende todavía de configuración o pruebas. El código entregado contiene funciones reales, pero una implementación no equivale automáticamente a un servicio publicado y operativo. Cada afirmación de disponibilidad debe contrastarse con el estado del entorno y con las pruebas correspondientes.

## 1. Cómo leer y utilizar la entrega

La entrega tiene tres propósitos complementarios: conservar el software modificable, revisar sus páginas y transferir el conocimiento necesario para mantenerlo. El archivo de código fuente es la base ejecutable del producto. Las copias HTML permiten revisar contenido y presentación sin acceder a cuentas. Este manual describe decisiones, contratos, límites, pruebas y operación.

Las páginas públicas se pueden exportar desde el servidor local sin iniciar sesión. Se identifican como copias de revisión y conservan un enlace hacia el sistema. Sus formularios de cuenta y pago no se presentan como servicios activos dentro de un archivo local. Las páginas privadas se entregan mediante portales HTML explicativos con rutas reales y navegación; no se fabrica un workspace con datos inventados para representar una cuenta autenticada.

El software usa componentes React, rutas de servidor, sesiones, una base de datos, almacenamiento privado y servicios externos. Abrir un HTML mediante doble clic no inicia ese conjunto. Para ejecutar la aplicación completa hay que instalar las dependencias, configurar el entorno y arrancar su servidor. Para publicar se necesita además un origen HTTPS, configuración de identidad, secretos de servidor y pruebas sobre esa URL.

La entrega distingue cuatro estados:

- **Implementado:** existe código que cumple el contrato descrito.
- **Probado de forma aislada:** pasó una prueba con datos controlados o proveedores sustituidos, sin acreditar una conexión externa real.
- **Probado en el entorno real:** existe evidencia de una operación satisfactoria sobre la infraestructura correspondiente.
- **Pendiente:** falta configuración, acceso, publicación o una verificación específica.

El estado debe aparecer cerca de la función que describe. Una clave presente no significa conexión probada; un pago iniciado no significa pago válido; un informe propuesto no significa documento guardado.

## 2. Concepto de producto y principios del sistema

Startupia OS es un espacio de trabajo empresarial para convertir una idea en decisiones, pruebas y ejecución. La unidad de contexto es la startup: su perfil, problema, público, modelo, etapa, registros, documentos y conversación. El objetivo es que ese conocimiento pueda reutilizarse en todas las herramientas autorizadas, evitando volver a explicar lo mismo en cada pantalla.

La landing explica la propuesta y conduce a un plan. Identidad crea una cuenta. La contratación relaciona esa cuenta con una suscripción. El onboarding estructura información empresarial. El workspace reúne la ejecución. Copilot y los operadores consultan el contexto guardado y pueden preparar cambios que se revisan antes de aplicarse. GROWTH amplía capacidad y ofrece un área de experimentos, métricas y clientes. Mentors recibe solicitudes de acompañamiento, con condiciones diferenciadas.

Las reglas que organizan el producto son continuidad de datos, permisos de servidor, estados comprensibles, resultados comprobables, privacidad y control del usuario. La marca visible es Startupia o Startupia OS. Los nombres de infraestructura pertenecen a la documentación técnica, a información legal o a los avisos necesarios del flujo de pago, no al relato principal de las herramientas.

La dirección visual combina fondos oscuros, azul y cyan, tipografía legible, isotipo original, profundidad espacial y una narrativa empresarial. El movimiento debe explicar relaciones o confirmar cambios. La intensidad visual no puede impedir leer, completar un formulario, utilizar el teclado o comprender qué ocurrió.

## 3. Los nueve entregables y sus rutas

Todas las rutas pertenecen a una aplicación coordinada. Los fragmentos después de `#` seleccionan módulos del workspace; no son aplicaciones independientes. Los parámetros de plan muestran una elección comercial y nunca otorgan permisos por sí solos.

| Entregable | Rutas principales | Qué contiene |
|---|---|---|
| 1. Landing | `/` | Propuesta de valor, narrativa del sistema, módulos, método, orientación local, planes, FAQ y acceso. |
| 2. Identidad | `/access`, `/login`, `/register`, `/check-email`, `/forgot-password`, `/reset-password`, `/auth/callback` | Inicio de sesión, registro, confirmación y recuperación. |
| 3. Contratación | `/pricing`, `/plans/build`, `/plans/growth`, `/checkout?plan=build`, `/checkout?plan=growth`, `/checkout/success`, `/checkout/canceled`, `/account` | Comparación, detalle, Checkout, resultado y gestión de suscripciones. |
| 4. Onboarding | `/onboarding` | Perfil inicial, contexto, objetivos y progreso persistente. |
| 5. BUILD | `/os` y módulos de navegación interna | Workspace, registros, documentos, proyectos, tareas, objetivos, calendario y herramientas esenciales. |
| 6. GROWTH | `/growth` | Área ampliada que comparte experimentos, métricas y clientes con el workspace y exige ese plan. |
| 7. Copilot e IA | `/os#copilot`, `/os#operators`, `/os#benchmark`, `/os#interviews`, `/os#sales`, `/os#review`, `/os#mvp` | Conversación, especialidades, informes y propuestas de acciones sobre datos autorizados. |
| 8. Módulos y conexiones | `/os#studio`, `/os#database`, `/os#reports`, `/integrations`, `/mentors` | Conocimiento, registros, exportación, estado real de servicios y solicitudes de mentoría. |
| 9. Cuenta y administración | `/account`, `/admin`, `/os#settings`, `/os#usage`, `/help`, `/privacy`, `/terms` | Preferencias, límites, facturación, archivos, soporte, condiciones y permisos administrativos. |

Las rutas de servidor complementan esas pantallas. Entre las principales están `/api/account`, `/api/workspace`, `/api/onboarding`, `/api/plan-interest`, `/api/ai`, `/api/ai/status`, `/api/ai/actions`, `/api/research`, `/api/files`, `/api/growth`, `/api/integrations`, `/api/mentors` y las rutas de facturación. Los endpoints no son páginas HTML y no se exportan como si fueran interfaces públicas.

## 4. Recorrido completo de una persona nueva

Una persona descubre el producto, revisa condiciones y elige BUILD o GROWTH. Puede crear su identidad antes de pagar, porque el sistema necesita asociar la contratación con una cuenta. También puede preparar información inicial sin que esa preparación active las herramientas de pago.

La aplicación abre un Checkout vinculado a la organización autenticada. El importe, el precio permitido y los destinos de retorno se eligen en el servidor. La persona revisa la información de pago en la página correspondiente. Al terminar vuelve a Startupia OS, donde se consulta el estado guardado. Esa vuelta es informativa: no constituye una concesión de acceso.

La activación requiere que el servidor reciba y reconcilie evidencia válida de suscripción y de periodo pagado. Cuando existe ese permiso y el onboarding está completo, la persona entra al workspace. Si no existe el permiso, el sistema la conduce a contratación o muestra el estado pendiente. Si falta contexto inicial, continúa el onboarding.

El primer workspace se inicia una sola vez desde el contexto guardado. Una actualización posterior del onboarding conserva el trabajo ya existente. El uso diario consiste en registrar evidencia, organizar tareas, consultar la IA, revisar informes y confirmar operaciones concretas. GROWTH comparte esos mismos datos; no crea una copia desconectada.

Si el pago vence, el sistema restringe las funciones correspondientes y conserva la información. Una reactivación válida puede restaurar el acceso. Los datos ya descargados por la persona no se pueden retirar de su dispositivo mediante un cambio de suscripción; por ello, el control de acceso protege nuevas solicitudes al servidor y no promete borrar copias históricas del usuario.

## 5. Modelo comercial y presentación de la oferta

Los precios definidos para esta entrega son **BUILD: USD 17 al mes** y **GROWTH: USD 37 al mes**. Moneda, frecuencia y diferencias deben ser visibles antes de iniciar la contratación. La presentación de una oferta de lanzamiento puede destacar el acceso y su utilidad sin inventar un precio anterior ni un porcentaje de ahorro.

| Condición | BUILD | GROWTH |
|---|---:|---:|
| Precio mensual definido | USD 17 | USD 37 |
| Ejecuciones de IA por organización y día UTC | 10 | 60 |
| Presupuesto máximo de salida por generación | 1.800 tokens | 3.600 tokens |
| Selección de texto documental para contexto remoto | Hasta 6.500 caracteres | Hasta 14.000 caracteres |
| Operaciones en una propuesta de IA | Hasta 6 | Hasta 12 |
| Workspace empresarial compartido | Sí, con pago verificado | Sí, con pago verificado |
| Área GROWTH | No | Sí |

Los límites son iniciales y operativos. No garantizan un número exacto de palabras, una calidad determinada, resultados comerciales ni disponibilidad ilimitada del proveedor. El contexto final también incluye instrucciones y registros seleccionados; no se envía todo el historial de forma indiscriminada. Un token es una unidad de procesamiento del modelo y no equivale siempre a una palabra.

Las mentorías se presentan separadas de los planes. La solicitud registrada no confirma disponibilidad, profesional, horario ni pago. No hay una reserva automática probada que este manual pueda acreditar. Tampoco debe anunciarse un descuento, duración promocional, cupo o fecha de finalización sin una política comercial real que lo respalde.

Los precios mostrados en páginas, detalle de planes, configuración de Checkout, pruebas y documentos deben coincidir. Cualquier cambio comercial exige revisar toda esa cadena y validar los permisos que concede el nuevo precio. Nunca debe mapearse a GROWTH un precio ajeno sólo porque tenga un nombre parecido.

## 6. Arquitectura técnica y fuente de verdad

La aplicación principal es un proyecto Next.js con React y TypeScript. Las pantallas públicas y privadas conviven con rutas de servidor. La landing se mantiene como HTML de experiencia con sus recursos locales y se incorpora al proyecto mediante un generador. El workspace es modular y utiliza componentes especializados para documentos, tablas, acciones e informes.

La base compartida contiene organizaciones, membresías, workspaces, onboarding, intereses comerciales, suscripciones, archivos, mentorías e historial de IA. El estado de una startup se relaciona con su organización. La sesión identifica a la persona; las reglas de servidor y base de datos determinan qué puede consultar o cambiar.

El código fuente canónico debe conservarse en GitHub. El destino de publicación ejecuta una versión concreta de ese código; no sustituye la responsabilidad de versionarlo. Diseño, planificación, analítica y comunicación son funciones complementarias. Tener un plugin conectado al entorno de desarrollo no significa que el producto ya tenga acceso automático a esa cuenta ni que sus credenciales estén instaladas en el servidor.

La IA usa una llamada HTTPS oficial desde el servidor. La facturación dispone de Checkout, portal y webhook. Los archivos se guardan como originales privados y se relacionan con su metadata y texto extraído. La analítica es opcional y depende de consentimiento; los documentos y prompts no forman parte de sus eventos de producto.

La carpeta `worker/` y los recursos de compatibilidad conservan implementaciones previas presentes en el repositorio. No deben confundirse con la superficie de producción de Next ni desplegarse en paralelo sin revisar sus permisos. El punto de entrada de la aplicación actual se identifica por `package.json`, `app/`, `lib/`, `next.config.ts` y los comandos de build e inicio documentados.

## 7. Mapa del código para mantenimiento

| Ubicación | Responsabilidad |
|---|---|
| `app/` | Páginas, componentes React, módulos de workspace y rutas de servidor. |
| `app/workspace-app.tsx` | Coordinación del workspace, conversación, herramientas y navegación interna. |
| `app/workspace-sync.ts` | Carga, sincronización, respaldo pendiente, comparación de versión y conflictos. |
| `app/workspace-studio.tsx` | Edición de páginas y bloques de contenido. |
| `app/workspace-database.tsx` | Vistas y edición de registros del sistema. |
| `app/workspace-action-panel.tsx` | Vista previa, confirmación y recibos de cambios. |
| `app/business-engine.ts` | Selección de contexto, especialidades e informes empresariales. |
| `lib/entitlements.ts` | Condición única de suscripción activa y pagada, plan y presupuestos. |
| `lib/ai/` | Contrato de solicitud, contexto, Responses, stream y validación de propuestas. |
| `lib/billing/` | Validación de precios, firma, reconciliación e integración de facturación. |
| `lib/workspace-actions.ts` | Motor validado de operaciones y comparación de huellas de registros. |
| `lib/workspace-validation.ts` | Contrato común de los datos guardados. |
| `lib/supabase/` | Acceso a identidad y base de datos desde el entorno correspondiente. |
| `supabase/migrations/` | Evolución versionada de estructura, permisos, RPC y facturación. |
| `supabase/tests/` | Pruebas transaccionales de aislamiento, pago y billing. |
| `experience/` | Fuentes de las experiencias HTML integradas. |
| `public/` | Logotipos, fuentes con licencias, estilos y scripts públicos. |
| `scripts/` | Generación de experiencia, pruebas, preparación y exportación de entrega. |
| `tests/` | Pruebas controladas de contratos y comportamiento. |
| `docs/` | Decisiones, estado, límites, evidencia y procedimientos. |

Una modificación de datos compartidos debe actualizar validadores y pruebas. Una modificación de plan debe revisar servidor, cuota, precios y pantallas. Una modificación visual debe respetar navegación, foco, adaptación móvil y preferencia de movimiento reducido. La estructura de carpetas ayuda a ubicar responsabilidades; no debe usarse para duplicar contratos incompatibles entre cliente y servidor.

## 8. Identidad, sesiones y permisos

La identidad se verifica en servidor. Un dato enviado por el navegador, una etiqueta en un componente o metadata editable del usuario no constituyen autorización. La cuenta puede existir sin una suscripción y seguir teniendo acceso a preparación, condiciones y estado de contratación.

La organización relaciona los datos empresariales con la identidad. Las reglas de base de datos aplican aislamiento por organización. La implementación actual del acceso principal identifica la organización propietaria de la cuenta; no debe anunciarse colaboración arbitraria, invitaciones o permisos de equipo completos sin desarrollar y probar ese flujo.

La condición de acceso pagado exige plan reconocido, estado `active`, proveedor e identificador válidos, periodo de suscripción futuro y periodo pagado verificado futuro. `trialing`, una factura incompleta, una fecha vencida o una selección de interés no bastan. Los errores de lectura fallan cerrados: se muestra que no pudo verificarse el acceso y no se concede una excepción silenciosa.

Los permisos administrativos se consultan desde `app_metadata` controlada por el servidor. Una persona no se vuelve administradora editando `user_metadata`, modificando el HTML o enviando un campo `admin` en un formulario. Los endpoints administrativos verifican ese permiso antes de modificar catálogo o solicitudes.

El registro y la recuperación dependen además de la configuración de identidad del entorno: dominio final, destinos de retorno y entrega de correo. Es necesario probar confirmación y recuperación con un buzón autorizado. La revisión de infraestructura informó que la protección contra contraseñas filtradas estaba deshabilitada; su ajuste debe efectuarse por el canal de configuración permitido, sin simular el control mediante una pantalla.

## 9. Facturación: pago válido antes del acceso

Checkout se prepara en servidor y se asocia con la organización autenticada. El cliente elige un plan permitido; no determina importe, precio arbitrario, identificador de cliente ni destino de retorno externo. Se comprueban moneda, recurrencia mensual, cantidad y correspondencia del precio con BUILD o GROWTH.

El webhook recibe el cuerpo original y valida su firma y antigüedad. La reconciliación consulta el estado necesario del proveedor y actualiza la suscripción mediante una operación privilegiada del servidor. Las sesiones del navegador no tienen permiso de escribir la evidencia de pago. El periodo pagado se obtiene de una factura válida; un estado `active` aislado no reemplaza esa prueba.

Los eventos pueden repetirse o llegar desordenados. El ledger y la suscripción se actualizan de forma transaccional. La coordinación persistida evita que dos procesos sobrescriban el estado sin control. Una cancelación antigua no debe revocar por error otra suscripción vigente del mismo cliente. Los estados de riesgo tienen una política conservadora documentada y requieren revisión humana para levantarse.

El portal permite gestionar la suscripción cuando el entorno está configurado. Renovación, cambio de plan, cancelación y fallos deben comprobarse con datos de prueba. Hasta realizar esa validación no se presenta la integración como un ciclo comercial probado.

Esta entrega mantiene cobros reales deshabilitados y controles que rechazan modo live. Faltan credenciales runtime de Stripe, secreto de webhook y clave privilegiada del servidor para reconciliación. La conexión del plugin no los instala automáticamente. Antes de cobrar hay que verificar además que la cuenta comercial esté habilitada y que las condiciones y obligaciones aplicables estén resueltas.

## 10. Onboarding y continuidad del contexto

El onboarding recoge información que la persona declara sobre su startup. Debe tratarse como un punto de partida, no como una validación de mercado realizada por la plataforma. Su estado y su finalización se guardan con versión.

Una persona puede preparar metadata antes de pagar. La finalización del onboarding no concede acceso premium. Después de un periodo pagado válido, el sistema inicia el workspace desde ese contexto si todavía no existe. Una carrera entre solicitudes no debe crear dos espacios diferentes.

Cuando se vuelve a editar onboarding, los registros existentes se preservan. Los objetivos iniciales se incorporan de forma que repetir el envío no duplique el trabajo. Si otra sesión cambió el estado, el sistema solicita revisar el conflicto; no decide por el usuario qué versión eliminar.

Para verificar la continuidad hay que completar el flujo, recargar, comprobar los campos, abrir el workspace después de pago, crear una tarea y editar onboarding de nuevo. El resultado esperado es que la tarea siga existiendo y que los objetivos iniciales no aparezcan duplicados.

## 11. Workspace, registros y documentos

Los registros abarcan proyectos, tareas, objetivos, ideas, notas, documentos, investigación, clientes, experimentos, decisiones, aprendizajes y métricas. Las vistas permiten organizar esa información con campos definidos, estados, prioridades, fechas y relaciones admitidas. La misma información alimenta los informes y el contexto de IA autorizado.

Studio ofrece páginas con bloques y texto, en lugar de tratar todo documento como una imagen de presentación. Los documentos enriquecidos se convierten en texto vigente al consultar la IA. Esto evita que una descripción antigua o vacía oculte contenido que la persona sí ve en el editor.

Los archivos originales y su texto extraído cumplen funciones diferentes. El original conserva el material cargado; el texto permite analizar formatos soportados. La extracción puede fallar, truncarse o no leer contenido escaneado. La interfaz debe indicar esas condiciones y no afirmar que examinó un PDF, vídeo o imagen que no se pudo procesar.

Los adjuntos se validan por tipo, tamaño y contenido. La configuración actual limita cada archivo original a 3 MB y cada consulta a cinco adjuntos. No es una promesa de lectura universal. Un enlace aportado se considera referencia no leída salvo que una herramienta disponible recupere su contenido de forma expresa.

Archivar conserva procedencia y permite recuperación según las funciones implementadas. Los cambios sobre páginas con relaciones se validan para evitar ciclos o referencias inexistentes. Deshacer compara el resultado esperado: si hubo ediciones posteriores incompatibles, no se revierte a ciegas.

## 12. Persistencia, sincronización y conflictos

El navegador mantiene el estado de trabajo y lo sincroniza con el servidor. La base compartida es el destino confirmado de persistencia. El respaldo local de cambios pendientes ayuda a recuperarse de una interrupción, pero no sustituye la confirmación remota.

Cada guardado envía una versión esperada. Si coincide con la versión actual, la base aplica el cambio e incrementa esa versión. Si no coincide, responde con conflicto. Este mecanismo evita que una pestaña antigua sobrescriba silenciosamente una edición más reciente.

La sincronización agrupa cambios y ordena escrituras. Antes de una consulta remota de IA, espera que el contexto de esa consulta esté confirmado. Antes de aplicar una propuesta, vuelve a guardar y comprobar la versión. Si aparecen nuevas ediciones locales mientras llega la confirmación, conserva ese trabajo y muestra el conflicto.

Ante un conflicto, la operación correcta es revisar y conservar las versiones necesarias. Exportar un respaldo antes de recargar evita perder trabajo local. El sistema no debe mostrar «guardado en la nube» cuando sólo existe un cambio en memoria o cuando el servidor no devolvió una versión válida.

El control de versión protege contra carreras accidentales. Un propietario autorizado sigue pudiendo editar sus propios datos mediante las funciones previstas; el JSON de su workspace no es un registro inviolable. Los recibos dentro del workspace describen cambios de la aplicación, pero no se presentan como un ledger financiero inmutable.

## 13. IA real y diferencias entre planes

Startupia AI remota utiliza la API oficial Responses. La clave se lee sólo en servidor. El modelo se determina mediante configuración de BUILD y GROWTH, con una alternativa común si se define. No hay un identificador de modelo inventado ni una selección de proveedor confiada al cuerpo de la solicitud.

La ruta exige identidad, organización y periodo pagado. Valida los campos permitidos de la consulta y lee el workspace desde la base de datos. Un atacante no puede enviar un supuesto contexto de otra organización ni pedir un modelo no autorizado añadiendo propiedades al JSON.

La selección de contexto incluye perfil declarado, registros pertinentes, conversación reciente y texto documental guardado. Los documentos se delimitan como datos no confiables. Sus instrucciones no pueden cambiar permisos, solicitar claves ni dar al modelo acceso a sistemas que no posee. Los límites reducen coste y evitan enviar toda la memoria de una startup a cada consulta.

Cada intento reserva cuota en una operación atómica por organización y día UTC. Se cuentan intentos reservados, completos y fallidos. Un fallo del proveedor no libera automáticamente el intento, lo que impide un bucle de reintentos sin límite. El presupuesto de salida se aplica a una única generación, sin un loop oculto que lo multiplique.

La interfaz presenta deltas que realmente llegan del servidor. Una animación no fabrica una respuesta remota. Sólo una finalización válida crea un informe completo. Un error, negativa, interrupción o cancelación conserva su estado correcto. El texto parcial puede ser útil, pero no se transforma en evidencia de una tarea finalizada.

Existe un límite de tiempo de 60 segundos y una opción para detener la consulta. El stream se procesa de forma incremental, incluso cuando los límites de los paquetes dividen caracteres Unicode. Los errores se sanean para no mostrar claves ni mensajes internos del proveedor.

Sin clave y modelo disponibles, el servicio indica configuración pendiente y conserva el trabajo. El motor opcional del dispositivo requiere elección expresa y compatibilidad; no se descarga al visitar la landing ni reemplaza silenciosamente la IA remota prometida. Esta entrega no acredita una generación real externa porque no se ha instalado una clave utilizable.

## 14. Operadores, investigación e informes

Copilot ayuda a razonar sobre el trabajo compartido. Benchmarking utiliza criterios observables y debe distinguir fuentes recuperadas de hipótesis. Entrevistas prepara preguntas neutrales sobre experiencias reales. Análisis comercial diferencia ingresos, margen y caja y evita calcular cifras sin datos comparables. Revisión de objetivos consulta progreso, prioridad y fechas. MVP organiza alcance, usuario inicial y prueba de demanda.

La investigación disponible consulta fuentes públicas fijas, principalmente Wikipedia y Crossref. Devuelve título, URL, fragmento y fecha de recuperación. No equivale a una navegación general por cualquier página ni a una comprobación editorial de la verdad. Un resultado por coincidencia de términos puede ser poco relevante y debe revisarse.

Si una fuente falla, el sistema identifica la limitación. La IA no debe inventar una visita a la web ni citar material inexistente. Los enlaces que el fundador escribe no se convierten automáticamente en fuentes leídas. Una comparación competitiva requiere comprobar actualidad, precio y página primaria cuando corresponda.

El informe se construye en servidor con la versión concreta del workspace utilizada para responder. Separa respuesta, registros, recomendaciones, fuentes y siguientes tareas. Esa procedencia evita atribuir a una consulta datos que llegaron al workspace después. Las fórmulas deterministas se distinguen de las recomendaciones del modelo.

Las herramientas de informe pueden exportar contenido, conservar una página o crear una tarea mediante funciones reales del workspace. Cada destino debe indicar lo que ocurrió. «Crear tarea» significa registrar una tarea, no enviar un correo ni ejecutar el trabajo que esa tarea describe.

## 15. Propuestas y acciones con efectos reales

La IA tiene una función estructurada para proponer cambios. Esa función no ejecuta SQL, comandos del sistema, mensajes externos ni acceso a credenciales. Sus operaciones se limitan a tipos y campos admitidos del workspace. Crear, editar o archivar exige una instrucción compatible del usuario.

El flujo tiene seis pasos: interpretar la petición, proponer operaciones, validarlas, mostrar la vista previa, recibir confirmación y guardar con control de versión. La separación permite revisar títulos, campos y registros afectados antes de una mutación. El contenido de un documento no equivale a esa confirmación.

El servidor verifica de nuevo identidad, pago y contexto al aplicar. Comprueba IDs, fechas, tamaños, número de operaciones y huellas de registros existentes. El guardado es atómico: una propuesta inválida o un conflicto no debe aplicar sólo la mitad de un lote.

Un recibo se devuelve después de un guardado confirmado. Si la respuesta se pierde y se repite exactamente la confirmación, se reconoce la acción ya registrada y se devuelve el resultado sin duplicarla, incluso si la primera solicitud llevaba la versión anterior del workspace. Una acción nueva sigue necesitando comparación de versión.

Una propuesta de IA admite seis operaciones en BUILD y doce en GROWTH. Los comandos deterministas y los flujos de trabajo manuales tienen su propio límite técnico del motor; ese límite no se vende como una ampliación gratuita de generación por IA. Los cambios se pueden deshacer mientras no haya ediciones posteriores incompatibles.

El historial de ejecuciones sirve para uso y diagnóstico. La finalización de una ejecución es telemetría del solicitante y no una evidencia de pago. No debe usarse para calcular una factura comercial sin una infraestructura de medición y reconciliación específica.

## 16. GROWTH, mentorías y conexiones

GROWTH exige permiso de ese plan tanto al entrar a su página como al consultar su información de servidor. Las métricas, experimentos y clientes proceden del mismo workspace autorizado. Una tarjeta no genera cifras automáticamente ni convierte una hipótesis en un resultado observado.

Mentors conserva catálogo y solicitudes. El formulario registra intención, datos y estado. La coordinación posterior debe confirmar disponibilidad, profesional, alcance y condiciones. El sistema actual no afirma haber reservado una reunión, enviado un mensaje externo ni realizado un cobro por completar la solicitud.

La página de conexiones diferencia pendiente, configurado y verificado en el alcance que realmente se comprobó. Por ejemplo, una consulta satisfactoria a identidad y memoria prueba esa solicitud; un token analítico instalado no demuestra recepción de eventos. El estado debe actualizarse a partir de evidencia y no de una etiqueta comercial.

Los plugins de desarrollo permiten trabajar con servicios conectados cuando sus permisos lo permiten. No se convierten por esa razón en herramientas disponibles para cada cliente del SaaS. Añadir operaciones externas al producto requiere contratos, autenticación por usuario o por organización, permisos, confirmaciones, límites y pruebas propios.

## 17. Diseño, identidad y sistema visual

El logotipo y el isotipo de Startupia son los activos de marca. El sistema conserva su azul y cyan y el eslogan exacto. El workspace utiliza superficies claras para favorecer lectura y trabajo; la promoción y las escenas de IA conservan el carácter espacial oscuro. Las tipografías Inter y Space Grotesk se sirven desde activos locales con sus licencias, sin depender de Google Fonts remoto. La estética espacial organiza contexto, relaciones y etapas; no representa métricas reales de una cuenta cuando se usa como ilustración.

La landing avanza por capítulos: ambición, problema, sistema, método, primer enfoque, planes, mentoría y dudas. Cada bloque responde una pregunta. La consola de módulos actualiza explicación y destino real. El diagnóstico local ofrece orientación mediante reglas de interfaz; no utiliza IA ni valida demanda y así debe describirse.

La película de identidad procedural preparada para esta entrega es una pieza de marca: composición, logotipo y movimiento originales. No es una grabación del software, una prueba de funciones, un pago, una conexión IA ni resultados de una startup. Debe rotularse como película de identidad cuando se presente junto al producto.

El producto utiliza un lenguaje visual común para estados, botones, paneles, campos, indicadores y navegación. La prioridad de una acción debe ser evidente sin depender del brillo o de una animación. La base visual reduce gradientes, radios y sombras innecesarios. Studio usa símbolos SVG predeterminados; conserva compatibilidad con datos anteriores sin reescribir el contenido del usuario. Las referencias estéticas se evalúan como acentos, superficies y paleta de una dirección coherente, no como veinte estilos superpuestos. Los estados pendientes, de error y completos necesitan texto y semántica, además de color.

La accesibilidad forma parte del diseño: jerarquía de encabezados, etiquetas, foco visible, enlaces nativos, orden de tabulación, mensajes anunciables, controles de teclado y adaptación móvil. Una revisión manual parcial no equivale a certificación WCAG completa. Las limitaciones verificadas deben conservarse en el registro de QA.

## 18. Movimiento: inventario honesto y uso coherente de efectos

El inventario anterior del OS contiene **320 variantes de superficie/evento**: 80 superficies con hover, foco, presión y retorno. Son variantes de interacción; no se anuncian como 320 técnicas de animación diferentes. La nueva landing documenta 24 comportamientos funcionales adicionales. Algunos comparten curvas y técnicas; sumar 344 no mide diversidad perceptual ni demuestra un incremento comercial de conversión.

Los comportamientos incluyen entrada del hero, llegada del mapa orbital, flotación limitada del isotipo, respiración de anillos, profundidad por puntero, retorno al centro, campo de estrellas, pausa fuera de vista, pausa en pestaña oculta, reveal, progreso de lectura, navegación de sección, CTA, foco, menú, tabs, método, orientación local y FAQ. El inventario detallado está en `docs/NEXT-DESIGN.md` y los catálogos de movimiento.

Cada nuevo efecto debe justificar un disparador, una información y una salida. La pregunta práctica es: qué entiende o controla mejor la persona gracias a este movimiento. Si sólo multiplica distracción, conviene reducirlo. No se deben superponer todos los efectos posibles en un mismo viewport.

| Recurso o familia | Cuándo aporta valor | Criterio de implementación y alternativa |
|---|---|---|
| Reveal y entradas escalonadas | Explicar orden de lectura y jerarquía | Una vez por contenido, desplazamiento corto; texto visible sin JavaScript. |
| Tipografía por palabras o caracteres | Destacar una frase breve | Mantener un nombre accesible completo; evitar dividir párrafos de lectura y movimiento continuo. |
| Parallax y capas orbitales | Expresar relación y profundidad en el hero | Amplitud pequeña, puntero preciso; desactivar en móvil y movimiento reducido. |
| Seguimiento magnético del puntero | Confirmar un CTA excepcional | No mover el área de clic de forma impredecible; foco y tacto conservan control estable. |
| Glow, bordes y elevación | Indicar elemento interactivo o seleccionado | Contraste suficiente sin resplandor; el estado también se expresa por texto o semántica. |
| Tilt y perspectiva 3D | Representar una pieza ilustrativa | No deformar formularios o texto esencial; evitar seguimiento global y repintados caros. |
| Partículas, estrellas y Canvas | Construir ambiente espacial | Presupuesto de puntos y cuadros, pausa por visibilidad; jamás transportar datos privados al fondo. |
| Morfología de formas o SVG | Mostrar una transformación conceptual | Formas simples, sin comprometer el logo ni el significado; alternativa estática legible. |
| Scramble y texto cinético | Transición breve de un rótulo secundario | No obstaculizar nombres, precios ni instrucciones; anunciar sólo el texto final accesible. |
| Scroll narrativo o fijación | Explicar un proceso por pasos | Scroll nativo, salida clara y alturas razonables; no secuestrar rueda o teclado. |
| Vídeo, secuencia de imágenes o 3D pesado | Mostrar una demostración que aporte información | Sólo tras justificar peso, licencia, poster y carga; no forman parte obligatoria de esta entrega. |
| Transiciones entre módulos | Mantener orientación al cambiar de contexto | Conservar foco, historial y destino; no ocultar esperas de servidor con escenas que parezcan éxito. |
| Acordeones, menús y modales | Mostrar información progresiva | Estado expandido real, teclado, Escape y devolución de foco cuando corresponda. |
| Arrastre, reordenación o redimensionado | Cambiar una estructura de trabajo | Persistencia real, límites y alternativa por teclado; movimiento basado en datos confirmados. |
| Celebración o partículas de éxito | Reconocer una acción excepcional completada | Sólo tras confirmación, breve y opcional; evitar premiar clics sin resultado o un pago no verificado. |

Esta tabla es una guía de selección, no una afirmación de que cada familia esté implementada. Una nueva lista de técnicas se incorpora al backlog con propósito y criterios de aceptación. Las referencias creativas orientan composición y ritmo; no autorizan copiar interfaces, recursos o afirmaciones.

La landing limita Canvas a un presupuesto de puntos y cuadros, reduce DPR y se detiene fuera del hero o al ocultar la pestaña. `prefers-reduced-motion` prevalece. El control local permite reducir movimiento. Deben mantenerse enlaces, planes, contenido y FAQ utilizables sin animación. Las transiciones de carga no pueden simular una respuesta de IA ni una suscripción activada.

## 19. Cien principios de UX y conversión: qué significa la lista

El documento `docs/UX-PRINCIPLES.md` contiene cien decisiones observables de comprensión, narrativa, navegación, control, confianza, formularios y conversión. Es una matriz de diseño y comprobación. No son cien experimentos ejecutados ni cien resultados causales demostrados.

Los principios deben aplicarse en conjunto: una promesa comprensible, un siguiente paso visible, condiciones claras, navegación reversible, información progresiva, formularios etiquetados y estados honestos. La oferta puede ser atractiva sin inventar escasez, urgencia, testimonios o un descuento anterior inexistente.

Para medir una hipótesis, se define antes el cambio, población, periodo, evento y criterio de éxito. Una mejora de conversión no debe aumentar errores, pagos involuntarios o frustración. La analítica requiere consentimiento y no captura contenido empresarial sensible para perseguir una métrica.

El criterio editorial es mantener únicamente lo que ayude a decidir y trabajar. No se agrega un recurso por completar un contador. La riqueza del sistema se mide también por claridad, fiabilidad y recuperación de fallos.

## 20. Seguridad, privacidad y límites de confianza

Las principales fronteras son navegador/servidor, organización/otra organización, sesión/suscripción, servidor/proveedor y dato/instrucción de modelo. Cada una necesita validación propia. Un diseño de botón bloqueado no reemplaza un permiso en la API y en la base de datos.

Las mutaciones verifican origen y tipo de contenido. Los cuerpos tienen límites de tamaño. Las redirecciones están restringidas a destinos permitidos. Los archivos usan almacenamiento privado y reglas por organización. Las respuestas de error no devuelven detalles internos ni secretos.

Las suscripciones y la evidencia de pago no son editables por el cliente. Los secretos de IA, webhook, facturación y reconciliación nunca usan prefijos de variables públicas. Tampoco se incluyen en archivos HTML, código de cliente, capturas de configuración, logs o ZIP de entrega.

El modelo no recibe acceso libre al sistema. Sus argumentos pasan por validadores del servidor. Los documentos son datos no confiables. Las propuestas requieren revisión y confirmación. El informe conserva procedencia, pero su contenido no reemplaza revisión humana cuando una decisión tenga consecuencias relevantes.

La analítica se activa con consentimiento y envía eventos limitados. Un proveedor analítico configurado debe probar recepción sin enviar documentos, contraseñas, claves, conversaciones o información de tarjeta. El retiro de consentimiento y las señales de privacidad se respetan según la implementación documentada.

La revisión de esta fase no detectó un bypass del pago, del modelo autorizado o de la cuota en el flujo revisado. Eso no constituye una garantía absoluta de ausencia de fallos. Deben repetirse pruebas después de cambios en permisos, migraciones, precios, autenticación o herramientas del modelo.

## 21. Configuración del entorno sin exponer secretos

El inventario de variables está en `.env.example`. Los valores reales se instalan mediante el almacén seguro del entorno. Ese archivo de ejemplo contiene nombres y espacios vacíos; `.env.local` no se incluye en la entrega ni en GitHub.

| Variable | Función | Dónde puede existir |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Origen público del proyecto de datos | Configuración de cliente del entorno correcto. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Identificación pública del cliente | Cliente; no reemplaza reglas de acceso ni una clave privilegiada. |
| `APP_ORIGIN` | Origen canónico de la aplicación | Servidor, correcto para cada entorno. |
| `OPENAI_API_KEY` | Credencial de generación remota | Sólo servidor. |
| `OPENAI_MODEL_BUILD` | Modelo permitido para BUILD | Sólo configuración de servidor. |
| `OPENAI_MODEL_GROWTH` | Modelo permitido para GROWTH | Sólo configuración de servidor. |
| `OPENAI_MODEL` | Alternativa común de modelo | Sólo configuración de servidor. |
| `STRIPE_BILLING_ENABLED` | Interruptor de facturación preparada | Mantener `false` hasta verificar pruebas y configuración. |
| `STRIPE_RESTRICTED_KEY` | Acceso limitado de Stripe en pruebas | Sólo servidor; la implementación actual rechaza claves live. |
| `STRIPE_WEBHOOK_SECRET` | Firma del webhook del mismo entorno | Sólo servidor. |
| `STRIPE_PRICE_BUILD` | Precio permitido mensual de USD 17 | Configuración de servidor. |
| `STRIPE_PRICE_GROWTH` | Precio permitido mensual de USD 37 | Configuración de servidor. |
| `SUPABASE_SERVICE_ROLE_KEY` | Reconciliación privilegiada de billing | Sólo servidor; nunca cliente ni petición a Stripe. |
| `POSTHOG_PROJECT_TOKEN`, `POSTHOG_HOST` | Analítica opcional | Configuración del entorno, con el contrato de privacidad previsto. |

Preview y Production necesitan configuración separada. Un origen de producción aplicado por error a una preview puede bloquear mutaciones por diseño. Los cambios de variables públicas pueden requerir recompilar. Los secretos de un plugin de desarrollo no se transfieren al runtime automáticamente.

No debe solicitarse que una persona pegue claves en un documento, en una conversación pública o en una pantalla de producto improvisada. El sistema debe usar un canal seguro y comprobar sólo presencia, acceso y una operación mínima autorizada, sin mostrar el valor.

## 22. Instalación y ejecución desde el código fuente

El archivo de fuente contiene `package.json`, el lockfile y los módulos del proyecto. Utiliza versiones fijadas en el lockfile. Se recomienda conservar el gestor y la versión indicados por `packageManager`, instalar en una carpeta de trabajo y configurar el entorno antes de iniciar funciones dependientes de servicios.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm start --port 3100
```

Los comandos usan el servidor de Next. El build ejecuta antes la generación de experiencias HTML según los scripts del proyecto. No debe publicarse una copia antigua de `lib/experience-html.ts` después de cambiar sus fuentes. `pnpm build` también puede requerir las variables públicas del entorno correcto.

Para desarrollo puede utilizarse `pnpm dev`; el origen configurado debe coincidir con el host y puerto de prueba. No se recomienda usar datos reales de clientes para probar migraciones, recuperación, borrado o cambios de suscripción. Las credenciales de prueba se inyectan de forma segura y no se guardan en el repositorio.

La configuración de identidad debe permitir sólo los destinos necesarios. Confirmación de correo y recuperación deben volver al host previsto. No se abre un comodín global de redirecciones por comodidad. La entrega de correo y su remitente deben comprobarse con un buzón autorizado antes de un alta pública.

## 23. Migraciones y estado de la base de datos

Las migraciones conservan la evolución del esquema y los permisos. Deben aplicarse en orden sobre un entorno controlado, revisar sus consecuencias y ejecutar pruebas transaccionales. Una migración presente en el ZIP no demuestra que el destino de publicación ya la tenga aplicada.

En esta fase se informó aplicación de las dos migraciones nuevas relacionadas con periodo pagado y evidencia de factura. Pasaron tres pruebas SQL transaccionales con rollback: acceso pagado, aislamiento de organizaciones y billing. El rollback de pruebas conserva los datos reales; no revierte las migraciones ya aplicadas.

Las pruebas verifican que una cuenta sin pago no consulte ni modifique contenido de pago, que no pueda autoasignarse una suscripción, que una organización no acceda a otra y que la evidencia de facturación permanezca bajo el canal privilegiado. También se comprueba continuidad del onboarding y conservación de datos al vencer el acceso.

Después de cambiar permisos se revisan advisors y comportamiento efectivo. Los avisos INFO de tablas privadas de billing no justifican abrir políticas públicas para hacer desaparecer el aviso. El objetivo es mantener la separación de privilegios y resolver cada observación según su significado.

## 24. Pruebas ejecutadas y qué acreditan

La revisión local anterior completó 22 suites y TypeScript; la compilación Next de esta fase también pasó. Después se ejecutaron 60 comprobaciones contra la API y la base reales con una fixture desechable: 22 sin pago, 19 con BUILD y 19 con GROWTH. Incluyen inicio de sesión, persistencia, conflicto 409, protección por pago, IA no configurada con 503, origen/CSRF y cierre de sesión. Esas fixtures son de prueba; no acreditan un cobro ni una generación externa. Las pruebas abarcan validación de workspace, identidad/origen, persistencia, aislamiento, límites, archivos, investigación, informes, acciones, modelos opcionales, analítica, precios y facturación. El inventario exacto y los resultados finales deben conservarse junto al código congelado.

Las suites nuevas de IA prueban el núcleo y los handlers reales con identidad, base de datos y proveedor aislados. Cubren acceso sin pago, origen ajeno, falta de configuración, selección de modelo y tokens por plan, cuota, contexto de servidor, propuestas, stream Unicode fragmentado, interrupción, negativa y error saneado. La prueba de confirmación verifica el guardado y la repetición exacta sin duplicar.

Las pruebas controladas de Stripe cubren firma original, manipulación, tolerancia temporal, rotación, rechazo de modo live, allowlist de precios, cancelación, entrega desordenada, fallos y duplicados. No sustituyen un Checkout real en sandbox conectado a la base y al webhook del despliegue.

La landing pasó revisión de navegador local en escritorio y móvil, teclado de tabs, formulario de orientación, FAQ, foco, menú, movimiento reducido, Canvas y ausencia de overflow en varias anchuras. Esas comprobaciones no equivalen a una certificación completa de accesibilidad ni a una medición de rendimiento de producción con usuarios reales.

| Nivel | Resultado y límite |
|---|---|
| Unitario y contratos | Pruebas locales satisfactorias en los casos registrados; proveedores externos pueden estar sustituidos. |
| Integración de base | Tres pruebas SQL reales con rollback satisfactorias según registro de fase. |
| API con identidad y base reales | 60 comprobaciones con fixture desechable: 22 sin pago, 19 BUILD y 19 GROWTH; no incluyen generación externa ni Checkout real. |
| Compilación | Next build satisfactorio para la versión revisada. |
| Visual e interacción pública | Landing comprobada localmente con los alcances descritos. |
| Auth completo y correo | Requiere verificación del host y configuración final. |
| IA externa por plan | Pendiente por ausencia de clave/modelo utilizables configurados. |
| Checkout, renovación y portal conectados | Pendiente de secretos y ciclo real de sandbox. |
| Cobros reales | Deshabilitados. |
| Publicación de la nueva versión | Debe registrarse tras subir la fuente y comprobar el despliegue. |

## 25. Despliegue, versionado y publicación

La publicación debe partir de una versión concreta de la fuente. Se conservan código, migraciones, lockfile, pruebas y documentos en GitHub. Después se prepara el proyecto de despliegue con su runtime de servidor, variables y origen. No se usa una exportación estática como sustituto de rutas de autenticación, IA o webhook.

Sites es un destino solicitado para la versión unificada cuando el entorno admite las integraciones necesarias. La última URL previamente publicada conocida es `https://startupia-platform-os.contact-rafaelmello.chatgpt.site/`. Ese dato identifica una publicación anterior; no acredita que la revisión actual de código ya esté disponible allí. El registro de entrega debe indicar explícitamente cuándo se publique la nueva versión y qué fuente utiliza.

La preparación de Sites conserva su configuración de proyecto y copia las fuentes de negocio mediante el proceso documentado. Los archivos de entorno no se copian como recursos públicos. Es necesario verificar que el entorno tenga acceso al backend, cookies, rutas de servidor y webhook antes de afirmar que la publicación está integrada.

La audiencia del destino Sites conocido es privada y está limitada al propietario. Esa audiencia se conserva; no se cambia a pública por el hecho de exportar o preparar el código. La barrera de login del host puede impedir que Stripe alcance el webhook, aunque su ruta en la aplicación no requiera sesión. Antes de una prueba de facturación completa hay que disponer de un endpoint público válido que verifique la firma, o tomar una decisión explícita sobre la audiencia de publicación. Un webhook firmado no puede procesarse si el host lo bloquea antes de llegar a la aplicación.

La validación posterior incluye inicio de sesión, preparación del contexto, pago de prueba, actualización por webhook, acceso según plan, persistencia tras recarga, IA, cancelación, errores y cierre de sesión. Se registra URL, versión o SHA, hora, resultado y limitaciones. Una respuesta HTTP 200 de la landing no demuestra esos flujos.

Si una publicación falla por permisos, revisión automática, red o consumo, se conserva la fuente y el motivo concreto. Un ZIP local permite revisar y transferir el trabajo, pero no se presenta como sustituto de una publicación efectuada. La recuperación del acceso al entorno permite reintentar por el canal autorizado, sin eludir controles.

## 26. Operación cotidiana y respuesta a incidencias

La operación debe observar estado de aplicación, fallos de sincronización, reservas de IA, entrega de webhooks y errores de configuración sin registrar secretos ni contenido empresarial innecesario. Los mensajes al usuario deben explicar el efecto y la siguiente acción útil.

| Síntoma | Comprobación práctica | Comportamiento esperado |
|---|---|---|
| Cuenta creada pero OS bloqueado | Estado pagado y vigencia en servidor | Conducir a contratación o verificación, sin activar por URL. |
| Pago de prueba completado y acceso pendiente | Firma, llegada de webhook y reconciliación | Mantener pendiente hasta evidencia válida; permitir actualizar estado. |
| IA pendiente | Presencia segura de clave y modelo del plan | No consumir una generación inexistente ni fabricar respuesta. |
| IA responde con límite | Cuota diaria o capacidad del proveedor | Mostrar límite sin filtrar error interno; conservar trabajo. |
| Stream detenido | Cancelación, tiempo o interrupción | Mantener texto parcial como incompleto; no crear informe final. |
| Workspace en conflicto | Versión del servidor y respaldo local | Preservar cambios, exportar si hace falta y revisar antes de recargar. |
| Archivo no analizado | Formato, tamaño, extracción y texto disponible | Informar la limitación; no afirmar lectura de contenido ausente. |
| Cambio de plan no reflejado | Precio admitido y reconciliación actual | Basar permisos en el servidor, no en la tarjeta elegida. |
| Correo no llega | Configuración de identidad y remitente | Investigar entrega sin crear una confirmación ficticia. |
| Métrica analítica ausente | Consentimiento y recepción real | No activar seguimiento sin consentimiento para ocultar el fallo. |

Las incidencias deben registrar momento, ruta, identificador de operación no secreto y resultado esperado/observado. Los datos sensibles se minimizan. Si una operación pudo completarse pero se perdió la respuesta, se consulta o reintenta mediante el mecanismo idempotente antes de crear otra operación distinta.

Una revisión periódica debe considerar coste por plan, errores, límites alcanzados, abandono del onboarding y accesibilidad. Las decisiones de aumentar cuotas o modelos requieren medir uso y coste; no se promete capacidad ilimitada por una comparación visual con otras empresas.

## 27. Cómo se genera el paquete de entrega

El script `scripts/export-delivery.mjs` prepara documentación HTML, copias de páginas y archivos ZIP. Se ejecuta desde la raíz del proyecto. La salida predeterminada es la carpeta `delivery` del workspace superior. Puede listar el inventario sin consultar páginas ni empaquetar.

```sh
node scripts/export-delivery.mjs --list
node scripts/export-delivery.mjs --docs
node scripts/export-delivery.mjs --pages --origin http://127.0.0.1:3100
node scripts/export-delivery.mjs --zip --frozen
```

El último paso se ejecuta después de congelar la fuente. El indicador `--frozen` obliga a expresar esa decisión; no verifica por sí mismo que alguien haya dejado de editar. El manifiesto registra archivos y hashes para identificar el contenido exacto. Si se cambia la fuente después, hay que regenerar el paquete y sus comprobaciones.

La exportación no usa cuentas, cookies ni cabeceras de autorización. Sólo consulta una allowlist de rutas públicas desde el origen local. Los módulos privados se describen como portales; no se extraen datos de una sesión. Los formularios de las copias estáticas se deshabilitan para que no parezcan altas o pagos funcionales desde un archivo. La interacción local de la landing se conserva únicamente para sus comportamientos públicos revisados.

El código fuente excluye `.git`, dependencias, builds, archivos de entorno reales, llaves, bases locales, archivos de sesión y salidas de entrega. `.env.example` se conserva como inventario vacío. No se incluyen credenciales proporcionadas por el usuario, carpetas de adjuntos externas ni datos privados capturados. Antes de entregar, se inspeccionan el inventario, las exclusiones y la integridad de los ZIP.

Los HTML conservan recursos locales necesarios para lectura y presentación y un aviso visible de exportación. Sus enlaces permiten navegar por las copias o abrir el destino del sistema. El enlace al destino publicado puede mostrar una versión anterior hasta que se publique esta revisión; el aviso lo declara. Las API y el workspace autenticado requieren ejecutar el código de servidor.

## 28. Límites y trabajo pendiente verificable

Falta instalar una clave OpenAI utilizable y un modelo disponible para el proyecto. Después hay que probar una consulta por plan, cuota, streaming, cancelación, propuestas y confirmación con el proveedor real. La ausencia de esa prueba debe mantenerse visible en la entrega.

Faltan secretos runtime de Stripe, webhook y reconciliación privilegiada. También debe resolverse la entrega externa al webhook: la publicación Sites conocida tiene audiencia privada de propietario y su login puede bloquear al proveedor antes de llegar al endpoint firmado. Checkout, renovación, fallo, cambio de plan y cancelación requieren un ciclo real de sandbox conectado a la aplicación. Los cobros reales permanecen deshabilitados y necesitan una fase de habilitación comercial y validación propia.

La publicación conocida corresponde a una versión anterior. La nueva fuente debe guardarse y publicarse por los canales autorizados, con su URL y versión comprobadas. Un ZIP de código completo no demuestra que ya se haya desplegado. El documento de estado final debe reflejar cualquier avance posterior a este manual.

La investigación no es navegación general; las acciones se limitan a operaciones admitidas de workspace; Mentors no confirma automáticamente una prestación pagada; el historial del propietario no es un archivo de auditoría inmutable. La colaboración de equipos, el acceso especial a originales tras cancelación y las operaciones externas adicionales requieren flujos específicos y pruebas.

No se declara Startupia OS terminado ni todas sus conexiones probadas. Esta entrega conserva una base integrada, su funcionamiento implementado, evidencia de pruebas y un procedimiento preciso para completar lo pendiente sin simular resultados.

## 29. Documentos de referencia y evidencia

Para detalles de permisos: `docs/ACCESS.md`. Para IA: `docs/AI-NEXT.md`. Para billing: `docs/BILLING.md`. Para preparación del entorno: `docs/DEPLOYMENT.md`. Para la matriz de nueve entregables: `docs/DELIVERY.md`. Para dirección visual y QA: `docs/NEXT-DESIGN.md`. Para hipótesis de UX: `docs/UX-PRINCIPLES.md`. Para analítica: `docs/ANALYTICS.md`.

Los registros de pruebas y las capturas se conservan como evidencia de su alcance concreto. No se infiere una prueba de pago a partir de una captura de precios ni una conexión IA a partir de una interfaz de chat. Cada revisión posterior debe actualizar fecha, código, configuración y resultado de las verificaciones que realmente se ejecutaron.


## 30. Actualización: restauración de la landing original

La revisión Motion Experience Pro vuelve a usar la landing oficial íntegra del commit local1b97a95, con sus770fragmentos de texto conservados. Sustituye la propuesta editorial alternativa de la versión3 sin perder información empresarial. Conserva Digital Creator, Pathfinder, el catálogo de herramientas, la guía ilustrativa y Academy como fase futura.

La nueva escena cromática reproduce el principio observado en United Carriers: un tramo de azul profundo hacia una superficie clara según el scroll nativo. No se copian sus recursos ni se convierte toda la interfaz en un degradado. Se añaden materiales, vídeo expansivo y estados acotados desde una capa separada. [Informe de esta revisión](ORIGINAL-MOTION-PRO.md), [conservación de contenido](original-content-preservation.json) e [inventario de activos originales](original-assets-manifest.json) aportan la trazabilidad. Los resultados históricos de esta documentación corresponden a las revisiones en que se obtuvieron; la nueva publicación y sus paquetes se registran por separado.
