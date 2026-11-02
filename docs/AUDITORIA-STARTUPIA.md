# Startupia — auditoría y alcance verificable

Fecha: 27 de octubre de 2026.

| Módulo | Estado inicial | Problema | Trabajo | Prioridad | Dependencia | Prueba |
|---|---|---|---|---|---|---|
| Landing | Funcional con mejoras | Eslogan y precio Build antiguos; enlaces separados | Eslogan, USD 9, navegación unificada, SEO | Alta | Ninguna | HTML, enlaces, móvil |
| Acceso | Parcial | Formularios sin proveedor conectado | Identidad administrada por Sites / ChatGPT | Alta | Autenticación de Sites | Anónimo, sesión, salida |
| Onboarding | Parcial | Progreso exclusivo del navegador | Guardado por cuenta y perfil compartido | Alta | D1 e identidad | Recarga, aislamiento, validación |
| Startup Manager | Funcional con mejoras | Espacio separado de la landing | Reutilizar componentes y guardado existentes | Alta | D1 | Suites existentes, CRUD |
| Copiloto / Operators | Parcial | Motor local disponible; adaptadores de servidor sin secretos | Conservar capacidades y mostrar estado real | Alta | Credencial y modelo para IA remota | Referencias, acciones, errores |
| APIs suministradas | Ejemplos de código | No contienen claves operativas; nombres de modelo no verifican acceso | No asumir conexión por presencia de código | Alta | Aprovisionamiento seguro | Inventario sin valores secretos |
| Suscripciones | No implementadas | Sin cuenta/proveedor de pagos | Registrar selección sin activar ni cobrar | Alta | Proveedor, matriz y límites aprobados | Precio, estado pendiente, aislamiento |
| Mentors | Parcial | Formularios sin entrega real; sin mentores confirmados | Catálogo administrable y solicitudes persistentes | Media | Datos reales de mentores | Horas, total, estado, autorización |
| Archivos | Parcial | Solo se conservaba texto extraído | Almacenar originales en R2 con acceso por cuenta | Media | R2 y D1 | Tamaño, descarga, aislamiento |
| Movimiento | Funcional con mejoras | Sistemas visuales separados | Cinco canales coordinados de interacción | Media | Preferencia de accesibilidad | Movimiento reducido y móvil |
| Academy | Futuro | Fuera del MVP | Comunicar fase futura | Posterior | Validación comercial | No anunciar cursos disponibles |

Orden de ejecución: conservar fuentes → unificar navegación y marca → identidad y datos → onboarding → archivos y mentorías → movimiento → pruebas → publicación.

Los sitios anteriores conservan su identidad y sus datos. Sites asigna identidades distintas a cada sitio: el traslado de un workspace anterior se realiza mediante su exportación/importación, sin suponer equivalencias de usuarios.

No se activan cobros ni suscripciones a partir de una selección en el navegador. Los precios comerciales solicitados son Build USD 9/mes, Growth USD 37/mes y mentorías USD 197/hora; los límites de IA requieren costes observados y aprobación comercial.
