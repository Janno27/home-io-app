import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { ChevronRight } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';

interface DistributionChartProps {
  selectedYear: number;
  type: 'expense' | 'income';
  onTypeChange?: (type: 'expense' | 'income') => void;
  showComparison?: boolean;
}

interface CategoryDistribution {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  previousYearAmount?: number;
  previousYearPercentage?: number;
  percentageChange?: number;
  subCategories?: SubCategoryDistribution[];
}

interface SubCategoryDistribution {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  previousYearAmount?: number;
  previousYearPercentage?: number;
  percentageChange?: number;
}

export function DistributionChart({ selectedYear, type, onTypeChange, showComparison = false }: DistributionChartProps) {
  const { transactions, categories, subCategories } = useAccounting();
  const [showSubCategories, setShowSubCategories] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Réinitialiser les catégories expandées quand on change de mode
  const handleSubCategoriesToggle = (checked: boolean) => {
    setShowSubCategories(checked);
    setExpandedCategories(new Set()); // Reset les catégories expandées
  };

  // Calculer la distribution des catégories ou sous-catégories
  const calculateDistribution = (): CategoryDistribution[] => {
    // Filtrer les transactions pour l'année et le type sélectionnés
    const yearTransactions = transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === selectedYear &&
      transaction.category_type === type
    );

    // Filtrer les transactions pour l'année précédente (si comparaison activée)
    const previousYearTransactions = showComparison ? transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === selectedYear - 1 &&
      transaction.category_type === type
    ) : [];

    // Calculer le total pour les pourcentages
    const totalAmount = yearTransactions.reduce((sum, t) => 
      sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0
    );

    const previousYearTotalAmount = showComparison ? previousYearTransactions.reduce((sum, t) => 
      sum + (t.net_amount !== undefined ? t.net_amount : t.amount), 0
    ) : 0;

    if (totalAmount === 0) return [];

    if (showSubCategories) {
      // Mode sous-catégories : afficher toutes les sous-catégories de manière globale
      const subCategoryMap = new Map<string, CategoryDistribution>();

      yearTransactions.forEach(transaction => {
        const amount = transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount;
        
        if (transaction.subcategory_id) {
          const subCategory = subCategories.find(sub => sub.id === transaction.subcategory_id);
          const category = categories.find(c => c.id === transaction.category_id);
          
          if (subCategory && category) {
            const key = transaction.subcategory_id;
            if (!subCategoryMap.has(key)) {
              subCategoryMap.set(key, {
                id: subCategory.id,
                name: `${subCategory.name} (${category.name})`,
                amount: 0,
                percentage: 0,
                subCategories: []
              });
            }
            const subCategoryData = subCategoryMap.get(key);
            if (subCategoryData) {
              subCategoryData.amount += amount;
            }
          }
        } else {
          // Transactions sans sous-catégorie
          const category = categories.find(c => c.id === transaction.category_id);
          if (category) {
            const key = `no-sub-${transaction.category_id}`;
            if (!subCategoryMap.has(key)) {
              subCategoryMap.set(key, {
                id: key,
                name: category.name,
                amount: 0,
                percentage: 0,
                subCategories: []
              });
            }
            const categoryData = subCategoryMap.get(key);
            if (categoryData) {
              categoryData.amount += amount;
            }
          }
        }
      });

      // Calculer les pourcentages et trier
      const result = Array.from(subCategoryMap.values())
        .map(item => ({
          ...item,
          percentage: (item.amount / totalAmount) * 100
        }))
        .sort((a, b) => b.amount - a.amount);

      return result;
    } else {
      // Mode catégories : grouper par catégorie avec possibilité d'expansion
      const categoryMap = new Map<string, CategoryDistribution>();
      const previousYearCategoryMap = new Map<string, number>();

      // Traiter les transactions de l'année courante
      yearTransactions.forEach(transaction => {
        const amount = transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount;
        
        if (!categoryMap.has(transaction.category_id)) {
          const category = categories.find(c => c.id === transaction.category_id);
          if (category) {
            categoryMap.set(transaction.category_id, {
              id: category.id,
              name: category.name,
              amount: 0,
              percentage: 0,
              previousYearAmount: 0,
              percentageChange: 0,
              subCategories: []
            });
          }
        }

        const categoryData = categoryMap.get(transaction.category_id);
        if (categoryData) {
          categoryData.amount += amount;

          // Gérer les sous-catégories
          if (transaction.subcategory_id) {
            let subCategoryData = categoryData.subCategories?.find(sub => sub.id === transaction.subcategory_id);
            if (!subCategoryData) {
              const subCategory = subCategories.find(sub => sub.id === transaction.subcategory_id);
              if (subCategory) {
                subCategoryData = {
                  id: subCategory.id,
                  name: subCategory.name,
                  amount: 0,
                  percentage: 0,
                  previousYearAmount: 0,
                  percentageChange: 0
                };
                categoryData.subCategories?.push(subCategoryData);
              }
            }
            if (subCategoryData) {
              subCategoryData.amount += amount;
            }
          }
        }
      });

      // Traiter les transactions de l'année précédente (si comparaison activée)
      if (showComparison) {
        const previousYearSubCategoryMap = new Map<string, number>();
        
        previousYearTransactions.forEach(transaction => {
          const amount = transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount;
          
          // Accumuler pour les catégories
          const currentCategoryAmount = previousYearCategoryMap.get(transaction.category_id) || 0;
          previousYearCategoryMap.set(transaction.category_id, currentCategoryAmount + amount);
          
          // Accumuler pour les sous-catégories
          if (transaction.subcategory_id) {
            const currentSubCategoryAmount = previousYearSubCategoryMap.get(transaction.subcategory_id) || 0;
            previousYearSubCategoryMap.set(transaction.subcategory_id, currentSubCategoryAmount + amount);
          }
        });

        // Mettre à jour les données avec les montants de l'année précédente
        categoryMap.forEach((categoryData, categoryId) => {
          const previousAmount = previousYearCategoryMap.get(categoryId) || 0;
          categoryData.previousYearAmount = previousAmount;
          
          // Calculer le pourcentage de répartition de l'année précédente
          if (previousYearTotalAmount > 0) {
            categoryData.previousYearPercentage = (previousAmount / previousYearTotalAmount) * 100;
          } else {
            categoryData.previousYearPercentage = 0;
          }
          
          // Calculer le pourcentage de changement
          if (previousAmount > 0) {
            categoryData.percentageChange = ((categoryData.amount - previousAmount) / previousAmount) * 100;
          } else if (categoryData.amount > 0) {
            categoryData.percentageChange = 100; // Nouvelle catégorie
          }

          // Mettre à jour les sous-catégories
          categoryData.subCategories?.forEach(subCategory => {
            const previousSubAmount = previousYearSubCategoryMap.get(subCategory.id) || 0;
            subCategory.previousYearAmount = previousSubAmount;
            
            // Calculer le pourcentage de répartition de l'année précédente pour la sous-catégorie
            if (previousAmount > 0) {
              subCategory.previousYearPercentage = (previousSubAmount / previousAmount) * 100;
            } else {
              subCategory.previousYearPercentage = 0;
            }
            
            if (previousSubAmount > 0) {
              subCategory.percentageChange = ((subCategory.amount - previousSubAmount) / previousSubAmount) * 100;
            } else if (subCategory.amount > 0) {
              subCategory.percentageChange = 100;
            }
          });
        });
      }

      // Calculer les pourcentages et trier
      const result = Array.from(categoryMap.values())
        .map(category => ({
          ...category,
          percentage: (category.amount / totalAmount) * 100,
          subCategories: category.subCategories?.map(sub => ({
            ...sub,
            percentage: (sub.amount / category.amount) * 100
          })).sort((a, b) => b.amount - a.amount)
        }))
        .sort((a, b) => b.amount - a.amount);

      return result;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const formatPercentageChange = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPercentageChangeColor = (percentage: number, isExpense = false) => {
    if (isExpense) {
      return percentage > 0 ? 'text-red-500' : 'text-green-500';
    } else {
      return percentage >= 0 ? 'text-green-500' : 'text-red-500';
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const distribution = calculateDistribution();
  // Couleurs exactement identiques à MonthlyChart : revenus = #6366f1, dépenses = #8b5cf6
  const colorClass = type === 'expense' ? 'bg-violet-500' : 'bg-indigo-500';

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-lg flex flex-col h-[calc(100vh-200px)]">
      {/* Header avec tabs et switch alignés */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        {/* Onglets Dépenses/Revenus */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onTypeChange?.('expense')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              type === 'expense'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 cursor-pointer hover:text-gray-900'
            }`}
          >
            Dépenses
          </button>
          <button
            onClick={() => onTypeChange?.('income')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              type === 'income'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 cursor-pointer hover:text-gray-900'
            }`}
          >
            Revenus
          </button>
        </div>

        {/* Switch pour afficher les sous-catégories */}
        <div className="flex items-center space-x-2">
          <Switch
            id="show-subcategories"
            checked={showSubCategories}
            onCheckedChange={handleSubCategoriesToggle}
            className="data-[state=checked]:bg-blue-600"
          />
          <Label 
            htmlFor="show-subcategories" 
            className="text-sm text-gray-700 cursor-pointer"
          >
            Toutes les sous-catégories
          </Label>
        </div>
      </div>

      {/* Distribution - Zone scrollable */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="space-y-4 pr-2">
          {distribution.length > 0 ? (
            distribution.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Catégorie principale */}
                <div 
                  className={`flex items-center justify-between ${
                    !showSubCategories && category.subCategories && category.subCategories.length > 0 
                      ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors' 
                      : ''
                  }`}
                  onClick={() => {
                    if (!showSubCategories && category.subCategories && category.subCategories.length > 0) {
                      toggleCategory(category.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {!showSubCategories && category.subCategories && category.subCategories.length > 0 && (
                      <ChevronRight 
                        className={`w-4 h-4 transition-transform text-gray-400 ${
                          expandedCategories.has(category.id) ? 'rotate-90' : ''
                        }`} 
                      />
                    )}
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(category.amount)}
                        </div>
                        {showComparison && category.percentageChange !== undefined && (
                          <div className={`text-xs font-medium ${getPercentageChangeColor(category.percentageChange, type === 'expense')}`}>
                            {formatPercentageChange(category.percentageChange)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-500">
                          {formatPercentage(category.percentage)}
                        </div>
                        {showComparison && category.previousYearPercentage !== undefined && (
                          <div className="text-xs text-gray-400">
                            vs {formatPercentage(category.previousYearPercentage)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${colorClass} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>

                {/* Sous-catégories (seulement en mode catégories) */}
                {!showSubCategories && 
                 expandedCategories.has(category.id) && 
                 category.subCategories && 
                 category.subCategories.length > 0 && (
                  <div className="ml-6 space-y-3 pt-2">
                    {category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">
                            {subCategory.name}
                          </span>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm text-gray-700">
                                {formatAmount(subCategory.amount)}
                              </div>
                              {showComparison && subCategory.percentageChange !== undefined && (
                                <div className={`text-xs font-medium ${getPercentageChangeColor(subCategory.percentageChange, type === 'expense')}`}>
                                  {formatPercentageChange(subCategory.percentageChange)}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-500">
                                {formatPercentage(subCategory.percentage)}
                              </div>
                                                             {showComparison && subCategory.previousYearPercentage !== undefined && (
                                 <div className="text-xs text-gray-400">
                                   vs {formatPercentage(subCategory.previousYearPercentage)}
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className={`${colorClass} opacity-70 h-1.5 rounded-full transition-all duration-300`}
                            style={{ width: `${subCategory.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">
                Aucune {type === 'expense' ? 'dépense' : 'revenu'} pour {selectedYear}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 