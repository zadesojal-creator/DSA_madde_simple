import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { VisualizationCanvas } from '../components/workspace/VisualizationCanvas';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { ArrayOperationControls } from '../components/arrays/ArrayOperationControls';
import { usePlayback } from '../hooks/usePlayback';
import type { ArrayOperationType } from '../algorithms/arrays/operationConfig';
import { ARRAY_OPERATIONS } from '../algorithms/arrays/operationConfig';
import {
  generateArrayBasicsTrace,
  generateArrayTraversalTrace,
  generateAccessTrace,
  generateUpdateTrace,
  generateInsertTrace,
  generateDeleteTrace,
  generateLinearSearchTrace,
  generateBinarySearchTrace
} from '../algorithms/arrays/arrayTraces';
import type { TraceStep } from '../types/trace';
import { Play, RotateCcw } from 'lucide-react';

interface OperationParams {
  array: number[];
  index?: number;
  value?: number;
  target?: number;
}

export const ArraysVisualizerPage: React.FC = () => {
  const { subtopicId } = useParams<{ categoryId?: string; subtopicId?: string }>();
  const navigate = useNavigate();

  // Normalize subtopicId to supported operation
  const activeOperation: ArrayOperationType = useMemo(() => {
    if (!subtopicId) return 'array-basics';
    if (subtopicId in ARRAY_OPERATIONS) {
      return subtopicId as ArrayOperationType;
    }
    // Handle aliases
    if (subtopicId === 'linear-search-sort') return 'linear-search';
    if (subtopicId === 'binary-search-sort') return 'binary-search';
    return 'array-basics';
  }, [subtopicId]);

  // Inputs state keyed by operation type
  const [paramsByOperation, setParamsByOperation] = useState<Record<ArrayOperationType, OperationParams>>(() => {
    const initial: Record<string, OperationParams> = {};
    for (const [key, op] of Object.entries(ARRAY_OPERATIONS)) {
      initial[key] = {
        array: [...op.defaultArray],
        index: op.defaultParams?.index ?? 0,
        value: op.defaultParams?.value ?? 99,
        target: op.defaultParams?.target ?? op.defaultArray[0] ?? 42
      };
    }
    return initial as Record<ArrayOperationType, OperationParams>;
  });

  const params = paramsByOperation[activeOperation];
  const currentMeta = ARRAY_OPERATIONS[activeOperation];

  // Pure trace generation based on active operation and current parameters
  const traceSteps: TraceStep[] = useMemo(() => {
    const arr = params.array;
    switch (activeOperation) {
      case 'array-basics':
        return generateArrayBasicsTrace(arr);
      case 'traversal':
        return generateArrayTraversalTrace(arr);
      case 'access':
        return generateAccessTrace(arr, params.index ?? 0);
      case 'update':
        return generateUpdateTrace(arr, params.index ?? 0, params.value ?? 99);
      case 'insert':
        return generateInsertTrace(arr, params.index ?? 0, params.value ?? 99);
      case 'delete':
        return generateDeleteTrace(arr, params.index ?? 0);
      case 'linear-search':
        return generateLinearSearchTrace(arr, params.target ?? 42);
      case 'binary-search':
        return generateBinarySearchTrace(arr, params.target ?? 42);
      default:
        return generateArrayBasicsTrace(arr);
    }
  }, [activeOperation, params]);

  // Shared playback controller
  const playback = usePlayback({
    steps: traceSteps,
    initialSpeed: 1
  });

  // Whenever operation or parameters change, reset playback to step 0
  const handleApplyChanges = useCallback((newParams: OperationParams) => {
    setParamsByOperation((prev) => ({
      ...prev,
      [activeOperation]: newParams
    }));
    playback.reset();
  }, [activeOperation, playback]);

  const handleSelectOperation = useCallback((op: ArrayOperationType) => {
    navigate(`/visualizer/arrays/${op}`);
    playback.reset();
  }, [navigate, playback]);

  return (
    <VisualizerLayout activeTitle={`Arrays: ${currentMeta.title}`}>
      <div className="space-y-6">
        
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <TopicBreadcrumbs
              categoryName="Fundamentals & Arrays"
              categoryRoute="/visualizer/arrays"
              subtopicName={currentMeta.shortTitle}
            />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentMeta.title}</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                Interactive Visualizer
              </span>
            </h1>
            <p className="text-sm text-slate-600">
              {currentMeta.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => playback.togglePlay()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
              aria-label={playback.isPlaying ? 'Pause trace' : 'Start trace'}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{playback.isPlaying ? 'Pause' : 'Play Trace'}</span>
            </button>
            <button
              onClick={() => playback.reset()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs transition-colors"
              title="Reset Trace (Shortcut: R)"
              aria-label="Reset execution"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualization Canvas & Playback Bar */}
        <div className="grid grid-cols-1 gap-6">
          
          <VisualizationCanvas
            currentStep={playback.currentStep}
            array={params.array}
            title={currentMeta.title}
            subtitle={playback.currentStep?.title}
          />

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

        {/* Controls, Step Explanation, Pseudocode & Complexity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Operation Inputs & Step Explanation */}
          <div className="lg:col-span-7 space-y-6">
            <ArrayOperationControls
              key={activeOperation}
              currentOperation={activeOperation}
              onSelectOperation={handleSelectOperation}
              array={params.array}
              initialIndex={params.index}
              initialValue={params.value}
              initialTarget={params.target}
              onApplyChanges={handleApplyChanges}
              disabled={playback.isPlaying}
            />

            <StepExplanation
              currentStep={playback.currentStep}
              totalSteps={playback.totalSteps}
            />
          </div>

          {/* Right Column: Highlighted Pseudocode & Complexity */}
          <div className="lg:col-span-5 space-y-6">
            <PseudocodePanel
              lines={currentMeta.cppCode}
              activeLine={playback.currentStep?.activeLine}
              title={`${currentMeta.shortTitle} (C++ Source)`}
              language="C++ (std::vector)"
            />

            <ComplexityPanel
              complexity={currentMeta.complexity}
            />
          </div>

        </div>

      </div>
    </VisualizerLayout>
  );
};
