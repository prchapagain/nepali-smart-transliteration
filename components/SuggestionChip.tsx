
import React from 'react';

interface SuggestionChipProps {
  text: string;
  onClick: () => void;
  isPrediction?: boolean;
}

export const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick, isPrediction = false }) => {
  const baseClasses = "px-4 py-2 rounded-full font-medium text-sm shadow-md cursor-pointer transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75";
  const suggestionClasses = "bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400";
  const predictionClasses = "bg-cyan-500 hover:bg-cyan-600 text-white focus:ring-cyan-400";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isPrediction ? predictionClasses : suggestionClasses}`}
    >
      {text}
    </button>
  );
};
