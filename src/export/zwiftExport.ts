import type { ParsedWorkoutDsl } from '../parser/workoutDsl';
import type { WorkoutBlock, WorkoutIntensity } from '../domain/workout';
import type { WorkoutPreview } from '../domain/preview';

export function buildZwiftWorkoutXml(parsed: ParsedWorkoutDsl, preview: WorkoutPreview): string {
  const title = escapeXml(parsed.title);
  const ftp = parsed.ftpWatts ?? 0;

  return `<?xml version="1.0" encoding="UTF-8"?>
<workout_file>
  <author>Zwift Trainer Creator</author>
  <name>${title}</name>
  <description>Generated workout</description>
  <sportType>bike</sportType>
  <ftp>${ftp}</ftp>
  <duration>${preview.durationSeconds}</duration>
  <workout>
${renderBlocks(parsed.blocks, 4, parsed.ftpWatts)}
  </workout>
</workout_file>
`;
}

export function downloadZwiftWorkout(parsed: ParsedWorkoutDsl, preview: WorkoutPreview): void {
  const fileName = buildZwiftWorkoutFileName(parsed.title);
  const xml = buildZwiftWorkoutXml(parsed, preview);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildZwiftWorkoutFileName(title: string): string {
  return `${slugify(title)}.zwo`;
}

function renderBlocks(blocks: WorkoutBlock[], indentLevel: number, ftpWatts: number | null): string {
  const indent = ' '.repeat(indentLevel);

  return blocks
    .map((block) => {
      switch (block.kind) {
        case 'warmup':
        case 'cooldown':
          return `${indent}<${block.kind} duration="${block.durationSeconds}" ${renderRampAttributes(block.start, block.end, ftpWatts)} />`;
        case 'steady':
        case 'interval':
        case 'recovery':
          return `${indent}<${block.kind} duration="${block.durationSeconds}" ${renderIntensityAttributes(block.intensity, ftpWatts)} />`;
        case 'repeat-set':
          return `${indent}<repeat count="${block.repeatCount}">
${renderBlocks(block.blocks, indentLevel + 2, ftpWatts)}
${indent}</repeat>`;
      }
    })
    .join('\n');
}

function renderRampAttributes(start: WorkoutIntensity, end: WorkoutIntensity, ftpWatts: number | null): string {
  return `${renderIntensityAttributes(start, ftpWatts)} ${renderIntensityAttributes(end, ftpWatts, 'end')}`;
}

function renderIntensityAttributes(
  intensity: WorkoutIntensity,
  ftpWatts: number | null,
  prefix: 'start' | 'end' | 'single' = 'single',
): string {
  const attributes: string[] = [];
  const name = prefix === 'single' ? 'power' : prefix === 'start' ? 'powerLow' : 'powerHigh';

  switch (intensity.kind) {
    case 'watts':
      attributes.push(`${name}="${formatRatio(intensity.watts, ftpWatts)}"`);
      attributes.push(`watts="${intensity.watts}"`);
      break;
    case 'ftp-percentage':
      attributes.push(`${name}="${formatRatio(intensity.percent, 100)}"`);
      attributes.push(`percent="${intensity.percent}"`);
      break;
    case 'zone':
      attributes.push(`${name}="${zoneToRatio(intensity.zone)}"`);
      attributes.push(`zone="Z${intensity.zone}"`);
      break;
    case 'cadence':
      attributes.push(`cadence="${intensity.rpm}"`);
      break;
  }

  return attributes.join(' ');
}

function formatRatio(value: number, base: number | null): string {
  if (!base) return (value / 100).toFixed(3);
  return (value / base).toFixed(3);
}

function zoneToRatio(zone: number): string {
  const mapping: Record<number, number> = {
    1: 0.45,
    2: 0.65,
    3: 0.82,
    4: 0.95,
    5: 1.12,
    6: 1.35,
    7: 1.65,
  };

  return mapping[zone]?.toFixed(3) ?? '1.000';
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '') || 'zwift_workout';
}
