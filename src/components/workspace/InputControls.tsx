import React, { useState } from 'react';
import { SlidersHorizontal, RefreshCw, AlertCircle } from 'lucide-react';

interface InputControlsProps {
  initialArray: number[];
  onApplyArray: (newArr: number[]) => void;
  disabled?: boolean;
}

export const InputControls: React.FC<InputControlsProps> = ({
  initialArray,
  onApplyArray,
  disabled = false
}) => {
  const [inputText, setInputText] = useState(initialArray.join(', '));
  const [error, setError] = useState<string | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parts = inputText.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
    const parsedNumbers = parts.map(Number);

    if (parsedNumbers.some(isNaN)) {
      setError('Please enter valid numbers separated by commas.');
      return;
    }

    if (parsedNumbers.length === 0) {
      setError('Array must contain at least 1 number.');
      return;
    }

    if (parsedNumbers.length > 8) {
      setError('Maximum 8 elements recommended for visualization.');
      return;
    }

    onApplyArray(parsedNumbers);
  };

  const handleGenerateRandom = () => {
    setError(null);
    const length = 5;
    const randomArray = Array.from({ length }, () => Math.floor(Math.random() * 90) + 10);
    setInputText(randomArray.join(', '));
    onApplyArray(randomArray);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-md space-y-3 text-slate-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Array Input Configuration
          </h4>
        </div>
      </div>

      <form onSubmit={handleApply} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              setError(null);
            }}
            placeholder="e.g. 10, 20, 30, 40, 50"
            disabled={disabled}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
            aria-label="Custom array numbers"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={disabled}
            className="flex-1 sm:flex-initial px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Update Array
          </button>

          <button
            type="button"
            onClick={handleGenerateRandom}
            disabled={disabled}
            className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-50 text-slate-700 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            title="Generate random array"
            aria-label="Generate random array"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
