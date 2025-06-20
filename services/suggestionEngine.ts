// services/suggestionEngine.ts
import { nepaliDictionary, nepaliDictionaryRomanized } from '../resources/nepaliDictionary';
import { transliterate } from './nepaliTransliterator';
import { MAX_SUGGESTIONS_DISPLAY } from '../constants';

// Basic Levenshtein distance function for fuzzy matching (optional, can be performance intensive)
function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}


export const getSuggestions = (currentDevanagariPrefix: string, currentRomanPrefix: string): string[] => {
  if (!currentDevanagariPrefix.trim() && !currentRomanPrefix.trim()) return [];

  const devanagariPrefixClean = currentDevanagariPrefix.replace(/्$/, ''); // Ignore trailing halanta for prefix matching

  const directMatches = new Set<string>();

  // 1. Match by Devanagari prefix
  if (devanagariPrefixClean) {
    for (const word of nepaliDictionary) {
      if (word.startsWith(devanagariPrefixClean)) {
        directMatches.add(word);
        if (directMatches.size >= MAX_SUGGESTIONS_DISPLAY * 2) break; // Limit early for performance
      }
    }
  }

  // 2. Match by Roman prefix against a romanized dictionary (if available)
  // This helps with phonetic similarities where direct transliteration might differ slightly.
  if (currentRomanPrefix) {
    for (let i = 0; i < nepaliDictionaryRomanized.length; i++) {
        if (nepaliDictionaryRomanized[i].startsWith(currentRomanPrefix.toLowerCase())) {
            directMatches.add(nepaliDictionary[i]); // Add the Devanagari equivalent
             if (directMatches.size >= MAX_SUGGESTIONS_DISPLAY * 2) break;
        }
    }
  }
  
  let suggestions = Array.from(directMatches);

  // 3. Simple scoring: shorter words, or words closer to the prefix length are often preferred.
  // Prioritize exact Devanagari prefix matches.
  suggestions.sort((a, b) => {
    const aStartsWithDev = a.startsWith(devanagariPrefixClean);
    const bStartsWithDev = b.startsWith(devanagariPrefixClean);

    if (aStartsWithDev && !bStartsWithDev) return -1;
    if (!aStartsWithDev && bStartsWithDev) return 1;
    
    // Prefer shorter words among those that match
    return a.length - b.length;
  });


  // 4. If not enough direct matches, consider fuzzy matching (can be slow)
  // For simplicity, this is omitted for now to keep it fast.
  // Example for fuzzy (if needed later and optimized):
  // if (suggestions.length < MAX_SUGGESTIONS_DISPLAY && currentDevanagariPrefix.length > 2) {
  //   const threshold = currentDevanagariPrefix.length > 3 ? 2 : 1;
  //   for (const word of nepaliDictionary) {
  //     if (suggestions.includes(word)) continue; // Already added
  //     if (levenshtein(word.substring(0, currentDevanagariPrefix.length), currentDevanagariPrefix) <= threshold) {
  //       suggestions.push(word);
  //       if (suggestions.length >= MAX_SUGGESTIONS_DISPLAY) break;
  //     }
  //   }
  // }
  
  return suggestions.slice(0, MAX_SUGGESTIONS_DISPLAY);
};
