import { colord, extend } from "colord";
import namesPlugin from "colord/plugins/names";
import { ThemeConfig, ThemeVariables } from "../types";

extend([namesPlugin]);

/**
 * Converts any color string to the specific format Tailwind needs 
 * for CSS variables to support opacity modifiers.
 */
export function normalizeColorToCssVar(colorString: string, forceHsl: boolean = false): string {
  if (!colorString) return "";
  
  // 1. Handle existing CSS vars references
  if (colorString.startsWith("var(")) return colorString;

  // 2. Handle OKLCH (Vercel Preset)
  // Tailwind v4 supports OKLCH natively, but v3 needs parsing if you want transformations
  if (colorString.startsWith("oklch")) return colorString; 

  const c = colord(colorString);
  if (!c.isValid()) return colorString; // Fallback for edge cases

  // 3. Convert to HSL numbers (Space separated)
  // This turns "#ffffff" into "0 0% 100%"
  // This turns "hsl(220, 10%, 20%)" into "220 10% 20%"
  if (forceHsl) {
    const { h, s, l } = c.toHsl();
    // Remove units for Tailwind native variable syntax
    // Rounded to 1 decimal place for cleanliness
    return `${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%`;
  }

  // 4. Return original if we aren't enforcing HSL
  return colorString;
}

export function generateGlobalCss(theme: ThemeConfig): string {
  const { light, dark } = theme.cssVars;

  const renderVars = (vars: ThemeVariables) => {
    return Object.entries(vars).map(([key, value]) => {
      // Logic: If it looks like a color, normalize it. 
      // If it's radius/font/shadow, leave it raw.
      const isColor = !['radius', 'font', 'shadow-blur', 'shadow-spread', 'shadow-offset', 'shadow-opacity'].some(k => key.includes(k));
      
      const cleanValue = isColor 
        ? normalizeColorToCssVar(value as string, theme.config.convertToHsl) 
        : value;

      return `    --${key}: ${cleanValue};`;
    }).join('\n');
  };

  // Shadow generation requires combining the atomic tokens
  const generateShadowClass = (vars: ThemeVariables) => {
    if (!vars['shadow-color']) return '';
    
    // Create a composite variable for the custom shadow
    const colorValue = theme.config.convertToHsl
      ? `hsl(var(--shadow-color) / var(--shadow-opacity))`
      : `var(--shadow-color)`;

    // Result: 0px 1px 3px 0px hsl(var(--shadow-color) / var(--shadow-opacity))
    return `    --shadow-composite: ${vars['shadow-offset-x']} ${vars['shadow-offset-y']} ${vars['shadow-blur']} ${vars['shadow-spread']} ${colorValue};`;
  };

  return `
@layer base {
  :root {
${renderVars(light)}
${generateShadowClass(light)}
  }

  .dark {
${renderVars(dark)}
${generateShadowClass(dark)}
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
}

export const generateTailwindConfig = (theme: ThemeConfig) => {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
            DEFAULT: 'hsl(var(--sidebar))',
            foreground: 'hsl(var(--sidebar-foreground))',
            primary: 'hsl(var(--sidebar-primary))',
            'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
            accent: 'hsl(var(--sidebar-accent))',
            'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
            border: 'hsl(var(--sidebar-border))',
            ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // THIS IS THE UNMATCHED PART
      // Dynamic Shadow Support based on your presets
      boxShadow: {
        'custom': 'var(--shadow-composite)', // Uses the complex token we built
      }
    },
  },
}`;
}