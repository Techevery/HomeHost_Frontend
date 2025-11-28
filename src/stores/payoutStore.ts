import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export enum PayoutStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED" // Added to match backend
}

interface Payout {
  id: string;
  status: PayoutStatus;
  proof: string | null;
  remark: string | null;
  reason?: string | null; // Added for reject payout
  createdAt: string;
  updatedAt: string;
  agent: {
    id: string;
    name: string;
  };
  transaction?: {
    status: string;
    amount: number;
    agentPercentage: number;
    mockupPrice: number;
    apartment: {
      name: string;
    };
  };
  amount?: number; // Added as payout has amount field based on service
}

interface ConfirmPayoutData {
  payoutId: string;
  remark: string;
  files?: File[];
}

interface RejectPayoutData {
  payoutId: string;
  reason: string;
}

interface WalletState {
  payouts: Payout[];
  isLoading: boolean;
  error: string | null;
  isProcessingPayout: boolean;
}

interface WalletActions {
  getAllPayouts: () => Promise<Payout[]>;
  confirmPayout: (confirmData: ConfirmPayoutData) => Promise<any>;
  rejectPayout: (rejectData: RejectPayoutData) => Promise<any>;
  getAgentTransactions: () => Promise<Payout[]>;
  getPayoutStatistics: () => Promise<any>;
  clearError: () => void;
  clearPayouts: () => void;
}



const initialState: WalletState = {
  payouts: [],
  isLoading: false,
  error: null,
  isProcessingPayout: false,
};

const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      getAllPayouts: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet`, // Fixed double slash
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const payouts = response.data || [];
          console.log("Payouts fetched:", payouts);
          
          set({
            payouts,
            isLoading: false,
          });

          return payouts;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to fetch payouts";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      confirmPayout: async (confirmData) => {
        set({ isProcessingPayout: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const formData = new FormData();
          formData.append("payoutId", confirmData.payoutId);
          formData.append("remark", confirmData.remark);

          if (confirmData.files && confirmData.files.length > 0) {
            confirmData.files.forEach(file => {
              formData.append("image", file);
            });
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/wallet/confirm-payout`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            },
          );

          set({ isProcessingPayout: false });

          // Refresh payouts after confirmation
          try {
            await get().getAllPayouts();
          } catch (refreshError) {
            console.warn("Failed to refresh payouts after confirmation:", refreshError);
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to confirm payout";

          set({
            error: errorMessage,
            isProcessingPayout: false,
          });
          throw error;
        }
      },

      rejectPayout: async (rejectData: RejectPayoutData) => {
        set({ isProcessingPayout: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.patch(
            `${API_BASE_URL}/api/v1/wallet/reject-payout`,
            {
              payoutId: rejectData.payoutId,
              reason: rejectData.reason,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isProcessingPayout: false });

          // Refresh payouts after rejection
          try {
            await get().getAllPayouts();
          } catch (refreshError) {
            console.warn("Failed to refresh payouts after rejection:", refreshError);
          }

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to reject payout";

          set({
            error: errorMessage,
            isProcessingPayout: false,
          });
          throw error;
        }
      },

      getAgentTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet/agent-transactions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const transactions = response.data || [];
          set({ isLoading: false });
          return transactions;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch agent transactions";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      getPayoutStatistics: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet/payout-stats`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const stats = response.data || {};
          set({ isLoading: false });
          return stats;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch payout statistics";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // Helper methods for filtering payouts
      getPayoutsByStatus: (status: PayoutStatus) => {
        const { payouts } = get();
        return payouts.filter(payout => payout.status === status);
      },

      getPayoutById: (payoutId: string) => {
        const { payouts } = get();
        return payouts.find(payout => payout.id === payoutId);
      },

      getPayoutsByAgent: (agentId: string) => {
        const { payouts } = get();
        return payouts.filter(payout => payout.agent.id === agentId);
      },

      clearError: () => {
        set({ error: null });
      },

      clearPayouts: () => {
        set({ payouts: [] });
      },
    }),
    {
      name: "wallet-storage",
      partialize: (state) => ({
        payouts: state.payouts,
      }),
      version: 1,
    },
  ),
);

// Export helper functions
export const getPayoutsByStatus = (status: PayoutStatus) => 
  useWalletStore.getState().payouts.filter(payout => payout.status === status);

export const getPayoutById = (payoutId: string) => 
  useWalletStore.getState().payouts.find(payout => payout.id === payoutId);

export const getPayoutsByAgent = (agentId: string) => 
  useWalletStore.getState().payouts.filter(payout => payout.agent.id === agentId);

export default useWalletStore;