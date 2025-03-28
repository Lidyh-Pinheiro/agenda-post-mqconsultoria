import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, Facebook, Send, Copy, Download, Printer, Eye, Share } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarEntry from '@/components/CalendarEntry';
import html2canvas from 'html2canvas';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
  posts?: any[];
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, clientId, posts = [] }) => {
  const { settings, generateClientShareLink } = useSettings();
  const [activeTab, setActiveTab] = useState<string>("link");
  const printableAreaRef = useRef<HTMLDivElement>(null);
  
  const client = clientId 
    ? settings.clients.find(c => c.id === clientId) 
    : null;
  
  if (!client) return null;
  
  const themeColor = client ? client.themeColor : "#dc2626";
  const shareLink = generateClientShareLink(client.id);
  
  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=Confira a agenda de postagens de ${client.name}: ${shareLink}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Link preparado para compartilhar via WhatsApp');
  };
  
  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=Confira a agenda de postagens de ${client.name}`;
    window.open(facebookUrl, '_blank');
    toast.success('Link preparado para compartilhar via Facebook');
  };
  
  const shareViaEmail = () => {
    const subject = `Agenda de Postagens de ${client.name}`;
    const body = `Olá,\n\nGostaria de compartilhar a agenda de postagens de ${client.name}.\n\nAcesse: ${shareLink}\n\nAtenciosamente,\n${settings.companyName}`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    toast.success('Preparado para enviar por email');
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copiado para a área de transferência');
  };
  
  const downloadAsPng = async () => {
    if (!printableAreaRef.current) return;
    
    try {
      toast.loading('Gerando imagem...');
      const canvas = await html2canvas(printableAreaRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF'
      });
      
      const link = document.createElement('a');
      link.download = `agenda_${client.name.replace(/\s+/g, '_').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.dismiss();
      toast.success('Imagem da agenda salva com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      toast.dismiss();
      toast.error('Erro ao gerar imagem da agenda');
    }
  };
  
  const printContent = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Bloqueador de pop-up impediu a impressão. Por favor, desabilite-o e tente novamente.');
      return;
    }

    const printableArea = printableAreaRef.current;
    if (!printableArea) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Agenda de ${client.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .agenda-header { text-align: center; margin-bottom: 20px; }
            .agenda-header h1 { color: ${themeColor}; }
            .card-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
            .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
            .card-date { background-color: ${themeColor}; color: white; display: inline-block; padding: 5px 10px; border-radius: 15px; font-weight: bold; margin-bottom: 10px; }
            .card-title { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
            .card-type { background-color: #f1f5f9; color: #64748b; padding: 4px 8px; border-radius: 4px; display: inline-block; font-size: 12px; margin-bottom: 8px; }
            .card-text { white-space: pre-line; }
            @media print {
              .card { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="agenda-header">
            <h1>Agenda de Postagens</h1>
            <h2>${client.name}</h2>
            <p>${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div class="card-container">
            ${Array.from(printableArea.querySelectorAll('.agenda-card'))
              .map(card => card.outerHTML)
              .join('')}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      // Don't close window, allowing user to cancel print or view
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Compartilhar Agenda de {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="preview">Visualização</TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="p-4">
            <div className="mb-4 flex items-center gap-2 p-2 bg-gray-50 rounded border">
              <input 
                type="text" 
                readOnly 
                value={shareLink} 
                className="flex-1 bg-transparent border-0 focus:outline-none text-sm"
              />
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                size="sm"
              >
                Copiar
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <Button 
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Button>
              
              <Button 
                onClick={shareViaFacebook}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="w-4 h-4" />
                Facebook
              </Button>
              
              <Button 
                onClick={shareViaEmail}
                className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white"
                variant="outline"
              >
                <Send className="w-4 h-4" />
                Email
              </Button>
              
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Link
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="pt-2">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium">Prévia da Agenda</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={downloadAsPng}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Salvar Imagem</span>
                </Button>
                <Button 
                  onClick={printContent}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" />
                  <span className="hidden sm:inline">Imprimir</span>
                </Button>
              </div>
            </div>
            
            <div 
              className="overflow-y-auto max-h-[500px] p-4 bg-white border rounded-md"
              style={{ minHeight: '280px' }}
            >
              <div ref={printableAreaRef} className="space-y-4">
                {posts && posts.length > 0 ? (
                  posts.map((post, index) => (
                    <div key={post.id} className="agenda-card">
                      <CalendarEntry
                        date={post.date}
                        day={post.dayOfWeek}
                        title={post.title}
                        type={post.postType}
                        text={post.text}
                        highlighted={true}
                        themeColor={themeColor}
                        completed={post.completed}
                        socialNetworks={post.socialNetworks}
                        preview={true}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma postagem disponível para visualização
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
