import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Explicitly handle API key lookup for various environment variable naming conventions
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey && process.env.NODE_ENV === 'production') {
  console.warn('AeroGuard Warning: No Gemini API key detected. AI Advisor features will fail.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: apiKey,
    }),
  ],
  model: 'googleai/gemini-2.5-flash',
});

export { apiKey };
