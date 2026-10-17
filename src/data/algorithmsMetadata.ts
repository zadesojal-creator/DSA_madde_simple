import type { ComplexityInfo } from '../types/trace';

export interface AlgorithmMetadata {
  id: string;
  category: 'searching' | 'sorting' | 'trees' | 'heaps' | 'graphs' | 'recursion' | 'backtracking';
  title: string;
  shortDescription: string;
  detailedDescription: string;
  defaultArray?: number[];
  defaultTarget?: number;
  complexity: ComplexityInfo;
  requiresSorted?: boolean;
}

export const ALGORITHMS_METADATA: Record<string, AlgorithmMetadata> = {
  'linear-search': {
    id: 'linear-search',
    category: 'searching',
    title: 'Linear Search',
    shortDescription: 'Sequential scan checking each element from index 0 until match or exhaustion.',
    detailedDescription: 'Iterates through the vector sequentially from index 0 to n - 1. Compares each element with the target value. Returns the first matching index immediately or -1 if absent.',
    defaultArray: [15, 8, 42, 4, 23, 16],
    defaultTarget: 42,
    complexity: {
      timeComplexity: {
        best: '1',
        average: 'n',
        worst: 'n',
        description: 'Best-case O(1) if target is at index 0. Average and worst-case O(n) when target is near the end or absent.'
      },
      spaceComplexity: {
        worst: '1',
        description: 'Auxiliary space is O(1) as it inspects elements in place with a single index counter.'
      },
      stability: {
        isStable: true,
        description: 'Finds the first occurrence when scanning from start to finish.'
      },
      inPlace: {
        isInPlace: true,
        description: 'Performs read-only inspection without allocating auxiliary buffers.'
      },
      whenUseful: 'Best for unsorted or small datasets where sorting overhead exceeds linear scan cost.'
    }
  },
  'binary-search': {
    id: 'binary-search',
    category: 'searching',
    title: 'Binary Search',
    shortDescription: 'Logarithmic divide-and-conquer search on sorted arrays using low, mid, and high pointers.',
    detailedDescription: 'Iteratively halves the search space by evaluating the midpoint element. If target is less than arr[mid], discards the right half; if greater, discards the left half. Precondition: Array must be sorted in non-decreasing order.',
    defaultArray: [3, 8, 15, 24, 37, 42, 59, 68, 71, 85],
    defaultTarget: 42,
    requiresSorted: true,
    complexity: {
      timeComplexity: {
        best: '1',
        average: 'log n',
        worst: 'log n',
        description: 'O(log n) time complexity strictly under the sorted-input precondition. Best-case O(1) if target is at the exact initial midpoint.'
      },
      spaceComplexity: {
        worst: '1',
        description: 'Iterative binary search uses O(1) auxiliary space (low, mid, high pointers).'
      },
      stability: {
        isStable: true,
        description: 'Can identify target in logarithmic time. In arrays with duplicate targets, returns whichever matching midpoint index is reached first.'
      },
      inPlace: {
        isInPlace: true,
        description: 'Operates directly on the input vector without additional allocations.'
      },
      whenUseful: 'Essential for repeated lookups in pre-sorted data or finding thresholds in monotonic functions.'
    }
  },
  'bubble-sort': {
    id: 'bubble-sort',
    category: 'sorting',
    title: 'Bubble Sort',
    shortDescription: 'Repeatedly steps through the list, compares adjacent elements, and swaps out-of-order pairs.',
    detailedDescription: 'Scans adjacent pairs and pushes larger elements toward the right end. Includes early-exit optimization: if an entire pass completes with zero swaps, the algorithm halts immediately.',
    defaultArray: [29, 10, 14, 37, 13],
    complexity: {
      timeComplexity: {
        best: 'n',
        average: 'n²',
        worst: 'n²',
        description: 'Best-case O(n) achieved when input is already sorted due to the swapped early-termination flag. Average and worst-case are O(n²).'
      },
      spaceComplexity: {
        worst: '1',
        description: 'In-place sorting using O(1) auxiliary variables for loop counters and swap flag.'
      },
      stability: {
        isStable: true,
        description: 'Stable sort: adjacent elements are swapped only when arr[j] > arr[j+1], never when equal.'
      },
      inPlace: {
        isInPlace: true,
        description: 'Sorts entirely in-place within the original vector.'
      },
      whenUseful: 'Educational purposes and detecting whether a short array is already sorted in a single pass.'
    }
  },
  'selection-sort': {
    id: 'selection-sort',
    category: 'sorting',
    title: 'Selection Sort',
    shortDescription: 'Divides the array into sorted prefix and unsorted suffix, repeatedly finding and placing the minimum item.',
    detailedDescription: 'Finds the minimum element from the unsorted suffix and exchanges it with the first unsorted position. Guarantees at most n - 1 swaps across the entire sorting process.',
    defaultArray: [29, 10, 14, 37, 13],
    complexity: {
      timeComplexity: {
        best: 'n²',
        average: 'n²',
        worst: 'n²',
        description: 'O(n²) in all cases (best, average, worst) because it always scans the entire remaining unsorted suffix regardless of initial order.'
      },
      spaceComplexity: {
        worst: '1',
        description: 'Requires O(1) auxiliary space (tracks current minIdx pointer).'
      },
      stability: {
        isStable: false,
        description: 'Unstable in its standard swap-based implementation because long-distance swaps can move an element past an identical key.'
      },
      inPlace: {
        isInPlace: true,
        description: 'In-place algorithm swapping directly within the input array.'
      },
      whenUseful: 'Useful when memory write cycles are costly (e.g. EEPROM / flash memory) because it performs at most O(n) writes.'
    }
  },
  'insertion-sort': {
    id: 'insertion-sort',
    category: 'sorting',
    title: 'Insertion Sort',
    shortDescription: 'Builds the sorted array one item at a time by shifting larger elements right and inserting the key.',
    detailedDescription: 'Maintains a sorted prefix [0..i-1]. For each element key = arr[i], shifts all elements greater than key one position to the right, then inserts key into the vacated position.',
    defaultArray: [29, 10, 14, 37, 13],
    complexity: {
      timeComplexity: {
        best: 'n',
        average: 'n²',
        worst: 'n²',
        description: 'Best-case O(n) on already sorted arrays (each key compared once without shifts). Average and worst-case O(n²) on reverse or random arrays.'
      },
      spaceComplexity: {
        worst: '1',
        description: 'In-place algorithm utilizing O(1) auxiliary memory for the key and index counter.'
      },
      stability: {
        isStable: true,
        description: 'Stable: only elements strictly greater than key are shifted right, preserving relative order of equal items.'
      },
      inPlace: {
        isInPlace: true,
        description: 'Sorts strictly in-place with zero external allocations.'
      },
      whenUseful: 'Standard choice for small arrays (n <= 20) and nearly sorted data. Used as the base case in hybrid algorithms like Timsort and Introsort.'
    }
  },
  'merge-sort': {
    id: 'merge-sort',
    category: 'sorting',
    title: 'Merge Sort',
    shortDescription: 'Divide-and-conquer algorithm recursively splitting the array in half, then merging sorted segments.',
    detailedDescription: 'Recursively divides the array into left and right halves until subarrays have size 1. Then merges sorted halves back together by picking the smaller item (arr[i] <= arr[j]) to guarantee stability.',
    defaultArray: [29, 10, 14, 37, 13],
    complexity: {
      timeComplexity: {
        best: 'n log n',
        average: 'n log n',
        worst: 'n log n',
        description: 'Guaranteed O(n log n) time complexity across all cases: log n recursion levels with O(n) total merge work per level.'
      },
      spaceComplexity: {
        worst: 'n',
        description: 'Auxiliary space is O(n) due to temporary merge buffer allocations and O(log n) recursion stack frames.'
      },
      stability: {
        isStable: true,
        description: 'Stable: during merge, if arr[i] == arr[j], the element from the left half is chosen first, preserving original ordering.'
      },
      inPlace: {
        isInPlace: false,
        description: 'Not in-place for standard array implementations; requires an auxiliary buffer of size n.'
      },
      whenUseful: 'Ideal when guaranteed worst-case O(n log n) performance and stability are mandatory, and for sorting linked lists or external disk files.'
    }
  },
  'quick-sort': {
    id: 'quick-sort',
    category: 'sorting',
    title: 'Quick Sort',
    shortDescription: 'Divide-and-conquer partition algorithm choosing a pivot and placing smaller items left and larger items right.',
    detailedDescription: 'Uses Lomuto partitioning scheme: selects the rightmost element as pivot, scans with pointers i and j, swaps elements <= pivot into the left region, then places pivot at its permanent partition index.',
    defaultArray: [29, 10, 14, 37, 13],
    complexity: {
      timeComplexity: {
        best: 'n log n',
        average: 'n log n',
        worst: 'n²',
        description: 'Average case O(n log n) with low constant factors. Worst case O(n²) occurs when partitions are severely unbalanced (e.g., sorted array with end pivot).'
      },
      spaceComplexity: {
        worst: 'log n',
        description: 'O(log n) auxiliary stack space on average for recursive frames, up to O(n) in worst-case degenerate trees.'
      },
      stability: {
        isStable: false,
        description: 'Unstable: standard swap-based Lomuto partition moves elements across long distances without preserving equal-key order.'
      },
      inPlace: {
        isInPlace: true,
        description: 'In-place: rearranges elements directly within the input array without external buffers.'
      },
      whenUseful: 'Widely used general-purpose in-memory sorting algorithm due to exceptional cache locality and fast real-world execution.'
    }
  },
  'binary-tree': {
    id: 'binary-tree',
    category: 'trees',
    title: 'Binary Tree',
    shortDescription: 'Hierarchical node structure where each node has at most two children (left and right).',
    detailedDescription: 'Dynamically allocated C++ node structure. Supports level-order construction, level-order insertion (breadth-first vacant child placement), full tree search, node counting, height calculation, and leaf counting.',
    defaultArray: [1, 2, 3, 4, 5],
    defaultTarget: 4,
    complexity: {
      timeComplexity: {
        best: '1',
        average: 'n',
        worst: 'n',
        description: 'Search, size, height, and leaf counting visit up to n nodes, resulting in O(n) time. Insertion into level-order takes O(n) to find the first open slot.'
      },
      spaceComplexity: {
        worst: 'h',
        description: 'Recursive traversal takes O(h) auxiliary stack space, where h is the tree height (O(log n) balanced, O(n) skewed). Level-order queue uses O(w) auxiliary space, where w is max width.'
      },
      whenUseful: 'Fundamental data structure for hierarchical representations, expression trees, and routing structures.'
    }
  },
  'traversals': {
    id: 'traversals',
    category: 'trees',
    title: 'Tree Traversals',
    shortDescription: 'Preorder, Inorder, Postorder (Depth-First) and Level-Order (Breadth-First Queue).',
    detailedDescription: 'Four fundamental tree traversals implemented in C++. Preorder: Root → Left → Right. Inorder: Left → Root → Right. Postorder: Left → Right → Root. Level-Order: Breadth-first traversal using an explicit queue.',
    defaultArray: [1, 2, 3, 4, 5],
    complexity: {
      timeComplexity: {
        best: 'n',
        average: 'n',
        worst: 'n',
        description: 'Every traversal visits each node exactly once, guaranteeing strict O(n) time complexity.'
      },
      spaceComplexity: {
        worst: 'h',
        description: 'Depth-first traversals require O(h) auxiliary stack space. Breadth-first level-order traversal requires O(w) auxiliary queue space (up to n/2 nodes at the bottom level).'
      },
      whenUseful: 'Inorder yields sorted keys for BSTs; Preorder is used for serialization and copying; Postorder is used for deletion and bottom-up evaluation.'
    }
  },
  'binary-search-tree': {
    id: 'binary-search-tree',
    category: 'trees',
    title: 'Binary Search Tree',
    shortDescription: 'Ordered binary tree maintaining the invariant: Left < Root < Right with duplicate rejection.',
    detailedDescription: 'Pointer-based C++ implementation. Maintains the BST ordering invariant. Supports insert, search, delete with all 3 structural cases (leaf, 1 child, 2 children using inorder successor), min, max, and predecessor/successor.',
    defaultArray: [50, 30, 70, 20, 40, 60, 80],
    defaultTarget: 40,
    complexity: {
      timeComplexity: {
        best: 'log n',
        average: 'log n',
        worst: 'n',
        description: 'Average O(log n) time when tree is reasonably balanced. Worst-case degrades to O(n) when insertions are sorted and tree becomes a degenerate linked list. Ordinary BST is not self-balancing.'
      },
      spaceComplexity: {
        worst: 'h',
        description: 'Auxiliary stack space is O(h) for recursion, where h is the tree height (O(log n) average, O(n) worst case).'
      },
      whenUseful: 'Efficient dynamic dictionary when keys are inserted in random order; foundation for self-balancing AVL and Red-Black trees.'
    }
  },
  'min-heap': {
    id: 'min-heap',
    category: 'heaps',
    title: 'Min-Heap',
    shortDescription: 'Complete binary tree stored efficiently in an array where parent <= children.',
    detailedDescription: 'Array-backed complete binary tree. Parent formula: (i - 1) / 2 for i > 0; Left child: 2*i + 1; Right child: 2*i + 2. Supports bottom-up O(n) build-heap, O(log n) insert with sift-up, and O(log n) extract-min with sift-down.',
    defaultArray: [9, 5, 2, 7, 1, 8],
    complexity: {
      timeComplexity: {
        best: '1',
        average: 'log n',
        worst: 'log n',
        description: 'Peek root minimum is O(1). Insert and Extract-Min are O(log n) due to tree height. Bottom-up build heap is mathematical O(n).'
      },
      spaceComplexity: {
        worst: '1',
        description: 'Auxiliary space is O(1) beyond the input storage vector; heap operations mutate elements in place without dynamic tree node pointers.'
      },
      whenUseful: 'Priority queues, Dijkstra’s shortest path algorithm, Prim’s MST, and Huffman coding.'
    }
  },
  'max-heap': {
    id: 'max-heap',
    category: 'heaps',
    title: 'Max-Heap',
    shortDescription: 'Complete binary tree stored efficiently in an array where parent >= children.',
    detailedDescription: 'Array-backed complete binary tree maintaining the max-heap invariant. The root index 0 holds the maximum element. Supports O(n) bottom-up heapify, O(log n) insert with sift-up, and O(log n) extract-max with sift-down.',
    defaultArray: [3, 10, 1, 14, 8, 20, 7],
    complexity: {
      timeComplexity: {
        best: '1',
        average: 'log n',
        worst: 'log n',
        description: 'Peek root maximum is O(1). Insert and Extract-Max are O(log n). Bottom-up build-heap is O(n).'
      },
      spaceComplexity: {
        worst: '1',
        description: 'In-place array storage with O(1) auxiliary space.'
      },
      whenUseful: 'Max-priority queues, Heap Sort (O(n log n) guaranteed in-place sorting), and finding the top-K elements.'
    }
  },
  'bfs': {
    id: 'bfs',
    category: 'graphs',
    title: 'Breadth-First Search (BFS)',
    shortDescription: 'Level-by-level graph traversal using a FIFO queue to discover shortest paths in unweighted graphs.',
    detailedDescription: 'Starts at a designated source vertex, marks it as discovered, and enqueues it. Iteratively dequeues the front vertex, examines all adjacent unvisited neighbors, assigns their distance as dist[u] + 1 with predecessor parent pointers, and enqueues them. Explores vertices in strictly increasing order of their hop distance from the source.',
    complexity: {
      timeComplexity: {
        best: 'V + E',
        average: 'V + E',
        worst: 'V + E',
        description: 'Every reachable vertex is enqueued and dequeued once O(V), and every incident edge is examined once (directed) or twice (undirected) O(E).'
      },
      spaceComplexity: {
        worst: 'V',
        description: 'Auxiliary space is O(V) for the visitation state array, distance table, predecessor array, and the FIFO queue.'
      },
      whenUseful: 'Finding the shortest path in unweighted networks, broadcast routing, web crawling, and bipartiteness testing.'
    }
  },
  'dfs': {
    id: 'dfs',
    category: 'graphs',
    title: 'Depth-First Search (DFS)',
    shortDescription: 'Deep exploratory traversal along each branch until dead ends, using recursion or an explicit stack.',
    detailedDescription: 'Visits a starting vertex, assigns its discovery timestamp, and recursively explores as deep as possible along each branch before backtracking. Records finish timestamps upon completing all incident edges from a vertex. Produces tree edges, back edges, forward edges, and cross edges in directed graphs.',
    complexity: {
      timeComplexity: {
        best: 'V + E',
        average: 'V + E',
        worst: 'V + E',
        description: 'Each vertex is entered and exited once O(V), and all adjacency lists are iterated through completely O(E).'
      },
      spaceComplexity: {
        worst: 'V',
        description: 'O(V) auxiliary space for recursion call stack in the worst-case (linear chain graph), plus discovery and finish time tracking.'
      },
      whenUseful: 'Topological sorting (DAGs), cycle detection, finding strongly connected components (Kosaraju/Tarjan), and solving mazes.'
    }
  },
  'dijkstra': {
    id: 'dijkstra',
    category: 'graphs',
    title: "Dijkstra's Shortest Path",
    shortDescription: 'Greedy single-source shortest path algorithm using a min-priority queue for non-negative weights.',
    detailedDescription: 'Maintains tentative distances from a source vertex initialized to infinity (0 for source). Repeatedly extracts the vertex with minimum tentative distance from a min-priority queue, finalizes its shortest path, and relaxes all outgoing edges. Strictly requires non-negative edge weights because finalized distances are assumed monotonic and optimal.',
    complexity: {
      timeComplexity: {
        best: '(V + E) log V',
        average: '(V + E) log V',
        worst: '(V + E) log V',
        description: 'Using a binary min-heap: O(V log V) to extract minimums and O(E log V) to insert or decrease keys.'
      },
      spaceComplexity: {
        worst: 'V',
        description: 'O(V) auxiliary space for the distance table, predecessor array, finalized set, and priority queue.'
      },
      whenUseful: 'GPS navigation, packet routing protocols (OSPF, IS-IS), and finding lowest-latency communication paths.'
    }
  },
  'bellman-ford': {
    id: 'bellman-ford',
    category: 'graphs',
    title: 'Bellman–Ford Algorithm',
    shortDescription: 'Single-source shortest path algorithm supporting negative edge weights and detecting negative cycles.',
    detailedDescription: 'Relaxes all edges in the graph V - 1 times. Since a simple path contains at most V - 1 edges, all shortest paths are guaranteed to stabilize within V - 1 passes. Includes early-exit optimization if a pass produces zero updates. Performs a final V-th pass to detect reachable negative-weight cycles if any edge can still be relaxed.',
    complexity: {
      timeComplexity: {
        best: 'E',
        average: 'V · E',
        worst: 'V · E',
        description: 'Best-case O(E) when distances stabilize in pass 1 (early termination). Worst-case O(V · E) over V - 1 complete edge passes.'
      },
      spaceComplexity: {
        worst: 'V',
        description: 'O(V) auxiliary space for distances and predecessor arrays.'
      },
      whenUseful: 'Networks with negative edge weights, currency arbitrage detection in financial markets, and Distance Vector Routing (RIP).'
    }
  },
  'floyd-warshall': {
    id: 'floyd-warshall',
    category: 'graphs',
    title: 'Floyd–Warshall Algorithm',
    shortDescription: 'Dynamic programming all-pairs shortest path algorithm evaluating all intermediate vertex detours.',
    detailedDescription: 'Computes shortest paths between all pairs of vertices via 3 nested loops: k (intermediate vertex detour), i (source), and j (destination). Evaluates whether dist[i][k] + dist[k][j] < dist[i][j]. Detects negative cycles if any diagonal element dist[i][i] becomes negative. Reconstructs arbitrary paths using a predecessor/next-hop matrix.',
    complexity: {
      timeComplexity: {
        best: 'V³',
        average: 'V³',
        worst: 'V³',
        description: 'Triple nested loop iterating through all triples (k, i, j) in exactly V³ steps.'
      },
      spaceComplexity: {
        worst: 'V²',
        description: 'O(V²) space for distance and predecessor next-hop matrices.'
      },
      whenUseful: 'All-pairs path computation for dense or small graphs, transitive closure calculation, and all-pairs network delay matrices.'
    }
  },

  // ── Recursion ──────────────────────────────────────────────────────────────
  'factorial': {
    id: 'factorial',
    category: 'recursion',
    title: 'Factorial',
    shortDescription: 'Computes n! by calling factorial(n-1) recursively until the base case n ≤ 1.',
    detailedDescription: 'Each call pushes a new stack frame containing n. The base case returns 1. As each frame returns, it multiplies its n value by the result from factorial(n-1). Stack unwinds in reverse order, performing n multiplications.',
    defaultArray: [5],
    defaultTarget: 5,
    complexity: {
      timeComplexity: {
        best: 'n',
        average: 'n',
        worst: 'n',
        description: 'Exactly n recursive calls. Each call does O(1) work (multiply and return). Total: O(n).'
      },
      spaceComplexity: {
        worst: 'n',
        description: 'The call stack grows to depth n before the base case is hit. O(n) stack space.'
      },
      whenUseful: 'Teaching recursion fundamentals. In practice, factorial is computed iteratively or using lookup tables.'
    }
  },

  'fibonacci': {
    id: 'fibonacci',
    category: 'recursion',
    title: 'Fibonacci (Naive Recursion)',
    shortDescription: 'Computes fib(n) = fib(n-1) + fib(n-2) without memoization.',
    detailedDescription: 'Each call spawns two recursive sub-calls unless n ≤ 1. Without memoization, many subproblems are recomputed. fib(n) generates approximately 2^n total calls. Maximum call-stack depth is n (the left-most spine).',
    defaultArray: [6],
    defaultTarget: 6,
    complexity: {
      timeComplexity: {
        best: '1',
        average: '2^n',
        worst: '2^n',
        description: 'Each call spawns two sub-calls, producing an exponential call tree. More precisely Θ(φⁿ) where φ ≈ 1.618. Limit n ≤ 15 for safe visualization.'
      },
      spaceComplexity: {
        worst: 'n',
        description: 'The deepest simultaneous call stack has depth n (the left-most spine fib(n) → fib(n-1) → … → fib(0)). O(n) stack frames at any one time.'
      },
      whenUseful: 'Demonstrates the cost of overlapping subproblems without memoization and motivates dynamic programming.'
    }
  },

  'tower-of-hanoi': {
    id: 'tower-of-hanoi',
    category: 'recursion',
    title: 'Tower of Hanoi',
    shortDescription: 'Moves n disks from source to destination peg using 2ⁿ − 1 recursive moves.',
    detailedDescription: 'The algorithm moves the top n-1 disks to the auxiliary peg, moves the nth disk directly to the destination, then moves n-1 disks from auxiliary to destination. No larger disk is ever placed on a smaller disk.',
    defaultArray: [3],
    defaultTarget: 3,
    complexity: {
      timeComplexity: {
        best: '2^n - 1',
        average: '2^n - 1',
        worst: '2^n - 1',
        description: 'Exactly 2ⁿ − 1 disk moves are required. No algorithm can solve it in fewer moves. This is provably optimal.'
      },
      spaceComplexity: {
        worst: 'n',
        description: 'Recursion depth is n. O(n) stack frames exist simultaneously at the deepest point.'
      },
      whenUseful: 'Classic demonstration of divide-and-conquer recursion and proof that exponential problems can still have clean recursive solutions.'
    }
  },

  'maze': {
    id: 'maze',
    category: 'backtracking',
    title: 'Maze Solver (Backtracking DFS)',
    shortDescription: 'DFS through an R×C grid marking visited cells and backtracking on dead ends.',
    detailedDescription: 'The solver recurses into each of 4 neighbours (Down, Right, Up, Left) in order. Cells are marked visited when entered and unmarked during backtracking. The search terminates when the goal cell is reached or all paths are exhausted.',
    defaultArray: [],
    defaultTarget: 0,
    complexity: {
      timeComplexity: {
        best: 'R + C',
        average: 'R * C',
        worst: 'R * C',
        description: 'In the worst case every reachable cell is visited once and backtracked once. Total states explored is O(R·C) for an R×C grid. Best case is a direct path of length R+C.'
      },
      spaceComplexity: {
        worst: 'R * C',
        description: 'The recursion stack can grow up to R·C deep if the maze has a spiral-shaped longest path. The visited grid requires O(R·C) space.'
      },
      whenUseful: 'Maze generation and solving, path finding on sparse grids, reachability analysis, flood fill algorithms.'
    }
  },

  'n-queens': {
    id: 'n-queens',
    category: 'backtracking',
    title: 'N-Queens (Backtracking)',
    shortDescription: 'Places N queens on an N×N board with no two queens attacking each other.',
    detailedDescription: 'Processes rows one by one. For each row, tries each column. A position is valid if no existing queen shares the column or either diagonal. Invalid positions are skipped (pruned). When a row has no valid column, the algorithm backtracks to the previous row and removes the queen there.',
    defaultArray: [6],
    defaultTarget: 6,
    complexity: {
      timeComplexity: {
        best: 'N',
        average: 'N!',
        worst: 'N!',
        description: 'Worst case explores N! placements. Column and diagonal tracking prune many branches early in practice. The actual number of nodes explored is much smaller than N! for most N.'
      },
      spaceComplexity: {
        worst: 'N',
        description: 'O(N) for the board array and O(N) for the column and diagonal boolean arrays. Recursion depth is at most N. Total O(N) auxiliary space.'
      },
      whenUseful: 'Classic constraint-satisfaction and backtracking benchmark. Generalizes to placement problems in scheduling, circuit layout, and combinatorics.'
    }
  }
};
