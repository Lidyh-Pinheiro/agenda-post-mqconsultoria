
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define Post type and Client type
interface Post {
  id: string;
  title: string;
  content: string;
  client_id: string;
  date: string;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

const ClientAgenda = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data as Client;
    }
  });

  useEffect(() => {
    const fetchPosts = async () => {
      if (!clientId) return;

      const formattedDate = format(selectedDate, 'yyyy-MM-dd', { locale: ptBR });

      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('client_id', clientId)
        .eq('date', formattedDate)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      setPosts(postsData || []);
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
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
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

      {/* Create a simple implementation of PostList */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Postagens</h2>
        {posts.length === 0 ? (
          <Card className="p-4">
            <p className="text-gray-500 text-center">Nenhuma postagem para esta data.</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="p-4">
              <h3 className="font-medium text-lg">{post.title}</h3>
              <p className="text-gray-600 mt-2">{post.content}</p>
              <div className="mt-3 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/client/${clientId}/post/${post.id}`)}
                >
                  Ver detalhes
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientAgenda;
