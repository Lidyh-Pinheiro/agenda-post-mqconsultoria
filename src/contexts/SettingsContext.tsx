
import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeColor = 'red' | 'blue' | 'green' | 'purple' | 'orange';

interface ClientData {
  id: string;
  name: string;
  logo?: string;
}

interface SettingsContextType {
  ownerName: string;
  setOwnerName: (name: string) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  clients: ClientData[];
  addClient: (client: ClientData) => void;
  removeClient: (clientId: string) => void;
  updateClient: (clientId: string, data: Partial<ClientData>) => void;
  currentClient: ClientData | null;
  setCurrentClient: (client: ClientData | null) => void;
}

const defaultSettings = {
  ownerName: 'Vereadora Neia Marques',
  themeColor: 'red' as ThemeColor,
  clients: [],
  currentClient: null
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ownerName, setOwnerName] = useState(defaultSettings.ownerName);
  const [themeColor, setThemeColor] = useState<ThemeColor>(defaultSettings.themeColor);
  const [clients, setClients] = useState<ClientData[]>(defaultSettings.clients);
  const [currentClient, setCurrentClient] = useState<ClientData | null>(defaultSettings.currentClient);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setOwnerName(parsedSettings.ownerName || defaultSettings.ownerName);
      setThemeColor(parsedSettings.themeColor || defaultSettings.themeColor);
      setClients(parsedSettings.clients || []);
      setCurrentClient(parsedSettings.currentClient || null);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify({
      ownerName,
      themeColor,
      clients,
      currentClient
    }));
  }, [ownerName, themeColor, clients, currentClient]);

  const addClient = (client: ClientData) => {
    setClients(prev => [...prev, client]);
  };

  const removeClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
    if (currentClient?.id === clientId) {
      setCurrentClient(null);
    }
  };

  const updateClient = (clientId: string, data: Partial<ClientData>) => {
    setClients(prev => prev.map(client => 
      client.id === clientId ? { ...client, ...data } : client
    ));
    
    if (currentClient?.id === clientId) {
      setCurrentClient(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <SettingsContext.Provider value={{
      ownerName,
      setOwnerName,
      themeColor,
      setThemeColor,
      clients,
      addClient,
      removeClient,
      updateClient,
      currentClient,
      setCurrentClient
    }}>
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
