import React from 'react';
import type { GraphVertexSnapshot, GraphEdgeSnapshot } from '../../types/trace';
import { ArrowRight, ListTree } from 'lucide-react';

interface AdjacencyListViewProps {
  vertices: GraphVertexSnapshot[];
  edges: GraphEdgeSnapshot[];
  directed: boolean;
  weighted: boolean;
}

export const AdjacencyListView: React.FC<AdjacencyListViewProps> = ({
  vertices,
  edges,
  directed,
  weighted
}) => {
  // Build adjacency list map
  const adjMap: Record<number, { to: number; weight: number }[]> = {};
  for (const v of vertices) {
    adjMap[v.id] = [];
  }

  for (const e of edges) {
    if (adjMap[e.u]) {
      adjMap[e.u].push({ to: e.v, weight: e.weight });
    }
    if (!directed && e.u !== e.v && adjMap[e.v]) {
      adjMap[e.v].push({ to: e.u, weight: e.weight });
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ListTree className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold tracking-wide">Adjacency List Representation</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Space: <span className="text-emerald-400 font-bold">O(V + E)</span>
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs max-h-[360px] overflow-y-auto pr-1">
        {vertices.map((v) => {
          const neighbors = adjMap[v.id] || [];
          return (
            <div
              key={v.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-bold flex items-center justify-center shrink-0">
                {v.id}
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

              <div className="flex flex-wrap items-center gap-2 flex-1">
                {neighbors.length === 0 ? (
                  <span className="text-slate-600 italic font-sans text-xs">∅ (Isolated / No outgoing edges)</span>
                ) : (
                  neighbors.map((nb, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/70"
                    >
                      <span className="font-bold text-slate-200">{nb.to}</span>
                      {weighted && (
                        <span className="text-[10px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/40 font-semibold">
                          w={nb.weight}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
