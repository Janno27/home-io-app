import { ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlyChartProps {
  data: Array<{
    month: string;
    revenus: number;
    depenses: number;
  }>;
  formatAmount: (amount: number) => string;
  formatAmountDetailed: (amount: number) => string;
  onOpenAccountingTable?: () => void;
}

export function MonthlyChart({ data, formatAmount, formatAmountDetailed, onOpenAccountingTable }: MonthlyChartProps) {
  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg relative flex flex-col h-[calc(100vh-485px)]">
      {/* CTA discret en haut à droite */}
      <button 
        onClick={onOpenAccountingTable}
        className="absolute top-4 right-4 group flex items-center space-x-2 text-xs text-gray-600 hover:text-blue-600 transition-all duration-200"
      >
        <span className="group-hover:translate-x-1 transition-transform duration-200">Voir la distribution</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
      </button>
      
      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#374151"
              fontSize={10}
              fontWeight={500}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke="#374151"
              fontSize={10}
              fontWeight={500}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatAmount(value)}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                formatAmountDetailed(value), 
                props.dataKey === 'revenus' ? 'Revenus' : 'Dépenses'
              ]}
              labelStyle={{ color: '#6b7280', fontWeight: '500', fontSize: '12px' }}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(229, 231, 235, 0.3)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(8px)',
                fontSize: '12px',
                padding: '8px 12px'
              }}
            />
            <Legend 
              align="left"
              iconType="line"
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: '500',
                paddingLeft: '0px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenus" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
              name="Revenus"
              filter="drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3))"
            />
            <Line 
              type="monotone" 
              dataKey="depenses" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#ffffff' }}
              name="Dépenses"
              filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}