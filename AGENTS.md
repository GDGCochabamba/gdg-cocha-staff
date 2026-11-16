# DevFest Cochabamba 2026 Staff · entrada de agentes

Método: Epic Flow · Ventures 0.3.1. Configuración: `.workflow/project.json`.

1. Lee `PROJECT.md`, `REPO.md` y la tarea concreta.
2. Lee `.workflow/docs/operating-model.md` y `.workflow/docs/authority.md` al iniciar
   o al cambiar de versión. Carga solo el prompt del rol correspondiente en
   `.workflow/prompts/` y las referencias relevantes.
3. Comprueba el estado del repositorio y respeta cambios ajenos. Resuelve dentro
   del encargo; no amplíes alcance, gasto ni permisos por tu cuenta.
4. La autorización previa suficiente cuenta; no pidas confirmaciones repetidas.
   Si `entry_policy` exige confirmación del read-back, comprueba que exista.
5. Usa el recorrido breve para trabajo pequeño y el de épicas para capacidades
   o riesgo relevante. Registra pruebas y límites sin simular QA independiente.
6. El usuario decide negocio y aceptación. El coordinador lleva arquitectura,
   código, revisión, tickets e integración dentro de la autorización. No le
   asignes al usuario trabajo técnico.
7. Estado y prioridad en GitHub Issues según `.workflow/docs/github-workflow.md`.
   En modo local explícito: task.json y backlog.json. Decisiones en `decisions/`;
   cierre de sesión en `.workflow/control-log.md`.
8. Un ejecutor por defecto; no iniciar otros agentes sin solicitud o permiso
   aplicable de la sesión. Consulta `.workflow/docs/agents-and-cost.md` al asignar.

Este archivo no instala herramientas ni concede permisos externos. Las
instrucciones del usuario y las restricciones de la plataforma prevalecen.
