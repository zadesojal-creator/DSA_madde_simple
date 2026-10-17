import React from 'react';
import type { TraceStep } from '../../types/trace';
import { 
  Layers, 
  ListOrdered, 
  ArrowRight, 
  Network, 
  CheckCircle2, 
  ArrowDownCircle
} from 'lucide-react';

interface AuxiliaryProps {
  currentStep?: TraceStep;
}

export const TraversalStatePanel: React.FC<AuxiliaryProps> = ({ currentStep }) => {
  const output = currentStep?.traversalOutput || [];
  const isCompleted = currentStep?.isCompleted || false;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">Traversal Output Sequence</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
          {output.length} Visited
        </span>
      </div>

      {output.length === 0 ? (
        <div className="text-center py-5 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          No nodes visited yet in this execution step.
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap bg-slate-50 p-3 rounded-lg border border-slate-200/80">
          {output.map((val, idx) => {
            const isLatest = idx === output.length - 1;
            return (
              <React.Fragment key={`trav-out-${idx}-${val}`}>
                <div 
                  className={`flex items-center justify-center min-w-[34px] h-[34px] px-2 rounded-lg font-mono font-bold text-sm shadow-xs transition-all ${
                    isLatest && !isCompleted
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 scale-105'
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  {val}
                </div>
                {idx < output.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
          {isCompleted && (
            <div className="ml-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const RecursionStackPanel: React.FC<AuxiliaryProps> = ({ currentStep }) => {
  const stack = currentStep?.callStack || [];
  const depth = currentStep?.recursionDepth ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-900">Call Stack (Recursion)</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-purple-50 text-purple-700 border border-purple-200">
          Depth: {depth}
        </span>
      </div>

      {stack.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          Stack is idle (base level).
        </div>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto">
          {stack.slice().reverse().map((frame, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={`stack-frame-${idx}`}
                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  isTop
                    ? 'bg-purple-100 text-purple-900 font-semibold border border-purple-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{frame}</span>
                {isTop && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white font-sans uppercase tracking-wider">
                    Top
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const QueueStatePanel: React.FC<AuxiliaryProps> = ({ currentStep }) => {
  const queue = currentStep?.queueState || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ArrowDownCircle className="w-4 h-4 text-cyan-600" />
          <h3 className="text-sm font-semibold text-slate-900">BFS Queue (Level-Order)</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-50 text-cyan-700 border border-cyan-200">
          Size: {queue.length}
        </span>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          Queue is empty.
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider shrink-0">
            FRONT →
          </span>
          {queue.map((item, idx) => (
            <div
              key={`q-${idx}-${item}`}
              className={`px-2.5 py-1 rounded font-mono text-xs font-semibold shrink-0 shadow-xs ${
                idx === 0
                  ? 'bg-cyan-600 text-white ring-2 ring-cyan-400/50'
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}
            >
              {item}
            </div>
          ))}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            ← REAR
          </span>
        </div>
      )}
    </div>
  );
};

export const NodeDetailsPanel: React.FC<AuxiliaryProps> = ({ currentStep }) => {
  const activeNodeId = currentStep?.activeNodeId;
  const treeNodes = currentStep?.treeNodes || [];
  const activeNode = treeNodes.find(n => n.id === activeNodeId);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Network className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-semibold text-slate-900">Active Node Details</h3>
      </div>

      {!activeNode ? (
        <div className="text-center py-4 text-xs text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
          No individual node currently under inspection.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 rounded bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Node ID</span>
            <span className="font-bold text-slate-800">#{activeNode.id}</span>
          </div>
          <div className="p-2 rounded bg-indigo-50 border border-indigo-100">
            <span className="text-indigo-600 block text-[10px] uppercase font-sans">Value</span>
            <span className="font-bold text-indigo-950">{activeNode.value}</span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Left Child</span>
            <span className="font-bold text-slate-800">
              {activeNode.leftId !== -1 ? `#${activeNode.leftId}` : 'nullptr'}
            </span>
          </div>
          <div className="p-2 rounded bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Right Child</span>
            <span className="font-bold text-slate-800">
              {activeNode.rightId !== -1 ? `#${activeNode.rightId}` : 'nullptr'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
