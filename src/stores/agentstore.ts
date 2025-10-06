import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AgentInfo {
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
}

interface AgentData {
  id: string;
  account: string;
  email: string;
  front_id?: string;
  front_id_status?: boolean;
  back_id?: string;
  back_id_status?: boolean;
  profit?: string;
  shopperData?: boolean;
  userData?: { notificationID?: string };
  createdAt: string;
  name: string;
  phone_number: string;
  slug: string;
  status: string;
  apartment_managed?: string;
}

interface AgentState {
  token: string | null;
  agentInfo: AgentInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  enlistedProperties: any[];
  currentPropertyPage: number;
  totalProperties: number;
  hasMoreProperties: boolean;
  // New state for agent management
  agents: AgentData[];
  totalAgents: number;
  totalPages: number;
  currentAgentPage: number;
  itemsPerPage: number;
}

interface AgentActions {
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  registerAgent: (formData: FormData) => Promise<void>;
  logout: () => void;
  fetchAgentProfile: () => Promise<void>;
  updateAgentProfile: (updatedData: Partial<AgentInfo>) => Promise<void>;
  setRememberMe: (remember: boolean) => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  enlistApartment: (apartmentId: string, markedUpPrice: number, agentPercentage: number) => Promise<void>;
  removeApartment: (apartmentId: string) => Promise<void>;
  fetchEnlistedProperties: (page?: number, limit?: number) => Promise<void>;
  fetchPropertiesBySlug: (slug: string, page?: number, limit?: number) => Promise<any>;
  clearProperties: () => void;
  // New actions for agent management
  fetchAgents: (page?: number, limit?: number) => Promise<void>;
  updateAgentVerification: (agentId: string, field: 'front_id_status' | 'back_id_status', status: boolean) => Promise<void>;
  updateAgentStatus: (agentId: string, status: string) => Promise<void>;
}

const initialState: AgentState = {
  token: null,
  agentInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  rememberMe: false,
  enlistedProperties: [],
  currentPropertyPage: 1,
  totalProperties: 0,
  hasMoreProperties: false,
  // New initial state for agent management
  agents: [],
  totalAgents: 0,
  totalPages: 1,
  currentAgentPage: 1,
  itemsPerPage: 10,
};

const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || 'https://homeyhost.ng/api';

const useAgentStore = create<AgentState & AgentActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email, password, remember) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/agent-login`,
            { email, password }
          );

          const { data } = response.data;
          
          set({
            token: data.token,
            agentInfo: {
              id: data.id || data.agent?.id,
              name: data.name || data.agent?.name,
              email: data.email || data.agent?.email,
              status: data.status || data.agent?.status,
              slug: data.slug || data.agent?.slug,
              phoneNumber: data.phoneNumber || data.agent?.phoneNumber,
              address: data.address || data.agent?.address,
              gender: data.gender || data.agent?.gender,
              profilePicture: data.profilePicture || data.agent?.profilePicture,
              bankName: data.bankName || data.agent?.bankName,
              accountNumber: data.accountNumber || data.agent?.accountNumber,
              isVerified: data.isVerified || data.agent?.isVerified,
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
            `${API_BASE_URL}/api/v1/auth/register-agent`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          const { data } = response.data;
          
          set({
            token: data.token,
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
          const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
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
            `${API_BASE_URL}/api/v1/agent/profile`,
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
            `${API_BASE_URL}/api/v1/agent/profile`,
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
            `${API_BASE_URL}/api/v1/auth/forgot-password`,
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
            `${API_BASE_URL}/api/v1/auth/reset-password`,
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
      
      enlistApartment: async (apartmentId: string, markedUpPrice: number, agentPercentage: number) => {
        set({ isLoading: true, error: null });
        try {
          await axios.post(
            `${API_BASE_URL}/api/v1/agent/enlist-property`,
            { apartmentId, markedUpPrice, agentPercentage },
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            }
          );
          
          await get().fetchEnlistedProperties(1, 10);
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to enlist apartment.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      removeApartment: async (apartmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          await axios.delete(
            `${API_BASE_URL}/api/v1/agent/remove-apartment`,
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
              data: { apartmentId },
            }
          );
          
          const currentProperties = get().enlistedProperties;
          const updatedProperties = currentProperties.filter(
            (property: any) => property.apartmentId !== apartmentId
          );
          
          set({ 
            enlistedProperties: updatedProperties,
            totalProperties: get().totalProperties - 1,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to remove apartment.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchEnlistedProperties: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/agent/agent-listing`,
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
              params: { page, limit },
            }
          );
          
          const { data } = response.data;
          
          set({
            enlistedProperties: page === 1 ? data.properties : [...get().enlistedProperties, ...data.properties],
            currentPropertyPage: page,
            totalProperties: data.totalCount || data.properties.length,
            hasMoreProperties: data.hasMore || (data.properties && data.properties.length === limit),
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch enlisted properties.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchPropertiesBySlug: async (slug: string, page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/agent/${slug}/properties`,
            {
              params: { page, limit },
            }
          );
          
          const { data } = response.data;
          return data;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch properties by slug.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },
      
      clearProperties: () => {
        set({
          enlistedProperties: [],
          currentPropertyPage: 1,
          totalProperties: 0,
          hasMoreProperties: false,
        });
      },

      // New methods for agent management
      fetchAgents: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/list-agents`,
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
              params: { page, limit },
            }
          );
          
          const result = response.data;
          
          set({
            agents: result?.data?.agentDataWithoutPassword || [],
            totalAgents: result.pagination?.totalAgents || 0,
            totalPages: result.pagination?.totalPages || 1,
            currentAgentPage: result.pagination?.currentPage || page,
            itemsPerPage: result.pagination?.itemsPerPage || limit,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch agents data.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateAgentVerification: async (agentId: string, field: 'front_id_status' | 'back_id_status', status: boolean) => {
        set({ isLoading: true, error: null });
        try {
          await axios.patch(
            `${API_BASE_URL}/api/v1/admin/agents/${agentId}/verification`,
            { [field]: status },
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            }
          );

          // Update local state
          set({
            agents: get().agents.map(agent => 
              agent.id === agentId 
                ? { ...agent, [field]: status }
                : agent
            ),
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update verification status.',
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateAgentStatus: async (agentId: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.put(
            `${API_BASE_URL}/api/v1/admin/verify-agent`,
            { agentId, status },
            {
              headers: {
                Authorization: `Bearer ${get().token}`,
              },
            }
          );

          const updatedAgent = response.data.data;
          
          // Update local state
          set({
            agents: get().agents.map(agent => 
              agent.id === agentId 
                ? { ...agent, status: updatedAgent.status }
                : agent
            ),
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update agent status.',
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