import React from 'react';
import { X } from 'lucide-react';
import { Sidebar, NavTab } from './Sidebar';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertCount?: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  activeAlertCount,
}) => {
  if (!isOpen) return null;

  const handleSelect = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-[#2D3A31]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-[#1F2922] flex flex-col shadow-2xl z-10 border-r border-[#2D3A31]">
        <div className="absolute top-4 right-3 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C9A84] hover:text-[#F9F8F4] hover:bg-[#2D3A31] transition-colors cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <Sidebar
          currentTab={currentTab}
          onSelectTab={handleSelect}
          activeAlertCount={activeAlertCount}
        />
      </div>
    </div>
  );
};
