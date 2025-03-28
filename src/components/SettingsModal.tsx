
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { Settings, User, Key, Eye, EyeOff } from 'lucide-react';
import ClientTable from './ClientTable';
import AccountSettingsModal from './AccountSettingsModal';
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
  editClientId?: string | null;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onOpenChange, 
  initialTab = "general",
  editClientId = null 
}) => {
  const { 
    settings, 
    updateCompanyName, 
    updateOwnerName, 
    showAccountSettings, 
    setShowAccountSettings, 
    clients,
    updateClientPassword
  } = useSettings();
  
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(editClientId);
  const [clientPassword, setClientPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  
  useEffect(() => {
    if (editClientId) {
      setSelectedClientId(editClientId);
    }
  }, [editClientId]);
  
  const handleSaveGeneral = () => {
    updateCompanyName(companyName);
    updateOwnerName(ownerName);
  };
  
  const handleOpenAccountSettings = () => {
    setShowAccountSettings(true);
  };
  
  const handleSaveClientPassword = () => {
    if (selectedClientId && clientPassword.trim()) {
      updateClientPassword(selectedClientId, clientPassword);
      setClientPassword('');
      toast({
        title: "Senha atualizada",
        description: "A senha do cliente foi atualizada com sucesso.",
      });
    }
  };
  
  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setClientPassword('');
    setAdminPassword('');
    setShowPassword(false);
    setShowCurrentPassword(false);
  };
  
  const selectedClient = selectedClientId ? 
    clients.find(c => c.id === selectedClientId) : null;
  
  // Mock admin password check - in a real app, this would be more secure
  const isAdminPasswordCorrect = () => {
    return adminPassword === "admin123"; // Replace with actual admin password check
  };
  
  const toggleCurrentPasswordVisibility = () => {
    if (!showCurrentPassword && !adminPassword) {
      return; // Don't toggle if admin password is not entered
    }
    
    if (showCurrentPassword && !isAdminPasswordCorrect()) {
      toast({
        title: "Senha incorreta",
        description: "A senha do administrador está incorreta.",
        variant: "destructive"
      });
      return;
    }
    
    setShowCurrentPassword(!showCurrentPassword);
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
              <div className="space-y-6">
                <ClientTable 
                  clients={clients}
                  onSelect={handleSelectClient}
                  onEdit={(client) => {}}
                  onShare={(clientId) => {}}
                  onDelete={(clientId) => {}}
                />
                
                {selectedClient && (
                  <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Key className="w-5 h-5 mr-2 text-gray-600" />
                      Atualizar Senha do Cliente: {selectedClient.name}
                    </h3>
                    
                    <div className="space-y-4">
                      {selectedClient.password && (
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword">Senha Atual</Label>
                          <div className="relative">
                            <Input
                              id="adminPassword"
                              type={showCurrentPassword ? "text" : "password"}
                              value={showCurrentPassword ? selectedClient.password : adminPassword}
                              onChange={(e) => setAdminPassword(e.target.value)}
                              placeholder={showCurrentPassword ? "" : "Digite a senha de administrador para visualizar"}
                              readOnly={showCurrentPassword}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-10 w-10"
                              onClick={toggleCurrentPasswordVisibility}
                            >
                              {showCurrentPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            value={clientPassword}
                            onChange={(e) => setClientPassword(e.target.value)}
                            placeholder="Nova senha"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <Button onClick={handleSaveClientPassword}>
                        Atualizar Senha
                      </Button>
                    </div>
                  </div>
                )}
              </div>
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
