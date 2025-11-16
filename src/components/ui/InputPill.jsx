export default function InputPill({ icon, placeholder, className = "", ...props }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm ${className}`}
    >
      {icon && <span className="text-gray-500 text-base">{icon}</span>}
      <input
        className="flex-1 bg-transparent outline-none text-xs placeholder:text-gray-400"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}
