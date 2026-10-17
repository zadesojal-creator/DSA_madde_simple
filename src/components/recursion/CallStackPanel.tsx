import React from 'react';
import type { TraceStep } from '../../types/trace';

interface CallStackPanelProps {
  currentStep?: TraceStep;
  algorithmId: string;
}

const EVENT_COLORS: Record<string, string> = {
  function_enter:   'border-indigo-500 bg-indigo-950/60 text-indigo-200',
  base_case:        'border-emerald-500 bg-emerald-950/60 text-emerald-200',
  recursive_call:   'border-cyan-500 bg-cyan-950/60 text-cyan-200',
  first_call:       'border-cyan-500 bg-cyan-950/60 text-cyan-200',
  second_call:      'border-purple-500 bg-purple-950/60 text-purple-200',
  multiply_return:  'border-amber-500 bg-amber-950/60 text-amber-200',
  add_return:       'border-amber-500 bg-amber-950/60 text-amber-200',
  backtrack:        'border-rose-500 bg-rose-950/60 text-rose-200',
  disk_move:        'border-teal-500 bg-teal-950/60 text-teal-200',
  queen_placed:     'border-violet-500 bg-violet-950/60 text-violet-200',
  solution_found:   'border-emerald-400 bg-emerald-950/80 text-emerald-100',
};

export const CallStackPanel: React.FC<CallStackPanelProps> = ({ currentStep, algorithmId }) => {
  if (!currentStep) return null;

  const frames = currentStep.callStack || [];
  const eventType = currentStep.eventType || 'step';
  const depth = currentStep.recursionDepth ?? 0;
  const vars = currentStep.variables || {};

  const topColor = EVENT_COLORS[eventType] || 'border-slate-600 bg-slate-900/60 text-slate-200';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-100 tracking-wide">Call Stack</span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-[11px] font-mono font-bold">
            depth {depth}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {frames.length} frame{frames.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Stack frames (top of stack = last element) */}
      <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
        {frames.length === 0 ? (
          <p className="text-slate-600 italic text-xs font-mono text-center py-4">Stack is empty</p>
        ) : (
          [...frames].reverse().map((frame, idx) => {
            const isTop = idx === 0;
            const color = isTop ? topColor : 'border-slate-700 bg-slate-900/40 text-slate-400';
            return (
              <div
                key={idx}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border font-mono text-xs ${color} transition-all`}
              >
                <span className="font-bold">{frame}</span>
                {isTop && (
                  <span className="text-[10px] uppercase tracking-wider opacity-70">← active</span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Variables from current frame */}
      {Object.keys(vars).length > 0 && (
        <div className="space-y-1.5 border-t border-slate-800 pt-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Local Variables</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(vars).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-[11px]">
                <span className="text-cyan-400 font-bold">{key}</span>
                <span className="text-slate-400">=</span>
                <span className="text-amber-300 font-bold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm-specific stats */}
      {algorithmId === 'fibonacci' && vars['callCount'] && (
        <div className="flex items-center justify-between p-2.5 bg-purple-950/40 border border-purple-800/50 rounded-xl text-xs">
          <span className="text-purple-300">Total fib() calls so far:</span>
          <span className="font-mono font-bold text-purple-200">{vars['callCount']}</span>
        </div>
      )}
    </div>
  );
};
