import React, { useState } from 'react';
import { Business, Post } from '../types';
import { generatePostContent } from '../services/geminiService';
import { createPost } from '../services/googleApiService';

interface PostsManagerProps {
  business: Business;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}

export const PostsManager: React.FC<PostsManagerProps> = ({ business, posts, setPosts }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleGenerate = async () => {
    if (!topic) return;
    setIsGenerating(true);
    const content = await generatePostContent(topic, business.name);
    setNewPostContent(content);
    setIsGenerating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    try {
        // Use API to create post
        await createPost(business.id, newPostContent);
        
        // Optimistic update
        const newPost: Post = {
          id: 'temp-' + Date.now().toString(),
          content: newPostContent,
          status: 'PUBLISHED',
          createdAt: new Date().toISOString(),
        };
        
        setPosts([newPost, ...posts]);
        setIsCreating(false);
        setNewPostContent('');
        setTopic('');
    } catch (err) {
        alert("Erreur lors de la publication. Vérifiez les droits API.");
        console.error(err);
    } finally {
        setIsPosting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Posts & Actualités</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>+ Nouveau Post</span>
        </button>
      </div>

      {isCreating && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <h3 className="font-semibold mb-4">Créer un post sur Google</h3>
          <div className="mb-4 space-y-2">
            <label className="block text-sm font-medium text-gray-700">Génération par IA (Gemini)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Sujet (ex: Promotion de printemps...)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !topic}
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
              >
                {isGenerating ? '...' : '✨ Générer'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Quoi de neuf ?"
              className="w-full border rounded-lg p-3 h-32 mb-4 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
            
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuler
              </button>
              <button 
                type="submit"
                disabled={isPosting}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isPosting ? 'Publication...' : 'Publier maintenant'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
            {post.imageUrl && (
              <img src={post.imageUrl} alt="Post" className="w-24 h-24 object-cover rounded-lg bg-gray-200" />
            )}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 bg-green-100 text-green-800">
                    Publié
                  </span>
                  <p className="text-sm text-gray-500 mb-1">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-gray-800">{post.content}</p>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
            <div className="text-center py-10 text-gray-500">Aucun post trouvé sur la fiche.</div>
        )}
      </div>
    </div>
  );
};
