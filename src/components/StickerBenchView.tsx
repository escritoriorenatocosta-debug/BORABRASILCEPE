import React, { useState, useRef } from 'react';
import { Sticker, UserSticker } from '../types';
import StickerItem from './StickerItem';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface StickerBenchViewProps {
  benchStickers: { sticker: Sticker; count: number }[];
  userStickers?: UserSticker[];
  dockAlignment: 'bottom' | 'left' | 'right';
  count: number;
  onGlueSticker: (stickerId: number, slotId: string) => void;
  onDragStart?: (e: React.MouseEvent | React.TouchEvent, sticker: Sticker) => void;
  onStickerSelect?: (sticker: Sticker) => void;
}

export default function StickerBenchView({ 
    benchStickers, 
    userStickers = [],
    dockAlignment, 
    count, 
    onGlueSticker,
    onDragStart,
    onStickerSelect
}: StickerBenchViewProps) {
  const [selectedStickerId, setSelectedStickerId] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // scrolls approx 2-3 stickers wide
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isHorizontal = dockAlignment === 'bottom';

  return (
    <div className="relative w-full flex items-center group px-8 sm:px-12">
      {/* Left Arrow Button (semitransparent light gray circle with bold white chevron) */}
      {isHorizontal && benchStickers.length > 0 && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 sm:left-2 z-30 bg-white/40 hover:bg-white text-white hover:text-slate-950 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border border-white/50 active:scale-95 focus:outline-none shrink-0"
          style={{
            width: '30px',
            height: '30px',
            padding: '0px',
            marginLeft: '-24px'
          }}
          title="Ver anteriores"
        >
          <ChevronLeft className="w-5 h-5 stroke-[3.5]" />
        </button>
      )}

      {/* Main bench area list */}
      <div 
        ref={scrollContainerRef}
        style={{ touchAction: 'pan-x' }}
        className={`flex gap-4 overflow-x-auto scroll-smooth pt-6 pb-4 px-1 scrollbar-thin scrollbar-thumb-slate-800 select-none custom-bench-belt z-10 transition-all duration-300 w-full min-w-0
          ${dockAlignment !== 'bottom' ? 'md:flex-col md:overflow-y-auto md:overflow-x-hidden md:h-full md:max-h-[calc(78vh-130px)] md:px-0 md:py-2 md:gap-4 md:items-center' : ''}
        `}
      >
        {benchStickers.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center py-6 text-center text-slate-400 text-xs">
            <span className="font-extrabold text-[#FFDF1B] text-sm mb-1 uppercase tracking-wide">
              Bancada Vazia!
            </span>
            Abra pacotes para ver suas figurinhas aqui!
          </div>
        ) : (
          benchStickers.map(({ sticker, count: stickerCount }) => {
              const isSelected = selectedStickerId === sticker.id;
              const isGluedAnywhere = userStickers.some(u => u.stickerId === sticker.id && u.status === 'glued');
              
              return (
                <div 
                  key={sticker.id} 
                  className="flex flex-col items-center shrink-0 relative group"
                  onMouseDown={(e) => onDragStart && onDragStart(e, sticker)}
                  onTouchStart={(e) => onDragStart && onDragStart(e, sticker)}
                  onClick={() => onStickerSelect && onStickerSelect(sticker)}
                >
                  <div className={`relative rounded-xl cursor-grab transition-all ${isSelected ? 'scale-105 shadow-[0_0_20px_rgba(255,223,27,0.8)] border-3 border-[#FFDF1B]' : ''}`}>
                    <StickerItem sticker={sticker} size="md" />
                    
                    {/* Star Badge (New/Unique) */}
                    {!isGluedAnywhere && (
                      <div className="absolute -top-2.5 -left-2.5 bg-white border-2 border-[#db2777] rounded-full p-1 shadow-md z-20">
                        <Star className="w-3 h-3 fill-[#db2777] text-[#db2777]" />
                      </div>
                    )}

                    {/* Quantity badge */}
                    <div className="absolute -top-2.5 -right-2.5 bg-[#FFDF1B] text-slate-950 border-2 border-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs shadow-md animate-scale-in">
                      x{stickerCount}
                    </div>
                  </div>
                </div>
              )
          })
        )}
      </div>

      {/* Right Arrow Button (black circle with bold white chevron) */}
      {isHorizontal && benchStickers.length > 0 && (
         <button
          onClick={() => scroll('right')}
          className="absolute right-0 sm:right-2 z-30 bg-slate-950 hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg border-2 border-slate-950 hover:scale-105 active:scale-95 focus:outline-none shrink-0"
          style={{
            width: '30px',
            height: '30px',
            marginRight: '-24px'
          }}
          title="Ver próximas"
        >
          <ChevronRight className="w-5 h-5 stroke-[3.5]" />
        </button>
      )}
    </div>
  );
}
