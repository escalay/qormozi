import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

const SUGGESTIONS = [
  "The smell of rain on hot concrete",
  "A grandmother's kitchen at dawn",
  "Tokyo neon reflected in puddles",
  "Faded love letters in a cedar box",
  "The last hour of golden hour",
  "Moroccan tea on a rooftop at dusk",
  "A wool coat in November fog",
  "First snowfall on a silent street",
  "Rust and wildflowers by the traintrack",
  "Midnight ink and candlelight",
  "Eid morning before the prayer",
  "Spice market in the afternoon heat",
  "Old books and amber lamplight",
  "The sea just before a storm",
  "Linen drying in Mediterranean sun",
];

interface InputAreaProps {
  prompt: string;
  setPrompt: (s: string) => void;
  loading: boolean;
  handleGenerate: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  prompt,
  setPrompt,
  loading,
  handleGenerate
}) => {
  const [placeholder, setPlaceholder] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const suggestionIndex = useRef(Math.floor(Math.random() * SUGGESTIONS.length));
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const animate = useCallback(() => {
    if (isFocused || prompt) return;

    const current = SUGGESTIONS[suggestionIndex.current];

    if (!isDeleting.current) {
      charIndex.current++;
      setPlaceholder(current.slice(0, charIndex.current));

      if (charIndex.current === current.length) {
        timeoutRef.current = setTimeout(() => {
          isDeleting.current = true;
          animate();
        }, 2000);
        return;
      }
      timeoutRef.current = setTimeout(animate, 50 + Math.random() * 40);
    } else {
      charIndex.current--;
      setPlaceholder(current.slice(0, charIndex.current));

      if (charIndex.current === 0) {
        isDeleting.current = false;
        suggestionIndex.current = (suggestionIndex.current + 1) % SUGGESTIONS.length;
        timeoutRef.current = setTimeout(animate, 400);
        return;
      }
      timeoutRef.current = setTimeout(animate, 25);
    }
  }, [isFocused, prompt]);

  useEffect(() => {
    if (!isFocused && !prompt) {
      timeoutRef.current = setTimeout(animate, 600);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [animate, isFocused, prompt]);

  return (
    <div className={`relative w-full transition-all duration-500 ease-out ${isFocused || prompt ? 'scale-105' : 'scale-100'}`}>
        <div className={`relative flex items-center rounded-full bg-white border shadow-lg transition-all duration-300 ${isFocused || prompt ? 'border-[#722F37]/30 shadow-xl shadow-[#722F37]/[0.04]' : 'border-neutral-200/80 shadow-black/[0.03]'}`}>
           <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleGenerate()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? "Describe a mood or memory..." : placeholder || "..."}
              className="flex-1 h-14 bg-transparent border-none outline-none pl-6 pr-14 font-serif text-base placeholder:text-neutral-300 placeholder:italic text-neutral-800 rounded-full truncate"
           />
           <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="absolute right-1.5 w-11 h-11 bg-[#722F37] text-white rounded-full flex items-center justify-center disabled:opacity-0 disabled:scale-90 transition-all duration-300 hover:bg-[#5a252c] active:scale-95"
          >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
          </button>
        </div>
    </div>
  );
};

export default InputArea;
