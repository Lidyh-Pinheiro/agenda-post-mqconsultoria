
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share, Copy, Lock } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { getAllPostsFromLocalStorage, savePostsToLocalStorage } from '@/integrations/supabase/client';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string | undefined;
  posts?: any[]; // Add this prop
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, clientId, posts }) => {
  const { settings, generateClientShareLink } = useSettings();
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const client = settings.clients.find(c => c.id === clientId);
  
  useEffect(() => {
    if (clientId) {
      const link = generateClientShareLink(clientId);
      setShareLink(link);
    }
  }, [clientId, generateClientShareLink]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    
    toast.success("Link copiado para a área de transferência!", {
      description: "Agora é só compartilhar com o cliente.",
      duration: 3000,
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };
  
  const handlePublishToClient = async () => {
    if (!clientId) return;
    
    setIsPublishing(true);
    
    try {
      // Get all posts for this client - either from props or from localStorage
      const clientPosts = posts || getAllPostsFromLocalStorage().filter(post => post.clientId === clientId);
      
      // Make sure we have data to publish
      if (clientPosts.length === 0) {
        toast.error("Nenhuma postagem encontrada para este cliente", {
          description: "Adicione algumas postagens antes de compartilhar.",
          duration: 4000,
        });
        setIsPublishing(false);
        return;
      }
      
      // Store the posts in localStorage
      const result = savePostsToLocalStorage(clientPosts, clientId);
      
      if (result) {
        toast.success("Agenda publicada com sucesso!", {
          description: "O cliente agora pode acessar as postagens através do link compartilhado.",
          duration: 4000,
        });
      } else {
        throw new Error("Falha ao publicar agenda");
      }
    } catch (error) {
      console.error("Error publishing agenda:", error);
      toast.error("Erro ao publicar agenda", {
        description: "Tente novamente mais tarde.",
        duration: 4000,
      });
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Compartilhar Agenda
          </DialogTitle>
          <DialogDescription>
            Compartilhe a agenda com o cliente através do link abaixo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input 
              value={shareLink}
              readOnly
              className="flex-1"
            />
            <Button 
              size="sm"
              onClick={handleCopyLink}
              variant={copied ? "default" : "outline"}
              className={copied ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
            <div className="flex items-start">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Agenda protegida por senha
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  {client?.password ? (
                    <>
                      Esta agenda está protegida com a senha <strong>{client.password}</strong>.
                      O cliente precisará desta senha para acessar o conteúdo.
                    </>
                  ) : (
                    <>
                      Esta agenda não tem senha definida. Recomendamos adicionar uma 
                      senha nas configurações do cliente para proteger o acesso.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <div className="text-xs text-gray-500">
            Última atualização: {new Date().toLocaleDateString()}
          </div>
          <Button 
            onClick={handlePublishToClient}
            disabled={isPublishing}
            className="sm:w-auto"
          >
            {isPublishing ? "Publicando..." : "Publicar para o cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
