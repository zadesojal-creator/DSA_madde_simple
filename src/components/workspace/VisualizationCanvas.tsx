import React from 'react';
import type { TraceStep, ItemHighlightType } from '../../types/trace';
import { 
  Activity, 
  Sparkles, 
  CheckCircle, 
  Eye, 
  HelpCircle,
  Inbox
} from 'lucide-react';

interface VisualizationCanvasProps {
  currentStep?: TraceStep;
  array: number[];
  title?: string;
  subtitle?: string;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  currentStep,
  array,
  title = "Array State",
  subtitle
}) => {
  const displayArray = currentStep?.arrayState ?? array;
  const activeIndices = currentStep?.activeIndices || [];
  const highlights = currentStep?.highlightedItems || {};
  const pointers = currentStep?.pointers || [];
  const isCompleted = currentStep?.isCompleted || false;

  const getCellVisuals = (idx: number, type?: ItemHighlightType) => {
    switch (type) {
      case 'active':
        return {
          containerClass: 'bg-indigo-50 border-indigo-600 text-indigo-950 ring-2 ring-indigo-500/50 scale-105 shadow-md',
          badgeText: 'Active',
          badgeClass: 'bg-indigo-600 text-white',
          ariaStatus: 'Active element'
        };
      case 'compare':
        return {
          containerClass: 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/50 scale-105 shadow-md animate-pulse',
          badgeText: 'Compare',
          badgeClass: 'bg-amber-600 text-white',
          ariaStatus: 'Comparing element'
        };
      case 'found':
      case 'target':
        return {
          containerClass: 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/50 scale-105 shadow-lg',
          badgeText: 'Match ✓',
          badgeClass: 'bg-emerald-600 text-white',
          ariaStatus: 'Target found'
        };
      case 'insert':
        return {
          containerClass: 'bg-teal-50 border-teal-500 text-teal-950 ring-2 ring-teal-400/50 scale-105 shadow-md',
          badgeText: 'Insert Here',
          badgeClass: 'bg-teal-600 text-white',
          ariaStatus: 'Insertion position'
        };
      case 'delete':
        return {
          containerClass: 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-400/50 scale-105 shadow-md',
          badgeText: 'Delete ✕',
          badgeClass: 'bg-rose-600 text-white',
          ariaStatus: 'Target for deletion'
        };
      case 'shifting':
        return {
          containerClass: 'bg-orange-50 border-orange-500 text-orange-950 ring-2 ring-orange-400/50 scale-105 shadow-md',
          badgeText: 'Shift ➔',
          badgeClass: 'bg-orange-600 text-white',
          ariaStatus: 'Element shifting position'
        };
      case 'updated':
        return {
          containerClass: 'bg-cyan-50 border-cyan-500 text-cyan-950 ring-2 ring-cyan-400/50 scale-105 shadow-md',
          badgeText: 'Updated ★',
          badgeClass: 'bg-cyan-600 text-white',
          ariaStatus: 'Updated element'
        };
      case 'visited':
        return {
          containerClass: 'bg-slate-100 border-slate-300 text-slate-700',
          badgeText: 'Visited',
          badgeClass: 'bg-slate-200 text-slate-700 border border-slate-300',
          ariaStatus: 'Visited element'
        };
      case 'discarded':
        return {
          containerClass: 'bg-slate-50 border-dashed border-slate-300 text-slate-400 opacity-40 scale-95',
          badgeText: 'Discarded',
          badgeClass: 'bg-slate-200 text-slate-500',
          ariaStatus: 'Discarded from search range'
        };
      default:
        if (activeIndices.includes(idx)) {
          return {
            containerClass: 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-400/40 scale-105',
            badgeText: 'Active',
            badgeClass: 'bg-indigo-600 text-white',
            ariaStatus: 'Active element'
          };
        }
        return {
          containerClass: 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-100',
          badgeText: '',
          badgeClass: '',
          ariaStatus: 'Unvisited element'
        };
    }
  };

  return (
    <div className="relative rounded-2xl bg-white border border-slate-200 p-5 sm:p-7 shadow-lg flex flex-col justify-between min-h-[340px] overflow-hidden group">
      
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-wide flex items-center gap-2">
              <span>{title}</span>
              {subtitle && <span className="text-xs font-normal text-slate-500 hidden sm:inline">({subtitle})</span>}
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Length: {displayArray.length} {displayArray.length === 1 ? 'element' : 'elements'}
            </span>
          </div>
        </div>

        {/* Step Badge */}
        {isCompleted ? (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold font-mono">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trace Complete</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Step {currentStep ? currentStep.stepIndex + 1 : 1}</span>
          </div>
        )}
      </div>

      {/* Relevant C++ Variables Strip */}
      {currentStep?.variables && Object.keys(currentStep.variables).length > 0 && (
        <div className="mb-2 px-3.5 py-2 rounded-xl bg-slate-50/90 border border-slate-200 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <span>C++ State:</span>
          </span>
          {Object.entries(currentStep.variables)
            .filter(([k]) => ['i', 'index', 'value', 'target', 'n', 'low', 'mid', 'high', 'arr[i]', 'arr[mid]', 'arr.size()', 'validRange'].includes(k))
            .map(([k, v]) => (
              <div key={k} className="flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-2xs text-xs">
                <span className="text-slate-500 font-medium">{k} =</span>
                <span className="text-indigo-900 font-bold">{String(v)}</span>
              </div>
            ))}
        </div>
      )}

      {/* Main Array Visualization Canvas */}
      <div className="my-auto py-6">
        {displayArray.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">Empty Array</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                The array contains 0 elements (length = 0). No memory index offsets exist in this state.
              </p>
            </div>
          </div>
        ) : (
          /* Horizontal Scrollable Container to prevent page overflow */
          <div className="overflow-x-auto pb-4 pt-2 px-2 custom-scrollbar">
            <div className="flex items-center justify-start sm:justify-center gap-3 sm:gap-4 min-w-max mx-auto px-4">
              {displayArray.map((val, idx) => {
                const highlightType = highlights[idx];
                const visuals = getCellVisuals(idx, highlightType);
                const indexPointers = pointers.filter((p) => p.index === idx);

                return (
                  <div key={idx} className="flex flex-col items-center gap-2 relative shrink-0">
                    
                    {/* Top Pointer & Status Badge */}
                    <div className="h-7 flex items-end justify-center gap-1">
                      {indexPointers.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {indexPointers.map((p, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold text-[10px] shadow-xs flex items-center gap-1"
                              title={`Pointer: ${p.name} at index ${p.index}`}
                            >
                              <span>{p.name}</span>
                            </span>
                          ))}
                        </div>
                      ) : visuals.badgeText ? (
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold ${visuals.badgeClass}`}>
                          {visuals.badgeText}
                        </span>
                      ) : (
                        <span className="text-[10px] text-transparent select-none">.</span>
                      )}
                    </div>

                    {/* Array Cell */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 relative ${visuals.containerClass}`}
                      aria-label={`Index ${idx}, Value ${val}. ${visuals.ariaStatus}`}
                      role="group"
                    >
                      <span className="font-mono text-xl sm:text-2xl font-bold tracking-tight">
                        {val}
                      </span>
                    </div>

                    {/* Bottom Zero-Based Index Tag */}
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-xs text-slate-600 font-bold">
                        [{idx}]
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        offset {idx}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Accessible Legend Bar */}
      <div className="pt-4 border-t border-slate-200 text-xs text-slate-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-500" />
              <span>Legend:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-indigo-600"></div>
              <span>Active Pointer</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-amber-500"></div>
              <span>Comparing</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-600"></div>
              <span>Match / Found</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-teal-500"></div>
              <span>Insert</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span>Shifting</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-rose-500"></div>
              <span>Delete</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-300"></div>
              <span>Visited</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            <span>Indices: 0 to N-1</span>
          </div>
        </div>
      </div>

    </div>
  );
};
