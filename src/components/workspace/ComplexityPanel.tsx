import React from 'react';
import type { ComplexityInfo } from '../../types/trace';
import { Gauge, Clock, HardDrive, CheckCircle2, XCircle, Lightbulb, Activity } from 'lucide-react';

interface ComplexityPanelProps {
  complexity: ComplexityInfo;
  observedCounters?: {
    comparisons?: number;
    swaps?: number;
    writes?: number;
    passNumber?: number;
    recursionDepth?: number;
  };
}

const formatBigO = (complexity: string): string =>
  complexity.startsWith('O(') ? complexity : `O(${complexity})`;

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ 
  complexity, 
  observedCounters 
}) => {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 space-y-5 shadow-md text-slate-900">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Complexity & Algorithmic Properties
          </h4>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          Theoretical Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Time Complexity Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Time Complexity
            </span>
            <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200">
              {formatBigO(complexity.timeComplexity.worst)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] font-mono text-center">
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <div className="text-slate-400 text-[9px] uppercase">Best</div>
              <div className="text-slate-900 font-bold">{complexity.timeComplexity.best}</div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <div className="text-slate-400 text-[9px] uppercase">Avg</div>
              <div className="text-slate-900 font-bold">{complexity.timeComplexity.average}</div>
            </div>
            <div className="bg-white p-1.5 rounded border border-slate-200">
              <div className="text-slate-400 text-[9px] uppercase">Worst</div>
              <div className="text-slate-900 font-bold">{complexity.timeComplexity.worst}</div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-snug pt-1">
            {complexity.timeComplexity.description}
          </p>
        </div>

        {/* Space Complexity Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-purple-600" />
              Space Complexity
            </span>
            <span className="font-mono text-xs font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
              {formatBigO(complexity.spaceComplexity.worst)}
            </span>
          </div>

          <div className="bg-white p-1.5 rounded border border-slate-200 text-[11px] font-mono text-center">
            <div className="text-slate-400 text-[9px] uppercase">Auxiliary Memory</div>
            <div className="text-purple-900 font-bold">{complexity.spaceComplexity.worst}</div>
          </div>

          <p className="text-xs text-slate-600 leading-snug pt-1">
            {complexity.spaceComplexity.description}
          </p>
        </div>

      </div>

      {/* Stability & In-Place Grid */}
      {(complexity.stability || complexity.inPlace) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {complexity.stability && (
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Stability:</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  complexity.stability.isStable 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {complexity.stability.isStable ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{complexity.stability.isStable ? 'Stable' : 'Unstable'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {complexity.stability.description}
              </p>
            </div>
          )}

          {complexity.inPlace && (
            <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">In-Place:</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  complexity.inPlace.isInPlace 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  {complexity.inPlace.isInPlace ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                  <span>{complexity.inPlace.isInPlace ? 'In-Place (O(1))' : 'Out-of-Place'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {complexity.inPlace.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* When Useful */}
      {complexity.whenUseful && (
        <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80 flex items-start gap-2.5 text-xs text-indigo-950">
          <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-indigo-900">When is this useful?</span>
            <p className="text-indigo-800/90 leading-relaxed">{complexity.whenUseful}</p>
          </div>
        </div>
      )}

      {/* Observed Execution Counters vs Theoretical Complexity */}
      {observedCounters && (
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-600" />
              Observed Execution Counters (Current Run)
            </span>
            <span className="text-[10px] text-slate-400 italic">
              Input-specific • Not universal guarantees
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {observedCounters.comparisons !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                Comparisons: <strong className="text-indigo-700">{observedCounters.comparisons}</strong>
              </span>
            )}
            {observedCounters.swaps !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                Swaps: <strong className="text-rose-700">{observedCounters.swaps}</strong>
              </span>
            )}
            {observedCounters.writes !== undefined && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                Array Writes: <strong className="text-purple-700">{observedCounters.writes}</strong>
              </span>
            )}
            {observedCounters.passNumber !== undefined && observedCounters.passNumber > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                Passes: <strong className="text-amber-700">{observedCounters.passNumber}</strong>
              </span>
            )}
            {observedCounters.recursionDepth !== undefined && observedCounters.recursionDepth > 0 && (
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
                Max Depth: <strong className="text-teal-700">{observedCounters.recursionDepth}</strong>
              </span>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
