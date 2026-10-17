import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ArraysVisualizerPage } from './pages/ArraysVisualizerPage';
import { ArrayTraversalDemo } from './pages/ArrayTraversalDemo';
import { SearchingVisualizerPage } from './pages/SearchingVisualizerPage';
import { SortingVisualizerPage } from './pages/SortingVisualizerPage';
import { BinaryTreeVisualizerPage } from './pages/BinaryTreeVisualizerPage';
import { TreeTraversalsVisualizerPage } from './pages/TreeTraversalsVisualizerPage';
import { BstVisualizerPage } from './pages/BstVisualizerPage';
import { HeapVisualizerPage } from './pages/HeapVisualizerPage';
import { StacksQueuesVisualizerPage } from './pages/StacksQueuesVisualizerPage';
import { LinearStructureVisualizerPage } from './pages/LinearStructureVisualizerPage';
import { GraphOverviewPage } from './pages/graphs/GraphOverviewPage';
import { GraphAlgorithmPage } from './pages/graphs/GraphAlgorithmPage';
import { RecursionOverviewPage } from './pages/recursion/RecursionOverviewPage';
import { BacktrackingOverviewPage } from './pages/recursion/BacktrackingOverviewPage';
import { RecursionAlgorithmPage } from './pages/recursion/RecursionAlgorithmPage';
import { TopicWorkspacePage } from './pages/TopicWorkspacePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      
      {/* Arrays Visualizer */}
      <Route path="/visualizer/arrays" element={<ArraysVisualizerPage />} />
      <Route path="/visualizer/arrays/:subtopicId" element={<ArraysVisualizerPage />} />
      <Route path="/visualizer/arrays/traversal-standalone" element={<ArrayTraversalDemo />} />

      {/* Searching Visualizer Routes (Prompt 06) */}
      <Route path="/visualizer/searching" element={<Navigate to="/visualizer/searching/linear-search" replace />} />
      <Route path="/visualizer/searching/:algorithmId" element={<SearchingVisualizerPage />} />

      {/* Sorting Visualizer Routes (Prompt 06) */}
      <Route path="/visualizer/sorting" element={<Navigate to="/visualizer/sorting/bubble-sort" replace />} />
      <Route path="/visualizer/sorting/:algorithmId" element={<SortingVisualizerPage />} />

      {/* Trees Visualizer Routes (Prompt 07) */}
      <Route path="/visualizer/trees" element={<Navigate to="/visualizer/trees/binary-tree" replace />} />
      <Route path="/visualizer/trees/binary-tree" element={<BinaryTreeVisualizerPage />} />
      <Route path="/visualizer/trees/traversals" element={<TreeTraversalsVisualizerPage />} />
      <Route path="/visualizer/trees/binary-search-tree" element={<BstVisualizerPage />} />

      {/* Heaps Visualizer Routes (Prompt 07) */}
      <Route path="/visualizer/heaps" element={<Navigate to="/visualizer/heaps/min-heap" replace />} />
      <Route path="/visualizer/heaps/min-heap" element={<HeapVisualizerPage heapType="min" />} />
      <Route path="/visualizer/heaps/max-heap" element={<HeapVisualizerPage heapType="max" />} />

      {/* Graph Visualizer Routes (Prompt 08) */}
      <Route path="/visualizer/graphs" element={<GraphOverviewPage />} />
      <Route path="/visualizer/graphs/bfs" element={<GraphAlgorithmPage algorithm="bfs" />} />
      <Route path="/visualizer/graphs/dfs" element={<GraphAlgorithmPage algorithm="dfs" />} />
      <Route path="/visualizer/graphs/dijkstra" element={<GraphAlgorithmPage algorithm="dijkstra" />} />
      <Route path="/visualizer/graphs/bellman-ford" element={<GraphAlgorithmPage algorithm="bellman-ford" />} />
      <Route path="/visualizer/graphs/floyd-warshall" element={<GraphAlgorithmPage algorithm="floyd-warshall" />} />
      <Route path="/visualizer/graphs/:algorithmId" element={<GraphAlgorithmPage />} />

      {/* Recursion Routes (Prompt 09) */}
      <Route path="/visualizer/recursion" element={<RecursionOverviewPage />} />
      <Route path="/visualizer/recursion/factorial" element={<RecursionAlgorithmPage algorithm="factorial" />} />
      <Route path="/visualizer/recursion/fibonacci" element={<RecursionAlgorithmPage algorithm="fibonacci" />} />
      <Route path="/visualizer/recursion/tower-of-hanoi" element={<RecursionAlgorithmPage algorithm="tower-of-hanoi" />} />

      {/* Backtracking Routes (Prompt 09) */}
      <Route path="/visualizer/backtracking" element={<BacktrackingOverviewPage />} />
      <Route path="/visualizer/backtracking/maze" element={<RecursionAlgorithmPage algorithm="maze" />} />
      <Route path="/visualizer/backtracking/n-queens" element={<RecursionAlgorithmPage algorithm="n-queens" />} />

      {/* Stacks & Queues Visualizer Routes */}
      <Route path="/visualizer/stacks-queues" element={<Navigate to="/visualizer/stacks-queues/stack-intro" replace />} />
      <Route path="/visualizer/stacks-queues/queue" element={<LinearStructureVisualizerPage key="queue" mode="queue" />} />
      <Route path="/visualizer/stacks-queues/circular-queue" element={<LinearStructureVisualizerPage key="circular-queue" mode="circular-queue" />} />
      <Route path="/visualizer/stacks-queues/deque" element={<LinearStructureVisualizerPage key="deque" mode="deque" />} />
      <Route path="/visualizer/stacks-queues/:subtopicId" element={<StacksQueuesVisualizerPage />} />

      {/* Linked-list variants */}
      <Route path="/visualizer/linked-lists" element={<Navigate to="/visualizer/linked-lists/singly" replace />} />
      <Route path="/visualizer/linked-lists/singly" element={<LinearStructureVisualizerPage key="singly" mode="singly" />} />
      <Route path="/visualizer/linked-lists/doubly" element={<LinearStructureVisualizerPage key="doubly" mode="doubly" />} />
      <Route path="/visualizer/linked-lists/circular" element={<LinearStructureVisualizerPage key="circular" mode="circular" />} />

      {/* Searching & Sorting Legacy Aliases */}
      <Route path="/visualizer/searching-sorting" element={<Navigate to="/visualizer/sorting/bubble-sort" replace />} />
      <Route path="/visualizer/searching-sorting/linear-search" element={<Navigate to="/visualizer/searching/linear-search" replace />} />
      <Route path="/visualizer/searching-sorting/binary-search" element={<Navigate to="/visualizer/searching/binary-search" replace />} />
      <Route path="/visualizer/searching-sorting/bubble-sort" element={<Navigate to="/visualizer/sorting/bubble-sort" replace />} />
      <Route path="/visualizer/searching-sorting/selection-sort" element={<Navigate to="/visualizer/sorting/selection-sort" replace />} />
      <Route path="/visualizer/searching-sorting/insertion-sort" element={<Navigate to="/visualizer/sorting/insertion-sort" replace />} />
      <Route path="/visualizer/searching-sorting/merge-sort" element={<Navigate to="/visualizer/sorting/merge-sort" replace />} />
      <Route path="/visualizer/searching-sorting/quick-sort" element={<Navigate to="/visualizer/sorting/quick-sort" replace />} />

      {/* Dynamic Topic Workspaces & 404 */}
      <Route path="/visualizer/:categoryId" element={<TopicWorkspacePage />} />
      <Route path="/visualizer/:categoryId/:subtopicId" element={<TopicWorkspacePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
