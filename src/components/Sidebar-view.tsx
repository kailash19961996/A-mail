import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface SidebarViewItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

export interface SidebarViewGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: SidebarViewItem[];
}

interface SidebarViewProps {
  isCollapsed: boolean;
  onToggle: () => void;
  groups: SidebarViewGroup[];
  footer?: React.ReactNode;
}

const SidebarView: React.FC<SidebarViewProps> = ({ isCollapsed, onToggle, groups, footer }) => {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionKey: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey);
    } else {
      newCollapsed.add(sectionKey);
    }
    setCollapsedSections(newCollapsed);
  };

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-60'} glass-card rounded-2xl text-gray-800 h-full shadow-2xl border border-white/20`}>
      <div className="flex flex-col h-full">
        {/* Top bar with toggle placed at the right */}
        <div className="px-2 pt-2 pb-1 flex items-center justify-end">
          <button
            onClick={onToggle}
            className="p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all duration-200"
            aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <div className="border-b border-white/30 mx-2 mb-2"></div>
        
        <nav className="flex-1 px-3 pt-1 pb-2 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-white/40">
                    <span className="text-xs font-bold text-gray-700 tracking-wide">{group.label}</span>
                  </div>
                  <button
                    onClick={() => toggleSection(group.key)}
                    className="p-0.5 transition-colors text-gray-500 hover:text-gray-700"
                    aria-label={collapsedSections.has(group.key) ? 'Expand section' : 'Collapse section'}
                  >
                    {collapsedSections.has(group.key) ? 
                      <ChevronDown className="h-3 w-3" /> : 
                      <ChevronUp className="h-3 w-3" />
                    }
                  </button>
                </div>
              )}
              
              {!collapsedSections.has(group.key) && (
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <button
                        onClick={item.onClick}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-start px-3 space-x-3'} py-2 rounded-md transition-colors text-sm ${
                          item.active 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-white hover:bg-white/60'
                        }`}
                      >
                        <span className="flex-shrink-0 flex items-center justify-center h-5 w-5">{item.icon}</span>
                        {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>
        
        {!isCollapsed && (
          <div className="px-3 mt-2">
            <div className="border-t border-white/40"></div>
          </div>
        )}
        {!isCollapsed && footer && (
          <div className="p-3">
            <div className="bg-white/20 rounded-lg p-2 text-xs">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarView;


