export interface SubtopicItem {
  id: string;
  title: string;
  route: string;
  isImplemented?: boolean;
  badge?: string;
  description?: string;
}

export interface NavigationCategory {
  id: string;
  title: string;
  iconName: string;
  routePrefix: string;
  description: string;
  subtopics: SubtopicItem[];
}

export const NAVIGATION_CATEGORIES: NavigationCategory[] = [
  {
    id: "arrays",
    title: "Fundamentals & Arrays",
    iconName: "LayoutGrid",
    routePrefix: "/visualizer/arrays",
    description: "Indexed storage, traversal, insertion, deletion, and elementary searching.",
    subtopics: [
      {
        id: "array-basics",
        title: "Array Basics",
        route: "/visualizer/arrays/array-basics",
        isImplemented: true,
        badge: "Interactive",
        description: "Memory layout, indexing rules, and direct O(1) access."
      },
      {
        id: "traversal",
        title: "Array Traversal",
        route: "/visualizer/arrays/traversal",
        isImplemented: true,
        badge: "Interactive",
        description: "Step-by-step element inspection from start to end with index pointers."
      },
      {
        id: "access",
        title: "Access by Index",
        route: "/visualizer/arrays/access",
        isImplemented: true,
        badge: "Interactive",
        description: "Direct O(1) memory offset calculation and retrieval."
      },
      {
        id: "update",
        title: "Update an Element",
        route: "/visualizer/arrays/update",
        isImplemented: true,
        badge: "Interactive",
        description: "In-place element value overwrite by index in O(1) time."
      },
      {
        id: "insert",
        title: "Insert into Array",
        route: "/visualizer/arrays/insert",
        isImplemented: true,
        badge: "Interactive",
        description: "Shifting elements right to insert at start, middle, or end."
      },
      {
        id: "delete",
        title: "Delete from Array",
        route: "/visualizer/arrays/delete",
        isImplemented: true,
        badge: "Interactive",
        description: "Shifting elements left after removing an item by index."
      },
      {
        id: "linear-search",
        title: "Linear Search",
        route: "/visualizer/arrays/linear-search",
        isImplemented: true,
        badge: "Interactive",
        description: "Sequential search comparing each element against a target value."
      },
      {
        id: "binary-search",
        title: "Binary Search",
        route: "/visualizer/arrays/binary-search",
        isImplemented: true,
        badge: "Interactive",
        description: "Divide-and-conquer search on sorted arrays using low, mid, and high pointers."
      }
    ]
  },
  {
    id: "linked-lists",
    title: "Linked Lists",
    iconName: "GitCommit",
    routePrefix: "/visualizer/linked-lists",
    description: "Node structures, pointer chains, link manipulation, and traversal.",
    subtopics: [
      {
        id: "singly",
        title: "Singly Linked List",
        route: "/visualizer/linked-lists/singly",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Nodes with value and next pointer."
      },
      {
        id: "doubly",
        title: "Doubly Linked List",
        route: "/visualizer/linked-lists/doubly",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Nodes with prev, next, and value pointers."
      },
      {
        id: "circular",
        title: "Circular Linked List",
        route: "/visualizer/linked-lists/circular",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Tail node connecting back to the head node."
      },
    ]
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    iconName: "Layers",
    routePrefix: "/visualizer/stacks-queues",
    description: "LIFO stack and FIFO queue linear structures.",
    subtopics: [
      {
        id: "stack-operations",
        title: "Stack Operations",
        route: "/visualizer/stacks-queues/stack-intro",
        isImplemented: true,
        badge: "C++ Engine",
        description: "LIFO push, pop, and top pointer updates."
      },
      {
        id: "queue",
        title: "Queue Operations",
        route: "/visualizer/stacks-queues/queue",
        isImplemented: true,
        badge: "C++ Engine",
        description: "FIFO enqueue and dequeue with front and rear pointers."
      },
      {
        id: "circular-queue",
        title: "Circular Queue",
        route: "/visualizer/stacks-queues/circular-queue",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Fixed ring buffer using modulo indexing."
      },
      {
        id: "deque",
        title: "Deque",
        route: "/visualizer/stacks-queues/deque",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Double-ended queue operations at both head and tail."
      },
      {
        id: "infix-postfix",
        title: "Infix to Postfix",
        route: "/visualizer/stacks-queues/infix-postfix",
        description: "Operator stack precedence rules for expression parsing."
      },
      {
        id: "balanced-parentheses",
        title: "Balanced Parentheses",
        route: "/visualizer/stacks-queues/balanced-parentheses",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Matching open and close brackets using a stack."
      }
    ]
  },
  {
    id: "searching",
    title: "Searching",
    iconName: "Search",
    routePrefix: "/visualizer/searching",
    description: "Linear and binary search algorithms implemented and executed in C++.",
    subtopics: [
      {
        id: "linear-search",
        title: "Linear Search",
        route: "/visualizer/searching/linear-search",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Checking items sequentially from index 0 with comparison counts."
      },
      {
        id: "binary-search",
        title: "Binary Search",
        route: "/visualizer/searching/binary-search",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Divide-and-conquer search on sorted arrays using low, mid, and high pointers."
      }
    ]
  },
  {
    id: "sorting",
    title: "Sorting",
    iconName: "ArrowUpDown",
    routePrefix: "/visualizer/sorting",
    description: "Comparison-based sorting algorithms implemented and traced in C++.",
    subtopics: [
      {
        id: "bubble-sort",
        title: "Bubble Sort",
        route: "/visualizer/sorting/bubble-sort",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Repeated adjacent swaps pushing maximum elements to the end with early exit."
      },
      {
        id: "selection-sort",
        title: "Selection Sort",
        route: "/visualizer/sorting/selection-sort",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Finding minimum item in unsorted suffix and swapping to current slot."
      },
      {
        id: "insertion-sort",
        title: "Insertion Sort",
        route: "/visualizer/sorting/insertion-sort",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Building sorted prefix by shifting larger elements right and inserting key."
      },
      {
        id: "merge-sort",
        title: "Merge Sort",
        route: "/visualizer/sorting/merge-sort",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Divide-and-conquer recursive partitioning and two-way merge."
      },
      {
        id: "quick-sort",
        title: "Quick Sort",
        route: "/visualizer/sorting/quick-sort",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Lomuto partitioning scheme with pivot selection and recursive ranges."
      }
    ]
  },
  {
    id: "trees",
    title: "Trees",
    iconName: "Network",
    routePrefix: "/visualizer/trees",
    description: "Hierarchical dynamic node structures, traversals, and binary search trees.",
    subtopics: [
      {
        id: "binary-tree",
        title: "Binary Tree",
        route: "/visualizer/trees/binary-tree",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Dynamic C++ nodes, level-order construction, search, count, height, and leaves."
      },
      {
        id: "traversals",
        title: "Tree Traversals",
        route: "/visualizer/trees/traversals",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Preorder, Inorder, Postorder, and Queue-based Level-order traversals."
      },
      {
        id: "binary-search-tree",
        title: "Binary Search Tree",
        route: "/visualizer/trees/binary-search-tree",
        isImplemented: true,
        badge: "C++ Engine",
        description: "BST invariant (Left < Node < Right), 3-case deletion, min/max, duplicate rejection."
      }
    ]
  },
  {
    id: "heaps",
    title: "Heaps",
    iconName: "Binary",
    routePrefix: "/visualizer/heaps",
    description: "Complete binary trees stored efficiently in arrays maintaining heap invariants.",
    subtopics: [
      {
        id: "min-heap",
        title: "Min-Heap",
        route: "/visualizer/heaps/min-heap",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Parent <= children. Bottom-up O(n) build, sift-up insert, and sift-down extract-min."
      },
      {
        id: "max-heap",
        title: "Max-Heap",
        route: "/visualizer/heaps/max-heap",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Parent >= children. Bottom-up O(n) build, sift-up insert, and sift-down extract-max."
      }
    ]
  },
  {
    id: "graphs",
    title: "Graph Algorithms",
    iconName: "Share2",
    routePrefix: "/visualizer/graphs",
    description: "Vertices, edges, traversal paths, single-source and all-pairs shortest distances in C++.",
    subtopics: [
      {
        id: "bfs",
        title: "Breadth-First Search (BFS)",
        route: "/visualizer/graphs/bfs",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Queue-based level-order traversal finding shortest hop paths in unweighted graphs."
      },
      {
        id: "dfs",
        title: "Depth-First Search (DFS)",
        route: "/visualizer/graphs/dfs",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Recursive branch traversal with discovery/finish timestamps and backtracking."
      },
      {
        id: "dijkstra",
        title: "Dijkstra's Algorithm",
        route: "/visualizer/graphs/dijkstra",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Min-priority queue single-source shortest paths for non-negative weights."
      },
      {
        id: "bellman-ford",
        title: "Bellman–Ford Algorithm",
        route: "/visualizer/graphs/bellman-ford",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Single-source shortest paths supporting negative weights and negative cycle detection."
      },
      {
        id: "floyd-warshall",
        title: "Floyd–Warshall Algorithm",
        route: "/visualizer/graphs/floyd-warshall",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Dynamic programming all-pairs shortest path matrix with intermediate vertex detours."
      }
    ]
  },
  {
    id: "recursion",
    title: "Recursion",
    iconName: "Repeat",
    routePrefix: "/visualizer/recursion",
    description: "Self-referential functions, base cases, and recursive call-stack visualization powered by C++.",
    subtopics: [
      {
        id: "factorial",
        title: "Factorial",
        route: "/visualizer/recursion/factorial",
        isImplemented: true,
        badge: "C++ Engine",
        description: "n! recursive call chain with multiplication unwinding and call-stack animation."
      },
      {
        id: "fibonacci",
        title: "Fibonacci (Naive)",
        route: "/visualizer/recursion/fibonacci",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Exponential call tree: fib(n-1)+fib(n-2) with repeated-subproblem counting."
      },
      {
        id: "tower-of-hanoi",
        title: "Tower of Hanoi",
        route: "/visualizer/recursion/tower-of-hanoi",
        isImplemented: true,
        badge: "C++ Engine",
        description: "2ⁿ−1 disk moves across 3 pegs with live peg-state animation."
      }
    ]
  },
  {
    id: "backtracking",
    title: "Backtracking",
    iconName: "RotateCcw",
    routePrefix: "/visualizer/backtracking",
    description: "Constraint-based search with incremental candidate building and pruning, executed in C++.",
    subtopics: [
      {
        id: "maze",
        title: "Maze Solver",
        route: "/visualizer/backtracking/maze",
        isImplemented: true,
        badge: "C++ Engine",
        description: "DFS maze solving with visited marking, 4-direction exploration, and backtracking."
      },
      {
        id: "n-queens",
        title: "N-Queens",
        route: "/visualizer/backtracking/n-queens",
        isImplemented: true,
        badge: "C++ Engine",
        description: "Place N queens on N×N board with column/diagonal conflict checking and queen removal."
      }
    ]
  },
  {
    id: "patterns",
    title: "Problem-Solving Patterns",
    iconName: "Sparkles",
    routePrefix: "/visualizer/patterns",
    description: "Reusable algorithmic patterns for competitive programming and interviews.",
    subtopics: [
      {
        id: "two-pointers",
        title: "Two Pointers",
        route: "/visualizer/patterns/two-pointers",
        description: "Left and right pointers converging from ends of array."
      },
      {
        id: "sliding-window",
        title: "Sliding Window",
        route: "/visualizer/patterns/sliding-window",
        description: "Fixed or dynamic window sliding across contiguous range."
      },
      {
        id: "prefix-sum",
        title: "Prefix Sum",
        route: "/visualizer/patterns/prefix-sum",
        description: "Precomputed cumulative sum array for O(1) range queries."
      },
      {
        id: "fast-slow-pointers",
        title: "Fast & Slow Pointers",
        route: "/visualizer/patterns/fast-slow-pointers",
        description: "Floyd's tortoise and hare algorithm for cycle detection."
      },
      {
        id: "binary-search-patterns",
        title: "Binary Search Patterns",
        route: "/visualizer/patterns/binary-search-patterns",
        description: "Binary search on monotonic answer spaces."
      },
      {
        id: "backtracking-basics",
        title: "Backtracking Basics",
        route: "/visualizer/patterns/backtracking-basics",
        description: "State space tree traversal with choice, constraint, and goal."
      }
    ]
  }
];
