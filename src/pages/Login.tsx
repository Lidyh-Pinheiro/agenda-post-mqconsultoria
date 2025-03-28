
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Mail, Lock, Megaphone, RefreshCw, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginType, setLoginType] = useState('user');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Regular user authentication
    if (loginType === 'user' && email === 'contato@mqconsultoria.marketing' && password === '11021979My@') {
      setTimeout(() => {
        // Store logged in state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'false');
        
        // If remember me is checked, set a long expiration
        if (rememberMe) {
          // Store the remember me preference in localStorage
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.setItem('rememberMe', 'false');
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema de gestão de agenda.",
        });
        navigate('/');
        setIsLoading(false);
      }, 1000);
    } 
    // Admin authentication
    else if (loginType === 'admin' && adminEmail === 'contato@mqconsultoria.marketing' && adminPassword === '11021979My@') {
      setTimeout(() => {
        // Store logged in state for admin
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'true');
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.setItem('rememberMe', 'false');
        }
        
        toast({
          title: "Login de administrador realizado com sucesso!",
          description: "Bem-vindo ao painel de administração.",
        });
        navigate('/admin');
        setIsLoading(false);
      }, 1000);
    } else {
      setTimeout(() => {
        toast({
          title: "Falha no login",
          description: "Email ou senha incorretos. Por favor, tente novamente.",
          variant: "destructive",
        });
        setIsLoading(false);
      }, 1000);
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate password reset
    setTimeout(() => {
      toast({
        title: "Email enviado!",
        description: "Instruções para redefinir sua senha foram enviadas para seu email.",
      });
      setIsLoading(false);
      setShowForgotPassword(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg mb-4">
            <Megaphone className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Agenda de Postagens</h1>
          <p className="text-gray-600">Acesse o sistema para gerenciar seus conteúdos</p>
        </div>

        <Card className="w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {showForgotPassword ? "Recuperar Senha" : "Login"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showForgotPassword ? (
              <Tabs defaultValue="user" value={loginType} onValueChange={setLoginType} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="user">Usuário</TabsTrigger>
                  <TabsTrigger value="admin">Administrador</TabsTrigger>
                </TabsList>
                
                <TabsContent value="user">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Senha</Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember-me" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          setRememberMe(checked === true);
                        }}
                      />
                      <Label htmlFor="remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Manter conectado
                      </Label>
                    </div>
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="admin">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email de Administrador</Label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="admin@email.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="admin-password">Senha de Administrador</Label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="••••••••"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          required
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="admin-remember-me" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => {
                          setRememberMe(checked === true);
                        }}
                      />
                      <Label htmlFor="admin-remember-me" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Manter conectado
                      </Label>
                    </div>
                    
                    <Button type="submit" className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Entrando como Admin...
                        </>
                      ) : (
                        "Entrar como Administrador"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instruções de recuperação"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm">
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setShowForgotPassword(!showForgotPassword);
                  setResetEmail(email);
                }}
              >
                {showForgotPassword ? "Voltar para o login" : "Esqueceu sua senha?"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
