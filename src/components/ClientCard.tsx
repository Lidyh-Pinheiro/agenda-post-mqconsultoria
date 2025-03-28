
import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ClientCardProps {
  id: string;
  name: string;
}

const ClientCard = ({ id, name }: ClientCardProps) => {
  const { themeColor, removeClient } = useSettings();

  const getThemeColorClass = () => {
    switch (themeColor) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      case 'orange': return 'bg-orange-600';
      default: return 'bg-red-600';
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    removeClient(id);
    toast.success('Cliente removido com sucesso!');
  };

  return (
    <Link to={`/client/${id}`} className="block">
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getThemeColorClass()}`}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-gray-500">ID: {id.substring(0, 8)}...</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Link>
  );
};

export default ClientCard;
