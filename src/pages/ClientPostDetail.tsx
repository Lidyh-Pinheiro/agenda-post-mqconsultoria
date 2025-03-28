import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { ArrowLeft, Calendar, Image, Upload, Check, X, Save, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { firebaseDB } from '@/integrations/firebase/client';

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

const ClientPostDetail = () => {
  const { clientId, postId } = useParams<{ clientId: string; postId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  const [client, setClient] = useState<Client | null>(null);
  const [post, setPost] = useState<CalendarPost | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<CalendarPost | null>(null);
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
    if (!postId || !clientId) return;
    
    const loadPost = async () => {
      try {
        setLoading(true);
        const allPosts = await firebaseDB.getPosts();
        if (allPosts) {
          const foundPost = allPosts.find((p: CalendarPost) => p.id === parseInt(postId));
          
          if (foundPost) {
            setPost(foundPost);
            setEditedPost({...foundPost});
          } else {
            navigate(`/client/${clientId}`);
          }
        } else {
          const storedPosts = localStorage.getItem('calendarPosts');
          if (storedPosts) {
            const allPosts = JSON.parse(storedPosts);
            const foundPost = allPosts.find((p: CalendarPost) => p.id === parseInt(postId));
            
            if (foundPost) {
              setPost(foundPost);
              setEditedPost({...foundPost});
            } else {
              navigate(`/client/${clientId}`);
            }
          } else {
            navigate(`/client/${clientId}`);
          }
        }
      } catch (error) {
        console.error("Error loading post:", error);
        toast.error("Erro ao carregar a postagem");
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
    
    const unsubscribe = firebaseDB.subscribeToPosts((allPosts) => {
      if (allPosts) {
        const foundPost = allPosts.find((p: CalendarPost) => p.id === parseInt(postId));
        if (foundPost && JSON.stringify(foundPost) !== JSON.stringify(post)) {
          setPost(foundPost);
          if (!isEditing) {
            setEditedPost(foundPost);
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [postId, clientId, navigate]);
  
  const handleBack = () => {
    navigate(`/client/${clientId}`);
  };
  
  const handleCompleteTask = async (completed: boolean) => {
    if (!post) return;
    
    const updatedPost = {...post, completed};
    setPost(updatedPost);
    
    try {
      const allPosts = await firebaseDB.getPosts() || [];
      const updatedPosts = allPosts.map((p: CalendarPost) => 
        p.id === post.id ? updatedPost : p
      );
      await firebaseDB.setPosts(updatedPosts);
      
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
      
      toast(completed ? "Tarefa marcada como concluída!" : "Tarefa desmarcada");
    } catch (error) {
      console.error("Error updating post status:", error);
      toast.error("Erro ao atualizar status da postagem");
    }
  };
  
  const handleUpdateNotes = async (notes: string) => {
    if (!post) return;
    
    const updatedPost = {...post, notes};
    setPost(updatedPost);
    
    try {
      const allPosts = await firebaseDB.getPosts() || [];
      const updatedPosts = allPosts.map((p: CalendarPost) => 
        p.id === post.id ? updatedPost : p
      );
      await firebaseDB.setPosts(updatedPosts);
      
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error("Error updating post notes:", error);
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!post) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const uploadedImageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${post.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
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
      
      const updatedImages = [...(post.images || []), ...uploadedImageUrls];
      const updatedPost = {...post, images: updatedImages};
      
      setPost(updatedPost);
      setEditedPost(updatedPost);
      
      const allPosts = await firebaseDB.getPosts() || [];
      const updatedPosts = allPosts.map((p: CalendarPost) => 
        p.id === post.id ? updatedPost : p
      );
      await firebaseDB.setPosts(updatedPosts);
      
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
      
      toast("Arquivo(s) adicionado(s) com sucesso!");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast("Erro ao fazer upload do arquivo.", {
        description: "Tente novamente mais tarde.",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleRemoveImage = async (imageIndex: number) => {
    if (!post || !post.images || !post.images[imageIndex]) return;
    
    try {
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
      
      const updatedImages = [...post.images];
      updatedImages.splice(imageIndex, 1);
      
      const updatedPost = {...post, images: updatedImages};
      setPost(updatedPost);
      setEditedPost({...updatedPost});
      
      const allPosts = await firebaseDB.getPosts() || [];
      const updatedPosts = allPosts.map((p: CalendarPost) => 
        p.id === post.id ? updatedPost : p
      );
      await firebaseDB.setPosts(updatedPosts);
      
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));

      toast("Imagem removida!");
    } catch (error) {
      console.error('Error removing image:', error);
      toast("Erro ao remover imagem.", {
        description: "Tente novamente mais tarde.",
      });
    }
  };
  
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Texto copiado para a área de transferência!", {
      description: "Agora é só colar onde você precisar.",
      duration: 3000,
    });
  };

  const handleEditMode = () => {
    setIsEditing(true);
    setEditedPost(post ? {...post} : null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPost(post);
  };

  const handleSaveEdit = async () => {
    if (!editedPost) return;
    
    const updatedPost = {...editedPost};
    setPost(updatedPost);
    setIsEditing(false);
    
    try {
      const allPosts = await firebaseDB.getPosts() || [];
      const updatedPosts = allPosts.map((p: CalendarPost) => 
        p.id === updatedPost.id ? updatedPost : p
      );
      await firebaseDB.setPosts(updatedPosts);
      
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
      
      toast("Alterações salvas com sucesso!", {
        duration: 2000,
      });
    } catch (error) {
      console.error("Error saving post changes:", error);
      toast.error("Erro ao salvar alterações");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-700">Carregando postagem...</p>
        </div>
      </div>
    );
  }
  
  if (!client || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Não foi possível encontrar a postagem.</p>
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
          <Button 
            onClick={handleBack}
            variant="ghost"
            className="mb-6 flex items-center"
            style={{ color: client.themeColor }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar à agenda
          </Button>
          
          <div className="glass-card rounded-2xl p-8 shadow-xl border"
            style={{ borderColor: `${client.themeColor}40` }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="text-white font-medium py-2 px-4 rounded-full"
                style={{ backgroundColor: client.themeColor }}
              >
                {post.date}{post.time ? ` • ${post.time}` : ''} • {post.day}
              </div>
              
              <div className="flex items-center gap-2">
                {post.completed ? (
                  <span className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Concluído
                  </span>
                ) : (
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-2 rounded-full text-sm font-medium">
                    Pendente
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  style={{ 
                    borderColor: post.completed ? 'rgb(239 68 68)' : 'rgb(22 163 74)',
                    color: post.completed ? 'rgb(239 68 68)' : 'rgb(22 163 74)'
                  }}
                  onClick={() => handleCompleteTask(!post.completed)}
                >
                  {post.completed ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Marcar pendente
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Marcar concluído
                    </>
                  )}
                </Button>
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                  {post.type}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              {isEditing ? (
                <Input 
                  value={editedPost?.title || ''}
                  onChange={(e) => setEditedPost(prev => prev ? {...prev, title: e.target.value} : null)}
                  className="text-2xl font-bold border-gray-200 focus-visible:ring-gray-400"
                />
              ) : (
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
                  {post.title}
                </h2>
              )}
              
              <div className="flex items-center space-x-4">
                {!isEditing && (
                  <Button
                    onClick={handleEditMode}
                    variant="outline"
                    className="flex items-center gap-2"
                    style={{ borderColor: `${client.themeColor}40`, color: client.themeColor }}
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
                      style={{ backgroundColor: client.themeColor }}
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar 
                  className="w-5 h-5 mr-2"
                  style={{ color: client.themeColor }}
                />
                Texto da Publicação
              </h3>
              
              {isEditing ? (
                <Textarea 
                  value={editedPost?.text || ''}
                  onChange={(e) => setEditedPost(prev => prev ? {...prev, text: e.target.value} : null)}
                  className="min-h-[150px] text-gray-600 leading-relaxed"
                />
              ) : (
                <div className="whitespace-pre-line text-gray-600 text-md leading-relaxed">
                  {post.text}
                  <Button
                    onClick={() => handleCopyText(post.text)}
                    variant="outline"
                    size="sm"
                    className="mt-4 text-xs"
                  >
                    Copiar texto
                  </Button>
                </div>
              )}
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-700 flex items-center">
                  <Image 
                    className="w-5 h-5 mr-2"
                    style={{ color: client.themeColor }}
                  />
                  Imagens e Arquivos
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {post?.images?.length || 0} {(post?.images?.length || 0) === 1 ? 'anexo' : 'anexos'}
                  </span>
                </h3>
                
                <div className="flex items-center">
                  <label className="cursor-pointer bg-white hover:bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 flex items-center text-sm transition-colors shadow-sm">
                    <Upload className="w-4 h-4 mr-2 text-gray-600" />
                    <span>{isUploading ? "Enviando..." : "Adicionar arquivo"}</span>
                    <input 
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              
              {post.images && post.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {post.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Imagem ${index + 1}`} 
                        className="w-full h-40 object-cover rounded-lg border border-gray-200" 
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-25" />
                  <p>Nenhum arquivo anexado</p>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Anotações
              </h3>
              <Textarea 
                value={post.notes}
                onChange={(e) => handleUpdateNotes(e.target.value)}
                placeholder="Adicionar notas sobre esta postagem..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </TransitionLayout>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • {settings.ownerName}</p>
        </footer>
      </div>
    </div>
  );
};

export default ClientPostDetail;
