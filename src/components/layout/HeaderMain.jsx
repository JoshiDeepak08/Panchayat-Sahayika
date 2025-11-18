// import { useLocation, useNavigate } from "react-router-dom";
// import { useAuth } from "../../auth/useAuth.jsx";

// export default function HeaderMain() {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const isHome = pathname === "/";
//   const { user, logout } = useAuth();

//   return (
//     <header className="w-full bg-primary text-white shadow-soft">
//       <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center gap-4">
//         {!isHome && (
//           <button
//             onClick={() => navigate("/")}
//             className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 hover:bg-white/10"
//           >
//             ←
//           </button>
//         )}

//         {/* स logo */}
//         <div
//           onClick={() => navigate("/")}
//           className="w-10 h-10 rounded-full bg-white/14 flex items-center justify-center
//                      text-xl font-semibold cursor-pointer"
//         >
//           स
//         </div>

//         {/* Govt strip text */}
//         <div
//           onClick={() => navigate("/")}
//           className="leading-tight cursor-pointer"
//         >
//           <div className="text-[12px] font-medium">
//             भारत सरकार प्रेरित ग्राम पंचायत डिजिटल सहायिका (डेमो)
//           </div>
//           <div className="text-[10px] text-white/80">
//             Trusted info from official government portals
//           </div>
//         </div>

//         <div className="flex-1" />

//         {/* Language toggle (static demo) */}
//         <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
//           <button className="px-3 py-1 text-[11px] rounded-full bg-white text-primary font-semibold">
//             हिन्दी
//           </button>
//           <button className="px-3 py-1 text-[11px] rounded-full border border-white/40 text-white rounded-full">
//             English
//           </button>
//         </div>

//         {/* Auth area */}
//         <div className="flex items-center gap-2 text-[11px]">
//           {user ? (
//             <>
//               <span className="hidden sm:inline text-white/90">
//                 👤 {user.full_name || user.username}
//               </span>
//               <button
//                 onClick={() => navigate("/dashboard")}
//                 className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/30"
//               >
//                 Dashboard
//               </button>
//               <button
//                 onClick={logout}
//                 className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/30"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <button
//                 onClick={() => navigate("/login")}
//                 className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/30"
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => navigate("/register")}
//                 className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/30"
//               >
//                 Register
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }


import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";

export default function HeaderMain() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const { user, logout } = useAuth();
  const { isHindi, isEnglish, setLang } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-primary text-white shadow-soft">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center gap-4">
        {/* Back button (hidden on home) */}
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
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
            {isHindi
              ? "भारत सरकार प्रेरित ग्राम पंचायत डिजिटल सहायिका (डेमो)"
              : "Panchayat Sahayika (Demo)"}
          </div>
          <div className="text-[10px] text-white/80">
            {isHindi
              ? "सरकारी पोर्टल्स से प्राप्त विश्वसनीय जानकारी"
              : "Trusted info from official government portals"}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Language toggle (functional) */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={
              "px-3 py-1 text-[11px] rounded-full " +
              (isHindi
                ? "bg-white text-primary font-semibold"
                : "border border-white/40 text-white")
            }
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className={
              "px-3 py-1 text-[11px] rounded-full " +
              (isEnglish
                ? "bg-white text-primary font-semibold"
                : "border border-white/40 text-white")
            }
          >
            English
          </button>
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-2 text-[11px]">
          {user ? (
            <>
              <span className="hidden sm:inline text-white/90">
                👤 {user.full_name || user.username}
              </span>
              <button
                onClick={() => navigate("/dashboard")}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/30"
              >
                {isHindi ? "डैशबोर्ड" : "Dashboard"}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/30"
              >
                {isHindi ? "लॉगआउट" : "Logout"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/30"
              >
                {isHindi ? "लॉगिन" : "Login"}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/30"
              >
                {isHindi ? "रजिस्टर" : "Register"}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
