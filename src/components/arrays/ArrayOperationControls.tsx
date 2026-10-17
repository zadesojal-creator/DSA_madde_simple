import React, { useState } from 'react';
import type { ArrayOperationType } from '../../algorithms/arrays/operationConfig';
import { ARRAY_OPERATIONS, ARRAY_OPERATION_LIST } from '../../algorithms/arrays/operationConfig';
import { isSortedAscending } from '../../algorithms/arrays/arrayTraces';
import { 
  SlidersHorizontal, 
  RefreshCw, 
  AlertCircle, 
  ArrowUpDown, 
  Check
} from 'lucide-react';

interface ArrayOperationControlsProps {
  currentOperation: ArrayOperationType;
  onSelectOperation: (op: ArrayOperationType) => void;
  array: number[];
  initialIndex?: number;
  initialValue?: number;
  initialTarget?: number;
  onApplyChanges: (params: {
    array: number[];
    index?: number;
    value?: number;
    target?: number;
  }) => void;
  disabled?: boolean;
}

export const ArrayOperationControls: React.FC<ArrayOperationControlsProps> = ({
  currentOperation,
  onSelectOperation,
  array,
  initialIndex,
  initialValue,
  initialTarget,
  onApplyChanges,
  disabled = false
}) => {
  const meta = ARRAY_OPERATIONS[currentOperation];

  // Local state for array text and parameters
  const [arrayText, setArrayText] = useState(array.join(', '));
  const [indexInput, setIndexInput] = useState<string>(
    String(initialIndex ?? meta.defaultParams?.index ?? 0)
  );
  const [valueInput, setValueInput] = useState<string>(
    String(initialValue ?? meta.defaultParams?.value ?? 99)
  );
  const [targetInput, setTargetInput] = useState<string>(
    String(initialTarget ?? meta.defaultParams?.target ?? array[0] ?? 42)
  );

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Validation & Parse Array Text
  const parseArray = (text: string): { parsed: number[] | null; err: string | null } => {
    const trimmed = text.trim();
    if (!trimmed) {
      return { parsed: [], err: null };
    }

    const parts = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    const numbers: number[] = [];

    for (const part of parts) {
      const num = Number(part);
      if (isNaN(num)) {
        return { parsed: null, err: `"${part}" is not a valid number. Please enter comma-separated numbers.` };
      }
      numbers.push(num);
    }

    if (numbers.length > 12) {
      return { parsed: null, err: 'Array size limit: Maximum 12 elements for visual clarity.' };
    }

    return { parsed: numbers, err: null };
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const { parsed, err } = parseArray(arrayText);
    if (err) {
      setError(err);
      return;
    }
    if (parsed === null) return;

    const workingArray = parsed;

    // Operation-specific validations
    if (currentOperation === 'access') {
      if (workingArray.length === 0) {
        setError('Cannot access an element in an empty array.');
        return;
      }
      const idx = Number(indexInput.trim());
      if (isNaN(idx) || !Number.isInteger(idx)) {
        setError('Access index must be an integer.');
        return;
      }
      if (idx < 0 || idx >= workingArray.length) {
        setError(`Index ${idx} is out of bounds. Valid range: 0 to ${workingArray.length - 1}.`);
        return;
      }
      onApplyChanges({ array: workingArray, index: idx });
      return;
    }

    if (currentOperation === 'update') {
      if (workingArray.length === 0) {
        setError('Cannot update an element in an empty array.');
        return;
      }
      const idx = Number(indexInput.trim());
      if (isNaN(idx) || !Number.isInteger(idx)) {
        setError('Update index must be an integer.');
        return;
      }
      if (idx < 0 || idx >= workingArray.length) {
        setError(`Target index ${idx} is out of bounds. Valid range: 0 to ${workingArray.length - 1}.`);
        return;
      }
      const val = Number(valueInput.trim());
      if (isNaN(val)) {
        setError('Replacement value must be a valid number.');
        return;
      }
      onApplyChanges({ array: workingArray, index: idx, value: val });
      return;
    }

    if (currentOperation === 'insert') {
      const idx = Number(indexInput.trim());
      if (isNaN(idx) || !Number.isInteger(idx)) {
        setError('Insertion index must be an integer.');
        return;
      }
      if (idx < 0 || idx > workingArray.length) {
        setError(`Insertion index ${idx} is out of range. Valid range: 0 to ${workingArray.length}.`);
        return;
      }
      const val = Number(valueInput.trim());
      if (isNaN(val)) {
        setError('Value to insert must be a valid number.');
        return;
      }
      if (workingArray.length >= 12) {
        setError('Maximum array limit of 12 reached. Delete an element first.');
        return;
      }
      onApplyChanges({ array: workingArray, index: idx, value: val });
      return;
    }

    if (currentOperation === 'delete') {
      if (workingArray.length === 0) {
        setError('Cannot delete from an empty array.');
        return;
      }
      const idx = Number(indexInput.trim());
      if (isNaN(idx) || !Number.isInteger(idx)) {
        setError('Deletion index must be an integer.');
        return;
      }
      if (idx < 0 || idx >= workingArray.length) {
        setError(`Deletion index ${idx} is out of bounds. Valid range: 0 to ${workingArray.length - 1}.`);
        return;
      }
      onApplyChanges({ array: workingArray, index: idx });
      return;
    }

    if (currentOperation === 'linear-search') {
      const tgt = Number(targetInput.trim());
      if (isNaN(tgt)) {
        setError('Target search value must be a valid number.');
        return;
      }
      onApplyChanges({ array: workingArray, target: tgt });
      return;
    }

    if (currentOperation === 'binary-search') {
      const tgt = Number(targetInput.trim());
      if (isNaN(tgt)) {
        setError('Target search value must be a valid number.');
        return;
      }

      if (workingArray.length > 0 && !isSortedAscending(workingArray)) {
        setError('Binary Search requires a sorted array! Please sort the array or click "Sort Array Now".');
        return;
      }

      onApplyChanges({ array: workingArray, target: tgt });
      return;
    }

    // Default for array-basics & traversal
    onApplyChanges({ array: workingArray });
  };

  const handleRandomize = () => {
    setError(null);
    setInfoMessage(null);
    const length = 6;
    let newArr = Array.from({ length }, () => Math.floor(Math.random() * 85) + 10);
    if (currentOperation === 'binary-search') {
      newArr.sort((a, b) => a - b);
    }
    setArrayText(newArr.join(', '));
    const randomTarget = newArr[Math.floor(Math.random() * newArr.length)];
    setTargetInput(String(randomTarget));
    setIndexInput('1');
    onApplyChanges({ array: newArr, target: randomTarget, index: 1, value: 99 });
  };

  const handleExplicitSort = () => {
    const { parsed, err } = parseArray(arrayText);
    if (err || !parsed) {
      setError(err ?? 'Cannot sort invalid array.');
      return;
    }
    const sorted = [...parsed].sort((a, b) => a - b);
    setArrayText(sorted.join(', '));
    setError(null);
    setInfoMessage('Array sorted in ascending order for Binary Search.');
    const tgt = Number(targetInput.trim());
    onApplyChanges({ array: sorted, target: isNaN(tgt) ? sorted[0] : tgt });
  };

  const isCurrentArraySorted = () => {
    const { parsed } = parseArray(arrayText);
    if (!parsed || parsed.length <= 1) return true;
    return isSortedAscending(parsed);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-md space-y-5 text-slate-900">
      
      {/* Operation Selection Pills */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Array Operations
            </h4>
          </div>
          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold">
            8 C++ Algorithms
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {ARRAY_OPERATION_LIST.map((op) => {
            const isActive = op.id === currentOperation;
            return (
              <button
                key={op.id}
                onClick={() => onSelectOperation(op.id)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-50'
                }`}
              >
                {op.shortTitle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operation Title & Quick Guide */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
        <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
          <span>{meta.title}</span>
        </h5>
        <p className="text-xs text-slate-600 leading-relaxed">
          {meta.description}
        </p>
      </div>

      {/* Main Configuration Form */}
      <form onSubmit={handleApply} className="space-y-4">
        
        {/* Array Values Input Row */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Array Elements (comma-separated):</span>
            <span className="font-mono text-[11px] text-slate-400 font-normal">e.g. 10, 20, 30, 40, 50</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={arrayText}
              onChange={(e) => {
                setArrayText(e.target.value);
                setError(null);
                setInfoMessage(null);
              }}
              placeholder="e.g. 10, 20, 30, 40, 50"
              disabled={disabled}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
            />
            <button
              type="button"
              onClick={handleRandomize}
              disabled={disabled}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0"
              title="Generate random array"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Random</span>
            </button>
          </div>
        </div>

        {/* Binary Search Unsorted Warning & Explicit Sort Action */}
        {currentOperation === 'binary-search' && !isCurrentArraySorted() && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Sorted Array Required: </span>
                <span>
                  Binary search relies on divide-and-conquer and will fail or yield invalid bounds on unsorted data.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExplicitSort}
              disabled={disabled}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Array for Binary Search</span>
            </button>
          </div>
        )}

        {/* Dynamic Parameter Fields Depending on Operation */}
        {(currentOperation === 'access' || currentOperation === 'delete') && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Target Index:</span>
              <span className="font-mono text-[11px] text-slate-500 font-normal">
                Valid: 0 to {Math.max(0, array.length - 1)}
              </span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={indexInput}
                onChange={(e) => {
                  setIndexInput(e.target.value);
                  setError(null);
                }}
                min={0}
                max={Math.max(0, array.length - 1)}
                disabled={disabled}
                className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIndexInput('0')}
                  disabled={disabled || array.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700"
                >
                  Start [0]
                </button>
                <button
                  type="button"
                  onClick={() => setIndexInput(String(Math.floor(array.length / 2)))}
                  disabled={disabled || array.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700"
                >
                  Mid [{Math.floor(array.length / 2)}]
                </button>
                <button
                  type="button"
                  onClick={() => setIndexInput(String(Math.max(0, array.length - 1)))}
                  disabled={disabled || array.length === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700"
                >
                  End [{Math.max(0, array.length - 1)}]
                </button>
              </div>
            </div>
          </div>
        )}

        {currentOperation === 'update' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Index (0 to {Math.max(0, array.length - 1)}):</label>
              <input
                type="number"
                value={indexInput}
                onChange={(e) => {
                  setIndexInput(e.target.value);
                  setError(null);
                }}
                min={0}
                max={Math.max(0, array.length - 1)}
                disabled={disabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New Replacement Value:</label>
              <input
                type="number"
                value={valueInput}
                onChange={(e) => {
                  setValueInput(e.target.value);
                  setError(null);
                }}
                disabled={disabled}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {currentOperation === 'insert' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Insert Index (0 to {array.length}):</label>
                <input
                  type="number"
                  value={indexInput}
                  onChange={(e) => {
                    setIndexInput(e.target.value);
                    setError(null);
                  }}
                  min={0}
                  max={array.length}
                  disabled={disabled}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Value to Insert:</label>
                <input
                  type="number"
                  value={valueInput}
                  onChange={(e) => {
                    setValueInput(e.target.value);
                    setError(null);
                  }}
                  disabled={disabled}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Quick Presets for Insert */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium">Quick position:</span>
              <button
                type="button"
                onClick={() => setIndexInput('0')}
                disabled={disabled}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 border border-slate-200"
              >
                Start (0)
              </button>
              <button
                type="button"
                onClick={() => setIndexInput(String(Math.floor(array.length / 2)))}
                disabled={disabled}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 border border-slate-200"
              >
                Middle ({Math.floor(array.length / 2)})
              </button>
              <button
                type="button"
                onClick={() => setIndexInput(String(array.length))}
                disabled={disabled}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 border border-slate-200"
              >
                End ({array.length})
              </button>
            </div>
          </div>
        )}

        {(currentOperation === 'linear-search' || currentOperation === 'binary-search') && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Target Value to Find:</span>
              <span className="font-mono text-[11px] text-slate-500 font-normal">Number</span>
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="number"
                value={targetInput}
                onChange={(e) => {
                  setTargetInput(e.target.value);
                  setError(null);
                }}
                disabled={disabled}
                className="w-32 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50"
              />
              {array.length > 0 && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-400">Pick:</span>
                  <button
                    type="button"
                    onClick={() => setTargetInput(String(array[0]))}
                    disabled={disabled}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700"
                  >
                    {array[0]}
                  </button>
                  {array.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setTargetInput(String(array[Math.floor(array.length / 2)]))}
                      disabled={disabled}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700"
                    >
                      {array[Math.floor(array.length / 2)]}
                    </button>
                  )}
                  {array.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTargetInput(String(array[array.length - 1]))}
                      disabled={disabled}
                      className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-slate-700"
                    >
                      {array[array.length - 1]}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setTargetInput('999')}
                    disabled={disabled}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-mono text-rose-600"
                    title="Test missing target"
                  >
                    999 (Not Found)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button & Feedback */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Generate & Execute Trace</span>
          </button>

          <span className="text-[11px] text-slate-400 font-mono text-center sm:text-right">
            Resets playback to step 1
          </span>
        </div>

      </form>

      {/* Accessible Error / Info Notices */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-700 font-medium" role="alert">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800 font-medium" role="status">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

    </div>
  );
};
