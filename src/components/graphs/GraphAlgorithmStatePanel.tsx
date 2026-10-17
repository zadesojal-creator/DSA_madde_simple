import React from 'react';
import type { TraceStep } from '../../types/trace';
import { Layers, Activity, AlertTriangle, ArrowRight, Route, Clock, ListOrdered } from 'lucide-react';

interface GraphAlgorithmStatePanelProps {
  currentStep?: TraceStep;
  algorithmId: string;
}

export const GraphAlgorithmStatePanel: React.FC<GraphAlgorithmStatePanelProps> = ({
  currentStep,
  algorithmId
}) => {
  if (!currentStep) return null;

  const vertices = currentStep.graphVertices || [];
  const queue = currentStep.queueState || [];
  const callStack = currentStep.callStack || [];
  const pq = currentStep.priorityQueueState || [];
  const traversalOutput = currentStep.traversalOutput || [];
  const path = currentStep.reconstructedPath || [];
  const distMatrix = currentCurrentDistanceMatrix(currentStep);
  const hasNegCycle = currentStep.hasNegativeCycle;

  function currentCurrentDistanceMatrix(step: TraceStep): number[][] | null {
    if (step.distanceMatrix && step.distanceMatrix.length > 0) {
      return step.distanceMatrix;
    }
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-slate-100 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold tracking-wide">C++ Algorithm Runtime State</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Event: <span className="text-cyan-400 font-bold">{currentStep.eventType || 'step'}</span>
        </span>
      </div>

      {/* Negative Cycle Warning Banner */}
      {hasNegCycle && (
        <div className="flex items-start gap-3 p-3.5 bg-rose-950/70 border border-rose-500/60 rounded-xl text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-rose-300">Negative-Weight Cycle Detected!</p>
            <p className="text-rose-200/90 leading-relaxed">
              The graph contains a negative cycle reachable from the source. Distances can be decreased indefinitely; shortest paths are mathematically undefined.
            </p>
          </div>
        </div>
      )}

      {/* 1. BFS: FIFO Queue & Traversal Order */}
      {algorithmId === 'bfs' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>BFS Queue State (FIFO)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Size: {queue.length}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 min-h-[48px] overflow-x-auto">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold shrink-0">
                Front →
              </span>
              {queue.length === 0 ? (
                <span className="text-slate-600 italic font-mono text-xs">Queue is empty</span>
              ) : (
                queue.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-indigo-950 border border-indigo-500/60 text-indigo-200 font-mono text-xs font-bold shrink-0 shadow-sm"
                  >
                    {item}
                  </div>
                ))
              )}
              {queue.length > 0 && (
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold shrink-0">
                  ← Rear
                </span>
              )}
            </div>
          </div>

          {/* Traversal Order */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visitation Sequence</span>
            </span>
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
              {traversalOutput.length === 0 ? (
                <span className="text-slate-600 italic text-xs">None visited yet</span>
              ) : (
                traversalOutput.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center justify-center">
                      {v}
                    </span>
                    {idx < traversalOutput.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. DFS: Call Stack & Discovery/Finish Timestamps */}
      {algorithmId === 'dfs' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Call Stack Frames (Recursion Depth: {callStack.length})</span>
              </span>
            </div>
            <div className="flex flex-col-reverse gap-1.5 p-3 bg-slate-950/80 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
              {callStack.length === 0 ? (
                <span className="text-slate-600 italic font-mono text-xs">Stack is empty</span>
              ) : (
                callStack.map((frame, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center justify-between ${
                      idx === callStack.length - 1
                        ? 'bg-purple-950/80 border border-purple-500 text-purple-200'
                        : 'bg-slate-900 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{frame}</span>
                    {idx === callStack.length - 1 && (
                      <span className="text-[10px] uppercase font-bold text-purple-400">Top Frame</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timestamps Table */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Discovery / Finish Timestamps</span>
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-center font-mono text-xs border border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="p-1.5 border border-slate-800">Vertex</th>
                    {vertices.map((v) => (
                      <th key={v.id} className="p-1.5 border border-slate-800 text-purple-300 font-bold">
                        {v.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-900/80">
                    <td className="p-1.5 font-bold text-slate-400 border border-slate-800">d[u]</td>
                    {vertices.map((v) => (
                      <td key={v.id} className="p-1.5 border border-slate-800 text-amber-300">
                        {v.discoveryTime >= 0 ? v.discoveryTime : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-slate-900/60">
                    <td className="p-1.5 font-bold text-slate-400 border border-slate-800">f[u]</td>
                    {vertices.map((v) => (
                      <td key={v.id} className="p-1.5 border border-slate-800 text-emerald-300">
                        {v.finishTime >= 0 ? v.finishTime : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dijkstra: Min-Priority Queue & Distance Table */}
      {algorithmId === 'dijkstra' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Min-Priority Queue Entries (distance, vertex)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">Size: {pq.length}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 min-h-[48px]">
              {pq.length === 0 ? (
                <span className="text-slate-600 italic font-mono text-xs">Priority queue is empty</span>
              ) : (
                pq.map((entry, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1 rounded-lg bg-amber-950 border border-amber-500/60 text-amber-200 font-mono text-xs font-bold"
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Bellman-Ford: Pass Progress & Status */}
      {algorithmId === 'bellman-ford' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <span className="text-xs text-slate-400">Relaxation Pass</span>
              <div className="text-sm font-bold text-indigo-300 font-mono">
                {currentStep.passNumber !== undefined && currentStep.passNumber > 0
                  ? `Pass ${currentStep.passNumber} of ${Math.max(vertices.length - 1, 1)}`
                  : 'Initialization'}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs text-slate-400">Cycle Check</span>
              <div className="text-xs font-bold font-mono">
                {hasNegCycle ? (
                  <span className="text-rose-400">CYCLE FOUND</span>
                ) : (
                  <span className="text-emerald-400">Stable / None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Floyd-Warshall: Loop Indices & Distance Matrix */}
      {algorithmId === 'floyd-warshall' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs">
            <span className="text-slate-400">Current Indices:</span>
            <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
              k = {currentStep.matrixK !== undefined && currentStep.matrixK >= 0 ? currentStep.matrixK : '•'}
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              i = {currentStep.matrixI !== undefined && currentStep.matrixI >= 0 ? currentStep.matrixI : '•'}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
              j = {currentStep.matrixJ !== undefined && currentStep.matrixJ >= 0 ? currentStep.matrixJ : '•'}
            </span>
          </div>

          {distMatrix && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">All-Pairs Distance Matrix dist[i][j]</span>
              <div className="overflow-x-auto">
                <table className="w-full text-center font-mono text-xs border border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-950 text-slate-400">
                    <tr>
                      <th className="p-1.5 border border-slate-800">i \ j</th>
                      {distMatrix.map((_, col) => (
                        <th key={col} className="p-1.5 border border-slate-800 text-cyan-400 font-bold">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {distMatrix.map((row, r) => (
                      <tr key={r} className="hover:bg-slate-800/40">
                        <th className="p-1.5 bg-slate-950/60 border border-slate-800 text-cyan-400 font-bold">
                          {r}
                        </th>
                        {row.map((val, c) => {
                          const isExamined =
                            currentStep.matrixI === r && currentStep.matrixJ === c;
                          const isInfinity = val >= 1000000000;
                          return (
                            <td
                              key={c}
                              className={`p-1.5 border border-slate-800 ${
                                isExamined
                                  ? 'bg-cyan-500/20 text-cyan-200 font-bold border-cyan-500 ring-1 ring-cyan-500'
                                  : r === c
                                  ? 'text-slate-500 bg-slate-950/30'
                                  : isInfinity
                                  ? 'text-slate-600'
                                  : 'text-slate-200 font-medium'
                              }`}
                            >
                              {isInfinity ? '∞' : val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Distance Table for BFS, Dijkstra, Bellman-Ford */}
      {(algorithmId === 'bfs' || algorithmId === 'dijkstra' || algorithmId === 'bellman-ford') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Distance & Predecessor Table</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-1.5 border border-slate-800">Vertex</th>
                  {vertices.map((v) => (
                    <th key={v.id} className="p-1.5 border border-slate-800 text-indigo-300 font-bold">
                      {v.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-slate-900/80">
                  <td className="p-1.5 font-bold text-slate-400 border border-slate-800">dist[v]</td>
                  {vertices.map((v) => {
                    const isInf = !v.hasDistance || v.distance >= 1000000000;
                    return (
                      <td
                        key={v.id}
                        className={`p-1.5 border border-slate-800 font-bold ${
                          isInf ? 'text-slate-600' : 'text-emerald-400'
                        }`}
                      >
                        {isInf ? '∞' : v.distance}
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-slate-900/60">
                  <td className="p-1.5 font-bold text-slate-400 border border-slate-800">parent[v]</td>
                  {vertices.map((v) => (
                    <td key={v.id} className="p-1.5 border border-slate-800 text-slate-300">
                      {v.predecessor !== -1 ? v.predecessor : '∅'}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-900/40">
                  <td className="p-1.5 font-bold text-slate-400 border border-slate-800">status</td>
                  {vertices.map((v) => (
                    <td key={v.id} className="p-1.5 border border-slate-800 text-[10px] capitalize text-slate-400">
                      {v.state}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reconstructed Path Card */}
      {path.length > 0 && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <Route className="w-4 h-4 text-emerald-400" />
            <span>Reconstructed Shortest Path</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {path.map((node, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-900/80 border border-emerald-500 text-emerald-200 font-bold">
                  {node}
                </span>
                {idx < path.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
            ))}
            <span className="text-slate-400 text-xs font-sans pl-2">
              (Total Hops/Nodes: {path.length})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
