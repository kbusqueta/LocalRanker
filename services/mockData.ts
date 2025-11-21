import { Business, Post, Review, StatMetric, BusinessImage } from '../types';

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'b1',
    name: 'La Belle Boulangerie',
    address: '12 Rue de la Paix, 75002 Paris',
    category: 'Boulangerie',
    logoUrl: 'https://picsum.photos/100/100?random=1'
  },
  {
    id: 'b2',
    name: 'Garage Moderne',
    address: '45 Avenue des Champs-Élysées, 75008 Paris',
    category: 'Réparation automobile',
    logoUrl: 'https://picsum.photos/100/100?random=2'
  }
];

export const generateStats = (): StatMetric[] => {
  const stats: StatMetric[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    stats.push({
      date: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
      views: Math.floor(Math.random() * 500) + 100,
      clicks: Math.floor(Math.random() * 100) + 20,
      calls: Math.floor(Math.random() * 20) + 5,
    });
  }
  return stats;
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    content: 'Venez découvrir nos nouveaux croissants au beurre ! 🥐 #Paris #Food',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    imageUrl: 'https://picsum.photos/400/300?random=3'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    // Fix: Added required reviewId property
    reviewId: 'g_review_1',
    reviewerName: 'Jean Dupont',
    rating: 5,
    comment: 'Excellent service et produits de qualité. Je recommande vivement !',
    date: '2023-10-25',
    reply: 'Merci beaucoup Jean ! Au plaisir de vous revoir.'
  },
  {
    id: 'r2',
    // Fix: Added required reviewId property
    reviewId: 'g_review_2',
    reviewerName: 'Marie Martin',
    rating: 4,
    comment: 'Très bon, mais un peu d\'attente le midi.',
    date: '2023-10-28'
  },
  {
    id: 'r3',
    // Fix: Added required reviewId property
    reviewId: 'g_review_3',
    reviewerName: 'Paul Durand',
    rating: 2,
    comment: 'Déçu par la qualité aujourd\'hui.',
    date: '2023-10-29'
  }
];

export const MOCK_IMAGES: BusinessImage[] = [
  {
    id: 'img1',
    url: 'https://picsum.photos/400/300?random=10',
    uploadDate: new Date().toISOString(),
    latitude: 48.8566,
    longitude: 2.3522
  }
];