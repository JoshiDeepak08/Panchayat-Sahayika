// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../auth/useAuth.jsx";
// import ServiceCard from "../components/ui/ServiceCard.jsx";
// import SCHEMES from "../data/samaj_kalyan_vibhag_clean_typed.json";

// const CHAT_API = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
// const TRAIN_API = "http://127.0.0.1:7000";
// const GRAM_API = "http://127.0.0.1:5000";

// // type detection just to label “Scheme / Programme”
// function normalizeType(item) {
//   const raw = (item?.type || "").toString().toLowerCase();
//   if (raw === "scheme" || raw === "schemes") return "scheme";
//   if (raw === "programme" || raw.startsWith("program")) return "programme";
//   return "scheme";
// }

// // simple text normaliser
// function clean(txt) {
//   return String(txt || "")
//     .toLowerCase()
//     .replace(/[()]/g, "")
//     .replace(/\s+/g, " ")
//     .trim();
// }

// // map dashboard recommendation card → full JSON scheme
// function findSchemeFromCard(card) {
//   const rawLabel =
//     card.title || card.name_hi || card.name_en || card.subtitle || "";
//   if (!rawLabel) return null;

//   // dashboard titles often look like "हिन्दी नाम / English Name"
//   const labelParts = clean(rawLabel)
//     .split("/")
//     .map((p) => p.trim())
//     .filter(Boolean);

//   if (labelParts.length === 0) labelParts.push(clean(rawLabel));

//   for (const s of SCHEMES) {
//     const hi = clean(s.name_hi);
//     const en = clean(s.name_en);

//     for (const part of labelParts) {
//       if (!part) continue;

//       // strong exact/startsWith both ways
//       if (
//         (hi && (part === hi || hi.startsWith(part) || part.startsWith(hi))) ||
//         (en && (part === en || en.startsWith(part) || part.startsWith(en)))
//       ) {
//         return s;
//       }

//       // softer includes both directions
//       if (
//         (hi && (hi.includes(part) || part.includes(hi))) ||
//         (en && (en.includes(part) || part.includes(en)))
//       ) {
//         return s;
//       }
//     }
//   }

//   console.warn("No scheme match for dashboard card:", rawLabel);
//   return null;
// }

// // detail card (very similar to FinderScreen’s modal content)
// function SchemeDetailCard({ scheme, onClose }) {
//   if (!scheme) return null;

//   const titleHi =
//     scheme.name_hi || scheme.scheme_name_hi || scheme.title_hi || "";
//   const titleEn =
//     scheme.name_en || scheme.scheme_name_en || scheme.title_en || "";
//   const descHi =
//     scheme.long_description_hi ||
//     scheme.description_hi ||
//     scheme.short_desc_hi ||
//     "";
//   const descEn =
//     scheme.long_description_en ||
//     scheme.description_en ||
//     scheme.short_desc_en ||
//     "";

//   return (
//     <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 md:p-8 text-sm space-y-4 max-h-[85vh] overflow-y-auto">
//       {/* header */}
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h2 className="text-lg md:text-xl font-semibold text-gray-900">
//             {titleHi || titleEn || "Unnamed Scheme"}
//           </h2>
//           {titleHi && titleEn && (
//             <p className="text-xs text-gray-500 mt-0.5">{titleEn}</p>
//           )}
//           <p className="mt-2 text-[11px] text-gray-500">
//             {[
//               normalizeType(scheme) === "programme"
//                 ? "Programme"
//                 : "Scheme / Yojana",
//               scheme.category,
//               scheme.department,
//             ]
//               .filter(Boolean)
//               .join(" • ")}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onClose}
//           className="text-gray-400 hover:text-gray-600 text-lg leading-none"
//           aria-label="Close"
//         >
//           ✕
//         </button>
//       </div>

//       {/* main descriptions */}
//       <div className="space-y-3 leading-relaxed">
//         {descHi && (
//           <div>
//             <h3 className="text-xs font-semibold text-gray-700 mb-1">
//               विवरण (Hindi)
//             </h3>
//             <p className="text-[13px] text-gray-800 whitespace-pre-line">
//               {descHi}
//             </p>
//           </div>
//         )}

//         {descEn && (
//           <div>
//             <h3 className="text-xs font-semibold text-gray-700 mb-1">
//               Description (English)
//             </h3>
//             <p className="text-[13px] text-gray-800 whitespace-pre-line">
//               {descEn}
//             </p>
//           </div>
//         )}

//         {scheme.eligibility_hi && (
//           <div>
//             <h3 className="text-xs font-semibold text-gray-700 mb-1">
//               पात्रता
//             </h3>
//             <p className="text-[13px] text-gray-800 whitespace-pre-line">
//               {scheme.eligibility_hi}
//             </p>
//           </div>
//         )}

//         {scheme.benefit_hi && (
//           <div>
//             <h3 className="text-xs font-semibold text-gray-700 mb-1">
//               लाभ / Benefit
//             </h3>
//             <p className="text-[13px] text-gray-800 whitespace-pre-line">
//               {scheme.benefit_hi}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* raw JSON-ish fields */}
//       <div className="mt-3 border-top border-gray-100 pt-3">
//         <h3 className="text-[11px] font-semibold text-gray-500 mb-2">
//           Detailed fields (JSON se)
//         </h3>
//         <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
//           {Object.entries(scheme)
//             .filter(([key, value]) => {
//               if (value == null || value === "") return false;
//               return ![
//                 "id",
//                 "scheme_id",
//                 "slug",
//                 "apply_url",
//                 "read_more_url",
//                 "created_at",
//                 "updated_at",
//                 "name_hi",
//                 "name_en",
//                 "scheme_name_hi",
//                 "scheme_name_en",
//                 "title_hi",
//                 "title_en",
//                 "description_hi",
//                 "description_en",
//                 "short_desc_hi",
//                 "short_desc_en",
//                 "long_description_hi",
//                 "long_description_en",
//                 "eligibility_hi",
//                 "benefit_hi",
//               ].includes(key);
//             })
//             .map(([key, value]) => (
//               <div key={key}>
//                 <dt className="uppercase tracking-wide text-[10px] text-gray-400">
//                   {key.replace(/_/g, " ")}
//                 </dt>
//                 <dd className="text-[11px] text-gray-800 whitespace-pre-line">
//                   {String(value)}
//                 </dd>
//               </div>
//             ))}
//         </dl>
//       </div>
//     </div>
//   );
// }

// /* -------------------- main dashboard screen -------------------- */

// export default function DashboardScreen() {
//   const { user, token } = useAuth();
//   const navigate = useNavigate();

//   const [schemes, setSchemes] = useState([]);
//   const [trainings, setTrainings] = useState([]);
//   const [village, setVillage] = useState(null);

//   // 🔴 NEW: currently opened scheme for modal
//   const [selectedScheme, setSelectedScheme] = useState(null);

//   // 1) Recommended schemes
//   useEffect(() => {
//     if (!token) return;

//     fetch(`${CHAT_API}/user/recommended-schemes`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         // backend may return {items: [...]} or plain array; handle both
//         if (Array.isArray(data)) setSchemes(data);
//         else if (Array.isArray(data.items)) setSchemes(data.items);
//         else setSchemes([]);
//       })
//       .catch((err) => {
//         console.error(err);
//         setSchemes([]);
//       });
//   }, [token]);

//   // 2) Trainings + village detail (based on user profile)
//   useEffect(() => {
//     if (!user) return;

//     // Trainings
//     const params = new URLSearchParams();
//     if (user.district) params.append("district", user.district);
//     if (user.block) params.append("block", user.block);

//     fetch(`${TRAIN_API}/trainings?${params.toString()}`)
//       .then((res) => res.json())
//       .then((data) => setTrainings(data.items || []))
//       .catch((err) => {
//         console.error(err);
//         setTrainings([]);
//       });

//     // Village infra detail
//     if (user.village_code) {
//       fetch(`${GRAM_API}/api/village_detail?village_code=${user.village_code}`)
//         .then((res) => res.json())
//         .then(setVillage)
//         .catch((err) => {
//           console.error(err);
//           setVillage(null);
//         });
//     } else {
//       setVillage(null);
//     }
//   }, [user]);

//   if (!user) {
//     return (
//       <section className="mt-8 text-sm text-center space-y-3">
//         <p>Please login to see your personalised dashboard.</p>
//         <button
//           onClick={() => navigate("/login")}
//           className="inline-flex items-center px-4 py-2 rounded-full bg-[#166534] text-white text-xs font-semibold hover:bg-green-800"
//         >
//           Go to Login
//         </button>
//       </section>
//     );
//   }

//   return (
//     <>
//       <section className="space-y-4">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-sm p-4 text-sm flex items-start justify-between gap-3">
//           <div>
//             <h2 className="text-base font-semibold">
//               Namaste, {user.full_name || user.username} 👋
//             </h2>
//             <p className="text-[11px] text-gray-500">
//               Yeh aapka personalised dashboard hai – schemes, trainings aur
//               village status aapke profile ke basis par.
//             </p>
//             <p className="text-[11px] text-gray-500 mt-1">
//               {user.district && (
//                 <>
//                   District:{" "}
//                   <span className="font-semibold">{user.district}</span>{" "}
//                 </>
//               )}
//               {user.block && (
//                 <>
//                   • Block:{" "}
//                   <span className="font-semibold">{user.block}</span>{" "}
//                 </>
//               )}
//               {user.village_code && (
//                 <>
//                   • Village code:{" "}
//                   <span className="font-semibold">{user.village_code}</span>
//                 </>
//               )}
//             </p>
//           </div>

//           <div className="flex flex-col gap-1">
//             <button
//               onClick={() => navigate("/profile/edit")}
//               className="self-start sm:self-auto px-3 py-1.5 rounded-full border border-gray-300 text-[11px] hover:bg-gray-50"
//             >
//               ✏️ Edit profile
//             </button>
//           </div>
//         </div>

//         {/* Recommended schemes */}
//         <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
//           <div className="flex items-center justify-between">
//             <h3 className="text-sm font-semibold text-[#166534]">
//               Recommended Schemes for you
//             </h3>
//             <button
//               onClick={() => navigate("/finder")}
//               className="text-[11px] text-[#166534] underline"
//             >
//               Open Schemes Finder ↗
//             </button>
//           </div>

//           {schemes.length === 0 ? (
//             <p className="text-[11px] text-gray-500">
//               Abhi koi recommendation nahi mila. Registration me apni details
//               check karo ya chat me schemes pucho.
//             </p>
//           ) : (
//             <div className="grid sm:grid-cols-2 gap-3">
//               {schemes.map((s, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   onClick={() => {
//                     const full = findSchemeFromCard(s);
//                     if (full) {
//                       setSelectedScheme(full); // 🟢 open modal
//                     } else {
//                       // fallback: open finder with prefilled query
//                       navigate("/finder", {
//                         state: {
//                           initialQuery:
//                             s.title || s.name_en || s.name_hi || "",
//                         },
//                       });
//                     }
//                   }}
//                   className="text-left"
//                 >
//                   <ServiceCard
//                     icon="📄"
//                     title={s.title || s.name_hi || s.name_en || "Scheme"}
//                     description={
//                       s.subtitle ||
//                       s.description_hi ||
//                       s.description_en ||
//                       "—"
//                     }
//                     badges={s.badges}
//                     applyUrl={s.apply_url}
//                     readMoreUrl={s.read_more_url}
//                   />
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Trainings */}
//         <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
//           <div className="flex items-center justify-between">
//             <h3 className="text-sm font-semibold text-[#166534]">
//               Upcoming trainings in your area
//             </h3>
//             <button
//               onClick={() => navigate("/my-panchayat/trainings")}
//               className="text-[11px] text-[#166534] underline"
//             >
//               See all trainings ↗
//             </button>
//           </div>

//           {trainings.length === 0 ? (
//             <p className="text-[11px] text-gray-500">
//               Abhi trainings list nahi mili. District/block sahi bharo
//               registration me.
//             </p>
//           ) : (
//             <div className="space-y-2 text-[11px]">
//               {trainings.slice(0, 5).map((t, idx) => (
//                 <div
//                   key={idx}
//                   className="border rounded-xl p-2 flex flex-col gap-0.5"
//                 >
//                   <div className="font-semibold text-gray-800">
//                     {t.training_name || "Training"}
//                   </div>
//                   <div className="text-gray-500 text-[10px]">
//                     {t.org_institute}
//                   </div>
//                   <div className="text-gray-600">
//                     🗓 {t.start_date} – {t.end_date}
//                   </div>
//                   <div className="text-[10px] text-gray-500">
//                     {t.district}
//                     {t.block ? ` • ${t.block}` : ""}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Village infra status */}
//         <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
//           <div className="flex items-center justify-between">
//             <h3 className="text-sm font-semibold text-[#166534]">
//               Village infra status
//             </h3>
//             <button
//               onClick={() => navigate("/my-panchayat/planning")}
//               className="text-[11px] text-blue-600 underline"
//             >
//               Open full planning tool ↗
//             </button>
//           </div>

//           {!village ? (
//             <p className="text-[11px] text-gray-500">
//               Registration me village code bharoge to yahan status dikhega.
//             </p>
//           ) : (
//             <div className="text-[11px] space-y-2">
//               <div className="font-semibold">
//                 {village.village_name} ({village.gp_name})
//               </div>
//               <div className="text-gray-500">
//                 {village.block_name}, {village.district_name} | Code:{" "}
//                 {village.village_code}
//               </div>

//               <div className="grid grid-cols-2 gap-2 mt-2">
//                 {Object.entries(village.deficits).map(([k, v]) => (
//                   <div key={k} className="border rounded-xl p-2">
//                     <div className="font-semibold capitalize">{k}</div>
//                     <div>Score: {v.score?.toFixed(2)}</div>
//                     <div
//                       className={
//                         v.level === "High"
//                           ? "text-red-600 font-semibold"
//                           : v.level === "Medium"
//                           ? "text-orange-500 font-semibold"
//                           : "text-green-600 font-semibold"
//                       }
//                     >
//                       {v.level} deficit
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* 🔴 Modal overlay for scheme details*/}
//       {selectedScheme && (
//         <div
//           className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4"
//           onClick={() => setSelectedScheme(null)}
//         >
//           <div onClick={(e) => e.stopPropagation()}>
//             <SchemeDetailCard
//               scheme={selectedScheme}
//               onClose={() => setSelectedScheme(null)}
//             />
//           </div>
//         </div>
//       )}
//     </>
//   );
// }



// src/screens/DashboardScreen.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import ServiceCard from "../components/ui/ServiceCard.jsx";
import SCHEMES from "../data/samaj_kalyan_vibhag_clean_typed.json";

const CHAT_API = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const TRAIN_API = "http://127.0.0.1:7000";
const GRAM_API = "http://127.0.0.1:5000";

/* ----------------- helpers to map card -> full JSON scheme ----------------- */

// simple text normaliser
function clean(txt) {
  return String(txt || "")
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// map dashboard recommendation card → full JSON scheme
function findSchemeFromCard(card) {
  const rawLabel =
    card.title ||
    card.name_hi ||
    card.name_en ||
    card.scheme_name_hi ||
    card.scheme_name_en ||
    card.subtitle ||
    "";
  if (!rawLabel) return null;

  // dashboard titles often look like "हिन्दी नाम / English Name"
  const labelParts = clean(rawLabel)
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);

  if (labelParts.length === 0) labelParts.push(clean(rawLabel));

  for (const s of SCHEMES) {
    const hi = clean(s.name_hi);
    const en = clean(s.name_en);

    for (const part of labelParts) {
      if (!part) continue;

      // strong exact/startsWith both ways
      if (
        (hi && (part === hi || hi.startsWith(part) || part.startsWith(hi))) ||
        (en && (part === en || en.startsWith(part) || part.startsWith(en)))
      ) {
        return s;
      }

      // softer includes both directions
      if (
        (hi && (hi.includes(part) || part.includes(hi))) ||
        (en && (en.includes(part) || part.includes(en)))
      ) {
        return s;
      }
    }
  }

  console.warn("No scheme match for dashboard card:", rawLabel);
  return null;
}

/* ------------------------ Scheme Details Modal (bilingual) ------------------------ */

function SchemeDetailsModal({ scheme, onClose, lang }) {
  if (!scheme) return null;
  const isHi = lang === "hi";

  const titleHi =
    scheme.name_hi ||
    scheme.scheme_name_hi ||
    scheme.title_hi ||
    scheme.title ||
    "";
  const titleEn =
    scheme.name_en ||
    scheme.scheme_name_en ||
    scheme.title_en ||
    scheme.title ||
    "";

  const descHi =
    scheme.long_description_hi ||
    scheme.description_hi ||
    scheme.short_desc_hi ||
    scheme.subtitle_hi ||
    "";
  const descEn =
    scheme.long_description_en ||
    scheme.description_en ||
    scheme.short_desc_en ||
    scheme.subtitle_en ||
    "";

  const mainTitle = isHi
    ? titleHi || titleEn || "अनाम योजना"
    : titleEn || titleHi || "Unnamed scheme";
  const subTitle = isHi ? titleEn : titleHi;

  const typeLabel =
    (scheme.type && String(scheme.type).toLowerCase().includes("program")) ||
    (scheme.category &&
      String(scheme.category).toLowerCase().includes("programme"))
      ? isHi
        ? "कार्यक्रम"
        : "Programme"
      : isHi
      ? "योजना"
      : "Scheme";

  const metaLine = [
    typeLabel,
    scheme.category,
    scheme.department,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div
      className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 text-xl text-gray-400 hover:text-gray-600"
        aria-label={isHi ? "बंद करें" : "Close"}
      >
        ✕
      </button>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-1 text-gray-900">
        {mainTitle}
      </h2>
      {subTitle && <p className="text-sm text-gray-600 mb-3">{subTitle}</p>}

      {/* Meta */}
      <p className="text-xs text-gray-500 mb-4">{metaLine}</p>

      {/* Descriptions */}
      <div className="space-y-3 leading-relaxed">
        {isHi && descHi && (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              विवरण (हिंदी)
            </h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-line">
              {descHi}
            </p>
          </div>
        )}

        {!isHi && descEn && (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              Description (English)
            </h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-line">
              {descEn}
            </p>
          </div>
        )}

        {/* Show other language too if available */}
        {isHi && descEn && (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              Description (English)
            </h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-line">
              {descEn}
            </p>
          </div>
        )}
        {!isHi && descHi && (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              विवरण (हिंदी)
            </h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-line">
              {descHi}
            </p>
          </div>
        )}

        {scheme.eligibility_hi || scheme.eligibility_en ? (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              {isHi ? "पात्रता" : "Eligibility"}
            </h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-line">
              {isHi
                ? scheme.eligibility_hi || scheme.eligibility_en
                : scheme.eligibility_en || scheme.eligibility_hi}
            </p>
          </div>
        ) : null}

        {scheme.benefit_hi || scheme.benefit_en ? (
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-1">
              {isHi ? "लाभ" : "Benefit"}
            </h3>
            <p className="text-[13px] text-gray-800 whitespace-pre-line">
              {isHi
                ? scheme.benefit_hi || scheme.benefit_en
                : scheme.benefit_en || scheme.benefit_hi}
            </p>
          </div>
        ) : null}
      </div>

      {/* Extra fields */}
      <div className="mt-4 border-t border-gray-100 pt-3">
        <h3 className="text-[11px] font-semibold text-gray-500 mb-2">
          {isHi ? "अन्य विवरण (डेटासेट से)" : "Additional details (from data)"}
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-[11px]">
          {Object.entries(scheme)
            .filter(([key, value]) => {
              if (value == null || value === "") return false;
              return ![
                "id",
                "scheme_id",
                "slug",
                "created_at",
                "updated_at",
                "badges",
                "apply_url",
                "read_more_url",
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
                "eligibility_en",
                "benefit_hi",
                "benefit_en",
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
}

/* ------------------------ deficit label helper ------------------------ */

function getDeficitLabel(key, isHi) {
  const k = String(key || "").toLowerCase();

  if (isHi) {
    if (k === "health") return "स्वास्थ्य";
    if (k === "roads" || k === "road") return "सड़कें";
    if (k === "education") return "शिक्षा";
    if (k === "water" || k === "drinking_water") return "जल आपूर्ति";
    if (k === "sanitation") return "स्वच्छता";
    if (k === "electricity" || k === "power") return "बिजली";
    if (k === "housing") return "आवास";
    if (k === "internet" || k === "connectivity") return "इंटरनेट सुविधा";
    // fallback: raw key
    return key;
  }

  // English: readable title-case
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------ main DashboardScreen ------------------------ */

export default function DashboardScreen() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isHi = lang === "hi";

  const [schemes, setSchemes] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [village, setVillage] = useState(null);

  const [selectedScheme, setSelectedScheme] = useState(null);

  // 1) Recommended schemes
  useEffect(() => {
    if (!token) return;

    fetch(`${CHAT_API}/user/recommended-schemes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSchemes(data);
        else if (Array.isArray(data.items)) setSchemes(data.items);
        else setSchemes([]);
      })
      .catch((err) => {
        console.error(err);
        setSchemes([]);
      });
  }, [token]);

  // 2) Trainings + village detail (based on user profile)
  useEffect(() => {
    if (!user) return;

    // Trainings
    const params = new URLSearchParams();
    if (user.district) params.append("district", user.district);
    if (user.block) params.append("block", user.block);

    fetch(`${TRAIN_API}/trainings?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setTrainings(data.items || []))
      .catch((err) => {
        console.error(err);
        setTrainings([]);
      });

    // Village infra detail
    if (user.village_code) {
      fetch(`${GRAM_API}/api/village_detail?village_code=${user.village_code}`)
        .then((res) => res.json())
        .then(setVillage)
        .catch((err) => {
          console.error(err);
          setVillage(null);
        });
    } else {
      setVillage(null);
    }
  }, [user]);

  if (!user) {
    return (
      <section className="mt-8 text-sm text-center space-y-3">
        <p>
          {isHi
            ? "अपना व्यक्तिगत डैशबोर्ड देखने के लिए कृपया लॉगिन करें।"
            : "Please log in to see your personalised dashboard."}
        </p>
        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center px-4 py-2 rounded-full bg-[#166534] text-white text-xs font-semibold hover:bg-green-800"
        >
          {isHi ? "लॉगिन पेज पर जाएँ" : "Go to Login"}
        </button>
      </section>
    );
  }

  return (
    <>
      <section className="space-y-4 px-6 py-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-4 text-sm flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">
              {isHi ? "नमस्ते," : "Namaste,"}{" "}
              {user.full_name || user.username} 👋
            </h2>
            <p className="text-[11px] text-gray-500">
              {isHi
                ? "यह आपका व्यक्तिगत डैशबोर्ड है — आपकी प्रोफ़ाइल के आधार पर योजनाएँ, प्रशिक्षण और गाँव की स्थिति।"
                : "This is your personalised dashboard – schemes, trainings and village status based on your profile."}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              {user.district && (
                <>
                  {isHi ? "जिला:" : "District:"}{" "}
                  <span className="font-semibold">{user.district}</span>{" "}
                </>
              )}
              {user.block && (
                <>
                  • {isHi ? "ब्लॉक:" : "Block:"}{" "}
                  <span className="font-semibold">{user.block}</span>{" "}
                </>
              )}
              {user.village_code && (
                <>
                  • {isHi ? "गाँव कोड:" : "Village code:"}{" "}
                  <span className="font-semibold">
                    {user.village_code}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={() => navigate("/profile/edit")}
              className="self-start sm:self-auto px-3 py-1.5 rounded-full border border-gray-300 text-[11px] hover:bg-gray-50"
            >
              ✏️ {isHi ? "प्रोफ़ाइल संपादित करें" : "Edit profile"}
            </button>
          </div>
        </div>

        {/* Recommended schemes */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#166534]">
              {isHi
                ? "आपके लिए सुझाई गई योजनाएँ"
                : "Recommended schemes for you"}
            </h3>
            <button
              onClick={() => navigate("/finder")}
              className="text-[11px] text-[#166534] underline"
            >
              {isHi ? "योजना खोजक खोलें ↗" : "Open Schemes Finder ↗"}
            </button>
          </div>

          {schemes.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              {isHi
                ? "अभी आपके लिए कोई योजना सुझाव नहीं मिला। कृपया पंजीकरण में अपनी जानकारी जाँचें या चैट में योजनाओं के बारे में पूछें।"
                : "No recommendations yet. Please check your profile details in registration or ask about schemes in the chat."}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {schemes.map((s, i) => {
                const matched = findSchemeFromCard(s);
                const base = matched || s;

                const titleHi =
                  base.name_hi ||
                  base.scheme_name_hi ||
                  base.title_hi ||
                  base.title ||
                  "";
                const titleEn =
                  base.name_en ||
                  base.scheme_name_en ||
                  base.title_en ||
                  base.title ||
                  "";

                // descriptions – prefer full (matched) dataset fields
                const descHi =
                  (matched &&
                    (matched.long_description_hi ||
                      matched.description_hi ||
                      matched.short_desc_hi ||
                      matched.subtitle_hi)) ||
                  base.long_description_hi ||
                  base.description_hi ||
                  base.short_desc_hi ||
                  base.subtitle_hi ||
                  "";

                const descEn =
                  (matched &&
                    (matched.long_description_en ||
                      matched.description_en ||
                      matched.short_desc_en ||
                      matched.subtitle_en)) ||
                  base.long_description_en ||
                  base.description_en ||
                  base.short_desc_en ||
                  base.subtitle_en ||
                  "";

                const title = isHi
                  ? titleHi || titleEn || "योजना"
                  : titleEn || titleHi || "Scheme";

                // In English: prefer English text; only fall back to Hindi if no English at all.
                const rawDesc = isHi
                  ? descHi || descEn || ""
                  : descEn || descHi || "";

                const description = rawDesc
                  ? isHi
                    ? `विवरण: ${rawDesc}`
                    : `Description: ${rawDesc}`
                  : "—";

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const full = matched || s;
                      setSelectedScheme(full);
                    }}
                    className="text-left"
                  >
                    <ServiceCard
                      icon="📄"
                      title={title}
                      description={description}
                      badges={s.badges}
                      applyUrl={s.apply_url}
                      readMoreUrl={s.read_more_url}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Trainings */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#166534]">
              {isHi
                ? "आपके क्षेत्र में आने वाले प्रशिक्षण"
                : "Upcoming trainings in your area"}
            </h3>
            <button
              onClick={() => navigate("/my-panchayat/trainings")}
              className="text-[11px] text-[#166534] underline"
            >
              {isHi ? "सभी प्रशिक्षण देखें ↗" : "See all trainings ↗"}
            </button>
          </div>

          {trainings.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              {isHi
                ? "अभी प्रशिक्षण की सूची उपलब्ध नहीं है। कृपया पंजीकरण में जिला और ब्लॉक सही भरें।"
                : "No trainings found yet. Please ensure your district and block are filled correctly in your profile."}
            </p>
          ) : (
            <div className="space-y-2 text-[11px]">
              {trainings.slice(0, 5).map((t, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-2 flex flex-col gap-0.5"
                >
                  <div className="font-semibold text-gray-800">
                    {t.training_name ||
                      (isHi ? "प्रशिक्षण" : "Training")}
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    {t.org_institute}
                  </div>
                  <div className="text-gray-600">
                    🗓 {t.start_date} – {t.end_date}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {t.district}
                    {t.block ? ` • ${t.block}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Village infra status */}
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2 mb  -6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#166534]">
              {isHi
                ? "गाँव की आधारभूत सुविधाओं की स्थिति"
                : "Village infrastructure status"}
            </h3>
            <button
              onClick={() => navigate("/my-panchayat/planning")}
              className="text-[11px] text-blue-600 underline"
            >
              {isHi
                ? "पूरा योजना-निर्माण उपकरण खोलें ↗"
                : "Open full planning tool ↗"}
            </button>
          </div>

          {!village ? (
            <p className="text-[11px] text-gray-500">
              {isHi
                ? "जब आप पंजीकरण में गाँव कोड भरेंगे, तब यहाँ आपके गाँव की स्थिति दिखाई देगी।"
                : "Once you fill your village code in your profile, the infrastructure status for your village will appear here."}
            </p>
          ) : (
            <div className="text-[11px] space-y-2">
              <div className="font-semibold">
                {village.village_name} ({village.gp_name})
              </div>
              <div className="text-gray-500">
                {village.block_name}, {village.district_name} |{" "}
                {isHi ? "कोड" : "Code"}: {village.village_code}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(village.deficits).map(([k, v]) => (
                  <div key={k} className="border rounded-xl p-2">
                    <div className="font-semibold">
                      {getDeficitLabel(k, isHi)}
                    </div>
                    <div>
                      {isHi ? "स्कोर:" : "Score:"}{" "}
                      {v.score != null ? v.score.toFixed(2) : "-"}
                    </div>
                    <div
                      className={
                        v.level === "High"
                          ? "text-red-600 font-semibold"
                          : v.level === "Medium"
                          ? "text-orange-500 font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {isHi
                        ? v.level === "High"
                          ? "उच्च कमी"
                          : v.level === "Medium"
                          ? "मध्यम कमी"
                          : v.level === "Low"
                          ? "कम कमी"
                          : v.level
                        : `${v.level} deficit`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Scheme details modal (overlay) */}
      {selectedScheme && (
        <div
          className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4"
          onClick={() => setSelectedScheme(null)}
        >
          <SchemeDetailsModal
            scheme={selectedScheme}
            onClose={() => setSelectedScheme(null)}
            lang={lang}
          />
        </div>
      )}
    </>
  );
}
