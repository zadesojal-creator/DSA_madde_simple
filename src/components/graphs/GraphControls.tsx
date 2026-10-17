import React, { useState } from 'react';
import { 
  Play, RotateCcw, Plus, ArrowRight, 
  Settings2, AlertCircle, Sparkles, FileText 
} from 'lucide-react';

export interface GraphEdgeData {
  u: number;
  v: number;
  weight: number;
}

interface GraphControlsProps {
  vertexCount: number;
  edges: GraphEdgeData[];
  directed: boolean;
  weighted: boolean;
  sourceVertex: number;
  targetVertex: number;
  viewMode: 'canvas' | 'adj-list' | 'adj-matrix';
  algorithmId: string;
  isModified: boolean;
  error?: string;
  onUpdateGraph: (newV: number, newEdges: GraphEdgeData[], newDir: boolean, newWeight: boolean) => void;
  onUpdateSourceTarget: (src: number, tgt: number) => void;
  onChangeViewMode: (mode: 'canvas' | 'adj-list' | 'adj-matrix') => void;
  onRunAlgorithm: () => void;
  onResetGraph: () => void;
  onLoadSample: (sampleType: string) => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  vertexCount,
  edges,
  directed,
  weighted,
  sourceVertex,
  targetVertex,
  viewMode,
  algorithmId,
  isModified,
  error,
  onUpdateGraph,
  onUpdateSourceTarget,
  onChangeViewMode,
  onRunAlgorithm,
  onResetGraph,
  onLoadSample
}) => {
  const [newEdgeU, setNewEdgeU] = useState(0);
  const [newEdgeV, setNewEdgeV] = useState(1);
  const [newEdgeW, setNewEdgeW] = useState(1);
  const [rawTokenInput, setRawTokenInput] = useState('');
  const [isEditingRaw, setIsEditingRaw] = useState(false);

  const maxV = algorithmId === 'floyd-warshall' ? 6 : 10;

  // Add Vertex
  const handleAddVertex = () => {
    if (vertexCount >= maxV) return;
    onUpdateGraph(vertexCount + 1, edges, directed, weighted);
  };

  // Remove Vertex (called from the Add Vertex button row via a paired minus action)
  const handleRemoveVertex = () => {
    if (vertexCount <= 1) return;
    const removedId = vertexCount - 1;
    const filteredEdges = edges.filter((e) => e.u !== removedId && e.v !== removedId);
    let newSrc = sourceVertex;
    let newTgt = targetVertex;
    if (newSrc >= removedId) newSrc = 0;
    if (newTgt >= removedId) newTgt = -1;
    onUpdateSourceTarget(newSrc, newTgt);
    onUpdateGraph(vertexCount - 1, filteredEdges, directed, weighted);
  };

  // Add Edge
  const handleAddEdge = () => {
    if (newEdgeU < 0 || newEdgeU >= vertexCount || newEdgeV < 0 || newEdgeV >= vertexCount) return;
    // Check if edge already exists
    const exists = edges.some(
      (e) => (e.u === newEdgeU && e.v === newEdgeV) || (!directed && e.u === newEdgeV && e.v === newEdgeU)
    );
    if (exists) {
      // Update weight
      const updated = edges.map((e) =>
        (e.u === newEdgeU && e.v === newEdgeV) || (!directed && e.u === newEdgeV && e.v === newEdgeU)
          ? { ...e, weight: weighted ? newEdgeW : 1 }
          : e
      );
      onUpdateGraph(vertexCount, updated, directed, weighted);
    } else {
      onUpdateGraph(vertexCount, [...edges, { u: newEdgeU, v: newEdgeV, weight: weighted ? newEdgeW : 1 }], directed, weighted);
    }
  };

  // Delete Edge
  const handleDeleteEdge = (index: number) => {
    const updated = edges.filter((_, idx) => idx !== index);
    onUpdateGraph(vertexCount, updated, directed, weighted);
  };

  // Parse Raw input
  const handleApplyRawTokens = () => {
    if (!rawTokenInput.trim() || rawTokenInput === 'sample') {
      onLoadSample('default');
      setIsEditingRaw(false);
      return;
    }
    const tokens = rawTokenInput.split(/[\s,]+/).filter(Boolean);
    const parsedEdges: GraphEdgeData[] = [];
    let computedMaxV = vertexCount - 1;

    for (const tok of tokens) {
      const parts = tok.split('-');
      if (parts.length === 2) {
        const u = Number(parts[0]);
        let v: number;
        let w = 1;
        if (parts[1].includes(':')) {
          const sub = parts[1].split(':');
          v = Number(sub[0]);
          w = Number(sub[1]) || 1;
        } else {
          v = Number(parts[1]);
        }
        if (!isNaN(u) && !isNaN(v)) {
          parsedEdges.push({ u, v, weight: weighted ? w : 1 });
          if (u > computedMaxV) computedMaxV = u;
          if (v > computedMaxV) computedMaxV = v;
        }
      }
    }

    const newV = Math.min(Math.max(computedMaxV + 1, vertexCount), maxV);
    onUpdateGraph(newV, parsedEdges, directed, weighted);
    setIsEditingRaw(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
      {/* View Switcher & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => onChangeViewMode('canvas')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'canvas'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Canvas View
          </button>
          <button
            onClick={() => onChangeViewMode('adj-list')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'adj-list'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adjacency List
          </button>
          <button
            onClick={() => onChangeViewMode('adj-matrix')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'adj-matrix'
                ? 'bg-white text-indigo-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Adjacency Matrix
          </button>
        </div>

        {/* Algorithm Execution Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunAlgorithm}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Execute C++ Algorithm</span>
          </button>
          <button
            onClick={onResetGraph}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Graph to Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation or Invalidation Notice Banner */}
      {error ? (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : isModified ? (
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Graph data changed. Click <strong>Execute C++ Algorithm</strong> to generate updated C++ trace.</span>
          </div>
          <button
            onClick={onRunAlgorithm}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold"
          >
            Run Now
          </button>
        </div>
      ) : null}

      {/* Algorithm-Specific Controls: Source and Target */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Source Vertex:
          </label>
          <select
            value={sourceVertex}
            onChange={(e) => onUpdateSourceTarget(Number(e.target.value), targetVertex)}
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Array.from({ length: vertexCount }, (_, i) => (
              <option key={i} value={i}>
                Vertex {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target Vertex:
          </label>
          <select
            value={targetVertex}
            onChange={(e) => onUpdateSourceTarget(sourceVertex, Number(e.target.value))}
            className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={-1}>None (Explore All)</option>
            {Array.from({ length: vertexCount }, (_, i) => (
              <option key={i} value={i}>
                Vertex {i}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Sample Graphs:
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) onLoadSample(e.target.value);
            }}
            defaultValue=""
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>Select a Preset...</option>
            <option value="default">Standard Sample</option>
            <option value="disconnected">Disconnected Components</option>
            <option value="cycle">Cyclic Graph</option>
            {algorithmId === 'bellman-ford' && (
              <option value="negative-weights">Reachable Negative Cycle</option>
            )}
          </select>
        </div>

        {/* Directed / Weighted Toggles */}
        <div className="flex items-center gap-2 pt-4">
          <button
            onClick={() => onUpdateGraph(vertexCount, edges, !directed, weighted)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
              directed
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {directed ? 'Directed' : 'Undirected'}
          </button>
          <button
            onClick={() => onUpdateGraph(vertexCount, edges, directed, !weighted)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-colors ${
              weighted
                ? 'bg-cyan-50 border-cyan-300 text-cyan-700'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            {weighted ? 'Weighted' : 'Unweighted'}
          </button>
        </div>
      </div>

      {/* Graph Structure Editing: Add/Remove Vertex and Edge */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Interactive Graph Editor</span>
          </span>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleAddVertex}
              disabled={vertexCount >= maxV}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vertex ({vertexCount}/{maxV})</span>
            </button>
            <button
              onClick={handleRemoveVertex}
              disabled={vertexCount <= 1}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-rose-100 disabled:opacity-40 text-slate-700 hover:text-rose-700 rounded-lg font-medium"
              title="Remove last vertex and its edges"
            >
              <span className="text-base leading-none">−</span>
              <span>Remove</span>
            </button>
            <button
              onClick={() => setIsEditingRaw(!isEditingRaw)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isEditingRaw ? 'Hide Raw Input' : 'Raw Edge Format'}</span>
            </button>
          </div>
        </div>

        {/* Raw Format Input Modal / Box */}
        {isEditingRaw && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Enter Edge Tokens (format: u-v or u-v:w):</span>
              <span className="text-[11px] text-slate-400">e.g. 0-1, 0-2:4, 1-3:2</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawTokenInput}
                onChange={(e) => setRawTokenInput(e.target.value)}
                placeholder="0-1, 0-2:4, 1-3:2"
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleApplyRawTokens}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
              >
                Apply Graph
              </button>
            </div>
          </div>
        )}

        {/* Add Edge Form */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="font-semibold text-slate-600">Connect:</span>
          <select
            value={newEdgeU}
            onChange={(e) => setNewEdgeU(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold"
          >
            {Array.from({ length: vertexCount }, (_, i) => (
              <option key={i} value={i}>
                u={i}
              </option>
            ))}
          </select>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={newEdgeV}
            onChange={(e) => setNewEdgeV(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold"
          >
            {Array.from({ length: vertexCount }, (_, i) => (
              <option key={i} value={i}>
                v={i}
              </option>
            ))}
          </select>
          {weighted && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-semibold">Weight:</span>
              <input
                type="number"
                value={newEdgeW}
                onChange={(e) => setNewEdgeW(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 font-mono font-bold"
              />
            </div>
          )}
          <button
            onClick={handleAddEdge}
            className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg font-bold ml-auto"
          >
            Add / Update Edge
          </button>
        </div>

        {/* Current Edges Pill List */}
        <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50/50 rounded-xl border border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium px-1">Edges ({edges.length}):</span>
          {edges.length === 0 ? (
            <span className="text-[11px] text-slate-400 italic">No edges defined</span>
          ) : (
            edges.map((e, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[11px] font-mono shadow-2xs group"
              >
                <span className="font-bold text-slate-700">{e.u}</span>
                <span className="text-slate-400">{directed ? '→' : '—'}</span>
                <span className="font-bold text-slate-700">{e.v}</span>
                {weighted && (
                  <span className="text-amber-600 font-bold ml-0.5">: {e.weight}</span>
                )}
                <button
                  onClick={() => handleDeleteEdge(idx)}
                  className="text-slate-300 hover:text-rose-500 ml-1 transition-colors"
                  title="Delete Edge"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
