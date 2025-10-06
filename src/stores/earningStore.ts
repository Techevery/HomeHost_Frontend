
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface MonthlyEarning {
  month: string;
  amount: number;
}

interface YearlyEarning {
  year: string;
  monthlyEarnings: MonthlyEarning[];
}

interface EarningsState {
  selectedYear: string;
  years: string[];
  earningsData: YearlyEarning[];
  isLoading: boolean;
  error: string | null;
  setSelectedYear: (year: string) => void;
  getMonthlyEarnings: (year: string) => MonthlyEarning[];
  fetchEarningsData: () => Promise<void>;
}



const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || 'https://homeyhost.ng/api'

export const useEarningsStore = create<EarningsState>()(
  persist(
    (set, get) => ({
      selectedYear: '2024',
      years: ['2024', '2023', '2022'],
      earningsData: [],
      isLoading: false,
      error: null,
      
      setSelectedYear: (year: string) => set({ selectedYear: year }),
      
      getMonthlyEarnings: (year: string) => {
        const yearlyData = get().earningsData.find(data => data.year === year);
        return yearlyData ? yearlyData.monthlyEarnings : [];
      },
      
      fetchEarningsData: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${API_BASE_URL}/earnings`);
          set({ 
            earningsData: response.data,
            isLoading: false 
          });
          toast.success('Earnings data loaded successfully');
        } catch (error) {
          let errorMessage = 'Failed to fetch earnings data';
          if (axios.isAxiosError(error)) {
            errorMessage = error.response?.data?.message || errorMessage;
          }
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          toast.error(errorMessage);
        }
      },
    }),
    {
      name: 'earnings-storage',
    }
  )
);