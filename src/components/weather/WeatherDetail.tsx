import { useRef } from 'react';
import { X, Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Eye, Thermometer } from 'lucide-react';
import { DockAnimation } from '@/components/ui/DockAnimation';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { WeatherData } from './types';

interface WeatherDetailProps {
  isOpen: boolean;
  onClose: () => void;
  originPoint?: { x: number; y: number };
  weatherData?: WeatherData | null;
}

export function WeatherDetail({ isOpen, onClose, originPoint, weatherData }: WeatherDetailProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(widgetRef, onClose);

  const getWeatherIcon = (iconCode: string, size = 'w-6 h-6') => {
    switch (iconCode) {
      case '01d':
      case '01n':
        return <Sun className={`${size} text-yellow-500`} />;
      case '02d':
      case '02n':
      case '03d':
      case '03n':
      case '04d':
      case '04n':
        return <Cloud className={`${size} text-gray-500`} />;
      case '09d':
      case '09n':
      case '10d':
      case '10n':
        return <CloudRain className={`${size} text-blue-500`} />;
      case '11d':
      case '11n':
        return <CloudLightning className={`${size} text-purple-500`} />;
      case '13d':
      case '13n':
        return <CloudSnow className={`${size} text-blue-300`} />;
      default:
        return <Sun className={`${size} text-yellow-500`} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTemp = (temp: number) => `${Math.round(temp)}°C`;

  if (!weatherData) {
    return null;
  }

  return (
    <DockAnimation isOpen={isOpen} originPoint={originPoint}>
      <div className="flex items-start justify-start pl-6 h-full pointer-events-none pt-28">
        <div ref={widgetRef} className="w-96 h-[60vh] bg-gray-100/95 backdrop-blur-sm rounded-lg border border-white/20 shadow-sm overflow-hidden pointer-events-auto flex flex-col z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center space-x-2">
              {getWeatherIcon(weatherData.current.icon, 'w-5 h-5')}
              <h3 className="text-gray-600 text-sm font-medium">
                Météo - {weatherData.location}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 p-0 rounded-full hover:bg-white/15 flex items-center justify-center text-gray-600 hover:text-gray-700"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto min-h-0 space-y-6">
            {/* Météo actuelle */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                {getWeatherIcon(weatherData.current.icon, 'w-16 h-16')}
                <div>
                  <div className="text-3xl font-bold text-gray-700">
                    {formatTemp(weatherData.current.temp)}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {weatherData.current.description}
                  </div>
                </div>
              </div>

              {/* Détails actuels */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600">Ressenti</span>
                  <span className="font-medium text-gray-700">{formatTemp(weatherData.current.feelsLike)}</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">Humidité</span>
                  <span className="font-medium text-gray-700">{weatherData.current.humidity}%</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                  <Wind className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Vent</span>
                  <span className="font-medium text-gray-700">{weatherData.current.windSpeed} km/h</span>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Visibilité</span>
                  <span className="font-medium text-gray-700">{weatherData.current.visibility} km</span>
                </div>
              </div>
            </div>

            {/* Prévisions */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-600">Prochains jours</h4>
              <div className="space-y-2">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getWeatherIcon(day.icon, 'w-5 h-5')}
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(day.date)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 capitalize">
                        {day.description}
                      </span>
                      <div className="flex items-center space-x-1 text-sm">
                        <span className="font-medium text-gray-700">{formatTemp(day.tempMax)}</span>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-500">{formatTemp(day.tempMin)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DockAnimation>
  );
} 