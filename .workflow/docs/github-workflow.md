# GitHub como sistema de trabajo

GitHub es el tracker preferido de esta edición. El responsable del negocio no
necesita crear tickets, mover tarjetas, revisar código ni ejecutar comandos.
El coordinador y los agentes realizan esa operación y presentan resultados en
lenguaje de producto.

## Reparto de responsabilidades

| Persona/rol | Se ocupa de |
| --- | --- |
| Responsable humano | Qué problema resolver, para quién, prioridades, presupuesto y si el resultado sirve |
| Coordinador técnico | Arquitectura, reutilización, tareas, dependencias, modelos, revisión e integración dentro de lo autorizado |
| Ejecutor | Código, pruebas, correcciones, commits y PR del encargo |
| Revisor/QA | Evidencia independiente cuando corresponda y defectos reproducibles |

Una discrepancia técnica se resuelve con evidencia entre los agentes, no se
traslada al usuario como «elige este framework» o «revisa este diff». Si afecta
presupuesto, datos reales o compromiso comercial, se explica la consecuencia y
se pide únicamente la decisión de negocio necesaria.

## Cómo se representa el trabajo

- **Issue:** unidad de trabajo con problema, alcance, criterios y siguiente paso.
- **Issue de negocio:** capacidad grande y aceptación del producto, cuando haga falta.
- **Issue técnico:** encargo de implementación enlazado; no crear dos tickets para
  una corrección pequeña que cabe en uno.
- **PR:** propuesta concreta de código, vinculada al Issue y con pruebas.
- **Milestone:** entrega o MVP. No se usa para duplicar estados de tareas.
- **Project:** una vista Kanban **por aplicación** como estándar. No crea verdad
  nueva; sus columnas reflejan las etiquetas de estado del Issue.
- **Documentos versionados:** objetivo, fundamentos y decisiones duraderas.
- **Comentarios:** read-back, hallazgos, QA y resultado, con evidencia/commit.

Las plantillas copiables están en `adapters/github/`. Se copian al `.github/` de
una instancia nueva; en una app existente se comparan con lo que ya haya.

## Fuente de verdad sin estados duplicados

Para un Issue abierto se mantiene **una sola** etiqueta de estado:
`status:draft`, `status:ready`, `status:in-progress`, `status:review` o
`status:blocked`. Cuando se cierra, el estado abierto/cerrado y la razón de cierre
de GitHub determinan si se completó o canceló; se retira la etiqueta de estado
abierto. El coordinador hace esa transición; no hay automatización instalada.

Asignación y estado viven en el Issue. Si un agente no es un usuario GitHub, su
sesión/rol se identifica en el comentario de asignación; no se inventa una cuenta.
Prioridad: una etiqueta `priority:p0`, `priority:p1` o `priority:p2`; dependencias:
enlaces a Issues en el encargo. El Project por app solo refleja la fuente. Si se
decide usar su campo Status como autoridad en el futuro, se migra explícitamente
y se retiran las etiquetas equivalentes, sin mantener dos estados vivos.

### GitHub Project por aplicación

Cada app tiene **un Project propio**, no un tablero compartido entre apps. El
coordinador lo crea al conectar el repositorio y lo configura con columnas que
mapean 1-a-1 a las etiquetas de estado:

- `Draft` ← `status:draft`
- `Ready` ← `status:ready`
- `In progress` ← `status:in-progress`
- `Review` ← `status:review`
- `Blocked` ← `status:blocked`
- `Done` ← Issue cerrado (completado)

El backlog = Issues abiertos del repo filtrados por prioridad. El Project añade
visibilidad, no crea una lista separada. Si una app no necesita tablero visual
(trabajo muy pequeño o un solo frente), se puede omitir sin bloquear el flujo.

Los archivos en `tasks/` pueden conservar investigación, diseños o evidencia,
pero no un segundo `task.json` activo cuando `state_backend=github`. El modo
`files` queda como alternativa explícita para trabajar sin tracker.

## Épicas técnicas con sub-tickets

Una capacidad grande (épica técnica) se abre como Issue con `type:technical` +
`scope:epic` y lista sus sub-tickets como checklist en el cuerpo:

```
- [ ] appcitas-jubilacion/backend#12 — Endpoint de matching
- [ ] appcitas-jubilacion/mobile#7 — Pantalla de matches
- [ ] appcitas-jubilacion/docs#3 — Decisión: formato del payload
```

Reglas:

- La épica no implementa código; coordina. El arquitecto la escribe tras una
  épica de negocio aprobada.
- Cada sub-ticket es un Issue normal `type:technical` con sus propios criterios,
  repo afectado, `effort:*` y asignación. Vive en el repo del código que toca.
- La épica se cierra cuando todos los sub-tickets están cerrados **y** el
  recorrido e2e pasó QA con la app levantada (Playwright web o simulador móvil).
- Si surge trabajo que no estaba en la checklist, se añade un sub-ticket; no
  se amplía el alcance en silencio.

## Ciclo normal

1. El usuario describe la necesidad en la conversación.
2. El coordinador la convierte en Issue(s), escribe criterios y propone un alcance
   cuando falte. Pregunta al usuario solo si la decisión cambia el producto,
   presupuesto o una autorización necesaria.
3. Se registra el encargo autorizado; el agente hace read-back y ejecuta sin
   pedir una segunda aprobación técnica por rutina.
4. El ejecutor verifica, prepara PR y adjunta evidencia al commit evaluado.
5. Revisión independiente según el riesgo; correcciones y retest correspondiente.
6. El coordinador puede integrar dentro de la delegación y permisos configurados,
   con checks aplicables correctos y revisión suficiente. No se omiten protecciones
   ni se declara un check inexistente como aprobado.
7. El usuario recibe una demostración y decide si cumple lo que necesitaba. La
   publicación externa sigue su autorización y presupuesto; una PR integrada no
   significa que ya se publicó ni que el negocio esté validado.

## Cerrar no es lo mismo que fusionar

Usar `Closes #N` solo cuando la fusión a la rama predeterminada completa realmente
el Issue. Si falta aceptación o despliegue, usar `Refs #N` y cerrar después con
la evidencia pendiente. Las palabras de cierre tienen comportamiento especial
para la rama predeterminada; no asumir cierre al fusionar a cualquier rama.

## Adopción operada por los agentes

El coordinador selecciona/confirma el repositorio autorizado de cada app, conecta
el acceso permitido, incorpora plantillas, crea las etiquetas descritas en
`config/github-labels.json` y abre el trabajo real. Puede añadir Projects si aporta
visibilidad. No es una lista de tareas técnicas para el usuario.

El generador solo prepara archivos: no crea repositorios, Issues, etiquetas,
Projects, cuentas ni workflows de CI. `github.connection_state=not_connected`
permanece hasta comprobar acceso y configuración reales. No pedir al usuario
credenciales en documentos; usar el mecanismo de conexión de la herramienta.

## Referencias oficiales consultadas

- [Plantillas de Issues y PR](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/about-issue-and-pull-request-templates).
- [Vínculo y cierre de Issues desde PR](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue).
