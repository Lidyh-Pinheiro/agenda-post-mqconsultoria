import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

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
  clients: Client[];
  selectedClientId: string | null;
}

interface SettingsContextType {
  settings: Settings;
  clients: Client[];
  updateCompanyName: (name: string) => void;
  updateOwnerName: (name: string) => void;
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
}

const defaultSettings: Settings = {
  companyName: 'MQ Consultoria',
  ownerName: 'Administrador',
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
  }, []);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateCompanyName = (name: string) => {
    setSettings(prev => ({ ...prev, companyName: name }));
  };

  const updateOwnerName = (name: string) => {
    setSettings(prev => ({ ...prev, ownerName: name }));
  };

  const addClient = (name: string, themeColor: string, password: string) => {
    const newClient: Client = {
      id: uuidv4(),
      name,
      themeColor,
      createdAt: new Date().toISOString(),
      postsCount: 0,
      password,
    };

    setSettings(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
      selectedClientId: newClient.id,
    }));

    return newClient.id;
  };

  const createClient = (client: Partial<Client>) => {
    const newClient: Client = {
      id: uuidv4(),
      name: client.name || 'New Client',
      themeColor: client.themeColor || '#dc2626',
      createdAt: client.createdAt || new Date().toISOString(),
      postsCount: client.postsCount || 0,
      password: client.password || '123456',
      active: client.active !== undefined ? client.active : true,
      description: client.description || '',
    };

    setSettings(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
      selectedClientId: newClient.id,
    }));
  };

  const updateClient = (id: string, name: string, themeColor: string, password?: string) => {
    setSettings(prev => ({
      ...prev,
      clients: prev.clients.map(client => {
        if (client.id === id) {
          return { 
            ...client, 
            name, 
            themeColor,
            ...(password ? { password } : {})
          };
        }
        return client;
      }),
    }));
  };

  const deleteClient = (id: string, password?: string) => {
    const client = settings.clients.find(client => client.id === id);
    
    if (!client || (password && client.password !== password)) {
      return false;
    }
    
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
    return `${baseUrl}/shared/client/${clientId}`;
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
    // Implementation for sharing client
    console.log(`Sharing client with ID: ${clientId}`);
    // This would be implemented with actual sharing logic
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings,
        clients: settings.clients, 
        updateCompanyName,
        updateOwnerName, 
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
        setShowAccountSettings
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
