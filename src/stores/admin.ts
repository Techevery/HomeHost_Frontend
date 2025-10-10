import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

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
  updateAdminProfile: (updatedData: Partial<AdminState['adminInfo']> | FormData) => Promise<void>;
  clearError: () => void;
  verifyAgent: (agentId: string, status: "VERIFIED" | "UNVERIFIED") => Promise<any>;
  listProperties: (page?: number, pageSize?: number) => Promise<any>;
  listAgents: (page?: number, pageSize?: number) => Promise<any>;
  getAgentProfile: (agentId: string) => Promise<any>;
  getDashboardStats: () => Promise<any>;
  getTransactionDetailsByYear: (year: number) => Promise<any>;
  deleteApartment: (apartmentId: string) => Promise<any>;
  searchApartment: (query: string) => Promise<any>;
}

const initialState: AdminState = {
  token: null,
  adminInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Fixed: Removed trailing space
const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || 'https://homeyhost.ng/api';

const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
         
          
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/admin-login`,
            { email, password }
          );
       
          
          // Handle different response structures
          const responseData = response.data;
          const token = responseData.token || responseData.data?.token || responseData.accessToken;
          const adminData = responseData.data || responseData.user || responseData.admin;
          
          if (!token) {
            throw new Error('No token received from server');
          }
          
    
          
          // Set store state
          set({
            token,
            adminInfo: {
              id: adminData?.id || adminData?._id || '',
              name: adminData?.name || '',
              email: adminData?.email || '',
              role: adminData?.role || 'admin',
              permissions: adminData?.permissions || [],
              profilePicture: adminData?.profilePicture || '',
              isSuperAdmin: adminData?.isSuperAdmin || false,
              createdAt: adminData?.createdAt || new Date().toISOString(),
              address: adminData?.address,
              gender: adminData?.gender,
              phoneNumber: adminData?.phoneNumber || '',
            },
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Store token in localStorage
          try {
            localStorage.setItem('token', token);
          
          } catch (storageError) {
           
          }
          
        } catch (error: any) {
        
          const errorMessage = error.response?.data?.message || 
                             error.response?.data?.error || 
                             error.message || 
                             'Login failed. Please check your credentials.';
          
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
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/register-admin`,
            adminData
          );
          
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message ;
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
          localStorage.removeItem('token');
          localStorage.removeItem('admin-storage');
         
        } catch (error) {
         
        }
      },
      
      fetchAdminProfile: async () => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
        
          
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/admin-profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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
              isSuperAdmin: data.isSuperAdmin,
              createdAt: data.createdAt,
              address: data.address,
              gender: data.gender,
              phoneNumber: data.phoneNumber || '',
            },
            isLoading: false,
          });
        } catch (error: any) {
       
          set({ 
            error: error.response?.data?.message ,
            isLoading: false,
          });
          if (error.response?.status === 401) {
            get().logout();
          }
        }
      },
      
      updateAdminProfile: async (updatedData) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const isFormData = updatedData instanceof FormData;
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(isFormData ? {} : { 'Content-Type': 'application/json' })
            },
          };

          const response = await axios.patch(
            `${API_BASE_URL}/api/v1/admin/edit-profile`,
            isFormData ? updatedData : updatedData,
            config
          );
          
          const data = response.data.data;
          set({
            adminInfo: {
              ...get().adminInfo!,
              ...data,
            },
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message ,
            isLoading: false,
          });
          throw error;
        }
      },

      verifyAgent: async (agentId, status) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.put(
            `${API_BASE_URL}/api/v1/admin/verify-agent`,
            { agentId, status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
          );
          
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message ,
            isLoading: false,
          });
          throw error;
        }
      },

      listProperties: async (page = 1, pageSize = 10) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          console.log('🔑 Token for listProperties:', token);
          
          if (!token) {
            throw new Error('Authentication token not found. Please log in again.');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/list-apartments`,
            {
              params: { page, pageSize },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
         
          
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
        
          set({ 
            error: error.response?.data?.message ,
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
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/list-agents`,
            {
              params: { page, pageSize },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message ,
            isLoading: false,
          });
          throw error;
        }
      },

      getAgentProfile: async (agentId) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/agents-profile`,
            {
              params: { agentId },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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

      getDashboardStats: async () => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/stats`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
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

      getTransactionDetailsByYear: async (year) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/admin/get-transaction-details`,
            { year },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            }
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
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.delete(
            `${API_BASE_URL}/api/v1/admin/${apartmentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message ,
            isLoading: false,
          });
          throw error;
        }
      },

      searchApartment: async (query) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/search-apartment`,
            {
              params: { query },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ isLoading: false });
          return response.data;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message ,
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
      name: 'admin-storage',
      partialize: (state) => ({
        token: state.token,
        adminInfo: state.adminInfo,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 1,
    }
  )
);

export default useAdminStore;