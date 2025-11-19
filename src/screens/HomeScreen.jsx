import { useNavigate } from "react-router-dom";
import QuickLinkCard from "../components/ui/QuickLinkCard.jsx";

export default function HomeScreen() {
  const navigate = useNavigate();

  return (
    <section className="w-full flex justify-center mt-8 px-4">
      <div
        className="
          w-full max-w-6xl
          bg-softBeige
          border border-cardBorder
          rounded-3xl
          shadow-soft
          px-10 py-10
          flex flex-col gap-8
        "
      >
        {/* Brand block */}
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <span className="text-4xl font-semibold text-white">स</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-textMain leading-tight">
              Panchayat Sahayika
            </h1>
            <p className="text-[12px] text-gray-700">
              Simple help for schemes &amp; services |
              <span className="ml-1 text-primary">
                योजनाओं की सरल जानकारी
              </span>
            </p>
          </div>
        </div>

        {/* Greeting */}
        <div className="space-y-1">
          <div className="text-4xl font-semibold text-textMain">
            नमस्ते! मैं आपकी पंचायत सहायिका हूं।
          </div>
          <div className="text-xl font-semibold text-primary">
            Namaste! I am your Panchayat Sahayika.
          </div>
          <p className="text-sm text-gray-800 max-w-4xl">
            अपने गाँव, योजनाओं, सेवाओं और सुविधाओं से जुड़ी जानकारी समझने के लिए
            सरल और भरोसेमंद डिजिटल साथी — बिना जटिल भाषा, सीधे आधिकारिक सरकारी
            स्रोतों से।
          </p>
        </div>

        {/* 3 primary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickLinkCard
            icon="?"
            titleHi="सवाल पूछें (Chat)"
            titleEn="Ask a Question"
            body="अपनी समस्या लिखें, हम आपको सही योजना या सेवा तक पहुँचाएँगे।"
            onClick={() => navigate("/chat")}
          />
          <QuickLinkCard
            icon="🔍"
            titleHi="योजनाएँ / सेवाएँ / प्रोग्राम"
            titleEn="Find Schemes & Services"
            body="श्रेणी, स्थान और पात्रता के आधार पर उपलब्ध सरकारी योजनाएँ देखें।"
            onClick={() => navigate("/finder")}
          />
          <QuickLinkCard
            icon="🏠"
            titleHi="मेरी पंचायत (Quick Access)"
            titleEn="My Panchayat"
            body="अपने ग्राम पंचायत की प्रोफ़ाइल, संपर्क और लिंक एक ही जगह पर देखें।"
            onClick={() => navigate("/my-panchayat")}
          />
        </div>

        <p className="text-[10px] text-gray-600">
          यह सहायिका आधिकारिक सरकारी पोर्टलों से उपलब्ध डेटा के आधार पर जानकारी दिखाती है।
        </p>
      </div>
    </section>
  );
}
