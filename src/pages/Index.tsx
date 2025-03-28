import React, { useState, useEffect } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import CalendarEntry from '@/components/CalendarEntry';
import { toast } from 'sonner';
import { Check, X, Upload, Image, Calendar, Edit, Save, ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import SettingsModal from '@/components/SettingsModal';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
import { Filter, FileDown } from 'lucide-react';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

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

const calendarPosts: CalendarPost[] = [
  {
    id: 1,
    date: '25/03',
    day: 'Segunda-feira',
    dayOfWeek: 'Segunda',
    title: 'Agenda da Semana',
    type: 'Feed + Stories',
    postType: 'Agenda',
    text: '📅 Agenda da Semana! Confira os compromissos da vereadora Neia Marques e acompanhe de perto as ações que fazem a diferença para nossa cidade! 💙✨\n#MandatoAtivo #NeiaMarques #Belém',
    completed: false,
    notes: ''
  },
  {
    id: 2,
    date: '26/03',
    day: 'Terça-feira',
    dayOfWeek: 'Terça',
    title: 'Visita a [local da visita]',
    type: 'Registro + Reels',
    postType: 'Visita',
    text: '🏡 Hoje estivemos em [nome do local], ouvindo a comunidade e discutindo soluções para [tema da visita]. Nosso compromisso é com um mandato participativo e próximo do povo! ✊💙\n#PolíticaComPropósito #NeiaMarques #TrabalhoPeloPovo',
    completed: false,
    notes: ''
  },
  {
    id: 3,
    date: '27/03',
    day: 'Quarta-feira',
    dayOfWeek: 'Quarta',
    title: 'Trecho de fala da Vereadora',
    type: 'Vídeo curto',
    postType: 'Discurso',
    text: '🎤 Palavra da vereadora! No nosso mandato, trabalhamos para [tema abordado]. Assista e compartilhe essa mensagem! 📢✊\n#NeiaMarques #PolíticaParaTodos #VozDoPovo',
    completed: false,
    notes: ''
  },
  {
    id: 4,
    date: '28/03',
    day: 'Quinta-feira',
    dayOfWeek: 'Quinta',
    title: '#TBT de Ação Recente',
    type: 'Foto + Texto',
    postType: 'Memória',
    text: '📸 #TBT de um momento especial! Relembramos nossa ação em [local], onde trabalhamos para [tema abordado]. Seguimos firmes por uma Belém mais justa e sustentável! 🌱💙',
    completed: false,
    notes: ''
  },
  {
    id: 5,
    date: '29/03',
    day: 'Sexta-feira',
    dayOfWeek: 'Sexta',
    title: 'Reunião com [liderança ou instituição]',
    type: 'Registro fotográfico + Legenda',
    postType: 'Reunião',
    text: '🤝 Hoje estivemos reunidos com [liderança/instituição] para discutir [tema tratado]. O diálogo e a construção coletiva são essenciais para avançarmos em políticas públicas eficientes! ✊💙\n#ParceriasQueTransformam #NeiaMarques #CompromissoComBelém',
    completed: false,
    notes: ''
  },
  {
    id: 6,
    date: '30/03',
    day: 'Sábado',
    dayOfWeek: 'Sábado',
    title: 'Bastidores do Mandato',
    type: 'Stories interativos',
    postType: 'Bastidores',
    text: '📍 Você já conhece os bastidores do nosso trabalho? Acompanhe no stories um pouco da rotina e dos desafios do dia a dia! 💙✨\n#PorDentroDoMandato #NeiaMarques #Transparência',
    completed: false,
    notes: ''
  },
  {
    id: 7,
    date: '31/03',
    day: 'Domingo',
    dayOfWeek: 'Domingo',
    title: 'Reflexão da Semana',
    type: 'Card Motivacional',
    postType: 'Reflexão',
    text: '🌟 Nova semana, novos desafios! Que possamos seguir com fé, força e determinação para transformar nossa cidade! 💙✨',
    completed: false,
    notes: ''
  }
];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postId = searchParams.get('post');
  
  const { settings, getSelectedClient } = useSettings();
  const selectedClient = getSelectedClient();
  const themeColor = selectedClient ? selectedClient.themeColor : "#dc2626";
  
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState<CalendarPost[]>([]);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<CalendarPost | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [page, setPage] = useState(1);
  const postsPerPage = 10;
  
  useEffect(() => {
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      let allPosts = JSON.parse(storedPosts);
      
      if (selectedClient) {
        const clientPosts = allPosts.filter(
          (post: CalendarPost) => !post.clientId || post.clientId === selectedClient.id
        );
        setPosts(clientPosts);
      } else {
        const nonClientPosts = allPosts.filter(
          (post: CalendarPost) => !post.clientId
        );
        setPosts(nonClientPosts);
      }
    } else {
      setPosts(calendarPosts);
    }
  }, [selectedClient]);

  useEffect(() => {
    if (posts.length > 0) {
      const storedPosts = localStorage.getItem('calendarPosts');
      if (storedPosts) {
        const allPosts = JSON.parse(storedPosts);
        
        const postsToKeep = allPosts.filter((p: CalendarPost) => 
          !posts.some(newP => newP.id === p.id)
        );
        
        localStorage.setItem('calendarPosts', JSON.stringify([...postsToKeep, ...posts]));
      } else {
        localStorage.setItem('calendarPosts', JSON.stringify(posts));
      }
    }
  }, [posts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
    }, 300);

    return () => clearTimeout(timer);
  }, [posts]);
  
  useEffect(() => {
    if (postId && posts.length > 0) {
      const post = posts.find(p => p.id === parseInt(postId));
      if (post) {
        handleSelectPost(post);
      }
    }
  }, [postId, posts]);
  
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

  const [filteredPosts, setFilteredPosts] = useState<CalendarPost[]>([]);
  const paginatedPosts = filteredPosts.slice((page - 1) * postsPerPage, page * postsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

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

  const handleSelectPost = (post: CalendarPost) => {
    const currentPost = posts.find(p => p.id === post.id) || post;
    setSelectedPost(currentPost);
    setEditedPost({...currentPost});
    setIsDetailView(true);
    setIsEditing(false);
    
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleBackToCalendar = () => {
    setIsDetailView(false);
    setIsEditing(false);
    
    navigate('/agenda', { replace: true });
    
    setTimeout(() => {
      setSelectedPost(null);
      setEditedPost(null);
    }, 300);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Texto copiado para a área de transferência!", {
      description: "Agora é só colar onde você precisar.",
      duration: 3000,
    });
  };

  const handleCompleteTask = (postId: number, completed: boolean) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, completed } : post
    ));
    
    toast(completed ? "Tarefa marcada como concluída!" : "Tarefa desmarcada", {
      duration: 2000,
    });
  };

  const handleUpdateNotes = (postId: number, notes: string) => {
    setPosts(prev => {
      const updatedPosts = prev.map(post => 
        post.id === postId ? { ...post, notes } : post
      );
      
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost({ ...selectedPost, notes });
      }
      
      return updatedPosts;
    });
  };

  const handleImageUpload = async (postId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const uploadedImageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${postId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('post_images')
          .upload(filePath, file);
          
        if (error) {
          throw error;
        }
        
        const { data: urlData } = supabase.storage
          .from('post_images')
          .getPublicUrl(filePath);
          
        uploadedImageUrls.push(urlData.publicUrl);
      }
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedImages = [...(post.images || []), ...uploadedImageUrls];
          
          if (selectedPost && selectedPost.id === postId) {
            setSelectedPost({
              ...selectedPost,
              images: updatedImages
            });
            
            if (editedPost) {
              setEditedPost({
                ...editedPost,
                images: updatedImages
              });
            }
          }
          
          return { ...post, images: updatedImages };
        }
        return post;
      }));
      
      toast("Imagem(ns) adicionada(s) com sucesso!", {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast("Erro ao fazer upload da imagem.", {
        description: "Tente novamente mais tarde.",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async (postId: number, imageIndex: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post || !post.images || !post.images[imageIndex]) return;
      
      const imageUrl = post.images[imageIndex];
      
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (imageUrl.includes('supabase')) {
        const { error } = await supabase.storage
          .from('post_images')
          .remove([fileName]);
          
        if (error) {
          console.error('Error removing image from storage:', error);
        }
      }
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId && post.images) {
          const updatedImages = [...post.images];
          updatedImages.splice(imageIndex, 1);
          
          if (selectedPost && selectedPost.id === postId) {
            setSelectedPost({
              ...selectedPost,
              images: updatedImages
            });
            
            if (editedPost) {
              setEditedPost({
                ...editedPost,
                images: updatedImages
              });
            }
          }
          
          return { ...post, images: updatedImages };
        }
        return post;
      }));

      toast("Imagem removida!", {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error removing image:', error);
      toast("Erro ao remover imagem.", {
        description: "Tente novamente mais tarde.",
        duration: 3000,
      });
    }
  };

  const handleEditMode = () => {
    setIsEditing(true);
    setEditedPost(selectedPost ? {...selectedPost} : null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPost(selectedPost);
  };

  const handleSaveEdit = () => {
    if (!editedPost) return;
    
    if (selectedClient) {
      editedPost.clientId = selectedClient.id;
    }
    
    setPosts(prev => prev.map(post => 
      post.id === editedPost.id ? editedPost : post
    ));
    
    setSelectedPost(editedPost);
    setIsEditing(false);
    
    toast("Alterações salvas com sucesso!", {
      duration: 2000,
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: document.getElementById('allPostsSection')?.offsetTop || 0, behavior: 'smooth' });
  };

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
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          {!isDetailView ? (
            <>
              <div className="mb-6 flex items-center">
                <Button
                  onClick={handleBackToHome}
                  variant="ghost"
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao início
                </Button>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <Header 
                  title="Agenda de Postagens" 
                  subtitle={selectedClient ? selectedClient.name : settings.ownerName} 
                  themeColor={themeColor}
                  showSettings={true}
                  onOpenSettings={() => setSettingsOpen(true)}
                />
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
                      themeColor={themeColor}
                      completed={post.completed}
                      onSelect={() => handleSelectPost(post)}
                    />
                  </div>
                ))}
              </div>
              
              <div id="allPostsSection" className="mt-20">
                <div className="flex justify-between items-center mb-8">
                  <h2 
                    className="text-2xl font-bold"
                    style={{ color: themeColor }}
                  >
                    Todas as Postagens
                  </h2>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
                  >
                    <FileDown className="h-4 w-4" />
                    <span className="text-sm">Exportar PDF</span>
                  </Button>
                </div>
                
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
                            mode="default"
                            className="p-3 pointer-events-auto"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
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
                                <TableRow key={post.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleSelectPost(post)}>
                                  <TableCell className="font-medium">
                                    <div className="text-white text-xs font-medium py-1 px-2 rounded-full inline-flex"
                                      style={{ backgroundColor: themeColor }}
                                    >
                                      {post.date}
                                    </div>
                                  </TableCell>
                                  <TableCell>{post.title}</TableCell>
                                  <TableCell>{post.postType}</TableCell>
                                  <TableCell>
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
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="hover:bg-gray-100"
                                      style={{ color: themeColor }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectPost(post);
                                      }}
                                    >
                                      Ver detalhes
                                    </Button>
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
            </>
          ) : selectedPost ? (
            <div className="animate-fade-in">
              <button 
                onClick={handleBackToCalendar}
                className="mb-6 flex items-center transition-colors"
                style={{ color: themeColor }}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar ao calendário
              </button>
              
              <div className="glass-card rounded-2xl p-8 shadow-xl border"
                style={{ borderColor: `${themeColor}40` }}
              >
                <div className="flex items-center justify-between mb-6">
                  {isEditing ? (
                    <Input 
                      value={editedPost?.date || ''}
                      onChange={(e) => setEditedPost(prev => prev ? {...prev, date: e.target.value} : null)}
                      className="w-28 border-gray-200 focus-visible:ring-gray-400 text-white font-medium py-2 px-4 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    />
                  ) : (
                    <div className="text-white font-medium py-2 px-4 rounded-full"
                      style={{ backgroundColor: themeColor }}
                    >
                      {selectedPost.date} • {selectedPost.day}
                    </div>
                  )}
                  
                  {isEditing ? (
                    <Input 
                      value={editedPost?.type || ''}
                      onChange={(e) => setEditedPost(prev => prev ? {...prev, type: e.target.value} : null)}
                      className="w-64 border-gray-200 focus-visible:ring-gray-400 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium"
                    />
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                      {selectedPost.type}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  {isEditing ? (
                    <Input 
                      value={editedPost?.title || ''}
                      onChange={(e) => setEditedPost(prev => prev ? {...prev, title: e.target.value} : null)}
                      className="text-2xl font-bold border-gray-200 focus-visible:ring-gray-400"
                    />
                  ) : (
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                      {selectedPost.title}
                    </h2>
                  )}
                  
                  <div className="flex items-center space-x-4">
                    {!isEditing && (
                      <Button
                        onClick={handleEditMode}
                        variant="outline"
                        className="flex items-center gap-2"
                        style={{ borderColor: `${themeColor}40`, color: themeColor }}
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                    )}
                    
                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex items-center gap-2 border-gray-200"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleSaveEdit}
                          className="flex items-center gap-2 text-white"
                          style={{ backgroundColor: themeColor }}
                        >
                          <Save className="w-4 h-4" />
                          Salvar
                        </Button>
                      </div>
                    )}
                    
                    {!isEditing && (
                      <div 
                        className="flex items-center space-x-2"
                        onClick={() => handleCompleteTask(selectedPost.id, !selectedPost.completed)}
                      >
                        <span className="text-sm text-gray-500">Status:</span>
                        <div className="flex items-center">
                          <Checkbox 
                            id={`task-${selectedPost.id}`}
                            checked={selectedPost.completed}
                            className="data-[state=checked]:bg-green-600 border-green-400"
                          />
                          <label 
                            htmlFor={`task-${selectedPost.id}`} 
                            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            {selectedPost.completed ? "Concluído" : "Pendente"}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Texto para Publicação
                  </h3>
                  {isEditing ? (
                    <Textarea 
                      value={editedPost?.text || ''}
                      onChange={(e) => setEditedPost(prev => prev ? {...prev, text: e.target.value} : null)}
                      className="min-h-[150px] border-gray-200 focus-visible:ring-gray-400 whitespace-pre-line text-gray-600 text-md leading-relaxed"
                    />
                  ) : (
                    <div className="whitespace-pre-line text-gray-600 text-md leading-relaxed">
                      {selectedPost.text}
                    </div>
                  )}
                  {!isEditing && (
                    <Button
                      onClick={() => handleCopyText(selectedPost.text)}
                      className="mt-4 text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      Copiar Texto
                    </Button>
                  )}
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Anotações para esta Publicação
                  </h3>
                  <Textarea 
                    placeholder="Adicione informações específicas, links ou outras observações..."
                    className="min-h-[100px] border-gray-200 focus-visible:ring-gray-400"
                    value={isEditing ? (editedPost?.notes || '') : (selectedPost.notes || '')}
                    onChange={(e) => isEditing 
                      ? setEditedPost(prev => prev ? {...prev, notes: e.target.value} : null)
                      : handleUpdateNotes(selectedPost.id, e.target.value)
                    }
                  />
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Image className="w-5 h-5 mr-2" style={{ color: themeColor }} />
                    Imagens da Publicação
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {selectedPost.images && selectedPost.images.length > 0 ? (
                      selectedPost.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Imagem ${index + 1}`} 
                            className="w-full h-40 object-cover rounded-lg border border-gray-200" 
                          />
                          <button
                            onClick={() => handleRemoveImage(selectedPost.id, index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remover imagem"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic col-span-full">Nenhuma imagem adicionada</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <Upload className="w-8 h-8 mb-2" style={{ color: themeColor }} />
                    <p className="text-sm text-gray-600 mb-2">Clique para adicionar imagens ou arraste e solte aqui</p>
                    
                    <Input
                      type="file"
                      id={`file-upload-${selectedPost.id}`}
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(selectedPost.id, e)}
                      disabled={isUploading}
                    />
                    <label
                      htmlFor={`file-upload-${selectedPost.id}`}
                      className={`inline-flex items-center justify-center text-sm font-medium gap-2 text-white py-2 px-4 rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-gray-400' : ''}`}
                      style={{ backgroundColor: isUploading ? '#9CA3AF' : themeColor }}
                    >
                      {isUploading ? (
                        <>Carregando...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Selecionar Imagens
                        </>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleBackToCalendar}
                    className="flex items-center justify-center gap-2 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-md"
                    style={{ backgroundColor: themeColor }}
                  >
                    Salvar e Voltar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </TransitionLayout>
        
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • {settings.ownerName}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
