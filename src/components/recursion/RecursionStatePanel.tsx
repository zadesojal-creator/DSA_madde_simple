import React from 'react';
import type { TraceStep } from '../../types/trace';
import { ArrowRight, RefreshCw, AlertCircle, Info } from 'lucide-react';

interface RecursionStatePanelProps {
  currentStep?: TraceStep;
  algorithmId: string;
}

const EVENT_BADGE: Record<string, { label: string; color: string }> = {
  function_enter:    { label: 'Enter',    color: 'bg-indigo-900/60 border-indigo-600 text-indigo-200' },
  base_case:         { label: 'Base Case', color: 'bg-emerald-900/60 border-emerald-600 text-emerald-200' },
  recursive_call:    { label: 'Recurse',  color: 'bg-cyan-900/60 border-cyan-600 text-cyan-200' },
  first_call:        { label: 'Left Call', color: 'bg-cyan-900/60 border-cyan-600 text-cyan-200' },
  second_call:       { label: 'Right Call', color: 'bg-purple-900/60 border-purple-600 text-purple-200' },
  multiply_return:   { label: 'Multiply', color: 'bg-amber-900/60 border-amber-600 text-amber-200' },
  add_return:        { label: 'Add & Return', color: 'bg-amber-900/60 border-amber-600 text-amber-200' },
  disk_move:         { label: 'Disk Move', color: 'bg-teal-900/60 border-teal-600 text-teal-200' },
  base_move:         { label: 'Base Move', color: 'bg-emerald-900/60 border-emerald-600 text-emerald-200' },
  recursive_call_1:  { label: 'Step 1', color: 'bg-cyan-900/60 border-cyan-600 text-cyan-200' },
  recursive_call_2:  { label: 'Step 3', color: 'bg-purple-900/60 border-purple-600 text-purple-200' },
  cell_visit:        { label: 'Visit', color: 'bg-amber-900/60 border-amber-600 text-amber-200' },
  cell_reject:       { label: 'Reject', color: 'bg-rose-900/60 border-rose-600 text-rose-200' },
  backtrack:         { label: 'Backtrack', color: 'bg-rose-900/60 border-rose-600 text-rose-200' },
  destination_reached: { label: 'Goal!', color: 'bg-emerald-900/80 border-emerald-400 text-emerald-100' },
  exploration_branch:  { label: 'Explore', color: 'bg-slate-800 border-slate-600 text-slate-300' },
  row_enter:         { label: 'Row Enter', color: 'bg-indigo-900/60 border-indigo-600 text-indigo-200' },
  candidate_column:  { label: 'Candidate', color: 'bg-cyan-900/60 border-cyan-600 text-cyan-200' },
  placement_rejected: { label: 'Rejected', color: 'bg-rose-900/60 border-rose-600 text-rose-200' },
  queen_placed:      { label: 'Placed', color: 'bg-violet-900/60 border-violet-600 text-violet-200' },
  solution_found:    { label: 'Solution!', color: 'bg-emerald-900/80 border-emerald-400 text-emerald-100' },
  complete:          { label: 'Complete', color: 'bg-slate-800 border-slate-600 text-slate-200' },
  search_complete:   { label: 'Done', color: 'bg-slate-800 border-slate-600 text-slate-200' },
  error:             { label: 'Error', color: 'bg-rose-900/60 border-rose-500 text-rose-200' },
};

export const RecursionStatePanel: React.FC<RecursionStatePanelProps> = ({ currentStep, algorithmId }) => {
  if (!currentStep) return null;

  const et = currentStep.eventType || 'step';
  const badge = EVENT_BADGE[et] || { label: et, color: 'bg-slate-800 border-slate-600 text-slate-300' };
  const depth = currentStep.recursionDepth ?? 0;
  const vars = currentStep.variables || {};

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-bold text-slate-100">Execution State</span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Event title & description */}
      <div className="space-y-1">
        <p className="text-sm font-bold text-slate-100">{currentStep.title}</p>
        <p className="text-xs text-slate-400 leading-relaxed">{currentStep.description}</p>
      </div>

      {/* Recursion depth indicator */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider">Recursion Depth</span>
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: Math.min(depth + 1, 16) }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm transition-all ${
                i < depth ? 'bg-indigo-600/60' : 'bg-indigo-400 ring-1 ring-indigo-300'
              }`}
            />
          ))}
          {depth > 15 && <span className="text-slate-500 text-[11px]">+{depth - 15}</span>}
        </div>
        <span className="text-indigo-300 font-mono font-bold text-xs ml-1">{depth}</span>
      </div>

      {/* Algorithm-specific state cards */}
      {algorithmId === 'factorial' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {['n', 'sub', 'return'].map(key => vars[key] !== undefined && (
              <div key={key} className="p-2 bg-slate-800/60 border border-slate-700 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-mono uppercase">{key}</div>
                <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">{vars[key]}</div>
              </div>
            ))}
          </div>
          {et === 'multiply_return' && vars['n'] && vars['sub'] && vars['return'] && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs font-mono">
              <span className="text-amber-300 font-bold">{vars['n']}</span>
              <span className="text-slate-400">×</span>
              <span className="text-amber-300 font-bold">{vars['sub']}</span>
              <span className="text-slate-400">=</span>
              <span className="text-emerald-300 font-bold text-sm">{vars['return']}</span>
            </div>
          )}
        </div>
      )}

      {algorithmId === 'fibonacci' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {['n', 'callCount'].map(key => vars[key] !== undefined && (
              <div key={key} className="p-2 bg-slate-800/60 border border-slate-700 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-mono uppercase">{key}</div>
                <div className="text-sm font-bold font-mono text-purple-300 mt-0.5">{vars[key]}</div>
              </div>
            ))}
          </div>
          {et === 'add_return' && vars['left'] && vars['right'] && vars['return'] && (
            <div className="flex items-center gap-2 p-2.5 bg-purple-950/40 border border-purple-800/60 rounded-xl text-xs font-mono">
              <span className="text-cyan-300 font-bold">{vars['left']}</span>
              <span className="text-slate-400">+</span>
              <span className="text-purple-300 font-bold">{vars['right']}</span>
              <span className="text-slate-400">=</span>
              <span className="text-emerald-300 font-bold text-sm">{vars['return']}</span>
            </div>
          )}
        </div>
      )}

      {algorithmId === 'tower-of-hanoi' && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'src', label: 'Source' },
              { key: 'dst', label: 'Dest' },
              { key: 'aux', label: 'Aux' },
            ].map(({ key, label }) => vars[key] !== undefined && (
              <div key={key} className="p-2 bg-slate-800/60 border border-slate-700 rounded-xl text-center">
                <div className="text-[10px] text-slate-500 font-mono uppercase">{label}</div>
                <div className="text-lg font-bold font-mono text-teal-300 mt-0.5">{vars[key]}</div>
              </div>
            ))}
          </div>
          {et === 'disk_move' && vars['disk'] && (
            <div className="flex items-center gap-2 p-2.5 bg-teal-950/40 border border-teal-800/60 rounded-xl text-xs font-mono font-bold">
              <span className="text-teal-300">Disk {vars['disk']}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-amber-300">{vars['from']}</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
              <span className="text-emerald-300">{vars['to']}</span>
            </div>
          )}
        </div>
      )}

      {algorithmId === 'maze' && vars['path'] && (
        <div className="p-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs font-mono">
          <span className="text-slate-500">Current path: </span>
          <span className="text-amber-300">{vars['path']}</span>
        </div>
      )}

      {algorithmId === 'n-queens' && vars['board'] && (
        <div className="p-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-xs font-mono">
          <span className="text-slate-500">Board: </span>
          <span className="text-violet-300">{vars['board']}</span>
        </div>
      )}

      {/* Error display */}
      {et === 'error' && (
        <div className="flex items-start gap-2 p-3 bg-rose-950/60 border border-rose-600/60 rounded-xl text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{currentStep.description}</span>
        </div>
      )}

      {/* Completion status */}
      {currentStep.isCompleted && et !== 'error' && (
        <div className="flex items-start gap-2 p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl text-xs text-emerald-200">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{currentStep.description}</span>
        </div>
      )}
    </div>
  );
};
