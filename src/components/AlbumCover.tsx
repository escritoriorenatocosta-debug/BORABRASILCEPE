/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { playPageFlip, playSuccess } from '../audio';
import { Eye, ChevronRight, Sparkles, X, Upload, Play } from 'lucide-react';
import DefaultTitleLogo from './DefaultTitleLogo';

interface AlbumCoverProps {
  onOpen: () => void;
  gluedCount: number;
  totalCount: number;
  brandImage: string | null;
  coverBgImage: string | null;
  onCoverBgImageChange?: (newBg: string | null) => void;
  onBrandImageChange?: (newLogo: string | null) => void;
  titleImage: string | null;
  onTitleImageChange?: (newTitleImg: string | null) => void;
  onOpenVideo?: () => void;
}

export default function AlbumCover({
  onOpen,
  gluedCount,
  totalCount,
  brandImage,
  coverBgImage,
  onCoverBgImageChange,
  onBrandImageChange,
  titleImage,
  onTitleImageChange,
  onOpenVideo
}: AlbumCoverProps) {

  const handleClick = () => {
    playPageFlip();
    onOpen();
  };

  const percentage = Math.round((gluedCount / totalCount) * 100) || 0;

  return (
    <div className="max-w-4xl mx-auto w-full my-6 bg-[#1a0c2a] rounded-[32px] border-[6px] border-slate-950 p-0.5 overflow-hidden animate-fade-in relative aspect-auto md:aspect-[1.414] min-h-[520px] md:min-h-0 flex flex-col justify-between">
      {/* Decorative background modern flat overlapping vector shapes */}
      <div className="absolute inset-0 bg-[#56104b] pointer-events-none z-0 overflow-hidden">
        {coverBgImage ? (
          <>
            <img
              src={coverBgImage}
              alt="Background da Capa"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Overlay to keep the high-contrast text extremely legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140822]/90 via-[#56104b]/20 to-[#140822]/60" />
          </>
        ) : (
          <>
            {/* Large overlapping flat vibrant shapes */}
            <div className="absolute -left-12 -top-12 w-80 h-80 rounded-full bg-[#e21b3c]" />
            <div className="absolute right-[-10%] top-[-15%] w-[450px] h-[450px] rounded-full bg-[#00529b]/70" />
            <div className="absolute left-[35%] top-[15%] w-72 h-72 rounded-full bg-[#ff7a00]/80" />
            <div className="absolute left-[-5%] bottom-[-15%] w-96 h-96 rounded-full bg-[#8cc63f]/60" />
            <div className="absolute right-[5%] bottom-[-20%] w-[380px] h-[380px] rounded-full bg-[#00a2e8]/80" />
          </>
        )}
        
        {/* Retro minimalist flat layout paper dots */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-[0.12]" />
      </div>

      <div 
        className="w-full min-h-full flex flex-col justify-between p-6 sm:p-10 relative z-10 flex-1"
      >
        
        {/* Top Header Row of the Book Cover */}
        <div className="flex justify-between items-center z-20 animate-fade-in w-full">
          <div className="flex items-center gap-3 select-none pointer-events-none">
            {brandImage ? (
              <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-full border-2 border-[#FFDF1B] shadow-lg">
                <img
                  src={brandImage}
                  alt="Logo da Marca"
                  className="h-9 w-auto max-w-[130px] object-contain rounded-full bg-white px-2.5 py-1"
                />
                <div className="flex flex-col text-left pr-2">
                  <span className="font-sans text-[9px] text-white tracking-wider font-extrabold uppercase leading-none">
                    CEPE
                  </span>
                  <span className="text-[7.5px] text-[#FFDF1B] uppercase tracking-widest font-bold mt-1 leading-none">
                    EDIÇÃO ESPECIAL
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Central Display Typography - Alternating Bold and Light weights, Sans-serif, Flat spacing */}
        <div className="flex flex-col items-center text-center my-auto z-10 relative">
          
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-sans tracking-tighter text-center leading-[0.9] select-none uppercase flex flex-col items-center">
            <span className="relative flex justify-center items-center">
              {titleImage ? (
                <img
                  src={titleImage}
                  alt="BRASIL"
                  referrerPolicy="no-referrer"
                  className="object-contain filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.65)] w-[200px] sm:w-[280px] md:w-[350px] h-[160px] sm:h-[230px] md:h-[300px]"
                  style={{ marginLeft: '0px', marginTop: '-11px' }}
                />
              ) : (
                <div className="flex items-center justify-center w-[200px] sm:w-[280px] md:w-[350px] h-[160px] sm:h-[230px] md:h-[300px]">
                  <DefaultTitleLogo className="w-full h-full object-contain" />
                </div>
              )}
            </span>
          </h1>

          {/* Fully rounded flat yellow sticker badge */}
          <div 
            style={{ backgroundColor: '#39cb29', marginTop: '19px' }}
            className="inline-flex items-center gap-2 text-slate-950 font-black px-8 py-2.5 rounded-full border-2 border-slate-950 shadow-[4px_4px_0_rgba(15,10,25,0.95)] text-sm sm:text-base rotate-[-3deg] tracking-wider uppercase"
          >
            ÁLBUM OFICIAL 2026
          </div>

          {/* Modern flat action button - centered in the middle of the cover */}
          <button
            onClick={handleClick}
            className="group mt-[28px] relative px-9 py-3.5 bg-[#e21b8e] hover:bg-[#FFDF1B] text-white hover:text-slate-950 font-black rounded-full border-2 border-slate-950 shadow-[4px_4px_0_rgba(15,10,25,0.95)] flex items-center gap-2 transition-all duration-200 active:translate-y-1 active:shadow-none cursor-pointer text-sm tracking-wider uppercase"
          >
            <span>ABRIR ÁLBUM</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5 duration-255" />
          </button>
        </div>

        {/* Bottom Panel Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 z-10 border-t-2 border-white/20 pt-6">
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-[10px] text-[#FFDF1B] font-sans font-bold uppercase tracking-widest">
              ESTADO DA COLEÇÃO
            </span>
            <span className="text-white text-sm font-semibold mt-0.5">
              {gluedCount === totalCount ? (
                <span className="text-white font-black animate-pulse uppercase">COLEÇÃO COMPLETADA! - 100%</span>
              ) : (
                <span className="font-sans">
                  Coladas: <span className="font-black text-[#FFDF1B]">{gluedCount}</span> de <span className="font-medium">{totalCount}</span> figurinhas (<span className="font-bold">{percentage}%</span>)
                </span>
              )}
            </span>
          </div>
        </div>
        
        {/* Physical cover folder spine shadow on the left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/25 via-transparent to-transparent z-20 pointer-events-none" />
      </div>
    </div>
  );
}
