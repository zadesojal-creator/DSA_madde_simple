import React from 'react';
import { Info, CheckCircle2, Clock, AlertTriangle, ArrowRight, Ban, Zap } from 'lucide-react';

export const GraphLegend: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
        <Info className="w-3.5 h-3.5 text-indigo-500" />
        <span>Graph Visualizer Key</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
        {/* Unvisited */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
          <div className="w-4 h-4 rounded-full border-2 border-slate-400 bg-white flex items-center justify-center text-[9px] font-bold">
            v
          </div>
          <span className="font-medium">Unvisited</span>
        </div>

        {/* Active / Current */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
          <div className="w-4 h-4 rounded-full border-2 border-indigo-600 bg-indigo-100 flex items-center justify-center text-[9px] font-bold animate-pulse">
            <Zap className="w-2.5 h-2.5 text-indigo-600" />
          </div>
          <span className="font-medium">Active</span>
        </div>

        {/* Discovered / In-Queue */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
          <div className="w-4 h-4 rounded-full border-2 border-amber-500 bg-amber-100 flex items-center justify-center text-[9px] font-bold">
            <Clock className="w-2.5 h-2.5 text-amber-600" />
          </div>
          <span className="font-medium">Discovered</span>
        </div>

        {/* Visited / Finalized */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 bg-emerald-100 flex items-center justify-center text-[9px] font-bold">
            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
          </div>
          <span className="font-medium">Finalized</span>
        </div>

        {/* Unreachable */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-300 border-dashed text-slate-500">
          <div className="w-4 h-4 rounded-full border-2 border-dashed border-slate-400 bg-slate-200 flex items-center justify-center text-[9px] font-bold">
            <Ban className="w-2.5 h-2.5 text-slate-400" />
          </div>
          <span className="font-medium">Unreachable</span>
        </div>

        {/* Negative Cycle */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
          <div className="w-4 h-4 rounded-full border-2 border-rose-500 bg-rose-100 flex items-center justify-center text-[9px] font-bold">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
          </div>
          <span className="font-medium">Neg Cycle</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-0.5 bg-slate-400"></div>
          <span>Normal Edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 bg-cyan-500 rounded"></div>
          <span>Active Edge / Examining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 bg-emerald-500 rounded"></div>
          <span>Relaxed / Shortest Path Edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          <span>Directed Arrow</span>
        </div>
      </div>
    </div>
  );
};
