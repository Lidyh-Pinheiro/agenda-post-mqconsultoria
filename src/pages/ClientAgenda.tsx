
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { ArrowLeft, Calendar, Filter, Plus, Trash2, Share, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import CalendarEntry from '@/components/CalendarEntry';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format, isSameDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AddPostModal from '@/components/AddPostModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ShareModal from '@/components/ShareModal';
import { fetchClientById, fetchClientPosts, savePost, deletePost } from '@/integrations/supabase/client';

interface CalendarPost {
  id: number;
  date: string;
  day: string;
  dayOfWeek: string;
  title: string;
  type: string;
  posttype: string;
  text: string;
  completed?: boolean;
  notes?: string;
  images?: string[];
  clientid?: string;
  socialnetworks?: string[];
  month?: string;
  year?: string;
}

const ClientAgenda = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<CalendarPost[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'MM'));
  const [filteredPosts, setFilteredPosts] = useState<CalendarPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | undefined>(undefined);
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load client data
  useEffect(() => {
    if (!clientId) return;
    
    const loadClient = async () => {
      try {
        // First try to find client in settings context
        const contextClient = settings.clients.find(c => c.id === clientId);
        
        if (contextClient) {
          setClient(contextClient);
        } else {
          // If not found in context, try to fetch from Supabase
          const supabaseClient = await fetchClientById(clientId);
          if (supabaseClient) {
            setClient(supabaseClient as Client);
          } else {
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error loading client:', error);
        toast.error('Erro ao carregar dados do cliente');
        navigate('/');
      }
    };
    
    loadClient();
  }, [clientId, settings.clients, navigate]);
  
  // Load posts for this client from Supabase
  useEffect(() => {
    if (!clientId) return;
    
    const loadPosts = async () => {
      setLoading(true);
      try {
        const postsData = await fetchClientPosts(clientId);
        setPosts(sortPostsByDate(postsData));
        setLoading(false);
      } catch (error) {
        console.error('Error loading posts:', error);
        toast.error('Erro ao carregar postagens');
        setLoading(false);
      }
    };
    
    loadPosts();
  }, [clientId]);
  
  // Animation delay for posts display
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [posts]);
  
  // Filter posts by month
  useEffect(() => {
    if (posts.length > 0) {
      if (filterMonth === 'all') {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter(post => {
          const postMonth = post.date.split('/')[1];
          return postMonth === filterMonth;
        });
        setFilteredPosts(filtered);
      }
    }
  }, [filterMonth, posts]);
  
  const sortPostsByDate = (postsToSort: CalendarPost[]): CalendarPost[] => {
    return [...postsToSort].sort((a, b) => {
      const dateA = parse(a.date, 'dd/MM', new Date());
      const dateB = parse(b.date, 'dd/MM', new Date());
      
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  const handleAddPost = async (newPostData: Omit<CalendarPost, 'id'>) => {
    if (!clientId) return;
    
    try {
      if (editingPost) {
        // Update existing post
        const updatedPost = {
          ...editingPost,
          ...newPostData,
        };
        
        const savedPost = await savePost(updatedPost);
        
        if (savedPost) {
          setPosts(prev => 
            sortPostsByDate(
              prev.map(post => post.id === editingPost.id ? savedPost : post)
            )
          );
          
          setEditingPost(null);
          
          toast.success("Postagem atualizada com sucesso!", {
            description: `${newPostData.date} - ${newPostData.title}`
          });
        } else {
          toast.error("Erro ao atualizar postagem");
        }
      } else {
        // Create new post
        const newPost = {
          ...newPostData,
          completed: false,
          notes: '',
          clientid: clientId
        };
        
        const savedPost = await savePost(newPost);
        
        if (savedPost) {
          setPosts(prev => sortPostsByDate([...prev, savedPost]));
          
          toast.success("Postagem adicionada com sucesso!", {
            description: `${newPost.date} - ${newPost.title}`
          });
        } else {
          toast.error("Erro ao adicionar postagem");
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error("Erro ao salvar postagem");
    }
  };
  
  const openDeleteConfirmation = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = async () => {
    if (postToDelete === null) return;
    
    try {
      const success = await deletePost(postToDelete);
      
      if (success) {
        setPosts(prev => prev.filter(post => post.id !== postToDelete));
        toast.success("Postagem removida com sucesso!");
      } else {
        toast.error("Erro ao remover postagem");
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Erro ao remover postagem");
    }
    
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };
  
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarSelectedDate(date);
      setEditingPost(null);
      setAddPostOpen(true);
    }
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handleViewPostDetail = (postId: number) => {
    navigate(`/client/${clientId}/post/${postId}`);
  };
  
  const handleEditPost = (post: CalendarPost) => {
    setEditingPost(post);
    setAddPostOpen(true);
  };
  
  const parsePostDate = (dateStr: string) => {
    const [day, month] = dateStr.split('/');
    const year = new Date().getFullYear();
    return new Date(year, parseInt(month) - 1, parseInt(day));
  };
  
  const isDateWithPosts = (date: Date) => {
    return filteredPosts.some(post => {
      const postDate = parsePostDate(post.date);
      return isSameDay(postDate, date);
    });
  };
  
  const handleFileUpload = async (postId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(postId);
    const uploadedImageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        const fileUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        uploadedImageUrls.push(fileUrl);
      }
      
      // Find the post to update
      const postToUpdate = posts.find(p => p.id === postId);
      
      if (postToUpdate) {
        const updatedPost = {
          ...postToUpdate,
          images: [...(postToUpdate.images || []), ...uploadedImageUrls]
        };
        
        const savedPost = await savePost(updatedPost);
        
        if (savedPost) {
          setPosts(prev => prev.map(post => {
            if (post.id === postId) {
              return savedPost;
            }
            return post;
          }));
          
          toast.success("Arquivo(s) adicionado(s) com sucesso!");
        } else {
          toast.error("Erro ao salvar imagens");
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao fazer upload do arquivo.", {
        description: "Tente novamente mais tarde."
      });
    } finally {
      setIsUploading(null);
    }
  };
  
  const handleToggleStatus = async (postId: number) => {
    // Find the post to update
    const postToUpdate = posts.find(p => p.id === postId);
    
    if (postToUpdate) {
      const updatedPost = {
        ...postToUpdate,
        completed: !postToUpdate.completed
      };
      
      try {
        const savedPost = await savePost(updatedPost);
        
        if (savedPost) {
          setPosts(prev => prev.map(post => {
            if (post.id === postId) {
              return savedPost;
            }
            return post;
          }));
          
          toast.success("Status da postagem atualizado!", {
            duration: 2000,
          });
        } else {
          toast.error("Erro ao atualizar status");
        }
      } catch (error) {
        console.error('Error updating post status:', error);
        toast.error("Erro ao atualizar status");
      }
    }
  };
  
  if (loading && !client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
      </div>
    );
  }
  
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
          <div className="mb-6 flex items-center justify-between">
            <Button
              onClick={handleBackToHome}
              variant="ghost"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao início
            </Button>
            
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Início
            </Button>
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <Header 
              title={client.name} 
              subtitle="Agenda de Postagens" 
              themeColor={client.themeColor}
              showSettings={false}
            />
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  setEditingPost(null);
                  setAddPostOpen(true);
                }}
                className="text-white flex items-center gap-2"
                style={{ backgroundColor: client.themeColor }}
              >
                <Plus className="w-4 h-4" />
                Nova Postagem
              </Button>
              <Button
                onClick={() => setShareModalOpen(true)}
                variant="outline"
                className="text-gray-700 border-gray-300 flex items-center gap-2"
              >
                <Share className="w-4 w-4" />
                Compartilhar Agenda
              </Button>
            </div>
          </div>
          
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
                  themeColor={client.themeColor}
                  completed={post.completed}
                  onSelect={() => handleViewPostDetail(post.id)}
                  onUpload={(e) => handleFileUpload(post.id, e)}
                  onStatusChange={() => handleToggleStatus(post.id)}
                  isUploading={isUploading === post.id}
                  socialNetworks={post.socialNetworks || []}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-20">
            <div className="flex justify-between items-center mb-8">
              <h2 
                className="text-2xl font-bold"
                style={{ color: client.themeColor }}
              >
                Todas as Postagens
              </h2>
              
              <div className="flex items-center space-x-2">
                <Select 
                  value={filterMonth} 
                  onValueChange={setFilterMonth}
                >
                  <SelectTrigger 
                    className="w-[140px] focus:ring-0 focus:ring-offset-0"
                    style={{ borderColor: `${client.themeColor}40` }}
                  >
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="p-4 shadow-md bg-white">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar 
                      className="w-5 h-5 mr-2"
                      style={{ color: client.themeColor }} 
                    />
                    Calendário de Postagens
                  </h3>
                  <div className="bg-white rounded-lg shadow-sm p-1">
                    <div className="calendar-container">
                      <CalendarComponent
                        mode="single"
                        className="p-3 pointer-events-auto"
                        selected={selectedDate}
                        onSelect={handleCalendarDateSelect}
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

              <div className="lg:col-span-2">
                <Card className="p-6 shadow-md bg-white">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Filter 
                        className="w-5 h-5 mr-2"
                        style={{ color: client.themeColor }} 
                      />
                      Lista de Postagens
                    </h3>
                  </div>

                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Data</TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="w-[100px]">Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPosts.length > 0 ? (
                          filteredPosts.map((post) => (
                            <TableRow key={post.id} className="cursor-pointer hover:bg-gray-50">
                              <TableCell className="font-medium" onClick={() => handleViewPostDetail(post.id)}>
                                <div className="text-white text-xs font-medium py-1 px-2 rounded-full inline-flex"
                                  style={{ backgroundColor: client.themeColor }}
                                >
                                  {post.date}
                                </div>
                              </TableCell>
                              <TableCell onClick={() => handleViewPostDetail(post.id)}>{post.title}</TableCell>
                              <TableCell onClick={() => handleViewPostDetail(post.id)}>{post.postType}</TableCell>
                              <TableCell onClick={() => handleViewPostDetail(post.id)}>
                                {post.completed ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Concluído
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Pendente
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:bg-gray-100"
                                    style={{ color: client.themeColor }}
                                    onClick={() => handleEditPost(post)}
                                  >
                                    Editar
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="hover:bg-gray-100"
                                    style={{ color: client.themeColor }}
                                    onClick={() => handleViewPostDetail(post.id)}
                                  >
                                    Ver
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-red-100 text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDeleteConfirmation(post.id);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                              Nenhuma postagem encontrada para este mês.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </TransitionLayout>
      </div>
      
      <AddPostModal 
        open={addPostOpen}
        onOpenChange={(open) => {
          setAddPostOpen(open);
          if (!open) setEditingPost(null);
        }}
        onSave={handleAddPost}
        initialDate={calendarSelectedDate}
        initialPost={editingPost}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePost}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita."
      />
      
      <ShareModal 
        open={shareModalOpen} 
        onOpenChange={setShareModalOpen} 
        clientId={clientId}
      />
    </div>
  );
};

export default ClientAgenda;
