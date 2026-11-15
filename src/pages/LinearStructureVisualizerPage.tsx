import React, { useEffect, useMemo, useState, useRef } from 'react';
import { usePlayback } from '../hooks/usePlayback';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { executeCppLinearStructure } from '../services/cppExecutionAdapter';
import type { ComplexityInfo, TraceStep } from '../types/trace';
import { Play, RotateCcw, Plus, Trash2, Search, ArrowRightLeft, ArrowRight, CornerDownRight, CheckCircle2 } from 'lucide-react';

type LinearStructureMode = 'queue' | 'circular-queue' | 'deque' | 'singly' | 'doubly' | 'circular';

interface LinearStructureVisualizerPageProps {
  mode: LinearStructureMode;
}

interface OperationOption {
  id: string;
  title: string;
  description: string;
}

const queueOperations: OperationOption[] = [
  { id: 'queue-intro', title: 'Queue Introduction', description: 'See the bounded circular-buffer representation and FIFO order.' },
  { id: 'queue-enqueue', title: 'Enqueue', description: 'Insert an item at the next circular position.' },
  { id: 'queue-dequeue', title: 'Dequeue', description: 'Remove the value at the logical front.' },
  { id: 'queue-peek', title: 'Front / Peek', description: 'Read the front value without removing it.' },
  { id: 'queue-rear', title: 'Rear', description: 'Read the last logical value, even after wraparound.' },
  { id: 'queue-is-empty', title: 'Is Empty', description: 'Check the queue count against zero.' },
  { id: 'queue-is-full', title: 'Is Full', description: 'Check the queue count against its capacity.' },
  { id: 'queue-size', title: 'Queue Size', description: 'Read the current element count.' },
  { id: 'queue-clear', title: 'Clear Queue', description: 'Mark storage slots free and reset the logical front and size.' }
];

const dequeOperations: OperationOption[] = [
  { id: 'deque-intro', title: 'Deque Introduction', description: 'Inspect the circular-buffer representation and both ends.' },
  { id: 'deque-push-front', title: 'Push Front', description: 'Move the front index backward circularly, then insert.' },
  { id: 'deque-push-back', title: 'Push Back', description: 'Insert at the next position after the back.' },
  { id: 'deque-pop-front', title: 'Pop Front', description: 'Remove the front element.' },
  { id: 'deque-pop-back', title: 'Pop Back', description: 'Remove the back element.' },
  { id: 'deque-peek-front', title: 'Peek Front', description: 'Read the front value without removing it.' },
  { id: 'deque-peek-back', title: 'Peek Back', description: 'Read the back value without removing it.' },
  { id: 'deque-is-empty', title: 'Is Empty', description: 'Check whether the deque has no elements.' },
  { id: 'deque-is-full', title: 'Is Full', description: 'Check whether the deque has reached capacity.' },
  { id: 'deque-size', title: 'Size', description: 'Read the current deque size.' }
];

const linkedListOperations: OperationOption[] = [
  { id: 'list-create', title: 'Create / Set List', description: 'Allocate nodes and link them into an initial linked list structure.' },
  { id: 'list-traverse', title: 'Traverse Forward', description: 'Visit nodes sequentially in head-to-tail order.' },
  { id: 'list-traverse-backward', title: 'Traverse Backward', description: 'Visit nodes tail-to-head (doubly linked list only).' },
  { id: 'list-insert-head', title: 'Insert at Head', description: 'Allocate a new node, link new_node->next = head, and update head.' },
  { id: 'list-insert-tail', title: 'Insert at Tail', description: 'Allocate a node and link it after the current tail.' },
  { id: 'list-insert-index', title: 'Insert at Index', description: 'Traverse to predecessor; splice new node into pointer chain.' },
  { id: 'list-delete-head', title: 'Delete at Head', description: 'Detach and deallocate the first node; head moves to next.' },
  { id: 'list-delete-tail', title: 'Delete at Tail', description: 'Find and remove the final node from the list.' },
  { id: 'list-delete-index', title: 'Delete at Index', description: 'Traverse to selected index, bypass node in links, and deallocate.' },
  { id: 'list-search', title: 'Search Value', description: 'Compare node values in traversal order until target is located.' },
  { id: 'list-update', title: 'Update Node Value', description: 'Traverse to an index, then replace its node value in-place.' },
  { id: 'list-reverse', title: 'Reverse List', description: 'Iteratively invert all next/prev pointers in the list.' },
  { id: 'list-length', title: 'Get Length', description: 'Count total nodes in the linked list.' }
];

const titleByMode: Record<LinearStructureMode, string> = {
  queue: 'Queue',
  'circular-queue': 'Circular Queue',
  deque: 'Deque',
  singly: 'Singly Linked List',
  doubly: 'Doubly Linked List',
  circular: 'Circular Linked List'
};

const complexityFor = (mode: LinearStructureMode, operation: string): ComplexityInfo => {
  const listOperation = ['singly', 'doubly', 'circular'].includes(mode);
  let time = 'O(1)';
  let description = 'The operation updates pointers in constant time without iteration.';
  if (listOperation && ['list-traverse', 'list-traverse-backward', 'list-search', 'list-reverse', 'list-insert-index', 'list-delete-index', 'list-update'].includes(operation)) {
    time = 'O(n)';
    description = 'The operation traverses nodes sequentially; a visual index is not a constant-time address.';
  } else if (listOperation && operation === 'list-delete-tail' && mode !== 'doubly') {
    time = 'O(n)';
    description = 'A singly linked list must traverse to the predecessor of the tail node.';
  } else if (listOperation && operation === 'list-create') {
    time = 'O(n)';
    description = 'Creating n nodes allocates and links each node once.';
  } else if (operation === 'queue-clear') {
    time = 'O(capacity)';
    description = 'Each occupied-slot flag is cleared; the implementation also resets front and count.';
  }
  return {
    timeComplexity: { best: time, average: time, worst: time, description },
    spaceComplexity: { worst: 'O(n)', description: 'Storage for the data structure and immutable snapshots used in the trace.' }
  };
};

function parseIntegerList(raw: string): { values: number[]; error?: string } {
  if (!raw.trim()) return { values: [] };
  const tokens = raw.trim().split(/[\s,]+/);
  if (tokens.length > 25) return { values: [], error: 'Use at most 25 integer values for clean visualization.' };
  const values: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) return { values: [], error: `"${token}" is not a valid integer.` };
    const value = Number(token);
    if (!Number.isSafeInteger(value)) return { values: [], error: `"${token}" is outside the safe integer range.` };
    values.push(value);
  }
  return { values };
}

const failureStep = (description: string): TraceStep => ({
  id: 0,
  stepIndex: 0,
  title: 'Input error',
  description,
  sourceLine: 1,
  activeLine: 1,
  statusType: 'error',
  statusText: description,
  isCompleted: true
});

export const LinearStructureVisualizerPage: React.FC<LinearStructureVisualizerPageProps> = ({ mode }) => {
  const title = titleByMode[mode];
  const linkedList = ['singly', 'doubly', 'circular'].includes(mode);
  const circularQueue = mode === 'circular-queue';
  const operations = linkedList ? linkedListOperations.filter((item) => mode === 'doubly' || item.id !== 'list-traverse-backward') : mode === 'deque' ? dequeOperations : [
    ...(circularQueue ? [{ id: 'queue-demo', title: 'Circular Queue Demonstration', description: 'Run a complete empty/full/wraparound/rejection cycle in C++.' }] : []),
    ...queueOperations
  ];
  const initialOperation = circularQueue ? 'queue-demo' : linkedList ? 'list-traverse' : mode === 'deque' ? 'deque-intro' : 'queue-intro';
  const [operation, setOperation] = useState(initialOperation);
  const [valuesInput, setValuesInput] = useState(linkedList ? '10, 20, 30' : mode === 'circular-queue' ? '' : '10, 20, 30');
  const [capacityInput, setCapacityInput] = useState('5');
  const [valueInput, setValueInput] = useState('40');
  const [indexInput, setIndexInput] = useState('1');
  const [targetInput, setTargetInput] = useState('20');
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [sourceCode, setSourceCode] = useState('// Loading C++ source...');
  const [engineMessage, setEngineMessage] = useState('Waiting for native C++ execution.');
  const [loading, setLoading] = useState(true);
  const [execCount, setExecCount] = useState<number>(0);
  const operationInfo = operations.find((item) => item.id === operation) ?? operations[0];

  const parsedValues = useMemo(() => parseIntegerList(valuesInput), [valuesInput]);
  const inputError = useMemo(() => {
    if (parsedValues.error) return parsedValues.error;
    const capacity = Number(capacityInput);
    const value = Number(valueInput);
    const index = Number(indexInput);
    const target = Number(targetInput);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 30) return 'Capacity must be an integer between 1 and 30.';
    if (!linkedList && parsedValues.values.length > capacity) return 'Initial values cannot exceed the selected capacity.';
    if (!Number.isSafeInteger(value) || !Number.isSafeInteger(target)) return 'Value and target must be safe integers.';
    if (!Number.isInteger(index)) return 'Index must be an integer.';
    return undefined;
  }, [capacityInput, indexInput, linkedList, parsedValues, targetInput, valueInput]);

  const playback = usePlayback({ steps });
  const { play, reset: resetPlayback } = playback;
  const playRef = useRef(play);
  const resetRef = useRef(resetPlayback);

  useEffect(() => {
    playRef.current = play;
    resetRef.current = resetPlayback;
  }, [play, resetPlayback]);

  // Execute trace whenever operation, input, or trigger changes
  useEffect(() => {
    let active = true;
    if (inputError) return () => { active = false; };
    const parsed = parseIntegerList(valuesInput);
    const capacity = Number(capacityInput);
    const value = Number(valueInput);
    const index = Number(indexInput);
    const target = Number(targetInput);

    void executeCppLinearStructure({
      operation,
      values: parsed.values,
      capacity,
      value,
      index,
      target,
      structure: mode === 'doubly' ? 'doubly' : mode === 'circular' ? 'circular' : 'singly'
    }).then((result) => {
      if (!active) return;
      resetRef.current();
      setSteps(result.steps);
      setSourceCode(result.sourceCode);
      setEngineMessage(result.engineMessage);
      if (result.steps.length > 1) {
        setTimeout(() => {
          playRef.current();
        }, 80);
      }
    }).catch((error: unknown) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : String(error);
      resetRef.current();
      setSteps([failureStep(`Native C++ trace request failed: ${message}`)]);
      setEngineMessage('Native C++ trace request failed.');
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [operation, valuesInput, capacityInput, valueInput, indexInput, targetInput, mode, linkedList, inputError, execCount]);

  // Execute operation and update working list state for chaining
  const handlePerformOperation = (opId: string, customVal?: number, customIdx?: number, customTgt?: number) => {
    playback.reset();
    setOperation(opId);
    if (customVal !== undefined) setValueInput(String(customVal));
    if (customIdx !== undefined) setIndexInput(String(customIdx));
    if (customTgt !== undefined) setTargetInput(String(customTgt));

    // Optimistically update working list state for chained operations
    const current = parseIntegerList(valuesInput).values;
    if (opId === 'list-insert-head' && customVal !== undefined) {
      setValuesInput([customVal, ...current].join(', '));
    } else if (opId === 'list-insert-tail' && customVal !== undefined) {
      setValuesInput([...current, customVal].join(', '));
    } else if (opId === 'list-insert-index' && customVal !== undefined && customIdx !== undefined) {
      const next = [...current];
      next.splice(Math.max(0, Math.min(customIdx, current.length)), 0, customVal);
      setValuesInput(next.join(', '));
    } else if (opId === 'list-delete-head' && current.length > 0) {
      setValuesInput(current.slice(1).join(', '));
    } else if (opId === 'list-delete-tail' && current.length > 0) {
      setValuesInput(current.slice(0, -1).join(', '));
    } else if (opId === 'list-delete-index' && customIdx !== undefined && current.length > 0) {
      const next = [...current];
      next.splice(Math.max(0, Math.min(customIdx, current.length - 1)), 1);
      setValuesInput(next.join(', '));
    } else if (opId === 'list-reverse' && current.length > 1) {
      setValuesInput([...current].reverse().join(', '));
    } else if (opId === 'list-update' && customVal !== undefined && customIdx !== undefined && current.length > 0) {
      const next = [...current];
      const validIdx = Math.max(0, Math.min(customIdx, current.length - 1));
      next[validIdx] = customVal;
      setValuesInput(next.join(', '));
    }

    setExecCount((c) => c + 1);
  };

  const sourceLines = useMemo(() => (inputError ? '// Correct the input to load the matching C++ trace.' : sourceCode).split(/\r?\n/), [inputError, sourceCode]);
  const currentStep = inputError ? failureStep(inputError) : loading ? undefined : playback.currentStep;

  const presets = [
    { label: '3 Nodes', value: '10, 20, 30' },
    { label: '5 Nodes', value: '5, 12, 19, 28, 42' },
    { label: 'Single Node', value: '42' },
    { label: 'Empty List', value: '' }
  ];

  return (
    <VisualizerLayout activeTitle={`${title} Visualizer`}>
      <div className="space-y-6">
        {/* Header & Breadcrumbs */}
        <div className="space-y-1 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName={linkedList ? 'Linked Lists' : 'Stacks & Queues'}
            categoryRoute={linkedList ? '/visualizer/linked-lists/singly' : '/visualizer/stacks-queues/queue'}
            subtopicName={title}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-3">
                <span>{title} Visualizer</span>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-mono font-semibold text-violet-700">
                  {engineMessage || 'C++ Single Source of Truth'}
                </span>
              </h1>
              <p className="text-sm text-slate-600 pt-1">{operationInfo.description}</p>
            </div>

            {/* Presets */}
            {linkedList && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-400 font-medium">Presets:</span>
                {presets.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setValuesInput(p.value);
                      handlePerformOperation('list-create');
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Operation & Input Controls Bar */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            {/* Initial List Creation Field */}
            <div className={linkedList ? 'md:col-span-6' : 'md:col-span-5'}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {linkedList ? 'Live Linked List Nodes (comma or space separated)' : 'Initial values (comma or space separated)'}
              </label>
              <div className="flex gap-2">
                <input
                  value={valuesInput}
                  onChange={(event) => {
                    playback.reset();
                    setValuesInput(event.target.value);
                  }}
                  placeholder="e.g. 10, 20, 30"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-sm text-slate-900 focus:border-violet-500 focus:bg-white focus:outline-none transition-colors"
                />
                {linkedList && (
                  <button
                    type="button"
                    onClick={() => handlePerformOperation('list-create')}
                    className="shrink-0 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Set List
                  </button>
                )}
              </div>
            </div>

            {!linkedList && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={capacityInput}
                  onChange={(event) => {
                    playback.reset();
                    setCapacityInput(event.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            {/* Value Input */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operand Value</label>
              <input
                type="number"
                value={valueInput}
                onChange={(event) => setValueInput(event.target.value)}
                placeholder="e.g. 40"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Index / Target Input */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Index / Target</label>
              <input
                type="number"
                value={indexInput}
                onChange={(event) => {
                  setIndexInput(event.target.value);
                  setTargetInput(event.target.value);
                }}
                placeholder="e.g. 1"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons Toolbar for Linked Lists */}
          {linkedList ? (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePerformOperation('list-insert-head', Number(valueInput))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-violet-600 text-white hover:bg-violet-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Insert Head ({valueInput})
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-insert-tail', Number(valueInput))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Insert Tail ({valueInput})
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-insert-index', Number(valueInput), Number(indexInput))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-indigo-600" />
                Insert at Index [{indexInput}]
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-delete-head')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Head
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-delete-tail')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Tail
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-delete-index', undefined, Number(indexInput))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                Delete at Index [{indexInput}]
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-search', undefined, undefined, Number(valueInput))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <Search className="w-3.5 h-3.5 text-violet-600" />
                Search ({valueInput})
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-reverse')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-600" />
                Reverse List
              </button>

              <button
                type="button"
                onClick={() => handlePerformOperation('list-traverse')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              >
                <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                Traverse
              </button>

              {mode === 'doubly' && (
                <button
                  type="button"
                  onClick={() => handlePerformOperation('list-traverse-backward')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  Traverse Backward
                </button>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => resetPlayback()}
                  title="Reset playback to start"
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setExecCount((c) => c + 1)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Re-Execute</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                Operation:
                <select
                  value={operation}
                  onChange={(event) => {
                    playback.reset();
                    setOperation(event.target.value);
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:border-violet-400 focus:outline-none"
                >
                  {operations.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => resetPlayback()}
                  className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setExecCount((c) => c + 1)}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute</span>
                </button>
              </div>
            </div>
          )}

          {inputError && (
            <p className="text-xs text-rose-600 font-medium">{inputError}</p>
          )}
        </div>

        {/* HERO SECTION: Live Pointer Topology Canvas (Spacious, Large Container) */}
        <section className="w-full">
          {linkedList ? (
            <LinkedListCanvas mode={mode} step={currentStep} />
          ) : (
            <BufferCanvas mode={mode} step={currentStep} />
          )}
        </section>

        {/* Playback Controls Strip */}
        {!inputError && !loading && steps.length > 0 && (
          <PlaybackControls
            currentStepIndex={playback.currentStepIndex}
            totalSteps={playback.totalSteps}
            isPlaying={playback.isPlaying}
            speed={playback.speed}
            isAtStart={playback.isAtStart}
            isAtEnd={playback.isAtEnd}
            onPlay={playback.play}
            onPause={playback.pause}
            onTogglePlay={playback.togglePlay}
            onNext={playback.nextStep}
            onPrev={playback.prevStep}
            onReset={playback.reset}
            onGoToStep={playback.goToStep}
            onSpeedChange={playback.setSpeed}
          />
        )}

        {/* Bottom Details Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StepExplanation currentStep={currentStep} totalSteps={playback.totalSteps} />
          <PseudocodePanel
            lines={sourceLines}
            activeLine={currentStep?.sourceLine ?? currentStep?.activeLine}
            title={`${operationInfo.title} (C++ Source)`}
            language="C++17"
          />
          <ComplexityPanel complexity={complexityFor(mode, operation)} />
        </div>
      </div>
    </VisualizerLayout>
  );
};

const BufferCanvas: React.FC<{ mode: LinearStructureMode; step?: TraceStep }> = ({ mode, step }) => {
  const isDeque = mode === 'deque';
  const slots = step?.structureStorage ?? [];
  const occupied = step?.occupiedSlots ?? [];
  const logical = step?.logicalOrder ?? [];
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Physical Buffer Storage</h2>
          <p className="text-xs text-slate-500">Circular-buffer array mapping and logical front-to-back sequence.</p>
        </div>
        {step?.title && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
            {step.title}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 py-4">
        {slots.map((value, index) => {
          const filled = occupied[index] === true;
          const front = index === (isDeque ? step?.dequeFrontIndex : step?.frontIndex) && filled;
          const back = index === (isDeque ? step?.dequeBackIndex : step?.rearIndex) && filled;
          const nextInsert = !isDeque && index === Number(step?.variables?.nextInsertionIndex) && !filled;
          const active = step?.activeIndices?.includes(index) ?? false;
          return (
            <div
              key={index}
              className={`relative min-h-28 rounded-xl border-2 p-3 text-center transition-all ${
                active ? 'ring-4 ring-violet-500/20 border-violet-500 bg-violet-50' : ''
              } ${filled ? 'border-indigo-300 bg-indigo-50/60 shadow-sm' : 'border-dashed border-slate-300 bg-slate-50/80'}`}
            >
              <span className="absolute left-2.5 top-1.5 text-[10px] font-mono font-bold text-slate-400">slot [{index}]</span>
              <strong className={`mt-5 block text-2xl font-mono font-extrabold ${filled ? 'text-slate-900' : 'text-slate-300'}`}>
                {filled ? value : '—'}
              </strong>
              <div className="mt-2 flex justify-center gap-1 text-[10px] font-bold uppercase">
                {front && <span className="bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded">Front</span>}
                {back && <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{isDeque ? 'Back' : 'Rear'}</span>}
                {nextInsert && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Next rear</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-slate-100">
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono">Front: <strong>{step?.frontIndex ?? '—'}</strong></span>
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono">{isDeque ? 'Back' : 'Rear'}: <strong>{step?.rearIndex ?? '—'}</strong></span>
        {!isDeque && <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono">Next: <strong>{step?.variables?.nextInsertionIndex ?? '—'}</strong></span>}
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono">Size: <strong>{step?.elementCount ?? 0} / {step?.capacity ?? 0}</strong></span>
        {step?.variables?.result !== undefined && (
          <span className="rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 font-mono font-bold">
            Result: {step.variables.result}
          </span>
        )}
      </div>
      <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-violet-700">Logical FIFO Order · Front → Back</span>
        <div className="mt-2 flex min-h-10 flex-wrap items-center gap-2">
          {logical.length ? (
            logical.map((value, index) => (
              <React.Fragment key={`${index}-${value}`}>
                <span className="rounded-lg bg-white px-3.5 py-2 font-mono text-base font-extrabold text-slate-900 shadow-sm border border-slate-200">
                  {value}
                </span>
                {index < logical.length - 1 && <span className="text-violet-500 font-bold text-lg">→</span>}
              </React.Fragment>
            ))
          ) : (
            <span className="text-xs italic text-slate-400">Empty buffer</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LINKED LIST CANVAS (LARGE, SPACIOUS HERO CONTAINER)
// ============================================================================

const LinkedListCanvas: React.FC<{ mode: LinearStructureMode; step?: TraceStep }> = ({ mode, step }) => {
  const nodes = step?.linkedNodes ?? [];
  const doubly = mode === 'doubly';
  const circular = mode === 'circular';
  const pointers = step?.pointers ?? [];

  // Map pointer names to referenced node ID
  const pointersByNodeId: Record<number, Array<{ name: string; color?: string }>> = {};
  for (const p of pointers) {
    if (!pointersByNodeId[p.index]) {
      pointersByNodeId[p.index] = [];
    }
    pointersByNodeId[p.index].push(p);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">Live Pointer Topology</h2>
          <p className="text-xs text-slate-500">
            Dynamically allocated nodes in memory. Arrows depict physical C++ pointer references (next / prev).
          </p>
        </div>
        {step?.title && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
              step.statusType === 'success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : step.statusType === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-violet-50 text-violet-700 border-violet-200'
            }`}
          >
            {step.title}
          </span>
        )}
      </div>

      {/* Main Node Diagram Area - Grand, Spacious Box */}
      <div className="overflow-x-auto rounded-2xl bg-gradient-to-b from-slate-50/80 to-slate-100/40 p-8 border border-slate-200/80 min-h-[300px] flex items-center justify-center sm:justify-start">
        <div className="flex min-w-max items-center gap-3 pt-12 pb-6 px-4">
          {/* Head Indicator */}
          {!circular && (
            <div className="flex flex-col items-center mr-2">
              <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200 shadow-xs">
                HEAD
              </span>
              <span className="text-cyan-500 text-xl font-bold">→</span>
            </div>
          )}

          {nodes.map((node, index) => {
            const isActive = node.id === step?.activeNodeId;
            const nodePointers = pointersByNodeId[node.id] || [];

            return (
              <React.Fragment key={node.id}>
                <div className="relative flex flex-col items-center">
                  {/* Floating Pointer Badges above node */}
                  <div className="absolute -top-9 flex items-center gap-1.5 z-20 transition-all duration-300">
                    {nodePointers.map((p) => {
                      const colorClass =
                        p.name === 'head'
                          ? 'bg-cyan-600 text-white shadow-cyan-300 ring-2 ring-cyan-200'
                          : p.name === 'tail'
                          ? 'bg-amber-500 text-white shadow-amber-300 ring-2 ring-amber-200'
                          : p.name === 'current'
                          ? 'bg-violet-600 text-white shadow-violet-300 ring-2 ring-violet-300 scale-105'
                          : p.name === 'prev'
                          ? 'bg-blue-600 text-white shadow-blue-300 ring-2 ring-blue-200'
                          : 'bg-indigo-600 text-white shadow-indigo-300';

                      return (
                        <span
                          key={p.name}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-black uppercase rounded-lg shadow-sm transition-transform duration-200 animate-bounce ${colorClass}`}
                        >
                          <span>{p.name}</span>
                          <span className="text-[10px]">↓</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Large Node Box */}
                  <div
                    className={`w-36 sm:w-40 rounded-2xl border-2 transition-all duration-300 transform select-none ${
                      isActive
                        ? 'border-violet-600 bg-violet-50/90 shadow-xl shadow-violet-500/20 ring-4 ring-violet-500/20 scale-105'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-md'
                    }`}
                  >
                    {/* Node Header: Visual Index & Memory Address ID */}
                    <div
                      className={`px-3 py-1.5 text-xs font-mono border-b flex items-center justify-between rounded-t-xl transition-colors ${
                        isActive ? 'bg-violet-100/90 border-violet-200 text-violet-800' : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="font-semibold">idx [{index}]</span>
                      <span className="font-bold bg-white/80 px-1.5 py-0.5 rounded border border-slate-200/60">N{node.id}</span>
                    </div>

                    {/* Node Body with Compartments */}
                    <div className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {doubly && (
                          <div className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200">
                            P: {node.prevId < 0 ? '∅' : `N${node.prevId}`}
                          </div>
                        )}
                        <strong
                          className={`block text-2xl font-mono font-black px-3 py-1 rounded-xl transition-colors ${
                            isActive ? 'text-violet-700 bg-white shadow-sm' : 'text-slate-900'
                          }`}
                        >
                          {node.value}
                        </strong>
                        <div className="px-2 py-1 rounded-md bg-slate-100 text-[10px] font-mono text-slate-600 border border-slate-200">
                          N: {node.nextId < 0 ? '∅' : `N${node.nextId}`}
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-2 flex items-center justify-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-violet-600 animate-ping" />
                          <span className="text-[11px] font-black text-violet-700 tracking-wider">
                            ACTIVE NODE
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Animated Arrow Connector */}
                {index < nodes.length - 1 && (
                  <div className="flex items-center px-1.5 transition-all duration-300">
                    <span
                      className={`text-2xl font-black transition-all duration-300 ${
                        isActive ? 'text-violet-600 scale-125' : 'text-indigo-400'
                      }`}
                    >
                      {doubly ? '⇄' : '→'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {nodes.length === 0 && (
            <div className="py-12 px-10 rounded-2xl border-2 border-dashed border-slate-300 bg-white text-slate-400 text-sm font-mono flex items-center gap-2">
              <span>⏚ nullptr (Empty Linked List)</span>
            </div>
          )}

          {/* List Terminators */}
          {circular && nodes.length > 0 && (
            <div className="ml-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-fuchsia-200 bg-fuchsia-50 text-xs font-bold text-fuchsia-700 font-mono shadow-sm animate-pulse">
              <span>tail N{nodes[nodes.length - 1].id}</span>
              <span className="text-base font-extrabold">↷</span>
              <span>head N{nodes[0].id}</span>
            </div>
          )}

          {!circular && nodes.length > 0 && (
            <div className="flex items-center gap-2 pl-2">
              <span className="text-slate-400 text-2xl font-bold">→</span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600 font-black">
                NULL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Variables & State Footer */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs pt-1">
        <span className="rounded-xl bg-cyan-50 border border-cyan-200 px-3 py-1.5 text-cyan-900 font-mono">
          Head Pointer: <strong>{step?.variables?.head ?? (nodes.length ? `N${nodes[0].id}` : 'nullptr')}</strong>
        </span>
        <span className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-amber-900 font-mono">
          Tail Pointer: <strong>{step?.variables?.tail ?? (nodes.length ? `N${nodes[nodes.length - 1].id}` : 'nullptr')}</strong>
        </span>
        {circular && (
          <span className="rounded-xl bg-fuchsia-50 border border-fuchsia-200 px-3 py-1.5 text-fuchsia-900 font-mono">
            tail→next: <strong>{nodes.length ? `N${nodes[0].id}` : 'nullptr'}</strong>
          </span>
        )}
        <span className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-slate-800 font-mono">
          Node Count: <strong>{step?.elementCount ?? nodes.length}</strong>
        </span>
        {step?.variables?.result !== undefined && (
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-emerald-800 font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Result: {step.variables.result}</span>
          </span>
        )}
      </div>
    </div>
  );
};
