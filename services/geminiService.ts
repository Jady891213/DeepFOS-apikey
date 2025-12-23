
import { GoogleGenAI } from "@google/genai";
import { KeyScope } from "../types";

export const analyzeKeySecurity = async (name: string, scopes: KeyScope[], environment: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `You are a cybersecurity expert for the Deepfos Platform.
  A user is creating a new API Key:
  - Name: "${name}"
  - Target Environment: ${environment}
  - Selected Scopes: ${scopes.join(', ')}
  
  Provide a professional security recommendation (max 40 words). 
  Focus on the principle of least privilege.
  If environment is 'production', strongly suggest IP whitelisting.
  If scopes include 'admin', issue a warning about potential account-wide impact.
  Be concise and authoritative.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Ensure periodic key rotation and IP-based restrictions for production environments.";
  } catch (error) {
    return "Prioritize IP whitelisting for keys with write access in production.";
  }
};
