import { AccentColorOption, AppearanceSettings } from '../types';

export const PRESET_ACCENT_COLORS: AccentColorOption[] = [
  { id: 'raspberry', name: 'Черно-малиновый (BookVibe)', hex: '#E11D48' },
  { id: 'ruby_deep', name: 'Глубокий рубин', hex: '#BE123C' },
  { id: 'fuchsia_neon', name: 'Неоновая малина', hex: '#D946EF' },
  { id: 'amber', name: 'Яндекс Янтарь', hex: '#F59E0B' },
  { id: 'emerald', name: 'Изумрудная хвоя', hex: '#10B981' },
  { id: 'violet', name: 'Аметистовый бархат', hex: '#8B5CF6' },
  { id: 'blue', name: 'Сапфировый океан', hex: '#3B82F6' },
  { id: 'teal', name: 'Неоновая бирюза', hex: '#14B8A6' },
  { id: 'terracotta', name: 'Теплая терракота', hex: '#EA580C' },
  { id: 'slate', name: 'Темный обсидиан', hex: '#334155' },
];

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'beige',
  accentColor: '#E11D48',
  customAccents: [],
  fontFamily: 'jakarta',
  cardDensity: 'comfortable',
  cornerRadius: 'rounded',
  enablePaperTexture: true,
  enableGlowEffects: true,
};

/**
 * Converts a hex color to rgba string
 */
export function hexToRgba(hex: string, alpha = 1): string {
  const cleanHex = hex.replace('#', '').trim();
  let r = 0;
  let g = 0;
  let b = 0;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    return `rgba(245, 158, 11, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Returns '#000000' or '#FFFFFF' depending on the perceived luminance of the background color
 */
export function getContrastTextColor(hex: string): string {
  const cleanHex = hex.replace('#', '').trim();
  let r = 245;
  let g = 158;
  let b = 11;

  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  }

  // Perceived brightness formula (HSP / Rec 601)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#0F172A' : '#FFFFFF';
}

/**
 * Lighten or darken a hex color by a percentage (-100 to 100)
 */
export function adjustHexBrightness(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '').trim();
  let num = parseInt(cleanHex, 16);
  if (isNaN(num)) return hex;

  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Applies CSS variables and root attributes dynamically to the DOM
 */
export function applyAppearanceToDOM(settings: AppearanceSettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  const accent = settings.accentColor || '#F59E0B';
  const contrastText = getContrastTextColor(accent);
  const accentHover = adjustHexBrightness(accent, -12);
  const accentLight = hexToRgba(accent, 0.15);
  const accentBorder = hexToRgba(accent, 0.3);

  // Set CSS Variables
  root.style.setProperty('--app-accent', accent);
  root.style.setProperty('--app-accent-contrast', contrastText);
  root.style.setProperty('--app-accent-hover', accentHover);
  root.style.setProperty('--app-accent-light', accentLight);
  root.style.setProperty('--app-accent-border', accentBorder);

  // Set font family variable
  let fontFam = "'Plus Jakarta Sans', system-ui, sans-serif";
  if (settings.fontFamily === 'literata') {
    fontFam = "'Literata', Georgia, serif";
  } else if (settings.fontFamily === 'georgia') {
    fontFam = "Georgia, 'Times New Roman', serif";
  } else if (settings.fontFamily === 'monospace') {
    fontFam = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  }
  root.style.setProperty('--app-font-family', fontFam);

  // Border radius variable
  let radius = '1rem'; // rounded default
  if (settings.cornerRadius === 'sharp') radius = '0.375rem';
  if (settings.cornerRadius === 'pill') radius = '1.75rem';
  root.style.setProperty('--app-radius', radius);
}
