import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trophy, Crown, Save, Key, RefreshCw, ShieldAlert, Check, User, Award, ChevronDown, Zap, LogOut } from 'lucide-react';
import { playPageFlip, playSuccess, playRefuse, playGlue } from '../audio';
import { UserSticker, Sticker } from '../types';
import { STICKERS } from '../data';

interface RankingEntry {
  name: string;
  password: string; // 3-digit code e.g. "482"
  score: number; // number of unique glued stickers
  userStickers: string; // JSON string of UserSticker[]
  timestamp: number;
  isMock?: boolean;
}

interface AlbumRankingProps {
  userStickers: UserSticker[];
  gluedCount: number;
  totalCount: number;
  onBack: () => void;
  onLoadProgress: (loadedStickers: UserSticker[]) => void;
}

// Initial mock participants
const DEFAULT_MOCK_ENTRIES: RankingEntry[] = [
  { name: 'SONIC_91', password: '191', score: 238, userStickers: '[]', timestamp: Date.now() - 86400000 * 3, isMock: true },
  { name: 'RENATO_ADM', password: '333', score: 215, userStickers: '[]', timestamp: Date.now() - 86400000 * 2, isMock: true },
  { name: 'ALEX_KIDD', password: '148', score: 185, userStickers: '[]', timestamp: Date.now() - 86400000 * 5, isMock: true },
  { name: 'SHINOBI_16', password: '777', score: 142, userStickers: '[]', timestamp: Date.now() - 86400000 * 1, isMock: true },
  { name: 'GOLDEN_AXE', password: '412', score: 108, userStickers: '[]', timestamp: Date.now() - 86400000 * 10, isMock: true },
  { name: 'MASTER_BOY', password: '520', score: 55, userStickers: '[]', timestamp: Date.now() - 86400000 * 12, isMock: true },
];

export const AVATAR_COLORS = [
  { id: 1, name: 'Amarelo', bg: 'bg-[#FFDF1B]', text: 'text-slate-950' },
  { id: 2, name: 'Roxo', bg: 'bg-[#af1d92]', text: 'text-white' },
  { id: 3, name: 'Verde Limão', bg: 'bg-[#CCFF00]', text: 'text-slate-950' },
  { id: 4, name: 'Laranja', bg: 'bg-[#ff5722]', text: 'text-white' },
  { id: 5, name: 'Ciano', bg: 'bg-[#00bcd4]', text: 'text-slate-950' },
  { id: 6, name: 'Azul', bg: 'bg-[#3f51b5]', text: 'text-white' },
  { id: 7, name: 'Rosa', bg: 'bg-[#e91e63]', text: 'text-white' },
  { id: 8, name: 'Vermelho', bg: 'bg-[#f44336]', text: 'text-white' },
  { id: 9, name: 'Verde', bg: 'bg-[#10b981]', text: 'text-white' },
];

export default function AlbumRanking({
  userStickers,
  gluedCount,
  totalCount,
  onBack,
  onLoadProgress,
}: AlbumRankingProps) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [nickname, setNickname] = useState(localStorage.getItem('cepe_active_rank_name') || '');
  const [saveSuccess, setSaveSuccess] = useState<{ name: string; password: string } | null>(null);
  
  // Active player state
  const [activeName, setActiveName] = useState(localStorage.getItem('cepe_active_rank_name') || '');
  const [activePassword, setActivePassword] = useState(localStorage.getItem('cepe_active_rank_password') || '');

  // Load input state
  const [loadPassword, setLoadPassword] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loadSuccessMsg, setLoadSuccessMsg] = useState('');
  
  // Custom sticker avatar state
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);

  // Sync avatar ID with active player record
  useEffect(() => {
    if (activeName && entries.length > 0) {
      const activeEntry = entries.find(e => e.name === activeName && !e.isMock);
      if (activeEntry) {
        try {
          const stickers = JSON.parse(activeEntry.userStickers);
          if (Array.isArray(stickers)) {
            const av = stickers.find((s: any) => s.stickerId === -999);
            if (av && av.slotId) {
              setSelectedAvatarId(parseInt(av.slotId));
            }
          }
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [activeName, entries]);

  // Fetch from server helper
  const fetchRankingsFromServer = () => {
    fetch('/api/rankings')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEntries(data);
          localStorage.setItem('cepe_album_rankings_v2', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.warn('Deferred database fetch, loading from offline storage:', err);
      });
  };

  // Loaded rankings from localStorage/DB on mount
  useEffect(() => {
    const handleActiveChanged = () => {
      const name = localStorage.getItem('cepe_active_rank_name') || '';
      const pass = localStorage.getItem('cepe_active_rank_password') || '';
      setActiveName(name);
      setActivePassword(pass);
      if (name) {
        setNickname(name);
      }
    };
    window.addEventListener('cepe_active_player_changed', handleActiveChanged);
    
    const stored = localStorage.getItem('cepe_album_rankings_v2');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setEntries(parsed);
        }
      } catch (e) {
        console.error('Error loading rankings', e);
      }
    } else {
      // Set default mocks if nothing is stored yet
      setEntries(DEFAULT_MOCK_ENTRIES);
      localStorage.setItem('cepe_album_rankings_v2', JSON.stringify(DEFAULT_MOCK_ENTRIES));
    }

    // Fetch database rankings
    fetchRankingsFromServer();
    
    return () => {
      window.removeEventListener('cepe_active_player_changed', handleActiveChanged);
    };
  }, []);

  const handleDisconnect = () => {
    playPageFlip();
    localStorage.removeItem('cepe_active_rank_name');
    localStorage.removeItem('cepe_active_rank_password');
    setActiveName('');
    setActivePassword('');
    setNickname('');
    window.dispatchEvent(new Event('cepe_active_player_changed'));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedName = nickname.trim().toUpperCase().slice(0, 15);
    if (!formattedName) {
      playRefuse();
      return;
    }

    // Check if name already has a password in entries to update, or generate a new one
    let targetPassword = '';
    const existing = entries.find(entry => entry.name === formattedName && !entry.isMock);
    
    if (existing) {
      targetPassword = existing.password;
    } else {
      // Generate unique 3-digit password
      let unique = false;
      let attempts = 0;
      while (!unique && attempts < 100) {
        const num = Math.floor(Math.random() * 900) + 100; // 100 to 999
        const code = String(num);
        if (!entries.some(entry => entry.password === code)) {
          targetPassword = code;
          unique = true;
        }
        attempts++;
      }
      if (!targetPassword) {
        targetPassword = String(Math.floor(Math.random() * 900) + 100);
      }
    }

    // Build userStickers array with avatar metadata if set
    let preparedStickers = [...userStickers];
    const avatarToSave = selectedAvatarId || 1;
    // Remove any prior avatar metadata item
    preparedStickers = preparedStickers.filter(s => s.stickerId !== -999);
    preparedStickers.push({
      stickerId: -999,
      status: 'glued',
      slotId: String(avatarToSave)
    });

    // Build the new/updated entry
    const newEntry: RankingEntry = {
      name: formattedName,
      password: targetPassword,
      score: gluedCount,
      userStickers: JSON.stringify(preparedStickers),
      timestamp: Date.now(),
    };

    // Filter out any existing entries with the same name (so we only keep their highest or most recent)
    const updatedEntries = entries.filter(
      entry => !(entry.name === formattedName && !entry.isMock)
    );
    
    const finalEntries = [...updatedEntries, newEntry].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.timestamp - a.timestamp; // tie-breaker: older/newer
    });

    setEntries(finalEntries);
    localStorage.setItem('cepe_album_rankings_v2', JSON.stringify(finalEntries));
    
    // Store active player credentials
    localStorage.setItem('cepe_active_rank_name', formattedName);
    localStorage.setItem('cepe_active_rank_password', targetPassword);

    // Sync with DB
    fetch('/api/rankings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEntry)
    })
    .then(res => res.json())
    .then(data => {
      console.log('Saved to Hostinger MySQL:', data);
      fetchRankingsFromServer(); // Refresh entries to make sure all is updated
    })
    .catch(err => {
      console.warn('Offline backup saved, DB connection deferred:', err);
    });
    
    // Dispatch a storage event or a custom event to notify App.tsx of changes
    window.dispatchEvent(new Event('cepe_active_player_changed'));
    
    playSuccess();
    setSaveSuccess({ name: formattedName, password: targetPassword });
    setNickname('');
  };

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = loadPassword.trim();
    if (!cleanPassword || cleanPassword.length !== 3) {
      playRefuse();
      setLoadError('INSIRA UM PASSWORD DE 3 NÚMEROS!');
      setLoadSuccessMsg('');
      return;
    }

    const found = entries.find(entry => entry.password === cleanPassword);
    if (!found) {
      playRefuse();
      setLoadError('PASSWORD NÃO ENCONTRADO!');
      setLoadSuccessMsg('');
      return;
    }

    if (found.isMock) {
      playRefuse();
      setLoadError('PASSWORD DE TESTE NÃO CARREGA DADOS REAIS!');
      setLoadSuccessMsg('');
      return;
    }

    try {
      const stickers: UserSticker[] = JSON.parse(found.userStickers);
      if (Array.isArray(stickers)) {
        // Extract and set custom avatar choice
        const avItem = stickers.find(s => s.stickerId === -999);
        if (avItem && avItem.slotId) {
          const avId = parseInt(avItem.slotId);
          setSelectedAvatarId(avId);
        } else {
          setSelectedAvatarId(null);
        }

        // Clean out the avatar metadata so it does not end up as a real album sticker
        const cleanStickers = stickers.filter(s => s.stickerId !== -999);
        onLoadProgress(cleanStickers);
        
        // Store active player credentials
        localStorage.setItem('cepe_active_rank_name', found.name);
        localStorage.setItem('cepe_active_rank_password', found.password);
        
        // Notify App.tsx of changes
        window.dispatchEvent(new Event('cepe_active_player_changed'));
        
        playGlue();
        setLoadSuccessMsg(`PROGRESSO DE "${found.name}" CARREGADO COM SUCESSO!`);
        setLoadError('');
        setLoadPassword('');
        // Auto-close after 3 seconds
        setTimeout(() => {
          setLoadSuccessMsg('');
        }, 3000);
      } else {
        throw new Error('Invalid data');
      }
    } catch (err) {
      playRefuse();
      setLoadError('ERRO AO PROCESSAR DADOS DE SALVAMENTO!');
    }
  };

  // Clear user entries only (keep mocks)
  const handleResetRankings = () => {
    if (window.confirm('Deseja redefinir todo o Ranking para os valores iniciais de teste?')) {
      playPageFlip();
      setEntries(DEFAULT_MOCK_ENTRIES);
      localStorage.setItem('cepe_album_rankings_v2', JSON.stringify(DEFAULT_MOCK_ENTRIES));
      localStorage.removeItem('cepe_active_rank_name');
      localStorage.removeItem('cepe_active_rank_password');
      window.dispatchEvent(new Event('cepe_active_player_changed'));
      setSaveSuccess(null);
      setLoadSuccessMsg('');
      setLoadError('');
    }
  };

  // Deterministic mascot generator using the player name
  const getMascotSrc = (name: string, index: number) => {
    let hash = 0;
    const cleanName = (name || 'JOGADOR').trim().toUpperCase();
    for (let i = 0; i < cleanName.length; i++) {
      hash += cleanName.charCodeAt(i);
    }
    const id = (hash % 216) + 1;
    return `/assets/images/minicraque(${id}).png`;
  };

  // Render a beautiful circle avatar with the selected background color and first letter of the name
  const renderPlayerAvatar = (name: string, userStickersJson: string, index: number, sizeClass = "w-8 h-8 text-xs sm:text-sm") => {
    const cleanName = (name || 'CONVIDADO').trim().toUpperCase();
    const firstLetter = cleanName.charAt(0) || '?';

    let colorId = null;
    try {
      const stickers = JSON.parse(userStickersJson || '[]');
      if (Array.isArray(stickers)) {
        const avItem = stickers.find((s: any) => s.stickerId === -999);
        if (avItem && avItem.slotId) {
          colorId = parseInt(avItem.slotId);
        }
      }
    } catch (e) {
      // Ignore
    }

    if (colorId === null || isNaN(colorId)) {
      // Deterministic choice based on name hash
      let hash = 0;
      for (let i = 0; i < cleanName.length; i++) {
        hash += cleanName.charCodeAt(i);
      }
      colorId = (hash % AVATAR_COLORS.length) + 1;
    }

    const colorObj = AVATAR_COLORS.find(c => c.id === colorId) || AVATAR_COLORS[0];

    return (
      <div className={`shrink-0 ${sizeClass} rounded-full border-2 border-slate-950 flex items-center justify-center font-black ${colorObj.bg} ${colorObj.text} shadow-md select-none uppercase transition-all`}>
        {firstLetter}
      </div>
    );
  };

  // Extract avatar selected by player from their saved JSON string, fallback to deterministic mascot
  const getPlayerAvatarSrc = (name: string, userStickersJson: string, index: number) => {
    try {
      const stickers = JSON.parse(userStickersJson || '[]');
      if (Array.isArray(stickers)) {
        const avItem = stickers.find((s: any) => s.stickerId === -999);
        if (avItem && avItem.slotId) {
          const avId = parseInt(avItem.slotId);
          const foundSticker = STICKERS.find(s => s.id === avId);
          if (foundSticker) {
            return foundSticker.imagePath;
          }
        }
      }
    } catch (e) {
      // Ignore
    }
    return getMascotSrc(name, index);
  };

  const formatScore = (num: number) => {
    return num.toLocaleString('pt-BR');
  };

  // Calculations for Active Profile Card (Mockup 2)
  const currentLevel = Math.floor(gluedCount / 25);
  const pointsTillNext = 25 - (gluedCount % 25);
  const levelProgressPct = ((gluedCount % 25) / 25) * 100;

  const activeRankIndex = entries.findIndex(e => e.name === activeName && !e.isMock);
  const activeRankDisplay = activeRankIndex !== -1 ? `${activeRankIndex + 1}º` : '-';

  // Podium players
  const sortedList = [...entries].sort((a, b) => b.score - a.score);
  const firstPlace = sortedList[0] || { name: 'AwSle', score: 5466 };
  const secondPlace = sortedList[1] || { name: 'AwS MahDl', score: 5173 };
  const thirdPlace = sortedList[2] || { name: 'AndrSkv', score: 5172 };

  return (
    <div className="max-w-4xl mx-auto w-full my-2 sm:my-6 bg-[#af1d92] rounded-2xl sm:rounded-[32px] border-4 sm:border-[6px] border-slate-950 p-3 sm:p-10 animate-fade-in relative shadow-2xl">
      {/* Glossy top aesthetic overlay */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-white/5 rounded-t-[22px] sm:rounded-t-[26px] pointer-events-none z-0" />

      {/* Top Header Controls */}
      <div className="relative z-10 flex justify-between items-center w-full mb-4 pb-3 sm:mb-6 sm:pb-4 border-b border-white/10">
        <button
          onClick={() => {
            playPageFlip();
            onBack();
          }}
          className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#80009e] hover:bg-[#9c1abf] text-white font-bold rounded-full border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] sm:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 flex items-center gap-1.5 sm:gap-2 cursor-pointer uppercase text-[10px] sm:text-xs tracking-wider"
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3px]" />
          Voltar
        </button>

        <button
          onClick={handleResetRankings}
          className="p-2 sm:p-2.5 bg-black hover:bg-slate-800 text-white border-2 border-slate-950 rounded-full shadow-[2px_2px_0_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer active:scale-95"
          title="Resetar Ranking para o Padrão"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Main Column Grid */}
      <div className="relative z-10 flex flex-col gap-6">
        
        {/* ACTIVE USER PROFILE PANEL (Mockup 2 Style) */}
        <div className="bg-slate-950 text-white border-4 border-slate-950 rounded-[24px] p-4 sm:p-5 shadow-[6px_6px_0_rgba(0,0,0,1)] relative overflow-hidden">
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3 sm:gap-3.5">
              {/* Mascot Circle Avatar with Neon Ring */}
              <div className="relative shrink-0">
                {renderPlayerAvatar(
                  activeName || 'CONVIDADO',
                  entries.find(e => e.name === activeName && !e.isMock)?.userStickers || '[]',
                  0,
                  "w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-2xl border-2 border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.4)]"
                )}
                {activeName && (
                  <span className="absolute -bottom-1 -right-1 bg-[#CCFF00] text-slate-950 p-0.5 rounded-full border border-slate-950">
                    <Crown className="w-3 h-3 fill-slate-950" />
                  </span>
                )}
              </div>

              {/* Username & Status */}
              <div className="min-w-0">
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wider text-white truncate max-w-[180px] sm:max-w-none">
                  {activeName || 'CONVIDADO'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${activeName ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                    {activeName ? 'SESSÃO ATIVA' : 'PERFIL TEMPORÁRIO'}
                  </span>
                </div>
              </div>
            </div>

            {activeName && (
              <button
                onClick={handleDisconnect}
                className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 bg-[#80009e] hover:bg-[#9c1abf] text-white font-bold rounded-full border-2 border-slate-950 shadow-[2px_2px_0_rgba(0,0,0,1)] sm:shadow-[3px_3px_0_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer uppercase text-[10px] sm:text-xs tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3px]" />
                Sair
              </button>
            )}
          </div>

          {/* 3 Grid Stats Cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-4">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-2 sm:p-3 text-center flex flex-col justify-center items-center gap-1">
              <span className="text-[7.5px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block truncate w-full">
                Preenchimento
              </span>
              <strong className="text-xs sm:text-lg font-black text-white">
                {activeName ? `${Math.round((gluedCount / totalCount) * 100)}%` : '-'}
              </strong>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-2 sm:p-3 text-center flex flex-col justify-center items-center gap-1">
              <span className="text-[7.5px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block truncate w-full">
                Total de pts.
              </span>
              <strong className="text-xs sm:text-lg font-black text-[#CCFF00]">
                {activeName ? formatScore(gluedCount) : '-'}
              </strong>
            </div>

            <div className="bg-slate-900 border-2 border-slate-800 rounded-xl p-2 sm:p-3 text-center flex flex-col justify-center items-center gap-1">
              <span className="text-[7.5px] sm:text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block truncate w-full">
                Posição global
              </span>
              <strong className="text-xs sm:text-lg font-black text-white">
                {activeName ? activeRankDisplay : '-'}
              </strong>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800/60">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider mb-2 gap-1">
              <span>Nível {currentLevel}</span>
              <span className="text-right">
                {activeName ? `${pointsTillNext} pts para o Nível ${currentLevel + 1}` : 'Crie um perfil para subir de nível'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 border border-slate-800 rounded-full overflow-hidden p-[2px]">
              <div
                style={{ width: `${activeName ? levelProgressPct : 0}%` }}
                className="h-full bg-[#CCFF00] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(204,255,0,0.4)]"
              />
            </div>
          </div>
        </div>

        {/* INPUT CONTROL PANEL (Save and Restore Progresso) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* SAVE PROGRESS BOX */}
          <div className="bg-slate-950 text-white border-4 border-slate-950 rounded-[24px] p-5 shadow-[6px_6px_0_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Save className="w-4 h-4 text-orange-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                  Salvar meu progresso
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-4 leading-relaxed">
                Registre seu apelido de jogador para salvar seus cromos e disputar as primeiras posições.
              </p>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
                  Seu Apelido / Nome:
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.toUpperCase())}
                  placeholder="DIGITE SEU NOME..."
                  maxLength={15}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-bold uppercase p-3 rounded-xl tracking-wider outline-none focus:border-[#CCFF00] transition-colors placeholder:text-slate-600 shadow-inner text-center"
                />
              </div>

              {/* Circle Color Avatar Selector */}
              <div className="my-1 text-left">
                <label className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
                  Escolha a Cor do seu Avatar:
                </label>
                {(() => {
                  const currentInitial = (nickname || activeName || 'J').trim().toUpperCase().charAt(0) || 'J';
                  
                  return (
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[8px] text-[#FFDF1B] font-extrabold uppercase tracking-wider block mb-1.5">
                        🎨 Cores disponíveis para o seu círculo:
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1 px-0.5 scrollbar-thin scrollbar-thumb-slate-800">
                        {AVATAR_COLORS.map(colorObj => {
                          // If selectedAvatarId is null and this is the first color, or it matches colorObj.id
                          const isSelected = selectedAvatarId === colorObj.id || (selectedAvatarId === null && colorObj.id === 1);
                          return (
                            <button
                              key={colorObj.id}
                              type="button"
                              onClick={() => {
                                setSelectedAvatarId(colorObj.id);
                                playGlue();
                              }}
                              className={`relative shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center font-black ${colorObj.bg} ${colorObj.text} transition-all cursor-pointer ${
                                isSelected 
                                  ? 'border-[#CCFF00] scale-105 ring-2 ring-[#CCFF00]/40 shadow-[0_0_8px_rgba(204,255,0,0.6)]' 
                                  : 'border-slate-950 hover:scale-105'
                              }`}
                              title={colorObj.name}
                            >
                              <span className="text-sm uppercase font-black">{currentInitial}</span>
                              {isSelected && (
                                <span className="absolute -top-1 -right-1 bg-[#CCFF00] text-slate-950 p-[1px] rounded-full border border-slate-950">
                                  <Check className="w-2.5 h-2.5 stroke-[4px]" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/10"
              >
                <Save className="w-3.5 h-3.5" />
                Registrar Progresso
              </button>
            </form>

            {/* Success Password Dialog */}
            {saveSuccess && (
              <div className="mt-4 p-4 bg-amber-400 text-slate-950 rounded-xl text-center flex flex-col items-center gap-2 animate-scale-in">
                <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 text-slate-950">
                  <Check className="w-4 h-4 stroke-[3px]" /> REGISTRADO COM SUCESSO!
                </span>
                <div className="w-full bg-slate-950 text-white py-2 rounded-lg flex flex-col items-center justify-center gap-1 my-1">
                  <span className="text-[8px] text-slate-400 uppercase font-black">NOME DO COMPETIDOR</span>
                  <span className="text-xs font-black tracking-wider uppercase text-[#CCFF00]">{saveSuccess.name}</span>
                  
                  <span className="text-[8px] text-slate-400 uppercase font-black mt-2">SEU PASSWORD DE RECONEXÃO</span>
                  <span className="text-xl font-black text-white tracking-widest">
                    {saveSuccess.password}
                  </span>
                </div>
                <p className="text-[8.5px] text-slate-900 leading-normal uppercase font-black tracking-wider mt-1">
                  GUARDE ESTE CÓDIGO DE 3 NÚMEROS PARA RECONECTAR SEU PROGRESSO EM OUTRO DISPOSITIVO.
                </p>
                <button 
                  onClick={() => setSaveSuccess(null)}
                  className="mt-2 px-4 py-1.5 bg-slate-950 text-white hover:bg-slate-900 text-[9px] font-black uppercase rounded-lg cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>

          {/* RESTORE PROGRESS BOX */}
          <div className="bg-slate-950 text-white border-4 border-slate-950 rounded-[24px] p-5 shadow-[6px_6px_0_rgba(0,0,0,1)] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <Key className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-200">
                  Restaurar Progresso
                </h3>
              </div>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mb-4 leading-relaxed">
                Digite seu password de 3 números para recuperar seu álbum salvo e continuar colecionando.
              </p>
            </div>

            <form onSubmit={handleLoad} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1.5">
                  Password de 3 Números:
                </label>
                <input
                  type="text"
                  value={loadPassword}
                  onChange={(e) => setLoadPassword(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="EX: 333"
                  maxLength={3}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-center text-lg font-black tracking-widest p-2 rounded-xl outline-none focus:border-[#CCFF00] transition-colors placeholder:text-slate-800 shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#7b2e98] hover:bg-[#6c28aa] text-white font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10"
              >
                <Key className="w-3.5 h-3.5" />
                Carregar Progresso
              </button>

              {loadError && (
                <div className="p-2.5 bg-red-950/40 border border-red-900/60 rounded-xl flex items-center gap-2 text-red-400 text-[9px] font-black uppercase tracking-wider mt-1">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
              )}

              {loadSuccessMsg && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex items-center gap-2 text-emerald-400 text-[9px] font-black uppercase tracking-wider mt-1">
                  <Check className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>{loadSuccessMsg}</span>
                </div>
              )}
            </form>
          </div>

        </div>

        {/* CLASSIFICAÇÃO SECTION (Mockup 1 Podium + Leaderboard List) */}
        <div className="bg-slate-950 border-4 border-slate-950 rounded-[24px] overflow-hidden shadow-[6px_6px_0_rgba(0,0,0,1)] mt-4">
          
          {/* Section Header */}
          <div className="bg-slate-900 text-center py-4 border-b-4 border-slate-950">
            <h3 className="text-sm sm:text-base font-black tracking-widest text-white uppercase italic flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
              RANKING DOS COLECIONADORES
              <Zap className="w-4 h-4 text-[#CCFF00] fill-[#CCFF00]" />
            </h3>
          </div>

          {/* Podiums (Top 3 Players matching mockup 1) */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 px-2 sm:px-4 py-6 sm:py-8 bg-gradient-to-b from-slate-950/45 to-slate-950/90 relative border-b-4 border-slate-950">
            
            {/* 2nd Place (Left) */}
            <div className="flex flex-col items-center justify-end text-center mt-6">
              <div className="relative mb-2.5">
                {renderPlayerAvatar(
                  secondPlace.name,
                  entries.find(e => e.name === secondPlace.name)?.userStickers || '[]',
                  1,
                  "w-12 h-12 min-[400px]:w-16 min-[400px]:h-16 sm:w-20 sm:h-20 text-base min-[400px]:text-xl sm:text-3xl border-4 border-slate-400 shadow-lg"
                )}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-950 uppercase tracking-wider">
                  2ND
                </div>
              </div>
              <span className="text-[9px] sm:text-xs font-black text-slate-300 truncate w-full max-w-[65px] sm:max-w-[80px]">
                {secondPlace.name}
              </span>
              <span className="text-[8px] sm:text-[10px] bg-slate-800/80 text-slate-200 border border-slate-700 rounded-full px-1.5 sm:px-2 py-0.5 font-bold mt-1">
                {formatScore(secondPlace.score)} Pts
              </span>
            </div>

            {/* 1st Place (Center - Tallest) */}
            <div className="flex flex-col items-center justify-end text-center">
              <div className="relative mb-3.5">
                {/* Golden concentric ring glowing */}
                <div className="absolute inset-0 rounded-full border-2 border-yellow-400/30 animate-ping" />
                {renderPlayerAvatar(
                  firstPlace.name,
                  entries.find(e => e.name === firstPlace.name)?.userStickers || '[]',
                  0,
                  "w-16 h-16 min-[400px]:w-20 min-[400px]:h-20 sm:w-24 sm:h-24 text-2xl min-[400px]:text-3xl sm:text-4xl border-[5px] border-amber-400 shadow-2xl shadow-yellow-500/20"
                )}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-[8px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 rounded-full border border-slate-950 uppercase tracking-widest">
                  1ST
                </div>
              </div>
              <span className="text-[11px] sm:text-sm font-black text-amber-400 truncate w-full max-w-[85px] sm:max-w-[100px]">
                {firstPlace.name}
              </span>
              <span className="text-[9px] sm:text-xs bg-amber-400 text-slate-950 font-black rounded-full px-2 sm:px-2.5 py-0.5 mt-1 shadow-md shadow-amber-500/10">
                {formatScore(firstPlace.score)} Pts
              </span>
            </div>

            {/* 3rd Place (Right) */}
            <div className="flex flex-col items-center justify-end text-center mt-8">
              <div className="relative mb-2.5">
                {renderPlayerAvatar(
                  thirdPlace.name,
                  entries.find(e => e.name === thirdPlace.name)?.userStickers || '[]',
                  2,
                  "w-10 h-10 min-[400px]:w-14 min-[400px]:h-14 sm:w-18 sm:h-18 text-xs min-[400px]:text-lg sm:text-2xl border-4 border-amber-700 shadow-lg"
                )}
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[7px] sm:text-[8px] font-black px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-950 uppercase tracking-wider">
                  3RD
                </div>
              </div>
              <span className="text-[9px] sm:text-xs font-black text-slate-400 truncate w-full max-w-[65px] sm:max-w-[80px]">
                {thirdPlace.name}
              </span>
              <span className="text-[8px] sm:text-[10px] bg-slate-800/80 text-slate-300 border border-slate-700 rounded-full px-1.5 sm:px-2 py-0.5 font-bold mt-1">
                {formatScore(thirdPlace.score)} Pts
              </span>
            </div>

          </div>

          {/* Table Header Row */}
          <div className="bg-slate-900 px-3 sm:px-4 py-2.5 sm:py-3 text-[9px] sm:text-[11px] text-slate-400 font-extrabold uppercase tracking-wider flex justify-between items-center border-b-2 border-slate-950">
            <div className="flex items-center gap-2 sm:gap-4">
              <span>Posição</span>
              <span className="text-slate-700">|</span>
              <span>Nome de usuário</span>
            </div>
            <span className="text-right">Total de pts</span>
          </div>

          {/* List of Leaderboard Rows */}
          <div className="flex flex-col max-h-[380px] overflow-y-auto bg-transparent">
            {/* If user is active, render their highlighted state at index 0 as shown in the mockup */}
            {activeName && (
              <div className="bg-[#CCFF00] text-slate-950 px-3 sm:px-4 py-3 sm:py-3.5 border-b border-[#adff2f]/30 flex items-center justify-between gap-2 sm:gap-3 font-extrabold transition-all relative z-10 shadow-sm">
                <div className="flex items-center gap-2 sm:gap-4">
                  <span className="font-black text-slate-950 w-5 sm:w-6 text-center text-xs sm:text-sm">
                    0
                  </span>
                  <span className="text-slate-950/30">|</span>
                  {renderPlayerAvatar(
                    activeName,
                    entries.find(e => e.name === activeName && !e.isMock)?.userStickers || '[]',
                    0,
                    "w-7 h-7 sm:w-8 sm:h-8 text-[11px] sm:text-xs font-black"
                  )}
                  <span className="text-xs sm:text-sm font-black uppercase tracking-wide truncate max-w-[90px] min-[400px]:max-w-[150px] sm:max-w-none">
                    {activeName}
                  </span>
                </div>
                <span className="text-right text-xs sm:text-sm font-black text-slate-950">
                  {formatScore(gluedCount)}
                </span>
              </div>
            )}

            {/* List of other ranking participants */}
            {entries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 uppercase font-black text-[11px]">
                NENHUM COMPETIDOR CADASTRADO
              </div>
            ) : (
              entries.map((entry, idx) => {
                const rank = idx + 1;
                const isCurrentRowActive = entry.name === activeName && !entry.isMock;
                
                // If it's already rendered at the very top active spot, let's keep showing it but highlight or styled nicely
                const rowClass = isCurrentRowActive 
                  ? 'bg-[#CCFF00] hover:bg-[#CCFF00] text-slate-950 font-black border-b border-[#adff2f]/30' 
                  : 'bg-slate-950/45 hover:bg-slate-900/60 text-white border-b border-slate-950/30';

                return (
                  <div
                    key={`${entry.name}-${entry.password}-${idx}`}
                    className={`${rowClass} px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-3 font-semibold transition-all duration-150`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <span className={`w-5 sm:w-6 text-center font-black text-xs ${isCurrentRowActive ? 'text-slate-950' : 'text-slate-400'}`}>
                        {rank}
                      </span>
                      <span className={isCurrentRowActive ? 'text-slate-950/20' : 'text-slate-800'}>|</span>
                      {renderPlayerAvatar(
                        entry.name,
                        entry.userStickers,
                        idx,
                        "w-7 h-7 sm:w-8 sm:h-8 text-[11px] sm:text-xs font-black"
                      )}
                      
                      <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                        <span className={`text-xs sm:text-sm font-black uppercase tracking-wide truncate max-w-[80px] min-[400px]:max-w-[145px] sm:max-w-none ${isCurrentRowActive ? 'text-slate-950' : 'text-white'}`}>
                          {entry.name}
                        </span>
                        {!isCurrentRowActive && (
                          <span className="text-[7px] sm:text-[7.5px] bg-slate-800/80 border border-slate-700 text-slate-400 px-1 sm:px-1.5 py-0.5 rounded font-bold uppercase tracking-widest shrink-0">
                            {entry.isMock ? 'MOCK' : `ID: ${entry.password}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-right text-xs sm:text-sm font-black ${isCurrentRowActive ? 'text-slate-950' : 'text-white'}`}>
                      {formatScore(entry.score)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

      {/* Modern Compact Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] text-slate-500 font-extrabold tracking-widest uppercase">
        <span>© ÁLBUM CEPE 2026</span>
        <span className="animate-pulse text-purple-500">COLECIONE • GANHE • SUPERE!</span>
        <span>COMPETIDORES ATIVOS: {entries.length}</span>
      </div>
    </div>
  );
}
