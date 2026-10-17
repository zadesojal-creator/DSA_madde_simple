import React, { useMemo } from 'react';
import type { TraceStep } from '../../types/trace';
import { 
  Layers, 
  Binary, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp 
} from 'lucide-react';

interface DualHeapCanvasProps {
  currentStep?: TraceStep;
  heapType: 'min' | 'max';
  fallbackArray?: number[];
  title?: string;
}

export const DualHeapCanvas: React.FC<DualHeapCanvasProps> = ({
  currentStep,
  heapType,
  fallbackArray = [9, 5, 2, 7, 1, 8],
  title
}) => {
  const heapArray = currentStep?.arrayState ?? fallbackArray;
  const activeIndices = currentStep?.activeIndices;
  const highlightedItems = currentStep?.highlightedItems;
  const activeParent = currentStep?.activeParentIdx ?? -1;
  const activeLeft = currentStep?.activeLeftIdx ?? -1;
  const activeRight = currentStep?.activeRightIdx ?? -1;

  // Verify heap invariant for display
  const invariantCheck = useMemo(() => {
    let satisfied = true;
    const violations: number[] = [];

    for (let i = 0; i < heapArray.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < heapArray.length) {
        if (heapType === 'min' && heapArray[i] > heapArray[left]) {
          satisfied = false;
          violations.push(i);
        } else if (heapType === 'max' && heapArray[i] < heapArray[left]) {
          satisfied = false;
          violations.push(i);
        }
      }

      if (right < heapArray.length) {
        if (heapType === 'min' && heapArray[i] > heapArray[right]) {
          satisfied = false;
          violations.push(i);
        } else if (heapType === 'max' && heapArray[i] < heapArray[right]) {
          satisfied = false;
          violations.push(i);
        }
      }
    }

    return { satisfied, violations };
  }, [heapArray, heapType]);

  // Compute Complete Binary Tree Coordinates from zero-based indices
  const { treeNodes, treeEdges, svgWidth, svgHeight } = useMemo(() => {
    if (heapArray.length === 0) {
      return { treeNodes: [], treeEdges: [], svgWidth: 500, svgHeight: 240 };
    }

    const n = heapArray.length;
    const maxDepth = Math.floor(Math.log2(n));
    const width = Math.max(520, Math.pow(2, maxDepth) * 70 + 60);
    const height = Math.max(260, (maxDepth + 1) * 75 + 50);

    const nodes = heapArray.map((val, i) => {
      const depth = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, depth) - 1);
      const levelCapacity = Math.pow(2, depth);
      const slotWidth = width / (levelCapacity + 1);
      const x = (posInLevel + 1) * slotWidth;
      const y = 45 + depth * 75;

      const isParent = i === activeParent;
      const isLeft = i === activeLeft;
      const isRight = i === activeRight;
      const isActive = Boolean(activeIndices?.includes(i) || isParent || isLeft || isRight);
      const highlight = (highlightedItems && highlightedItems[i]) || (isParent ? 'active' : isLeft || isRight ? 'compare' : 'normal');

      return {
        index: i,
        value: val,
        depth,
        x,
        y,
        isParent,
        isLeft,
        isRight,
        isActive,
        highlight
      };
    });

    const edges: Array<{
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
      isActive: boolean;
      isLeft: boolean;
    }> = [];

    for (let i = 1; i < n; i++) {
      const parentIdx = Math.floor((i - 1) / 2);
      const parent = nodes[parentIdx];
      const child = nodes[i];
      if (parent && child) {
        const isActive = (parentIdx === activeParent && (i === activeLeft || i === activeRight)) ||
          Boolean(activeIndices?.includes(parentIdx) && activeIndices?.includes(i));
        edges.push({
          id: `heap-edge-${parentIdx}-${i}`,
          from: { x: parent.x, y: parent.y },
          to: { x: child.x, y: child.y },
          isActive,
          isLeft: i % 2 !== 0
        });
      }
    }

    return { treeNodes: nodes, treeEdges: edges, svgWidth: width, svgHeight: height };
  }, [heapArray, activeIndices, highlightedItems, activeParent, activeLeft, activeRight]);

  const getNodeStyles = (highlight: string, isRoot: boolean) => {
    switch (highlight) {
      case 'active':
        return {
          fill: '#EEF2FF',
          stroke: '#4F46E5',
          text: '#312E81',
          ring: 'drop-shadow(0 0 6px rgba(79, 70, 229, 0.45))'
        };
      case 'compare':
        return {
          fill: '#FFFBEB',
          stroke: '#D97706',
          text: '#78350F',
          ring: 'drop-shadow(0 0 6px rgba(217, 119, 6, 0.45))'
        };
      case 'swap':
        return {
          fill: '#ECFDF5',
          stroke: '#059669',
          text: '#064E3B',
          ring: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.45))'
        };
      default:
        return {
          fill: isRoot ? '#F8FAFC' : '#FFFFFF',
          stroke: isRoot ? '#6366F1' : '#CBD5E1',
          text: '#0F172A',
          ring: 'none'
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Canvas Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            {heapType === 'min' ? (
              <TrendingDown className="w-5 h-5 text-indigo-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-purple-600" />
            )}
            <h2 className="text-base font-semibold text-slate-900">
              {title || (heapType === 'min' ? 'Min-Heap Visualization' : 'Max-Heap Visualization')}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
              n={heapArray.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronized Array View & Complete Binary Tree
          </p>
        </div>

        {/* Invariant Status Badge */}
        <div className="flex items-center gap-2">
          {invariantCheck.satisfied ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Heap Invariant Satisfied</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Sifting in progress (Mutating)</span>
            </div>
          )}
        </div>
      </div>

      {/* Synchronized Dual Views Container */}
      <div className="p-6 space-y-6">
        {/* 1. Array Representation View */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Array View: Zero-Based Indexed Storage
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Parent: (i-1)/2 &nbsp;|&nbsp; Left: 2i+1 &nbsp;|&nbsp; Right: 2i+2
            </span>
          </div>

          {heapArray.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">Heap is empty.</div>
          ) : (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
              {heapArray.map((val, idx) => {
                const isParent = idx === activeParent;
                const isLeft = idx === activeLeft;
                const isRight = idx === activeRight;
                const isRoot = idx === 0;

                let borderStyle = 'border-slate-200 bg-white text-slate-900';
                let roleBadge = null;

                if (isParent) {
                  borderStyle = 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-400/50 scale-105';
                  roleBadge = 'Parent';
                } else if (isLeft) {
                  borderStyle = 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/50 scale-105';
                  roleBadge = 'Left Child';
                } else if (isRight) {
                  borderStyle = 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-400/50 scale-105';
                  roleBadge = 'Right Child';
                } else if (isRoot) {
                  roleBadge = 'Root';
                }

                return (
                  <div
                    key={`heap-arr-${idx}`}
                    className={`flex flex-col items-center justify-center min-w-[56px] py-2 px-1.5 rounded-xl border shadow-xs transition-all ${borderStyle}`}
                  >
                    <span className="text-[10px] font-mono text-slate-400 font-bold mb-0.5">
                      [{idx}]
                    </span>
                    <span className="text-base font-bold font-mono">
                      {val}
                    </span>
                    {roleBadge && (
                      <span className="mt-1 text-[9px] px-1.5 py-0.2 rounded font-sans font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                        {roleBadge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. Complete Binary Tree View */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Tree View: Complete Binary Tree Mapping
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Synchronized 1:1 with Array Elements
            </span>
          </div>

          <div className="overflow-x-auto flex items-center justify-center min-h-[260px] py-2">
            <svg 
              width={svgWidth} 
              height={svgHeight} 
              className="select-none"
              style={{ overflow: 'visible' }}
            >
              {/* Parent-Child Tree Edges */}
              {treeEdges.map(edge => (
                <g key={edge.id}>
                  <line
                    x1={edge.from.x}
                    y1={edge.from.y + 18}
                    x2={edge.to.x}
                    y2={edge.to.y - 18}
                    stroke={edge.isActive ? '#4F46E5' : '#CBD5E1'}
                    strokeWidth={edge.isActive ? 2.5 : 1.75}
                    className="transition-all duration-300"
                  />
                  {/* L/R label */}
                  <text
                    x={(edge.from.x + edge.to.x) / 2}
                    y={(edge.from.y + edge.to.y) / 2}
                    textAnchor="middle"
                    fontSize="8.5"
                    fontWeight="700"
                    fill={edge.isActive ? '#4F46E5' : '#94A3B8'}
                  >
                    {edge.isLeft ? 'L' : 'R'}
                  </text>
                </g>
              ))}

              {/* Tree Nodes */}
              {treeNodes.map(node => {
                const isRoot = node.index === 0;
                const style = getNodeStyles(node.highlight, isRoot);

                return (
                  <g
                    key={`heap-tree-node-${node.index}`}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-all duration-300"
                    style={{ filter: style.ring }}
                  >
                    <circle
                      r={18}
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={node.isActive ? 2.5 : 1.75}
                      className="transition-colors duration-200"
                    />

                    {/* Value */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize="12.5"
                      fontWeight="700"
                      fill={style.text}
                      className="font-mono select-none"
                    >
                      {node.value}
                    </text>

                    {/* Array Index Tag above node */}
                    <text
                      textAnchor="middle"
                      dy="-22"
                      fontSize="9"
                      fontWeight="700"
                      fill="#64748B"
                      className="font-mono select-none"
                    >
                      i={node.index}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="px-6 py-2.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-100 border border-indigo-600" />
            <span>Active Parent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-600" />
            <span>Child Participant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-600" />
            <span>Swap Performed</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <span>{heapType === 'min' ? 'Min-Heap (Root is Minimum)' : 'Max-Heap (Root is Maximum)'}</span>
          <span>•</span>
          <span>Zero pointers; purely array-backed</span>
        </div>
      </div>
    </div>
  );
};
