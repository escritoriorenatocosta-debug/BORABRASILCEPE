/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Menu, X, Trophy, Sparkles } from 'lucide-react';
import { playPageFlip } from '../audio';
import { UserSticker } from '../types';
import marcaMinicraques from '../assets/images/marca_MInicraques.png';

interface AlbumIndexProps {
  currentPage: 'cover' | 'album' | 'back' | 'achievements' | 'minicraques' | 'bancada';
  setCurrentPage: (page: 'cover' | 'album' | 'back' | 'achievements' | 'minicraques' | 'bancada') => void;
  albumPageIndex: 0 | 1 | 2 | 3;
  setAlbumPageIndex: (index: 0 | 1 | 2 | 3) => void;
  userStickers: UserSticker[];
}

export default function AlbumIndex({
  currentPage,
  setCurrentPage,
  albumPageIndex,
  setAlbumPageIndex,
  userStickers
}: AlbumIndexProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  const navigateTo = (page: 'cover' | 'album' | 'back', innerIndex?: 0 | 1 | 2 | 3) => {
    playPageFlip();
    setCurrentPage(page);
    if (innerIndex !== undefined) {
      setAlbumPageIndex(innerIndex);
    }
    setIsOpen(false);
  };

  const pages = [
    {
      id: 'cover',
      title: 'Capa do Álbum',
      isActive: currentPage === 'cover',
      onClick: () => navigateTo('cover')
    },
    {
      id: 'titulares',
      title: 'Convocados 1',
      isActive: currentPage === 'album' && albumPageIndex === 0,
      onClick: () => navigateTo('album', 0)
    },
    {
      id: 'reservas',
      title: 'Convocados 2',
      isActive: currentPage === 'album' && albumPageIndex === 1,
      onClick: () => navigateTo('album', 1)
    },
    {
      id: 'especiais1',
      title: 'Especiais 1',
      isActive: currentPage === 'album' && albumPageIndex === 2,
      onClick: () => navigateTo('album', 2)
    },
    {
      id: 'especiais2',
      title: 'Especiais 2',
      isActive: currentPage === 'album' && albumPageIndex === 3,
      onClick: () => navigateTo('album', 3)
    },
    {
      id: 'back',
      title: 'Escalação',
      isActive: currentPage === 'back',
      onClick: () => navigateTo('back')
    }
  ];

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
              src="/src/assets/images/ABRIR2.png" 
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
              src="/src/assets/images/Ativo 4.png" 
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
            <div className="flex flex-col gap-2">
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            playPageFlip();
            setIsInstructionsOpen(false);
          }}
        >
          <div 
            style={{ backgroundColor: '#430856', height: '480px' }}
            className="w-full max-w-md border-4 border-slate-950 rounded-[24px] overflow-hidden shadow-[8px_8px_0_rgba(255,223,27,0.15)] flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
            id="instructions-popup-modal"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2.5">
              <span className="font-sans font-black text-xs uppercase tracking-widest block leading-none animate-bounce" style={{ color: '#fc7f37' }}>
                Como Brincar no seu Álbum
              </span>
              <button
                onClick={() => {
                  playPageFlip();
                  setIsInstructionsOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-[#FFDF1B] transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

            {/* Content text */}
            <p 
              className="text-xs text-purple-100 font-medium leading-relaxed font-sans text-center"
            >
              Você é o técnico das figurinhas da CEPE! Abra pacotes surpresas para coletar e revelar os colaboradores. Arraste-os para o slot correto no álbum para colar ou clique para selecionar. Consiga as 12 figurinhas lendárias brasileiras para completar a coleção!
            </p>

            {/* CTA Close Button */}
            <button
              onClick={() => {
                playPageFlip();
                setIsInstructionsOpen(false);
              }}
              className="w-full py-2.5 rounded-full border-2 font-sans font-black text-[11px] uppercase tracking-wider text-center transition-all cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none"
            >
              Entendido! Jogar agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
