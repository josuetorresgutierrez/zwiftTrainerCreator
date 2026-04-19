export function splitLines(value: string): string[] {
  return value.replace(/\r\n/g, '\n').split('\n');
}

export function countLines(value: string): number {
  return splitLines(value).length;
}
