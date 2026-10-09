import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
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

  const maxW = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3A31]/40 backdrop-blur-sm">
      <div
        className={`bg-[#F9F8F4] rounded-3xl shadow-[0_20px_50px_rgba(45,58,49,0.2)] border border-[#E6E2DA] w-full ${maxW} overflow-hidden transition-all duration-500 ease-out`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-7 py-5 border-b border-[#E6E2DA] bg-white/80 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-semibold text-[#2D3A31] text-lg tracking-tight">{title}</h3>
            {subtitle && <p className="font-sans text-xs text-[#8C9A84] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8C9A84] hover:text-[#2D3A31] hover:bg-[#F2EDE6] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-7 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
