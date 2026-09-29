import React from 'react';
import { cn } from '../../lib/utils.js';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      'bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow duration-200',
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon && (
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{value}</div>
        {trend && (
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            trend.positive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
          )}>
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
