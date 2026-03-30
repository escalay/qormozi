import React, { useState } from 'react';
import { Palette, ColorDefinition } from '../types';
import { Copy, Check, Sparkles } from 'lucide-react';
import { getContrastColor, hexToRgb as utilsHexToRgb, hexToHsl as utilsHexToHsl } from '../utils/colorUtils';

// --- Internal Utilities for Data Display ---
const hexToRgb = (hex: string) => {
  const r = utilsHexToRgb(hex);
  return r ? `${r.r}, ${r.g}, ${r.b}` : '';
};

const hexToHsl = (hex: string) => {
  const h = utilsHexToHsl(hex);
  return h ? `${h.h}° ${h.s}% ${h.l}%` : '';
};

// --- Component: Bento Swatch ---
const BentoSwatch: React.FC<{ 
  color: ColorDefinition; 
  role: string;
  heightClass?: string;
  connected?: boolean;
}> = ({ color, role, heightClass = "min-h-[360px]", connected = false }) => {
  const [copied, setCopied] = useState(false);
  const contrast = getContrastColor(color.hex);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={handleCopy}
      className={`group relative w-full h-full ${heightClass} p-7 sm:p-9 lg:p-10 flex flex-col justify-between ${connected ? 'rounded-none hover:shadow-none' : 'rounded-3xl hover:shadow-xl'} transition-all duration-500 ${connected ? 'hover:scale-[1.005]' : 'hover:scale-[1.01]'} cursor-pointer overflow-hidden`}
      style={{ backgroundColor: color.hex, color: contrast }}
    >
      {/* Top: Header & Narrative */}
      <div className="relative z-10 space-y-5">
        <div className="flex justify-between items-start">
           <div className="flex flex-wrap items-center gap-2 opacity-60 max-w-[85%]">
              <span className="font-mono text-[10px] uppercase tracking-widest border border-current rounded-full px-3 py-1">
                {role}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest border border-current/40 rounded-full px-3 py-1 opacity-70">
                {color.usage}
              </span>
           </div>
           <button className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center transition-colors backdrop-blur-sm shrink-0">
             {copied ? <Check size={14} /> : <Copy size={14} />}
           </button>
        </div>

        <h3 className="font-serif text-3xl sm:text-4xl font-medium leading-tight">
          {color.name}
        </h3>
        <p className="font-serif italic text-sm sm:text-base leading-relaxed opacity-80 max-w-[90%]">
          "{color.rationale}"
        </p>

        {color.physical_match && (
           <div className="pt-1 flex items-center gap-1.5 opacity-60">
             <Sparkles size={11} />
             <span className="font-mono text-[10px] uppercase tracking-widest">
               {color.physical_match}
             </span>
           </div>
        )}
      </div>

      {/* Bottom: Technical Data (Minimal Line) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 border-t border-current/20 pt-5 mt-6 font-mono text-[10px] tracking-widest uppercase opacity-80">
         <div className="flex flex-col gap-1">
            <span className="opacity-50">HEX</span>
            <span className="font-bold text-xs select-all break-all">{color.hex}</span>
         </div>
         <div className="hidden sm:flex flex-col gap-1">
            <span className="opacity-50">RGB</span>
            <span className="break-words">{hexToRgb(color.hex)}</span>
         </div>
         <div className="hidden sm:flex flex-col gap-1">
            <span className="opacity-50">HSL</span>
            <span className="break-words">{hexToHsl(color.hex)}</span>
         </div>
      </div>
    </div>
  );
};

const PaletteComposition: React.FC<{ palette: Palette }> = ({ palette }) => {
  const primaryColors = palette.colors.slice(0, 2);
  const secondaryColors = palette.colors.slice(2, 5);

  return (
    <div className="animate-in fade-in duration-500">
      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-neutral-200 overflow-hidden bg-neutral-200/60 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-px bg-neutral-200/60 items-stretch">
            {primaryColors.map((color, idx) => (
              <div key={`primary-${idx}`} className="lg:col-span-3">
                <BentoSwatch
                  color={color}
                  role={idx === 0 ? "Primary Dominant" : "Secondary Support"}
                  connected={true}
                  heightClass="min-h-[360px] sm:min-h-[400px] lg:min-h-[430px]"
                />
              </div>
            ))}

            {secondaryColors.map((color, idx) => (
              <div key={`secondary-${idx}`} className="lg:col-span-2">
                <BentoSwatch
                  color={color}
                  role="Accent"
                  connected={true}
                  heightClass="min-h-[340px] sm:min-h-[370px] md:min-h-[390px] xl:min-h-[420px]"
                />
              </div>
            ))}

            {/* Fallback if < 5 colors generated */}
            {secondaryColors.length < 3 &&
              Array.from({ length: 3 - secondaryColors.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="lg:col-span-2 min-h-[340px] sm:min-h-[370px] md:min-h-[390px] xl:min-h-[420px] bg-neutral-100 border-2 border-dashed border-neutral-200 flex items-center justify-center"
                >
                  <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                    Empty Slot
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default PaletteComposition;
