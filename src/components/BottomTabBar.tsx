import React from 'react';
import { LayoutDashboard, Map, Activity, ShieldAlert, Sparkles, Settings } from 'lucide-react';

export type TabType = 'dashboard' | 'map' | 'traffic' | 'infrastructure' | 'ai' | 'settings';

interface BottomTabBarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadAlertsCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertsCount = 3,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Home', icon: LayoutDashboard },
    { id: 'map' as TabType, label: 'Live Map', icon: Map },
    { id: 'traffic' as TabType, label: 'Traffic', icon: Activity },
    { id: 'infrastructure' as TabType, label: 'Hazards', icon: ShieldAlert, badge: unreadAlertsCount },
    { id: 'ai' as TabType, label: 'AI Operations', icon: Sparkles },
    { id: 'settings' as TabType, label: 'Diagnostics', icon: Settings },
  ];

  return (
    <nav className="h-16 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-2 flex items-center justify-around shrink-0 z-30 select-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            aria-label={tab.label}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition relative group ${
              isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[14px] h-[14px] rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className={`text-[10px] mt-1 font-medium tracking-tight ${isActive ? 'font-semibold text-teal-400' : ''}`}>
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1 h-1 rounded-full bg-teal-400 absolute bottom-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
