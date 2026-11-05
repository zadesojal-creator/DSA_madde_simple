import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { VisualizerLayout } from '../../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../../components/workspace/TopicBreadcrumbs';
import { GraphCanvas } from '../../components/graphs/GraphCanvas';
import { GraphControls, type GraphEdgeData } from '../../components/graphs/GraphControls';
import { AdjacencyListView } from '../../components/graphs/AdjacencyListView';
import { AdjacencyMatrixView } from '../../components/graphs/AdjacencyMatrixView';
import { GraphAlgorithmStatePanel } from '../../components/graphs/GraphAlgorithmStatePanel';
import { GraphLegend } from '../../components/graphs/GraphLegend';
import { PlaybackControls } from '../../components/workspace/PlaybackControls';
import { StepExplanation } from '../../components/workspace/StepExplanation';
import { PseudocodePanel } from '../../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../../components/workspace/ComplexityPanel';
import { usePlayback } from '../../hooks/usePlayback';
import { ALGORITHMS_METADATA } from '../../data/algorithmsMetadata';
import { 
  executeCppGraphAlgorithm, 
  validateGraphInput, 
  type CppEngineStatus 
} from '../../services/cppExecutionAdapter';
import type { TraceStep, GraphVertexSnapshot, GraphEdgeSnapshot } from '../../types/trace';
import { Cpu, Lightbulb } from 'lucide-react';

interface DefaultGraphConfig {
  vertexCount: number;
  directed: boolean;
  weighted: boolean;
  edges: GraphEdgeData[];
  source: number;
  target: number;
}

const DEFAULT_CONFIGS: Record<string, DefaultGraphConfig> = {
  bfs: {
    vertexCount: 6,
    directed: false,
    weighted: false,
    edges: [
      { u: 0, v: 1, weight: 1 },
      { u: 0, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 1 },
      { u: 1, v: 4, weight: 1 },
      { u: 2, v: 4, weight: 1 },
      { u: 3, v: 5, weight: 1 },
      { u: 4, v: 5, weight: 1 }
    ],
    source: 0,
    target: 5
  },
  dfs: {
    vertexCount: 6,
    directed: true,
    weighted: false,
    edges: [
      { u: 0, v: 1, weight: 1 },
      { u: 0, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 1 },
      { u: 2, v: 3, weight: 1 },
      { u: 3, v: 4, weight: 1 },
      { u: 4, v: 5, weight: 1 },
      { u: 5, v: 2, weight: 1 }
    ],
    source: 0,
    target: 0
  },
  dijkstra: {
    vertexCount: 5,
    directed: true,
    weighted: true,
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 2 },
      { u: 1, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 5 },
      { u: 2, v: 3, weight: 8 },
      { u: 2, v: 4, weight: 10 },
      { u: 3, v: 4, weight: 2 }
    ],
    source: 0,
    target: 4
  },
  'bellman-ford': {
    vertexCount: 5,
    directed: true,
    weighted: true,
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 2 },
      { u: 1, v: 2, weight: -1 },
      { u: 1, v: 3, weight: 2 },
      { u: 2, v: 3, weight: 3 },
      { u: 3, v: 4, weight: 2 }
    ],
    source: 0,
    target: 4
  },
  'floyd-warshall': {
    vertexCount: 4,
    directed: true,
    weighted: true,
    edges: [
      { u: 0, v: 1, weight: 3 },
      { u: 0, v: 2, weight: 8 },
      { u: 1, v: 2, weight: 2 },
      { u: 1, v: 3, weight: 5 },
      { u: 2, v: 3, weight: 1 }
    ],
    source: 0,
    target: 3
  }
};

interface GraphAlgorithmPageProps {
  algorithm?: string;
}

export const GraphAlgorithmPage: React.FC<GraphAlgorithmPageProps> = ({ algorithm: propAlgorithm }) => {
  const { algorithmId: paramAlgorithmId } = useParams<{ algorithmId: string }>();
  const activeAlgorithmId = propAlgorithm || paramAlgorithmId || 'bfs';

  const metadata = ALGORITHMS_METADATA[activeAlgorithmId] || {
    title: 'Graph Algorithm',
    category: 'Graph Algorithms',
    categoryRoute: '/visualizer/graphs',
    description: 'Graph algorithm visualization',
    detailedDescription: 'Step through graph traversal and shortest path search algorithms.',
    complexity: {
      timeComplexity: { best: 'O(V + E)', average: 'O(V + E)', worst: 'O(V + E)' },
      spaceComplexity: { worst: 'O(V)' }
    }
  };

  const defaultConfig = DEFAULT_CONFIGS[activeAlgorithmId] || DEFAULT_CONFIGS['bfs'];

  // Graph state
  const [vertexCount, setVertexCount] = useState<number>(defaultConfig.vertexCount);
  const [edges, setEdges] = useState<GraphEdgeData[]>(defaultConfig.edges);
  const [directed, setDirected] = useState<boolean>(defaultConfig.directed);
  const [weighted, setWeighted] = useState<boolean>(defaultConfig.weighted);
  const [sourceVertex, setSourceVertex] = useState<number>(defaultConfig.source);
  const [targetVertex, setTargetVertex] = useState<number>(defaultConfig.target);
  const [viewMode, setViewMode] = useState<'canvas' | 'adj-list' | 'adj-matrix'>('canvas');
  const [isModified, setIsModified] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  // Trace execution state
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [cppSourceCode, setCppSourceCode] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<CppEngineStatus>('cpp-precompiled');
  const [engineMessage, setEngineMessage] = useState<string>('');

  // Playback controller
  const playback = usePlayback({
    steps: traceSteps,
    initialSpeed: 1
  });

  const { reset: resetPlayback, play } = playback;
  const playRef = useRef(play);
  const resetRef = useRef(resetPlayback);

  useEffect(() => {
    playRef.current = play;
    resetRef.current = resetPlayback;
  }, [play, resetPlayback]);

  // Execute C++ algorithm with specified parameters
  const executeAlgorithmWith = useCallback(async (
    customEdges: GraphEdgeData[],
    customVertexCount: number,
    customWeighted: boolean,
    customDirected: boolean,
    customSource: number,
    customTarget: number,
    autoPlay = true
  ) => {
    const edgeTokens = customEdges.map((e) => `${e.u}-${e.v}${customWeighted ? `:${e.weight}` : ''}`).join(',');
    const check = validateGraphInput(edgeTokens, customVertexCount, customWeighted, activeAlgorithmId);
    if (!check.valid) {
      setValidationError(check.error);
      return;
    }
    setValidationError(undefined);

    const result = await executeCppGraphAlgorithm(activeAlgorithmId, edgeTokens, {
      source: customSource,
      target: customTarget,
      vertices: customVertexCount,
      directed: customDirected,
      weighted: customWeighted
    });

    setTraceSteps(result.steps);
    setCppSourceCode(result.sourceCode);
    setEngineStatus(result.engineStatus);
    setEngineMessage(result.engineMessage);
    setIsModified(false);

    if (autoPlay && !result.isError && result.steps.length > 1) {
      resetRef.current();
      setTimeout(() => {
        playRef.current();
      }, 60);
    } else {
      resetRef.current();
    }
  }, [activeAlgorithmId]);

  // Run on algorithm change with the default config for that algorithm
  useEffect(() => {
    const cfg = DEFAULT_CONFIGS[activeAlgorithmId] || DEFAULT_CONFIGS['bfs'];
    setVertexCount(cfg.vertexCount);
    setEdges(cfg.edges);
    setDirected(cfg.directed);
    setWeighted(cfg.weighted);
    setSourceVertex(cfg.source);
    setTargetVertex(cfg.target);
    setIsModified(false);
    setValidationError(undefined);

    void executeAlgorithmWith(
      cfg.edges,
      cfg.vertexCount,
      cfg.weighted,
      cfg.directed,
      cfg.source,
      cfg.target,
      true
    );
  }, [activeAlgorithmId, executeAlgorithmWith]);

  const handleRunAlgorithm = () => {
    void executeAlgorithmWith(edges, vertexCount, weighted, directed, sourceVertex, targetVertex, true);
  };

  // Handle graph modification
  const handleUpdateGraph = (newV: number, newEdges: GraphEdgeData[], newDir: boolean, newWeight: boolean) => {
    setVertexCount(newV);
    setEdges(newEdges);
    setDirected(newDir);
    setWeighted(newWeight);
    setIsModified(true);
    setValidationError(undefined);
  };

  const handleUpdateSourceTarget = (src: number, tgt: number) => {
    setSourceVertex(src);
    setTargetVertex(tgt);
    setIsModified(true);
  };

  const handleResetGraph = () => {
    const cfg = DEFAULT_CONFIGS[activeAlgorithmId] || DEFAULT_CONFIGS['bfs'];
    setVertexCount(cfg.vertexCount);
    setEdges(cfg.edges);
    setDirected(cfg.directed);
    setWeighted(cfg.weighted);
    setSourceVertex(cfg.source);
    setTargetVertex(cfg.target);
    setIsModified(false);
    setValidationError(undefined);
    void executeAlgorithmWith(
      cfg.edges,
      cfg.vertexCount,
      cfg.weighted,
      cfg.directed,
      cfg.source,
      cfg.target,
      true
    );
  };

  const handleLoadSample = (sampleType: string) => {
    let newV = vertexCount;
    let newEdges: GraphEdgeData[] = edges;
    let newDir = directed;
    let newWeight = weighted;
    let newSrc = sourceVertex;
    let newTgt = targetVertex;

    if (sampleType === 'disconnected') {
      newEdges = [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 2 },
        { u: 3, v: 4, weight: 3 }
      ];
      newV = 5;
      newSrc = 0;
      newTgt = 4;
    } else if (sampleType === 'cycle') {
      newEdges = [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 2 },
        { u: 2, v: 3, weight: 1 },
        { u: 3, v: 0, weight: 3 }
      ];
      newV = 4;
      newSrc = 0;
      newTgt = 2;
    } else if (sampleType === 'negative-weights') {
      newEdges = [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 2 },
        { u: 2, v: 3, weight: -10 },
        { u: 3, v: 1, weight: 1 }
      ];
      newV = 4;
      newDir = true;
      newWeight = true;
      newSrc = 0;
      newTgt = 3;
    } else {
      handleResetGraph();
      return;
    }

    setVertexCount(newV);
    setEdges(newEdges);
    setDirected(newDir);
    setWeighted(newWeight);
    setSourceVertex(newSrc);
    setTargetVertex(newTgt);
    setIsModified(true);
    void executeAlgorithmWith(newEdges, newV, newWeight, newDir, newSrc, newTgt, true);
  };

  const currentStep = playback.currentStep;

  // Active step graph snapshot vertices and edges
  const displayVertices: GraphVertexSnapshot[] = useMemo(() => {
    if (currentStep?.graphVertices && currentStep.graphVertices.length > 0) {
      return currentStep.graphVertices;
    }
    return Array.from({ length: vertexCount }, (_, i) => ({
      id: i,
      label: String(i),
      state: 'unvisited',
      distance: 0,
      hasDistance: false,
      predecessor: -1,
      discoveryTime: -1,
      finishTime: -1
    }));
  }, [currentStep, vertexCount]);

  const displayEdges: GraphEdgeSnapshot[] = useMemo(() => {
    if (currentStep?.graphEdges && currentStep.graphEdges.length > 0) {
      return currentStep.graphEdges;
    }
    return edges.map((e) => ({
      u: e.u,
      v: e.v,
      weight: e.weight,
      directed,
      state: 'default'
    }));
  }, [currentStep, edges, directed]);

  return (
    <VisualizerLayout activeTitle={metadata.title}>
      <div className="space-y-6 text-slate-900">
        
        {/* Breadcrumbs & Header */}
        <div className="space-y-1.5 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName="Graph Algorithms"
            categoryRoute="/visualizer/graphs"
            subtopicName={metadata.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>{metadata.title} Visualizer</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>C++ Single Source of Truth</span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 pt-1 max-w-3xl">
                {metadata.detailedDescription}
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

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-2">
            <span><strong>Invalid Graph Input:</strong> {validationError}</span>
            <button
              onClick={() => setValidationError(undefined)}
              className="text-rose-500 hover:text-rose-700 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Algorithm Overview & Guidance Callout */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-600">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">
              Interactive Graph Controls & Multi-View Representations
            </p>
            <p>
              Modify vertices, add or remove edge connections, configure weights and directions, or toggle between <strong>Visual Canvas</strong>, <strong>Adjacency List</strong>, and <strong>Adjacency Matrix</strong> views.
            </p>
          </div>
        </div>

        {/* Graph Controls Bar */}
        <GraphControls
          algorithmId={activeAlgorithmId}
          vertexCount={vertexCount}
          edges={edges}
          directed={directed}
          weighted={weighted}
          sourceVertex={sourceVertex}
          targetVertex={targetVertex}
          viewMode={viewMode}
          isModified={isModified}
          onUpdateGraph={handleUpdateGraph}
          onUpdateSourceTarget={handleUpdateSourceTarget}
          onChangeViewMode={setViewMode}
          onRunAlgorithm={handleRunAlgorithm}
          onResetGraph={handleResetGraph}
          onLoadSample={handleLoadSample}
        />

        {/* Main Graph Visualization Area */}
        <div className="space-y-4">
          {viewMode === 'canvas' && (
            <GraphCanvas
              vertices={displayVertices}
              edges={displayEdges}
              activeVertexId={currentStep?.activeVertexId}
              activeEdgeU={currentStep?.activeEdgeU}
              activeEdgeV={currentStep?.activeEdgeV}
              reconstructedPath={currentStep?.reconstructedPath}
              algorithmId={activeAlgorithmId}
            />
          )}

          {viewMode === 'adj-list' && (
            <AdjacencyListView
              vertices={displayVertices}
              edges={displayEdges}
              directed={directed}
              weighted={weighted}
            />
          )}

          {viewMode === 'adj-matrix' && (
            <AdjacencyMatrixView
              vertices={displayVertices}
              edges={displayEdges}
              directed={directed}
              weighted={weighted}
            />
          )}

          {/* Visualizer Legend */}
          <GraphLegend />
        </div>

        {/* Runtime State Panels */}
        <GraphAlgorithmStatePanel
          algorithmId={activeAlgorithmId}
          currentStep={currentStep}
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

        {/* Code & Complexity Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-2">
            <PseudocodePanel
              lines={cppSourceCode.split('\n')}
              activeLine={currentStep?.sourceLine ?? currentStep?.activeLine}
              title={`${metadata.title} — Canonical C++ Implementation`}
              language="C++ (ISO C++17 Single Source of Truth)"
            />
          </div>

          <div className="lg:col-span-5 space-y-2">
            <ComplexityPanel
              complexity={metadata.complexity}
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
