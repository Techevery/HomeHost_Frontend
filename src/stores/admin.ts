import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// 添加角色常量
const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

type Role = typeof ROLES[keyof typeof ROLES];

interface AdminState {
  token: string | null;
  adminInfo: {
    id: string;
    name: string;
    email: string;
    role: Role; // 使用明确的角色类型
    permissions: string[];
    profilePicture: string;
    isSuperAdmin: boolean; // 保持向后兼容
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
  location?: string;
}

interface OfflineBookingData {
  apartmentId: string;
  startDates: string[];
  endDates: string[];
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

interface CreateAdminData {
  name: string;
  email: string;
  address: string;
  gender: string;
  phone_number: string;
}

// Agent Management Response Interfaces
interface AgentTotals {
  totalBalance: number;
  totalPending: number;
  totalEarning: number;
  totalActiveProperties: number;
}

interface AgentInfo {
  id: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  bank_name: string;
  account_number: string;
  gender: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  profile_picture: string;
  id_card: string;
  slug: string;
  personalUrl: string;
  accountBalance: number;
  nextOfKinAddress: string;
  nextOfKinEmail: string;
  nextOfKinName: string;
  nextOfKinOccupation: string;
  nextOfKinPhone: string;
  nextOfKinStatus: string;
  suspended: boolean;
}

interface BookingPeriod {
  id: string;
  transaction_id: string;
  apartment_id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  created_at: string;
  isDeleted: boolean;
  isEdited: boolean;
  expired: boolean;
  status: string;
  newBookingDuration: string | null;
}

interface Transaction {
  id: string;
  email: string;
  status: string;
  amount: number;
  channel: string | null;
  charge: number | null;
  metadata: {
    bookingPeriods: Array<{
      endDate: string;
      startDate: string;
      durationDays: number;
    }>;
  };
  reference: string;
  date_paid: string;
  apartment_id: string;
  agent_id: string;
  created_at: string;
  updated_at: string;
  booking_end_date: string;
  booking_start_date: string;
  duration_days: number;
  phone_number: string;
  payment_month: string | null;
  payment_year: string | null;
  credited: boolean;
  agentPercentage: number;
  mockupPrice: number;
  bookingPeriods: BookingPeriod[];
}

interface Payout {
  id: string;
  agentId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  status: string;
  createdAt: string;
  amount: number;
  proof: string | null;
  reference: string;
  remark: string | null;
  transactionId: string;
  reason: string | null;
  charges: number;
  transaction?: Transaction;
}

interface PropertyApartment {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: number;
  images: string[];
  video_link: string | null;
  agentPercentage: number | null;
  amenities: string;
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Property {
  id: string;
  agent_id: string;
  apartment_id: string;
  base_price: number;
  markedup_price: number;
  price_changed_by: string | null;
  price_changed_at: string;
  updated_at: string;
  agent_commission_percent: number;
  apartment: PropertyApartment;
}

interface AgentManagementResponse {
  totals: AgentTotals;
  info: AgentInfo;
  payouts: Payout[];
  properties: Property[];
}

interface AdminActions {
  // Authentication
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
  
  // Admin Management
  createAdmin: (adminData: CreateAdminData) => Promise<any>;
  
  // Agent Management
  verifyAgent: (
    agentId: string,
    status: "VERIFIED" | "UNVERIFIED",
  ) => Promise<any>;
  suspendAgent: (agentId: string) => Promise<any>;
  rejectAgent: (agentId: string, reason: string) => Promise<any>;
  listAgents: (page?: number, pageSize?: number) => Promise<any>;
  getAgentProfile: (agentId: string, status?: "info" | "payout" | "properties") => Promise<any>;
  getAgentManagement: (agentId: string) => Promise<AgentManagementResponse>;
  
  // Property Management
  listProperties: (page?: number, pageSize?: number) => Promise<any>;
  createApartment: (
    apartmentData: ApartmentData,
    files?: File[]
  ) => Promise<any>;
  updateApartment: (
    apartmentId: string,
    updateData: UpdateApartmentData,
    files?: File[],
    deleteExistingImages?: boolean
  ) => Promise<any>;
  deleteApartment: (apartmentId: string) => Promise<any>;
  searchApartment: (query: string) => Promise<any>;
  
  // Booking
  offlineBooking: (bookingData: OfflineBookingData) => Promise<any>;
  
  // Dashboard & Reports
  getDashboardStats: () => Promise<any>;
  getTransactionDetailsByYear: (year: number) => Promise<any>;
  
  // Payouts
  getSuccessfulPayouts: (page?: number, pageSize?: number) => Promise<any>;
  getPayoutRequests: (page?: number, pageSize?: number) => Promise<any>;
  
  // Role Helpers
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  getUserRole: () => Role | null;
  
  // Debug
  debugToken: () => {
    token: string | null;
    hasLocalStorageToken: boolean;
    localStorageTokenLength: number | null;
  };
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

// Add request interceptor to automatically add token
adminAxios.interceptors.request.use(
  (config) => {
    // Get token from localStorage (most reliable)
    const token = localStorage.getItem("token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
adminAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized - Token expired or invalid");
      // Clear stored token
      localStorage.removeItem("token");
      localStorage.removeItem("admin-storage");
    }
    
    return Promise.reject(error);
  }
);

// Helper function to determine role from various possible field names
const determineRole = (adminData: any): Role => {
  // Check role field first
  if (adminData?.role === ROLES.SUPER_ADMIN) {
    return ROLES.SUPER_ADMIN;
  }
  
  // Check isSuperAdmin field for backward compatibility
  if (adminData?.isSuperAdmin === true || adminData?.is_super_admin === true) {
    return ROLES.SUPER_ADMIN;
  }
  
  // Default to admin role
  return ROLES.ADMIN;
};

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
          const token = responseData.data?.token;
          const adminData = responseData.data?.admin;

          if (!token) {
            throw new Error("No access token received from server");
          }

          // Determine role based on data
          const role = determineRole(adminData);
          const isSuperAdmin = role === ROLES.SUPER_ADMIN;

          // Store token in Zustand state
          set({
            token,
            adminInfo: {
              id: adminData?.id || "",
              name: adminData?.name || "",
              email: adminData?.email || "",
              role: role,
              permissions: adminData?.permissions || [],
              profilePicture: adminData?.profilePicture || "",
              isSuperAdmin: isSuperAdmin, // For backward compatibility
              createdAt: adminData?.createdAt || new Date().toISOString(),
              address: adminData?.address,
              gender: adminData?.gender,
              phoneNumber: adminData?.phoneNumber || adminData?.phonenumber || "",
            },
            isAuthenticated: true,
            isLoading: false,
          });

          // Store token in localStorage
          localStorage.setItem("token", token);

          // Fetch full profile after login
          try {
            await get().fetchAdminProfile();
          } catch (profileError) {
            console.error("Profile fetch error after login:", profileError);
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

      createAdmin: async (adminData: CreateAdminData) => {
        set({ isLoading: true, error: null });
        try {
          // Check if current user is super admin
          const currentAdmin = get().adminInfo;
          if (currentAdmin?.role !== ROLES.SUPER_ADMIN) {
            const errorMessage = "Insufficient permissions: Only super admins can create new admins";
            set({
              error: errorMessage,
              isLoading: false,
            });
            throw new Error(errorMessage);
          }

          const response = await adminAxios.post(
            `/api/v1/admin/create-admin`,
            adminData,
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Failed to create admin. Please try again.";

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
        set({ isLoading: true, error: null });
        try {
          const response = await adminAxios.get(
            `/api/v1/admin/admin-profile`,
          );

          const data = response.data.data;
          
          if (!data) {
            throw new Error("No profile data received from server");
          }

          // Determine role based on data
          const role = determineRole(data);
          const isSuperAdmin = role === ROLES.SUPER_ADMIN;

          set({
            adminInfo: {
              id: data.id || "",
              name: data.name || "",
              email: data.email || "",
              role: role,
              permissions: data.permissions || [],
              profilePicture: data.profilePicture || data.profile_picture || "",
              isSuperAdmin: isSuperAdmin,
              createdAt: data.createdAt || new Date().toISOString(),
              address: data.address || "",
              gender: data.gender || "",
              phoneNumber: data.phoneNumber || data.phonenumber || data.phone_number || "",
            },
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = 
            error.response?.data?.message || 
            error.response?.data?.error || 
            error.message || 
            "Failed to fetch admin profile";

          set({
            error: errorMessage,
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
          const isFormData = updatedData instanceof FormData;
          let config;
          let dataToSend;

          if (isFormData) {
            config = {};
            dataToSend = updatedData;
          } else {
            config = {
              headers: {
                "Content-Type": "application/json",
              },
            };
            
            const { name, address, password, confirmPassword } = updatedData as EditAdminProfileData;
            dataToSend = { name, address, password, confirmPassword };
          }

          const response = await adminAxios.patch(
            `/api/v1/admin/edit-profile`,
            dataToSend,
            config,
          );

          const data = response.data.data || response.data;
          
          // Update role information if present
          const updatedRole = determineRole(data);
          const updatedIsSuperAdmin = updatedRole === ROLES.SUPER_ADMIN;
          
          set((state) => ({
            adminInfo: state.adminInfo ? {
              ...state.adminInfo,
              ...data,
              role: updatedRole,
              isSuperAdmin: updatedIsSuperAdmin,
            } : null,
            isLoading: false,
            error: null,
          }));

          return response.data;
        } catch (error: any) {
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
          const response = await adminAxios.put(
            `/api/v1/admin/verify-agent`,
            { agentId, status },
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
          const response = await adminAxios.patch(
            `/api/v1/admin/suspend-agent`,
            { agentId },
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
          const response = await adminAxios.delete(
            `/api/v1/admin/reject/${agentId}`,
            {
              data: { reason },
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

      getAgentManagement: async (agentId: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`Fetching agent management data for: ${agentId}`);
          
          const response = await adminAxios.get(
            `/api/v1/admin/agent-management/${agentId}`,
          );

          console.log('Agent Management Response:', response.data);

          // Extract the data from response
          const responseData = response.data.data || response.data;
          
          // Ensure we have the expected structure
          if (!responseData) {
            throw new Error("No data received from server");
          }

          // Transform to match our interface
          const agentManagementData: AgentManagementResponse = {
            totals: responseData.totals || {
              totalBalance: 0,
              totalPending: 0,
              totalEarning: 0,
              totalActiveProperties: 0
            },
            info: responseData.info,
            payouts: responseData.payouts || [],
            properties: responseData.properties || []
          };

          set({ isLoading: false });
          
          return agentManagementData;

        } catch (error: any) {
          console.error('Agent Management Error:', error);
          
          let errorMessage = "Failed to fetch agent management data";
          
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            errorMessage = "Request timeout. Please try again.";
          } else if (error.response?.status === 401) {
            errorMessage = "Authentication expired. Please log in again.";
            get().logout();
          } else if (error.response?.status === 403) {
            errorMessage = "Access denied. You don't have permission to access this resource.";
          } else if (error.response?.status === 404) {
            errorMessage = "Agent not found.";
          } else if (error.response?.status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }

          set({
            error: errorMessage,
            isLoading: false,
          });
          
          throw new Error(errorMessage);
        }
      },

      listProperties: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
          const response = await adminAxios.get(
            `/api/v1/admin/list-apartments`,
            {
              params: { page, pageSize },
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
          const response = await adminAxios.get(
            `/api/v1/admin/list-agents`,
            {
              params: { page, pageSize },
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
          const response = await adminAxios.get(
            `/api/v1/admin/agent-profile/${agentId}`,
            {
              params: { status },
            },
          );

          set({ isLoading: false });
          
          return response.data;

        } catch (error: any) {
          let errorMessage = "Failed to fetch agent profile";
          
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            errorMessage = "Request timeout. Please try again.";
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
          const response = await adminAxios.get(
            `/api/v1/admin/stats`,
          );

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
          const response = await adminAxios.post(
            `/api/v1/admin/get-transaction-details`,
            { year },
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
          const response = await adminAxios.delete(
            `/api/v1/admin/${apartmentId}`,
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
          const response = await adminAxios.get(
            `/api/v1/admin/search-apartment`,
            {
              params: { query },
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

          const response = await adminAxios.patch(
            `/api/v1/admin/update-apartment/${apartmentId}`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000,
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
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
          const requestData: any = {
            apartmentId: bookingData.apartmentId,
            startDate: bookingData.startDates,
            endDate: bookingData.endDates,
            name: bookingData.name,
            email: bookingData.email,
          };

          if (bookingData.phone) {
            requestData.phone = bookingData.phone;
          }

          const response = await adminAxios.post(
            `/api/v1/admin/book`, 
            requestData,
            {
              timeout: 30000, 
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
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
          const response = await adminAxios.get(
            `/api/v1/wallet/successful-payout`,
            {
              params: { page, pageSize },
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
          const response = await adminAxios.get(
            `/api/v1/wallet`,
            {
              params: { page, pageSize },
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

      // Role helper functions
      isSuperAdmin: () => {
        const adminInfo = get().adminInfo;
        return adminInfo?.role === ROLES.SUPER_ADMIN || adminInfo?.isSuperAdmin === true;
      },

      isAdmin: () => {
        const adminInfo = get().adminInfo;
        return adminInfo?.role === ROLES.ADMIN || !adminInfo?.isSuperAdmin;
      },

      getUserRole: () => {
        return get().adminInfo?.role || null;
      },

      debugToken: () => {
        const storeToken = get().token;
        const localStorageToken = localStorage.getItem("token");
        
        const debugInfo = {
          token: storeToken,
          hasLocalStorageToken: !!localStorageToken,
          localStorageTokenLength: localStorageToken?.length || null,
          localStorageTokenFirst20: localStorageToken?.substring(0, 20) + "...",
          hasAdminStorage: !!localStorage.getItem("admin-storage")
        };
        
        console.log('Token Debug Info:', debugInfo);
        return debugInfo;
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

// Export the ROLES constant for use in other files
export { ROLES };
export type { Role };

export default useAdminStore;