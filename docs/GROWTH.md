# Growth

`/growth` ofrece experimentos, métricas y clientes del workspace compartido. Los contadores muestran registros reales, no ingresos ni clientes pagadores inferidos. No hay datos de demostración ni métricas precargadas.

## Acceso

Se consulta `GET /api/growth` antes de cargar datos y de cada guardado. El servidor exige plan Growth, estado active/trialing y vigencia futura. Una selección de plan no habilita Growth. HTTP 403 muestra el acceso restringido; HTTP 401 solicita iniciar sesión; errores de conexión permiten reintentar sin presentarlos como falta de suscripción.

## Edición y persistencia

El editor permite crear y modificar los tres tipos de registros. Los experimentos admiten hipótesis, criterio, resultados y aprendizaje en su descripción; se preserva cualquier descripción previa sin imponer una plantilla. Las métricas requieren valor y meta explícitos y admiten fecha, unidad en el título y fuente. Clientes conservan contexto y siguiente paso; los estados son los mismos del workspace.

Los datos se guardan únicamente al confirmar. Se reutilizan `Workspace`, `Entry`, `validEntry`, `validDate`, `fingerprint` y `validWorkspace`. Antes de guardar se obtiene el workspace más reciente, se verifica que el registro editado no haya cambiado y se actualiza sólo esa colección. El PUT envía `version` para comparación y escritura atómicas (CAS). Un conflicto conserva el formulario y no sobrescribe la nube. Para un registro editado concurrentemente, el usuario debe conservar su texto, cancelar, actualizar y editar la nueva versión.

Una respuesta de guardado perdida se puede comprobar al reintentar: si el registro con el mismo ID ya coincide exactamente, se confirma sin crear otro. El formulario vive sólo en memoria; se advierte al cerrar la pestaña con una edición abierta. No se promete recuperación local después de cerrar.

## Límites

La comprobación de Growth de la interfaz no sustituye permisos del servidor. La API de workspace sigue siendo compartida con Build y no incorpora aquí un permiso adicional por colección. Los cambios de otras sesiones se obtienen al actualizar o antes del guardado; no hay suscripción en tiempo real. No hay integración analítica automática ni atribución de ingresos. Se conservan los límites del validador del workspace.

## Accesibilidad

Formularios con etiquetas, controles nativos, mensajes de estado y error, foco al abrir/cerrar el editor, navegación por teclado y estilo de foco visible. Diseño adaptable y reglas para movimiento reducido.
