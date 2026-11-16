# Adoptar y actualizar el método

## Aplicación nueva

1. Ejecutar `scripts/new_project.py` con nombre, clave, responsable y destino nuevo.
2. Revisar PROJECT.md y separar confirmado, hipótesis y pendiente.
3. Completar REPO.md y los fundamentos que necesite el primer encargo.
4. El coordinador revisa `.workflow/project.json`: versión, responsable de negocio,
   autoridad técnica agente, idioma, repo GitHub y políticas de inicio/integración/
   publicación. El usuario no tiene que resolver esa configuración técnica.
5. El coordinador crea los Issues y PRs del repo conectado según
   [el flujo GitHub](github-workflow.md). La instancia ya incluye las plantillas
   de `.github/`. En modo local explícito, usar `tasks/<ID>/task.json` y backlog.json.
6. Entregar al agente el prompt de sesión con rol y tarea; registrar evidencia y
   cierre. La herramienta no implementa automáticamente la máquina de estados.

## Aplicación existente

Generar en otra carpeta como área de comparación. Leer las instrucciones existentes,
comparar documentación y aplicar cambios puntuales. Conservar decisiones del
producto e historial. No mover código ni sobrescribir AGENTS.md, CLAUDE.md o
GEMINI.md por rutina. Registrar la versión adoptada y qué se difirió.

## Conectar agentes

La instancia incluye AGENTS.md como entrada común y un prompt de sesión explícito.
En cada herramienta, señalar esa entrada y la tarea; confirmar que la sesión las
leyó. Si requiere un archivo nativo, crear un adaptador breve que remita a AGENTS.md,
sin duplicar las reglas. No asumir que todas las herramientas cargan el mismo
archivo automáticamente.

En Orca, seleccionar el proyecto y entregar un encargo delimitado al agente elegido.
Este kit no llama al CLI de Orca ni inicia trabajadores. Si se pide coordinación,
se usa el mecanismo de la sesión y se respeta la política de delegación vigente.
Cambiar modelo no concede permisos de producto ni convierte al ejecutor en revisor
independiente.

## Actualización

Cada instancia guarda una copia en `.workflow/` y un número de versión. Comparar
esa copia con la nueva versión del kit, registrar las diferencias y aplicar las
relevantes. No copiar sobre adaptaciones locales sin revisión. No usar symlinks a
un núcleo mutable como si fueran una versión fijada.

## Alcance del generador

Solo documentos, plantillas de GitHub y directorios. No crea Issues ni Projects,
no instala paquetes, no despliega, no inicia Git,
no abre cuentas, no genera secretos y no autoriza otras acciones. La creación de
una instancia tampoco prueba que sus hipótesis de negocio sean correctas.
