import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, translations, TranslationKey } from '@/lib/i18n_final';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Validation des langues supportées
const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'he'];
const DEFAULT_LANGUAGE: Language = 'en';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction de traduction robuste avec fallback
  const t = useCallback((key: TranslationKey): string => {
    try {
      // Vérifier si la langue actuelle existe
      if (!translations[language]) {
        console.warn(`Language ${language} not found, falling back to ${DEFAULT_LANGUAGE}`);
        return translations[DEFAULT_LANGUAGE][key] || key;
      }

      // Vérifier si la clé existe dans la langue actuelle
      const translation = (translations[language] as any)[key];
      if (translation) {
        return translation;
      }

      // Fallback vers l'anglais
      const fallback = translations[DEFAULT_LANGUAGE][key];
      if (fallback) {
        console.warn(`Translation key '${key}' not found for language '${language}', using fallback`);
        return fallback;
      }

      // Dernière option : retourner la clé
      console.error(`Translation key '${key}' not found in any language`);
      return key;
    } catch (error) {
      console.error(`Translation error for key '${key}':`, error);
      return key;
    }
  }, [language]);

  // Fonction sécurisée pour changer de langue
  const setLanguage = useCallback((newLanguage: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(newLanguage)) {
      console.error(`Unsupported language: ${newLanguage}, falling back to ${DEFAULT_LANGUAGE}`);
      newLanguage = DEFAULT_LANGUAGE;
    }

    setLanguageState(newLanguage);
    
    // Sauvegarder immédiatement
    try {
      localStorage.setItem('bracha_language', newLanguage);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }, []);

  const isRTL = language === 'he';

  // Effet pour appliquer les changements DOM
  useEffect(() => {
    try {
      // Direction RTL/LTR
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
      
      // Attribut lang pour l'accessibilité
      document.documentElement.setAttribute('lang', language);
      
      // Classes CSS pour le styling conditionnel
      document.documentElement.classList.remove('lang-en', 'lang-fr', 'lang-he');
      document.documentElement.classList.add(`lang-${language}`);
      
      if (isRTL) {
        document.documentElement.classList.add('rtl');
        document.documentElement.classList.remove('ltr');
      } else {
        document.documentElement.classList.add('ltr');
        document.documentElement.classList.remove('rtl');
      }
    } catch (error) {
      console.error('Failed to apply language DOM changes:', error);
    }
  }, [language, isRTL]);

  // Chargement initial de la langue sauvegardée
  useEffect(() => {
    const loadSavedLanguage = () => {
      try {
        const savedLanguage = localStorage.getItem('bracha_language') as Language;
        
        if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
          setLanguageState(savedLanguage);
        } else {
          // Détection automatique basée sur le navigateur
          const browserLang = navigator.language.slice(0, 2) as Language;
          if (SUPPORTED_LANGUAGES.includes(browserLang)) {
            setLanguageState(browserLang);
          }
        }
      } catch (error) {
        console.warn('Failed to load saved language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedLanguage();
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
