import React from 'react';
import type { TraceStep } from '../../types/trace';

interface HanoiCanvasProps {
  currentStep?: TraceStep;
  numDisks: number;
}

// Parse peg arrays from step variables
function parsePeg(vars: Record<string, string | number | boolean>, key: string): number[] {
  const raw = vars[key];
  if (typeof raw !== 'string') return [];
  // Format: [3,2,1] or []
  const inner = raw.replace(/[[\]]/g, '').trim();
  if (!inner) return [];
  return inner.split(',').map(Number).filter(n => !isNaN(n));
}

const PEG_COLORS = ['A', 'B', 'C'];
const PEG_LABELS: Record<string, string> = { A: 'Source', B: 'Auxiliary', C: 'Destination' };
const PEG_ACCENTS: Record<string, string> = {
  A: 'from-indigo-700 to-indigo-900',
  B: 'from-amber-700 to-amber-900',
  C: 'from-emerald-700 to-emerald-900',
};

function getDiskColor(diskNum: number, maxDisk: number): string {
  const ratio = diskNum / maxDisk;
  if (ratio > 0.8) return 'bg-rose-500 border-rose-400 shadow-rose-900/50';
  if (ratio > 0.6) return 'bg-orange-500 border-orange-400 shadow-orange-900/50';
  if (ratio > 0.4) return 'bg-amber-500 border-amber-400 shadow-amber-900/50';
  if (ratio > 0.2) return 'bg-cyan-500 border-cyan-400 shadow-cyan-900/50';
  return 'bg-indigo-500 border-indigo-400 shadow-indigo-900/50';
}

export const HanoiCanvas: React.FC<HanoiCanvasProps> = ({ currentStep, numDisks }) => {
  const vars = currentStep?.variables || {};
  const eventType = currentStep?.eventType || '';

  const pegA = parsePeg(vars, 'A');
  const pegB = parsePeg(vars, 'B');
  const pegC = parsePeg(vars, 'C');

  const pegs: Record<string, number[]> = { A: pegA, B: pegB, C: pegC };
  const diskMoved = vars['disk'] ? Number(vars['disk']) : -1;
  const fromPeg = vars['from'] || '';
  const toPeg = vars['to'] || '';
  const totalMoves = currentStep?.passNumber ?? 0;

  // Max disk width scaling
  const maxDisk = numDisks;
  const MIN_WIDTH_PCT = 15;
  const MAX_WIDTH_PCT = 75;

  const getDiskWidth = (disk: number) => {
    if (maxDisk <= 1) return MAX_WIDTH_PCT;
    return MIN_WIDTH_PCT + ((disk - 1) / (maxDisk - 1)) * (MAX_WIDTH_PCT - MIN_WIDTH_PCT);
  };

  return (
    <div className="relative w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl p-6 overflow-hidden">
      {/* Background dots */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }}
      />

      {/* Stats bar */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Disks: </span>
            <span className="text-indigo-300 font-bold">{numDisks}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">
            <span className="text-slate-500">Moves: </span>
            <span className="text-amber-300 font-bold">{totalMoves}</span>
            <span className="text-slate-500"> / </span>
            <span className="text-slate-400">{Math.pow(2, numDisks) - 1}</span>
          </div>
        </div>
        {eventType === 'disk_move' && diskMoved > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs font-mono text-emerald-200 animate-pulse">
            Moving disk <strong>{diskMoved}</strong>: {fromPeg} → {toPeg}
          </div>
        )}
      </div>

      {/* Pegs */}
      <div className="flex items-end justify-around gap-4 relative z-10" style={{ minHeight: '260px' }}>
        {PEG_COLORS.map(pegId => {
          const diskStack = pegs[pegId] || [];
          const isSource = fromPeg === pegId && eventType === 'disk_move';
          const isDest   = toPeg   === pegId && eventType === 'disk_move';

          return (
            <div key={pegId} className="flex flex-col items-center flex-1 gap-1">
              {/* Label */}
              <div className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${
                isSource ? 'text-amber-300' : isDest ? 'text-emerald-300' : 'text-slate-500'
              }`}>
                {pegId} — {PEG_LABELS[pegId]}
              </div>

              {/* Peg area: disks + pole */}
              <div className="relative flex flex-col-reverse items-center w-full" style={{ minHeight: '200px' }}>
                {/* Pole */}
                <div className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 rounded-full bg-gradient-to-b ${PEG_ACCENTS[pegId]} opacity-80`} />

                {/* Disks (bottom = index 0) */}
                <div className="absolute bottom-0 flex flex-col-reverse items-center w-full gap-0.5">
                  {diskStack.map((disk, idx) => {
                    const isMovingDisk = disk === diskMoved && (isSource || isDest);
                    const widthPct = getDiskWidth(disk);
                    const color = getDiskColor(disk, maxDisk);
                    return (
                      <div
                        key={idx}
                        className={`relative flex items-center justify-center rounded-lg border-2 shadow-md font-mono text-[11px] font-bold text-white h-6 transition-all duration-300 ${color} ${isMovingDisk ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-110 z-10' : ''}`}
                        style={{ width: `${widthPct}%` }}
                      >
                        {disk}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Base */}
              <div className={`w-full h-2.5 rounded-full bg-gradient-to-r ${PEG_ACCENTS[pegId]} opacity-60 mt-0.5`} />
            </div>
          );
        })}
      </div>

      {/* Completion overlay */}
      {currentStep?.isCompleted && !currentStep.eventType?.includes('error') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-6 py-4 bg-emerald-950/90 border-2 border-emerald-500 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-emerald-300 font-bold text-sm">All disks on peg C!</div>
            <div className="text-emerald-400/80 text-xs font-mono">{totalMoves} moves total</div>
          </div>
        </div>
      )}
    </div>
  );
};
