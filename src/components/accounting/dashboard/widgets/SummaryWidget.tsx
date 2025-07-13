interface SummaryWidgetProps {
  title: string;
  mainValue: string;
  mainLabel: string;
  subtitle?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  color?: 'green' | 'red' | 'blue' | 'gray';
}

export function SummaryWidget({ 
  title, 
  mainValue, 
  mainLabel, 
  subtitle, 
  trend,
  color = 'gray'
}: SummaryWidgetProps) {
  const getMainColor = () => {
    switch (color) {
      case 'green':
        return 'text-green-600';
      case 'red':
        return 'text-red-600';
      case 'blue':
        return 'text-blue-600';
      default:
        return 'text-gray-700';
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h4 className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wide text-left">
        {title}
      </h4>
      
      <div className="flex-1 flex flex-col justify-center text-center space-y-2">
        <div className={`text-2xl font-bold ${getMainColor()}`}>
          {mainValue}
        </div>
        <div className="text-xs text-gray-600">
          {mainLabel}
        </div>
        
        {subtitle && (
          <div className="text-xs text-gray-500">
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div className={`text-xs ${getTrendColor()} flex items-center justify-center space-x-1`}>
            <span>{getTrendIcon()}</span>
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
} 