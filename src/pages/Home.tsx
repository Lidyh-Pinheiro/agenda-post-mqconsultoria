
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import Header from '@/components/Header';
import { TransitionLayout } from '@/components/TransitionLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import ClientCard from '@/components/ClientCard';
import SettingsModal from '@/components/SettingsModal';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog';
import ConfirmDeleteClientDialog from '@/components/ConfirmDeleteClientDialog';
import { toast } from 'sonner';

const Home = () => {
  const { settings, deleteClient } = useSettings();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [passwordConfirmOpen, setPasswordConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [passwordInput, setPasswordInput] = useState('');

  const handleSelectClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleAddClient = () => {
    navigate('/index');
  };

  const handlePasswordConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      // First close the password dialog
      setPasswordConfirmOpen(false);
      
      // Now open the delete confirmation dialog
      setDeleteConfirmOpen(true);
    } catch (error) {
      console.error('Error in password confirmation:', error);
      toast.error('Erro na confirmação de senha');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      const success = await deleteClient(clientToDelete.id, passwordInput);
      
      if (success) {
        toast.success(`Cliente ${clientToDelete.name} excluído com sucesso`);
      } else {
        toast.error('Falha ao excluir cliente');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erro ao excluir cliente');
    } finally {
      setDeleteConfirmOpen(false);
      setClientToDelete(null);
      setPasswordInput('');
    }
  };

  const handleDeleteRequest = (clientId: string, clientName: string) => {
    setClientToDelete({ id: clientId, name: clientName });
    setPasswordConfirmOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-gray-50 to-gray-100">
      <main className="flex-1 container max-w-5xl px-4 py-12 mx-auto">
        <TransitionLayout>
          <Header 
            title={settings.companyName} 
            subtitle="Gerenciador de Clientes" 
            themeColor="#0f172a"
            showSettings
            onSettingsClick={() => setSettingsOpen(true)}
          />
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {settings.clients.map((client) => (
              <ClientCard 
                key={client.id}
                client={client}
                onSelect={() => handleSelectClient(client.id)}
                onEdit={() => navigate(`/client/${client.id}`)}
                onShare={() => navigate(`/client/${client.id}`)}
                onDelete={() => handleDeleteRequest(client.id, client.name)}
              />
            ))}
            
            <Card 
              className="cursor-pointer h-40 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
              onClick={handleAddClient}
            >
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-gray-500" />
                </div>
                <p className="text-gray-500 font-medium">Adicionar Cliente</p>
              </CardContent>
            </Card>
          </div>
          
          <footer className="mt-16 text-center text-gray-500 text-sm">
            <p>Agenda de Postagens • {settings.ownerName}</p>
          </footer>
        </TransitionLayout>
      </main>
      
      <SettingsModal 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
      
      <PasswordConfirmDialog
        open={passwordConfirmOpen}
        onOpenChange={setPasswordConfirmOpen}
        onConfirm={handlePasswordConfirm}
        passwordValue={passwordInput}
        setPasswordValue={setPasswordInput}
        title="Confirmar senha do cliente"
        description="Para excluir este cliente, por favor, confirme a senha."
      />
      
      {clientToDelete && (
        <ConfirmDeleteClientDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          onConfirm={handleDeleteConfirm}
          clientName={clientToDelete.name}
        />
      )}
    </div>
  );
};

export default Home;
