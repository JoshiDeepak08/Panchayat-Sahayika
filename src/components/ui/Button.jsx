export default function Button({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition";

  const styles =
    variant === "primary"
      ? "bg-[#166534] text-white shadow-sm hover:bg-green-800"
      : "border border-[#166534] text-[#166534] bg-white hover:bg-green-50";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {icon && <span className="text-base">{icon}</span>}
      {children}
    </button>
  );
}
