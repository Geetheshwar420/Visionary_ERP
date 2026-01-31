import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, insightsApi, dashboardApi, financialsApi } from '../services/api';
import { Product } from '../types';

export const useProducts = (params?: { page?: number; limit?: number; search?: string; category?: string; sort?: string }) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const result = await productsApi.getAll(params);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useProductsMutation = () => {
    const queryClient = useQueryClient();

    return {
        create: useMutation({
            mutationFn: (product: any) => productsApi.create(product),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
            },
        }),
        update: useMutation({
            mutationFn: ({ id, updates }: { id: string; updates: Partial<Product> }) => productsApi.update(id, updates),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
            },
        }),
        delete: useMutation({
            mutationFn: (id: string) => productsApi.delete(id),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['products'] });
                queryClient.invalidateQueries({ queryKey: ['dashboard', 'overview'] });
            },
        }),
    };
};

export const useInsights = (params?: { type?: string; limit?: number; relatedProductId?: string }) => {
    return useQuery({
        queryKey: ['insights', params],
        queryFn: async () => {
            const result = await insightsApi.getAll(params);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useDashboardOverview = () => {
    return useQuery({
        queryKey: ['dashboard', 'overview'],
        queryFn: async () => {
            const result = await dashboardApi.getOverview();
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useFinancialSummary = (period?: 'week' | 'month' | 'quarter') => {
    return useQuery({
        queryKey: ['financials', 'summary', period],
        queryFn: async () => {
            const result = await financialsApi.getSummary(period);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useForecast = (days?: number) => {
    return useQuery({
        queryKey: ['dashboard', 'forecast', days],
        queryFn: async () => {
            const result = await dashboardApi.getForecast(days);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useIncomeExpense = (months?: number) => {
    return useQuery({
        queryKey: ['financials', 'income-expense', months],
        queryFn: async () => {
            const result = await financialsApi.getIncomeExpense(months);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useExpenseBreakdown = (period?: 'month' | 'quarter') => {
    return useQuery({
        queryKey: ['financials', 'breakdown', period],
        queryFn: async () => {
            const result = await financialsApi.getExpenseBreakdown(period);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useTransactions = (params?: { page?: number; limit?: number; type?: string }) => {
    return useQuery({
        queryKey: ['financials', 'transactions', params],
        queryFn: async () => {
            const result = await financialsApi.getTransactions(params);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};
