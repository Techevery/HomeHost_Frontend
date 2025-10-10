import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface AgentInfo {
  id: string;
  name: string;
  email: string;
  status: string;
  slug: string;
  phone_number: string;
  address: string;
  gender: string;
  profile_picture: string;
  bank_name: string;
  account_number: string;
  isVerified: boolean;
  personalUrl: string;
  next_of_kin_full_name: string;
  next_of_kin_email: string;
  accountBalance?: number;
  id_card?: string;
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
  isVerified: boolean;
  personalUrl: string;
  next_of_kin_full_name: string;
  next_of_kin_email: string;
  profile_picture: string;
  accountBalance?: number;
  id_card?: string;
}

interface PublicProperty {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: string;
  images: string[];
  status: 'available' | 'unavailable';
  location: string;
  amenities: string[];
}

interface EnlistedProperty {
  id: string;
  apartmentId: string;
  name: string;
  address: string;
  type: string;
  price: number;
  markedUpPrice: number;
  agentPercentage: number;
  status: string;
  images: string[];
  createdAt: string;
}

interface AgentState {
  token: string | null;
  agentInfo: AgentInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  enlistedProperties: EnlistedProperty[];
  currentPropertyPage: number;
  totalProperties: number;
  hasMoreProperties: boolean;
  agents: AgentData[];
  totalAgents: number;
  totalPages: number;
  currentAgentPage: number;
  itemsPerPage: number;
  publicProperties: PublicProperty[];
  currentPublicPage: number;
  totalPublicProperties: number;
  hasMorePublicProperties: boolean;
  loading: boolean;
}

interface AgentActions {
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  registerAgent: (formData: FormData) => Promise<void>;
  logout: () => void;
  fetchAgentProfile: () => Promise<void>;
  updateAgentProfile: (updatedData: any) => Promise<void>;
  setRememberMe: (remember: boolean) => void;
  clearError: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  enlistApartment: (apartmentId: string, markedUpPrice: number, agentPercentage: number) => Promise<void>;
  removeApartment: (apartmentId: string) => Promise<void>;
  fetchEnlistedProperties: (page?: number, limit?: number) => Promise<void>;
  fetchPropertiesBySlug: (slug: string, page?: number, limit?: number) => Promise<any>;
  clearProperties: () => void;
  fetchAgents: (page?: number, limit?: number) => Promise<void>;
  updateAgentVerification: (agentId: string, field: 'front_id_status' | 'back_id_status', status: boolean) => Promise<void>;
  updateAgentStatus: (agentId: string, status: string) => Promise<void>;
  fetchPublicProperties: (page?: number, limit?: number) => Promise<void>;
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
  agents: [],
  totalAgents: 0,
  totalPages: 1,
  currentAgentPage: 1,
  itemsPerPage: 10,
  publicProperties: [],
  currentPublicPage: 1,
  totalPublicProperties: 0,
  hasMorePublicProperties: false,
  loading: false,
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
              phone_number: data.phone_number || data.phoneNumber || data.agent?.phone_number,
              address: data.address || data.agent?.address,
              gender: data.gender || data.agent?.gender,
              profile_picture: data.avatar || data.profile_picture || data.agent?.profile_picture,
              bank_name: data.bank_name || data.bankName || data.agent?.bank_name,
              account_number: data.account_number || data.accountNumber || data.agent?.account_number,
              isVerified: data.isVerified || data.agent?.isVerified || false,
              personalUrl: data.personalUrl || data.agent?.personalUrl,
              next_of_kin_full_name: data.next_of_kin_full_name || data.nextOfKinName || data.agent?.next_of_kin_full_name,
              next_of_kin_email: data.next_of_kin_email || data.nextOfKinEmail || data.agent?.next_of_kin_email,
              accountBalance: data.accountBalance || data.agent?.accountBalance,
              id_card: data.id_card || data.agent?.id_card,
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
          console.log('Sending registration request to:', `${API_BASE_URL}/api/v1/auth/register-agent`);
          
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/register-agent`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000,
            }
          );
          
          console.log('Registration response:', response);
          
          const { data } = response.data;
          
          set({
            token: data.token,
            agentInfo: {
              id: data.id,
              name: data.name,
              email: data.email,
              status: data.status,
              slug: data.slug,
              phone_number: data.phone_number || data.phoneNumber,
              address: data.address,
              gender: data.gender,
              profile_picture: data.avatar || data.profile_picture,
              bank_name: data.bank_name || data.bankName,
              account_number: data.account_number || data.accountNumber,
              isVerified: data.isVerified || false,
              personalUrl: data.personalUrl,
              next_of_kin_full_name: data.next_of_kin_full_name || data.nextOfKinName,
              next_of_kin_email: data.next_of_kin_email || data.nextOfKinEmail,
              accountBalance: data.accountBalance || 0,
              id_card: data.id_card,
            },
            isAuthenticated: true,
          });
        } catch (error: any) {
          console.error('Registration error:', error);
          const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Registration failed. Please try again.';
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
          
          const data = response.data.result;
          console.log('Profile data:', data);
          
          set({
            agentInfo: {
              id: data.id,
              name: data.name,
              email: data.email,
              status: data.status,
              slug: data.slug,
              phone_number: data.phoneNumber || data.phone_number,
              address: data.address,
              gender: data.gender,
              profile_picture: data.avatar || data.profile_picture,
              bank_name: data.bankName || data.bank_name,
              account_number: data.accountNumber || data.account_number,
              isVerified: data.isVerified || false,
              personalUrl: data.personalUrl,
              next_of_kin_full_name: data.nextOfKinName || data.next_of_kin_full_name,
              next_of_kin_email: data.nextOfKinEmail || data.next_of_kin_email,
              accountBalance: data.accountBalance,
              id_card: data.id_card,
            },
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message,
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
                'Content-Type': updatedData instanceof FormData ? 'multipart/form-data' : 'application/json',
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
            error: error.response?.data?.message,
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
            error: error.response?.data?.message,
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
            error: error.response?.data?.message,
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
            error: error.response?.data?.message,
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
            (property) => property.apartmentId !== apartmentId
          );
          
          set({ 
            enlistedProperties: updatedProperties,
            totalProperties: get().totalProperties - 1,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message,
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
            enlistedProperties: page === 1 ? data.properties || data : [...get().enlistedProperties, ...(data.properties || data)],
            currentPropertyPage: page,
            totalProperties: data.totalCount || data.length || 0,
            hasMoreProperties: data.hasMore || ((data.properties || data) && (data.properties || data).length === limit),
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message,
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
            error: error.response?.data?.message,
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
            error: error.response?.data?.message,
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

          set({
            agents: get().agents.map(agent => 
              agent.id === agentId 
                ? { ...agent, [field]: status }
                : agent
            ),
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message,
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
          
          set({
            agents: get().agents.map(agent => 
              agent.id === agentId 
                ? { ...agent, status: updatedAgent.status }
                : agent
            ),
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message,
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchPublicProperties: async (page = 1, limit = 12) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/agent/public-properties`,
            {
              params: { page, limit },
            }
          );
          
          console.log('API Response:', response.data);
          
          const result = response.data;
          
          // Extract properties from the nested structure
          let properties: any[] = [];
          
          if (result?.data?.properties && Array.isArray(result.data.properties)) {
            properties = result.data.properties;
          } else if (Array.isArray(result?.data)) {
            properties = result.data;
          } else if (Array.isArray(result?.properties)) {
            properties = result.properties;
          } else if (Array.isArray(result)) {
            properties = result;
          }
          
          console.log('Extracted properties:', properties);
          
          // Transform API properties to match our interface
          const validatedProperties: PublicProperty[] = properties.map(prop => ({
            id: prop.id || '',
            name: prop.name || 'Unnamed Property',
            address: prop.address || '',
            type: prop.type || '',
            servicing: prop.servicing || '',
            bedroom: prop.bedroom?.toString() || '',
            price: prop.price?.toString() || '0',
            images: Array.isArray(prop.images) ? prop.images : ['/images/house1.svg'],
            status: 'available',
            location: prop.address || '',
            amenities: prop.servicing ? prop.servicing.split(', ').map((item: string) => item.trim()) : [],
          }));
          
          set({
            publicProperties: page === 1 ? validatedProperties : [...get().publicProperties, ...validatedProperties],
            currentPublicPage: page,
            totalPublicProperties: result.totalCount || result.data?.totalCount || validatedProperties.length,
            hasMorePublicProperties: result.hasMore !== undefined ? result.hasMore : validatedProperties.length === limit,
            loading: false,
          });
          
        } catch (error: any) {
          console.error('Error fetching public properties:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to fetch properties',
            loading: false,
            publicProperties: [],
          });
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