# Encargo de QA independiente

Tarea: {{TASK_ID}} · ronda: completar · artefacto/commit: completar.
Entorno/URL: completar. Producción no está autorizada por esta plantilla.

Lee el rol QA. Confirma versión; usa solo las cuentas y acciones de prueba
indicadas. No incluyas secretos en este documento. No repares durante la revisión.

**Levanta la app antes de empezar.** Para UI, la herramienta por defecto es
Playwright: captura o trace por caso. Para API u otras superficies, una prueba
ejecutable equivalente contra la app corriendo. No se declara PASS por lectura
de código ni por verde de CI.

## Acceso y acciones permitidas

Completar método de acceso, datos de prueba, cambios permitidos y límites.
Comando(s) para levantar la app y URL/puerto resultante: completar.

## Casos

| Criterio | Pasos | Resultado esperado | Evidencia (trace/captura/log) |
| --- | --- | --- | --- |
| AC-1 | Completar | Completar | Completar |

Cubrir estados y superficies relevantes: vacío, carga, error, éxito, doble envío,
recarga, navegación, permisos y accesibilidad básica cuando apliquen. El retest
incluye fallos corregidos y regresiones razonables. No inventar umbrales de rendimiento.

## Informe

Veredicto PASS / FAIL / BLOCKED; versión/entorno; criterios PASS / FAIL / NOT_TESTED
con evidencia; defectos numerados y reproducibles; impacto; datos tocados;
limitaciones y pendientes. Un fallo importante sin resolver impide declarar
aprobación. La autorrevisión del ejecutor no cuenta como esta revisión independiente.
