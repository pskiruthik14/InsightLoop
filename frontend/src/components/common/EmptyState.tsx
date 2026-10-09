import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white/70 rounded-3xl border border-dashed border-[#DCCFC2] shadow-xs ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[#EDF1EB] border border-[#8C9A84]/30 flex items-center justify-center text-[#4D6347] mb-4">
        {icon || <Inbox className="w-6 h-6" strokeWidth={1.5} />}
      </div>
      <h3 className="font-serif font-semibold text-[#2D3A31] text-base">{title}</h3>
      <p className="font-sans text-xs text-[#8C9A84] max-w-sm mt-1.5 mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
