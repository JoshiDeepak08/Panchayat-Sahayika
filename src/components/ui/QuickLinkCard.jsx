export default function QuickLinkCard({ icon, titleHi, titleEn, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        bg-cardBeige
        border border-cardBorder
        rounded-3xl
        px-6 py-6
        text-left
        shadow-sm
        flex flex-col gap-3
        transition-transform transition-shadow
        duration-150
        hover:-translate-y-1 hover:shadow-soft
      "
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-2xl text-white">
        {icon}
      </div>

      <div className="space-y-0.5">
        <div className="text-[15px] font-semibold text-primary">
          {titleHi}
        </div>
        {titleEn && (
          <div className="text-[11px] font-semibold text-primary">
            {titleEn}
          </div>
        )}
      </div>

      {body && (
        <p className="text-[10px] leading-snug text-gray-800">
          {body}
        </p>
      )}
    </button>
  );
}
