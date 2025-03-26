
import React from 'react';
import { cn } from "@/lib/utils";

interface CalendarEntryProps {
  date: string;
  day: string;
  title: string;
  type: string;
  text: string;
  className?: string;
  highlighted?: boolean;
  onSelect?: () => void;
}

const CalendarEntry: React.FC<CalendarEntryProps> = ({
  date,
  day,
  title,
  type,
  text,
  className,
  highlighted = false,
  onSelect
}) => {
  return (
    <div 
      className={cn(
        "calendar-entry p-6 rounded-2xl relative overflow-hidden",
        "flex flex-col w-full backdrop-blur-sm transition-all duration-300",
        highlighted 
          ? "glass-card border-2 border-neia-blue" 
          : "bg-white/80 shadow-sm hover:shadow-lg border border-gray-100",
        className
      )}
      onClick={onSelect}
    >
      <div className="flex items-center mb-4">
        <div className={cn(
          "date-badge text-white font-medium text-sm py-1 px-3 rounded-full",
          "flex items-center justify-center"
        )}>
          <span>{date}</span>
          <span className="ml-1">•</span>
          <span className="ml-1">{day}</span>
        </div>
        <div className="ml-auto">
          <span className="bg-neia-gray text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
            {type}
          </span>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 mb-3">
        {title}
      </h3>
      
      <div className="flex-1">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
          {text}
        </p>
      </div>
      
      {highlighted && (
        <div className="mt-4 text-neia-blue text-sm font-medium flex items-center">
          <span>Ver detalhes</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default CalendarEntry;
