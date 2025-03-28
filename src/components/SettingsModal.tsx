
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Edit, Copy, Palette, Calendar, Lock } from 'lucide-react';
import { useSettings, Client } from '@/contexts/SettingsContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog'; // Import the new component

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
  editClientId?: string | null;
}

const THEME_COLORS = [
  '#dc2626', // red-600
  '#ea580c', // orange-600
  '#d97706', // amber-600
  '#65a30d', // lime-600
  '#16a34a', // green-600
  '#0891b2', // cyan-600
  '#0284c7', // sky-600
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#9333ea', // purple-600
  '#c026d3', // fuchsia-600
  '#db2777', // pink-600
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  open, 
  onOpenChange, 
  initialTab = 'general',
  editClientId = null
}) => {
  const {
    settings,
    updateCompanyName,
    updateOwnerName,
    addClient,
    updateClient,
    deleteClient,
    selectClient,
    generateClientShareLink
  } = useSettings();
  
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // New client form
  const [newClientName, setNewClientName] = useState('');
  const [newClientColor, setNewClientColor] = useState('#dc2626');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState(false);
  
  // Edit client
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientColor, setEditClientColor] = useState('');
  const [editClientPassword, setEditClientPassword] = useState('');
  const [editPasswordError, setEditPasswordError] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  // Password confirmation for deletion
  const [deletePasswordDialogOpen, setDeletePasswordDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  // Set initial edit client if provided
  useEffect(() => {
    if (editClientId) {
      handleStartEditClient(settings.clients.find(c => c.id === editClientId) as Client);
      setActiveTab('clients');
    }
  }, [editClientId, settings.clients]);

  // Update tab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSaveGeneral = () => {
    updateCompanyName(companyName);
    updateOwnerName(ownerName);
    toast.success('Configurações gerais salvas!');
  };

  const handleAddClient = () => {
    if (newClientName.trim() === '') {
      toast.error('O nome do cliente não pode estar vazio');
      return;
    }
    
    if (newClientPassword.trim() === '') {
      setNewPasswordError(true);
      toast.error('A senha não pode estar vazia');
      return;
    }
    
    addClient(newClientName, newClientColor, newClientPassword);
    setNewClientName('');
    setNewClientPassword('');
    setNewPasswordError(false);
    toast.success('Cliente adicionado com sucesso!');
  };

  const handleStartEditClient = (client: Client) => {
    setEditingClientId(client.id);
    setEditClientName(client.name);
    setEditClientColor(client.themeColor);
    setEditClientPassword('');
    setShowEditPassword(false);
  };

  const handleSaveEditClient = () => {
    if (!editingClientId) return;
    
    if (editClientName.trim() === '') {
      toast.error('O nome do cliente não pode estar vazio');
      return;
    }
    
    // If password field is shown but empty, show error
    if (showEditPassword && editClientPassword.trim() === '') {
      setEditPasswordError(true);
      toast.error('A senha não pode estar vazia');
      return;
    }
    
    // Only update password if it was changed
    if (showEditPassword) {
      updateClient(editingClientId, editClientName, editClientColor, editClientPassword);
    } else {
      updateClient(editingClientId, editClientName, editClientColor);
    }
    
    setEditingClientId(null);
    setShowEditPassword(false);
    toast.success('Cliente atualizado com sucesso!');
  };

  const handleCancelEditClient = () => {
    setEditingClientId(null);
    setShowEditPassword(false);
    setEditPasswordError(false);
  };

  const handleOpenDeleteDialog = (id: string) => {
    setClientToDelete(id);
    setDeletePasswordDialogOpen(true);
  };

  const handleDeleteClient = (password: string) => {
    if (!clientToDelete) return;
    
    const success = deleteClient(clientToDelete, password);
    
    if (success) {
      setDeletePasswordDialogOpen(false);
      setClientToDelete(null);
      toast.success('Cliente excluído com sucesso!');
    } else {
      toast.error('Senha incorreta. Exclusão cancelada.');
    }
  };

  const handleSelectClient = (id: string) => {
    selectClient(id);
    onOpenChange(false);
    toast.success('Cliente selecionado!');
  };

  const handleCopyShareLink = (id: string) => {
    const link = generateClientShareLink(id);
    navigator.clipboard.writeText(link);
    toast.success('Link copiado para a área de transferência!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Configurações</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
          </TabsList>
          
          {/* General Settings Tab */}
          <TabsContent value="general" className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Empresa
              </label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Nome da Empresa"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Administrador
              </label>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Nome do Administrador"
              />
            </div>
            
            <Button onClick={handleSaveGeneral} className="mt-4">
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </Button>
          </TabsContent>
          
          {/* Clients Tab */}
          <TabsContent value="clients" className="mt-4 space-y-6">
            {/* Add New Client */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">Adicionar Novo Cliente</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cliente
                  </label>
                  <Input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha do Cliente
                  </label>
                  <div className="relative">
                    <Input
                      type="password"
                      value={newClientPassword}
                      onChange={(e) => {
                        setNewClientPassword(e.target.value);
                        setNewPasswordError(false);
                      }}
                      placeholder="Senha para exclusão"
                      className={newPasswordError ? "border-red-500" : ""}
                    />
                    <Lock className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                  </div>
                  {newPasswordError && (
                    <p className="text-sm text-red-500 mt-1">A senha é obrigatória</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor do Tema
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full transition-all ${
                          newClientColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewClientColor(color)}
                        aria-label={`Selecionar cor ${color}`}
                      />
                    ))}
                  </div>
                </div>
                
                <Button onClick={handleAddClient} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cliente
                </Button>
              </div>
            </div>
            
            {/* Client List */}
            <div>
              <h3 className="font-medium mb-2">Clientes</h3>
              {settings.clients.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum cliente cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {settings.clients.map((client) => (
                    <div 
                      key={client.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {editingClientId === client.id ? (
                        // Edit mode
                        <div className="space-y-3">
                          <Input
                            value={editClientName}
                            onChange={(e) => setEditClientName(e.target.value)}
                            placeholder="Nome do cliente"
                          />
                          
                          {!showEditPassword ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setShowEditPassword(true)}
                              className="flex items-center gap-2"
                            >
                              <Lock className="w-4 h-4" />
                              Alterar Senha
                            </Button>
                          ) : (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nova Senha
                              </label>
                              <div className="relative">
                                <Input
                                  type="password"
                                  value={editClientPassword}
                                  onChange={(e) => {
                                    setEditClientPassword(e.target.value);
                                    setEditPasswordError(false);
                                  }}
                                  placeholder="Nova senha"
                                  className={editPasswordError ? "border-red-500" : ""}
                                />
                                <Lock className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
                              </div>
                              {editPasswordError && (
                                <p className="text-sm text-red-500 mt-1">A senha é obrigatória</p>
                              )}
                            </div>
                          )}
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Cor do Tema
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {THEME_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`w-8 h-8 rounded-full transition-all ${
                                    editClientColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() => setEditClientColor(color)}
                                  aria-label={`Selecionar cor ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button onClick={handleSaveEditClient} variant="outline" size="sm">
                              <Save className="w-4 h-4 mr-1" />
                              Salvar
                            </Button>
                            <Button onClick={handleCancelEditClient} variant="outline" size="sm">
                              <X className="w-4 h-4 mr-1" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View mode
                        <div>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div 
                                className="w-5 h-5 rounded-full mr-2" 
                                style={{ backgroundColor: client.themeColor }}
                              ></div>
                              <span className="font-medium">{client.name}</span>
                              {client.postsCount && client.postsCount > 0 && (
                                <div className="ml-2 flex items-center gap-1 px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${client.themeColor}20`, color: client.themeColor }}>
                                  <Calendar className="w-3 h-3" />
                                  {client.postsCount}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                onClick={() => handleStartEditClient(client)} 
                                variant="ghost" 
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => handleOpenDeleteDialog(client.id)} 
                                variant="ghost" 
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex gap-2">
                            <Button 
                              onClick={() => handleSelectClient(client.id)} 
                              variant="outline" 
                              size="sm"
                            >
                              Selecionar Cliente
                            </Button>
                            <Button 
                              onClick={() => handleCopyShareLink(client.id)} 
                              variant="outline" 
                              size="sm"
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Copiar Link
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Password confirmation dialog */}
      <PasswordConfirmDialog
        open={deletePasswordDialogOpen}
        onOpenChange={setDeletePasswordDialogOpen}
        onConfirm={handleDeleteClient}
        title="Confirmar exclusão do cliente"
        description="Para excluir este cliente, por favor insira a senha cadastrada."
      />
    </Dialog>
  );
};

export default SettingsModal;
