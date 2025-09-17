import { useTranslation } from 'react-i18next';
// config
import { allLangs, defaultLang } from '.././config';

// ----------------------------------------------------------------------

export default function useLocales() {
  const { i18n: i18nInstance, t: translate } = useTranslation();

  // Use i18n's current language instead of localStorage directly
  const currentLanguageCode = i18nInstance.language || (typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') : '') || 'it';

  const currentLang = allLangs.find((_lang) => _lang.value === currentLanguageCode) || defaultLang;

  const handleChangeLanguage = (newlang: string) => {
    i18nInstance.changeLanguage(newlang);
  };

  return {
    onChangeLang: handleChangeLanguage,
    translate: (text: any, options?: any) => {
      const result = translate(text, options);
      return typeof result === 'string' ? result : String(result);
    },
    currentLang,
    allLangs,
  };
}
