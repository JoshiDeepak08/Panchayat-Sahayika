import { useState } from "react";

export default function LanguageToggle() {
  const [lang, setLang] = useState("hi");

  return (
    <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
      <button
        onClick={() => setLang("hi")}
        className={`px-3 py-1 text-[11px] rounded-full ${
          lang === "hi"
            ? "bg-white text-[#166534] font-semibold"
            : "text-white border border-white/40 bg-transparent"
        }`}
      >
        हिन्दी
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1 text-[11px] rounded-full ${
          lang === "en"
            ? "bg-white text-[#166534] font-semibold"
            : "text-white border border-white/40 bg-transparent"
        }`}
      >
        English
      </button>
    </div>
  );
}
