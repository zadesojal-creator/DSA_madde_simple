import React from 'react';
import { Code2, Terminal } from 'lucide-react';

interface PseudocodePanelProps {
  lines: string[];
  activeLine?: number; // 1-based index
  title?: string;
  language?: string;
}

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({
  lines,
  activeLine,
  title = "Algorithm Source Code",
  language = "C++ (ISO C++11/14)"
}) => {
  // Syntax highlighter for C++ tokens
  const renderHighlightedCppLine = (text: string) => {
    // Check for comment
    const commentIdx = text.indexOf('//');
    if (commentIdx !== -1) {
      const codePart = text.substring(0, commentIdx);
      const commentPart = text.substring(commentIdx);
      return (
        <>
          {renderTokens(codePart)}
          <span className="text-slate-500 italic">{commentPart}</span>
        </>
      );
    }
    return renderTokens(text);
  };

  const renderTokens = (code: string) => {
    // Check for preprocessor
    if (code.trim().startsWith('#include')) {
      const parts = code.split(/(<[^>]+>)/g);
      return parts.map((part, i) => {
        if (part.startsWith('<') && part.endsWith('>')) {
          return <span key={i} className="text-emerald-400 font-semibold">{part}</span>;
        }
        return <span key={i} className="text-rose-400 font-bold">{part}</span>;
      });
    }

    // Tokenizer regex for keywords, types, strings, numbers
    const tokenRegex = /(\b(?:int|void|bool|const|return|for|while|if|else|using|namespace|static_cast)\b|\b(?:vector|cout|cin|std|size|push_back|pop_back|begin|erase|insert)\b|".*?"|'.*?'|\b\d+\b|[{}();,]|==|<=|>=|!=|<|>|\+|-|\*|\/|=)/g;
    const segments = code.split(tokenRegex);

    return segments.map((seg, idx) => {
      if (!seg) return null;

      // Keywords
      if (/^(int|void|bool|const|return|for|while|if|else|using|namespace|static_cast)$/.test(seg)) {
        return <span key={idx} className="text-purple-400 font-bold">{seg}</span>;
      }
      // Standard library & methods
      if (/^(vector|cout|cin|std|size|push_back|pop_back|begin|erase|insert)$/.test(seg)) {
        return <span key={idx} className="text-cyan-400 font-semibold">{seg}</span>;
      }
      // Strings & chars
      if (/^(".*?"|'.*?')$/.test(seg)) {
        return <span key={idx} className="text-amber-300">{seg}</span>;
      }
      // Numbers
      if (/^\d+$/.test(seg)) {
        return <span key={idx} className="text-emerald-300 font-mono">{seg}</span>;
      }
      // Operators
      if (/^(==|<=|>=|!=|<|>|\+|-|\*|\/|=)$/.test(seg)) {
        return <span key={idx} className="text-pink-400">{seg}</span>;
      }
      return <span key={idx} className="text-slate-200">{seg}</span>;
    });
  };

  return (
    <div className="rounded-2xl bg-[#070b19] border border-slate-800 p-5 space-y-4 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {title}
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/50">
          <Terminal className="w-3 h-3 text-indigo-400" />
          <span>{language}</span>
        </div>
      </div>

      {/* Code Container */}
      <div 
        tabIndex={0}
        aria-label="C++ source code viewer"
        className="font-mono text-xs text-slate-300 space-y-0.5 overflow-x-auto rounded-xl bg-slate-950/90 p-3.5 border border-slate-800/80 custom-scrollbar focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
      >
        {lines.map((codeText, index) => {
          const lineNumber = index + 1;
          const isActive = lineNumber === activeLine;

          return (
            <div
              key={index}
              className={`flex items-center justify-between px-2.5 py-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/30 text-white font-semibold border-l-4 border-indigo-400 shadow-md ring-1 ring-indigo-500/30'
                  : 'hover:bg-slate-900/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 text-right font-mono text-xs select-none shrink-0 ${isActive ? 'text-indigo-300 font-bold' : 'text-slate-600'}`}>
                  {lineNumber}
                </span>
                <span className="whitespace-pre">
                  {renderHighlightedCppLine(codeText)}
                </span>
              </div>

              {isActive && (
                <span className="text-[10px] font-mono text-indigo-200 bg-indigo-500/30 px-2 py-0.5 rounded-md border border-indigo-400/40 shrink-0 ml-3 shadow-xs">
                  Executing L{lineNumber}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
        <span>Source-line synchronized trace</span>
        <span>Active line matches C++ event</span>
      </div>

    </div>
  );
};
