
import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Client {
  id: string;
  name: string;
  themeColor: string;
  createdAt: Date;
}

export interface Settings {
  ownerName: string;
  clients: Client[];
  selectedClientId: string | null;
}

interface SettingsContextType {
  settings: Settings;
  updateOwnerName: (name: string) => void;
  addClient: (name: string, themeColor: string) => string;
  updateClient: (id: string, name: string, themeColor: string) => void;
  deleteClient: (id: string) => void;
  selectClient: (id: string | null) => void;
  getSelectedClient: () => Client | null;
  generateClientShareLink: (clientId: string) => string;
}

const defaultSettings: Settings = {
  ownerName: 'Vereadora Neia Marques',
  clients: [],
  selectedClientId: null,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateOwnerName = (name: string) => {
    setSettings(prev => ({ ...prev, ownerName: name }));
  };

  const addClient = (name: string, themeColor: string) => {
    const newClient: Client = {
      id: uuidv4(),
      name,
      themeColor,
      createdAt: new Date(),
    };

    setSettings(prev => ({
      ...prev,
      clients: [...prev.clients, newClient],
      selectedClientId: newClient.id, // Automatically select the new client
    }));

    return newClient.id;
  };

  const updateClient = (id: string, name: string, themeColor: string) => {
    setSettings(prev => ({
      ...prev,
      clients: prev.clients.map(client => 
        client.id === id ? { ...client, name, themeColor } : client
      ),
    }));
  };

  const deleteClient = (id: string) => {
    setSettings(prev => {
      const newSettings = {
        ...prev,
        clients: prev.clients.filter(client => client.id !== id),
      };
      
      // If the deleted client was selected, clear the selection
      if (prev.selectedClientId === id) {
        newSettings.selectedClientId = null;
      }
      
      return newSettings;
    });
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

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        updateOwnerName, 
        addClient, 
        updateClient, 
        deleteClient, 
        selectClient,
        getSelectedClient,
        generateClientShareLink
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
