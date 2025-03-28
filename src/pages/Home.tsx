
import React, { useState } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsModal from '@/components/SettingsModal';
import ClientCard from '@/components/ClientCard';

const Home = () => {
  const { settings, selectClient, addClient } = useSettings();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const handleSelectClient = (clientId: string) => {
    selectClient(clientId);
    navigate('/agenda');
  };
  
  const handleAddClient = () => {
    setSettingsOpen(true);
  };
  
  const handleOpenCalendar = () => {
    // Navigate directly to agenda without selecting a client
    navigate('/agenda');
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white">
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-red-100 rounded-bl-full opacity-30 -z-10" />
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-red-100 rounded-tr-full opacity-20 -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          <Header 
            title="Agenda de Postagens" 
            subtitle={settings.ownerName}
            showSettings={true}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          
          <div className="flex justify-center mb-8">
            <Button 
              onClick={handleOpenCalendar}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6"
            >
              <Calendar className="w-4 h-4" />
              Acessar Agenda Principal
            </Button>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Clientes</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {settings.clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onSelect={() => handleSelectClient(client.id)}
              />
            ))}
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-[200px] hover:border-red-300 cursor-pointer transition-colors"
              onClick={handleAddClient}
            >
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-gray-600 text-center">Adicionar novo cliente</p>
            </div>
          </div>
          
          {settings.clients.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">Você ainda não tem clientes cadastrados.</p>
              <Button
                onClick={handleAddClient}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cliente
              </Button>
            </div>
          )}
        </TransitionLayout>
        
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • {settings.ownerName}</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
