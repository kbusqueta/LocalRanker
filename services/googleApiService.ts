import { Business, Post, Review, StatMetric, BusinessImage } from '../types';

// Prioritize Environment Variable for Production Deployment, fallback to hardcoded for dev
export const DEFAULT_CLIENT_ID = process.env.REACT_APP_CLIENT_ID || '247239819613-ddndmcsms9e1c0v7tqr68tc1edmoi3am.apps.googleusercontent.com';

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage',
  'https://www.googleapis.com/auth/business.manage.delete' 
].join(' ');

let tokenClient: any;
let accessToken: string | null = null;

// Initialize the Google Identity Services Token Client in POPUP mode
export const initGoogleAuth = (clientId: string, callback: (token: string) => void): boolean => {
  if (typeof window !== 'undefined' && (window as any).google) {
    
    const cleanClientId = clientId.trim();
    console.log("Initializing Google Token Client with ID:", cleanClientId);
    
    try {
        // @ts-ignore - Google Identity Services types
        tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: cleanClientId,
          scope: SCOPES,
          callback: (tokenResponse: any) => {
            // This callback is triggered immediately after the user logs in via the popup
            if (tokenResponse.access_token) {
              console.log("Token received successfully via Popup");
              accessToken = tokenResponse.access_token;
              callback(accessToken);
            } else {
                console.error("Token response received but no access_token:", tokenResponse);
            }
          },
          error_callback: (error: any) => {
              console.error("Google Auth Error Callback:", error);
              // Handle specific "popup_closed_by_user" which is common if the window crashes on load due to config
              if (error.type === 'popup_closed_by_user') {
                  alert("CONNEXION INTERROMPUE.\n\nCause probable : L'URL de ce site (" + window.location.origin + ") n'est pas autorisée dans votre console Google Cloud.\n\nSOLUTION :\n1. Copiez l'URL affichée dans l'encadré orange.\n2. Allez dans Google Cloud Console > Credentials > OAuth Client.\n3. Ajoutez cette URL dans 'Authorized JavaScript origins'.");
              } else {
                  alert(`Erreur Google Auth: ${error.type} - ${error.message}. Vérifiez la console.`);
              }
          }
        });
        return true;
    } catch (e) {
        console.error("Error during initTokenClient:", e);
        return false;
    }
  }
  return false;
};

export const triggerLogin = () => {
  if (tokenClient) {
    // Opens a secure popup window for login
    console.log("Triggering Token Request Popup...");
    // Use 'consent' to ensure the screen shows up especially for unverified apps in testing
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    console.error("Google Auth not initialized.");
    alert("Le script Google n'est pas encore chargé. Attendez quelques secondes ou rafraichissez la page.");
  }
};

// Helper for authenticated fetch
const apiFetch = async (url: string, options: RequestInit = {}) => {
  if (!accessToken) throw new Error("Not authenticated");
  
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText}`);
  }
  return res.json();
};

export const checkAndConsumeTokenFromUrl = (): string | null => {
    // No longer needed in popup mode, but kept to prevent import errors in App.tsx until cleaned
    return null;
};


// --- BUSINESS ACCOUNTS & LOCATIONS ---

export const fetchBusinesses = async (): Promise<Business[]> => {
  try {
    // 1. Get Accounts
    const accountsData = await apiFetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts');
    if (!accountsData.accounts || accountsData.accounts.length === 0) return [];

    const businesses: Business[] = [];

    // 2. For each account, get locations
    for (const account of accountsData.accounts) {
        const locationsUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,storefrontAddress,categories,metadata`;
        try {
            const locData = await apiFetch(locationsUrl);
            if (locData.locations) {
                for (const loc of locData.locations) {
                    businesses.push({
                        id: loc.name, // format: "accounts/X/locations/Y"
                        name: loc.title,
                        address: loc.storefrontAddress ? `${loc.storefrontAddress.addressLines?.join(', ')}, ${loc.storefrontAddress.locality}` : 'Adresse non définie',
                        category: loc.categories?.primaryCategory?.displayName || 'Non classé',
                        logoUrl: 'https://picsum.photos/100/100?random=real' // Logo retrieval is complex, using placeholder for now
                    });
                }
            }
        } catch (e) {
            console.warn(`Could not fetch locations for account ${account.name}`, e);
        }
    }
    return businesses;
  } catch (error) {
    console.error("Failed to fetch businesses", error);
    throw error;
  }
};

// --- STATISTICS (PERFORMANCE API) ---

export const fetchStats = async (locationId: string): Promise<StatMetric[]> => {
  const cleanLocationName = locationId.includes('accounts/') ? locationId.split('/').slice(2).join('/') : locationId;

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 7);

  const formatDate = (d: Date) => ({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
  });

  const url = `https://businessprofileperformance.googleapis.com/v1/${cleanLocationName}:fetchDailyMetrics?dailyMetric=BUSINESS_IMPRESSIONS_DESKTOP_MAPS&dailyMetric=BUSINESS_IMPRESSIONS_DESKTOP_SEARCH&dailyMetric=BUSINESS_IMPRESSIONS_MOBILE_MAPS&dailyMetric=BUSINESS_IMPRESSIONS_MOBILE_SEARCH&dailyMetric=CALL_CLICKS&dailyMetric=WEBSITE_CLICKS`;

  const queryUrl = `${url}&dailyRange.startDate.year=${formatDate(start).year}&dailyRange.startDate.month=${formatDate(start).month}&dailyRange.startDate.day=${formatDate(start).day}&dailyRange.endDate.year=${formatDate(end).year}&dailyRange.endDate.month=${formatDate(end).month}&dailyRange.endDate.day=${formatDate(end).day}`;

  try {
      const data = await apiFetch(queryUrl);
      // Transform data to StatMetric
      const stats: StatMetric[] = [];
      const map = new Map<string, StatMetric>();

      if (data.timeSeries && data.timeSeries.dailyMetricTimeSeries) {
          for (const metricSeries of data.timeSeries.dailyMetricTimeSeries) {
             const type = metricSeries.dailyMetric;
             if(metricSeries.timeSeries && metricSeries.timeSeries.datedValues) {
                 for(const val of metricSeries.timeSeries.datedValues) {
                     const dateKey = `${val.date.year}-${val.date.month}-${val.date.day}`;
                     const dateLabel = new Date(val.date.year, val.date.month - 1, val.date.day).toLocaleDateString('fr-FR', {weekday: 'short'});
                     
                     if(!map.has(dateKey)) {
                         map.set(dateKey, { date: dateLabel, views: 0, clicks: 0, calls: 0 });
                     }
                     const stat = map.get(dateKey)!;
                     const value = parseInt(val.value || '0', 10);

                     if (type.includes('IMPRESSIONS')) stat.views += value;
                     if (type === 'WEBSITE_CLICKS') stat.clicks += value;
                     if (type === 'CALL_CLICKS') stat.calls += value;
                 }
             }
          }
      }
      
      return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date)); 
  } catch (error) {
      console.warn("Failed to fetch real stats, falling back to mock due to potential API enable status", error);
      return [];
  }
};

// --- REVIEWS ---

export const fetchReviews = async (locationId: string): Promise<Review[]> => {
  const url = `https://mybusinessreviews.googleapis.com/v1/${locationId}/reviews`;
  
  try {
      const data = await apiFetch(url);
      if (!data.reviews) return [];

      return data.reviews.map((r: any) => ({
          id: r.reviewId,
          reviewId: r.reviewId,
          reviewerName: r.reviewer?.displayName || 'Anonyme',
          rating: ["ONE", "TWO", "THREE", "FOUR", "FIVE"].indexOf(r.starRating) + 1,
          comment: r.comment || '(Pas de commentaire)',
          date: r.createTime,
          reply: r.reviewReply?.comment || undefined
      }));
  } catch (error) {
      console.error("Error fetching reviews", error);
      return [];
  }
};

export const replyToReview = async (locationId: string, reviewId: string, replyText: string) => {
    const url = `https://mybusinessreviews.googleapis.com/v1/${locationId}/reviews/${reviewId}/reply`;
    return await apiFetch(url, {
        method: 'PUT',
        body: JSON.stringify({ comment: replyText })
    });
};

// --- POSTS ---

export const fetchPosts = async (locationId: string): Promise<Post[]> => {
    const url = `https://mybusiness.googleapis.com/v4/${locationId}/localPosts`;
    
    try {
        const data = await apiFetch(url);
        if (!data.localPosts) return [];
        
        return data.localPosts.map((p: any) => ({
            id: p.name,
            content: p.summary || p.callToAction?.actionType || 'Post sans texte',
            imageUrl: p.media?.[0]?.googleUrl || undefined,
            status: 'PUBLISHED',
            createdAt: p.createTime,
            scheduledDate: undefined 
        }));
    } catch (e) {
        console.warn("Posts API failed (likely deprecated v4 or not enabled).");
        return [];
    }
};

export const createPost = async (locationId: string, content: string, topicType = "STANDARD") => {
    const url = `https://mybusiness.googleapis.com/v4/${locationId}/localPosts`;
    const body = {
        languageCode: "fr",
        summary: content,
        topicType: topicType,
        callToAction: {
            actionType: "LEARN_MORE",
            url: "https://google.com" 
        }
    };

    return await apiFetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
    });
};