import React from 'react';
import type { TraceStep } from '../../types/trace';
import { Activity, Box, Layers3, GaugeCircle, Sparkles } from 'lucide-react';

interface StackVisualizationCanvasProps {
  currentStep?: TraceStep;
  capacity?: number;
  title?: string;
  subtitle?: string;
}

export const StackVisualizationCanvas: React.FC<StackVisualizationCanvasProps> = ({
  currentStep,
  capacity = 5,
  title = 'Stack State',
  subtitle
}) => {
  const stackValues = currentStep?.stackState && currentStep.stackState.length > 0 ? currentStep.stackState : [];
  const bracketValues = currentStep?.charStackState && currentStep.charStackState.length > 0 ? currentStep.charStackState : [];
  const displayValues = bracketValues.length > 0 ? bracketValues : stackValues;
  const topIndex = currentStep?.topIndex ?? (displayValues.length > 0 ? displayValues.length - 1 : -1);
  const effectiveCapacity = currentStep?.capacity ?? capacity;

  const renderSlot = (value: string | number | null, idx: number, isTop: boolean, isEmpty: boolean) => {
    const highlight = currentStep?.highlightedItems?.[idx] ?? (isTop ? 'active' : undefined);
    const highlightStyles: Record<string, string> = {
      active: 'border-violet-500 bg-violet-50 text-violet-900 ring-2 ring-violet-500/50',
      push: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/50',
      pop: 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/50',
      peek: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/50',
      compare: 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-500/50',
      found: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/50',
      overflow: 'border-orange-500 bg-orange-50 text-orange-900 ring-2 ring-orange-500/50',
      underflow: 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/50',
      mismatch: 'border-red-500 bg-red-50 text-red-900 ring-2 ring-red-500/50'
    };

    return (
      <div className="flex flex-col items-center gap-2" key={`${value ?? 'empty'}-${idx}`}>
        {isTop && (
          <div className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold font-mono tracking-wide shadow-sm">
            TOP
          </div>
        )}
        <div
          className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border text-xl font-black font-mono shadow-sm transition-all duration-200 ${
            isEmpty
              ? 'border-dashed border-slate-300 bg-slate-50 text-slate-400'
              : highlightStyles[highlight ?? ''] ?? 'border-slate-200 bg-slate-50 text-slate-900'
          }`}
          aria-label={isEmpty ? 'Empty stack slot' : `Stack value ${value}`}
        >
          {isEmpty ? '—' : value}
        </div>
        <div className="text-[10px] font-mono text-slate-500">[{idx}]</div>
      </div>
    );
  };

  const slots = Array.from({ length: Math.max(effectiveCapacity, displayValues.length || 1) }, (_, index) => {
    const value = displayValues[index] ?? null;
    const isEmpty = value === null || value === undefined;
    const isTop = index === topIndex && !isEmpty;
    return renderSlot(value, index, isTop, isEmpty);
  });

  const stackSize = displayValues.length;

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200 p-5 shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 pointer-events-none" />

      <div className="relative flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-700">
            <Layers3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide">{title}</h3>
            {subtitle && <div className="text-[10px] font-mono text-slate-500">{subtitle}</div>}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">size: {stackSize}</span>
          <span className="px-2 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">cap: {effectiveCapacity}</span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 py-3">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-slate-500">
          <Box className="w-3.5 h-3.5" />
          <span>Stack Memory</span>
        </div>

        <div className="flex flex-wrap items-end justify-center gap-4 min-h-[220px]">
          {slots}
        </div>

        {displayValues.length === 0 && (
          <div className="mt-2 text-center text-sm text-slate-500">
            Empty stack: no active elements.
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 w-full pt-4 border-t border-slate-200 text-[11px] font-mono text-slate-600">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
            <div className="flex items-center gap-1 text-slate-500">
              <GaugeCircle className="w-3.5 h-3.5" />
              <span>Capacity</span>
            </div>
            <div className="mt-1 text-base font-bold text-slate-900">{effectiveCapacity}</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
            <div className="flex items-center gap-1 text-slate-500">
              <Activity className="w-3.5 h-3.5" />
              <span>Current Size</span>
            </div>
            <div className="mt-1 text-base font-bold text-slate-900">{stackSize}</div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2">
            <div className="flex items-center gap-1 text-slate-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Top Index</span>
            </div>
            <div className="mt-1 text-base font-bold text-slate-900">{topIndex >= 0 ? topIndex : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
