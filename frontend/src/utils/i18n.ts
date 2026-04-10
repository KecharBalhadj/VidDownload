import en from '../locales/en.json';
import ar from '../locales/ar.json';
import es from '../locales/es.json';
import fr from '../locales/fr.json';
import hi from '../locales/hi.json';
import zh from '../locales/zh.json';
import ru from '../locales/ru.json';

export type Lang = 'en' | 'ar' | 'es' | 'fr' | 'hi' | 'zh' | 'ru';

export const RTL_LANGS: Lang[] = ['ar'];

export const LANG_LABELS: Record<Lang, string> = {
  en: 'English',
  ar: 'العربية',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  zh: '中文',
  ru: 'Русский',
};

const translationsMap: Record<Lang, typeof en> = {
  en,
  ar,
  es,
  fr,
  hi,
  zh,
  ru,
};

export function getTranslations(lang: Lang) {
  return translationsMap[lang] ?? translationsMap['en'];
}

export function isRTL(lang: Lang): boolean {
  return RTL_LANGS.includes(lang);
}

export function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'en';
  const browserLang = navigator.language?.slice(0, 2) as Lang;
  if (browserLang in translationsMap) return browserLang;
  return 'en';
}

export function getLangFromStorage(): Lang {
  if (typeof localStorage === 'undefined') return 'en';
  const stored = localStorage.getItem('vidget_lang') as Lang | null;
  if (stored && stored in translationsMap) return stored;
  return detectLang();
}

export function setLangInStorage(lang: Lang): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('vidget_lang', lang);
}
