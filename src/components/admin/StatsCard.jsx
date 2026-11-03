export default function StatsCard({
  title,
  value,
  icon: Icon,
  color = 'bg-blue-50 text-blue-600 border-blue-100',
  trend,
  trendPositive = true,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {value ?? 0}
          </div>
        </div>

        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105 ${color}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-gray-100 text-xs font-medium">
          <span
            className={
              trendPositive ? 'text-emerald-600' : 'text-rose-600'
            }
          >
            {trend}
          </span>
          <span className="text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
}
