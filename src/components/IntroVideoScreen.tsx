import React, { useRef, useEffect, useState } from 'react';
import { ChevronRight, AlertCircle, Play, Volume2, VolumeX } from 'lucide-react';

interface IntroVideoScreenProps {
  onComplete: () => void;
}

export default function IntroVideoScreen({ onComplete }: IntroVideoScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Direct playback attempt
    const attemptPlay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Unmuted autoplay restricted. Trying muted autoplay...", err);
        // Fallback: mute and play
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
          setIsPlaying(true);
        } catch (muteErr) {
          console.error("Muted autoplay also failed:", muteErr);
        }
      }
    };

    attemptPlay();
  }, []);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.currentTarget;
    const mediaError = target.error;
    let errorMessage = "Erro desconhecido ao carregar o vídeo.";
    if (mediaError) {
      switch (mediaError.code) {
        case 1:
          errorMessage = "A reprodução do vídeo foi abortada.";
          break;
        case 2:
          errorMessage = "Erro de rede ao carregar o vídeo.";
          break;
        case 3:
          errorMessage = "O arquivo de vídeo está corrompido ou o codec não é suportado.";
          break;
        case 4:
          errorMessage = "O vídeo de apresentação não pôde ser carregado via URL externa ou seu navegador bloqueou a conexão.";
          break;
      }
    }
    console.error("Video loading error:", errorMessage);
    setVideoError(errorMessage);

    // Auto skip after 3.5 seconds if video fails, so the user is never blocked
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden animate-fade-in font-sans">
      {!videoError ? (
        <>
          {/* Fullscreen Video element */}
          <video
            ref={videoRef}
            src="https://video.wixstatic.com/video/d98d46_007a04cf6f0e4bcc9bddf56f513ad77b/720p/mp4/file.mp4"
            className="w-full h-full object-cover"
            playsInline
            onEnded={onComplete}
            onError={handleVideoError}
          />

          {/* Floaters & controls overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/60 pointer-events-none z-10" />

          {/* Floating Audio Controls */}
          {isPlaying && (
            <div className="absolute bottom-8 left-8 z-20">
              <button
                onClick={toggleMute}
                className="p-3 bg-black/60 hover:bg-white hover:text-black border border-white/20 text-white rounded-full transition-all duration-300 backdrop-blur-md cursor-pointer flex items-center justify-center"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-[#e21b3c]" />
                ) : (
                  <Volume2 className="w-5 h-5 text-[#8cc63f]" />
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Highly Polished Error/Notice Screen for 0-byte or Unloadable video */
        <div className="relative z-20 max-w-lg p-8 mx-4 text-center bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-[8px_8px_0_rgba(226,27,60,1)] flex flex-col items-center gap-6 animate-pulse-slow">
          <div className="w-16 h-16 rounded-full bg-[#e21b3c]/20 flex items-center justify-center border-2 border-[#e21b3c]">
            <AlertCircle className="w-10 h-10 text-[#e21b3c]" />
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-white tracking-wide uppercase">
            Instabilidade ao carregar o vídeo
          </h2>
          
          <p className="text-sm text-slate-300 leading-relaxed">
            Estamos com dificuldades para carregar o vídeo de apresentação remoto. Verifique sua conexão ou clique abaixo para continuar.
          </p>

          <p className="text-xs text-[#8cc63f] font-mono font-bold uppercase tracking-wider mt-2 animate-pulse">
            Redirecionando automaticamente em instantes...
          </p>

          <button
            onClick={onComplete}
            className="w-full mt-4 py-3 bg-[#FFDF1B] hover:bg-yellow-300 text-slate-950 font-black text-sm uppercase tracking-widest border-2 border-slate-950 rounded-full flex items-center justify-center gap-2 shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none transition-all active:translate-y-1 active:shadow-none cursor-pointer"
          >
            <span>Prosseguir para a Capa</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Floating Header area with the skip button (always visible or in overlay) */}
      <div className="absolute top-6 left-6 right-6 flex justify-end items-center z-20">
        <button
          onClick={onComplete}
          className="px-6 py-2.5 bg-white/20 hover:bg-[#FFDF1B] hover:text-slate-950 text-white font-sans font-black text-xs md:text-sm uppercase tracking-widest border border-white/30 hover:border-slate-950 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Pular Vídeo de Apresentação"
        >
          <span>Pular Vídeo</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

