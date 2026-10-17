import React from 'react';
import { Link } from 'react-router-dom';
import { VisualizerLayout } from '../../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../../components/workspace/TopicBreadcrumbs';
import { GitBranch, ArrowRight, Layers, RefreshCw, Cpu } from 'lucide-react';

const RECURSION_ALGORITHMS = [
  {
    id: 'factorial',
    route: '/visualizer/recursion/factorial',
    title: 'Factorial',
    icon: '!',
    description: 'Compute n! recursively with C++ call-stack and return-value visualization.',
    time: 'O(n)', space: 'O(n)',
    badge: 'C++ Engine',
    color: 'from-indigo-600 to-indigo-800',
    border: 'border-indigo-700/50',
  },
  {
    id: 'fibonacci',
    route: '/visualizer/recursion/fibonacci',
    title: 'Fibonacci (Naive)',
    icon: 'φ',
    description: 'Trace the exponential recursive call tree of fib(n) with repeated subproblem counting.',
    time: 'O(2ⁿ)', space: 'O(n)',
    badge: 'C++ Engine',
    color: 'from-purple-600 to-purple-800',
    border: 'border-purple-700/50',
  },
  {
    id: 'tower-of-hanoi',
    route: '/visualizer/recursion/tower-of-hanoi',
    title: 'Tower of Hanoi',
    icon: '⊥',
    description: 'Visualize 2ⁿ − 1 disk moves across three pegs with live peg-state animation.',
    time: 'O(2ⁿ)', space: 'O(n)',
    badge: 'C++ Engine',
    color: 'from-teal-600 to-teal-800',
    border: 'border-teal-700/50',
  },
];

export const RecursionOverviewPage: React.FC = () => (
  <VisualizerLayout activeTitle="Recursion Overview">
    <div className="space-y-8 max-w-6xl mx-auto text-slate-900 pb-12">
      <TopicBreadcrumbs
        categoryName="Recursion"
        categoryRoute="/visualizer/recursion"
        subtopicName="Overview"
      />
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/40 p-8 shadow-2xl">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex items-start gap-6">
          <div className="p-4 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 shrink-0">
            <RefreshCw className="w-10 h-10 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white mb-2">Recursion Visualizer</h1>
            <p className="text-slate-300 leading-relaxed max-w-2xl">
              Every algorithm on this page is implemented and executed in <strong className="text-indigo-300">native C++</strong>.
              The call stack, recursion depth, local variables, and return values are captured from actual C++ execution —
              not simulated in TypeScript.
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700 text-emerald-300 flex items-center gap-1.5">
                <Cpu className="w-3 h-3" /> Native C++ Execution
              </span>
              <span className="px-3 py-1.5 rounded-full bg-indigo-900/50 border border-indigo-700 text-indigo-300 flex items-center gap-1.5">
                <Layers className="w-3 h-3" /> Call Stack Visualization
              </span>
              <span className="px-3 py-1.5 rounded-full bg-purple-900/50 border border-purple-700 text-purple-300 flex items-center gap-1.5">
                <GitBranch className="w-3 h-3" /> Recursion Tree Tracing
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Algorithm cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {RECURSION_ALGORITHMS.map(alg => (
          <Link key={alg.id} to={alg.route} className="group block">
            <div className={`relative overflow-hidden rounded-2xl border ${alg.border} bg-slate-900/80 hover:bg-slate-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 p-6 space-y-4`}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${alg.color} flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                {alg.icon}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-100">{alg.title}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-300 font-bold">{alg.badge}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{alg.description}</p>
              </div>
              <div className="flex gap-3 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Time: {alg.time}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">Space: {alg.space}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-400 group-hover:text-indigo-300 font-semibold">
                Visualize <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Concept section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-slate-100">How Recursion Works</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            A recursive function calls itself with a smaller subproblem. Each call creates a new stack frame
            storing local variables and a return address. When the <span className="text-emerald-400 font-semibold">base case</span> is
            reached, frames unwind in reverse order, combining results during the return phase.
          </p>
          <div className="font-mono text-xs bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-slate-300">
            <span className="text-indigo-400">factorial</span>(n):<br />
            {'  '}→ <span className="text-amber-300">if n ≤ 1</span>: return 1 <span className="text-slate-500">{/* base case */}</span><br />
            {'  '}→ return n × <span className="text-indigo-400">factorial</span>(n−1) <span className="text-slate-500">{/* recurse */}</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h2 className="font-bold text-slate-100">Key Concepts</h2>
          <ul className="text-sm text-slate-400 space-y-2">
            {[
              ['Base Case', 'Condition that stops recursion without a self-call'],
              ['Recursive Case', 'Reduces the problem and recurses on a smaller input'],
              ['Call Stack', 'LIFO stack of active frames — grows on call, shrinks on return'],
              ['Stack Depth', 'Maximum depth before hitting the base case = O(n) space'],
            ].map(([term, def]) => (
              <li key={term} className="flex gap-2">
                <span className="text-indigo-400 font-semibold shrink-0">{term}:</span>
                <span>{def}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </VisualizerLayout>
);
