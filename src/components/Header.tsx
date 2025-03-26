
import React from 'react';
import { Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  useRedTheme?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle, useRedTheme = false }) => {
  return (
    <div className="animate-slide-up w-full mb-10 text-center">
      <div className="flex items-center justify-center mb-3">
        <div className={cn(
          "h-10 w-10 flex items-center justify-center rounded-full mr-3",
          useRedTheme ? "bg-red-600" : "bg-neia-blue"
        )}>
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h1 className={cn(
          "text-3xl sm:text-4xl font-semibold tracking-tight",
          useRedTheme ? "text-red-600" : "text-neia-blue"
        )}>
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-gray-600 text-lg animate-fade-in delay-150">
          {subtitle}
        </p>
      )}
      <div className={cn(
        "mt-5 w-20 h-1 mx-auto rounded-full",
        useRedTheme ? "bg-red-600" : "bg-neia-blue"
      )} />
    </div>
  );
};

export default Header;
