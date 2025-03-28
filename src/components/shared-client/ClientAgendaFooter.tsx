
import React from 'react';

interface ClientAgendaFooterProps {
  companyName?: string;
}

const ClientAgendaFooter: React.FC<ClientAgendaFooterProps> = ({
  companyName
}) => {
  return (
    <div className="mt-12 text-center text-gray-600 text-sm print:mt-16 print:text-base">
      <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      {companyName && (
        <p className="mt-2">{companyName}</p>
      )}
    </div>
  );
};

export default ClientAgendaFooter;
