
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Share2 } from 'lucide-react';
import { Client } from '@/contexts/SettingsContext';

interface ClientItemProps {
  client: Client;
  onSelect: () => void;
  onShare?: () => void;
}

const ClientItem: React.FC<ClientItemProps> = ({ client, onSelect, onShare }) => {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: client.themeColor }}
          >
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1">
            <div 
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: `${client.themeColor}20`, color: client.themeColor }}
            >
              Cliente
            </div>
            {(client.postsCount && client.postsCount > 0) && (
              <div 
                className="text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1"
                style={{ backgroundColor: `${client.themeColor}20`, color: client.themeColor }}
              >
                <Calendar className="w-3 h-3" />
                {client.postsCount}
              </div>
            )}
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-4">{client.name}</h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Calendar className="w-4 h-4 mr-1" />
          <span>
            {new Date(client.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onSelect}
            variant="default"
            className="w-full"
            style={{ backgroundColor: client.themeColor }}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Ver Agenda
          </Button>
          
          {onShare && (
            <Button
              onClick={onShare}
              variant="outline"
              className="w-full"
              style={{ borderColor: client.themeColor, color: client.themeColor }}
            >
              <Share2 className="w-4 h-4 mr-1" />
              Compartilhar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientItem;
