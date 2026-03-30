import React, { useState, useEffect } from 'react';
import { Palette, ThemeConfig, ThemeVariables } from '../types';
import { generateGlobalCss, generateTailwindConfig } from '../utils/shadcnGenerator';
import { colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";
import namesPlugin from "colord/plugins/names";
import { Copy, Check, Eye, Code2, Sliders, Moon, Sun, RefreshCw } from 'lucide-react';
import { getContrastColor } from '../utils/colorUtils';

extend([mixPlugin, namesPlugin]);

// Helper to map Palette to ThemeConfig
const mapPaletteToTheme = (palette: Palette): ThemeConfig => {
    const p = palette.colors;
    // Assuming sorted: 0=Bg, 1=Secondary, 2=Accent/Primary, 3=Accent, 4=Fg
    const bg = p[0].hex;
    const fg = p[p.length - 1].hex;
    
    // Find the most saturated color for primary
    const sortedBySat = [...p].sort((a,b) => {
        const sa = colord(a.hex).toHsl().s;
        const sb = colord(b.hex).toHsl().s;
        return sb - sa;
    });
    
    const primary = sortedBySat[0].hex;
    const secondary = p[1].hex === bg ? p[2].hex : p[1].hex;
    const accent = p.length > 3 ? p[3].hex : secondary;
    const destructive = '#ef4444'; // default semantic

    // Helper for contrast
    const getFg = (hex: string) => getContrastColor(hex) === '#000000' ? bg : '#ffffff'; 
    
    const generateVars = (isDark: boolean): ThemeVariables => {
        const _bg = isDark ? fg : bg;
        const _fg = isDark ? bg : fg;
        const _primary = primary;
        const _card = isDark ? colord(_bg).lighten(0.05).toHex() : colord(_bg).darken(0.02).toHex();

        return {
            background: _bg,
            foreground: _fg,
            
            card: _card,
            'card-foreground': _fg,
            
            popover: _bg,
            'popover-foreground': _fg,
            
            primary: _primary,
            'primary-foreground': getFg(_primary),
            
            secondary: secondary,
            'secondary-foreground': getFg(secondary),
            
            muted: colord(_bg).mix(_fg, 0.1).toHex(),
            'muted-foreground': colord(_fg).alpha(0.6).toHex(),
            
            accent: accent,
            'accent-foreground': getFg(accent),
            
            destructive: destructive,
            'destructive-foreground': '#ffffff',
            
            border: colord(_bg).mix(_fg, 0.2).toHex(),
            input: colord(_bg).mix(_fg, 0.2).toHex(),
            ring: colord(_primary).alpha(0.5).toHex(), 
            
            radius: '0.5rem',
            'font-sans': 'Inter',
            
            // Sidebar defaults
            sidebar: isDark ? colord(_bg).darken(0.02).toHex() : colord(_bg).lighten(0.02).toHex(),
            'sidebar-foreground': _fg,
            'sidebar-primary': _primary,
            'sidebar-primary-foreground': getFg(_primary),
            'sidebar-accent': accent,
            'sidebar-accent-foreground': getFg(accent),
            'sidebar-border': colord(_bg).mix(_fg, 0.1).toHex(),
            'sidebar-ring': _primary,
            
            // Chart defaults
            'chart-1': primary,
            'chart-2': secondary,
            'chart-3': accent,
            'chart-4': '#e88c30',
            'chart-5': '#2eb88a',
            
            // Shadow defaults
            'shadow-color': isDark ? '#000000' : colord(primary).darken(0.2).toHex(),
            'shadow-opacity': isDark ? '0.4' : '0.1',
            'shadow-blur': '12px',
            'shadow-spread': '-2px',
            'shadow-offset-x': '0px',
            'shadow-offset-y': '4px',
        };
    };

    return {
        id: palette.id,
        name: palette.palette_name,
        cssVars: {
            light: generateVars(false),
            dark: generateVars(true)
        },
        config: {
            convertToHsl: true,
            prefix: ''
        },
        overrides: {}
    };
};

// --- PREVIEW COMPONENTS ---

const PreviewCard = ({ vars, convertToHsl }: { vars: ThemeVariables; convertToHsl: boolean }) => (
    <div 
        className="rounded-lg border shadow-custom p-6 space-y-4"
        style={{ 
            backgroundColor: vars.card, 
            borderColor: vars.border,
            color: vars['card-foreground'],
            '--shadow-color': convertToHsl ? `hsl(${colord(vars['shadow-color']!).toHsl().h} ${colord(vars['shadow-color']!).toHsl().s}% ${colord(vars['shadow-color']!).toHsl().l}%)` : vars['shadow-color'],
            '--shadow-opacity': vars['shadow-opacity'],
            boxShadow: `0 4px 12px ${colord(vars['shadow-color']!).alpha(parseFloat(vars['shadow-opacity']!)).toRgbString()}` 
        } as any}
    >
        <div className="space-y-1">
            <h3 className="font-semibold leading-none tracking-tight">Payment Method</h3>
            <p className="text-sm opacity-70">Add a new payment method to your account.</p>
        </div>
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Card number</label>
                <div 
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                    style={{ borderColor: vars.input, backgroundColor: vars.background, color: vars.foreground }}
                >
                    0000 0000 0000 0000
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none">Expires</label>
                     <div 
                        className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                        style={{ borderColor: vars.input, backgroundColor: vars.background, color: vars.foreground }}
                    >
                        MM/YY
                    </div>
                </div>
                <div className="space-y-2">
                     <label className="text-sm font-medium leading-none">CVC</label>
                     <div 
                        className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                        style={{ borderColor: vars.input, backgroundColor: vars.background, color: vars.foreground }}
                    >
                        123
                    </div>
                </div>
            </div>
        </div>
        <button 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 w-full"
            style={{ backgroundColor: vars.primary, color: vars['primary-foreground'] }}
        >
            Continue
        </button>
    </div>
);

const SystemView: React.FC<{ palette: Palette }> = ({ palette }) => {
    const [config, setConfig] = useState<ThemeConfig | null>(null);
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const [activeTab, setActiveTab] = useState<'preview' | 'tokens' | 'code'>('preview');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setConfig(mapPaletteToTheme(palette));
    }, [palette]);

    if (!config) return null;

    const currentVars = config.cssVars[mode];
    const cssOutput = generateGlobalCss(config);
    const twOutput = generateTailwindConfig(config);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateColor = (key: keyof ThemeVariables, val: string) => {
        setConfig(prev => {
            if (!prev) return null;
            return {
                ...prev,
                cssVars: {
                    ...prev.cssVars,
                    [mode]: {
                        ...prev.cssVars[mode],
                        [key]: val
                    }
                }
            };
        });
    };

    const toggleFormat = () => {
        setConfig(prev => prev ? ({ ...prev, config: { ...prev.config, convertToHsl: !prev.config.convertToHsl } }) : null);
    };

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 min-h-[600px] flex flex-col md:flex-row gap-8">
            
            {/* LEFT: Sidebar / Controls */}
            <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                 <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-sm space-y-4">
                     <div className="flex items-center justify-between">
                         <h3 className="font-mono text-xs uppercase tracking-widest text-neutral-500">Theme Mode</h3>
                         <button 
                            onClick={() => setMode(m => m === 'light' ? 'dark' : 'light')}
                            className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
                         >
                            {mode === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                         </button>
                     </div>
                     <div className="h-px bg-neutral-100" />
                     <div className="space-y-2">
                        <button 
                            onClick={() => setActiveTab('preview')}
                            className={`w-full text-left px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide transition-colors ${activeTab === 'preview' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Eye size={14} /> Preview UI
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('tokens')}
                            className={`w-full text-left px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide transition-colors ${activeTab === 'tokens' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Sliders size={14} /> Edit Tokens
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`w-full text-left px-3 py-2 rounded-md font-mono text-xs uppercase tracking-wide transition-colors ${activeTab === 'code' ? 'bg-neutral-900 text-white' : 'hover:bg-neutral-50 text-neutral-600'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Code2 size={14} /> Export Code
                            </div>
                        </button>
                     </div>
                 </div>

                 <div className="p-4 bg-neutral-900 rounded-xl text-neutral-400 text-[10px] font-mono leading-relaxed">
                     <p className="mb-2 uppercase tracking-widest text-white">Unmatched Control</p>
                     <p className="mb-2">This generator normalizes all inputs to HSL space-separated values for full opacity modifier support in Tailwind (e.g. bg-primary/50).</p>
                     
                     <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                        <input 
                            type="checkbox" 
                            id="hsl-toggle"
                            checked={config.config.convertToHsl} 
                            onChange={toggleFormat}
                            className="rounded border-neutral-600 bg-neutral-800"
                        />
                        <label htmlFor="hsl-toggle" className="cursor-pointer hover:text-white transition-colors">Force HSL Vars</label>
                     </div>
                 </div>
            </div>

            {/* RIGHT: Content Area */}
            <div className="flex-1">
                
                {/* PREVIEW TAB */}
                {activeTab === 'preview' && (
                    <div 
                        className="rounded-2xl border border-neutral-200 p-8 md:p-12 transition-colors duration-500"
                        style={{ backgroundColor: currentVars.background, color: currentVars.foreground }}
                    >
                        <div className="max-w-md mx-auto space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-serif italic font-medium">System Preview</h2>
                                <p className="opacity-60 text-sm">Interactive components using generated tokens.</p>
                            </div>
                            
                            <PreviewCard vars={currentVars} convertToHsl={config.config.convertToHsl} />

                            <div className="flex gap-4 justify-center">
                                <button 
                                    className="px-4 py-2 rounded-md text-sm font-medium border"
                                    style={{ backgroundColor: currentVars.secondary, color: currentVars['secondary-foreground'], borderColor: currentVars.border }}
                                >
                                    Secondary
                                </button>
                                <button 
                                    className="px-4 py-2 rounded-md text-sm font-medium"
                                    style={{ backgroundColor: currentVars.destructive, color: currentVars['destructive-foreground'] }}
                                >
                                    Destructive
                                </button>
                                <button 
                                    className="px-4 py-2 rounded-md text-sm font-medium hover:opacity-90"
                                    style={{ backgroundColor: 'transparent', color: currentVars.primary }}
                                >
                                    Ghost Link
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOKENS TAB */}
                {activeTab === 'tokens' && (
                    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
                            <h3 className="font-serif italic text-xl text-neutral-900">Global Tokens ({mode})</h3>
                            <button onClick={() => setConfig(mapPaletteToTheme(palette))} className="p-2 hover:bg-neutral-200 rounded-full" title="Reset">
                                <RefreshCw size={14} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-neutral-100">
                            {Object.entries(currentVars).map(([key, val]) => {
                                if (key.includes('shadow') || key.includes('font') || key.includes('radius')) return null;
                                return (
                                    <div key={key} className="bg-white p-4 flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <label className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 truncate" title={key}>{key}</label>
                                            <div className="w-4 h-4 rounded-full border border-neutral-200" style={{ backgroundColor: val as string }} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="color" 
                                                value={colord(val as string).toHex()} 
                                                onChange={(e) => updateColor(key as keyof ThemeVariables, e.target.value)}
                                                className="w-6 h-6 p-0 border-0 rounded overflow-hidden cursor-pointer"
                                            />
                                            <input 
                                                type="text" 
                                                value={val as string}
                                                onChange={(e) => updateColor(key as keyof ThemeVariables, e.target.value)}
                                                className="flex-1 font-mono text-xs border-b border-transparent hover:border-neutral-200 focus:border-neutral-900 outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Shadow Section */}
                         <div className="p-6 border-t border-neutral-100 bg-neutral-50/50">
                            <h4 className="font-mono text-xs uppercase tracking-widest mb-4">Shadow Composition</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(currentVars).filter(([k]) => k.includes('shadow')).map(([key, val]) => (
                                    <div key={key}>
                                         <label className="font-mono text-[9px] uppercase text-neutral-400 block mb-1">{key}</label>
                                         <input 
                                            type="text" 
                                            value={val as string}
                                            onChange={(e) => updateColor(key as keyof ThemeVariables, e.target.value)}
                                            className="w-full bg-white border border-neutral-200 rounded px-2 py-1 font-mono text-xs"
                                         />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CODE TAB */}
                {activeTab === 'code' && (
                    <div className="space-y-6">
                        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-neutral-800">
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                <span className="font-mono text-xs text-neutral-400">globals.css</span>
                                <button onClick={() => handleCopy(cssOutput)} className="text-neutral-400 hover:text-white">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-[10px] sm:text-xs font-mono text-neutral-300 leading-relaxed max-h-[400px]">
                                {cssOutput}
                            </pre>
                        </div>

                        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden shadow-lg border border-neutral-800">
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                                <span className="font-mono text-xs text-neutral-400">tailwind.config.js</span>
                                <button onClick={() => handleCopy(twOutput)} className="text-neutral-400 hover:text-white">
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-[10px] sm:text-xs font-mono text-neutral-300 leading-relaxed max-h-[400px]">
                                {twOutput}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemView;