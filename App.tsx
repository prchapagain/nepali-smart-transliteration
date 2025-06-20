import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RomanInputArea } from './components/RomanInputArea';
import { DevanagariDisplay } from './components/DevanagariDisplay';
// import { LoadingSpinner } from './components/LoadingSpinner'; // Potentially remove if local ops are fast
import { ErrorAlert } from './components/ErrorAlert';
import { transliterate } from './services/nepaliTransliterator';
import { getSuggestions } from './services/suggestionEngine';
import { getNextWordPredictions } from './services/predictionEngine';
import { addWordToUserDictionary, getWordsFromUserDictionary } from './services/userDictionary';
import { useDebounce } from './hooks/useDebounce';
import { DEBOUNCE_DELAY_SUGGESTIONS } from './constants';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [romanCurrentWordInput, setRomanCurrentWordInput] = useState<string>(''); // Raw input for current word
  const [nepaliPreview, setNepaliPreview] = useState<string>(''); // Real-time transliteration of romanCurrentWordInput
  const [nepaliComposedText, setNepaliComposedText] = useState<string>(''); // Finalized Devanagari words

  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const [nextWordPredictions, setNextWordPredictions] = useState<string[]>([]);
  const [userLearnedWords, setUserLearnedWords] = useState<string[]>([]);

  // const [isLoading, setIsLoading] = useState<boolean>(false); // General loading state if needed
  const [error, setError] = useState<string | null>(null);

  const debouncedRomanInputForSuggestions = useDebounce(romanCurrentWordInput, DEBOUNCE_DELAY_SUGGESTIONS);
  const isMounted = useRef(false);

  const updateLearnedWords = useCallback(() => {
    setUserLearnedWords(getWordsFromUserDictionary(5));
  }, []);

  useEffect(() => {
    updateLearnedWords();
    isMounted.current = true;
  }, [updateLearnedWords]);

  // Real-time transliteration effect
  useEffect(() => {
    if (!isMounted.current && romanCurrentWordInput === '') return; // Avoid initial run or empty input transliteration
    try {
      const transliteratedPreview = transliterate(romanCurrentWordInput);
      setNepaliPreview(transliteratedPreview);
      setError(null);
    } catch (e: any) {
      console.error("Transliteration error:", e);
      setError("Error during transliteration. Please check input.");
      setNepaliPreview(''); // Clear preview on error
    }
  }, [romanCurrentWordInput]);

  // Effect for fetching suggestions based on debounced Roman input (which is then transliterated for prefix matching)
  useEffect(() => {
    if (!isMounted.current || !debouncedRomanInputForSuggestions.trim()) {
      setWordSuggestions([]);
      return;
    }
    // Use the already transliterated nepaliPreview corresponding to the *current* romanCurrentWordInput
    // or re-transliterate the debounced input if being very precise with debouncing.
    // For simplicity, we can use the latest `nepaliPreview` if `romanCurrentWordInput` matches `debouncedRomanInputForSuggestions`.
    // Or, more robustly, transliterate the `debouncedRomanInputForSuggestions` directly.
    const debouncedNepaliPrefix = transliterate(debouncedRomanInputForSuggestions);

    if (!debouncedNepaliPrefix.trim()) {
      setWordSuggestions([]);
      return;
    }
    // setIsLoading(true); // If suggestions take time
    try {
      const suggestions = getSuggestions(debouncedNepaliPrefix, debouncedRomanInputForSuggestions);
      setWordSuggestions(suggestions);
    } catch (e: any) {
      console.error("Failed to fetch suggestions:", e);
      // setError("Could not fetch suggestions."); // Avoid too many errors if translit error exists
      setWordSuggestions([]);
    } finally {
      // setIsLoading(false);
    }
  }, [debouncedRomanInputForSuggestions]);


  const fetchPredictions = useCallback((currentText: string) => {
    if (!currentText.trim()) {
      setNextWordPredictions([]);
      return;
    }
    // setIsLoading(true); // If predictions take time
    try {
      const lastWord = currentText.trim().split(/\s+/).pop() || '';
      const predictions = getNextWordPredictions(lastWord);
      setNextWordPredictions(predictions);
    } catch (e: any) {
      console.error("Failed to fetch predictions:", e);
      // setError("Could not fetch predictions.");
      setNextWordPredictions([]);
    } finally {
      // setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    fetchPredictions(nepaliComposedText);
  }, [nepaliComposedText, fetchPredictions]);


  const handleWordFinalized = useCallback(() => {
    if (!nepaliPreview.trim()) { // Finalize based on the transliterated preview
        // If roman input was just spaces, clear it without finalizing
        if(!romanCurrentWordInput.trim() && romanCurrentWordInput.length > 0){
            setRomanCurrentWordInput('');
            setNepaliPreview('');
        }
        return;
    }

    const wordToFinalize = nepaliPreview; // Use the transliterated version
    setNepaliComposedText(prev => prev + wordToFinalize + ' ');
    addWordToUserDictionary(wordToFinalize);
    updateLearnedWords();
    
    setRomanCurrentWordInput('');
    setNepaliPreview('');
    setWordSuggestions([]);
    // Predictions will update via useEffect on nepaliComposedText change
  }, [nepaliPreview, updateLearnedWords, romanCurrentWordInput]);

  const handleSuggestionOrPredictionClick = useCallback((nepaliWord: string) => {
    setNepaliComposedText(prev => prev + nepaliWord + ' ');
    addWordToUserDictionary(nepaliWord);
    updateLearnedWords();

    setRomanCurrentWordInput('');
    setNepaliPreview('');
    setWordSuggestions([]);
  }, [updateLearnedWords]);

  const handleClearAll = () => {
    setRomanCurrentWordInput('');
    setNepaliPreview('');
    setNepaliComposedText('');
    setWordSuggestions([]);
    setNextWordPredictions([]);
    setError(null);
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8 bg-slate-800 shadow-2xl rounded-xl">
      <Header />
      
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
        <RomanInputArea
          romanInput={romanCurrentWordInput}
          onRomanInputChange={setRomanCurrentWordInput}
          onWordFinalized={handleWordFinalized} // Called on space/enter
          suggestions={wordSuggestions} // These will be Devanagari words
          onSuggestionClick={handleSuggestionOrPredictionClick} // Expects Devanagari
          // isLoading={isLoading} // General loading for suggestions if implemented
        />
        <DevanagariDisplay
          currentPreview={nepaliPreview}
          composedText={nepaliComposedText}
          predictions={nextWordPredictions} // These are Devanagari words
          onPredictionClick={handleSuggestionOrPredictionClick} // Expects Devanagari
          // isLoading={isLoading} // General loading for predictions if implemented
          userLearnedWords={userLearnedWords}
        />
      </div>
      
      <div className="mt-6 flex justify-center">
        <button
          onClick={handleClearAll}
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Clear all text"
        >
          Clear All
        </button>
      </div>
      {/* {(isLoading) && <LoadingSpinner />} */}
      <Footer />
    </div>
  );
};

export default App;