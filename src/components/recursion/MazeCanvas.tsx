import React from 'react';
import type { TraceStep } from '../../types/trace';

interface MazeCanvasProps {
  currentStep?: TraceStep;
  rows: number;
  cols: number;
}

// Cell encoding (matches C++ flattenGrid):
// 0 = open, 1 = wall, 2 = visited/candidate, 3 = solution path, 4 = start, 5 = goal
const CELL_STYLES: Record<number, string> = {
  0: 'bg-slate-800 border-slate-700',
  1: 'bg-slate-600 border-slate-500 shadow-inner',
  2: 'bg-amber-900/80 border-amber-600',
  3: 'bg-emerald-700/90 border-emerald-500',
  4: 'bg-indigo-600 border-indigo-400',
  5: 'bg-rose-600 border-rose-400',
};

const CELL_LABELS: Record<number, string> = {
  4: 'S',
  5: 'G',
};

export const MazeCanvas: React.FC<MazeCanvasProps> = ({ currentStep, rows, cols }) => {
  const grid = currentStep?.arrayState || [];
  const eventType = currentStep?.eventType || '';
  const isSolved = eventType === 'destination_reached' || currentStep?.isCompleted;

  // Determine active cell from variables
  const vars = currentStep?.variables || {};
  const activeRow = vars['row'] !== undefined ? Number(vars['row']) : -1;
  const activeCol = vars['col'] !== undefined ? Number(vars['col']) : -1;

  if (rows === 0 || cols === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-900 rounded-2xl border border-slate-800 text-slate-500 text-sm">
        No maze data. Run the algorithm first.
      </div>
    );
  }

  const cellSize = Math.min(Math.floor(480 / Math.max(rows, cols)), 56);

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl p-6 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">S = Start</span>
          <span className="px-2 py-1 rounded bg-rose-950 border border-rose-800 text-rose-300">G = Goal</span>
          <span className="px-2 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300">Visited</span>
          <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">Path</span>
        </div>
        <div className="text-[11px] font-mono text-slate-500">{rows}×{cols} grid</div>
      </div>

      {/* Grid */}
      <div className="relative z-10 flex flex-col items-center gap-0.5 overflow-auto">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex gap-0.5">
            {Array.from({ length: cols }, (_, c) => {
              const cellVal = grid[r * cols + c] ?? 0;
              const isActive = r === activeRow && c === activeCol;
              const style = CELL_STYLES[cellVal] ?? CELL_STYLES[0];
              const label = CELL_LABELS[cellVal] ?? '';

              return (
                <div
                  key={c}
                  className={`relative flex items-center justify-center rounded border font-mono font-bold text-[11px] transition-all duration-200
                    ${style}
                    ${isActive ? 'ring-2 ring-white scale-110 z-10 shadow-lg shadow-white/20' : ''}
                    ${cellVal === 1 ? 'text-slate-400' : 'text-white'}
                  `}
                  style={{ width: cellSize, height: cellSize }}
                >
                  {label}
                  {isActive && cellVal !== 4 && cellVal !== 5 && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-80" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="relative z-10 mt-4 text-center text-xs font-mono">
        {eventType === 'backtrack' && (
          <span className="text-rose-400">↩ Backtracking — dead end</span>
        )}
        {eventType === 'cell_visit' && (
          <span className="text-amber-300">→ Visiting cell ({activeRow},{activeCol})</span>
        )}
        {eventType === 'destination_reached' && (
          <span className="text-emerald-300 font-bold">✓ Path found!</span>
        )}
        {currentStep?.isCompleted && !isSolved && eventType !== 'destination_reached' && (
          <span className="text-rose-400">✗ No path found — goal is unreachable</span>
        )}
      </div>
    </div>
  );
};
