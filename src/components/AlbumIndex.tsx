/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Trophy, Sparkles, Crown, Save } from 'lucide-react';
import { playPageFlip } from '../audio';
import { UserSticker } from '../types';
import marcaMinicraques from '../assets/images/marca_MInicraques.png';

interface AlbumIndexProps {
  currentPage: 'cover' | 'album' | 'back' | 'achievements' | 'minicraques' | 'bancada' | 'ranking';
  setCurrentPage: (page: 'cover' | 'album' | 'back' | 'achievements' | 'minicraques' | 'bancada' | 'ranking') => void;
  albumPageIndex: number;
  setAlbumPageIndex: (index: number) => void;
  userStickers: UserSticker[];
  activeRankName?: string;
  onQuickSave?: () => void;
}

export default function AlbumIndex({
  currentPage,
  setCurrentPage,
  albumPageIndex,
  setAlbumPageIndex,
  userStickers,
  activeRankName = '',
  onQuickSave = () => {}
}: AlbumIndexProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const navigateTo = (page: 'cover' | 'album' | 'back', innerIndex?: number) => {
    playPageFlip();
    setCurrentPage(page);
    if (innerIndex !== undefined) {
      setAlbumPageIndex(innerIndex);
    }
    setIsOpen(false);
  };

  const pages: { id: string; title: string; isActive: boolean; onClick: () => void }[] = [
    {
      id: 'cover',
      title: 'Capa do Álbum',
      isActive: currentPage === 'cover',
      onClick: () => navigateTo('cover')
    }
  ];

  // Add Convocados pages 1-18 (indices 0 to 17)
  for (let i = 0; i < 18; i++) {
    pages.push({
      id: `convocados_${i}`,
      title: `Convocados ${i + 1}`,
      isActive: currentPage === 'album' && albumPageIndex === i,
      onClick: () => navigateTo('album', i)
    });
  }

  // Add Especiais pages 1-18 (indices 18 to 35)
  for (let i = 0; i < 18; i++) {
    const pageIndex = 18 + i;
    pages.push({
      id: `especiais_${i}`,
      title: `Especiais ${i + 1}`,
      isActive: currentPage === 'album' && albumPageIndex === pageIndex,
      onClick: () => navigateTo('album', pageIndex)
    });
  }

  // Add Legends pages 1-2 (indices 36 to 37)
  for (let i = 0; i < 2; i++) {
    const pageIndex = 36 + i;
    pages.push({
      id: `legends_${i}`,
      title: `The Legends ${i + 1}`,
      isActive: currentPage === 'album' && albumPageIndex === pageIndex,
      onClick: () => navigateTo('album', pageIndex)
    });
  }

  // Add Extra page (index 38)
  pages.push({
    id: 'extra_page',
    title: 'EXTRA',
    isActive: currentPage === 'album' && albumPageIndex === 38,
    onClick: () => navigateTo('album', 38)
  });

  pages.push({
    id: 'back',
    title: 'Time dos sonhos',
    isActive: currentPage === 'back',
    onClick: () => navigateTo('back')
  });

  const handleGetPacksClick = () => {
    // Switch to album so the pack manager appears (since it's hidden on back cover page)
    if (currentPage === 'back') {
      setCurrentPage('album');
      setAlbumPageIndex(1);
    }
    setIsOpen(false);
    playPageFlip();
    setTimeout(() => {
      const el = document.getElementById('pack-manager-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 print:hidden font-sans" id="album-index-control">
      {/* Centered Sleek Hamburger Index Button */}
      <div className="flex flex-col items-center justify-center select-none gap-3">
        {/* Row 1: Index, Achievements, Instructions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => {
              playPageFlip();
              setIsOpen(!isOpen);
            }}
            style={{ backgroundColor: '#7b2e98' }}
            className="px-6 py-2.5 hover:bg-[#6c28aa] text-[#FFDF1B] hover:text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Abrir Índice de Navegação"
          >
            <Menu className="w-4 h-4 text-[#FFDF1B] stroke-[3]" />
            <span>ÍNDICE DO ÁLBUM</span>
          </button>

          <button
            onClick={() => {
              playPageFlip();
              setCurrentPage('achievements');
            }}
            style={{ backgroundColor: '#7b2e98' }}
            className="px-4 py-2.5 hover:bg-[#6c28aa] text-white hover:text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Minhas Conquistas"
          >
            <Trophy className="w-4 h-4 text-[#FFDF1B]" />
          </button>

          <button
            onClick={() => {
              playPageFlip();
              setCurrentPage('ranking');
            }}
            style={{ backgroundColor: '#ff8400' }}
            className="px-4 py-2.5 hover:bg-[#e06c00] text-white hover:text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Ranking de Progresso"
          >
            <Crown className="w-4 h-4 text-[#FFDF1B]" />
          </button>

          <button
            onClick={onQuickSave}
            style={{ backgroundColor: '#10b981' }}
            className="px-4 py-2.5 hover:bg-[#059669] text-white hover:text-[#FFDF1B] border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title={activeRankName ? `Progresso Salvo para ${activeRankName}` : "Salvar Meu Progresso no Ranking"}
            id="quick-save-progress-btn"
          >
            <Save className="w-4 h-4 text-white" />
            <span className="text-[10px]">
              {activeRankName ? `${activeRankName}` : 'SALVAR'}
            </span>
          </button>

          <button
            onClick={() => {
              playPageFlip();
              setIsInstructionsOpen(true);
            }}
            style={{ backgroundColor: '#7b2e98' }}
            className="px-4 py-2.5 hover:bg-[#6c28aa] text-white hover:text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Instruções / Como Brincar"
            id="instructions-hamburger-btn"
          >
            <Menu className="w-4 h-4 text-[#FFDF1B] stroke-[3]" />
          </button>
        </div>

        {/* Row 2: Minicraques and Pack Opener */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => {
              playPageFlip();
              setCurrentPage('minicraques');
            }}
            style={{ backgroundColor: '#e21b8e' }}
            className="px-4 py-2.5 hover:bg-[#c10b73] text-white hover:text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Mini Craques"
            id="mini-craques-index-btn"
          >
            <img 
              src={marcaMinicraques} 
              alt="Mini Craques" 
              style={{ paddingLeft: '0px', marginLeft: '0px', borderRadius: '0px', width: '90px', height: '40px' }}
              className="object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </button>

          <button
            onClick={handleGetPacksClick}
            style={{ backgroundColor: '#ff8400' }}
            className="px-4 py-2.5 hover:bg-[#e06c00] text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Obter Figurinhas"
            id="get-packs-quick-btn"
          >
            <img 
              src="/assets/images/ABRIR2.png" 
              alt="Obter Figurinhas" 
              style={{ width: '90px', height: '40px' }}
              className="object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </button>

          <button
            onClick={() => {
              playPageFlip();
              setCurrentPage('bancada');
            }}
            style={{ backgroundColor: '#af1d92' }}
            className="px-4 py-2.5 hover:bg-[#931379] text-white border-4 border-slate-950 rounded-full cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none font-sans font-black text-xs tracking-widest uppercase"
            title="Minha Bancada"
            id="bancada-quick-btn"
          >
            <img 
              src="/assets/images/Ativo 4.png" 
              alt="Minha Bancada" 
              style={{ width: '90px', height: '40px' }}
              className="object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>

      {/* Sleek Minimalist Modal / Popup Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            playPageFlip();
            setIsOpen(false);
          }}
        >
          <div 
            className="w-full max-w-xs bg-[#c510b8] border-4 border-slate-950 rounded-[24px] overflow-hidden shadow-[8px_8px_0_rgba(255,223,27,0.15)] flex flex-col p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimal Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2.5">
              <span className="font-sans font-black text-[10px] text-[#FFDF1B] uppercase tracking-widest block leading-none">
                Navegar para:
              </span>
              <button
                onClick={() => {
                  playPageFlip();
                  setIsOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-[#FFDF1B] transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Menu Options List - Text Only, No Icons */}
            <div className="flex flex-col gap-2 max-h-[58vh] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-slate-950 scrollbar-track-transparent">
              {pages.map((p) => (
                <button
                  key={p.id}
                  onClick={p.onClick}
                  className={`w-full py-3 px-4 rounded-[20px] border-2 font-sans font-black text-[11px] uppercase tracking-wider text-center transition-all cursor-pointer ${
                    p.isActive 
                      ? 'bg-[#FFDF1B] text-slate-950 border-slate-950 shadow-[2px_2px_0_rgba(15,10,25,1)] translate-y-[-1px]'
                      : 'bg-slate-950 hover:bg-[#FFDF1B] text-white hover:text-slate-950 border-slate-850 hover:border-slate-950 shadow-[1px_1px_0_rgba(0,0,0,0.5)] active:translate-y-0.5 active:shadow-none'
                  }`}
                >
                  {p.title}
                </button>
              ))}

              {/* Minimalist 'Obter Novas Figuras' Action Button */}
              <button
                onClick={handleGetPacksClick}
                className="w-full py-3 px-4 rounded-full border-2 font-sans font-black text-[11px] uppercase tracking-wider text-center transition-all cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
              >
                Obter Novas Figuras
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Modal / Popup Overlay */}
      {isInstructionsOpen && (
        <div 
          className="fixed inset-0 bg-[#0c0316]/90 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto animate-fade-in cursor-pointer select-none"
          onClick={() => {
            playPageFlip();
            setIsInstructionsOpen(false);
          }}
        >
          <div 
            className="relative w-full max-w-xl md:max-w-2xl bg-slate-950 border-4 border-slate-950 rounded-[32px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
            id="instructions-popup-modal"
          >
            {/* Main content: pixel-perfect render of popup regras.png */}
            <div className="rounded-[28px] overflow-hidden bg-[#240c32] flex justify-center items-center">
              <img
                src="/assets/images/popup regras.png"
                alt="Regras do Álbum"
                style={{
                  marginBottom: '20px',
                  paddingBottom: '0px',
                  paddingRight: '0px',
                  paddingTop: '0px',
                  paddingLeft: '0px',
                  marginLeft: '0px',
                  marginRight: '0px',
                  marginTop: '20px'
                }}
                className="w-full h-auto object-contain max-h-[85vh] block select-none"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Grande botão de fechar no lado direito acima (círculo branco com + em preto) */}
            <button
              onClick={() => {
                playPageFlip();
                setIsInstructionsOpen(false);
              }}
              style={{ fontFamily: 'monospace', lineHeight: '1' }}
              className="absolute -top-4 -right-4 sm:-top-5 sm:-right-5 w-12 h-12 sm:w-14 sm:h-14 bg-white text-slate-950 rounded-full border-4 border-slate-950 flex items-center justify-center font-black text-3xl sm:text-4xl cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all z-[300]"
              title="Fechar"
              aria-label="Fechar Pop-up de Regras"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
