import React from 'react';
import { SuggestionChip } from './SuggestionChip';
import { MAX_SUGGESTIONS_DISPLAY } from '../constants';

interface RomanInputAreaProps {
  romanInput: string;
  onRomanInputChange: (value: string) => void;
  onWordFinalized: () => void; // Finalizes the current transliterated word
  suggestions: string[]; // Nepali words
  onSuggestionClick: (nepaliSuggestion: string) => void;
  // isLoading?: boolean; // Prop removed, local ops should be fast
}

export const RomanInputArea: React.FC<RomanInputAreaProps> = ({
  romanInput,
  onRomanInputChange,
  onWordFinalized,
  suggestions,
  onSuggestionClick,
  // isLoading,
}) => {
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRomanInputChange(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onWordFinalized();
    }
  };

  return (
    <div className="p-6 bg-slate-700 rounded-lg shadow-lg h-full flex flex-col">
      <label htmlFor="roman-input" className="block text-xl font-semibold mb-3 text-emerald-300">
        Type Roman Nepali
      </label>
      <input
        id="roman-input"
        type="text"
        value={romanInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="e.g., namaste"
        className="w-full p-3 bg-slate-600 border border-slate-500 rounded-md text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none transition duration-150 text-lg"
        autoComplete="off"
        lang="ne-ROM" // Indicate Roman Nepali input
        aria-label="Roman Nepali Input"
      />
      <div className="mt-4 flex-grow h-20"> {/* Fixed height for suggestions area */}
        {/* {isLoading && !suggestions.length && <p className="text-slate-400 text-sm">Loading suggestions...</p>} */}
        {romanInput && suggestions.length === 0 && !romanInput.endsWith(' ') && (
            <p className="text-slate-400 text-sm italic">Keep typing or press Space/Enter...</p>
        )}
        {suggestions.length > 0 && (
          <>
            <h4 className="text-md font-medium text-slate-300 mb-2">Suggestions:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, MAX_SUGGESTIONS_DISPLAY).map((s, i) => (
                <SuggestionChip key={i} text={s} onClick={() => onSuggestionClick(s)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};