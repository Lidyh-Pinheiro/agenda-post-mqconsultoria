
import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface PasswordConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => void;
  title?: string;
  description?: string;
}

const PasswordConfirmDialog: React.FC<PasswordConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar!",
  description = "Para confirmar, por favor digite a senha do cliente."
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleConfirm = () => {
    if (!password) {
      setError(true);
      return;
    }
    
    onConfirm(password);
    setPassword(''); // Reset password field
    setError(false);
  };

  const handleCancel = () => {
    setPassword(''); // Reset password field
    setError(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 py-4">
          <Lock className="h-5 w-5 text-gray-400" />
          <Input
            type="password"
            placeholder="Digite a senha do cliente"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            className={error ? "border-red-500" : ""}
          />
        </div>
        
        {error && (
          <p className="text-sm text-red-500 -mt-2 mb-2">
            Por favor, digite a senha para continuar.
          </p>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            Confirmar Exclusão
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PasswordConfirmDialog;
