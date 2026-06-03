/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { playSuccess, playPageFlip } from '../audio';
import { Sparkles, Award, RotateCcw, BadgeCheck, Flame, Trash2, Camera, X, Lock, Play, Video, Trophy, Download } from 'lucide-react';
import { STICKERS } from '../data';
import StickerItem from './StickerItem';
import html2canvas from 'html2canvas';

const colorCache = new Map<string, string>();

function convertColorToRgba(cssColor: string): string {
  const trimmed = cssColor.trim();
  if (colorCache.has(trimmed)) {
    return colorCache.get(trimmed)!;
  }
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (!ctx) return trimmed;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = trimmed;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    const rgba = `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3).replace(/\.?0+$/, '')})`;
    colorCache.set(trimmed, rgba);
    return rgba;
  } catch (err) {
    return trimmed;
  }
}

interface AlbumBackProps {
  gluedStickerIds: number[];
  onReset: () => void;
  onPrevPage: () => void;
  brandImage: string | null;
  onBrandImageChange: (image: string | null) => void;
  coverBgImage: string | null;
  onCoverBgImageChange: (image: string | null) => void;
  titleImage: string | null;
  onTitleImageChange: (image: string | null) => void;
  onOpenVideo?: () => void;
  onViewAchievements: () => void;
  onLineupCompletionChange?: (isComplete: boolean) => void;
}

type FormationType = '433' | '442' | '352' | '4231';

interface PositionDef {
  role: string;
  left: number; // percentage coordinate
  top: number;  // percentage coordinate
  label: string; // Display label
}

const FORMATIONS: Record<FormationType, PositionDef[]> = {
  '433': [
    { role: 'GK', left: 50, top: 86, label: 'Goleiro' },
    { role: 'LD', left: 83, top: 68, label: 'L. Direito' },
    { role: 'ZAD', left: 63, top: 71, label: 'Zag. Direto' },
    { role: 'ZAE', left: 37, top: 71, label: 'Zag. Esquerdo' },
    { role: 'LE', left: 17, top: 68, label: 'L. Esquerdo' },
    { role: 'MCD', left: 70, top: 44, label: 'Meio Direito' },
    { role: 'MC', left: 50, top: 48, label: 'Meio Central' },
    { role: 'MCE', left: 30, top: 44, label: 'Meio Esquerdo' },
    { role: 'PD', left: 80, top: 20, label: 'Ponta Direita' },
    { role: 'CA', left: 50, top: 16, label: 'Centroavante' },
    { role: 'PE', left: 20, top: 20, label: 'Ponta Esquerda' },
  ],
  '442': [
    { role: 'GK', left: 50, top: 86, label: 'Goleiro' },
    { role: 'LD', left: 83, top: 68, label: 'L. Direito' },
    { role: 'ZAD', left: 63, top: 71, label: 'Zag. Direito' },
    { role: 'ZAE', left: 37, top: 71, label: 'Zag. Esquerdo' },
    { role: 'LE', left: 17, top: 68, label: 'L. Esquerdo' },
    { role: 'MD', left: 81, top: 44, label: 'Meio Direito' },
    { role: 'MCD', left: 61, top: 46, label: 'Volante' },
    { role: 'MCE', left: 39, top: 46, label: 'Meio Central' },
    { role: 'ME', left: 19, top: 44, label: 'Meio Esquerdo' },
    { role: 'LS', left: 35, top: 18, label: 'Ataque Esq.' },
    { role: 'RS', left: 65, top: 18, label: 'Ataque Dir.' },
  ],
  '352': [
    { role: 'GK', left: 50, top: 86, label: 'Goleiro' },
    { role: 'CB', left: 50, top: 71, label: 'Zagueiro' },
    { role: 'LCB', left: 26, top: 69, label: 'Zagueiro Esq.' },
    { role: 'RCB', left: 74, top: 69, label: 'Zagueiro Dir.' },
    { role: 'LD', left: 85, top: 46, label: 'Meio/Ala Dir.' },
    { role: 'LE', left: 15, top: 46, label: 'Meio/Ala Esq.' },
    { role: 'LCM', left: 32, top: 47, label: 'Meio-Campo' },
    { role: 'RCM', left: 68, top: 47, label: 'Meio-Campo' },
    { role: 'CAM', left: 50, top: 32, label: 'Armador' },
    { role: 'LS', left: 35, top: 16, label: 'Ataque Esq.' },
    { role: 'RS', left: 65, top: 16, label: 'Centroavante' },
  ],
  '4231': [
    { role: 'GK', left: 50, top: 86, label: 'Goleiro' },
    { role: 'LD', left: 83, top: 68, label: 'L. Direito' },
    { role: 'ZAD', left: 63, top: 71, label: 'Zag. Direito' },
    { role: 'ZAE', left: 37, top: 71, label: 'Zag. Esquerdo' },
    { role: 'LE', left: 17, top: 68, label: 'L. Esquerdo' },
    { role: 'MCD', left: 62, top: 52, label: 'Volante' },
    { role: 'MCE', left: 38, top: 52, label: 'Volante' },
    { role: 'MAD', left: 80, top: 34, label: 'Meio Direto' },
    { role: 'MAC', left: 50, top: 35, label: 'Meia Armador' },
    { role: 'MAE', left: 20, top: 34, label: 'Meio Esquerdo' },
    { role: 'CA', left: 50, top: 15, label: 'Centroavante' },
  ],
};

const LINEUP_STORAGE_KEY = 'cepe_dream_team_lineup_v2';
const FORMATION_STORAGE_KEY = 'cepe_dream_team_formation_v2';

export default function AlbumBack({ 
  gluedStickerIds, 
  onReset, 
  onPrevPage,
  brandImage,
  onBrandImageChange,
  coverBgImage,
  onCoverBgImageChange,
  titleImage,
  onTitleImageChange,
  onOpenVideo,
  onViewAchievements,
  onLineupCompletionChange
}: AlbumBackProps) {
  const totalCount = STICKERS.length;
  const gluedCount = gluedStickerIds.length;
  const isComplete = gluedCount === totalCount;

  const handleTitleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onTitleImageChange(base64);
      playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveTitleImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onTitleImageChange(null);
    playSuccess();
  };

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onBrandImageChange(base64);
      playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBrandImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onBrandImageChange(null);
    playSuccess();
  };

  const handleCoverBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onCoverBgImageChange(base64);
      playSuccess();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCoverBgImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onCoverBgImageChange(null);
    playSuccess();
  };

  // Formation & Lineup states
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [formation, setFormation] = useState<FormationType>('433');
  const [selectedPositionIdx, setSelectedPositionIdx] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState('');
  const [showConfirmClearLineup, setShowConfirmClearLineup] = useState(false);
  const [showConfirmResetAlbum, setShowConfirmResetAlbum] = useState(false);
  const [lineupPreviewUrl, setLineupPreviewUrl] = useState<string | null>(null);

  const [lineup, setLineup] = useState<Record<number, number | null>>(() => {
    try {
      const stored = localStorage.getItem(LINEUP_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}
    
    // Default empty lineup map: 0 to 10 indices initially un-escalated
    const defaultLineup: Record<number, number | null> = {};
    for (let i = 0; i < 11; i++) {
      defaultLineup[i] = null;
    }
    return defaultLineup;
  });

  // Load last chosen formation
  useEffect(() => {
    try {
      const storedF = localStorage.getItem(FORMATION_STORAGE_KEY);
      if (storedF && ['433', '442', '352', '4231'].includes(storedF)) {
        setFormation(storedF as FormationType);
      }
    } catch (_) {}
  }, []);

  // Sync lineup changes
  useEffect(() => {
    try {
      localStorage.setItem(LINEUP_STORAGE_KEY, JSON.stringify(lineup));
    } catch (_) {}
    const isLineupComplete = Object.values(lineup).length === 11 && Object.values(lineup).every(val => val !== null);
    onLineupCompletionChange?.(isLineupComplete);
  }, [lineup, onLineupCompletionChange]);

  const handleSetFormation = (f: FormationType) => {
    setFormation(f);
    try {
      localStorage.setItem(FORMATION_STORAGE_KEY, f);
    } catch (_) {}
  };

  // Assign player to selected position (preventing copies of the same player)
  const handleSelectPlayer = (stickerId: number) => {
    if (selectedPositionIdx === null) return;

    setLineup(prev => {
      const next = { ...prev };
      
      // Clean previous position slots where this player was assigned to maintain uniqueness
      Object.keys(next).forEach(key => {
        const idx = Number(key);
        if (next[idx] === stickerId) {
          next[idx] = null;
        }
      });

      next[selectedPositionIdx] = stickerId;
      return next;
    });

    setSelectedPositionIdx(null);
    playSuccess();
  };

  // Call html2canvas on the soccer pitch container
  const handleExportLineup = async () => {
    const pitch = document.getElementById('my-dream-team-pitch-spread');
    if (!pitch) return;

    setIsExporting(true);
    setExportMessage('Gerando imagem de alta resolução...');
    playSuccess();

    try {
      // Delay slightly for render cycles
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(el, pseudoElt) {
        const style = originalGetComputedStyle.call(window, el, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = target[prop as keyof CSSStyleDeclaration];
            if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
              return convertColorToRgba(val);
            }
            return typeof val === 'function' ? (val as Function).bind(target) : val;
          }
        }) as CSSStyleDeclaration;
      };

      let canvas;
      try {
        canvas = await html2canvas(pitch, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0c2417',
          scale: 2, // Gorgeous crisp high dpi scaling
          logging: false,
          onclone: (clonedDoc) => {
            const clonedWindow = clonedDoc.defaultView;
            if (clonedWindow) {
              const iframeGetComputedStyle = clonedWindow.getComputedStyle;
              clonedWindow.getComputedStyle = function(el, pseudoElt) {
                const style = iframeGetComputedStyle.call(clonedWindow, el, pseudoElt);
                return new Proxy(style, {
                  get(target, prop) {
                    const val = target[prop as keyof CSSStyleDeclaration];
                    if (typeof val === 'string' && (val.includes('oklch') || val.includes('oklab'))) {
                      return convertColorToRgba(val);
                    }
                    return typeof val === 'function' ? (val as Function).bind(target) : val;
                  }
                }) as CSSStyleDeclaration;
              };
            }

            let combinedCss = '';
            try {
              const sheets = Array.from(document.styleSheets);
              for (const sheet of sheets) {
                try {
                  const rules = Array.from(sheet.cssRules || sheet.rules);
                  for (const rule of rules) {
                    combinedCss += rule.cssText + '\n';
                  }
                } catch (e) {
                  console.warn('Could not read style rules:', e);
                }
              }
            } catch (e) {
              console.warn('Could not read styleSheets:', e);
            }

            // Also collect from inline style elements in document
            const styleTags = Array.from(document.getElementsByTagName('style'));
            styleTags.forEach(style => {
              if (style.textContent) {
                combinedCss += style.textContent + '\n';
              }
            });

            // Fallback if combined is empty
            if (!combinedCss) {
              const clonedStyles = Array.from(clonedDoc.getElementsByTagName('style'));
              clonedStyles.forEach(style => {
                if (style.textContent) {
                  combinedCss += style.textContent + '\n';
                }
              });
            }

            // Convert oklch and oklab layout color schemes to standard browser-supported css hsla or rgba
            const processedCss = combinedCss
              .replace(/(oklch|oklab)\(([^)]+)\)/gi, (match) => {
                if (match.includes('var(')) {
                  return 'rgba(0,0,0,0)'; // prevent passing CSS vars down to the canvas filter
                }
                return convertColorToRgba(match);
              });

            // Remove all pre-existing stylesheets and styles from the cloned document to avoid html2canvas oklch crash
            const clonedLinks = Array.from(clonedDoc.getElementsByTagName('link'));
            clonedLinks.forEach(link => {
              if (link.rel === 'stylesheet' && link.href && !link.href.includes('fonts.googleapis.com')) {
                link.remove();
              }
            });
            const clonedStyles = Array.from(clonedDoc.getElementsByTagName('style'));
            clonedStyles.forEach(style => style.remove());

            // Create our processed clean stylesheet
            const styleEl = clonedDoc.createElement('style');
            styleEl.textContent = processedCss;
            clonedDoc.head.appendChild(styleEl);
          }
        });
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
      }

      const dataUrl = canvas.toDataURL('image/png');
      setLineupPreviewUrl(dataUrl);
      
      setExportMessage('Foto gerada com sucesso! Veja no pop-up.');
      setTimeout(() => setExportMessage(''), 4000);
    } catch (err) {
      console.error(err);
      setExportMessage('Erro na exportação. Tente tirar print da tela!');
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  // Get active roles mapping
  const activePosDefs = FORMATIONS[formation];
  const activePositionDef = selectedPositionIdx !== null ? activePosDefs[selectedPositionIdx] : null;

  // Count filled positions
  const filledCount = Object.values(lineup).filter(id => id !== null).length;

  return (
    <div 
      style={{ backgroundColor: '#ba2078' }}
      className="max-w-6xl mx-auto w-full my-4 rounded-[32px] p-2.5 border-[6px] border-slate-950 select-none shadow-2xl animate-fade-in relative overflow-hidden"
    >
      
      {/* Outer subtle book crease background block */}
      <div 
        style={{ backgroundColor: '#67ae3e' }}
        className="w-full p-4 sm:p-6 lg:p-8 rounded-[24px] flex flex-col gap-6 lg:gap-8 relative min-h-[640px]"
      >
        
        {/* Navigation Action Header */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center z-10 pb-4 border-b-2 border-slate-950">
          <button
            onClick={onPrevPage}
            className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-850 border-2 border-slate-850 rounded-full text-xs font-black tracking-wide transition-all uppercase flex items-center gap-1 cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            ← Voltar ao Álbum
          </button>
          
          <button
            onClick={onViewAchievements}
            className="px-5 py-2.5 bg-[#7b2e98] text-white hover:bg-[#9a3dc0] border-2 border-slate-950 rounded-full text-xs font-black tracking-wide transition-all uppercase flex items-center gap-1 cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
          >
            <Trophy className="w-4 h-4" />
            Minhas Conquistas
          </button>
          
          <div className="text-center sm:text-right font-sans">
          </div>
        </div>

        {/* Double-Page Styled Spread Book Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
          
          {/* LEFT PAGE: Styled Deluxe Crimson-Red Panel matching original Coca Cola dream team visual */}
          <div className={`${isLeftCollapsed ? 'lg:col-span-1 h-auto flex flex-col justify-start' : 'lg:col-span-5 flex flex-col'} transition-all duration-500`}>
            <div 
              style={{ backgroundColor: '#d912cd' }}
              className={`rounded-[24px] p-5 sm:p-6 text-white border-4 border-slate-950 flex flex-col justify-between shadow-[6px_6px_0_rgba(15,10,25,0.95)] relative overflow-hidden transition-all duration-500 ${
                isLeftCollapsed ? 'max-h-0 p-0 border-0 shadow-none opacity-0 pointer-events-none space-y-0' : 'max-h-[1200px] opacity-100 space-y-5'
              }`}
            >
            
            {/* Corner glossy visual overlays */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-2xl transform translate-x-12 -translate-y-12 pointer-events-none" />
            
            {/* Header Identity Display Panel */}
            <div className="space-y-4">
              <div className="bg-slate-950/40 p-5 rounded-[20px] border-2 border-slate-950 space-y-3.5 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="bg-[#FFDF1B] text-slate-950 text-[10px] sm:text-[11px] font-black uppercase px-3.5 py-1 rounded-full border border-slate-950 shadow-[1px_1px_0_rgba(0,0,0,1)] font-sans">
                    MONTE SUA SELEÇÃO
                  </span>
                  {isComplete && (
                    <span className="bg-[#8cc63f] text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full border border-slate-950 flex items-center gap-0.5 animate-pulse">
                      ★ 12/12
                    </span>
                  )}
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-sans uppercase leading-none tracking-tight select-none">
                  <span style={{ fontWeight: 'bold' }} className="text-white">TIME DOS </span>
                  <span style={{ fontWeight: 'bold' }} className="text-[#FFDF1B]">SONHOS</span>
                </h2>
                
                <p className="text-xs text-red-500 bg-white/95 p-3 rounded-xl border border-slate-950 shadow-[1px_1px_0_rgba(0,0,0,1)] leading-normal font-sans text-slate-900 font-medium">
                  Monte seu próprio time dos sonhos com as figurinhas que você já colou! Toque em qualquer vaga no campo para escalar cada uma das 11 posições. Você pode trocar seu Dream Team a qualquer momento!
                </p>
              </div>

              {/* TACTICAL FORMATION CHOOSING PANEL */}
              <div className="space-y-2 pt-1 font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#FFDF1B]">
                    ESQUEMA TÁTICO ATIVO
                  </span>
                  <span className="text-[9px] font-mono text-white/95 bg-slate-950/40 px-2.5 py-0.5 rounded-full uppercase border border-slate-950">
                    4 Formações
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-1.5">
                  {(['433', '442', '352', '4231'] as FormationType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => handleSetFormation(f)}
                      className={`py-2 px-1 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer uppercase border-2 border-slate-950 ${
                        formation === f
                          ? 'bg-[#FFDF1B] text-slate-950 shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5'
                          : 'bg-slate-950 text-white/90 hover:bg-slate-900 shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5'
                      }`}
                    >
                      {f.split('').join('-')}
                    </button>
                  ))}
                </div>
              </div>

              {/* LIVE COUNTER STATS PROGRESS BOARD */}
              <div className="bg-slate-950 p-4 rounded-[20px] border-2 border-slate-950 space-y-3 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white font-extrabold block uppercase tracking-wide">TITULARES CONVOCADOS:</span>
                  <span className="text-[#FFDF1B] font-black text-sm tracking-wide font-mono">
                    {filledCount} <span className="text-white/60 text-xs">/ 11</span>
                  </span>
                </div>
                
                <div className="w-full bg-slate-900 h-3 rounded-full p-0.5 border border-slate-800">
                  <div 
                    className="h-full bg-[#FFDF1B] rounded-full transition-all duration-500"
                    style={{ width: `${(filledCount / 11) * 100}%` }}
                  />
                </div>
              </div>

               {/* SPECIAL REWARD GOLD KEY/CROMO (HORIZONTAL FORMAT) */}
              {filledCount === 11 ? (
                /* GLUED SHINY HORIZONTAL SPECIAL STICKER */
                <StickerItem
                  sticker={STICKERS.find(s => s.id === 27)!}
                  isGlued={true}
                  className="mx-auto animate-zoom-fade-in" 
                  style={{ width: '180px', height: '250px' }}
                />
              ) : (
                /* LOCKED PLACEHOLDER CONTAINER */
                <div className="bg-slate-950/80 p-4 rounded-[20px] border-2 border-dashed border-slate-800 text-center font-sans space-y-2 relative overflow-hidden flex flex-col items-center justify-center min-h-[148px] shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
                  
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 relative">
                    <Lock className="w-4 h-4" />
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">
                      CROMO LENDÁRIO EXTRA (BLOQUEADO)
                    </span>
                    <span className="text-[9px] text-slate-500 font-medium leading-normal block max-w-xs mx-auto">
                      Convoque todos os 11 titulares do seu Time dos Sonhos para revelar o cromo dourado horizontal especial exclusivo!
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ACTION TRIGGERS & SOUVENIR OPTIONS */}
            <div className="space-y-3 pt-2 font-sans">
              <button
                onClick={handleExportLineup}
                disabled={isExporting}
                style={{ backgroundColor: '#ffffff' }}
                className="w-full py-3 hover:bg-zinc-100 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 border-2 border-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    PREPARANDO DOWNLOAD...
                  </>
                ) : (
                  <>
                    <Camera style={{ width: '40px', height: '30px', marginRight: '0px', marginLeft: '16px' }} className="text-slate-950 fill-none" />
                    COMPARTILHAR TIME (GERAR FOTO)
                  </>
                )}
              </button>

              {exportMessage && (
                <div className="text-center text-[10px] text-[#FFDF1B] font-mono font-bold animate-pulse uppercase tracking-wider">
                  {exportMessage}
                </div>
              )}

              <div className="w-full">
                {showConfirmClearLineup ? (
                  <div className="bg-slate-950 border-2 border-[#e21b3c] p-2 rounded-xl flex flex-col items-center justify-center gap-1.5 text-center w-full">
                    <span className="text-[8px] text-slate-200 font-black uppercase">Limpar campo?</span>
                    <div className="flex gap-1.5 w-full justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          const cleared: Record<number, number | null> = {};
                          for (let i = 0; i < 11; i++) cleared[i] = null;
                          setLineup(cleared);
                          setShowConfirmClearLineup(false);
                        }}
                        className="px-2.5 py-1 bg-[#e21b3c] text-white font-black text-[8px] uppercase rounded-full border border-slate-950"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowConfirmClearLineup(false)}
                        className="px-2.5 py-1 bg-slate-800 text-white font-extrabold text-[8px] uppercase rounded-full border border-slate-950"
                      >
                        Não
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowConfirmClearLineup(true)}
                    style={{ backgroundColor: '#3f024f' }}
                    className="w-full py-2.5 px-1 hover:bg-opacity-95 text-white font-black text-[9px] uppercase tracking-wide rounded-full border-2 border-slate-950 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                    LIMPAR TIME
                  </button>
                )}
              </div>
            </div>

            </div>

            {/* COLLAPSE/EXPAND HANDLE BAR MATCHING THE SPECIFIED IMAGE */}
            <div className="mt-2 mb-2 flex flex-col items-center select-none">
              {isLeftCollapsed && (
                <div 
                  style={{ backgroundColor: '#d912cd', width: '130px' }}
                  className="h-10 rounded-t-[20px] border-t-4 border-x-4 border-slate-950 relative overflow-hidden flex flex-col justify-end shadow-[3px_-3px_0_rgba(15,10,25,0.95)]"
                >
                  {/* Glossy overlay */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full filter blur-lg transform translate-x-4 -translate-y-4 pointer-events-none" />
                  
                  {/* Custom inner rounded header strip to look exactly like the image */}
                  <div 
                    style={{ backgroundColor: '#7b2e98' }}
                    className="mx-3.5 h-6 rounded-t-[12px] border-t-2 border-x-2 border-slate-950" 
                  />
                </div>
              )}

              <button 
                type="button"
                style={{ marginTop: '-4px', paddingBottom: '0px', marginRight: '0px', marginBottom: '0px' }}
                className="w-16 h-8 bg-slate-950 rounded-b-full flex items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.35)] border-b-2 border-x border-slate-950 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer select-none focus:outline-none focus:ring-0 p-0" 
                onClick={() => {
                  playPageFlip();
                  setIsLeftCollapsed(!isLeftCollapsed);
                }}
                title={isLeftCollapsed ? "Expandir painel de seleção" : "Recolher painel de seleção"}
              >
                {/* The small white minus/plus symbol inside */}
                {isLeftCollapsed ? (
                  <span className="text-white text-base font-black font-sans leading-none mb-1 select-none">+</span>
                ) : (
                  <span className="text-white text-base font-black font-sans leading-none mb-1 select-none">−</span>
                )}
              </button>
            </div>

          </div>

          {/* RIGHT PAGE: Vertical Soccer Pitch carrying centered responsive coordinate player grid */}
          <div className={`${isLeftCollapsed ? 'lg:col-span-11' : 'lg:col-span-7'} flex flex-col justify-center items-center transition-all duration-500`}>
            
            {/* Aspect Locked Pitch Container Frame */}
            <div 
              id="my-dream-team-pitch-spread"
              className="relative w-full aspect-[0.74] sm:aspect-[0.75] md:aspect-[0.76] bg-[#124227] rounded-2.5xl overflow-hidden border-2 border-green-200/20 shadow-2xl p-0.5 print:bg-[#124227]"
            >
              
              {/* Rich Real Soccer Grass stripes background layout */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#1b6a3c] to-[#0e311a] opacity-95 z-0" />
              
              {/* Vertical grass cut contrasts */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0 opacity-15">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-[10%] w-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} />
                ))}
              </div>

              {/* Sharp vector graphics for Pitch Lines overlay */}
              <svg className="absolute inset-0 w-full h-full stroke-white/20 stroke-[1.5] fill-none z-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Boundary */}
                <rect x="3" y="3" width="94" height="94" className="stroke-white/25" />
                
                {/* Center circle & line */}
                <line x1="3" y1="50" x2="97" y2="50" className="stroke-white/25" strokeDasharray="1.5 1.5" />
                <circle cx="50" cy="50" r="14" className="stroke-white/25" />
                <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.4)" />

                {/* Top Goal Area (Attack half) */}
                <rect x="24" y="3" width="52" height="15" className="stroke-white/25" />
                <rect x="34" y="3" width="32" height="5" className="stroke-white/15" />
                <circle cx="50" cy="11" r="0.6" fill="rgba(255,255,255,0.3)" />
                <path d="M 37 18 Q 50 24 63 18" className="stroke-white/30" />

                {/* Bottom Goal Area (Defense half) */}
                <rect x="24" y="82" width="52" height="15" className="stroke-white/25" />
                <rect x="34" y="92" width="32" height="5" className="stroke-white/15" />
                <circle cx="50" cy="89" r="0.6" fill="rgba(255,255,255,0.3)" />
                <path d="M 37 82 Q 50 76 63 82" className="stroke-white/30" />

                {/* Corner Arcs */}
                <path d="M 3 7 A 4 4 0 0 0 7 3" className="stroke-white/15" />
                <path d="M 93 3 A 4 4 0 0 0 97 7" className="stroke-white/15" />
                <path d="M 7 97 A 4 4 0 0 0 3 93" className="stroke-white/15" />
                <path d="M 97 93 A 4 4 0 0 0 93 97" className="stroke-white/15" />
              </svg>

              {/* Pitch Identity Exporter Branding Labels */}
              {/* Labels removed as per user request */}


              <div className="absolute bottom-2 right-4 z-25 text-[6.5px] font-mono text-white/30 select-none pointer-events-none">
                BORA BRASIL ALBUM ENGINE
              </div>

              {/* Dynamic 11 Coordinate Positions */}
              {activePosDefs.map((pos, idx) => {
                const assignedId = lineup[idx];
                const sticker = assignedId ? STICKERS.find(s => s.id === assignedId) : null;

                return (
                  <div
                    key={idx}
                    className="absolute z-20 transition-all duration-500 ease-out transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{
                      left: `${pos.left}%`,
                      top: `${pos.top}%`,
                    }}
                  >
                    {sticker ? (
                      /* ASSIGNED POSITION STICKER LAYOUT */
                      <div 
                        onClick={() => setSelectedPositionIdx(idx)}
                        className="relative hover:scale-110 active:scale-95 transition-all w-[79px] h-[102px] filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.4)]"
                        title="Toque para substituir ou desconvocar este jogador"
                      >
                        <StickerItem
                          sticker={sticker}
                          size="sm"
                          isGlued={true}
                          className="w-full pointer-events-none rounded-lg border-2 border-yellow-400 rotate-[-1deg]"
                        />
                        
                        {/* Custom visual mini overlay role badge on player on the field */}
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-emerald-950 font-black text-[6.5px] px-1.5 py-0.5 rounded-full uppercase shadow border border-emerald-900 pointer-events-none group-hover:scale-110 transition-transform">
                          {pos.role}
                        </div>
                      </div>
                    ) : (
                      /* VACANT/EMPTY DOTTED PLAYER SLOT BUTTON */
                      <button
                        onClick={() => setSelectedPositionIdx(idx)}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed hover:border-yellow-400/80 bg-black/35 hover:bg-yellow-400/10 active:bg-yellow-400/25 transition-all text-center group font-sans relative shadow-inner"
                        style={{
                          color: '#ff00db',
                          borderColor: '#e900ff',
                          width: '79px',
                          height: '102px'
                        }}
                        title={`Escale um jogador para: ${pos.label}`}
                      >
                        <div className="w-5 h-5 rounded-full bg-[#124227]/90 border border-yellow-400/30 flex items-center justify-center text-[10px] text-yellow-300 font-extrabold group-hover:scale-115 transition-all shadow-md">
                          +
                        </div>
                        <span className="text-[6.5px] sm:text-[7.5px] font-mono text-yellow-300 uppercase tracking-wider font-extrabold block leading-none mt-1 group-hover:text-yellow-100 transition-colors">
                          {pos.role}
                        </span>
                        
                        <div className="absolute bottom-1 text-[5px] sm:text-[6px] text-emerald-300 font-medium tracking-tight opacity-75 truncate max-w-[90%] uppercase pointer-events-none">
                          {pos.label}
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}

            </div>

            {/* Quick action warning help message specifically tailored */}
            <div className="w-full mt-3 p-3 bg-emerald-900/20 rounded-xl border border-emerald-600/10 text-center">
              <p style={{ color: '#ffffff' }} className="text-[10px] sm:text-xs">
                ⭐ <span className="font-bold text-yellow-300">Dica do Treinador:</span> Monte, ajuste ou toque nos bonecos colados para alterar ou remover as posições a qualquer momento.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* SELECTION OVERLAY MODAL */}
      {selectedPositionIdx !== null && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedPositionIdx(null)}
        >
          <div 
            className="border-2 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in"
            style={{ borderColor: '#ffffff', backgroundColor: '#740aa9' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title header */}
            <div className="p-4 flex justify-between items-center" style={{ backgroundColor: '#5e2683' }}>
              <div className="flex flex-col">
                <span className="text-[9px] text-yellow-400 font-extrabold uppercase tracking-widest leading-none">
                  {activePositionDef ? activePositionDef.label : "CONVOCAÇÃO"} • {activePositionDef?.role}
                </span>
                <span className="text-sm font-sans font-black text-white uppercase tracking-wide mt-1">
                  SELECIONAR TITULAR DA SELEÇÃO
                </span>
              </div>
              <button 
                onClick={() => setSelectedPositionIdx(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5 pointer-events-none" />
              </button>
            </div>

            {/* Collected sticker check info */}
            <div className="p-3 text-center border-b" style={{ backgroundColor: '#fafafa', color: '#bc4c4c', borderColor: '#ffffff' }}>
              <p className="font-medium" style={{ fontSize: '11px', color: '#000000' }}>
                Apenas as figurinhas que você <span className="font-extrabold" style={{ color: '#000000' }}>colou no álbum</span> podem ser escaladas nesta posição!
              </p>
            </div>

            {/* List candidate scrollable box */}
            <div className="max-h-[60vh] overflow-y-auto p-2" style={{ backgroundColor: '#ffffff' }}>
              
              {/* De-escalate trigger button */}
              {lineup[selectedPositionIdx] !== null && (
                <button
                  onClick={() => {
                    setLineup(prev => ({
                      ...prev,
                      [selectedPositionIdx]: null
                    }));
                    setSelectedPositionIdx(null);
                    playSuccess();
                  }}
                  className="w-full mb-3 p-3 rounded-2xl text-xs font-black text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  style={{ backgroundColor: '#c308af' }}
                >
                  <Trash2 className="w-4 h-4" />
                  REMOVER JOGADOR
                </button>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {STICKERS.map((s) => {
                  const isUnlocked = gluedStickerIds.includes(s.id);
                  const activeAssignedIdxString = Object.keys(lineup).find(key => lineup[Number(key)] === s.id);
                  const isAssigned = activeAssignedIdxString !== undefined;
                  const assignedPosDef = isAssigned ? activePosDefs[Number(activeAssignedIdxString)] : null;

                  return (
                    <button
                      key={s.id}
                      disabled={!isUnlocked}
                      onClick={() => isUnlocked && handleSelectPlayer(s.id)}
                      className={`
                        relative border-2 rounded-2xl p-2 flex flex-col items-center gap-1.5 text-center transition-all group overflow-hidden
                        ${isUnlocked 
                          ? 'border-zinc-700 hover:border-emerald-400 hover:scale-[1.03] cursor-pointer shadow-sm' 
                          : 'bg-black/60 border-zinc-950 opacity-40 cursor-not-allowed'
                        }
                        ${isAssigned && isUnlocked ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-950/60' : ''}
                      `}
                      style={{ backgroundColor: isUnlocked ? '#3f024f' : undefined }}
                    >
                      {/* Sticker avatar display preview */}
                      <div className="w-full aspect-[2/3] relative pointer-events-none rounded-lg overflow-hidden bg-zinc-950">
                        <StickerItem 
                          sticker={s} 
                          size="sm" 
                          isGlued={isUnlocked} 
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info lines */}
                      <span className="text-[9px] font-sans font-bold text-white truncate max-w-full leading-tight uppercase tracking-tight">
                        {s.name}
                      </span>

                      {/* Locked or assigned overlay tags */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-none">
                          <Lock className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                      
                      {isAssigned && isUnlocked && (
                        <div className="absolute top-1 right-1 bg-emerald-500 text-black font-black text-[7px] px-1.5 py-0.5 rounded-full shadow">
                          {assignedPosDef?.role}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINEUP PREVIEW OVERLAY MODAL */}
      {lineupPreviewUrl && (
        <div 
          className="fixed inset-0 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in cursor-pointer"
          style={{ backgroundColor: '#84248c' }}
          onClick={() => setLineupPreviewUrl(null)}
        >
          <div 
            className="bg-zinc-900 border-2 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in flex flex-col md:flex-row cursor-default"
            style={{ borderWidth: '4px', borderColor: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left side: Generated Photo display */}
            <div 
              className="md:w-1/2 p-5 flex items-center justify-center border-b md:border-b-0 md:border-r border-emerald-500/10"
              style={{ backgroundColor: '#ff00e8' }}
            >
              <div className="relative w-full aspect-[0.75] bg-[#124227] rounded-xl overflow-hidden border-2 border-emerald-400/20 shadow-inner">
                <img 
                  src={lineupPreviewUrl} 
                  alt="Time dos Sonhos" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Right side: Control buttons and sharing guidelines */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between" style={{ backgroundColor: '#236a2b' }}>
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span 
                      className="text-[9px] font-extrabold uppercase tracking-widest leading-none block"
                      style={{ color: '#95da28' }}
                    >
                      SELEÇÃO DOS SONHOS CEPE
                    </span>
                    <h3 className="text-lg font-sans font-black text-white uppercase tracking-wide mt-1">
                      TIME DE TITULARES
                    </h3>
                  </div>
                  <button 
                    onClick={() => setLineupPreviewUrl(null)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 pointer-events-none" />
                  </button>
                </div>

                <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
                  <p 
                    className="text-[11px] leading-normal"
                    style={{ color: '#ffffff' }}
                  >
                    Seu time com o esquema <strong>{formation.split('').join('-')}</strong> foi gerado com sucesso! Agora você já pode baixar a imagem para compartilhar nas suas redes sociais.
                  </p>
                </div>

                <div className="space-y-2 font-sans">
                  <span 
                    className="text-[10px] font-extrabold uppercase tracking-wider block font-bold"
                    style={{ color: '#000000' }}
                  >
                    OPÇÕES:
                  </span>
                  
                  {/* Download Trigger */}
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = lineupPreviewUrl;
                      link.download = `meu-time-cepe-${formation}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      playSuccess();
                    }}
                    className="w-full py-3 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0_rgba(0,0,0,1)] active:translate-y-0.5 border-2 border-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    style={{ borderRadius: '20px', backgroundColor: '#95cb28' }}
                  >
                    <Download className="w-4 h-4 text-slate-950" />
                    BAIXAR FOTO (PNG)
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-1 text-[9px] font-medium">
                <span style={{ color: '#ffffff' }}>💡 Dica: no celular, você também pode pressionar e segurar a foto para salvar na sua galeria.</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
