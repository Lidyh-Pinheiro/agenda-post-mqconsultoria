
import React, { useState } from 'react';
import { X, Check, PlusCircle, Trash2, Palette, User, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const themeColors = [
  { name: 'red', bgClass: 'bg-red-600', hoverClass: 'hover:bg-red-700' },
  { name: 'blue', bgClass: 'bg-blue-600', hoverClass: 'hover:bg-blue-700' },
  { name: 'green', bgClass: 'bg-green-600', hoverClass: 'hover:bg-green-700' },
  { name: 'purple', bgClass: 'bg-purple-600', hoverClass: 'hover:bg-purple-700' },
  { name: 'orange', bgClass: 'bg-orange-600', hoverClass: 'hover:bg-orange-700' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ open, onOpenChange }) => {
  const { 
    ownerName, 
    setOwnerName, 
    themeColor, 
    setThemeColor,
    clients,
    addClient,
    removeClient,
    currentClient,
    setCurrentClient
  } = useSettings();
  
  const [newOwnerName, setNewOwnerName] = useState(ownerName);
  const [newClientName, setNewClientName] = useState('');
  
  const handleSaveOwnerName = () => {
    if (newOwnerName.trim()) {
      setOwnerName(newOwnerName.trim());
      toast.success('Nome atualizado com sucesso!');
    }
  };
  
  const handleAddClient = () => {
    if (newClientName.trim()) {
      const newClient = {
        id: uuidv4(),
        name: newClientName.trim()
      };
      
      addClient(newClient);
      setNewClientName('');
      toast.success('Cliente adicionado com sucesso!');
    }
  };
  
  const handleSelectClient = (client: typeof clients[0]) => {
    setCurrentClient(client);
    toast.success(`Cliente ${client.name} selecionado`);
    onOpenChange(false);
  };
  
  const handleRemoveClient = (id: string) => {
    removeClient(id);
    toast.success('Cliente removido com sucesso!');
  };
  
  const handleSelectColor = (color: string) => {
    setThemeColor(color as any);
    toast.success('Cor do tema atualizada!');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configurações da Agenda</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="owner" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="owner" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Proprietário
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Clientes
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Tema
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="owner" className="space-y-4">
            <div className="space-y-4">
              <label className="font-medium text-sm">Nome do Proprietário</label>
              <Input
                value={newOwnerName}
                onChange={(e) => setNewOwnerName(e.target.value)}
                placeholder="Nome completo"
              />
              <Button onClick={handleSaveOwnerName}>Salvar Nome</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="clients" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="font-medium text-sm">Adicionar Novo Cliente</label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                  <Button onClick={handleAddClient} className="shrink-0">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="font-medium text-sm mb-2 block">Clientes Cadastrados</label>
                {clients.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">Nenhum cliente cadastrado</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {clients.map((client) => (
                      <div 
                        key={client.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          currentClient?.id === client.id ? 'bg-gray-100 border-gray-300' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-3 font-medium">{client.name}</span>
                          {currentClient?.id === client.id && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              Atual
                            </span>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSelectClient(client)}
                            disabled={currentClient?.id === client.id}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveClient(client.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="theme" className="space-y-4">
            <div>
              <label className="font-medium text-sm">Cor do Tema</label>
              <div className="grid grid-cols-5 gap-4 mt-4">
                {themeColors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => handleSelectColor(color.name)}
                    className={`
                      w-full h-20 rounded-lg transition-all duration-200
                      ${color.bgClass} ${color.hoverClass}
                      flex items-center justify-center
                      ${themeColor === color.name ? 'ring-4 ring-offset-2 scale-105' : ''}
                    `}
                  >
                    {themeColor === color.name && (
                      <Check className="w-6 h-6 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-8">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
