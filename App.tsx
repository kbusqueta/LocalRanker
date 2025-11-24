import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Application Active !</h1>
        <p className="text-gray-600 mb-6">
          La connexion avec Vercel est réparée. L'erreur 404 est résolue.
        </p>
        <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-lg border border-blue-100">
          Prochaine étape : Demandez-moi de réintégrer le code de l'application (Dashboard, Posts, etc.).
        </div>
      </div>
    </div>
  );
};

export default App;