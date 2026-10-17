export interface TopicCategory {
  id: string;
  category: string;
  route: string;
  description: string;
  iconName: string;
  topics: string[];
  gradient: string;
  accentColor: string;
}

export const TOPIC_CATEGORIES: TopicCategory[] = [
  {
    id: "arrays",
    category: "Fundamentals & Arrays",
    route: "/visualizer/arrays/traversal",
    description: "Explore indexed storage, array access, updates, insertion, deletion, and traversal.",
    iconName: "LayoutGrid",
    topics: ["Arrays", "Array Traversal", "Insertion", "Linear Search"],
    gradient: "from-blue-500/10 to-indigo-500/10",
    accentColor: "text-blue-400"
  },
  {
    id: "linked-lists",
    category: "Linked Lists",
    route: "/visualizer/linked-lists/singly-linked-list",
    description: "Understand nodes, pointers, links, and cycle detection.",
    iconName: "GitCommit",
    topics: ["Singly Linked List", "Doubly Linked List", "Circular Linked Lists", "Floyd Cycle Detection"],
    gradient: "from-cyan-500/10 to-blue-500/10",
    accentColor: "text-cyan-400"
  },
  {
    id: "stacks-queues",
    category: "Stacks & Queues",
    route: "/visualizer/stacks-queues/stack-operations",
    description: "Learn how elements enter and leave linear data structures.",
    iconName: "Layers",
    topics: ["Stack", "Queue", "Deque", "Priority Queue"],
    gradient: "from-violet-500/10 to-purple-500/10",
    accentColor: "text-violet-400"
  },
  {
    id: "searching-sorting",
    category: "Searching & Sorting",
    route: "/visualizer/sorting/bubble-sort",
    description: "Follow C++ algorithm execution with comparisons, swaps, search decisions, and sorted ranges.",
    iconName: "ArrowUpDown",
    topics: ["Linear Search", "Binary Search", "Bubble Sort", "Merge Sort", "Quick Sort"],
    gradient: "from-amber-500/10 to-orange-500/10",
    accentColor: "text-amber-400"
  },
  {
    id: "trees-heaps",
    category: "Trees & Heaps",
    route: "/visualizer/trees-heaps/tree-traversal",
    description: "Explore hierarchical structures, traversals, and heap properties.",
    iconName: "Network",
    topics: ["Binary Trees", "BST Traversals", "Min Heap", "Max Heap"],
    gradient: "from-emerald-500/10 to-teal-500/10",
    accentColor: "text-emerald-400"
  },
  {
    id: "graphs",
    category: "Graph Algorithms",
    route: "/visualizer/graphs",
    description: "Discover graph traversal and shortest-path reasoning implemented in C++.",
    iconName: "Share2",
    topics: ["BFS", "DFS", "Dijkstra", "Bellman-Ford", "Floyd-Warshall"],
    gradient: "from-indigo-500/10 to-violet-500/10",
    accentColor: "text-indigo-400"
  },
  {
    id: "recursion",
    category: "Recursion",
    route: "/visualizer/recursion/factorial",
    description: "See function calls, base cases, return values, and the call stack.",
    iconName: "Repeat",
    topics: ["Factorial", "Fibonacci", "Call Stack"],
    gradient: "from-fuchsia-500/10 to-pink-500/10",
    accentColor: "text-fuchsia-400"
  },
  {
    id: "patterns",
    category: "Problem-Solving Patterns",
    route: "/visualizer/patterns/two-pointers",
    description: "Understand reusable techniques through concrete algorithm problems.",
    iconName: "Sparkles",
    topics: ["Two Pointers", "Sliding Window", "Prefix Sums", "Fast & Slow Pointers"],
    gradient: "from-sky-500/10 to-blue-500/10",
    accentColor: "text-sky-400"
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Choose a Topic",
    description: "Select the data structure, algorithm, or problem pattern you want to understand."
  },
  {
    step: "02",
    title: "Run an Operation",
    description: "Provide the necessary inputs and execute the operation with validation."
  },
  {
    step: "03",
    title: "Follow Every Step",
    description: "Inspect the changing visualization, current step explanation, operation history, result, and complexity."
  }
];

export const PRODUCT_PRINCIPLES = [
  { label: "Interactive learning", icon: "MousePointerClick" },
  { label: "Trace-based visualizations", icon: "Activity" },
  { label: "Complexity insights", icon: "Gauge" },
  { label: "Beginner-friendly explanations", icon: "BookOpen" }
];

export const FEATURE_HIGHLIGHTS = [
  {
    title: "Step-by-Step Playback Controls",
    description: "Play, pause, step forward, step backward, or jump to any step in the algorithm's execution history.",
    icon: "PlayCircle"
  },
  {
    title: "Visual State Transformations",
    description: "Clear animated highlights for element comparisons, swaps, pointer movements, stack pops, and tree traversals.",
    icon: "Eye"
  },
  {
    title: "Synchronized Pseudocode Highlighting",
    description: "Watch the active code line highlight in real time as the underlying data structure state updates.",
    icon: "Code2"
  },
  {
    title: "Operation History & State Tracking",
    description: "Review past actions, input values, intermediate states, and final computed outcomes.",
    icon: "History"
  },
  {
    title: "Time & Space Complexity Insights",
    description: "See exact Big-O complexities for best, average, and worst-case scenarios alongside memory overhead.",
    icon: "TrendingUp"
  },
  {
    title: "Smart Input Validation",
    description: "Friendly error messages and boundary checks prevent invalid operations before execution.",
    icon: "ShieldAlert"
  },
  {
    title: "Customizable Animation & Motion",
    description: "Adjust playback speed to your preference, with full support for accessibility and reduced-motion settings.",
    icon: "Sliders"
  }
];
