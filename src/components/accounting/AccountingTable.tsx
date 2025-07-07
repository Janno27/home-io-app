import { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight as ChevronRightIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchBar } from '@/components/ui/SearchBar';
import { useAccounting } from '@/hooks/useAccounting';

interface CategoryData {
  id: string;
  name: string;
  type: 'expense' | 'income';
  yearTotal: number;
  monthlyTotals: number[];
  subCategories: SubCategoryData[];
  isExpanded: boolean;
}

interface SubCategoryData {
  id: string;
  name: string;
  yearTotal: number;
  monthlyTotals: number[];
}

export function AccountingTable() {
  const { transactions, categories, subCategories } = useAccounting();
  const [selectedYear] = useState(new Date().getFullYear());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([new Date().getFullYear()]));
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  
  // États pour les comparaisons
  const [comparisonMode, setComparisonMode] = useState<'previous' | 'average'>('previous');
  const [selectedMonthsForAverage, setSelectedMonthsForAverage] = useState<Set<number>>(
    new Set([0, 1, 2, 3, 4, 5]) // Janvier à Juin par défaut
  );
  const [searchQuery, setSearchQuery] = useState('');

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Calculer les données par catégorie pour une année donnée
  const calculateCategoryDataForYear = (type: 'expense' | 'income', year: number): CategoryData[] => {
    // Filtrer les transactions pour l'année donnée
    const yearTransactions = transactions.filter(transaction => 
      new Date(transaction.accounting_date).getFullYear() === year
    );
    const categoryMap = new Map<string, CategoryData>();

    // Initialiser toutes les catégories du type demandé
    categories.filter(cat => cat.type === type).forEach(category => {
      categoryMap.set(category.id, {
        id: category.id,
        name: category.name,
        type: category.type,
        yearTotal: 0,
        monthlyTotals: new Array(12).fill(0),
        subCategories: [],
        isExpanded: expandedCategories.has(category.id),
      });
    });

    // Debug: Afficher les transactions filtrées
    console.log(`Transactions pour ${type} en ${selectedYear}:`, yearTransactions.filter(t => t.category_type === type));

    // Calculer les totaux par transaction
    yearTransactions.filter(t => t.category_type === type).forEach(transaction => {
      const categoryData = categoryMap.get(transaction.category_id);
      if (!categoryData) return;

      // Utiliser net_amount si disponible, sinon utiliser amount
      const amount = transaction.net_amount !== undefined ? transaction.net_amount : transaction.amount;
      const month = new Date(transaction.accounting_date).getMonth();

      categoryData.yearTotal += amount;
      categoryData.monthlyTotals[month] += amount;

      // Gérer les sous-catégories
      if (transaction.subcategory_id) {
        let subCategoryData = categoryData.subCategories.find(sub => sub.id === transaction.subcategory_id);
        if (!subCategoryData) {
          const subCategory = subCategories.find(sub => sub.id === transaction.subcategory_id);
          if (subCategory) {
            subCategoryData = {
              id: subCategory.id,
              name: subCategory.name,
              yearTotal: 0,
              monthlyTotals: new Array(12).fill(0),
            };
            categoryData.subCategories.push(subCategoryData);
          }
        }
        if (subCategoryData) {
          subCategoryData.yearTotal += amount;
          subCategoryData.monthlyTotals[month] += amount;
        }
      }
    });

    // Filtrer les résultats par recherche et par montant
    const result = Array.from(categoryMap.values()).filter(cat => {
      if (cat.yearTotal === 0) return false;
      
      if (!searchQuery) return true;
      
      // Vérifier si la catégorie correspond à la recherche
      const categoryMatches = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Vérifier si une sous-catégorie correspond à la recherche
      const subCategoryMatches = cat.subCategories.some(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return categoryMatches || subCategoryMatches;
    });
    
    // Filtrer les sous-catégories de chaque catégorie selon la recherche
    result.forEach(category => {
      if (searchQuery) {
        category.subCategories = category.subCategories.filter(sub =>
          sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    });
    
    console.log(`Résultat pour ${type} en ${year}:`, result);
    return result;
  };

  // Fonction wrapper pour l'année sélectionnée (pour compatibilité)
  const calculateCategoryData = (type: 'expense' | 'income'): CategoryData[] => {
    return calculateCategoryDataForYear(type, selectedYear);
  };

  const formatAmount = (amount: number) => {
    if (amount === 0) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  // Calculer la comparaison pour un montant donné
  const calculateComparison = (currentAmount: number, monthIndex: number) => {
    if (comparisonMode === 'previous') {
      // Comparaison au mois précédent
      const previousMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
      const categoryData = calculateCategoryData(activeTab);
      const previousAmount = categoryData.reduce((sum, cat) => sum + cat.monthlyTotals[previousMonthIndex], 0);
      
      if (previousAmount === 0) {
        return currentAmount > 0 ? { percentage: 100, absoluteDiff: currentAmount } : { percentage: 0, absoluteDiff: 0 };
      }
      
      const percentage = ((currentAmount - previousAmount) / Math.abs(previousAmount)) * 100;
      const absoluteDiff = currentAmount - previousAmount;
      return { percentage, absoluteDiff };
    } else {
      // Comparaison à la moyenne des mois sélectionnés
      const categoryData = calculateCategoryData(activeTab);
      const selectedMonthsArray = Array.from(selectedMonthsForAverage);
      const averageAmount = selectedMonthsArray.length > 0 
        ? selectedMonthsArray.reduce((sum, monthIdx) => {
            return sum + categoryData.reduce((catSum, cat) => catSum + cat.monthlyTotals[monthIdx], 0);
          }, 0) / selectedMonthsArray.length
        : 0;
      
      if (averageAmount === 0) {
        return currentAmount > 0 ? { percentage: 100, absoluteDiff: currentAmount } : { percentage: 0, absoluteDiff: 0 };
      }
      
      const percentage = ((currentAmount - averageAmount) / Math.abs(averageAmount)) * 100;
      const absoluteDiff = currentAmount - averageAmount;
      return { percentage, absoluteDiff };
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

  const toggleYear = (year: number) => {
    const newExpandedYears = new Set(expandedYears);
    if (newExpandedYears.has(year)) {
      newExpandedYears.delete(year);
    } else {
      // Fermer les autres années et ouvrir celle-ci
      newExpandedYears.clear();
      newExpandedYears.add(year);
    }
    setExpandedYears(newExpandedYears);
  };

  const isYearExpanded = (year: number) => expandedYears.has(year);

  const toggleMonthForAverage = (monthIndex: number) => {
    const newSelected = new Set(selectedMonthsForAverage);
    if (newSelected.has(monthIndex)) {
      newSelected.delete(monthIndex);
    } else {
      newSelected.add(monthIndex);
    }
    setSelectedMonthsForAverage(newSelected);
  };

  // Fonction pour rendre la ligne Total
  const renderTotalRow = (type: 'expense' | 'income') => {
    calculateCategoryData(type);
    // Couleurs cohérentes avec DistributionChart et MonthlyChart
    const colorClass = type === 'expense' ? 'text-violet-600' : 'text-indigo-600';
    const bgClass = type === 'expense' ? 'bg-violet-50/50' : 'bg-indigo-50/50';
    
         return (
       <div className={`flex ${bgClass} border-t-2 border-gray-300 font-medium min-w-max rounded-b-xl`}>
                 {/* Colonne Catégorie - Sticky */}
         <div className="w-48 px-4 py-3 border-r border-gray-200/30 bg-white/30 sticky left-0 z-40 border-l border-l-white/30 rounded-bl-xl">
          <span className={`text-sm ${type === 'expense' ? 'text-violet-800' : 'text-indigo-800'}`}>
            Total {type === 'expense' ? 'Dépenses' : 'Revenus'}
          </span>
        </div>
        
        {/* Toutes les années - Scrollables */}
        {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
          const isActiveYear = isYearExpanded(year);
          const yearCategoryData = calculateCategoryDataForYear(type, year);
          const yearTotal = yearCategoryData.reduce((sum, cat) => sum + cat.yearTotal, 0);
          
          const yearBgClass = isActiveYear ? `${type === 'expense' ? 'bg-violet-50' : 'bg-indigo-50'}` : 'bg-gray-50';
          const borderClass = isActiveYear ? `${type === 'expense' ? 'border-l-violet-50' : 'border-l-indigo-50'}` : 'border-l-gray-50';
          const textClass = isActiveYear ? `font-semibold ${type === 'expense' ? 'text-violet-700' : 'text-indigo-700'}` : 'text-gray-600';
          
          return (
            <div key={year} className={`w-32 px-4 py-3 text-sm ${textClass} border-r border-gray-200/30 text-center ${yearBgClass} flex items-center justify-center border-l ${borderClass}`}>
              {formatAmount(yearTotal)}
            </div>
          );
        })}
        
        {/* Mois pour toutes les années étendues - Scrollables */}
        {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
          if (!isYearExpanded(year)) return null;
          
          const yearCategoryData = calculateCategoryDataForYear(type, year);
          
          return new Array(12).fill(0).map((_, index) => {
            const monthTotal = yearCategoryData.reduce((sum, cat) => sum + cat.monthlyTotals[index], 0);
            const comparison = year === selectedYear ? calculateComparison(monthTotal, index) : { percentage: 0, absoluteDiff: 0 };
            return (
              <div key={`${year}-${index}`} className="w-36 px-2 py-3 border-r border-gray-200/30 flex items-center justify-between">
                <div className={`text-sm ${colorClass} flex-1`}>
                  {formatAmount(monthTotal)}
                </div>
                {monthTotal > 0 && year === selectedYear && (
                  <div className="flex flex-col items-end justify-center text-right ml-2">
                    <span className={`text-[10px] font-medium ${getPercentageColor(comparison.percentage)}`}>
                      {formatPercentage(comparison.percentage)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      ({comparison.absoluteDiff >= 0 ? '+' : ''}{formatAmount(comparison.absoluteDiff)})
                    </span>
                  </div>
                )}
              </div>
            );
          });
                 }).flat().filter(Boolean)}
       </div>
     );
  };

  const renderCategoryTable = (type: 'expense' | 'income') => {
    const categoryData = calculateCategoryData(type);
    // Couleurs cohérentes avec DistributionChart et MonthlyChart
    const colorClass = type === 'expense' ? 'text-violet-600' : 'text-indigo-600';

    return (
      <div className="min-w-max relative">
        {/* En-têtes du tableau */}
        <div className="bg-gray-50 border-b border-gray-200/60 sticky top-0 z-40 flex">
          {/* Colonne Catégorie - Sticky */}
          <div className="w-48 px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200/40 flex items-center bg-gray-50 sticky left-0 z-50 border-l border-l-gray-50">
            Catégorie
          </div>
          
          {/* Toutes les années - Scrollables */}
          {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
            const isActiveYear = isYearExpanded(year);
            const bgClass = isActiveYear ? `${type === 'expense' ? 'bg-violet-50' : 'bg-indigo-50'}` : 'bg-gray-50';
            const textClass = isActiveYear ? 'text-gray-800' : 'text-gray-500';
            const borderClass = isActiveYear ? `${type === 'expense' ? 'border-l-violet-50' : 'border-l-indigo-50'}` : 'border-l-gray-50';
            
            return (
              <div key={year} className={`w-32 px-4 py-3 text-xs font-medium uppercase tracking-wide border-r border-gray-200/40 text-center ${bgClass} border-l ${borderClass}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleYear(year)}
                  className={`flex items-center space-x-1 text-xs font-medium uppercase tracking-wide hover:bg-gray-100/50 p-1 h-auto ${textClass}`}
                >
                  <span>{year}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isYearExpanded(year) ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            );
          })}
          
          {/* Mois - Scrollables (affichés pour toutes les années étendues) */}
          {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
            if (!isYearExpanded(year)) return null;
            
            return months.map((month) => (
              <div key={`${year}-${month}`} className="w-36 px-2 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide border-r border-gray-200/40 text-center bg-gray-50">
                {month.slice(0, 3)}
              </div>
            ));
          }).flat().filter(Boolean)}
        </div>

        {/* Corps du tableau */}
        <div>
          {categoryData.length > 0 ? (
            <div>
              {categoryData.map((category) => (
                <div key={category.id}>
                  {/* Ligne de catégorie */}
                  <div className="flex hover:bg-white/20 transition-colors border-b border-gray-200/30">
                    {/* Colonne Catégorie - Sticky */}
                    <div className="w-48 px-4 py-3 border-r border-gray-200/30 flex items-center bg-white sticky left-0 z-10 border-l border-l-white">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center space-x-2 text-sm text-gray-800 hover:bg-gray-100/50 p-1 h-auto"
                      >
                        <ChevronRightIcon className={`w-3 h-3 transition-transform ${category.isExpanded ? 'rotate-90' : ''}`} />
                        <span className="truncate">{category.name}</span>
                      </Button>
                    </div>
                    
                    {/* Toutes les années - Scrollables */}
                    {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
                      const isActiveYear = isYearExpanded(year);
                      const yearCategoryData = calculateCategoryDataForYear(type, year);
                      const categoryYearData = yearCategoryData.find(cat => cat.id === category.id);
                      const yearTotal = categoryYearData?.yearTotal || 0;
                      
                      const bgClass = isActiveYear ? `${type === 'expense' ? 'bg-violet-50' : 'bg-indigo-50'}` : 'bg-white';
                      const borderClass = isActiveYear ? `${type === 'expense' ? 'border-l-violet-50' : 'border-l-indigo-50'}` : 'border-l-white';
                      const textClass = isActiveYear ? `font-medium ${colorClass}` : 'text-gray-600';
                      
                      return (
                        <div key={year} className={`w-32 px-4 py-3 text-sm ${textClass} border-r border-gray-200/30 text-center ${bgClass} flex items-center justify-center border-l ${borderClass}`}>
                          {formatAmount(yearTotal)}
                        </div>
                      );
                    })}
                    
                    {/* Mois pour toutes les années étendues - Scrollables */}
                    {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
                      if (!isYearExpanded(year)) return null;
                      
                      const yearCategoryData = calculateCategoryDataForYear(type, year);
                      const categoryYearData = yearCategoryData.find(cat => cat.id === category.id);
                      const monthlyTotals = categoryYearData?.monthlyTotals || new Array(12).fill(0);
                      
                      return monthlyTotals.map((amount, index) => {
                        const comparison = year === selectedYear ? calculateComparison(amount, index) : { percentage: 0, absoluteDiff: 0 };
                        return (
                          <div key={`${year}-${index}`} className="w-36 px-2 py-3 border-r border-gray-200/30 flex items-center justify-between">
                            <div className="text-sm text-gray-600 flex-1">
                              {formatAmount(amount)}
                            </div>
                            {amount > 0 && year === selectedYear && (
                              <div className="flex flex-col items-end justify-center text-right ml-2">
                                <span className={`text-[10px] font-medium ${getPercentageColor(comparison.percentage)}`}>
                                  {formatPercentage(comparison.percentage)}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  ({comparison.absoluteDiff >= 0 ? '+' : ''}{formatAmount(comparison.absoluteDiff)})
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      });
                    }).flat().filter(Boolean)}
                  </div>

                  {/* Sous-catégories */}
                  {category.isExpanded && category.subCategories.map((subCategory) => (
                    <div key={subCategory.id} className="flex hover:bg-white/10 transition-colors border-b border-gray-200/20">
                      {/* Colonne Catégorie - Sticky */}
                      <div className="w-48 px-8 py-2 border-r border-gray-200/30 flex items-center bg-white sticky left-0 z-10 border-l border-l-white">
                        <span className="text-sm text-gray-600 truncate">{subCategory.name}</span>
                      </div>
                      
                      {/* Toutes les années - Scrollables */}
                      {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
                        const isActiveYear = isYearExpanded(year);
                        const yearCategoryData = calculateCategoryDataForYear(type, year);
                        const categoryYearData = yearCategoryData.find(cat => cat.id === category.id);
                        const subCategoryYearData = categoryYearData?.subCategories.find(sub => sub.id === subCategory.id);
                        const yearTotal = subCategoryYearData?.yearTotal || 0;
                        
                        const bgClass = isActiveYear ? `${type === 'expense' ? 'bg-violet-50' : 'bg-indigo-50'}` : 'bg-white';
                        const borderClass = isActiveYear ? `${type === 'expense' ? 'border-l-violet-50' : 'border-l-indigo-50'}` : 'border-l-white';
                        const textClass = isActiveYear ? colorClass : 'text-gray-500';
                        
                        return (
                          <div key={year} className={`w-32 px-4 py-2 text-sm ${textClass} border-r border-gray-200/30 text-center ${bgClass} flex items-center justify-center border-l ${borderClass}`}>
                            {formatAmount(yearTotal)}
                          </div>
                        );
                      })}
                      
                      {/* Mois pour toutes les années étendues - Scrollables */}
                      {[selectedYear, selectedYear - 1, selectedYear - 2].map((year) => {
                        if (!isYearExpanded(year)) return null;
                        
                        const yearCategoryData = calculateCategoryDataForYear(type, year);
                        const categoryYearData = yearCategoryData.find(cat => cat.id === category.id);
                        const subCategoryYearData = categoryYearData?.subCategories.find(sub => sub.id === subCategory.id);
                        const monthlyTotals = subCategoryYearData?.monthlyTotals || new Array(12).fill(0);
                        
                        return monthlyTotals.map((amount, index) => {
                          const comparison = year === selectedYear ? calculateComparison(amount, index) : { percentage: 0, absoluteDiff: 0 };
                          return (
                            <div key={`${year}-${index}`} className="w-36 px-2 py-2 border-r border-gray-200/30 flex items-center justify-between">
                              <div className="text-sm text-gray-500 flex-1">
                                {formatAmount(amount)}
                              </div>
                              {amount > 0 && year === selectedYear && (
                                <div className="flex flex-col items-end justify-center text-right ml-2">
                                  <span className={`text-[10px] font-medium ${getPercentageColor(comparison.percentage)}`}>
                                    {formatPercentage(comparison.percentage)}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    ({comparison.absoluteDiff >= 0 ? '+' : ''}{formatAmount(comparison.absoluteDiff)})
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        });
                      }).flat().filter(Boolean)}
                    </div>
                  ))}
                </div>
              ))}


            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Aucune {type === 'expense' ? 'dépense' : 'revenu'} pour {selectedYear}
              </h3>
              <p className="text-sm text-gray-500">
                Sélectionnez une autre année ou ajoutez vos premières transactions
              </p>
            </div>
          )}
        </div>
        

      </div>
    );
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in-0 zoom-in-95 duration-300">
      {/* Carte principale avec hauteur fixe */}
      <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg mt-6 h-[calc(100vh-220px)] flex flex-col">
        
        {/* Header fixe - ne bouge jamais */}
        <div className="p-6 border-b border-white/30 bg-white/40 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Onglets Dépenses/Revenus */}
            <div className="flex rounded-lg p-1">
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'expense'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 cursor-pointer hover:text-gray-900'
                }`}
              >
                Dépenses
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'income'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 cursor-pointer hover:text-gray-900'
                }`}
              >
                Revenus
              </button>
            </div>
            
            {/* Contrôles de droite */}
            <div className="flex items-center space-x-6">
              {/* Switch de mode de comparaison */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="comparison-mode"
                    checked={comparisonMode === 'average'}
                    onCheckedChange={(checked) => setComparisonMode(checked ? 'average' : 'previous')}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor="comparison-mode" className="text-sm text-gray-700 cursor-pointer">
                    Moyenne
                  </Label>
                </div>

                {/* Sélecteur de mois pour la moyenne */}
                {comparisonMode === 'average' && (
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
                          <h4 className="font-medium text-sm text-gray-900">Configuration de la moyenne</h4>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-xs text-gray-600">Sélectionnez les mois à inclure dans le calcul :</p>
                          <div className="grid grid-cols-2 gap-2">
                            {months.map((month, index) => (
                              <div key={index} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50/50 transition-colors">
                                <Checkbox
                                  id={`month-${index}`}
                                  checked={selectedMonthsForAverage.has(index)}
                                  onCheckedChange={() => toggleMonthForAverage(index)}
                                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label 
                                  htmlFor={`month-${index}`} 
                                  className="text-sm text-gray-700 cursor-pointer font-normal"
                                >
                                  {month}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            {selectedMonthsForAverage.size} mois sélectionné{selectedMonthsForAverage.size > 1 ? 's' : ''}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                // Sélectionner tous les mois
                                const allMonths = new Set(Array.from({length: 12}, (_, i) => i));
                                setSelectedMonthsForAverage(allMonths);
                              }}
                              className="text-xs h-7 px-2 text-gray-600 hover:text-gray-800"
                            >
                              Tout
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedMonthsForAverage(new Set())}
                              className="text-xs h-7 px-2 text-gray-600 hover:text-gray-800"
                            >
                              Aucun
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Barre de recherche */}
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Rechercher une catégorie..."
                className="ml-4"
              />
            </div>
          </div>
        </div>

        {/* Zone de contenu scrollable */}
        <div className="flex-1 overflow-hidden relative">
          <div 
            className="h-full overflow-auto scrollbar-hide"
            onScroll={(e) => {
              const target = e.target as HTMLElement;
              const totalRow = target.parentElement?.parentElement?.querySelector('.total-row-container') as HTMLElement;
              if (totalRow) {
                totalRow.scrollLeft = target.scrollLeft;
              }
            }}
          >
            {renderCategoryTable(activeTab)}
          </div>
        </div>

        {/* Ligne Total toujours en bas de la carte */}
        <div className="flex-shrink-0 overflow-hidden rounded-b-xl">
          <div className="overflow-x-auto scrollbar-hide total-row-container">
            {renderTotalRow(activeTab)}
          </div>
        </div>
      </div>
    </div>
  );
}