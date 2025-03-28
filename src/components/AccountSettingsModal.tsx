
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface AccountSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ open, onOpenChange }) => {
  const [currentTab, setCurrentTab] = useState('email');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Por favor, preencha o email");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: email
      });
      
      if (error) throw error;
      
      toast.success("Email atualizado com sucesso!", {
        description: "Verifique sua caixa de entrada para confirmar o novo email.",
      });
      
      setEmail('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating email:', error);
      toast.error("Não foi possível atualizar o email", {
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso!");
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error("Não foi possível atualizar a senha", {
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações da Conta</DialogTitle>
          <DialogDescription>
            Atualize suas informações de acesso.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="email" value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="password">Senha</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleUpdateEmail} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Novo Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu-novo-email@exemplo.com"
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Atualizando..." : "Atualizar Email"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="password">
            <form onSubmit={handleUpdatePassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <DialogFooter className="mt-6">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Atualizando..." : "Atualizar Senha"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AccountSettingsModal;
