import React from 'react';
import { Search, Plus, Upload, MessageSquareCode, Bell, Menu } from 'lucide-react';
import { Button } from '../common/Button';
import { SpeechToTextButton } from '../common/SpeechToTextButton';

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
    <header className="h-16 bg-[#F9F8F4]/85 backdrop-blur-md border-b border-[#E6E2DA] px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 -ml-2 rounded-full text-[#2D3A31] hover:bg-[#F2EDE6] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Global Search Bar with Voice Input */}
        <div className="relative w-full flex items-center">
          <Search className="w-4 h-4 text-[#8C9A84] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search feedback, topics, customers, products..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-white/90 border border-[#E6E2DA] rounded-full placeholder-[#8C9A84] text-[#2D3A31] focus:outline-none focus:ring-2 focus:ring-[#8C9A84] transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <SpeechToTextButton
              size="sm"
              onTranscript={(transcript) => {
                onSearchChange(transcript);
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<MessageSquareCode className="w-3.5 h-3.5 text-[#4D6347]" strokeWidth={1.5} />}
          onClick={onOpenAskDrawer}
          className="hidden md:inline-flex"
        >
          Ask Your Data
        </Button>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Upload className="w-3.5 h-3.5 text-[#5A695E]" strokeWidth={1.5} />}
          onClick={onOpenImportModal}
          className="hidden sm:inline-flex"
        >
          Import CSV
        </Button>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" strokeWidth={1.5} />}
          onClick={onOpenAddModal}
        >
          Add Feedback
        </Button>

        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-full text-[#8C9A84] hover:text-[#2D3A31] hover:bg-[#F2EDE6] transition-colors cursor-pointer"
          title="Active Alerts"
          aria-label="View alerts"
        >
          <Bell className="w-4 h-4" strokeWidth={1.5} />
          {activeAlertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C27B66]" />
          )}
        </button>
      </div>
    </header>
  );
};
