/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sticker } from '../types';
import { STICKERS } from '../data';
import StickerItem from './StickerItem';
import { playTearPack, playPeel, playSuccess } from '../audio';
import { Sparkles, CreditCard, Gift, MousePointerClick, HelpCircle, Trophy, CheckCircle2, XCircle, AlertCircle, Lock, Unlock, Scissors, RefreshCw } from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: string;
}

const WORLD_SOCCER_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "Quem ganhou a Copa do Mundo masculina de 2022 no Catar?",
    options: ["Brasil", "França", "Argentina"],
    correct: "Argentina"
  },
  {
    id: 2,
    question: "Quantas Copas do Mundo a seleção masculina do Brasil possui atualmente?",
    options: ["4 títulos", "5 títulos", "6 títulos"],
    correct: "5 títulos"
  },
  {
    id: 3,
    question: "Qual país sediou a Copa do Mundo de 2014 onde a Alemanha foi campeã?",
    options: ["Brasil", "Alemanha", "África do Sul"],
    correct: "Brasil"
  },
  {
    id: 4,
    question: "Qual clube de futebol europeu possui mais títulos da UEFA Champions League?",
    options: ["Barcelona", "Real Madrid", "Bayern de Munique"],
    correct: "Real Madrid"
  },
  {
    id: 5,
    question: "Quem é amplamente conhecido como o 'Rei do Futebol' mundial?",
    options: ["Maradona", "Zinedine Zidane", "Pelé"],
    correct: "Pelé"
  },
  {
    id: 6,
    question: "De quantos em quantos anos é realizada a Copa do Mundo da FIFA?",
    options: ["De 2 em 2 anos", "De 4 em 4 anos", "De 5 em 5 anos"],
    correct: "De 4 em 4 anos"
  },
  {
    id: 7,
    question: "Qual país sul-americano conquistou a primeira Copa do Mundo em 1930?",
    options: ["Uruguai", "Brasil", "Argentina"],
    correct: "Uruguai"
  },
  {
    id: 8,
    question: "Qual é a cor do cartão usado pelo árbitro para expulsar definitivamente um jogador?",
    options: ["Cartão Amarelo", "Cartão Vermelho", "Cartão Azul"],
    correct: "Cartão Vermelho"
  },
  {
    id: 9,
    question: "Quem é o maior artilheiro da história das Copas do Mundo de futebol masculino?",
    options: ["Ronaldo Fenômeno", "Pelé", "Miroslav Klose"],
    correct: "Miroslav Klose"
  },
  {
    id: 10,
    question: "Quantos jogadores de cada equipe entram em campo no início de uma partida oficial?",
    options: ["9 jogadores", "10 jogadores", "11 jogadores"],
    correct: "11 jogadores"
  },
  {
    id: 11,
    question: "Em qual país de língua inglesa o futebol moderno foi codificado e regulamentado?",
    options: ["Inglaterra", "Estados Unidos", "Austrália"],
    correct: "Inglaterra"
  },
  {
    id: 12,
    question: "Qual craque argentino usava a camisa 10 e comandou o título de 1986 no México?",
    options: ["Diego Maradona", "Lionel Messi", "Gabriel Batistuta"],
    correct: "Diego Maradona"
  },
  {
    id: 13,
    question: "Quantas Copas do Mundo o craque Pelé conquistou como jogador de campo?",
    options: ["2 títulos", "3 títulos", "4 títulos"],
    correct: "3 títulos"
  },
  {
    id: 14,
    question: "Quem foi o capitão que ergueu a taça do Pentacampeonato mundial do Brasil em 2002?",
    options: ["Cafu", "Ronaldo Fenômeno", "Dunga"],
    correct: "Cafu"
  },
  {
    id: 15,
    question: "Qual seleção europeia disputou a final de Copa do Mundo de 2002 contra o Brasil?",
    options: ["França", "Alemanha", "Itália"],
    correct: "Alemanha"
  },
  {
    id: 16,
    question: "Em qual Copa do Mundo o craque argentino Lionel Messi conquistou seu primeiro título mundial?",
    options: ["Rússia 2018", "Catar 2022", "Brasil 2014"],
    correct: "Catar 2022"
  },
  {
    id: 17,
    question: "Qual lendário jogador brasileiro e do Flamengo, tricampeão em 1970, ficou conhecido como 'Furacão da Copa'?",
    options: ["Zico", "Jairzinho", "Tostão"],
    correct: "Jairzinho"
  },
  {
    id: 18,
    question: "Qual é a maior artilheira de todas as Copas do Mundo de futebol de todos os tempos (masculino ou feminino)?",
    options: ["Marta", "Abby Wambach", "Birgit Prinz"],
    correct: "Marta"
  },
  {
    id: 19,
    question: "Quem era o treinador que comandou o Brasil na emblemática conquista do Tetracampeonato em 1994?",
    options: ["Mário Zagallo", "Carlos Alberto Parreira", "Telê Santana"],
    correct: "Carlos Alberto Parreira"
  },
  {
    id: 20,
    question: "Qual seleção europeia ficou conhecida pelo apelido de 'Laranja Mecânica' na Copa de 1974?",
    options: ["Alemanha", "Holanda", "Bélgica"],
    correct: "Holanda"
  },
  {
    id: 21,
    question: "Qual estrela francesa marcou dois gols de cabeça na final da Copa do Mundo de 1998 contra o Brasil?",
    options: ["Zinedine Zidane", "Thierry Henry", "Didier Deschamps"],
    correct: "Zinedine Zidane"
  },
  {
    id: 22,
    question: "Em que Copa do Mundo Maradona marcou o gol épico conhecido como 'A Mão de Deus' e fez fila na defesa da Inglaterra?",
    options: ["Espanha 1982", "México 1986", "Itália 1990"],
    correct: "México 1986"
  },
  {
    id: 23,
    question: "Qual destas seleções possui exatamente 4 títulos mundiais da Copa do Mundo masculina?",
    options: ["Itália", "França", "Uruguai"],
    correct: "Itália"
  },
  {
    id: 24,
    question: "Qual jogador marcou o gol salvador da Alemanha na prorrogação da final de 2014 contra a Argentina no Maracanã?",
    options: ["Thomas Müller", "Mario Götze", "Toni Kroos"],
    correct: "Mario Götze"
  },
  {
    id: 25,
    question: "Quem foi o grande craque e artilheiro eleito o melhor jogador da Copa do Mundo de 1994 nos EUA?",
    options: ["Romário", "Bebeto", "Roberto Baggio"],
    correct: "Romário"
  },
  {
    id: 26,
    question: "Quem marcou os dois gols da vitória do Brasil por 2 a 0 contra a Alemanha na final de 2002?",
    options: ["Rivaldo", "Ronaldo Fenômeno", "Ronaldinho Gaúcho"],
    correct: "Ronaldo Fenômeno"
  },
  {
    id: 27,
    question: "Qual jogador tem o recorde de participar de 3 finais seguidas de Copa do Mundo (1994, 1998 e 2002)?",
    options: ["Cafu", "Ronaldo Fenômeno", "Roberto Carlos"],
    correct: "Cafu"
  },
  {
    id: 28,
    question: "Qual lendário jogador brasileiro foi eleito a 'Alegria do Povo' pela sua genialidade na Copa de 1962?",
    options: ["Garrincha", "Pelé", "Amarildo"],
    correct: "Garrincha"
  },
  {
    id: 29,
    question: "Em qual país do continente africano foi realizada a icônica Copa do Mundo de 2010?",
    options: ["Nigéria", "África do Sul", "Marrocos"],
    correct: "África do Sul"
  },
  {
    id: 30,
    question: "Quem marcou o gol decisivo da seleção da Espanha na final de 2010 derrotando a Holanda?",
    options: ["Andrés Iniesta", "Xavi Hernández", "David Villa"],
    correct: "Andrés Iniesta"
  },
  {
    id: 31,
    question: "Em qual Copa do Mundo o VAR (Árbitro de Vídeo) estreou oficialmente pela FIFA?",
    options: ["Brasil 2014", "Rússia 2018", "Catar 2022"],
    correct: "Rússia 2018"
  },
  {
    id: 32,
    question: "Qual craque português marcou mais gols pela sua seleção em Copas e é o maior artilheiro em seleções da história?",
    options: ["Cristiano Ronaldo", "Eusébio", "Luís Figo"],
    correct: "Cristiano Ronaldo"
  },
  {
    id: 33,
    question: "Quantos anos tinha Pelé quando conquistou sua primeira Copa do Mundo em 1958 na Suécia?",
    options: ["17 anos", "18 anos", "19 anos"],
    correct: "17 anos"
  },
  {
    id: 34,
    question: "Qual país sediou a Copa de 1970 onde a Seleção Canarinho conquistou a posse definitiva da Taça Jules Rimet?",
    options: ["Chile", "México", "Argentina"],
    correct: "México"
  },
  {
    id: 35,
    question: "Quem foi o craque meio-campista da Croácia eleito o melhor jogador do mundo e da Copa em 2018?",
    options: ["Ivan Rakitic", "Luka Modric", "Mario Mandzukic"],
    correct: "Luka Modric"
  },
  {
    id: 36,
    question: "De qual craque das Copas de 1994, 1998, 2002 e 2006 é a autoria do fantástico chute de falta com curva 'impossível' contra a França em 1997?",
    options: ["Roberto Carlos", "Ronaldinho Gaúcho", "Juninho Pernambucano"],
    correct: "Roberto Carlos"
  },
  {
    id: 37,
    question: "Quem marcou o icônico gol de falta encobrindo o goleiro Seaman contra a Inglaterra em 2002?",
    options: ["Ronaldo", "Ronaldinho Gaúcho", "Rivaldo"],
    correct: "Ronaldinho Gaúcho"
  }
];

interface PackManagerProps {
  onAddStickers: (stickers: Sticker[]) => void;
  gluedStickerIds: number[];
}

export default function PackManager({ onAddStickers, gluedStickerIds }: PackManagerProps) {
  const [packState, setPackState] = useState<'closed' | 'tearing' | 'revealing' | 'collected'>('closed');
  const [revealedPack, setRevealedPack] = useState<{ sticker: Sticker; flipped: boolean }[]>([]);

  // Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [unlockedTear, setUnlockedTear] = useState(false);

  // Drag-to-tear gesture state
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [startX, setStartX] = useState(0);

  const handleDragStart = (clientX: number) => {
    if (!unlockedTear) return;
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diffX = clientX - startX;
    const newX = Math.max(0, Math.min(160, diffX));
    setDragX(newX);

    if (newX >= 145) {
      setIsDragging(false);
      setDragX(0);
      handleOpenPack();
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragX < 145) {
      setDragX(0);
    }
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX);
      }
    };

    const onMouseUp = () => {
      handleDragEnd();
    };

    const onTouchEnd = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, startX, dragX]);

  // Start the soccer quiz
  const startQuiz = () => {
    const randomIdx = Math.floor(Math.random() * WORLD_SOCCER_QUESTIONS.length);
    setCurrentQuestion(WORLD_SOCCER_QUESTIONS[randomIdx]);
    setSelectedOption(null);
    setQuizCorrect(null);
    setQuizActive(true);
  };

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    if (option === currentQuestion?.correct) {
      setQuizCorrect(true);
      playSuccess();
      setUnlockedTear(true);
    } else {
      setQuizCorrect(false);
    }
  };

  const handleResetQuizQuestion = () => {
    startQuiz();
  };

  const handleUnlockAndTear = () => {
    setQuizActive(false);
    // Closed packet remains with unlockedTear = true, user will drag starting on left to tear it!
  };

  const handlePackClick = () => {
    if (!unlockedTear) {
      startQuiz();
    }
  };

  // Open a pack of 3 random stickers
  const handleOpenPack = () => {
    if (packState !== 'closed') return;

    playTearPack();

    const selected: { sticker: Sticker; flipped: boolean }[] = [];
    const unglued = STICKERS.filter(s => s.id <= 24 && !gluedStickerIds.includes(s.id));
    const allPool = STICKERS.filter(s => s.id <= 24);

    for (let i = 0; i < 3; i++) {
      let chosen: Sticker;
      
      // 60% chance to pick an unglued sticker if there are any left, 40% purely random
      if (unglued.length > 0 && Math.random() < 0.6) {
        const index = Math.floor(Math.random() * unglued.length);
        chosen = unglued[index];
        unglued.splice(index, 1);
      } else {
        chosen = allPool[Math.floor(Math.random() * allPool.length)];
      }

      selected.push({ sticker: chosen, flipped: false });
    }

    setRevealedPack(selected);
    setPackState('revealing');
  };

  // Flip an individual card during reveal
  const handleFlipCard = (index: number) => {
    if (revealedPack[index].flipped) return;

    playPeel();
    const updated = [...revealedPack];
    updated[index].flipped = true;
    setRevealedPack(updated);

    // If all are flipped and contains the special 12th sticker, play a success chime!
    const allFlipped = updated.every(c => c.flipped);
    if (allFlipped) {
      const hasSpecial = updated.some(c => c.sticker.id === 12);
      if (hasSpecial) {
        setTimeout(() => playSuccess(), 200);
      }
    }
  };

  // Collect the cards and reset the pakcet state
  const handleCollect = () => {
    onAddStickers(revealedPack.map(p => p.sticker));
    setPackState('closed');
    setRevealedPack([]);
    setUnlockedTear(false); // Reset unlock state for the next packet!
  };

  const allFlipped = revealedPack.length > 0 && revealedPack.every(c => c.flipped);

  return (
    <div id="pack-opener" className="flex flex-col items-center justify-center p-6 bg-[#7833a9] border-4 border-slate-950 rounded-[32px] shadow-2xl max-w-xl mx-auto w-full my-6 relative overflow-hidden" style={{ backgroundColor: '#7833a9' }}>
      
      {/* Title */}
      <h3 className="text-xl font-sans text-center tracking-wider uppercase mb-1 z-10 flex flex-col items-center gap-1 justify-center">
        <img 
          src="/src/assets/images/ABRIR.png" 
          alt="OBTER" 
          style={{ height: '64px', display: 'block' }} 
          className="object-contain select-none"
          referrerPolicy="no-referrer"
        />
        <span className="text-white text-base font-bold" style={{ fontFamily: 'system-ui' }}>NOVAS FIGURINHAS</span>
      </h3>
      <p className="text-xs text-slate-300 text-center mb-6 max-w-sm z-10 font-sans">
        Cada pacotinho contém <span className="font-black" style={{ color: '#ff8400' }}>3 figurinhas surpresas</span>. Se conseguir repetidas, guarde-as na sua bancada!
      </p>

      {/* Packet Container */}
      <div 
        style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: '#ffffff', borderRadius: '20px' }}
        className="relative min-h-[22rem] w-full flex items-center justify-center z-10"
      >
        
        {/* Closed / Hover Pack */}
        {packState === 'closed' && (
          <div className="flex flex-col items-center gap-4 w-full">
            {quizActive ? (
              <div className="w-full max-w-sm p-5 rounded-[28px] bg-slate-950 border-4 border-slate-900 shadow-2xl animate-fade-in text-center flex flex-col justify-between min-h-[20rem] z-30 relative overflow-hidden">
                <button
                  onClick={() => setQuizActive(false)}
                  className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white z-20 cursor-pointer"
                  title="Fechar Quiz"
                >
                  <XCircle className="w-6 h-6" />
                </button>
                <div className="flex flex-col gap-1.5 z-10 font-sans">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span 
                      style={{ backgroundColor: '#ef4c8d' }} 
                      className="text-[9px] text-slate-950 px-3 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 border border-slate-950"
                    >
                      ⚽ CEPE QUIZ
                    </span>
                  </div>
                  <h4 
                    style={{ fontWeight: 'bold', lineHeight: '26px' }} 
                    className="text-sm sm:text-base text-white text-left mt-3"
                  >
                    {currentQuestion?.question}
                  </h4>
                </div>
                
                <div className="flex flex-col gap-2.5 mt-4 z-10 font-sans">
                  {currentQuestion?.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isAnswerCorrect = option === currentQuestion.correct;
                    
                    let btnStyle = "bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 text-white cursor-pointer active:translate-y-0.5 shadow-[2px_2px_0_rgba(0,0,0,0.4)]";
                    if (selectedOption !== null) {
                      if (isSelected) {
                        btnStyle = isAnswerCorrect 
                          ? "bg-[#8cc63f] border-2 border-slate-950 text-slate-950 font-black scale-[1.01] shadow-[1px_1px_0_rgba(0,0,0,1)]" 
                          : "bg-[#e21b3c] border-2 border-slate-950 text-white font-extrabold shadow-[1px_1px_0_rgba(0,0,0,1)]";
                      } else if (isAnswerCorrect && quizCorrect) {
                        btnStyle = "bg-[#8cc63f] border-2 border-slate-950 text-slate-950 font-black";
                      } else {
                        btnStyle = "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedOption !== null}
                        onClick={() => handleSelectOption(option)}
                        className={`w-full py-2.5 px-4 rounded-full border text-xs font-bold text-left transition-all flex items-center justify-between duration-250 ${btnStyle}`}
                      >
                        <span className="truncate pr-2">{option}</span>
                        {selectedOption !== null && isAnswerCorrect && (
                          <span className="text-[8px] bg-white text-black px-2.5 py-0.5 rounded-full font-black shrink-0 flex items-center gap-0.5 border border-slate-950">
                            <CheckCircle2 className="w-3 h-3 text-black" /> CORRETO!
                          </span>
                        )}
                        {selectedOption === option && !isAnswerCorrect && (
                          <span className="text-[8px] bg-white text-black px-2.5 py-0.5 rounded-full font-black shrink-0 flex items-center gap-0.5 border border-slate-950">
                            <XCircle className="w-3 h-3 text-black" /> ERRADO
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Question Feedback / Action */}
                {selectedOption !== null && (
                  <div className="mt-4 animate-fade-in flex flex-col gap-2.5 z-10 border-t border-slate-800 pt-3 font-sans">
                    {quizCorrect ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-1.5 text-xs text-[#FFDF1B] font-extrabold uppercase tracking-wide">
                          <Trophy className="w-4 h-4 text-[#FFDF1B] animate-bounce" />
                          Resposta Correta! Desbloqueado!
                        </div>
                        <button
                          onClick={handleUnlockAndTear}
                          style={{ backgroundColor: '#ff5800' }}
                          className="w-full py-3 hover:bg-opacity-90 text-white font-black text-xs uppercase rounded-full tracking-wider shadow-[3px_3px_0_rgba(0,0,0,1)] active:translate-y-0.5 border-2 border-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Scissors className="w-4 h-4 text-white flex-shrink-0 animate-pulse" />
                          <span>RASGAR PACOTINHO!</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] text-red-400 font-extrabold flex items-center justify-center gap-1 uppercase">
                          <AlertCircle className="w-3.5 h-3.5 text-red-300 shrink-0" />
                          Resposta Incorreta! Tente novamente.
                        </p>
                        <button
                          onClick={handleResetQuizQuestion}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border-2 border-slate-800 text-white font-extrabold text-xs uppercase rounded-full tracking-wider active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-white animate-spin-once" style={{ animationDuration: '0.5s' }} />
                          <span>OUTRA PERGUNTA</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                className="relative w-56 h-80 rounded-[28px] overflow-hidden p-[3px] bg-slate-950 border-4 border-slate-950 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:scale-[1.01] transition-all duration-200 select-none"
                aria-label="Pacotinho de Figurinhas"
              >
                {/* Envelope Body */}
                <div className="w-full h-full rounded-[20px] bg-slate-950 flex flex-col justify-between relative overflow-hidden border border-white/10">
                  
                  {/* Card Background Image */}
                  <img
                    src="/src/assets/images/regenerated_image_1779582570227.png"
                    alt="Pacotinho Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-85 pointer-events-none z-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay background color block style */}
                  <div className="absolute inset-0 bg-[#56104b]/20 pointer-events-none z-10" />

                  {/* ACTIVE DRAG-TO-TEAR STRIP ZONE AT THE TOP !!! */}
                  {unlockedTear ? (
                    <div 
                      className="absolute top-0 inset-x-0 h-16 z-30 bg-black/70 border-b-2 border-dashed border-yellow-500/30 flex items-center px-2 select-none"
                    >
                      {/* Dotted Tear Line */}
                      <div className="absolute left-6 right-6 h-0.5 border-b-2 border-dashed border-red-500/70 z-10 pointer-events-none" />
                      
                      {/* Drag Progress highlight path */}
                      <div 
                        className="absolute left-2 h-1 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full pointer-events-none z-20"
                        style={{ width: `${Math.max(10, dragX + 16)}px` }}
                      />
 
                      {/* Floating Indicator instructions */}
                      {dragX === 0 && (
                        <div className="absolute inset-x-0 text-center pointer-events-none z-0 animate-pulse">
                          <span className="text-[9px] text-[#FFDF1B] font-extrabold tracking-wider uppercase">
                            Arraste ➔ para abrir
                          </span>
                        </div>
                      )}
 
                      {/* Draggable Tab/Zipper Knob */}
                      <div 
                        onMouseDown={(e) => handleDragStart(e.clientX)}
                        onTouchStart={(e) => {
                          if (e.touches.length > 0) {
                            handleDragStart(e.touches[0].clientX);
                          }
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500 border-2 shadow-md flex items-center justify-center cursor-ew-resize z-30 transform hover:scale-110 active:scale-125 hover:from-yellow-200 hover:to-yellow-400 transition-transform duration-150"
                        style={{ left: `${Math.max(2, dragX)}px`, borderColor: '#ff8400' }}
                      >
                        <Scissors className="w-5 h-5 text-slate-950 animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    // Quiz trigger indicator
                    <div 
                      onClick={startQuiz}
                      className="absolute top-0 inset-x-0 h-12 z-30 bg-black/60 border-b border-rose-500/10 flex items-center justify-center cursor-pointer select-none py-1 px-2 hover:bg-black/50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider animate-pulse" style={{ color: '#a4e433' }}>
                        <Lock className="w-3.5 h-3.5" style={{ color: '#ffffff' }} /> RESPONDER QUIZ P/ LIBERAR
                      </div>
                    </div>
                  )}
 
                  {/* Standard Packet Branding removed per request */}
 
                  {/* Bottom details of the envelope package */}
                  <div className="w-full flex flex-col items-center gap-1 mt-auto z-20 pb-4 pointer-events-none">
                    {unlockedTear ? (
                      <div className="flex flex-col items-center animate-bounce">
                        <span className="text-[10px] text-yellow-300 bg-black/40 px-3 py-1 rounded-full font-black tracking-widest uppercase border border-yellow-500/30">
                          ➔ DESBLOQUEADO! ➔
                        </span>
                        <span className="text-[9px] text-slate-300 font-bold mt-1 shadow-sm">
                          Arraste a tesoura no topo
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={startQuiz}
                        className="pointer-events-auto px-4 py-1.5 hover:bg-lime-600 text-white font-black text-[10px] uppercase rounded-full tracking-wider shadow-md border border-slate-950 transition-all flex items-center gap-1 cursor-pointer"
                        style={{ backgroundColor: '#ff8400' }}
                      >
                        <span style={{ fontFamily: 'system-ui' }}>JOGAR QUIZ</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Reveal Fan Mode */}
        {packState === 'revealing' && (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex justify-center items-center gap-4 sm:gap-6 md:gap-8 flex-wrap py-4">
              {revealedPack.map((packItem, idx) => {
                // Card rotation/fan effect
                const rotation = idx === 0 ? '-rotate-6 hover:-rotate-2' : idx === 2 ? 'rotate-6 hover:rotate-2' : 'hover:-translate-y-2';
                
                return (
                  <div
                    key={idx}
                    className={`relative cursor-pointer transition-all duration-300 ${rotation}`}
                    onClick={() => handleFlipCard(idx)}
                  >
                    {/* Perspective card wrap */}
                    <div 
                      className="relative transform style-3d duration-500 shadow-2xl"
                      style={{ width: '120px', height: '180px' }}
                    >
                      
                      {/* Back Side of Sticker (Cardboard backing) */}
                      <div
                        className={`absolute inset-0 w-full h-full rounded-xl bg-[#ffffff] p-1 border-2 border-[#ffffff] flex flex-col justify-between items-center transition-opacity duration-300 ease-in-out ${
                          packItem.flipped ? 'opacity-0 pointer-events-none' : 'opacity-100 z-10'
                        }`}
                      >
                        <div 
                          style={{ backgroundColor: '#017b89' }}
                          className="w-full h-full rounded-lg border-0 p-2 flex flex-col justify-between items-center text-center relative overflow-hidden"
                        >
                          {/* Background Image of the card back */}
                          <img
                            src="/src/assets/images/regenerated_image_1779582570227.png"
                            alt="Verso da Figurinha"
                            className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none z-0"
                            referrerPolicy="no-referrer"
                          />
                          
                          <div 
                            className="flex items-center justify-center my-auto animate-pulse z-20"
                            style={{ 
                              width: '60px', 
                              height: '60px', 
                              color: '#003136', 
                              fontStyle: 'normal', 
                              fontSize: '48px',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              fontFamily: 'system-ui'
                            }}
                          >
                            ?
                          </div>
                          <span 
                            className="text-[8px] animate-pulse uppercase leading-none font-extrabold tracking-wide z-20 bg-black/40 px-1.5 py-0.5 rounded"
                            style={{ color: '#ffffff' }}
                          >
                            Clique p/ virar
                          </span>
                        </div>
                      </div>

                      {/* Front Side of Sticker */}
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          packItem.flipped ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none'
                        }`}
                      >
                        <StickerItem 
                          sticker={packItem.sticker} 
                          className="w-full h-full" 
                          style={idx === 0 ? { color: '#89e87c' } : undefined}
                          svgStyle={idx === 0 ? { color: '#ffffff' } : undefined}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Collect Action bar */}
            <div className="mt-6 flex flex-col items-center gap-2">
              {!allFlipped ? (
                <span 
                  className="text-xs animate-pulse font-extrabold px-3 py-1 rounded-full shadow-md"
                  style={{ color: '#ffffff', backgroundColor: '#ff6000' }}
                >
                  Revele todas as figurinhas clicando nelas!
                </span>
              ) : (
                <button
                  onClick={handleCollect}
                  style={{ backgroundColor: '#d36703', color: '#ffffff', fontFamily: 'system-ui', borderColor: '#ffffff' }}
                  className="px-6 py-2.5 hover:bg-opacity-90 font-black tracking-wide rounded-full shadow-lg border transform hover:scale-105 active:scale-95 transition-all text-sm animate-bounce cursor-pointer"
                >
                  ENVIAR TODAS PARA A BANCADA
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
