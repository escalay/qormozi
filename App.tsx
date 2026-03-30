import React, { useState, useEffect, useCallback } from 'react';
import { Palette, GeneratedResponse } from './types';
import PaletteCard from './components/PaletteCard';
import { generatePalettes } from './services/ai';
import { X } from 'lucide-react';

import MobileHeader from './components/MobileHeader';
import HistoryList from './components/HistoryList';
import InputArea from './components/InputArea';
import EmptyState from './components/EmptyState';

const STORAGE_KEY = 'qormozi-history-v1';

const LOADING_MESSAGES = [
  "Grinding pigments from memory...",
  "Steeping colors in story...",
  "Listening to the hue between words...",
  "Tracing light across the palette...",
  "Mixing kermes with intention...",
  "Aging the tones like good wine...",
  "Finding the color of that feeling...",
  "Extracting warmth from the prompt...",
  "Letting the dye settle...",
  "Composing a harmony of five...",
];

const LoadingOverlay: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  );
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length);
        setFade(true);
      }, 300);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-[#FAFAFA]/90 backdrop-blur-md z-30 flex items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-6 px-8">
        {/* Pulsing logo */}
        <div className="relative">
          <img src="/logo.png" alt="" className="w-16 h-16 object-contain opacity-40 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 border border-[#722F37]/20 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Rotating message */}
        <p
          className={`font-serif italic text-base text-neutral-500 text-center max-w-[260px] leading-relaxed transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}
        >
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load from LS
  const [palettes, setPalettes] = useState<Palette[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [activePaletteId, setActivePaletteId] = useState<string | null>(() => {
     if (typeof window === 'undefined') return null;
     const saved = localStorage.getItem(STORAGE_KEY);
     const parsed = saved ? JSON.parse(saved) : [];
     return parsed.length > 0 ? parsed[0].id : null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
    } catch (e) {
      setError("Storage full.");
    }
  }, [palettes]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result: GeneratedResponse = await generatePalettes(prompt);
      const newPalette = { ...result.palettes[0], id: `PAL-${Date.now()}` };
      setPalettes(prev => [newPalette, ...prev]);
      setActivePaletteId(newPalette.id);
      setPrompt('');
      setIsMobileMenuOpen(false);
      window.scrollTo(0,0);
    } catch (err) {
      console.error(err);
      setError("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePalette = (id: string) => {
    const newPalettes = palettes.filter(p => p.id !== id);
    setPalettes(newPalettes);
    if (activePaletteId === id) setActivePaletteId(newPalettes.length > 0 ? newPalettes[0].id : null);
  };

  const activePalette = palettes.find(p => p.id === activePaletteId);

  return (
    <div className="h-[100dvh] w-full bg-white text-neutral-900 overflow-hidden flex flex-col font-sans">
      
      <MobileHeader 
        setActivePaletteId={setActivePaletteId}
        setPrompt={setPrompt}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        palettes={palettes}
      />

      {/* MAIN STAGE */}
      <div className="flex-1 h-full relative overflow-hidden flex flex-col">
        {activePalette ? (
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-32 bg-[#FAFAFA]">
                <PaletteCard palette={activePalette} />
            </div>
        ) : (
            <EmptyState />
        )}
        
        {loading && <LoadingOverlay />}

        {/* FLOATING INPUT BAR — hidden during loading */}
        {!loading && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/60 to-transparent z-30 pointer-events-none flex justify-center">
             <div className="pointer-events-auto w-full max-w-lg">
                 <InputArea
                   prompt={prompt}
                   setPrompt={setPrompt}
                   loading={loading}
                   handleGenerate={handleGenerate}
                 />
                 {error && <p className="mt-2 text-xs text-red-500 font-mono text-center bg-white/80 py-1 px-2 rounded">{error}</p>}
             </div>
          </div>
        )}
      </div>

      {/* SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/15 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-[#FAFAFA] z-50 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-neutral-200/60">

             {/* Header */}
             <div className="h-14 border-b border-neutral-100 flex items-center justify-between px-5 shrink-0">
                 <div>
                   <span className="font-serif italic text-lg text-neutral-900">Archive</span>
                   <span className="ml-2 text-[10px] text-neutral-300">{palettes.length}</span>
                 </div>
                 <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-600"
                  >
                    <X size={16} />
                 </button>
             </div>

             {/* Scrollable list */}
             <div className="flex-1 overflow-y-auto p-4">
                 <HistoryList
                   palettes={palettes}
                   activePaletteId={activePaletteId}
                   setActivePaletteId={setActivePaletteId}
                   setIsMobileMenuOpen={setIsMobileMenuOpen}
                   onDelete={handleDeletePalette}
                 />
             </div>

             {/* Fixed footer */}
             <div className="px-5 py-5 border-t border-neutral-200/60 bg-white shrink-0 space-y-3">
                 <div className="flex items-center gap-2.5">
                   <div className="w-6 h-6 bg-[#722F37] text-white flex items-center justify-center font-serif italic text-[10px] rounded-full shrink-0">Q</div>
                   <span className="font-serif italic text-base text-[#722F37]">Qormozi</span>
                 </div>
                 <p className="text-xs leading-relaxed text-neutral-500">
                   A semantic color engine that turns memories and moods into palettes.
                 </p>
                 <p className="text-[11px] text-neutral-400">
                   An experiment by{' '}
                   <a href="https://escalay.space" target="_blank" rel="noopener noreferrer" className="text-[#722F37]/70 hover:text-[#722F37] transition-colors underline underline-offset-2 decoration-[#722F37]/20">
                     escalay.space
                   </a>
                 </p>
             </div>

          </div>
        </>
      )}

    </div>
  );
};

export default App;