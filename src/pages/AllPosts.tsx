
import React, { useState, useEffect } from 'react';
import { TransitionLayout } from '@/components/TransitionLayout';
import Header from '@/components/Header';
import { useNavigate } from 'react-router-dom';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Filter, 
  FileDown,
  ArrowLeft
} from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import SettingsModal from '@/components/SettingsModal';

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

const AllPosts = () => {
  const navigate = useNavigate();
  const { settings, getSelectedClient } = useSettings();
  const selectedClient = getSelectedClient();
  const themeColor = selectedClient ? selectedClient.themeColor : "#dc2626";
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredPosts, setFilteredPosts] = useState<CalendarPost[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'MM'));

  // Load posts from localStorage
  useEffect(() => {
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      
      // Filter posts for the selected client if one is selected
      if (selectedClient) {
        const clientPosts = allPosts.filter(
          (post: CalendarPost) => !post.clientId || post.clientId === selectedClient.id
        );
        setPosts(clientPosts);
        setFilteredPosts(clientPosts);
      } else {
        // No client selected, show all posts without a clientId
        const nonClientPosts = allPosts.filter(
          (post: CalendarPost) => !post.clientId
        );
        setPosts(nonClientPosts);
        setFilteredPosts(nonClientPosts);
      }
    }
  }, [selectedClient]);

  // Apply filter when month changes
  useEffect(() => {
    if (posts.length > 0) {
      if (filterMonth === 'all') {
        setFilteredPosts(posts);
      } else {
        const filtered = posts.filter(post => {
          // Convert DD/MM to MM
          const postMonth = post.date.split('/')[1];
          return postMonth === filterMonth;
        });
        setFilteredPosts(filtered);
      }
    }
  }, [filterMonth, posts]);

  // Extract dates from posts for highlighting in calendar
  const getPostDates = () => {
    return posts.map(post => {
      const [day, month] = post.date.split('/');
      const year = new Date().getFullYear();
      return new Date(year, parseInt(month) - 1, parseInt(day));
    });
  };

  // Navigate back to home
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Navigate back to agenda
  const handleBackToAgenda = () => {
    navigate('/agenda');
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
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        <TransitionLayout>
          <div className="flex justify-between items-center mb-6">
            <div className="flex">
              <Button 
                onClick={handleBackToHome}
                variant="ghost"
                className="mr-4 flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Início
              </Button>
              
              <Button 
                onClick={handleBackToAgenda}
                variant="ghost"
                className="flex items-center"
                style={{ color: themeColor }}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Voltar à agenda
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              onClick={() => setSettingsOpen(true)}
            >
              <FileDown className="h-4 w-4" />
              <span className="text-sm">Exportar PDF</span>
            </Button>
          </div>
          
          <Header 
            title="Todas as Postagens" 
            subtitle={selectedClient ? selectedClient.name : "Visualize todas as postagens agendadas"} 
            themeColor={themeColor}
            showSettings={true}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            <div className="lg:col-span-1">
              <Card className="p-4 shadow-md bg-white">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon 
                    className="w-5 h-5 mr-2"
                    style={{ color: themeColor }} 
                  />
                  Calendário de Postagens
                </h3>
                <div className="bg-white rounded-lg shadow-sm p-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={ptBR}
                    className="pointer-events-auto p-0"
                    modifiers={{
                      booked: getPostDates(),
                    }}
                    modifiersStyles={{
                      booked: {
                        backgroundColor: `${themeColor}20`,
                        color: themeColor,
                        fontWeight: 'bold',
                      }
                    }}
                  />
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
                      {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                          <TableRow key={post.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/agenda?post=${post.id}`)}>
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
                                  navigate(`/agenda?post=${post.id}`);
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
              </Card>
            </div>
          </div>
        </TransitionLayout>
        
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • {settings.ownerName}</p>
        </footer>
      </div>
    </div>
  );
};

export default AllPosts;
