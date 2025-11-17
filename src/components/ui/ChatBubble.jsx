import { Link, useLocation } from "react-router-dom";

export default function ChatBubble() {
  const location = useLocation();
  const path = location.pathname;

  // ❌ Hide on home "/" and main chat "/chat"
  if (path === "/" || path.startsWith("/chat")) {
    return null;
  }

  return (
    <Link
      to="/chat"
      className="
        fixed bottom-4 right-4 z-50
        flex items-center gap-2
        rounded-full shadow-lg
        bg-[#166534] text-white
        px-4 py-2 text-xs
        hover:bg-[#14532d] transition
      "
    >
      <div
        className="
          w-8 h-8 rounded-full bg-white/10
          flex items-center justify-center text-lg
        "
      >
        💬
      </div>
      <span className="hidden sm:inline">Ask Panchayat Sahayika</span>
    </Link>
  );
}
