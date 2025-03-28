import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { v4 as uuidv4 } from 'uuid';
import { Calendar } from "@/components/ui/calendar";
import { format, isSameDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSettings, Client } from '@/contexts/SettingsContext';
import Header from '@/components/Header';
import ClientItem from '@/components/ClientItem';
import AddPostModal from '@/components/AddPostModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Plus, Edit, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import CalendarEntry from '@/components/CalendarEntry';
import { toast } from 'sonner';

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

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newClientName: string;
  setNewClientName: React.Dispatch<React.SetStateAction<string>>;
  newClientColor: string;
  setNewClientColor: React.Dispatch<React.SetStateAction<string>>;
  newClientPassword: string;
  setNewClientPassword: React.Dispatch<React.SetStateAction<string>>;
  onAddClient: () => void;
}

const Index = () => {
  const navigate = useNavigate();
  const { settings, addClient, clients, selectClient, selectedClient: contextSelectedClient } = useSettings();
  const [newClientName, setNewClientName] = useState('');
  const [newClientColor, setNewClientColor] = useState('#dc2626');
  const [newClientPassword, setNewClientPassword] = useState('');
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date | undefined>(undefined);
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  useEffect(() => {
    document.title = "Gestor de Postagens";
    
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('calendarPosts', JSON.stringify(posts));
  }, [posts]);
  
  useEffect(() => {
    if (contextSelectedClient) {
      const client = settings.clients.find(c => c.id === contextSelectedClient) || null;
      setSelectedClient(client);
    } else {
      setSelectedClient(null);
    }
  }, [settings.clients, contextSelectedClient]);
  
  const handleClientSelect = (clientId: string) => {
    selectClient(clientId);
    navigate(`/client/${clientId}`);
  };
  
  const handleAddClientModalOpen = () => {
    setAddClientModalOpen(true);
  };
  
  const handleAddClient = () => {
    if (newClientName.trim() === '') return;
    
    const newClientId = addClient(newClientName, newClientColor, newClientPassword);
    setNewClientName('');
    setNewClientColor('#dc2626');
    setNewClientPassword('');
    setAddClientModalOpen(false);
    
    toast.success("Cliente adicionado com sucesso!", {
      description: `Redirecionando para ${newClientName}...`
    });
    
    setTimeout(() => {
      navigate(`/client/${newClientId}`);
    }, 1500);
  };
  
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (date) {
      setCalendarSelectedDate(date);
      setAddPostOpen(true);
    }
  };
  
  const handleAddPost = (newPostData: Omit<CalendarPost, 'id'>) => {
    if (selectedClient) {
      const newId = Math.max(0, ...posts.map(p => p.id)) + 1;
      const newPost: CalendarPost = {
        id: newId,
        ...newPostData,
        completed: false,
        notes: '',
        clientId: selectedClient.id,
      };
      
      setPosts(sortPostsByDate([...posts, newPost]));
      
      toast.success("Postagem adicionada com sucesso!", {
        description: `${newPost.date} - ${newPost.title}`
      });
    }
  };
  
  const openDeleteConfirmation = (postId: number) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeletePost = () => {
    if (postToDelete === null) return;
    
    setPosts(prev => prev.filter(post => post.id !== postToDelete));
    
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      const updatedPosts = allPosts.filter((p: CalendarPost) => p.id !== postToDelete);
      localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    }
    
    setDeleteDialogOpen(false);
    setPostToDelete(null);
    
    toast.success("Postagem removida com sucesso!");
  };
  
  const sortPostsByDate = (postsToSort: CalendarPost[]): CalendarPost[] => {
    return [...postsToSort].sort((a, b) => {
      const dateA = parse(a.date, 'dd/MM', new Date());
      const dateB = parse(b.date, 'dd/MM', new Date());
      
      return dateA.getTime() - dateB.getTime();
    });
  };
  
  const isDateWithPosts = (date: Date) => {
    return posts.some(post => {
      const postDate = parse(post.date, 'dd/MM', new Date());
      return isSameDay(postDate, date);
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header title="Dashboard" subtitle="Gerencie seus clientes e posts" showSettings={true} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Clientes</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.clients.map((client) => (
              <ClientItem
                key={client.id}
                client={client}
                onSelect={() => handleClientSelect(client.id)}
              />
            ))}
            
            <Card className="bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center" onClick={handleAddClientModalOpen}>
              <CardContent className="p-4 flex items-center justify-center">
                <Plus className="h-6 w-6 text-gray-500" />
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Calendário de Posts</h2>
          
          <Card className="p-4 shadow-md bg-white">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-500" />
              Selecione uma data para adicionar um post
            </h3>
            <div className="bg-white rounded-lg shadow-sm p-1">
              <div className="calendar-container">
                <Calendar
                  mode="single"
                  className="p-3 pointer-events-auto"
                  selected={selectedDate}
                  onSelect={handleCalendarDateSelect}
                  modifiers={{
                    booked: (date) => isDateWithPosts(date)
                  }}
                  modifiersStyles={{
                    booked: {
                      backgroundColor: '#dc262620',
                      borderRadius: '50%',
                      color: '#dc2626',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      <AddClientModal
        open={addClientModalOpen}
        onOpenChange={setAddClientModalOpen}
        newClientName={newClientName}
        setNewClientName={setNewClientName}
        newClientColor={newClientColor}
        setNewClientColor={setNewClientColor}
        newClientPassword={newClientPassword}
        setNewClientPassword={setNewClientPassword}
        onAddClient={handleAddClient}
      />
      
      <AddPostModal
        open={addPostOpen}
        onOpenChange={(open) => setAddPostOpen(open)}
        onSave={handleAddPost}
        initialDate={calendarSelectedDate}
      />
      
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePost}
        title="Confirmar"
        description="Tem certeza que deseja excluir esta postagem? Esta ação não pode ser desfeita."
      />
    </div>
  );
};

const AddClientModal: React.FC<AddClientModalProps> = ({
  open,
  onOpenChange,
  newClientName,
  setNewClientName,
  newClientColor,
  setNewClientColor,
  newClientPassword,
  setNewClientPassword,
  onAddClient,
}) => {
  return (
    <div className="relative">
      {open && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={() => onOpenChange(false)}>
          <div
            className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Adicionar Novo Cliente
              </h3>
              <div className="mt-2">
                <Input
                  type="text"
                  placeholder="Nome do Cliente"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <Input
                  type="color"
                  value={newClientColor}
                  onChange={(e) => setNewClientColor(e.target.value)}
                  className="mt-3 block w-full"
                />
                <Input
                  type="password"
                  placeholder="Senha (opcional)"
                  value={newClientPassword}
                  onChange={(e) => setNewClientPassword(e.target.value)}
                  className="mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>
            <div className="items-center px-4 py-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="mr-2">
                Cancelar
              </Button>
              <Button onClick={onAddClient}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
