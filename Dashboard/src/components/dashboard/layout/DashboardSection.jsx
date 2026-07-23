export default function DashboardSection({
  className = "",
  children,
}) {
  return (
    <section className={`space-y-4 ${className}`}>
      {children}
    </section>
  );
}