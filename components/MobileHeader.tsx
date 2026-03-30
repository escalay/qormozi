import React from 'react';
import { Plus, History } from 'lucide-react';
import { Palette } from '../types';

interface MobileHeaderProps {
    setActivePaletteId: (id: string | null) => void;
    setPrompt: (val: string) => void;
    setIsMobileMenuOpen: (open: boolean) => void;
    palettes: Palette[];
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ setActivePaletteId, setPrompt, setIsMobileMenuOpen, palettes }) => {
  return (
    <div className="h-14 border-b border-neutral-100 bg-white/80 backdrop-blur-xl flex items-center justify-between px-5 z-40 shrink-0 sticky top-0">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActivePaletteId(null)}>
            <div className="w-8 h-8 bg-[#722F37] text-white flex items-center justify-center font-serif italic text-sm rounded-full shrink-0">Q</div>
            <div className="flex flex-col">
                <span className="font-serif italic text-lg leading-none tracking-tight text-[#722F37]">Qormozi</span>
                <a
                  href="https://escalay.space"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[8px] leading-none tracking-wide text-neutral-300 hover:text-[#722F37]/60 transition-colors mt-1"
                >
                  by escalay.space
                </a>
            </div>
        </div>
        <div className="flex items-center gap-2">
        <button 
            onClick={() => {
                setPrompt('');
                setActivePaletteId(null);
            }}
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors"
            aria-label="New Palette"
        >
            <Plus size={24} />
        </button>
        <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-colors relative"
            aria-label="History"
        >
            <History size={24} />
            {palettes.length > 0 && <span className="absolute top-2 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />}
        </button>
        </div>
    </div>
  );
};

export default MobileHeader;
