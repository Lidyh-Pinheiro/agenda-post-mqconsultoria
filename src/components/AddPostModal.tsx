
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
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
  }) => void;
  initialDate?: Date;
}

const AddPostModal: React.FC<AddPostModalProps> = ({ 
  open, 
  onOpenChange, 
  onSave,
  initialDate
}) => {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [postType, setPostType] = useState('Feed');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate || new Date());

  const handleSave = () => {
    if (!title || !text || !selectedDate) {
      return;
    }

    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const shortDayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    const formattedDate = format(selectedDate, 'dd/MM');
    const dayOfWeek = selectedDate.getDay();
    
    onSave({
      date: formattedDate,
      day: dayNames[dayOfWeek],
      dayOfWeek: shortDayNames[dayOfWeek],
      title: title,
      type: `${postType} + Stories`,
      postType: postType,
      text: text
    });
    
    // Reset form
    setTitle('');
    setText('');
    setPostType('Feed');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Postagem</DialogTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
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
                      format(selectedDate, "PPP", { locale: require('date-fns/locale/pt-BR') })
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
              <select
                id="post-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={postType}
                onChange={(e) => setPostType(e.target.value)}
              >
                <option value="Feed">Feed</option>
                <option value="Registro">Registro</option>
                <option value="Vídeo">Vídeo</option>
                <option value="Foto">Foto</option>
                <option value="Reels">Reels</option>
                <option value="Card">Card</option>
                <option value="Reflexão">Reflexão</option>
              </select>
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPostModal;
