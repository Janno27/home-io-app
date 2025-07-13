import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Edit3, Palette } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChartWidgetProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  type: 'bar' | 'line';
  color?: string;
  onEdit?: () => void;
  onColorChange?: (color: string) => void;
  isEditMode?: boolean;
}

const colorOptions = [
  { value: 'hsl(var(--chart-1))', label: 'Bleu', color: 'hsl(var(--chart-1))' },
  { value: 'hsl(var(--chart-2))', label: 'Vert', color: 'hsl(var(--chart-2))' },
  { value: 'hsl(var(--chart-3))', label: 'Rouge', color: 'hsl(var(--chart-3))' },
  { value: 'hsl(var(--chart-4))', label: 'Orange', color: 'hsl(var(--chart-4))' },
  { value: 'hsl(var(--chart-5))', label: 'Violet', color: 'hsl(var(--chart-5))' },
];

export function ChartWidget({ 
  title, 
  data, 
  type, 
  color = 'hsl(var(--chart-1))',
  onEdit, 
  onColorChange,
  isEditMode = false
}: ChartWidgetProps) {

  // Configuration pour shadcn chart
  const chartConfig: ChartConfig = {
    value: {
      label: 'Valeur',
    },
  };

  // Transformer les données pour Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <div className="h-full bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg flex flex-col">
      {/* Header avec boutons alignés à gauche */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 text-left">{title}</h3>
        <div className="flex items-center space-x-2">
          {/* Sélecteur de couleur en mode édition */}
          {isEditMode && onColorChange && (
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-1 gap-1">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onColorChange(option.value)}
                      className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded text-sm w-full text-left"
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {onEdit && (
            <Button
              onClick={onEdit}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Graphique */}
      <div className="flex-1">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="value" 
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
} 