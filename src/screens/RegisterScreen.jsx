// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const API_BASE = "http://127.0.0.1:8000";

// export default function RegisterScreen() {
//   const [form, setForm] = useState({
//     username: "",
//     password: "",
//     full_name: "",
//     district: "",
//     block: "",
//     village_code: "",
//   });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   function update(field, value) {
//     setForm((f) => ({ ...f, [field]: value }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     try {
//       const res = await fetch(`${API_BASE}/auth/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       if (!res.ok) throw new Error("Failed");
//       await res.json();
//       navigate("/login");
//     } catch (err) {
//       console.error(err);
//       setError(
//         "Register karne me dikkat aayi (username duplicate ho sakta hai)."
//       );
//     }
//   }

//   return (
//     <section className="flex justify-center mt-8">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white rounded-2xl shadow-md p-6 w-full max-w-sm space-y-3 text-sm"
//       >
//         <h2 className="text-lg font-semibold">Register</h2>
//         {["username", "full_name", "district", "block", "village_code"].map(
//           (f) => (
//             <input
//               key={f}
//               className="w-full border rounded-md px-3 py-2 text-sm"
//               placeholder={f.replace("_", " ")}
//               value={form[f]}
//               onChange={(e) => update(f, e.target.value)}
//             />
//           )
//         )}
//         <input
//           className="w-full border rounded-md px-3 py-2 text-sm"
//           placeholder="Password"
//           type="password"
//           value={form.password}
//           onChange={(e) => update("password", e.target.value)}
//         />
//         {error && <p className="text-xs text-red-600">{error}</p>}
//         <button
//           type="submit"
//           className="w-full bg-[#166534] text-white rounded-md py-2 text-sm"
//         >
//           Create account
//         </button>
//       </form>
//     </section>
//   );
// }


// src/screens/RegisterScreen.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";

export default function RegisterScreen() {
  const { register } = useAuth();
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
    // 🔴 NEW FIELDS
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
      setError("Username and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
      };
      await register(payload);
      setSuccessMsg("Registration successful. You can now login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center mt-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-soft border border-cardBorder px-6 py-6 space-y-4 text-left">
        <h1 className="text-xl font-semibold text-textMain">
          Create your account
        </h1>
        <p className="text-[12px] text-gray-600">
          Fill basic details so we can recommend right schemes & trainings for
          you.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
        >
          {/* Left column */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                Username *
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
                Password *
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
                Full Name
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
                Age
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
                District
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
                Block
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
                Village Code
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
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 🔴 NEW: disability, occupation, income, social category */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                Disability (if any)
              </label>
              <select
                name="disability"
                value={form.disability}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">None / Prefer not to say</option>
                <option value="locomotor">Locomotor disability</option>
                <option value="visual">Visual impairment</option>
                <option value="hearing">Hearing impairment</option>
                <option value="intellectual">Intellectual / learning</option>
                <option value="multiple">Multiple disabilities</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                Occupation
              </label>
              <select
                name="occupation"
                value={form.occupation}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select</option>
                <option value="farmer">Farmer</option>
                <option value="student">Student</option>
                <option value="anganwadi">Anganwadi worker</option>
                <option value="asha">ASHA / health worker</option>
                <option value="shg_member">SHG member</option>
                <option value="labour">Daily wage labour</option>
                <option value="homemaker">Homemaker</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                Income Bracket
              </label>
              <select
                name="income_bracket"
                value={form.income_bracket}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select</option>
                <option value="BPL">BPL / Antyodaya</option>
                <option value="APL">APL</option>
                <option value="lower_middle">Lower middle</option>
                <option value="middle">Middle</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                Social Category
              </label>
              <select
                name="social_category"
                value={form.social_category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="OBC">OBC</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              Interest Tag
            </label>
            <input
              name="interest_tag"
              value={form.interest_tag}
              onChange={handleChange}
              placeholder="farmer, student, SHG member..."
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
              {submitting ? "Creating account..." : "Register"}
            </button>

            <p className="text-[11px] text-gray-600 mt-1">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#166534] underline"
              >
                Login
              </button>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
