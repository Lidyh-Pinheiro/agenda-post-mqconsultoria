
import React, { useState, useEffect } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import CalendarEntry from '@/components/CalendarEntry';
import { toast } from 'sonner';
import { Check, X, Upload, Image, Calendar, Edit, Save } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState<CalendarPost[]>([]);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState<CalendarPost | null>(null);
  
  useEffect(() => {
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      setPosts(calendarPosts);
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('calendarPosts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
    }, 300);

    return () => clearTimeout(timer);
  }, [posts]);
  
  // Handle URL param for direct post access
  useEffect(() => {
    if (postId && posts.length > 0) {
      const post = posts.find(p => p.id === parseInt(postId));
      if (post) {
        handleSelectPost(post);
      }
    }
  }, [postId, posts]);
  
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
    
    // Clear the post parameter from URL
    navigate('/', { replace: true });
    
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
          
          // Update selectedPost if it's the current post
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
      // Get the image URL to remove
      const post = posts.find(p => p.id === postId);
      if (!post || !post.images || !post.images[imageIndex]) return;
      
      const imageUrl = post.images[imageIndex];
      
      // Extract the file name from the URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Only try to remove from storage if it appears to be a Supabase URL
      if (imageUrl.includes('supabase')) {
        const { error } = await supabase.storage
          .from('post_images')
          .remove([fileName]);
          
        if (error) {
          console.error('Error removing image from storage:', error);
        }
      }
      
      // Update local state regardless of whether deletion from storage succeeded
      setPosts(prev => prev.map(post => {
        if (post.id === postId && post.images) {
          const updatedImages = [...post.images];
          updatedImages.splice(imageIndex, 1);
          
          // Update selectedPost if it's the current post
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
    
    setPosts(prev => prev.map(post => 
      post.id === editedPost.id ? editedPost : post
    ));
    
    setSelectedPost(editedPost);
    setIsEditing(false);
    
    toast("Alterações salvas com sucesso!", {
      duration: 2000,
    });
  };

  const handleNavigateAllPosts = () => {
    navigate('/all-posts');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white">
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-red-100 rounded-bl-full opacity-30 -z-10" />
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-red-100 rounded-tr-full opacity-20 -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          {!isDetailView ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <Header 
                  title="Agenda de Postagens" 
                  subtitle="25/03 a 05/04 - Vereadora Neia Marques" 
                  useRedTheme={true}
                />
                
                <Button 
                  onClick={handleNavigateAllPosts}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Calendar className="w-4 h-4" />
                  Todas as Postagens
                </Button>
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
                      useRedTheme={true}
                      completed={post.completed}
                      onSelect={() => handleSelectPost(post)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : selectedPost ? (
            <div className="animate-fade-in">
              <button 
                onClick={handleBackToCalendar}
                className="mb-6 flex items-center text-red-600 hover:text-red-500 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar ao calendário
              </button>
              
              <div className="glass-card rounded-2xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  {isEditing ? (
                    <Input 
                      value={editedPost?.date || ''}
                      onChange={(e) => setEditedPost(prev => prev ? {...prev, date: e.target.value} : null)}
                      className="w-28 border-red-200 focus-visible:ring-red-400 date-badge-red text-white font-medium py-2 px-4 rounded-full"
                    />
                  ) : (
                    <div className="date-badge-red text-white font-medium py-2 px-4 rounded-full">
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
                      className="text-2xl font-bold border-red-200 focus-visible:ring-red-400"
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
                        className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
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
                          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
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
                            className="data-[state=checked]:bg-red-600 border-red-400"
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
                      className="min-h-[150px] border-red-100 focus-visible:ring-red-400 whitespace-pre-line text-gray-600 text-md leading-relaxed"
                    />
                  ) : (
                    <div className="whitespace-pre-line text-gray-600 text-md leading-relaxed">
                      {selectedPost.text}
                    </div>
                  )}
                  {!isEditing && (
                    <Button
                      onClick={() => handleCopyText(selectedPost.text)}
                      className="mt-4 bg-red-600 hover:bg-red-700 text-white"
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
                    className="min-h-[100px] border-red-100 focus-visible:ring-red-400"
                    value={isEditing ? (editedPost?.notes || '') : (selectedPost.notes || '')}
                    onChange={(e) => isEditing 
                      ? setEditedPost(prev => prev ? {...prev, notes: e.target.value} : null)
                      : handleUpdateNotes(selectedPost.id, e.target.value)
                    }
                  />
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                    <Image className="w-5 h-5 mr-2 text-red-600" />
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
                  
                  <div className="flex flex-col items-center p-4 border-2 border-dashed border-red-200 rounded-lg bg-red-50">
                    <Upload className="w-8 h-8 text-red-600 mb-2" />
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
                      className={`inline-flex items-center justify-center text-sm font-medium gap-2 ${isUploading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'} text-white py-2 px-4 rounded-lg cursor-pointer transition-colors`}
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
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-md"
                  >
                    Salvar e Voltar
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </TransitionLayout>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • Vereadora Neia Marques</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
