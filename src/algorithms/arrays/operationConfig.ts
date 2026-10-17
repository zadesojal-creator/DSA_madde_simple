import type { ComplexityInfo } from '../../types/trace';

export type ArrayOperationType = 
  | 'array-basics'
  | 'traversal'
  | 'access'
  | 'update'
  | 'insert'
  | 'delete'
  | 'linear-search'
  | 'binary-search';

export interface ArrayOperationMeta {
  id: ArrayOperationType;
  title: string;
  shortTitle: string;
  description: string;
  cppCode: string[];
  pseudocode: string[]; // alias to cppCode for shared components
  complexity: ComplexityInfo;
  defaultArray: number[];
  defaultParams?: {
    index?: number;
    value?: number;
    target?: number;
  };
}

const CPP_ARRAY_BASICS: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'int main() {',
  '    vector<int> arr = {10, 20, 30, 40, 50};',
  '    for (int i = 0; i < static_cast<int>(arr.size()); i++) {',
  '        cout << "Index: " << i << ", Value: " << arr[i] << \'\\n\';',
  '    }',
  '    return 0;',
  '}'
];

const CPP_TRAVERSAL: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'void traverse(const vector<int>& arr) {',
  '    for (int i = 0; i < static_cast<int>(arr.size()); i++) {',
  '        int value = arr[i]; // Visit arr[i]',
  '        cout << "Visiting: " << value << \'\\n\';',
  '    }',
  '}'
];

const CPP_ACCESS: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'int accessAtIndex(const vector<int>& arr, int index) {',
  '    if (index >= 0 && index < static_cast<int>(arr.size())) {',
  '        int value = arr[index];',
  '        return value;',
  '    }',
  '    return -1; // Out of bounds',
  '}'
];

const CPP_UPDATE: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'bool updateElement(vector<int>& arr, int index, int newValue) {',
  '    if (index >= 0 && index < static_cast<int>(arr.size())) {',
  '        arr[index] = newValue;',
  '        return true;',
  '    }',
  '    return false; // Out of bounds',
  '}'
];

const CPP_INSERT: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'void insertAt(vector<int>& arr, int index, int value) {',
  '    // Shift elements right starting from the end',
  '    arr.push_back(0); // Expand vector size',
  '    for (int j = static_cast<int>(arr.size()) - 2; j >= index; j--) {',
  '        arr[j + 1] = arr[j]; // Shift element right',
  '    }',
  '    arr[index] = value; // Place new element',
  '}'
];

const CPP_DELETE: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'void deleteAt(vector<int>& arr, int index) {',
  '    // Shift subsequent elements left',
  '    int n = static_cast<int>(arr.size());',
  '    for (int j = index; j < n - 1; j++) {',
  '        arr[j] = arr[j + 1]; // Shift element left',
  '    }',
  '    arr.pop_back(); // Truncate trailing element',
  '}'
];

const CPP_LINEAR_SEARCH: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'int linearSearch(const vector<int>& arr, int target) {',
  '    for (int i = 0; i < static_cast<int>(arr.size()); i++) {',
  '        if (arr[i] == target) {',
  '            return i; // First match found',
  '        }',
  '    }',
  '    return -1; // Target not found',
  '}'
];

const CPP_BINARY_SEARCH: string[] = [
  '#include <iostream>',
  '#include <vector>',
  'using namespace std;',
  '',
  'int binarySearch(const vector<int>& arr, int target) {',
  '    int low = 0;',
  '    int high = static_cast<int>(arr.size()) - 1;',
  '    while (low <= high) {',
  '        int mid = low + (high - low) / 2;',
  '        if (arr[mid] == target) {',
  '            return mid;',
  '        }',
  '        if (arr[mid] < target) {',
  '            low = mid + 1;',
  '        } else {',
  '            high = mid - 1;',
  '        }',
  '    }',
  '    return -1; // Not found',
  '}'
];

export const ARRAY_OPERATIONS: Record<ArrayOperationType, ArrayOperationMeta> = {
  'array-basics': {
    id: 'array-basics',
    title: 'Array Basics & Memory Layout (C++)',
    shortTitle: 'Array Basics',
    description: 'std::vector<int> allocation, zero-based indexing arithmetic, and distinction between storage addresses and values.',
    defaultArray: [10, 20, 30, 40, 50],
    cppCode: CPP_ARRAY_BASICS,
    pseudocode: CPP_ARRAY_BASICS,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1)',
        description: 'Direct memory addressing provides instant O(1) random lookup to vector elements.'
      },
      spaceComplexity: {
        worst: 'O(n)',
        description: 'Auxiliary space is O(1). Vector capacity allocates O(n) contiguous memory slots.'
      }
    }
  },

  'traversal': {
    id: 'traversal',
    title: 'Array Traversal (C++)',
    shortTitle: 'Traversal',
    description: 'Iterative inspection of std::vector<int> elements from index 0 to size() - 1 using loop variable i.',
    defaultArray: [10, 20, 30, 40, 50],
    cppCode: CPP_TRAVERSAL,
    pseudocode: CPP_TRAVERSAL,
    complexity: {
      timeComplexity: {
        best: 'O(n)',
        average: 'O(n)',
        worst: 'O(n)',
        description: 'Iterative traversal visits every element sequentially from index 0 to n - 1.'
      },
      spaceComplexity: {
        worst: 'O(1)',
        description: 'O(1) auxiliary space for iterative traversal loop pointer i.'
      }
    }
  },

  'access': {
    id: 'access',
    title: 'Access by Index (C++)',
    shortTitle: 'Access',
    description: 'Validates index bounds [0, size() - 1] and retrieves value directly in O(1) constant time.',
    defaultArray: [15, 28, 42, 67, 89],
    defaultParams: {
      index: 2
    },
    cppCode: CPP_ACCESS,
    pseudocode: CPP_ACCESS,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1)',
        description: 'Vector indexed lookup calculates address Base + (i * sizeof(int)) in O(1) time.'
      },
      spaceComplexity: {
        worst: 'O(1)',
        description: 'O(1) auxiliary space without extra memory allocations.'
      }
    }
  },

  'update': {
    id: 'update',
    title: 'Update an Element (C++)',
    shortTitle: 'Update',
    description: 'In-place element value overwrite arr[index] = newValue at valid index in O(1) constant time.',
    defaultArray: [10, 25, 45, 70, 95],
    defaultParams: {
      index: 1,
      value: 99
    },
    cppCode: CPP_UPDATE,
    pseudocode: CPP_UPDATE,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(1)',
        worst: 'O(1)',
        description: 'Direct in-place memory assignment arr[index] = newValue executes in O(1) time.'
      },
      spaceComplexity: {
        worst: 'O(1)',
        description: 'O(1) auxiliary space because memory is mutated in place.'
      }
    }
  },

  'insert': {
    id: 'insert',
    title: 'Insert into Vector (C++)',
    shortTitle: 'Insert',
    description: 'Conceptual expansion of arr.insert(arr.begin() + index, value) with right shifting.',
    defaultArray: [10, 20, 30, 40, 50],
    defaultParams: {
      index: 2,
      value: 99
    },
    cppCode: CPP_INSERT,
    pseudocode: CPP_INSERT,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(n)',
        worst: 'O(n)',
        description: 'O(1) when appended at end; O(n) worst case at beginning or middle due to shifting n elements.'
      },
      spaceComplexity: {
        worst: 'Depends',
        description: 'Depends on vector capacity: O(1) in-place when pre-allocated, O(n) during vector reallocation.'
      }
    }
  },

  'delete': {
    id: 'delete',
    title: 'Delete from Vector (C++)',
    shortTitle: 'Delete',
    description: 'Conceptual expansion of arr.erase(arr.begin() + index) with left shifting and pop_back().',
    defaultArray: [10, 20, 30, 40, 50],
    defaultParams: {
      index: 2
    },
    cppCode: CPP_DELETE,
    pseudocode: CPP_DELETE,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(n)',
        worst: 'O(n)',
        description: 'O(1) at end; O(n) worst case at beginning or middle because subsequent elements shift left.'
      },
      spaceComplexity: {
        worst: 'O(1)',
        description: 'O(1) auxiliary space for vector in-place shifting without allocating extra structures.'
      }
    }
  },

  'linear-search': {
    id: 'linear-search',
    title: 'Linear Search (C++)',
    shortTitle: 'Linear Search',
    description: 'Sequential check comparing each element against target from left to right, returning first match.',
    defaultArray: [24, 53, 12, 87, 45, 66],
    defaultParams: {
      target: 87
    },
    cppCode: CPP_LINEAR_SEARCH,
    pseudocode: CPP_LINEAR_SEARCH,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(n)',
        worst: 'O(n)',
        description: 'Best case O(1) if target is at index 0; Worst case O(n) if target is at end or absent.'
      },
      spaceComplexity: {
        worst: 'O(1)',
        description: 'O(1) auxiliary space for the iterative search index pointer.'
      }
    }
  },

  'binary-search': {
    id: 'binary-search',
    title: 'Binary Search (C++)',
    shortTitle: 'Binary Search',
    description: 'Logarithmic divide-and-conquer search using low, mid, and high pointers on sorted std::vector<int>.',
    defaultArray: [11, 22, 33, 44, 55, 66, 77, 88],
    defaultParams: {
      target: 55
    },
    cppCode: CPP_BINARY_SEARCH,
    pseudocode: CPP_BINARY_SEARCH,
    complexity: {
      timeComplexity: {
        best: 'O(1)',
        average: 'O(log n)',
        worst: 'O(log n)',
        description: 'O(log n) worst case because search window is halved at every iteration. Requires sorted input.'
      },
      spaceComplexity: {
        worst: 'O(1)',
        description: 'O(1) auxiliary space for iterative binary search with low, mid, and high pointers.'
      }
    }
  }
};

export const ARRAY_OPERATION_LIST = Object.values(ARRAY_OPERATIONS);
