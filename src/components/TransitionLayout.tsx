
import React, { ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface TransitionLayoutProps {
  children: ReactNode;
  className?: string;
}

export const TransitionLayout: React.FC<TransitionLayoutProps> = ({ 
  children,
  className
}) => {
  return (
    <div className={cn(
      "animate-fade-in transition-all duration-500 ease-in-out",
      className
    )}>
      {children}
    </div>
  );
};
