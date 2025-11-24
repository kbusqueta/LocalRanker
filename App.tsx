import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'sans-serif',
      backgroundColor: '#f0f9ff'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Déploiement Réussi ! 🚀</h1>
        <p style={{ color: '#4b5563' }}>Vercel fonctionne correctement.</p>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>Nous pouvons maintenant réintégrer le code de l'application.</p>
      </div>
    </div>
  );
};

export default App;