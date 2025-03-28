
import React, { useState, useEffect } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, PanelLeft, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import ClientTable from '@/components/ClientTable';
import ClientCard from '@/components/ClientCard';
import SettingsModal from '@/components/SettingsModal';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const navigate = useNavigate();
  const { settings, clients } = useSettings();
  const [activeTab, setActiveTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [isTableView, setIsTableView] = useState(false);
  const [clientStats, setClientStats] = useState({
    total: 0,
    active: 0,
  });
  const [postsStats, setPostsStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  useEffect(() => {
    // Calculate client stats
    const totalClients = clients.length;
    const activeClients = clients.filter(client => client.active).length;

    setClientStats({
      total: totalClients,
      active: activeClients,
    });

    // Get posts statistics
    const fetchPostStats = async () => {
      try {
        // Try to get from Supabase first
        const { data: postsData, error } = await supabase
          .from('posts')
          .select('*');

        let allPosts = [];
        
        if (error || !postsData || postsData.length === 0) {
          // Fallback to localStorage
          const storedPosts = localStorage.getItem('calendarPosts');
          allPosts = storedPosts ? JSON.parse(storedPosts) : [];
        } else {
          allPosts = postsData;
        }

        const totalPosts = allPosts.length;
        const completedPosts = allPosts.filter((post: any) => post.completed).length;

        setPostsStats({
          total: totalPosts,
          completed: completedPosts,
          pending: totalPosts - completedPosts,
        });
      } catch (error) {
        console.error('Error fetching post stats:', error);
        // Fallback to localStorage
        const storedPosts = localStorage.getItem('calendarPosts');
        const allPosts = storedPosts ? JSON.parse(storedPosts) : [];
        
        const totalPosts = allPosts.length;
        const completedPosts = allPosts.filter((post: any) => post.completed).length;

        setPostsStats({
          total: totalPosts,
          completed: completedPosts,
          pending: totalPosts - completedPosts,
        });
      }
    };

    fetchPostStats();
  }, [clients]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('isAdmin');
    navigate('/login');
    toast.success("Logout realizado com sucesso");
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleEditClient = (client: any) => {
    setEditClientId(client.id);
    setShowSettings(true);
  };

  const handleShareClient = (clientId: string) => {
    const shareUrl = `${window.location.origin}/client-view/${clientId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        toast.success("Link de compartilhamento copiado!", {
          description: "Compartilhe este link com o cliente."
        });
      })
      .catch(err => {
        toast.error("Erro ao copiar o link", {
          description: "Tente copiar manualmente."
        });
        console.error('Failed to copy:', err);
      });
  };

  const handleSelectClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleDeleteClient = (clientId: string) => {
    // This is just a placeholder - actual delete functionality would need to be implemented
    toast.error("Funcionalidade de exclusão não implementada no painel admin");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <TransitionLayout>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <Button
                onClick={handleBackToHome}
                variant="ghost"
                className="mr-4 flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao início
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Painel de Administração</h1>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                className="flex items-center"
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                Configurações
              </Button>
              
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-500" />
                  Clientes
                </CardTitle>
                <CardDescription>Visão geral dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-600 text-sm font-medium">Total</p>
                    <p className="text-3xl font-bold text-blue-800">{clientStats.total}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-600 text-sm font-medium">Ativos</p>
                    <p className="text-3xl font-bold text-green-800">{clientStats.active}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                  Postagens
                </CardTitle>
                <CardDescription>Visão geral das postagens</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-600 text-sm font-medium">Total</p>
                    <p className="text-2xl font-bold text-purple-800">{postsStats.total}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-600 text-sm font-medium">Concluídas</p>
                    <p className="text-2xl font-bold text-green-800">{postsStats.completed}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-600 text-sm font-medium">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-800">{postsStats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <PanelLeft className="mr-2 h-5 w-5 text-indigo-500" />
                  Sistema
                </CardTitle>
                <CardDescription>Informações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-2 space-y-2">
                  <div className="p-3 bg-indigo-50 rounded-md">
                    <p className="text-sm font-medium text-indigo-700">Nome da Empresa</p>
                    <p className="text-lg font-semibold">{settings.companyName || "MQ Consultoria"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700">Administrador</p>
                    <p className="text-lg font-semibold">{settings.ownerName || "Administrador"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto mb-8">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Atividades</CardTitle>
                  <CardDescription>
                    Atividades recentes no sistema de gestão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-4">Nenhuma atividade recente para mostrar.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clients" className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gerenciamento de Clientes</CardTitle>
                    <CardDescription>
                      Visualize e gerencie todos os clientes do sistema
                    </CardDescription>
                  </div>
                  <Button 
                    variant="neutral" 
                    size="sm" 
                    onClick={() => setIsTableView(!isTableView)}
                    className="rounded-[10px]"
                  >
                    {isTableView ? "Visualização em Card" : "Visualização em Tabela"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isTableView ? (
                    <ClientTable 
                      clients={clients}
                      onSelect={handleSelectClient}
                      onEdit={handleEditClient}
                      onShare={handleShareClient}
                      onDelete={handleDeleteClient}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {clients.map((client) => (
                        <ClientCard
                          key={client.id}
                          client={client}
                          onSelect={() => handleSelectClient(client.id)}
                          onEdit={() => handleEditClient(client)}
                          onShare={() => handleShareClient(client.id)}
                          onDelete={() => handleDeleteClient(client.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TransitionLayout>
      </div>
      
      <SettingsModal 
        open={showSettings} 
        onOpenChange={setShowSettings} 
        initialTab={editClientId ? "clients" : "general"}
        editClientId={editClientId}
      />
    </div>
  );
};

export default Admin;
