# Reparto inicial de agentes y modelos

Fecha: 2026-10-26. Perfil personal para planificar el trabajo; no cambia ajustes de
las herramientas ni inicia sesiones. El núcleo de Epic Flow sigue siendo general.

## Recursos declarados y observados

| Herramienta | Plan declarado por el usuario | Observación local |
| --- | --- | --- |
| Claude Code | Claude Max | `settings.json` indica `claude-sonnet-5`; es una configuración, no una prueba de cuota o de una sesión activa |
| Codex | ChatGPT Plus | Configuración: `gpt-6.1-sol`, esfuerzo `medium` |
| Gemini | Google pagado básico | No hay modelo fijado en la configuración leída; catálogo real por resolver al asignar |
| Antigravity | Google pagado básico | Modelos y cuota de la cuenta aún no comprobados |
| Cursor | Free | Auxiliar opcional; no se depende de él para completar trabajo |

No se conoce el nombre exacto del plan de Google ni si Gemini/Antigravity comparten
límites. No se los trata como bolsas independientes. OpenCode queda excluido.

## Asignación por tipo + esfuerzo del Issue

El coordinador etiqueta cada Issue con `type:*` y `effort:routine|standard|deep`.
La asignación por defecto para apps en Ventures:

| Combinación de etiquetas | Herramienta por defecto | Modelo por defecto | Notas |
| --- | --- | --- | --- |
| `type:technical` + `effort:routine` | Antigravity | Gemini Flash o Haiku 4.5 | Patrón conocido, criterios cerrados; no gastar razonamiento |
| `type:technical` + `effort:standard` | Claude Code o Codex | Sonnet 4.6 o Codex Sol | Trabajo normal con alguna decisión acotada |
| `type:technical` + `effort:deep` | Claude Code o Codex | Opus 4.7 o Codex Astra | Decisión ambigua o impacto alto |
| `scope:epic` + `type:technical` | Codex o Claude Code | Codex Astra o Opus 4.7 | Rompe en sub-tickets; no implementa directamente |
| `type:bug` con repro clara | Antigravity | Gemini Flash o Haiku 4.5 | Como routine |
| `type:bug` sin causa clara | Claude Code o Codex | Sonnet 4.6 o Codex Sol | Investigación antes de arreglar |
| `type:business` (épica de negocio) | Chat principal del responsable | Opus 4.7 o Sonnet 4.6 | Agente business-epic-writer |
| QA/revisión (sesión aparte) | Antigravity + Playwright | Modelo suficiente para el flujo | Nunca el mismo que escribió el código |

El modelo exacto depende de disponibilidad real en la cuenta; registrar lo
observado, no inventar acceso. Si una combinación no aplica (p. ej. no hay cuota
de Opus), elegir alternativa suficiente y registrarlo.

**Dirección del responsable sobreescribe la tabla.** Si en el chat principal
dice "usa más Gemini", "usa Antigravity", "nos quedan pocos tokens de Opus" o
similar, aplicar esa preferencia en la próxima asignación aunque la combinación
`type:* + effort:*` sugiera otra cosa; registrar la decisión en el Issue y en
el `control-log.md` o `STATUS.md` según el impacto.

## Propuesta de reparto por función

| Función | Habitual | Escalamiento o alternativa | Motivo del reparto |
| --- | --- | --- | --- |
| Coordinación y GitHub | Codex `gpt-6.1-sol`, `high` | Astra para una decisión de arquitectura de dificultad alta | Mantener contexto con más razonamiento; no elevar a Astra cada actualización de tickets |
| Arquitectura y decisiones difíciles | Codex `gpt-6-astra`, `high`, si está disponible | Codex `gpt-6.1-sol`, `high`; Opus como segunda opinión puntual si hace falta | Reservar más capacidad para decidir antes de repartir ejecución |
| Programación cotidiana | Claude Code `claude-sonnet-5`, configurado localmente | Codex Sol para un módulo independiente, depuración difícil o falta de cuota de Claude | Aprovechar Max en la ejecución continua sin gastar un modelo profundo en todo |
| Trabajo mecánico delimitado | Gemini Flash, versión disponible por resolver | Codex `gpt-6-luna` si está habilitado en la cuenta | No gastar el contexto del coordinador en transformaciones repetitivas |
| Producto y negocio habitual | Claude Sonnet | Claude Opus, versión habilitada por resolver, para una decisión ambigua/importante | Sonnet redacta y estructura; Opus no se usa para cada borrador |
| Investigación y contraste | Gemini Flash para búsquedas/extracción delimitadas; Gemini Pro para síntesis compleja | Codex Sol para comprobar código o resultados técnicos concretos | Usar fuentes y pruebas; separar recopilación de interpretación |
| Interfaz y recorridos visuales | Antigravity con Gemini Flash disponible y herramientas necesarias | Modelo Pro o Sonnet disponible si el trabajo exige más capacidad | Elegir por acceso al navegador/herramientas y tarea; la marca no garantiza mejor diseño |
| Revisión independiente de código | Si escribió Claude: Codex Sol en otra sesión. Si escribió Codex: Claude Sonnet en otra sesión | Subir capacidad por complejidad del hallazgo, no por rutina | Evitar que el autor se certifique a sí mismo |
| QA funcional | Sesión independiente con navegador y modelo suficiente; Antigravity Flash si lo permite la cuenta | Pro/Sonnet para flujos complejos | Lo decisivo es observar la versión y el comportamiento, no el nombre del modelo |
| Cursor Free | Edición asistida ocasional | Ninguna dependencia obligatoria | No se añade una suscripción ni se bloquea el flujo por una cuota auxiliar |

Esto es una propuesta de organización, no una comparación demostrada de rendimiento.
Gemini Pro/Flash y Opus nombran familias o selectores; antes de lanzar el encargo,
el coordinador resuelve el identificador exacto que tenga la cuenta y lo registra.
Si no está disponible, decide una alternativa suficiente sin inventar acceso.
El usuario autorizó más capacidad para coordinación/arquitectura. Este cambio
actualiza la preferencia del plan, no la sesión en ejecución ni el ajuste global
observado. No se modifica el modelo global para resolver una sola tarea.

## Reglas para no multiplicar consumo

1. Lo pequeño empieza y termina con un ejecutor. No requiere toda la tabla.
2. Una funcionalidad normal usa coordinación + ejecutor; revisión independiente
   cuando el riesgo la justifique, con contexto nuevo y acotado.
3. Para investigación: primero fuentes y una síntesis. No pedir a tres modelos la
   misma búsqueda para luego compararlos por costumbre.
4. Opus y razonamiento alto quedan para alcance ambiguo, decisiones de impacto o
   fallos que no se resuelven con evidencia y capacidad estándar.
5. No enviar el historial completo: encargo, archivos pertinentes, decisiones,
   versión y criterios. El revisor recibe el diff y contexto necesario, sin
   depender de la explicación del autor como única evidencia.
6. Prioridad inicial: aprovechar cuotas incluidas y reducir trabajo repetido.
   No habilitar API de pago, extras ni compras de créditos sin autorización.
7. Registrar tokens/coste si se observan; si no, `no disponible`. Medir tiempo y
   retrabajo cuando sea posible. Menos tokens por intento no demuestra menos coste
   si produce muchas correcciones.
8. Reevaluar con tareas comparables del primer proyecto; no prometer porcentajes
   de ahorro sin medir. No agotar todas las cuotas antes de revisar el resultado.

## Relación con GitHub

El coordinador transforma necesidades en Issues y elige el ejecutor y modelo.
Cada asignación registra rol, herramienta, modelo real, objetivo, límites y
referencia a autorización. El ejecutor entrega PR y evidencia. El revisor informa;
el coordinador integra cuando corresponde. El usuario ve qué se entregó, qué
puede probar y qué decisión de negocio falta, sin gestionar el tablero.

## Fuentes de disponibilidad y selección

Consultadas el 2026-10-26; describen productos, no prueban acceso personal.

- [OpenAI Docs: modelos](https://learn.chatgpt.com/docs/models): Sol para trabajo
  complejo y Luna para tareas delimitadas, con disponibilidad dependiente de cuenta/cliente.
- [OpenAI Docs: consumo](https://learn.chatgpt.com/docs/pricing): el uso de la
  suscripción depende del modelo y del consumo; Plus no se trata como ilimitado.
- [Claude Code: configuración](https://code.claude.com/docs/en/model-config):
  distinguir selector/alias de modelo exacto y registrar el modelo observado.
- [Gemini CLI: selección](https://geminicli.com/docs/cli/model/): Pro para tareas
  complejas y Flash para respuestas rápidas.
- [Antigravity: modelos](https://www.antigravity.google/docs/models/) y
  [planes](https://www.antigravity.google/docs/plans): verificar acceso y límites
  por plan; no presuponer cuota independiente o que el selector muestre todos los modelos.
