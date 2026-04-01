import React, { useState, useMemo, useRef, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
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

  // Determine number of columns based on screen width
  const [columns, setColumns] = useState(3);
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth >= 768) setColumns(5);
      else if (window.innerWidth >= 640) setColumns(4);
      else setColumns(3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Chunk items within each month into rows
  const chunkedMonths = useMemo(() => {
    return months.map(monthItems => {
      const rows: AudioGuide[][] = [];
      for (let i = 0; i < monthItems.length; i += columns) {
        rows.push(monthItems.slice(i, i + columns));
      }
      return rows;
    });
  }, [months, columns]);

  const groupCounts = useMemo(() => chunkedMonths.map(m => m.length), [chunkedMonths]);

  // Flatten rows for easier indexing in itemContent if needed, 
  // but Virtuoso handles grouped indexing well.
  // Actually, GroupedVirtuoso itemContent receives the absolute index across all groups.
  // We need to map that back to the correct row in the correct group.
  const flattenedRows = useMemo(() => chunkedMonths.flat(), [chunkedMonths]);

  // Scroll to the first uncompleted item on load
  useEffect(() => {
    if (firstUncompletedId && virtuosoRef.current && !isLoading) {
      // Find the row index for the first uncompleted item
      const itemIndex = audioGuides.findIndex(g => g.id === firstUncompletedId);
      if (itemIndex !== -1) {
        // This is tricky because we need the row index, not the item index.
        // Let's calculate the absolute row index.
        let absoluteRowIndex = 0;
        let found = false;
        for (const monthRows of chunkedMonths) {
          for (const row of monthRows) {
            if (row.some(g => g.id === firstUncompletedId)) {
              found = true;
              break;
            }
            absoluteRowIndex++;
          }
          if (found) break;
        }

        const timer = setTimeout(() => {
          virtuosoRef.current?.scrollToIndex({
            index: absoluteRowIndex,
            align: 'center',
            behavior: 'smooth'
          });
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [firstUncompletedId, isLoading, chunkedMonths, audioGuides]);

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
            <div className="py-4 bg-[#051a12] z-20">
              <div className={`rounded-3xl overflow-hidden border transition-all duration-300 bg-white/10 border-[#D4AF37]/40 shadow-xl focus-within:ring-2 focus-within:ring-[#D4AF37] focus-within:ring-offset-2 focus-within:ring-offset-[#051a12]`}>
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
                          <m.div 
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
          const row = flattenedRows[index];
          return (
            <div 
              className="grid gap-2 p-2" 
              style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)` 
              }}
            >
              {row.map(guide => (
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
              ))}
            </div>
          );
        }}
      />
    </div>
  );
};

export default AudioListContainer;
