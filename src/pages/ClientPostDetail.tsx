
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransitionLayout } from '@/components/TransitionLayout';
import { useSettings, Client } from '@/contexts/SettingsContext';
import { ArrowLeft, Calendar, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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

const ClientPostDetail = () => {
  const { clientId, postId } = useParams<{ clientId: string; postId: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();
  
  const [client, setClient] = useState<Client | null>(null);
  const [post, setPost] = useState<CalendarPost | null>(null);
  
  // Find the client by ID
  useEffect(() => {
    if (!clientId) return;
    
    const foundClient = settings.clients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
    } else {
      // Client not found, redirect to home
      navigate('/');
    }
  }, [clientId, settings.clients, navigate]);
  
  // Load post from localStorage
  useEffect(() => {
    if (!postId) return;
    
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      const foundPost = allPosts.find((p: CalendarPost) => p.id === parseInt(postId));
      
      if (foundPost) {
        setPost(foundPost);
      } else {
        // Post not found, redirect back
        navigate(`/client/${clientId}`);
      }
    }
  }, [postId, clientId, navigate]);
  
  const handleBack = () => {
    navigate(`/client/${clientId}`);
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
              
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium">
                {post.type}
              </span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
              {post.title}
            </h2>
            
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <Calendar 
                  className="w-5 h-5 mr-2"
                  style={{ color: client.themeColor }}
                />
                Texto da Publicação
              </h3>
              <div className="whitespace-pre-line text-gray-600 text-md leading-relaxed">
                {post.text}
              </div>
            </div>
            
            {post.images && post.images.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <Image 
                    className="w-5 h-5 mr-2"
                    style={{ color: client.themeColor }}
                  />
                  Imagens
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {post.images.map((img, index) => (
                    <img 
                      key={index} 
                      src={img} 
                      alt={`Imagem ${index + 1}`} 
                      className="w-full h-40 object-cover rounded-lg border border-gray-200" 
                    />
                  ))}
                </div>
              </div>
            )}
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
