import React from 'react';
import { Search, Plus, Upload, MessageSquareCode, Bell, Menu } from 'lucide-react';
import { Button } from '../common/Button';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenAskDrawer: () => void;
  onOpenAlerts: () => void;
  onToggleMobileNav: () => void;
  activeAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenImportModal,
  onOpenAskDrawer,
  onOpenAlerts,
  onToggleMobileNav,
  activeAlertCount = 0,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search feedback, topics, customers, products..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<MessageSquareCode className="w-3.5 h-3.5 text-indigo-600" />}
          onClick={onOpenAskDrawer}
          className="hidden md:inline-flex"
        >
          Ask Your Data
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Upload className="w-3.5 h-3.5 text-slate-600" />}
          onClick={onOpenImportModal}
          className="hidden sm:inline-flex"
        >
          Import CSV
        </Button>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={onOpenAddModal}
        >
          Add Feedback
        </Button>

        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Active Alerts"
        >
          <Bell className="w-4 h-4" />
          {activeAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>
      </div>
    </header>
  );
};
