
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Client {
  id: string;
  name: string;
  themeColor: string;
  createdAt: string;
  postsCount?: number;
  password?: string;
  active?: boolean;
  description?: string;
}

export interface Settings {
  companyName: string;
  ownerName: string;
  email: string;
  password: string;
  clients: Client[];
  selectedClientId: string | null;
}

interface SettingsContextType {
  settings: Settings;
  clients: Client[];
  updateCompanyName: (name: string) => void;
  updateOwnerName: (name: string) => void;
  updateEmail: (email: string) => void;
  updatePassword: (password: string) => void;
  addClient: (name: string, themeColor: string, password: string) => string;
  createClient: (client: Partial<Client>) => void;
  updateClient: (id: string, name: string, themeColor: string, password?: string) => void;
  deleteClient: (id: string, password?: string) => boolean;
  selectClient: (id: string | null) => void;
  setSelectedClient: (id: string | null) => void;
  getSelectedClient: () => Client | null;
  selectedClient: string | null;
  generateClientShareLink: (clientId: string) => string;
  updateClientPostsCount: (clientId: string, count: number) => void;
  shareClient: (clientId: string) => void;
  showAccountSettings: boolean;
  setShowAccountSettings: (show: boolean) => void;
  updateClientPassword: (clientId: string, password: string) => void;
  verifyClientPassword: (clientId: string, password: string) => Promise<boolean>;
}

const defaultSettings: Settings = {
  companyName: 'MQ Consultoria',
  ownerName: 'Administrador',
  email: 'admin@example.com',
  password: 'admin123',
  clients: [
    {
      id: uuidv4(),
      name: 'Vereadora Neia Marques',
      themeColor: '#dc2626',
      createdAt: new Date().toISOString(),
      postsCount: 12,
      password: '123456',
    }
  ],
  selectedClientId: null,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
    
    // Load clients from Supabase on initial load
    loadClientsFromSupabase();
  }, []);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);
  
  const loadClientsFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*');
      
      if (error) {
        console.error('Error loading clients from Supabase:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Map Supabase clients to our Client type
        const mappedClients: Client[] = data.map(client => ({
          id: client.id,
          name: client.name,
          themeColor: client.themecolor,
          createdAt: client.created_at || new Date().toISOString(),
          password: client.password,
          description: client.description,
          active: true
        }));
        
        setSettings(prev => ({
          ...prev,
          clients: mappedClients
        }));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const updateCompanyName = (name: string) => {
    setSettings(prev => ({ ...prev, companyName: name }));
  };

  const updateOwnerName = (name: string) => {
    setSettings(prev => ({ ...prev, ownerName: name }));
  };

  const updateEmail = (email: string) => {
    setSettings(prev => ({ ...prev, email: email }));
  };

  const updatePassword = (password: string) => {
    setSettings(prev => ({ ...prev, password: password }));
  };

  const addClient = (name: string, themeColor: string, password: string) => {
    if (!password || password.trim() === '') {
      toast.error("A senha do cliente é obrigatória");
      return '';
    }
    
    const newClient: Client = {
      id: uuidv4(),
      name,
      themeColor,
      createdAt: new Date().toISOString(),
      postsCount: 0,
      password,
      active: true,
    };
    
    // Save to Supabase
    saveClientToSupabase(newClient);

    setSettings(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
      selectedClientId: newClient.id,
    }));

    return newClient.id;
  };
  
  const saveClientToSupabase = async (client: Client) => {
    try {
      const { error } = await supabase.from('clients').insert({
        id: client.id,
        name: client.name,
        themecolor: client.themeColor,
        password: client.password,
        description: client.description
      });
      
      if (error) {
        console.error('Error saving client to Supabase:', error);
        toast.error("Erro ao salvar cliente no banco de dados");
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const createClient = (client: Partial<Client>) => {
    if (!client.password || client.password.trim() === '') {
      toast.error("A senha do cliente é obrigatória");
      return;
    }
    
    const newClient: Client = {
      id: uuidv4(),
      name: client.name || 'New Client',
      themeColor: client.themeColor || '#dc2626',
      createdAt: client.createdAt || new Date().toISOString(),
      postsCount: client.postsCount || 0,
      password: client.password,
      active: client.active !== undefined ? client.active : true,
      description: client.description || '',
    };
    
    // Save to Supabase
    saveClientToSupabase(newClient);

    setSettings(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
      selectedClientId: newClient.id,
    }));
  };

  const updateClient = (id: string, name: string, themeColor: string, password?: string) => {
    const clientToUpdate = settings.clients.find(client => client.id === id);
    if (!clientToUpdate) return;
    
    const updatedClient = { 
      ...clientToUpdate, 
      name, 
      themeColor,
      ...(password ? { password } : {})
    };
    
    // Update in Supabase
    updateClientInSupabase(id, {
      name,
      themecolor: themeColor,
      ...(password ? { password } : {})
    });
    
    setSettings(prev => ({
      ...prev,
      clients: prev.clients.map(client => {
        if (client.id === id) {
          return updatedClient;
        }
        return client;
      }),
    }));
  };
  
  const updateClientInSupabase = async (id: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating client in Supabase:', error);
        toast.error("Erro ao atualizar cliente no banco de dados");
      }
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const deleteClient = (id: string, password?: string) => {
    const client = settings.clients.find(client => client.id === id);
    
    if (!client || (password && client.password !== password)) {
      return false;
    }
    
    // Delete from Supabase
    deleteClientFromSupabase(id);
    
    setSettings(prev => {
      const newSettings = {
        ...prev,
        clients: prev.clients.filter(client => client.id !== id),
      };
      
      if (prev.selectedClientId === id) {
        newSettings.selectedClientId = null;
      }
      
      return newSettings;
    });
    
    return true;
  };
  
  const deleteClientFromSupabase = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting client from Supabase:', error);
        toast.error("Erro ao excluir cliente do banco de dados");
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const selectClient = (id: string | null) => {
    setSettings(prev => ({ ...prev, selectedClientId: id }));
  };

  const setSelectedClient = (id: string | null) => {
    setSettings(prev => ({ ...prev, selectedClientId: id }));
  };

  const getSelectedClient = () => {
    if (!settings.selectedClientId) return null;
    return settings.clients.find(client => client.id === settings.selectedClientId) || null;
  };

  const generateClientShareLink = (clientId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/client-view/${clientId}`;
  };

  const updateClientPostsCount = (clientId: string, count: number) => {
    setSettings(prev => ({
      ...prev,
      clients: prev.clients.map(client => 
        client.id === clientId ? { ...client, postsCount: count } : client
      ),
    }));
  };

  const shareClient = (clientId: string) => {
    console.log(`Sharing client with ID: ${clientId}`);
  };

  const updateClientPassword = (clientId: string, password: string) => {
    if (!password.trim()) return; // Don't update if password is empty
    
    // Update the password in Supabase
    updateClientInSupabase(clientId, { password });
    
    setSettings(prev => ({
      ...prev,
      clients: prev.clients.map(client => {
        if (client.id === clientId) {
          return { ...client, password };
        }
        return client;
      }),
    }));
  };
  
  const verifyClientPassword = async (clientId: string, password: string): Promise<boolean> => {
    try {
      // First try to verify against Supabase
      const { data, error } = await supabase
        .from('clients')
        .select('password')
        .eq('id', clientId)
        .single();
      
      if (error) {
        console.error('Error verifying password in Supabase:', error);
        // Fall back to local verification if Supabase fails
        const client = settings.clients.find(c => c.id === clientId);
        return client?.password === password;
      }
      
      if (data) {
        return data.password === password;
      }
      
      // If no data from Supabase, fall back to local verification
      const client = settings.clients.find(c => c.id === clientId);
      return client?.password === password;
    } catch (error) {
      console.error('Error verifying client password:', error);
      // Fall back to local verification on error
      const client = settings.clients.find(c => c.id === clientId);
      return client?.password === password;
    }
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings,
        clients: settings.clients, 
        updateCompanyName,
        updateOwnerName, 
        updateEmail,
        updatePassword,
        addClient,
        createClient,
        updateClient, 
        deleteClient, 
        selectClient,
        setSelectedClient,
        selectedClient: settings.selectedClientId,
        getSelectedClient,
        generateClientShareLink,
        updateClientPostsCount,
        shareClient,
        showAccountSettings,
        setShowAccountSettings,
        updateClientPassword,
        verifyClientPassword
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
