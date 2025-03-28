
import React from 'react';
import { cn } from "@/lib/utils";
import { Calendar } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface CalendarEntryProps {
  date: string;
  day: string;
  title: string;
  type: string;
  text: string;
  highlighted?: boolean;
  useRedTheme?: boolean;
  completed?: boolean;
  onSelect?: () => void;
}

const CalendarEntry: React.FC<CalendarEntryProps> = ({
  date,
  day,
  title,
  type,
  text,
  highlighted = false,
  useRedTheme = false,
  completed = false,
  onSelect
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

  const getCompletedIconStyle = () => {
    if (completed) {
      return "opacity-100";
    }
    return "opacity-0 group-hover:opacity-30";
  };

  return (
    <div 
      className={cn(
        "calendar-entry relative bg-white rounded-xl overflow-hidden cursor-pointer shadow-sm group border",
        highlighted ? `border-${themeColor === 'red' ? 'red' : themeColor}-200` : "border-gray-100" 
      )}
      onClick={onSelect}
    >
      {/* Completed indicator */}
      <div className={cn(
        "absolute top-3 right-3 z-10 w-5 h-5 rounded-full flex items-center justify-center transition-opacity",
        getCompletedIconStyle(),
        completed ? "bg-green-500" : `${getThemeColorClass(true)}`
      )}>
        <svg 
          className="w-3 h-3 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>
      
      <div className="flex">
        <div className={cn(
          "w-24 md:w-28 p-4 flex flex-col items-center justify-center",
          getThemeColorClass(true)
        )}>
          <span className="text-white text-xl md:text-2xl font-bold">{date}</span>
          <span className="text-white text-sm md:text-base opacity-80">{day}</span>
        </div>
        
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-800 text-lg mb-1 pr-8">{title}</h3>
          </div>
          
          <div className={cn(
            "inline-block px-2 py-1 text-xs rounded-full mb-2",
            `bg-${themeColor === 'red' ? 'red' : themeColor}-100 text-${themeColor === 'red' ? 'red' : themeColor}-700`
          )}>
            {type}
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2">{text}</p>
          
          <button 
            className={cn(
              "mt-3 text-sm font-medium flex items-center",
              getThemeColorClass()
            )}
          >
            Ver detalhes
            <svg 
              className="w-4 h-4 ml-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarEntry;
