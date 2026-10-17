import React, { useState } from 'react';
import type { GraphVertexSnapshot, GraphEdgeSnapshot } from '../../types/trace';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface GraphCanvasProps {
  vertices: GraphVertexSnapshot[];
  edges: GraphEdgeSnapshot[];
  activeVertexId?: number;
  activeEdgeU?: number;
  activeEdgeV?: number;
  reconstructedPath?: number[];
  algorithmId: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  vertices,
  edges,
  activeVertexId = -1,
  activeEdgeU = -1,
  activeEdgeV = -1,
  reconstructedPath = [],
  algorithmId
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const width = 700;
  const height = 450;
  const centerX = width / 2;
  const centerY = height / 2;
  const nodeRadius = 24;

  const V = Math.max(vertices.length, 1);
  const layoutRadius = Math.min(centerX - 80, centerY - 60, Math.max(120, V * 28));

  // Compute deterministic coordinates on a circle
  const getNodePos = (id: number) => {
    if (V === 1) return { x: centerX, y: centerY };
    const angle = (2 * Math.PI * id) / V - Math.PI / 2;
    return {
      x: centerX + layoutRadius * Math.cos(angle),
      y: centerY + layoutRadius * Math.sin(angle)
    };
  };

  // Check if edge (u, v) is in reconstructed path
  const isPathEdge = (u: number, v: number, directed: boolean) => {
    if (reconstructedPath.length < 2) return false;
    for (let i = 0; i < reconstructedPath.length - 1; i++) {
      const p1 = reconstructedPath[i];
      const p2 = reconstructedPath[i + 1];
      if (p1 === u && p2 === v) return true;
      if (!directed && p1 === v && p2 === u) return true;
    }
    return false;
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="relative w-full h-[460px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden select-none">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Canvas Zoom/Pan Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/80 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2.0))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.6))}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-slate-400 px-1.5">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Graph Information Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur border border-slate-800 text-[11px] font-mono text-slate-400">
          <span>Vertices: </span>
          <span className="text-indigo-400 font-bold">{vertices.length}</span>
          <span className="mx-1.5">•</span>
          <span>Edges: </span>
          <span className="text-cyan-400 font-bold">{edges.length}</span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <svg
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        viewBox={`0 0 ${width} ${height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {/* Normal arrow marker */}
          <marker
            id="arrow-normal"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>

          {/* Active arrow marker */}
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4" />
          </marker>

          {/* Path arrow marker */}
          <marker
            id="arrow-path"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>

          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. EDGES */}
          {edges.map((e, idx) => {
            const p1 = getNodePos(e.u);
            const p2 = getNodePos(e.v);

            const isCurrentExamined =
              (activeEdgeU === e.u && activeEdgeV === e.v) ||
              (!e.directed && activeEdgeU === e.v && activeEdgeV === e.u);

            const isShortestPath = isPathEdge(e.u, e.v, e.directed);

            // Self loop handling
            if (e.u === e.v) {
              const loopPath = `M ${p1.x - 10} ${p1.y - nodeRadius} C ${p1.x - 30} ${p1.y - nodeRadius - 40}, ${p1.x + 30} ${p1.y - nodeRadius - 40}, ${p1.x + 10} ${p1.y - nodeRadius}`;
              return (
                <g key={`loop-${idx}`}>
                  <path
                    d={loopPath}
                    fill="none"
                    stroke={isCurrentExamined ? '#06b6d4' : isShortestPath ? '#10b981' : '#475569'}
                    strokeWidth={isCurrentExamined || isShortestPath ? 3 : 1.5}
                    markerEnd={e.directed ? (isShortestPath ? 'url(#arrow-path)' : isCurrentExamined ? 'url(#arrow-active)' : 'url(#arrow-normal)') : undefined}
                  />
                  {e.weight !== 1 && (
                    <text
                      x={p1.x}
                      y={p1.y - nodeRadius - 35}
                      textAnchor="middle"
                      className="fill-amber-300 font-mono text-[11px] font-bold"
                    >
                      {e.weight}
                    </text>
                  )}
                </g>
              );
            }

            // Calculate directional offsets for node boundaries
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dist;
            const uy = dy / dist;

            const startX = p1.x + ux * nodeRadius;
            const startY = p1.y + uy * nodeRadius;
            const endX = p2.x - ux * (nodeRadius + (e.directed ? 6 : 0));
            const endY = p2.y - uy * (nodeRadius + (e.directed ? 6 : 0));

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            const strokeColor = isShortestPath
              ? '#10b981'
              : isCurrentExamined
              ? '#06b6d4'
              : '#475569';

            const strokeWidth = isShortestPath ? 3.5 : isCurrentExamined ? 3 : 1.75;
            const marker = e.directed
              ? isShortestPath
                ? 'url(#arrow-path)'
                : isCurrentExamined
                ? 'url(#arrow-active)'
                : 'url(#arrow-normal)'
              : undefined;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  markerEnd={marker}
                  filter={isShortestPath || isCurrentExamined ? 'url(#glow)' : undefined}
                />

                {/* Edge weight badge if weighted or non-1 */}
                {(e.weight !== 1 || algorithmId === 'dijkstra' || algorithmId === 'bellman-ford' || algorithmId === 'floyd-warshall') && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x={-14}
                      y={-9}
                      width={28}
                      height={18}
                      rx={5}
                      fill="#0f172a"
                      stroke={strokeColor}
                      strokeWidth={1}
                      className="opacity-95"
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      className={`text-[10px] font-mono font-bold ${
                        e.weight < 0 ? 'fill-rose-400' : 'fill-amber-300'
                      }`}
                    >
                      {e.weight}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 2. VERTICES */}
          {vertices.map((v) => {
            const pos = getNodePos(v.id);
            const isActive = activeVertexId === v.id;
            const isPathNode = reconstructedPath.includes(v.id);

            // Styling based on vertex state
            let bgColor = '#1e293b';
            let borderColor = '#64748b';
            let textColor = '#f8fafc';
            let badgeText = '';
            let badgeBg = '#334155';

            if (v.state === 'active' || isActive) {
              bgColor = '#312e81';
              borderColor = '#818cf8';
              textColor = '#ffffff';
              badgeBg = '#4f46e5';
            } else if (v.state === 'discovered' || v.state === 'in_queue') {
              bgColor = '#451a03';
              borderColor = '#f59e0b';
              textColor = '#fef3c7';
              badgeBg = '#b45309';
            } else if (v.state === 'visited') {
              bgColor = '#064e3b';
              borderColor = '#10b981';
              textColor = '#ecfdf5';
              badgeBg = '#047857';
            } else if (v.state === 'unreachable') {
              bgColor = '#1e293b';
              borderColor = '#475569';
              textColor = '#94a3b8';
              badgeBg = '#334155';
            } else if (v.state === 'negative_cycle') {
              bgColor = '#881337';
              borderColor = '#f43f5e';
              textColor = '#ffe4e6';
              badgeBg = '#be123c';
            }

            if (isPathNode && v.state !== 'active' && v.state !== 'negative_cycle') {
              borderColor = '#34d399';
            }

            // Determine badge content
            if (v.state === 'negative_cycle') {
              badgeText = 'CYCLE!';
            } else if (v.state === 'unreachable') {
              badgeText = '∞';
            } else if (v.hasDistance) {
              badgeText = v.distance >= 1000000000 ? '∞' : `d=${v.distance}`;
            } else if (v.discoveryTime >= 0) {
              badgeText = `${v.discoveryTime}/${v.finishTime >= 0 ? v.finishTime : '•'}`;
            }

            return (
              <g
                key={`vertex-${v.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="transition-transform duration-300"
              >
                {/* Active halo pulse */}
                {isActive && (
                  <circle
                    r={nodeRadius + 8}
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth={2}
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Node circle */}
                <circle
                  r={nodeRadius}
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth={isActive || isPathNode ? 3.5 : 2}
                  strokeDasharray={v.state === 'unreachable' ? '4 3' : undefined}
                  filter={isActive || isPathNode ? 'url(#glow)' : undefined}
                />

                {/* Vertex Label */}
                <text
                  textAnchor="middle"
                  dy={badgeText ? -3 : 4}
                  fill={textColor}
                  className="font-bold text-sm tracking-wide select-none"
                >
                  {v.label || v.id}
                </text>

                {/* Distance / Status Badge pill */}
                {badgeText && (
                  <g transform={`translate(0, ${nodeRadius + 10})`}>
                    <rect
                      x={-22}
                      y={-8}
                      width={44}
                      height={16}
                      rx={8}
                      fill={badgeBg}
                      stroke={borderColor}
                      strokeWidth={1}
                    />
                    <text
                      textAnchor="middle"
                      dy={3.5}
                      fill="#ffffff"
                      className="font-mono text-[9px] font-extrabold select-none"
                    >
                      {badgeText}
                    </text>
                  </g>
                )}

                {/* State icon badge */}
                {v.state === 'visited' && (
                  <circle
                    cx={nodeRadius - 4}
                    cy={-nodeRadius + 4}
                    r={6}
                    fill="#10b981"
                  />
                )}
                {v.state === 'negative_cycle' && (
                  <circle
                    cx={nodeRadius - 4}
                    cy={-nodeRadius + 4}
                    r={6}
                    fill="#f43f5e"
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
