/**
 * Dashboard statistic card widget.
 */
const StatCard = ({ label, value, icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: 'from-blue-600/20 to-blue-700/10 border-blue-600/30 text-blue-400',
    green: 'from-green-600/20 to-green-700/10 border-green-600/30 text-green-400',
    yellow: 'from-yellow-600/20 to-yellow-700/10 border-yellow-600/30 text-yellow-400',
    red: 'from-red-600/20 to-red-700/10 border-red-600/30 text-red-400',
    purple: 'from-purple-600/20 to-purple-700/10 border-purple-600/30 text-purple-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5 animate-slide-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
          {trend && (
            <p className="text-xs text-slate-500 mt-1">{trend}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg bg-current/10`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
