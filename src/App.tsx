/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AlbumAchievements from './components/AlbumAchievements';
import MiniCraques from './components/MiniCraques';
import Header from './components/Header';
import AlbumCover from './components/AlbumCover';
import AlbumInside from './components/AlbumInside';
import BancadaView from './components/BancadaView';
import AlbumBack from './components/AlbumBack';
import AlbumIndex from './components/AlbumIndex';
import PackManager from './components/PackManager';
import EntryPage from './components/EntryPage';
import LoadingScreen from './components/LoadingScreen';
import StickerItem from './components/StickerItem';
import { Sticker, UserSticker } from './types';
import { STICKERS } from './data';
import { playPageFlip, setSoundEnabled, playGoalCrowd } from './audio';
import { Sparkles, Trophy, HelpCircle, Gamepad2, Info, Play, Video, X, Award } from 'lucide-react';
import AtivoImage from './assets/images/GOOOL.png';

const LOCAL_STORAGE_KEY = 'cepe_album_progress_2026_v1';

const getInitialRouteInfo = () => {
  try {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    let matched: 'entrada' | 'capa' | 'album' | 'album2' | 'album3' | 'album4' | 'verso' | 'ajuste' | 'conquistas' | 'minicraques' | 'bancada' | null = null;
    if (path === '/entrada' || hash === '#/entrada') matched = 'entrada';
    else if (path === '/capa' || hash === '#/capa') matched = 'capa';
    else if (path === '/album' || hash === '#/album') matched = 'album';
    else if (path === '/album2' || hash === '#/album2') matched = 'album2';
    else if (path === '/album3' || hash === '#/album3') matched = 'album3';
    else if (path === '/album4' || hash === '#/album4') matched = 'album4';
    else if (path === '/verso' || hash === '#/verso') matched = 'verso';
    else if (path === '/ajuste' || hash === '#/ajuste' || hash === '#ajuste') matched = 'ajuste';
    else if (path === '/conquistas' || hash === '#/conquistas') matched = 'conquistas';
    else if (path === '/minicraques' || hash === '#/minicraques') matched = 'minicraques';
    else if (path === '/bancada' || hash === '#/bancada') matched = 'bancada';

    if (matched === 'capa') {
      return { entered: true, currentPage: 'cover' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'bancada') {
      return { entered: true, currentPage: 'bancada' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'album') {
      return { entered: true, currentPage: 'album' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'album2') {
      return { entered: true, currentPage: 'album' as const, albumPageIndex: 1 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'album3') {
      return { entered: true, currentPage: 'album' as const, albumPageIndex: 2 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'album4') {
      return { entered: true, currentPage: 'album' as const, albumPageIndex: 3 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'verso') {
      return { entered: true, currentPage: 'back' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'conquistas') {
      return { entered: true, currentPage: 'achievements' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'minicraques') {
      return { entered: true, currentPage: 'minicraques' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
    if (matched === 'ajuste') {
      return { entered: true, currentPage: 'cover' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
    }
  } catch (_) {}
  
  // Default to Entry Page
  return { entered: false, currentPage: 'cover' as const, albumPageIndex: 0 as 0 | 1 | 2 | 3 };
};

export default function App() {
  const initialRoute = getInitialRouteInfo();
  const [entered, setEntered] = useState(initialRoute.entered);
  const [currentPage, setCurrentPage] = useState<'cover' | 'album' | 'back' | 'achievements' | 'minicraques' | 'bancada'>(initialRoute.currentPage);
  const [albumPageIndex, setAlbumPageIndex] = useState<0 | 1 | 2 | 3>(initialRoute.albumPageIndex);
  const [userStickers, setUserStickers] = useState<UserSticker[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<Sticker | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 45, y: 70 });
  const [selectedStickerFromBench, setSelectedStickerFromBench] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [coverBgImage, setCoverBgImage] = useState<string | null>('/src/assets/images/CAPA ALBUM_novo.png');
  const [headerBgImage, setHeaderBgImage] = useState<string | null>('/src/assets/images/CAPA_CAB.png');
  const [titleImage, setTitleImage] = useState<string | null>('/src/assets/images/regenerated_image_1779727658462.png');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/b_9_k6_3Bws');
  const [isEnteringLoading, setIsEnteringLoading] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [celebratedPage1, setCelebratedPage1] = useState(() => {
    try {
      return localStorage.getItem('cepe_celebrated_page1') === 'true';
    } catch (_) {
      return false;
    }
  });

  const [celebratedPage2, setCelebratedPage2] = useState(() => {
    try {
      return localStorage.getItem('cepe_celebrated_page2') === 'true';
    } catch (_) {
      return false;
    }
  });

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [celebrationPageName, setCelebrationPageName] = useState<'titulares' | 'reservas' | 'minicraques' | null>(null);
  const [specialStickerAwarded, setSpecialStickerAwarded] = useState<Sticker | null>(null);
  const [showFullCompletionModal, setShowFullCompletionModal] = useState(false);

  // Expose a globally accessible developer tool to trigger the completion modal for testing/previewing
  useEffect(() => {
    (window as any).triggerFullCompletionTest = () => {
      setShowFullCompletionModal(true);
      console.log("🏆 [CEPE ALBUM TEST] Pop-up de premiação e conclusão final ativado via console!");
      try {
        const victoryAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
        victoryAudio.volume = 0.5;
        victoryAudio.play();
      } catch (_) {}
    };
    return () => {
      delete (window as any).triggerFullCompletionTest;
    };
  }, []);

  // Manage header visibility based on current page
  useEffect(() => {
    if (currentPage === 'album') {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
  }, [currentPage]);

  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem('cepe_album_brand_logo');
      if (storedLogo) {
        setBrandImage(storedLogo);
      }
      const storedBg = localStorage.getItem('cepe_album_cover_bg');
      if (storedBg && !storedBg.includes('regenerated_image_1779727658066')) {
        setCoverBgImage(storedBg);
      } else {
        setCoverBgImage('/src/assets/images/CAPA ALBUM_novo.png');
      }
      const storedHeaderBg = localStorage.getItem('cepe_album_header_bg');
      if (storedHeaderBg && !storedHeaderBg.includes('regenerated_image_1779727658462')) {
        setHeaderBgImage(storedHeaderBg);
      } else {
        setHeaderBgImage('/src/assets/images/CAPA_CAB.png');
      }
      const storedTitle = localStorage.getItem('cepe_album_title_image_png');
      if (storedTitle) {
        if (storedTitle.includes('Ativo') || storedTitle.includes('input_file_3.png') || storedTitle.includes('regenerated_image_1779716629628')) {
          localStorage.removeItem('cepe_album_title_image_png');
          setTitleImage('/src/assets/images/regenerated_image_1779727658462.png');
        } else {
          setTitleImage(storedTitle);
        }
      } else {
        setTitleImage('/src/assets/images/regenerated_image_1779727658462.png');
      }
    } catch (_) {}
  }, []);

  const handleBrandImageChange = (newLogo: string | null) => {
    setBrandImage(newLogo);
    try {
      if (newLogo) {
        localStorage.setItem('cepe_album_brand_logo', newLogo);
      } else {
        localStorage.removeItem('cepe_album_brand_logo');
      }
    } catch (_) {}
  };

  const handleCoverBgImageChange = (newBg: string | null) => {
    setCoverBgImage(newBg);
    try {
      if (newBg) {
        localStorage.setItem('cepe_album_cover_bg', newBg);
      } else {
        localStorage.removeItem('cepe_album_cover_bg');
      }
    } catch (_) {}
  };

  const handleHeaderBgImageChange = (newHeaderBg: string | null) => {
    setHeaderBgImage(newHeaderBg);
    try {
      if (newHeaderBg) {
        localStorage.setItem('cepe_album_header_bg', newHeaderBg);
      } else {
        localStorage.removeItem('cepe_album_header_bg');
      }
    } catch (_) {}
  };

  const handleTitleImageChange = (newTitleImg: string | null) => {
    setTitleImage(newTitleImg);
    try {
      if (newTitleImg) {
        localStorage.setItem('cepe_album_title_image_png', newTitleImg);
      } else {
        localStorage.removeItem('cepe_album_title_image_png');
      }
    } catch (_) {}
  };

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        let loaded: UserSticker[] = JSON.parse(stored);
        // Automatic migration: If sticker 27 exists as 'inventory', change it to 'glued' with slotId 'SPC_3'
        loaded = loaded.map(u => {
          if (u.stickerId === 27 && u.status === 'inventory') {
            return { ...u, status: 'glued', slotId: 'SPC_3' };
          }
          return u;
        });
        setUserStickers(loaded);
      } else {
        // Drop 3 free initial starter stickers on the first load so players can test dragging immediately!
        const starters: UserSticker[] = [
          { stickerId: 1, status: 'inventory' }, // Jânio Santos
          { stickerId: 2, status: 'inventory' }, // Davizinho
          { stickerId: 3, status: 'inventory' }  // Diego Maradona
        ];
        setUserStickers(starters);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(starters));
      }
    } catch (e) {
      console.warn('LocalStorage load failure:', e);
    }
    setInitialized(true);
  }, []);

  // Save state to localStorage on state change
  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userStickers));
    } catch (e) {
      console.warn('LocalStorage save failure:', e);
    }
  }, [userStickers, initialized]);

  // Listen to popstate / hashchange to synchronize with browser navigation (Back, Forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const routeInfo = getInitialRouteInfo();
      setEntered(routeInfo.entered);
      setCurrentPage(routeInfo.currentPage);
      setAlbumPageIndex(routeInfo.albumPageIndex);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // Update browser URL on page/spread change
  useEffect(() => {
    if (!initialized) return;

    let targetPath = '/entrada';
    if (entered) {
      if (currentPage === 'cover') targetPath = '/capa';
      else if (currentPage === 'album' && albumPageIndex === 0) targetPath = '/album';
      else if (currentPage === 'album' && albumPageIndex === 1) targetPath = '/album2';
      else if (currentPage === 'album' && albumPageIndex === 2) targetPath = '/album3';
      else if (currentPage === 'album' && albumPageIndex === 3) targetPath = '/album4';
      else if (currentPage === 'back') targetPath = '/verso';
      else if (currentPage === 'achievements') targetPath = '/conquistas';
      else if (currentPage === 'minicraques') targetPath = '/minicraques';
      else if (currentPage === 'bancada') targetPath = '/bancada';
    }


    // Direct check if the current route is /ajuste to avoid resetting the URL
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    const isAjuste = currentPath === '/ajuste' || currentPath.endsWith('/ajuste') || currentHash === '#ajuste' || currentHash === '#/ajuste';
    if (isAjuste) {
      return;
    }

    if (window.location.pathname !== targetPath) {
      try {
        window.history.pushState(null, '', targetPath);
      } catch (e) {
        // Fallback to hash if pushState fails in sandboxed iframe environments
        const targetHash = '#' + targetPath;
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        }
      }
    }
  }, [entered, currentPage, albumPageIndex, initialized]);

  // Synchronize audio master trigger with local state
  const handleToggleSound = (enabled: boolean) => {
    setSoundOn(enabled);
    setSoundEnabled(enabled);
  };

  // Add newly drawn stickers from pack opening to inventory
  const handleAddStickers = (newStickers: Sticker[]) => {
    const fresh: UserSticker[] = newStickers.map(s => ({
      stickerId: s.id,
      status: 'inventory'
    }));
    setUserStickers(prev => [...prev, ...fresh]);
  };

  // Add minicraque to inventory
  const handleAddMinicraque = (minicraqueId: number) => {
    setUserStickers(prev => {
      const exists = prev.some(u => u.stickerId === minicraqueId);
      if (exists) return prev;
      return [...prev, { stickerId: minicraqueId, status: 'inventory' as const }];
    });
  };

  // Glue sticker action: transition individual card from inventory to glued on a specific slot ID
  const handleGlueSticker = (stickerId: number, slotId: string) => {
    setUserStickers(prev => {
      const updated = [...prev];
      // Find FIRST matching card with status 'inventory' and mark it as 'glued' on slotId
      const targetIdx = updated.findIndex(u => u.stickerId === stickerId && u.status === 'inventory');
      if (targetIdx !== -1) {
        updated[targetIdx] = {
          ...updated[targetIdx],
          status: 'glued',
          slotId: slotId,
          gluedAt: new Date().toISOString()
        };
      }
      return updated;
    });
  };

  // Unglue sticker action: return a specific glued sticker from a layout slot back to the bench inventory
  const handleUnglueSticker = (stickerId: number, slotId: string) => {
    setUserStickers(prev => {
      const updated = [...prev];
      const targetIdx = updated.findIndex(u => u.stickerId === stickerId && u.status === 'glued' && u.slotId === slotId);
      if (targetIdx !== -1) {
        updated[targetIdx] = {
          ...updated[targetIdx],
          status: 'inventory',
          slotId: undefined,
        };
      } else {
        // Fallback for older save states without slotId fields
        const targetFallback = updated.findIndex(u => u.stickerId === stickerId && u.status === 'glued');
        if (targetFallback !== -1) {
          updated[targetFallback] = {
            ...updated[targetFallback],
            status: 'inventory',
            slotId: undefined,
          };
        }
      }
      return updated;
    });
  };

  // Clear state and start fresh
  const handleResetProgress = () => {
    setUserStickers([]);
    setCelebratedPage1(false);
    setCelebratedPage2(false);
    try {
      localStorage.removeItem('cepe_dream_team_lineup_v2');
      localStorage.removeItem('cepe_dream_team_formation_v2');
      localStorage.setItem('cepe_celebrated_page1', 'false');
      localStorage.setItem('cepe_celebrated_page2', 'false');
      localStorage.removeItem('cepe_has_celebrated_full_completion_v1');
    } catch (_) {}
    setCurrentPage('cover');
    playPageFlip();
  };

  // Page completion checker effects inside App.tsx
  const isPage1CompletedNow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  const isPage2CompletedNow = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  useEffect(() => {
    if (!initialized) return;

    if (isPage1CompletedNow && !celebratedPage1) {
      setCelebratedPage1(true);
      try {
        localStorage.setItem('cepe_celebrated_page1', 'true');
      } catch (_) {}
      
      const spec = STICKERS.find(s => s.id === 25);
      if (spec) {
        setSpecialStickerAwarded(spec);
        setUserStickers(prev => {
          const hasIt = prev.some(u => u.stickerId === 25);
          const has27 = prev.some(u => u.stickerId === 27);
          let next = [...prev];
          if (!hasIt) {
            next.push({ stickerId: 25, status: 'glued', slotId: 'SPC_1' });
          }
          if (!has27) {
            next.push({ stickerId: 27, status: 'glued', slotId: 'SPC_3' });
          }
          return next;
        });
      }
      setCelebrationPageName('titulares');
      setShowCelebrationModal(true);
      playGoalCrowd();
    }

    if (isPage2CompletedNow && !celebratedPage2) {
      setCelebratedPage2(true);
      try {
        localStorage.setItem('cepe_celebrated_page2', 'true');
      } catch (_) {}

      const spec = STICKERS.find(s => s.id === 26);
      if (spec) {
        setSpecialStickerAwarded(spec);
        setUserStickers(prev => {
          const hasIt = prev.some(u => u.stickerId === 26);
          if (hasIt) return prev;
          return [...prev, { stickerId: 26, status: 'glued', slotId: 'SPC_2' }];
        });
      }
      setCelebrationPageName('reservas');
      setShowCelebrationModal(true);
      playGoalCrowd();
    }
  }, [isPage1CompletedNow, isPage2CompletedNow, celebratedPage1, celebratedPage2, initialized]);

  // Shortcut to toggle Goal Celebration Modal ("/" key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input field or interactive editable element
      const activeEl = document.activeElement;
      if (
        activeEl && 
        (activeEl.tagName === 'INPUT' || 
         activeEl.tagName === 'TEXTAREA' || 
         activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setShowCelebrationModal((prev) => {
          const nextVal = !prev;
          if (nextVal) {
            // Pick a special sticker if none is currently selected to ensure beautiful test preview
            if (!specialStickerAwarded) {
              const spec = STICKERS.find(s => s.id === 25) || STICKERS[0];
              setSpecialStickerAwarded(spec);
              setCelebrationPageName('titulares');
            }
            // Trigger high fidelity Brazilian crowd sound effects
            playGoalCrowd();
          }
          return nextVal;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [specialStickerAwarded]);

  // Derived queries
  const gluedStickerIds = userStickers
    .filter(u => u.status === 'glued' && u.stickerId !== 28)
    .map(u => u.stickerId);

  const UNIQUE_GLUED_COUNT = new Set(gluedStickerIds).size;
  const TOTAL_STICKERS_COUNT = STICKERS.filter(s => s.id !== 28).length;

  // Trigger full album completion celebration popup reward when percentage is 100%
  useEffect(() => {
    if (!initialized || TOTAL_STICKERS_COUNT === 0) return;
    if (UNIQUE_GLUED_COUNT >= TOTAL_STICKERS_COUNT) {
      const alreadyAwarded = localStorage.getItem('cepe_has_celebrated_full_completion_v1') === 'true';
      if (!alreadyAwarded) {
        setShowFullCompletionModal(true);
        localStorage.setItem('cepe_has_celebrated_full_completion_v1', 'true');
        
        // Auto-glue/award SPC_4 (Sticker 28) to the user's stickers!
        setUserStickers(prev => {
          if (!prev.some(u => u.stickerId === 28)) {
            return [...prev, { stickerId: 28, status: 'glued', slotId: 'SPC_4' }];
          }
          return prev;
        });
        
        // Success audio chime
        try {
          const victoryAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav');
          victoryAudio.volume = 0.5;
          victoryAudio.play();
        } catch (_) {}
      }
    }
  }, [UNIQUE_GLUED_COUNT, TOTAL_STICKERS_COUNT, initialized]);

  // Compute bench list with counts (only items that exist and have status 'inventory')
  const benchMap = new Map<number, number>();
  userStickers.forEach(u => {
    if (u.status === 'inventory') {
      benchMap.set(u.stickerId, (benchMap.get(u.stickerId) || 0) + 1);
    }
  });

  const benchStickers = STICKERS.filter(s => ![25, 26, 27].includes(s.id) && benchMap.has(s.id)).map(s => ({
    sticker: s,
    count: benchMap.get(s.id) || 0
  }));

  if (!entered) {
    return (
      <>
        {isEnteringLoading ? (
          <LoadingScreen
            onComplete={() => {
              setEntered(true);
              setIsEnteringLoading(false);
            }}
            coverBgImage={coverBgImage}
            brandImage={brandImage}
          />
        ) : (
          <EntryPage
            onEnter={() => setIsEnteringLoading(true)}
            brandImage={brandImage}
            coverBgImage={coverBgImage}
            titleImage={titleImage}
            onOpenVideo={() => setIsVideoOpen(true)}
          />
        )}
        {isVideoOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-4xl bg-[#1a0c2a] border-4 border-slate-950 rounded-[32px] overflow-hidden shadow-[8px_8px_0_rgba(255,223,27,0.15)] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4.5 border-b-4 border-slate-950 bg-slate-950">
                <div className="flex items-center gap-2.5">
                  <Video className="w-5 h-5 text-[#FFDF1B] animate-pulse" />
                  <span className="font-sans font-black text-sm text-white uppercase tracking-wider text-left">
                    VÍDEO DE APRESENTAÇÃO
                  </span>
                </div>
                <button
                  onClick={() => setIsVideoOpen(false)}
                  className="p-1.5 bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 border-2 border-slate-950 rounded-full transition-all active:scale-95 cursor-pointer"
                  title="Fechar Vídeo"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                </button>
              </div>

              {/* Video Body */}
              <div className="p-6 space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-4 border-slate-950 bg-black shadow-inner">
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={videoUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* URL Customization Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-left select-none font-sans">
                    <span className="text-[10px] text-white font-black block leading-none uppercase">
                      URL DO VÍDEO CUSTOMIZADO
                    </span>
                    <span className="text-[8px] text-slate-400 font-medium block mt-1 tracking-wide">
                      Deseja trocar o vídeo? Insira um link do YouTube (Embed) para atualizar:
                    </span>
                  </div>
                  <div className="flex-1 w-full sm:max-w-md flex gap-2">
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/..."
                      className="flex-1 px-3 py-1.5 bg-slate-950 border-2 border-slate-800 focus:border-[#FFDF1B] rounded-full text-[10px] font-mono text-slate-200 placeholder-slate-600 outline-none"
                    />
                    {videoUrl !== 'https://www.youtube.com/embed/b_9_k6_3Bws' && (
                      <button
                        onClick={() => setVideoUrl('https://www.youtube.com/embed/b_9_k6_3Bws')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all border border-slate-705"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen text-white flex flex-col font-sans transition-all duration-300 w-full max-w-full overflow-x-hidden" style={{ backgroundColor: '#72a33d' }}>
      
      {/* Header section with overall metrics and sound control */}
      <Header
        isHeaderVisible={isHeaderVisible}
        onToggleHeader={() => setIsHeaderVisible(!isHeaderVisible)}
        gluedCount={UNIQUE_GLUED_COUNT}
        totalCount={TOTAL_STICKERS_COUNT}
        onReset={handleResetProgress}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        brandImage={brandImage}
        onBrandImageChange={handleBrandImageChange}
        coverBgImage={coverBgImage}
        onCoverBgImageChange={handleCoverBgImageChange}
        headerBgImage={headerBgImage}
        onHeaderBgImageChange={handleHeaderBgImageChange}
        titleImage={titleImage}
        onTitleImageChange={handleTitleImageChange}
        onOpenVideo={() => setIsVideoOpen(true)}
      />

      {/* Main interactive stage */}
      <main className="flex-1 flex flex-col justify-start items-center p-4 md:p-6 w-full max-w-7xl mx-auto space-y-6">
        
        {/* Interactive Navigation Index (Índice do Álbum) */}
        <AlbumIndex
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          albumPageIndex={albumPageIndex}
          setAlbumPageIndex={setAlbumPageIndex}
          userStickers={userStickers}
        />

        {/* Render pages depending on Flipbook state */}
        {currentPage === 'cover' && (
          <AlbumCover
            onOpen={() => {
              playPageFlip();
              setCurrentPage('album');
              setAlbumPageIndex(0);
            }}
            gluedCount={UNIQUE_GLUED_COUNT}
            totalCount={TOTAL_STICKERS_COUNT}
            brandImage={brandImage}
            coverBgImage={coverBgImage}
            onCoverBgImageChange={handleCoverBgImageChange}
            onBrandImageChange={handleBrandImageChange}
            titleImage={titleImage}
            onTitleImageChange={handleTitleImageChange}
          />
        )}

        {currentPage === 'album' && (
          <AlbumInside
            benchStickers={benchStickers}
            userStickers={userStickers}
            onGlueSticker={handleGlueSticker}
            onUnglueSticker={handleUnglueSticker}
            onPrevPage={() => {
              playPageFlip();
              setCurrentPage('cover');
            }}
            onNextPage={() => {
              playPageFlip();
              setCurrentPage('back');
            }}
            currentPageIndex={albumPageIndex}
            onPageIndexChange={setAlbumPageIndex}
            onGoToMiniCraques={() => {
              playPageFlip();
              setCurrentPage('minicraques');
            }}
            onGoToBancada={() => {
              playPageFlip();
              setCurrentPage('bancada');
            }}
            initialSelectedStickerId={selectedStickerFromBench}
            onClearSelectedStickerFromBench={() => setSelectedStickerFromBench(null)}
          />
        )}
        {currentPage === 'bancada' && (
          <BancadaView
            benchStickers={benchStickers}
            userStickers={userStickers}
            onGlueSticker={handleGlueSticker}
            onGoToAlbum={(sticker) => {
              playPageFlip();
              if (sticker) {
                let targetPageIndex: 0 | 1 | 2 | 3 = 0;
                if (sticker.id >= 113) targetPageIndex = 3;
                else if (sticker.id >= 101) targetPageIndex = 2;
                else if (sticker.id >= 13) targetPageIndex = 1;
                
                setAlbumPageIndex(targetPageIndex);
                setSelectedStickerFromBench(sticker.id);
              }
              setCurrentPage('album');
            }}
          />
        )}

        {currentPage === 'back' && (
          <AlbumBack
            gluedStickerIds={gluedStickerIds}
            onReset={handleResetProgress}
            onPrevPage={() => {
              playPageFlip();
              setCurrentPage('album');
              setAlbumPageIndex(1);
            }}
            brandImage={brandImage}
            onBrandImageChange={handleBrandImageChange}
            coverBgImage={coverBgImage}
            onCoverBgImageChange={handleCoverBgImageChange}
            titleImage={titleImage}
            onTitleImageChange={handleTitleImageChange}
            onOpenVideo={() => setIsVideoOpen(true)}
            onViewAchievements={() => {
              playPageFlip();
              setCurrentPage('achievements');
            }}
          />
        )}

        {currentPage === 'achievements' && (
          <AlbumAchievements
            benchStickers={benchStickers}
            userStickers={userStickers}
            onGlueSticker={handleGlueSticker}
            onBack={() => {
              playPageFlip();
              setCurrentPage('album');
            }}
            onGoToMiniCraques={() => {
              playPageFlip();
              setCurrentPage('minicraques');
            }}
          />
        )}

        {currentPage === 'minicraques' && (
          <MiniCraques
            userStickers={userStickers}
            onBack={() => {
              playPageFlip();
              setAlbumPageIndex(3);
              setCurrentPage('album');
            }}
            onAddMinicraque={handleAddMinicraque}
            onGoToBancada={() => {
              playPageFlip();
              setCurrentPage('bancada');
            }}
          />
        )}

        {/* Dynamic Pack Manager: Available in Cover or Album layout for rich game mechanics */}
        {currentPage !== 'back' && currentPage !== 'achievements' && (
          <div className="w-full" id="pack-manager-section">
            <PackManager
              onAddStickers={handleAddStickers}
              gluedStickerIds={gluedStickerIds}
            />
          </div>
        )}

      </main>

      {/* Persistent mini-credits footer */}
      <footer style={{ backgroundColor: '#000000' }} className="py-8 text-center text-slate-950 border-t-4 border-slate-950 font-mono tracking-widest font-bold uppercase flex flex-col items-center gap-3">
        <img
          src={brandImage || '/src/assets/images/regenerated_image_1779654679664.png'}
          alt="CEPE"
          className="h-12 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <div className="text-[10px]" style={{ color: '#ffffff', fontSize: '7px', paddingLeft: '0px', paddingBottom: '0px', fontFamily: 'monospace' }}>
          BORA BRASIL ALBUM ENGINE V1.0 • CEPE EDITORA PERNAMBUCO
        </div>
      </footer>

      {/* Video Presentation Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#1a0c2a] border-4 border-slate-950 rounded-[32px] overflow-hidden shadow-[8px_8px_0_rgba(255,223,27,0.15)] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b-4 border-slate-950 bg-slate-950">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-[#FFDF1B] animate-pulse" />
                <span className="font-sans font-black text-sm text-white uppercase tracking-wider">
                  VÍDEO DE APRESENTAÇÃO
                </span>
              </div>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="p-1.5 bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 border-2 border-slate-950 rounded-full transition-all active:scale-95 cursor-pointer"
                title="Fechar Vídeo"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>

            {/* Video Body */}
            <div className="p-6 space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-4 border-slate-950 bg-black shadow-inner">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* URL Customization Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="text-left select-none font-sans">
                  <span className="text-[10px] text-white font-black block leading-none uppercase">
                    URL DO VÍDEO CUSTOMIZADO
                  </span>
                  <span className="text-[8px] text-slate-400 font-medium block mt-1 tracking-wide">
                    Deseja trocar o vídeo? Insira um link do YouTube (Embed) para atualizar:
                  </span>
                </div>
                <div className="flex-1 w-full sm:max-w-md flex gap-2">
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 border-2 border-slate-800 focus:border-[#FFDF1B] rounded-full text-[10px] font-mono text-slate-200 placeholder-slate-600 outline-none"
                  />
                  {videoUrl !== 'https://www.youtube.com/embed/b_9_k6_3Bws' && (
                    <button
                      onClick={() => setVideoUrl('https://www.youtube.com/embed/b_9_k6_3Bws')}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all border border-slate-705"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
      {/* 📣 CELEBRATÓRIO POP-UP FLUTUANTE DE GOOOL!!!! ⚽️ */}
      {showCelebrationModal && specialStickerAwarded && (
        <div key="goal-celebration-popup" className="fixed inset-0 bg-[#280436]/90 z-[200] flex items-center justify-center p-4 overflow-y-auto select-none animate-fade-in">
          
          {/* Confetti raining background simulation with flat colored shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(25)].map((_, i) => {
              const colors = ['bg-[#FFDF1B]', 'bg-[#e21b3c]', 'bg-[#70a002]', 'bg-blue-400', 'bg-pink-400', 'bg-orange-400'];
              const color = colors[i % colors.length];
              const left = (i * 137) % 100;
              const delay = (i * 0.12) % 2.5;
              const size = (i % 2 === 0) ? 10 : 14;
              const rotation = (i * 30) % 360;
              return (
                <div
                  key={i}
                  className={`absolute rounded ${color} shadow-sm`}
                  style={{
                    left: `${left}%`,
                    top: `-20px`,
                    width: `${size}px`,
                    height: `${size * 0.6}px`,
                    transform: `rotate(${rotation}deg)`,
                    animation: `bounceSlow ${2 + (i % 2)}s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              );
            })}
          </div>

          <div 
            className="w-full max-w-2xl flex flex-col md:flex-row gap-6 md:gap-10 items-center justify-center py-6 cursor-default transform animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Premium card display block rotate/tilt effect */}
             <div 
               style={{ backgroundColor: '#ff5f00', backgroundImage: 'none' }}
               className="relative w-48 aspect-[3/4] sm:w-56 p-2 rounded-[24px] border-6 border-slate-950 shadow-[12px_12px_0_rgba(15,10,25,1)] hover:rotate-2 transition-transform duration-350 flex flex-col items-center justify-between overflow-hidden group select-none ring-4 ring-[#FFDF1B]/30"
             >
               <span className="sr-only" style={{ fontSize: '36px' }}>★</span>
               <div className="absolute inset-1.5 border-2 border-dashed border-[#FFDF1B]/15 rounded-[18px] pointer-events-none" />
               
               {/* Shiny Star seal of authenticity */}
               <div className="absolute top-3 left-3 text-[10px] bg-[#FFDF1B] text-slate-900 border border-slate-950 rounded-full w-6 h-6 flex items-center justify-center font-black z-20">
                 ★
               </div>

               <div className="w-full h-full relative bg-slate-950 border-3 border-slate-950 rounded-xl overflow-hidden shadow-inner font-sans">
                 <StickerItem
                   sticker={specialStickerAwarded}
                   size="lg"
                   isGlued={true}
                   className="w-full h-full border-0 shadow-none hover:scale-100 hover:translate-y-0"
                 />
               </div>
             </div>

             {/* Right side: Information block matching the Zoom Card popup visual style */}
             <div 
               style={{ backgroundColor: '#27b793' }}
               className="w-full max-w-xs flex flex-col gap-3 font-sans p-4 rounded-[24px] border-4 border-slate-955 shadow-[5px_5px_0_rgba(15,10,25,1)]"
             >
               
               {/* Header bar capsule */}
               <div className="w-full bg-white border-4 border-slate-950 rounded-[20px] px-4 py-1.5 shadow-[3px_3px_0_rgba(15,10,25,1)] flex items-center justify-between">
                 <span className="text-[#e21b3c] font-black text-xl tracking-tight uppercase">
                   <img src={AtivoImage || "/src/assets/images/Ativo 8.png"} 
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (target.src.includes('Ativo') && !target.src.includes('goool_image.png')) {
                          target.src = "/src/assets/images/goool_image.png";
                        } else if (target.src.includes('goool_image.png')) {
                          target.src = "/src/assets/images/Ativo%208.png";
                        }
                      }}
                      alt="GOOOOL!!!" className="h-[50px] w-auto object-contain select-none inline-block inline-flex translate-y-0.5" referrerPolicy="no-referrer" />
                 </span>
                 
                 {/* Black circle close button with white X inside */}
                 <button
                   onClick={() => {
                     playPageFlip();
                     setShowCelebrationModal(false);
                   }}
                   className="w-8.5 h-8.5 bg-black hover:bg-slate-900 text-white rounded-full border-2 border-slate-950 flex items-center justify-center transition-all cursor-pointer shadow-[1.5px_1.5px_0_rgba(0,0,0,1)] active:translate-y-0.5"
                   title="Fechar"
                   aria-label="Fechar"
                 >
                   <X className="w-4 h-4 text-white stroke-[3.5px]" />
                 </button>
               </div>

               {/* Informações detalhadas white list card wrapper */}
               <div className="w-full bg-white border-4 border-slate-950 rounded-[20px] p-4.5 shadow-[3px_3px_0_rgba(15,10,25,1)] flex flex-col gap-2.5">
                 
                 <div className="flex justify-center mb-1">
                   <div 
                     style={{ backgroundColor: '#ff911b' }}
                     className="px-3 py-1 text-slate-950 font-black rounded-full border-2 border-slate-950 text-[10px] tracking-widest uppercase shadow-[2.5px_2.5px_0_rgba(0,0,0,1)] select-none leading-none"
                   >
                     CAMPEÃO CEPE
                   </div>
                 </div>

                 <div className="space-y-1.5 text-center pb-2.5 border-b border-slate-100">
                   <p className="text-[13.5px] text-slate-950 font-black uppercase tracking-tight leading-none">
                     Parabéns, Colecionador!
                   </p>
                   <p 
                     style={{ fontSize: '12px', fontWeight: 'bold', fontStyle: 'normal' }}
                     className="text-[10px] text-slate-500 font-semibold leading-normal"
                   >
                     Você completou a escalação e obteve o cromo lendário oficial do clube!
                   </p>
                 </div>

                {/* Achievement Statistics Table */}
                <div className="flex flex-col gap-2">
                  {/* Cromo Row */}
                  <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold">Cromo</span>
                    <span className="text-[12px] text-slate-900 font-extrabold truncate max-w-[150px]">
                      {specialStickerAwarded.name}
                    </span>
                  </div>

                  {/* Escalação Row */}
                  <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold">Escalação</span>
                    <span className="text-[12px] text-slate-900 font-extrabold capitalize">
                      {celebrationPageName === 'titulares' ? 'Convocados 1' : 'Convocados 2'}
                    </span>
                  </div>

                  {/* Status Row */}
                  <div className="flex justify-between items-baseline py-1 border-b border-slate-100">
                    <span className="text-[10px] text-slate-500 font-semibold">Desbloqueio</span>
                    <span className="text-[12px] text-[#70a002] font-black uppercase">
                      100% COMPLETO
                    </span>
                  </div>

                  {/* Clube Row */}
                  <div className="flex justify-between items-baseline py-1">
                    <span className="text-[10px] text-slate-500 font-semibold">Editora</span>
                    <span className="text-[11px] text-slate-900 font-bold truncate max-w-[150px]">
                      CEPE
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => {
                  playPageFlip();
                  setShowCelebrationModal(false);
                }}
                style={{ backgroundColor: '#a833aa' }}
                className="px-6 py-3.5 w-full text-white font-sans font-black rounded-full border-3 border-slate-950 shadow-[3px_3px_0_rgba(15,10,25,1)] text-[11px] tracking-widest uppercase transition-all duration-150 active:translate-y-1 active:shadow-none cursor-pointer text-center"
              >
                COLAR NA CAPA!
              </button>

            </div>

          </div>
        </div>
      )}

      {/* 👑 POP-UP DE PREMIAÇÃO FINAL - ÁLBUM 100% COMPLETADO 👑 */}
      {showFullCompletionModal && (
        <div key="full-completion-popup" className="fixed inset-0 z-[250] flex items-center justify-center p-4 overflow-y-auto select-none animate-fade-in font-sans" style={{ backgroundColor: 'rgba(40, 4, 54, 0.9)' }}>
          
          {/* Stunning festive rain/confetti simulation with colored shapes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(40)].map((_, i) => {
              const colors = ['bg-[#FFDF1B]', 'bg-[#ff00ff]', 'bg-[#00ffff]', 'bg-[#00ff22]', 'bg-amber-400', 'bg-rose-500'];
              const color = colors[i % colors.length];
              const left = (i * 123) % 100;
              const delay = (i * 0.1) % 3;
              const size = (i % 3 === 0) ? 8 : (i % 3 === 1) ? 12 : 16;
              return (
                <div
                  key={i}
                  className={`absolute rounded-full ${color} opacity-85 animate-pulse`}
                  style={{
                    left: `${left}%`,
                    top: `${(i * 17) % 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${3 + (i % 3)}s`
                  }}
                />
              );
            })}
          </div>

          <div 
            className="w-full bg-gradient-to-tr from-[#1f0b24] via-[#3a0b47] to-[#120417] border-6 border-yellow-500 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(253,224,71,0.25)] text-center relative flex flex-col items-center justify-center gap-4 animate-scale-in"
            style={{ width: '600px', height: '380px', maxWidth: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <img 
                src="/src/assets/images/regenerated_image_1780114641990.png" 
                alt="GOOOL!!!" 
                className="object-contain mx-auto drop-shadow-md"
                style={{ height: '90px', paddingBottom: '0px', paddingTop: '0px', marginLeft: '0px', marginTop: '0px', marginBottom: '-56px', width: '900px' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Glowing Showcase of Cromo Lendário SPC_4 */}
            <div className="relative p-1 bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 rounded-[20px] shadow-2xl scale-75 my-0.5">
              <div className="absolute -inset-1 bg-yellow-400 rounded-[24px] blur-xs opacity-70 animate-pulse" />
              <StickerItem
                sticker={STICKERS.find(s => s.id === 28)!}
                size="sm"
                isGlued={true}
                className="relative border-4 border-slate-950 shadow-2xl"
              />
            </div>

            {/* Action buttons */}
            <button
              onClick={() => {
                playPageFlip();
                setShowFullCompletionModal(false);
                setCurrentPage('achievements'); // Redirect to achievements layout
              }}
              style={{ backgroundColor: '#e40085', fontSize: '20px', marginBottom: '0px', marginTop: '-44px' }}
              className="px-8 py-3 w-full text-white font-sans font-black rounded-full border-3 border-slate-950 shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider uppercase transition-all duration-150 active:translate-y-0.5 active:shadow-none cursor-pointer text-center hover:brightness-110 flex items-center justify-center gap-2"
            >
              Ver Minhas Conquistas!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
