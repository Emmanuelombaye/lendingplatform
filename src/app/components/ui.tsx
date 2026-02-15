import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = ({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) => {
  const variants = {
    primary: 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm',
    secondary: 'bg-[#0F172A] text-white hover:bg-[#1E293B] shadow-sm',
    outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-xl font-medium',
    lg: 'px-8 py-4 text-lg rounded-2xl font-semibold',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn('bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden', className)}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'info', className }: { children: React.ReactNode, variant?: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'default', className?: string }) => {
  const styles: Record<string, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent border-slate-200 text-slate-600',
    default: 'bg-slate-900 text-white border-slate-900',
  };
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium border', styles[variant] || styles.info, className)}>
      {children}
    </span>
  );
};
