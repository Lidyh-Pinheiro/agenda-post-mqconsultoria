
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import Header from '@/components/Header';
import { toast } from 'sonner';

const ClientAgenda = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, setCurrentClient } = useSettings();
  
  // Find the client by ID
  const client = clients.find(c => c.id === clientId);
  
  useEffect(() => {
    // If client exists, set it as current
    if (client) {
      setCurrentClient(client);
    } else {
      // If client doesn't exist, navigate back to homepage
      toast.error("Cliente não encontrado");
      navigate('/');
    }
    
    // Cleanup - reset current client when leaving page
    return () => setCurrentClient(null);
  }, [client, clientId, navigate, setCurrentClient]);

  if (!client) {
    return null; // Will redirect due to the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Header 
        title={`Agenda de ${client.name}`} 
        subtitle="Gerencie os agendamentos deste cliente"
        showSettings={true}
      />
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4">Detalhes do Cliente</h2>
        <div className="space-y-2">
          <p><span className="font-medium">ID:</span> {client.id}</p>
          <p><span className="font-medium">Nome:</span> {client.name}</p>
        </div>
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Agendamentos</h3>
          <p className="text-gray-500 italic">Nenhum agendamento registrado para este cliente.</p>
        </div>
      </div>
    </div>
  );
};

export default ClientAgenda;
