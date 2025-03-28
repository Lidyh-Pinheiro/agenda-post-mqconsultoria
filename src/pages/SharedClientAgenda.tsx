
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import CalendarEntry from '@/components/CalendarEntry';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { Printer, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
      
      // Load the posts for this client
      const storedPosts = localStorage.getItem('calendarPosts');
      if (storedPosts) {
        try {
          const allPosts = JSON.parse(storedPosts);
          
          // More robust filtering with additional logging
          console.log("All posts:", allPosts);
          console.log("Looking for clientId:", clientId);
          
          const clientPosts = allPosts.filter((post: CalendarPost) => {
            const matches = post.clientId === clientId;
            if (matches) {
              console.log("Matched post:", post.title);
            }
            return matches;
          });
          
          console.log('Client ID:', clientId);
          console.log('Total posts found:', allPosts.length);
          console.log('Filtered posts for client:', clientPosts.length);
          
          if (clientPosts.length === 0) {
            console.log('No posts found for this client. Client ID might not match or there are no posts.');
            
            // Additional check for malformed data
            allPosts.forEach((post: CalendarPost) => {
              console.log(`Post client ID: ${post.clientId}, Current client ID: ${clientId}, Match: ${post.clientId === clientId}`);
            });
          }
          
          // Sort posts by date
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
        } catch (error) {
          console.error('Error parsing stored posts:', error);
          toast.error('Erro ao carregar as postagens');
        }
      } else {
        console.log('No posts found in localStorage');
      }
    } else {
      console.log('Client not found with ID:', clientId);
    }
    setLoading(false);
  }, [clientId, settings.clients]);
  
  const handlePrint = () => {
    window.print();
  };
  
  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência');
  };
  
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
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white print:bg-white"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}15, white)` }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8 print:mb-12">
          <h1 
            className="text-3xl font-bold tracking-tight print:text-4xl"
            style={{ color: themeColor }}
          >
            Agenda de Postagens
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-2 print:text-3xl">
            {client.name}
          </h2>
          <p className="text-gray-700 mt-2 print:text-lg">
            {client.description || "Confira abaixo as postagens planejadas"}
          </p>
          
          <div className="mt-4 print:hidden flex justify-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              <Printer className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button
              onClick={copyPageLink}
              variant="outline"
              className="flex items-center gap-2"
              style={{ borderColor: themeColor, color: themeColor }}
            >
              <Copy className="w-4 h-4" />
              Copiar Link
            </Button>
          </div>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr print:grid-cols-2 print:gap-8">
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
                  socialNetworks={post.socialNetworks || []}
                  preview={true}
                  hideIcons={true}
                  className="print:shadow-none print:border print:border-gray-200"
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
                <p className="text-gray-500 mt-2">
                  Não foram encontradas postagens para este cliente. Verifique se as postagens foram adicionadas ou se o link está correto.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="mt-12 text-center text-gray-600 text-sm print:mt-16 print:text-base">
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
