import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { Sticker, UserSticker } from '../types';
import StickerItem from './StickerItem';
import { playPageFlip, playGlue, playGoalCrowd, playSuccess } from '../audio';
import { STICKERS } from '../data';
import marcaMinicraques from '../assets/images/marca_MInicraques.png';

interface MiniCraquesProps {
  userStickers: UserSticker[];
  onBack: () => void;
  onAddMinicraque?: (minicraqueId: number) => void;
  onGoToBancada?: () => void;
}

export default function MiniCraques({ userStickers, onBack, onAddMinicraque, onGoToBancada }: MiniCraquesProps) {
  const [targetSticker, setTargetSticker] = useState<Sticker | null>(null);
  
  // Custom states for transformation pipeline
  const [showPopup, setShowPopup] = useState(false);
  const [popupStage, setPopupStage] = useState<'video' | 'card'>('video');
  const [countdown, setCountdown] = useState(3);
  const [justTransformedId, setJustTransformedId] = useState<number | null>(null);

  // Filter player stickers 1 to 24 that the user has already obtained (status can be glued or inventory)
  const availablePlayers = STICKERS.filter(s => s.id <= 24).filter(s => 
    userStickers.some(u => u.stickerId === s.id)
  );

  // Map standard player sticker to corresponding minicraque
  const getMinicraqueSticker = (standardStickerId: number): Sticker | undefined => {
    const mcId = standardStickerId + 100;
    return STICKERS.find(s => s.id === mcId);
  };

  // Run countdown simulation for the circular video/gif popup
  useEffect(() => {
    let timer: any;
    if (showPopup && popupStage === 'video') {
      setCountdown(3);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPopup, popupStage]);

  // Handle completion when countdown reaches 0
  useEffect(() => {
    if (showPopup && popupStage === 'video' && countdown === 0) {
      handleTransformationComplete();
    }
  }, [countdown, showPopup, popupStage]);

  const handleStartFusion = () => {
    if (!targetSticker) return;
    playGlue();
    setShowPopup(true);
    setPopupStage('video');
  };

  const handleTransformationComplete = () => {
    if (!targetSticker) return;
    
    const mcSticker = getMinicraqueSticker(targetSticker.id);
    if (mcSticker) {
      setJustTransformedId(mcSticker.id);
      // Play triumphant football celebration sound!
      playGoalCrowd();
      // Add the minicraque to inventory so they can glue it in the album!
      if (onAddMinicraque) {
        onAddMinicraque(mcSticker.id);
      }
    }
    setPopupStage('card');
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setTargetSticker(null);
  };

  const currentMinicraque = justTransformedId ? STICKERS.find(s => s.id === justTransformedId) : null;

  return (
    <div 
      style={{ backgroundColor: '#bc17ab' }}
      className="max-w-6xl mx-auto w-full my-6 border-[4px] sm:border-[6px] border-slate-950 p-4 sm:p-10 rounded-[30px] sm:rounded-[40px] animate-fade-in relative shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden"
    >
      
      {/* Decorative futuristic field stripes inside background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-purple-950/20 to-black/10 pointer-events-none" />
      
      {/* HEADER SECTION */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-purple-950/50 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <img 
            src={marcaMinicraques} 
            alt="Marca Minicraques" 
            style={{ height: 'auto' }}
            className="w-full max-w-[240px] sm:max-w-[280px] object-contain select-none pb-1"
            referrerPolicy="no-referrer"
          />
          <div>
            <p 
              style={{ color: '#ffffff', fontStyle: 'italic' }}
              className="font-semibold mt-0.5 text-sm sm:text-base md:text-lg leading-snug max-w-[240px] sm:max-w-[200px]"
            >
              Transforme seus craques em lendas exclusivas de miniatura!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playPageFlip();
            onBack();
          }}
          className="px-5 py-2.5 bg-black hover:bg-slate-900 text-white font-bold rounded-full border-2 border-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] hover:shadow-[1px_1px_0_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <Lucide.ChevronLeft className="w-4 h-4 text-yellow-400" />
          Voltar para o Álbum
        </button>
      </div>

      {/* CORE INTERACTION FIELD (GRID) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: THE CENTRAL GLOWING FUSION PORTAL */}
        <div 
          style={{ height: '380px', width: '100%', maxWidth: '500px', backgroundColor: '#72007b' }}
          className="lg:col-span-6 flex flex-col items-center justify-center p-6 rounded-[32px] border-2 border-purple-900/40 shadow-inner"
        >
          
          <div className="relative flex items-center justify-center">
            {/* Outer neon spinning portal decoration */}
            <div 
              style={{ borderColor: '#ff8046' }}
              className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-dashed border-purple-500/40 animate-[spin_20s_linear_infinite] ${targetSticker ? 'animate-[spin_8s_linear_infinite]' : ''}`} 
            />
            
            {/* Pulsating middle portal frame */}
            <div 
              style={{ borderColor: '#45cc2b' }}
              className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-purple-900/10 to-indigo-900/10 border-[6px] border-purple-900 shadow-[0_0_40px_rgba(168,85,247,0.15)] flex items-center justify-center ${targetSticker ? 'shadow-[0_0_50px_rgba(74,222,128,0.3)]' : ''}`}
            >
              <div className="absolute inset-0 rounded-full bg-black/40 backdrop-blur-[2px]" />
            </div>

            {/* Main Stage Circle */}
            <div 
              style={{ backgroundColor: '#000000' }}
              className="w-56 h-56 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center relative overflow-hidden z-10"
            >
              
              {targetSticker ? (
                <div className="animate-scale-in flex flex-col items-center justify-center">
                  <div className="transform rotate-[-3deg] hover:rotate-0 transition-transform duration-300 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                    <StickerItem sticker={targetSticker} isGlued={true} size="lg" className="scale-105" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center p-4 select-none">
                  <div 
                    style={{ backgroundColor: '#7610dd', borderColor: '#f8f8f8' }}
                    className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-3 animate-pulse"
                  >
                    <Lucide.UserPlus className="w-7 h-7 text-purple-400" />
                  </div>
                  <p 
                    style={{ color: '#000000' }}
                    className="text-xs font-black uppercase tracking-wider"
                  >
                    Fusor Vazio
                  </p>
                  <p 
                    style={{ color: '#fcf9f9' }}
                    className="text-[11px] font-bold max-w-[160px] mt-1 leading-normal"
                  >
                    Selecione uma figurinha abaixo para carregar no círculo
                  </p>
                </div>
              )}
            </div>

            {/* REDONDO VERDE (INICIAR) BUTTON OVERLAID ON CIRCLE */}
            {targetSticker && (
              <button
                onClick={handleStartFusion}
                style={{ backgroundColor: '#9f19bc' }}
                className="absolute inset-x-0 -bottom-5 mx-auto w-16 h-16 hover:bg-[#83149c] text-white border-4 border-slate-950 rounded-full shadow-[0_6px_20px_rgba(159,25,188,0.5)] hover:shadow-[0_4px_10px_rgba(159,25,188,0.3)] hover:scale-105 active:scale-95 active:translate-y-0.5 transition-all flex items-center justify-center cursor-pointer group z-20"
                title="Iniciar Fusão!"
              >
                <Lucide.Play className="w-6 h-6 text-white fill-white ml-0.5 animate-pulse group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          <div className="mt-8 text-center max-w-sm">
            {targetSticker ? (
              <div className="animate-fade-in">
                <p className="text-white text-xs font-bold">Pronto para a transformação!</p>
                <p 
                  style={{ color: '#cfbde0', width: '280px' }}
                  className="text-[11px] mt-1 font-semibold mx-auto"
                >
                  Clique no botão verde <strong style={{ color: '#e9aa5e' }} className="font-extrabold uppercase">Iniciar</strong> para fundir o {targetSticker.name} no seu Minicraque correspondente.
                </p>
              </div>
            ) : (
              <p 
                style={{ color: '#ffffff', width: '300px', marginRight: '0px', marginBottom: '-25px' }}
                className="text-[11px] font-semibold leading-relaxed"
              >
                Pressione qualquer figurinha da sua coleção abaixo para enviá-la para o círculo de transformação.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BENCH OF COLLECTED PLAYER STICKERS */}
        <div className="lg:col-span-6 flex flex-col h-full">
          <div className="bg-slate-950/40 p-5 rounded-[28px] border-2 border-purple-950/40 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-purple-200">
                <Lucide.Layers className="w-4 h-4 text-yellow-400" />
                Sua Bancada de Jogadores:
              </span>
              <span 
                style={{ fontFamily: 'system-ui', fontWeight: 'bold', color: '#ffffff' }}
                className="text-purple-300 text-[11px] bg-purple-950/60 px-3 py-1 rounded-full border border-purple-900/30 font-mono font-bold"
              >
                {availablePlayers.length}/24 Coletados
              </span>
            </div>

            {availablePlayers.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-slate-500">
                <Lucide.FileQuestion className="w-12 h-12 text-purple-900 mb-2" />
                <p className="text-purple-400 font-bold text-xs">Nenhuma fígurinha comum coletada ainda!</p>
                <p className="text-purple-500/80 text-[11px] max-w-xs mt-1">Abra pacotes na página inicial para obter jogadores comuns (1 a 24) e depois transformá-los aqui.</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
                {availablePlayers.map((u) => {
                  const isSelected = targetSticker?.id === u.id;
                  const isTransformed = userStickers.some(us => us.stickerId === u.id + 100);
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        playPageFlip();
                        setTargetSticker(u);
                      }}
                      className={`p-1.5 bg-slate-900/90 rounded-[14px] hover:scale-105 active:scale-95 transition-all text-center border-2 flex flex-col items-center cursor-pointer relative group ${
                        isSelected 
                          ? 'border-green-400 bg-green-950/20 shadow-[0_0_15px_rgba(74,222,128,0.2)]' 
                          : 'border-purple-950 hover:border-purple-700 bg-slate-900'
                      }`}
                    >
                      {/* Transformed magenta OK badge */}
                      {isTransformed && (
                        <div 
                          className="absolute -top-1.5 -left-1.5 text-white rounded-full px-1.5 py-0.5 border border-slate-950 z-20 shadow text-[9px] font-black tracking-tight shrink-0 flex items-center justify-center gap-0.5"
                          style={{ backgroundColor: '#ff00ff' }}
                          title="Já transformado!"
                        >
                          <Lucide.Check className="w-2.5 h-2.5 stroke-[4]" />
                          <span>OK</span>
                        </div>
                      )}

                      {/* Interactive click tick badge */}
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white rounded-full p-0.5 border border-slate-950 z-20 shadow">
                          <Lucide.Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      
                      <div className="w-full aspect-[0.72] overflow-hidden rounded-lg">
                        <StickerItem sticker={u} isGlued={true} size="sm" className="w-full h-full" />
                      </div>
                      
                      <span className="text-[9px] font-extrabold pb-0.5 uppercase tracking-tight text-purple-200 mt-1 truncate w-full px-0.5 group-hover:text-yellow-300">
                        {u.name.replace(/\s+II$/, '')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* MINICRAQUE GENERATION CIRCULAR MODAL POPUP */}
      {showPopup && targetSticker && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
          
          {/* Circular Frame Container */}
          <div className="w-80 h-80 sm:w-[440px] sm:h-[440px] rounded-full border-8 border-[#d95ae7] bg-[#0e0622] relative flex flex-col items-center justify-center overflow-hidden shadow-[0_0_110px_rgba(217,90,231,0.5)] animate-scale-in">
            
            {/* --- STAGE 1: VIDEO/GIF FUSION EFFECT --- */}
            {popupStage === 'video' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full">
                
                {/* Visual Video Elements with image fallback */}
                <video 
                  src="/src/assets/videos/transform.mp4" 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  onError={(e) => {
                    // Fail gracefully by hiding video element
                    e.currentTarget.style.display = 'none';
                  }}
                  className="absolute inset-0 w-full h-full object-cover rounded-full" 
                />

                <img 
                  src="/src/assets/images/transform_video.gif" 
                  alt="Fusão em progresso"
                  onError={(e) => {
                    // Fail gracefully
                    e.currentTarget.style.display = 'none';
                  }}
                  className="absolute inset-0 w-full h-full object-cover rounded-full mix-blend-screen opacity-80"
                  referrerPolicy="no-referrer"
                />

                {/* Highly immersive, futuristic CSS Particle Holographic Swirl generator fallback */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_#0a031a_95%)] pointer-events-none" />
                
                {/* Gimmicky neon fusion rings */}
                <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-emerald-400 border-t-transparent animate-[spin_1.5s_linear_infinite]" />
                <div className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-dashed border-pink-500 border-r-transparent animate-[spin_3s_linear_infinite_reverse]" />
                <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border-[8px] border-double border-yellow-300 border-b-transparent animate-spin" />
                
                {/* Floating energy particle nodes */}
                <div className="absolute top-10 left-10 w-4 h-4 bg-purple-500 rounded-full animate-ping" />
                <div className="absolute bottom-16 right-16 w-3 h-3 bg-cyan-400 rounded-full animate-ping [animation-delay:0.8s]" />
                <div className="absolute top-1/2 right-8 w-5 h-5 bg-yellow-400 rounded-full animate-pulse" />

                {/* Center Core HUD display */}
                <div className="z-20 text-center select-none flex flex-col items-center justify-center">
                  <Lucide.Zap className="w-14 h-14 text-yellow-300 animate-[bounce_1s_infinite] drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
                  <span className="text-white font-black text-2xl uppercase tracking-widest mt-2">{countdown}s</span>
                  <span className="text-yellow-400 font-extrabold text-[11px] uppercase tracking-widest bg-slate-950/80 px-4 py-1 rounded-full border border-yellow-400/40 shadow mt-2">
                    Iniciando Transformação...
                  </span>
                </div>
              </div>
            )}

            {/* --- STAGE 2: CARD MINICRAQUE REVEALED --- */}
            {popupStage === 'card' && currentMinicraque && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full p-6 text-center">
                
                {/* Rotating bright golden sunburst beams back */}
                <div className="absolute inset-y-0 w-full h-full flex items-center justify-center scale-125 select-none pointer-events-none opacity-55">
                  <svg className="w-full h-full animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" />
                    {Array.from({ length: 16 }).map((_, i) => (
                      <path 
                        key={i} 
                        d="M 50 50 L 100 35 L 100 65 Z" 
                        fill="#d95ae7" 
                        opacity="0.12" 
                        transform={`rotate(${i * 22.5} 50 50)`} 
                      />
                    ))}
                  </svg>
                </div>

                {/* Core Sparkle Particle floating nodes */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_#09031a_90%)]" />

                {/* High density Card item stage with bouncy scale animation */}
                <div className="relative animate-scale-in drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] transform hover:scale-105 transition-transform duration-300">
                  <StickerItem sticker={currentMinicraque} isGlued={true} size="lg" className="border-4 border-[#898989] scale-[1.05] w-[220px]" />
                  <div className="absolute -top-4 -right-4 bg-[#d95ae7] rounded-full p-2 border-2 border-slate-950 shadow-xl animate-pulse z-20 pointer-events-none select-none flex items-center justify-center">
                    <img 
                      src="/src/assets/images/Ativo 7.png" 
                      alt="Sparkles" 
                      className="w-10 h-10 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* BELOW MODAL POPUP - ACTION BOARD CTA BAR */}
          {popupStage === 'card' && currentMinicraque && (
            <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center animate-fade-in z-50">
              
              {/* GO GLUE ON THE ALBUM BUTTON */}
              <button
                onClick={() => {
                  playPageFlip();
                  handleClosePopup();
                  if (onGoToBancada) {
                    onGoToBancada();
                  } else {
                    onBack();
                  }
                }}
                className="px-6 py-3 bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 rounded-full font-black uppercase tracking-wider border-4 border-slate-950 transition-all cursor-pointer shadow-[4px_4px_0_rgba(15,10,25,1)] hover:shadow-[2px_2px_0_rgba(15,10,25,1)] active:translate-y-0.5 text-xs flex items-center justify-center gap-2"
              >
                enviar para Bancada
              </button>

              {/* FUSE ANOTHER STICKER BUTTON */}
              <button
                onClick={handleClosePopup}
                className="px-6 py-3 bg-purple-950 hover:bg-purple-900 border-4 border-purple-800 text-purple-100 rounded-full font-black uppercase tracking-wider transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 text-xs flex items-center gap-1.5"
              >
                <Lucide.IterationCw className="w-4 h-4 text-purple-200" />
                Fazer outra
              </button>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
