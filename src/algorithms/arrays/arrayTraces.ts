import type { TraceStep, ItemHighlightType, PointerInfo } from '../../types/trace';

/**
 * Validates if an array is strictly sorted in ascending order (non-decreasing).
 */
export function isSortedAscending(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }
  return true;
}

/**
 * 1. Array Basics Trace Generator (C++)
 * Maps to:
 * 5: int main() {
 * 6:     vector<int> arr = {10, 20, 30, 40, 50};
 * 7:     for (int i = 0; i < static_cast<int>(arr.size()); i++) {
 * 8:         cout << "Index: " << i << ", Value: " << arr[i] << '\n';
 * 9:     }
 * 10:    return 0;
 * 11: }
 */
export function generateArrayBasicsTrace(array: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'std::vector<int> arr Initialized (Empty)',
      description: 'vector<int> has size 0. No index offsets exist in memory.',
      activeLine: 6,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { n: 0, 'arr.size()': 0, length: 0 },
      statusText: 'Empty vector',
      isCompleted: true
    });
    return steps;
  }

  // Step 0: Vector allocation (Line 6)
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'std::vector<int> arr Allocated in Contiguous Memory',
    description: `vector<int> allocated with ${n} contiguous integer elements. Elements are laid out sequentially in memory.`,
    activeLine: 6,
    activeIndices: Array.from({ length: n }, (_, i) => i),
    arrayState: [...array],
    highlightedItems: Object.fromEntries(array.map((_, i) => [i, 'active'])),
    pointers: [],
    variables: { n, 'arr.size()': n, length: n }
  });

  // Loop iterations
  for (let i = 0; i < n; i++) {
    const val = array[i];

    // Line 7: Loop condition check
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Loop Check: i (${i}) < static_cast<int>(arr.size()) (${n})`,
      description: `Evaluating loop counter condition i = ${i} < ${n}: True. Proceeding into loop body.`,
      activeLine: 7,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { [i]: 'active' },
      pointers: [{ name: 'i', index: i }],
      variables: { i, n, 'arr[i]': val }
    });

    // Line 8: Print index and value
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `cout << "Index: " << ${i} << ", Value: " << arr[${i}] (${val})`,
      description: `Reading memory offset [${i}]. Index identifies the slot position; value (${val}) is the stored data.`,
      activeLine: 8,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { [i]: 'found' },
      pointers: [{ name: `i=${i}`, index: i }],
      variables: { i, value: val, n }
    });
  }

  // Line 10: Return 0
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'Loop Terminated: return 0;',
    description: `i reached ${n}. Loop condition i < ${n} evaluated to false. Program executed successfully with return code 0.`,
    activeLine: 10,
    activeIndices: [],
    arrayState: [...array],
    highlightedItems: Object.fromEntries(array.map((_, i) => [i, 'visited'])),
    pointers: [],
    variables: { i: n, n, status: 'Exit code 0' },
    statusText: 'Complete',
    isCompleted: true
  });

  return steps;
}

/**
 * 2. Array Traversal Trace Generator (C++)
 * Maps to:
 * 5: void traverse(const vector<int>& arr) {
 * 6:     for (int i = 0; i < static_cast<int>(arr.size()); i++) {
 * 7:         int value = arr[i]; // Visit arr[i]
 * 8:         cout << "Visiting: " << value << '\n';
 * 9:     }
 * 10: }
 */
export function generateArrayTraversalTrace(array: number[]): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Empty Vector Traversal',
      description: 'Loop condition i < static_cast<int>(arr.size()) is false immediately (0 < 0 is false). Loop terminates.',
      activeLine: 6,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { i: 0, n: 0, length: 0 },
      statusText: 'Empty vector',
      isCompleted: true
    });
    return steps;
  }

  // Line 6: Loop initialization
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'Initialize Loop Counter: int i = 0',
    description: `Initialized loop counter i = 0. Range: [0, ${n - 1}]. Preparing sequential inspection.`,
    activeLine: 6,
    activeIndices: [0],
    arrayState: [...array],
    highlightedItems: { 0: 'active' },
    pointers: [{ name: 'i', index: 0 }],
    variables: { i: 0, n }
  });

  const visitedMap: Record<number, ItemHighlightType> = {};

  for (let i = 0; i < n; i++) {
    const currentVal = array[i];

    // Line 6: Loop condition check
    visitedMap[i] = 'active';
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Loop Check: i (${i}) < static_cast<int>(arr.size()) (${n})`,
      description: `Condition i < ${n} is true. Entering loop body.`,
      activeLine: 6,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [{ name: 'i', index: i }],
      variables: { i, n }
    });

    // Line 7: int value = arr[i]
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `int value = arr[${i}] (${currentVal})`,
      description: `Reading memory address at offset i = ${i}. Retrieved element value = ${currentVal}.`,
      activeLine: 7,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [{ name: 'i', index: i }],
      variables: { i, value: currentVal, currentVal, n }
    });

    // Line 8: cout << "Visiting: " << value
    visitedMap[i] = 'visited';
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Process & Print: cout << "Visiting: " << ${currentVal}`,
      description: `Processed element ${currentVal} at index ${i}. Loop advances to increment i++.`,
      activeLine: 8,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [{ name: 'i', index: i }],
      variables: { i, value: currentVal, currentVal, n }
    });
  }

  // Line 10: Traversal complete
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'Traversal Finished (i == n)',
    description: `Loop counter reached i = ${n}. Condition i < ${n} is false. Iterative traversal finishes in O(n) time and O(1) auxiliary space.`,
    activeLine: 10,
    activeIndices: [],
    arrayState: [...array],
    highlightedItems: { ...visitedMap },
    pointers: [],
    variables: { i: n, n, totalVisited: n },
    statusText: 'Complete',
    isCompleted: true
  });

  return steps;
}

/**
 * 3. Access by Index Trace Generator (C++)
 * Maps to:
 * 5: int accessAtIndex(const vector<int>& arr, int index) {
 * 6:     if (index >= 0 && index < static_cast<int>(arr.size())) {
 * 7:         int value = arr[index];
 * 8:         return value;
 * 9:     }
 * 10:    return -1; // Out of bounds
 * 11: }
 */
export function generateAccessTrace(array: number[], index: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Empty Vector Access Attempt',
      description: `Vector is empty (size 0). Cannot access index ${index}. Valid index range is empty.`,
      activeLine: 6,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { index, n: 0, error: 'EmptyArray', return: -1, result: -1 },
      statusText: 'Empty vector',
      isCompleted: true
    });
    return steps;
  }

  // Line 6: Bounds check
  const isValid = Number.isInteger(index) && index >= 0 && index < n;

  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `Evaluate Bounds: index >= 0 && index < arr.size() (${n})`,
    description: `Checking index range: 0 <= ${index} < ${n}. ${isValid ? 'Condition evaluates to true.' : 'Index is OUT OF BOUNDS!'}`,
    activeLine: 6,
    activeIndices: isValid ? [index] : [],
    arrayState: [...array],
    highlightedItems: isValid ? { [index]: 'active' } : {},
    pointers: isValid ? [{ name: 'index', index }] : [],
    variables: { index, n, isValid }
  });

  if (!isValid) {
    // Line 10: return -1
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: 'Return -1 (Index Out of Bounds)',
      description: `Index ${index} is invalid for vector of size ${n}. Valid index range is [0, ${Math.max(0, n - 1)}]. Returning -1.`,
      activeLine: 10,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: {},
      pointers: [],
      variables: { index, n, return: -1, result: -1, error: 'IndexOutOfBounds' },
      statusText: 'Out of bounds',
      isCompleted: true
    });
    return steps;
  }

  const value = array[index];

  // Line 7: int value = arr[index]
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `int value = arr[${index}] (${value})`,
    description: `Direct memory address offset Base + (${index} * sizeof(int)) computed in O(1) time. Value is ${value}.`,
    activeLine: 7,
    activeIndices: [index],
    arrayState: [...array],
    highlightedItems: { [index]: 'found' },
    pointers: [{ name: 'index', index }],
    variables: { index, value, retrievedValue: value, n }
  });

  // Line 8: return value
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `return value (${value});`,
    description: `Function returns ${value}. O(1) constant time access completed without any traversal.`,
    activeLine: 8,
    activeIndices: [index],
    arrayState: [...array],
    highlightedItems: { [index]: 'found' },
    pointers: [{ name: 'result', index }],
    variables: { index, value, retrievedValue: value, return: value, result: value, timeComplexity: 'O(1)' },
    statusText: 'Complete',
    isCompleted: true
  });

  return steps;
}

/**
 * 4. Update an Element Trace Generator (C++)
 * Maps to:
 * 5: bool updateElement(vector<int>& arr, int index, int newValue) {
 * 6:     if (index >= 0 && index < static_cast<int>(arr.size())) {
 * 7:         arr[index] = newValue;
 * 8:         return true;
 * 9:     }
 * 10:    return false; // Out of bounds
 * 11: }
 */
export function generateUpdateTrace(array: number[], index: number, newValue: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Empty Vector Update Attempt',
      description: 'Vector has 0 elements. Cannot update element because no valid index exists.',
      activeLine: 6,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { index, n: 0, error: 'EmptyArray', return: 'false', result: 'false' },
      isCompleted: true
    });
    return steps;
  }

  const isValid = Number.isInteger(index) && index >= 0 && index < n;

  // Line 6: Bounds check
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `Evaluate Bounds: index >= 0 && index < arr.size() (${n})`,
    description: `Verifying bounds for index ${index}: ${isValid ? 'Valid index.' : 'Out of bounds!'}`,
    activeLine: 6,
    activeIndices: isValid ? [index] : [],
    arrayState: [...array],
    highlightedItems: isValid ? { [index]: 'target' } : {},
    pointers: isValid ? [{ name: 'index', index }] : [],
    variables: { index, value: newValue, n }
  });

  if (!isValid) {
    // Line 10: return false
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: 'Return false (Index Out of Bounds)',
      description: `Cannot update index ${index}. Valid indices for vector of size ${n} are [0, ${Math.max(0, n - 1)}]. Returning false.`,
      activeLine: 10,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: {},
      pointers: [],
      variables: { index, n, return: 'false', result: 'false', error: 'IndexOutOfBounds' },
      statusText: 'Update failed',
      isCompleted: true
    });
    return steps;
  }

  const oldValue = array[index];
  const updatedArray = [...array];
  updatedArray[index] = newValue;

  // Line 7: arr[index] = newValue
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `arr[${index}] = ${newValue} (In-Place Overwrite)`,
    description: `Memory slot at index ${index} overwritten from ${oldValue} to ${newValue}. Memory address and size remain unchanged.`,
    activeLine: 7,
    activeIndices: [index],
    arrayState: [...updatedArray],
    highlightedItems: { [index]: 'updated' },
    pointers: [{ name: 'index', index }],
    variables: { index, oldValue, value: newValue, n }
  });

  // Line 8: return true
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'return true; (Update Complete)',
    description: `In-place assignment succeeded in O(1) constant time and O(1) auxiliary space.`,
    activeLine: 8,
    activeIndices: [index],
    arrayState: [...updatedArray],
    highlightedItems: { [index]: 'found' },
    pointers: [],
    variables: { index, value: newValue, return: 'true', result: 'true', timeComplexity: 'O(1)' },
    statusText: 'Complete',
    isCompleted: true
  });

  return steps;
}

/**
 * 5. Insert an Element Trace Generator (C++)
 * Maps to:
 * 5: void insertAt(vector<int>& arr, int index, int value) {
 * 7:     arr.push_back(0); // Expand vector size
 * 8:     for (int j = static_cast<int>(arr.size()) - 2; j >= index; j--) {
 * 9:         arr[j + 1] = arr[j]; // Shift element right
 * 10:    }
 * 11:    arr[index] = value; // Place new element
 * 12: }
 */
export function generateInsertTrace(array: number[], index: number, value: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  const isValid = Number.isInteger(index) && index >= 0 && index <= n;

  if (!isValid) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Invalid Insertion Index',
      description: `Cannot insert at index ${index}. For vector of size ${n}, valid insertion indices are 0 through ${n}.`,
      activeLine: 5,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: {},
      pointers: [],
      variables: { index, n, error: 'IndexOutOfBounds' },
      isCompleted: true
    });
    return steps;
  }

  // Line 5: Function entry
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `insertAt(arr, index = ${index}, value = ${value})`,
    description: `Initiating vector insertion at index ${index} with value ${value}. Current size: ${n}.`,
    activeLine: 5,
    activeIndices: index < n ? [index] : [],
    arrayState: [...array],
    highlightedItems: index < n ? { [index]: 'insert' } : {},
    pointers: index < n ? [{ name: 'insertAt', index }] : [],
    variables: { index, value, n }
  });

  // Line 7: arr.push_back(0) - Expand vector
  let workingArray = [...array, 0];
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'arr.push_back(0); // Expand Vector Size',
    description: `Allocated new slot at end of vector. Size expanded from ${n} to ${n + 1}.`,
    activeLine: 7,
    activeIndices: [n],
    arrayState: [...workingArray],
    highlightedItems: { [n]: 'insert' },
    pointers: [{ name: 'end', index: n }],
    variables: { index, value, n: n + 1 }
  });

  // Line 8-10: Shift elements right from n - 1 down to index
  if (index < n) {
    for (let j = n - 1; j >= index; j--) {
      // Line 8: loop condition
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        title: `Shift Loop: j (${j}) >= index (${index})`,
        description: `Shifting element arr[${j}] (${workingArray[j]}) right into arr[${j + 1}].`,
        activeLine: 8,
        activeIndices: [j, j + 1],
        arrayState: [...workingArray],
        highlightedItems: { [j]: 'shifting', [j + 1]: 'shifting' },
        pointers: [{ name: 'j', index: j }],
        variables: { j, index, value, n: n + 1 }
      });

      // Line 9: arr[j + 1] = arr[j]
      workingArray[j + 1] = workingArray[j];
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        title: `arr[${j + 1}] = arr[${j}] (${workingArray[j]});`,
        description: `Element moved right into position ${j + 1}.`,
        activeLine: 9,
        activeIndices: [j + 1],
        arrayState: [...workingArray],
        highlightedItems: { [j + 1]: 'shifting' },
        pointers: [{ name: 'shifted', index: j + 1 }],
        variables: { j, index, value, n: n + 1 }
      });
    }
  }

  // Line 11: arr[index] = value
  workingArray[index] = value;
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `arr[${index}] = ${value}; // Place New Value`,
    description: `Written value ${value} into open slot at index ${index}. Vector size is now ${workingArray.length}.`,
    activeLine: 11,
    activeIndices: [index],
    arrayState: [...workingArray],
    highlightedItems: { [index]: 'found' },
    pointers: [{ name: 'newVal', index }],
    variables: { index, value, n: workingArray.length }
  });

  // Line 12: Complete
  const shiftsCount = Math.max(0, n - index);
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'Insertion Complete',
    description: `Element ${value} inserted. Total shifts required: ${shiftsCount}. Worst-case time: O(n).`,
    activeLine: 12,
    activeIndices: [index],
    arrayState: [...workingArray],
    highlightedItems: { [index]: 'found' },
    pointers: [],
    variables: { index, value, n: workingArray.length, shiftedCount: shiftsCount, totalShifts: shiftsCount, timeComplexity: 'O(n)' },
    statusText: 'Complete',
    isCompleted: true
  });

  return steps;
}

/**
 * 6. Delete an Element Trace Generator (C++)
 * Maps to:
 * 5: void deleteAt(vector<int>& arr, int index) {
 * 7:     int n = static_cast<int>(arr.size());
 * 8:     for (int j = index; j < n - 1; j++) {
 * 9:         arr[j] = arr[j + 1]; // Shift element left
 * 10:    }
 * 11:    arr.pop_back(); // Truncate trailing element
 * 12: }
 */
export function generateDeleteTrace(array: number[], index: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Empty Vector Deletion Attempt',
      description: 'Cannot delete from an empty vector (size 0).',
      activeLine: 5,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { index, n: 0, error: 'EmptyArray' },
      isCompleted: true
    });
    return steps;
  }

  if (index < 0 || index >= n) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Invalid Deletion Index',
      description: `Cannot delete from index ${index}. Valid indices for vector of size ${n} are 0 through ${Math.max(0, n - 1)}.`,
      activeLine: 5,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: {},
      pointers: [],
      variables: { index, n, error: 'IndexOutOfBounds' },
      isCompleted: true
    });
    return steps;
  }

  const targetValue = array[index];

  // Line 5: Function entry
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `deleteAt(arr, index = ${index}) (Value: ${targetValue})`,
    description: `Targeting element at index ${index} holding value ${targetValue} for deletion.`,
    activeLine: 5,
    activeIndices: [index],
    arrayState: [...array],
    highlightedItems: { [index]: 'delete' },
    pointers: [{ name: 'delete', index }],
    variables: { index, value: targetValue, n }
  });

  // Line 7: int n = arr.size()
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `int n = static_cast<int>(arr.size()); (${n})`,
    description: `Evaluating vector bounds. Elements to the right of index ${index} will shift left.`,
    activeLine: 7,
    activeIndices: [index],
    arrayState: [...array],
    highlightedItems: { [index]: 'delete' },
    pointers: [{ name: 'delete', index }],
    variables: { index, value: targetValue, n }
  });

  let workingArray = [...array];

  // Line 8-10: Shift left
  for (let j = index; j < n - 1; j++) {
    // Line 8: loop condition
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Shift Loop: j (${j}) < n - 1 (${n - 1})`,
      description: `Copying arr[${j + 1}] (${workingArray[j + 1]}) left into arr[${j}].`,
      activeLine: 8,
      activeIndices: [j, j + 1],
      arrayState: [...workingArray],
      highlightedItems: { [j]: 'shifting', [j + 1]: 'shifting' },
      pointers: [{ name: 'j', index: j }],
      variables: { j, index, n }
    });

    // Line 9: arr[j] = arr[j + 1]
    workingArray[j] = workingArray[j + 1];
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `arr[${j}] = arr[${j + 1}] (${workingArray[j]});`,
      description: `Element moved left into position ${j}.`,
      activeLine: 9,
      activeIndices: [j],
      arrayState: [...workingArray],
      highlightedItems: { [j]: 'shifting' },
      pointers: [{ name: 'shifted', index: j }],
      variables: { j, index, n }
    });
  }

  // Line 11: arr.pop_back()
  const finalArray = workingArray.slice(0, n - 1);
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'arr.pop_back(); // Truncate Trailing Element',
    description: `Removed redundant trailing element. Vector size reduced from ${n} to ${finalArray.length}.`,
    activeLine: 11,
    activeIndices: [],
    arrayState: [...finalArray],
    highlightedItems: {},
    pointers: [],
    variables: { index, value: targetValue, n: finalArray.length }
  });

  // Line 12: Complete
  const shiftsCount = Math.max(0, n - 1 - index);
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: 'Deletion Complete',
    description: `Element ${targetValue} deleted. Left-shifted ${shiftsCount} elements. Time complexity: O(n).`,
    activeLine: 12,
    activeIndices: [],
    arrayState: [...finalArray],
    highlightedItems: {},
    pointers: [],
    variables: { index, n: finalArray.length, totalShifts: shiftsCount, shiftedCount: shiftsCount, timeComplexity: 'O(n)' },
    statusText: 'Complete',
    isCompleted: true
  });

  return steps;
}

/**
 * 7. Linear Search Trace Generator (C++)
 * Maps to:
 * 5: int linearSearch(const vector<int>& arr, int target) {
 * 6:     for (int i = 0; i < static_cast<int>(arr.size()); i++) {
 * 7:         if (arr[i] == target) {
 * 8:             return i; // First match found
 * 9:         }
 * 10:    }
 * 11:    return -1; // Target not found
 * 12: }
 */
export function generateLinearSearchTrace(array: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    // Line 11: return -1
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'return -1; (Empty Vector)',
      description: `Vector is empty. Loop condition is false immediately. Target ${target} not found. Return -1.`,
      activeLine: 11,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { target, n: 0, return: -1, result: -1 },
      statusText: 'Not found',
      isCompleted: true
    });
    return steps;
  }

  // Line 5: Function entry
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `linearSearch(arr, target = ${target})`,
    description: `Starting sequential search from index 0 across ${n} elements looking for target = ${target}.`,
    activeLine: 5,
    activeIndices: [0],
    arrayState: [...array],
    highlightedItems: { 0: 'compare' },
    pointers: [{ name: 'i=0', index: 0 }],
    variables: { target, n }
  });

  const visitedMap: Record<number, ItemHighlightType> = {};
  let foundIndex = -1;

  for (let i = 0; i < n; i++) {
    const val = array[i];

    // Line 6: Loop check
    visitedMap[i] = 'compare';
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Loop Check: i (${i}) < static_cast<int>(arr.size()) (${n})`,
      description: `Evaluating loop counter i = ${i}. Comparing arr[${i}] against target ${target}.`,
      activeLine: 6,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [{ name: 'i', index: i }],
      variables: { i, value: val, target, n }
    });

    // Line 7: if (arr[i] == target)
    const isMatch = val === target;
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Compare: if (arr[${i}] == target) -> ${val} == ${target}?`,
      description: isMatch
        ? `MATCH! arr[${i}] (${val}) equals target ${target}. Entering return block.`
        : `No match (${val} != ${target}). Continuing scan.`,
      activeLine: 7,
      activeIndices: [i],
      arrayState: [...array],
      highlightedItems: { ...visitedMap, [i]: isMatch ? 'found' : 'compare' },
      pointers: [{ name: 'i', index: i }],
      variables: { i, value: val, target, n }
    });

    if (isMatch) {
      foundIndex = i;
      visitedMap[i] = 'found';

      // Line 8: return i
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        title: `return i; (Found at Index ${i})`,
        description: `Target ${target} located at index ${i} after ${i + 1} comparison(s). Halting at first match.`,
        activeLine: 8,
        activeIndices: [i],
        arrayState: [...array],
        highlightedItems: { ...visitedMap },
        pointers: [{ name: 'match', index: i }],
        variables: { i, value: val, target, return: i, result: i, foundIndex: i, foundAtIndex: i },
        statusText: 'Match found',
        isCompleted: true
      });
      break;
    }

    visitedMap[i] = 'visited';
  }

  if (foundIndex === -1) {
    // Line 11: return -1
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: 'return -1; (Target Not Found)',
      description: `All ${n} elements compared without finding target ${target}. Returning -1.`,
      activeLine: 11,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: { ...visitedMap },
      pointers: [],
      variables: { target, n, return: -1, result: -1, totalComparisons: n, timeComplexity: 'O(n)' },
      statusText: 'Not found',
      isCompleted: true
    });
  }

  return steps;
}

/**
 * 8. Binary Search Trace Generator (C++)
 * Maps to:
 * 5: int binarySearch(const vector<int>& arr, int target) {
 * 6:     int low = 0;
 * 7:     int high = static_cast<int>(arr.size()) - 1;
 * 8:     while (low <= high) {
 * 9:         int mid = low + (high - low) / 2;
 * 10:        if (arr[mid] == target) {
 * 11:            return mid;
 * 12:        }
 * 13:        if (arr[mid] < target) {
 * 14:            low = mid + 1;
 * 15:        } else {
 * 16:            high = mid - 1;
 * 17:        }
 * 18:    }
 * 19:    return -1; // Not found
 * 20: }
 */
export function generateBinarySearchTrace(array: number[], target: number): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;
  const n = array.length;

  if (n === 0) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Binary Search on Empty Vector',
      description: `Cannot perform binary search on empty vector. Return -1.`,
      activeLine: 5,
      activeIndices: [],
      arrayState: [],
      highlightedItems: {},
      pointers: [],
      variables: { target, low: 0, high: -1, return: -1, result: -1 },
      statusText: 'Empty vector',
      isCompleted: true
    });
    return steps;
  }

  // Unsorted check
  if (!isSortedAscending(array)) {
    steps.push({
      id: stepId++,
      stepIndex: 0,
      title: 'Error: Input Vector Must Be Sorted in Ascending Order',
      description: 'Binary search requires non-decreasing sorted elements. The vector is unsorted.',
      activeLine: 5,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: {},
      pointers: [],
      variables: { target, n, error: 'ArrayNotSorted' },
      isCompleted: true
    });
    return steps;
  }

  let low = 0;
  let high = n - 1;

  // Line 6-7: Initialize bounds
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    title: `Initialize Bounds: low = 0, high = ${high}`,
    description: `Initialized binary search pointers: low = 0, high = ${high}. Target = ${target}.`,
    activeLine: 6,
    activeIndices: [low, high],
    arrayState: [...array],
    highlightedItems: { [low]: 'active', [high]: 'active' },
    pointers: [{ name: 'low', index: low }, { name: 'high', index: high }],
    variables: { low, high, target, n }
  });

  const discardedMap: Record<number, ItemHighlightType> = {};
  let iteration = 0;
  let foundIndex = -1;

  while (low <= high) {
    iteration++;

    // Line 8: while (low <= high)
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `Iteration ${iteration}: while (low <= high) -> ${low} <= ${high}?`,
      description: `Search window size = ${high - low + 1}. Condition low <= high is true.`,
      activeLine: 8,
      activeIndices: [low, high],
      arrayState: [...array],
      highlightedItems: { ...discardedMap, [low]: 'active', [high]: 'active' },
      pointers: [{ name: 'low', index: low }, { name: 'high', index: high }],
      variables: { low, high, target, n }
    });

    // Line 9: int mid = low + (high - low) / 2
    const mid = low + Math.floor((high - low) / 2);
    const midVal = array[mid];

    const currentPointers: PointerInfo[] = [
      { name: 'low', index: low },
      { name: 'mid', index: mid },
      { name: 'high', index: high }
    ];

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: `int mid = low + (high - low) / 2 = ${mid} (arr[mid] = ${midVal})`,
      description: `Midpoint index is ${mid}. Comparing arr[mid] (${midVal}) with target (${target}).`,
      activeLine: 9,
      activeIndices: [mid],
      arrayState: [...array],
      highlightedItems: { ...discardedMap, [mid]: 'compare', [low]: 'active', [high]: 'active' },
      pointers: currentPointers,
      variables: { low, mid, high, value: midVal, target, n }
    });

    // Line 10: if (arr[mid] == target)
    if (midVal === target) {
      foundIndex = mid;
      // Line 11: return mid
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        title: `return mid = ${mid}; (Target Match!)`,
        description: `arr[${mid}] == target (${target}). Found in ${iteration} step(s) in O(log n) time.`,
        activeLine: 11,
        activeIndices: [mid],
        arrayState: [...array],
        highlightedItems: { ...discardedMap, [mid]: 'found' },
        pointers: [{ name: 'match', index: mid }],
        variables: { low, mid, high, value: midVal, target, return: mid, result: mid, foundIndex: mid, foundAtIndex: mid },
        statusText: 'Target found',
        isCompleted: true
      });
      break;
    }

    // Line 13: if (arr[mid] < target)
    if (midVal < target) {
      for (let k = low; k <= mid; k++) {
        discardedMap[k] = 'discarded';
      }

      // Line 14: low = mid + 1
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        title: `arr[mid] (${midVal}) < target (${target}): low = mid + 1 (${mid + 1})`,
        description: `Target is greater than mid value. Discarding left range [${low}, ${mid}]. Updating low = ${mid + 1}.`,
        activeLine: 14,
        activeIndices: [mid],
        arrayState: [...array],
        highlightedItems: { ...discardedMap },
        pointers: [{ name: 'low', index: mid + 1 }, { name: 'high', index: high }],
        variables: { low: mid + 1, mid, high, target, n }
      });

      low = mid + 1;
    } else {
      // Line 16: high = mid - 1
      for (let k = mid; k <= high; k++) {
        discardedMap[k] = 'discarded';
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        title: `arr[mid] (${midVal}) > target (${target}): high = mid - 1 (${mid - 1})`,
        description: `Target is smaller than mid value. Discarding right range [${mid}, ${high}]. Updating high = ${mid - 1}.`,
        activeLine: 16,
        activeIndices: [mid],
        arrayState: [...array],
        highlightedItems: { ...discardedMap },
        pointers: [{ name: 'low', index: low }, { name: 'high', index: mid - 1 }],
        variables: { low, mid, high: mid - 1, target, n }
      });

      high = mid - 1;
    }
  }

  // Line 19: return -1
  if (foundIndex === -1) {
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      title: 'return -1; (Search Window Exhausted: low > high)',
      description: `low (${low}) > high (${high}). Search range is empty. Target ${target} not found. Returning -1.`,
      activeLine: 19,
      activeIndices: [],
      arrayState: [...array],
      highlightedItems: { ...discardedMap },
      pointers: [],
      variables: { low, high, target, return: -1, result: -1, timeComplexity: 'O(log n)' },
      statusText: 'Not found',
      isCompleted: true
    });
  }

  return steps;
}
