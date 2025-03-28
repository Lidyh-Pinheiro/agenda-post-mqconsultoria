
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import CalendarEntry from '@/components/CalendarEntry';
import { useSettings, Client } from '@/contexts/SettingsContext';

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
  socialNetworks?: string[];
}

const SharedClientAgenda = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const { settings } = useSettings();
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    
    // Find the client
    const foundClient = settings.clients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
      
      // Load the posts for this client
      const storedPosts = localStorage.getItem('calendarPosts');
      if (storedPosts) {
        const allPosts = JSON.parse(storedPosts);
        const clientPosts = allPosts.filter((post: CalendarPost) => post.clientId === clientId);
        
        // Sort posts by date
        const sortedPosts = [...clientPosts].sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('/'));
          const dateB = new Date(b.date.split('/').reverse().join('/'));
          return dateA.getTime() - dateB.getTime();
        });
        
        setPosts(sortedPosts);
      }
    }
    setLoading(false);
  }, [clientId, settings.clients]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando agenda...</p>
        </div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-800">Cliente não encontrado</h2>
              <p className="text-gray-700 mt-2">O cliente solicitado não foi encontrado ou não existe.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const themeColor = client.themeColor || "#dc2626";
  
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}15, white)` }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 
            className="text-3xl font-bold tracking-tight"
            style={{ color: themeColor }}
          >
            Agenda de Postagens
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2">
            {client.name}
          </h2>
          <p className="text-gray-700 mt-2">
            {client.description || "Confira abaixo as postagens planejadas"}
          </p>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr print:grid-cols-1 print:gap-8">
            {posts.map((post) => (
              <div key={post.id} className="flex print:page-break-inside-avoid">
                <CalendarEntry
                  date={post.date}
                  day={post.dayOfWeek}
                  title={post.title}
                  type={post.postType}
                  text={post.text}
                  highlighted={true}
                  themeColor={themeColor}
                  completed={post.completed}
                  socialNetworks={post.socialNetworks}
                  preview={true}
                  hideIcons={false}
                  className="print:break-inside-avoid print:shadow-none"
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-700">
                  Nenhuma postagem disponível para visualização
                </h3>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          {settings.companyName && (
            <p className="mt-2">{settings.companyName}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedClientAgenda;
