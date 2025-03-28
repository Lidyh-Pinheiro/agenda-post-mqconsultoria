
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

interface PasswordProtectionProps {
  clientName: string;
  themeColor: string;
  onPasswordVerified: (password: string) => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({
  clientName,
  themeColor,
  onPasswordVerified
}) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleVerifyPassword = () => {
    if (!password.trim()) {
      setPasswordError(true);
      toast.error('Senha incorreta. Tente novamente.');
      return;
    }
    
    onPasswordVerified(password);
  };

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4"
      style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}15, white)` }}
    >
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-6 flex flex-col items-center">
          <Lock className="h-12 w-12 text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold text-center mb-2" style={{ color: themeColor }}>
            Agenda Protegida
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Esta agenda de {clientName} é protegida por senha. Digite a senha para visualizar as postagens.
          </p>
          
          <div className="w-full space-y-4">
            <Input
              type="password"
              placeholder="Digite a senha"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              className={passwordError ? "border-red-500" : ""}
            />
            
            {passwordError && (
              <p className="text-red-500 text-sm">Senha incorreta. Tente novamente.</p>
            )}
            
            <Button 
              className="w-full"
              onClick={handleVerifyPassword}
              style={{ 
                backgroundColor: themeColor,
                color: "white"
              }}
            >
              Acessar Agenda
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordProtection;
