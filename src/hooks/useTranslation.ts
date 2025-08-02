import { useLanguageStore } from '@/store/language'

export function useTranslation() {
  const { currentLanguage, setLanguage, t } = useLanguageStore()
  
  return {
    language: currentLanguage,
    setLanguage,
    t,
    isEnglish: currentLanguage === 'en',
    isChinese: currentLanguage === 'zh'
  }
}
