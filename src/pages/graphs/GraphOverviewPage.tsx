import React from 'react';
import { Link } from 'react-router-dom';
import { VisualizerLayout } from '../../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../../components/workspace/TopicBreadcrumbs';
import { 
  Share2, ArrowRight, GitFork, Compass, Zap, 
  Route, ShieldAlert, Cpu, Sparkles 
} from 'lucide-react';

const GRAPH_ALGORITHMS = [
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    route: '/visualizer/graphs/bfs',
    badge: 'O(V + E)',
    category: 'Traversal & Unweighted Shortest Path',
    icon: Compass,
    color: 'from-blue-500/10 to-indigo-500/10 text-indigo-400 border-indigo-500/20',
    description: 'Level-by-level exploration using a FIFO queue. Computes minimum edge-hop distances and shortest paths in unweighted graphs.'
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    route: '/visualizer/graphs/dfs',
    badge: 'O(V + E)',
    category: 'Traversal & Backtracking',
    icon: GitFork,
    color: 'from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20',
    description: 'Deep exploration along branches with backtracking. Computes discovery and finish timestamps, cycle detection, and topological ordering.'
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    route: '/visualizer/graphs/dijkstra',
    badge: 'O((V + E) log V)',
    category: 'Single-Source Shortest Path (Non-Negative)',
    icon: Zap,
    color: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20',
    description: 'Greedy shortest path algorithm using a min-priority queue. Progressively finalizes minimum distances for graphs with non-negative edge weights.'
  },
  {
    id: 'bellman-ford',
    name: 'Bellman–Ford Algorithm',
    route: '/visualizer/graphs/bellman-ford',
    badge: 'O(V · E)',
    category: 'Single-Source Shortest Path (Negative Weights)',
    icon: ShieldAlert,
    color: 'from-rose-500/10 to-red-500/10 text-rose-400 border-rose-500/20',
    description: 'Dynamic programming relaxation over V - 1 passes. Supports negative weights and detects reachable negative-weight cycles.'
  },
  {
    id: 'floyd-warshall',
    name: 'Floyd–Warshall Algorithm',
    route: '/visualizer/graphs/floyd-warshall',
    badge: 'O(V³)',
    category: 'All-Pairs Shortest Path Matrix',
    icon: Route,
    color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Computes shortest path distances between all pairs of vertices via 3 nested loops evaluating intermediate vertex detours.'
  }
];

export const GraphOverviewPage: React.FC = () => {
  return (
    <VisualizerLayout activeTitle="Graph Algorithms Overview">
      <div className="space-y-8 max-w-6xl mx-auto text-slate-900 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="space-y-2 border-b border-slate-200 pb-5">
          <TopicBreadcrumbs
            categoryName="Graph Algorithms"
            categoryRoute="/visualizer/graphs"
            subtopicName="Overview & Fundamentals"
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <Share2 className="w-8 h-8 text-indigo-600" />
                <span>Graph Algorithms Visualizer</span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>C++ Single Source of Truth</span>
                </span>
              </h1>
              <p className="text-sm text-slate-600 pt-2 max-w-3xl leading-relaxed">
                Explore fundamental graph representations and shortest-path algorithms. All graph executions, queue operations, priority heap extractions, and trace events originate directly from actual C++ binary executions.
              </p>
            </div>
          </div>
        </div>

        {/* Graph Fundamentals Educational Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-100 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Vertices & Edges</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A graph <code className="font-mono text-indigo-600 font-bold">G = (V, E)</code> consists of a set of vertices <code className="font-mono text-indigo-600 font-bold">V</code> connected by edges <code className="font-mono text-indigo-600 font-bold">E</code>. Edges may be directed or undirected, and weighted or unweighted.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50/60 to-white border border-cyan-100 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Adjacency List vs Matrix</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Adjacency lists use <code className="font-mono text-cyan-700 font-bold">O(V + E)</code> memory and excel for sparse networks. Adjacency matrices use <code className="font-mono text-cyan-700 font-bold">O(V²)</code> memory and offer <code className="font-mono text-cyan-700 font-bold">O(1)</code> edge lookups.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white border border-emerald-100 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Deterministic C++ Tracing</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every step explanation, queue snapshot, and active source line highlight is generated directly by instrumented C++ code in <code className="font-mono text-emerald-700 font-bold">array_tracer.exe</code>.
            </p>
          </div>
        </div>

        {/* Algorithm Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Choose an Algorithm to Visualize</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {GRAPH_ALGORITHMS.map((algo) => {
              const IconComponent = algo.icon;
              return (
                <div
                  key={algo.id}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${algo.color} border`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold border border-slate-200">
                        {algo.badge}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {algo.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {algo.name}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {algo.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-slate-100">
                    <Link
                      to={algo.route}
                      className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all group-hover:shadow-md"
                    >
                      <span>Open Visualizer</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </VisualizerLayout>
  );
};
