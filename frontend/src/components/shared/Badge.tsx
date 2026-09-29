import React from 'react';
import { cn } from '../../lib/utils.js';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-primary text-primary-foreground border-transparent hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80',
    destructive: 'bg-destructive/15 text-destructive border-destructive/20 font-medium',
    outline: 'text-foreground border-border',
    success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium',
    info: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20 font-medium'
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
