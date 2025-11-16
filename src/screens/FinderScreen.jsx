

import React, { useMemo, useState } from "react";
import ServiceCard from "../components/ui/ServiceCard.jsx";
import SCHEMES from "../data/samaj_kalyan_vibhag_clean_typed.json";

// --- Intelligent type detection: returns "scheme" | "programme"
function normalizeType(item) {
  const raw = (item?.type || "").toString().toLowerCase();
  if (raw === "scheme" || raw === "schemes") return "scheme";
  if (raw === "programme" || raw.startsWith("program")) return "programme";

  // Searchable blob (hi + en)
  const blob = [
    item?.name_en,
    item?.description_en,
    item?.name_hi,
    item?.description_hi,
    item?.category,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // Programme hints
  const programmeHints = [
    "programme", "program ", " training", "campaign", "awareness",
    "workshop", "skill", "कार्यक्रम", "प्रशिक्षण", "अभियान",
    "जागरूकता", "कौशल", "प्रोत्साहन कार्यक्रम",
  ];

  // Scheme hints
  const schemeHints = [
    "scheme", "yojana", "mission", "plan", "assistance", "subsidy",
    "pension", "insurance", "housing", "employment", "loan",
    "योजना", "आवास", "पेंशन", "वृद्धावस्था", "कल्याण", "लाभ", "अनुदान",
  ];

  if (programmeHints.some((k) => blob.includes(k))) return "programme";
  if (schemeHints.some((k) => blob.includes(k))) return "scheme";

  return "scheme"; // default safer side
}

// small helper to show counts for quick diagnosis
function countByType(items) {
  let scheme = 0, programme = 0;
  for (const it of items) {
    const t = normalizeType(it);
    if (t === "programme") programme++;
    else scheme++;
  }
  return { scheme, programme };
}

export default function FinderScreen() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");      // placeholder
  const [department, setDepartment] = useState("");  // placeholder
  const [serviceType, setServiceType] = useState(""); // "scheme" | "programme" | ""

  // Build dropdowns from JSON
  const { categories, departments } = useMemo(() => {
    const cats = new Set();
    const deps = new Set();
    SCHEMES.forEach((s) => {
      if (s?.category) cats.add(String(s.category).trim());
      if (s?.department) deps.add(String(s.department).trim());
    });
    return {
      categories: Array.from(cats).sort(),
      departments: Array.from(deps).sort(),
    };
  }, []);

  const typeCounts = useMemo(() => countByType(SCHEMES), []);

  // Search + filter (client-side)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return SCHEMES.filter((s) => {
      const matchQuery = !q
        ? true
        : [s.name_hi, s.name_en, s.description_hi, s.description_en]
            .filter(Boolean)
            .some((t) => String(t).toLowerCase().includes(q));

      const cat = s.category ? String(s.category).trim() : "";
      const dept = s.department ? String(s.department).trim() : "";
      const matchCat = !category || cat === category;
      const matchDept = !department || dept === department;

      const normType = normalizeType(s);
      const matchType = !serviceType || normType === serviceType;

      return matchQuery && matchCat && matchDept && matchType;
    });
  }, [query, category, department, serviceType]);

  const hasActive = !!query || !!category || !!department || !!serviceType;

  const clearAll = () => {
    setQuery("");
    setCategory("");
    setDepartment("");
    setServiceType("");
  };

  return (
    <section className="space-y-4">
      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search schemes… (नाम/Name, विवरण/Description)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-gray-300 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-emerald-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        <SelectPill
          label="Type"
          value={serviceType}
          onChange={setServiceType}
          options={[
            { label: "Schemes", value: "scheme" },
            { label: "Programmes", value: "programme" },
          ]}
        />

        <SelectPill
          label="Category"
          value={category}
          onChange={setCategory}
          options={categories}
        />
        <SelectPill
          label="Department"
          value={department}
          onChange={setDepartment}
          options={departments}
        />

        {hasActive && (
          <button
            onClick={clearAll}
            className="ml-auto text-xs px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Debug summary (can remove later) */}
      <div className="text-xs text-gray-600">
        Total: {SCHEMES.length} • Schemes: {typeCounts.scheme} • Programmes: {typeCounts.programme}
      </div>

      {/* Active chips */}
      {hasActive && (
        <div className="flex flex-wrap gap-2 text-xs">
          {query && <Chip>Search: “{query}”</Chip>}
          {serviceType && (
            <Chip>Type: {serviceType === "scheme" ? "Schemes" : "Programmes"}</Chip>
          )}
          {category && <Chip>Category: {category}</Chip>}
          {department && <Chip>Department: {department}</Chip>}
        </div>
      )}

      {/* Results / Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-gray-700">
          {serviceType === "programme"
            ? "No Programme-type entries detected in this dataset. Try removing Type filter or adjust keywords."
            : "No matching items found. Try different filters or search text."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((s, i) => (
            <ServiceCard
              key={i}
              icon="📄"
              title={
                s.name_hi
                  ? s.name_en
                    ? `${s.name_hi} / ${s.name_en}`
                    : s.name_hi
                  : s.name_en || "Unnamed Scheme"
              }
              description={s.description_hi || s.description_en || "—"}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Select pill
 * Accepts options as strings or {label, value}.
 * Shows placeholder (label) until a value is chosen.
 */
function SelectPill({ label, value, onChange, options = [] }) {
  const opts = options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );
  const current = opts.find((o) => o.value === value);
  const display = current ? current.label : label;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm pr-7">
        <span className={value ? "text-gray-900" : "text-gray-600"}>{display}</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">▼</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label={label}
      >
        <option value="">{`Select ${label}`}</option>
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
      {children}
    </span>
  );
}
