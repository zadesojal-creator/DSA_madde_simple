import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { DualHeapCanvas } from '../components/heaps/DualHeapCanvas';
import { HeapControls } from '../components/heaps/HeapControls';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { usePlayback } from '../hooks/usePlayback';
import { ALGORITHMS_METADATA } from '../data/algorithmsMetadata';
import { executeCppAlgorithm, parseArrayInput, type CppEngineStatus } from '../services/cppExecutionAdapter';
import type { TraceStep } from '../types/trace';
import { Cpu, AlertCircle } from 'lucide-react';

interface HeapVisualizerPageProps {
  heapType?: 'min' | 'max';
}

export const HeapVisualizerPage: React.FC<HeapVisualizerPageProps> = ({ heapType: propHeapType }) => {
  const location = useLocation();

  const activeHeapType: 'min' | 'max' = useMemo(() => {
    if (propHeapType) return propHeapType;
    if (location.pathname.includes('max-heap')) return 'max';
    return 'min';
  }, [propHeapType, location.pathname]);

  const metaKey = activeHeapType === 'min' ? 'min-heap' : 'max-heap';
  const meta = ALGORITHMS_METADATA[metaKey];

  const defaultArrayStr = activeHeapType === 'min' ? '9,5,2,7,1,8' : '3,10,1,14,8,20,7';
  const [inputArrayStr, setInputArrayStr] = useState<string>(defaultArrayStr);
  const [activeOp, setActiveOp] = useState<string>(`${activeHeapType}-heap-build`);
  const [insertVal, setInsertVal] = useState<number>(activeHeapType === 'min' ? 1 : 25);
  const validationResult = useMemo(() => parseArrayInput(inputArrayStr), [inputArrayStr]);
  const errorMessage = validationResult.error ?? null;

  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [cppSourceCode, setCppSourceCode] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<CppEngineStatus>('cpp-precompiled');
  const [engineMessage, setEngineMessage] = useState<string>('');

  useEffect(() => {
    if (validationResult.error) return;
    let ignore = false;

    executeCppAlgorithm(activeOp, validationResult.array, insertVal, insertVal).then((result) => {
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
  }, [inputArrayStr, activeOp, insertVal, activeHeapType, validationResult]);

  const playback = usePlayback({
    steps: traceSteps,
    initialSpeed: 1
  });

  const currentStep = playback.currentStep;

  const handleExecuteOperation = (op: string, val?: number) => {
    setActiveOp(op);
    if (val !== undefined) setInsertVal(val);
    playback.reset();
  };

  return (
    <VisualizerLayout activeTitle={meta.title}>
      <div className="space-y-6 text-slate-900">
        
        {/* Breadcrumbs & Header */}
        <div className="space-y-1.5 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName="Heap Data Structures"
            categoryRoute={`/visualizer/heaps/${activeHeapType}-heap`}
            subtopicName={meta.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>{meta.title} Visualizer</span>
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
              <span className="text-[11px] font-sans font-medium">{engineMessage || 'C++ Ready'}</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Heap Controls */}
        <HeapControls
          heapType={activeHeapType}
          currentInput={inputArrayStr}
          onInputChange={(val) => {
            setInputArrayStr(val);
            playback.reset();
          }}
          onExecute={handleExecuteOperation}
          disabled={playback.isPlaying}
        />

        {/* Dual Heap Synchronized Canvas */}
        <DualHeapCanvas
          currentStep={currentStep}
          heapType={activeHeapType}
          title={`${meta.title}: Synchronized Storage & Binary Tree`}
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
          <div className="lg:col-span-7 space-y-2">
            <PseudocodePanel
              lines={cppSourceCode.split('\n')}
              activeLine={currentStep?.sourceLine ?? currentStep?.activeLine}
              title={`${meta.title} — Canonical C++ Implementation`}
              language="C++ (ISO C++11/14 Single Source of Truth)"
            />
          </div>

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
