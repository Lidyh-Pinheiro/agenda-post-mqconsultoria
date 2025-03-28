
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, LogOut, Plus, Edit, Trash2, Filter, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransitionLayout } from '@/components/TransitionLayout';
import CalendarEntry from '@/components/CalendarEntry';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import AddPostModal from '@/components/AddPostModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ShareModal from '@/components/ShareModal';

interface Post {
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'MM'));
  const [page, setPage] = useState(1);
  const postsPerPage = 10;
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | undefined>(undefined);
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
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

  // Load posts from localStorage
  useEffect(() => {
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      if (clientId) {
        const clientPosts = allPosts.filter(
          (post: Post) => post.clientId === clientId
        );
        setPosts(clientPosts);
      }
    }
  }, [clientId]);

  // Filter posts based on month
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

  const handleAddPost = (newPostData: Omit<Post, 'id'>) => {
    const newId = Math.max(0, ...posts.map(p => p.id)) + 1;
    const newPost: Post = {
      id: newId,
      ...newPostData,
      completed: false,
      notes: '',
      clientId: clientId
    };
    
    // Add to local posts state
    setPosts(prev => [...prev, newPost]);
    
    // Update in localStorage
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      localStorage.setItem('calendarPosts', JSON.stringify([...allPosts, newPost]));
    } else {
      localStorage.setItem('calendarPosts', JSON.stringify([newPost]));
    }
    
    toast("Postagem adicionada com sucesso!", {
      description: `${newPost.date} - ${newPost.title}`,
      duration: 3000,
    });
  };
  
  const openDeleteConfirmation = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = () => {
    if (postToDelete === null) return;
    
    // Remove from local state
    setPosts(prev => prev.filter(post => post.id !== postToDelete));
    
    // Update localStorage
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      const updatedPosts = allPosts.filter((post: Post) => post.id !== postToDelete);
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    }
    
    setDeleteDialogOpen(false);
    setPostToDelete(null);
    
    toast("Postagem removida com sucesso!", {
      duration: 3000,
    });
  };
  
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarSelectedDate(date);
      setAddPostOpen(true);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  const handleSelectPost = (postId: number) => {
    navigate(`/client/${clientId}/post/${postId}`);
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
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: document.getElementById('allPostsSection')?.offsetTop || 0, behavior: 'smooth' });
  };

  const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const themeColor = client ? client.themeColor : "#dc2626";

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (isError || !client) {
    return <div>Erro ao carregar os dados do cliente.</div>;
  }

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}10, white)` }}
    >
      <div 
        className="fixed top-0 right-0 w-1/3 h-1/3 rounded-bl-full opacity-30 -z-10"
        style={{ backgroundColor: `${themeColor}20` }}
      />
      <div 
        className="fixed bottom-0 left-0 w-1/2 h-1/2 rounded-tr-full opacity-20 -z-10"
        style={{ backgroundColor: `${themeColor}20` }}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <TransitionLayout>
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

          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center" style={{ color: themeColor }}>
              <Calendar className="h-5 w-5 mr-2" />
              Agenda de Postagens
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setAddPostOpen(true)}
                className="text-white flex items-center gap-2"
                style={{ backgroundColor: themeColor }}
              >
                <Plus className="w-4 h-4" />
                Nova Postagem
              </Button>
              <Button
                variant="outline"
                className="text-gray-700 border-gray-300 flex items-center gap-2"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>

          {/* Calendar entries grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {posts.length > 0 ? (
              posts.map((post, index) => (
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
                    themeColor={themeColor}
                    completed={post.completed}
                    onSelect={() => handleSelectPost(post.id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center bg-gray-50 rounded-lg border border-dashed">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Nenhuma postagem programada para este cliente.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setAddPostOpen(true)}
                >
                  Adicionar Postagem
                </Button>
              </div>
            )}
          </div>
          
          <div id="allPostsSection" className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <Card className="p-4 shadow-md bg-white">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar 
                      className="w-5 h-5 mr-2"
                      style={{ color: themeColor }} 
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
                            backgroundColor: `${themeColor}20`,
                            borderRadius: '50%',
                            color: themeColor,
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
                        style={{ color: themeColor }} 
                      />
                      Lista de Postagens
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">Filtrar por mês:</span>
                      <Select 
                        value={filterMonth} 
                        onValueChange={setFilterMonth}
                      >
                        <SelectTrigger 
                          className="w-[140px] focus:ring-0 focus:ring-offset-0"
                          style={{ borderColor: `${themeColor}40` }}
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
                        {paginatedPosts.length > 0 ? (
                          paginatedPosts.map((post) => (
                            <TableRow key={post.id} className="cursor-pointer hover:bg-gray-50">
                              <TableCell className="font-medium" onClick={() => handleSelectPost(post.id)}>
                                <div className="text-white text-xs font-medium py-1 px-2 rounded-full inline-flex"
                                  style={{ backgroundColor: themeColor }}
                                >
                                  {post.date}
                                </div>
                              </TableCell>
                              <TableCell onClick={() => handleSelectPost(post.id)}>{post.title}</TableCell>
                              <TableCell onClick={() => handleSelectPost(post.id)}>{post.postType}</TableCell>
                              <TableCell onClick={() => handleSelectPost(post.id)}>
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
                                    style={{ color: themeColor }}
                                    onClick={() => handleSelectPost(post.id)}
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
                  
                  {filteredPosts.length > postsPerPage && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => page > 1 && handlePageChange(page - 1)}
                            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={pageNum === page}
                              onClick={() => handlePageChange(pageNum)}
                              style={pageNum === page ? { borderColor: themeColor, color: themeColor } : {}}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => page < totalPages && handlePageChange(page + 1)}
                            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </TransitionLayout>
      </div>

      <AddPostModal 
        open={addPostOpen}
        onOpenChange={setAddPostOpen}
        onSave={handleAddPost}
        initialDate={calendarSelectedDate}
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
        clientId={clientId || null}
      />
    </div>
  );
};

export default ClientAgenda;
