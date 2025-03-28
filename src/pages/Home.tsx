
import React, { useState } from 'react';
import { LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useSettings } from '@/contexts/SettingsContext';
import ClientCard from '@/components/ClientCard';
import ClientTable from '@/components/ClientTable';
import SettingsModal from '@/components/SettingsModal';
import DashboardCards from '@/components/dashboard/DashboardCards';
import EngagementChart from '@/components/dashboard/EngagementChart';
import ClientActions from '@/components/dashboard/ClientActions';
import AddClientModal from '@/components/dashboard/AddClientModal';
import { ClientFormValues } from '@/components/dashboard/AddClientForm';
import { getActiveClientsCount, getTotalPostsCount, prepareChartData } from '@/utils/dashboardUtils';

const Home = () => {
  const [openAddClientModal, setOpenAddClientModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const { clients, createClient, updateClient, deleteClient, shareClient, selectedClient, setSelectedClient } = useSettings();
  const navigate = useNavigate();

  const handleCloseAddClientModal = () => {
    setOpenAddClientModal(false);
  };

  const onSubmit = async (values: ClientFormValues) => {
    createClient({
      ...values,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    });
    toast.success("Cliente criado com sucesso!");
    handleCloseAddClientModal();
  }

  const handleSelectClient = (clientId: string) => {
    setSelectedClient(clientId);
    navigate(`/client/${clientId}`);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client.id);
    setOpenSettingsModal(true);
  };

  const handleShareClient = (clientId: string) => {
    shareClient(clientId);
    toast.success("Cliente compartilhado com sucesso!");
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    toast.success("Cliente removido com sucesso!");
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  // Calculate dashboard metrics
  const activeClientsCount = getActiveClientsCount(clients);
  const totalPostsCount = getTotalPostsCount(clients);
  const chartData = prepareChartData(clients);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="neutral"
            size="sm"
            onClick={handleLogout}
            className="rounded-[10px]"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
          <Button 
            variant="neutral" 
            onClick={() => setOpenSettingsModal(true)}
            className="rounded-[10px]"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards 
        clients={clients} 
        activeClientsCount={activeClientsCount} 
        totalPostsCount={totalPostsCount} 
      />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <ClientActions 
          isTableView={isTableView} 
          setIsTableView={setIsTableView} 
          setOpenAddClientModal={setOpenAddClientModal} 
        />
      </div>

      {!clients || clients.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Nenhum cliente cadastrado
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Engagement Chart */}
      <EngagementChart chartData={chartData} />

      {/* Add Client Modal */}
      <AddClientModal 
        open={openAddClientModal} 
        onOpenChange={setOpenAddClientModal}
        onSubmit={onSubmit}
        onCancel={handleCloseAddClientModal}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={openSettingsModal}
        onOpenChange={setOpenSettingsModal}
        initialTab="clients"
        editClientId={selectedClient}
      />
    </div>
  );
};

export default Home;
