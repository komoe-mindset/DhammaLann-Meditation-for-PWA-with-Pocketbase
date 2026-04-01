import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Pause, X, AlertCircle, RefreshCw } from 'lucide-react';
import { AudioGuide } from '../types';

interface StickyMiniPlayerProps {
  currentlyPlayingAudio: AudioGuide | null;
  onClose: () => void;
  lang: 'my' | 'en';
}

const StickyMiniPlayer: React.FC<StickyMiniPlayerProps> = ({ 
  currentlyPlayingAudio, 
  onClose,
  lang 
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (currentlyPlayingAudio) {
      setIsPlaying(true);
      setIsBuffering(true);
      setError(null);
    }
  }, [currentlyPlayingAudio]);

  useEffect(() => {
    if (audioRef.current && !error) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback failed", e);
          setError(lang === 'my' ? "အသံဖိုင် ဖွင့်၍မရပါ" : "Failed to play audio");
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentlyPlayingAudio, error, lang]);

  const handleRetry = () => {
    setError(null);
    setIsBuffering(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  if (!currentlyPlayingAudio) return null;

  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  const dayDisplay = lang === 'my' ? toMyanmarDigits(currentlyPlayingAudio.id) : currentlyPlayingAudio.id;
  const dayLabel = lang === 'my' ? 'နေ့ရက်' : 'Day';

  return (
    <AnimatePresence>
      {currentlyPlayingAudio && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] w-full max-w-md px-4 pb-[env(safe-area-inset-bottom)]"
        >
          <div className="glass-card rounded-2xl p-3 border border-[#D4AF37]/40 shadow-[0_10px_40px_rgba(0,0,0,0.4)] flex items-center gap-4 backdrop-blur-xl bg-[#051a12]/80">
            {/* Audio Info */}
            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#B8860B] flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white font-bold text-xs">
                  {dayDisplay}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider">
                  {dayLabel} {dayDisplay}
                </p>
                <h4 className="text-white text-xs font-medium truncate">
                  {lang === 'my' ? currentlyPlayingAudio.titleMy : currentlyPlayingAudio.titleEn || currentlyPlayingAudio.fileName}
                </h4>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {currentlyPlayingAudio.audioUrl && (
                <audio 
                  ref={audioRef}
                  src={currentlyPlayingAudio.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => {
                    setIsPlaying(true);
                    setIsBuffering(false);
                    setError(null);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onCanPlay={() => setIsBuffering(false)}
                  onError={() => {
                    setError(lang === 'my' ? "အမှားအယွင်းရှိပါသည်" : "Audio error");
                    setIsBuffering(false);
                  }}
                  autoPlay
                />
              )}

              {error ? (
                <button
                  onClick={handleRetry}
                  className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all active:scale-90 text-red-400"
                  aria-label="Retry"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-90"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  disabled={isBuffering}
                >
                  {isBuffering ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 text-white fill-current" />
                  ) : (
                    <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                  )}
                </button>
              )}
              
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                aria-label="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Error Tooltip */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <AlertCircle className="w-3 h-3" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyMiniPlayer;
