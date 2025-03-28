
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CalendarEntry from '@/components/CalendarEntry';
import { Calendar } from 'lucide-react';
import Header from '@/components/Header';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog';
import { toast } from 'sonner';
import { fetchClientById, fetchClientPosts } from '@/integrations/supabase/client';

// Updated interface to match database column names
interface CalendarPost {
  id: number;
  date: string;
  day: string;
  dayofweek: string; // Changed from dayOfWeek to match DB
  title: string;
  type: string;
  posttype: string; // Changed from postType to match DB
  text: string;
  completed?: boolean;
  notes?: string;
  images?: string[];
  clientid?: string; // Changed from clientId to match DB
  socialnetworks?: string[]; // Changed from socialNetworks to match DB
  month?: string;
  year?: string;
}

const ClientView = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<any>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Check if client exists and if it requires a password
  useEffect(() => {
    const checkClient = async () => {
      if (!clientId) return;
      
      setLoading(true);
      try {
        const clientData = await fetchClientById(clientId);
        
        if (!clientData) {
          setError('Cliente não encontrado');
          setLoading(false);
          return;
        }
        
        // If client has a password, we need to verify it
        if (clientData.password) {
          setPasswordRequired(true);
          setPasswordDialogOpen(true);
          setLoading(false);
        } else {
          // No password required, load client data
          setClient(clientData);
          loadClientPosts(clientId);
        }
      } catch (err) {
        console.error('Error checking client:', err);
        setError('Erro ao carregar dados do cliente');
        setLoading(false);
      }
    };
    
    checkClient();
  }, [clientId]);
  
  // Load posts for a client from Supabase
  const loadClientPosts = async (id: string) => {
    setLoading(true);
    
    try {
      const postsData = await fetchClientPosts(id);
      setPosts(postsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading client posts:', err);
      setError('Erro ao carregar postagens');
      setLoading(false);
    }
  };
  
  // Verify password and load client data
  const handlePasswordVerify = async (password: string) => {
    if (!clientId) return false;
    
    try {
      const clientData = await fetchClientById(clientId, password);
      
      if (!clientData) {
        toast.error('Senha incorreta', {
          description: 'Por favor, tente novamente.'
        });
        return false;
      }
      
      setClient(clientData);
      setPasswordDialogOpen(false);
      loadClientPosts(clientId);
      return true;
    } catch (err) {
      console.error('Error verifying password:', err);
      toast.error('Erro ao verificar senha', {
        description: 'Por favor, tente novamente mais tarde.'
      });
      return false;
    }
  };
  
  const parsePostDate = (dateStr: string) => {
    const [day, month] = dateStr.split('/');
    const year = new Date().getFullYear();
    return new Date(year, parseInt(month) - 1, parseInt(day));
  };
  
  const isDateWithPosts = (date: Date) => {
    return posts.some(post => {
      const postDate = parsePostDate(post.date);
      return isSameDay(postDate, date);
    });
  };
  
  if (loading && !passwordDialogOpen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          O cliente solicitado não foi encontrado ou ocorreu um erro ao carregar os dados.
        </p>
        <Button onClick={() => navigate('/')}>
          Voltar ao Início
        </Button>
      </div>
    );
  }
  
  if (passwordRequired && !client) {
    return (
      <PasswordConfirmDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        onConfirm={handlePasswordVerify}
        title="Acesso Protegido"
        description="Esta agenda está protegida. Por favor, digite a senha para acessar."
      />
    );
  }
  
  // Ensure client exists before rendering
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cliente não encontrado</p>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${client.themeColor}10, white)` }}
    >
      <div 
        className="fixed top-0 right-0 w-1/3 h-1/3 rounded-bl-full opacity-30 -z-10"
        style={{ backgroundColor: `${client.themeColor}20` }}
      />
      <div 
        className="fixed bottom-0 left-0 w-1/2 h-1/2 rounded-tr-full opacity-20 -z-10"
        style={{ backgroundColor: `${client.themeColor}20` }}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          <Header 
            title={client.name} 
            subtitle="Agenda de Postagens" 
            themeColor={client.themeColor}
            showSettings={false}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="md:col-span-1">
              <Card className="p-4 shadow-md bg-white">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar 
                    className="w-5 h-5 mr-2"
                    style={{ color: client.themeColor }} 
                  />
                  Calendário
                </h3>
                <div className="bg-white rounded-lg shadow-sm p-1">
                  <div className="calendar-container">
                    <CalendarComponent
                      mode="single"
                      className="p-3 pointer-events-auto"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      modifiers={{
                        booked: (date) => isDateWithPosts(date)
                      }}
                      modifiersStyles={{
                        booked: {
                          backgroundColor: `${client.themeColor}20`,
                          borderRadius: '50%',
                          color: client.themeColor,
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold mb-6"
                style={{ color: client.themeColor }}>
                Postagens Programadas
              </h2>
              
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow text-center">
                  <p className="text-gray-500 mb-4">Nenhuma postagem encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {posts.map((post) => (
                    <CalendarEntry
                      key={post.id}
                      date={post.date}
                      day={post.dayofweek}
                      title={post.title}
                      type={post.posttype}
                      text={post.text}
                      highlighted={true}
                      themeColor={client.themeColor}
                      completed={post.completed}
                      socialNetworks={post.socialnetworks || []}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TransitionLayout>
      </div>
    </div>
  );
};

export default ClientView;
