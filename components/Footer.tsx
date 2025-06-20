import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 text-center text-sm text-slate-400">
      <p>&copy; {new Date().getFullYear()} Smart Transliteration App.</p>
      <p>Instant Nepali typing, right in your browser.</p>
    </footer>
  );
};