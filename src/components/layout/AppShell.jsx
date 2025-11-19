// // import HeaderMain from "./HeaderMain.jsx";

// // export default function AppShell({ children }) {
// //   return (
// //     <div className="min-h-screen bg-softBeige text-gray-900 flex flex-col">
// //       <HeaderMain />
// //       <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
// //         {children}
// //       </main>
// //     </div>
// //   );
// // }


// // src/components/layout/AppShell.jsx
// export default function AppShell({ children }) {
//   return (
//     <div className="flex flex-col h-screen bg-softBeige">
//       {/* TOP NAVBAR (your existing code inside) */}
//       <header className="h-16 bg-[#0b5a2b] text-white flex items-center px-6">
//         {/* ...logo + title + language buttons etc... */}
//       </header>

//       {/* MAIN AREA: fills remaining height, no scroll here */}
//       <main className="flex-1 overflow-hidden">{children}</main>
//     </div>
//   );
// }


// src/components/layout/AppShell.jsx
// import HeaderMain from "./HeaderMain.jsx";

// export default function AppShell({ children }) {
//   return (
//     <div className="flex flex-col h-screen bg-softBeige text-gray-900">
//       {/* 🔹 Your existing navbar with all buttons */}
//       <HeaderMain />

//       {/* 🔹 Main area fills remaining height, inner screens handle their own scroll */}
//       <main className="flex-1 overflow-hidden">
//         {/* Optional max-width like before so content stays centered */}
//         <div className="w-full max-w-6xl mx-auto px-6 py-4 h-full">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }


// src/components/layout/AppShell.jsx
import HeaderMain from "./HeaderMain.jsx";
import ChatBubble from "../ui/ChatBubble.jsx";   // ← ADD THIS
import { Outlet } from "react-router-dom";      // ← only needed if you use <Outlet />

export default function AppShell({ children }) {
  return (
    <div className="h-screen flex flex-col bg-softBeige text-gray-900">
      {/* Top navbar (poora HeaderMain jaisa hai waise hi rahega) */}
      <HeaderMain />

      {/* Main area: full width, no mx-auto / no px-6 */}
      <main className="flex-1 overflow-auto">
        {/* If routing uses children, use children. If using <Outlet />, fallback to Outlet */}
        {children || <Outlet />}
      </main>

      {/* Floating chatbot bubble on all pages except home & chat */}
      <ChatBubble />
    </div>
  );
}
