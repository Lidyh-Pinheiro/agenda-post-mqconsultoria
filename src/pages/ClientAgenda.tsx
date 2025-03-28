import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import CalendarEntry from '@/components/CalendarEntry';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarPost {
  id: number;
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
}

const ClientAgenda = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<CalendarPost[]>([]);
  
  // Find the client by ID
  useEffect(() => {
    if (!clientId) return;
    
    const foundClient = settings.clients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
    } else {
      // Client not found, redirect to home
      navigate('/');
    }
  }, [clientId, settings.clients, navigate]);
  
  // Load posts from localStorage
  useEffect(() => {
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      
      // Filter posts for this client if clientId exists in posts
      // Otherwise, show all posts (for backward compatibility)
      if (clientId) {
        const filteredPosts = allPosts.filter(
          (post: CalendarPost) => !post.clientId || post.clientId === clientId
        );
        setPosts(filteredPosts);
      } else {
        setPosts(allPosts);
      }
    }
  }, [clientId]);
  
  // Animate posts appearing
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
    }, 300);

    return () => clearTimeout(timer);
  }, [posts]);
  
  const handleSelectPost = (post: CalendarPost) => {
    // For public client view, we just view the post details without editing
    navigate(`/client/${clientId}/post/${post.id}`);
  };
  
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white"
      style={{ backgroundImage: client ? `linear-gradient(to bottom right, ${client.themeColor}10, white)` : undefined }}
    >
      <div 
        className="fixed top-0 right-0 w-1/3 h-1/3 rounded-bl-full opacity-30 -z-10"
        style={{ backgroundColor: client ? `${client.themeColor}20` : undefined }}
      />
      <div 
        className="fixed bottom-0 left-0 w-1/2 h-1/2 rounded-tr-full opacity-20 -z-10"
        style={{ backgroundColor: client ? `${client.themeColor}20` : undefined }}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Button>
          
          <Header 
            title={client?.name || 'Agenda de Postagens'} 
            subtitle="Calendário de Publicações" 
            themeColor={client?.themeColor}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {visiblePosts.map((post, index) => (
              <div 
                key={post.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CalendarEntry
                  date={post.date}
                  day={post.dayOfWeek}
                  title={post.title}
                  type={post.postType}
                  text={post.text}
                  highlighted={true}
                  themeColor={client?.themeColor}
                  completed={post.completed}
                  onSelect={() => handleSelectPost(post)}
                />
              </div>
            ))}
            
            {visiblePosts.length === 0 && (
              <div className="col-span-2 text-center py-20">
                <p className="text-gray-500">Nenhuma postagem encontrada.</p>
              </div>
            )}
          </div>
        </TransitionLayout>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • {settings.ownerName}</p>
        </footer>
      </div>
    </div>
  );
};

export default ClientAgenda;
