
import React from 'react';
import { Calendar } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="animate-slide-up w-full mb-10 text-center">
      <div className="flex items-center justify-center mb-3">
        <div className="h-10 w-10 flex items-center justify-center bg-neia-blue rounded-full mr-3">
          <Calendar className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-neia-blue tracking-tight">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-gray-600 text-lg animate-fade-in delay-150">
          {subtitle}
        </p>
      )}
      <div className="mt-5 w-20 h-1 bg-neia-blue mx-auto rounded-full" />
    </div>
  );
};

export default Header;
