export default function AnswerCard({ children }) {
  return (
    <div className="w-full bg-white border border-green-100 rounded-2xl p-3 text-sm space-y-1">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#166534]">
        <span>🤖</span>
        <span>Panchayat Sahayika</span>
      </div>
      <div className="text-gray-800 text-xs leading-snug">{children}</div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-gray-500">
          ✅ Verified by Panchayat Portal
        </span>
        <button className="text-[10px] text-[#166534] underline">
          Apply / Read More ↗
        </button>
      </div>
    </div>
  );
}
