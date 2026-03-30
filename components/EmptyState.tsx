import React from 'react';

const EmptyState: React.FC = () => (
    <div className="h-full flex flex-col items-center justify-center p-8 select-none pb-32">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center mb-6 overflow-hidden opacity-60">
            <img src="/logo.png" alt="Qormozi" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-serif text-5xl md:text-7xl italic mb-4 text-[#722F37]/60 text-center">Qormozi</h1>
        <p className="font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase text-neutral-400 text-center max-w-xs leading-relaxed">
            A semantic color engine.<br/>Describe a memory to begin.
        </p>
    </div>
);
export default EmptyState;