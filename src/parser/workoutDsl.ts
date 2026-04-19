import type { WorkoutBlock, WorkoutIntensity, WorkoutPlan } from '../domain/workout';
import { formatDuration } from '../utils/formatWorkout';

export type ParserIssue = {
  line: number;
  message: string;
  severity: 'error' | 'warning';
};

export type ParsedWorkoutDsl = {
  title: string;
  ftpWatts: number | null;
  blocks: WorkoutBlock[];
  issues: ParserIssue[];
};

type ParseState = {
  ftpWatts: number | null;
  ftpDefined: boolean;
  relativeIntensityLines: number[];
  issues: ParserIssue[];
};

type ParseSequenceResult = {
  blocks: WorkoutBlock[];
  nextIndex: number;
  closed: boolean;
};

const DEFAULT_TITLE = 'WORKOUT_DSL_PREVIEW';

export function parseWorkoutDsl(source: string): ParsedWorkoutDsl {
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const state: ParseState = {
    ftpWatts: null,
    ftpDefined: false,
    relativeIntensityLines: [],
    issues: [],
  };

  const parsed = parseSequence(lines, 0, state, false);

  if (!state.ftpWatts && state.relativeIntensityLines.length > 0) {
    state.relativeIntensityLines.forEach((line) => {
      state.issues.push({
        line,
        message: 'Falta definir FTP para resolver intensidades relativas (% o zonas).',
        severity: 'error',
      });
    });
  }

  if (parsed.blocks.length === 0) {
    state.issues.push({
      line: 1,
      message: 'No se detectaron bloques de entrenamiento válidos.',
      severity: 'error',
    });
  }

  return {
    title: DEFAULT_TITLE,
    ftpWatts: state.ftpWatts,
    blocks: parsed.blocks,
    issues: dedupeIssues(state.issues),
  };
}

export function describeBlock(block: WorkoutBlock): string {
  switch (block.kind) {
    case 'warmup':
      return `WU ${formatDuration(block.durationSeconds)} ${describeIntensity(block.start)} → ${describeIntensity(block.end)}`;
    case 'cooldown':
      return `CD ${formatDuration(block.durationSeconds)} ${describeIntensity(block.start)} → ${describeIntensity(block.end)}`;
    case 'steady':
      return `STEADY ${formatDuration(block.durationSeconds)} @ ${describeIntensity(block.intensity)}`;
    case 'interval':
      return `INTERVAL ${formatDuration(block.durationSeconds)} @ ${describeIntensity(block.intensity)}`;
    case 'recovery':
      return `RECOVERY ${formatDuration(block.durationSeconds)} @ ${describeIntensity(block.intensity)}`;
    case 'repeat-set':
      return `${block.repeatCount}x(${block.blocks.length} bloques)`;
  }
}

function parseSequence(
  lines: string[],
  startIndex: number,
  state: ParseState,
  stopOnClose: boolean,
): ParseSequenceResult {
  const blocks: WorkoutBlock[] = [];
  let index = startIndex;

  while (index < lines.length) {
    const lineNo = index + 1;
    const original = lines[index];
    const line = original.trim();

    if (!line || line.startsWith('#')) {
      index += 1;
      continue;
    }

    if (line === ')') {
      return { blocks, nextIndex: index + 1, closed: true };
    }

    const ftpMatch = line.match(/^FTP\s*=\s*(\d+)$/i);
    if (ftpMatch) {
      const ftpWatts = Number(ftpMatch[1]);
      if (state.ftpDefined) {
        state.issues.push({
          line: lineNo,
          message: 'FTP redefinido. Se usará el último valor encontrado.',
          severity: 'warning',
        });
      }

      state.ftpWatts = ftpWatts;
      state.ftpDefined = true;
      index += 1;
      continue;
    }

    const repeatMatch = line.match(/^(\d+)x\s*\($/i);
    if (repeatMatch) {
      const repeatCount = Number(repeatMatch[1]);
      if (repeatCount <= 0) {
        state.issues.push({
          line: lineNo,
          message: 'El número de repeticiones debe ser mayor que cero.',
          severity: 'error',
        });
        index += 1;
        continue;
      }

      const nested = parseSequence(lines, index + 1, state, true);
      if (!nested.closed) {
        state.issues.push({
          line: lineNo,
          message: 'Falta cerrar el bloque repetido con ")".',
          severity: 'error',
        });
      }

      blocks.push({
        kind: 'repeat-set',
        repeatCount,
        blocks: nested.blocks,
      });

      index = nested.nextIndex;
      continue;
    }

    const warmupMatch = line.match(/^(WU|CD)\s+(.+)$/i);
    if (warmupMatch) {
      const blockKind = warmupMatch[1].toUpperCase() === 'WU' ? 'warmup' : 'cooldown';
      const parsedBlock = parseRampBlock(blockKind, warmupMatch[2], lineNo, state);
      if (parsedBlock) {
        blocks.push(parsedBlock);
      }
      index += 1;
      continue;
    }

    const stepBlock = parseStepBlock(line, lineNo, state);
    if (stepBlock) {
      blocks.push(stepBlock);
    }

    index += 1;
  }

  return { blocks, nextIndex: index, closed: false };
}

function parseRampBlock(
  kind: 'warmup' | 'cooldown',
  payload: string,
  lineNo: number,
  state: ParseState,
): WorkoutBlock | null {
  const match = payload.match(/^(\d+(?:\.\d+)?)(s|m|h)\s+(.+)$/i);
  if (!match) {
    state.issues.push({
      line: lineNo,
      message: `No se pudo interpretar el bloque ${kind === 'warmup' ? 'WU' : 'CD'}.`,
      severity: 'error',
    });
    return null;
  }

  const durationSeconds = toSeconds(Number(match[1]), match[2]);
  const intensityText = match[3].trim().replace(/^@\s*/, '');
  const range = intensityText.split(/\s*-\s*/);

  const start = parseIntensityToken(range[0], lineNo, state);
  const end = parseIntensityToken(range[1] ?? range[0], lineNo, state);

  if (!start || !end) {
    state.issues.push({
      line: lineNo,
      message: `Intensidad inválida en el bloque ${kind === 'warmup' ? 'WU' : 'CD'}.`,
      severity: 'error',
    });
    return null;
  }

  return kind === 'warmup'
    ? { kind, durationSeconds, start, end }
    : { kind, durationSeconds, start, end };
}

function parseStepBlock(line: string, lineNo: number, state: ParseState): WorkoutBlock | null {
  const match = line.match(/^(\d+(?:\.\d+)?)(s|m|h)\s*(?:@\s*)?(.+)$/i);
  if (!match) {
    state.issues.push({
      line: lineNo,
      message: 'Bloque no reconocido. Usa un formato como "5m @ 95%".',
      severity: 'error',
    });
    return null;
  }

  const durationSeconds = toSeconds(Number(match[1]), match[2]);
  const intensity = parseIntensityToken(match[3].trim(), lineNo, state);

  if (!intensity) {
    state.issues.push({
      line: lineNo,
      message: 'Intensidad inválida en el bloque.',
      severity: 'error',
    });
    return null;
  }

  const kind = inferStepKind(intensity, durationSeconds, state.ftpWatts);

  return {
    kind,
    durationSeconds,
    intensity,
  };
}

function parseIntensityToken(
  rawToken: string,
  lineNo: number,
  state: ParseState,
): WorkoutIntensity | null {
  const token = rawToken.trim().replace(/^@\s*/, '');

  if (!token) {
    state.issues.push({
      line: lineNo,
      message: 'Falta intensidad en el bloque.',
      severity: 'error',
    });
    return null;
  }

  if (/^\d+(?:\.\d+)?%$/.test(token)) {
    state.relativeIntensityLines.push(lineNo);
    return { kind: 'ftp-percentage', percent: Number(token.replace('%', '')) };
  }

  if (/^\d+(?:\.\d+)?w$/i.test(token)) {
    return { kind: 'watts', watts: Number(token.replace(/w$/i, '')) };
  }

  if (/^z[1-7]$/i.test(token)) {
    state.relativeIntensityLines.push(lineNo);
    return { kind: 'zone', zone: Number(token.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 | 7 };
  }

  if (/^zone\s*[1-7]$/i.test(token)) {
    state.relativeIntensityLines.push(lineNo);
    return { kind: 'zone', zone: Number(token.replace(/[^1-7]/g, '')) as 1 | 2 | 3 | 4 | 5 | 6 | 7 };
  }

  if (/^\d+(?:\.\d+)?rpm$/i.test(token)) {
    return { kind: 'cadence', rpm: Number(token.replace(/rpm$/i, '')) };
  }

  return null;
}

function inferStepKind(
  intensity: WorkoutIntensity,
  durationSeconds: number,
  ftpWatts: number | null,
): 'steady' | 'interval' | 'recovery' {
  switch (intensity.kind) {
    case 'ftp-percentage':
      if (intensity.percent < 75) return 'recovery';
      if (intensity.percent >= 90 || intensity.percent >= 105 || durationSeconds <= 120) return 'interval';
      return 'steady';
    case 'watts':
      if (ftpWatts && intensity.watts < ftpWatts * 0.75) return 'recovery';
      if (ftpWatts && intensity.watts >= ftpWatts * 0.9) return 'interval';
      return 'steady';
    case 'zone':
      if (intensity.zone <= 2) return 'recovery';
      if (intensity.zone >= 5) return 'interval';
      return 'steady';
    case 'cadence':
      return 'steady';
  }
}

function toSeconds(value: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'h':
      return Math.round(value * 3600);
    case 'm':
      return Math.round(value * 60);
    case 's':
    default:
      return Math.round(value);
  }
}

function describeIntensity(intensity: WorkoutIntensity): string {
  switch (intensity.kind) {
    case 'watts':
      return `${intensity.watts}W`;
    case 'ftp-percentage':
      return `${intensity.percent}% FTP`;
    case 'zone':
      return `Z${intensity.zone}`;
    case 'cadence':
      return `${intensity.rpm} rpm`;
  }
}

function dedupeIssues(issues: ParserIssue[]): ParserIssue[] {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.line}:${issue.severity}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildValidationSummary(parsed: ParsedWorkoutDsl): {
  hasErrors: boolean;
  errorCount: number;
  warningCount: number;
  statusLabel: string;
  durationLabel: string;
} {
  const errorCount = parsed.issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = parsed.issues.filter((issue) => issue.severity === 'warning').length;

  return {
    hasErrors: errorCount > 0,
    errorCount,
    warningCount,
    statusLabel: errorCount > 0 ? 'Revisar DSL' : 'DSL válido',
    durationLabel: formatDuration(0),
  };
}

export function createWorkoutPlanFromParsed(parsed: ParsedWorkoutDsl): WorkoutPlan {
  return {
    title: parsed.title,
    ftpWatts: parsed.ftpWatts,
    blocks: parsed.blocks,
  };
}
