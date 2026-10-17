import React, { useEffect, useMemo, useState } from 'react';
import { usePlayback } from '../hooks/usePlayback';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { executeCppLinearStructure } from '../services/cppExecutionAdapter';
import type { ComplexityInfo, TraceStep } from '../types/trace';

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
  const resetPlayback = playback.reset;

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
      resetPlayback();
      setSteps(result.steps);
      setSourceCode(result.sourceCode);
      setEngineMessage(result.engineMessage);
    }).catch((error: unknown) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : String(error);
      resetPlayback();
      setSteps([failureStep(`Native C++ trace request failed: ${message}`)]);
      setEngineMessage('Native C++ trace request failed.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [operation, valuesInput, capacityInput, valueInput, indexInput, targetInput, mode, linkedList, inputError, resetPlayback]);

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
              <p role="status" className={`text-xs ${inputError ? 'text-rose-600' : 'text-slate-500'}`}>{inputError ?? (loading ? 'Executing C++ trace…' : engineMessage)}</p>
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
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Live pointer topology</h2>
        <p className="text-xs text-slate-500">Indices are visual labels only. C++ traverses links to reach a node.</p>
      </div>
      <div className="overflow-x-auto rounded-xl bg-slate-50 p-4">
        <div className="flex min-w-max items-center gap-2">
          {!circular && <span className="text-xs font-bold text-cyan-700">head →</span>}
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div className={`min-w-24 rounded-xl border-2 p-3 text-center ${node.id === step?.activeNodeId ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-slate-200 bg-white'}`}>
                <span className="block text-[10px] font-mono text-slate-400">index {index} · N{node.id}</span>
                <strong className="my-1 block text-lg font-mono text-slate-900">{node.value}</strong>
                <span className="block text-[10px] text-slate-500">{doubly ? `prev: ${node.prevId < 0 ? 'null' : `N${node.prevId}`}` : `next: ${node.nextId < 0 ? 'null' : `N${node.nextId}`}`}</span>
                {doubly && <span className="block text-[10px] text-slate-500">next: {node.nextId < 0 ? 'null' : `N${node.nextId}`}</span>}
                {node.id === step?.activeNodeId && <span className="mt-1 block text-[10px] font-bold text-violet-700">current</span>}
              </div>
              {index < nodes.length - 1 && <span className="px-1 text-lg font-bold text-indigo-500">{doubly ? '↔' : '→'}</span>}
            </React.Fragment>
          ))}
          {nodes.length === 0 && <span className="text-xs italic text-slate-400">nullptr · empty list</span>}
          {circular && nodes.length > 0 && <span className="ml-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50 px-2 py-1 text-xs font-bold text-fuchsia-700">tail N{nodes[nodes.length - 1].id} → head N{nodes[0].id}</span>}
          {!circular && nodes.length > 0 && <span className="text-xs font-bold text-slate-400">→ nullptr</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-lg bg-cyan-50 px-2 py-1 text-cyan-800">head: {step?.variables?.head ?? 'nullptr'}</span>
        <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-800">tail: {step?.variables?.tail ?? 'nullptr'}</span>
        {circular && <span className="rounded-lg bg-fuchsia-50 px-2 py-1 text-fuchsia-800">tail-&gt;next: {nodes.length ? `N${nodes[0].id}` : 'nullptr'}</span>}
        <span className="rounded-lg bg-slate-100 px-2 py-1">size: {step?.elementCount ?? 0}</span>
        <span className="rounded-lg bg-slate-100 px-2 py-1">result: {step?.variables?.result ?? '—'}</span>
      </div>
    </div>
  );
};
