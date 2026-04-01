import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Play, Check, FileAudio } from 'lucide-react';
import { AudioGuide } from '../types';

interface AudioCardProps {
  guide: AudioGuide;
  onPlay: (guide: AudioGuide) => void;
  onToggleDone: (id: number) => void;
  isHighlighted: boolean;
  t: {
    play: string;
    dayLabel: string;
  };
}

const AudioCard = React.forwardRef<HTMLDivElement, AudioCardProps>(({ 
  guide, 
  onPlay, 
  onToggleDone, 
  isHighlighted,
  t 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      ref={ref}
      className="relative flex flex-col"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative group">
        {/* Main Action: Play Audio */}
        <motion.button 
          onClick={() => onPlay(guide)} 
          whileTap={{ scale: 0.96 }}
          className={`w-full flex flex-col items-center justify-center pt-7 pb-4 rounded-2xl transition-all border-2 relative ${
            guide.isCompleted 
              ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30' 
              : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
          } ${isHighlighted ? 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#051a12]' : ''}`}
          aria-label={`${t.play} ${t.dayLabel} ${guide.id}`}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all ${
            guide.audioUrl 
              ? 'bg-[#B8860B] text-white shadow-xl group-hover:scale-110' 
              : 'bg-white/10 text-white/40'
          }`}>
            {guide.audioUrl ? (
              <Play className="w-6 h-6 fill-current ml-1" />
            ) : (
              <FileAudio className="w-6 h-6" />
            )}
          </div>
          <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest">
            {t.dayLabel} {guide.id}
          </span>
        </motion.button>

        {/* Info Toggle Button */}
        {(guide.fileName || guide.date) && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            whileTap={{ scale: 0.9 }}
            className={`absolute -bottom-2 -left-2 w-11 h-11 rounded-full shadow-lg transition-all z-20 flex items-center justify-center ${
              isExpanded ? 'bg-[#D4AF37] text-white' : 'bg-teal-900/80 text-white/60 hover:text-white'
            }`}
            aria-label="Toggle Info"
          >
            <Info className="w-5 h-5" />
          </motion.button>
        )}

        {/* Secondary Action: Toggle Done - Redesigned for 44x44px touch target */}
        <motion.button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleDone(guide.id); 
          }}
          whileTap={{ scale: 0.9 }}
          className={`absolute -top-3 -right-3 w-11 h-11 rounded-full shadow-lg transition-all z-20 flex items-center justify-center group/toggle ${
            guide.isCompleted 
              ? 'text-white' 
              : 'text-white/70 hover:text-white'
          }`}
          title={guide.isCompleted ? "Mark as Unfinished" : "Mark as Done"}
          aria-label={guide.isCompleted ? "Mark as Unfinished" : "Mark as Done"}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all relative ${
            guide.isCompleted 
              ? 'bg-[#B8860B] border-[#FCF6BA]/50' 
              : 'bg-[#051a12] border-white/40 group-hover/toggle:border-white/60'
          }`}>
            <AnimatePresence mode="wait">
              {guide.isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </motion.div>
              ) : (
                <motion.span 
                  key="id"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[10px] font-bold"
                >
                  {guide.id}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Ripple Effect when completed */}
            <AnimatePresence>
              {guide.isCompleted && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 1 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-[#D4AF37] pointer-events-none"
                />
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </div>

      {/* Inline Expansion for Info */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-teal-900/40 backdrop-blur-md rounded-xl border border-white/10 text-white text-[10px] shadow-xl">
              {guide.fileName && <div className="font-bold mb-1 gold-text">{guide.fileName}</div>}
              {guide.date && <div className="opacity-60">{guide.date}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

export default AudioCard;
