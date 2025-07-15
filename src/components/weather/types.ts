export interface WeatherData {
  current: {
    temp: number;
    description: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    feelsLike: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    description: string;
    icon: string;
  }>;
  location: string;
} 