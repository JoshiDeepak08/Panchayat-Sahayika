import { useLocation, useNavigate } from "react-router-dom";

export default function HeaderMain() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <header className="w-full bg-primary text-white shadow-soft">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center gap-4">
        {!isHome && (
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 hover:bg-white/10"
          >
            ←
          </button>
        )}

        {/* स logo */}
        <div
          onClick={() => navigate("/")}
          className="w-10 h-10 rounded-full bg-white/14 flex items-center justify-center
                     text-xl font-semibold cursor-pointer"
        >
          स
        </div>

        {/* Govt strip text */}
        <div
          onClick={() => navigate("/")}
          className="leading-tight cursor-pointer"
        >
          <div className="text-[12px] font-medium">
            भारत सरकार प्रेरित ग्राम पंचायत डिजिटल सहायिका (डेमो)
          </div>
          <div className="text-[10px] text-white/80">
            Trusted info from official government portals
          </div>
        </div>

        <div className="flex-1" />

        {/* Language toggle (static demo) */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
          <button className="px-3 py-1 text-[11px] rounded-full bg-white text-primary font-semibold">
            हिन्दी
          </button>
          <button className="px-3 py-1 text-[11px] rounded-full border border-white/40 text-white rounded-full">
            English
          </button>
        </div>
      </div>
    </header>
  );
}
