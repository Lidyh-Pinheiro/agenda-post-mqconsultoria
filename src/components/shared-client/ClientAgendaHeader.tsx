
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface ClientAgendaHeaderProps {
  clientName: string;
  description?: string;
  themeColor: string;
}

const ClientAgendaHeader: React.FC<ClientAgendaHeaderProps> = ({
  clientName,
  description,
  themeColor
}) => {
  const handlePrint = () => {
    window.print();
  };
  
  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copiado para a área de transferência');
  };

  return (
    <div className="text-center mb-8 print:mb-12">
      <h1 
        className="text-3xl font-bold tracking-tight print:text-4xl"
        style={{ color: themeColor }}
      >
        Agenda de Postagens
      </h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-2 print:text-3xl">
        {clientName}
      </h2>
      <p className="text-gray-700 mt-2 print:text-lg">
        {description || "Confira abaixo as postagens planejadas"}
      </p>
      
      <div className="mt-4 print:hidden flex justify-center gap-2">
        <Button
          onClick={handlePrint}
          variant="outline"
          className="flex items-center gap-2"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          <Printer className="w-4 h-4" />
          Compartilhar
        </Button>
        <Button
          onClick={copyPageLink}
          variant="outline"
          className="flex items-center gap-2"
          style={{ borderColor: themeColor, color: themeColor }}
        >
          <Copy className="w-4 h-4" />
          Copiar Link
        </Button>
      </div>
    </div>
  );
};

export default ClientAgendaHeader;
