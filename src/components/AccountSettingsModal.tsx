
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountSettingsModal = ({ open, onOpenChange }: AccountSettingsModalProps) => {
  const { settings, updateCompanyName, updateOwnerName } = useSettings();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  
  const handleSave = () => {
    updateCompanyName(companyName);
    updateOwnerName(ownerName);
    
    onOpenChange(false);
    
    toast.success("Configurações salvas com sucesso!");
  };
  
  const handleReset = () => {
    setCompanyName(settings.companyName);
    setOwnerName(settings.ownerName);
  };
  
  const handleClear = () => {
    const confirmClear = window.confirm(
      "Tem certeza que deseja limpar os dados? Isso apagará todos os clientes e postagens."
    );
    
    if (confirmClear) {
      localStorage.removeItem('appSettings');
      localStorage.removeItem('calendarPosts');
      
      toast.success("Dados limpos com sucesso! Atualize a página para ver as alterações.");
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurações da Conta</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="companyName" className="col-span-4 text-sm font-medium">
              Nome da Empresa
            </label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-4"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="ownerName" className="col-span-4 text-sm font-medium">
              Nome do Proprietário
            </label>
            <Input
              id="ownerName"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="col-span-4"
            />
          </div>
        </div>
        
        <div className="flex justify-between">
          <Button variant="destructive" onClick={handleClear}>
            Limpar Dados
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              Redefinir
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsModal;
