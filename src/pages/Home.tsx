
import React, { useState } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import { useSettings } from '@/contexts/SettingsContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Settings, Calendar, UserPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SettingsModal from '@/components/SettingsModal';
import ClientCard from '@/components/ClientCard';
import ClientTable from '@/components/ClientTable';
import ShareModal from '@/components/ShareModal';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Home = () => {
  const { settings, selectClient, addClient } = useSettings();
  const navigate = useNavigate();
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareClientId, setShareClientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
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

  const handleEditClient = (clientId: string) => {
    setEditClientId(clientId);
    setSettingsOpen(true);
  };

  const handleShareClient = (clientId: string) => {
    setShareClientId(clientId);
    setShareModalOpen(true);
  };
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white">
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-red-100 rounded-bl-full opacity-30 -z-10" />
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-red-100 rounded-tr-full opacity-20 -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          <Header 
            title="Dashboard" 
            subtitle={settings.companyName}
            showSettings={true}
            onOpenSettings={() => setSettingsOpen(true)}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Clientes</h3>
                    <p className="text-3xl font-semibold">{settings.clients.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Agendas</h3>
                    <p className="text-3xl font-semibold">
                      {settings.clients.reduce((total, client) => total + (client.postsCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700">Postagens</h3>
                    <p className="text-3xl font-semibold">
                      {settings.clients.reduce((total, client) => total + (client.postsCount || 0), 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Clientes</h2>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleAddClient}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cliente
              </Button>
              
              <Button 
                onClick={handleOpenCalendar}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Calendar className="w-4 h-4" />
                Agenda Principal
              </Button>
            </div>
          </div>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'table')}>
            <div className="flex justify-end mb-4">
              <TabsList>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="table">Tabela</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="cards" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {settings.clients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onSelect={() => handleSelectClient(client.id)}
                    onEdit={() => handleEditClient(client.id)}
                    onShare={() => handleShareClient(client.id)}
                  />
                ))}
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-[215px] hover:border-red-300 cursor-pointer transition-colors"
                  onClick={handleAddClient}
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-gray-600 text-center">Adicionar novo cliente</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="table" className="mt-0">
              <ClientTable 
                clients={settings.clients}
                onSelect={handleSelectClient}
                onEdit={(client) => handleEditClient(client.id)}
                onShare={(clientId) => handleShareClient(clientId)}
              />
              
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
            </TabsContent>
          </Tabs>
          
          {settings.clients.length === 0 && viewMode === 'cards' && (
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
        
        <SettingsModal 
          open={settingsOpen} 
          onOpenChange={setSettingsOpen} 
          initialTab={editClientId ? 'clients' : 'general'}
          editClientId={editClientId}
        />
        
        <ShareModal 
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          clientId={shareClientId}
        />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>{settings.companyName} • {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;
