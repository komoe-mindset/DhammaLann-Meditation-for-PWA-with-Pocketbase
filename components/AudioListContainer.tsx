import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupedVirtuoso, VirtuosoHandle } from 'react-virtuoso';
import { AudioGuide } from '../types';
import AudioCard from './AudioCard';

interface AudioListContainerProps {
  audioGuides: AudioGuide[];
  onPlay: (guide: AudioGuide) => void;
  onToggleDone: (id: number) => void;
  firstUncompletedId: number | undefined;
  t: {
    play: string;
    dayLabel: string;
  };
  lang: 'my' | 'en';
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement | null>>;
  isLoading?: boolean;
}

const AudioListContainer: React.FC<AudioListContainerProps> = ({
  audioGuides,
  onPlay,
  onToggleDone,
  firstUncompletedId,
  t,
  lang,
  itemRefs,
  isLoading = false
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Helper to convert numbers to Myanmar digits
  const toMyanmarDigits = (num: number) => {
    const myDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
    return num.toString().split('').map(d => myDigits[parseInt(d)] || d).join('');
  };

  // Group audio guides into months (30 days each)
  const months = useMemo(() => {
    const groups: AudioGuide[][] = [];
    for (let i = 0; i < audioGuides.length; i += 30) {
      groups.push(audioGuides.slice(i, i + 30));
    }
    return groups;
  }, [audioGuides]);

  const groupCounts = useMemo(() => months.map(m => m.length), [months]);

  // Scroll to the first uncompleted item on load
  useEffect(() => {
    if (firstUncompletedId && virtuosoRef.current && !isLoading) {
      const index = firstUncompletedId - 1;
      // Small delay to ensure virtuoso is ready
      const timer = setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({
          index,
          align: 'center',
          behavior: 'smooth'
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [firstUncompletedId, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-4 h-[600px] pr-2 -mr-2 custom-scrollbar pb-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-3xl bg-white/5 border border-white/10 p-6 animate-pulse">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/10"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-2 w-full bg-white/5 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="h-[600px] pr-2 -mr-2 custom-scrollbar pb-4">
      <GroupedVirtuoso
        ref={virtuosoRef}
        groupCounts={groupCounts}
        groupContent={(index) => {
          const monthNumber = index + 1;
          const myMonthNumber = toMyanmarDigits(monthNumber);
          const monthItems = months[index];
          const completedCount = monthItems.filter(item => item.isCompleted).length;
          const totalCount = monthItems.length;
          const progressPercentage = (completedCount / totalCount) * 100;
          const isFullyCompleted = completedCount === totalCount;

          return (
            <div className="py-4 bg-[#051a12] z-20" style={{ gridColumn: '1 / -1' }}>
              <div className={`rounded-3xl overflow-hidden border transition-all duration-300 bg-white/10 border-[#D4AF37]/40 shadow-xl`}>
                <div className="w-full px-6 py-5 flex items-center justify-between text-left group relative">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-base transition-all ${
                      isFullyCompleted 
                        ? 'bg-[#B8860B] text-white shadow-[0_0_15px_rgba(184,134,11,0.4)]' 
                        : 'bg-white/10 text-white/60'
                    }`}>
                      {lang === 'my' ? myMonthNumber : monthNumber}
                    </div>
                    <div className="flex-1 min-w-[140px]">
                      <h3 className="text-lg font-bold gold-text">
                        {lang === 'my' ? `${myMonthNumber} လ` : `Month ${monthNumber}`}
                      </h3>
                      
                      <div className="mt-2 space-y-1.5">
                        <p className="text-xs text-white/50 uppercase tracking-[0.15em] font-bold">
                          {lang === 'my' 
                            ? `${toMyanmarDigits(completedCount)} / ${toMyanmarDigits(totalCount)} ပြီးစီးမှု` 
                            : `${completedCount} / ${totalCount} Days Completed`}
                        </p>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-[#B8860B] shadow-[0_0_8px_rgba(184,134,11,0.6)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
        itemContent={(index) => {
          const guide = audioGuides[index];
          return (
            <div className="p-2">
              <AudioCard 
                key={guide.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(guide.id, el);
                  else itemRefs.current.delete(guide.id);
                }}
                guide={guide}
                onPlay={onPlay}
                onToggleDone={onToggleDone}
                isHighlighted={guide.id === firstUncompletedId}
                t={{ play: t.play, dayLabel: t.dayLabel }}
              />
            </div>
          );
        }}
        components={{
          List: React.forwardRef<HTMLDivElement, any>(({ children, style, ...props }, ref) => (
            <div
              {...props}
              ref={ref}
              style={{
                ...style,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0px',
              }}
              className="sm:grid-cols-4 md:grid-cols-5"
            >
              {children}
            </div>
          )),
          Item: ({ children, style, ...props }: any) => (
            <div
              {...props}
              style={{
                ...style,
              }}
            >
              {children}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default AudioListContainer;
