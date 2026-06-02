import React from 'react';
import { playPageFlip, playComecou } from '../audio';
import { ChevronRight, Play } from 'lucide-react';
import DefaultTitleLogo from './DefaultTitleLogo';

interface EntryPageProps {
  onEnter: () => void;
  brandImage: string | null;
  coverBgImage: string | null;
  titleImage: string | null;
  onOpenVideo?: () => void;
}

export default function EntryPage({
  onEnter,
  brandImage,
  coverBgImage,
  titleImage,
  onOpenVideo
}: EntryPageProps) {

  const handleEnterClick = () => {
    playComecou();
    onEnter();
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 overflow-hidden bg-[#1a0c2a] flex flex-col justify-between p-6 sm:p-12 animate-fade-in font-sans">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-[#56104b] pointer-events-none z-0 overflow-hidden">
        {coverBgImage ? (
          <>
            <img
              src={coverBgImage}
              alt="Background da Capa"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Dark overlay with professional gradient mapping */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140822]/95 via-[#56104b]/40 to-[#140822]/70" />
          </>
        ) : (
          <>
            {/* Multi-layered flat vibrant vector shape layout fallbacks */}
            <div className="absolute -left-16 -top-16 w-96 h-96 rounded-full bg-[#e21b3c] opacity-90" />
            <div className="absolute right-[-15%] top-[-20%] w-[550px] h-[550px] rounded-full bg-[#00529b]/80" />
            <div className="absolute left-[30%] top-[20%] w-96 h-96 rounded-full bg-[#ff7a00]/90" />
            <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-[#8cc63f]/70" />
            <div className="absolute right-[5%] bottom-[-15%] w-[450px] h-[450px] rounded-full bg-[#00a2e8]/95" />
          </>
        )}
        
        {/* Retro halftone aesthetic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:32px_32px] opacity-[0.08]" />
      </div>

      {/* Main Container Layering */}
      <div className="relative z-10 w-full h-full max-w-5xl mx-auto flex flex-col justify-between items-center text-center">
        
        {/* Premium Header Brand Display */}
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-3 select-none">
            {brandImage ? (
              <div className="flex items-center shadow-2xl">
                <img
                  src={brandImage}
                  alt="Logo da Marca"
                  className="h-[60px] w-[200px] p-[10px] bg-black rounded-[20px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="flex items-center shadow-2xl">
                <img
                  src="/src/assets/images/regenerated_image_1779729548221.png"
                  alt="CEPE Logo"
                  className="h-[60px] w-[200px] p-[10px] bg-black rounded-[20px] object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
          </div>

          {/* Quick Intro Video Toggle */}
          {onOpenVideo && (
            <button
              onClick={onOpenVideo}
              className="px-4.5 py-2.5 bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 border-2 border-slate-950 font-black text-[11px] uppercase tracking-wider rounded-full shadow-[3px_3px_0_rgba(15,10,25,0.95)] cursor-pointer transition-all active:translate-y-0.5 flex items-center gap-2"
              title="Assistir ao vídeo de apresentação"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>Vídeo Oficial</span>
            </button>
          )}
        </div>

        {/* Floating Core Album Title and Interactive Elements */}
        <div className="flex flex-col items-center justify-center my-auto py-8">
          <div className="animate-bounce-slow flex justify-center items-center mb-6">
            {titleImage ? (
              <img
                src={titleImage}
                alt="BRASIL"
                referrerPolicy="no-referrer"
                className="object-contain filter drop-shadow-[0_12px_12px_rgba(0,0,0,0.8)] w-[260px] sm:w-[380px] md:w-[480px] h-[200px] sm:h-[300px] md:h-[360px] transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-[260px] sm:w-[380px] md:w-[480px] h-[200px] sm:h-[300px] md:h-[360px] flex items-center justify-center">
                <DefaultTitleLogo className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.7)]" />
              </div>
            )}
          </div>

          {/* Golden Badge Badge with angle skew */}
          <div 
            style={{ 
              backgroundColor: '#ff8300',
              fontSize: '12px',
              width: '300px',
              height: '40px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="text-slate-950 font-black rounded-full border-4 border-slate-950 shadow-[6px_6px_0_rgba(15,10,25,0.95)] md:rotate-[-2deg] tracking-widest uppercase select-none max-w-full"
          >
            Álbum oficial • Bora Brasil CEPE
          </div>
        </div>

        {/* Enter Action Layer */}
        <div className="w-full flex flex-col items-center gap-6 mt-auto pb-6">
          <button
            onClick={handleEnterClick}
            className="group relative w-[300px] h-[60px] bg-[#e21b3c] hover:bg-[#FFDF1B] text-white hover:text-slate-950 font-black rounded-full border-4 border-slate-950 shadow-[8px_8px_0_rgba(15,10,25,1)] flex items-center justify-center gap-3.5 transition-all duration-300 active:translate-y-1.5 active:shadow-none cursor-pointer text-[14px] tracking-widest uppercase animate-pulse-slow"
          >
            <span>ENTRAR NO ÁLBUM</span>
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-2.5 duration-300 stroke-[3px]" />
          </button>

          {/* Credits watermark subtitle */}
          <span className="text-[14px] text-white/60 font-sans font-bold uppercase select-none">
            Seleção BORA BRASIL CEPE 2026
          </span>
        </div>

      </div>

      {/* Decorative Spine Overlay effect */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/35 via-transparent to-transparent z-20 pointer-events-none" />
    </div>
  );
}
