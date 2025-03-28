
import React from 'react';
import { Calendar, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSettings } from '@/contexts/SettingsContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  useRedTheme?: boolean;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  useRedTheme = false,
  showSettings = false,
  onSettingsClick
}) => {
  const { themeColor } = useSettings();
  
  const getThemeColorClass = (isBackground = false) => {
    if (useRedTheme) {
      return isBackground ? "bg-red-600" : "text-red-600";
    }
    
    switch (themeColor) {
      case 'blue':
        return isBackground ? "bg-blue-600" : "text-blue-600";
      case 'green':
        return isBackground ? "bg-green-600" : "text-green-600";
      case 'purple':
        return isBackground ? "bg-purple-600" : "text-purple-600";
      case 'orange':
        return isBackground ? "bg-orange-600" : "text-orange-600";
      default:
        return isBackground ? "bg-red-600" : "text-red-600";
    }
  };

  return (
    <div className="animate-slide-up w-full mb-10 text-center relative">
      {showSettings && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0"
          onClick={onSettingsClick}
        >
          <Settings className={cn("h-5 w-5", getThemeColorClass())} />
        </Button>
      )}
      
      <div className="flex items-center justify-center mb-3">
        <div className={cn(
          "h-10 w-10 flex items-center justify-center rounded-full mr-3",
          getThemeColorClass(true)
        )}>
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h1 className={cn(
          "text-3xl sm:text-4xl font-semibold tracking-tight",
          getThemeColorClass()
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
        getThemeColorClass(true)
      )} />
    </div>
  );
};

export default Header;
