import React from 'react';
import { Play } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
  coverBgImage: string | null;
  brandImage: string | null;
}

const PHRASES = [
  "Aquecendo, entrando...",
  "Cantando o hino...",
  "Começa o jogo!"
];

export default function LoadingScreen({ onComplete, coverBgImage, brandImage }: LoadingScreenProps) {
  const [progress, setProgress] = React.useState(0);
  const [phraseIndex, setPhraseIndex] = React.useState(0);

  React.useEffect(() => {
    // Total duration: 5000ms
    const totalDuration = 5000;
    const intervalTime = 50; // ms per tick
    const increment = (100 / (totalDuration / intervalTime));

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    // Phrase switching timers (approx 1.66s per phrase)
    const phraseInterval = setInterval(() => {
      setPhraseIndex((prev) => {
        if (prev < PHRASES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1666);

    // Call complete after 5 seconds + small visual delay for UX
    const completionTimeout = setTimeout(() => {
      onComplete();
    }, 5200);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phraseInterval);
      clearTimeout(completionTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 overflow-hidden bg-[#1a0c2a] flex flex-col justify-center items-center p-6 sm:p-12 font-sans select-none animate-fade-in">
      {/* Immersive Background matching EntryPage */}
      <div className="absolute inset-0 bg-[#56104b] pointer-events-none z-0 overflow-hidden">
        {coverBgImage ? (
          <>
            <img
              src={coverBgImage}
              alt="Loading Background"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Custom dark gradient layer suited for high-focus loading action */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#140822]/98 via-[#1a0c2a]/80 to-[#140822]/90" />
          </>
        ) : (
          <>
            <div className="absolute -left-16 -top-16 w-96 h-96 rounded-full bg-[#e21b3c] opacity-80 blur-xl" />
            <div className="absolute right-[-15%] top-[-20%] w-[550px] h-[550px] rounded-full bg-[#00529b]/70 blur-xl" />
            <div className="absolute left-[30%] top-[20%] w-96 h-96 rounded-full bg-[#ff7a00]/80 blur-xl" />
            <div className="absolute left-[-10%] bottom-[-10%] w-[500px] h-[500px] rounded-full bg-[#8cc63f]/60 blur-xl" />
            <div className="absolute right-[5%] bottom-[-15%] w-[450px] h-[450px] rounded-full bg-[#00a2e8]/85 blur-xl" />
            <div className="absolute inset-0 bg-black/40" />
          </>
        )}
        
        {/* Retro halftone aesthetic overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:32px_32px] opacity-[0.06]" />
      </div>

      {/* Loading Container (Simplified) */}
      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center gap-6">
        
        {/* Logo/Brand */}
        <div className="p-3">
          {brandImage ? (
            <img
              src={brandImage}
              alt="Logo"
              className="h-[60px] w-auto max-w-[200px] object-contain"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src="/src/assets/images/regenerated_image_1779729548221.png"
              alt="Logo"
              className="h-[60px] w-auto max-w-[200px] object-contain"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Animated phrase */}
        <div className="h-10 flex items-center justify-center">
          <p className="text-white font-sans font-bold text-lg tracking-widest uppercase animate-pulse">
            {PHRASES[phraseIndex]}
          </p>
        </div>

        {/* Translucent white Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-6 left-12 right-12 text-center text-sm text-white/40 font-sans font-bold uppercase">
        Seleção BORA BRASIL CEPE 2026
      </div>
    </div>
  );
}
