import type { ParsedWorkoutDsl } from '../parser/workoutDsl';
import type { WorkoutBlock, WorkoutIntensity, WorkoutZone } from './workout';
import { formatDuration } from '../utils/formatWorkout';
import { getWorkoutDurationSeconds } from './workout';

type FlattenedSegment = {
  id: string;
  label: string;
  kind: WorkoutBlock['kind'];
  durationSeconds: number;
  relativePercent: number | null;
  zone: WorkoutZone | null;
  depth: number;
};

export type ZoneDistribution = {
  zone: WorkoutZone;
  seconds: number;
  label: string;
};

export type WorkoutPreview = {
  durationSeconds: number;
  durationLabel: string;
  ifApprox: number | null;
  tssEstimate: number | null;
  estimatedNormalisedPower: number | null;
  segments: FlattenedSegment[];
  zoneDistribution: ZoneDistribution[];
};

export function buildWorkoutPreview(parsed: ParsedWorkoutDsl): WorkoutPreview {
  const durationSeconds = getWorkoutDurationSeconds(parsed.blocks);
  const segments = flattenBlocks(parsed.blocks, parsed.ftpWatts);
  const relativeSegments = segments.filter((segment) => segment.relativePercent !== null);
  const ifApprox = computeIntensityFactor(relativeSegments);
  const tssEstimate = ifApprox !== null ? (durationSeconds / 3600) * Math.pow(ifApprox, 2) * 100 : null;
  const estimatedNormalisedPower = parsed.ftpWatts && ifApprox !== null
    ? Math.round(parsed.ftpWatts * ifApprox)
    : null;

  return {
    durationSeconds,
    durationLabel: formatDuration(durationSeconds),
    ifApprox,
    tssEstimate,
    estimatedNormalisedPower,
    segments,
    zoneDistribution: buildZoneDistribution(segments),
  };
}

function flattenBlocks(
  blocks: WorkoutBlock[],
  ftpWatts: number | null,
  depth = 0,
  parentPath = 'root',
): FlattenedSegment[] {
  return blocks.flatMap((block, index) => {
    const currentPath = `${parentPath}.${index}`;

    if (block.kind === 'repeat-set') {
      const repeatedChildren = Array.from({ length: block.repeatCount }, (_, repeatIndex) =>
        flattenBlocks(block.blocks, ftpWatts, depth + 1, `${currentPath}.${repeatIndex + 1}`),
      ).flat();

      return repeatedChildren;
    }

    if (block.kind === 'warmup' || block.kind === 'cooldown') {
      const startPercent = intensityToPercent(block.start, ftpWatts);
      const endPercent = intensityToPercent(block.end, ftpWatts);
      const relativePercent = averagePercent(startPercent, endPercent);

      return [
        {
          id: `${currentPath}.${block.kind}`,
          label: block.kind === 'warmup' ? 'WU' : 'CD',
          kind: block.kind,
          durationSeconds: block.durationSeconds,
          relativePercent,
          zone: relativePercent !== null ? percentToZone(relativePercent) : null,
          depth,
        },
      ];
    }

    const relativePercent = intensityToPercent(block.intensity, ftpWatts);

    return [
      {
        id: `${currentPath}.${block.kind}`,
        label: block.kind.toUpperCase(),
        kind: block.kind,
        durationSeconds: block.durationSeconds,
        relativePercent,
        zone: relativePercent !== null ? percentToZone(relativePercent) : null,
        depth,
      },
    ];
  });
}

function intensityToPercent(intensity: WorkoutIntensity, ftpWatts: number | null): number | null {
  switch (intensity.kind) {
    case 'ftp-percentage':
      return intensity.percent;
    case 'watts':
      return ftpWatts ? (intensity.watts / ftpWatts) * 100 : null;
    case 'zone':
      return zoneToPercent(intensity.zone);
    case 'cadence':
      return null;
  }
}

function averagePercent(start: number | null, end: number | null): number | null {
  if (start === null && end === null) return null;
  if (start === null) return end;
  if (end === null) return start;
  return (start + end) / 2;
}

function computeIntensityFactor(segments: FlattenedSegment[]): number | null {
  if (segments.length === 0) return null;

  const weightedSquares = segments.reduce((total, segment) => {
    if (segment.relativePercent === null) return total;
    const fraction = segment.relativePercent / 100;
    return total + segment.durationSeconds * Math.pow(fraction, 2);
  }, 0);

  const weightedDuration = segments.reduce((total, segment) => {
    if (segment.relativePercent === null) return total;
    return total + segment.durationSeconds;
  }, 0);

  if (weightedDuration === 0) return null;

  return Math.sqrt(weightedSquares / weightedDuration);
}

function buildZoneDistribution(segments: FlattenedSegment[]): ZoneDistribution[] {
  const totals = new Map<WorkoutZone, number>();
  const zones: WorkoutZone[] = [1, 2, 3, 4, 5, 6, 7];

  for (const segment of segments) {
    if (!segment.zone) continue;
    totals.set(segment.zone, (totals.get(segment.zone) ?? 0) + segment.durationSeconds);
  }

  return zones.map((zone) => ({
    zone,
    seconds: totals.get(zone) ?? 0,
    label: `Z${zone}`,
  }));
}

function percentToZone(percent: number): WorkoutZone {
  if (percent < 55) return 1;
  if (percent < 75) return 2;
  if (percent < 90) return 3;
  if (percent < 105) return 4;
  if (percent < 120) return 5;
  if (percent < 150) return 6;
  return 7;
}

function zoneToPercent(zone: WorkoutZone): number {
  switch (zone) {
    case 1:
      return 45;
    case 2:
      return 65;
    case 3:
      return 82;
    case 4:
      return 95;
    case 5:
      return 112;
    case 6:
      return 135;
    case 7:
      return 165;
  }
}
