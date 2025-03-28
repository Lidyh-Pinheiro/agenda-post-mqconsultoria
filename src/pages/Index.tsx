
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useSettings } from '@/contexts/SettingsContext';
import { LogIn, ArrowRight, Calendar } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});

const Index = () => {
  const { setAdminMode } = useSettings();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(localStorage.getItem('isLoggedIn') === 'true');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // For demo purposes, simple validation
      if (values.username === 'admin' && values.password === 'admin') {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        setAdminMode(true);
        toast.success("Login efetuado com sucesso!");
      } else if (values.username === 'demo' && values.password === 'demo') {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
        setAdminMode(false);
        toast.success("Login efetuado com sucesso!");
      } else {
        toast.error("Credenciais inválidas!");
      }
    } catch (error) {
      toast.error("Erro ao realizar login. Tente novamente.");
    }
  };

  // Redirect if logged in
  if (isLoggedIn) {
    return <Navigate to="/home" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Toaster />
      
      <header className="border-b bg-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">Social Calendar</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Simplifique o gerenciamento das suas redes sociais
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Organize suas postagens, coordene conteúdo e aumente seu engajamento com nossa plataforma intuitiva.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <ArrowRight className="mr-2 h-5 w-5" /> Ver demonstração
              </Button>
            </div>
          </div>
          
          <Card className="md:mt-0 mt-8 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-center mb-6 text-gray-800">
                <LogIn className="h-6 w-6 inline mr-2 text-indigo-600" />
                Acesse sua conta
              </div>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuário</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome de usuário" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Sua senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Entrar
                  </Button>
                </form>
              </Form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Use <strong>admin / admin</strong> ou <strong>demo / demo</strong> para fazer login
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600 text-sm">
            © 2023 Social Calendar. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
