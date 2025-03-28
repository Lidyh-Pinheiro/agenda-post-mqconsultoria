
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  themeColor?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  themeColor = '#0f172a',
  showBackButton = false,
  onBackClick,
  showSettings = false,
  onSettingsClick
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 
          className="text-3xl font-bold"
          style={{ color: themeColor }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showBackButton && onBackClick && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBackClick}
          >
            Voltar
          </Button>
        )}
        
        {showSettings && onSettingsClick && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSettingsClick}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Header;
