
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { ArrowLeft, Calendar, Filter, Plus, Trash2, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import CalendarEntry from '@/components/CalendarEntry';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from '@/integrations/supabase/client';
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

interface CalendarPost {
  id: string;
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
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!clientId) return;
    
    const foundClient = settings.clients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
    } else {
      navigate('/');
    }
  }, [clientId, settings.clients, navigate]);
  
  useEffect(() => {
    if (!clientId || !client) return;
    
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Fetch posts from Supabase
        const { data: postsData, error: postsError } = await supabase
          .from('calendar_posts')
          .select('*')
          .eq('client_id', clientId);
          
        if (postsError) {
          throw postsError;
        }
        
        if (!postsData || postsData.length === 0) {
          console.log('No posts found in Supabase for client ID:', clientId);
          
          // Check localStorage for posts
          const storedPosts = localStorage.getItem('calendarPosts');
          if (storedPosts) {
            try {
              const allPosts = JSON.parse(storedPosts);
              const clientPosts = allPosts.filter((post: any) => post.clientId === clientId);
              
              if (clientPosts.length > 0) {
                console.log('Found posts in localStorage, migrating to Supabase');
                // Migrate posts from localStorage to Supabase
                for (const post of clientPosts) {
                  await migratePostToSupabase(post);
                }
                
                // Fetch again after migration
                const { data: refreshedData } = await supabase
                  .from('calendar_posts')
                  .select('*')
                  .eq('client_id', clientId);
                  
                if (refreshedData && refreshedData.length > 0) {
                  await processPostsData(refreshedData);
                } else {
                  setPosts([]);
                  setVisiblePosts([]);
                  setFilteredPosts([]);
                }
              } else {
                setPosts([]);
                setVisiblePosts([]);
                setFilteredPosts([]);
              }
            } catch (error) {
              console.error('Error parsing localStorage posts:', error);
              setPosts([]);
              setVisiblePosts([]);
              setFilteredPosts([]);
            }
          } else {
            setPosts([]);
            setVisiblePosts([]);
            setFilteredPosts([]);
          }
        } else {
          await processPostsData(postsData);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast.error('Erro ao carregar as postagens');
        setPosts([]);
        setVisiblePosts([]);
        setFilteredPosts([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPosts();
  }, [clientId, client]);
  
  const processPostsData = async (postsData: any[]) => {
    try {
      // For each post, fetch its images and social networks
      const enhancedPosts = await Promise.all(
        postsData.map(async (post) => {
          // Fetch images for this post
          const { data: imagesData } = await supabase
            .from('post_images')
            .select('url')
            .eq('post_id', post.id);
            
          // Fetch social networks for this post
          const { data: networksData } = await supabase
            .from('post_social_networks')
            .select('network_name')
            .eq('post_id', post.id);
            
          return {
            ...post,
            id: post.id,
            clientId: post.client_id,
            dayOfWeek: post.day_of_week,
            postType: post.post_type,
            images: imagesData ? imagesData.map(img => img.url) : [],
            socialNetworks: networksData ? networksData.map(net => net.network_name) : []
          };
        })
      );
      
      const sortedPosts = sortPostsByDate(enhancedPosts);
      setPosts(sortedPosts);
      setVisiblePosts(sortedPosts);
      
      // Update filtered posts based on current month filter
      if (filterMonth === 'all') {
        setFilteredPosts(sortedPosts);
      } else {
        const filtered = sortedPosts.filter(post => {
          const postMonth = post.date.split('/')[1];
          return postMonth === filterMonth;
        });
        setFilteredPosts(filtered);
      }
    } catch (error) {
      console.error('Error processing posts data:', error);
      toast.error('Erro ao processar dados das postagens');
    }
  };
  
  const migratePostToSupabase = async (post: any) => {
    try {
      // Insert the post
      const { data: newPost, error: postError } = await supabase
        .from('calendar_posts')
        .insert({
          client_id: post.clientId,
          date: post.date,
          day: post.day,
          day_of_week: post.dayOfWeek,
          title: post.title,
          type: post.type,
          post_type: post.postType,
          text: post.text,
          completed: post.completed || false,
          notes: post.notes || ''
        })
        .select()
        .single();
        
      if (postError || !newPost) {
        throw postError || new Error('Failed to insert post');
      }
      
      console.log('Migrated post to Supabase:', newPost);
      
      // Insert images if any
      if (post.images && post.images.length > 0) {
        const imagesToInsert = post.images.map((url: string) => ({
          post_id: newPost.id,
          url: url
        }));
        
        const { error: imagesError } = await supabase
          .from('post_images')
          .insert(imagesToInsert);
          
        if (imagesError) {
          console.error('Error migrating images:', imagesError);
        }
      }
      
      // Insert social networks if any
      if (post.socialNetworks && post.socialNetworks.length > 0) {
        const networksToInsert = post.socialNetworks.map((network: string) => ({
          post_id: newPost.id,
          network_name: network
        }));
        
        const { error: networksError } = await supabase
          .from('post_social_networks')
          .insert(networksToInsert);
          
        if (networksError) {
          console.error('Error migrating social networks:', networksError);
        }
      }
      
      return newPost;
    } catch (error) {
      console.error('Error migrating post to Supabase:', error);
      return null;
    }
  };
  
  useEffect(() => {
    if (filterMonth === 'all') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => {
        const postMonth = post.date.split('/')[1];
        return postMonth === filterMonth;
      });
      setFilteredPosts(filtered);
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
    try {
      if (editingPost) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('calendar_posts')
          .update({
            date: newPostData.date,
            day: newPostData.day,
            day_of_week: newPostData.dayOfWeek,
            title: newPostData.title,
            type: newPostData.type,
            post_type: newPostData.postType,
            text: newPostData.text
          })
          .eq('id', editingPost.id);
          
        if (updateError) throw updateError;
        
        // Update social networks
        if (newPostData.socialNetworks && newPostData.socialNetworks.length > 0) {
          // First delete existing networks
          await supabase
            .from('post_social_networks')
            .delete()
            .eq('post_id', editingPost.id);
            
          // Then insert new ones
          const networksToInsert = newPostData.socialNetworks.map(network => ({
            post_id: editingPost.id,
            network_name: network
          }));
          
          const { error: networksError } = await supabase
            .from('post_social_networks')
            .insert(networksToInsert);
            
          if (networksError) {
            console.error('Error updating social networks:', networksError);
          }
        }
        
        toast.success("Postagem atualizada com sucesso!", {
          description: `${newPostData.date} - ${newPostData.title}`,
          duration: 3000,
        });
        
        setEditingPost(null);
        
        // Refresh posts
        const { data: postsData } = await supabase
          .from('calendar_posts')
          .select('*')
          .eq('client_id', clientId);
          
        if (postsData) {
          await processPostsData(postsData);
        }
      } else {
        // Create new post
        const { data: newPost, error: insertError } = await supabase
          .from('calendar_posts')
          .insert({
            client_id: clientId,
            date: newPostData.date,
            day: newPostData.day,
            day_of_week: newPostData.dayOfWeek,
            title: newPostData.title,
            type: newPostData.type,
            post_type: newPostData.postType,
            text: newPostData.text,
            completed: false,
            notes: ''
          })
          .select()
          .single();
          
        if (insertError || !newPost) throw insertError || new Error('Failed to insert post');
        
        // Insert social networks if any
        if (newPostData.socialNetworks && newPostData.socialNetworks.length > 0) {
          const networksToInsert = newPostData.socialNetworks.map(network => ({
            post_id: newPost.id,
            network_name: network
          }));
          
          const { error: networksError } = await supabase
            .from('post_social_networks')
            .insert(networksToInsert);
            
          if (networksError) {
            console.error('Error inserting social networks:', networksError);
          }
        }
        
        toast.success("Postagem adicionada com sucesso!", {
          description: `${newPostData.date} - ${newPostData.title}`,
          duration: 3000,
        });
        
        // Refresh posts
        const { data: postsData } = await supabase
          .from('calendar_posts')
          .select('*')
          .eq('client_id', clientId);
          
        if (postsData) {
          await processPostsData(postsData);
        }
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Erro ao salvar postagem');
    }
  };
  
  const openDeleteConfirmation = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = async () => {
    if (postToDelete === null) return;
    
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .delete()
        .eq('id', postToDelete);
        
      if (error) throw error;
      
      // Refresh posts
      const { data: postsData } = await supabase
        .from('calendar_posts')
        .select('*')
        .eq('client_id', clientId);
        
      if (postsData) {
        await processPostsData(postsData);
      } else {
        setPosts([]);
        setVisiblePosts([]);
        setFilteredPosts([]);
      }
      
      toast.success("Postagem removida com sucesso!", {
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Erro ao remover postagem');
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
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
  
  const handleViewPostDetail = (postId: string) => {
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
  
  const handleFileUpload = async (postId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(postId);
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
        
        // Insert image URL into database
        await supabase
          .from('post_images')
          .insert({
            post_id: postId,
            url: urlData.publicUrl
          });
      }
      
      toast.success("Arquivo(s) adicionado(s) com sucesso!", {
        duration: 2000,
      });
      
      // Refresh posts
      const { data: postsData } = await supabase
        .from('calendar_posts')
        .select('*')
        .eq('client_id', clientId);
        
      if (postsData) {
        await processPostsData(postsData);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao fazer upload do arquivo.", {
        description: "Tente novamente mais tarde.",
        duration: 3000,
      });
    } finally {
      setIsUploading(null);
    }
  };
  
  const handleToggleStatus = async (postId: string) => {
    // Find the post
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    try {
      const newStatus = !post.completed;
      
      const { error } = await supabase
        .from('calendar_posts')
        .update({ completed: newStatus })
        .eq('id', postId);
        
      if (error) throw error;
      
      // Update local state
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, completed: newStatus } : p
      );
      
      setPosts(updatedPosts);
      setVisiblePosts(updatedPosts);
      
      // Update filtered posts
      if (filterMonth === 'all') {
        setFilteredPosts(updatedPosts);
      } else {
        const filtered = updatedPosts.filter(post => {
          const postMonth = post.date.split('/')[1];
          return postMonth === filterMonth;
        });
        setFilteredPosts(filtered);
      }
      
      toast.success("Status da postagem atualizado!", {
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Erro ao atualizar status da postagem');
    }
  };
  
  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando...</p>
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
                <Share className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
              <p className="ml-4 text-gray-700">Carregando posts...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {visiblePosts.length > 0 ? (
                  visiblePosts.map((post, index) => (
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
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-500">Nenhuma postagem encontrada para este cliente.</p>
                  </div>
                )}
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
            </>
          )}
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
