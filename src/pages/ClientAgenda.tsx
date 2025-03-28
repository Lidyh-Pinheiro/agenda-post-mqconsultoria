import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Post } from '@/contexts/SettingsContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import PostList from '@/components/PostList';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RouteParams {
  clientId: string;
}

const ClientAgenda = () => {
  const { clientId } = useParams<RouteParams>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const { data: client, isLoading, isError } = useQuery(
    ['client', clientId],
    async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  );

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

      <PostList posts={posts} clientId={clientId} />
    </div>
  );
};

export default ClientAgenda;
