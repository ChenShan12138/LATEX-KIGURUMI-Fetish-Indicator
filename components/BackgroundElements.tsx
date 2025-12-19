
import React, { useEffect, useState } from 'react';
import { FLOW_NUMBERS } from '../constants';

export const BackgroundElements: React.FC = () => {
  const [offsets, setOffsets] = useState<number[]>([]);

  useEffect(() => {
    setOffsets(FLOW_NUMBERS.map(() => Math.random() * 100));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
      {/* Blueprint Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Floating Data Streams */}
      <div className="absolute top-0 right-10 flex flex-col gap-8">
        {FLOW_NUMBERS.map((text, i) => (
          <div 
            key={i}
            className="text-[10px] text-cyan-400 font-mono whitespace-nowrap animate-pulse"
            style={{ 
              transform: `translateY(${offsets[i]}vh)`,
              animationDelay: `${i * 0.5}s`
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* Schematic Lines */}
      <svg className="absolute inset-0 w-full h-full stroke-cyan-900/30 fill-none">
        <path d="M0,100 L200,100 L250,150 L1000,150" strokeWidth="0.5" />
        <path d="M100,0 L100,500 L150,550" strokeWidth="0.5" />
        <circle cx="250" cy="150" r="3" fill="currentColor" />
        <circle cx="150" cy="550" r="3" fill="currentColor" />
      </svg>
    </div>
  );
};
