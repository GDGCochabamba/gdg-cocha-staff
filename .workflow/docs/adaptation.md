# Adaptación de Epic Flow Kit a Ventures

Fecha: 2026-11-01 · Versión: 0.3.1. El ZIP original y sus hashes se conservan en
`source/`. Su estado original era «derived, not independently ratified».
Los archivos fuente se preservan como referencia, no se instalan como reglas.

## Decisiones de esta edición

Las opciones siguientes son valores iniciales documentados de la adaptación
solicitada. No se afirma que el usuario haya ratificado cada política por separado.
Cada instancia puede cambiarlas explícitamente antes de usarlas.

| Tema / referencia del kit | Tratamiento en Ventures |
| --- | --- |
| Negocio → técnico → ejecución → QA → aceptación | Se conserva para funcionalidades; recorrido breve para tareas pequeñas |
| Arquitecto nunca ejecuta; separación rígida de cinco roles | Roles funcionales; una sesión puede cambiar de rol con registro. La independencia de QA no se simula |
| Gate 1: DoR y segunda confirmación | Default `task_authorization`: autorización suficiente del encargo más read-back informativo. Modo estricto opcional `readback_confirmation` |
| Gate 2 y operaciones restringidas | Autoridad humana conservada; una autorización explícita existente cuenta. Preparar entrega concreta antes de pedir una autorización faltante |
| Tech Principal / Business Owner / Production Owner | Usuario responsable del negocio; autoridad técnica y operación delegadas al coordinador agente, con límites registrados |
| Canon: seis páginas ratificadas antes de todo desarrollo | Fundamentos proporcionales al riesgo y superficie. Un pendiente bloquea solo tareas que dependan de él |
| Tracker y wiki externos obligatorios | GitHub Issues/PR preferidos por instrucción del usuario; documentos versionados; archivos como alternativa explícita |
| Ramas integration → main y ventana diaria | Topología por proyecto. El kit no crea ramas, repositorios ni protecciones |
| Evidencia que puede detectar fallos | Se conserva. Regresión para lógica relevante; se elimina exigir un test artificial por cada edición de bajo impacto |
| CI siempre gana | Se registra e investiga toda discrepancia; un verde no borra un rojo |
| QA solo stage; móvil solo stage | Entorno de prueba adecuado por proyecto; no se inventa staging cuando solo hay prototipo local |
| Retest solo fallos anteriores | Fallos más regresiones razonables por el cambio |
| Inglés obligatorio y dos locales | Documentación y comunicación en español por defecto; identificadores según convención del código; idiomas de producto configurables |
| Textos pendientes no frenan desarrollo | Puede usarse contenido provisional identificado; no equivale a autorizar publicación de textos legales pendientes |
| Marketing, ventas, multirregión, apps nativas | Módulos opcionales, no obligaciones para cualquier app |
| Frameworks de orquestación | No se instala ninguno. Adaptadores originales son referencia, no infraestructura validada aquí |
| Reglas retiradas / números históricos | No se reactivan. Se conservan en la fuente para trazabilidad |

## Aclaración del usuario incorporada en 0.2.0

El usuario indicó que no quiere ocuparse de tareas técnicas y que usaremos GitHub
para tickets en lugar de Jira. Esas dos preferencias sí son instrucciones expresas:
roles humanos de negocio/aceptación, coordinación técnica por agentes y GitHub como
tracker preferido. Los demás valores iniciales siguen siendo configurables.
No se ha conectado un repositorio ni creado un tablero solo por editar el kit.

## Aclaración incorporada en 0.2.1

Se admite más capacidad para coordinación y arquitectura en el perfil personal.
Se añade un arranque conversacional de nuevas apps y se distingue el método de
un mecanismo persistente de ejecución. Tener un objetivo de negocio documentado
no equivale a haber validado el mercado ni a tener todo el alcance cerrado.

## Decisiones incorporadas en 0.3.0

El responsable confirmó dos preferencias que ajustan el método:

- **Decisiones técnicas al inicio, sin recorrido de investigación.** Para apps,
  el stack y los fundamentos se cierran en la conversación de arranque. Se retira
  el tipo `type:research` y su plantilla de Issue; "investigar" sigue siendo una
  actividad legítima dentro de un encargo normal, no un recorrido propio.
- **QA siempre levanta la app y la prueba.** Para UI, Playwright por defecto;
  para API u otras superficies, prueba ejecutable equivalente. El verde de CI
  no sustituye a esta comprobación.

Además:

- `PROJECT.md` y `docs/foundation/architecture.md` pasan a ser plantillas guiadas
  que se completan en la conversación de arranque, no huecos que arrastran "pendiente".
- `STATUS.md` añade una vista corta por app para el responsable.
- Un GitHub Project por aplicación como estándar documentado.

## Decisiones incorporadas en 0.3.1

- **Pipeline explícito de agentes** con un prompt por agente concreto
  (CEO / epic-writer / arquitecto / ejecutor / QA), no funciones abstractas.
  El arquitecto no está "siempre on"; se abre cuando toca descomponer o responder
  un read-back pendiente.
- **Apps multi-repo** como caso soportado, con roles `docs`/`backend`/`mobile`/
  `fe`/`other` y Project único por app a nivel de organización.
- **Separación estricta de cuentas**: proyectos Ventures usan la cuenta personal
  del responsable; nunca credenciales del empleador. `cli_access` lo registra.
- **Entornos, CLIs y tags** documentados en `environments-and-delivery.md`; se
  evitan automatizaciones de despliegue a producción por defecto.
- **Read-back** se publica como comentario del Issue con formato fijo; si hay
  dudas, se marca con `needs:readback-answer` y el arquitecto responde.
- **Asignación agente/modelo por tipo+esfuerzo** del Issue, tabla en el perfil
  personal (routine → Antigravity+Flash/Haiku, standard → Sonnet/Sol, deep →
  Opus/Astra).

## Qué queda para cada producto

Cliente, problema, propuesta de valor, alcance, fechas, presupuesto, stack, datos,
permisos, canales de entrega, necesidad de QA, repositorios y autorización para
publicar. Ninguna regla de fútbol, fintech, ecommerce u otro dominio entra al núcleo.

## Cambiar el método

Registrar motivo, alternativa, efecto, responsable de la decisión y versión.
No renombrar la misma regla en varios archivos contradictorios. Los prompts
remiten a los documentos; no duplican el método completo. Las apps mantienen su
versión hasta una actualización revisada, sin sincronización automática.
