
import React from 'react';
import { Calendar, Users, Edit, Share2, Palette } from 'lucide-react';
import { Client } from '@/contexts/SettingsContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface ClientTableProps {
  clients: Client[];
  onSelect: (clientId: string) => void;
  onEdit: (client: Client) => void;
  onShare: (clientId: string) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ 
  clients, 
  onSelect, 
  onEdit, 
  onShare 
}) => {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-center">Cor</TableHead>
            <TableHead className="text-center">Agendas Ativas</TableHead>
            <TableHead className="text-center">Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                Nenhum cliente cadastrado
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: client.themeColor }}
                    >
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: client.themeColor }}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                    <span>{client.postsCount || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      onClick={() => onSelect(client.id)} 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-500"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => onEdit(client)} 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => onShare(client.id)} 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
