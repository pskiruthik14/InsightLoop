import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  Layers,
  MessageSquareHeart,
  Lightbulb,
  BellRing,
  Share2,
  TrendingUp,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'overview'
  | 'inbox'
  | 'sentiment'
  | 'topics'
  | 'voice'
  | 'recommendations'
  | 'alerts'
  | 'sources'
  | 'analytics'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertCount = 0,
}) => {
  const { user, business, logout } = useAuth();

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode; badge?: number }> = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inbox', label: 'Feedback Inbox', icon: <Inbox className="w-4 h-4" /> },
    { id: 'sentiment', label: 'Sentiment Intelligence', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'topics', label: 'Topics & Issues', icon: <Layers className="w-4 h-4" /> },
    { id: 'voice', label: 'Customer Voice', icon: <MessageSquareHeart className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'alerts', label: 'Alerts', icon: <BellRing className="w-4 h-4" />, badge: activeAlertCount },
    { id: 'sources', label: 'Sources', icon: <Share2 className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
          IL
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-white text-sm tracking-tight">InsightLoop</h1>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              SaaS
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Feedback & Sentiment AI</p>
        </div>
      </div>

      {/* Business Workspace Context */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/50">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50">
          <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {business?.name || 'Artisan Kitchen & Cafe'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {business?.category || 'Restaurant'} • MSME Tier
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Active Workspace" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Intelligence Suite
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User & Logout Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800/40 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-slate-700 text-indigo-300 flex items-center justify-center text-xs font-semibold shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.full_name || 'Arunachalam S.'}
              </p>
              <p className="text-[10px] text-slate-400 truncate capitalize">
                {user?.role || 'owner'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
