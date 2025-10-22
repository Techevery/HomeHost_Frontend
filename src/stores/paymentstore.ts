import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Types
interface PaymentInitiationData {
  email: string;
  channels: string[];
  currency: string;
  agentId: string;
  apartmentId: string;
  startDate: string;
  endDate: string;
  phoneNumber: string;
  nextofKinName: string;
  nextOfKinNumber: string;
  amount?: number;
  metadata?: Record<string, any>;
}

interface PaymentData {
  authorization_url: string;
  access_code: string;
  reference: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "abandoned";
  paid_at?: string;
  created_at: string;
  channel: string;
  customer?: {
    email: string;
    phone_number: string;
  };
}

interface PaymentVerificationData {
  status: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    transaction_date: string;
    status: string;
    reference: string;
    domain: string;
    gateway_response: string;
    message: string;
    channel: string;
    ip_address: string;
    fees: number;
    plan: string;
    paid_at: string;
    created_at: string;
    customer?: {
      email: string;
      phone_number: string;
    };
    metadata?: Record<string, any>;
  };
}

interface TransactionHistoryFilters {
  status?: string;
  channel?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface PaymentState {
  // Payment initiation state
  paymentData: PaymentData | null;
  isInitializingPayment: boolean;
  paymentInitError: string | null;

  // Payment verification state
  verificationData: PaymentVerificationData | null;
  isVerifyingPayment: boolean;
  verificationError: string | null;

  // Transaction history
  transactionHistory: PaymentData[];
  isLoadingTransactions: boolean;
  transactionError: string | null;
  transactionFilters: TransactionHistoryFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  // Webhook state
  webhookData: any | null;
  isProcessingWebhook: boolean;
  webhookError: string | null;

  // General state
  isLoading: boolean;
  error: string | null;
}

interface PaymentActions {
  // Payment initiation
  initiatePayment: (paymentData: PaymentInitiationData) => Promise<PaymentData>;
  clearPaymentInitError: () => void;

  // Payment verification
  verifyPayment: (reference: string) => Promise<PaymentVerificationData>;
  clearVerificationError: () => void;

  // Transaction management
  fetchTransactionHistory: (
    filters?: TransactionHistoryFilters,
  ) => Promise<void>;
  clearTransactionHistory: () => void;
  setTransactionFilters: (filters: TransactionHistoryFilters) => void;
  clearTransactionFilters: () => void;

  // Payment status management
  updatePaymentStatus: (
    reference: string,
    status: PaymentData["status"],
  ) => void;
  retryFailedPayment: (reference: string) => Promise<PaymentData>;

  // Webhook handling
  processWebhook: (webhookData: any) => Promise<void>;
  clearWebhookError: () => void;

  // General actions
  clearError: () => void;
  resetPaymentState: () => void;
  clearAllErrors: () => void;
}

const initialState: PaymentState = {
  paymentData: null,
  isInitializingPayment: false,
  paymentInitError: null,
  verificationData: null,
  isVerifyingPayment: false,
  verificationError: null,
  transactionHistory: [],
  isLoadingTransactions: false,
  transactionError: null,
  transactionFilters: {
    page: 1,
    limit: 10,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  webhookData: null,
  isProcessingWebhook: false,
  webhookError: null,
  isLoading: false,
  error: null,
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

// Enhanced error handler utility
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error("Payment API Error:", error);

  if (error.response) {
    const status = error.response.status;
    const serverMessage =
      error.response.data?.message ||
      error.response.data?.error ||
      error.response.data?.details;

    switch (status) {
      case 400:
        return (
          serverMessage || "Bad request. Please check your payment details."
        );
      case 401:
        return serverMessage || "Authentication required for payment.";
      case 402:
        return (
          serverMessage || "Payment failed. Please check your payment method."
        );
      case 403:
        return serverMessage || "Access denied for payment operation.";
      case 404:
        return serverMessage || "Payment resource not found.";
      case 409:
        return (
          serverMessage || "Payment conflict. Transaction might already exist."
        );
      case 422:
        return (
          serverMessage ||
          "Payment validation error. Please check your input data."
        );
      case 429:
        return "Too many payment requests. Please try again later.";
      case 500:
        return serverMessage || "Payment server error. Please try again later.";
      case 502:
        return "Payment service temporarily unavailable. Please try again later.";
      case 503:
        return "Payment service unavailable. Please try again later.";
      default:
        return serverMessage || `Payment error ${status}. Please try again.`;
    }
  } else if (error.request) {
    return "Network error during payment. Please check your internet connection.";
  } else if (error.code === "ECONNABORTED") {
    return "Payment request timeout. Please try again.";
  } else if (error.message) {
    return error.message;
  } else {
    return defaultMessage;
  }
};

// Validation utilities
const validatePaymentInitiation = (
  data: PaymentInitiationData,
): { valid: boolean; message?: string } => {
  if (!data.email || !data.email.includes("@")) {
    return { valid: false, message: "Valid email is required." };
  }

  if (!data.phoneNumber || data.phoneNumber.trim() === "") {
    return { valid: false, message: "Phone number is required." };
  }

  if (!data.nextofKinName || data.nextofKinName.trim() === "") {
    return { valid: false, message: "Next of kin name is required." };
  }

  if (!data.nextOfKinNumber || data.nextOfKinNumber.trim() === "") {
    return { valid: false, message: "Next of kin phone number is required." };
  }

  if (!data.channels || data.channels.length === 0) {
    return {
      valid: false,
      message: "At least one payment channel is required.",
    };
  }

  if (!data.currency) {
    return { valid: false, message: "Currency is required." };
  }

  if (!data.agentId) {
    return { valid: false, message: "Valid Agent ID is required." };
  }

  if (!data.apartmentId) {
    return { valid: false, message: "Apartment ID is required." };
  }

  if (!data.startDate || !data.endDate) {
    return { valid: false, message: "Start and end dates are required." };
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (start >= end) {
    return { valid: false, message: "End date must be after start date." };
  }

  if (data.amount && data.amount <= 0) {
    return { valid: false, message: "Amount must be greater than zero." };
  }

  return { valid: true };
};

const validatePaymentVerification = (
  reference: string,
): { valid: boolean; message?: string } => {
  if (!reference || reference.trim() === "") {
    return { valid: false, message: "Payment reference is required." };
  }

  if (reference.length < 10) {
    return { valid: false, message: "Invalid payment reference format." };
  }

  return { valid: true };
};

// Utility functions
const normalizePaymentData = (data: any): PaymentData => ({
  authorization_url:
    data.authorization_url || data.authorizationUrl || data.authorization_url,
  access_code: data.access_code || data.accessCode || data.access_code,
  reference: data.reference,
  amount: data.amount,
  currency: data.currency,
  status: (data.status || "pending") as PaymentData["status"],
  paid_at: data.paid_at || data.paidAt,
  created_at: data.created_at || data.createdAt,
  channel: data.channel,
  customer: data.customer || {
    email: data.email,
    phone_number: data.phone_number || data.phoneNumber,
  },
});

const normalizeVerificationData = (data: any): PaymentVerificationData => ({
  status: data.status !== undefined ? data.status : true,
  message: data.message || "Payment verification successful",
  data: {
    amount: data.data?.amount || data.amount,
    currency: data.data?.currency || data.currency,
    transaction_date:
      data.data?.transaction_date ||
      data.data?.transactionDate ||
      data.transaction_date,
    status: data.data?.status || data.status,
    reference: data.data?.reference || data.reference,
    domain: data.data?.domain || data.domain,
    gateway_response:
      data.data?.gateway_response ||
      data.data?.gatewayResponse ||
      data.gateway_response,
    message: data.data?.message || data.message,
    channel: data.data?.channel || data.channel,
    ip_address:
      data.data?.ip_address || data.data?.ipAddress || data.ip_address,
    fees: data.data?.fees || data.fees || 0,
    plan: data.data?.plan || data.plan || "",
    paid_at: data.data?.paid_at || data.data?.paidAt || data.paid_at,
    created_at:
      data.data?.created_at || data.data?.createdAt || data.created_at,
    customer: data.data?.customer || data.customer,
    metadata: data.data?.metadata || data.metadata,
  },
});

const usePaymentStore = create<PaymentState & PaymentActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Payment initiation
      initiatePayment: async (paymentData: PaymentInitiationData) => {
        set({
          isInitializingPayment: true,
          paymentInitError: null,
          error: null,
          isLoading: true,
        });

        try {
          console.log("🔄 Initiating payment:", paymentData);

          // Validate input data
          const validation = validatePaymentInitiation(paymentData);
          if (!validation.valid) {
            throw new Error(validation.message);
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/payment/initiate`,
            paymentData,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              timeout: 30000, // Longer timeout for payment operations
              validateStatus: (status) => status < 500, // Don't throw for 4xx errors
            },
          );

          console.log("✅ Payment initiation response:", response);

          if (!response.data || response.data.error) {
            throw new Error(
              response.data?.message || "Invalid payment response from server.",
            );
          }

          const paymentResult = normalizePaymentData(
            response.data.data || response.data,
          );

          set({
            paymentData: paymentResult,
            isInitializingPayment: false,
            isLoading: false,
          });

          // Add to transaction history
          const currentHistory = get().transactionHistory;
          const updatedHistory = [paymentResult, ...currentHistory].slice(
            0,
            50,
          ); // Keep last 50 transactions
          set({ transactionHistory: updatedHistory });

          return paymentResult;
        } catch (error: any) {
          console.error("❌ Payment initiation error:", error);

          const errorMessage = handleApiError(
            error,
            "Failed to initialize payment. Please try again.",
          );

          set({
            paymentInitError: errorMessage,
            error: errorMessage,
            isInitializingPayment: false,
            isLoading: false,
          });

          throw new Error(errorMessage);
        }
      },

      clearPaymentInitError: () => {
        set({ paymentInitError: null });
      },

      // Payment verification
      verifyPayment: async (reference: string) => {
        set({
          isVerifyingPayment: true,
          verificationError: null,
          error: null,
          isLoading: true,
        });

        try {
          console.log("🔍 Verifying payment with reference:", reference);

          // Validate reference
          const validation = validatePaymentVerification(reference);
          if (!validation.valid) {
            throw new Error(validation.message);
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/payment/verify`,
            { reference },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              timeout: 30000,
              validateStatus: (status) => status < 500,
            },
          );

          console.log("✅ Payment verification response:", response);

          if (!response.data || response.data.error) {
            throw new Error(
              response.data?.message ||
                "Invalid verification response from server.",
            );
          }

          const verificationResult = normalizeVerificationData(response.data);

          set({
            verificationData: verificationResult,
            isVerifyingPayment: false,
            isLoading: false,
          });

          // Update payment data status if it matches the current payment
          const currentPayment = get().paymentData;
          if (currentPayment && currentPayment.reference === reference) {
            set({
              paymentData: {
                ...currentPayment,
                status: verificationResult.data.status as PaymentData["status"],
                paid_at: verificationResult.data.paid_at,
              },
            });
          }

          // Update transaction history
          const currentHistory = get().transactionHistory;
          const updatedHistory = currentHistory.map((transaction) =>
            transaction.reference === reference
              ? {
                  ...transaction,
                  status: verificationResult.data
                    .status as PaymentData["status"],
                  paid_at: verificationResult.data.paid_at,
                }
              : transaction,
          );
          set({ transactionHistory: updatedHistory });

          return verificationResult;
        } catch (error: any) {
          console.error("❌ Payment verification error:", error);

          const errorMessage = handleApiError(
            error,
            "Failed to verify payment. Please try again.",
          );

          set({
            verificationError: errorMessage,
            error: errorMessage,
            isVerifyingPayment: false,
            isLoading: false,
          });

          throw new Error(errorMessage);
        }
      },

      clearVerificationError: () => {
        set({ verificationError: null });
      },

      // Transaction history
      fetchTransactionHistory: async (
        filters: TransactionHistoryFilters = {},
      ) => {
        set({
          isLoadingTransactions: true,
          transactionError: null,
          error: null,
          isLoading: true,
        });

        try {
          const currentFilters = get().transactionFilters;
          const mergedFilters = { ...currentFilters, ...filters };

          const queryParams = new URLSearchParams();
          Object.entries(mergedFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              queryParams.append(key, value.toString());
            }
          });

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/payment/transactions?${queryParams}`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
              timeout: 15000,
              validateStatus: (status) => status < 500,
            },
          );

          console.log("✅ Transaction history response:", response);

          if (!response.data) {
            throw new Error("Invalid transaction history response.");
          }

          const responseData = response.data.data || response.data;
          const transactions = Array.isArray(responseData)
            ? responseData.map(normalizePaymentData)
            : [];

          const paginationData = response.data.pagination || {
            currentPage: mergedFilters.page || 1,
            totalPages: 1,
            totalItems: transactions.length,
            hasNext: false,
            hasPrev: false,
          };

          set({
            transactionHistory: transactions,
            isLoadingTransactions: false,
            isLoading: false,
            transactionFilters: mergedFilters,
            pagination: paginationData,
          });
        } catch (error: any) {
          console.error("❌ Transaction history error:", error);

          const errorMessage = handleApiError(
            error,
            "Failed to fetch transaction history.",
          );

          set({
            transactionError: errorMessage,
            error: errorMessage,
            isLoadingTransactions: false,
            isLoading: false,
          });

          throw new Error(errorMessage);
        }
      },

      clearTransactionHistory: () => {
        set({
          transactionHistory: [],
          transactionFilters: initialState.transactionFilters,
          pagination: initialState.pagination,
        });
      },

      setTransactionFilters: (filters: TransactionHistoryFilters) => {
        set((state) => ({
          transactionFilters: { ...state.transactionFilters, ...filters },
        }));
      },

      clearTransactionFilters: () => {
        set({ transactionFilters: initialState.transactionFilters });
      },

      // Payment status management
      updatePaymentStatus: (
        reference: string,
        status: PaymentData["status"],
      ) => {
        set((state) => {
          // Update current payment data if it matches
          const updatedPaymentData =
            state.paymentData?.reference === reference
              ? { ...state.paymentData, status }
              : state.paymentData;

          // Update transaction history
          const updatedHistory = state.transactionHistory.map((transaction) =>
            transaction.reference === reference
              ? { ...transaction, status }
              : transaction,
          );

          return {
            paymentData: updatedPaymentData,
            transactionHistory: updatedHistory,
          };
        });
      },

      retryFailedPayment: async (reference: string) => {
        const { transactionHistory, initiatePayment } = get();
        const transaction = transactionHistory.find(
          (t) => t.reference === reference,
        );

        if (!transaction) {
          throw new Error("Transaction not found");
        }

        // Create new payment data based on failed transaction
        const retryData: PaymentInitiationData = {
          email: transaction.customer?.email || "",
          channels: [transaction.channel],
          currency: transaction.currency,
          agentId: "", // You might want to store this in metadata
          apartmentId: "", // You might want to store this in metadata
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          phoneNumber: transaction.customer?.phone_number || "",
          nextofKinName: "",
          nextOfKinNumber: "",
          amount: transaction.amount,
          metadata: {
            retry_reference: reference,
            original_reference: reference,
          },
        };

        return await initiatePayment(retryData);
      },

      // Webhook handling
      processWebhook: async (webhookData: any) => {
        set({ isProcessingWebhook: true, webhookError: null });

        try {
          console.log("🔄 Processing webhook:", webhookData);

          // Validate webhook data
          if (!webhookData || !webhookData.reference) {
            throw new Error("Invalid webhook data: missing reference");
          }

          // Update payment status based on webhook
          const { event, data } = webhookData;
          if (event === "charge.success" && data) {
            get().updatePaymentStatus(data.reference, "success");

            // Also verify payment to get complete details
            await get().verifyPayment(data.reference);
          } else if (event === "charge.failed" && data) {
            get().updatePaymentStatus(data.reference, "failed");
          }

          set({
            webhookData: webhookData,
            isProcessingWebhook: false,
          });
        } catch (error: any) {
          console.error("❌ Webhook processing error:", error);

          const errorMessage = handleApiError(
            error,
            "Failed to process webhook.",
          );

          set({
            webhookError: errorMessage,
            isProcessingWebhook: false,
          });

          throw new Error(errorMessage);
        }
      },

      clearWebhookError: () => {
        set({ webhookError: null });
      },

      // General actions
      clearError: () => {
        set({
          error: null,
          paymentInitError: null,
          verificationError: null,
          transactionError: null,
          webhookError: null,
        });
      },

      clearAllErrors: () => {
        set({
          error: null,
          paymentInitError: null,
          verificationError: null,
          transactionError: null,
          webhookError: null,
        });
      },

      resetPaymentState: () => {
        set(initialState);
      },
    }),
    {
      name: "payment-storage",
      partialize: (state) => ({
        paymentData: state.paymentData,
        verificationData: state.verificationData,
        transactionHistory: state.transactionHistory.slice(0, 20), // Keep only last 20 for storage
        transactionFilters: state.transactionFilters,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...initialState,
            ...persistedState,
            transactionFilters:
              persistedState.transactionFilters ||
              initialState.transactionFilters,
            pagination: persistedState.pagination || initialState.pagination,
          };
        }
        return persistedState as PaymentState & PaymentActions;
      },
    },
  ),
);

export default usePaymentStore;
