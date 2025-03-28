
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Share2, Link } from 'lucide-react';
import { Client } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ClientItemProps {
  client: Client;
  onSelect: () => void;
  onShare?: () => void;
}

const ClientItem: React.FC<ClientItemProps> = ({ client, onSelect, onShare }) => {
  // Generate the client view URL
  const generateClientViewUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/client-view/${client.id}`;
  };

  // Copy client view URL to clipboard
  const copyClientUrlToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Check if client exists in Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('id')
        .eq('id', client.id)
        .single();
      
      if (error || !data) {
        console.log('Client not found in Supabase, attempting to sync:', client);
        // Client doesn't exist in Supabase, sync it now
        const { error: insertError } = await supabase.from('clients').insert({
          id: client.id,
          name: client.name,
          themecolor: client.themeColor,
          password: client.password,
          description: client.description
        });
        
        if (insertError) {
          console.error('Error syncing client to Supabase:', insertError);
        } else {
          console.log('Successfully synced client to Supabase');
        }
      }
      
      const url = generateClientViewUrl();
      navigator.clipboard.writeText(url);
      
      // Use toast instead of alert for better UX
      toast.success("URL copiada!", {
        description: "Link de acesso do cliente copiado para a área de transferência."
      });
    } catch (error) {
      console.error('Error checking/syncing client:', error);
      // Copy URL anyway even if there was an error
      const url = generateClientViewUrl();
      navigator.clipboard.writeText(url);
      
      toast.success("URL copiada!", {
        description: "Link de acesso do cliente copiado para a área de transferência."
      });
    }
  };

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
          
          <Button
            onClick={copyClientUrlToClipboard}
            variant="outline"
            className="w-full"
            style={{ borderColor: client.themeColor, color: client.themeColor }}
          >
            <Link className="w-4 h-4 mr-1" />
            Copiar URL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientItem;
