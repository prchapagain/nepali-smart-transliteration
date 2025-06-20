import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
        Nepali Smart Transliteration
      </h1>
      <p className="text-slate-300 mt-2 text-lg">
        Type Roman Nepali and see the Devanagari magic, instantly!
      </p>
    </header>
  );
};