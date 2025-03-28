
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';

export const clientFormSchema = z.object({
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
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

interface AddClientFormProps {
  onSubmit: (values: ClientFormValues) => void;
  onCancel: () => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ onSubmit, onCancel }) => {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      themeColor: "#1E3A8A",
      password: "",
      active: true,
      description: "",
    },
  });

  return (
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
        <DialogFooter className="flex flex-row gap-3 justify-end">
          <Button type="button" variant="neutral" onClick={onCancel} className="rounded-[10px]">Cancelar</Button>
          <Button type="submit" className="rounded-[10px]">Salvar</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default AddClientForm;
