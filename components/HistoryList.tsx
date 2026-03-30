import React from 'react';
import { Trash2 } from 'lucide-react';
import { Palette } from '../types';

interface HistoryListProps {
  palettes: Palette[];
  activePaletteId: string | null;
  setActivePaletteId: (id: string | null) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({
  palettes,
  activePaletteId,
  setActivePaletteId,
  setIsMobileMenuOpen,
  onDelete,
}) => {
  if (palettes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <img src="/logo.png" alt="" className="w-20 h-20 object-contain opacity-30 mb-5" />
        <p className="font-serif italic text-base text-neutral-400 leading-relaxed max-w-[200px]">
          Your palettes will appear here as you create them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {palettes.map((p) => {
        const isActive = activePaletteId === p.id;
        return (
          <div
            key={p.id}
            onClick={() => {
              setActivePaletteId(p.id);
              setIsMobileMenuOpen(false);
            }}
            className={`group cursor-pointer rounded-xl border transition-all ${
              isActive
                ? 'bg-white border-[#722F37]/15 shadow-sm'
                : 'bg-white/60 border-neutral-200/60 hover:bg-white hover:border-neutral-200 hover:shadow-sm'
            }`}
          >
            {/* Color strip */}
            <div className="flex h-2 rounded-t-xl overflow-hidden">
              {p.colors.slice(0, 5).map((c, i) => (
                <div key={i} className="flex-1" style={{ backgroundColor: c.hex }} />
              ))}
            </div>

            {/* Content */}
            <div className="flex items-center justify-between px-3.5 py-3">
              <span className={`text-sm leading-tight truncate ${
                isActive
                  ? 'text-[#722F37] font-medium'
                  : 'text-neutral-700'
              }`}>
                {p.palette_name}
              </span>

              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(p.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 -mr-1 rounded-lg text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  aria-label="Delete palette"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryList;
