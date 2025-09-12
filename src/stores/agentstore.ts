import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AgentState {
  token: string | null;
  agentInfo: {
    id: string;
    name: string;
    email: string;
    status: string;
    slug: string;
    phoneNumber: string;
    address: string;
    gender: string;
    profilePicture: string;
    bankName: string;
    accountNumber: string;
    isVerified: boolean;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
}

interface AgentActions {
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  registerAgent: (formData: FormData) => Promise<void>;
  logout: () => void;
  fetchAgentProfile: () => Promise<void>;
  updateAgentProfile: (updatedData: Partial<AgentState['agentInfo']>) => Promise<void>;
  setRememberMe: (remember: boolean) => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const initialState: AgentState = {
  token: null,
  agentInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  rememberMe: false,
};

const useAgentStore = create<AgentState & AgentActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email, password, remember) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/auth/agent-login`,
            { email, password }
          );
          
          const { token, data } = response.data;
          
          set({
            token,
            agentInfo: {
              id: data.id,
              name: data.name,
              email: data.email,
              status: data.status,
              slug: data.slug,
              phoneNumber: data.phoneNumber,
              address: data.address,
              gender: data.gender,
              profilePicture: data.profilePicture,
              bankName: data.bankName,
              accountNumber: data.accountNumber,
              isVerified: data.isVerified,
            },
            isAuthenticated: true,
            rememberMe: remember,
          });
          
          if (remember) {
            localStorage.setItem('remember', 'true');
            localStorage.setItem('username', email);
          } else {
            localStorage.removeItem('remember');
            localStorage.removeItem('username');
          }
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
      
      registerAgent: async (formData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/auth/register-agent`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          const { token, data } = response.data;
          
          set({
            token,
            agentInfo: {
              id: data.id,
              name: data.name,
              email: data.email,
              status: data.status,
              slug: data.slug,
              phoneNumber: data.phoneNumber,
              address: data.address,
              gender: data.gender,
              profilePicture: data.profilePicture,
              bankName: data.bankName,
              accountNumber: data.accountNumber,
              isVerified: data.isVerified,
            },
            isAuthenticated: true,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Registration failed. Please try again.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        set(initialState);
        localStorage.removeItem('remember');
        localStorage.removeItem('username');
      },
      
      fetchAgentProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/agent-profile`,
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            }
          );
          
          const data = response.data.data;
          set({
            agentInfo: {
              id: data.id,
              name: data.name,
              email: data.email,
              status: data.status,
              slug: data.slug,
              phoneNumber: data.phoneNumber,
              address: data.address,
              gender: data.gender,
              profilePicture: data.profilePicture,
              bankName: data.bankName,
              accountNumber: data.accountNumber,
              isVerified: data.isVerified,
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
      
      updateAgentProfile: async (updatedData) => {
        set({ isLoading: true });
        try {
          const response = await axios.patch(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/edit-profile`,
            updatedData,
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            }
          );
          
          const data = response.data.data;
          set({
            agentInfo: {
              ...get().agentInfo!,
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
      
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/auth/forgot-password`,
            { email }
          );
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to send reset email.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/auth/reset-password`,
            { token, password }
          );
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to reset password.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      setRememberMe: (remember) => {
        set({ rememberMe: remember });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'agent-storage',
      partialize: (state) => ({
        token: state.token,
        agentInfo: state.agentInfo,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);

export default useAgentStore;