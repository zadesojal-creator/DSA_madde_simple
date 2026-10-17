import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  LayoutGrid, 
  GitCommit, 
  Layers, 
  ArrowUpDown, 
  Network, 
  Share2, 
  Repeat, 
  Clock,
  Binary
} from 'lucide-react';
import { NAVIGATION_CATEGORIES } from '../../data/navigationData';
import type { NavigationCategory } from '../../data/navigationData';

const categoryIconMap: Record<string, React.ElementType> = {
  LayoutGrid,
  GitCommit,
  Layers,
  ArrowUpDown,
  Network,
  Share2,
  Repeat,
  Search,
  Binary
};

const VISIBLE_NAVIGATION_CATEGORIES = NAVIGATION_CATEGORIES
  .filter((category) => category.id !== 'patterns')
  .map((category) => category.id === 'stacks-queues'
    ? { ...category, subtopics: category.subtopics.filter((subtopic) => subtopic.id !== 'infix-postfix') }
    : category);

interface TopicSidebarProps {
  onSelectTopic?: () => void;
}

export const TopicSidebar: React.FC<TopicSidebarProps> = ({ onSelectTopic }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track open/collapsed categories
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    VISIBLE_NAVIGATION_CATEGORIES.forEach((cat) => {
      initialState[cat.id] = location.pathname.startsWith(cat.routePrefix);
    });
    if (!Object.values(initialState).some(Boolean)) {
      initialState['arrays'] = true;
    }
    return initialState;
  });

  useEffect(() => {
    VISIBLE_NAVIGATION_CATEGORIES.forEach((cat) => {
      if (location.pathname.startsWith(cat.routePrefix)) {
        setOpenCategories((prev) => ({ ...prev, [cat.id]: true }));
      }
    });
  }, [location.pathname]);

  const toggleCategory = (id: string) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = VISIBLE_NAVIGATION_CATEGORIES.map((cat) => {
    if (!searchQuery.trim()) return cat;

    const query = searchQuery.toLowerCase();
    const matchesCategory = cat.title.toLowerCase().includes(query);
    const matchingSubtopics = cat.subtopics.filter(
      (sub) => sub.title.toLowerCase().includes(query) || (sub.description && sub.description.toLowerCase().includes(query))
    );

    if (matchesCategory || matchingSubtopics.length > 0) {
      return {
        ...cat,
        subtopics: matchingSubtopics.length > 0 ? matchingSubtopics : cat.subtopics
      };
    }
    return null;
  }).filter(Boolean) as NavigationCategory[];

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r border-slate-200 select-none text-slate-900">
      
      {/* Sidebar Header & Search */}
      <div className="p-4 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            DSA Catalogue
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
            {VISIBLE_NAVIGATION_CATEGORIES.length} Modules
          </span>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>
      </div>

      {/* Categories & Subtopics List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500 font-mono">
            No matching topics found
          </div>
        ) : (
          filteredCategories.map((category) => {
            const IconComp = categoryIconMap[category.iconName] || LayoutGrid;
            const isOpen = Boolean(openCategories[category.id] || searchQuery.trim());

            return (
              <div key={category.id} className="rounded-xl overflow-hidden">
                {/* Category Header Button */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <IconComp className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{category.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="text-[10px] font-mono text-slate-500">{category.subtopics.length}</span>
                    {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {/* Subtopic Items */}
                {isOpen && (
                  <div className="ml-3 pl-3 border-l border-slate-200 my-1 space-y-0.5">
                    {category.subtopics.map((subtopic) => (
                      <NavLink
                        key={subtopic.id}
                        to={subtopic.route}
                        onClick={onSelectTopic}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2 truncate">
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                  isActive ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-slate-400'
                                }`}
                              />
                              <span className="truncate">{subtopic.title}</span>
                            </div>

                            {!subtopic.isImplemented && (
                              <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-1">
                                Soon
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info inside sidebar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between font-medium">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-indigo-600" />
          <span>Execution Engine v1.0</span>
        </span>
      </div>

    </aside>
  );
};
