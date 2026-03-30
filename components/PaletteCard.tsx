import React, { useState } from 'react';
import { Palette } from '../types';
import PaletteComposition from './PaletteComposition';
import TypographyView from './TypographyView';
import SystemView from './SystemView';

type Tab = 'palette' | 'type' | 'contrast' | 'system';

const TABS: { id: Tab; label: string }[] = [
  { id: 'palette', label: 'Colors' },
  { id: 'type', label: 'Type' },
  { id: 'contrast', label: 'Contrast' },
  { id: 'system', label: 'System' },
];

interface PaletteCardProps {
  palette: Palette;
}

const PaletteCard: React.FC<PaletteCardProps> = ({ palette }) => {
  const [activeTab, setActiveTab] = useState<Tab>('palette');

  return (
    <div className="w-full min-h-full bg-[#FAFAFA] text-neutral-900 p-6 sm:p-8 lg:p-12">

      {/* 1. Header */}
      <div className="max-w-7xl mx-auto mb-8 sm:mb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8">
        <div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-medium leading-[0.95] text-neutral-900 tracking-tight mb-5 break-words">
            {palette.palette_name}
          </h1>
          <p className="text-base sm:text-lg font-serif italic text-neutral-500 max-w-2xl leading-relaxed">
            {palette.narrative.sensory_reference}
          </p>
          {palette.narrative.cultural_meaning && (
            <p className="mt-4 font-serif text-sm leading-relaxed text-neutral-500 max-w-2xl">
              {palette.narrative.cultural_meaning}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-6">
             {palette.tags.map((tag, i) => (
                <span key={i} className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                  {tag}
                </span>
             ))}
          </div>
        </div>
      </div>

      {/* 2. Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-neutral-200">
         <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-neutral-900 border-b-2 border-neutral-900'
                    : 'text-neutral-400 hover:text-neutral-600 border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>
      </div>

      {/* 3. Content */}
      {activeTab === 'palette' && <PaletteComposition palette={palette} />}
      {activeTab === 'type' && <TypographyView palette={palette} view="pairing" />}
      {activeTab === 'contrast' && <TypographyView palette={palette} view="contrast" />}
      {activeTab === 'system' && <SystemView palette={palette} />}

    </div>
  );
};

export default PaletteCard;
