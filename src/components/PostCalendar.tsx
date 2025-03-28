
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar } from 'lucide-react';
import { CalendarPost } from '@/types/calendar';
import { isDateWithPosts } from '@/utils/calendarUtils';

interface PostCalendarProps {
  themeColor: string;
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  filteredPosts: CalendarPost[];
}

const PostCalendar: React.FC<PostCalendarProps> = ({
  themeColor,
  selectedDate,
  onDateSelect,
  filteredPosts
}) => {
  return (
    <Card className="p-4 shadow-md bg-white">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar 
          className="w-5 h-5 mr-2"
          style={{ color: themeColor }} 
        />
        Calendário de Postagens
      </h3>
      <div className="bg-white rounded-lg shadow-sm p-1">
        <div className="calendar-container">
          <CalendarComponent
            mode="single"
            className="p-3 pointer-events-auto"
            selected={selectedDate}
            onSelect={onDateSelect}
            modifiers={{
              booked: (date) => isDateWithPosts(date, filteredPosts)
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: `${themeColor}20`,
                borderRadius: '50%',
                color: themeColor,
                fontWeight: 'bold'
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default PostCalendar;
