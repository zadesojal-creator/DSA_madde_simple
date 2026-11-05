import { describe, it, expect } from 'vitest';
import { 
  executeCppGraphAlgorithm, 
  validateGraphInput, 
  getAlgorithmCppCode 
} from '../services/cppExecutionAdapter';
import { ALGORITHMS_METADATA } from '../data/algorithmsMetadata';
import { NAVIGATION_CATEGORIES } from '../data/navigationData';

describe('Graph Algorithms Visualizer (C++ Single Source of Truth)', () => {

  describe('Graph Input Validation', () => {
    it('accepts valid edge tokens format "u-v" and "u-v:w"', () => {
      const res = validateGraphInput('0-1, 0-2:5, 1-3:10', 4, true, 'dijkstra');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects edges referencing nonexistent vertices', () => {
      const res = validateGraphInput('0-1, 1-5', 4, false, 'bfs');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('nonexistent or invalid vertex ID');
    });

    it('rejects invalid edge formats', () => {
      const res = validateGraphInput('invalid_token', 4, false, 'bfs');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Invalid edge format');

      const res2 = validateGraphInput('0--1', 4, false, 'bfs');
      expect(res2.valid).toBe(false);
      expect(res2.error).toContain('nonexistent or invalid vertex ID');
    });

    it('rejects negative edge weights for Dijkstra algorithm', () => {
      const res = validateGraphInput('0-1:4, 1-2:-3', 3, true, 'dijkstra');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Dijkstra rejects negative edge weights');
    });

    it('allows negative edge weights for Bellman-Ford algorithm', () => {
      const res = validateGraphInput('0-1:4, 1-2:-3', 3, true, 'bellman-ford');
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });

  describe('Breadth-First Search (BFS)', () => {
    it('emits C++ trace events with queue states and finds unweighted shortest paths', async () => {
      const res = await executeCppGraphAlgorithm('bfs', 'sample', { source: 0, target: 5 });
      expect(res.steps.length).toBeGreaterThan(5);

      const first = res.steps[0];
      expect(first.eventType).toBe('initialize');
      expect(first.graphVertices?.length).toBe(6);

      // Verify queue operations exist
      const enqueueSteps = res.steps.filter((s) => s.eventType === 'queue_enqueue');
      expect(enqueueSteps.length).toBeGreaterThan(0);

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.reconstructedPath).toEqual([0, 1, 3, 5]);

      // Distances from source 0
      const v0 = last.graphVertices?.find((v) => v.id === 0);
      const v5 = last.graphVertices?.find((v) => v.id === 5);
      expect(v0?.distance).toBe(0);
      expect(v5?.distance).toBe(3);
    });

    it('uses the bundled sample trace for the matching default graph when the C++ service is offline', async () => {
      const res = await executeCppGraphAlgorithm(
        'bfs',
        '0-1,0-2,1-3,1-4,2-4,3-5,4-5',
        { source: 0, target: 5, vertices: 6, directed: false, weighted: false }
      );

      expect(res.engineStatus).toBe('cpp-precompiled');
      expect(res.steps.length).toBeGreaterThan(5);
      expect(res.steps[0].graphVertices).toHaveLength(6);
      expect(res.steps[res.steps.length - 1].reconstructedPath).toEqual([0, 1, 3, 5]);
    });
  });

  describe('Depth-First Search (DFS)', () => {
    it('emits recursive call stack and records discovery / finish timestamps', async () => {
      const res = await executeCppGraphAlgorithm('dfs', 'sample', { source: 0, target: 0 });
      expect(res.steps.length).toBeGreaterThan(5);

      const discoverSteps = res.steps.filter((s) => s.eventType === 'vertex_discover');
      const finishSteps = res.steps.filter((s) => s.eventType === 'vertex_finish');
      expect(discoverSteps.length).toBeGreaterThan(0);
      expect(finishSteps.length).toBeGreaterThan(0);

      // Verify call stack simulation
      const stackStep = res.steps.find((s) => s.callStack && s.callStack.length > 1);
      expect(stackStep).toBeDefined();

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.traversalOutput?.length).toBe(6);
    });
  });

  describe("Dijkstra's Shortest Path Algorithm", () => {
    it('computes shortest path with positive weights using min-priority queue', async () => {
      const res = await executeCppGraphAlgorithm('dijkstra', 'sample', { source: 0, target: 4 });
      expect(res.steps.length).toBeGreaterThan(5);

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.reconstructedPath?.length).toBeGreaterThan(1);
      expect(last.reconstructedPath?.[0]).toBe(0);
      expect(last.reconstructedPath?.[last.reconstructedPath.length - 1]).toBe(4);

      // Check finalized distance
      const v4 = last.graphVertices?.find((v) => v.id === 4);
      expect(v4?.distance).toBe(11);
      expect(last.reconstructedPath).toEqual([0, 1, 3, 4]);
    });
  });

  describe('Bellman–Ford Algorithm', () => {
    it('supports negative weights and detects reachable negative cycles', async () => {
      const res = await executeCppGraphAlgorithm('bellman-ford', 'sample', { source: 0, target: 4 });
      expect(res.steps.length).toBeGreaterThan(5);

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.hasNegativeCycle).toBe(false);
      expect(last.reconstructedPath).toEqual([0, 2, 3, 4]);

      // Distances are updated properly
      const v4 = last.graphVertices?.find((v) => v.id === 4);
      expect(v4?.distance).toBe(7);
    });
  });

  describe('Floyd–Warshall Algorithm', () => {
    it('computes all-pairs distance matrix with intermediate k detours', async () => {
      const res = await executeCppGraphAlgorithm('floyd-warshall', 'sample', { source: 0, target: 3 });
      expect(res.steps.length).toBeGreaterThan(5);

      const matrixUpdateSteps = res.steps.filter((s) => s.eventType === 'matrix_cell_update');
      expect(matrixUpdateSteps.length).toBeGreaterThan(0);

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.hasNegativeCycle).toBe(false);
      expect(last.distanceMatrix?.length).toBe(4);

      // Verify diagonal is 0
      for (let i = 0; i < 4; i++) {
        expect(last.distanceMatrix?.[i][i]).toBe(0);
      }

      // Reconstructed path 0 -> 3 via 1 and 2 (cost: 3 + 2 + 1 = 6)
      expect(last.reconstructedPath).toEqual([0, 1, 2, 3]);
    });
  });

  describe('Navigation & Canonical C++ Code', () => {
    it('registers all 5 graph algorithms in navigation data', () => {
      const graphCategory = NAVIGATION_CATEGORIES.find((c) => c.id === 'graphs');
      expect(graphCategory).toBeDefined();
      expect(graphCategory?.subtopics.length).toBe(5);

      const routes = graphCategory?.subtopics.map((s) => s.route);
      expect(routes).toContain('/visualizer/graphs/bfs');
      expect(routes).toContain('/visualizer/graphs/dfs');
      expect(routes).toContain('/visualizer/graphs/dijkstra');
      expect(routes).toContain('/visualizer/graphs/bellman-ford');
      expect(routes).toContain('/visualizer/graphs/floyd-warshall');
    });

    it('provides genuine C++ source code for each algorithm', () => {
      const bfsCode = getAlgorithmCppCode('bfs');
      expect(bfsCode).toContain('void bfs');

      const dfsCode = getAlgorithmCppCode('dfs');
      expect(dfsCode).toContain('void dfs');

      const dijkstraCode = getAlgorithmCppCode('dijkstra');
      expect(dijkstraCode).toContain('void dijkstra');

      const bellmanFordCode = getAlgorithmCppCode('bellman-ford');
      expect(bellmanFordCode).toContain('bool bellmanFord');

      const floydWarshallCode = getAlgorithmCppCode('floyd-warshall');
      expect(floydWarshallCode).toContain('void floydWarshall');
    });

    it('contains comprehensive theoretical complexity metadata', () => {
      const bfsMeta = ALGORITHMS_METADATA['bfs'];
      expect(bfsMeta.complexity.timeComplexity.worst).toBe('V + E');
      expect(bfsMeta.complexity.spaceComplexity.worst).toBe('V');

      const dfsMeta = ALGORITHMS_METADATA['dfs'];
      expect(dfsMeta.complexity.timeComplexity.worst).toBe('V + E');

      const dijkstraMeta = ALGORITHMS_METADATA['dijkstra'];
      expect(dijkstraMeta.complexity.timeComplexity.worst).toContain('log V');

      const bellmanMeta = ALGORITHMS_METADATA['bellman-ford'];
      expect(bellmanMeta.complexity.timeComplexity.worst).toContain('E');

      const floydMeta = ALGORITHMS_METADATA['floyd-warshall'];
      expect(floydMeta.complexity.timeComplexity.worst).toBe('V³');
      expect(floydMeta.complexity.spaceComplexity.worst).toBe('V²');
    });
  });
});
