
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import AddClientForm, { ClientFormValues } from './AddClientForm';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-[10px]">
        <DialogHeader>
          <DialogTitle>Adicionar Cliente</DialogTitle>
          <DialogDescription>
            Crie um novo cliente para gerenciar a agenda de postagens.
          </DialogDescription>
        </DialogHeader>
        <AddClientForm onSubmit={onSubmit} onCancel={onCancel} />
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;
