
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  id: string;
  title: string;
  content: string;
  date: string;
  client_id: string;
  created_at: string;
}

const ClientAgenda = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();
  const { clients } = useSettings();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      // Find client from context instead of fetching from Supabase
      const clientData = clients.find(c => c.id === clientId);
      if (!clientData) {
        throw new Error("Client not found");
      }
      return clientData;
    },
    enabled: !!clientId
  });

  useEffect(() => {
    const fetchPosts = async () => {
      if (!clientId) return;
      
      // Since we don't have Supabase tables yet, we'll use mock data
      // This would be replaced with actual Supabase queries once tables are set up
      const mockPosts: Post[] = [];
      setPosts(mockPosts);
    };
    
    fetchPosts();
  }, [clientId, selectedDate]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (isError || !client) {
    return <div>Erro ao carregar os dados do cliente.</div>;
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
        <h1 className="text-2xl font-semibold">{client?.name}</h1>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-3">
            <Calendar className="inline-block w-5 h-5 mr-1 align-middle" />
            Selecione uma data
          </h2>
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={format(selectedDate, 'yyyy-MM-dd', { locale: ptBR })}
            onChange={(e) => handleDateChange(new Date(e.target.value))}
          />
        </div>
      </Card>

      {/* Simple PostList component inline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Postagens para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}</h2>
        {posts.length === 0 ? (
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Nenhuma postagem programada para este dia.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => console.log("Adicionar post")}
            >
              Adicionar Postagem
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-4">
                <h3 className="font-semibold">{post.title}</h3>
                <p className="text-gray-600 line-clamp-2">{post.content}</p>
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => console.log("View post", post.id)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAgenda;
