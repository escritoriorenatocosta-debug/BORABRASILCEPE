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
  // Filter for legendary/special stickers (SPC_1 to SPC_4 for top grid)
  const specialStickers = STICKERS.filter(s => [201, 202, 203, 204].includes(s.id));
  
  const collectedSpecial = specialStickers.filter(special => {
    const isGlued = userStickers.some(u => u.stickerId === special.id && u.status === 'glued');
    if (isGlued) return true;
    if (special.id === 201 && localStorage.getItem('cepe_celebrated_page1') === 'true') return true;
    if (special.id === 202 && localStorage.getItem('cepe_celebrated_page2') === 'true') return true;
    if (special.id === 203 && localStorage.getItem('cepe_celebrated_page3') === 'true') return true;
    if (special.id === 204 && localStorage.getItem('cepe_celebrated_page4') === 'true') return true;
    return false;
  });

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 border border-[#c1c1c1] p-4 rounded-xl">
        {specialStickers.map((special) => {
          const isCollected = collectedSpecial.some(c => c.id === special.id);
          return (
            <div 
              key={special.id}
              className={`p-4 rounded-2xl border-4 ${
                isCollected 
                  ? 'bg-emerald-900/50 border-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.2)]' 
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`relative ${isCollected ? 'opacity-100 scale-100' : 'opacity-30 grayscale scale-95'} transition-all duration-300`}>
                  <StickerItem
                    sticker={special}
                    size="md"
                    isGlued={true}
                    className="border-0 shadow-lg"
                  />
                  {!isCollected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white font-black text-xs uppercase bg-black/60 px-2 py-1 rounded border border-slate-700 shadow-md">Bloqueado</span>
                    </div>
                  )}
                </div>
                <h3 className="font-extrabold text-center text-white text-xs uppercase tracking-tight leading-4">{special.name}</h3>
                <p className="text-[10px] text-slate-300 font-semibold text-center leading-none">{special.role}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Super Final Card SPC_5 - "CAMPEÃO SUPREMO" centered with success message */}
      {(() => {
        const spc5Sticker = STICKERS.find(s => s.id === 205);
        if (!spc5Sticker) return null;
        const isCollected = userStickers.some(u => u.stickerId === 205 && u.status === 'glued') || localStorage.getItem('cepe_has_celebrated_full_completion_v1') === 'true';

        return (
          <div 
            className="my-8 flex flex-col items-center justify-center p-6 border-4 rounded-[28px] max-w-sm mx-auto shadow-2xl relative overflow-hidden text-center animate-fade-in ring-4 ring-yellow-400/20"
            style={{ 
              borderColor: isCollected ? '#ffd100' : '#475569', 
              backgroundColor: '#ffffff' 
            }}
          >
            {isCollected ? (
              <img 
                src="/src/assets/images/GOOOL.png" 
                alt="GOOOL!!!" 
                className="h-16 object-contain mb-2 max-w-full drop-shadow-md animate-pulse"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-950/50 flex items-center justify-center border border-slate-700/60 mb-2">
                <Lucide.Lock className="w-5 h-5 text-slate-400" />
              </div>
            )}
            
            <p 
              className="text-xs font-black uppercase tracking-wider mb-4 text-yellow-400"
            >
              {isCollected ? 'Parabéns! Álbum Completo' : 'Final Ultimate Reward'}
            </p>

            <div className={`relative p-1.5 bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 rounded-[24px] shadow-2xl transition-all duration-300 ${isCollected ? 'opacity-100 scale-105' : 'opacity-30 grayscale scale-95'}`}>
              <StickerItem
                sticker={spc5Sticker}
                size="lg"
                isGlued={true}
                className="border-4 border-slate-950 shadow-inner rounded-xl hover:scale-105 transition-transform duration-300"
              />
            </div>

            <h3 
              className="font-extrabold text-sm mt-4 tracking-tight uppercase text-white"
            >
              {spc5Sticker.name}
            </h3>
            <p 
              className="text-[11px] mt-1 font-medium text-slate-300"
              style={{ color: '#0f0f0f' }}
            >
              {isCollected 
                ? 'Você se tornou o Campeão Supremo do CEPE!' 
                : 'Complete 100% do Álbum para destravar'
              }
            </p>
          </div>
        );
      })()}

    </div>
  );
}
