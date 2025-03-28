
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings, User } from 'lucide-react';
import ClientTable from './ClientTable';
import AccountSettingsModal from './AccountSettingsModal';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string; // Make this optional
  editClientId?: string | null; // Make this optional
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onOpenChange, 
  initialTab = "general", // Default to general tab
  editClientId = null 
}) => {
  const { settings, updateCompanyName, updateOwnerName, showAccountSettings, setShowAccountSettings, clients } = useSettings();
  
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  
  const handleSaveGeneral = () => {
    updateCompanyName(companyName);
    updateOwnerName(ownerName);
  };
  
  const handleOpenAccountSettings = () => {
    setShowAccountSettings(true);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
            <DialogDescription>
              Gerencie as configurações gerais e clientes do sistema.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="account">Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome do Administrador</Label>
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="button" onClick={handleSaveGeneral}>
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </TabsContent>
            
            <TabsContent value="clients">
              <ClientTable 
                clients={clients}
                onSelect={(clientId) => {}}
                onEdit={(client) => {}}
                onShare={(clientId) => {}}
                onDelete={(clientId) => {}}
              />
            </TabsContent>
            
            <TabsContent value="account" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <h3 className="font-medium">Configurações de conta</h3>
                      <p className="text-sm text-gray-500">Gerencie seu email e senha</p>
                    </div>
                  </div>
                  <Button onClick={handleOpenAccountSettings}>
                    <Settings className="w-4 h-4 mr-2" />
                    Gerenciar
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AccountSettingsModal 
        open={showAccountSettings} 
        onOpenChange={setShowAccountSettings} 
      />
    </>
  );
};

export default SettingsModal;
