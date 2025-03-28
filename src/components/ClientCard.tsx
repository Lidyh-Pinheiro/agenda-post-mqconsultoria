
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/contexts/SettingsContext';

interface ClientCardProps {
  client: Client;
  onSelect: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onSelect }) => {
  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer"
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: client.themeColor }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <div 
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ backgroundColor: `${client.themeColor}20`, color: client.themeColor }}
          >
            Cliente
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
        
        <div className="flex items-center text-gray-500 text-sm">
          <Calendar className="w-4 h-4 mr-1" />
          <span>
            {new Date(client.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
