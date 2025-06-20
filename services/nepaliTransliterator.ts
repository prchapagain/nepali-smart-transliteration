// services/nepaliTransliterator.ts

// Mappings from Roman to Devanagari
const baseVowels: Record<string, string> = {
  'a': 'अ', 'aa': 'आ', 'i': 'इ', 'ee': 'ई', 'u': 'उ', 'oo': 'ऊ',
  'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ',
  'am': 'अं', 'aM': 'अँ', 'ah': 'अः',
  'om': 'ॐ',
  'ri': 'ऋ', 'ru': 'ऋ', // 'ru' often used for ऋ
};

const baseConsonants: Record<string, string> = {
  'k': 'क', 'kh': 'ख', 'g': 'ग', 'gh': 'घ', 'ng': 'ङ',
  'ch': 'च', 'chh': 'छ', 'j': 'ज', 'jh': 'झ', 'yN': 'ञ',
  'T': 'ट', 'Th': 'ठ', 'D': 'ड', 'Dh': 'ढ', 'N': 'ण',
  't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
  'p': 'प', 'ph': 'फ', 'b': 'ब', 'bh': 'भ', 'm': 'म',
  'y': 'य', 'r': 'र', 'l': 'ल', 'w': 'व', 'v': 'व',
  'sh': 'श', 'Sh': 'ष', 's': 'स', 'h': 'ह',
  'ksh': 'क्ष', 'tr': 'त्र', 'gy': 'ज्ञ', 'shr': 'श्र',
  'z': 'ज', 'f': 'फ', 
};

const matras: Record<string, string> = {
  'aa': 'ा', 'i': 'ि', 'ee': 'ी', 'u': 'ु', 'oo': 'ू',
  'e': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ',
  'am': 'ं', 'aM': 'ँ', 'ah': 'ः',
  'ri': 'ृ', 'ru': 'ृ',
  // 'a' is implicit, no matra symbol
};

const halanta = '्';
const chandraBinduChar = 'ँ';

// All Roman tokens, ordered by length descending. Crucial for longest match.
// Filtered to ensure unique tokens, prioritizing longer ones.
const allRomanTokens = Array.from(new Set(
  [
    ...Object.keys(baseConsonants),
    ...Object.keys(baseVowels),
    ...Object.keys(matras)
  ].sort((a, b) => b.length - a.length)
));
// Ensure specific multi-char tokens that might be substrings of others are correctly ordered if necessary,
// though sort by length descending usually handles this. e.g. 'chh' before 'ch'. The Set and sort should handle this.

export function transliterate(roman: string): string {
  if (!roman) return '';

  let devanagari = '';
  let i = 0;
  let previousWasConsonant = false;

  while (i < roman.length) {
    let matchedToken = '';
    let consumedLength = 0;

    // Special handling for 'M' (Chandrabindu) if it follows a vowel sound.
    // This runs before general token matching for the current character if it's 'M'.
    if (roman[i] === 'M' && !previousWasConsonant && devanagari.length > 0) {
      // Check if the last character in devanagari can take a chandrabindu
      // This is a simplified check; more sophisticated would analyze the phonetics
      const lastDevChar = devanagari[devanagari.length - 1];
      let canApplyStandaloneChandrabindu = false;
      // If last char is a full vowel or a matra that implies a vowel ending
      if (Object.values(baseVowels).includes(lastDevChar) || Object.values(matras).includes(lastDevChar)) {
         canApplyStandaloneChandrabindu = true;
      }
      // Specific check for anusvara (ं) which should be replaced by chandrabindu (ँ)
      if (lastDevChar === matras.am) { // अं -> अँ
        devanagari = devanagari.slice(0, -1) + chandraBinduChar;
        canApplyStandaloneChandrabindu = false; // Already handled
      }
      
      if (canApplyStandaloneChandrabindu) {
        devanagari += chandraBinduChar;
      } else {
        // If 'M' cannot form chandrabindu here, treat it as part of 'am' or 'aM' later or literal 'M'
        // For now, let normal token matching try to pick it up or treat as literal.
        // This 'else' means we fall through to normal token matching for 'M'.
      }
      if (canApplyStandaloneChandrabindu){ // only increment if M was consumed as chandrabindu
           i++;
           previousWasConsonant = false; // Chandrabindu is vowel-like
           continue;
      }
    }
    
    // Find the longest Roman token that matches from the current position
    for (const token of allRomanTokens) {
      if (roman.startsWith(token, i)) {
        matchedToken = token;
        consumedLength = token.length;
        break;
      }
    }

    if (matchedToken) {
      if (matchedToken === 'a') {
        if (!previousWasConsonant) { // 'a' at the start of a word or after a space/vowel
          devanagari += baseVowels['a']; // Add 'अ'
        }
        // Whether 'a' added 'अ' or just completed a consonant, the sound is now vowel-like
        previousWasConsonant = false;
      } else if (baseConsonants[matchedToken]) {
        const consonant = baseConsonants[matchedToken];
        if (previousWasConsonant) {
          devanagari += halanta;
        }
        devanagari += consonant;
        previousWasConsonant = true;
      } else if (previousWasConsonant && matras[matchedToken]) {
        // A matra-forming token (like 'e', 'o', 'aa', 'i') follows a consonant
        devanagari += matras[matchedToken];
        previousWasConsonant = false;
      } else if (baseVowels[matchedToken]) {
        // A full vowel token (like 'aa', 'ee', or 'a'/'e'/'o' at start)
        // This case handles vowels at the beginning of words/syllables or after other vowels.
        // If previousWasConsonant is true here, it means a consonant was followed by a vowel token
        // that wasn't converted to a matra (e.g., less common vowel without a standard matra in our map, or error).
        if (previousWasConsonant) { 
             devanagari += halanta; // Default behavior if matra logic didn't catch it.
        }
        devanagari += baseVowels[matchedToken];
        previousWasConsonant = false;
      } else {
        // Token exists in maps but didn't fit categories (should be rare), treat as literal segment
         if (previousWasConsonant) devanagari += halanta;
         devanagari += matchedToken; // Add the Roman token itself if it's not mapped well
         previousWasConsonant = false; // Assuming it's some sort of vowel or unknown sound
      }
      i += consumedLength;
    } else {
      // No token matched (e.g., a symbol, number, or unmapped Roman character)
      if (previousWasConsonant) {
        devanagari += halanta; // End previous consonant string
      }
      devanagari += roman[i]; // Add the literal character
      previousWasConsonant = false; // Reset state
      i++;
    }
  }

  // If the Roman string ends with a consonant that wasn't followed by an 'a' or another vowel matra
  if (previousWasConsonant) {
    devanagari += halanta;
  }

  return devanagari;
}
