export type WorkoutTemplate = {
  id: string;
  title: string;
  dsl: string;
  updatedAt: string;
};

export type ExportRecord = {
  id: string;
  title: string;
  fileName: string;
  exportedAt: string;
};

const TEMPLATES_KEY = 'zwift-trainer-creator.templates';
const EXPORTS_KEY = 'zwift-trainer-creator.exports';

const starterTemplates: WorkoutTemplate[] = [
  {
    id: 'template-vo2',
    title: 'VO2 Max Base',
    dsl: 'FTP=250\nWU 10m 50%-75%\n4x(3m @ 120% + 2m @ 60%)\nCD 10m 50%',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-sweetspot',
    title: 'Sweet Spot',
    dsl: 'FTP=250\nWU 10m 50%-75%\n3x(12m @ 95% + 4m @ 60%)\nCD 10m 50%',
    updatedAt: new Date().toISOString(),
  },
];

export function loadTemplates(): WorkoutTemplate[] {
  const stored = readJson<WorkoutTemplate[]>(TEMPLATES_KEY);
  if (!stored || stored.length === 0) return starterTemplates;
  return stored;
}

export function saveTemplates(templates: WorkoutTemplate[]): void {
  writeJson(TEMPLATES_KEY, templates);
}

export function upsertTemplate(template: WorkoutTemplate): WorkoutTemplate[] {
  const templates = loadTemplates();
  const next = [template, ...templates.filter((item) => item.id !== template.id)];
  saveTemplates(next);
  return next;
}

export function duplicateTemplate(template: WorkoutTemplate): WorkoutTemplate[] {
  const duplicated: WorkoutTemplate = {
    ...template,
    id: `${template.id}-${Date.now()}`,
    title: `${template.title} Copy`,
    updatedAt: new Date().toISOString(),
  };

  return upsertTemplate(duplicated);
}

export function loadExports(): ExportRecord[] {
  return readJson<ExportRecord[]>(EXPORTS_KEY) ?? [];
}

export function saveExport(record: ExportRecord): ExportRecord[] {
  const exports = [record, ...loadExports()].slice(0, 8);
  writeJson(EXPORTS_KEY, exports);
  return exports;
}

export function createTemplateId(): string {
  return `template-${Date.now()}`;
}

export function createExportId(): string {
  return `export-${Date.now()}`;
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  const value = window.localStorage.getItem(key);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}
