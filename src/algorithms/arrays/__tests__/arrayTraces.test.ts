import { describe, it, expect } from 'vitest';
import {
  isSortedAscending,
  generateArrayBasicsTrace,
  generateArrayTraversalTrace,
  generateAccessTrace,
  generateUpdateTrace,
  generateInsertTrace,
  generateDeleteTrace,
  generateLinearSearchTrace,
  generateBinarySearchTrace
} from '../arrayTraces';
import { ARRAY_OPERATIONS } from '../operationConfig';

describe('Array Trace Generators (C++ Algorithm Mappings)', () => {

  // Helper validation
  describe('isSortedAscending', () => {
    it('returns true for sorted ascending array', () => {
      expect(isSortedAscending([10, 20, 30, 40])).toBe(true);
      expect(isSortedAscending([5, 5, 10, 10])).toBe(true);
      expect(isSortedAscending([-10, -5, 0, 10])).toBe(true);
      expect(isSortedAscending([42])).toBe(true);
      expect(isSortedAscending([])).toBe(true);
    });

    it('returns false for unsorted array', () => {
      expect(isSortedAscending([40, 10, 30])).toBe(false);
      expect(isSortedAscending([1, 2, 5, 4])).toBe(false);
      expect(isSortedAscending([0, -1])).toBe(false);
    });
  });

  // 1. Array Basics Trace
  describe('generateArrayBasicsTrace', () => {
    it('handles empty array', () => {
      const trace = generateArrayBasicsTrace([]);
      expect(trace.length).toBe(1);
      expect(trace[0].arrayState).toEqual([]);
      expect(trace[0].isCompleted).toBe(true);
      expect(trace[0].activeLine).toBe(6);
    });

    it('handles single-element array', () => {
      const trace = generateArrayBasicsTrace([99]);
      expect(trace.length).toBeGreaterThan(1);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([99]);
    });

    it('produces valid C++ source line numbers and descriptions for standard array', () => {
      const trace = generateArrayBasicsTrace([10, 20, 30]);
      expect(trace.length).toBeGreaterThan(3);
      const maxLines = ARRAY_OPERATIONS['array-basics'].cppCode.length;
      trace.forEach((step) => {
        expect(step.title).toBeTruthy();
        expect(step.description).toBeTruthy();
        expect(step.activeLine).toBeGreaterThan(0);
        expect(step.activeLine).toBeLessThanOrEqual(maxLines);
      });
    });
  });

  // 2. Array Traversal Trace
  describe('generateArrayTraversalTrace', () => {
    it('handles empty array', () => {
      const trace = generateArrayTraversalTrace([]);
      expect(trace.length).toBe(1);
      expect(trace[0].isCompleted).toBe(true);
      expect(trace[0].variables?.n).toBe(0);
    });

    it('handles single-element array', () => {
      const trace = generateArrayTraversalTrace([42]);
      expect(trace.length).toBeGreaterThanOrEqual(4);
      expect(trace[trace.length - 1].isCompleted).toBe(true);
    });

    it('visits every index sequentially from 0 to n-1', () => {
      const arr = [10, -20, 30];
      const trace = generateArrayTraversalTrace(arr);

      // Verify initialization
      expect(trace[0].title).toContain('Initialize');
      expect(trace[0].variables?.i).toBe(0);

      // Verify completion
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.totalVisited).toBe(3);
      expect(lastStep.variables?.i).toBe(3);
    });
  });

  // 3. Access by Index Trace
  describe('generateAccessTrace', () => {
    it('handles empty array access attempt', () => {
      const trace = generateAccessTrace([], 0);
      expect(trace.length).toBe(1);
      expect(trace[0].variables?.error).toBe('EmptyArray');
    });

    it('handles first valid index (0)', () => {
      const trace = generateAccessTrace([100, 200, 300], 0);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.value).toBe(100);
      expect(lastStep.variables?.return).toBe(100);
      expect(lastStep.highlightedItems?.[0]).toBe('found');
    });

    it('handles last valid index (n - 1)', () => {
      const trace = generateAccessTrace([100, 200, 300], 2);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.value).toBe(300);
      expect(lastStep.variables?.return).toBe(300);
      expect(lastStep.highlightedItems?.[2]).toBe('found');
    });

    it('handles out of bounds indices gracefully', () => {
      const negativeTrace = generateAccessTrace([10, 20], -1);
      const negError = negativeTrace.find((s) => s.variables?.error === 'IndexOutOfBounds');
      expect(negError).toBeDefined();

      const overflowTrace = generateAccessTrace([10, 20], 5);
      const ovError = overflowTrace.find((s) => s.variables?.error === 'IndexOutOfBounds');
      expect(ovError).toBeDefined();
    });
  });

  // 4. Update an Element Trace
  describe('generateUpdateTrace', () => {
    it('handles empty array', () => {
      const trace = generateUpdateTrace([], 0, 99);
      expect(trace[0].variables?.error).toBe('EmptyArray');
    });

    it('handles invalid index', () => {
      const trace = generateUpdateTrace([10, 20], 3, 99);
      const errStep = trace.find((s) => s.variables?.error === 'IndexOutOfBounds');
      expect(errStep).toBeDefined();
    });

    it('correctly updates first element (index 0)', () => {
      const trace = generateUpdateTrace([10, 20, 30], 0, 999);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([999, 20, 30]);
      expect(lastStep.variables?.return).toBe('true');
    });

    it('correctly updates middle element with negative value', () => {
      const trace = generateUpdateTrace([10, 20, 30], 1, -777);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([10, -777, 30]);
    });

    it('correctly updates last element (index n - 1)', () => {
      const trace = generateUpdateTrace([10, 20, 30], 2, 555);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([10, 20, 555]);
    });
  });

  // 5. Insert an Element Trace
  describe('generateInsertTrace', () => {
    it('handles invalid insertion index', () => {
      const trace = generateInsertTrace([10, 20], 5, 99);
      expect(trace[0].variables?.error).toBe('IndexOutOfBounds');
    });

    it('inserts into empty array at index 0', () => {
      const trace = generateInsertTrace([], 0, 42);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([42]);
    });

    it('inserts at beginning (index 0) with right shifting', () => {
      const initial = [10, 20, 30];
      const trace = generateInsertTrace(initial, 0, 99);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([99, 10, 20, 30]);
      expect(lastStep.variables?.shiftedCount).toBe(3);
    });

    it('inserts at middle index with right shifting', () => {
      const initial = [10, 20, 30, 40];
      const trace = generateInsertTrace(initial, 2, 99);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([10, 20, 99, 30, 40]);
      expect(lastStep.variables?.shiftedCount).toBe(2);
    });

    it('inserts at end (index n) without shifting', () => {
      const initial = [10, 20, 30];
      const trace = generateInsertTrace(initial, 3, 99);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([10, 20, 30, 99]);
      expect(lastStep.variables?.shiftedCount).toBe(0);
    });
  });

  // 6. Delete an Element Trace
  describe('generateDeleteTrace', () => {
    it('handles empty array', () => {
      const trace = generateDeleteTrace([], 0);
      expect(trace[0].variables?.error).toBe('EmptyArray');
    });

    it('handles invalid deletion index', () => {
      const trace = generateDeleteTrace([10, 20], 2);
      expect(trace[0].variables?.error).toBe('IndexOutOfBounds');
    });

    it('deletes from single-element array', () => {
      const trace = generateDeleteTrace([42], 0);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([]);
    });

    it('deletes from beginning (index 0) with left shifting', () => {
      const initial = [10, 20, 30, 40];
      const trace = generateDeleteTrace(initial, 0);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([20, 30, 40]);
      expect(lastStep.variables?.totalShifts).toBe(3);
    });

    it('deletes from middle with left shifting', () => {
      const initial = [10, 20, 30, 40];
      const trace = generateDeleteTrace(initial, 1);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([10, 30, 40]);
      expect(lastStep.variables?.totalShifts).toBe(2);
    });

    it('deletes from end (index n - 1) without shifting', () => {
      const initial = [10, 20, 30];
      const trace = generateDeleteTrace(initial, 2);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.arrayState).toEqual([10, 20]);
      expect(lastStep.variables?.totalShifts).toBe(0);
    });
  });

  // 7. Linear Search Trace
  describe('generateLinearSearchTrace', () => {
    it('handles empty array', () => {
      const trace = generateLinearSearchTrace([], 5);
      expect(trace[0].variables?.return).toBe(-1);
      expect(trace[0].isCompleted).toBe(true);
    });

    it('finds target at beginning (first match)', () => {
      const trace = generateLinearSearchTrace([10, 20, 30], 10);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.foundIndex).toBe(0);
      expect(lastStep.variables?.return).toBe(0);
    });

    it('finds target at end', () => {
      const trace = generateLinearSearchTrace([10, 20, 30], 30);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.foundIndex).toBe(2);
      expect(lastStep.variables?.return).toBe(2);
    });

    it('stops at the first match when duplicates exist', () => {
      const trace = generateLinearSearchTrace([10, 20, 20, 20], 20);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.foundIndex).toBe(1); // First occurrence
    });

    it('reports not found (-1) when target is absent', () => {
      const trace = generateLinearSearchTrace([10, 20, 30], 999);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.return).toBe(-1);
    });
  });

  // 8. Binary Search Trace
  describe('generateBinarySearchTrace', () => {
    it('handles empty array', () => {
      const trace = generateBinarySearchTrace([], 10);
      expect(trace[0].variables?.return).toBe(-1);
      expect(trace[0].isCompleted).toBe(true);
    });

    it('rejects unsorted input with explicit error', () => {
      const trace = generateBinarySearchTrace([50, 10, 30], 10);
      expect(trace[0].variables?.error).toBe('ArrayNotSorted');
    });

    it('finds target in single-element array', () => {
      const trace = generateBinarySearchTrace([42], 42);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.foundIndex).toBe(0);
    });

    it('finds target in odd-length sorted array with negative numbers', () => {
      const arr = [-20, -10, 0, 10, 20];
      const trace = generateBinarySearchTrace(arr, 10);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.foundIndex).toBe(3);
    });

    it('finds target in even-length sorted array', () => {
      const arr = [10, 20, 30, 40, 50, 60];
      const trace = generateBinarySearchTrace(arr, 10);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.foundIndex).toBe(0);
    });

    it('reports not found when target is smaller than all elements', () => {
      const arr = [10, 20, 30];
      const trace = generateBinarySearchTrace(arr, 5);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.return).toBe(-1);
    });

    it('reports not found when target is greater than all elements', () => {
      const arr = [10, 20, 30];
      const trace = generateBinarySearchTrace(arr, 999);
      const lastStep = trace[trace.length - 1];
      expect(lastStep.isCompleted).toBe(true);
      expect(lastStep.variables?.return).toBe(-1);
    });

    it('contains low, mid, and high pointers for every iteration', () => {
      const arr = [10, 20, 30, 40, 50, 60, 70];
      const trace = generateBinarySearchTrace(arr, 60);
      const midSteps = trace.filter((s) => s.pointers?.some((p) => p.name === 'mid'));
      expect(midSteps.length).toBeGreaterThan(0);
      midSteps.forEach((step) => {
        expect(step.pointers?.find((p) => p.name === 'low')).toBeDefined();
        expect(step.pointers?.find((p) => p.name === 'mid')).toBeDefined();
        expect(step.pointers?.find((p) => p.name === 'high')).toBeDefined();
      });
    });

    it('verifies that all trace events map to valid C++ source lines', () => {
      const arr = [11, 22, 33, 44, 55, 66];
      const trace = generateBinarySearchTrace(arr, 44);
      const maxCppLines = ARRAY_OPERATIONS['binary-search'].cppCode.length;
      trace.forEach((step) => {
        expect(step.activeLine).toBeGreaterThan(0);
        expect(step.activeLine).toBeLessThanOrEqual(maxCppLines);
      });
    });
  });

});
