import React from 'react';
import type { TraceStep } from '../../types/trace';

interface NQueensBoardProps {
  currentStep?: TraceStep;
  n: number;
}

// Board encoding (from C++ flatBoard):
// 0 = empty, 1 = queen placed, 2 = candidate/highlighted
const QUEEN_SYMBOL = '♛';

function getCellClass(val: number, isActive: boolean, isDark: boolean): string {
  const base = isDark ? 'bg-slate-700/40' : 'bg-slate-800/20';
  if (val === 1) return 'bg-violet-800/80 border-violet-500 shadow-inner shadow-violet-900/50';
  if (val === 2) {
    if (isActive) return 'bg-amber-700/80 border-amber-400 ring-2 ring-amber-400/60';
    return 'bg-amber-900/40 border-amber-700/60';
  }
  if (isActive) return `${base} border-white/40 ring-1 ring-white/30`;
  return `${base} border-slate-700/20`;
}

export const NQueensBoard: React.FC<NQueensBoardProps> = ({ currentStep, n }) => {
  const boardFlat = currentStep?.arrayState || [];
  const eventType = currentStep?.eventType || '';
  const vars = currentStep?.variables || {};
  const solutionCount = Number(vars['solutions'] || 0);

  const activeRow = vars['row'] !== undefined ? Number(vars['row']) : -1;
  const activeCol = vars['col'] !== undefined ? Number(vars['col']) : -1;

  const boardSize = n > 0 ? n : 6;
  const cellSize = Math.min(Math.floor(440 / boardSize), 60);

  const getCell = (r: number, c: number): number => {
    if (boardFlat.length === boardSize * boardSize) return boardFlat[r * boardSize + c];
    return 0;
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="text-sm font-bold text-slate-200">{boardSize}-Queens Board</div>
        <div className="flex gap-2 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-violet-950 border border-violet-700 text-violet-200">{QUEEN_SYMBOL} Placed</span>
          <span className="px-2 py-1 rounded bg-amber-950 border border-amber-700 text-amber-200">Candidate</span>
          {solutionCount > 0 && (
            <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-700 text-emerald-200">
              Solutions: {solutionCount}
            </span>
          )}
        </div>
      </div>

      {/* Board grid */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        {/* Column indices */}
        <div className="flex gap-0.5 mb-0.5">
          <div style={{ width: 20 }} />
          {Array.from({ length: boardSize }, (_, c) => (
            <div key={c} className="flex items-center justify-center text-[10px] font-mono text-slate-600 font-bold"
              style={{ width: cellSize }}>
              {c}
            </div>
          ))}
        </div>

        {Array.from({ length: boardSize }, (_, r) => (
          <div key={r} className="flex items-center gap-0.5">
            {/* Row index */}
            <div className="text-[10px] font-mono text-slate-600 font-bold flex items-center justify-center" style={{ width: 20 }}>
              {r}
            </div>
            {Array.from({ length: boardSize }, (_, c) => {
              const val = getCell(r, c);
              const isActive = r === activeRow && c === activeCol;
              const isDark = (r + c) % 2 === 0;
              const cls = getCellClass(val, isActive, isDark);
              const isCurrentRow = r === activeRow && eventType !== 'complete' && eventType !== 'solution_found';

              return (
                <div
                  key={c}
                  className={`relative flex items-center justify-center rounded border transition-all duration-200 ${cls}
                    ${isCurrentRow && val !== 1 ? 'border-slate-500/40' : ''}
                  `}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {val === 1 && (
                    <span className="text-violet-200 select-none" style={{ fontSize: Math.max(cellSize * 0.55, 14) }}>
                      {QUEEN_SYMBOL}
                    </span>
                  )}
                  {val === 2 && isActive && (
                    <span className="text-amber-300 font-bold select-none text-xs">?</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Status banner */}
      <div className="relative z-10 mt-4 text-center text-xs font-mono">
        {eventType === 'queen_placed' && (
          <span className="text-violet-300">♛ Queen placed at ({activeRow},{activeCol})</span>
        )}
        {eventType === 'backtrack' && (
          <span className="text-rose-400">↩ Conflict detected / Backtracking from row {activeRow}</span>
        )}
        {eventType === 'solution_found' && (
          <span className="text-emerald-300 font-bold">✓ Solution #{solutionCount} placed!</span>
        )}
        {eventType === 'search_complete' && (
          <span className="text-emerald-300 font-bold">✓ Search complete — {solutionCount} solution(s) visualized</span>
        )}
      </div>
    </div>
  );
};
