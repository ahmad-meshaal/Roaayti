import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Lang = "ar" | "en";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (ar: string, en: string) => string;
  isAr: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ar",
  setLang: () => {},
  t: (ar) => ar,
  isAr: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try { return (localStorage.getItem("riwayati_lang") as Lang) || "ar"; } catch { return "ar"; }
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("riwayati_lang", l); } catch {}
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = l;
  };

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isAr: lang === "ar" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
