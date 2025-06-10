import React, { ReactNode } from 'react';
import { LanguageContext, useLanguageState } from '../hooks/useLanguage';
import { getTranslation } from '../i18n/translations';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { language, setLanguage } = useLanguageState();

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};