import { useLang } from '../i18n/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, toggleLang } = useLang();

  return (
    <button
      type="button"
      className="lang-switcher"
      onClick={toggleLang}
      title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      aria-label="Change language"
    >
      <span className={lang === 'fr' ? 'lang-active' : ''}>FR</span>
      <span className="lang-sep">·</span>
      <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
    </button>
  );
}