
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarPost } from '@/types/calendar';
import CalendarEntry from '@/components/CalendarEntry';
import Header from '@/components/Header';
import { Checkbox } from '@/components/ui/checkbox';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { toast } from 'sonner';
import { useSettings } from '@/contexts/SettingsContext';
import { savePosts, deletePost } from '@/services/postService';

const ClientPostDetail = () => {
  const { clientId, postId } = useParams();
  const navigate = useNavigate();
  const { clients } = useSettings();

  const [client, setClient] = useState<any>(null);
  const [post, setPost] = useState<CalendarPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<CalendarPost | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientPosts, setClientPosts] = useState<CalendarPost[]>([]);

  useEffect(() => {
    if (!clientId) return;

    const foundClient = clients?.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
    } else {
      navigate('/');
    }
  }, [clientId, clients, navigate]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const storedPosts = localStorage.getItem('calendarPosts');
        if (storedPosts) {
          const allPosts = JSON.parse(storedPosts);
          const clientFilteredPosts = allPosts.filter((p: CalendarPost) => p.clientId === clientId);
          setClientPosts(clientFilteredPosts);
          
          if (postId) {
            const foundPost = clientFilteredPosts.find((p: CalendarPost) => p.id === Number(postId));
            if (foundPost) {
              setPost(foundPost);
              setEditedPost(foundPost);
            } else {
              navigate(`/client/${clientId}`);
            }
          }
        }
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    if (clientId) {
      loadPosts();
    }
  }, [clientId, postId, navigate]);

  const handleGoBack = () => {
    navigate(`/client/${clientId}`);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveEdit = async () => {
    if (!editedPost || !clientId) return;

    try {
      const updatedPosts = clientPosts.map(p => 
        p.id === editedPost.id ? editedPost : p
      );
      
      await savePosts(updatedPosts, clientId);
      
      setPost(editedPost);
      setClientPosts(updatedPosts);
      setIsEditing(false);
      
      toast.success("Postagem atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar postagem.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedPost) return;
    
    setEditedPost({
      ...editedPost,
      [e.target.name]: e.target.value
    });
  };

  const handleStatusChange = async () => {
    if (!post || !editedPost || !clientId) return;
    
    try {
      const updatedPost = {
        ...post,
        completed: !post.completed
      };
      
      const updatedPosts = clientPosts.map(p => 
        p.id === updatedPost.id ? updatedPost : p
      );
      
      await savePosts(updatedPosts, clientId);
      
      setPost(updatedPost);
      setEditedPost(updatedPost);
      setClientPosts(updatedPosts);
      
      toast.success(
        updatedPost.completed 
          ? "Postagem marcada como concluída!" 
          : "Postagem marcada como pendente!"
      );
    } catch (error) {
      toast.error("Erro ao atualizar status da postagem.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!post || !clientId) return;
    
    try {
      const success = await deletePost(post.id);
      
      if (success) {
        navigate(`/client/${clientId}`);
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      toast.error("Erro ao remover postagem.");
    }
  };

  if (!client || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header clientName={client.name} themeColor={client.themeColor} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={handleGoBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Detalhes da Postagem</h1>
          
          <div className="ml-auto flex gap-2">
            {isEditing ? (
              <Button onClick={handleSaveEdit}>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </Button>
            ) : (
              <Button onClick={handleEditToggle}>Editar</Button>
            )}
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input 
                        id="date" 
                        name="date" 
                        value={editedPost?.date || ''} 
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dayOfWeek">Dia da Semana</Label>
                      <Input 
                        id="dayOfWeek" 
                        name="dayOfWeek" 
                        value={editedPost?.dayOfWeek || ''} 
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={editedPost?.title || ''} 
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postType">Tipo de Post</Label>
                    <Input 
                      id="postType" 
                      name="postType" 
                      value={editedPost?.postType || ''} 
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="text">Conteúdo</Label>
                    <Textarea 
                      id="text" 
                      name="text" 
                      value={editedPost?.text || ''} 
                      onChange={handleChange}
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="completed" 
                      checked={editedPost?.completed || false}
                      onCheckedChange={(checked) => {
                        if (editedPost) {
                          setEditedPost({
                            ...editedPost,
                            completed: checked as boolean
                          });
                        }
                      }}
                    />
                    <Label htmlFor="completed">Concluído</Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p className="text-sm text-gray-500">
                      {post.date} • {post.dayOfWeek} • {post.postType}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Conteúdo do Post</h3>
                    <p className="whitespace-pre-line">{post.text}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Status:</span>
                      {post.completed ? (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Concluído
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Pendente
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleStatusChange}
                    >
                      {post.completed ? 'Marcar como pendente' : 'Marcar como concluído'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Visualização da Postagem</h2>
            <CalendarEntry
              date={post.date}
              day={post.dayOfWeek}
              title={post.title}
              type={post.postType}
              text={post.text}
              highlighted={true}
              themeColor={client.themeColor}
              completed={post.completed}
              hideIcons={true}
              preview={true}
            />
          </div>
        </div>
      </main>

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteConfirm}
        title="Excluir Postagem"
        description="Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

export default ClientPostDetail;
