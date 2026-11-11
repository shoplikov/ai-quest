// Small drawn icons that replace emoji, so a badge looks the same on every
// device. Content files still name an icon by its emoji; this file maps the
// emoji to a drawing. Style: 24×24 grid, ink outline, one or two flat fills
// from the palette (the same look as the map landmarks).
//
// `o` = outline only, `f-*` = filled with a palette colour.

const s = (d: string, cls = 'o') => `<path class="${cls}" d="${d}"/>`;
const c = (cx: number, cy: number, r: number, cls = 'o') => `<circle class="${cls}" cx="${cx}" cy="${cy}" r="${r}"/>`;
const r = (x: number, y: number, w: number, h: number, rx: number, cls = 'o') =>
  `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;

const ICONS = {
  tent: s('M3 20 12 4.5 21 20Z', 'f-coral') + s('M12 20v-6.5M10.3 3 12 4.5 13.7 3M2 20h20'),
  door: r(6, 3, 12, 18, 1.5, 'f-lilac') + c(14.8, 12.5, 0.9, 'dot') + s('M3 21h18'),
  gear:
    `<circle class="teeth" cx="12" cy="12" r="8.2"/>` + c(12, 12, 6.6, 'f-sun') + c(12, 12, 2.4, 'f-card'),
  box: s('M12 3 21 7.5v9L12 21l-9-4.5v-9Z', 'f-sun') + s('M3 7.5 12 12l9-4.5M12 12v9M7.5 5.2l9 4.6'),
  books:
    r(4, 6, 4.2, 14.5, 1, 'f-teal') +
    r(8.2, 3.5, 4.2, 17, 1, 'f-coral') +
    `<rect class="f-lilac" x="13.6" y="6" width="4.2" height="14.5" rx="1" transform="rotate(-12 15.7 20.5)"/>` +
    s('M2.5 20.5h19'),
  lighthouse:
    s('M9 21 10.4 9.5h3.2L15 21Z', 'f-coral') +
    r(10, 5.5, 4, 4, 0.6, 'f-sun') +
    s('M9.5 5.5 12 2.8l2.5 2.7ZM9.6 15h4.8M16.2 6.6 21 5M16.2 8.2 21 9.8M6.5 21h11'),
  book:
    s('M12 6.2C9.2 4.4 5.8 4.2 3 5.2v13.6c2.8-1 6.2-.8 9 1 2.8-1.8 6.2-2 9-1V5.2c-2.8-1-6.2-.8-9 1Z', 'f-sun') +
    s('M12 6.2v13.6M5.8 8.6c1.4-.2 2.6 0 3.8.5M5.8 12c1.4-.2 2.6 0 3.8.5M14.4 9.1c1.2-.5 2.4-.7 3.8-.5M14.4 12.5c1.2-.5 2.4-.7 3.8-.5'),
  rocket:
    s('M10.4 16.5 12 21.5l1.6-5Z', 'f-coral') +
    s('M12 2.5c4 3.6 4.5 8.8 3 14H9c-1.5-5.2-1-10.4 3-14Z', 'f-card') +
    s('M8.6 12.8 5.2 17l3.9-1M15.4 12.8l3.4 4.2-3.9-1', 'f-lilac') +
    c(12, 9, 1.9, 'f-sun'),
  flag: s('M6.5 4.5H18l-3 4 3 4H6.5Z', 'f-coral') + s('M6.5 21.5V3M4 21.5h5'),
  gremlin:
    r(5, 7, 14, 10.5, 3.2, 'f-lilac') +
    s('M8.2 7 6.6 3.8M15.8 7l1.6-3.2M8 17.5v3M12 17.5v3M16 17.5v3M10 14.2h4') +
    r(8.2, 10, 2.2, 2.2, 0.4, 'dot') +
    r(13.6, 10, 2.2, 2.2, 0.4, 'dot'),
  hat:
    s('M7.4 18.2 13.2 3l4 15.2Z', 'f-lilac') +
    s('M3.5 19.2c5-1.6 12-1.6 17 0-5 1.9-12 1.9-17 0Z', 'f-lilac') +
    s('M8.6 15.2c2.6-.8 5.4-.8 7.8 0', 'o') +
    s('M12.6 9.2l.6 1.2 1.3.2-.9.9.2 1.3-1.2-.6-1.2.6.2-1.3-.9-.9 1.3-.2Z', 'f-sun thin'),
  castle:
    s('M4 21V7h3v2.8h3V7h4v2.8h3V7h3v14Z', 'f-sun') +
    s('M10 21v-4.6a2 2 0 0 1 4 0V21Z', 'f-lilac') +
    s('M12 7V2.8l3.6 1.5L12 5.8', 'f-coral') +
    s('M2.5 21h19'),
  house:
    s('M5.5 10.2V20h13v-9.8', 'f-sun') +
    s('M2.8 11.4 12 3.2l9.2 8.2', 'o') +
    r(10.4, 14, 3.2, 6, 0.4, 'f-coral'),
  plate:
    c(12, 12.5, 6.2, 'f-card') +
    c(12, 12.5, 3.2, 'f-sun') +
    s('M3.6 4v16.5M2 4v3.6a1.6 1.6 0 0 0 3.2 0V4M21 4v16.5M21 4c-2.2 2.2-2.2 6 0 8.2'),
  bento:
    r(3, 5, 18, 14, 3, 'f-coral') +
    s('M12 5v14M12 12h9') +
    c(7.5, 12, 2.3, 'f-sun') +
    r(14.6, 7.2, 3.8, 2.4, 0.8, 'f-card') +
    c(16.5, 15.5, 1.5, 'f-teal'),
  bank:
    s('M3 9.2 12 3.2l9 6Z', 'f-lilac') + s('M6 9.2v8.6M10 9.2v8.6M14 9.2v8.6M18 9.2v8.6M3.5 17.8h17M2.5 20.8h19'),
  chef:
    s('M7 14.2a4 4 0 0 1 1-7.8 4.5 4.5 0 0 1 8 0 4 4 0 0 1 1 7.8V20.5H7Z', 'f-card') + s('M7 17.2h10M10 13.5v-2M14 13.5v-2'),
  coffee:
    s('M5 9.5h12v5.2a4.3 4.3 0 0 1-4.3 4.3H9.3A4.3 4.3 0 0 1 5 14.7Z', 'f-sun') +
    s('M17 11h1.4a2.4 2.4 0 0 1 0 4.8H17M9 3c1 1.4 1 2.4 0 3.8M13 3c1 1.4 1 2.4 0 3.8M4 21.5h14'),
  star: s('M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9Z', 'f-sun'),
  flame: s('M12 2.5c.6 3.6 5.5 5.6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.2 1-3.6 2.2-4.8.3 1.6 1 2.4 1.9 2.8-.4-3.4.2-6.6 1.4-9Z', 'f-coral') +
    s('M12 20.4a2.6 2.6 0 0 1-2.6-2.6c0-1.6 1.4-2.4 2.6-4 1.2 1.6 2.6 2.4 2.6 4a2.6 2.6 0 0 1-2.6 2.6Z', 'f-sun thin'),
} as const;

export type IconName = keyof typeof ICONS;

// Emoji may carry a variation selector (U+FE0F); it is removed before lookup.
const BY_EMOJI: Record<string, IconName> = {
  '🏕': 'tent',
  '🚪': 'door',
  '🛠': 'gear',
  '📦': 'box',
  '📚': 'books',
  '🗼': 'lighthouse',
  '📖': 'book',
  '🚀': 'rocket',
  '👣': 'flag',
  '👾': 'gremlin',
  '🧙': 'hat',
  '🏰': 'castle',
  '🏠': 'house',
  '🍽': 'plate',
  '🍱': 'bento',
  '🏛': 'bank',
  '👩‍🍳': 'chef',
  '☕': 'coffee',
  '⭐': 'star',
  '🔥': 'flame',
};

export function iconName(emojiOrName: string): IconName | undefined {
  if (emojiOrName in ICONS) return emojiOrName as IconName;
  return BY_EMOJI[emojiOrName.replace(/️/g, '')];
}

/** SVG markup for an icon. An unknown emoji is returned as plain text. */
export function iconSvg(emojiOrName: string, size = 24): string {
  const name = iconName(emojiOrName);
  if (!name) return emojiOrName;
  return `<svg class="icon icon-${name}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">${ICONS[name]}</svg>`;
}

/** The inner drawing only, for use inside another SVG (the map). */
export function iconBody(emojiOrName: string): string | undefined {
  const name = iconName(emojiOrName);
  return name ? ICONS[name] : undefined;
}
