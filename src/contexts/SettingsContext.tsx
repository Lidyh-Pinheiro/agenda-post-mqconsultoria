import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Client {
  id: string;
  name: string;
  themeColor: string;
  createdAt: Date;
  postsCount?: number;
  password?: string;
}

export interface Settings {
  companyName: string;
  ownerName: string;
  clients: Client[];
  selectedClientId: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateCompanyName: (name: string) => void;
  updateOwnerName: (name: string) => void;
  addClient: (name: string, themeColor: string, password: string) => string;
  updateClient: (id: string, name: string, themeColor: string, password?: string) => void;
  deleteClient: (id: string, password: string) => boolean;
  selectClient: (id: string | null) => void;
  getSelectedClient: () => Client | null;
  generateClientShareLink: (clientId: string) => string;
  updateClientPostsCount: (clientId: string, count: number) => void;
}

const defaultSettings: Settings = {
  companyName: 'MQ Consultoria',
  ownerName: 'Administrador',
  clients: [
    {
      id: uuidv4(),
      name: 'Vereadora Neia Marques',
      themeColor: '#dc2626',
      createdAt: new Date(),
      postsCount: 12,
      password: '123456',
    }
  ],
  selectedClientId: null,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

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
      createdAt: new Date(),
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

  const deleteClient = (id: string, password: string) => {
    const client = settings.clients.find(client => client.id === id);
    
    if (!client || client.password !== password) {
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

  const getSelectedClient = () => {
    if (!settings.selectedClientId) return null;
    return settings.clients.find(client => client.id === settings.selectedClientId) || null;
  };

  const generateClientShareLink = (clientId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/client/${clientId}`;
  };

  const updateClientPostsCount = (clientId: string, count: number) => {
    setSettings(prev => ({
      ...prev,
      clients: prev.clients.map(client => 
        client.id === clientId ? { ...client, postsCount: count } : client
      ),
    }));
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateCompanyName,
        updateOwnerName, 
        addClient, 
        updateClient, 
        deleteClient, 
        selectClient,
        getSelectedClient,
        generateClientShareLink,
        updateClientPostsCount
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
