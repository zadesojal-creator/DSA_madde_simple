import React, { useState } from 'react';
import { VisualizerHeader } from './VisualizerHeader';
import { TopicSidebar } from './TopicSidebar';
import { X, Keyboard, Play, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface VisualizerLayoutProps {
  children: React.ReactNode;
  activeTitle?: string;
}

export const VisualizerLayout: React.FC<VisualizerLayoutProps> = ({ children, activeTitle }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Application Header */}
      <VisualizerHeader
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        title={activeTitle}
        onOpenHelp={() => setHelpModalOpen(true)}
      />

      {/* Main Shell Container */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative overflow-hidden">
        
        {/* Desktop Left Navigation Sidebar */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-[57px] h-[calc(100vh-57px)]">
          <TopicSidebar />
        </div>

        {/* Mobile Collapsible Navigation Drawer Overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />

            {/* Slide-over Panel */}
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900">Topic Navigation</span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <TopicSidebar onSelectTopic={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Main Visualization Content Workspace */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {children}
        </main>

      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Keyboard className="w-5 h-5 text-indigo-600" />
                <span>Keyboard Controls</span>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-700">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex items-center gap-2 font-sans font-medium text-slate-800">
                  <Play className="w-4 h-4 text-indigo-600" /> Toggle Play / Pause
                </span>
                <kbd className="px-2 py-1 bg-white rounded-lg text-indigo-700 border border-slate-200 font-bold shadow-xs">Space</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex items-center gap-2 font-sans font-medium text-slate-800">
                  <SkipForward className="w-4 h-4 text-indigo-600" /> Step Forward
                </span>
                <kbd className="px-2 py-1 bg-white rounded-lg text-indigo-700 border border-slate-200 font-bold shadow-xs">Right Arrow →</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex items-center gap-2 font-sans font-medium text-slate-800">
                  <SkipBack className="w-4 h-4 text-indigo-600" /> Step Backward
                </span>
                <kbd className="px-2 py-1 bg-white rounded-lg text-indigo-700 border border-slate-200 font-bold shadow-xs">Left Arrow ←</kbd>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="flex items-center gap-2 font-sans font-medium text-slate-800">
                  <RotateCcw className="w-4 h-4 text-indigo-600" /> Reset Trace
                </span>
                <kbd className="px-2 py-1 bg-white rounded-lg text-indigo-700 border border-slate-200 font-bold shadow-xs">R Key</kbd>
              </div>
            </div>

            <button
              onClick={() => setHelpModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
