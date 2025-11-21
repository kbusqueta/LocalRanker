import { GoogleGenAI } from "@google/genai";

// Initialize API Client
// NOTE: In a real app, ensure process.env.API_KEY is set. 
// For this demo, if no key is present, it will throw an error.
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Missing API Key for Gemini");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generatePostContent = async (topic: string, businessName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Configuration API manquante.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rédige un post court et engageant (max 80 mots) pour Google Business Profile pour l'établissement "${businessName}". Le sujet est : "${topic}". Inclus des emojis et des hashtags pertinents.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating post:", error);
    return "Erreur lors de la génération du contenu.";
  }
};

export const generateReviewReply = async (reviewComment: string, rating: number, businessName: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Configuration API manquante.";

  try {
    const prompt = `Agis en tant que propriétaire de "${businessName}". Rédige une réponse professionnelle, polie et empathique à cet avis client (Note: ${rating}/5) : "${reviewComment}". La réponse doit être courte.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating reply:", error);
    return "Erreur lors de la génération de la réponse.";
  }
};
