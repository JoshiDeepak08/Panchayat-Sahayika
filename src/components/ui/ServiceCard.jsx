export default function ServiceCard({ icon, title, description }) {
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
      <p className="text-[10px] text-gray-600 leading-snug line-clamp-2">
        {description}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] text-gray-500">
          ✅ Verified by Panchayat Portal
        </span>
        <button className="text-[9px] text-[#166534] underline">
          Apply / Read More ↗
        </button>
      </div>
    </div>
  );
}
