import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-[#8C9A84] focus:ring-offset-2 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-wider text-xs uppercase';

  const variants = {
    primary: 'bg-[#2D3A31] text-[#F9F8F4] hover:bg-[#3D4D42] shadow-[0_4px_12px_rgba(45,58,49,0.12)] hover:shadow-[0_6px_16px_rgba(45,58,49,0.18)] hover:-translate-y-0.5',
    secondary: 'bg-[#F2EDE6] text-[#2D3A31] hover:bg-[#DCCFC2] border border-[#E6E2DA]',
    outline: 'border border-[#8C9A84] bg-transparent text-[#2D3A31] hover:bg-[#8C9A84]/10',
    danger: 'bg-[#C27B66] text-white hover:bg-[#AA6552] shadow-sm hover:-translate-y-0.5',
    ghost: 'text-[#2D3A31] hover:bg-[#F2EDE6] hover:text-[#1E2721]',
  };

  const sizes = {
    sm: 'text-[11px] px-3.5 py-1.5 gap-1.5 min-h-[32px]',
    md: 'text-xs px-5 py-2.5 gap-2 min-h-[40px]',
    lg: 'text-sm px-6 py-3.5 gap-2.5 min-h-[48px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
