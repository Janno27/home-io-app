import { Sun, AlertTriangle, Cloud, CloudRain, CloudSnow, CloudLightning, MapPin } from 'lucide-react';
import { WeatherData } from './types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WeatherWidgetProps {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  onOpen: (point: { x: number; y: number }) => void;
  navigateTo?: (page: 'home' | 'accounting' | 'accounting-table' | 'evolution' | 'dashboard') => void;
}

export function WeatherWidget({ weatherData, loading, error, onOpen }: WeatherWidgetProps) {
  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return <Sun className="w-4 h-4 text-yellow-500" />;
    
    switch (iconCode) {
      case '01d':
      case '01n':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case '02d':
      case '02n':
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return <Cloud className="w-4 h-4 text-gray-500" />;
      case '09d':
      case '09n':
      case '10d':
      case '10n':
        return <CloudRain className="w-4 h-4 text-blue-500" />;
      case '11d':
      case '11n':
        return <CloudLightning className="w-4 h-4 text-purple-500" />;
      case '13d':
      case '13n':
        return <CloudSnow className="w-4 h-4 text-blue-300" />;
      default:
        return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    onOpen(point);
  };

  const formatTemp = (temp: number) => `${Math.round(temp)}°C`;

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-2 px-3">
        <div className="w-4 h-4 bg-gray-300/40 rounded animate-pulse" />
        <div className="w-8 h-4 bg-gray-300/40 rounded animate-pulse" />
        <div className="w-12 h-3 bg-gray-300/40 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center space-x-2 p-2 px-3 cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
      onClick={handleClick}
      title="Voir les prévisions détaillées"
    >
      {getWeatherIcon(weatherData?.current.icon)}
      <span className="text-sm font-medium text-gray-700">
        {weatherData ? formatTemp(weatherData.current.temp) : '...'}
      </span>
      <span className="text-xs text-gray-500 flex items-center">
        <MapPin className="w-3 h-3 mr-1" />
        {weatherData?.location || '...'}
      </span>
      {error && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="w-3 h-3 text-red-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>{error}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}