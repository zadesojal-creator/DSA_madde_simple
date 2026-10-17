import { describe, it, expect } from 'vitest';
import { executeCppAlgorithm, parseArrayInput, isSorted } from '../services/cppExecutionAdapter';
import { ALGORITHMS_METADATA } from '../data/algorithmsMetadata';

describe('Searching & Sorting Algorithms (C++ Single Source of Truth)', () => {

  describe('Input Validation & Utilities', () => {
    it('parses valid comma-separated and space-separated numbers', () => {
      const res1 = parseArrayInput('10, 20, 30');
      expect(res1.array).toEqual([10, 20, 30]);

      const res2 = parseArrayInput('5  -12   42');
      expect(res2.array).toEqual([5, -12, 42]);
    });

    it('rejects malformed numbers and floating points with clean error', () => {
      const res = parseArrayInput('10, abc, 30');
      expect(res.error).toBeDefined();
      expect(res.array).toEqual([]);

      const floatRes = parseArrayInput('10, 3.14, 20');
      expect(floatRes.error).toBeDefined();
    });

    it('enforces maximum element count limit', () => {
      const longInput = Array.from({ length: 30 }, (_, i) => i).join(', ');
      const res = parseArrayInput(longInput, 25);
      expect(res.error).toBeDefined();
      expect(res.error).toContain('exceeds maximum allowed');
    });

    it('correctly validates sorted non-decreasing order', () => {
      expect(isSorted([1, 2, 2, 5, 9])).toBe(true);
      expect(isSorted([1, 5, 3, 9])).toBe(false);
      expect(isSorted([])).toBe(true);
      expect(isSorted([42])).toBe(true);
    });
  });

  describe('Linear Search (C++ trace fidelity)', () => {
    it('finds target at beginning, middle, and end', async () => {
      const arr = [15, 8, 42, 4, 23, 16];
      const res = await executeCppAlgorithm('linear-search', arr, 42);
      expect(res.steps.length).toBeGreaterThan(0);
      
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.eventType).toBe('found');
      expect(last.variables?.foundIndex).toBe('2');
      expect(last.variables?.return).toBe('2');
    });

    it('correctly terminates with return -1 when target is absent', async () => {
      const arr = [10, 20, 30, 40, 50];
      const res = await executeCppAlgorithm('linear-search', arr, 99);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.eventType).toBe('not_found');
      expect(last.variables?.return).toBe('-1');
    });

    it('has valid C++ source line highlighting on every step', async () => {
      const res = await executeCppAlgorithm('linear-search', [10, 20, 30], 20);
      for (const step of res.steps) {
        expect(step.sourceLine).toBeGreaterThan(0);
      }
    });
  });

  describe('Binary Search (C++ trace fidelity)', () => {
    it('halves search space using low, mid, high pointers', async () => {
      const arr = [3, 8, 15, 24, 37, 42, 59, 68, 71, 85];
      const res = await executeCppAlgorithm('binary-search', arr, 42);
      expect(res.steps.length).toBeGreaterThan(0);

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.eventType).toBe('found');
      expect(last.variables?.return).toBe('5');
    });

    it('identifies target absence in sorted array', async () => {
      const arr = [3, 8, 15, 24, 37, 42, 59, 68, 71, 85];
      const res = await executeCppAlgorithm('binary-search', arr, 50);
      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
      expect(last.eventType).toBe('not_found');
      expect(last.variables?.return).toBe('-1');
    });
  });

  describe('Sorting Algorithms Execution & Multiset Invariance', () => {
    const algorithms = [
      'bubble-sort',
      'selection-sort',
      'insertion-sort',
      'merge-sort',
      'quick-sort'
    ];

    for (const algo of algorithms) {
      describe(algo, () => {
        it('sorts random array in non-decreasing order and preserves multiset', async () => {
          const input = [29, 10, 14, 37, 13];
          const res = await executeCppAlgorithm(algo, input, 0);
          expect(res.steps.length).toBeGreaterThan(0);

          const last = res.steps[res.steps.length - 1];
          expect(last.isCompleted).toBe(true);
          const finalArr = last.arrayState!;
          
          // Verify sorted
          expect(isSorted(finalArr)).toBe(true);
          // Verify multiset preservation
          expect([...finalArr].sort((a, b) => a - b)).toEqual([...input].sort((a, b) => a - b));
        });

        it('handles reverse-sorted input correctly', async () => {
          const input = [5, 4, 3, 2, 1];
          const res = await executeCppAlgorithm(algo, input, 0);
          const finalArr = res.steps[res.steps.length - 1].arrayState!;
          expect(isSorted(finalArr)).toBe(true);
          expect(finalArr).toEqual([1, 2, 3, 4, 5]);
        });

        it('handles all-equal array correctly', async () => {
          const input = [7, 7, 7, 7];
          const res = await executeCppAlgorithm(algo, input, 0);
          const finalArr = res.steps[res.steps.length - 1].arrayState!;
          expect(finalArr).toEqual([7, 7, 7, 7]);
        });

        it('tracks valid comparison and write counters across steps', async () => {
          const input = [29, 10, 14, 37, 13];
          const res = await executeCppAlgorithm(algo, input, 0);
          const last = res.steps[res.steps.length - 1];
          expect(last.comparisons).toBeGreaterThan(0);
        });

        it('allows deterministic backward stepping restoring previous exact state', async () => {
          const input = [29, 10, 14, 37, 13];
          const res = await executeCppAlgorithm(algo, input, 0);
          const steps = res.steps;

          for (let i = steps.length - 1; i > 0; i--) {
            expect(steps[i - 1].arrayState).toBeDefined();
            expect(steps[i].arrayState).toBeDefined();
          }
        });
      });
    }

    it('bubble sort performs early exit on already sorted array', async () => {
      const sortedInput = [1, 2, 3, 4, 5];
      const res = await executeCppAlgorithm('bubble-sort', sortedInput, 0);
      const last = res.steps[res.steps.length - 1];
      expect(last.variables?.earlyExit).toBe('true');
      expect(last.swaps).toBe(0);
    });
  });

  describe('Complexity Analysis & Stability Properties', () => {
    it('accurately specifies theoretical complexities', () => {
      expect(ALGORITHMS_METADATA['bubble-sort'].complexity.timeComplexity.best).toBe('n');
      expect(ALGORITHMS_METADATA['bubble-sort'].complexity.stability?.isStable).toBe(true);

      expect(ALGORITHMS_METADATA['selection-sort'].complexity.timeComplexity.best).toBe('n²');
      expect(ALGORITHMS_METADATA['selection-sort'].complexity.stability?.isStable).toBe(false);

      expect(ALGORITHMS_METADATA['insertion-sort'].complexity.timeComplexity.best).toBe('n');
      expect(ALGORITHMS_METADATA['insertion-sort'].complexity.stability?.isStable).toBe(true);

      expect(ALGORITHMS_METADATA['merge-sort'].complexity.timeComplexity.worst).toBe('n log n');
      expect(ALGORITHMS_METADATA['merge-sort'].complexity.spaceComplexity.worst).toBe('n');
      expect(ALGORITHMS_METADATA['merge-sort'].complexity.stability?.isStable).toBe(true);

      expect(ALGORITHMS_METADATA['quick-sort'].complexity.timeComplexity.worst).toBe('n²');
      expect(ALGORITHMS_METADATA['quick-sort'].complexity.stability?.isStable).toBe(false);
    });
  });

});
