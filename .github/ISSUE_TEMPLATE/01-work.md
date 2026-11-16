---
name: "Trabajo de producto o técnico"
about: "Encargo con objetivo, alcance y criterios verificables"
title: ""
---

## Necesidad y resultado

Para quién, qué problema y qué debe poder hacer al terminar. El agente estructura
el encargo; el usuario no necesita redactar detalles técnicos.

## Alcance y decisiones

Dentro/fuera, referencias a producto, decisiones vinculantes/delegadas y dependencias.

## Criterios

- [ ] AC-1: resultado observable y cómo comprobarlo.

## Repo(s) afectado(s)

Marcar `docs` / `be` / `fe` / otro según aplique. Si cruza varios repos, enlazar
los PRs relacionados en comentarios.

## Asignación

- Tipo: una de `type:technical` / `type:business` / `type:bug`
- Esfuerzo: una de `effort:routine` / `effort:standard` / `effort:deep`
- Herramienta y modelo esperados: según la tabla del perfil (`.workflow/profiles/personal/agent-plan.md`).
- Autorización vigente: referencia o "autorización del encargo".
- Acciones externas que aún requieran aprobación: listar o "ninguna".

## Read-back del ejecutor

El ejecutor publica esto como **comentario del Issue** antes de arrancar; no
editar la plantilla. Formato:

- **Entendí que tengo que:** (reformular el objetivo en una línea)
- **Voy a reutilizar:** (archivos, módulos, dependencias existentes)
- **Voy a comprobar con:** (test, Playwright, inspección, levantar la app)
- **Dudas que resuelvo yo mismo:** (decisiones delegadas que tomo sin preguntar)
- **Dudas para el arquitecto:** si hay, añadir etiqueta `needs:readback-answer` y
  esperar respuesta; si no, "ninguna" y arranco.

En modo `task_authorization` (por defecto) el ejecutor no espera confirmación si
no hay dudas abiertas. En modo `readback_confirmation` espera un ✅ explícito.

## Entrega y aceptación

Evidencia, PR y verificación necesarias; distinguir entrega técnica y aceptación
humana del producto. La revisión levanta la app (Playwright para UI). El estado
se lleva con la etiqueta correspondiente.
