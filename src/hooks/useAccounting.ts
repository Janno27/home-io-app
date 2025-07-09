import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/components/auth/AuthProvider';
import { useOrganizations } from './useOrganizations';

export interface Category {
  id: string;
  name: string;
  type: 'expense' | 'income';
  organization_id: string;
  created_at: string;
  updated_at: string;
  is_system?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  is_system?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  transaction_date: string;
  accounting_date: string;
  category_id: string;
  subcategory_id: string | null;
  user_id: string;
  organization_id: string;
  is_personal: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionWithDetails extends Transaction {
  category_name: string;
  category_type: 'expense' | 'income';
  subcategory_name: string | null;
  user_name: string | null;
  user_email: string;
  total_refunded: number;
  net_amount: number;
}

export interface CreateTransactionData {
  amount: number;
  description?: string;
  transaction_date: string;
  accounting_date: string;
  category_id: string;
  subcategory_id?: string;
  is_personal?: boolean;
}

export interface UpdateTransactionData {
  amount?: number;
  description?: string;
  transaction_date?: string;
  accounting_date?: string;
  category_id?: string;
  subcategory_id?: string;
  is_personal?: boolean;
}

export interface CreateRefundData {
  transaction_id: string;
  amount: number;
  refund_date: string;
  description?: string;
}

export interface Refund {
  id: string;
  transaction_id: string;
  amount: number;
  refund_date: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
}

export type TransactionFilter = 'all' | 'common' | 'personal';

export function useAccounting() {
  const { user } = useAuthContext();
  const { currentOrganization } = useOrganizations();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>(() => {
    // Récupérer le filtre depuis localStorage au démarrage
    const savedFilter = localStorage.getItem('accounting-filter');
    return (savedFilter as TransactionFilter) || 'all';
  });

  // Charger les catégories
  const fetchCategories = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('type', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // Charger les sous-catégories
  const fetchSubCategories = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('sub_categories')
        .select(`
          *,
          categories!inner(organization_id)
        `)
        .eq('categories.organization_id', currentOrganization.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setSubCategories(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sous-catégories:', error);
    }
  };

  // Charger les transactions avec filtrage
  const fetchTransactions = async (filter: TransactionFilter = 'all') => {
    if (!currentOrganization || !user) return;

    try {
      // Utiliser la fonction PostgreSQL que nous avons créée
      const { data, error } = await supabase
        .rpc('get_organization_transactions', {
          org_id: currentOrganization.id,
          filter_type: filter,
          current_user_id: user.id
        });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
    }
  };

  // Charger les remboursements
  const fetchRefunds = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .in('transaction_id', transactions.map(t => t.id));

      if (error) throw error;
      
      const refundsWithUserInfo = (data || []).map(refund => ({
        ...refund,
        user_name: refund.profiles?.full_name,
        user_email: refund.profiles?.email,
      }));
      
      setRefunds(refundsWithUserInfo);
    } catch (error) {
      console.error('Erreur lors du chargement des remboursements:', error);
    }
  };

  // Créer une transaction
  const createTransaction = async (transactionData: CreateTransactionData) => {
    if (!user || !currentOrganization) {
      throw new Error('Utilisateur ou organisation non disponible');
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          is_personal: transactionData.is_personal || false,
          user_id: user.id,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Recharger les transactions avec le filtre actuel
      await fetchTransactions(transactionFilter);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Mettre à jour une transaction
  const updateTransaction = async (transactionId: string, updateData: UpdateTransactionData) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchTransactions(transactionFilter);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Créer un remboursement
  const createRefund = async (refundData: CreateRefundData) => {
    if (!user) {
      throw new Error('Utilisateur non disponible');
    }

    try {
      const { data, error } = await supabase
        .from('refunds')
        .insert({
          ...refundData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Recharger les transactions avec le filtre actuel
      await fetchTransactions(transactionFilter);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Obtenir les remboursements pour une transaction
  const getRefundsForTransaction = (transactionId: string) => {
    return refunds.filter(refund => refund.transaction_id === transactionId);
  };

  // Changer le filtre et recharger les transactions
  const setFilter = async (filter: TransactionFilter) => {
    setTransactionFilter(filter);
    localStorage.setItem('accounting-filter', filter);
    setLoading(true);
    await fetchTransactions(filter);
    setLoading(false);
    // Propager l'événement aux autres composants utilisant le hook
    window.dispatchEvent(new CustomEvent('accounting-filter-changed', { detail: filter }));
  };

  // Écouter les changements de filtre provenant d'autres instances
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<TransactionFilter>;
      const newFilter = customEvent.detail;
      if (newFilter && newFilter !== transactionFilter) {
        setTransactionFilter(newFilter);
        fetchTransactions(newFilter);
      }
    };
    window.addEventListener('accounting-filter-changed', handler);
    return () => window.removeEventListener('accounting-filter-changed', handler);
  }, [transactionFilter, currentOrganization, user]);

  // Recharger les données
  const refetch = async () => {
    if (!currentOrganization) return;
    
    setLoading(true);
    await Promise.all([
      fetchCategories(),
      fetchSubCategories(),
      fetchTransactions(transactionFilter),
    ]);
    setLoading(false);
  };

  // Créer une catégorie
  const createCategory = async (name: string, type: 'expense' | 'income') => {
    if (!currentOrganization) {
      throw new Error('Organisation non disponible');
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          type,
          organization_id: currentOrganization.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchCategories();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Créer une sous-catégorie
  const createSubCategory = async (name: string, categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('sub_categories')
        .insert({
          name,
          category_id: categoryId,
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchSubCategories();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Mettre à jour une catégorie
  const updateCategory = async (categoryId: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({ name })
        .eq('id', categoryId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchCategories();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Mettre à jour une sous-catégorie
  const updateSubCategory = async (subCategoryId: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('sub_categories')
        .update({ name })
        .eq('id', subCategoryId)
        .select()
        .single();

      if (error) throw error;
      
      await fetchSubCategories();
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Supprimer une transaction
  const deleteTransaction = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      
      await fetchTransactions(transactionFilter);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  // Charger les données quand l'organisation change
  useEffect(() => {
    if (currentOrganization) {
      setLoading(true);
      Promise.all([
        fetchCategories(),
        fetchSubCategories(),
        fetchTransactions(transactionFilter),
      ]).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [currentOrganization]);

  // Charger les remboursements quand les transactions changent
  useEffect(() => {
    if (transactions.length > 0) {
      fetchRefunds();
    }
  }, [transactions]);

  // Catégories filtrées
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  // Obtenir les sous-catégories pour une catégorie
  const getSubCategoriesForCategory = (categoryId: string) => {
    return subCategories.filter(sub => sub.category_id === categoryId);
  };

  // Obtenir les statistiques du filtrage
  const getFilterStats = () => {
    const allTransactions = transactions;
    const personalTransactions = allTransactions.filter(t => t.is_personal);
    const commonTransactions = allTransactions.filter(t => !t.is_personal);
    
    return {
      all: allTransactions.length,
      personal: personalTransactions.length,
      common: commonTransactions.length,
    };
  };

  return {
    categories,
    subCategories,
    transactions,
    refunds,
    loading,
    transactionFilter,
    expenseCategories,
    incomeCategories,
    getSubCategoriesForCategory,
    getRefundsForTransaction,
    createTransaction,
    updateTransaction,
    createRefund,
    createCategory,
    createSubCategory,
    updateCategory,
    updateSubCategory,
    deleteTransaction,
    setFilter,
    refetch,
    getFilterStats,
  };
}