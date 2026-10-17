import React from 'react';
import type { GraphVertexSnapshot, GraphEdgeSnapshot } from '../../types/trace';
import { Grid, HelpCircle } from 'lucide-react';

interface AdjacencyMatrixViewProps {
  vertices: GraphVertexSnapshot[];
  edges: GraphEdgeSnapshot[];
  directed: boolean;
  weighted: boolean;
}

export const AdjacencyMatrixView: React.FC<AdjacencyMatrixViewProps> = ({
  vertices,
  edges,
  directed,
  weighted
}) => {
  const V = vertices.length;
  // Initialize matrix
  const matrix: (number | string)[][] = Array.from({ length: V }, () =>
    Array.from({ length: V }, () => (weighted ? '∞' : '0'))
  );

  // Diagonal 0
  for (let i = 0; i < V; i++) {
    matrix[i][i] = 0;
  }

  // Populate edges
  for (const e of edges) {
    if (e.u < V && e.v < V) {
      matrix[e.u][e.v] = weighted ? e.weight : 1;
      if (!directed) {
        matrix[e.v][e.u] = weighted ? e.weight : 1;
      }
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-wide">Adjacency Matrix Representation</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Dimensions: </span>
          <span className="text-cyan-400 font-bold">{V} × {V}</span>
          <span className="mx-1">•</span>
          <span>Space: </span>
          <span className="text-amber-400 font-bold">O(V²)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center font-mono text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-slate-500 bg-slate-950/80 border border-slate-800 rounded-tl-lg">
                u \ v
              </th>
              {vertices.map((v) => (
                <th
                  key={v.id}
                  className="p-2 bg-slate-950/60 text-indigo-400 font-bold border border-slate-800"
                >
                  {v.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vertices.map((u) => (
              <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                <th className="p-2 bg-slate-950/60 text-indigo-400 font-bold border border-slate-800">
                  {u.id}
                </th>
                {vertices.map((v) => {
                  const val = matrix[u.id][v.id];
                  const isSelf = u.id === v.id;
                  const hasEdge = val !== 0 && val !== '∞';

                  return (
                    <td
                      key={v.id}
                      className={`p-2 border border-slate-800/80 transition-colors ${
                        isSelf
                          ? 'bg-slate-950/30 text-slate-600'
                          : hasEdge
                          ? 'bg-indigo-950/40 text-emerald-300 font-bold'
                          : 'text-slate-600'
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <span>
          Cell <code className="text-cyan-300 font-mono">[u][v]</code> indicates direct connection cost from vertex <code className="text-cyan-300 font-mono">u</code> to <code className="text-cyan-300 font-mono">v</code>.
        </span>
      </div>
    </div>
  );
};
