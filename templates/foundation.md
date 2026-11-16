# Fundamentos de la aplicación

Versión: inicial · responsable: por definir · estado: pendiente.

Checklist de decisiones mínimas que se cierran en la conversación de arranque
antes del primer Issue de implementación. Marcar cada punto cuando esté resuelto.
No simular arquitectura aprobada; dejar fuera lo que de verdad no aplica.

## Técnico

- [ ] **Stack elegido** (lenguaje, framework, versión mayor). Alternativas descartadas y por qué.
- [ ] **Forma del sistema**: componentes y sus límites (frontend, backend, DB, workers, integraciones).
- [ ] **Modelo de datos** inicial: entidades principales y aislamiento entre usuarios/organizaciones si aplica.
- [ ] **Autenticación y autorización**: proveedor, método, roles iniciales.
- [ ] **Interfaz y diseño**: dónde vive, sistema de diseño o referencia, accesibilidad básica si tiene UI.
- [ ] **Entornos**: dev local, cualquier staging o preview, producción. Cuáles existen desde el día 1.
- [ ] **Configuración y secretos**: gestor, dónde vive cada variable, qué nunca entra al repo.
- [ ] **Pruebas**: nivel mínimo esperado (unit, integración, Playwright para UI). QA de revisión siempre levanta la app.
- [ ] **Observabilidad**: logs, errores, trazas mínimas para operar.

## Entrega y operación

- [ ] **Mecanismo de despliegue** y a qué proveedor.
- [ ] **Dominio** (si aplica) y DNS.
- [ ] **Repositorio** autorizado conectado en GitHub.
- [ ] **CI mínima** aplicable al stack elegido (build + tests + lint).

## Producto y negocio

- [ ] **Datos personales** o regulados que se tocan y requisitos aplicables (RGPD, consentimiento, etc.).
- [ ] **Idiomas** de producto desde el día 1.
- [ ] **Costes recurrentes** previstos (hosting, DB, servicios SaaS) y presupuesto.
- [ ] **Textos legales** mínimos si hay público (términos, privacidad) y cuándo se incorporan.

## Referencias

Enlaces a decisiones aceptadas en `decisions/` y pendientes que bloqueen una tarea
concreta. Separar en varios documentos solo cuando el tamaño lo justifique;
mantener una fuente por decisión. No inferir requisitos de una app anterior.
