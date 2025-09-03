import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  itemSpacingPx?: number;
}

const SidebarView: React.FC<SidebarViewProps> = ({ isCollapsed, onToggle, groups, footer, itemSpacingPx }) => {
  const [collapsedSections] = useState<Set<string>>(new Set());

  return (
    <div className={`transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-60'} glass-card rounded-2xl text-gray-800 h-full max-h-screen shadow-2xl border border-white/20 overflow-hidden`}>
      <div className="flex flex-col h-full">
        {/* Top bar with toggle placed at the right */}
        <div className="px-2 pt-2 pb-1 flex items-center justify-end">
          <button
            onClick={onToggle}
            className="p-2 rounded-xl bg-transparent text-gray-600 hover:bg-white/20 hover:text-gray-800 shadow-sm transition-all duration-200"
            aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
            type="button"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <div className="border-b border-white/30 mx-2 mb-2"></div>

        {/* nav */}
        <nav className="flex-1 px-4 pt-3 pb-2 space-y-3 overflow-y-auto custom-scrollbar min-h-0">
          {groups.map((group) => (
            <div key={group.key} className="space-y-2">
              {!isCollapsed && (
                <div className="px-1">
                  <span className="px-1 text-[11px] font-semibold text-gray-600 tracking-wider uppercase opacity-80">
                    {group.label}
                  </span>
                </div>
              )}

              {!collapsedSections.has(group.key) && (
                <div className="ml-1 flex flex-col" style={{ gap: itemSpacingPx ?? 6 }}>
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={item.onClick}
                      type="button"
                      className={`sidebar-nav-btn group w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 min-h-[2.75rem] min-w-[2.75rem]' : 'justify-start px-3 gap-3'
                      } py-2.5 rounded-lg transition-all duration-200 text-sm
                      appearance-none border-0 shadow-none
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70
                      ${item.active
                        ? 'text-blue-700 font-semibold ring-1 ring-blue-100'
                        : 'text-gray-700 hover:text-blue-700'}`
                      }
                      style={{ background: 'transparent !important' }}
                    >
                      <span className={`flex-shrink-0 flex items-center justify-center ${isCollapsed ? 'h-6 w-6' : 'h-4 w-4'}`}>
                        <span className={`${isCollapsed ? 'text-lg' : 'text-sm'}`}>
                          {item.icon}
                        </span>
                      </span>
                      {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {!isCollapsed && <div className="px-3 mt-2 flex-shrink-0"><div className="border-t border-white/40"></div></div>}
        {!isCollapsed && footer && (
          <div className="p-3 flex-shrink-0">
            <div className="rounded-lg p-2 text-xs text-center">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarView;
