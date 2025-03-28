
import React from 'react';
import { Calendar, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/SettingsContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  themeColor?: string;
  showSettings?: boolean;
  onOpenSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  themeColor = "#dc2626", 
  showSettings = false,
  onOpenSettings
}) => {
  const { settings } = useSettings();
  const selectedClient = settings.selectedClientId 
    ? settings.clients.find(client => client.id === settings.selectedClientId) 
    : null;
  
  // Use the passed themeColor or the selected client's themeColor
  const color = themeColor || (selectedClient ? selectedClient.themeColor : "#dc2626");
  
  return (
    <div className="animate-slide-up w-full mb-10 text-center relative">
      {showSettings && onOpenSettings && (
        <div className="absolute right-0 top-0">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4" />
            <span className="text-sm">Configurações</span>
          </Button>
        </div>
      )}
      
      <div className="flex items-center justify-center mb-3">
        <div
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-full mr-3"
          )}
          style={{ backgroundColor: color }}
        >
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h1
          className={cn(
            "text-3xl sm:text-4xl font-semibold tracking-tight"
          )}
          style={{ color: color }}
        >
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-gray-600 text-lg animate-fade-in delay-150">
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-5 w-20 h-1 mx-auto rounded-full"
        )}
        style={{ backgroundColor: color }}
      />
    </div>
  );
};

export default Header;
