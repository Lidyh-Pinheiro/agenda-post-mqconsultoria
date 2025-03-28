
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
import { ChevronLeft, Calendar as CalendarIcon, Filter } from 'lucide-react';

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

const AllPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredPosts, setFilteredPosts] = useState<CalendarPost[]>([]);
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'MM'));

  // Load posts from localStorage
  useEffect(() => {
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
      setFilteredPosts(JSON.parse(storedPosts));
    }
  }, []);

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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 to-white">
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-red-100 rounded-bl-full opacity-30 -z-10" />
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-red-100 rounded-tr-full opacity-20 -z-10" />
      
      <div className="max-w-6xl mx-auto px-4 py-16">
        <TransitionLayout>
          <button 
            onClick={handleBackToHome}
            className="mb-6 flex items-center text-red-600 hover:text-red-500 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar ao calendário
          </button>
          
          <Header 
            title="Todas as Postagens" 
            subtitle="Visualize todas as postagens agendadas" 
            useRedTheme={true}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            <div className="lg:col-span-1">
              <Card className="p-4 shadow-md bg-white">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-red-600" />
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
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        color: '#dc2626',
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
                    <Filter className="w-5 h-5 mr-2 text-red-600" />
                    Lista de Postagens
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Filtrar por mês:</span>
                    <Select 
                      value={filterMonth} 
                      onValueChange={setFilterMonth}
                    >
                      <SelectTrigger className="w-[140px] border-red-200 focus:ring-red-400">
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
                          <TableRow key={post.id} className="cursor-pointer hover:bg-red-50" onClick={() => navigate(`/?post=${post.id}`)}>
                            <TableCell className="font-medium">
                              <div className="date-badge-red text-white text-xs font-medium py-1 px-2 rounded-full inline-flex">
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
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/?post=${post.id}`);
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
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>Agenda de Postagens • Vereadora Neia Marques</p>
        </footer>
      </div>
    </div>
  );
};

export default AllPosts;
