// src/screens/MyPanchayatScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function MyPanchayatScreen() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  return (
    <section className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
        <h2 className="text-sm font-semibold text-[#166534]">
          {isHi ? "मेरी पंचायत – टूल्स" : "My Panchayat – Tools"}
        </h2>

        {/* 🔥 Smart Gram Planning AI — bilingual */}
        <p className="text-[11px] text-gray-500">
          {isHi
            ? "यहाँ से आप प्रशिक्षण की जानकारी देख सकते हैं या स्मार्ट ग्राम प्लानिंग AI टूल खोल सकते हैं।"
            : "From here you can view training details or open the Smart Gram Planning AI tool."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">

        {/* Card 1: Trainings Finder */}
        <button
          onClick={() => navigate("/my-panchayat/trainings")}
          className="bg-white rounded-2xl shadow-md p-4 text-left hover:bg-green-50 transition"
        >
          <div className="text-2xl mb-2">🎓</div>
          <h3 className="text-sm font-semibold text-gray-800">
            {isHi ? "पंचायत प्रशिक्षण खोजक" : "Panchayat Trainings Finder"}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            {isHi
              ? "ज़िला और ब्लॉक के अनुसार सभी पंचायत प्रशिक्षण देखें।"
              : "View all Panchayat trainings by District & Block."}
          </p>
        </button>

        {/* Card 2: Smart Gram Planning Tool */}
        <button
          onClick={() => navigate("/my-panchayat/planning")}
          className="bg-white rounded-2xl shadow-md p-4 text-left hover:bg-blue-50 transition"
        >
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="text-sm font-semibold text-gray-800">
            {isHi ? "स्मार्ट ग्राम प्लानिंग टूल" : "Smart Gram Planning Tool"}
          </h3>

          {/* 🔥 Smart Gram Planning AI line translated */}
          <p className="text-[11px] text-gray-500 mt-1">
            {isHi
              ? "गाँव के इंफ्रा डेफिसिट इंडेक्स के आधार पर स्मार्ट ग्राम प्लानिंग AI प्राथमिकताएँ देखें।"
              : "See Smart Gram Planning AI priorities based on the village infra deficit index."}
          </p>
        </button>

      </div>
    </section>
  );
}
