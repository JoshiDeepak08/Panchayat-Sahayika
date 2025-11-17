// export default function ServiceCard({ icon, title, description }) {
//   return (
//     <div className="bg-white border border-green-50 rounded-2xl p-3 shadow-sm flex flex-col gap-1">
//       <div className="flex items-center gap-2">
//         <div className="w-8 h-8 rounded-full bg-[#FAF9F5] flex items-center justify-center text-lg">
//           {icon || "🏛️"}
//         </div>
//         <div className="text-xs font-semibold text-gray-900 leading-snug">
//           {title}
//         </div>
//       </div>
//       <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">
//         {description}
//       </p>
//       <div className="flex items-center justify-between mt-1">
//         <span className="text-[9px] text-gray-500">
//           ✅ Verified by Panchayat Portal
//         </span>
//         <button className="text-[9px] text-[#166534] underline">
//           Apply / Read More ↗
//         </button>
//       </div>
//     </div>
//   );
// }


export default function ServiceCard({
  icon,
  title,
  description,
  subtitle,
  verified = true,
  badges = [],
  // applyUrl,
  // readMoreUrl,
}) {
  const body = subtitle || description || "";

  // function handleApplyClick() {
  //   const url = applyUrl || readMoreUrl;
  //   if (!url) return;
  //   window.open(url, "_blank", "noopener,noreferrer");
  // }

  return (
    <div className="bg-white border border-green-50 rounded-2xl p-3 shadow-sm flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#FAF9F5] flex items-center justify-center text-lg">
          {icon || "🏛️"}
        </div>
        <div className="text-xs font-semibold text-gray-900 leading-snug">
          {title}
        </div>
      </div>

      {body && (
        <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">
          {body}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-gray-500">
          {verified
            ? "✅ Verified by Panchayat Portal"
            : "ℹ️ From public sources"}
        </span>

        {/* {(applyUrl || readMoreUrl) && (
          <button
            type="button"
            onClick={handleApplyClick}
            target="_blank"
            rel="noreferrer"
            className="text-[9px] text-[#166534] underline"
          >
            Apply / Read More ↗
          </button>
        )} */}
      </div>

      {badges?.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
          {badges.filter(Boolean).map((b, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px]"
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
