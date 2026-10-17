import React, { useState } from 'react';
import { 
  Plus, 
  ArrowDownToLine, 
  Eye, 
  AlertCircle,
  Hammer
} from 'lucide-react';

interface HeapControlsProps {
  heapType: 'min' | 'max';
  currentInput: string;
  onInputChange: (val: string) => void;
  onExecute: (op: string, target?: number) => void;
  disabled?: boolean;
}

export const HeapControls: React.FC<HeapControlsProps> = ({
  heapType,
  currentInput,
  onInputChange,
  onExecute,
  disabled = false
}) => {
  const [insertValue, setInsertValue] = useState<string>('1');
  const [validationError, setValidationError] = useState<string | null>(null);

  const presets = [
    { label: 'Unsorted 6', value: '9,5,2,7,1,8' },
    { label: 'Random 7', value: '3,10,1,14,8,20,7' },
    { label: 'Ascending', value: '1,2,3,4,5,6' },
    { label: 'Descending', value: '20,15,10,5,1' },
    { label: 'Single Element', value: '42' }
  ];

  const handleValidateNumber = (val: string, name: string): number | null => {
    const num = Number(val.trim());
    if (isNaN(num) || !Number.isInteger(num)) {
      setValidationError(`Please enter a valid integer for ${name}.`);
      return null;
    }
    setValidationError(null);
    return num;
  };

  const prefix = heapType === 'min' ? 'min-heap' : 'max-heap';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            {heapType === 'min' ? 'Min-Heap Controls' : 'Max-Heap Controls'}
          </h3>
          <p className="text-xs text-slate-500">
            Array-backed complete binary tree. All operations execute directly in C++.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Presets:</span>
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              disabled={disabled}
              onClick={() => onInputChange(p.value)}
              className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Initial Array Storage (comma-separated integers)
          </label>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 9,5,2,7,1,8"
            className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Value to Insert
          </label>
          <input
            type="text"
            value={insertValue}
            onChange={(e) => setInsertValue(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 1"
            className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors disabled:bg-slate-50"
          />
        </div>
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Operations Row */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onExecute(`${prefix}-build`)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Hammer className="w-3.5 h-3.5" />
          Build Heap (Bottom-Up O(n))
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            const val = handleValidateNumber(insertValue, 'Insert value');
            if (val !== null) onExecute(`${prefix}-insert`, val);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5 text-teal-600" />
          Insert (Sift-Up)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onExecute(`${prefix}-extract`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
        >
          <ArrowDownToLine className="w-3.5 h-3.5" />
          Extract {heapType === 'min' ? 'Min' : 'Max'} (Sift-Down)
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onExecute(`${prefix}-peek`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          Peek Root O(1)
        </button>
      </div>
    </div>
  );
};
