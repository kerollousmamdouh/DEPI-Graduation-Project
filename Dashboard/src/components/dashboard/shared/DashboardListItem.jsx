export default function DashboardListItem({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        flex items-center gap-4
        rounded-2xl
        border border-gray-100
        p-4
        transition-all
        hover:border-green-200
        hover:shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}