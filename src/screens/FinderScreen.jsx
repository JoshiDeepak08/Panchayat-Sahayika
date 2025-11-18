// src/screens/FinderScreen.jsx
import React, { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import SCHEMES from "../data/samaj_kalyan_vibhag_clean_typed.json";

// --- Intelligent type detection: returns "scheme" | "programme"
function normalizeType(item) {
  const raw = (item?.type || "").toString().toLowerCase();
  if (raw === "scheme" || raw === "schemes") return "scheme";
  if (raw === "programme" || raw.startsWith("program")) return "programme";

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

  const programmeHints = [
    "programme",
    "program ",
    " training",
    "campaign",
    "awareness",
    "workshop",
    "skill",
    "कार्यक्रम",
    "प्रशिक्षण",
    "अभियान",
    "जागरूकता",
    "कौशल",
    "प्रोत्साहन कार्यक्रम",
  ];

  const schemeHints = [
    "scheme",
    "yojana",
    "mission",
    "plan",
    "assistance",
    "subsidy",
    "pension",
    "insurance",
    "housing",
    "employment",
    "loan",
    "योजना",
    "आवास",
    "पेंशन",
    "वृद्धावस्था",
    "कल्याण",
    "लाभ",
    "अनुदान",
  ];

  if (programmeHints.some((k) => blob.includes(k))) return "programme";
  if (schemeHints.some((k) => blob.includes(k))) return "scheme";
  return "scheme";
}

function countByType(items) {
  let scheme = 0,
    programme = 0;
  for (const it of items) {
    const t = normalizeType(it);
    if (t === "programme") programme++;
    else scheme++;
  }
  return { scheme, programme };
}

export default function FinderScreen() {
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [serviceType, setServiceType] = useState(""); // "scheme" | "programme" | ""
  const [selectedScheme, setSelectedScheme] = useState(null); // for popup

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
    setSelectedScheme(null);
  };

  // ---------- MODAL DETAIL VIEW ----------
  const renderDetails = (scheme) => {
    if (!scheme) return null;

    const titleHi =
      scheme.name_hi || scheme.scheme_name_hi || scheme.title_hi || "";
    const titleEn =
      scheme.name_en || scheme.scheme_name_en || scheme.title_en || "";
    const descHi =
      scheme.long_description_hi ||
      scheme.description_hi ||
      scheme.short_desc_hi ||
      "";
    const descEn =
      scheme.long_description_en ||
      scheme.description_en ||
      scheme.short_desc_en ||
      "";

    const mainTitle = isHi
      ? titleHi || titleEn || "अनाम योजना"
      : titleEn || titleHi || "Unnamed Scheme";
    const subTitle = isHi ? titleEn : titleHi;

    return (
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl p-6 text-sm space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {mainTitle}
            </h2>
            {subTitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subTitle}</p>
            )}
            <p className="mt-2 text-[11px] text-gray-500">
              {[
                normalizeType(scheme) === "programme"
                  ? isHi
                    ? "प्रोग्राम"
                    : "Programme"
                  : isHi
                  ? "योजना / Scheme"
                  : "Scheme / Yojana",
                scheme.category,
                scheme.department,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSelectedScheme(null)}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            aria-label={isHi ? "बंद करें" : "Close"}
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 leading-relaxed">
          {descHi && (
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                विवरण (Hindi)
              </h3>
              <p className="text-[13px] text-gray-800 whitespace-pre-line">
                {descHi}
              </p>
            </div>
          )}

          {descEn && (
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                Description (English)
              </h3>
              <p className="text-[13px] text-gray-800 whitespace-pre-line">
                {descEn}
              </p>
            </div>
          )}

          {scheme.eligibility_hi && (
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                {isHi ? "पात्रता" : "Eligibility"}
              </h3>
              <p className="text-[13px] text-gray-800 whitespace-pre-line">
                {scheme.eligibility_hi}
              </p>
            </div>
          )}

          {scheme.benefit_hi && (
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-1">
                {isHi ? "लाभ / Benefit" : "Benefit"}
              </h3>
              <p className="text-[13px] text-gray-800 whitespace-pre-line">
                {scheme.benefit_hi}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-gray-100 pt-3">
          <h3 className="text-[11px] font-semibold text-gray-500 mb-2">
            {isHi
              ? "विस्तृत फ़ील्ड (JSON से)"
              : "Detailed fields (from JSON)"}
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
            {Object.entries(scheme)
              .filter(([key, value]) => {
                if (value == null || value === "") return false;
                return ![
                  "id",
                  "scheme_id",
                  "slug",
                  "apply_url",
                  "read_more_url",
                  "created_at",
                  "updated_at",
                  "name_hi",
                  "name_en",
                  "scheme_name_hi",
                  "scheme_name_en",
                  "title_hi",
                  "title_en",
                  "description_hi",
                  "description_en",
                  "short_desc_hi",
                  "short_desc_en",
                  "long_description_hi",
                  "long_description_en",
                  "eligibility_hi",
                  "benefit_hi",
                ].includes(key);
              })
              .map(([key, value]) => (
                <div key={key}>
                  <dt className="uppercase tracking-wide text-[10px] text-gray-400">
                    {key.replace(/_/g, " ")}
                  </dt>
                  <dd className="text-[11px] text-gray-800 whitespace-pre-line">
                    {String(value)}
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      </div>
    );
  };

  return (
    // Full-height inside AppShell; this div itself scrolls
    <section className="h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-y-auto px-6 py-4 space-y-4">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder={
                isHi
                  ? "योजनाएँ खोजें… (नाम, विवरण)"
                  : "Search schemes… (Name / Description)"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-full border border-gray-300 bg-white px-3 py-2 pr-9 text-sm outline-none focus:border-emerald-400"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          <SelectPill
            label={isHi ? "प्रकार" : "Type"}
            value={serviceType}
            onChange={setServiceType}
            options={[
              {
                label: isHi ? "योजनाएँ (Schemes)" : "Schemes",
                value: "scheme",
              },
              {
                label: isHi ? "प्रोग्राम (Programmes)" : "Programmes",
                value: "programme",
              },
            ]}
          />

          <SelectPill
            label={isHi ? "श्रेणी" : "Category"}
            value={category}
            onChange={setCategory}
            options={categories}
          />
          <SelectPill
            label={isHi ? "विभाग" : "Department"}
            value={department}
            onChange={setDepartment}
            options={departments}
          />

          {hasActive && (
            <button
              onClick={clearAll}
              className="ml-auto text-xs px-3 py-2 rounded-full border border-gray-300 hover:bg-gray-50"
            >
              {isHi ? "साफ़ करें" : "Clear"}
            </button>
          )}
        </div>

        {/* Small summary line */}
        <div className="text-xs text-gray-600">
          {isHi ? "कुल" : "Total"}: {SCHEMES.length} •{" "}
          {isHi ? "योजनाएँ" : "Schemes"}: {typeCounts.scheme} •{" "}
          {isHi ? "प्रोग्राम" : "Programmes"}: {typeCounts.programme}
        </div>

        {/* Active filter chips */}
        {hasActive && (
          <div className="flex flex-wrap gap-2 text-xs">
            {query && (
              <Chip>
                {isHi ? "खोज:" : "Search:"} “{query}”
              </Chip>
            )}
            {serviceType && (
              <Chip>
                {isHi ? "प्रकार" : "Type"}:{" "}
                {serviceType === "scheme"
                  ? isHi
                    ? "योजनाएँ"
                    : "Schemes"
                  : isHi
                  ? "प्रोग्राम"
                  : "Programmes"}
              </Chip>
            )}
            {category && (
              <Chip>
                {isHi ? "श्रेणी" : "Category"}: {category}
              </Chip>
            )}
            {department && (
              <Chip>
                {isHi ? "विभाग" : "Department"}: {department}
              </Chip>
            )}
          </div>
        )}

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-gray-700">
            {serviceType === "programme"
              ? isHi
                ? "इस dataset में Programme प्रकार की प्रविष्टियाँ नहीं मिलीं। Type फ़िल्टर हटाकर या keywords बदलकर देखें।"
                : "No Programme-type entries detected in this dataset. Try removing the Type filter or adjust keywords."
              : isHi
              ? "कोई मिलती-जुलती योजना नहीं मिली। कृपया फ़िल्टर या खोज पाठ बदलकर देखें।"
              : "No matching items found. Try different filters or search text."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((s, i) => {
              const titleHi =
                s.name_hi || s.scheme_name_hi || s.title_hi || "";
              const titleEn =
                s.name_en || s.scheme_name_en || s.title_en || "";
              const shortDescHi = s.description_hi || "—";
              const shortDescEn = s.description_en || "—";

              const title = isHi
                ? titleHi || titleEn || "अनाम योजना"
                : titleEn || titleHi || "Unnamed Scheme";
              const shortDesc = isHi ? shortDescHi : shortDescEn;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedScheme(s)}
                  className="w-full text-left bg-white rounded-3xl shadow-sm border border-[#F4E3C3] px-4 py-3 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-xl">📄</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900">
                        {title}
                        {titleHi &&
                          titleEn &&
                          ((isHi && titleEn) || (!isHi && titleHi)) && (
                            <span className="text-xs text-gray-500">
                              {" "}
                              / {isHi ? titleEn : titleHi}
                            </span>
                          )}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-600 line-clamp-2">
                        {shortDesc}
                      </p>
                      <div className="mt-1 text-[10px] text-emerald-700 flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-emerald-500/80" />
                        <span>
                          {isHi
                            ? "Verified by Panchayat Portal"
                            : "Verified by Panchayat Portal"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* MODAL BACKDROP + POPUP */}
        {selectedScheme && (
          <div
            className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4"
            onClick={() => setSelectedScheme(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {renderDetails(selectedScheme)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Select pill */
function SelectPill({ label, value, onChange, options = [] }) {
  const opts = options.map((o) =>
    typeof o === "string" ? { label: o, value: o } : o
  );
  const current = opts.find((o) => o.value === value);
  const display = current ? current.label : label;

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white text-sm pr-7">
        <span className={value ? "text-gray-900" : "text-gray-600"}>
          {display}
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">
          ▼
        </span>
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
