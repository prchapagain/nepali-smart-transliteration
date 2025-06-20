import React from 'react';
import { SuggestionChip } from './SuggestionChip';
import { MAX_PREDICTIONS_DISPLAY, MAX_USER_WORDS_DISPLAY } from '../constants';

interface DevanagariDisplayProps {
  composedText: string; // Already finalized Devanagari text
  currentPreview: string; // Real-time preview of the current Roman input's transliteration
  predictions: string[]; // Nepali words
  onPredictionClick: (nepaliPrediction: string) => void;
  // isLoading?: boolean; // Prop removed
  userLearnedWords: string[];
}

export const DevanagariDisplay: React.FC<DevanagariDisplayProps> = ({
  composedText,
  currentPreview,
  predictions,
  onPredictionClick,
  // isLoading,
  userLearnedWords
}) => {
  return (
    <div className="p-6 bg-slate-700 rounded-lg shadow-lg h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-3 text-cyan-300">Devanagari Output</h3>
      <div 
        className="w-full min-h-[100px] p-3 bg-slate-600 border border-slate-500 rounded-md text-slate-50 text-xl whitespace-pre-wrap break-words flex-grow"
        aria-live="polite"
        lang="ne" // Indicate Nepali language content
      >
        {composedText}
        <span className="text-emerald-300 opacity-80">{currentPreview}</span>
        {(!composedText && !currentPreview) && <span className="text-slate-400">नमस्ते...</span>}
      </div>
      
      <div className="mt-4 h-20"> {/* Fixed height for predictions area */}
        {/* {isLoading && !predictions.length && <p className="text-slate-400 text-sm">Loading predictions...</p>} */}
        {composedText && predictions.length === 0 && (
             <p className="text-slate-400 text-sm italic">No predictions for the current context.</p>
        )}
        {predictions.length > 0 && (
          <>
            <h4 className="text-md font-medium text-slate-300 mb-2">Next word:</h4>
            <div className="flex flex-wrap gap-2">
              {predictions.slice(0, MAX_PREDICTIONS_DISPLAY).map((p, i) => (
                <SuggestionChip key={i} text={p} onClick={() => onPredictionClick(p)} isPrediction={true} />
              ))}
            </div>
          </>
        )}
      </div>

      {userLearnedWords.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-600">
          <h4 className="text-md font-medium text-slate-300 mb-2">Your frequent words:</h4>
          <div className="flex flex-wrap gap-2">
            {userLearnedWords.slice(0, MAX_USER_WORDS_DISPLAY).map((word, i) => (
               <span key={i} className="px-3 py-1 bg-slate-500 text-slate-100 rounded-full text-sm shadow cursor-default" title="A frequently used word">
                {word}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};