// src/screens/EditProfileScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load user data
  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name || "",
      district: user.district || "",
      block: user.block || "",
      village_code: user.village_code || "",
      age: user.age ?? "",
      gender: user.gender || "",
      interest_tag: user.interest_tag || "",
      disability: user.disability || "",
      occupation: user.occupation || "",
      income_bracket: user.income_bracket || "",
      social_category: user.social_category || "",
    });
  }, [user]);

  if (!user) {
    return (
      <section className="mt-8 text-sm text-center">
        Please login to edit your profile.
      </section>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      setSaving(true);

      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
      };

      await updateProfile(payload);
      setSuccessMsg("Profile updated successfully.");

      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      console.error(err);
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex justify-center mt-8 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-soft border border-cardBorder px-6 py-6 space-y-4 text-left">
        <h1 className="text-xl font-semibold text-textMain">
          Edit your profile
        </h1>
        <p className="text-[12px] text-gray-600">
          Update your details so recommendations stay relevant.
        </p>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"
        >
          {/* Left column */}
          <div className="space-y-3">
            {/* Full name */}
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

            {/* Age */}
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

            {/* Gender */}
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

          {/* Right column */}
          <div className="space-y-3">
            {/* District */}
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

            {/* Block */}
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

            {/* Village Code */}
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
          </div>

          {/* New fields */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {/* Disability */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-gray-700">
                Disability
              </label>
              <select
                name="disability"
                value={form.disability}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">None</option>
                <option value="locomotor">Locomotor disability</option>
                <option value="visual">Visual impairment</option>
                <option value="hearing">Hearing impairment</option>
                <option value="intellectual">Intellectual disability</option>
                <option value="multiple">Multiple disabilities</option>
              </select>
            </div>

            {/* Occupation */}
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
                <option value="asha">ASHA worker</option>
                <option value="shg_member">SHG member</option>
                <option value="labour">Daily wage labour</option>
                <option value="homemaker">Homemaker</option>
              </select>
            </div>

            {/* Income */}
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

            {/* Social Category */}
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

          {/* Interest Tag */}
          <div className="sm:col-span-2 space-y-1">
            <label className="block text-[11px] font-medium text-gray-700">
              Interest tag
            </label>
            <input
              name="interest_tag"
              value={form.interest_tag}
              onChange={handleChange}
              placeholder="farmer, student, SHG member..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer */}
          <div className="sm:col-span-2 space-y-2 mt-2">
            {error && <p className="text-[11px] text-red-500">{error}</p>}
            {successMsg && (
              <p className="text-[11px] text-emerald-600">{successMsg}</p>
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#166534] text-white text-sm font-semibold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
