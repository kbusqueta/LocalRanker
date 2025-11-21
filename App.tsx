import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { PostsManager } from './components/PostsManager';
import { ImageManager } from './components/ImageManager';
import { ReviewsManager } from './components/ReviewsManager';
import { Business, Post, Review, StatMetric, BusinessImage } from './types';
import { initGoogleAuth, triggerLogin, fetchBusinesses, fetchStats, fetchReviews, fetchPosts, DEFAULT_CLIENT_ID } from './services/googleApiService';
import { MOCK_BUSINESSES, MOCK_POSTS, MOCK_REVIEWS, MOCK_IMAGES, generateStats } from './services/mockData';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false); // New State for Demo Mode
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Separate the input state from the active configuration state to avoid re-init loops
  const [inputClientId, setInputClientId] = useState(DEFAULT_CLIENT_ID);
  const [activeClientId, setActiveClientId] = useState(DEFAULT_CLIENT_ID);
  
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'images' | 'reviews'>('dashboard');

  // State for data management
  const [posts, setPosts] = useState<Post[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [images, setImages] = useState<BusinessImage[]>([]); 
  const [stats, setStats] = useState<StatMetric[]>([]);

  // Get current origin for display
  const currentOrigin = window.location.origin;

  // Initialize Auth Client when activeClientId changes
  useEffect(() => {
    if (!activeClientId || isDemoMode) return; 

    // Reset state when ID changes
    setIsAuthReady(false);

    const attemptInit = () => {
      return initGoogleAuth(
          activeClientId, 
          (token) => setIsAuthenticated(true)
      );
    };

    // Polling to wait for Google script
    const checkScript = () => {
        if (attemptInit()) {
            setIsAuthReady(true);
            return true;
        }
        return false;
    };

    // Immediate check
    if (!checkScript()) {
      const intervalId = setInterval(() => {
        if (checkScript()) {
          clearInterval(intervalId);
        }
      }, 500);
      const timeoutId = setTimeout(() => clearInterval(intervalId), 10000);
      return () => { clearInterval(intervalId); clearTimeout(timeoutId); };
    }
  }, [activeClientId, isDemoMode]); 

  const handleApplyClientId = () => {
      if (inputClientId.trim() !== activeClientId) {
          setActiveClientId(inputClientId.trim());
      }
  };

  const handleLogin = () => {
    triggerLogin();
  };

  const handleDemoLogin = () => {
    setIsDemoMode(true);
    setIsAuthenticated(true);
    // Load mocks immediately
    setBusinesses(MOCK_BUSINESSES);
    if (MOCK_BUSINESSES.length > 0) {
        setSelectedBusinessId(MOCK_BUSINESSES[0].id);
    }
  };

  const loadBusinesses = async () => {
    if (isDemoMode) return; // Already loaded in handleDemoLogin

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBusinesses();
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusinessId(data[0].id);
      }
    } catch (err: any) {
      setError("Impossible de charger les établissements. Vérifiez que vous avez activé les API (Business Account, Business Info) dans Google Cloud Console.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger data load when authenticated
  useEffect(() => {
    if (isAuthenticated && !isDemoMode) {
      loadBusinesses();
    }
  }, [isAuthenticated, isDemoMode]);

  // Load specific data when business or tab changes
  useEffect(() => {
    if (!selectedBusinessId || !isAuthenticated) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
            // Load MOCK data
            if (activeTab === 'dashboard') setStats(generateStats());
            if (activeTab === 'reviews') setReviews(MOCK_REVIEWS);
            if (activeTab === 'posts') setPosts(MOCK_POSTS);
            if (activeTab === 'images') setImages(MOCK_IMAGES);
        } else {
            // Load REAL API data
            if (activeTab === 'dashboard') {
              const s = await fetchStats(selectedBusinessId);
              setStats(s);
            } else if (activeTab === 'reviews') {
              const r = await fetchReviews(selectedBusinessId);
              setReviews(r);
            } else if (activeTab === 'posts') {
              const p = await fetchPosts(selectedBusinessId);
              setPosts(p);
            }
        }
      } catch (e) {
        console.error("Error loading tab data", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedBusinessId, activeTab, isAuthenticated, isDemoMode]);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBusinessId(e.target.value);
  };

  const selectedBusiness = businesses.find(b => b.id === selectedBusinessId);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-gray-100 animate-fade-in">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             </div>
             <h1 className="text-2xl font-bold text-gray-900">G-Profile Manager</h1>
             <p className="text-gray-500">Connectez vos fiches Google Business</p>
          </div>
          
          <div className="mb-4 space-y-3">
             {/* BOUTON CONNEXION GOOGLE */}
             <button 
                onClick={handleLogin}
                disabled={!isAuthReady}
                className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm disabled:opacity-50 group"
              >
                {isAuthReady ? (
                     <>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
                        Se connecter avec Google
                     </>
                ) : (
                    <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        Chargement du script Google...
                    </span>
                )}
              </button>

              {/* BOUTON MODE DEMO */}
              <button 
                onClick={handleDemoLogin}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-purple-700 transition-all shadow-sm"
              >
                <span>🚀 Tester sans connexion (Mode Démo)</span>
              </button>
              <p className="text-xs text-center text-gray-400">
                 Utile si vous n'avez pas encore configuré l'accès API.
              </p>
          </div>
          
          {/* DIAGNOSTIC BOX */}
          <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 text-sm mt-8">
            <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-3">
               ⚠️ CONFIGURATION DÉPLOIEMENT
            </h3>
            <p className="mb-3 text-gray-600">
               Une fois déployé (ex: Vercel, Netlify), vous devez autoriser l'URL ci-dessous dans Google Cloud Console.
            </p>
            
            <ul className="space-y-4 text-gray-700">
                <li className="flex gap-2 items-start">
                    <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
                    <div>
                        <strong>URL à autoriser (Origine JS) :</strong>
                        <div className="mt-2 p-2 bg-white border border-red-300 text-red-600 rounded font-mono text-xs select-all break-all font-bold flex justify-between items-center">
                             {currentOrigin}
                             <span className="text-[10px] text-gray-400 uppercase tracking-wider">Copier</span>
                        </div>
                    </div>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="bg-orange-200 text-orange-800 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
                    <div className="w-full">
                        <strong>Client ID :</strong>
                        <div className="flex gap-2 mt-1">
                            <input 
                                type="text" 
                                value={inputClientId}
                                onChange={(e) => setInputClientId(e.target.value)}
                                className="flex-1 p-2 border rounded text-xs text-gray-600"
                                placeholder="Collez votre Client ID ici"
                            />
                            <button 
                                onClick={handleApplyClientId}
                                className="bg-orange-200 text-orange-800 px-3 py-1 rounded text-xs font-bold hover:bg-orange-300"
                            >
                                {inputClientId === activeClientId ? 'Actif' : 'Appliquer'}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                            Astuce : Définissez `REACT_APP_CLIENT_ID` dans les variables d'environnement de votre hébergeur pour ne pas avoir à le saisir ici.
                        </p>
                    </div>
                </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
                <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900 hidden md:block">G-Profile</span>
                {isDemoMode && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                        MODE DÉMO
                    </span>
                )}
            </div>

            <div className="flex items-center gap-4">
              {error && <span className="text-red-500 text-xs hidden md:block max-w-xs truncate">{error}</span>}
              
              <div className="relative">
                {businesses.length > 0 ? (
                  <select 
                    value={selectedBusinessId}
                    onChange={handleBusinessChange}
                    className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 pl-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 max-w-[200px]"
                  >
                    {businesses.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm text-gray-500">Aucun établissement</span>
                )}
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                GB
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-8 w-fit overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Tableau de bord' },
            { id: 'posts', label: 'Posts' },
            { id: 'images', label: 'Photos' },
            { id: 'reviews', label: 'Avis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Logic */}
        {isLoading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
           </div>
        ) : (
            selectedBusiness ? (
                <div className="animate-fade-in">
                    {activeTab === 'dashboard' && <Dashboard business={selectedBusiness} stats={stats} />}
                    {activeTab === 'posts' && <PostsManager business={selectedBusiness} posts={posts} setPosts={setPosts} />}
                    {activeTab === 'images' && <ImageManager business={selectedBusiness} images={images} setImages={setImages} />}
                    {activeTab === 'reviews' && <ReviewsManager business={selectedBusiness} reviews={reviews} setReviews={setReviews} />}
                </div>
            ) : (
                <div className="text-center text-gray-500 mt-20">
                   {error ? <p className="text-red-500">{error}</p> : "Aucun établissement trouvé sur ce compte Google."}
                </div>
            )
        )}

      </main>
    </div>
  );
};

export default App;