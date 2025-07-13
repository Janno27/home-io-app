interface StatsWidgetProps {
  title: string;
  stats: Array<{
    label: string;
    value: string;
    color?: 'green' | 'red' | 'gray';
  }>;
}

export function StatsWidget({ title, stats }: StatsWidgetProps) {
  const getColorClass = (color: string = 'gray') => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="p-4 h-full">
      <h4 className="text-sm font-medium text-gray-700 mb-3 text-left">{title}</h4>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs text-gray-500">{stat.label}</span>
            <span className={`text-xs font-medium ${getColorClass(stat.color)}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 