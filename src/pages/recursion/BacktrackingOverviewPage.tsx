import React from 'react';
import { Link } from 'react-router-dom';
import { VisualizerLayout } from '../../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../../components/workspace/TopicBreadcrumbs';
import { ArrowRight, Cpu, GitBranch, RotateCcw } from 'lucide-react';

const BACKTRACKING_ALGORITHMS = [
  {
    id: 'maze',
    route: '/visualizer/backtracking/maze',
    title: 'Maze Solver',
    icon: '🌀',
    description: 'Recursive DFS through a grid. Visit, mark, explore 4 directions, backtrack on dead ends.',
    time: 'O(R·C)', space: 'O(R·C)',
    color: 'from-amber-600 to-orange-800',
    border: 'border-amber-700/50',
  },
  {
    id: 'n-queens',
    route: '/visualizer/backtracking/n-queens',
    title: 'N-Queens',
    icon: '♛',
    description: 'Place N queens on an N×N board with no two queens attacking each other.',
    time: 'O(N!)', space: 'O(N)',
    color: 'from-violet-600 to-purple-900',
    border: 'border-violet-700/50',
  },
];

export const BacktrackingOverviewPage: React.FC = () => (
  <VisualizerLayout activeTitle="Backtracking Overview">
    <div className="space-y-8 max-w-6xl mx-auto text-slate-900 pb-12">
      <TopicBreadcrumbs
        categoryName="Backtracking"
        categoryRoute="/visualizer/backtracking"
        subtopicName="Overview"
      />
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-950 via-slate-900 to-violet-950 border border-rose-800/40 p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-start gap-6">
          <div className="p-4 rounded-2xl bg-rose-600/30 border border-rose-500/40 shrink-0">
            <RotateCcw className="w-10 h-10 text-rose-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Backtracking Visualizer</h1>
            <p className="text-slate-300 leading-relaxed max-w-2xl">
              All algorithms execute in <strong className="text-rose-300">native C++</strong>. Every explore,
              reject, place, remove, and backtrack event comes from actual C++ trace emission — not TypeScript simulation.
              Watch constraint-based search in real time.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> Native C++ Execution
              </span>
              <span className="px-3 py-1.5 rounded-full bg-rose-900/50 border border-rose-700 text-rose-300 flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" /> Backtrack Visualization
              </span>
              <span className="px-3 py-1.5 rounded-full bg-violet-900/50 border border-violet-700 text-violet-300 flex items-center gap-1.5">
                <GitBranch className="w-3 h-3" /> Decision Tree Tracing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {BACKTRACKING_ALGORITHMS.map(alg => (
          <Link key={alg.id} to={alg.route} className="group block">
            <div className={`relative overflow-hidden rounded-2xl border ${alg.border} bg-slate-900/80 hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 p-6 space-y-4`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${alg.color} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {alg.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-100 mb-1">{alg.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{alg.description}</p>
              </div>
              <div className="flex gap-3 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Time: {alg.time}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">Space: {alg.space}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-rose-400 group-hover:text-rose-300 font-semibold">
                Visualize <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Concept */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-slate-100">How Backtracking Works</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Backtracking is an incremental constraint-satisfaction technique. At each step:
          </p>
          <ol className="text-sm text-slate-400 space-y-1 list-decimal list-inside">
            <li><span className="text-cyan-400 font-semibold">Choose</span> — pick a candidate from available options</li>
            <li><span className="text-emerald-400 font-semibold">Constraint</span> — check whether the choice is valid</li>
            <li><span className="text-indigo-400 font-semibold">Goal</span> — if all choices are made, record the solution</li>
            <li><span className="text-rose-400 font-semibold">Backtrack</span> — undo last choice and try the next candidate</li>
          </ol>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-slate-100">Difference from Brute Force</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Unlike exhaustive search, backtracking <span className="text-rose-400 font-semibold">prunes branches early</span> — as soon
            as a partial solution violates a constraint, the entire subtree is discarded without being explored.
            This makes it far faster in practice, even though worst-case complexity remains exponential.
          </p>
        </div>
      </div>
    </div>
  </VisualizerLayout>
);
