Sería una aplicación especializada cuya finalidad es:
transformar una descripción simple de un entrenamiento —por ejemplo texto, plantillas o copiar/pegar desde una tabla— en un workout estructurado compatible con Zwift, listo para importar.
En términos de análisis funcional, el producto sería un:
“Editor inteligente de entrenamientos por intervalos con exportación a formato Zwift”
Problema que resuelve
Ahora mismo tu dolor es claro:
Zwift te obliga a construir el entreno bloque a bloque
no permite un flujo cómodo de copiar/pegar estructura
repetir patrones es lento
ajustar tiempos y vatios uno por uno es tedioso
reutilizar entrenos similares consume demasiado tiempo
Eso indica que falta una capa de software más productiva entre la idea del entreno y el archivo final.
Qué debería permitir ese software
1. Entrada rápida del entrenamiento
El sistema debería aceptar entrenos en formatos cómodos, por ejemplo:
texto libre
tabla
sintaxis abreviada
plantillas reutilizables
Ejemplo de entrada:
Calentamiento 10m de 100 a 180w
6x (2m a 280w + 1m a 150w)
5m a 200w
Enfriamiento 10m de 180 a 100w
El software interpretaría esto y generaría automáticamente la estructura.
2. Biblioteca de bloques reutilizables

Debería permitir guardar componentes como:

calentamiento estándar
series VO2max
bloques Sweet Spot
bloques de recuperación
enfriamientos

Así construirías entrenos ensamblando piezas, no rehaciendo todo cada vez.
3. Parámetros relativos

Muy importante para ciclismo:

vatios absolutos
porcentaje de FTP
zonas de potencia
cadencia objetivo
repetición de bloques

Ejemplo:

5x(3m@110% FTP + 2m@55% FTP)

Esto es mucho mejor que meter cada valor manualmente.

4. Vista previa del entrenamiento

Antes de exportar, el usuario debería ver:

duración total
IF aproximado
TSS estimado
gráfico de potencia por tiempo
distribución por zonas

Eso convierte la herramienta en algo más que un editor: la vuelve útil para análisis.

5. Exportación compatible con Zwift

La salida debería generar el archivo que Zwift pueda leer, normalmente un workout file estructurado según el formato que Zwift interpreta. La clave del producto no es dibujar bloques visualmente, sino generar el archivo correcto automáticamente.

Definición funcional formal

Si tuviera que redactarlo como analista, lo definiría así:

Nombre funcional

Sistema de Definición, Edición y Exportación de Entrenamientos Estructurados para Zwift

Objetivo

Permitir a ciclistas y entrenadores crear, editar, reutilizar y exportar entrenamientos por intervalos de manera rápida mediante una interfaz textual, tabular o visual, reduciendo drásticamente el tiempo de construcción manual bloque a bloque.

Usuarios objetivo
ciclistas que crean sus propios entrenos
entrenadores
deportistas con planes repetitivos
usuarios de Zwift que necesitan rapidez y reutilización
Requisitos funcionales clave
RF1. Crear entrenamientos desde texto estructurado

El usuario podrá escribir una descripción sintética del entreno y el sistema la convertirá en bloques.

RF2. Crear entrenamientos desde editor visual

El usuario podrá añadir bloques de tipo:

warm-up
steady state
interval
ramp up/down
recovery
repeat set
RF3. Duplicar y repetir bloques

El sistema permitirá clonar bloques o series completas y cambiar parámetros globalmente.

RF4. Usar valores relativos

El usuario podrá definir intensidad en:

vatios
%FTP
zonas
RF5. Validar entrenamientos

El sistema detectará errores como:

tiempos inválidos
potencias incoherentes
repeticiones mal definidas
duración total inconsistente
RF6. Guardar plantillas

El usuario podrá almacenar entrenamientos o fragmentos reutilizables.

RF7. Exportar a Zwift

El sistema generará el archivo compatible con Zwift para importación directa.

RF8. Analizar sesión

El sistema mostrará métricas agregadas y perfil gráfico del entreno.

Requisitos no funcionales
interfaz muy rápida
curva de aprendizaje baja
exportación fiable
compatibilidad multiplataforma
persistencia de biblioteca
validación inmediata
tiempos de respuesta cortos
Arquitectura recomendada

Como experto analista, haría esta separación:

1. Módulo de entrada

Responsable de interpretar:

texto
formularios
tablas
plantillas
2. Motor de parsing

Convierte una sintaxis humana en una estructura interna. Este es el núcleo diferencial.

Ejemplo interno:

[
  {"type":"warmup","duration":600,"start_power":100,"end_power":180},
  {"type":"repeat","times":6,"steps":[
    {"type":"interval","duration":120,"power":280},
    {"type":"recovery","duration":60,"power":150}
  ]},
  {"type":"steady","duration":300,"power":200},
  {"type":"cooldown","duration":600,"start_power":180,"end_power":100}
]
3. Motor de reglas

Calcula:

duración total
validaciones
conversión FTP ↔ vatios
coherencia de rangos
4. Generador de salida

Transforma la estructura interna al formato de Zwift.

5. Interfaz de usuario

Dos vistas ideales:

modo rápido: editor de texto
modo visual: bloques y gráfico
6. Repositorio

Guarda:

entrenos
plantillas
favoritos
histórico de exportaciones
MVP recomendado

Si quisieras construirlo sin sobrediseñar, el MVP debería incluir solo esto:

editor de texto con sintaxis simple
parser de bloques y repeticiones
vista previa del entreno
exportación a Zwift
guardado de plantillas básicas

Con eso ya resuelves el 80% del problema real.

Sintaxis recomendada para el usuario

La clave del éxito es una sintaxis mínima pero potente. Por ejemplo:

FTP=250

WU 10m 50%-75%
4x(5m@95% + 2m@60%)
8x(30s@150% + 30s@50%)
CD 10m 70%-40%

Esto es muchísimo más eficiente que editar a mano.

Valor real del producto

El valor no está en “hacer otro editor bonito”, sino en estos puntos:

velocidad de creación
reutilización
reducción de errores
parametrización por FTP
exportación inmediata
análisis previo del entreno
Conclusión analítica

La definición experta sería esta:

Necesitas un software de autoría de entrenamientos estructurados, centrado en un lenguaje de definición de intervalos y un motor de exportación compatible con Zwift, para eliminar la edición manual bloque a bloque y permitir crear sesiones complejas mediante texto, plantillas y reglas reutilizables.

Dicho de forma más práctica:

no necesitas solo un editor; necesitas un “traductor inteligente de entrenos” hacia Zwift.

Puedo darte ahora la siguiente capa: una especificación completa del software con módulos, casos de uso, historias de usuario y stack técnico recomendado, como si fueras a encargárselo a un desarrollador.