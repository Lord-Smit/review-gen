export default function StatsCard({ title, value, icon: Icon, color = 'bg-blue-100 text-blue-600' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 tracking-tight">
          {value ?? 0}
        </div>
        <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
      </div>
    </div>
  );
}
