
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface ClientActionsProps {
  isTableView: boolean;
  setIsTableView: (isTableView: boolean) => void;
  setOpenAddClientModal: (open: boolean) => void;
}

const ClientActions: React.FC<ClientActionsProps> = ({ 
  isTableView, 
  setIsTableView, 
  setOpenAddClientModal 
}) => {
  return (
    <div className="flex items-center space-x-3">
      <Button 
        variant="neutral" 
        size="sm" 
        onClick={() => setIsTableView(!isTableView)}
        className="rounded-[10px]"
      >
        {isTableView ? "Visualização em Card" : "Visualização em Tabela"}
      </Button>
      <Button 
        variant="default"
        onClick={() => setOpenAddClientModal(true)}
        className="rounded-[10px]"
      >
        <Plus className="w-4 h-4 mr-1" />
        Adicionar Cliente
      </Button>
    </div>
  );
};

export default ClientActions;
