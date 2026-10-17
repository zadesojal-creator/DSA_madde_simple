import React, { useState, useMemo } from 'react';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { VisualizationCanvas } from '../components/workspace/VisualizationCanvas';
import { InputControls } from '../components/workspace/InputControls';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { usePlayback } from '../hooks/usePlayback';
import type { TraceStep, ItemHighlightType, ComplexityInfo } from '../types/trace';
import { Play, RotateCcw } from 'lucide-react';

function generateArrayTraversalTrace(array: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;

  // Step 0: Initialization
  steps.push({
    id: stepId++,
    stepIndex: 0,
    title: 'Initialize Array Traversal',
    description: `Array initialized with ${array.length} elements. Setting loop index pointer i = 0.`,
    activeLine: 2,
    activeIndices: [0],
    arrayState: [...array],
    highlightedItems: { 0: 'active' },
    pointers: [{ name: 'i', index: 0 }],
    variables: { i: 0, arrayLength: array.length, currentVal: array[0] }
  });

  const visitedMap: Record<number, ItemHighlightType> = {};

  for (let i = 0; i < array.length; i++) {
    const currentVal = array[i];

    // Step A: Inspect Element at index i
    visitedMap[i] = 'active';
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Access Element at Index ${i}`,
      description: `Reading array[${i}]. Direct memory offset lookup retrieves value ${currentVal}.`,
      activeLine: 3,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [{ name: 'i', index: i }],
      variables: { i, currentVal, status: 'Accessing' }
    });

    // Step B: Process Element at index i
    visitedMap[i] = 'visited';
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Process Index ${i} (Value: ${currentVal})`,
      description: `Successfully processed element ${currentVal} at index ${i}. Incrementing index pointer i -> ${i + 1}.`,
      activeLine: 4,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [{ name: 'i', index: i }],
      variables: { i, currentVal, status: 'Processed' }
    });
  }

  // Final Step: Completion
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'Traversal Complete',
    description: `Visited all ${array.length} elements sequentially. Traversal loop terminated naturally.`,
    activeLine: 6,
    activeIndices: [],
    arrayState: [...array],
    highlightedItems: { ...visitedMap },
    pointers: [],
    variables: { i: array.length, status: 'Terminated', totalVisited: array.length },
    isCompleted: true
  });

  return steps;
}

const PSEUDOCODE_LINES = [
  'const array = [10, 20, 30, 40, 50];',
  'for (let i = 0; i < array.length; i++) {',
  '  const currentVal = array[i]; // Access element',
  '  console.log(`Visited index ${i}: ${currentVal}`);',
  '}',
  '// Traversal Complete!'
];

const ARRAY_TRAVERSAL_COMPLEXITY: ComplexityInfo = {
  timeComplexity: {
    best: 'O(N)',
    average: 'O(N)',
    worst: 'N',
    description: 'Every element in the array must be inspected exactly once in sequential order.'
  },
  spaceComplexity: {
    worst: '1',
    description: 'Auxiliary memory is O(1) constant because only a single loop index pointer is allocated.'
  }
};

export const ArrayTraversalDemo: React.FC = () => {
  const [array, setArray] = useState<number[]>([10, 20, 30, 40, 50]);

  const traceSteps = useMemo(() => generateArrayTraversalTrace(array), [array]);

  const playback = usePlayback({
    steps: traceSteps,
    initialSpeed: 1
  });

  const handleApplyArray = (newArr: number[]) => {
    setArray(newArr);
    playback.reset();
  };

  return (
    <VisualizerLayout activeTitle="Array Traversal">
      <div className="space-y-6">
        
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <TopicBreadcrumbs
              categoryName="Fundamentals & Arrays"
              categoryRoute="/visualizer/arrays"
              subtopicName="Array Traversal"
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              Array Traversal
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                Interactive Execution Demo
              </span>
            </h1>
            <p className="text-sm text-slate-600">
              Iterate sequentially through array indices from index 0 to N-1, inspecting values frame by frame.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => playback.togglePlay()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{playback.isPlaying ? 'Pause' : 'Start Demo'}</span>
            </button>
            <button
              onClick={() => playback.reset()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs transition-colors"
              title="Reset Trace"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Canvas & Configuration Input */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Canvas View */}
          <VisualizationCanvas
            currentStep={playback.currentStep}
            array={array}
            title="Array Memory Grid"
          />

          {/* Playback Controls Bar */}
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

        </div>

        {/* Input Controls & Step Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input Config & Explanation */}
          <div className="lg:col-span-7 space-y-6">
            <InputControls
              initialArray={array}
              onApplyArray={handleApplyArray}
              disabled={playback.isPlaying}
            />

            <StepExplanation
              currentStep={playback.currentStep}
              totalSteps={playback.totalSteps}
            />
          </div>

          {/* Right Column: Pseudocode & Complexity */}
          <div className="lg:col-span-5 space-y-6">
            <PseudocodePanel
              lines={PSEUDOCODE_LINES}
              activeLine={playback.currentStep?.activeLine}
            />

            <ComplexityPanel
              complexity={ARRAY_TRAVERSAL_COMPLEXITY}
            />
          </div>

        </div>

      </div>
    </VisualizerLayout>
  );
};
