
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { ArrowLeft, Plus, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { firebaseDB } from '@/integrations/firebase/client';
import { format } from 'date-fns';
import AddPostModal from '@/components/AddPostModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import ShareModal from '@/components/ShareModal';
import { CalendarPost } from '@/types/calendar';
import { loadClientPosts, savePosts, deletePost } from '@/services/postService';
import PostGrid from '@/components/PostGrid';
import PostCalendar from '@/components/PostCalendar';
import PostTable from '@/components/PostTable';

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
    const fetchPosts = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const clientPosts = await loadClientPosts(clientId);
        setPosts(clientPosts);
      } catch (error) {
        console.error("Error loading posts:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
    
    const unsubscribe = firebaseDB.subscribeToPosts((allPosts) => {
      if (allPosts && clientId) {
        const clientPosts = allPosts.filter((post: CalendarPost) => post.clientId === clientId);
        setPosts(clientPosts);
      }
    });
    
    return () => unsubscribe();
  }, [clientId]);
  
  useEffect(() => {
    if (posts.length > 0 || postToDelete !== null) {
      savePosts(posts, clientId as string, postToDelete);
    }
  }, [posts, clientId, postToDelete]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [posts]);
  
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
  
  const handleAddPost = (newPostData: Omit<CalendarPost, 'id'>) => {
    if (editingPost) {
      const updatedPosts = posts.map(post => 
        post.id === editingPost.id 
          ? { ...post, ...newPostData, id: editingPost.id } 
          : post
      );
      
      setPosts(updatedPosts);
      setEditingPost(null);
      
      toast.success("Postagem atualizada com sucesso!");
    } else {
      const newId = Math.max(0, ...posts.map(p => p.id)) + 1;
      const newPost: CalendarPost = {
        id: newId,
        ...newPostData,
        completed: false,
        notes: '',
        clientId: clientId
      };
      
      setPosts([...posts, newPost]);
      
      toast.success("Postagem adicionada com sucesso!");
    }
  };
  
  const openDeleteConfirmation = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = async () => {
    if (postToDelete === null) return;
    
    setPosts(prev => prev.filter(post => post.id !== postToDelete));
    
    try {
      await deletePost(postToDelete);
    } catch (error) {
      console.error("Error deleting post:", error);
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
  
  const handleFileUpload = async (postId: number, event: React.ChangeEvent<HTMLInputElement>) => {
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
      }
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const updatedImages = [...(post.images || []), ...uploadedImageUrls];
          return { ...post, images: updatedImages };
        }
        return post;
      }));
      
      toast.success("Arquivo(s) adicionado(s) com sucesso!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao fazer upload do arquivo.");
    } finally {
      setIsUploading(null);
    }
  };
  
  const handleToggleStatus = (postId: number) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const newStatus = !post.completed;
        return { ...post, completed: newStatus };
      }
      return post;
    }));
    
    toast.success("Status da postagem atualizado!");
  };
  
  if (!client || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando agenda...</p>
        </div>
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
          
          <PostGrid 
            posts={visiblePosts}
            themeColor={client.themeColor}
            onViewPost={handleViewPostDetail}
            onUpload={handleFileUpload}
            onStatusChange={handleToggleStatus}
            isUploading={isUploading}
          />
          
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
                <PostCalendar 
                  themeColor={client.themeColor}
                  selectedDate={selectedDate}
                  onDateSelect={handleCalendarDateSelect}
                  filteredPosts={filteredPosts}
                />
              </div>

              <div className="lg:col-span-2">
                <PostTable 
                  themeColor={client.themeColor}
                  filteredPosts={filteredPosts}
                  onViewPost={handleViewPostDetail}
                  onEditPost={handleEditPost}
                  onDeletePost={openDeleteConfirmation}
                />
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
