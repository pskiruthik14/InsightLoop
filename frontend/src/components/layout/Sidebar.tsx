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
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'inbox', label: 'Feedback Inbox', icon: <Inbox className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'sentiment', label: 'Sentiment Intelligence', icon: <Sparkles className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'topics', label: 'Topics & Issues', icon: <Layers className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'voice', label: 'Customer Voice', icon: <MessageSquareHeart className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'alerts', label: 'Alerts', icon: <BellRing className="w-4 h-4" strokeWidth={1.5} />, badge: activeAlertCount },
    { id: 'sources', label: 'Sources', icon: <Share2 className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" strokeWidth={1.5} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" strokeWidth={1.5} /> },
  ];

  return (
    <aside className="w-64 bg-[#1F2922] text-[#DCCFC2] flex flex-col shrink-0 border-r border-[#2D3A31] select-none shadow-[4px_0_24px_rgba(31,41,34,0.08)]">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-[#2D3A31]/80">
        <div className="w-8 h-8 rounded-full bg-[#8C9A84] flex items-center justify-center text-[#1F2922] font-serif font-bold text-sm shadow-xs">
          IL
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-semibold text-[#F9F8F4] text-sm tracking-tight">InsightLoop</h1>
            <span className="text-[10px] font-sans font-medium px-2 py-0.2 rounded-full bg-[#8C9A84]/20 text-[#A3B09C] border border-[#8C9A84]/30">
              MSME
            </span>
          </div>
          <p className="text-[11px] font-sans text-[#A3B09C]/70">Customer Intelligence</p>
        </div>
      </div>

      {/* Business Workspace Context */}
      <div className="px-4 py-3 border-b border-[#2D3A31]/60 bg-[#1A231C]/60">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#2D3A31]/50 border border-[#8C9A84]/20">
          <Building2 className="w-4 h-4 text-[#8C9A84] shrink-0" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-serif font-medium text-[#F9F8F4] truncate">
              {business?.name || 'Artisan Kitchen & Cafe'}
            </p>
            <p className="text-[10px] font-sans text-[#A3B09C] truncate">
              {business?.category || 'Restaurant'} • MSME Tier
            </p>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#8C9A84] shrink-0 shadow-[0_0_8px_#8C9A84]" title="Active Workspace" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-sans font-medium uppercase tracking-widest text-[#8C9A84]/80">
          Intelligence Suite
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-sans font-medium transition-all duration-300 ease-out cursor-pointer text-left ${
                isActive
                  ? 'bg-[#2D3A31] text-[#F9F8F4] font-semibold border border-[#8C9A84]/40 shadow-xs'
                  : 'text-[#DCCFC2]/80 hover:text-[#F9F8F4] hover:bg-[#2D3A31]/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-[#8C9A84]' : 'text-[#8C9A84]/60'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span
                  className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-[#C27B66] text-white' : 'bg-[#C27B66]/20 text-[#E09D8B] border border-[#C27B66]/30'
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
      <div className="p-3 border-t border-[#2D3A31] bg-[#1A231C]/80">
        <div className="flex items-center justify-between px-2 py-1.5 rounded-2xl hover:bg-[#2D3A31]/40 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#2D3A31] text-[#8C9A84] border border-[#8C9A84]/30 flex items-center justify-center font-serif text-xs font-semibold shrink-0">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-serif font-medium text-[#F9F8F4] truncate">
                {user?.full_name || 'Arunachalam S.'}
              </p>
              <p className="text-[10px] font-sans text-[#8C9A84] truncate capitalize">
                {user?.role || 'owner'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 rounded-full text-[#8C9A84] hover:text-[#C27B66] hover:bg-[#2D3A31] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
};
