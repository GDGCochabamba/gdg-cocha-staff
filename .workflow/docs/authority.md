# Autoridad y autorizaciones

Política inicial adaptable, registrada por instancia. No sustituye permisos del
sistema operativo, del sandbox, del proveedor ni del servicio conectado.

## Decidir y proceder

Dentro de un encargo autorizado: leer lo relevante, investigar, editar código o
documentación, ejecutar pruebas y builds locales, corregir fallos y preparar una
entrega revisable. No volver a pedir permiso por cada paso reversible necesario.
Las decisiones técnicas delegadas las resuelve el agente con evidencia.

La autorización existente persiste dentro de su alcance. El read-back se registra,
pero no constituye una segunda barrera automática. Solo el modo explícito
`readback_confirmation` exige esa confirmación aparte.

## Antes de una acción con efectos externos o difíciles de revertir

Comprobar si la instrucción actual o una autorización registrada ya cubre la acción.
Si la cubre, seguir dentro de sus condiciones. Si no: preparar el cambio, su efecto,
salvaguarda y reversión para que la autorización final sea concreta.

Esto aplica especialmente a nuevos costes, despliegues, migraciones compartidas,
cambios de DNS o credenciales, borrados, merge en ramas compartidas, datos reales
y comunicaciones a terceros. No se envían correos o mensajes sin instrucción
explícita. Una instrucción de «revisar» no autoriza «publicar».

No inventar un permiso ni convertir el paso del tiempo en aprobación. Registrar
la referencia del encargo o autorización y sus límites; no exigir un formato de
ticket si la instrucción humana ya es clara y suficiente.

## Responsable y roles acumulados

Cada instancia configura un responsable humano de negocio y un coordinador técnico
agente. El usuario define problema, prioridades, presupuesto y aceptación del
producto. No tiene que elegir frameworks, revisar PRs, operar tickets o fusionar
ramas. El coordinador resuelve esas tareas dentro de la delegación registrada.

La política inicial `delegated_after_checks` permite al coordinador integrar el
trabajo técnico autorizado cuando cumple criterios, revisión y comprobaciones
aplicables y el repositorio lo permite. No elimina protecciones ni autoriza gastos,
publicación externa o cambios de datos por sí sola. Si el servicio exige una acción
humana de cuenta o permiso, se explica y se pide esa acción concreta; no se deriva
al usuario el análisis técnico.

Un agente no se atribuye la decisión comercial ni la titularidad humana de una
cuenta. No hace falta nombrar cinco personas para usar el método.

## Detenciones

Si falta autorización, hay contradicción vinculante, aparece un gasto fuera del
presupuesto o un impedimento real: detener solo el trabajo dependiente, explicar
qué falta y continuar lo independiente que sea útil y autorizado. No reiterar
escalaciones vacías ni sortear un rechazo mediante otra herramienta.

No modificar en silencio el objetivo para evitar una decisión ni imponer una
regla histórica del ZIP como si estuviera ya adoptada.
