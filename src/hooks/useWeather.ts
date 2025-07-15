import { useState, useEffect } from 'react';
import { WeatherData } from '@/components/weather/types';

interface UseWeatherReturn {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  refreshWeather: () => void;
}

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo_key';

export function useWeather(): UseWeatherReturn {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Logs simplifiés
  useEffect(() => {
    if (weatherData) console.log('✅ Météo chargée pour:', weatherData.location);
    if (error) console.log('❌ Erreur météo:', error);
  }, [weatherData, error]);

  const fetchWeatherData = async (lat: number, lon: number) => {
    console.log('🌍 fetchWeatherData appelée avec:', { lat, lon });
    try {
      setLoading(true);
      setError(null);

      // Vérifier si la clé API est configurée
      if (WEATHER_API_KEY === 'demo_key') {
        console.log('❌ Clé API non configurée');
        throw new Error('Clé API WeatherAPI non configurée');
      }
      
      console.log('✅ Clé API trouvée, appel API en cours...');

      // Récupérer météo actuelle et prévisions (tout en un seul appel)
      const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no&lang=fr`;
      console.log('🔗 URL API:', url);
      
      const response = await fetch(url);
      console.log('📡 Réponse API:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 401) {
          console.log('❌ Erreur 401 - Clé API invalide');
          throw new Error('Clé API WeatherAPI invalide (401 Unauthorized)');
        } else if (response.status === 403) {
          console.log('❌ Erreur 403 - Accès refusé');
          throw new Error('Clé API WeatherAPI expirée ou limitée (403 Forbidden)');
        }
        console.log('❌ Erreur API:', response.status);
        throw new Error(`Erreur API météo: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Données reçues:', data);

      // Traitement des données WeatherAPI
      const processedData: WeatherData = {
        current: {
          temp: data.current.temp_c,
          description: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          visibility: data.current.vis_km,
          feelsLike: data.current.feelslike_c,
          icon: convertWeatherApiIcon(data.current.condition.code, data.current.is_day),
        },
        forecast: processWeatherApiForecast(data.forecast.forecastday),
        location: data.location.name || 'Position actuelle',
      };

      console.log('✅ Données traitées et sauvegardées:', processedData);
      setWeatherData(processedData);
    } catch (err) {
      console.error('❌ Erreur API météo:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Données de fallback en cas d'erreur - Lisbonne
      setWeatherData({
        current: {
          temp: 22,
          description: 'ensoleillé',
          humidity: 65,
          windSpeed: 12,
          visibility: 10,
          feelsLike: 24,
          icon: '01d',
        },
        forecast: [
          { date: new Date(Date.now() + 86400000).toISOString(), tempMax: 25, tempMin: 16, description: 'ensoleillé', icon: '01d' },
          { date: new Date(Date.now() + 172800000).toISOString(), tempMax: 23, tempMin: 15, description: 'nuageux', icon: '03d' },
          { date: new Date(Date.now() + 259200000).toISOString(), tempMax: 20, tempMin: 13, description: 'pluie', icon: '10d' },
          { date: new Date(Date.now() + 345600000).toISOString(), tempMax: 24, tempMin: 14, description: 'ensoleillé', icon: '01d' },
          { date: new Date(Date.now() + 432000000).toISOString(), tempMax: 26, tempMin: 17, description: 'partiellement nuageux', icon: '02d' },
        ],
        location: 'Lisbonne',
      });
    } finally {
      setLoading(false);
    }
  };

  const processWeatherApiForecast = (forecastDays: any[]) => {
    // Prendre les 5 prochains jours
    return forecastDays.slice(0, 5).map((day) => ({
      date: day.date,
      tempMax: Math.round(day.day.maxtemp_c),
      tempMin: Math.round(day.day.mintemp_c),
      description: day.day.condition.text,
      icon: convertWeatherApiIcon(day.day.condition.code, 1), // Jour par défaut pour les prévisions
    }));
  };

  const convertWeatherApiIcon = (conditionCode: number, isDay: number) => {
    // Conversion des codes WeatherAPI vers des codes compatibles avec nos icônes
    const dayNight = isDay ? 'd' : 'n';
    
    switch (conditionCode) {
      case 1000: // Sunny/Clear
        return `01${dayNight}`;
      case 1003: // Partly cloudy
        return `02${dayNight}`;
      case 1006: // Cloudy
      case 1009: // Overcast
        return `03${dayNight}`;
      case 1030: // Mist
      case 1135: // Fog
      case 1147: // Freezing fog
        return `04${dayNight}`;
      case 1063: // Patchy rain possible
      case 1180: // Light rain
      case 1183: // Light rain
      case 1186: // Moderate rain at times
      case 1189: // Moderate rain
      case 1192: // Heavy rain at times
      case 1195: // Heavy rain
      case 1240: // Light rain shower
      case 1243: // Moderate or heavy rain shower
      case 1246: // Torrential rain shower
        return `10${dayNight}`;
      case 1087: // Thundery outbreaks possible
      case 1273: // Patchy light rain with thunder
      case 1276: // Moderate or heavy rain with thunder
      case 1279: // Patchy light snow with thunder
      case 1282: // Moderate or heavy snow with thunder
        return `11${dayNight}`;
      case 1066: // Patchy snow possible
      case 1114: // Blowing snow
      case 1117: // Blizzard
      case 1210: // Patchy light snow
      case 1213: // Light snow
      case 1216: // Patchy moderate snow
      case 1219: // Moderate snow
      case 1222: // Patchy heavy snow
      case 1225: // Heavy snow
      case 1237: // Ice pellets
      case 1249: // Light sleet showers
      case 1252: // Moderate or heavy sleet showers
      case 1255: // Light snow showers
      case 1258: // Moderate or heavy snow showers
      case 1261: // Light showers of ice pellets
      case 1264: // Moderate or heavy showers of ice pellets
        return `13${dayNight}`;
      default:
        return `01${dayNight}`; // Default to sunny/clear
    }
  };

  const getLocation = () => {
    console.log('📍 Demande de géolocalisation...');
    if (!navigator.geolocation) {
      console.log('❌ Géolocalisation non supportée');
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Position obtenue:', { latitude, longitude });
        fetchWeatherData(latitude, longitude);
      },
      (err) => {
        console.error('❌ Erreur de géolocalisation:', err);
        console.log('📍 Utilisation de Lisbonne par défaut');
        // Utiliser Lisbonne par défaut
        fetchWeatherData(38.7223, -9.1393);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, // 10 secondes seulement
        maximumAge: 600000, // 10 minutes
      }
    );
  };

  const refreshWeather = () => {
    getLocation();
  };

  useEffect(() => {
    console.log('🚀 Initialisation du hook useWeather');
    getLocation();
  }, []); // Seulement au premier mount

  return {
    weatherData,
    loading,
    error,
    refreshWeather,
  };
} 