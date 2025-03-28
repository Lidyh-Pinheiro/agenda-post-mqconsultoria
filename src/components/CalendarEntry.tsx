
import React from 'react';
import { cn } from "@/lib/utils";
import { Check, Upload, Save, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarEntryProps {
  date: string;
  day: string;
  title: string;
  type: string;
  text: string;
  className?: string;
  highlighted?: boolean;
  themeColor?: string;
  completed?: boolean;
  onSelect?: () => void;
  onUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange?: () => void;
  isUploading?: boolean;
  socialNetworks?: string[];
  preview?: boolean;
  hideIcons?: boolean;
}

const CalendarEntry: React.FC<CalendarEntryProps> = ({
  date,
  day,
  title,
  type,
  text,
  className,
  highlighted = false,
  themeColor = "#dc2626",
  completed = false,
  onSelect,
  onUpload,
  onStatusChange,
  isUploading = false,
  socialNetworks = [],
  preview = false,
  hideIcons = false
}) => {
  // Helper function to get the icon component for a social network
  const getSocialIcon = (network: string) => {
    switch (network.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'tiktok': 
        // Use Music icon for TikTok since TikTok isn't available
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-4 h-4"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        );
      default: return null;
    }
  };

  return (
    <div 
      className={cn(
        "calendar-entry p-6 rounded-2xl relative overflow-hidden",
        "flex flex-col w-full backdrop-blur-sm transition-all duration-300",
        highlighted 
          ? "glass-card border-2" 
          : "bg-white/80 shadow-sm hover:shadow-lg border border-gray-100",
        completed ? "border-green-500" : "",
        className
      )}
      style={{
        borderColor: highlighted && !completed ? themeColor : ''
      }}
    >
      <div className="flex items-center mb-4">
        <div className={cn(
          "text-white font-medium text-sm py-1 px-3 rounded-full",
          "flex items-center justify-center",
        )}
        style={{ backgroundColor: themeColor }}
        >
          <span>{date}</span>
          <span className="ml-1">•</span>
          <span className="ml-1">{day}</span>
        </div>
        <div className="ml-auto flex items-center space-x-2">
          {!hideIcons && completed ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Check className="w-3 h-3 mr-1" />
              Concluído
            </span>
          ) : !hideIcons ? (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Pendente
            </span>
          ) : null}
          {onStatusChange && !hideIcons && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 text-xs px-2 py-1 h-auto"
              style={{ 
                borderColor: completed ? 'rgb(239 68 68)' : 'rgb(22 163 74)',
                color: completed ? 'rgb(239 68 68)' : 'rgb(22 163 74)'
              }}
              onClick={onStatusChange}
            >
              {completed ? 'Marcar pendente' : 'Concluir'}
            </Button>
          )}
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            {type}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {title}
      </h3>
      
      <div className="flex-1">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {text}
        </p>
      </div>
      
      {/* Display social media icons - fixed to always show when socialNetworks are provided */}
      {socialNetworks && socialNetworks.length > 0 && (
        <div className="mt-3 flex items-center space-x-2">
          {socialNetworks.map((network, idx) => (
            <span 
              key={idx} 
              className="inline-flex items-center justify-center p-1.5 bg-gray-100 rounded-full"
              title={network.charAt(0).toUpperCase() + network.slice(1)}
            >
              {getSocialIcon(network)}
            </span>
          ))}
        </div>
      )}
      
      {onUpload && !hideIcons && (
        <div className="mt-4 border-t border-gray-100 pt-4 flex flex-col">
          <div className="flex items-center justify-between">
            <label className="cursor-pointer inline-flex items-center text-gray-600 text-sm hover:text-gray-800">
              <Upload className="w-4 h-4 mr-2" />
              <span>Anexar arquivo</span>
              <input
                type="file"
                className="hidden"
                onChange={onUpload}
                disabled={isUploading}
              />
            </label>
            {isUploading && (
              <span className="text-xs text-gray-500 animate-pulse">Enviando...</span>
            )}
          </div>
        </div>
      )}
      
      {highlighted && !hideIcons && (
        <div className="mt-4 text-sm font-medium flex items-center justify-between">
          <div
            style={{ color: themeColor }}
            onClick={onSelect}
            className="cursor-pointer flex items-center"
          >
            <span>Ver detalhes</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarEntry;
