import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, X, CheckIcon, Facebook, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (post: {
    date: string;
    day: string;
    dayOfWeek: string;
    title: string;
    type: string;
    postType: string;
    text: string;
    observation?: string;
    socialNetworks?: string[];
  }) => void;
  initialDate?: Date;
  initialPost?: {
    date: string;
    title: string;
    type: string;
    text: string;
    observation?: string;
    socialNetworks?: string[];
  } | null;
  clientId?: string;
}

const POST_TYPES = [
  { value: 'Feed', label: 'Feed' },
  { value: 'Stories', label: 'Stories' },
  { value: 'Registro', label: 'Registro' },
  { value: 'Vídeo', label: 'Vídeo' },
  { value: 'Foto', label: 'Foto' },
  { value: 'Reels', label: 'Reels' },
  { value: 'Card', label: 'Card' },
  { value: 'Reflexão', label: 'Reflexão' },
  { value: 'Legenda explicativa', label: 'Legenda explicativa' },
  { value: 'Texto', label: 'Texto' },
];

const SOCIAL_NETWORKS = [
  { id: 'facebook', label: 'Facebook', icon: Facebook },
  { id: 'instagram', label: 'Instagram', icon: Instagram },
  { id: 'twitter', label: 'Twitter', icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', label: 'YouTube', icon: Youtube },
  { id: 'tiktok', label: 'TikTok', icon: ({ className }: { className?: string }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className || "w-4 h-4"}
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ) },
];

const AddPostModal: React.FC<AddPostModalProps> = ({ 
  open, 
  onOpenChange, 
  onSave,
  initialDate,
  initialPost,
  clientId
}) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [observation, setObservation] = useState('');
  const [selectedPostTypes, setSelectedPostTypes] = useState<string[]>(['Feed']);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());
  const [selectedSocialNetworks, setSelectedSocialNetworks] = useState<string[]>(['instagram']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialPost) {
      setTitle(initialPost.title);
      setText(initialPost.text);
      setObservation(initialPost.observation || '');
      
      const types = initialPost.type.split(' + ');
      setSelectedPostTypes(types);
      
      if (initialPost.socialNetworks && initialPost.socialNetworks.length > 0) {
        setSelectedSocialNetworks(initialPost.socialNetworks);
      }
      
      if (initialPost.date) {
        const [day, month] = initialPost.date.split('/');
        const year = new Date().getFullYear();
        setSelectedDate(new Date(year, parseInt(month) - 1, parseInt(day)));
      }
    } else {
      setTitle('');
      setText('');
      setObservation('');
      setSelectedPostTypes(['Feed']);
      setSelectedSocialNetworks(['instagram']);
      setSelectedDate(initialDate || new Date());
    }
  }, [initialPost, initialDate, open]);

  const handleSave = async () => {
    if (!title || !text || !selectedDate || selectedPostTypes.length === 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const shortDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    const formattedDate = format(selectedDate, 'dd/MM');
    const dayOfWeek = selectedDate.getDay();
    
    const typeString = selectedPostTypes.join(' + ');
    const mainPostType = selectedPostTypes[0];
    
    try {
      if (clientId) {
        const { data, error } = await supabase
          .from('calendar_posts')
          .insert({
            client_id: clientId,
            date: formattedDate,
            day: dayNames[dayOfWeek],
            day_of_week: shortDayNames[dayOfWeek],
            title: title,
            type: typeString,
            post_type: mainPostType,
            text: text,
            completed: false,
            notes: observation || ''
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error saving post to Supabase:', error);
          throw error;
        }
        
        if (selectedSocialNetworks.length > 0) {
          const networksToInsert = selectedSocialNetworks.map(network => ({
            post_id: data.id,
            network_name: network
          }));
          
          const { error: networksError } = await supabase
            .from('post_social_networks')
            .insert(networksToInsert);
            
          if (networksError) {
            console.error('Error saving social networks:', networksError);
          }
        }
        
        const storedPosts = localStorage.getItem('calendarPosts') || '[]';
        const posts = JSON.parse(storedPosts);
        
        posts.push({
          id: data.id,
          date: formattedDate,
          day: dayNames[dayOfWeek],
          dayOfWeek: shortDayNames[dayOfWeek],
          title: title,
          type: typeString,
          postType: mainPostType,
          text: text,
          observation: observation,
          socialNetworks: selectedSocialNetworks,
          clientId: clientId,
          completed: false
        });
        
        localStorage.setItem('calendarPosts', JSON.stringify(posts));
        
        toast.success("Postagem adicionada com sucesso!");
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error("Erro ao salvar postagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
    
    onSave({
      date: formattedDate,
      day: dayNames[dayOfWeek],
      dayOfWeek: shortDayNames[dayOfWeek],
      title: title,
      type: typeString,
      postType: mainPostType,
      text: text,
      observation: observation,
      socialNetworks: selectedSocialNetworks
    });
    
    setTitle('');
    setText('');
    setObservation('');
    setSelectedPostTypes(['Feed']);
    setSelectedSocialNetworks(['instagram']);
    onOpenChange(false);
  };

  const togglePostType = (type: string) => {
    setSelectedPostTypes(current => 
      current.includes(type)
        ? current.filter(t => t !== type)
        : [...current, type]
    );
  };

  const toggleSocialNetwork = (id: string) => {
    setSelectedSocialNetworks(current => 
      current.includes(id)
        ? current.filter(network => network !== id)
        : [...current, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialPost ? 'Editar Postagem' : 'Adicionar Nova Postagem'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="post-date" className="text-right text-sm font-medium">
              Data
            </label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="post-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="post-type" className="text-right text-sm font-medium">
              Tipo
            </label>
            <div className="col-span-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between"
                  >
                    {selectedPostTypes.length > 0 
                      ? selectedPostTypes.join(' + ') 
                      : 'Selecione os tipos'}
                    <span className="sr-only">Selecione os tipos</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[240px]">
                  <DropdownMenuLabel>Tipos de Postagem</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {POST_TYPES.map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type.value}
                      checked={selectedPostTypes.includes(type.value)}
                      onCheckedChange={() => togglePostType(type.value)}
                    >
                      {type.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="social-networks" className="text-right text-sm font-medium">
              Redes Sociais
            </label>
            <div className="col-span-3">
              <div className="flex flex-wrap gap-3">
                {SOCIAL_NETWORKS.map((network) => (
                  <div key={network.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`checkbox-${network.id}`}
                      checked={selectedSocialNetworks.includes(network.id)}
                      onCheckedChange={() => toggleSocialNetwork(network.id)}
                    />
                    <Label 
                      htmlFor={`checkbox-${network.id}`}
                      className="flex items-center cursor-pointer"
                    >
                      {React.isValidElement(network.icon) ? (
                        network.icon
                      ) : typeof network.icon === 'function' ? (
                        <network.icon className="h-4 w-4 mr-1" />
                      ) : null}
                      <span>{network.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="post-title" className="text-right text-sm font-medium">
              Título
            </label>
            <div className="col-span-3">
              <Input
                id="post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite um título para a postagem"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="post-text" className="text-right text-sm font-medium pt-2">
              Texto
            </label>
            <div className="col-span-3">
              <Textarea
                id="post-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite o texto da postagem"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <label htmlFor="post-observation" className="text-right text-sm font-medium pt-2">
              Observação
            </label>
            <div className="col-span-3">
              <Textarea
                id="post-observation"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Adicione observações ou instruções específicas"
                className="min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>{initialPost ? 'Atualizar' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPostModal;
