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
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col shadow-2xl z-10">
        <div className="absolute top-3.5 right-3">
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
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
