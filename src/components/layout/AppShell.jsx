import HeaderMain from "./HeaderMain.jsx";

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-softBeige text-gray-900 flex flex-col">
      <HeaderMain />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
