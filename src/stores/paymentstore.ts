import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface PaymentInitiationData {
  email: string;
  phone_number: string;
  name: string;
  nextkin_name: string;
  nextkin_phone: string;
  discount_code: number;
  channels: string[];
  currency: string;
  agentId: string;
  apartmentId: string;
  startDate: string;
  endDate: string;
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
  };
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
  fetchTransactionHistory: () => Promise<void>;
  clearTransactionHistory: () => void;

  // General actions
  clearError: () => void;
  resetPaymentState: () => void;
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
  isLoading: false,
  error: null,
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

// Enhanced error handler utility (similar to agent store)
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error("Payment API Error:", error);

  if (error.response) {
    const status = error.response.status;
    const serverMessage =
      error.response.data?.message || error.response.data?.error;

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
    return { valid: false, message: "Agent ID is required." };
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

  return { valid: true };
};

const validatePaymentVerification = (
  reference: string,
): { valid: boolean; message?: string } => {
  if (!reference || reference.trim() === "") {
    return { valid: false, message: "Payment reference is required." };
  }

  return { valid: true };
};

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
        });

        try {
          console.log("🔍 Initiating payment with data:", paymentData);

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
              },
              timeout: 30000, // Longer timeout for payment operations
            },
          );

          console.log("Payment initiation response:", response);

          const { data } = response.data;

          if (!data) {
            throw new Error("Invalid payment response from server.");
          }

          const paymentResult: PaymentData = {
            authorization_url: data.authorization_url || data.authorizationUrl,
            access_code: data.access_code || data.accessCode,
            reference: data.reference,
            amount: data.amount,
            currency: data.currency,
            status: data.status || "pending",
            paid_at: data.paid_at || data.paidAt,
            created_at: data.created_at || data.createdAt,
            channel: data.channel,
          };

          set({
            paymentData: paymentResult,
            isInitializingPayment: false,
          });

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
          });

          throw new Error(errorMessage);
        }
      },

      clearPaymentInitError: () => {
        set({ paymentInitError: null });
      },

      // Payment verification
      verifyPayment: async (reference: string) => {
        set({ isVerifyingPayment: true, verificationError: null, error: null });

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
              },
              timeout: 30000,
            },
          );

          console.log("Payment verification response:", response);

          const { data } = response.data;

          if (!data) {
            throw new Error("Invalid verification response from server.");
          }

          const verificationResult: PaymentVerificationData = {
            status:
              data.status !== undefined ? data.status : response.data.status,
            message: data.message || response.data.message,
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
                data.data?.ip_address ||
                data.data?.ipAddress ||
                data.ip_address,
              fees: data.data?.fees || data.fees,
              plan: data.data?.plan || data.plan,
              paid_at: data.data?.paid_at || data.data?.paidAt || data.paid_at,
              created_at:
                data.data?.created_at ||
                data.data?.createdAt ||
                data.created_at,
            },
          };

          set({
            verificationData: verificationResult,
            isVerifyingPayment: false,
          });

          // Update payment data status if it matches the current payment
          const currentPayment = get().paymentData;
          if (currentPayment && currentPayment.reference === reference) {
            set({
              paymentData: {
                ...currentPayment,
                status: verificationResult.data.status as
                  | "pending"
                  | "success"
                  | "failed"
                  | "abandoned",
                paid_at: verificationResult.data.paid_at,
              },
            });
          }

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
          });

          throw new Error(errorMessage);
        }
      },

      clearVerificationError: () => {
        set({ verificationError: null });
      },

      // Transaction history
      fetchTransactionHistory: async () => {
        set({
          isLoadingTransactions: true,
          transactionError: null,
          error: null,
        });

        try {
          // Note: You might need to implement this endpoint in your backend
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/payment/transactions`,
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 15000,
            },
          );

          const { data } = response.data;

          if (!data || !Array.isArray(data)) {
            throw new Error("Invalid transaction history response.");
          }

          const transactions: PaymentData[] = data.map((item: any) => ({
            authorization_url: item.authorization_url || item.authorizationUrl,
            access_code: item.access_code || item.accessCode,
            reference: item.reference,
            amount: item.amount,
            currency: item.currency,
            status: item.status || "pending",
            paid_at: item.paid_at || item.paidAt,
            created_at: item.created_at || item.createdAt,
            channel: item.channel,
          }));

          set({
            transactionHistory: transactions,
            isLoadingTransactions: false,
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
          });

          throw new Error(errorMessage);
        }
      },

      clearTransactionHistory: () => {
        set({ transactionHistory: [] });
      },

      // General actions
      clearError: () => {
        set({
          error: null,
          paymentInitError: null,
          verificationError: null,
          transactionError: null,
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
        transactionHistory: state.transactionHistory,
      }),
    },
  ),
);

export default usePaymentStore;
