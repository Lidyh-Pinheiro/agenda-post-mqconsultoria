
import React from 'react';
import { Calendar, Users, Palette, Share2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Client } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';

interface ClientCardProps {
  client: Client;
  onSelect: () => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onSelect, onEdit, onShare, onDelete }) => {
  return (
    <Card 
      className="hover:shadow-md transition-all"
    >
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
        
        <h3 className="text-xl font-semibold mb-2">{client.name}</h3>
        
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
        
        <div className="flex gap-2 mt-2">
          <Button
            onClick={onSelect}
            variant="default"
            size="sm"
            className="flex-1"
            style={{ backgroundColor: client.themeColor }}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Agenda
          </Button>
          
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="w-9 p-0 flex justify-center"
          >
            <Palette className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onShare}
            variant="outline"
            size="sm"
            className="w-9 p-0 flex justify-center"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={onDelete}
            variant="outline"
            size="sm"
            className="w-9 p-0 flex justify-center"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;
