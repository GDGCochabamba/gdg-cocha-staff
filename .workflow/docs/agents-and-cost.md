# Agentes, modelos y consumo

El rol se elige por tarea; la herramienta aporta acceso al repo, navegador o
servicios; el modelo aporta capacidad. Claude, Codex, Gemini, Antigravity o Cursor
pueden cubrir diferentes roles. Dos herramientas pueden acceder al mismo modelo
sin tener las mismas cuotas ni el mismo contexto. No presumir bolsas independientes.

## Asignación por dificultad

| Clase | Trabajo | Selección |
| --- | --- | --- |
| Ligero | Transformación, búsqueda delimitada, borradores, cambios mecánicos | El modelo disponible de menor coste que resuelva bien el encargo |
| Estándar | Funciones, pruebas, depuración habitual y análisis de producto | Modelo equilibrado; nivel de razonamiento suficiente |
| Profundo | Arquitectura difícil, fallos persistentes, decisiones ambiguas | Modelo de mayor razonamiento, con encargo y límite acotados |

No se fijan versiones de proveedor en el núcleo. Al asignar se registra herramienta,
modelo exacto si es observable, nivel de razonamiento, rol y motivo. Si la herramienta
no expone el modelo o consumo, escribir `no disponible`, no inventar cifras.
Planes y tarifas se verifican en la cuenta/documentación cuando hagan falta.

## Política de consumo

- Un ejecutor por defecto. No lanzar un comité por cada solicitud.
- Subir de modelo por dificultad o evidencia de fallo, no por prestigio.
- Leer el índice y fragmentos necesarios; no cargar el ZIP original entero ni el
  historial de todos los proyectos.
- Los traspasos llevan contexto mínimo: objetivo, límites, archivos, decisiones,
  criterio de terminado, evidencia y siguiente paso. No pegar toda la conversación.
- No repetir builds o suites correctas sin nuevos cambios o una razón pendiente.
- Usar herramientas deterministas para transformaciones y cálculos apropiados.
- Investigar reutilización antes de construir. Una dependencia que obliga a una
  adaptación mayor también consume; comparar ambas rutas.
- Multiplicar agentes puede ahorrar tiempo y aumentar tokens. Declarar cuál se
  optimiza: dinero incremental, cuota incluida, latencia o calidad.
- Un subagente necesita una contribución concreta, presupuesto y archivos disjuntos
  si escribe. Se usa solo cuando esté solicitado o permitido por las instrucciones
  vigentes de la sesión; esta política no activa delegación por sí sola.
- QA independiente es obligatorio para cambios de riesgo relevante en el recorrido
  completo. Para trabajo pequeño puede bastar verificación y autorrevisión honesta.

## Registro por tarea

Herramienta/modelo, tiempo si se midió, tokens si están disponibles, costes externos,
limitaciones y motivo de consumo elevado. Sin acceso a métricas exactas, se registra
la ausencia. No convertir mensajes o turnos en supuestos tokens.

## Perfil de este espacio personal

El reparto concreto de nuestras herramientas y cuentas se conserva en
`profiles/personal/agent-plan.md` del kit de origen, separado del núcleo general.
No se copia como configuración obligatoria de cada app ni afirma que las cuentas
estén conectadas. Al adoptar el perfil se registran los modelos realmente disponibles.
