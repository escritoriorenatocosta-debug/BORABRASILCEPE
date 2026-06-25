/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AlbumAchievements from './components/AlbumAchievements';
import MiniCraques from './components/MiniCraques';
import AlbumRanking from './components/AlbumRanking';
import Header from './components/Header';
import AlbumCover from './components/AlbumCover';
import AlbumInside from './components/AlbumInside';
import BancadaView from './components/BancadaView';
import AlbumBack from './components/AlbumBack';
import AlbumIndex from './components/AlbumIndex';
import PackManager from './components/PackManager';
import EntryPage from './components/EntryPage';
import LoadingScreen from './components/LoadingScreen';
import IntroVideoScreen from './components/IntroVideoScreen';
import StickerItem from './components/StickerItem';
import { Sticker, UserSticker, getPageIndexForSlotId } from './types';
import { STICKERS } from './data';
import { playPageFlip, setSoundEnabled, playGoalCrowd, isMusicEnabled, setMusicEnabled, startBackgroundMusic, stopBackgroundMusic, playGlue, playSuccess, playRefuse } from './audio';
import { Sparkles, Trophy, HelpCircle, Gamepad2, Info, Play, Video, X, Award, Save } from 'lucide-react';
import AtivoImage from './assets/images/GOOOL.png';
import marcaMinicraques from './assets/images/marca_MInicraques.png';
import ResetImage from './assets/images/regenerated_image_1779716630166.png';

const LOCAL_STORAGE_KEY = 'cepe_album_progress_2026_v1';

const getInitialRouteInfo = () => {
  try {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    let matched: string | null = null;
    if (path === '/entrada' || hash === '#/entrada') matched = 'entrada';
    else if (path === '/capa' || hash === '#/capa') matched = 'capa';
    else if (path === '/verso' || hash === '#/verso') matched = 'verso';
    else if (path === '/ajuste' || hash === '#/ajuste' || hash === '#ajuste') matched = 'ajuste';
    else if (path === '/conquistas' || hash === '#/conquistas') matched = 'conquistas';
    else if (path === '/minicraques' || hash === '#/minicraques') matched = 'minicraques';
    else if (path === '/bancada' || hash === '#/bancada') matched = 'bancada';
    else if (path === '/ranking' || hash === '#/ranking') matched = 'ranking';
    else if (path.startsWith('/album') || hash.startsWith('#/album')) {
      const wholeStr = path.startsWith('/album') ? path : hash.replace('#', '');
      matched = wholeStr.replace('/', ''); // e.g. "album" or "album2"
    }

    if (matched === 'capa') {
      return { entered: true, currentPage: 'cover' as const, albumPageIndex: 0 };
    }
    if (matched === 'bancada') {
      return { entered: true, currentPage: 'bancada' as const, albumPageIndex: 0 };
    }
    if (matched && matched.startsWith('album')) {
      let pageIdx = 0;
      if (matched !== 'album') {
        const numStr = matched.replace('album', '');
        const num = parseInt(numStr);
        if (!isNaN(num)) {
          pageIdx = num - 1;
        }
      }
      return { entered: true, currentPage: 'album' as const, albumPageIndex: pageIdx };
    }
    if (matched === 'verso') {
      return { entered: true, currentPage: 'back' as const, albumPageIndex: 0 };
    }
    if (matched === 'conquistas') {
      return { entered: true, currentPage: 'achievements' as const, albumPageIndex: 0 };
    }
    if (matched === 'minicraques') {
      return { entered: true, currentPage: 'minicraques' as const, albumPageIndex: 0 };
    }
    if (matched === 'ranking') {
      return { entered: true, currentPage: 'ranking' as const, albumPageIndex: 0 };
    }
    if (matched === 'ajuste') {
      return { entered: true, currentPage: 'cover' as const, albumPageIndex: 0 };
    }
  } catch (_) {}
  
  // Default to Entry Page
  return { entered: false, currentPage: 'cover' as const, albumPageIndex: 0 };
};

export default function App() {
  const initialRoute = getInitialRouteInfo();
  const [entered, setEntered] = useState(initialRoute.entered);
  const [currentPage, setCurrentPage] = useState<'cover' | 'album' | 'back' | 'achievements' | 'minicraques' | 'bancada' | 'ranking'>(initialRoute.currentPage);
  const [albumPageIndex, setAlbumPageIndex] = useState<number>(initialRoute.albumPageIndex);
  const [userStickers, setUserStickers] = useState<UserSticker[]>([]);
  const [draggingSticker, setDraggingSticker] = useState<Sticker | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 45, y: 70 });
  const [selectedStickerFromBench, setSelectedStickerFromBench] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(() => isMusicEnabled());
  const [initialized, setInitialized] = useState(false);
  const [brandImage, setBrandImage] = useState<string | null>(null);
  const [coverBgImage, setCoverBgImage] = useState<string | null>('/assets/images/CAPA ALBUM_novo.png');
  const [headerBgImage, setHeaderBgImage] = useState<string | null>('/assets/images/CAPA_CAB.png');
  const [titleImage, setTitleImage] = useState<string | null>('/assets/images/regenerated_image_1779727658462.png');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/embed/b_9_k6_3Bws');
  const [isEnteringLoading, setIsEnteringLoading] = useState(false);
  const [isWatchingIntro, setIsWatchingIntro] = useState(false);
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

  const [celebratedPage3, setCelebratedPage3] = useState(() => {
    try {
      return localStorage.getItem('cepe_celebrated_page3') === 'true';
    } catch (_) {
      return false;
    }
  });

  const [celebratedPage4, setCelebratedPage4] = useState(() => {
    try {
      return localStorage.getItem('cepe_celebrated_page4') === 'true';
    } catch (_) {
      return false;
    }
  });

  const [isVersoCompleted, setIsVersoCompleted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('cepe_dream_team_lineup_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        return Object.values(parsed).length === 11 && Object.values(parsed).every(val => val !== null);
      }
    } catch (_) {}
    return false;
  });

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [celebrationPageName, setCelebrationPageName] = useState<'titulares' | 'reservas' | 'auxiliares' | 'minicraques' | 'verso' | null>(null);
  const [specialStickerAwarded, setSpecialStickerAwarded] = useState<Sticker | null>(null);
  const [showFullCompletionModal, setShowFullCompletionModal] = useState(false);

  // Expose a globally accessible developer tool to trigger the completion modal for testing/previewing
  useEffect(() => {
    (window as any).triggerFullCompletionTest = () => {
      setShowFullCompletionModal(true);
      console.log("🏆 [CEPE ALBUM TEST] Pop-up de premiação e conclusão final ativado via console!");
      try {
        playSuccess();
      } catch (_) {}
    };
    return () => {
      delete (window as any).triggerFullCompletionTest;
    };
  }, []);

  const [scrollY, setScrollY] = useState(0);

  // Active player states for global Save button
  const [activeRankName, setActiveRankName] = useState(() => {
    try {
      return localStorage.getItem('cepe_active_rank_name') || '';
    } catch (_) {
      return '';
    }
  });
  const [activeRankPassword, setActiveRankPassword] = useState(() => {
    try {
      return localStorage.getItem('cepe_active_rank_password') || '';
    } catch (_) {
      return '';
    }
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerNickname, setRegisterNickname] = useState('');
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<{ name: string; password: string } | null>(null);
  const [isQuickSaveNotificationOpen, setIsQuickSaveNotificationOpen] = useState(false);

  useEffect(() => {
    const syncActivePlayer = () => {
      try {
        setActiveRankName(localStorage.getItem('cepe_active_rank_name') || '');
        setActiveRankPassword(localStorage.getItem('cepe_active_rank_password') || '');
      } catch (_) {}
    };
    window.addEventListener('cepe_active_player_changed', syncActivePlayer);
    return () => window.removeEventListener('cepe_active_player_changed', syncActivePlayer);
  }, []);

  const saveProgressToRanking = (customName?: string) => {
    const currentName = customName || localStorage.getItem('cepe_active_rank_name') || '';
    const currentPassword = localStorage.getItem('cepe_active_rank_password') || '';
    const UNIQUE_GLUED_COUNT = userStickers.filter(s => s.glued).length;

    if (!currentName) {
      return { success: false, reason: 'needs_registration' };
    }

    let entries: any[] = [];
    const stored = localStorage.getItem('cepe_album_rankings_v2');
    if (stored) {
      try {
        entries = JSON.parse(stored);
      } catch (e) {
        console.error('Error loading rankings', e);
      }
    }
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      // Use fallback default mock entries
      entries = [
        { name: 'SONIC_91', password: '191', score: 238, userStickers: '[]', timestamp: Date.now() - 86400000 * 3, isMock: true },
        { name: 'Mario_Bros', password: '333', score: 215, userStickers: '[]', timestamp: Date.now() - 86400000 * 2, isMock: true },
        { name: 'ALEX_KIDD', password: '148', score: 185, userStickers: '[]', timestamp: Date.now() - 86400000 * 5, isMock: true },
        { name: 'SHINOBI_16', password: '777', score: 142, userStickers: '[]', timestamp: Date.now() - 86400000 * 1, isMock: true },
        { name: 'GOLDEN_AXE', password: '412', score: 108, userStickers: '[]', timestamp: Date.now() - 86400000 * 10, isMock: true },
        { name: 'MASTER_BOY', password: '520', score: 55, userStickers: '[]', timestamp: Date.now() - 86400000 * 12, isMock: true },
      ];
    }

    let password = currentPassword;
    if (!password) {
      const existing = entries.find(e => e.name === currentName && !e.isMock);
      if (existing) {
        password = existing.password;
      } else {
        let unique = false;
        let attempts = 0;
        while (!unique && attempts < 100) {
          const num = Math.floor(Math.random() * 900) + 100;
          const code = String(num);
          if (!entries.some(e => e.password === code)) {
            password = code;
            unique = true;
          }
          attempts++;
        }
        if (!password) {
          password = String(Math.floor(Math.random() * 900) + 100);
        }
      }
    }

    const newEntry = {
      name: currentName,
      password: password,
      score: UNIQUE_GLUED_COUNT,
      userStickers: JSON.stringify(userStickers),
      timestamp: Date.now(),
    };

    const updatedEntries = entries.filter(
      entry => !(entry.name === currentName && !entry.isMock)
    );

    const finalEntries = [...updatedEntries, newEntry].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.timestamp - a.timestamp;
    });

    localStorage.setItem('cepe_album_rankings_v2', JSON.stringify(finalEntries));
    localStorage.setItem('cepe_active_rank_name', currentName);
    localStorage.setItem('cepe_active_rank_password', password);

    // Sync with backend API
    fetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    })
    .then(res => res.json())
    .then(data => {
      console.log('Synchronized progress with backend:', data);
    })
    .catch(err => {
      console.warn('Backend sync deferred (using offline storage):', err);
    });

    window.dispatchEvent(new Event('cepe_active_player_changed'));

    return { success: true, name: currentName, password: password };
  };

  const handleQuickSave = () => {
    const res = saveProgressToRanking();
    if (!res.success) {
      setRegisterNickname('');
      setIsRegisterModalOpen(true);
      playPageFlip();
    } else {
      playGlue();
      setSaveSuccessNotification({ name: res.name!, password: res.password! });
      setIsQuickSaveNotificationOpen(true);
      setTimeout(() => {
        setIsQuickSaveNotificationOpen(false);
      }, 5000);
    }
  };

  const handleRegisterAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = registerNickname.trim().toUpperCase().slice(0, 15);
    if (!formattedName) {
      try {
        playRefuse();
      } catch (_) {}
      return;
    }

    const res = saveProgressToRanking(formattedName);
    if (res.success) {
      setIsRegisterModalOpen(false);
      playGlue();
      setSaveSuccessNotification({ name: res.name!, password: res.password! });
      setIsQuickSaveNotificationOpen(true);
      setTimeout(() => {
        setIsQuickSaveNotificationOpen(false);
      }, 5000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manage header visibility based on current page
  useEffect(() => {
    if (currentPage === 'album' || currentPage === 'minicraques' || currentPage === 'bancada' || currentPage === 'back' || currentPage === 'ranking') {
      setIsHeaderVisible(false);
    } else {
      setIsHeaderVisible(true);
    }
  }, [currentPage]);

  // Open rules popup whenever entering cover page (only once per session, after entering the app)
  useEffect(() => {
    if (entered && currentPage === 'cover') {
      const alreadyShown = sessionStorage.getItem('cepe_album_rules_popup_shown');
      if (!alreadyShown) {
        setShowRulesPopup(true);
        sessionStorage.setItem('cepe_album_rules_popup_shown', 'true');
      }
    }
  }, [entered, currentPage]);

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
        setCoverBgImage('/assets/images/CAPA ALBUM_novo.png');
      }
      const storedHeaderBg = localStorage.getItem('cepe_album_header_bg');
      if (storedHeaderBg && !storedHeaderBg.includes('regenerated_image_1779727658462')) {
        setHeaderBgImage(storedHeaderBg);
      } else {
        setHeaderBgImage('/assets/images/CAPA_CAB.png');
      }
      const storedTitle = localStorage.getItem('cepe_album_title_image_png');
      if (storedTitle) {
        if (storedTitle.includes('Ativo') || storedTitle.includes('input_file_3.png') || storedTitle.includes('regenerated_image_1779716629628')) {
          localStorage.removeItem('cepe_album_title_image_png');
          setTitleImage('/assets/images/regenerated_image_1779727658462.png');
        } else {
          setTitleImage(storedTitle);
        }
      } else {
        setTitleImage('/assets/images/regenerated_image_1779727658462.png');
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
        // Automatic migration: If sticker 203 exists as 'inventory', change it to 'glued' with slotId 'SPC_3'
        loaded = loaded.map(u => {
          if (u.stickerId === 203 && u.status === 'inventory') {
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
      else if (currentPage === 'album') {
        if (albumPageIndex === 0) targetPath = '/album';
        else targetPath = `/album${albumPageIndex + 1}`;
      }
      else if (currentPage === 'back') targetPath = '/verso';
      else if (currentPage === 'achievements') targetPath = '/conquistas';
      else if (currentPage === 'minicraques') targetPath = '/minicraques';
      else if (currentPage === 'bancada') targetPath = '/bancada';
      else if (currentPage === 'ranking') targetPath = '/ranking';
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

  const handleToggleMusic = (enabled: boolean) => {
    setMusicOn(enabled);
    setMusicEnabled(enabled);
  };

  // Automated background music controller that fires once the user is initialized and enters the app
  useEffect(() => {
    if (entered && musicOn) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [entered, musicOn]);

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

  const handleStoreRepeatedInVault = () => {
    setUserStickers(prev => {
      const gluedIdsSet = new Set(prev.filter(u => u.status === 'glued').map(u => u.stickerId));
      const inventoryCounts = new Map<number, number>();

      return prev.map(u => {
        // If it's not inventory, leave it as is
        if (u.status !== 'inventory') {
          return u;
        }

        // It is 'inventory'. Let's see if it should be vaulted.
        const isGlued = gluedIdsSet.has(u.stickerId);
        if (isGlued) {
          // If it is already glued, EVERY inventory copy of it is a repeated, so it goes to vault!
          return { ...u, status: 'vaulted' as const };
        } else {
          // If it's not glued, we keep the first inventory copy we see on the bench, and vault any subsequent ones.
          const currentCount = inventoryCounts.get(u.stickerId) || 0;
          if (currentCount === 0) {
            inventoryCounts.set(u.stickerId, 1);
            return u; // Keep on bench
          } else {
            return { ...u, status: 'vaulted' as const }; // Send extra copy to vault
          }
        }
      });
    });
  };

  const handleRetrieveFromVault = (stickerId: number) => {
    setUserStickers(prev => {
      // Find the first occurrence with status 'vaulted' and stickerId, and change its status to 'inventory'
      const index = prev.findIndex(u => u.stickerId === stickerId && u.status === 'vaulted');
      if (index !== -1) {
        const next = [...prev];
        next[index] = { ...next[index], status: 'inventory' as const };
        return next;
      }
      return prev;
    });
  };

  const handleLineupCompletionChange = (isComplete: boolean) => {
    setIsVersoCompleted(isComplete);
  };

  const handleFloatingMiniCraquesClick = () => {
    playPageFlip();
    setCurrentPage('minicraques');
    setIsHeaderVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFloatingTimeClick = () => {
    playPageFlip();
    setCurrentPage('back');
    setIsHeaderVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFloatingBancadaClick = () => {
    playPageFlip();
    setCurrentPage('bancada');
    setIsHeaderVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFloatingAlbumClick = () => {
    playPageFlip();
    setCurrentPage('album');
    setIsHeaderVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFloatingAbrirClick = () => {
    playPageFlip();
    setIsHeaderVisible(false);
    if (currentPage === 'back' || currentPage === 'achievements' || currentPage === 'minicraques' || currentPage === 'bancada' || currentPage === 'ranking') {
      setCurrentPage('album');
      setAlbumPageIndex(1);
    }
    setTimeout(() => {
      const el = document.getElementById('pack-manager-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Clear state and start fresh
  const executeResetProgress = () => {
    setUserStickers([]);
    setCelebratedPage1(false);
    setCelebratedPage2(false);
    setCelebratedPage3(false);
    setCelebratedPage4(false);
    setIsVersoCompleted(false);
    setShowCelebrationModal(false);
    setShowFullCompletionModal(false);
    setCelebrationPageName(null);
    setSpecialStickerAwarded(null);
    try {
      localStorage.removeItem('cepe_dream_team_lineup_v2');
      localStorage.removeItem('cepe_dream_team_formation_v2');
      localStorage.removeItem('cepe_dream_team_coach_id_v2');
      localStorage.setItem('cepe_celebrated_page1', 'false');
      localStorage.setItem('cepe_celebrated_page2', 'false');
      localStorage.setItem('cepe_celebrated_page3', 'false');
      localStorage.setItem('cepe_celebrated_page4', 'false');
      localStorage.removeItem('cepe_has_celebrated_full_completion_v1');
      localStorage.removeItem('cepe_album_rules_popup_shown');
      sessionStorage.removeItem('cepe_album_rules_popup_shown');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (_) {}
    setCurrentPage('cover');
    setEntered(false);
    setShowResetConfirm(false);
    playPageFlip();
  };

  const handleResetProgress = () => {
    setShowResetConfirm(true);
  };

  // Page completion checker effects inside App.tsx
  const isPage1CompletedNow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  const isPage2CompletedNow = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  const isPage3CompletedNow = [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35].every(idx => {
    return userStickers.some(u => u.status === 'glued' && u.slotId === `BRA_${idx}`);
  });

  useEffect(() => {
    if (!initialized) return;

    if (isPage1CompletedNow && !celebratedPage1) {
      setCelebratedPage1(true);
      try {
        localStorage.setItem('cepe_celebrated_page1', 'true');
      } catch (_) {}
      
      const spec = STICKERS.find(s => s.id === 201);
      if (spec) {
        setSpecialStickerAwarded(spec);
        setUserStickers(prev => {
          const hasIt = prev.some(u => u.stickerId === 201);
          let next = [...prev];
          if (!hasIt) {
            next.push({ stickerId: 201, status: 'glued', slotId: 'SPC_1' });
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

      const spec = STICKERS.find(s => s.id === 202);
      if (spec) {
        setSpecialStickerAwarded(spec);
        setUserStickers(prev => {
          const hasIt = prev.some(u => u.stickerId === 202);
          if (hasIt) return prev;
          return [...prev, { stickerId: 202, status: 'glued', slotId: 'SPC_2' }];
        });
      }
      setCelebrationPageName('reservas');
      setShowCelebrationModal(true);
      playGoalCrowd();
    }

    if (isPage3CompletedNow && !celebratedPage3) {
      setCelebratedPage3(true);
      try {
        localStorage.setItem('cepe_celebrated_page3', 'true');
      } catch (_) {}

      const spec = STICKERS.find(s => s.id === 203);
      if (spec) {
        setSpecialStickerAwarded(spec);
        setUserStickers(prev => {
          const hasIt = prev.some(u => u.stickerId === 203);
          if (hasIt) return prev;
          return [...prev, { stickerId: 203, status: 'glued', slotId: 'SPC_3' }];
        });
      }
      setCelebrationPageName('auxiliares');
      setShowCelebrationModal(true);
      playGoalCrowd();
    }

    if (isVersoCompleted && !celebratedPage4) {
      setCelebratedPage4(true);
      try {
        localStorage.setItem('cepe_celebrated_page4', 'true');
      } catch (_) {}

      const spec = STICKERS.find(s => s.id === 204);
      if (spec) {
        setSpecialStickerAwarded(spec);
        setUserStickers(prev => {
          const hasIt = prev.some(u => u.stickerId === 204);
          if (hasIt) return prev;
          return [...prev, { stickerId: 204, status: 'glued', slotId: 'SPC_4' }];
        });
      }
      setCelebrationPageName('verso');
      setShowCelebrationModal(true);
      playGoalCrowd();
    }
  }, [
    isPage1CompletedNow, 
    isPage2CompletedNow, 
    isPage3CompletedNow, 
    isVersoCompleted, 
    celebratedPage1, 
    celebratedPage2, 
    celebratedPage3, 
    celebratedPage4, 
    initialized
  ]);

  // High-reliability dynamic reconstitution synchronization for SPC stickers:
  // Ensures that once a category or page has been unlocked (indicated by state & localStorage flags),
  // those special cards will always persist as glued in the player's collection!
  useEffect(() => {
    if (!initialized) return;

    let changed = false;
    setUserStickers(prev => {
      let next = [...prev];
      const spcChecks = [
        { completed: celebratedPage1, id: 201, slot: 'SPC_1' },
        { completed: celebratedPage2, id: 202, slot: 'SPC_2' },
        { completed: celebratedPage3, id: 203, slot: 'SPC_3' },
        { completed: celebratedPage4, id: 204, slot: 'SPC_4' },
      ];

      spcChecks.forEach(check => {
        if (check.completed) {
          const hasItGlued = next.some(u => u.stickerId === check.id && u.status === 'glued');
          if (!hasItGlued) {
            next = next.filter(u => u.stickerId !== check.id);
            next.push({ stickerId: check.id, status: 'glued', slotId: check.slot });
            changed = true;
          }
        }
      });

      return changed ? next : prev;
    });
  }, [celebratedPage1, celebratedPage2, celebratedPage3, celebratedPage4, initialized]);

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
              const spec = STICKERS.find(s => s.id === 201) || STICKERS[0];
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
  const isProgressSlot = (slotId?: string): boolean => {
    if (!slotId) return false;
    if (slotId.startsWith("BRA_")) {
      return true;
    }
    return ["EXT_0", "EXT_1", "EXT_2"].includes(slotId);
  };

  const gluedStickerIds = userStickers
    .filter(u => u.status === 'glued' && isProgressSlot(u.slotId))
    .map(u => u.stickerId);

  const UNIQUE_GLUED_COUNT = new Set(gluedStickerIds).size;
  const TOTAL_STICKERS_COUNT = 243;

  // Trigger full album completion celebration popup reward when percentage is 100%
  useEffect(() => {
    if (!initialized) return;
    if (UNIQUE_GLUED_COUNT >= TOTAL_STICKERS_COUNT) {
      const alreadyAwarded = localStorage.getItem('cepe_has_celebrated_full_completion_v1') === 'true';
      if (!alreadyAwarded) {
        setShowFullCompletionModal(true);
        localStorage.setItem('cepe_has_celebrated_full_completion_v1', 'true');
        
        // Auto-glue/award SPC_5 (Sticker 205) to the user's stickers!
        setUserStickers(prev => {
          if (!prev.some(u => u.stickerId === 205)) {
            return [...prev, { stickerId: 205, status: 'glued', slotId: 'SPC_5' }];
          }
          return prev;
        });
        
        // Success audio chime
        try {
          playSuccess();
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

  const benchStickers = STICKERS.filter(s => ![201, 202, 203, 204, 205].includes(s.id) && benchMap.has(s.id)).map(s => ({
    sticker: s,
    count: benchMap.get(s.id) || 0
  }));

  // Compute vaulted list with counts (only items that exist and have status 'vaulted')
  const vaultedMap = new Map<number, number>();
  userStickers.forEach(u => {
    if (u.status === 'vaulted') {
      vaultedMap.set(u.stickerId, (vaultedMap.get(u.stickerId) || 0) + 1);
    }
  });

  const vaultedStickers = STICKERS.filter(s => ![201, 202, 203, 204, 205].includes(s.id) && vaultedMap.has(s.id)).map(s => ({
    sticker: s,
    count: vaultedMap.get(s.id) || 0
  }));

  if (!entered) {
    return (
      <>
        {isEnteringLoading ? (
          <LoadingScreen
            onComplete={() => {
              setIsEnteringLoading(false);
              setIsWatchingIntro(true);
            }}
            coverBgImage={coverBgImage}
            brandImage={brandImage}
          />
        ) : isWatchingIntro ? (
          <IntroVideoScreen
            onComplete={() => {
              setIsWatchingIntro(false);
              setEntered(true);
              const alreadyShown = sessionStorage.getItem('cepe_album_rules_popup_shown');
              if (!alreadyShown) {
                setShowRulesPopup(true);
                sessionStorage.setItem('cepe_album_rules_popup_shown', 'true');
              }
            }}
          />
        ) : (
          <EntryPage
            onEnter={() => setIsEnteringLoading(true)}
            brandImage={brandImage}
            coverBgImage={coverBgImage}
            titleImage={titleImage}
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
        musicOn={musicOn}
        onToggleMusic={handleToggleMusic}
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
          activeRankName={activeRankName}
          onQuickSave={handleQuickSave}
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
            isVersoCompleted={isVersoCompleted}
          />
        )}
        {currentPage === 'bancada' && (
          <BancadaView
            benchStickers={benchStickers}
            vaultedStickers={vaultedStickers}
            userStickers={userStickers}
            onGlueSticker={handleGlueSticker}
            onStoreRepeated={handleStoreRepeatedInVault}
            onRetrieveFromVault={handleRetrieveFromVault}
            onGoToAlbum={(sticker) => {
              playPageFlip();
              if (sticker) {
                const targetPageIndex = getPageIndexForSlotId(sticker.slotId);
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
            onLineupCompletionChange={handleLineupCompletionChange}
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

        {currentPage === 'ranking' && (
          <AlbumRanking
            userStickers={userStickers}
            gluedCount={UNIQUE_GLUED_COUNT}
            totalCount={TOTAL_STICKERS_COUNT}
            onBack={() => {
              playPageFlip();
              setCurrentPage('album');
            }}
            onLoadProgress={(loadedStickers) => {
              setUserStickers(loadedStickers);
            }}
          />
        )}

        {/* Dynamic Pack Manager: Available in Cover or Album layout for rich game mechanics */}
        {currentPage !== 'back' && currentPage !== 'achievements' && currentPage !== 'ranking' && (
          <div className="w-full" id="pack-manager-section">
            <PackManager
              onAddStickers={handleAddStickers}
              gluedStickerIds={gluedStickerIds}
            />
          </div>
        )}

      </main>

      {/* Persistent mini-credits footer */}
      <footer style={{ backgroundColor: '#000000', height: '250px', paddingTop: '90px' }} className="py-8 text-center text-slate-950 border-t-4 border-slate-950 font-mono tracking-widest font-bold uppercase flex flex-col items-center gap-3">
        <img
          src={brandImage || '/assets/images/regenerated_image_1779654679664.png'}
          alt="CEPE"
          className="h-12 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
        <div className="text-[10px]" style={{ color: '#ffffff', fontSize: '7px', paddingLeft: '0px', paddingBottom: '0px', fontFamily: 'monospace', marginLeft: '0px', marginBottom: '0px', marginRight: '0px', marginTop: '40px' }}>
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

      {/* ⚠️ CONFIRMAÇÃO DE RESET DO PROGRESSO DO JOGO ⚠️ */}
      {showResetConfirm && (
        <div key="reset-confirmation-popup" className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[300] flex items-center justify-center p-4 overflow-y-auto select-none animate-fade-in font-sans">
          <div 
            className="w-full border-6 border-slate-950 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center relative flex flex-col items-center justify-center gap-6 animate-scale-in"
            style={{ width: '560px', maxWidth: '100%', backgroundColor: '#2f0037' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-lg transform -rotate-6 overflow-hidden animate-bounce" style={{ backgroundColor: '#a619b4' }}>
              <img src={ResetImage} alt="Recomeçar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>

            <div className="space-y-3">
              <h2 className="font-sans uppercase tracking-tight text-white drop-shadow-md" style={{ fontWeight: 'bold', fontSize: '22px' }}>
                RECOMEÇAR ÁLBUM DO ZERO?
              </h2>
              <p className="text-slate-300 font-medium leading-relaxed" style={{ fontSize: '12px', width: '400px', maxWidth: '100%' }}>
                Você tem certeza de que deseja apagar todo o seu progresso no jogo, suas figurinhas coladas e conquistas?
              </p>
              <p className="uppercase tracking-wider" style={{ color: '#b605f9', fontSize: '11px', fontWeight: 'bold' }}>
                Esta ação é irreversível e você retornará para a tela inicial!
              </p>
            </div>

            {/* Action buttons with absolute style precision */}
            <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
              <button
                onClick={executeResetProgress}
                style={{ backgroundColor: '#710b98', color: '#ff00b8' }}
                className="flex-1 py-3 px-6 font-black rounded-full border-3 border-slate-950 shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider uppercase transition-all duration-150 active:translate-y-0.5 active:shadow-none cursor-pointer text-center hover:brightness-110 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Sim, zerar jogo
              </button>
              
              <button
                onClick={() => {
                  playPageFlip();
                  setShowResetConfirm(false);
                }}
                style={{ backgroundColor: '#d58307' }}
                className="flex-1 py-3 px-6 text-white font-black rounded-full border-3 border-slate-950 shadow-[4px_4px_0_rgba(0,0,0,1)] tracking-wider uppercase transition-all duration-150 active:translate-y-0.5 active:shadow-none cursor-pointer text-center hover:brightness-110 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Não, continuar jogando
              </button>
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
                   <img src={"/assets/images/regenerated_image_1780114641990.png"} 
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('goool_image.png')) {
                          target.src = "/assets/images/goool_image.png";
                        } else if (target.src.includes('goool_image.png')) {
                          target.src = "/assets/images/goool_image.png";
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
                      {celebrationPageName === 'titulares' ? 'Convocados 1' : celebrationPageName === 'reservas' ? 'Convocados 2' : celebrationPageName === 'verso' ? 'Time dos Sonhos' : 'Convocados 3'}
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
                src="/assets/images/Cbranco.png" 
                alt="GOOOL!!!" 
                className="object-contain mx-auto drop-shadow-md"
                style={{ height: '90px', paddingBottom: '0px', paddingTop: '0px', marginLeft: '0px', marginTop: '0px', marginBottom: '-56px', width: '900px' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Glowing Showcase of Cromo Lendário SPC_5 - CAMPEÃO SUPREMO */}
            <div className="relative p-1 bg-gradient-to-tr from-yellow-500 via-amber-300 to-yellow-600 rounded-[20px] shadow-2xl scale-75 my-0.5">
              <div className="absolute -inset-1 bg-yellow-400 rounded-[24px] blur-xs opacity-70 animate-pulse" />
              <StickerItem
                sticker={STICKERS.find(s => s.id === 205)!}
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

      {/* 📜 POP-UP FLUTUANTE DE REGRAS 📜 */}
      {showRulesPopup && (
        <div 
          onClick={() => {
            playPageFlip();
            setShowRulesPopup(false);
          }}
          className="fixed inset-0 bg-[#0c0316]/90 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto animate-fade-in cursor-pointer select-none"
        >
          <div 
            className="relative w-full max-w-xl md:max-w-2xl bg-slate-950 border-4 border-slate-950 rounded-[32px] overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
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
                setShowRulesPopup(false);
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

      {/* FLOATING NAVIGATION PANEL ON SCROLL */}
      {entered && scrollY > 120 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col items-end gap-3 select-none">
          {/* Album Button Above the dock */}
          <button
            onClick={handleFloatingAlbumClick}
            style={{ backgroundColor: '#712eab', marginBottom: '0px', marginRight: '45px' }}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 cursor-pointer transition-all active:scale-90 flex items-center justify-center hover:brightness-110 shadow-lg ${currentPage === 'album' ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' : ''}`}
            title="Voltar para o Álbum"
          >
            <span className="font-sans font-black text-[10px] sm:text-xs tracking-wider text-white select-none">ÁLBUM</span>
          </button>

          {/* Dock content */}
          <div 
            className="flex items-center gap-2 sm:gap-3 bg-black/25 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 animate-fade-in"
          >
            {/* Mini Craques Button */}
            <button
              onClick={handleFloatingMiniCraquesClick}
              style={{ backgroundColor: '#e21b8e' }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 cursor-pointer transition-all active:scale-90 flex items-center justify-center hover:brightness-110 shadow-lg ${currentPage === 'minicraques' ? 'ring-2 ring-pink-500 ring-offset-2 ring-offset-slate-900' : ''}`}
              title="Mini Craques"
            >
              <img 
                src={marcaMinicraques} 
                alt="Mini Craques" 
                className="object-contain select-none h-6 sm:h-7 w-auto active:scale-95 transition-transform"
                referrerPolicy="no-referrer"
              />
            </button>
   
            {/* ABRIR PACKET Button */}
            <button
              onClick={handleFloatingAbrirClick}
              style={{ backgroundColor: '#ff8400' }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 cursor-pointer transition-all active:scale-90 flex items-center justify-center hover:brightness-110 shadow-lg"
              title="Obter Figurinhas / Abrir Pacote"
            >
              <img 
                src="/assets/images/ABRIR2.png" 
                alt="Abrir Pacote" 
                className="object-contain select-none h-7 sm:h-8 w-auto active:scale-95 transition-transform"
                referrerPolicy="no-referrer"
              />
            </button>
   
            {/* BANCADA Button */}
            <button
              onClick={handleFloatingBancadaClick}
              style={{ backgroundColor: '#af1d92' }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 cursor-pointer transition-all active:scale-90 flex items-center justify-center hover:brightness-110 shadow-lg ${currentPage === 'bancada' ? 'ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-slate-900' : ''}`}
              title="Minha Bancada"
            >
              <img 
                src="/assets/images/Ativo 4.png" 
                alt="Minha Bancada" 
                className="object-contain select-none h-6 sm:h-7 w-auto active:scale-95 transition-transform"
                referrerPolicy="no-referrer"
              />
            </button>
  
            {/* TIME Button */}
            <button
              onClick={handleFloatingTimeClick}
              style={{ backgroundColor: '#72a33d' }}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 cursor-pointer transition-all active:scale-90 flex items-center justify-center hover:brightness-110 shadow-lg ${currentPage === 'back' ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-slate-900' : ''}`}
              title="Time dos Sonhos"
            >
              <span className="font-sans font-black text-[10px] sm:text-xs tracking-wider text-white select-none">TIME</span>
            </button>

            {/* Quick Save Button in Dock */}
            <button
              onClick={handleQuickSave}
              style={{ backgroundColor: '#10b981' }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-white/20 cursor-pointer transition-all active:scale-90 flex flex-col items-center justify-center hover:brightness-110 shadow-lg"
              title="Salvar Progresso Instantaneamente no Ranking"
            >
              <Save className="w-4 h-4 text-white animate-pulse" />
              <span className="text-[7.5px] text-white font-black uppercase mt-0.5 tracking-tight">SALVAR</span>
            </button>
          </div>
        </div>
      )}

      {/* 💾 MODAL DE REGISTRO DE NICKNAME (QUICK SAVE) 💾 */}
      {isRegisterModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            playPageFlip();
            setIsRegisterModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-sm bg-white text-slate-950 border-4 border-slate-950 rounded-[32px] p-6 shadow-[8px_8px_0_rgba(0,0,0,1)] animate-scale-in relative select-none"
            onClick={(e) => e.stopPropagation()}
            id="register-ranking-modal"
          >
            {/* Close button */}
            <button
              onClick={() => {
                playPageFlip();
                setIsRegisterModalOpen(false);
              }}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 border-2 border-slate-950 rounded-full text-slate-950 cursor-pointer transition-all active:scale-90"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>

            <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-slate-200">
              <Save className="w-6 h-6 text-[#af1d92]" />
              <h2 className="text-sm font-sans font-black uppercase tracking-wider text-slate-950">Criar Perfil de Ranking</h2>
            </div>

            <p className="text-[11px] text-slate-600 font-bold mb-4 leading-relaxed uppercase">
              Para registrar seus <span className="text-[#af1d92] font-black">{userStickers.filter(s => s.glued).length} pontos</span> no ranking, escolha um apelido exclusivo!
            </p>

            <form onSubmit={handleRegisterAndSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] text-slate-700 font-black uppercase tracking-wider mb-1.5">
                  DIGITE SEU APELIDO / NOME:
                </label>
                <input
                  type="text"
                  value={registerNickname}
                  onChange={(e) => setRegisterNickname(e.target.value.toUpperCase())}
                  placeholder="EX: JOGADOR..."
                  maxLength={15}
                  required
                  className="w-full bg-slate-50 border-4 border-slate-950 text-slate-950 text-xs font-black uppercase p-3 rounded-xl tracking-widest outline-none focus:bg-white transition-colors placeholder:text-slate-400 shadow-inner"
                />
              </div>

              <button
                type="submit"
                style={{ backgroundColor: '#ff8400' }}
                className="w-full py-3 hover:bg-[#e06c00] text-white hover:text-white font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all active:scale-95 border-4 border-slate-950 flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none"
              >
                <Save className="w-4 h-4 stroke-[3px]" />
                Registrar & Salvar Agora
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔔 NOTIFICAÇÃO FLUTUANTE DE SALVAMENTO COM SUCESSO 🔔 */}
      {isQuickSaveNotificationOpen && saveSuccessNotification && (
        <div 
          className="fixed bottom-24 right-4 sm:bottom-28 sm:right-6 z-[200] max-w-xs w-full bg-[#10b981] text-white border-4 border-slate-950 rounded-[24px] p-4 shadow-[6px_6px_0_rgba(0,0,0,1)] animate-scale-in"
          id="quick-save-success-toast"
        >
          <div className="flex items-start gap-2.5">
            <div className="bg-white border-2 border-slate-950 text-[#10b981] rounded-full p-1.5 flex items-center justify-center shrink-0">
              <Save className="w-4 h-4 stroke-[3px]" />
            </div>
            <div className="flex-1 flex flex-col select-none">
              <span className="text-[9px] text-emerald-100 font-black uppercase tracking-widest">
                PROGRESSO SALVO!
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-white mt-0.5">
                {saveSuccessNotification.name}
              </span>
              <span className="text-[8px] text-emerald-100 mt-1 uppercase font-bold">
                RANKING ATUALIZADO COM SUCESSO!
              </span>
              <div className="mt-2 bg-slate-950/20 rounded-lg p-1.5 border border-white/10 flex items-center justify-between">
                <span className="text-[8px] font-bold text-emerald-50 uppercase">PLAY_ID RECONECTAR:</span>
                <span className="text-[10px] font-black tracking-widest text-yellow-300">{saveSuccessNotification.password}</span>
              </div>
            </div>
            <button
              onClick={() => setIsQuickSaveNotificationOpen(false)}
              className="text-white hover:text-slate-950 p-1 rounded-full hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
