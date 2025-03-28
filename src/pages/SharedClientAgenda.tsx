
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { getPostsFromLocalStorage } from '@/integrations/supabase/client';

// Import components
import LoadingState from '@/components/shared-client/LoadingState';
import ClientNotFound from '@/components/shared-client/ClientNotFound';
import PasswordProtection from '@/components/shared-client/PasswordProtection';
import PostsGrid from '@/components/shared-client/PostsGrid';
import ClientAgendaHeader from '@/components/shared-client/ClientAgendaHeader';
import ClientAgendaFooter from '@/components/shared-client/ClientAgendaFooter';

interface CalendarPost {
  id: string;
  date: string;
  day: string;
  dayOfWeek: string;
  title: string;
  type: string;
  postType: string;
  text: string;
  completed?: boolean;
  notes?: string;
  images?: string[];
  clientId?: string;
  socialNetworks?: string[];
}

const SharedClientAgenda = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { settings } = useSettings();
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPasswordProtected, setIsPasswordProtected] = useState(true);
  
  // Enhanced function to parse date strings consistently
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 2) {
      // Add current year for DD/MM format
      const currentYear = new Date().getFullYear();
      return new Date(currentYear, parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else if (parts.length === 3) {
      // For DD/MM/YYYY format
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    // Fallback to original string parsing
    return new Date(dateStr.split('/').reverse().join('-'));
  };
  
  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    
    // Find the client
    const foundClient = settings.clients.find(c => c.id === clientId);
    
    if (foundClient) {
      setClient(foundClient);
      console.log("Found client:", foundClient.name);
      
      // Check if client has a password set
      if (foundClient.password) {
        setIsPasswordProtected(true);
      } else {
        setIsPasswordProtected(false);
        loadPosts(foundClient);
      }
    } else {
      console.log('Client not found with ID:', clientId);
      setLoading(false);
    }
  }, [clientId, settings.clients]);

  const loadPosts = async (foundClient: Client) => {
    try {
      // Get client posts from localStorage only
      const clientPosts = getPostsFromLocalStorage(clientId);
      console.log('Posts from localStorage:', clientPosts);
      
      if (clientPosts.length > 0) {
        // Process and sort posts from localStorage
        const sortedPosts = [...clientPosts].sort((a, b) => {
          try {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateA.getTime() - dateB.getTime();
          } catch (err) {
            console.error("Date parsing error:", err, a.date, b.date);
            return 0;
          }
        });
        
        setPosts(sortedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPassword = (password: string) => {
    if (!client || !client.password) {
      return;
    }
    
    if (password === client.password) {
      setIsPasswordProtected(false);
      loadPosts(client);
    }
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (!client) {
    return <ClientNotFound />;
  }
  
  if (isPasswordProtected) {
    return (
      <PasswordProtection 
        clientName={client.name}
        themeColor={client.themeColor || "#dc2626"}
        onPasswordVerified={handleVerifyPassword}
      />
    );
  }
  
  const themeColor = client.themeColor || "#dc2626";
  
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white print:bg-white"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}15, white)` }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <ClientAgendaHeader 
          clientName={client.name}
          description={client.description}
          themeColor={themeColor}
        />
        
        <PostsGrid posts={posts} themeColor={themeColor} />
        
        <ClientAgendaFooter companyName={settings.companyName} />
      </div>
    </div>
  );
};

export default SharedClientAgenda;
