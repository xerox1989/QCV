
import { GoogleGenAI } from "@google/genai";

/**
 * Analyzes an image (ID card, certificate, or document) using Gemini.
 * Extracts structured data for the vault.
 */
export const analyzeImageForVault = async (base64Image: string): Promise<any> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Analyze this image. It is likely an ID card, Document, or a shared Credential QR Code.
      
      1. If it contains a QR Code, decode the raw text data from it and place it in the "qrData" field.
      2. Extract all visible text fields into a JSON structure suitable for a secure vault.
      
      Return ONLY JSON. 
      Schema:
      {
        "title": "Clear descriptive title of the document/identity",
        "qrData": "RAW_QR_CODE_TEXT_IF_FOUND",
        "fields": {
           "FullName": "...",
           "ID_Number": "...",
           "Expiry": "...",
           "Issuer": "...",
           "Username": "..."
        },
        "suggestedType": "ID_CARD" | "CERTIFICATE" | "PASSWORD" | "BANK_CARD" | "NOTE",
        "remarks": "Summary of the document status"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};

/**
 * Generates a high-entropy secure password using Gemini.
 */
export const generateSecurePassword = async (): Promise<string> => {
    if (!process.env.API_KEY) return "Fallback-P@ssw0rd-123!";

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: "Generate one extremely secure, high-entropy password (16-24 chars, mixed case, numbers, symbols). Return ONLY the password string."
        });
        return response.text?.trim() || "Gen-Error-Secure-99!";
    } catch (e) {
        return "Secure-Fallback-123!";
    }
};
