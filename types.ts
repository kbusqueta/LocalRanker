export interface Business {
  id: string; // This corresponds to the "name" resource field in Google API (e.g., locations/12345)
  name: string;
  address: string;
  category: string;
  logoUrl: string;
}

export interface StatMetric {
  date: string;
  views: number;
  clicks: number;
  calls: number; // Note: API might return different breakdown
}

export interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  status: 'PUBLISHED' | 'SCHEDULED';
  scheduledDate?: string; 
  createdAt: string;
  apiState?: string; // 'LIVE', 'PROCESSING', etc.
}

export interface Review {
  id: string;
  reviewerName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  reply?: string;
  reviewId: string; // Google API ID
}

export interface BusinessImage {
  id: string;
  url: string;
  uploadDate: string;
  latitude?: number;
  longitude?: number;
}
