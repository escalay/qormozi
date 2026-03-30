

export interface ColorDefinition {
  name: string;
  hex: string;
  rationale: string;
  usage: string;
  // New Enriched Fields
  physical_match?: string;
  color_blind_sim?: {
    protanopia: string;
    deuteranopia: string;
  };
}

export interface ContrastPair {
  color_1: string; // name
  color_2: string; // name
  usage_context: string; // e.g., "Body Text", "Large Headings"
}

export type TypographyRole =
  | 'logo'
  | 'navigation'
  | 'headline'
  | 'summary'
  | 'byline'
  | 'body'
  | 'button';

export interface TypographyFontRef {
  family: string;
  weights: number[];
  styles?: Array<'normal' | 'italic'>;
  fallback: string;
  googleFamilyQuery: string;
}

export interface TypographyRoleAssignment {
  role: TypographyRole;
  family: string;
  weight: number;
  style?: 'normal' | 'italic';
  transform?: 'none' | 'uppercase';
  tracking?: 'normal' | 'wide';
}

export interface TypographyPairing {
  id: string;
  name: string;
  category: 'classy-luxury';
  source: 'google-fonts';
  fonts: TypographyFontRef[];
  assignments: TypographyRoleAssignment[];
  notes?: string;
  googleCss2Url: string;
}

export interface TechnicalAnalysis {
  harmony_rule: string;
  accessibility_score: string; // e.g. "AA", "AAA"
  contrast_pairs: ContrastPair[]; // LLM suggested pairs
  accessibility_suggestions: string[];
}

export interface SystemDesignOutput {
  shadcn: {
    cssVars: Record<string, string>; // e.g. { "--background": "0 0% 100%" }
  };
  tailwind: {
    config: Record<string, string>; // e.g. { "primary": "#ff0000" }
  };
}

export interface Palette {
  id: string; // generated client-side for keys
  palette_name: string;
  tags: string[];
  narrative: {
    sensory_reference: string;
    cultural_meaning: string;
  };
  colors: ColorDefinition[];
  technical_analysis: TechnicalAnalysis;
  // Optional enriched data at palette level
  ui_simulation?: {
    surface: string;
    text: string;
    accent: string;
    secondary: string[];
  };
  typography_pairing?: TypographyPairing;
  system_design: SystemDesignOutput;
}

export interface GeneratedResponse {
  palettes: Palette[];
}

// ------------------------------------------------------------------
// SHADCN / TAILWIND GENERATOR TYPES
// ------------------------------------------------------------------

export interface BaseColors {
  background: string;
  foreground: string;
}

export interface ComponentColors {
  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;
  border: string;
  input: string;
  ring: string;
}

export interface ChartColors {
  'chart-1': string;
  'chart-2': string;
  'chart-3': string;
  'chart-4': string;
  'chart-5': string;
}

export interface SidebarColors {
  sidebar: string;
  'sidebar-foreground': string;
  'sidebar-primary': string;
  'sidebar-primary-foreground': string;
  'sidebar-accent': string;
  'sidebar-accent-foreground': string;
  'sidebar-border': string;
  'sidebar-ring': string;
}

export interface ShadowTokens {
  'shadow-color': string;
  'shadow-opacity': string;
  'shadow-blur': string;
  'shadow-spread': string;
  'shadow-offset-x': string;
  'shadow-offset-y': string;
}

export interface ThemeVariables extends 
  BaseColors, 
  ComponentColors, 
  ChartColors, 
  SidebarColors,
  Partial<ShadowTokens> {
    radius: string;
    'font-sans': string;
    'font-serif'?: string;
    'font-mono'?: string;
}

export interface ComponentOverrides {
  [key: string]: { 
    radius?: string; 
    colors?: Partial<ThemeVariables>;
    className?: string; 
  }
}

export interface ThemeConfig {
  id: string;
  name: string;
  cssVars: {
    light: ThemeVariables;
    dark: ThemeVariables;
  };
  config: {
    convertToHsl: boolean; 
    prefix: string; 
  };
  overrides: ComponentOverrides; 
}
