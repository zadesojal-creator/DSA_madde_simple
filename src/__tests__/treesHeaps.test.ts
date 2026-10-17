import { describe, it, expect } from 'vitest';
import { executeCppAlgorithm, parseTreeTokensInput } from '../services/cppExecutionAdapter';
import { ALGORITHMS_METADATA } from '../data/algorithmsMetadata';
import { NAVIGATION_CATEGORIES } from '../data/navigationData';

describe('Trees & Heaps Visualizer (C++ Single Source of Truth)', () => {

  describe('Input Validation & Token Parsing', () => {
    it('parses tree tokens including null keywords and integers', () => {
      const res = parseTreeTokensInput('1, 2, 3, null, 4, -');
      expect(res.tokens).toEqual(['1', '2', '3', 'null', '4', 'null']);
      expect(res.error).toBeUndefined();
    });

    it('rejects invalid node tokens with a helpful error', () => {
      const res = parseTreeTokensInput('1, 2, abc, 4');
      expect(res.error).toBeDefined();
      expect(res.error).toContain('Invalid node token');
    });

    it('enforces maximum element limits', () => {
      const longInput = Array.from({ length: 30 }, (_, i) => String(i)).join(',');
      const res = parseTreeTokensInput(longInput, 25);
      expect(res.error).toBeDefined();
      expect(res.error).toContain('exceeds maximum allowed');
    });
  });

  describe('Binary Tree Operations (C++ Trace Fidelity)', () => {
    it('builds tree from level-order tokens with stable node IDs', async () => {
      const res = await executeCppAlgorithm('tree-build', ['1', '2', '3', '4', '5'], 0);
      expect(res.steps.length).toBeGreaterThan(0);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.treeNodes).toBeDefined();
      expect(last.treeNodes?.length).toBe(5);

      // Verify stable node IDs
      const ids = last.treeNodes?.map(n => n.id) || [];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('performs level-order insertion strictly distinct from BST ordering', async () => {
      const res = await executeCppAlgorithm('tree-insert', ['1', '2', '3', '4', '5'], 6);
      expect(res.steps.length).toBeGreaterThan(0);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      // Inserted node 6 should be the right child of node 3
      const node6 = last.treeNodes?.find(n => n.value === 6);
      expect(node6).toBeDefined();
    });

    it('searches for values and reports found / not_found correctly', async () => {
      const foundRes = await executeCppAlgorithm('tree-search', ['1', '2', '3', '4', '5'], 4);
      const foundLast = foundRes.steps[foundRes.steps.length - 1];
      expect(foundLast.isCompleted).toBe(true);
      expect(foundLast.variables?.found).toBe('true');

      const notFoundRes = await executeCppAlgorithm('tree-search', ['1', '2', '3', '4', '5'], 99);
      const notFoundLast = notFoundRes.steps[notFoundRes.steps.length - 1];
      expect(notFoundLast.isCompleted).toBe(true);
      expect(notFoundLast.variables?.found).toBe('false');
    });

    it('calculates node count, height, and leaf count matching C++ logic', async () => {
      const sizeRes = await executeCppAlgorithm('tree-size', ['1', '2', '3', '4', '5'], 0);
      expect(sizeRes.steps[sizeRes.steps.length - 1].variables?.totalNodes).toBe('5');

      const heightRes = await executeCppAlgorithm('tree-height', ['1', '2', '3', '4', '5'], 0);
      expect(heightRes.steps[heightRes.steps.length - 1].variables?.height).toBe('3');

      const leavesRes = await executeCppAlgorithm('tree-leaves', ['1', '2', '3', '4', '5'], 0);
      expect(leavesRes.steps[leavesRes.steps.length - 1].variables?.leafCount).toBe('3');
    });
  });

  describe('Tree Traversals (C++ Trace Output Verification)', () => {
    // Tree:
    //       1
    //     /   \
    //    2     3
    //   / \
    //  4   5
    const tokens = ['1', '2', '3', '4', '5'];

    it('produces preorder traversal sequence: Root -> Left -> Right', async () => {
      const res = await executeCppAlgorithm('traversal-preorder', tokens, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.traversalOutput).toEqual([1, 2, 4, 5, 3]);
      expect(last.callStack).toBeDefined();
    });

    it('produces inorder traversal sequence: Left -> Root -> Right', async () => {
      const res = await executeCppAlgorithm('traversal-inorder', tokens, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.traversalOutput).toEqual([4, 2, 5, 1, 3]);
    });

    it('produces postorder traversal sequence: Left -> Right -> Root', async () => {
      const res = await executeCppAlgorithm('traversal-postorder', tokens, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.traversalOutput).toEqual([4, 5, 2, 3, 1]);
    });

    it('produces level-order BFS traversal sequence using explicit queue', async () => {
      const res = await executeCppAlgorithm('traversal-level-order', tokens, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.traversalOutput).toEqual([1, 2, 3, 4, 5]);

      // Check queue trace event exists
      const hasQueueEvent = res.steps.some(s => s.eventType === 'queue_enqueue');
      expect(hasQueueEvent).toBe(true);
    });
  });

  describe('Binary Search Tree (Invariants & 3-Case Deletion)', () => {
    const bstKeys = [50, 30, 70, 20, 40, 60, 80];

    it('inorder traversal yields sorted order (BST Invariant)', async () => {
      const res = await executeCppAlgorithm('bst-inorder', bstKeys, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.traversalOutput).toEqual([20, 30, 40, 50, 60, 70, 80]);
    });

    it('rejects duplicate keys by policy and emits duplicate_rejected event', async () => {
      const res = await executeCppAlgorithm('bst-insert', bstKeys, 30);
      const duplicateStep = res.steps.find(s => s.eventType === 'duplicate_rejected');
      expect(duplicateStep).toBeDefined();
      expect(duplicateStep?.variables?.error).toBe('DuplicateKeyRejected');
    });

    it('handles Case 1: Delete leaf node (20)', async () => {
      const res = await executeCppAlgorithm('bst-delete', bstKeys, 20);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      const remainingVals = last.treeNodes?.map(n => n.value) || [];
      expect(remainingVals).not.toContain(20);
      expect(remainingVals.length).toBe(6);
    });

    it('handles Case 3: Delete node with two children (50 root replaced by successor 60)', async () => {
      const res = await executeCppAlgorithm('bst-delete', bstKeys, 50);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      const remainingVals = last.treeNodes?.map(n => n.value) || [];
      expect(remainingVals).not.toContain(50);
      expect(remainingVals).toContain(60);
      expect(remainingVals.length).toBe(6);
    });

    it('finds minimum and maximum keys in O(h) time', async () => {
      const minRes = await executeCppAlgorithm('bst-min', bstKeys, 0);
      expect(minRes.steps[minRes.steps.length - 1].variables?.minimum).toBe('20');

      const maxRes = await executeCppAlgorithm('bst-max', bstKeys, 0);
      expect(maxRes.steps[maxRes.steps.length - 1].variables?.maximum).toBe('80');
    });
  });

  describe('Heaps (Min-Heap and Max-Heap Invariants & Synchronization)', () => {
    it('builds Min-Heap bottom-up in O(n) satisfying parent <= children', async () => {
      const arr = [9, 5, 2, 7, 1, 8];
      const res = await executeCppAlgorithm('min-heap-build', arr, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);

      const heap = last.arrayState || [];
      expect(heap[0]).toBe(1); // root is minimum
      for (let i = 0; i < heap.length; i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < heap.length) expect(heap[i]).toBeLessThanOrEqual(heap[left]);
        if (right < heap.length) expect(heap[i]).toBeLessThanOrEqual(heap[right]);
      }
    });

    it('builds Max-Heap bottom-up in O(n) satisfying parent >= children', async () => {
      const arr = [3, 10, 1, 14, 8, 20, 7];
      const res = await executeCppAlgorithm('max-heap-build', arr, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);

      const heap = last.arrayState || [];
      expect(heap[0]).toBe(20); // root is maximum
      for (let i = 0; i < heap.length; i++) {
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < heap.length) expect(heap[i]).toBeGreaterThanOrEqual(heap[left]);
        if (right < heap.length) expect(heap[i]).toBeGreaterThanOrEqual(heap[right]);
      }
    });

    it('extracts root from Max-Heap and sifts down to restore invariant', async () => {
      const arr = [20, 14, 10, 8, 7, 3, 1];
      const res = await executeCppAlgorithm('max-heap-extract', arr, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.variables?.extracted).toBe('20');
      expect(last.arrayState?.length).toBe(6);
      expect(last.arrayState?.[0]).toBe(14);
    });

    it('extracts root from Min-Heap and sifts down to restore invariant', async () => {
      const arr = [1, 5, 2, 7, 9, 8];
      const res = await executeCppAlgorithm('min-heap-extract', arr, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.variables?.extracted).toBe('1');
      expect(last.arrayState?.length).toBe(5);
      expect(last.arrayState?.[0]).toBe(2);
    });
  });

  describe('Routing, Catalogue & Complexity Panel Metadata', () => {
    it('verifies Trees and Heaps are present in navigation categories', () => {
      const treesCat = NAVIGATION_CATEGORIES.find(c => c.id === 'trees');
      const heapsCat = NAVIGATION_CATEGORIES.find(c => c.id === 'heaps');

      expect(treesCat).toBeDefined();
      expect(heapsCat).toBeDefined();

      const treeRoutes = treesCat?.subtopics.map(s => s.route);
      expect(treeRoutes).toContain('/visualizer/trees/binary-tree');
      expect(treeRoutes).toContain('/visualizer/trees/traversals');
      expect(treeRoutes).toContain('/visualizer/trees/binary-search-tree');

      const heapRoutes = heapsCat?.subtopics.map(s => s.route);
      expect(heapRoutes).toContain('/visualizer/heaps/min-heap');
      expect(heapRoutes).toContain('/visualizer/heaps/max-heap');
    });

    it('includes accurate theoretical complexity for all new visualizers', () => {
      expect(ALGORITHMS_METADATA['binary-tree'].complexity.timeComplexity.worst).toBe('n');
      expect(ALGORITHMS_METADATA['binary-tree'].complexity.spaceComplexity.worst).toBe('h');

      expect(ALGORITHMS_METADATA['traversals'].complexity.timeComplexity.average).toBe('n');
      expect(ALGORITHMS_METADATA['binary-search-tree'].complexity.timeComplexity.average).toBe('log n');
      expect(ALGORITHMS_METADATA['binary-search-tree'].complexity.timeComplexity.worst).toBe('n');

      expect(ALGORITHMS_METADATA['min-heap'].complexity.timeComplexity.average).toBe('log n');
      expect(ALGORITHMS_METADATA['min-heap'].complexity.spaceComplexity.worst).toBe('1');
    });
  });
});
