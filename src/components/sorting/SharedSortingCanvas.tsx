import React, { useState, useMemo } from 'react';
import type { TraceStep, ItemHighlightType } from '../../types/trace';
import { 
  BarChart2, 
  Grid, 
  CheckCircle2, 
  Target,
  Inbox
} from 'lucide-react';

interface SharedSortingCanvasProps {
  currentStep?: TraceStep;
  initialArray: number[];
  algorithmName?: string;
  category?: 'sorting' | 'searching';
}

export const SharedSortingCanvas: React.FC<SharedSortingCanvasProps> = ({
  currentStep,
  initialArray,
  algorithmName = 'Algorithm',
  category = 'sorting'
}) => {
  const [displayMode, setDisplayMode] = useState<'bars' | 'cells'>('bars');

  const displayArray = currentStep?.arrayState ?? initialArray;
  const activeIndices = currentStep?.activeIndices || [];
  const highlights = currentStep?.highlightedItems || {};
  const pointers = currentStep?.pointers || [];
  const isCompleted = currentStep?.isCompleted || false;

  const comparisons = currentStep?.comparisons ?? 0;
  const swaps = currentStep?.swaps ?? 0;
  const writes = currentStep?.writes ?? 0;
  const passNumber = currentStep?.passNumber ?? 0;
  const recursionDepth = currentStep?.recursionDepth ?? 0;
  const rangeLow = currentStep?.rangeLow ?? -1;
  const rangeHigh = currentStep?.rangeHigh ?? -1;
  const pivotIndex = currentStep?.pivotIndex ?? -1;

  // Compute min and max for bar scaling (supporting negative values safely)
  const { minVal, range } = useMemo(() => {
    if (displayArray.length === 0) return { minVal: 0, range: 100 };
    let min = displayArray[0];
    let max = displayArray[0];
    for (const v of displayArray) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const safeRange = max === min ? 1 : max - min;
    return { minVal: min, range: safeRange };
  }, [displayArray]);

  const getElementState = (idx: number) => {
    const highlightType: ItemHighlightType | undefined = highlights[idx];
    const isPivot = pivotIndex === idx;
    const inRange = rangeLow >= 0 && rangeHigh >= 0 && idx >= rangeLow && idx <= rangeHigh;
    const isActive = activeIndices.includes(idx);

    if (highlightType === 'found') {
      return {
        bg: 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/60 shadow-lg',
        badge: 'Match ✓',
        badgeClass: 'bg-emerald-600 text-white',
        icon: '✓',
        barColor: 'bg-gradient-to-t from-emerald-600 to-teal-500'
      };
    }
    if (highlightType === 'sorted') {
      return {
        bg: 'bg-emerald-50/70 border-emerald-500 text-emerald-900',
        badge: 'Sorted',
        badgeClass: 'bg-emerald-600 text-white',
        icon: '✓',
        barColor: 'bg-gradient-to-t from-emerald-600 to-emerald-400'
      };
    }
    if (highlightType === 'swap') {
      return {
        bg: 'bg-rose-50 border-rose-600 text-rose-950 ring-2 ring-rose-400/70 scale-105 shadow-md animate-pulse',
        badge: 'Swap ⇄',
        badgeClass: 'bg-rose-600 text-white',
        icon: '⇄',
        barColor: 'bg-gradient-to-t from-rose-600 to-pink-500'
      };
    }
    if (highlightType === 'compare') {
      return {
        bg: 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/70 scale-105 shadow-md',
        badge: 'Compare ⚖',
        badgeClass: 'bg-amber-600 text-white',
        icon: '⚖',
        barColor: 'bg-gradient-to-t from-amber-600 to-yellow-400'
      };
    }
    if (isPivot || highlightType === 'target') {
      return {
        bg: 'bg-purple-50 border-purple-600 text-purple-950 ring-2 ring-purple-400/70 shadow-md',
        badge: 'Pivot ★',
        badgeClass: 'bg-purple-600 text-white',
        icon: '★',
        barColor: 'bg-gradient-to-t from-purple-600 to-indigo-500'
      };
    }
    if (highlightType === 'shifting') {
      return {
        bg: 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-400/50 shadow-md',
        badge: 'Shift →',
        badgeClass: 'bg-orange-600 text-white',
        icon: '→',
        barColor: 'bg-gradient-to-t from-orange-600 to-amber-500'
      };
    }
    if (highlightType === 'discarded') {
      return {
        bg: 'bg-slate-50 border-dashed border-slate-300 text-slate-400 opacity-40 scale-95',
        badge: 'Discarded',
        badgeClass: 'bg-slate-300 text-slate-600',
        icon: '—',
        barColor: 'bg-slate-300 opacity-30'
      };
    }
    if (isActive || highlightType === 'active') {
      return {
        bg: 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-400/50 scale-105 shadow-md',
        badge: 'Active',
        badgeClass: 'bg-indigo-600 text-white',
        icon: '●',
        barColor: 'bg-gradient-to-t from-indigo-600 to-blue-500'
      };
    }
    if (inRange) {
      return {
        bg: 'bg-slate-50/90 border-indigo-300 text-slate-800 ring-1 ring-indigo-200',
        badge: 'Range',
        badgeClass: 'bg-indigo-100 text-indigo-700',
        icon: '·',
        barColor: 'bg-gradient-to-t from-slate-400 to-indigo-400'
      };
    }
    return {
      bg: 'bg-white border-slate-200 text-slate-800 hover:border-slate-300',
      badge: '',
      badgeClass: '',
      icon: '',
      barColor: 'bg-gradient-to-t from-slate-400 to-slate-300'
    };
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-6 shadow-lg text-slate-900 relative">
      
      {/* Top Header & Live C++ Counters Strip */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>{algorithmName} State</span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Execution Complete</span>
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            {displayArray.length} elements • C++ single source of truth trace
          </p>
        </div>

        {/* Live Counters Derived Directly from C++ */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold">Comparisons:</span>
            <span className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
              {comparisons}
            </span>
          </div>

          {category === 'sorting' && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold">Swaps:</span>
                <span className="font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  {swaps}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold">Array Writes:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  {writes}
                </span>
              </div>

              {passNumber > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold">Pass:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    {passNumber}
                  </span>
                </div>
              )}

              {recursionDepth > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 text-[10px] uppercase font-sans font-semibold">Depth:</span>
                  <span className="font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {recursionDepth}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto lg:ml-2">
            <button
              onClick={() => setDisplayMode('bars')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                displayMode === 'bars'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Bar Chart visualization"
              aria-label="Bar Chart view"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bars</span>
            </button>
            <button
              onClick={() => setDisplayMode('cells')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                displayMode === 'cells'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cell Grid visualization"
              aria-label="Cell Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Cells</span>
            </button>
          </div>
        </div>
      </div>

      {/* Subarray Boundaries Banner if active */}
      {rangeLow >= 0 && rangeHigh >= 0 && (
        <div className="flex items-center justify-between text-xs font-mono bg-indigo-50/70 border border-indigo-200 rounded-xl px-4 py-2 text-indigo-900">
          <div className="flex items-center gap-2">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-indigo-700">Active Subarray:</span>
            <span>[{rangeLow} ... {rangeHigh}] (size: {rangeHigh - rangeLow + 1})</span>
          </div>
          {pivotIndex >= 0 && (
            <div className="flex items-center gap-1 font-semibold text-purple-700">
              <Target className="w-3.5 h-3.5" />
              <span>Pivot: arr[{pivotIndex}] = {displayArray[pivotIndex]}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas View Area */}
      {displayArray.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Array is empty (0 elements)</p>
          <p className="text-xs text-slate-400">Use input controls above to add numbers.</p>
        </div>
      ) : displayMode === 'bars' ? (
        /* BAR CHART MODE */
        <div className="py-6 px-2 min-h-[300px] flex items-end justify-center gap-2 sm:gap-3 overflow-x-auto border border-slate-100 rounded-2xl bg-gradient-to-b from-slate-50/50 to-white">
          {displayArray.map((val, idx) => {
            const state = getElementState(idx);
            // Calculate proportional height between 40px and 220px
            const normalized = ((val - minVal) / range) * 180 + 40;
            const heightPx = Math.max(35, Math.min(220, Math.round(normalized)));
            const activePointers = pointers.filter((p) => p.index === idx);

            return (
              <div
                key={`bar-${idx}`}
                className="flex flex-col items-center gap-2 transition-all duration-300 min-w-[36px] sm:min-w-[48px] max-w-[64px] flex-1 group"
                aria-label={`Index ${idx}: value ${val}`}
              >
                {/* Pointer Markers above bar */}
                <div className="h-6 flex flex-col items-center justify-end">
                  {activePointers.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-indigo-600 text-white shadow-xs animate-bounce"
                    >
                      ↓ {p.name}
                    </span>
                  ))}
                </div>

                {/* State Tag */}
                {state.badge && (
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${state.badgeClass} shadow-xs truncate max-w-full text-center`}>
                    {state.badge}
                  </span>
                )}

                {/* Bar Element */}
                <div
                  style={{ height: `${heightPx}px` }}
                  className={`w-full rounded-t-xl border-2 transition-all duration-300 flex flex-col justify-between items-center py-2 ${state.bg} ${state.barColor}`}
                >
                  <span className="font-mono text-xs sm:text-sm font-extrabold text-white drop-shadow-md">
                    {val}
                  </span>
                  {state.icon && (
                    <span className="text-[10px] text-white/90 font-bold">
                      {state.icon}
                    </span>
                  )}
                </div>

                {/* Index label below */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    [{idx}]
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* CELL GRID MODE */
        <div className="py-6 px-2 min-h-[200px] flex flex-wrap items-center justify-center gap-3 overflow-x-auto border border-slate-100 rounded-2xl bg-slate-50/50">
          {displayArray.map((val, idx) => {
            const state = getElementState(idx);
            const activePointers = pointers.filter((p) => p.index === idx);

            return (
              <div
                key={`cell-${idx}`}
                className="flex flex-col items-center gap-1.5 transition-all duration-300 min-w-[60px]"
                aria-label={`Index ${idx}: value ${val}`}
              >
                {/* Pointer Tag */}
                <div className="h-5 flex items-center justify-center">
                  {activePointers.map((p, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-indigo-600 text-white shadow-xs animate-bounce"
                    >
                      ↓ {p.name}
                    </span>
                  ))}
                </div>

                {/* Cell Box */}
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center p-2 relative transition-all duration-300 ${state.bg}`}
                >
                  <span className="font-mono text-base sm:text-lg font-extrabold tracking-tight">
                    {val}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    Idx: {idx}
                  </span>
                  {state.badge && (
                    <span
                      className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${state.badgeClass} shadow-xs truncate`}
                    >
                      {state.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Visual State Legend (Shapes, Icons & Labels) */}
      <div className="pt-4 border-t border-slate-200">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
          State Indicators & Accessibility Legend
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900">
            <span className="w-3.5 h-3.5 rounded bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold">⚖</span>
            <span className="font-medium text-[11px]">Compare</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-900">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">⇄</span>
            <span className="font-medium text-[11px]">Swap</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900">
            <span className="w-3.5 h-3.5 rounded bg-purple-600 text-white flex items-center justify-center text-[9px] font-bold">★</span>
            <span className="font-medium text-[11px]">Pivot / Key</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">✓</span>
            <span className="font-medium text-[11px]">Sorted Position</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-900">
            <span className="w-3.5 h-3.5 rounded bg-indigo-600 text-white flex items-center justify-center text-[9px] font-bold">●</span>
            <span className="font-medium text-[11px]">Active Pointer</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-orange-50/70 border border-orange-200 text-orange-900">
            <span className="w-3.5 h-3.5 rounded bg-orange-500 text-white flex items-center justify-center text-[9px] font-bold">→</span>
            <span className="font-medium text-[11px]">Shift / Write</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <span className="w-3.5 h-3.5 rounded bg-slate-400 text-white flex items-center justify-center text-[9px] font-bold">·</span>
            <span className="font-medium text-[11px]">Normal Slot</span>
          </div>
        </div>
      </div>

    </div>
  );
};
