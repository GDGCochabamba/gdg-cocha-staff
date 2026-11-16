# Aplicaciones multi-repo

Una app puede vivir en un solo repositorio o en varios. El método trata a los
repos como roles con nombre, no como "principal y accesorios".

## Roles sugeridos

| Rol | Qué guarda | Ejemplos típicos |
| --- | --- | --- |
| `docs` | Documento de negocio, épicas de negocio, decisiones duraderas, STATUS.md público, assets de diseño | README, PITCH, business epics |
| `backend` | API, modelos de datos, migraciones, lógica de negocio, infra de servidor | FastAPI, Rails, Go, etc. |
| `mobile` o `fe` | Cliente que consume la API | Flutter, React Native, Next.js, SPA |
| `other` | Herramientas internas, scripts, infra compartida que no cabe en los otros | Terraform, GitHub Actions compartidas |

El nombre exacto del repo depende de la app; `.workflow/project.json` guarda la
tabla `repositories` con `{role, slug, connection_state}`.

## Dónde vive cada cosa

- **Épicas de negocio**: Issues `type:business` + `scope:epic` en `docs`, con el
  cuerpo o un enlace al documento aprobado.
- **Épicas técnicas**: Issues `type:technical` + `scope:epic` en `docs` cuando
  cruzan varios repos; en el repo dominante cuando solo afectan a uno.
- **Tickets técnicos**: Issues `type:technical` en el repo que contiene el código
  afectado. Si tocan `backend` y `mobile`, se abre uno por repo y se enlazan
  entre sí.
- **Decisiones duraderas** (`decisions/<ID>.md`): en `docs`.
- **STATUS.md**: en `docs`. La instancia local lo mantiene sincronizado si
  conviene tener copia local.

## GitHub Project por aplicación

Un único Project por app, a nivel de organización, agrupa Issues de todos los
repos. El Project filtra por repo con un campo o vista; los estados siguen
siendo las etiquetas del Issue (`status:*`).

## Flujo cuando un ticket cruza repos

1. El arquitecto abre la épica técnica en `docs` con checklist de hijos:
   `- [ ] appcitas-jubilacion/backend#12`, `- [ ] appcitas-jubilacion/mobile#7`.
2. Cada hijo vive en su repo correspondiente, con criterios locales.
3. QA final del flujo e2e cierra la épica cuando todos los hijos están cerrados
   y el recorrido funciona con la app levantada (Playwright/simulador).
4. Las decisiones de arquitectura compartida (contrato de API, formato de
   tokens, etc.) se registran en `docs/decisions/` y se enlazan desde ambos
   hijos.

## El generador no crea los repos

`scripts/new_project.py` solo registra los repos declarados en
`.workflow/project.json`. No ejecuta `gh repo create`, no abre PRs ni etiquetas.
El coordinador (en una sesión con `gh` autenticado y la cuenta correcta) crea
los repos reales, aplica `config/github-labels.json` y conecta el Project.
