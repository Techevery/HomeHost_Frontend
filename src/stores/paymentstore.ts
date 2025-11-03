// paymentstore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface PaymentData {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  email: string;
  apartmentId: string;
  agentId: string;
  startDate: string;
  endDate: string;
  phoneNumber: string;
  nextofKinName: string;
  nextofKinNumber: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  isLoading: boolean;
  error: string | null;
  paymentData: PaymentData | null;
  verificationData: any | null;
  isInitializingPayment: boolean;
  paymentInitError: string | null;
}

interface PaymentActions {
  initiatePayment: (
    email: string,
    channels: string[],
    currency: string,
    apartmentId: string,
    startDate: string,
    endDate: string,
    phoneNumber: string,
    nextofKinName: string,
    nextofKinNumber: string,
    fullName: string,
    agentId?: string,
  ) => Promise<{ success: boolean; data?: any; message?: string }>;

  verifyPayment: (
    reference: string,
  ) => Promise<{ success: boolean; data?: any; message?: string }>;
  clearError: () => void;
  clearPaymentData: () => void;
  clearPaymentInitError: () => void;
}

const initialState: PaymentState = {
  isLoading: false,
  error: null,
  paymentData: null,
  verificationData: null,
  isInitializingPayment: false,
  paymentInitError: null,
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

// Enhanced error handler utility (consistent with agentStore)
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error("Payment API Error:", error);

  if (error.response) {
    const status = error.response.status;
    const serverMessage =
      error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return serverMessage || "Bad request. Please check your input.";
      case 401:
        return serverMessage || "Session expired. Please log in again.";
      case 403:
        return (
          serverMessage ||
          "Access denied. You do not have permission for this action."
        );
      case 404:
        return serverMessage || "Resource not found.";
      case 409:
        return serverMessage || "Conflict. This payment already exists.";
      case 422:
        return (
          serverMessage || "Validation error. Please check your input data."
        );
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return serverMessage || "Server error. Please try again later.";
      case 502:
        return "Service temporarily unavailable. Please try again later.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return serverMessage || `Error ${status}. Please try again.`;
    }
  } else if (error.request) {
    return "Network error. Please check your internet connection and try again.";
  } else if (error.code === "ECONNABORTED") {
    return "Request timeout. Please try again.";
  } else {
    return defaultMessage;
  }
};

const usePaymentStore = create<PaymentState & PaymentActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      initiatePayment: async (
        email: string,
        channels: string[],
        currency: string,
        apartmentId: string,
        startDate: string,
        endDate: string,
        phoneNumber: string,
        nextofKinName: string,
        nextofKinNumber: string,
        fullName: string,
        agentId?: string,
      ) => {
        set({ isInitializingPayment: true, paymentInitError: null });

        try {
          let finalAgentId: string | null = null;
          let authToken: string | null = null;

          try {
            const agentStoreModule = await import("./agentstore");
            const agentStore = agentStoreModule.default;
            const { token, isAuthenticated, agentInfo } = agentStore.getState();

            if (isAuthenticated && token && agentInfo?.id) {
              finalAgentId = agentInfo.id;
              authToken = token;
              console.log("Using authenticated agent ID:", finalAgentId);
            }
          } catch (error) {
            console.log("Agent store not available or agent not logged in");
          }

          if (!finalAgentId && agentId) {
            finalAgentId = agentId;
            console.log("Using provided agent ID:", finalAgentId);
          }

          if (!finalAgentId) {
            return {
              success: false,
              message:
                "Agent information is required. Please provide agentId or ensure you are logged in.",
            };
          }

          if (!email || !apartmentId || !startDate || !endDate) {
            return {
              success: false,
              message:
                "Email, apartment ID, start date, and end date are required.",
            };
          }

          if (!channels || channels.length === 0) {
            return {
              success: false,
              message: "At least one payment channel is required.",
            };
          }

          const startDates = [startDate];
          const endDates = [endDate];

          const paymentData = {
            email,
            channels,
            currency: currency || "NGN",
            agentId: finalAgentId,
            apartmentId,
            startDates,
            endDates,
            phoneNumber: phoneNumber || "",
            nextofKinName: nextofKinName || "",
            nextofKinNumber: nextofKinNumber || "",
            fullName: fullName || "",
          };

          console.log("Initiating payment with data:", paymentData);

          const headers: any = {
            "Content-Type": "application/json",
          };

          if (authToken) {
            headers.Authorization = `Bearer ${authToken}`;
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/payment/initiate`,
            paymentData,
            {
              headers,
              timeout: 30000,
            },
          );

          console.log("Payment initiation response:", response);

          const result = response.data.data;

          if (!result) {
            throw new Error("Invalid response from payment service.");
          }

          set({
            paymentData: {
              reference: result.reference,
              status: result.status,
              amount: result.amount,
              currency: result.currency,
              email: result.email,
              apartmentId: result.apartmentId,
              agentId: result.agentId,
              startDate: result.startDate,
              endDate: result.endDate,
              phoneNumber: result.phoneNumber,
              nextofKinName: result.nextofKinName,
              nextofKinNumber: result.nextofKinNumber,
              fullName: result.fullName,
              createdAt: result.createdAt,
              updatedAt: result.updatedAt,
            },
            isInitializingPayment: false,
          });

          return {
            success: true,
            data: result,
            message: "Payment initialized successfully",
          };
        } catch (error: any) {
          console.error("Payment initiation error:", error);

          const errorMessage = handleApiError(
            error,
            "Failed to initiate payment. Please try again.",
          );

          set({
            paymentInitError: errorMessage,
            isInitializingPayment: false,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      verifyPayment: async (reference: string) => {
        set({ isLoading: true, error: null });

        try {
          const agentStoreModule = await import("./agentstore");
          const agentStore = agentStoreModule.default;

          const { token, isAuthenticated } = agentStore.getState();

          if (!isAuthenticated || !token) {
            return {
              success: false,
              message: "Please log in to verify payment.",
            };
          }

          if (!reference) {
            return {
              success: false,
              message: "Payment reference is required.",
            };
          }

          console.log("Verifying payment with reference:", reference);

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/payment/verify`,
            { reference },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 15000,
            },
          );

          console.log("Payment verification response:", response);

          const result = response.data.data;

          if (!result) {
            throw new Error(
              "Invalid response from payment verification service.",
            );
          }

          set({
            verificationData: result,
            isLoading: false,
          });

          const currentPaymentData = get().paymentData;
          if (
            currentPaymentData &&
            currentPaymentData.reference === reference
          ) {
            set({
              paymentData: {
                ...currentPaymentData,
                status: result.status,
                updatedAt: result.updatedAt,
              },
            });
          }

          return {
            success: true,
            data: result,
            message: "Payment verified successfully",
          };
        } catch (error: any) {
          console.error("Payment verification error:", error);

          const errorMessage = handleApiError(
            error,
            "Failed to verify payment. Please try again.",
          );

          set({
            error: errorMessage,
            isLoading: false,
          });

          return {
            success: false,
            message: errorMessage,
          };
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearPaymentData: () => {
        set({
          paymentData: null,
          verificationData: null,
        });
      },

      clearPaymentInitError: () => {
        set({ paymentInitError: null });
      },
    }),
    {
      name: "payment-storage",
      partialize: (state) => ({
        paymentData: state.paymentData,
        verificationData: state.verificationData,
      }),
    },
  ),
);

export default usePaymentStore;
