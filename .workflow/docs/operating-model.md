# Modelo de trabajo

Versión 0.3.1. La configuración de cada instancia vive en `.workflow/project.json`.
El método sirve para apps web, móvil, escritorio, API o herramientas internas;
los controles se aplican a las superficies que de verdad existan.

## Un solo canal con el responsable

El responsable **solo habla con el chat principal** (ver `prompts/main-chat.md`).
El chat principal es su único interlocutor: aquí conversa negocio, dirección y
decisiones técnicas de alto nivel. Los demás agentes (business-epic-writer,
arquitecto, ejecutor, QA) son **sub-agentes que el chat principal despacha**,
no sesiones que el responsable abre.

El reporte al responsable es **al cerrar un ciclo**, no en hitos intermedios.
`STATUS.md` queda como canal de lectura asíncrona. El chat principal interrumpe
al responsable solo si hay decisión que cambia negocio/presupuesto/alcance,
bloqueo real o acción con efectos externos no autorizada.

### Watchdog de sub-agentes

Los sub-agentes a veces se quedan parados sin avisar. El silencio hacia el
responsable **no** significa pasividad del chat principal: revisa activamente
que los sub-agentes despachados sigan trabajando.

Para cada sub-agente despachado:

1. Registra Issue, sub-agente, timestamp y duración esperada por `effort:*`.
2. Vuelve a revisar en intervalos:
   - `effort:routine`: cada 15-30 min.
   - `effort:standard`: cada 45-90 min.
   - `effort:deep`: cada 2-3 horas.
3. En cada chequeo mira actividad real del Issue/PR (comentarios, etiquetas,
   commits), no la última memoria del chat principal. Usar `gh issue view
   --comments`, `gh pr list` o el mecanismo nativo de la herramienta del
   sub-agente.
4. Si tras 1-2 intervalos no hay movimiento: intentar reactivar al sub-agente
   (ping, mensaje nuevo). Si sigue muerto, cerrar la sesión y abrir otra con
   contexto mínimo.
5. Interrumpir al responsable solo si el bloqueo requiere decisión suya o si
   la reactivación también falló.

Herramientas típicas: `ScheduleWakeup` o `CronCreate` para despertar en el
intervalo; `Monitor` sobre procesos locales; `gh` sobre repos remotos.

El responsable puede dirigir qué modelo o herramienta usar ("usa más Gemini",
"usa Antigravity ahora", "nos quedan pocos tokens de Opus"); esa indicación
sobreescribe la tabla por defecto en `profiles/personal/agent-plan.md` para la
asignación siguiente. El chat principal confirma la elección en una línea.

## Roles

| Rol | Responsabilidad | Límite |
| --- | --- | --- |
| Responsable humano | Problema, prioridades, alcance comercial, presupuesto y aceptación del producto | No se le asigna revisión de código, arquitectura, tickets ni merges |
| Producto | Investigar, distinguir hechos de hipótesis, redactar propuesta y criterios de negocio | No inventar validación, precios ni decisiones del responsable |
| Arquitectura/coordinación | Definir límites técnicos, evaluar reutilización, operar tickets, revisar e integrar | No ampliar por sí solo alcance comercial, presupuesto ni permisos externos |
| Ejecución | Implementar y verificar la tarea dentro de sus límites | No alterar decisiones vinculantes silenciosamente |
| QA/revisión | Evaluar con evidencia el resultado y comunicar defectos | No certificar lo no observado ni reparar durante la misma pasada de QA |

Son funciones, no cinco personas, chats o suscripciones obligatorios. Una sesión
puede pasar de arquitectura a ejecución y dejarlo registrado. Para cambios de
riesgo relevante, la revisión independiente usa otra sesión o una persona.
Nunca se presenta la autorrevisión como QA independiente.

## Elegir recorrido

**Breve:** documentación, ajustes delimitados, investigación o correcciones de
bajo impacto. Un encargo con objetivo, límites y comprobación; un ejecutor; informe
breve. No exige dos épicas, un tracker externo ni QA adicional por rutina.

**Épica:** una capacidad de producto, varias dependencias, cambio de datos o
permisos, migración o trabajo con incertidumbre importante. Definición de negocio
cuando corresponda → encargo técnico → lectura y read-back → ejecución → pruebas
propias → revisión independiente → integración/publicación según autorización →
aceptación de negocio.

Un trabajo técnico interno puede no necesitar épica de negocio. Una investigación
puede concluir en no construir. Una funcionalidad se divide en entregas verticales
observables, no en tareas aisladas de frontend y backend que nunca funcionan juntas.

## Encargo antes de ejecutar

El encargo técnico declara seis límites:

1. Referencias vigentes de producto y arquitectura.
2. Invariantes y criterios verificables.
3. Presupuesto o límite de esfuerzo y cómo medirlo.
4. Qué se puede revertir y qué acciones necesitan autorización adicional.
5. Decisiones vinculantes y decisiones delegadas.
6. Decisiones de negocio resueltas y pendientes que afecten a la tarea.

No hace falta especificar cada línea de implementación. Si una decisión cambia
alcance, coste o un requisito vinculante, se registra y se resuelve con quien tenga
la autoridad. Las dudas de implementación dentro del encargo las resuelve el ejecutor.

El read-back confirma qué entendió el ejecutor, qué reutiliza y qué comprobará.
La autorización del encargo puede cubrir el inicio; no se repite una pregunta ya
respondida. El modo estricto puede pedir una confirmación del read-back: debe
estar configurado por el proyecto, no aparecer inesperadamente a mitad del trabajo.

### Flujo de read-back

1. El coordinador abre el Issue con criterios, repo(s), tipo, esfuerzo y asignación.
2. El **ejecutor** publica su read-back como comentario del Issue (ver sección en
   el template `01-work.md`) y declara si tiene dudas abiertas.
3. Si no hay dudas abiertas y el modo es `task_authorization`, el ejecutor
   arranca sin esperar. Mueve la etiqueta de estado a `status:in-progress`.
4. Si hay dudas, añade la etiqueta `needs:readback-answer` y espera. En este
   caso se invoca al **arquitecto** (no está siempre on; se abre cuando toca)
   con el prompt `prompts/architect.md`. El arquitecto responde en el Issue y
   retira la etiqueta cuando queda resuelto.
5. En modo `readback_confirmation`, el arquitecto o quien tenga la autorización
   confirma explícitamente con ✅ antes de que el ejecutor arranque, incluso sin
   dudas.

## Evidencia y cierre

- Diferencia hecho medido, prueba reproducible, analogía limitada e hipótesis.
- Cada criterio tiene una comprobación adecuada y un resultado; una comprobación
  debe poder detectar el fallo que pretende excluir.
- Añade pruebas de regresión para lógica importante o defectos. No escribas tests
  ceremoniales para ediciones de texto ni un test por cada frase del encargo.
- Tests, inspección estática, navegador y producción son evidencias distintas.
  No llames «verificado en producción» a un test local.
- **La revisión/QA siempre levanta la app y ejecuta el recorrido afectado**, no
  solo lee el diff ni se apoya en el verde de CI. Para UI el estándar es
  Playwright con captura o trace; para API u otras superficies, una prueba
  ejecutable equivalente contra la app corriendo. Un Issue en `status:review`
  no se cierra sin esa evidencia reproducible.
- Si CI y local difieren, conserva ambos resultados e investiga la diferencia;
  no escondas fallos ni elijas el resultado favorable.
- QA fija versión/commit y entorno. Un cambio posterior invalida la parte de la
  evidencia que afectó y exige la repetición correspondiente.
- Un retest cubre defectos corregidos y regresiones razonables, no solo una lista
  tan estrecha que no observe el impacto de la corrección.
- Una app desplegada puede no haber validado su negocio. La aceptación comprueba
  el criterio de producto; el resultado puede ser éxito, refutación o inconcluso.

## Fuentes de verdad

Modo preferido: **GitHub**. El detalle de Issues, etiquetas, PR, prioridad y
aceptación está en [el flujo GitHub](github-workflow.md). Los agentes lo operan.

| Dato | Lugar |
| --- | --- |
| Objetivo, usuario y propuesta | `PROJECT.md` |
| Fundamentos y comandos | `docs/foundation/architecture.md` y `REPO.md` |
| Configuración y autoridad | `.workflow/project.json` |
| Encargo, estado, ejecutor y prioridad | GitHub Issue; enlaces a documentación cuando convenga |
| Cambio de código y revisión | Pull request y checks del commit evaluado |
| Decisión duradera | `decisions/<ID>.md` con referencia desde el Issue |
| Continuidad | `.workflow/control-log.md`, con enlaces y contexto mínimo |
| Investigación/evidencia extensa | `tasks/` o artefacto enlazado; no un segundo estado vivo |

En modo `files`, explícito para trabajo sin tracker: `tasks/<ID>/task.json` lleva
estado/ejecutor y `.workflow/backlog.json` solo el orden de IDs. Estados locales:
`draft`, `ready`, `in_progress`, `review`, `done`, `blocked`.

Cambiar backend requiere registrar la nueva autoridad y retirar o fechar como
snapshot los estados anteriores. Una vista Projects no debe crear otra verdad.

En ambos modos, entregar técnicamente no equivale a publicar ni validar negocio.
QA que no se hizo se declara pendiente o no probado; no se simula aprobación.
