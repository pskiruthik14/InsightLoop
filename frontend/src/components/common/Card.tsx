import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`bg-white/95 rounded-3xl border border-[#E6E2DA] shadow-[0_4px_24px_-4px_rgba(45,58,49,0.05)] hover:shadow-[0_8px_32px_-6px_rgba(45,58,49,0.08)] transition-all duration-500 ease-out overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-6 py-4.5 border-b border-[#E6E2DA]/70 flex items-center justify-between gap-4 bg-[#F9F8F4]/50">
          <div>
            {title && typeof title === 'string' ? (
              <h3 className="font-serif font-semibold text-[#2D3A31] text-base tracking-tight">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="font-sans text-xs text-[#8C9A84] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
