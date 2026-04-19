export const starterDsl = `FTP=250
WU 10m 50%-75%

# MAIN SET
4x(
  5m @ 95%
  2m @ 60%
)

CD 10m 50%`;

export const dslHints = [
  'Escribí una línea por bloque para mantener la estructura legible.',
  'Usá FTP para convertir porcentajes a vatios de forma consistente.',
  'Los repeat sets deben cerrar paréntesis y repetir bloques anidados.',
  'Podés dejar comentarios con # para separar secciones.',
];

export const dslShortcuts = [
  'FTP=250',
  'WU 10m 50%-75%',
  '4x(5m @ 95% + 2m @ 60%)',
  'CD 10m 50%',
];
