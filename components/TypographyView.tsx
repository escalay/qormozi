import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Info } from 'lucide-react';
import {
  Palette,
  TypographyRole,
  TypographyRoleAssignment,
  ColorDefinition,
} from '../types';
import { getContrastRatio, getWCAGRating } from '../utils/colorUtils';

const ROLE_ORDER: TypographyRole[] = [
  'logo',
  'navigation',
  'headline',
  'summary',
  'byline',
  'body',
  'button',
];

const ROLE_SAMPLE: Record<TypographyRole, string> = {
  logo: 'Maison Lumiere',
  navigation: 'Collections  Journal  Atelier  Contact',
  headline: 'Noir Silk Against Winter Glass',
  summary: 'A quiet palette of shadow, brass, and linen textures.',
  byline: 'By Lina Verne',
  body: 'Materials carry memory. Every hue references touch, age, and atmosphere.',
  button: 'Explore Palette',
};

const FALLBACK_BY_ROLE: Record<TypographyRole, string> = {
  logo: 'var(--font-display)',
  headline: 'var(--font-display)',
  body: 'var(--font-serif)',
  byline: 'var(--font-serif)',
  navigation: 'var(--font-sans)',
  summary: 'var(--font-sans)',
  button: 'var(--font-sans)',
};

const TypographyView: React.FC<{ palette: Palette; view: 'pairing' | 'contrast' }> = ({ palette, view }) => {
  const pairing = palette.typography_pairing;
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!pairing?.googleCss2Url) return;

    const id = `font-pairing-${pairing.id}`;
    const existing = document.getElementById(id);
    if (existing) return;

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = pairing.googleCss2Url;
    document.head.appendChild(link);
  }, [pairing]);

  const roleRows = useMemo(() => {
    if (!pairing) return [];
    return [...pairing.assignments].sort(
      (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role),
    );
  }, [pairing]);

  const contrastPairs = useMemo(() => {
    const pairs: {
      bg: ColorDefinition;
      fg: ColorDefinition;
      ratio: number;
      rating: ReturnType<typeof getWCAGRating>;
    }[] = [];

    palette.colors.forEach((bg) => {
      palette.colors.forEach((fg) => {
        if (bg.hex === fg.hex) return;
        const ratio = getContrastRatio(fg.hex, bg.hex);
        const rating = getWCAGRating(ratio);
        if (ratio >= 3.0) {
          pairs.push({ bg, fg, ratio, rating });
        }
      });
    });

    return pairs.sort((a, b) => b.ratio - a.ratio);
  }, [palette]);

  const fontByFamily = useMemo(() => {
    if (!pairing) return new Map<string, (typeof pairing.fonts)[number]>();
    return new Map(pairing.fonts.map((font) => [font.family, font]));
  }, [pairing]);

  const contrastFonts = useMemo(() => {
    if (!pairing) return { headline: undefined, body: undefined };

    const findFamily = (roles: TypographyRole[]) =>
      roles.map((r) => pairing.assignments.find((a) => a.role === r)).find(Boolean);

    const headlineAssignment = findFamily(['headline', 'logo']);
    const bodyAssignment = findFamily(['body', 'summary', 'byline']);

    const toCss = (assignment?: { family: string }) => {
      if (!assignment) return undefined;
      const font = fontByFamily.get(assignment.family);
      return font ? `'${font.family}', ${font.fallback}` : `'${assignment.family}', serif`;
    };

    return { headline: toCss(headlineAssignment), body: toCss(bodyAssignment) };
  }, [pairing, fontByFamily]);

  const cssSnippets = useMemo(() => {
    if (!pairing) {
      return {
        importSnippet: '',
        cssVarsSnippet: '',
        roleMapSnippet: '',
        tailwindSnippet: '',
      };
    }

    const pickAssignedFamily = (roles: TypographyRole[]): string | undefined => {
      return roles
        .map((role) => pairing.assignments.find((assignment) => assignment.role === role)?.family)
        .find(Boolean);
    };

    const firstFamilyByFallback = (
      fallbackClass: 'serif' | 'sans-serif',
    ): string | undefined => {
      return pairing.fonts.find((font) => font.fallback === fallbackClass)?.family;
    };

    const quoteFamily = (family?: string): string => (family ? `'${family}'` : '');

    const displayAssigned = pickAssignedFamily(['headline', 'logo']);
    const serifAssigned = pickAssignedFamily(['body', 'byline']);
    const sansAssigned = pickAssignedFamily(['button', 'navigation', 'summary']);

    const displayFamily =
      displayAssigned || firstFamilyByFallback('serif') || pairing.fonts[0]?.family;
    const serifFamily =
      (serifAssigned && fontByFamily.get(serifAssigned)?.fallback === 'serif'
        ? serifAssigned
        : undefined) || firstFamilyByFallback('serif');
    const sansFamily =
      (sansAssigned && fontByFamily.get(sansAssigned)?.fallback === 'sans-serif'
        ? sansAssigned
        : undefined) || firstFamilyByFallback('sans-serif');

    const bodyFamily = serifAssigned || serifFamily || displayFamily;
    const uiFamily = sansAssigned || sansFamily || displayFamily;

    const importSnippet = `@import url('${pairing.googleCss2Url}');`;

    const cssVarsSnippet = `:root {
  --font-display: ${displayFamily ? `${quoteFamily(displayFamily)}, ${fontByFamily.get(displayFamily)?.fallback || 'serif'}` : 'serif'};
  --font-serif: ${serifFamily ? `${quoteFamily(serifFamily)}, serif` : 'serif'};
  --font-sans: ${sansFamily ? `${quoteFamily(sansFamily)}, sans-serif` : 'sans-serif'};
}`;

    const roleMapSnippet = ROLE_ORDER.map(
      (role) => `.typo-${role} { font-family: ${FALLBACK_BY_ROLE[role]}; }`,
    ).join('\n');

    const tailwindSnippet = `theme: {
  extend: {
    fontFamily: {
      display: [${displayFamily ? `${quoteFamily(displayFamily)}, '${fontByFamily.get(displayFamily)?.fallback || 'serif'}'` : `'serif'`}],
      serif: [${serifFamily ? `${quoteFamily(serifFamily)}, 'serif'` : `'serif'`}],
      sans: [${sansFamily ? `${quoteFamily(sansFamily)}, 'sans-serif'` : `'sans-serif'`}],
      body: [${bodyFamily ? `${quoteFamily(bodyFamily)}, '${fontByFamily.get(bodyFamily)?.fallback || 'serif'}'` : `'serif'`}],
      ui: [${uiFamily ? `${quoteFamily(uiFamily)}, '${fontByFamily.get(uiFamily)?.fallback || 'sans-serif'}'` : `'sans-serif'`}],
    },
  },
}`;

    return { importSnippet, cssVarsSnippet, roleMapSnippet, tailwindSnippet };
  }, [pairing, fontByFamily]);

  const copyText = async (value: string, key: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1200);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-8">
      {view === 'pairing' && (
        <>
          {!pairing ? (
            <div className="py-24 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50">
              <Info className="mx-auto mb-4 text-neutral-300" size={48} />
              <p className="font-mono text-sm text-neutral-400 uppercase tracking-widest">
                Typography pairing unavailable for this palette.
              </p>
            </div>
          ) : (
            <>
              <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                      Typography Pairing
                    </p>
                    <h2 className="font-serif text-2xl sm:text-4xl leading-tight text-neutral-900">
                      {pairing.name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                      Google Fonts
                    </span>
                    <span className="px-3 py-1 rounded-full border border-neutral-200 bg-neutral-50 font-mono text-[10px] uppercase tracking-widest text-neutral-600">
                      Classy Luxury
                    </span>
                  </div>
                </div>
                {pairing.notes && (
                  <p className="text-sm text-neutral-600 leading-relaxed">{pairing.notes}</p>
                )}
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {roleRows.map((assignment: TypographyRoleAssignment) => {
                  const font = fontByFamily.get(assignment.family);
                  const familyCss = font
                    ? `'${font.family}', ${font.fallback}`
                    : assignment.family;

                  return (
                    <article
                      key={`${assignment.role}-${assignment.family}`}
                      className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                            {assignment.role}
                          </p>
                          <h3 className="text-lg text-neutral-900 leading-tight">
                            {assignment.family}
                          </h3>
                        </div>
                        <div className="text-right font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                          <div>W{assignment.weight}</div>
                          <div>{assignment.style || 'normal'}</div>
                        </div>
                      </div>

                      <div
                        className="border border-neutral-100 bg-neutral-50 rounded-xl p-4"
                        style={{
                          fontFamily: familyCss,
                          fontWeight: assignment.weight,
                          fontStyle: assignment.style || 'normal',
                          letterSpacing:
                            assignment.tracking === 'wide' ? '0.08em' : 'normal',
                          textTransform:
                            assignment.transform === 'uppercase' ? 'uppercase' : 'none',
                        }}
                      >
                        {ROLE_SAMPLE[assignment.role]}
                      </div>
                    </article>
                  );
                })}
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <SnippetCard
                  title="Import"
                  value={cssSnippets.importSnippet}
                  copied={copiedKey === 'import'}
                  onCopy={() => copyText(cssSnippets.importSnippet, 'import')}
                />
                <SnippetCard
                  title="CSS Vars"
                  value={cssSnippets.cssVarsSnippet}
                  copied={copiedKey === 'css-vars'}
                  onCopy={() => copyText(cssSnippets.cssVarsSnippet, 'css-vars')}
                />
                <SnippetCard
                  title="Role Mapping"
                  value={cssSnippets.roleMapSnippet}
                  copied={copiedKey === 'roles'}
                  onCopy={() => copyText(cssSnippets.roleMapSnippet, 'roles')}
                />
              </section>

              <section>
                <SnippetCard
                  title="Tailwind Font Family"
                  value={cssSnippets.tailwindSnippet}
                  copied={copiedKey === 'tailwind'}
                  onCopy={() => copyText(cssSnippets.tailwindSnippet, 'tailwind')}
                />
              </section>
            </>
          )}
        </>
      )}

      {view === 'contrast' && (
        <>
          {contrastPairs.length === 0 && (
            <div className="py-24 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-neutral-50">
              <Info className="mx-auto mb-4 text-neutral-300" size={48} />
              <p className="font-mono text-sm text-neutral-400 uppercase tracking-widest">
                No accessible contrast pairs found.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contrastPairs.map((pair, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-8 sm:p-10 flex flex-col justify-between shadow-sm hover:shadow-xl transition-shadow duration-300 min-h-[300px]"
                style={{ backgroundColor: pair.bg.hex, color: pair.fg.hex }}
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-start opacity-60">
                    <span className="font-mono text-[10px] uppercase tracking-widest border border-current rounded-full px-2 py-0.5">
                      {pair.fg.name} on {pair.bg.name}
                    </span>
                  </div>

                  <div>
                    <p
                      className="text-4xl sm:text-5xl italic leading-tight mb-4"
                      style={contrastFonts.headline ? { fontFamily: contrastFonts.headline } : undefined}
                    >
                      The quick brown fox jumps over the lazy dog.
                    </p>
                    {pair.ratio >= 4.5 && (
                      <p
                        className="text-sm sm:text-base leading-relaxed opacity-80 max-w-md"
                        style={contrastFonts.body ? { fontFamily: contrastFonts.body } : undefined}
                      >
                        Secondary body text is legible at smaller sizes when contrast
                        meets AA standards. This combination is reliable for paragraphs.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-current/20 pt-6 mt-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-sm uppercase tracking-wider ${
                          pair.rating.level === 'AAA'
                            ? 'bg-green-500/20'
                            : pair.rating.level === 'AA'
                              ? 'bg-blue-500/20'
                              : 'bg-yellow-500/20'
                        }`}
                      >
                        {pair.rating.level}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider opacity-60">
                        {pair.rating.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-bold leading-none">
                      {pair.ratio.toFixed(2)}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-widest opacity-50 mt-1">
                      Contrast Ratio
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SnippetCard: React.FC<{
  title: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}> = ({ title, value, copied, onCopy }) => {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
      <header className="h-11 px-4 border-b border-neutral-100 bg-neutral-50 flex items-center justify-between">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
          {title}
        </h3>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border border-neutral-200 bg-white hover:bg-neutral-100 transition-colors"
        >
          <Copy size={12} />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </header>
      <pre className="p-4 text-[11px] leading-relaxed font-mono text-neutral-700 overflow-x-auto whitespace-pre-wrap break-all">
        {value}
      </pre>
    </article>
  );
};

export default TypographyView;
