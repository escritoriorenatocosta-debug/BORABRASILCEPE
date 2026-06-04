import React, { useState, useEffect } from 'react';
import StickerBenchView from './StickerBenchView';
import StickerItem from './StickerItem';
import { Sticker, UserSticker } from '../types';
import capaBora from '../assets/images/CAPA BORA.png';
import { playPageFlip, playPeel, playGlue } from '../audio';
import { ArrowLeft, Star, X, CheckSquare, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface BancadaViewProps {
  benchStickers: { sticker: Sticker; count: number }[];
  userStickers: UserSticker[];
  onGlueSticker: (stickerId: number, slotId: string) => void;
  onGoToAlbum: (sticker?: Sticker) => void;
}

export default function BancadaView({ 
  benchStickers, 
  userStickers, 
  onGlueSticker, 
  onGoToAlbum 
}: BancadaViewProps) {
  const [draggingSticker, setDraggingSticker] = useState<Sticker | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isHoveredOnAlbum, setIsHoveredOnAlbum] = useState(false);
  const [zoomedSticker, setZoomedSticker] = useState<Sticker | null>(null);

  // Calculate coordinates when dragging is active
  useEffect(() => {
    if (!draggingSticker) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragPosition({ x: clientX, y: clientY });

      // Live collision check with the Album Drop Zone element
      const dropTarget = document.getElementById('album-drop-zone');
      if (dropTarget) {
        const rect = dropTarget.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          setIsHoveredOnAlbum(true);
        } else {
          setIsHoveredOnAlbum(false);
        }
      }
    };

    const handleUp = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? (e.changedTouches?.[0]?.clientX || e.touches[0]?.clientX || 0) : e.clientX;
      const clientY = 'touches' in e ? (e.changedTouches?.[0]?.clientY || e.touches[0]?.clientY || 0) : e.clientY;

      const diffX = Math.abs(clientX - startPos.x);
      const diffY = Math.abs(clientY - startPos.y);

      // If finger or mouse barely moved, it is a click/tap, not a drag!
      if (diffX < 12 && diffY < 12) {
        setZoomedSticker(draggingSticker);
      } else {
        // Evaluate dropping
        const dropTarget = document.getElementById('album-drop-zone');
        if (dropTarget) {
          const rect = dropTarget.getBoundingClientRect();
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            playGlue();
            onGoToAlbum(draggingSticker);
          }
        }
      }
      setDraggingSticker(null);
      setIsHoveredOnAlbum(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [draggingSticker, startPos, onGoToAlbum]);

  const handleDragStartInBench = (e: React.MouseEvent | React.TouchEvent, sticker: Sticker) => {
    playPeel();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setStartPos({ x: clientX, y: clientY });
    setDragPosition({ x: clientX, y: clientY });
    setDraggingSticker(sticker);
  };

  const handleStickerClickInBench = (sticker: Sticker) => {
    setZoomedSticker(sticker);
  };

  const totalBenchCount = benchStickers.reduce((total, s) => total + s.count, 0);

  return (
    <div className={`w-full max-w-full overflow-x-hidden min-h-screen text-white font-sans p-4 sm:p-6 select-none relative pb-16 ${zoomedSticker || draggingSticker ? 'z-[9999]' : 'z-20'}`} style={{ backgroundColor: '#af1d92', borderRadius: '20px' }}>
      
      <div className="max-w-5xl mx-auto relative z-10 flex flex-col gap-6">
        
        {/* BANNER HEADER (Replicates visual design of the reference mockup) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Round Back Button */}
            <button
              onClick={() => {
                playPageFlip();
                onGoToAlbum();
              }}
              className="w-12 h-12 bg-white text-slate-950 border-4 border-slate-950 rounded-2xl flex items-center justify-center hover:bg-[#FFDF1B] hover:scale-105 transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer shrink-0"
              title="Voltar para o Álbum"
              style={{ borderRadius: '20px' }}
            >
              <ArrowLeft className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Custom Header labels */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 drop-shadow-md">
                Minhas figuras
              </h1>
              <p className="text-xs text-zinc-300 font-medium">
                Pressione para ampliar ou arraste as figurinhas para colar!
              </p>
            </div>
          </div>

          {/* Unplaced (FORA) counter status badge */}
          <div className="flex items-center gap-2 bg-slate-950/80 border-2 text-white px-5 py-2.5 rounded-full shadow-[2px_2px_0_rgba(0,0,0,0.4)] self-center sm:self-auto uppercase tracking-wider text-xs font-black" style={{ borderColor: '#ffffff' }}>
            <span className="text-[#FFDF1B] text-sm animate-pulse" style={{ color: '#ff0087' }}>●</span>
            <span>{totalBenchCount} FORA DO ÁLBUM</span>
          </div>
        </div>

        {/* WORKBENCH SHELF CONTAINER (White central card like reference mockup) */}
        <div className="w-full bg-[#7b2e98] border-4 border-slate-950 rounded-[32px] p-4 sm:p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] relative overflow-hidden flex flex-col gap-4">
          
          {/* Header section in the purple container */}
          <div className="flex items-center justify-between border-b border-purple-500/30 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span 
                className="font-black uppercase tracking-widest flex items-center justify-center text-center select-none"
                style={{
                  width: '165.11px',
                  height: '40px',
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  paddingTop: '0px',
                  paddingBottom: '0px',
                  borderWidth: '0px',
                  borderRadius: '20px',
                  color: '#ffffff',
                  backgroundColor: '#ff6e00',
                  fontSize: '14px',
                  lineHeight: '14px'
                }}
              >
                BANCADA
              </span>
            </div>
          </div>

          {/* Horizontal Sticker carousel scrollable */}
          <StickerBenchView 
            benchStickers={benchStickers} 
            userStickers={userStickers}
            dockAlignment="bottom" 
            count={totalBenchCount}
            onGlueSticker={onGlueSticker}
            onDragStart={handleDragStartInBench}
            onStickerSelect={handleStickerClickInBench}
          />
          
          {/* Helpful bottom guide */}
          <div className="text-center pt-2 border-t border-purple-500/20">
            <p className="text-[10px] text-purple-200 uppercase tracking-widest font-black animate-pulse">
              ★ Estrela indica figurinha novidade (não colada no álbum ainda!)
            </p>
          </div>
        </div>

        {/* BOTTOM DROP TARGET & INSTRUCTION PANEL (Highly aesthetic mockup matching referenced layout) */}
        <div className="max-w-md mx-auto w-full mt-4">

          {/* DYNAMIC DROP TARGET (ACTS AS TARGET FOR THE DRAGGED STICKER) */}
          <div 
            id="album-drop-zone"
            onClick={() => {
              playPageFlip();
              onGoToAlbum();
            }}
            className={`relative cursor-pointer select-none rounded-[28px] p-6 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center min-h-[220px] shadow-[6px_6px_0_rgba(0,0,0,1)]
              ${isHoveredOnAlbum ? 'scale-102 shadow-[0_0_30px_rgba(255,223,27,0.4)]' : 'hover:scale-101'}
            `}
            style={{
              backgroundColor: '#940870',
              borderWidth: '3px',
              borderColor: '#000000',
              borderStyle: 'solid'
            }}
          >
            {/* Sparkle decorative circles */}
            {isHoveredOnAlbum && (
              <div className="absolute inset-x-0 -top-6 flex justify-center animate-bounce">
                <span className="bg-[#FFDF1B] text-slate-950 text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full border-2 border-slate-950 shadow-md">
                  SOLTE AQUI PARA COLAR!
                </span>
              </div>
            )}

            {/* Imagem simulando a capa ou páginas interiores */}
            <div className="relative group/cover">
              <div 
                className={`rounded-2xl border-4 transition-all flex flex-col items-center justify-center relative overflow-hidden shadow-lg
                  ${isHoveredOnAlbum ? 'ring-4 ring-[#FFDF1B]/30' : ''}
                `}
                style={{
                  width: '120px',
                  height: '140px',
                  borderWidth: '2px',
                  borderColor: '#000000',
                  borderStyle: 'solid'
                }}
              >
                <img 
                  src={capaBora} 
                  alt="Capa do Álbum" 
                  className="absolute inset-0 object-cover z-0"
                  style={{ 
                    backgroundColor: '#000000',
                    width: '120px',
                    height: '140px'
                  }}
                  referrerPolicy="no-referrer"
                />
                {/* Visual subtle overlay when hovered */}
                <div className={`absolute inset-0 transition-opacity duration-300 z-10 ${isHoveredOnAlbum ? 'bg-amber-400/20' : 'bg-transparent'}`}></div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p 
                className="text-white font-black uppercase tracking-wider text-xs"
                style={{ color: '#ffffff' }}
              >
                {isHoveredOnAlbum ? 'Solte para abrir o álbum!' : 'Arrastar os cromos aqui'}
              </p>
              <p className="text-[10px] text-zinc-400 font-bold max-w-[240px]">
                {isHoveredOnAlbum ? 'Sua figurinha será selecionada e as posições reveladas.' : 'Arraste uma figurinha acima até esta capa para ir direto colar no álbum.'}
              </p>
            </div>
          </div>

        </div>

        <div className="hidden">
        

        </div>

        {/* CUSTOM ENLARGED / ZOOMED VIEW MODAL (AO CLICAR NA FIGURA ELA AMPLIA) */}
        {zoomedSticker && (() => {
          const isAlreadyGlued = userStickers.some(u => u.stickerId === zoomedSticker.id && u.status === 'glued');
          return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity animate-fade-in animate-duration-200">
              <div 
                className="rounded-[36px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative flex flex-col items-center text-center justify-center"
                style={{
                  height: '490px',
                  width: '300px',
                  backgroundColor: '#7b2e98',
                  borderColor: '#000000',
                  borderWidth: '4px',
                  borderStyle: 'solid'
                }}
              >
                
                {/* Close Button top-right */}
                <button
                  onClick={() => {
                    playPageFlip();
                    setZoomedSticker(null);
                  }}
                  className="absolute top-4 right-4 w-9 h-9 bg-white text-slate-950 border-2 border-slate-950 rounded-full flex items-center justify-center hover:bg-rose-500 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
                >
                  <X className="w-5 h-5 stroke-[3]" />
                </button>

                {isAlreadyGlued && (
                  <span 
                    className="inline-flex items-center gap-1.5 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-white select-none tracking-widest animate-pulse mt-2 mb-2 bg-transparent"
                  >
                    <AlertCircle className="w-4 h-4 text-white stroke-[2.5]" />
                    <span>JÁ COLADA NO ÁLBUM</span>
                  </span>
                )}

                {/* Large zoomed view image */}
                <div 
                  className="my-6 flex justify-center items-center drop-shadow-[0_15px_30px_rgba(255,223,27,0.35)] overflow-hidden"
                  style={{ width: '200px', height: '300px', borderRadius: '10px' }}
                >
                  <StickerItem 
                    sticker={zoomedSticker} 
                    size="lg" 
                    className="w-full h-full" 
                    style={{ width: '100%', height: '100%', borderRadius: '10px' }} 
                  />
                </div>

                {/* Action direct glue shortcut button */}
                <button
                  onClick={() => {
                    playPageFlip();
                    onGoToAlbum(zoomedSticker);
                    setZoomedSticker(null);
                  }}
                  className="mt-6 w-full border-3 transition-all flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5"
                  style={{
                    height: '45px',
                    borderRadius: '15px',
                    backgroundColor: '#ff5b00',
                    color: '#ffffff',
                    borderColor: '#ffffff',
                    borderStyle: 'solid'
                  }}
                >
                  <CheckSquare 
                    className="stroke-[3]" 
                    style={{
                      width: '30px',
                      height: '20px',
                      color: '#ffffff'
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      lineHeight: '14px',
                      color: '#ffffff'
                    }}
                    className="font-black uppercase tracking-wider"
                  >
                    {isAlreadyGlued ? 'VER NO ÁLBUM (LOCALIZAR)' : 'COLAR NO LIVRO ILUSTRADO'}
                  </span>
                </button>

              </div>
            </div>
          );
        })()}

        {/* FLOATING DRAGGING STICKER WITH MOUSE (VISUALLY ANIMATED LIKE BEFORE) */}
        {draggingSticker && (
          <div
            className="fixed pointer-events-none select-none z-[110] transform transition-transform duration-75"
            style={{
              left: `${dragPosition.x - 52}px`,
              top: `${dragPosition.y - 80}px`,
            }}
          >
            <div className="animate-pulse shadow-2xl scale-125 rotate-[-3deg] border-4 border-[#FFDF1B] rounded-2xl bg-slate-900 overflow-hidden">
              <StickerItem sticker={draggingSticker} size="md" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
