import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

export enum PayoutStatus {
  PENDING = "pending",
  SUCCESS = "success",
  CANCELLED = "cancelled",
  FAILED = "failed"
}

interface Payout {
  id: string;
  status: PayoutStatus;
  proof: string | null;
  remark: string | null;
  reason?: string | null;
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
    booking_end_date: string | null;
    booking_start_date: string | null;
    duration_days: number | null;
    date_paid: string | null;
    apartment: {
      name: string;
    };
  };
  amount?: number;
  // Add bank details and charges
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  charges?: number;
  reference?: string;
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

interface CreateChargesData {
  description: string;
  amount: number;
}

interface UpdateChargeStatusData {
  chargeId: string;
  status: "active" | "inactive";
}

interface AgentTransactionResponse {
  success: boolean;
  message: string;
  data: {
    payouts: Payout[];
    totals: {
      totalEarnings: number;
      totalPending: number;
      totalSuccess: number;
    };
  };
}

interface AgentPayoutByIdResponse {
  success: boolean;
  message: string;
  data: {
    summary: {
      totalEarning: number;
      totalPending: number;
      totalSuccess: number;
    };
    payout: Payout;
  };
}

// Add interface for agent payout response (based on wallet.service.ts)
interface AgentPayoutResponse {
  success?: boolean;
  message?: string;
  // The service returns an array of payouts directly
  data?: Payout[];
}

interface WalletState {
  payouts: Payout[];
  successfulPayouts: Payout[];
  agentTransactions: Payout[];
  agentPayouts: Payout[]; // Add agentPayouts to state
  isLoading: boolean;
  error: string | null;
  isProcessingPayout: boolean;
  isProcessingCharges: boolean;
  payoutStatistics: any | null;
}

interface WalletActions {
  getAllPayouts: () => Promise<Payout[]>;
  confirmPayout: (confirmData: ConfirmPayoutData) => Promise<any>;
  rejectPayout: (rejectData: RejectPayoutData) => Promise<any>;
  getAgentTransactions: (status?: "pending" | "success") => Promise<AgentTransactionResponse>;
  getAgentPayoutById: (payoutId: string, status?: "pending" | "success") => Promise<AgentPayoutByIdResponse>;
  getPayoutStatistics: () => Promise<any>;
  getSuccesfulPayout: () => Promise<Payout[]>;
  createCharges: (chargesData: CreateChargesData) => Promise<any>;
  updateChargeStatus: (updateData: UpdateChargeStatusData) => Promise<any>;
  // Add agent payout method
  getAgentPayout: () => Promise<AgentPayoutResponse>;
  clearError: () => void;
  clearPayouts: () => void;
  clearAgentTransactions: () => void;
  clearAgentPayouts: () => void; // Add clear method for agent payouts
}

const initialState: WalletState = {
  payouts: [],
  successfulPayouts: [],
  agentTransactions: [],
  agentPayouts: [], // Initialize agentPayouts array
  isLoading: false,
  error: null,
  isProcessingPayout: false,
  isProcessingCharges: false,
  payoutStatistics: null,
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

          // This endpoint gets pending payouts only (based on backend service)
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const payouts = response.data || [];
          
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
            formData.append("image", confirmData.files[0]);
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

          // Refresh both pending and successful payouts
          try {
            await Promise.all([
              get().getAllPayouts(),
              get().getSuccesfulPayout(),
            ]);
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
              reasson: rejectData.reason, // Note: backend expects 'reasson' (typo)
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isProcessingPayout: false });

          // Refresh pending payouts after rejection
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

      getAgentTransactions: async (status?: "pending" | "success") => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const params = status ? { status } : {};
          
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet/agent-transactions`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params,
            },
          );

          const data = response.data.data || response.data;
          set({ 
            agentTransactions: data.payouts || [],
            isLoading: false 
          });
          
          return response.data;
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

      getAgentPayoutById: async (payoutId: string, status?: "pending" | "success") => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const params = status ? { status } : {};
          
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet/agent/${payoutId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params,
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch agent payout by ID";

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
          set({ 
            payoutStatistics: stats,
            isLoading: false 
          });
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

      getSuccesfulPayout: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet/successful-payout`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const successfulPayouts = response.data || [];
          set({ 
            successfulPayouts,
            isLoading: false 
          });
          return successfulPayouts;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch successful payouts";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      // NEW: Get agent payouts (all payouts for the authenticated agent)
      getAgentPayout: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/wallet/agent-payout`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          // Handle different response formats
          let agentPayouts: Payout[] = [];
          
          if (response.data && Array.isArray(response.data)) {
            // Direct array response from service
            agentPayouts = response.data;
          } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
            // Wrapped response format
            agentPayouts = response.data.data;
          } else if (response.data && response.data.success !== undefined) {
            // Full API response format
            agentPayouts = response.data.data || [];
          }

          set({ 
            agentPayouts,
            isLoading: false 
          });

          return {
            success: true,
            message: "Agent payouts fetched successfully",
            data: agentPayouts
          };
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to fetch agent payouts";

          set({
            error: errorMessage,
            isLoading: false,
          });
          
          // Return error response
          return {
            success: false,
            message: errorMessage,
            data: []
          };
        }
      },

      createCharges: async (chargesData: CreateChargesData) => {
        set({ isProcessingCharges: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/wallet/charge`,
            chargesData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isProcessingCharges: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to create charges";

          set({
            error: errorMessage,
            isProcessingCharges: false,
          });
          throw error;
        }
      },

      updateChargeStatus: async (updateData: UpdateChargeStatusData) => {
        set({ isProcessingCharges: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.patch(
            `${API_BASE_URL}/api/v1/wallet/charge-approve/${updateData.chargeId}`,
            { status: updateData.status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isProcessingCharges: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to update charge status";

          set({
            error: errorMessage,
            isProcessingCharges: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearPayouts: () => {
        set({ payouts: [], successfulPayouts: [] });
      },

      clearAgentTransactions: () => {
        set({ agentTransactions: [] });
      },

      clearAgentPayouts: () => {
        set({ agentPayouts: [] });
      },
    }),
    {
      name: "wallet-storage",
      partialize: (state) => ({
        payouts: state.payouts,
        successfulPayouts: state.successfulPayouts,
        agentTransactions: state.agentTransactions,
        agentPayouts: state.agentPayouts, 
        payoutStatistics: state.payoutStatistics,
      }),
      version: 1,
    },
  ),
);

// Helper selectors
export const getPayoutsByStatus = (status: PayoutStatus) => 
  useWalletStore.getState().payouts.filter(payout => payout.status === status);

export const getPayoutById = (payoutId: string) => 
  useWalletStore.getState().payouts.find(payout => payout.id === payoutId);

export const getPayoutsByAgent = (agentId: string) => 
  useWalletStore.getState().payouts.filter(payout => payout.agent.id === agentId);

// New helper for agent payouts
export const getAgentPayoutsByStatus = (status: PayoutStatus) => 
  useWalletStore.getState().agentPayouts.filter(payout => payout.status === status);

export default useWalletStore;