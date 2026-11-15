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
import { Play, RotateCcw } from 'lucide-react';

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
  { id: 'list-create', title: 'Create List', description: 'Allocate each node and link it into an initially empty list.' },
  { id: 'list-traverse', title: 'Traverse Forward', description: 'Visit nodes once in head-to-tail order.' },
  { id: 'list-traverse-backward', title: 'Traverse Backward', description: 'Visit nodes tail-to-head (doubly linked list only).' },
  { id: 'list-insert-head', title: 'Insert at Head', description: 'Allocate a node and update the head link.' },
  { id: 'list-insert-tail', title: 'Insert at Tail', description: 'Allocate a node and link it after the tail.' },
  { id: 'list-insert-index', title: 'Insert at Index', description: 'Traverse to the predecessor; valid insertion indices are 0 through size.' },
  { id: 'list-delete-head', title: 'Delete at Head', description: 'Detach and deallocate the first node.' },
  { id: 'list-delete-tail', title: 'Delete at Tail', description: 'Find and remove the final node.' },
  { id: 'list-delete-index', title: 'Delete at Index', description: 'Traverse to the selected node, detach it, and deallocate it.' },
  { id: 'list-search', title: 'Search', description: 'Compare values in traversal order.' },
  { id: 'list-update', title: 'Update Node', description: 'Traverse to an index, then replace its value.' },
  { id: 'list-reverse', title: 'Reverse List', description: 'Reverse links while preserving the selected list topology.' },
  { id: 'list-length', title: 'Get Length', description: 'Return the maintained number of nodes.' }
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
  let description = 'The circular-buffer operation updates a fixed number of indices and slots.';
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
  if (tokens.length > 30) return { values: [], error: 'Use at most 30 integer values.' };
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

  const sourceLines = useMemo(() => (inputError ? '// Correct the input to load the matching C++ trace.' : sourceCode).split(/\r?\n/), [inputError, sourceCode]);
  const currentStep = inputError ? failureStep(inputError) : loading ? undefined : playback.currentStep;

  return (
    <VisualizerLayout activeTitle={`${title} Visualizer`}>
      <div className="space-y-6">
        <div className="space-y-1 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName={linkedList ? 'Linked Lists' : 'Stacks & Queues'}
            categoryRoute={linkedList ? '/visualizer/linked-lists/singly' : '/visualizer/stacks-queues/queue'}
            subtopicName={title}
          />
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-violet-700">Native C++ trace</span>
          </div>
          <p className="text-sm text-slate-600">{operationInfo.description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="space-y-5 xl:col-span-7">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <label className="block text-xs font-medium text-slate-600">
                Operation
                <select value={operation} onChange={(event) => { playback.reset(); setLoading(true); setOperation(event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none">
                  {operations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
              <label className="block text-xs font-medium text-slate-600">
                Initial values (comma or space separated)
                <input value={valuesInput} onChange={(event) => { playback.reset(); setLoading(true); setValuesInput(event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none" />
              </label>
              {!linkedList && (
                <label className="block text-xs font-medium text-slate-600">
                  Capacity
                  <input type="number" min={1} max={30} value={capacityInput} onChange={(event) => { playback.reset(); setLoading(true); setCapacityInput(event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none" />
                </label>
              )}
              {['queue-enqueue', 'deque-push-front', 'deque-push-back', 'list-insert-head', 'list-insert-tail', 'list-insert-index', 'list-update'].includes(operation) && (
                <label className="block text-xs font-medium text-slate-600">
                  Value
                  <input type="number" value={valueInput} onChange={(event) => { playback.reset(); setLoading(true); setValueInput(event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none" />
                </label>
              )}
              {['list-insert-index', 'list-delete-index', 'list-update'].includes(operation) && (
                <label className="block text-xs font-medium text-slate-600">
                  Node index (zero based)
                  <input type="number" value={indexInput} onChange={(event) => { playback.reset(); setLoading(true); setIndexInput(event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none" />
                </label>
              )}
              {operation === 'list-search' && (
                <label className="block text-xs font-medium text-slate-600">
                  Search target
                  <input type="number" value={targetInput} onChange={(event) => { playback.reset(); setLoading(true); setTargetInput(event.target.value); }} className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-violet-400 focus:outline-none" />
                </label>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <p role="status" className={`text-xs ${inputError ? 'text-rose-600' : 'text-slate-500'}`}>{inputError ?? (loading ? 'Executing C++ trace…' : engineMessage)}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetPlayback();
                    }}
                    title="Reset to beginning"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExecCount((c) => c + 1);
                    }}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Execute Operation</span>
                  </button>
                </div>
              </div>
            </div>

            <StepExplanation currentStep={currentStep} totalSteps={playback.totalSteps} />
          </section>

          <section className="space-y-5 xl:col-span-5">
            {linkedList ? (
              <LinkedListCanvas mode={mode} step={currentStep} />
            ) : (
              <BufferCanvas mode={mode} step={currentStep} />
            )}
            <PseudocodePanel lines={sourceLines} activeLine={currentStep?.sourceLine ?? currentStep?.activeLine} title={`${operationInfo.title} (C++ Source)`} language="C++17" />
            <ComplexityPanel complexity={complexityFor(mode, operation)} />
          </section>
        </div>

        {!inputError && !loading && steps.length > 0 && <PlaybackControls
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
        />}
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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Physical storage</h2>
        <p className="text-xs text-slate-500">The storage slots are physical array order; the sequence below is logical front-to-back order.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((value, index) => {
          const filled = occupied[index] === true;
          const front = index === (isDeque ? step?.dequeFrontIndex : step?.frontIndex) && filled;
          const back = index === (isDeque ? step?.dequeBackIndex : step?.rearIndex) && filled;
          const nextInsert = !isDeque && index === Number(step?.variables?.nextInsertionIndex) && !filled;
          const active = step?.activeIndices?.includes(index) ?? false;
          return (
            <div key={index} className={`relative min-h-24 rounded-xl border p-3 text-center ${active ? 'ring-2 ring-violet-500' : ''} ${filled ? 'border-indigo-300 bg-indigo-50' : 'border-dashed border-slate-300 bg-slate-50'}`}>
              <span className="absolute left-2 top-1 text-[10px] font-mono text-slate-400">slot {index}</span>
              <strong className={`mt-4 block text-lg font-mono ${filled ? 'text-slate-900' : 'text-slate-300'}`}>{filled ? value : 'empty'}</strong>
              <div className="mt-1 flex justify-center gap-2 text-[10px] font-bold uppercase">
                {front && <span className="text-cyan-700">Front</span>}
                {back && <span className="text-amber-700">{isDeque ? 'Back' : 'Rear'}</span>}
                {nextInsert && <span className="text-amber-700">Next rear</span>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg bg-slate-100 px-2 py-1">Front: {step?.frontIndex ?? '—'}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">{isDeque ? 'Back' : 'Rear'}: {step?.rearIndex ?? '—'}</span>
        {!isDeque && <span className="rounded-lg bg-slate-100 px-2 py-1">Next insertion: {step?.variables?.nextInsertionIndex ?? '—'}</span>}
        <span className="rounded-lg bg-slate-100 px-2 py-1">Size: {step?.elementCount ?? 0} / {step?.capacity ?? 0}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">Result: {step?.variables?.result ?? '—'}</span>
      </div>
      <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
        <span className="text-[10px] font-bold uppercase tracking-wide text-violet-700">Logical order · front → back</span>
        <div className="mt-2 flex min-h-8 flex-wrap items-center gap-2">
          {logical.length ? logical.map((value, index) => <React.Fragment key={`${index}-${value}`}><span className="rounded-lg bg-white px-3 py-1.5 font-mono text-sm text-slate-900 shadow-sm">{value}</span>{index < logical.length - 1 && <span className="text-violet-500">→</span>}</React.Fragment>) : <span className="text-xs italic text-slate-400">Empty</span>}
        </div>
      </div>
    </div>
  );
};

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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Live Pointer Topology</h2>
          <p className="text-xs text-slate-500">Arrows represent actual C++ pointer linkages (next/prev).</p>
        </div>
        {step?.title && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-300 ${
            step.statusType === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : step.statusType === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {step.title}
          </span>
        )}
      </div>

      {/* Main Node Diagram Area */}
      <div className="overflow-x-auto rounded-xl bg-slate-50/80 p-5 border border-slate-100 min-h-[170px] flex items-center">
        <div className="flex min-w-max items-center gap-2 pt-8 pb-3">
          {!circular && (
            <div className="flex flex-col items-center mr-1">
              <span className="text-[11px] font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 shadow-xs">
                HEAD
              </span>
              <span className="text-cyan-500 text-lg font-bold">→</span>
            </div>
          )}

          {nodes.map((node, index) => {
            const isActive = node.id === step?.activeNodeId;
            const nodePointers = pointersByNodeId[node.id] || [];

            return (
              <React.Fragment key={node.id}>
                <div className="relative flex flex-col items-center">
                  {/* Floating Pointer Badges above node */}
                  <div className="absolute -top-7 flex items-center gap-1 z-10 transition-all duration-300">
                    {nodePointers.map((p) => {
                      const colorClass =
                        p.name === 'head'
                          ? 'bg-cyan-500 text-white shadow-cyan-200'
                          : p.name === 'tail'
                          ? 'bg-amber-500 text-white shadow-amber-200'
                          : p.name === 'current'
                          ? 'bg-violet-600 text-white shadow-violet-200 ring-2 ring-violet-300'
                          : p.name === 'prev'
                          ? 'bg-blue-500 text-white shadow-blue-200'
                          : 'bg-indigo-600 text-white shadow-indigo-200';

                      return (
                        <span
                          key={p.name}
                          className={`flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md shadow-sm transition-transform duration-200 animate-bounce ${colorClass}`}
                        >
                          <span>{p.name}</span>
                          <span className="text-[9px]">↓</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Node Box */}
                  <div
                    className={`min-w-28 rounded-xl border-2 transition-all duration-300 transform select-none ${
                      isActive
                        ? 'border-violet-600 bg-violet-50/90 shadow-lg shadow-violet-500/20 ring-4 ring-violet-500/20 scale-105'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Node Header: Visual Index & Memory ID */}
                    <div className={`px-2.5 py-1 text-[10px] font-mono border-b flex items-center justify-between rounded-t-lg transition-colors ${
                      isActive ? 'bg-violet-100/80 border-violet-200 text-violet-800' : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <span>idx [{index}]</span>
                      <span className="font-bold">N{node.id}</span>
                    </div>

                    {/* Node Body with Compartments */}
                    <div className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {doubly && (
                          <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-500 border border-slate-200">
                            P: {node.prevId < 0 ? '∅' : `N${node.prevId}`}
                          </div>
                        )}
                        <strong className={`block text-xl font-mono font-extrabold px-3 py-1 rounded-lg transition-colors ${
                          isActive ? 'text-violet-700 bg-white shadow-inner' : 'text-slate-800'
                        }`}>
                          {node.value}
                        </strong>
                        <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-500 border border-slate-200">
                          N: {node.nextId < 0 ? '∅' : `N${node.nextId}`}
                        </div>
                      </div>

                      {isActive && (
                        <div className="mt-1.5 flex items-center justify-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 animate-ping" />
                          <span className="text-[10px] font-bold text-violet-700 tracking-wide">
                            VISITING
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Animated Arrow Connector */}
                {index < nodes.length - 1 && (
                  <div className="flex items-center px-1 transition-all duration-300">
                    <span className={`text-xl font-bold transition-all duration-300 ${
                      isActive ? 'text-violet-600 scale-125' : 'text-indigo-400'
                    }`}>
                      {doubly ? '⇄' : '→'}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {nodes.length === 0 && (
            <div className="py-6 px-8 rounded-xl border border-dashed border-slate-300 bg-white text-slate-400 text-xs font-mono flex items-center gap-2">
              <span>⏚ nullptr (Empty List)</span>
            </div>
          )}

          {/* List Terminators */}
          {circular && nodes.length > 0 && (
            <div className="ml-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-fuchsia-200 bg-fuchsia-50 text-xs font-bold text-fuchsia-700 font-mono shadow-xs animate-pulse">
              <span>tail N{nodes[nodes.length - 1].id}</span>
              <span>↷</span>
              <span>head N{nodes[0].id}</span>
            </div>
          )}

          {!circular && nodes.length > 0 && (
            <div className="flex items-center gap-1 pl-1">
              <span className="text-slate-400 text-lg font-bold">→</span>
              <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-slate-500 font-bold">
                NULL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Variables & State Footer */}
      <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
        <span className="rounded-lg bg-cyan-50 border border-cyan-100 px-2.5 py-1 text-cyan-800 font-mono">
          head: <strong>{step?.variables?.head ?? (nodes.length ? `N${nodes[0].id}` : 'nullptr')}</strong>
        </span>
        <span className="rounded-lg bg-amber-50 border border-amber-100 px-2.5 py-1 text-amber-800 font-mono">
          tail: <strong>{step?.variables?.tail ?? (nodes.length ? `N${nodes[nodes.length - 1].id}` : 'nullptr')}</strong>
        </span>
        {circular && (
          <span className="rounded-lg bg-fuchsia-50 border border-fuchsia-100 px-2.5 py-1 text-fuchsia-800 font-mono">
            tail→next: <strong>{nodes.length ? `N${nodes[0].id}` : 'nullptr'}</strong>
          </span>
        )}
        <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-slate-700 font-mono">
          size: <strong>{step?.elementCount ?? nodes.length}</strong>
        </span>
        {step?.variables?.result !== undefined && (
          <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-800 font-mono font-bold">
            result: {step.variables.result}
          </span>
        )}
      </div>
    </div>
  );
};
