
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WhatsappIcon, FacebookIcon, Send } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, clientId }) => {
  const { settings, generateClientShareLink } = useSettings();
  
  const client = clientId 
    ? settings.clients.find(c => c.id === clientId) 
    : null;
  
  if (!client) return null;
  
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Compartilhar Agenda de {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
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
              <WhatsappIcon className="w-4 h-4" />
              WhatsApp
            </Button>
            
            <Button 
              onClick={shareViaFacebook}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FacebookIcon className="w-4 h-4" />
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
            >
              Copiar Link
            </Button>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center">
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
