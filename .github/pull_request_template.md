## Resultado

Qué problema resuelve y qué comportamiento cambia.

## Issue

Refs #N. Sustituir por Closes #N únicamente si la fusión completa ese Issue.

## Verificación

Pruebas y resultados, commit evaluado y limitaciones. **La revisión levanta la
app y ejecuta el recorrido afectado**: para UI, Playwright con captura o trace;
para API u otras superficies, prueba ejecutable equivalente contra la app
corriendo. No basta con "los tests pasan" ni con el verde de CI. No escribir
PASS para lo no comprobado.

## Revisión e integración

Revisor/sesión independiente cuando corresponda; hallazgos resueltos; delegación
y permisos aplicables. El coordinador resuelve la operación técnica.

## Efectos y pendientes

Migraciones, configuración, datos, despliegue o aceptación de negocio pendientes.
No incluir secretos. La aceptación del usuario evalúa el producto, no el código.
