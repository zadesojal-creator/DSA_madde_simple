import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { SharedSortingCanvas } from '../components/sorting/SharedSortingCanvas';
import { AlgorithmControls } from '../components/sorting/AlgorithmControls';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { usePlayback } from '../hooks/usePlayback';
import { ALGORITHMS_METADATA } from '../data/algorithmsMetadata';
import { executeCppAlgorithm, type CppEngineStatus } from '../../src/services/cppExecutionAdapter';
import type { TraceStep } from '../types/trace';
import { Cpu } from 'lucide-react';

export const SortingVisualizerPage: React.FC = () => {
  const { algorithmId } = useParams<{ algorithmId?: string }>();

  // Normalize algorithm ID
  const activeAlgorithmId = useMemo(() => {
    const valid = ['bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort'];
    if (algorithmId && valid.includes(algorithmId)) {
      return algorithmId;
    }
    return 'bubble-sort';
  }, [algorithmId]);

  const meta = ALGORITHMS_METADATA[activeAlgorithmId];

  // User input overrides keyed by algorithm
  const [arrayOverrides, setArrayOverrides] = useState<Record<string, number[]>>({});

  const currentArray = arrayOverrides[activeAlgorithmId] ?? meta.defaultArray;

  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [cppSourceCode, setCppSourceCode] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<CppEngineStatus>('cpp-precompiled');
  const [engineMessage, setEngineMessage] = useState<string>('');

  // Execute C++ algorithm to generate trace
  useEffect(() => {
    let ignore = false;
    executeCppAlgorithm(activeAlgorithmId, currentArray, 0).then((result) => {
      if (!ignore) {
        setTraceSteps(result.steps);
        setCppSourceCode(result.sourceCode);
        setEngineStatus(result.engineStatus);
        setEngineMessage(result.engineMessage);
      }
    });
    return () => {
      ignore = true;
    };
  }, [activeAlgorithmId, currentArray]);

  // Playback controller
  const playback = usePlayback({
    steps: traceSteps,
    initialSpeed: 1
  });

  const currentStep = playback.currentStep;

  // Handle user applied inputs
  const handleApplyInputs = (newArr: number[]) => {
    setArrayOverrides((prev) => ({ ...prev, [activeAlgorithmId]: newArr }));
    playback.reset();
  };

  const handleReset = () => {
    playback.reset();
  };

  return (
    <VisualizerLayout activeTitle={meta.title}>
      <div className="space-y-6 text-slate-900">
        
        {/* Breadcrumbs & Header */}
        <div className="space-y-1.5 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName="Sorting Algorithms"
            categoryRoute="/visualizer/sorting/bubble-sort"
            subtopicName={meta.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>{meta.title}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>C++ Single Source of Truth</span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 pt-1 max-w-3xl">
                {meta.detailedDescription}
              </p>
            </div>

            {/* Engine Status Badge */}
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
              <span className={`w-2 h-2 rounded-full ${
                engineStatus === 'cpp-native' 
                  ? 'bg-emerald-500 animate-pulse' 
                  : engineStatus === 'cpp-precompiled' 
                  ? 'bg-indigo-500' 
                  : 'bg-amber-500'
              }`} />
              <span className="text-[11px] font-sans font-medium">{engineMessage || 'C++ Execution Ready'}</span>
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <AlgorithmControls
          key={`${activeAlgorithmId}-${currentArray.join(',')}`}
          array={currentArray}
          isSearching={false}
          onApply={handleApplyInputs}
          onReset={handleReset}
          isPlaying={playback.isPlaying}
        />

        {/* Visualization Canvas */}
        <SharedSortingCanvas
          currentStep={currentStep}
          initialArray={currentArray}
          algorithmName={meta.title}
          category="sorting"
        />

        {/* Playback Controls Strip */}
        <PlaybackControls
          isPlaying={playback.isPlaying}
          currentStepIndex={playback.currentStepIndex}
          totalSteps={playback.totalSteps}
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

        {/* Step Explanation Card */}
        <StepExplanation
          currentStep={currentStep}
          totalSteps={playback.totalSteps}
        />

        {/* C++ Code Panel & Complexity Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Synchronized C++ Source Panel */}
          <div className="lg:col-span-7 space-y-2">
            <PseudocodePanel
              lines={cppSourceCode.split('\n')}
              activeLine={currentStep?.sourceLine ?? currentStep?.activeLine}
              title={`${meta.title} — Canonical C++ Implementation`}
              language="C++ (ISO C++11/14 Single Source of Truth)"
            />
          </div>

          {/* Complexity & Learning Analysis */}
          <div className="lg:col-span-5 space-y-2">
            <ComplexityPanel
              complexity={meta.complexity}
              observedCounters={{
                comparisons: currentStep?.comparisons,
                swaps: currentStep?.swaps,
                writes: currentStep?.writes,
                passNumber: currentStep?.passNumber,
                recursionDepth: currentStep?.recursionDepth
              }}
            />
          </div>

        </div>

      </div>
    </VisualizerLayout>
  );
};
