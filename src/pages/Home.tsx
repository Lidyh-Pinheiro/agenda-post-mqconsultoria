
import React, { useState } from 'react';
import { Plus, Settings, Calendar, ChevronLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/contexts/SettingsContext';
import ClientCard from '@/components/ClientCard';
import ClientTable from '@/components/ClientTable';
import SettingsModal from '@/components/SettingsModal';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  themeColor: z.string().min(4, {
    message: "Cor inválida",
  }),
  password: z.string().min(1, {
    message: "Senha é obrigatória",
  }),
  active: z.boolean().default(true).optional(),
  description: z.string().optional(),
})

const Home = () => {
  const [openAddClientModal, setOpenAddClientModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const { toast } = useToast();
  const { clients, createClient, updateClient, deleteClient, shareClient, selectedClient, setSelectedClient } = useSettings();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      themeColor: "#1E3A8A",
      password: "",
      active: true,
      description: "",
    },
  })

  const handleCloseAddClientModal = () => {
    setOpenAddClientModal(false);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createClient({
      ...values,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    });
    toast({
      title: "Cliente criado com sucesso!",
      description: "O cliente foi adicionado à sua lista.",
    })
    handleCloseAddClientModal();
  }

  const handleSelectClient = (clientId: string) => {
    setSelectedClient(clientId);
    navigate(`/client/${clientId}`);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client.id);
    // Open settings modal with client tab
    setOpenSettingsModal(true);
  };

  const handleShareClient = (clientId: string) => {
    shareClient(clientId);
    toast({
      title: "Cliente compartilhado com sucesso!",
      description: "O cliente foi compartilhado com sua equipe.",
    })
  };

  const handleDeleteClient = (clientId: string) => {
    deleteClient(clientId);
    toast({
      title: "Cliente removido com sucesso!",
      description: "O cliente foi removido da sua lista.",
    })
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
          <Button onClick={() => setOpenSettingsModal(true)}>
            Configurações
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsTableView(!isTableView)}>
            {isTableView ? "Visualização em Card" : "Visualização em Tabela"}
          </Button>
          <Button onClick={() => setOpenAddClientModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Nenhum cliente cadastrado
        </div>
      ) : (
        <>
          {isTableView ? (
            <ClientTable
              clients={clients}
              onSelect={handleSelectClient}
              onEdit={handleEditClient}
              onShare={handleShareClient}
              onDelete={handleDeleteClient}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={() => handleSelectClient(client.id)}
                  onEdit={() => handleEditClient(client)}
                  onShare={() => handleShareClient(client.id)}
                  onDelete={() => handleDeleteClient(client.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Client Modal */}
      <Dialog open={openAddClientModal} onOpenChange={setOpenAddClientModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Cliente</DialogTitle>
            <DialogDescription>
              Crie um novo cliente para gerenciar a agenda de postagens.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o nome que será exibido na agenda.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="themeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input type="color" defaultValue="#1E3A8A" {...field} />
                    </FormControl>
                    <FormDescription>
                      Escolha uma cor para identificar o cliente.
                    </FormDescription>
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
                      <Input type="password" placeholder="Senha do cliente" {...field} />
                    </FormControl>
                    <FormDescription>
                      Crie uma senha para proteger os dados do cliente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escreva uma descrição sobre o cliente."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adicione uma descrição para ajudar a identificar o cliente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Defina se o cliente está ativo ou não.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseAddClientModal}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <SettingsModal
        open={openSettingsModal}
        onOpenChange={setOpenSettingsModal}
        initialTab="clients"
        editClientId={selectedClient}
      />
    </div>
  );
};

export default Home;
