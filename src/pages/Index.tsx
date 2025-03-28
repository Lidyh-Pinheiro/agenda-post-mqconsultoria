
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Calendar, Settings } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import SettingsModal from '@/components/SettingsModal';
import ClientCard from '@/components/ClientCard';

const Index = () => {
  const { ownerName, clients, themeColor } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const getThemeColorClass = () => {
    switch (themeColor) {
      case 'blue': return 'bg-blue-600';
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      case 'orange': return 'bg-orange-600';
      default: return 'bg-red-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Header 
        title={`Agenda de ${ownerName}`} 
        subtitle="Gerencie sua agenda e seus clientes"
        showSettings={true}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className={`rounded-xl p-6 text-white ${getThemeColorClass()}`}>
          <h2 className="text-xl font-bold mb-2">Postagens Recentes</h2>
          <p className="opacity-80 mb-4">Veja suas postagens mais recentes</p>
          <Link to="/all-posts">
            <Button className="bg-white text-black hover:bg-gray-100">
              Ver Postagens
            </Button>
          </Link>
        </div>

        <div className={`rounded-xl p-6 text-white ${getThemeColorClass()}`}>
          <h2 className="text-xl font-bold mb-2">Configurações</h2>
          <p className="opacity-80 mb-4">Personalize sua agenda</p>
          <Button 
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>
      
      {/* Clients Section */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Meus Clientes</h2>
          <Button onClick={() => setSettingsOpen(true)}>
            Adicionar Cliente
          </Button>
        </div>
        
        {clients.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">Nenhum cliente cadastrado</h3>
            <p className="text-gray-500 mb-4">Adicione clientes para começar a gerenciar suas agendas</p>
            <Button onClick={() => setSettingsOpen(true)}>
              Adicionar Primeiro Cliente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map(client => (
              <ClientCard 
                key={client.id} 
                id={client.id} 
                name={client.name} 
              />
            ))}
          </div>
        )}
      </div>
      
      <SettingsModal 
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
};

export default Index;
