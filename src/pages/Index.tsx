
import React, { useState, useEffect } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import CalendarEntry from '@/components/CalendarEntry';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';

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
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [isDetailView, setIsDetailView] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState<CalendarPost[]>([]);
  const [posts, setPosts] = useState<CalendarPost[]>(calendarPosts);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisiblePosts(posts);
    }, 300);

    return () => clearTimeout(timer);
  }, [posts]);
  
  const handleSelectPost = (post: CalendarPost) => {
    setSelectedPost(post);
    setIsDetailView(true);
    
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  const handleBackToCalendar = () => {
    setIsDetailView(false);
    
    // Small delay to allow animation
    setTimeout(() => {
      setSelectedPost(null);
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
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, notes } : post
    ));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white">
      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-red-100 rounded-bl-full opacity-30 -z-10" />
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-red-100 rounded-tr-full opacity-20 -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 py-16">
        <TransitionLayout>
          {!isDetailView ? (
            <>
              <Header 
                title="Calendário de Postagens" 
                subtitle="25/03 a 05/04 - Vereadora Neia Marques" 
                useRedTheme={true}
              />
              
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
                  <div className="date-badge-red text-white font-medium py-2 px-4 rounded-full">
                    {selectedPost.date} • {selectedPost.day}
                  </div>
                  <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                    {selectedPost.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {selectedPost.title}
                  </h2>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <div 
                      className="flex items-center"
                      onClick={() => handleCompleteTask(selectedPost.id, !selectedPost.completed)}
                    >
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
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Texto para Publicação
                  </h3>
                  <div className="whitespace-pre-line text-gray-600 text-md leading-relaxed">
                    {selectedPost.text}
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Anotações para esta Publicação
                  </h3>
                  <Textarea 
                    placeholder="Adicione informações específicas, links ou outras observações..."
                    className="min-h-[100px] border-red-100 focus-visible:ring-red-400"
                    value={selectedPost.notes}
                    onChange={(e) => handleUpdateNotes(selectedPost.id, e.target.value)}
                  />
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={() => handleCopyText(selectedPost.text)}
                    className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-md"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copiar Texto
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </TransitionLayout>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Calendário de Postagens • Vereadora Neia Marques</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
