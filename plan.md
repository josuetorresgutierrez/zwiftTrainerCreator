# Plan Técnico por Sprints

## Objetivo
Construir **Zwift Workout Composer** de forma incremental, priorizando primero el núcleo funcional: editor, parser, validación, preview y exportación.

## Regla de ejecución
- No avanzar al siguiente sprint si el anterior no está funcional.
- No construir UI secundaria antes de cerrar el flujo principal.
- Cada sprint debe dejar algo usable.

## Dependencias globales
- El modelo de datos depende de los requisitos funcionales.
- El parser depende del modelo de datos.
- La validación depende del parser.
- La preview depende del parser y la validación.
- La exportación depende de la estructura validada.
- La biblioteca depende de la persistencia base.

## Sprint 0: Alineamiento inicial
### Objetivo
Cerrar decisiones base antes de escribir código.

### Checklist
- [ ] Confirmar alcance exacto del MVP.
- [ ] Definir idioma final de la UI.
- [ ] Confirmar stack frontend.
- [ ] Confirmar formato de exportación objetivo de Zwift.
- [ ] Definir qué métricas entran en el MVP.
- [ ] Definir estructura de carpetas inicial.

### Dependencias
- Ninguna.

### Hecho cuando
- Existe una decisión clara de producto y arquitectura.

## Sprint 1: Modelo de dominio
### Objetivo
Definir la estructura interna del workout.

### Checklist
- [ ] Modelar bloques de warmup, steady, interval, recovery, cooldown y repeat set.
- [ ] Modelar duración, intensidad, cadencia y repeticiones.
- [ ] Modelar intensidades en W, %FTP y zonas.
- [ ] Definir representación de errores del parser.
- [ ] Definir estructura del resultado validado.

### Dependencias
- Sprint 0 terminado.

### Hecho cuando
- El sistema puede representar un entrenamiento sin depender de la UI.

## Sprint 2: Editor DSL
### Objetivo
Construir el punto de entrada principal del usuario.

### Checklist
- [ ] Implementar editor de texto con numeración de líneas.
- [ ] Permitir edición de FTP y bloques.
- [ ] Mostrar ayuda contextual mínima.
- [ ] Resaltar la estructura básica de la DSL.
- [ ] Mostrar estado vacío con ejemplo cargable.
- [ ] Conectar el editor con el estado de aplicación.

### Dependencias
- Sprint 1 terminado.

### Hecho cuando
- El usuario puede escribir un workout completo en el editor.

## Sprint 3: Parser
### Objetivo
Interpretar el texto y convertirlo en estructura interna.

### Checklist
- [ ] Parsear FTP.
- [ ] Parsear duraciones en segundos y minutos.
- [ ] Parsear intensidades absolutas y relativas.
- [ ] Parsear repeticiones simples.
- [ ] Parsear bloques anidados.
- [ ] Parsear comentarios o separadores si se permiten.
- [ ] Generar errores con ubicación clara.

### Dependencias
- Sprint 1 terminado.
- Sprint 2 terminado para pruebas manuales.

### Hecho cuando
- Una entrada válida produce un árbol interno estable.

## Sprint 4: Validación
### Objetivo
Detectar errores antes de exportar.

### Checklist
- [ ] Validar tiempos inválidos.
- [ ] Validar potencias incoherentes.
- [ ] Validar repeticiones mal definidas.
- [ ] Validar duración total inconsistente.
- [ ] Validar faltas de FTP cuando sea necesario.
- [ ] Mostrar errores inline y resumen general.

### Dependencias
- Sprint 3 terminado.

### Hecho cuando
- El usuario entiende qué corregir sin leer logs técnicos.

## Sprint 5: Preview y métricas
### Objetivo
Mostrar el workout de forma entendible antes de exportar.

### Checklist
- [ ] Calcular duración total.
- [ ] Calcular IF aproximado.
- [ ] Calcular TSS estimado.
- [ ] Calcular distribución por zonas.
- [ ] Renderizar gráfico de potencia por tiempo.
- [ ] Marcar bloques visualmente.
- [ ] Mostrar métricas resumidas.

### Dependencias
- Sprint 3 terminado.
- Sprint 4 terminado.

### Hecho cuando
- El usuario puede validar visualmente el entrenamiento completo.

## Sprint 6: Exportación Zwift
### Objetivo
Generar el archivo final compatible con Zwift.

### Checklist
- [ ] Definir generador de salida.
- [ ] Convertir la estructura validada al formato de Zwift.
- [ ] Bloquear exportación si hay errores.
- [ ] Implementar descarga del archivo.
- [ ] Mostrar éxito o fallo de exportación.
- [ ] Incluir CTA principal de exportación.

### Dependencias
- Sprint 4 terminado.
- Sprint 5 terminado.

### Hecho cuando
- Un workout válido puede descargarse sin pasos extra.

## Sprint 7: Persistencia mínima
### Objetivo
Guardar plantillas y reutilizar entrenamientos.

### Checklist
- [ ] Guardar plantillas.
- [ ] Guardar favoritos.
- [ ] Guardar histórico de exportaciones.
- [ ] Permitir duplicar una plantilla existente.
- [ ] Permitir recuperar borradores.

### Dependencias
- Sprint 1 terminado.
- Sprint 6 terminado para guardar exportaciones.

### Hecho cuando
- El usuario no necesita reconstruir el mismo workout cada vez.

## Sprint 8: Dashboard
### Objetivo
Dar una entrada clara a la app.

### Checklist
- [ ] Crear home/dashboard con métricas clave.
- [ ] Mostrar plantillas recientes.
- [ ] Mostrar sesiones recientes.
- [ ] Añadir CTA de nuevo entrenamiento.
- [ ] Reducir el peso del sidebar en responsive.

### Dependencias
- Sprint 6 terminado.
- Sprint 7 terminado parcialmente o con datos mock.

### Hecho cuando
- La app tiene una pantalla de entrada útil y clara.

## Sprint 9: Pulido final
### Objetivo
Cerrar calidad visual y técnica.

### Checklist
- [ ] Revisar responsive.
- [ ] Revisar accesibilidad básica.
- [ ] Revisar contraste y legibilidad.
- [ ] Limpiar ruido visual innecesario.
- [ ] Corregir edge cases del parser.
- [ ] Corregir edge cases de exportación.
- [ ] Revisar estados vacíos y errores.

### Dependencias
- Todos los sprints anteriores cerrados.

### Hecho cuando
- La app se siente sólida y lista para uso real.

## Orden recomendado de implementación
1. Sprint 0.
2. Sprint 1.
3. Sprint 2.
4. Sprint 3.
5. Sprint 4.
6. Sprint 5.
7. Sprint 6.
8. Sprint 7.
9. Sprint 8.
10. Sprint 9.

## Definición de MVP
El MVP está completo cuando existe esto:
- Editor DSL funcional.
- Parser funcional.
- Validación inmediata.
- Preview clara.
- Exportación Zwift.

## Criterio general de avance
No se pasa de sprint si no se puede demostrar manualmente que el flujo principal funciona de punta a punta.
