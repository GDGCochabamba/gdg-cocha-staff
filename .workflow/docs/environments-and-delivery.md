# Entornos, CLIs y entrega

Esta política describe cómo se opera infraestructura y entrega en apps de
Ventures sin que el responsable tenga que ejecutar comandos. Los agentes
operativos actúan con las cuentas que el responsable autoriza; nunca mezclan
credenciales personales con las de un empleador.

## Separación estricta de cuentas

En proyectos de Ventures (apps personales): **cuenta personal del responsable
siempre**. Nunca credenciales de un empleador o cuenta corporativa. Antes de
ejecutar cualquier comando que use credenciales (`gcloud`, `gh`, `firebase`,
`vercel`, etc.), el agente verifica la cuenta activa y, si no coincide con la
declarada en `.workflow/project.json → cli_access.account`, se detiene y pide
al responsable que cambie contexto. No cambiar silenciosamente.

Ejemplo:

```sh
gh auth status
gcloud auth list
```

Si la cuenta activa aparece en `cli_access.forbidden_accounts`, detener el
trabajo técnico hasta que el responsable confirme.

## Entornos típicos

| Entorno | Propósito | Despliegue |
| --- | --- | --- |
| `local` | Desarrollo en la máquina del responsable; simulador iOS/Android, backend local | Manual con comandos del `REPO.md` |
| `staging` (opcional) | Prueba integrada antes de prod; se añade si el tamaño lo justifica | Manual o CI al merge de PR |
| `prod` | Usuarios finales | Explícito: etiqueta de release o acción manual |

`autodeploy = false` por defecto. Un despliegue a `prod` siempre requiere la
`release_policy = explicit_authorization` vigente, incluso si CI pasa.

## Ramas y tags

- **Rama por defecto**: `main`. Protegida en los repos que soportan producción.
- **Trabajo**: una rama por Issue, naming `issue-NNN-breve-descripcion` o lo
  que decida el proyecto; registrado en `REPO.md`.
- **Tags de release**: `vMAJOR.MINOR.PATCH` siguiendo SemVer para artefactos
  publicables. El coordinador crea el tag al publicar; el changelog del repo
  resume cambios.
- **Pre-releases**: `vX.Y.Z-rc.N` opcional para ensayos.

## CLIs y herramientas por rol de repo

Cada `REPO.md` lista los CLIs necesarios y su versión mínima observada. Ejemplos:

- `backend` FastAPI + Cloud Run → `gcloud`, `python 3.11+`, `uv`/`pip`.
- `mobile` Flutter → `flutter` SDK estable, Xcode (iOS), Android Studio.
- `docs` → ninguno más allá de `git` y `gh`.

Los agentes operativos verifican disponibilidad y versión antes de arrancar.
Instalar o actualizar un CLI es una acción con efecto en la máquina; se avisa
al responsable antes.

## Entrega final

Cuando el responsable pide "entrégame la app desplegada", eso significa:

1. Código mergeado en `main` de los repos involucrados, con etiqueta de release.
2. Infraestructura aplicada (Cloud Run, DB, buckets, Firebase, etc.) con la
   cuenta personal del responsable.
3. URL o binario accesible, documentado en el PR de release y en `STATUS.md`.
4. Playwright/simulador: traza del recorrido principal funcionando contra el
   entorno real.
5. Costes recurrentes activos y proyección mensual registrada; alertas de
   presupuesto configuradas si el proveedor las permite.

Entregar no es validar. La aceptación de negocio del responsable es otra pasada.
