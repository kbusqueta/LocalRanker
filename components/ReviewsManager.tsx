import React, { useState } from 'react';
import { Business, Review } from '../types';
import { generateReviewReply } from '../services/geminiService';
import { replyToReview } from '../services/googleApiService';

interface ReviewsManagerProps {
  business: Business;
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({ business, reviews, setReviews }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateReply = async (review: Review) => {
    setIsGenerating(true);
    const suggestion = await generateReviewReply(review.comment, review.rating, business.name);
    setReplyText(suggestion);
    setIsGenerating(false);
  };

  const submitReply = async (reviewId: string) => {
    setIsSubmitting(true);
    try {
        await replyToReview(business.id, reviewId, replyText);
        
        // Update UI locally
        setReviews(reviews.map(r => 
            r.id === reviewId ? { ...r, reply: replyText } : r
        ));
        setReplyingTo(null);
        setReplyText('');
    } catch (e) {
        alert("Erreur lors de l'envoi de la réponse.");
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Avis Clients</h2>
      
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold uppercase">
                  {review.reviewerName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                  <div className="flex text-yellow-400 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-sm text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
            </div>

            <p className="text-gray-700 mt-2 mb-4">{review.comment}</p>

            {review.reply ? (
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm font-semibold text-gray-900 mb-1">Votre réponse</p>
                <p className="text-gray-600 text-sm">{review.reply}</p>
              </div>
            ) : (
              <div>
                {replyingTo === review.id ? (
                  <div className="animate-fade-in">
                     <div className="flex justify-end mb-2">
                        <button 
                            onClick={() => handleGenerateReply(review)}
                            disabled={isGenerating}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 flex items-center gap-1"
                        >
                            {isGenerating ? '...' : '✨ Suggérer une réponse avec IA'}
                        </button>
                     </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full border rounded-lg p-3 mb-2 focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                      placeholder="Écrivez votre réponse..."
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setReplyingTo(null)}
                        className="px-3 py-1 text-gray-600 text-sm hover:bg-gray-100 rounded"
                      >
                        Annuler
                      </button>
                      <button 
                        onClick={() => submitReply(review.id)}
                        disabled={!replyText || isSubmitting}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSubmitting ? 'Envoi...' : 'Publier'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                        setReplyingTo(review.id);
                        setReplyText('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Répondre
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
            <div className="text-center py-10 text-gray-500">Aucun avis chargé.</div>
        )}
      </div>
    </div>
  );
};
