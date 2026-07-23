export default function DashboardCard({
  children,
  className = "",
}) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-gray-100
        bg-white
        p-6
        shadow-sm
        ${className}
      `}
    >
      {children}
    </div>
  );
}