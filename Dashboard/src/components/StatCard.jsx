export default function StatCard({
  title,
  value,
  icon,
  iconBg = "bg-indigo-100",
  changePercent,
  trend = "up",
  changeLabel,
}) {
  const isUp = trend === "up";

  return (
    // التعديل هنا: أضفنا scale-[1.02] و transition-all
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between transition-all duration-300 ease-out hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 hover:border-blue-500/30">
      
      <div className="flex items-start justify-between">
        <span className="text-gray-500 text-sm font-medium">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-3 text-3xl font-bold text-gray-900 tracking-tight">{value}</div>

      <div className="mt-3 flex items-center gap-1 text-sm">
        <span className={`flex items-center gap-0.5 font-semibold ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
          {isUp ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8M21 7h-6v6"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6 6 4-4 8 8M21 17h-6v-6"/></svg>
          )}
          {changePercent}
        </span>
        <span className="text-gray-400 truncate">{changeLabel}</span>
      </div>
    </div>
  );
}