import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface AdminState {
  token: string | null;
  adminInfo: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    profilePicture: string;
    isSuperAdmin: boolean;
    createdAt: string;
    address?: string;
    gender?: string;
    phoneNumber?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Apartment data interface
interface ApartmentData {
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: number;
  amenities: string;
  agentPercentage: number;
}

interface UpdateApartmentData {
  name?: string;
  address?: string;
  type?: string;
  servicing?: string;
  bedroom?: string;
  price?: number;
  amenities?: string;
  agentPercentage?: number;
  imagesToDelete?: string[];
}

interface OfflineBookingData {
  apartmentId: string;
  startDate: string[];
  endDate: string[];
  name: string;
  email: string;
  phone?: string;
}

interface EditAdminProfileData {
  name?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

interface AdminActions {
  login: (email: string, password: string) => Promise<void>;
  registerAdmin: (adminData: {
    name: string;
    email: string;
    password: string;
    address?: string;
    gender?: string;
  }) => Promise<any>;
  logout: () => void;
  fetchAdminProfile: () => Promise<void>;
  updateAdminProfile: (
    updatedData: EditAdminProfileData | FormData,
  ) => Promise<any>;
  clearError: () => void;
  verifyAgent: (
    agentId: string,
    status: "VERIFIED" | "UNVERIFIED",
  ) => Promise<any>;
  suspendAgent: (agentId: string) => Promise<any>;
  rejectAgent: (agentId: string, reason: string) => Promise<any>;
  listProperties: (page?: number, pageSize?: number) => Promise<any>;
  listAgents: (page?: number, pageSize?: number) => Promise<any>;
  getAgentProfile: (agentId: string, status?: "info" | "payout" | "properties") => Promise<any>;
  getDashboardStats: () => Promise<any>;
  getTransactionDetailsByYear: (year: number) => Promise<any>;
  deleteApartment: (apartmentId: string) => Promise<any>;
  searchApartment: (query: string) => Promise<any>;
  updateApartment: (
    apartmentId: string,
    updateData: UpdateApartmentData,
    files?: File[],
    deleteExistingImages?: boolean
  ) => Promise<any>;
  createApartment: (
    apartmentData: ApartmentData,
    files?: File[]
  ) => Promise<any>;
  offlineBooking: (bookingData: OfflineBookingData) => Promise<any>;
  
  getSuccessfulPayouts: (page?: number, pageSize?: number) => Promise<any>;
  getPayoutRequests: (page?: number, pageSize?: number) => Promise<any>;
}

const initialState: AdminState = {
  token: null,
  adminInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

// Create axios instance with default config
const adminAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminAxios.post(
            `/api/v1/auth/admin-login`,
            { email, password },
          );

          const responseData = response.data;
          const token =
            responseData.token ||
            responseData.data?.token ||
            responseData.accessToken;
          const adminData =
            responseData.data || responseData.user || responseData.admin;

          if (!token) {
            throw new Error("No Access received from server");
          }

          set({
            token,
            adminInfo: {
              id: adminData?.id || adminData?._id || "",
              name: adminData?.name || "",
              email: adminData?.email || "",
              role: adminData?.role || "admin",
              permissions: adminData?.permissions || [],
              profilePicture: adminData?.profilePicture || "",
              isSuperAdmin:
                adminData?.isSuperAdmin ||
                adminData?.is_super_admin ||
                adminData?.superAdmin ||
                false,
              createdAt: adminData?.createdAt || new Date().toISOString(),
              address: adminData?.address,
              gender: adminData?.gender,
              phoneNumber: adminData?.phoneNumber || adminData?.phonenumber || "",
            },
            isAuthenticated: true,
            isLoading: false,
          });

          try {
            localStorage.setItem("token", token);
          } catch (storageError) {
            console.error("Storage error:", storageError);
          }

          try {
            await get().fetchAdminProfile();
          } catch (profileError) {
            console.warn(
              "Failed to fetch complete admin profile, but login was successful:",
              profileError,
            );
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Login failed. Please check your credentials.";

          set({
            error: errorMessage,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      registerAdmin: async (adminData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await adminAxios.post(
            `/api/v1/auth/register-admin`,
            adminData,
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message;
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set(initialState);
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("admin-storage");
        } catch (error) {
          console.error("Logout storage error:", error);
        }
      },

      fetchAdminProfile: async () => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");

          if (!token) {
            throw new Error("user not login. Please log in again.");
          }

          const response = await adminAxios.get(
            `/api/v1/admin/admin-profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const data = response.data.data || response.data;
          set({
            adminInfo: {
              id: data.id,
              name: data.name,
              email: data.email,
              role: data.role,
              permissions: data.permissions,
              profilePicture: data.profilePicture,
              isSuperAdmin:
                data.isSuperAdmin ||
                data.is_super_admin ||
                data.superAdmin ||
                data.role === "super_admin" ||
                data.role === "super-admin" ||
                false,
              createdAt: data.createdAt,
              address: data.address,
              gender: data.gender,
              phoneNumber: data.phoneNumber || data.phonenumber || "",
            },
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          if (error.response?.status === 401) {
            get().logout();
          }
          throw error;
        }
      },

      updateAdminProfile: async (updatedData) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login. Please log in again.");
          }

          // Check if it's FormData (for file upload) or regular JSON
          const isFormData = updatedData instanceof FormData;
          let config;
          let dataToSend;

          if (isFormData) {
            // For FormData, don't set Content-Type header - browser will set it with boundary
            config = {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            };
            dataToSend = updatedData;
          } else {
            // For regular JSON data
            config = {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            };
            
            // Prepare the data according to backend expectations
            const { name, address, password, confirmPassword } = updatedData as EditAdminProfileData;
            dataToSend = { name, address, password, confirmPassword };
          }

          console.log("🔄 Updating admin profile:", dataToSend);

          const response = await adminAxios.patch(
            `/api/v1/admin/edit-profile`,
            dataToSend,
            config,
          );

          const data = response.data.data || response.data;
          
          // Update the admin info in store
          set((state) => ({
            adminInfo: state.adminInfo ? {
              ...state.adminInfo,
              ...data,
            } : null,
            isLoading: false,
            error: null,
          }));

          console.log("✅ Admin profile updated successfully:", data);
          return response.data;
        } catch (error: any) {
          console.error("❌ Update admin profile error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
          
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to update admin profile";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      verifyAgent: async (agentId, status) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login. Please log in again.");
          }

          const response = await adminAxios.put(
            `/api/v1/admin/verify-agent`,
            { agentId, status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },

      suspendAgent: async (agentId) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login. Please log in again.");
          }

          const response = await adminAxios.patch(
            `/api/v1/admin/suspend-agent`,
            { agentId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },

      rejectAgent: async (agentId, reason) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login. Please log in again.");
          }

          const response = await adminAxios.delete(
            `/api/v1/admin/reject/${agentId}`,
            {
              data: { reason },
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to reject agent";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      listProperties: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");

          if (!token) {
            throw new Error(
              "user not login. Please log in again.",
            );
          }

          const response = await adminAxios.get(
            `/api/v1/admin/list-apartments`,
            {
              params: { page, pageSize },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });

          if (error.response?.status === 401) {
            get().logout();
          }

          throw error;
        }
      },

      listAgents: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login, please login again");
          }

          const response = await adminAxios.get(
            `/api/v1/admin/list-agents`,
            {
              params: { page, pageSize },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },


getAgentProfile: async (agentId: string, status: "info" | "payout" | "properties" = "info") => {
  set({ isLoading: true, error: null });
  
  try {
    // Get token
    const token = get().token || localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }

    console.log('📤 [FRONTEND] Fetching agent profile:', {
      agentId,
      status,
      tokenPreview: token.substring(0, 20) + '...'
    });

    // Construct URL - IMPORTANT: Use the adminAxios instance
    const url = `/api/v1/admin/agent-profile/${agentId}`;
    const params = { status };
    
    console.log('🔗 [FRONTEND] Request details:', {
      url,
      params,
      fullUrl: `${API_BASE_URL}${url}?status=${status}`
    });

    // Make the request
    const response = await adminAxios.get(url, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      timeout: 20000, // 20 seconds timeout
    });

    console.log('✅ [FRONTEND] Response received:', {
      status: response.status,
      statusText: response.statusText,
      dataKeys: Object.keys(response.data || {}),
      success: response.data?.success,
      message: response.data?.message
    });

    set({ isLoading: false });
    
    // Return the data part
    return response.data?.data || response.data;

  } catch (error: any) {
    console.error('❌ [FRONTEND] Agent Profile Error Details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      isAxiosError: error.isAxiosError,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params,
        headers: error.config?.headers
      }
    });

    let errorMessage = "Failed to fetch agent profile";
    
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = "Request timeout. The server is taking too long to respond.";
    } else if (error.response?.status === 401) {
      errorMessage = "Authentication expired. Please log in again.";
    } else if (error.response?.status === 404) {
      errorMessage = "Agent not found.";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    set({
      error: errorMessage,
      isLoading: false,
    });
    
    throw new Error(errorMessage);
  }
},

      getDashboardStats: async () => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("User not logged in. Please log in again.");
          }

          const response = await adminAxios.get(
            `/api/v1/admin/stats`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log("Dashboard Stats Response:", response.data);
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch dashboard statistics";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      getTransactionDetailsByYear: async (year) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login, please login again");
          }

          const response = await adminAxios.post(
            `/api/v1/admin/get-transaction-details`,
            { year },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },

      deleteApartment: async (apartmentId) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login, please login again");
          }

          const response = await adminAxios.delete(
            `/api/v1/admin/${apartmentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },

      searchApartment: async (query) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login, please login again");
          }

          const response = await adminAxios.get(
            `/api/v1/admin/search-apartment`,
            {
              params: { query },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },

      updateApartment: async (
        apartmentId: string,
        updateData: UpdateApartmentData,
        files?: File[],
      ) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login, please login again");
          }

          const formData = new FormData();
          
          Object.entries(updateData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              if (Array.isArray(value) && value.length > 0) {
                formData.append(key, JSON.stringify(value));
              } else {
                formData.append(key, value.toString());
              }
            }
          });
          
          if (files && files.length > 0) {
            files.forEach(file => {
              formData.append('images', file);
            });
          }

          console.log('🔄 Sending update request with:', {
            apartmentId,
            updateData,
            filesCount: files?.length || 0,
            imagesToDelete: updateData.imagesToDelete,
            formDataEntries: Array.from(formData.entries())
          });

          const response = await adminAxios.patch(
            `/api/v1/admin/update-apartment/${apartmentId}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000,
            },
          );

          console.log('✅ Update response:', response);
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          console.error('❌ Update error details:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
          
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to update apartment";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      createApartment: async (apartmentData, files) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("user not login, please login again");
          }

          const formData = new FormData();
          
          Object.entries(apartmentData).forEach(([key, value]) => {
            formData.append(key, value.toString());
          });
          
          if (files) {
            files.forEach(file => {
              formData.append('files', file);
            });
          }

          const response = await adminAxios.post(
            `/api/v1/admin/upload-property`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.message,
            isLoading: false,
          });
          throw error;
        }
      },

      offlineBooking: async (bookingData: OfflineBookingData) => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("User not logged in. Please log in again.");
          }

          console.log("📤 Sending offline booking request:", bookingData);

          const requestData: any = {
            apartmentId: bookingData.apartmentId,
            startDate: bookingData.startDate,
            endDate: bookingData.endDate,
            name: bookingData.name,
            email: bookingData.email,
          };

          // Add phone if provided
          if (bookingData.phone) {
            requestData.phone = bookingData.phone;
          }

          const response = await adminAxios.post(
            `/api/v1/admin/book`, 
            requestData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              timeout: 30000, 
            },
          );

          console.log("✅ Offline booking response:", response.data);
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          console.error("❌ Offline booking error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
          
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Offline booking failed. Please try again.";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      getSuccessfulPayouts: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await adminAxios.get(
            `/api/v1/wallet/successful-payout`,
            {
              params: { page, pageSize },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          set({ isLoading: false });
          return response.data;
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

      getPayoutRequests: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await adminAxios.get(
            `/api/v1/wallet`,
            {
              params: { page, pageSize },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch payout requests";

          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "admin-storage",
      partialize: (state) => ({
        token: state.token,
        adminInfo: state.adminInfo,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 1,
    },
  ),
);

export default useAdminStore;