import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchDataFromApi } from '@/utils/api';
import { useAuth } from './AuthContext';

interface DashboardData {
  customerBalance: number;
  stockValue: number;
  supplierBalance: number;
  activeItems: number;
  sellAmount: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    last6Months: number;
    currentSession: number;
  };
  receivedAmount: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    last6Months: number;
    currentSession: number;
  };
  purchaseAmount: {
    today: number;
    lastWeek: number;
    currentMonth: number;
    last6Months: number;
    currentSession: number;
  };
}

interface InventoryDashboardContextType {
  dashboard: DashboardData;
  loading: boolean;
  error: string | null;
  fetchInventoryDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
}

const defaultDashboard: DashboardData = {
  customerBalance: 0,
  stockValue: 0,
  supplierBalance: 0,
  activeItems: 0,
  sellAmount: {
    today: 0,
    lastWeek: 0,
    currentMonth: 0,
    last6Months: 0,
    currentSession: 0,
  },
  receivedAmount: {
    today: 0,
    lastWeek: 0,
    currentMonth: 0,
    last6Months: 0,
    currentSession: 0,
  },
  purchaseAmount: {
    today: 0,
    lastWeek: 0,
    currentMonth: 0,
    last6Months: 0,
    currentSession: 0,
  },
};

const extractSchoolId = (user: any): string | null => {
  if (!user) return null;

  const direct = user.schoolId || user.school_id || user.schoolID || user.school?.id || user.school?._id;
  if (direct) return String(direct);

  if (typeof user.school === 'string') return user.school;
  return null;
};

const normalizeDashboardData = (payload: any): DashboardData => ({
  ...defaultDashboard,
  ...(payload || {}),
  sellAmount: { ...defaultDashboard.sellAmount, ...(payload?.sellAmount || {}) },
  receivedAmount: { ...defaultDashboard.receivedAmount, ...(payload?.receivedAmount || {}) },
  purchaseAmount: { ...defaultDashboard.purchaseAmount, ...(payload?.purchaseAmount || {}) },
});

const InventoryDashboardContext = createContext<InventoryDashboardContextType | null>(null);

export const useInventoryDashboard = (): InventoryDashboardContextType => {
  const ctx = useContext(InventoryDashboardContext);
  if (!ctx) throw new Error('useInventoryDashboard must be used inside InventoryDashboardProvider');
  return ctx;
};

export const InventoryDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userData } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData>(defaultDashboard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInventoryDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get school ID from AuthContext userData
      console.log('📦 Inventory: userData from context:', userData ? 'Found' : 'Not found');

      if (!userData) {
        throw new Error('User data not found. Please login again.');
      }

      const schoolId = extractSchoolId(userData);
      console.log('📦 Inventory: schoolId extracted:', schoolId);

      if (!schoolId) {
        console.error('📦 Inventory: userData structure:', JSON.stringify(userData, null, 2));
        throw new Error('School ID not found. Please login again.');
      }

      console.log('📦 Inventory: Fetching dashboard for schoolId:', schoolId);
      const response = await fetchDataFromApi(`/inventory-dashboard/dashboard/${schoolId}`);
      console.log('📦 Inventory: Response success:', response?.success);

      if (response?.success && (response?.data || response)) {
        const nextData = normalizeDashboardData(response?.data ?? response);
        setDashboard(nextData);
      } else {
        throw new Error(response?.message || 'Failed to fetch inventory dashboard');
      }
    } catch (err: any) {
      console.error('📦 Inventory Error:', err);
      setError(err.message || 'Failed to fetch inventory dashboard');
      setDashboard(defaultDashboard);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  const refreshDashboard = useCallback(async () => {
    await fetchInventoryDashboard();
  }, [fetchInventoryDashboard]);

  const value: InventoryDashboardContextType = {
    dashboard,
    loading,
    error,
    fetchInventoryDashboard,
    refreshDashboard,
  };

  return (
    <InventoryDashboardContext.Provider value={value}>
      {children}
    </InventoryDashboardContext.Provider>
  );
};
