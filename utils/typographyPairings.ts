import { TypographyPairing, TypographyFontRef, TypographyRole } from '../types';

const REQUIRED_ROLES: TypographyRole[] = ['headline', 'body', 'button'];

const hashString = (input: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) +
      (hash << 4) +
      (hash << 7) +
      (hash << 8) +
      (hash << 24);
  }
  return hash >>> 0;
};

export const buildGoogleCss2Url = (fonts: TypographyFontRef[]): string => {
  const uniqueQueries = [...new Set(fonts.map((font) => font.googleFamilyQuery.trim()).filter(Boolean))];
  return `https://fonts.googleapis.com/css2?family=${uniqueQueries.join('&family=')}&display=swap`;
};

const createPairing = (
  pairing: Omit<TypographyPairing, 'googleCss2Url'>,
): TypographyPairing => {
  const googleCss2Url = buildGoogleCss2Url(pairing.fonts);
  return { ...pairing, googleCss2Url };
};

const assertPairing = (pairing: TypographyPairing): void => {
  if (pairing.source !== 'google-fonts') {
    throw new Error(`Invalid pairing source for ${pairing.id}. Expected google-fonts.`);
  }

  const roleSet = new Set(pairing.assignments.map((assignment) => assignment.role));
  for (const requiredRole of REQUIRED_ROLES) {
    if (!roleSet.has(requiredRole)) {
      throw new Error(`Pairing ${pairing.id} is missing required role: ${requiredRole}.`);
    }
  }

  const fontFamilySet = new Set(pairing.fonts.map((font) => font.family));
  for (const assignment of pairing.assignments) {
    if (!fontFamilySet.has(assignment.family)) {
      throw new Error(
        `Pairing ${pairing.id} assigns role ${assignment.role} to missing family ${assignment.family}.`,
      );
    }
  }

  const normalizedUrl = pairing.googleCss2Url;
  const usedFamilies = new Set(pairing.assignments.map((assignment) => assignment.family));
  for (const family of usedFamilies) {
    const font = pairing.fonts.find((entry) => entry.family === family);
    if (!font) continue;
    const encodedSegment = `family=${font.googleFamilyQuery}`;
    if (!normalizedUrl.includes(encodedSegment)) {
      throw new Error(`Pairing ${pairing.id} URL is missing family query for ${family}.`);
    }
  }
};

export const GOOGLE_LUXURY_PAIRINGS: TypographyPairing[] = [
  createPairing({
    id: 'gf-luxury-10',
    name: 'Antic Didone / Arya / Tinos',
    category: 'classy-luxury',
    source: 'google-fonts',
    notes: 'Editorial serif display with crisp geometric UI sans and book-friendly body serif.',
    fonts: [
      {
        family: 'Antic Didone',
        weights: [400],
        styles: ['normal'],
        fallback: 'serif',
        googleFamilyQuery: 'Antic+Didone',
      },
      {
        family: 'Arya',
        weights: [400, 700],
        styles: ['normal'],
        fallback: 'sans-serif',
        googleFamilyQuery: 'Arya:wght@400;700',
      },
      {
        family: 'Tinos',
        weights: [400, 700],
        styles: ['normal', 'italic'],
        fallback: 'serif',
        googleFamilyQuery: 'Tinos:ital,wght@0,400;0,700;1,400',
      },
    ],
    assignments: [
      { role: 'logo', family: 'Antic Didone', weight: 400, transform: 'uppercase', tracking: 'wide' },
      { role: 'headline', family: 'Antic Didone', weight: 400 },
      { role: 'navigation', family: 'Arya', weight: 700, transform: 'uppercase', tracking: 'wide' },
      { role: 'summary', family: 'Arya', weight: 400 },
      { role: 'button', family: 'Arya', weight: 700, transform: 'uppercase', tracking: 'wide' },
      { role: 'body', family: 'Tinos', weight: 400 },
      { role: 'byline', family: 'Tinos', weight: 400, style: 'italic' },
    ],
  }),
  createPairing({
    id: 'gf-luxury-11',
    name: 'Italiana / Tenor Sans / Hammersmith One / Fanwood Text',
    category: 'classy-luxury',
    source: 'google-fonts',
    notes: 'High-contrast fashion display with calm navigation and grounded reading texture.',
    fonts: [
      {
        family: 'Italiana',
        weights: [400],
        styles: ['normal'],
        fallback: 'serif',
        googleFamilyQuery: 'Italiana',
      },
      {
        family: 'Tenor Sans',
        weights: [400],
        styles: ['normal'],
        fallback: 'sans-serif',
        googleFamilyQuery: 'Tenor+Sans',
      },
      {
        family: 'Hammersmith One',
        weights: [400],
        styles: ['normal'],
        fallback: 'sans-serif',
        googleFamilyQuery: 'Hammersmith+One',
      },
      {
        family: 'Fanwood Text',
        weights: [400],
        styles: ['normal', 'italic'],
        fallback: 'serif',
        googleFamilyQuery: 'Fanwood+Text:ital@0;1',
      },
    ],
    assignments: [
      { role: 'logo', family: 'Italiana', weight: 400, tracking: 'wide' },
      { role: 'headline', family: 'Italiana', weight: 400 },
      { role: 'navigation', family: 'Tenor Sans', weight: 400, transform: 'uppercase', tracking: 'wide' },
      { role: 'summary', family: 'Tenor Sans', weight: 400 },
      { role: 'button', family: 'Hammersmith One', weight: 400, transform: 'uppercase', tracking: 'wide' },
      { role: 'body', family: 'Fanwood Text', weight: 400 },
      { role: 'byline', family: 'Fanwood Text', weight: 400, style: 'italic' },
    ],
  }),
  createPairing({
    id: 'gf-luxury-12',
    name: 'Marcellus / Cinzel / Cormorant Garamond',
    category: 'classy-luxury',
    source: 'google-fonts',
    notes: 'Classical Roman display with ceremonial nav accents and expressive editorial body.',
    fonts: [
      {
        family: 'Marcellus',
        weights: [400],
        styles: ['normal'],
        fallback: 'serif',
        googleFamilyQuery: 'Marcellus',
      },
      {
        family: 'Cinzel',
        weights: [400, 600, 700],
        styles: ['normal'],
        fallback: 'serif',
        googleFamilyQuery: 'Cinzel:wght@400;600;700',
      },
      {
        family: 'Cormorant Garamond',
        weights: [400, 500, 600, 700],
        styles: ['normal', 'italic'],
        fallback: 'serif',
        googleFamilyQuery: 'Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700',
      },
    ],
    assignments: [
      { role: 'logo', family: 'Marcellus', weight: 400, transform: 'uppercase', tracking: 'wide' },
      { role: 'headline', family: 'Marcellus', weight: 400 },
      { role: 'navigation', family: 'Cinzel', weight: 600, transform: 'uppercase', tracking: 'wide' },
      { role: 'summary', family: 'Cinzel', weight: 400 },
      { role: 'button', family: 'Cinzel', weight: 700, transform: 'uppercase', tracking: 'wide' },
      { role: 'body', family: 'Cormorant Garamond', weight: 500 },
      { role: 'byline', family: 'Cormorant Garamond', weight: 500, style: 'italic' },
    ],
  }),
];

for (const pairing of GOOGLE_LUXURY_PAIRINGS) {
  assertPairing(pairing);
}

export const pickTypographyPairing = (seed: string): TypographyPairing => {
  const normalizedSeed = seed.trim() || 'typography-seed';
  const index = hashString(normalizedSeed) % GOOGLE_LUXURY_PAIRINGS.length;
  const pairing = GOOGLE_LUXURY_PAIRINGS[index];

  return {
    ...pairing,
    fonts: pairing.fonts.map((font) => ({ ...font, weights: [...font.weights], styles: font.styles ? [...font.styles] : undefined })),
    assignments: pairing.assignments.map((assignment) => ({ ...assignment })),
  };
};
