import { useState } from 'react';

import { dslHints, dslShortcuts, starterDsl } from './data/dsl';
import { nextSprintChecklist, sprintZeroDecisions } from './data/sprint0';
import {
  getWorkoutBlockCount,
  getWorkoutDurationSeconds,
  sampleWorkoutPlan,
  workoutBlockKinds,
} from './domain/workout';
import { buildWorkoutPreview } from './domain/preview';
import { buildZwiftWorkoutFileName, downloadZwiftWorkout } from './export/zwiftExport';
import { describeBlock, parseWorkoutDsl } from './parser/workoutDsl';
import { formatDuration } from './utils/formatWorkout';
import { formatDateTime } from './utils/date';
import { formatDecimal, formatPercent } from './utils/number';
import { countLines, splitLines } from './utils/text';
import {
  createExportId,
  createTemplateId,
  duplicateTemplate,
  loadExports,
  loadTemplates,
  saveExport,
  saveTemplates,
  type ExportRecord,
  type WorkoutTemplate,
} from './storage/library';

function App() {
  const [dsl, setDsl] = useState(starterDsl);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>(() => loadTemplates());
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>(() => loadExports());
  const lines = splitLines(dsl);
  const parsedWorkout = parseWorkoutDsl(dsl);
  const parsedDuration = getWorkoutDurationSeconds(parsedWorkout.blocks);
  const preview = buildWorkoutPreview(parsedWorkout);
  const errorCount = parsedWorkout.issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = parsedWorkout.issues.filter((issue) => issue.severity === 'warning').length;
  const parserIsReady = errorCount === 0 && parsedWorkout.blocks.length > 0;

  const handleExport = () => {
    if (!parserIsReady) return;
    downloadZwiftWorkout(parsedWorkout, preview);
    const record: ExportRecord = {
      id: createExportId(),
      title: parsedWorkout.title,
      fileName: buildZwiftWorkoutFileName(parsedWorkout.title),
      exportedAt: new Date().toISOString(),
    };
    setExportHistory(saveExport(record));
  };

  const handleSaveTemplate = () => {
    const now = new Date().toISOString();
    const existing = templates.find((template) => template.title === parsedWorkout.title);
    const template: WorkoutTemplate = {
      id: existing?.id ?? createTemplateId(),
      title: parsedWorkout.title,
      dsl,
      updatedAt: now,
    };
    const nextTemplates = [template, ...templates.filter((item) => item.id !== template.id)];
    saveTemplates(nextTemplates);
    setTemplates(nextTemplates);
  };

  const handleLoadTemplate = (template: WorkoutTemplate) => {
    setDsl(template.dsl);
  };

  const handleDuplicateTemplate = (template: WorkoutTemplate) => {
    setTemplates(duplicateTemplate(template));
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#editor">
        Saltar al editor
      </a>
      <aside className="sidebar">
        <div>
          <p className="brand">ZWIFT WORKOUT COMPOSER</p>
          <p className="brand-subtitle">SPRINT_0_READY</p>
        </div>

        <nav className="sidebar-nav" aria-label="Navegación principal">
          <a href="#overview" className="nav-item active">Overview</a>
          <a href="#decisions" className="nav-item">Decisiones</a>
          <a href="#next" className="nav-item">Siguiente sprint</a>
        </nav>

        <button className="primary-action" type="button">
          Nuevo entrenamiento
        </button>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">SPRINT_0 / BASE FOUNDATION</p>
            <h1>Zwift Workout Composer</h1>
          </div>
          <div className="status-pill" aria-live="polite">
            UI en español · Stack definido
          </div>
        </header>

        <main className="content" id="overview">
          <section className="hero-card">
            <div>
              <p className="eyebrow">Objetivo del sprint</p>
              <h2>Dejar la base lista para construir el editor y el parser</h2>
            </div>
            <p className="hero-copy">
              Esta pantalla funciona como punto de partida del proyecto: decisiones base,
              alcance del MVP y próximos pasos claros.
            </p>
          </section>

          <section className="editor-card" id="editor">
            <div className="section-heading editor-heading">
              <div>
                <p className="eyebrow">Sprint 2</p>
                <h2>Editor DSL</h2>
              </div>
              <div className="editor-meta">{countLines(dsl)} líneas · texto editable</div>
            </div>

            <div className="editor-layout">
              <div className="editor-shell">
                <div className="editor-toolbar">
                  <span>SOURCE_CODE</span>
                  <div className="editor-toolbar-state">
                    <span className="dot active" />
                    <span className="dot" />
                  </div>
                </div>

                <div className="editor-body">
                  <div className="line-numbers" aria-hidden="true">
                    {lines.map((_, index) => (
                      <span key={`${index + 1}`}>{String(index + 1).padStart(2, '0')}</span>
                    ))}
                  </div>

                  <textarea
                    aria-label="Editor de entrenamientos DSL"
                    className="dsl-textarea"
                    spellCheck={false}
                    value={dsl}
                    onChange={(event) => setDsl(event.target.value)}
                  />
                </div>

                <div className="editor-footer">
                  <span>UTF-8</span>
                  <span>LF</span>
                  <span>DSL_V1</span>
                </div>
              </div>

              <aside className="editor-aside">
                <div className="aside-card aside-card-highlight">
                  <p className="card-label">Estado actual</p>
                  <h3>Texto editable listo para parseo</h3>
                  <p>
                    El usuario puede cambiar FTP, bloques, repeticiones y comentarios sin salir del flujo.
                  </p>
                  <button className="secondary-action" type="button" onClick={handleSaveTemplate}>
                    Guardar plantilla
                  </button>
                </div>

                <div className="aside-card">
                  <p className="card-label">Atajos DSL</p>
                  <ul className="bullet-list">
                    {dslShortcuts.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="aside-card">
                  <p className="card-label">Guía rápida</p>
                  <ul className="bullet-list">
                    {dslHints.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </section>

          <section className="parser-card" id="parser">
            <div className="section-heading parser-heading">
              <div>
                <p className="eyebrow">Sprint 3</p>
                <h2>Parser y validación</h2>
              </div>
              <div className={`status-pill ${parserIsReady ? 'status-pill-success' : 'status-pill-alert'}`}>
                {parserIsReady ? 'DSL válido' : 'Revisar DSL'}
              </div>
            </div>

            <div className="parser-layout">
              <article className="parser-summary-card">
                <p className="card-label">Resumen estructurado</p>
                <h3>{parsedWorkout.title}</h3>
                <p>
                  {parsedWorkout.blocks.length} bloques top-level · {formatDuration(parsedDuration)} ·{' '}
                  {errorCount} errores · {warningCount} avisos
                </p>

                <div className="parser-metrics">
                  <div>
                    <span>FTP detectado</span>
                    <strong>{parsedWorkout.ftpWatts ?? '--'} W</strong>
                  </div>
                  <div>
                    <span>Bloques</span>
                    <strong>{parsedWorkout.blocks.length}</strong>
                  </div>
                  <div>
                    <span>Duración</span>
                    <strong>{formatDuration(parsedDuration)}</strong>
                  </div>
                </div>
              </article>

              <article className="parser-blocks-card">
                <p className="card-label">Estructura interpretada</p>
                <ul className="parsed-blocks">
                  {parsedWorkout.blocks.map((block, index) => (
                    <li key={`${describeBlock(block)}-${index}`}>{describeBlock(block)}</li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="parser-issues">
              <p className="card-label">Validación</p>
              {parsedWorkout.issues.length > 0 ? (
                <div className="issue-list">
                  {parsedWorkout.issues.map((issue, index) => (
                    <article className={`issue-item ${issue.severity}`} key={`${issue.line}-${index}`}>
                      <span>L{String(issue.line).padStart(2, '0')}</span>
                      <p>{issue.message}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="parser-ok">Sin errores de parseo. El workout está listo para seguir al próximo paso.</p>
              )}
            </div>
          </section>

          <section className="preview-card" id="preview">
            <div className="section-heading preview-heading">
              <div>
                <p className="eyebrow">Sprint 4</p>
                <h2>Vista previa y métricas</h2>
              </div>
              <div className="status-pill status-pill-success">Preview activa</div>
            </div>

            <div className="preview-grid">
              <article className="preview-graph-card">
                <div className="preview-graph-header">
                  <div>
                    <p className="card-label">Perfil de potencia</p>
                    <h3>{parsedWorkout.title}</h3>
                  </div>
                  <span className="preview-subtle">{preview.durationLabel}</span>
                </div>

                <div className="preview-graph">
                  {preview.segments.length > 0 ? (
                    preview.segments.slice(0, 18).map((segment, index) => {
                      const percent = segment.relativePercent ?? 35;
                      const height = Math.max(12, Math.min(100, Math.round((percent / 150) * 100)));
                      return (
                        <div className="preview-bar-group" key={segment.id + index}>
                          <div
                            className={`preview-bar ${segment.kind}`}
                            style={{ height: `${height}%` }}
                            title={`${segment.label} · ${segment.relativePercent ? formatPercent(segment.relativePercent) : 'N/D'} · ${formatDuration(segment.durationSeconds)}`}
                          />
                          <span>{segment.label}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="preview-empty">No hay bloques para graficar.</div>
                  )}
                </div>
              </article>

              <article className="preview-metrics-card">
                <p className="card-label">Métricas clave</p>
                <div className="metric-stack">
                  <div className="metric-box">
                    <span>Duración total</span>
                    <strong>{preview.durationLabel}</strong>
                  </div>
                  <div className="metric-box">
                    <span>IF aproximado</span>
                    <strong>{preview.ifApprox ? formatDecimal(preview.ifApprox, 3) : '--'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>TSS estimado</span>
                    <strong>{preview.tssEstimate ? formatDecimal(preview.tssEstimate, 0) : '--'}</strong>
                  </div>
                  <div className="metric-box">
                    <span>Normalised Power</span>
                    <strong>{preview.estimatedNormalisedPower ?? '--'} W</strong>
                  </div>
                </div>
              </article>
            </div>

            <div className="preview-footer-grid">
              <article className="preview-zones-card">
                <p className="card-label">Distribución por zonas</p>
                <div className="zone-bars">
                  {preview.zoneDistribution.map((zone) => {
                    const total = preview.durationSeconds || 1;
                    const height = Math.max(6, Math.round((zone.seconds / total) * 100));
                    return (
                      <div className="zone-bar-group" key={zone.zone}>
                        <div className="zone-bar-track">
                          <div className="zone-bar" style={{ height: `${height}%` }} />
                        </div>
                        <span>{zone.label}</span>
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className="preview-summary-card">
                <p className="card-label">Lectura rápida</p>
                <ul className="preview-summary-list">
                  <li>{preview.segments.length} segmentos interpretados</li>
                  <li>{errorCount === 0 ? 'Sin errores bloqueantes' : `${errorCount} errores bloqueantes`}</li>
                  <li>{warningCount} avisos de validación</li>
                  <li>{parsedWorkout.ftpWatts ? `FTP detectado: ${parsedWorkout.ftpWatts} W` : 'FTP pendiente de definir'}</li>
                </ul>
              </article>
            </div>
          </section>

          <section className="export-card" id="export">
            <div className="section-heading export-heading">
              <div>
                <p className="eyebrow">Sprint 5</p>
                <h2>Exportación Zwift</h2>
              </div>
              <div className={`status-pill ${parserIsReady ? 'status-pill-success' : 'status-pill-alert'}`}>
                {parserIsReady ? 'Listo para exportar' : 'Corrige errores antes'}
              </div>
            </div>

            <div className="export-layout">
              <article className="export-main-card">
                <p className="card-label">Archivo generado</p>
                <h3>{parsedWorkout.title}.zwo</h3>
                <p>
                  Descarga el workout estructurado en formato XML compatible con Zwift.
                  La exportación usa el contenido validado como fuente de verdad.
                </p>

                <div className="export-actions">
                  <button className="primary-action export-button" type="button" onClick={handleExport} disabled={!parserIsReady}>
                    Descargar .zwo
                  </button>
                  <div className="export-meta">
                    <span>{preview.durationLabel}</span>
                    <span>{errorCount} errores</span>
                    <span>{warningCount} avisos</span>
                  </div>
                </div>
              </article>

              <article className="export-code-card">
                <p className="card-label">Salida estructurada</p>
                <pre className="export-code">
{`<workout_file>
  <name>${parsedWorkout.title}</name>
  <ftp>${parsedWorkout.ftpWatts ?? '--'}</ftp>
  <duration>${preview.durationSeconds}</duration>
  <workout>...</workout>
</workout_file>`}
                </pre>
              </article>
            </div>
          </section>

          <section className="library-card" id="library">
            <div className="section-heading library-heading">
              <div>
                <p className="eyebrow">Sprint 6</p>
                <h2>Biblioteca y reutilización</h2>
              </div>
              <div className="status-pill">Plantillas persistentes</div>
            </div>

            <div className="library-layout">
              <article className="library-panel">
                <p className="card-label">Plantillas guardadas</p>
                {templates.length > 0 ? (
                  <div className="template-list">
                    {templates.map((template) => (
                      <article className="template-item" key={template.id}>
                        <div>
                          <h3>{template.title}</h3>
                          <p>{formatDateTime(template.updatedAt)}</p>
                        </div>
                        <div className="template-actions">
                          <button type="button" className="ghost-button" onClick={() => handleLoadTemplate(template)}>
                            Cargar
                          </button>
                          <button type="button" className="ghost-button" onClick={() => handleDuplicateTemplate(template)}>
                            Duplicar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="library-empty">Aún no hay plantillas guardadas.</p>
                )}
              </article>

              <article className="library-panel">
                <p className="card-label">Historial de exportaciones</p>
                <div className="export-history-list">
                  {exportHistory.length > 0 ? (
                    exportHistory.map((entry) => (
                      <article className="export-history-item" key={entry.id}>
                        <div>
                          <h3>{entry.title}</h3>
                          <p>{entry.fileName}</p>
                        </div>
                        <span>{formatDateTime(entry.exportedAt)}</span>
                      </article>
                    ))
                  ) : (
                    <p className="library-empty">Todavía no hay exportaciones registradas.</p>
                  )}
                </div>
              </article>
            </div>
          </section>

          <section className="grid-section" id="decisions">
            {sprintZeroDecisions.map((item) => (
              <article className="decision-card" key={item.title}>
                <p className="card-label">{item.title}</p>
                <h3>{item.value}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </section>

          <section className="domain-card">
            <div className="section-heading">
              <p className="eyebrow">Sprint 1</p>
              <h2>Modelo interno del workout</h2>
            </div>

            <div className="domain-summary">
              <div>
                <p className="card-label">Workout base</p>
                <h3>{sampleWorkoutPlan.title}</h3>
                <p>{sampleWorkoutPlan.notes}</p>
              </div>

              <div className="domain-metrics">
                <div>
                  <span>FTP</span>
                  <strong>{sampleWorkoutPlan.ftpWatts ?? '--'} W</strong>
                </div>
                <div>
                  <span>Duración</span>
                  <strong>{formatDuration(getWorkoutDurationSeconds(sampleWorkoutPlan.blocks))}</strong>
                </div>
                <div>
                  <span>Bloques</span>
                  <strong>{getWorkoutBlockCount(sampleWorkoutPlan.blocks)}</strong>
                </div>
              </div>
            </div>

            <div className="chip-list" aria-label="Tipos de bloque disponibles">
              {workoutBlockKinds.map((kind) => (
                <article className="chip" key={kind.kind}>
                  <p>{kind.label}</p>
                  <span>{kind.description}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="next-sprint" id="next">
            <div className="section-heading">
              <p className="eyebrow">Siguiente sprint</p>
              <h2>Checklist de arranque</h2>
            </div>

            <ul className="checklist">
              {nextSprintChecklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
