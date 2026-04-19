export type WorkoutZone = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type WorkoutIntensity =
  | { kind: 'watts'; watts: number }
  | { kind: 'ftp-percentage'; percent: number }
  | { kind: 'zone'; zone: WorkoutZone }
  | { kind: 'cadence'; rpm: number };

export type WorkoutBlockBase = {
  label?: string;
  cadenceRpm?: number;
  notes?: string;
};

export type WarmupBlock = WorkoutBlockBase & {
  kind: 'warmup';
  durationSeconds: number;
  start: WorkoutIntensity;
  end: WorkoutIntensity;
};

export type SteadyBlock = WorkoutBlockBase & {
  kind: 'steady';
  durationSeconds: number;
  intensity: WorkoutIntensity;
};

export type IntervalBlock = WorkoutBlockBase & {
  kind: 'interval';
  durationSeconds: number;
  intensity: WorkoutIntensity;
};

export type RecoveryBlock = WorkoutBlockBase & {
  kind: 'recovery';
  durationSeconds: number;
  intensity: WorkoutIntensity;
};

export type CooldownBlock = WorkoutBlockBase & {
  kind: 'cooldown';
  durationSeconds: number;
  start: WorkoutIntensity;
  end: WorkoutIntensity;
};

export type RepeatSetBlock = WorkoutBlockBase & {
  kind: 'repeat-set';
  repeatCount: number;
  blocks: WorkoutBlock[];
};

export type WorkoutBlock =
  | WarmupBlock
  | SteadyBlock
  | IntervalBlock
  | RecoveryBlock
  | CooldownBlock
  | RepeatSetBlock;

export type WorkoutPlan = {
  title: string;
  ftpWatts: number | null;
  blocks: WorkoutBlock[];
  notes?: string;
};

export type WorkoutKindSummary = {
  kind: WorkoutBlock['kind'];
  label: string;
  description: string;
};

export const workoutBlockKinds: WorkoutKindSummary[] = [
  {
    kind: 'warmup',
    label: 'Warmup',
    description: 'Rampas progresivas para activar la sesión.',
  },
  {
    kind: 'steady',
    label: 'Steady',
    description: 'Bloques sostenidos a una intensidad constante.',
  },
  {
    kind: 'interval',
    label: 'Interval',
    description: 'Esfuerzos puntuales de una duración concreta.',
  },
  {
    kind: 'recovery',
    label: 'Recovery',
    description: 'Bloques de descanso o descarga entre esfuerzos.',
  },
  {
    kind: 'cooldown',
    label: 'Cooldown',
    description: 'Transición final a intensidades bajas.',
  },
  {
    kind: 'repeat-set',
    label: 'Repeat set',
    description: 'Agrupación de bloques repetidos con patrón anidado.',
  },
];

export function createWorkoutPlan(plan: WorkoutPlan): WorkoutPlan {
  return plan;
}

export function getWorkoutDurationSeconds(blocks: WorkoutBlock[]): number {
  return blocks.reduce((total, block) => {
    if (block.kind === 'repeat-set') {
      return total + block.repeatCount * getWorkoutDurationSeconds(block.blocks);
    }

    return total + block.durationSeconds;
  }, 0);
}

export function getWorkoutBlockCount(blocks: WorkoutBlock[]): number {
  return blocks.reduce((total, block) => {
    if (block.kind === 'repeat-set') {
      return total + 1 + getWorkoutBlockCount(block.blocks);
    }

    return total + 1;
  }, 0);
}

export const sampleWorkoutPlan = createWorkoutPlan({
  title: 'VO2_MAX_THRESHOLD_STRESS',
  ftpWatts: 250,
  blocks: [
    {
      kind: 'warmup',
      durationSeconds: 600,
      start: { kind: 'watts', watts: 100 },
      end: { kind: 'watts', watts: 180 },
    },
    {
      kind: 'repeat-set',
      repeatCount: 4,
      blocks: [
        {
          kind: 'interval',
          durationSeconds: 300,
          intensity: { kind: 'ftp-percentage', percent: 105 },
        },
        {
          kind: 'recovery',
          durationSeconds: 120,
          intensity: { kind: 'ftp-percentage', percent: 60 },
        },
      ],
    },
    {
      kind: 'cooldown',
      durationSeconds: 600,
      start: { kind: 'ftp-percentage', percent: 70 },
      end: { kind: 'ftp-percentage', percent: 40 },
    },
  ],
  notes: 'Modelo interno preparado para el parser y la validación del siguiente sprint.',
});
