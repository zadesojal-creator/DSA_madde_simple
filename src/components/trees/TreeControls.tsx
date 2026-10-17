import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Search, 
  Trash2, 
  Hash, 
  Ruler, 
  Leaf, 
  ArrowDownUp, 
  AlertCircle
} from 'lucide-react';

interface TreeControlsProps {
  mode: 'binary-tree' | 'traversals' | 'bst';
  currentInput: string;
  onInputChange: (val: string) => void;
  onExecute: (op: string, target?: number, value?: number) => void;
  disabled?: boolean;
}

export const TreeControls: React.FC<TreeControlsProps> = ({
  mode,
  currentInput,
  onInputChange,
  onExecute,
  disabled = false
}) => {
  const [targetInput, setTargetInput] = useState<string>('42');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleValidateNumber = (val: string, name: string): number | null => {
    const num = Number(val.trim());
    if (isNaN(num) || !Number.isInteger(num)) {
      setValidationError(`Please enter a valid integer for ${name}.`);
      return null;
    }
    setValidationError(null);
    return num;
  };

  const presets = {
    'binary-tree': [
      { label: 'Sample Balanced', value: '1,2,3,4,5' },
      { label: 'With Null Slots', value: '1,2,3,null,4' },
      { label: 'Single Node', value: '42' },
      { label: 'Deeper Tree', value: '10,20,30,40,50,60,70' }
    ],
    'traversals': [
      { label: 'Standard 5-Node', value: '1,2,3,4,5' },
      { label: 'Binary Search Tree Set', value: '4,2,6,1,3,5,7' },
      { label: 'Left Leaning', value: '1,2,null,3,null' },
      { label: 'Single Root', value: '10' }
    ],
    'bst': [
      { label: 'Balanced BST', value: '50,30,70,20,40,60,80' },
      { label: 'Ascending Skew', value: '10,20,30,40,50' },
      { label: 'Descending Skew', value: '50,40,30,20,10' },
      { label: 'Duplicate Test', value: '50,30,70,30' }
    ]
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Operations & Input Controls</h3>
          <p className="text-xs text-slate-500">
            {mode === 'binary-tree' && 'Manage binary tree structure, inspect properties, or insert nodes level-order.'}
            {mode === 'traversals' && 'Select traversal algorithm and step through C++ execution.'}
            {mode === 'bst' && 'Strict BST invariant (Left < Root < Right) with duplicate rejection policy.'}
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Presets:</span>
          {presets[mode].map(p => (
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
        {/* Main Tree Array Input */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {mode === 'binary-tree' || mode === 'traversals'
              ? 'Level-Order Array Tokens (supports "null")'
              : 'Initial BST Keys (comma-separated integers)'}
          </label>
          <input
            type="text"
            value={currentInput}
            onChange={(e) => onInputChange(e.target.value)}
            disabled={disabled}
            placeholder={mode === 'bst' ? '50,30,70,20,40,60,80' : '1,2,3,null,4'}
            className="w-full px-3.5 py-2 text-sm font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors disabled:bg-slate-50"
          />
        </div>

        {/* Secondary Parameter (Target or Value) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target / Operand Value
          </label>
          <input
            type="text"
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            disabled={disabled}
            placeholder="e.g. 42"
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

      {/* Action Buttons Row */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
        {/* Binary Tree Mode */}
        {mode === 'binary-tree' && (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('tree-build')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Build Tree
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const val = handleValidateNumber(targetInput, 'Insert value');
                if (val !== null) onExecute('tree-insert', undefined, val);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              Level-Order Insert
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const target = handleValidateNumber(targetInput, 'Search target');
                if (target !== null) onExecute('tree-search', target);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              Search Value
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('tree-size')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <Hash className="w-3.5 h-3.5 text-slate-500" />
              Count Nodes
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('tree-height')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <Ruler className="w-3.5 h-3.5 text-slate-500" />
              Calculate Height
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('tree-leaves')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              Count Leaves
            </button>
          </>
        )}

        {/* Tree Traversals Mode */}
        {mode === 'traversals' && (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('traversal-preorder')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Preorder (Root → L → R)
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('traversal-inorder')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Inorder (L → Root → R)
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('traversal-postorder')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Postorder (L → R → Root)
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('traversal-level-order')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              Level-Order (Queue BFS)
            </button>
          </>
        )}

        {/* Binary Search Tree Mode */}
        {mode === 'bst' && (
          <>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const val = handleValidateNumber(targetInput, 'Insert value');
                if (val !== null) onExecute('bst-insert', undefined, val);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              Insert BST
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const target = handleValidateNumber(targetInput, 'Search target');
                if (target !== null) onExecute('bst-search', target);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              Search Key
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const target = handleValidateNumber(targetInput, 'Delete target');
                if (target !== null) onExecute('bst-delete', target);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Key
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('bst-min')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              Find Min
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('bst-max')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              Find Max
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => onExecute('bst-inorder')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              <ArrowDownUp className="w-3.5 h-3.5 text-slate-500" />
              Sorted Inorder
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const target = handleValidateNumber(targetInput, 'Target node');
                if (target !== null) onExecute('bst-pred-succ', target);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
            >
              Pred & Succ
            </button>
          </>
        )}
      </div>
    </div>
  );
};
