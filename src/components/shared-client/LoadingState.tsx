
import React from 'react';

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-4 text-gray-700">Carregando agenda...</p>
      </div>
    </div>
  );
};

export default LoadingState;
