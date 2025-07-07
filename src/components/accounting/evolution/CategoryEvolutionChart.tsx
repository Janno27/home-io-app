import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';

interface CategoryEvolutionChartProps {
  selectedYear: number;
  type: 'expense' | 'income';
  formatAmount: (amount: number) => string;
  formatAmountDetailed: (amount: number) => string;
  showComparison: boolean;
}

interface CategoryComparisonData {
  month: string;
  [key: string]: string | number; // Permettre des clés dynamiques pour les catégories
}

// Palette de couleurs pour les différentes catégories
const COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
];

// Couleurs pour la comparaison (plus claires)
const COMPARISON_COLORS = [
  '#a5b4fc', // indigo-300
  '#c4b5fd', // violet-300
  '#f9a8d4', // pink-300
  '#6ee7b7', // emerald-300
  '#fcd34d', // amber-300
  '#fca5a5', // red-300
  '#7dd3fc', // cyan-300
  '#bef264', // lime-300
  '#fdba74', // orange-300
  '#c4b5fd', // violet-300
];

export function CategoryEvolutionChart({ selectedYear, type, formatAmount, formatAmountDetailed, showComparison }: CategoryEvolutionChartProps) {
  const { transactions, categories } = useAccounting();
  
  // Calculer les top 5 catégories par défaut avec useMemo
  const defaultTop5Categories = useMemo(() => {
    if (!transactions.length || !categories.length) return [];
    
    const yearTransactions = transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === selectedYear &&
      transaction.category_type === type
    );

    const categoryTotals = new Map<string, number>();

    yearTransactions.forEach(transaction => {
      const amount = transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount;
      const currentTotal = categoryTotals.get(transaction.category_id) || 0;
      categoryTotals.set(transaction.category_id, currentTotal + amount);
    });

    return categories
      .filter(cat => cat.type === type && categoryTotals.has(cat.id))
      .map(cat => ({
        ...cat,
        total: categoryTotals.get(cat.id) || 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map(cat => cat.id);
  }, [transactions, categories, selectedYear, type]);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Mettre à jour les catégories sélectionnées quand les top 5 changent
  useEffect(() => {
    if (defaultTop5Categories.length > 0) {
      setSelectedCategories(new Set(defaultTop5Categories));
    }
  }, [defaultTop5Categories]);

  const months = [
    'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
    'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
  ];

  // Calculer les données de comparaison par catégorie
  const calculateComparisonData = (): CategoryComparisonData[] => {
    // Données pour l'année sélectionnée
    const currentYearTransactions = transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === selectedYear &&
      transaction.category_type === type
    );

    // Données pour l'année précédente (si comparaison activée)
    const previousYearTransactions = showComparison ? transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === selectedYear - 1 &&
      transaction.category_type === type
    ) : [];

    // Préparer les données par mois
    const monthlyData: CategoryComparisonData[] = [];

    for (let month = 0; month < 12; month++) {
      const monthData: CategoryComparisonData = {
        month: months[month]
      };

      // Pour chaque catégorie sélectionnée
      Array.from(selectedCategories).forEach((categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return;

        // Calculer le total pour l'année courante
        const currentMonthTransactions = currentYearTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.accounting_date);
          return transactionDate.getMonth() === month && transaction.category_id === categoryId;
        });

        const currentMonthTotal = currentMonthTransactions.reduce((sum, t) => 
          sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0
        );

        monthData[`${categoryId}_current`] = currentMonthTotal;

        // Si comparaison activée, calculer pour l'année précédente
        if (showComparison) {
          const previousMonthTransactions = previousYearTransactions.filter(transaction => {
            const transactionDate = new Date(transaction.accounting_date);
            return transactionDate.getMonth() === month && transaction.category_id === categoryId;
          });

          const previousMonthTotal = previousMonthTransactions.reduce((sum, t) => 
            sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0
          );

          monthData[`${categoryId}_previous`] = previousMonthTotal;
        }
      });

      monthlyData.push(monthData);
    }

    return monthlyData;
  };

  // Obtenir les catégories disponibles avec leurs totaux
  const getAvailableCategories = () => {
    const yearTransactions = transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === selectedYear &&
      transaction.category_type === type
    );

    const categoryTotals = new Map<string, number>();

    yearTransactions.forEach(transaction => {
      const amount = transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount;
      const currentTotal = categoryTotals.get(transaction.category_id) || 0;
      categoryTotals.set(transaction.category_id, currentTotal + amount);
    });

    return categories
      .filter(cat => cat.type === type && categoryTotals.has(cat.id))
      .map(cat => ({
        ...cat,
        total: categoryTotals.get(cat.id) || 0
      }))
      .sort((a, b) => b.total - a.total);
  };

  const toggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const comparisonData = calculateComparisonData();
  const availableCategories = getAvailableCategories();

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg relative flex flex-col h-full p-6">
      {/* Sélecteur de catégories en haut à droite */}
      <div className="absolute top-4 right-4 z-10">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 backdrop-blur-sm bg-white/95 border border-white/50 shadow-lg rounded-xl" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <h4 className="font-medium text-sm text-gray-900">
                  Sélection des catégories
                </h4>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-gray-600">
                  Choisissez les catégories à afficher :
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.has(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <Label 
                        htmlFor={`category-${category.id}`} 
                        className="text-sm text-gray-700 cursor-pointer font-normal flex-1"
                      >
                        {category.name}
                      </Label>
                      <span className="text-xs text-gray-500">
                        {formatAmount(category.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  {selectedCategories.size} catégorie{selectedCategories.size > 1 ? 's' : ''} sélectionnée{selectedCategories.size > 1 ? 's' : ''}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const allCategories = new Set(availableCategories.map(cat => cat.id));
                      setSelectedCategories(allCategories);
                    }}
                    className="text-xs h-7 px-2 text-gray-600 hover:text-gray-800"
                  >
                    Tout
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedCategories(new Set())}
                    className="text-xs h-7 px-2 text-gray-600 hover:text-gray-800"
                  >
                    Aucun
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex-1 min-h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
              formatter={(value: number, name: string) => {
                const [categoryId, period] = name.split('_');
                const category = availableCategories.find(cat => cat.id === categoryId);
                const periodLabel = period === 'current' ? selectedYear : selectedYear - 1;
                return [
                  formatAmountDetailed(value), 
                  `${category?.name || categoryId} (${periodLabel})`
                ];
              }}
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
              iconType="rect"
              layout="horizontal"
              verticalAlign="bottom"
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: '500',
                paddingLeft: '0px'
              }}
              formatter={(value) => {
                const [categoryId, period] = value.split('_');
                const category = availableCategories.find(cat => cat.id === categoryId);
                const periodLabel = period === 'current' ? selectedYear : selectedYear - 1;
                return `${category?.name || categoryId} (${periodLabel})`;
              }}
            />
            {Array.from(selectedCategories).map((categoryId, index) => (
              <Bar 
                key={`${categoryId}_current`}
                dataKey={`${categoryId}_current`}
                fill={COLORS[index % COLORS.length]}
                name={`${categoryId}_current`}
                radius={[2, 2, 0, 0]}
              />
            ))}
            {showComparison && Array.from(selectedCategories).map((categoryId, index) => (
              <Bar 
                key={`${categoryId}_previous`}
                dataKey={`${categoryId}_previous`}
                fill={COMPARISON_COLORS[index % COMPARISON_COLORS.length]}
                name={`${categoryId}_previous`}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 