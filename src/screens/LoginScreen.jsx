// src/screens/LoginScreen.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function LoginScreen() {
  const { login, loadingUser } = useAuth();
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError(
        isHi
          ? "कृपया उपयोगकर्ता नाम और पासवर्ड दर्ज करें।"
          : "Please enter username and password."
      );
      return;
    }
    try {
      setSubmitting(true);
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError(
        isHi ? "लॉगिन असफल रहा, कृपया फिर से प्रयास करें।" : err.message || "Login failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center mt-8 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft border border-cardBorder px-6 py-6 space-y-4 text-left">
        <h1 className="text-xl font-semibold text-textMain">
          {isHi
            ? "पंचायत सहायिका में लॉगिन करें"
            : "Login to Panchayat Sahayika"}
        </h1>
        <p className="text-[12px] text-gray-600">
          {isHi
            ? "अपना खाता उपयोग करके आपके लिए व्यक्तिगत योजनाएँ, ट्रेनिंग और गाँव की स्थिति देखें।"
            : "Use your account to see personalised schemes, trainings and village status."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              {isHi ? "उपयोगकर्ता नाम" : "Username"}
            </label>
            <input
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              {isHi ? "पासवर्ड" : "Password"}
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-[11px] text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loadingUser}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#166534] text-white text-sm font-semibold disabled:opacity-60"
          >
            {submitting || loadingUser
              ? isHi
                ? "लॉगिन हो रहा है..."
                : "Logging in..."
              : isHi
              ? "लॉगिन"
              : "Login"}
          </button>
        </form>

        <p className="text-[11px] text-gray-600">
          {isHi ? "पहली बार आ रहे हैं?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-[#166534] underline"
          >
            {isHi ? "खाता बनाएं" : "Create an account"}
          </button>
        </p>
      </div>
    </section>
  );
}
