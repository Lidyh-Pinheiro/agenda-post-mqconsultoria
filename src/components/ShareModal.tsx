
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, Facebook, Link as LinkIcon, Copy, Share2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, clientId }) => {
  const { settings, generateClientShareLink } = useSettings();
  const [shareUrl, setShareUrl] = useState<string>('');
  
  const client = clientId 
    ? settings.clients.find(c => c.id === clientId) 
    : null;
  
  if (!client) return null;
  
  const themeColor = client ? client.themeColor : "#dc2626";
  
  useEffect(() => {
    if (clientId) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/client-view/${clientId}`;
      setShareUrl(url);
    }
  }, [clientId, open]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("URL copiada!", {
      description: "Link de acesso do cliente copiado para a área de transferência."
    });
  };
  
  const shareViaWhatsApp = () => {
    const messageText = `Confira a agenda de postagens de ${client.name}: ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(messageText)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const shareViaFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank');
  };
  
  const shareViaInstagram = () => {
    // Instagram doesn't have a direct share URL that works like WhatsApp or Facebook
    // Best approach is to copy the URL and provide instructions
    navigator.clipboard.writeText(shareUrl);
    toast.success("URL copiada para compartilhar no Instagram", {
      description: "Cole o link em sua bio ou em uma mensagem direta no Instagram."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Compartilhar - {client.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Link da Agenda</label>
            <div className="flex">
              <Input 
                value={shareUrl} 
                readOnly
                className="flex-1 rounded-r-none focus-visible:ring-0"
              />
              <Button 
                onClick={copyToClipboard} 
                className="rounded-l-none"
                style={{ backgroundColor: themeColor }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Este link permite acesso à agenda do cliente usando a senha configurada.
            </p>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium">Compartilhar via</h3>
              <p className="text-sm text-gray-500 mt-1">Escolha como compartilhar o acesso</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 py-6"
                onClick={shareViaWhatsApp}
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span>WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 py-6"
                onClick={shareViaInstagram}
              >
                <Instagram className="w-5 h-5 text-pink-500" />
                <span>Instagram</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 py-6"
                onClick={shareViaFacebook}
              >
                <Facebook className="w-5 h-5 text-blue-500" />
                <span>Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center gap-2 py-6"
                onClick={copyToClipboard}
              >
                <LinkIcon className="w-5 h-5 text-gray-700" />
                <span>Copiar Link</span>
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Acessar área
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
