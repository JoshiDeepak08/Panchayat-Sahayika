// src/context/LanguageContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

// lang: "hi" | "en"
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "hi";
    return localStorage.getItem("ps_lang") || "hi";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ps_lang", lang);
    }
  }, [lang]);

  const value = {
    lang,
    setLang,
    isHindi: lang === "hi",
    isEnglish: lang === "en",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
