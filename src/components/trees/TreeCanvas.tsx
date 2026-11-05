import React, { useMemo } from 'react';
import type { TraceStep, TreeNodeSnapshot } from '../../types/trace';
import { 
  GitCommit, 
  HelpCircle, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw
} from 'lucide-react';

interface TreeCanvasProps {
  currentStep?: TraceStep;
  title?: string;
  subtitle?: string;
}

interface PositionedNode extends TreeNodeSnapshot {
  x: number;
  y: number;
  status: string;
}

export const TreeCanvas: React.FC<TreeCanvasProps> = ({
  currentStep,
  title = "Binary Tree Structure",
  subtitle = "Dynamic C++ Node Graph"
}) => {
  const [zoom, setZoom] = React.useState<number>(1);
  const [showA11yTable, setShowA11yTable] = React.useState<boolean>(false);

  const rootId = currentStep?.rootId ?? -1;
  const activeNodeId = currentStep?.activeNodeId;
  const treeNodes = currentStep?.treeNodes;
  const highlightedNodes = currentStep?.highlightedNodes;

  // Compute node coordinates via in-order layout for zero-overlap guarantee
  const { positionedNodes, edges, svgWidth, svgHeight } = useMemo(() => {
    const nodes = treeNodes || [];
    const highlights = highlightedNodes || {};
    if (nodes.length === 0) {
      return { positionedNodes: [], edges: [], svgWidth: 600, svgHeight: 280 };
    }

    const nodeMap = new Map<number, TreeNodeSnapshot>();
    for (const n of nodes) {
      nodeMap.set(n.id, n);
    }

    // Identify root
    let effectiveRootId = rootId;
    if (effectiveRootId === -1 || !nodeMap.has(effectiveRootId)) {
      const candidate = nodes.find(n => n.parentId === -1);
      effectiveRootId = candidate ? candidate.id : nodes[0].id;
    }

    // In-order traversal to determine horizontal coordinates
    const inOrderIds: number[] = [];
    const traverseInOrder = (currId: number) => {
      const node = nodeMap.get(currId);
      if (!node) return;
      if (node.leftId !== -1) traverseInOrder(node.leftId);
      inOrderIds.push(currId);
      if (node.rightId !== -1) traverseInOrder(node.rightId);
    };

    traverseInOrder(effectiveRootId);

    // If some nodes are disconnected (during construction), include them too
    for (const n of nodes) {
      if (!inOrderIds.includes(n.id)) {
        inOrderIds.push(n.id);
      }
    }

    const xSpacing = 72;
    const ySpacing = 80;
    const topPadding = 60;
    const sidePadding = 60;

    let maxDepth = 0;
    for (const n of nodes) {
      if (n.depth > maxDepth) maxDepth = n.depth;
    }

    const width = Math.max(640, (inOrderIds.length + 1) * xSpacing + sidePadding * 2);
    const height = Math.max(320, (maxDepth + 1) * ySpacing + topPadding + 60);

    const posMap = new Map<number, { x: number; y: number }>();
    inOrderIds.forEach((id, idx) => {
      const node = nodeMap.get(id);
      const depth = node ? node.depth : 0;
      const x = sidePadding + (idx + 1) * xSpacing;
      const y = topPadding + depth * ySpacing;
      posMap.set(id, { x, y });
    });

    const positioned: PositionedNode[] = nodes.map(n => {
      const coords = posMap.get(n.id) || { x: width / 2, y: topPadding };
      let status = (highlights && highlights[n.id]) || 'normal';
      if (n.id === activeNodeId && status === 'normal') {
        status = 'active';
      }
      return {
        ...n,
        x: coords.x,
        y: coords.y,
        status
      };
    });

    // Edges
    const edgeList: Array<{
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
      isLeft: boolean;
      isActive: boolean;
    }> = [];

    for (const p of positioned) {
      if (p.leftId !== -1 && posMap.has(p.leftId)) {
        const childCoords = posMap.get(p.leftId)!;
        const isActive = p.id === activeNodeId || p.leftId === activeNodeId;
        edgeList.push({
          id: `edge-${p.id}-${p.leftId}`,
          from: { x: p.x, y: p.y },
          to: { x: childCoords.x, y: childCoords.y },
          isLeft: true,
          isActive
        });
      }
      if (p.rightId !== -1 && posMap.has(p.rightId)) {
        const childCoords = posMap.get(p.rightId)!;
        const isActive = p.id === activeNodeId || p.rightId === activeNodeId;
        edgeList.push({
          id: `edge-${p.id}-${p.rightId}`,
          from: { x: p.x, y: p.y },
          to: { x: childCoords.x, y: childCoords.y },
          isLeft: false,
          isActive
        });
      }
    }

    return {
      positionedNodes: positioned,
      edges: edgeList,
      svgWidth: width,
      svgHeight: height
    };
  }, [treeNodes, rootId, activeNodeId, highlightedNodes]);

  const getNodeStyles = (status: string, isRoot: boolean) => {
    switch (status) {
      case 'active':
        return {
          fill: '#EEF2FF', // indigo-50
          stroke: '#4F46E5', // indigo-600
          text: '#312E81', // indigo-900
          badge: 'Active Focus',
          badgeBg: 'bg-indigo-600 text-white',
          ring: 'drop-shadow(0 0 8px rgba(79, 70, 229, 0.45))'
        };
      case 'found':
        return {
          fill: '#ECFDF5', // emerald-50
          stroke: '#059669', // emerald-600
          text: '#064E3B', // emerald-950
          badge: 'Match / Visited',
          badgeBg: 'bg-emerald-600 text-white',
          ring: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.45))'
        };
      case 'compare':
        return {
          fill: '#FFFBEB', // amber-50
          stroke: '#D97706', // amber-600
          text: '#78350F', // amber-900
          badge: 'Comparing',
          badgeBg: 'bg-amber-600 text-white',
          ring: 'drop-shadow(0 0 8px rgba(217, 119, 6, 0.45))'
        };
      case 'swap':
      case 'insert':
        return {
          fill: '#F0FDFA', // teal-50
          stroke: '#0D9488', // teal-600
          text: '#134E4A', // teal-950
          badge: 'New / Mutated',
          badgeBg: 'bg-teal-600 text-white',
          ring: 'drop-shadow(0 0 8px rgba(13, 148, 136, 0.45))'
        };
      case 'visited':
        return {
          fill: '#F8FAFC', // slate-50
          stroke: '#94A3B8', // slate-400
          text: '#334155', // slate-700
          badge: 'Traversed',
          badgeBg: 'bg-slate-400 text-white',
          ring: 'none'
        };
      default:
        return {
          fill: isRoot ? '#F8FAFC' : '#FFFFFF',
          stroke: isRoot ? '#6366F1' : '#CBD5E1', // slate-300 or indigo
          text: '#0F172A', // slate-900
          badge: isRoot ? 'Root' : `Node`,
          badgeBg: isRoot ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600',
          ring: 'none'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Canvas Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              {positionedNodes.length} {positionedNodes.length === 1 ? 'Node' : 'Nodes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 text-slate-600 select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(1.6, z + 0.15))}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-slate-200 mx-1" />
          <button
            type="button"
            onClick={() => setShowA11yTable(!showA11yTable)}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              showA11yTable ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {showA11yTable ? 'Hide Table' : 'Show Text Table'}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div 
        className="relative overflow-auto min-h-[360px] max-h-[520px] bg-radial from-slate-50 to-slate-100/70 p-4 flex items-center justify-center"
        role="region"
        aria-label="Binary Tree Canvas"
      >
        {positionedNodes.length === 0 ? (
          <div className="text-center py-12 px-4 max-w-sm">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">{currentStep?.title || "Tree is Currently Initializing"}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {currentStep?.description || "Building binary tree structure step-by-step..."}
            </p>
          </div>
        ) : (
          <div 
            className="transition-transform duration-200 origin-top flex items-center justify-center"
            style={{ transform: `scale(${zoom})`, minWidth: `${svgWidth}px`, minHeight: `${svgHeight}px` }}
          >
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              className="select-none"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
                <linearGradient id="activeEdgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" />
                </linearGradient>
              </defs>

              {/* Render Parent-Child Edges */}
              {edges.map(e => (
                <g key={e.id}>
                  <path
                    d={`M ${e.from.x} ${e.from.y + 24} C ${e.from.x} ${(e.from.y + e.to.y) / 2}, ${e.to.x} ${(e.from.y + e.to.y) / 2}, ${e.to.x} ${e.to.y - 24}`}
                    fill="none"
                    stroke={e.isActive ? 'url(#activeEdgeGradient)' : 'url(#edgeGradient)'}
                    strokeWidth={e.isActive ? 3 : 2}
                    strokeDasharray={e.isActive ? 'none' : 'none'}
                    className="transition-all duration-300"
                  />
                  {/* Branch label (L / R) */}
                  <circle
                    cx={(e.from.x + e.to.x) / 2}
                    cy={(e.from.y + e.to.y) / 2}
                    r={9}
                    fill="#FFFFFF"
                    stroke={e.isActive ? '#4F46E5' : '#94A3B8'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={(e.from.x + e.to.x) / 2}
                    y={(e.from.y + e.to.y) / 2 + 3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill={e.isActive ? '#4F46E5' : '#64748B'}
                  >
                    {e.isLeft ? 'L' : 'R'}
                  </text>
                </g>
              ))}

              {/* Render Nodes */}
              {positionedNodes.map(node => {
                const isRoot = node.id === rootId || node.parentId === -1;
                const style = getNodeStyles(node.status, isRoot);
                const isActive = node.id === activeNodeId;

                return (
                  <g 
                    key={`node-${node.id}`} 
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-all duration-300"
                    style={{ filter: style.ring }}
                  >
                    {/* Outer glow ring for active focus */}
                    {isActive && (
                      <circle
                        r={28}
                        fill="none"
                        stroke="#6366F1"
                        strokeWidth={2}
                        strokeDasharray="4 3"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      r={22}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="transition-colors duration-200"
                    />

                    {/* Value text */}
                    <text
                      textAnchor="middle"
                      dy="5"
                      fontSize="14"
                      fontWeight="700"
                      fill={style.text}
                      className="font-mono select-none"
                    >
                      {node.value}
                    </text>

                    {/* Node ID or Root Badge */}
                    <g transform="translate(0, -26)">
                      <rect
                        x="-18"
                        y="-7"
                        width="36"
                        height="14"
                        rx="7"
                        fill={isRoot ? '#4F46E5' : '#475569'}
                      />
                      <text
                        textAnchor="middle"
                        dy="3.5"
                        fontSize="8.5"
                        fontWeight="600"
                        fill="#FFFFFF"
                        className="select-none"
                      >
                        {isRoot ? 'ROOT' : `#${node.id}`}
                      </text>
                    </g>

                    {/* Depth or Status subtitle under node */}
                    <text
                      textAnchor="middle"
                      dy="34"
                      fontSize="9.5"
                      fontWeight="500"
                      fill="#64748B"
                      className="select-none"
                    >
                      d={node.depth}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Accessible Textual Table View */}
      {showA11yTable && positionedNodes.length > 0 && (
        <div className="border-t border-slate-200 bg-white p-4 max-h-60 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Accessible Tree State Table
            </h4>
            <span className="text-[11px] text-slate-500">
              Root Node ID: {rootId !== -1 ? rootId : 'N/A'}
            </span>
          </div>
          <table className="w-full text-xs text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50">
                <th className="py-1 px-2">ID</th>
                <th className="py-1 px-2">Value</th>
                <th className="py-1 px-2">Depth</th>
                <th className="py-1 px-2">Left Child</th>
                <th className="py-1 px-2">Right Child</th>
                <th className="py-1 px-2">Parent</th>
                <th className="py-1 px-2">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {positionedNodes.map(n => (
                <tr 
                  key={n.id} 
                  className={n.id === activeNodeId ? 'bg-indigo-50 font-bold text-indigo-900' : 'hover:bg-slate-50'}
                >
                  <td className="py-1 px-2">#{n.id}</td>
                  <td className="py-1 px-2">{n.value}</td>
                  <td className="py-1 px-2">{n.depth}</td>
                  <td className="py-1 px-2">{n.leftId !== -1 ? `#${n.leftId}` : 'null'}</td>
                  <td className="py-1 px-2">{n.rightId !== -1 ? `#${n.rightId}` : 'null'}</td>
                  <td className="py-1 px-2">{n.parentId !== -1 ? `#${n.parentId}` : 'none (root)'}</td>
                  <td className="py-1 px-2 capitalize">{n.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Legend */}
      <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border-2 border-indigo-600 shadow-xs" />
            <span>Active / Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-100 border-2 border-emerald-600 shadow-xs" />
            <span>Matched / Visited</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-100 border-2 border-amber-600 shadow-xs" />
            <span>Comparing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-teal-100 border-2 border-teal-600 shadow-xs" />
            <span>Mutated / Inserted</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>Stable Node IDs</span>
          <span>•</span>
          <span>Zero-overlap layout</span>
        </div>
      </div>
    </div>
  );
};
