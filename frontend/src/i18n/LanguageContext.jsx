import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // 1. Choix sauvegardé
    const saved = localStorage.getItem('makeinvoice_lang');
    if (saved === 'fr' || saved === 'en') return saved;

    // 2. Détection du navigateur
    const browser = (navigator.language || 'fr').toLowerCase();
    if (browser.startsWith('en')) return 'en';

    // 3. Par défaut : français
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('makeinvoice_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) return path; // fallback : affiche la clé
    }
    return value;
  };

  const toggleLang = () => setLang((prev) => (prev === 'fr' ? 'en' : 'fr'));

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}