import { useState } from 'react';
import { ChevronLeft, Plus, FolderPlus, ChevronDown, ChevronRight, Edit3 } from 'lucide-react';
import { useAccounting } from '@/hooks/useAccounting';
import { CategoryForm } from './CategoryForm';
import { SubCategoryForm } from './SubCategoryForm';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  is_system?: boolean;
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  is_system?: boolean;
}

interface AccountingViewProps {
  onBack: () => void;
}

type FormType = 'category' | 'subcategory' | null;

export function AccountingView({ onBack }: AccountingViewProps) {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [currentForm, setCurrentForm] = useState<FormType>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null);
  
  const { categories, subCategories, createCategory, createSubCategory, updateCategory, updateSubCategory } = useAccounting();

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const systemCategories = categories.filter(cat => 
    cat.type === activeTab && cat.is_system
  );

  const userCategories = categories.filter(cat => 
    cat.type === activeTab && cat.is_system !== true
  );

  const getSubCategories = (categoryId: string) => {
    return subCategories.filter(sub => 
      sub.category_id === categoryId && sub.is_system
    );
  };

  const getUserSubCategories = (categoryId: string) => {
    return subCategories.filter(sub => 
      sub.category_id === categoryId && !sub.is_system
    );
  };

  const handleCreateCategory = async (name: string) => {
    try {
      if (editingCategory) {
        // Mode édition
        const { error } = await updateCategory(editingCategory.id, name);
        if (error) throw error;
        toast.success('Catégorie modifiée avec succès');
      } else {
        // Mode création
        const { error } = await createCategory(name, activeTab);
        if (error) throw error;
        toast.success('Catégorie créée avec succès');
      }
      
      setCurrentForm(null);
      setEditingCategory(null);
    } catch (error) {
      toast.error(editingCategory ? 'Erreur lors de la modification de la catégorie' : 'Erreur lors de la création de la catégorie');
      throw error;
    }
  };

  const handleCreateSubCategory = async (name: string, categoryId: string) => {
    try {
      if (editingSubCategory) {
        // Mode édition
        const { error } = await updateSubCategory(editingSubCategory.id, name);
        if (error) throw error;
        toast.success('Sous-catégorie modifiée avec succès');
      } else {
        // Mode création
        const { error } = await createSubCategory(name, categoryId);
        if (error) throw error;
        toast.success('Sous-catégorie créée avec succès');
      }
      
      setCurrentForm(null);
      setEditingSubCategory(null);
    } catch (error) {
      toast.error(editingSubCategory ? 'Erreur lors de la modification de la sous-catégorie' : 'Erreur lors de la création de la sous-catégorie');
      throw error;
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCurrentForm('category');
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory);
    setCurrentForm('subcategory');
  };

  const closeForm = () => {
    setCurrentForm(null);
    setEditingCategory(null);
    setEditingSubCategory(null);
  };

  const openCreateCategoryForm = () => {
    setEditingCategory(null);
    setEditingSubCategory(null);
    setCurrentForm('category');
  };

  const openCreateSubCategoryForm = () => {
    setEditingCategory(null);
    setEditingSubCategory(null);
    setCurrentForm('subcategory');
  };

  // Afficher le formulaire de catégorie
  if (currentForm === 'category') {
    return (
      <div className="flex flex-col max-h-[70vh]">
        <CategoryForm
          type={activeTab}
          category={editingCategory || undefined}
          onSubmit={handleCreateCategory}
          onCancel={closeForm}
        />
      </div>
    );
  }

  // Afficher le formulaire de sous-catégorie
  if (currentForm === 'subcategory') {
    return (
      <div className="flex flex-col max-h-[70vh]">
        <SubCategoryForm
          type={activeTab}
          categories={categories}
          subCategory={editingSubCategory || undefined}
          onSubmit={handleCreateSubCategory}
          onCancel={closeForm}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[70vh]">
      {/* Header fixe */}
      <div className="px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          <span>Retour</span>
        </button>
      </div>
      
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-auto">
        <div className="px-3 py-3">
          {/* Header avec tabs discrets et CTAs animés */}
          <div className="flex items-center justify-between mb-4">
            {/* Tabs discrets style DistributionChart */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'expense'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 cursor-pointer hover:text-gray-900'
                }`}
              >
                Dépenses
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === 'income'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 cursor-pointer hover:text-gray-900'
                }`}
              >
                Revenus
              </button>
            </div>
            
            {/* CTAs avec animation de tooltip */}
            <div className="flex items-center space-x-1">
              {/* CTA Sous-catégorie */}
              <div className="relative group">
                <button 
                  onClick={openCreateSubCategoryForm}
                  className="text-xs text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50 transition-all duration-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
                  Sous-catégorie
                </div>
              </div>
              
              {/* CTA Catégorie */}
              <div className="relative group">
                <button 
                  onClick={openCreateCategoryForm}
                  className="text-xs text-gray-400 hover:text-gray-600 p-1.5 rounded hover:bg-gray-50 transition-all duration-200"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap">
                  Catégorie
                </div>
              </div>
            </div>
          </div>

          {/* Section Catégories système */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-900 mb-3">Catégories système</h3>
            
            <div className="space-y-3">
              {systemCategories.map((category) => {
                const categorySubCategories = getSubCategories(category.id);
                const isExpanded = expandedCategories.has(category.id);
                const hasSubCategories = categorySubCategories.length > 0;
                
                return (
                  <div key={category.id}>
                    <button
                      onClick={() => hasSubCategories && toggleCategory(category.id)}
                      className={`w-full flex items-center justify-between px-2 py-2 text-left text-xs transition-colors rounded-md ${
                        hasSubCategories 
                          ? 'hover:bg-gray-50 cursor-pointer' 
                          : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {hasSubCategories ? (
                          isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                          )
                        ) : (
                          <div className="w-3 h-3" />
                        )}
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                      {hasSubCategories && (
                        <span className="text-xs text-gray-500">
                          {categorySubCategories.length}
                        </span>
                      )}
                    </button>
                    
                    {isExpanded && hasSubCategories && (
                      <div className="mt-2 ml-6 space-y-1">
                        {categorySubCategories.map((subCategory) => (
                          <div
                            key={subCategory.id}
                            className="text-xs text-gray-700 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            {subCategory.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {systemCategories.length === 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500">
                  Aucune catégorie système pour {activeTab === 'expense' ? 'les dépenses' : 'les revenus'}
                </p>
              </div>
            )}
          </div>

          {/* Section Catégories personnalisées */}
          {userCategories.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-900 mb-3">Mes catégories</h3>
              
              <div className="space-y-3">
                {userCategories.map((category) => {
                  const categorySubCategories = getUserSubCategories(category.id);
                  const isExpanded = expandedCategories.has(category.id);
                  const hasSubCategories = categorySubCategories.length > 0;
                  
                  return (
                    <div key={category.id}>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => hasSubCategories && toggleCategory(category.id)}
                          className={`flex-1 flex items-center justify-between px-2 py-2 text-left text-xs transition-colors rounded-md ${
                            hasSubCategories 
                              ? 'hover:bg-gray-50 cursor-pointer' 
                              : 'cursor-default'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {hasSubCategories ? (
                              isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-400" />
                              )
                            ) : (
                              <div className="w-3 h-3" />
                            )}
                            <span className="font-medium text-gray-900">
                              {category.name}
                            </span>
                          </div>
                          {hasSubCategories && (
                            <span className="text-xs text-gray-500">
                              {categorySubCategories.length}
                            </span>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {isExpanded && hasSubCategories && (
                        <div className="mt-2 ml-6 space-y-1">
                          {categorySubCategories.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="flex items-center justify-between text-xs text-gray-700 py-1.5 px-2 rounded hover:bg-gray-50 transition-colors group"
                            >
                              <span>{subCategory.name}</span>
                              <button
                                onClick={() => handleEditSubCategory(subCategory)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 