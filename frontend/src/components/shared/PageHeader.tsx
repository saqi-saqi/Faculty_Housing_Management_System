import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, badge, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4 border-b border-border mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}
