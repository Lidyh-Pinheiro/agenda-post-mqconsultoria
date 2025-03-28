
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ClientNotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">Cliente não encontrado</h2>
            <p className="text-gray-700 mt-2">O cliente solicitado não foi encontrado ou não existe.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientNotFound;
