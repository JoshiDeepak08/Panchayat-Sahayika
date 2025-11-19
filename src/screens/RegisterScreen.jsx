// src/screens/RegisterScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function RegisterScreen() {
  const { register } = useAuth();
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    full_name: "",
    district: "",
    block: "",
    village_code: "",
    age: "",
    gender: "",
    interest_tag: "",
    disability: "",
    occupation: "",
    income_bracket: "",
    social_category: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!form.username || !form.password) {
      setError(
        isHi
          ? "उपयोगकर्ता नाम और पासवर्ड आवश्यक हैं।"
          : "Username and password are required."
      );
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
      };
      await register(payload);
      setSuccessMsg(
        isHi
          ? "पंजीकरण सफल रहा। अब आप लॉगिन कर सकते हैं।"
          : "Registration successful. You can now login."
      );
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error(err);
      setError(
        isHi ? "पंजीकरण असफल रहा, कृपया फिर से प्रयास करें।" : err.message || "Registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center mt-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-soft border border-cardBorder px-6 py-6 space-y-4 text-left">
        <h1 className="text-xl font-semibold text-textMain">
          {isHi ? "अपना खाता बनाएँ" : "Create your account"}
        </h1>
        <p className="text-[12px] text-gray-600">
          {isHi
            ? "कुछ मूल जानकारी भरें ताकि हम आपके लिए सही योजनाएँ और प्रशिक्षण सुझा सकें।"
            : "Fill basic details so we can recommend right schemes & trainings for you."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
        >
          {/* Left column */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "उपयोगकर्ता नाम *" : "Username *"}
              </label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "पासवर्ड *" : "Password *"}
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "पूरा नाम" : "Full Name"}
              </label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "आयु" : "Age"}
              </label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "ज़िला (District)" : "District"}
              </label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "ब्लॉक (Block)" : "Block"}
              </label>
              <input
                name="block"
                value={form.block}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "गाँव कोड (Village Code)" : "Village Code"}
              </label>
              <input
                name="village_code"
                value={form.village_code}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "लिंग (Gender)" : "Gender"}
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">{isHi ? "चुनें" : "Select"}</option>
                <option value="Female">
                  {isHi ? "महिला (Female)" : "Female"}
                </option>
                <option value="Male">
                  {isHi ? "पुरुष (Male)" : "Male"}
                </option>
                <option value="Other">
                  {isHi ? "अन्य (Other)" : "Other"}
                </option>
              </select>
            </div>
          </div>

          {/* Extra fields */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "विकलांगता (यदि हो)" : "Disability (if any)"}
              </label>
              <select
                name="disability"
                value={form.disability}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">
                  {isHi
                    ? "नहीं / बताना नहीं चाहते"
                    : "None / Prefer not to say"}
                </option>
                <option value="locomotor">
                  {isHi ? "चलने-फिरने में समस्या (Locomotor)" : "Locomotor disability"}
                </option>
                <option value="visual">
                  {isHi ? "दृष्टि बाधित (Visual)" : "Visual impairment"}
                </option>
                <option value="hearing">
                  {isHi ? "श्रवण बाधित (Hearing)" : "Hearing impairment"}
                </option>
                <option value="intellectual">
                  {isHi ? "बौद्धिक विकलांगता" : "Intellectual / learning"}
                </option>
                <option value="multiple">
                  {isHi ? "एक से अधिक (Multiple)" : "Multiple disabilities"}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "पेशा (Occupation)" : "Occupation"}
              </label>
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">{isHi ? "चुनें" : "Select"}</option>
                <option value="farmer">
                  {isHi ? "किसान (Farmer)" : "Farmer"}
                </option>
                <option value="student">
                  {isHi ? "छात्र / छात्रा (Student)" : "Student"}
                </option>
                <option value="anganwadi">
                  {isHi ? "आंगनवाड़ी कार्यकर्ता" : "Anganwadi worker"}
                </option>
                <option value="asha">
                  {isHi ? "आशा / स्वास्थ्य कार्यकर्ता" : "ASHA / health worker"}
                </option>
                <option value="shg_member">
                  {isHi ? "एसएचजी सदस्य" : "SHG member"}
                </option>
                <option value="labour">
                  {isHi ? "दैनिक मज़दूर (Daily wage labour)" : "Daily wage labour"}
                </option>
                <option value="homemaker">
                  {isHi ? "गृहणी (Homemaker)" : "Homemaker"}
                </option>
                <option value="other">
                  {isHi ? "अन्य (Other)" : "Other"}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "आय वर्ग (Income Bracket)" : "Income Bracket"}
              </label>
              <select
                name="income_bracket"
                value={form.income_bracket}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">{isHi ? "चुनें" : "Select"}</option>
                <option value="BPL">
                  {isHi ? "बीपीएल / अंत्योदय" : "BPL / Antyodaya"}
                </option>
                <option value="APL">
                  {isHi ? "एपीएल (APL)" : "APL"}
                </option>
                <option value="lower_middle">
                  {isHi ? "निम्न मध्यम वर्ग" : "Lower middle"}
                </option>
                <option value="middle">
                  {isHi ? "मध्यम वर्ग" : "Middle"}
                </option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                {isHi ? "सामाजिक वर्ग (Social Category)" : "Social Category"}
              </label>
              <select
                name="social_category"
                value={form.social_category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">{isHi ? "चुनें" : "Select"}</option>
                <option value="SC">
                  {isHi ? "अनुसूचित जाति (SC)" : "SC"}
                </option>
                <option value="ST">
                  {isHi ? "अनुसूचित जनजाति (ST)" : "ST"}
                </option>
                <option value="OBC">
                  {isHi ? "ओबीसी (OBC)" : "OBC"}
                </option>
                <option value="General">
                  {isHi ? "सामान्य (General)" : "General"}
                </option>
              </select>
            </div>
          </div>

          {/* Interest Tag */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              {isHi ? "रुचि टैग (Interest Tag)" : "Interest Tag"}
            </label>
            <input
              name="interest_tag"
              value={form.interest_tag}
              onChange={handleChange}
              placeholder={
                isHi
                  ? "किसान, छात्र, एसएचजी सदस्य..."
                  : "farmer, student, SHG member..."
              }
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* footer: messages + submit + link to login */}
          <div className="sm:col-span-2 space-y-2 mt-2">
            {error && (
              <p className="text-[11px] text-red-500">
                {error}
              </p>
            )}
            {successMsg && (
              <p className="text-[11px] text-emerald-600">
                {successMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#166534] text-white text-sm font-semibold disabled:opacity-60"
            >
              {submitting
                ? isHi
                  ? "खाता बनाया जा रहा है..."
                  : "Creating account..."
                : isHi
                ? "रजिस्टर करें"
                : "Register"}
            </button>

            <p className="text-[11px] text-gray-600 mt-1">
              {isHi ? "पहले से खाता है?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#166534] underline"
              >
                {isHi ? "लॉगिन करें" : "Login"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
