import React, { useState } from 'react';

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
  groups: SidebarViewGroup[];
  footer?: React.ReactNode;
}

const SidebarView: React.FC<SidebarViewProps> = ({ groups, footer }) => {
  const [collapsedSections] = useState<Set<string>>(new Set());

  return (
    <div className="w-56 glass-card rounded-2xl text-gray-800 h-full shadow-2xl border border-white/20 overflow-hidden pb-3">
      <div className="flex flex-col h-full">
        {/* Simple header without toggle button */}
        <div className="px-4 pt-3 pb-2">
          <div className="border-b border-white/30"></div>
        </div>

        {/* nav */}
        <nav className="flex-1 px-3 pt-3 pb-2 overflow-y-auto custom-scrollbar min-h-0">
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="px-1 mb-1">
                  <span className="px-1 text-[11px] font-semibold text-gray-600 tracking-wider uppercase opacity-80">
                    {group.label}
                  </span>
                </div>

                {!collapsedSections.has(group.key) && (
                  <div className="ml-1 flex flex-col gap-1">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      onClick={item.onClick}
                      type="button"
                      className={`sidebar-nav-btn group w-full flex items-center justify-start px-3 gap-3 py-1 transition-all duration-200 text-sm
                      appearance-none border-0 shadow-none
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300/70
                      ${item.active
                        ? 'text-blue-600 font-semibold'
                        : 'text-gray-700 hover:text-blue-600'}`
                      }
                      style={{ background: 'transparent !important' }}
                    >
                      <span className="flex-shrink-0 flex items-center justify-center h-4 w-4">
                        <span className="text-sm">
                          {item.icon}
                        </span>
                      </span>
                      <span className="font-medium truncate">{item.label}</span>
                    </button>
                  ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        <div className="px-3 mt-1 flex-shrink-0"><div className="border-t border-white/40"></div></div>
        {footer && (
          <div className="px-3 pb-2 pt-1 flex-shrink-0">
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
