import React, { useState } from 'react';
import { 
  RotateCcw, 
  Dices, 
  ArrowDownUp, 
  AlertCircle, 
  Check, 
  Search
} from 'lucide-react';
import { isSorted, parseArrayInput } from '../../services/cppExecutionAdapter';

interface AlgorithmControlsProps {
  array: number[];
  target?: number;
  isSearching?: boolean;
  requiresSorted?: boolean;
  onApply: (newArray: number[], newTarget?: number) => void;
  onReset: () => void;
  isPlaying: boolean;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({
  array,
  target = 42,
  isSearching = false,
  requiresSorted = false,
  onApply,
  onReset,
  isPlaying
}) => {
  const [arrayInputText, setArrayInputText] = useState(array.join(', '));
  const [targetInputText, setTargetInputText] = useState(String(target));
  const [validationError, setValidationError] = useState<string | null>(null);

  const parsed = parseArrayInput(arrayInputText, 25);
  const currentIsSorted = isSorted(parsed.array);

  const handleApply = (customArr?: number[], customTgt?: number) => {
    const arrToUse = customArr ?? parsed.array;
    const tgtToUse = customTgt !== undefined ? customTgt : Number(targetInputText) || 0;

    if (customArr === undefined) {
      if (parsed.error) {
        setValidationError(parsed.error);
        return;
      }
      if (arrToUse.length === 0) {
        setValidationError('Array cannot be empty. Please enter at least 1 number.');
        return;
      }
    }

    setValidationError(null);
    onApply(arrToUse, tgtToUse);
  };

  const generatePreset = (type: 'random' | 'nearly-sorted' | 'reversed' | 'duplicates' | 'all-equal') => {
    let newArr: number[] = [];
    const size = 6 + Math.floor(Math.random() * 4); // 6 to 9 items

    if (type === 'random') {
      newArr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    } else if (type === 'nearly-sorted') {
      newArr = Array.from({ length: size }, (_, i) => (i + 1) * 10 + Math.floor(Math.random() * 5));
      if (newArr.length > 3) {
        // Swap one pair to make it nearly sorted
        const temp = newArr[1];
        newArr[1] = newArr[2];
        newArr[2] = temp;
      }
    } else if (type === 'reversed') {
      newArr = Array.from({ length: size }, (_, i) => (size - i) * 10 + 5);
    } else if (type === 'duplicates') {
      const pool = [12, 28, 45, 60];
      newArr = Array.from({ length: size }, () => pool[Math.floor(Math.random() * pool.length)]);
    } else if (type === 'all-equal') {
      newArr = Array.from({ length: 5 }, () => 42);
    }

    if (requiresSorted) {
      newArr.sort((a, b) => a - b);
    }

    const newTarget = newArr.length > 0 ? newArr[Math.floor(Math.random() * newArr.length)] : 42;
    setArrayInputText(newArr.join(', '));
    setTargetInputText(String(newTarget));
    setValidationError(null);
    handleApply(newArr, newTarget);
  };

  const handleSortInput = () => {
    if (parsed.array.length > 0) {
      const sorted = [...parsed.array].sort((a, b) => a - b);
      setArrayInputText(sorted.join(', '));
      setValidationError(null);
      handleApply(sorted);
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 space-y-5 shadow-lg text-slate-900">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Input Controls & Test Cases
          </h3>
          <p className="text-xs text-slate-500">
            Configure input parameters passed to the native C++ algorithm engine.
          </p>
        </div>

        {/* Preset Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Presets:</span>
          <button
            onClick={() => generatePreset('random')}
            disabled={isPlaying}
            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all flex items-center gap-1 disabled:opacity-50"
          >
            <Dices className="w-3 h-3 text-indigo-600" />
            <span>Random</span>
          </button>
          <button
            onClick={() => generatePreset('nearly-sorted')}
            disabled={isPlaying}
            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all disabled:opacity-50"
          >
            Nearly Sorted
          </button>
          <button
            onClick={() => generatePreset('reversed')}
            disabled={isPlaying}
            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all disabled:opacity-50"
          >
            Reversed
          </button>
          <button
            onClick={() => generatePreset('duplicates')}
            disabled={isPlaying}
            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all disabled:opacity-50"
          >
            Duplicates
          </button>
          <button
            onClick={() => generatePreset('all-equal')}
            disabled={isPlaying}
            className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium transition-all disabled:opacity-50"
          >
            All Equal
          </button>
        </div>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Array Input Field */}
        <div className={`space-y-1.5 ${isSearching ? 'md:col-span-8' : 'md:col-span-10'}`}>
          <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
            <span>Array Elements (comma or space separated)</span>
            <span className="text-[11px] font-mono text-slate-400">
              Max 25 elements
            </span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={arrayInputText}
              onChange={(e) => {
                setArrayInputText(e.target.value);
                setValidationError(null);
              }}
              disabled={isPlaying}
              placeholder="e.g. 29, 10, 14, 37, 13"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 font-mono text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 disabled:opacity-60 transition-all"
            />
          </div>
        </div>

        {/* Target Input (for searching) */}
        {isSearching && (
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Value</span>
            </label>
            <input
              type="number"
              value={targetInputText}
              onChange={(e) => {
                setTargetInputText(e.target.value);
                setValidationError(null);
              }}
              disabled={isPlaying}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 font-mono text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 disabled:opacity-60 transition-all text-center"
            />
          </div>
        )}

        {/* Apply & Reset Buttons */}
        <div className="flex items-center gap-2 md:col-span-2">
          <button
            onClick={() => handleApply()}
            disabled={isPlaying}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply</span>
          </button>
          <button
            onClick={onReset}
            disabled={isPlaying}
            className="p-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all disabled:opacity-50 cursor-pointer"
            title="Reset playback"
            aria-label="Reset playback"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Binary Search Sorted Order Precondition Warning & Quick Sort Button */}
      {requiresSorted && !currentIsSorted && parsed.array.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Sorted Precondition Required: </span>
              <span>Binary search requires non-decreasing sorted order. The entered array is currently unsorted.</span>
            </div>
          </div>
          <button
            onClick={handleSortInput}
            disabled={isPlaying}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all shadow-xs shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <ArrowDownUp className="w-3.5 h-3.5" />
            <span>Sort Array First</span>
          </button>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

    </div>
  );
};
