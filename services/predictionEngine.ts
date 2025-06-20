// services/predictionEngine.ts
import { MAX_PREDICTIONS_DISPLAY } from '../constants';

// Very simple hardcoded bigram model for predictions
// Keys are previous words, values are arrays of likely next words.
const commonBigrams: Record<string, string[]> = {
  "नमस्ते": ["कसरी", "तपाईंलाई", "के छ"],
  "धन्यवाद": ["तपाईंलाई", "धेरै"],
  "मेरो": ["नाम", "घर", "विचार"],
  "तिम्रो": ["नाम", "घर", "विचार"],
  "म": ["जान्छु", " खान्छु", "राम्रो छु"],
  "तिमी": ["जान्छौ", "खान्छौ", "राम्रो छौ"],
  "आज": ["मौसम", "के", "म"],
  "भोलि": ["बिदा", "के", "म"],
  "यो": ["के हो", "राम्रो छ", "मेरो हो"],
  "त्यो": ["के हो", "राम्रो छ", "तिम्रो हो"],
  "कसरी": ["हुनुहुन्छ", "छ", "जाने"],
  "के": ["छ", "हो", "खानुभयो"],
  "कहाँ": ["जानुहुन्छ", "छ", "बाट"],
  "कहिले": ["जाने", "आउने"],
  "पानी": ["पर्यो", "छैन", "देउ"],
  "भात": ["खानुभयो", "पकाउनुहोस्", "देउ"],
  // Add more common pairings
};

export const getNextWordPredictions = (lastNepaliWord: string): string[] => {
  if (!lastNepaliWord.trim()) return [];

  const cleanedLastWord = lastNepaliWord.trim();
  const predictions = commonBigrams[cleanedLastWord] || [];
  
  // Could add more sophisticated logic here, e.g., default common words if no specific bigram found.
  // For now, just return direct matches or an empty array.
  
  return predictions.slice(0, MAX_PREDICTIONS_DISPLAY);
};
