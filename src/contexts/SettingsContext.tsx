
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { firebaseDB } from '@/integrations/firebase/client';

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
  updateClientPassword: (clientId: string, password: string) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);

  // Initial load from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      const storedSettings = await firebaseDB.getSettings();
      if (storedSettings) {
        setSettings(storedSettings);
      }
      setIsInitialized(true);
    };
    
    loadSettings();
  }, []);

  // Subscribe to real-time updates from Firebase
  useEffect(() => {
    if (!isInitialized) return;
    
    const unsubscribe = firebaseDB.subscribeToSettings((newSettings) => {
      if (newSettings && JSON.stringify(newSettings) !== JSON.stringify(settings)) {
        setSettings(newSettings);
      }
    });
    
    return () => unsubscribe();
  }, [isInitialized, settings]);

  // Save to Firebase when settings change
  useEffect(() => {
    if (!isInitialized) return;
    
    firebaseDB.setSettings(settings);
  }, [settings, isInitialized]);

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
    console.log(`Sharing client with ID: ${clientId}`);
  };

  const updateClientPassword = (clientId: string, password: string) => {
    if (!password.trim()) return; // Don't update if password is empty
    
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
        setShowAccountSettings,
        updateClientPassword
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
