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
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AdminActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchAdminProfile: () => Promise<void>;
  updateAdminProfile: (updatedData: Partial<AdminState['adminInfo']> | FormData) => Promise<void>;
  clearError: () => void;
}

const initialState: AdminState = {
  token: null,
  adminInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const useAdminStore = create<AdminState & AdminActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/auth/admin-login`,
            { email, password }
          );
          
          const { token, data } = response.data;
          
          set({
            token,
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
            },
            isAuthenticated: true,
          });
          
          localStorage.setItem('token', token);
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Login failed. Please check your credentials.',
            isAuthenticated: false,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        set(initialState);
        localStorage.removeItem('token');
      },
      
      fetchAdminProfile: async () => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const data = response.data.data;
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
            },
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch profile data.',
          });
          if (error.response?.status === 401) {
            get().logout();
          }
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateAdminProfile: async (updatedData) => {
        set({ isLoading: true });
        try {
          const token = get().token || localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          // Determine if we're sending FormData or regular JSON
          const isFormData = updatedData instanceof FormData;
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
              ...(isFormData ? {} : { 'Content-Type': 'application/json' })
            },
          };

          const response = await axios.patch(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/profile`,
            isFormData ? updatedData : JSON.stringify(updatedData),
            config
          );
          
          const data = response.data.data;
          set({
            adminInfo: {
              ...get().adminInfo!,
              ...data,
            },
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update profile.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
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
    }
  )
);

export default useAdminStore;