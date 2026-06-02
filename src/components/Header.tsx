/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, RotateCcw, Settings, X, Play, Upload, Download, ChevronUp, ChevronDown, Music } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playSuccess } from '../audio';
import DefaultTitleLogo from './DefaultTitleLogo';

const defaultLogo = '/src/assets/images/regenerated_image_1779654679664.png';

interface HeaderProps {
  isHeaderVisible: boolean;
  onToggleHeader: () => void;
  gluedCount: number;
  totalCount: number;
  onReset: () => void;
  soundOn: boolean;
  onToggleSound: (enabled: boolean) => void;
  musicOn: boolean;
  onToggleMusic: (enabled: boolean) => void;
  brandImage: string | null;
  onBrandImageChange: (image: string | null) => void;
  coverBgImage: string | null;
  onCoverBgImageChange: (image: string | null) => void;
  titleImage: string | null;
  onTitleImageChange: (image: string | null) => void;
  headerBgImage?: string | null;
  onHeaderBgImageChange?: (image: string | null) => void;
  onOpenVideo?: () => void;
}

export default function Header({
  isHeaderVisible,
  onToggleHeader,
  gluedCount,
  totalCount,
  onReset,
  soundOn,
  onToggleSound,
  musicOn,
  onToggleMusic,
  brandImage,
  onBrandImageChange,
  coverBgImage,
  onCoverBgImageChange,
  titleImage,
  onTitleImageChange,
  headerBgImage = null,
  onHeaderBgImageChange = () => {},
  onOpenVideo
}: HeaderProps) {
  const [showConfirmReset, setShowConfirmReset] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [importStatus, setImportStatus] = React.useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const percentage = Math.round((gluedCount / totalCount) * 100) || 0;

  const closeSettings = () => {
    setIsSettingsOpen(false);
    const currentPath = window.location.pathname;
    if (currentPath === '/ajuste' || currentPath.endsWith('/ajuste')) {
      const parentPath = currentPath === '/ajuste' ? '/' : currentPath.substring(0, currentPath.length - 7);
      window.history.pushState(null, '', parentPath || '/');
    }
    if (window.location.hash === '#ajuste' || window.location.hash === '#/ajuste') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  };

  React.useEffect(() => {
    const checkAjusteRoute = () => {
      const isPathAjuste = window.location.pathname === '/ajuste' || window.location.pathname.endsWith('/ajuste');
      const isHashAjuste = window.location.hash === '#ajuste' || window.location.hash === '#/ajuste';
      
      if (isPathAjuste || isHashAjuste) {
        setIsSettingsOpen(true);
      }
    };

    checkAjusteRoute();
    window.addEventListener('popstate', checkAjusteRoute);
    window.addEventListener('hashchange', checkAjusteRoute);

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      setTimeout(checkAjusteRoute, 0);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      setTimeout(checkAjusteRoute, 0);
    };

    const intervalId = setInterval(checkAjusteRoute, 1000);

    return () => {
      window.removeEventListener('popstate', checkAjusteRoute);
      window.removeEventListener('hashchange', checkAjusteRoute);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearInterval(intervalId);
    };
  }, []);

  const handleExportConfig = () => {
    try {
      const config = {
        brandLogo: localStorage.getItem('cepe_album_brand_logo') || '',
        coverBg: localStorage.getItem('cepe_album_cover_bg') || '',
        headerBg: localStorage.getItem('cepe_album_header_bg') || '',
        titleImg: localStorage.getItem('cepe_album_title_image_png') || '',
        stickersProgress: localStorage.getItem('cepe_album_progress_2026_v1') || '',
        dreamTeamLineup: localStorage.getItem('cepe_dream_team_lineup_v2') || '',
        dreamTeamFormation: localStorage.getItem('cepe_dream_team_formation_v2') || '',
      };
      
      const fileData = JSON.stringify(config, null, 2);
      const blob = new Blob([fileData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', url);
      downloadAnchorNode.setAttribute('download', 'personalizacao_e_progresso_album.json');
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
      
      playSuccess();
      setImportStatus({
        type: 'success',
        message: 'Configurações exportadas com sucesso! Salve o arquivo .json e importe-o em outro dispositivo.'
      });
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: 'Falha ao exportar configurações.'
      });
    }
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const parsed = JSON.parse(fileReader.result as string);
        if (parsed.brandLogo !== undefined) {
          if (parsed.brandLogo) {
            localStorage.setItem('cepe_album_brand_logo', parsed.brandLogo);
          } else {
            localStorage.removeItem('cepe_album_brand_logo');
          }
        }
        if (parsed.coverBg !== undefined) {
          if (parsed.coverBg) {
            localStorage.setItem('cepe_album_cover_bg', parsed.coverBg);
          } else {
            localStorage.removeItem('cepe_album_cover_bg');
          }
        }
        if (parsed.headerBg !== undefined) {
          if (parsed.headerBg) {
            localStorage.setItem('cepe_album_header_bg', parsed.headerBg);
          } else {
            localStorage.removeItem('cepe_album_header_bg');
          }
        }
        if (parsed.titleImg !== undefined) {
          if (parsed.titleImg) {
            localStorage.setItem('cepe_album_title_image_png', parsed.titleImg);
          } else {
            localStorage.removeItem('cepe_album_title_image_png');
          }
        }
        if (parsed.stickersProgress) {
          localStorage.setItem('cepe_album_progress_2026_v1', parsed.stickersProgress);
        }
        if (parsed.dreamTeamLineup) {
          localStorage.setItem('cepe_dream_team_lineup_v2', parsed.dreamTeamLineup);
        }
        if (parsed.dreamTeamFormation) {
          localStorage.setItem('cepe_dream_team_formation_v2', parsed.dreamTeamFormation);
        }

        playSuccess();
        setImportStatus({
          type: 'success',
          message: 'Sucesso! Recarregando a página para aplicar a personalização e progresso...'
        });
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'Arquivo de configuração inválido ou corrompido.'
        });
      }
    };
    fileReader.readAsText(file);
  };

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

  const handleHeaderBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onHeaderBgImageChange(base64);
      playSuccess();
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <header className={`w-full flex flex-col font-sans select-none shadow-md transition-all duration-500 overflow-hidden ${isHeaderVisible ? 'max-h-[220px]' : 'max-h-0'}`}>
        <div 
          className="w-full flex items-center justify-between px-4 md:px-8 py-2 relative"
          style={{
            backgroundColor: '#046a00',
            backgroundImage: headerBgImage 
              ? `linear-gradient(rgba(4, 106, 0, 0.35), rgba(4, 106, 0, 0.65)), url(${headerBgImage})`
              : "linear-gradient(rgba(4, 106, 0, 0.35), rgba(4, 106, 0, 0.65)), url('/src/assets/images/CAPA_CAB.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '150px',
            borderStyle: 'solid',
            borderWidth: '8px',
            borderRadius: '20px',
            borderColor: '#70a002'
          }}
        >
          <div className="flex items-center z-30 shrink-0">
            <img
              src={brandImage || defaultLogo}
              alt="Logo"
              className="object-contain w-auto border-x border-b p-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.5)] rounded-b-xl transition-transform hover:scale-105"
              style={{
                height: '120px',
                width: '95px',
                marginTop: '-30px',
                marginLeft: '0px',
                marginRight: '0px',
                marginBottom: '0px',
                paddingLeft: '6px',
                paddingRight: '6px',
                backgroundColor: '#023712',
                borderColor: '#023712'
              }}
            />
          </div>

          <div 
            className="flex-1 flex justify-center items-center z-10 px-4 min-h-[96px]"
            style={{
              backgroundImage: "url('/src/assets/images/regenerated_image_1779729176882.png')",
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              marginRight: '16px',
              marginLeft: '16px',
              borderRadius: '10px'
            }}
          />

          <div className="flex items-center gap-2 z-20 shrink-0">
            {/* Background Music ON / OFF Control Button Pill */}
            <div className="flex items-center bg-black rounded-full border border-white/30 overflow-hidden text-[10px] md:text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: '#000000' }}>
              <button
                onClick={() => onToggleMusic && onToggleMusic(true)}
                className={`px-2 md:px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all ${musicOn ? 'bg-[#FFDF1B] text-slate-950 font-black' : 'bg-transparent text-white hover:bg-white/10'}`}
                title="Ativar música de fundo"
              >
                <Music className={`w-3 h-3 ${musicOn ? 'animate-pulse' : ''}`} />
                <span>ON</span>
              </button>
              <div className="w-[1px] bg-white/20 self-stretch" />
              <button
                onClick={() => onToggleMusic && onToggleMusic(false)}
                className={`px-2 md:px-3 py-1.5 flex items-center gap-1 cursor-pointer transition-all ${!musicOn ? 'bg-red-600 text-white font-black' : 'bg-transparent text-white hover:bg-white/10'}`}
                title="Desativar música de fundo"
              >
                <span>OFF</span>
              </button>
            </div>

            <button
              onClick={() => {
                const next = !soundOn;
                setSoundEnabled(next);
                onToggleSound(next);
              }}
              className="px-3 py-1.5 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
              style={{ backgroundColor: '#000000' }}
              title={soundOn ? "Mudar para mudo" : "Ativar efeitos sonoros"}
            >
              {soundOn ? <Volume2 className="w-3 md:w-3.5 h-3 md:h-3.5" /> : <VolumeX className="w-3 md:w-3.5 h-3 md:h-3.5" />}
              <span className="hidden sm:inline">{soundOn ? "SOM ATIVO" : "MUDO"}</span>
            </button>

            {showConfirmReset ? (
              <div 
                style={{ borderWidth: '2px', borderColor: '#ff0ffb' }}
                className="flex items-center gap-1 bg-[#e21b3c]/20 px-1 py-0.5 rounded-full border border-[#e21b3c] animate-fade-in"
              >
                <span className="text-[8px] md:text-[9.5px] text-white font-extrabold uppercase px-1.5 select-none">
                  ZERAR?
                </span>
                <button
                  onClick={() => {
                    onReset();
                    setShowConfirmReset(false);
                  }}
                  style={{ backgroundColor: '#ff0ffb' }}
                  className="px-2 py-0.5 bg-[#e21b3c] hover:bg-red-700 text-white font-black text-[8px] uppercase rounded-full transition-all active:scale-95 cursor-pointer"
                >
                  SIM
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[8px] uppercase rounded-full transition-all active:scale-95 cursor-pointer"
                >
                  NÃO
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="px-3 py-1.5 bg-transparent hover:bg-white/10 text-white border border-white/30 hover:border-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: '#a900b3' }}
                title="Reiniciar Álbum"
              >
                <RotateCcw className="w-3 md:w-3.5 h-3 md:h-3.5" />
                <span className="hidden sm:inline">RECOMEÇAR</span>
              </button>
            )}
          </div>
        </div>

        <div 
          className="w-full py-2.5 relative overflow-hidden flex items-center min-h-[40px] shadow-inner border-b-4 border-black/10"
          style={{
            backgroundColor: '#000000',
            borderStyle: 'solid',
            borderWidth: '8px',
            borderRadius: '20px',
            borderColor: '#70a002',
            marginTop: '-8px'
          }}
        >
          <div className="w-full flex flex-row items-center justify-between max-w-7xl mx-auto px-4 md:px-8 z-10 gap-4">
            <div className="flex items-center gap-2 pl-[85px] md:pl-[120px] select-none">
              <img 
                src="/src/assets/images/regenerated_image_1779729548221.png" 
                alt="Marca" 
                className="h-5 sm:h-6 md:h-7 w-auto object-contain transition-all duration-300 hover:scale-105"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-1 text-[10px] text-white uppercase tracking-wider font-extrabold">
                Progresso <span className="text-yellow-300 font-black">Geral:</span>
              </div>
              <div className="flex items-center gap-2 bg-black/35 px-3 py-1 rounded-full border border-white/10">
                <span className="text-[10px] sm:text-xs text-yellow-300 font-extrabold tracking-tight">
                  {gluedCount}/{totalCount} ({percentage}%)
                </span>
                <div className="w-14 sm:w-24 bg-white/20 h-2 rounded-full p-0.5 border border-white/5">
                  <div
                    className="h-full bg-yellow-300 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex justify-center -mt-2 z-40">
        <button
          onClick={onToggleHeader}
          style={{ height: '50px', backgroundColor: '#000000', borderWidth: '0px' }}
          className="backdrop-blur-sm text-white px-6 py-1 rounded-b-full transition-all hover:bg-black ml-0 mt-0"
        >
          {isHeaderVisible ? <ChevronUp className="w-5 h-5" /> : <div className="w-6 h-0.5 bg-white rounded-full" />}
        </button>
      </div>
      
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="relative bg-[#1a0c2a] border-4 border-slate-950 rounded-[28px] max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-zoom-fade-in text-left select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-850">
              <div className="flex flex-col">
                <span className="text-xs text-[#FFDF1B] font-black uppercase tracking-wider block">
                  PAINEL DE CONFIGURAÇÕES
                </span>
                <span className="text-lg font-sans font-black text-white uppercase mt-0.5">
                  Personalizar Álbum
                </span>
              </div>
              <button
                onClick={() => {
                  playSuccess();
                  closeSettings();
                }}
                className="p-1.5 bg-slate-950 hover:bg-slate-900 border-2 border-slate-850 hover:border-slate-700 rounded-full text-white cursor-pointer transition-all active:scale-95 shadow"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 my-6 overflow-y-auto max-h-[60vh] pr-1">
              <div className="bg-slate-950/70 p-4 rounded-2xl border-2 border-slate-900 hover:border-slate-800 transition-all text-left">
                <span className="text-[10px] text-[#FFDF1B] font-black uppercase tracking-wider block mb-2.5">
                  Imagem do Título Principal
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={titleImage || '/src/assets/images/regenerated_image_1779727658462.png'}
                        alt="Título Principal"
                        className="h-10 w-auto max-w-[80px] object-contain rounded bg-white p-1 border border-slate-950 shadow-sm"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-white font-black block leading-none uppercase">
                        IMAGEM ATIVA
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium block mt-1 tracking-wide">
                        {titleImage ? "Customizada" : "Bora Brasil! (Padrão)"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 items-center justify-end">
                    <input
                      type="file"
                      accept="image/*"
                      id="header-title-image-uploader"
                      className="hidden"
                      onChange={handleTitleImageUpload}
                    />
                    <label
                      htmlFor="header-title-image-uploader"
                      className="px-3 py-1.5 bg-[#FFDF1B] hover:bg-[#ffe535] text-slate-950 border-2 border-slate-950 font-black text-[9px] uppercase rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer transition-all active:translate-y-0.5 text-center leading-none flex items-center"
                    >
                      Alterar Título
                    </label>

                    {titleImage && (
                      <button
                        type="button"
                        onClick={() => {
                          onTitleImageChange(null);
                          playSuccess();
                        }}
                        className="p-1.5 bg-slate-950 hover:bg-slate-850 border-2 border-slate-950 text-white font-extrabold text-[8px] uppercase rounded-full cursor-pointer transition-all"
                        title="Restaurar padrão"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div 
                style={{ width: '420px', fontSize: '14px', lineHeight: '20px', height: '45px' }}
                className="bg-slate-950/70 p-4 rounded-2xl border-2 border-slate-900 hover:border-slate-800 transition-all text-left"
              >
                <span className="text-[10px] text-[#FFDF1B] font-black uppercase tracking-wider block mb-2.5">
                  Fundo da Capa do Álbum
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {coverBgImage ? (
                      <div className="relative">
                        <img
                          src={coverBgImage}
                          alt="Fundo Customizado"
                          className="h-10 w-10 object-cover rounded border border-slate-950 shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-12 rounded bg-slate-950 border border-slate-850 flex flex-col items-center justify-center p-0.5">
                        <span className="font-mono text-[7px] leading-none font-black uppercase text-emerald-400">MAPA</span>
                        <span className="text-[5px] uppercase font-bold tracking-tight text-white/55 leading-none mt-1">PADRÃO</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-white font-black block leading-none uppercase">
                        PLANO DE FUNDO
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium block mt-1 tracking-wide">
                        {coverBgImage ? "Imagem Customizada" : "Fundo de Campo Estilizado"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 items-center justify-end">
                    <input
                      type="file"
                      accept="image/*"
                      id="header-cover-bg-uploader"
                      className="hidden"
                      onChange={handleCoverBgImageUpload}
                    />
                    <label
                      htmlFor="header-cover-bg-uploader"
                      className="px-3 py-1.5 bg-[#FFDF1B] hover:bg-[#ffe535] text-slate-950 border-2 border-slate-950 font-black text-[9px] uppercase rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer transition-all active:translate-y-0.5 text-center leading-none flex items-center"
                    >
                      Alterar Fundo
                    </label>

                    {coverBgImage && (
                      <button
                        type="button"
                        onClick={() => {
                          onCoverBgImageChange(null);
                          playSuccess();
                        }}
                        className="p-1.5 bg-slate-950 hover:bg-slate-850 border-2 border-slate-950 text-white font-extrabold text-[8px] uppercase rounded-full cursor-pointer transition-all"
                        title="Restaurar fundo padrão"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-2xl border-2 border-slate-900 hover:border-slate-800 transition-all text-left">
                <span className="text-[10px] text-[#FFDF1B] font-black uppercase tracking-wider block mb-2.5">
                  Fundo do Cabeçalho principal
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2.5">
                    {headerBgImage ? (
                      <div className="relative">
                        <img
                          src={headerBgImage}
                          alt="Fundo do Cabeçalho Customizado"
                          className="h-10 w-10 object-cover rounded border border-slate-950 shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-12 rounded bg-slate-950 border border-slate-850 flex flex-col items-center justify-center p-0.5">
                        <span className="font-mono text-[7px] leading-none font-black uppercase text-emerald-400">GRAMA</span>
                        <span className="text-[5px] uppercase font-bold tracking-tight text-white/55 leading-none mt-1">PADRÃO</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-white font-black block leading-none uppercase">
                        FUNDO DO TOPO
                      </span>
                      <span className="text-[8px] text-slate-400 font-medium block mt-1 tracking-wide">
                        {headerBgImage ? "Imagem Customizada" : "Estádio e Grama Natural (Padrão)"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 items-center justify-end">
                    <input
                      type="file"
                      accept="image/*"
                      id="header-bg-uploader"
                      className="hidden"
                      onChange={handleHeaderBgImageUpload}
                    />
                    <label
                      htmlFor="header-bg-uploader"
                      className="px-3 py-1.5 bg-[#FFDF1B] hover:bg-[#ffe535] text-slate-950 border-2 border-slate-950 font-black text-[9px] uppercase rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer transition-all active:translate-y-0.5 text-center leading-none flex items-center"
                    >
                      Alterar Topo
                    </label>

                    {headerBgImage && (
                      <button
                        type="button"
                        onClick={() => {
                          onHeaderBgImageChange(null);
                          playSuccess();
                        }}
                        className="p-1.5 bg-slate-950 hover:bg-slate-850 border-2 border-slate-950 text-white font-extrabold text-[8px] uppercase rounded-full cursor-pointer transition-all"
                        title="Restaurar topo padrão"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {onOpenVideo && (
                <div className="bg-slate-950/70 p-4 rounded-2xl border-2 border-slate-900 flex flex-sm-row items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-11 rounded bg-indigo-950 border border-indigo-900 flex items-center justify-center p-0.5 shadow-md">
                      <Play className="w-3.5 h-3.5 text-[#FFDF1B] fill-[#FFDF1B]" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white font-black block leading-none uppercase">
                        Vídeo Instrutivo
                      </span>
                      <span className="text-[8px] text-[#FFDF1B] font-extrabold block mt-1 tracking-wide uppercase">
                        Apresentação Principal
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playSuccess();
                      closeSettings();
                      onOpenVideo();
                    }}
                    className="px-4 py-2 bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 border-2 border-slate-950 font-black text-[9px] uppercase tracking-wider rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] cursor-pointer transition-all active:translate-y-0.5 text-center leading-none flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-slate-950 text-slate-950" />
                    Ver Vídeo
                  </button>
                </div>
              )}

              <div className="bg-slate-950/70 p-4 rounded-2xl border-2 border-slate-900 hover:border-slate-800 transition-all text-left space-y-3">
                <span className="text-[10px] text-[#FFDF1B] font-black uppercase tracking-wider block">
                  Exportar / Importar Configuração (Outro Computador)
                </span>
                <p className="text-[9px] text-slate-300 font-medium leading-relaxed">
                  Para que suas imagens personalizadas e seu progresso continuem aparecendo ao abrir o álbum em outros computadores, exporte o arquivo de configuração (.json) e importe-o no outro dispositivo!
                </p>

                {importStatus.type && (
                  <div className={`p-2.5 rounded-xl border text-[9px] font-sans font-bold leading-snug whitespace-pre-line ${
                    importStatus.type === 'success' 
                      ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300' 
                      : 'bg-red-950/80 border-red-500/30 text-red-300'
                  }`}>
                    {importStatus.message}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportConfig}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-850 hover:border-[#FFDF1B] text-white font-black text-[9px] uppercase tracking-wider rounded-full cursor-pointer transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Exportar Arquivo (.json)
                  </button>

                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept=".json"
                      id="album-config-importer"
                      className="hidden"
                      onChange={handleImportConfig}
                    />
                    <label
                      htmlFor="album-config-importer"
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#FFDF1B] hover:bg-[#ffe535] text-slate-950 border-2 border-[#FFDF1B] font-black text-[9px] uppercase tracking-wider rounded-full cursor-pointer transition-all active:scale-95 text-center"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Importar Arquivo (.json)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-850 flex justify-end">
              <button
                onClick={() => {
                  playSuccess();
                  closeSettings();
                }}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white border-2 border-slate-800 rounded-full font-black text-xs uppercase tracking-wide cursor-pointer transition-all active:translate-y-0.5"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
