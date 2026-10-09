import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    md: 'max-w-md',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#2D3A31]/40 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className={`w-screen ${widthClasses} bg-[#F9F8F4] shadow-[0_0_50px_rgba(45,58,49,0.15)] border-l border-[#E6E2DA] flex flex-col`}>
          <div className="px-7 py-5 border-b border-[#E6E2DA] bg-white/80 flex items-center justify-between">
            <div>
              <h3 className="font-serif font-semibold text-[#2D3A31] text-lg tracking-tight">{title}</h3>
              {subtitle && <p className="font-sans text-xs text-[#8C9A84] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8C9A84] hover:text-[#2D3A31] hover:bg-[#F2EDE6] transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-7">{children}</div>
        </div>
      </div>
    </div>
  );
};
