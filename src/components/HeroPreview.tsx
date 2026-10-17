import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, CheckCircle2, Zap } from 'lucide-react';

export const HeroPreview: React.FC = () => {
  const initialArray = [10, 20, 30, 40, 50];
  const [selectedIndex, setSelectedIndex] = useState<number>(2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setSelectedIndex((prev) => (prev + 1) % initialArray.length);
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying, initialArray.length]);

  const handleSelectCell = (idx: number) => {
    setIsPlaying(false);
    setSelectedIndex(idx);
  };

  const handleNext = () => {
    setIsPlaying(false);
    setSelectedIndex((prev) => (prev + 1) % initialArray.length);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setSelectedIndex((prev) => (prev - 1 + initialArray.length) % initialArray.length);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSelectedIndex(0);
  };

  const selectedValue = initialArray[selectedIndex];

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 shadow-xl shadow-slate-200/50 overflow-hidden group">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar / Header of Preview Box */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
          <span className="ml-2 text-xs font-mono text-slate-500">array_access_demo.ts</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-medium">
          <Zap className="w-3 h-3 text-indigo-600" />
          <span>Interactive Preview</span>
        </div>
      </div>

      {/* Visualizer Canvas Area */}
      <div className="space-y-6">
        
        {/* Array Visualization Grid */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Data Structure: Array</span>
            <span className="text-xs text-slate-500">Click any cell to inspect</span>
          </div>

          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {initialArray.map((val, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectCell(idx)}
                  className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-md ring-2 ring-indigo-500/30 scale-[1.03]'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                  aria-label={`Array element index ${idx}, value ${val}. ${isSelected ? 'Currently selected' : 'Click to select'}`}
                >
                  {/* Top Pointer Indicator */}
                  {isSelected && (
                    <div className="absolute -top-2.5 px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full shadow-xs">
                      Target
                    </div>
                  )}
                  
                  {/* Value */}
                  <span className={`font-mono text-lg sm:text-xl font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {val}
                  </span>
                  
                  {/* Index Label */}
                  <span className="text-[11px] font-mono mt-1 text-slate-500">
                    [{idx}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step Status & Explanation Box */}
        <div className="bg-slate-50/90 rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700 tracking-wide uppercase">
                Current Step: Access index {selectedIndex}
              </span>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              O(1) Time Complexity
            </span>
          </div>
          <p className="text-sm text-slate-700">
            The value at index <span className="font-mono text-indigo-700 font-bold">{selectedIndex}</span> is{' '}
            <span className="font-mono text-indigo-700 font-bold">{selectedValue}</span>. Array access takes O(1) time because memory addresses are calculated directly via index offsets.
          </p>
        </div>

        {/* Pseudocode Panel */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-3.5 font-mono text-xs text-slate-200 space-y-1 overflow-x-auto">
          <div className="text-[10px] uppercase font-sans text-slate-400 tracking-wider mb-2 font-semibold">
            Execution Code
          </div>
          <div className="text-slate-400 pl-2">1  const array = [10, 20, 30, 40, 50];</div>
          <div className="text-slate-400 pl-2">2  const targetIndex = {selectedIndex};</div>
          <div className="bg-indigo-600/30 text-indigo-200 font-medium px-2 py-1 rounded border-l-2 border-indigo-400 flex items-center justify-between">
            <span>3  const value = array[targetIndex];</span>
            <span className="text-[10px] text-indigo-300 font-mono">// Active step ({selectedValue})</span>
          </div>
          <div className="text-slate-400 pl-2">4  return value;</div>
        </div>

        {/* Playback Controls Preview */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
          <div className="text-xs font-mono text-slate-500">
            Playback Preview: <span className="text-slate-800 font-semibold">{selectedIndex + 1} / {initialArray.length}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              title="Reset to index 0"
              aria-label="Reset array step to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              title="Previous Index"
              aria-label="Previous index"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label={isPlaying ? "Pause playback preview" : "Auto play preview"}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Auto Play</span>
                </>
              )}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              title="Next Index"
              aria-label="Next index"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
