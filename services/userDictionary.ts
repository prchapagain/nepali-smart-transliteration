import { USER_DICTIONARY_KEY } from '../constants';
import { UserDictionary, UserWordEntry } from '../types';

const loadDictionary = (): UserDictionary => {
  try {
    const stored = localStorage.getItem(USER_DICTIONARY_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error("Failed to load user dictionary:", e);
    // localStorage.removeItem(USER_DICTIONARY_KEY); // Optional: Clear corrupted data
    return {};
  }
};

const saveDictionary = (dictionary: UserDictionary): void => {
  try {
    // Ensure dictionary doesn't grow excessively
    const entries = Object.entries(dictionary);
    if (entries.length > 200) { // Limit dictionary size
      // Sort by lastUsed (most recent first) and then frequency, take top 150
      const sortedTrimmedEntries = entries
        .sort(([, aVal], [, bVal]) => {
            const a = aVal as UserWordEntry;
            const b = bVal as UserWordEntry;
            if (b.lastUsed !== a.lastUsed) return b.lastUsed - a.lastUsed;
            return b.frequency - a.frequency;
        })
        .slice(0, 150);
      dictionary = Object.fromEntries(sortedTrimmedEntries);
    }
    localStorage.setItem(USER_DICTIONARY_KEY, JSON.stringify(dictionary));
  } catch (e) {
    console.error("Failed to save user dictionary:", e);
    // Could implement a more robust save or error handling for quota exceeded
  }
};

export const addWordToUserDictionary = (unicodeWord: string): void => {
  const cleanedWord = unicodeWord.trim();
  if (!cleanedWord || cleanedWord.length > 30) return; // Ignore empty or very long words

  const dictionary = loadDictionary();
  const existingEntry = dictionary[cleanedWord];

  if (existingEntry) {
    dictionary[cleanedWord] = {
      frequency: Math.min(existingEntry.frequency + 1, 1000), // Cap frequency
      lastUsed: Date.now(),
    };
  } else {
    dictionary[cleanedWord] = {
      frequency: 1,
      lastUsed: Date.now(),
    };
  }
  saveDictionary(dictionary);
};

export const getWordsFromUserDictionary = (limit: number = 5): string[] => {
  const dictionary = loadDictionary();
  return Object.entries(dictionary)
    .sort(([, aEntry], [, bEntry]) => {
      // Direct type assertion might be risky if data is malformed.
      // A safer approach would be to validate structure or provide defaults.
      const a = aEntry as UserWordEntry;
      const b = bEntry as UserWordEntry;
      
      // Default to 0 if properties are missing, for robustness
      const freqA = a.frequency || 0;
      const freqB = b.frequency || 0;
      const lastUsedA = a.lastUsed || 0;
      const lastUsedB = b.lastUsed || 0;

      if (freqB === freqA) {
        return lastUsedB - lastUsedA; // Break ties with recency
      }
      return freqB - freqA; // Sort by frequency
    })
    .slice(0, limit)
    .map(([word]) => word);
};

export const getWordInfoFromUserDictionary = (unicodeWord: string): UserWordEntry | undefined => {
  const dictionary = loadDictionary();
  return dictionary[unicodeWord.trim()];
};
