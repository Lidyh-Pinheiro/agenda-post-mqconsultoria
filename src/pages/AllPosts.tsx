
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AllPosts = () => {
  const { ownerName, currentClient } = useSettings();
  
  const pageTitle = currentClient 
    ? `Agenda de ${currentClient.name}` 
    : `Agenda de ${ownerName}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Header 
        title={pageTitle}
        subtitle="Todas as postagens" 
        showSettings={true}
      />
      
      <div className="mb-8">
        <Link to="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500 text-center py-10">
          Nenhuma postagem disponível.
        </p>
      </div>
    </div>
  );
};

export default AllPosts;
