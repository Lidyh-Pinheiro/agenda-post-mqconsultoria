
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, MessageCircle, Eye, EyeOff, Instagram, Facebook, Link, LogOut } from 'lucide-react';
import CalendarEntry from '@/components/CalendarEntry';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  time?: string;
}

const ClientView = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { settings, verifyClientPassword } = useSettings();
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    
    const loadClientData = async () => {
      try {
        console.log('Loading client with ID:', clientId);
        
        // Try to load from Supabase first
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
        
        console.log('Supabase client data:', clientData);
        console.log('Supabase client error:', clientError);
        
        if (clientData) {
          // Map Supabase client fields to our Client type
          const mappedClient: Client = {
            id: clientData.id,
            name: clientData.name,
            themeColor: clientData.themecolor,
            createdAt: clientData.created_at || new Date().toISOString(),
            password: clientData.password || undefined,
            description: clientData.description || undefined
          };
          setClient(mappedClient);
          console.log('Mapped client data:', mappedClient);
        } else if (clientError) {
          console.log('Error fetching client from Supabase, checking local settings');
          // Fallback to local storage data
          const foundClient = settings.clients.find(c => c.id === clientId);
          if (foundClient) {
            setClient(foundClient);
            console.log('Found client in local settings:', foundClient);
            
            // Try to save this client to Supabase for future reference
            try {
              const { error: insertError } = await supabase.from('clients').insert({
                id: foundClient.id,
                name: foundClient.name,
                themecolor: foundClient.themeColor,
                password: foundClient.password,
                description: foundClient.description
              });
              
              if (insertError) {
                console.error('Error syncing local client to Supabase:', insertError);
              } else {
                console.log('Successfully synced local client to Supabase');
              }
            } catch (syncError) {
              console.error('Exception when syncing local client to Supabase:', syncError);
            }
          } else {
            console.log('Client not found in either Supabase or local settings');
          }
        }
        
        // Check if user is already authenticated
        const storedAuth = localStorage.getItem(`client_auth_${clientId}`);
        if (storedAuth) {
          setAuthenticated(true);
          await loadClientPosts(clientId);
        }
      } catch (error) {
        console.error('Error loading client:', error);
        // Fallback to local storage data
        const foundClient = settings.clients.find(c => c.id === clientId);
        if (foundClient) {
          setClient(foundClient);
          console.log('Error fallback - found client in local settings:', foundClient);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadClientData();
  }, [clientId, settings.clients]);
  
  const loadClientPosts = async (clientId: string) => {
    try {
      console.log('Loading posts for client ID:', clientId);
      
      // Try to load from Supabase first
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('clientid', clientId);
      
      console.log('Supabase posts data:', postsData);
      console.log('Supabase posts error:', postsError);
      
      if (postsData && postsData.length > 0) {
        // Map Supabase post fields to our CalendarPost type
        const mappedPosts: CalendarPost[] = postsData.map(post => ({
          id: post.id,
          date: post.date,
          day: post.day,
          dayOfWeek: post.dayofweek,
          title: post.title,
          type: post.type || '',
          postType: post.posttype,
          text: post.text || '',
          completed: post.completed || false,
          notes: post.notes || '',
          images: post.images || [],
          clientId: post.clientid || '',
          socialNetworks: post.socialnetworks || [],
          time: post.time || ''
        }));
        
        setPosts(sortPostsByDate(mappedPosts));
        console.log('Mapped posts from Supabase:', mappedPosts);
      } else {
        console.log('No posts found in Supabase or error occurred, checking localStorage');
        // Fallback to local storage data
        const storedPosts = localStorage.getItem('calendarPosts');
        if (storedPosts) {
          const parsedPosts = JSON.parse(storedPosts);
          const clientPosts = parsedPosts.filter((post: CalendarPost) => post.clientId === clientId);
          setPosts(sortPostsByDate(clientPosts));
          console.log('Loaded posts from localStorage:', clientPosts);
          
          // Try to sync these posts to Supabase for future reference
          if (clientPosts.length > 0) {
            try {
              console.log('Syncing local posts to Supabase...');
              // Map local posts to Supabase format
              const supabasePosts = clientPosts.map((post: CalendarPost) => ({
                date: post.date,
                day: post.day,
                dayofweek: post.dayOfWeek,
                title: post.title,
                type: post.type,
                posttype: post.postType,
                text: post.text,
                completed: post.completed || false,
                notes: post.notes || '',
                images: post.images || [],
                clientid: post.clientId,
                socialnetworks: post.socialNetworks || [],
                time: post.time || ''
              }));
              
              // Using upsert to avoid duplicates
              for (const post of supabasePosts) {
                const { error } = await supabase.from('posts').upsert(post);
                if (error) {
                  console.error('Error syncing post to Supabase:', error);
                }
              }
              console.log('Posts sync completed');
            } catch (syncError) {
              console.error('Exception when syncing posts to Supabase:', syncError);
            }
          }
        } else {
          console.log('No posts found in localStorage either');
        }
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to local storage data
      const storedPosts = localStorage.getItem('calendarPosts');
      if (storedPosts) {
        const parsedPosts = JSON.parse(storedPosts);
        const clientPosts = parsedPosts.filter((post: CalendarPost) => post.clientId === clientId);
        setPosts(sortPostsByDate(clientPosts));
        console.log('Error fallback - loaded posts from localStorage:', clientPosts);
      }
    }
  };
  
  const sortPostsByDate = (postsToSort: CalendarPost[]): CalendarPost[] => {
    return [...postsToSort].sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('/'));
      const dateB = new Date(b.date.split('/').reverse().join('/'));
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  const handleAuthenticate = async () => {
    if (!client || !password || !clientId) return;
    
    console.log('Authenticating with password:', password);
    
    try {
      const isValid = await verifyClientPassword(clientId, password);
      
      if (isValid) {
        setAuthenticated(true);
        localStorage.setItem(`client_auth_${clientId}`, 'true');
        await loadClientPosts(clientId);
        setError('');
        toast.success("Acesso autorizado!");
      } else {
        setError('Senha incorreta. Por favor, tente novamente.');
        toast.error("Senha incorreta");
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('Erro ao verificar senha. Por favor, tente novamente.');
      toast.error("Erro de autenticação");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem(`client_auth_${clientId}`);
    setAuthenticated(false);
    setPassword('');
    toast.success("Você saiu com sucesso!");
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const copyUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("URL copiada!", {
      description: "Link de acesso copiado para a área de transferência."
    });
  };
  
  const shareViaWhatsApp = () => {
    const url = window.location.href;
    const text = `Confira a agenda de postagens de ${client?.name}: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
  
  if (!authenticated) {
    return (
      <div 
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4"
        style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}15, white)` }}
      >
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-8 px-6">
            <div className="text-center mb-6">
              <div 
                className="w-16 h-16 rounded-full bg-opacity-20 flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${themeColor}30` }}
              >
                <Lock className="w-8 h-8" style={{ color: themeColor }} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Área do Cliente</h2>
              <h3 className="text-xl font-medium mt-1">{client.name}</h3>
              <p className="text-gray-600 mt-2">
                Por favor, insira a senha para acessar sua agenda de postagens
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Senha de acesso"
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                    className="w-full pr-10"
                  />
                  <Button 
                    type="button" 
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                onClick={handleAuthenticate}
                className="w-full"
                style={{ backgroundColor: themeColor }}
              >
                Acessar Agenda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}15, white)` }}
    >
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
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
              {client.description || "Planejamento da Semana/Mês"}
            </p>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </div>
          
        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          <Button
            onClick={shareViaWhatsApp}
            className="inline-flex items-center gap-2 text-white"
            style={{ backgroundColor: "#25D366" }}
          >
            <MessageCircle className="h-5 w-5" />
            <span>Compartilhar via WhatsApp</span>
          </Button>
          
          <Button
            onClick={copyUrl}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <Link className="h-5 w-5" />
            <span>Copiar Link</span>
          </Button>
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr mt-8">
            {posts.map((post) => (
              <div key={post.id} className="flex">
                <CalendarEntry
                  date={post.date + (post.time ? ` ${post.time}` : '')}
                  day={post.dayOfWeek}
                  title={post.title}
                  type={post.postType}
                  text={post.text}
                  highlighted={true}
                  themeColor={themeColor}
                  completed={post.completed}
                  socialNetworks={post.socialNetworks}
                  preview={true}
                  hideIcons={true}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="w-full mt-8">
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

export default ClientView;
