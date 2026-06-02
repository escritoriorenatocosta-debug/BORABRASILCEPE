import * as Lucide from 'lucide-react';
import React from 'react';
import { Sticker, UserSticker } from '../types';
import { STICKERS } from '../data';
import StickerItem from './StickerItem';
import { playPageFlip } from '../audio';

interface AlbumAchievementsProps {
  benchStickers: { sticker: Sticker; count: number }[];
  userStickers: UserSticker[];
  onBack: () => void;
  onGlueSticker: (stickerId: number, slotId: string) => void;
  onGoToMiniCraques: () => void;
}

export default function AlbumAchievements({
  benchStickers,
  userStickers,
  onBack,
  onGlueSticker,
  onGoToMiniCraques
}: AlbumAchievementsProps) {
  // Filter for legendary/special stickers (assuming ID 25/26 are special, 
  // or based on the logic in AlbumInside: isSpecial = sticker.id === 25 || sticker.id === 26)
  const specialStickers = STICKERS.filter(s => s.id === 25 || s.id === 26 || s.id === 27);
  
  const collectedSpecial = specialStickers.filter(special => 
    userStickers.some(u => u.stickerId === special.id && u.status === 'glued')
  );

  return (
    <div className="max-w-4xl mx-auto w-full my-6 bg-[#af1d92] rounded-[32px] border-[6px] border-slate-950 p-6 sm:p-10 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8 pb-6 border-b-2 border-white/10">
        <div className="flex justify-between items-center w-full">
            <button
              onClick={() => {
                playPageFlip();
                onBack();
              }}
              className="px-5 py-2.5 bg-black hover:bg-slate-700 text-white font-bold rounded-full border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 flex items-center gap-2 cursor-pointer uppercase text-xs tracking-wider"
            >
              <Lucide.ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
        </div>
        <div id="achievements-title-image" className="select-none flex items-center justify-center py-1">
          <img 
            src="/src/assets/images/Ativo8.png" 
            alt="Minhas Conquistas" 
            style={{ filter: 'brightness(1.2) sepia(0.2)' }}
            className="w-full max-w-lg object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.15)] select-none"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-8 border border-[#c1c1c1] p-4 rounded-xl">
        {specialStickers.map((special) => {
          const isCollected = collectedSpecial.some(c => c.id === special.id);
          return (
            <div 
              key={special.id}
              className={`p-4 rounded-2xl border-4 ${
                isCollected 
                  ? 'bg-emerald-900/50 border-emerald-500' 
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`relative ${isCollected ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                  <StickerItem
                    sticker={special}
                    size="md"
                    isGlued={true}
                    className="border-0 shadow-lg"
                  />
                  {!isCollected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-black text-xs uppercase bg-black/50 px-2 py-1 rounded">Bloqueado</span>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-center text-white text-sm">{special.name}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Super Final Card SPC_4 - added below the 3 cards and centered with success message */}
      {(() => {
        const totalStandardStickers = STICKERS.filter(s => s.id !== 28);
        const isAlbumFullyCompleted = totalStandardStickers.length > 0 && totalStandardStickers.every(s => 
          userStickers.some(u => u.stickerId === s.id && u.status === 'glued')
        );
        const spc4Sticker = STICKERS.find(s => s.id === 28);

        if (!isAlbumFullyCompleted || !spc4Sticker) return null;

        return (
          <div 
            className="my-8 flex flex-col items-center justify-center p-6 border-4 rounded-[28px] max-w-sm mx-auto shadow-2xl relative overflow-hidden text-center animate-fade-in ring-4 ring-yellow-400/20"
            style={{ borderColor: '#c0cecf', backgroundColor: '#ffffff' }}
          >
            <img 
              src="/src/assets/images/GOOOL.png" 
              alt="GOOOL!!!" 
              className="h-16 object-contain mb-2 max-w-full drop-shadow-md"
              referrerPolicy="no-referrer"
            />
            <p 
              className="text-xs font-bold uppercase tracking-wider mb-5"
              style={{ color: '#000000' }}
            >
              Você completou seu álbum.
            </p>

            <div className="relative p-1.5 bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 rounded-[24px] shadow-2xl">
              <StickerItem
                sticker={spc4Sticker}
                size="lg"
                isGlued={true}
                className="border-4 border-slate-950 shadow-inner rounded-xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 
              className="font-extrabold text-sm mt-4 tracking-tight uppercase"
              style={{ color: '#000000' }}
            >
              {spc4Sticker.name}
            </h3>
          </div>
        );
      })()}

    </div>
  );
}
