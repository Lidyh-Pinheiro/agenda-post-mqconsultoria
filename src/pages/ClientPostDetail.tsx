
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
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { fetchClientById, fetchClientPosts, savePost, deletePost } from '@/integrations/supabase/client';

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
  const [deleteImageDialogOpen, setDeleteImageDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);
  
  // Carregar cliente
  useEffect(() => {
    if (!clientId) return;
    
    const loadClient = async () => {
      try {
        // Primeiro tenta encontrar o cliente no contexto
        const contextClient = settings.clients.find(c => c.id === clientId);
        
        if (contextClient) {
          setClient(contextClient);
        } else {
          // Se não encontrado no contexto, tenta buscar do Supabase
          const supabaseClient = await fetchClientById(clientId);
          if (supabaseClient) {
            setClient(supabaseClient);
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
  
  // Carregar post
  useEffect(() => {
    if (!postId || !clientId) return;
    
    const loadPost = async () => {
      try {
        const clientPosts = await fetchClientPosts(clientId);
        const foundPost = clientPosts.find(p => p.id === parseInt(postId));
        
        if (foundPost) {
          setPost(foundPost);
          setEditedPost({...foundPost});
        } else {
          navigate(`/client/${clientId}`);
        }
      } catch (error) {
        console.error('Error loading post:', error);
        toast.error('Erro ao carregar dados da postagem');
        navigate(`/client/${clientId}`);
      }
    };
    
    loadPost();
  }, [postId, clientId, navigate]);
  
  const handleBack = () => {
    navigate(`/client/${clientId}`);
  };
  
  const handleCompleteTask = async (completed: boolean) => {
    if (!post) return;
    
    try {
      const updatedPost = {...post, completed};
      const savedPost = await savePost(updatedPost);
      
      if (savedPost) {
        setPost(savedPost);
        toast(completed ? "Tarefa marcada como concluída!" : "Tarefa desmarcada");
      } else {
        toast.error("Erro ao atualizar status da tarefa");
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error("Erro ao atualizar status da tarefa");
    }
  };
  
  const handleUpdateNotes = async (notes: string) => {
    if (!post) return;
    
    try {
      const updatedPost = {...post, notes};
      const savedPost = await savePost(updatedPost);
      
      if (savedPost) {
        setPost(savedPost);
      } else {
        toast.error("Erro ao salvar anotações");
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error("Erro ao salvar anotações");
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
        const reader = new FileReader();
        
        const fileUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        
        uploadedImageUrls.push(fileUrl);
      }
      
      const updatedImages = [...(post.images || []), ...uploadedImageUrls];
      const updatedPost = {...post, images: updatedImages};
      
      const savedPost = await savePost(updatedPost);
      
      if (savedPost) {
        setPost(savedPost);
        setEditedPost(savedPost);
        toast("Arquivo(s) adicionado(s) com sucesso!");
      } else {
        toast.error("Erro ao salvar imagens");
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erro ao fazer upload do arquivo.", {
        description: "Tente novamente mais tarde."
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const openDeleteImageConfirmation = (imageIndex: number) => {
    setImageToDelete(imageIndex);
    setDeleteImageDialogOpen(true);
  };
  
  const handleRemoveImage = async () => {
    if (!post || !post.images || imageToDelete === null) return;
    
    try {
      const updatedImages = [...post.images];
      updatedImages.splice(imageToDelete, 1);
      
      const updatedPost = {...post, images: updatedImages};
      const savedPost = await savePost(updatedPost);
      
      if (savedPost) {
        setPost(savedPost);
        setEditedPost(savedPost);
        toast("Imagem removida!");
      } else {
        toast.error("Erro ao remover imagem");
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error("Erro ao remover imagem.", {
        description: "Tente novamente mais tarde."
      });
    } finally {
      setDeleteImageDialogOpen(false);
      setImageToDelete(null);
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
    
    try {
      const savedPost = await savePost(editedPost);
      
      if (savedPost) {
        setPost(savedPost);
        setIsEditing(false);
        toast("Alterações salvas com sucesso!", {
          duration: 2000,
        });
      } else {
        toast.error("Erro ao salvar alterações");
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error("Erro ao salvar alterações");
    }
  };
  
  if (!client || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
                {post.date} • {post.day}
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
                        onClick={() => openDeleteImageConfirmation(index)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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

      <DeleteConfirmDialog
        open={deleteImageDialogOpen}
        onOpenChange={setDeleteImageDialogOpen}
        onConfirm={handleRemoveImage}
        title="Confirmar exclusão"
        description="Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default ClientPostDetail;
