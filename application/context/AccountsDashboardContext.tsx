import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchDataFromApi } from '@/utils/api';

interface CollectionSummary {
  quarterlyCollection: number;
  yearlyCollection: number;
  pendingFees: number;
  pendingStudents: number;
  collectionRate: number;
}

interface BankBalance {
  name: string;
  balance: number;
  accountNumber?: string;
}

interface BankBalances {
  pettyCash: BankBalance[];
  banks: BankBalance[];
  totalBalance: number;
}

interface Transaction {
  studentName: string;
  feeType: string;
  amount: number;
  date: string;
  paymentMode?: string;
}

interface Trend {
  month: string;
  collected: number;
  pending: number;
}

interface PeriodData {
  total: number;
  cash: number;
  bank: number;
}

interface IncomeExpenseData {
  today: PeriodData;
  last7Days: PeriodData;
  thisMonth: PeriodData;
  last6Months: PeriodData;
  thisSession: PeriodData;
}

interface AccountsDashboardContextType {
  todayCollection: number;
  thisWeekCollection: number;
  thisMonthCollection: number;
  totalPending: number;
  collectionSummary: CollectionSummary;
  bankBalances: BankBalances;
  feeCollectionTrends: Trend[];
  recentTransactions: Transaction[];
  income: IncomeExpenseData;
  expense: IncomeExpenseData;
  balance: IncomeExpenseData;
  loading: boolean;
  trendsLoading: boolean;
  transactionsLoading: boolean;
  bankBalancesLoading: boolean;
  incomeExpenseLoading: boolean;
  error: string | null;
  fetchAccountsDashboard: () => Promise<void>;
  fetchFeeCollectionTrends: (months?: number) => Promise<void>;
  fetchRecentTransactions: (limit?: number) => Promise<void>;
  fetchBankBalances: () => Promise<void>;
  fetchIncomeExpenseData: () => Promise<void>;
  fetchAllDashboardData: () => Promise<void>;
  clearData: () => void;
}

const AccountsDashboardContext = createContext<AccountsDashboardContextType | null>(null);

export const useAccountsDashboard = (): AccountsDashboardContextType => {
  const ctx = useContext(AccountsDashboardContext);
  if (!ctx) throw new Error('useAccountsDashboard must be used inside AccountsDashboardProvider');
  return ctx;
};

export const AccountsDashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todayCollection, setTodayCollection] = useState(0);
  const [thisWeekCollection, setThisWeekCollection] = useState(0);
  const [thisMonthCollection, setThisMonthCollection] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [collectionSummary, setCollectionSummary] = useState<CollectionSummary>({
    quarterlyCollection: 0,
    yearlyCollection: 0,
    pendingFees: 0,
    pendingStudents: 0,
    collectionRate: 0,
  });
  const [bankBalances, setBankBalances] = useState<BankBalances>({
    pettyCash: [],
    banks: [],
    totalBalance: 0,
  });
  const [feeCollectionTrends, setFeeCollectionTrends] = useState<Trend[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  const defaultPeriodData: PeriodData = { total: 0, cash: 0, bank: 0 };
  const [income, setIncome] = useState<IncomeExpenseData>({
    today: defaultPeriodData,
    last7Days: defaultPeriodData,
    thisMonth: defaultPeriodData,
    last6Months: defaultPeriodData,
    thisSession: defaultPeriodData,
  });
  const [expense, setExpense] = useState<IncomeExpenseData>({
    today: defaultPeriodData,
    last7Days: defaultPeriodData,
    thisMonth: defaultPeriodData,
    last6Months: defaultPeriodData,
    thisSession: defaultPeriodData,
  });
  const [balance, setBalance] = useState<IncomeExpenseData>({
    today: defaultPeriodData,
    last7Days: defaultPeriodData,
    thisMonth: defaultPeriodData,
    last6Months: defaultPeriodData,
    thisSession: defaultPeriodData,
  });

  const [loading, setLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [bankBalancesLoading, setBankBalancesLoading] = useState(false);
  const [incomeExpenseLoading, setIncomeExpenseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Accounts Dashboard
  const fetchAccountsDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchDataFromApi('/dashboard/accounts-dashboard');
      if (response.success && response.data) {
        setTodayCollection(response.data.todayCollection || 0);
        setThisWeekCollection(response.data.thisWeekCollection || 0);
        setThisMonthCollection(response.data.thisMonthCollection || 0);
        setTotalPending(response.data.totalPending || 0);
        if (response.data.collectionSummary) {
          setCollectionSummary(response.data.collectionSummary);
        }
      }
    } catch (err: any) {
      console.error('Error fetching accounts dashboard:', err);
      setError(err.message || 'Failed to fetch accounts dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Fee Collection Trends
  const fetchFeeCollectionTrends = useCallback(async (months = 12) => {
    try {
      setTrendsLoading(true);
      setError(null);
      const response = await fetchDataFromApi(`/dashboard/fee-collection-trends?months=${months}`);
      if (response.success && response.data) {
        setFeeCollectionTrends(response.data.trends || []);
      }
    } catch (err: any) {
      console.error('Error fetching fee trends:', err);
      setError(err.message || 'Failed to fetch fee trends');
    } finally {
      setTrendsLoading(false);
    }
  }, []);

  // Fetch Recent Transactions
  const fetchRecentTransactions = useCallback(async (limit = 5) => {
    try {
      setTransactionsLoading(true);
      setError(null);
      const response = await fetchDataFromApi(`/dashboard/recent-transactions?limit=${limit}`);
      if (response.success && response.data) {
        setRecentTransactions(response.data.transactions || []);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  // Fetch Bank Balances
  const fetchBankBalances = useCallback(async () => {
    try {
      setBankBalancesLoading(true);
      setError(null);
      const response = await fetchDataFromApi('/dashboard/bank-balances');
      if (response.success && response.data) {
        setBankBalances(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching bank balances:', err);
      setError(err.message || 'Failed to fetch bank balances');
    } finally {
      setBankBalancesLoading(false);
    }
  }, []);

  // Fetch Income/Expense Data
  const fetchIncomeExpenseData = useCallback(async () => {
    try {
      setIncomeExpenseLoading(true);
      setError(null);
      const response = await fetchDataFromApi('/dashboard/income-expense');
      if (response.success && response.data) {
        setIncome(response.data.income || income);
        setExpense(response.data.expense || expense);
        setBalance(response.data.balance || balance);
      }
    } catch (err: any) {
      console.error('Error fetching income/expense data:', err);
      setError(err.message || 'Failed to fetch income/expense data');
    } finally {
      setIncomeExpenseLoading(false);
    }
  }, []);

  // Fetch all dashboard data at once
  const fetchAllDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchAccountsDashboard(),
        fetchFeeCollectionTrends(12),
        fetchRecentTransactions(5),
        fetchBankBalances(),
        fetchIncomeExpenseData(),
      ]);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [fetchAccountsDashboard, fetchFeeCollectionTrends, fetchRecentTransactions, fetchBankBalances, fetchIncomeExpenseData]);

  // Clear all data
  const clearData = useCallback(() => {
    setTodayCollection(0);
    setThisWeekCollection(0);
    setThisMonthCollection(0);
    setTotalPending(0);
    setCollectionSummary({
      quarterlyCollection: 0,
      yearlyCollection: 0,
      pendingFees: 0,
      pendingStudents: 0,
      collectionRate: 0,
    });
    setBankBalances({
      pettyCash: [],
      banks: [],
      totalBalance: 0,
    });
    setFeeCollectionTrends([]);
    setRecentTransactions([]);
    setError(null);
  }, []);

  const value: AccountsDashboardContextType = {
    todayCollection,
    thisWeekCollection,
    thisMonthCollection,
    totalPending,
    collectionSummary,
    bankBalances,
    feeCollectionTrends,
    recentTransactions,
    income,
    expense,
    balance,
    loading,
    trendsLoading,
    transactionsLoading,
    bankBalancesLoading,
    incomeExpenseLoading,
    error,
    fetchAccountsDashboard,
    fetchFeeCollectionTrends,
    fetchRecentTransactions,
    fetchBankBalances,
    fetchIncomeExpenseData,
    fetchAllDashboardData,
    clearData,
  };

  return (
    <AccountsDashboardContext.Provider value={value}>
      {children}
    </AccountsDashboardContext.Provider>
  );
};
