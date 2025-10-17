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
  agentPercentage?: number;
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
  bedroom: number;
  servicing: string;
  amenities: string[];
  location: string;
  updatedAt: string;

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
  enlistApartment: (apartmentId: string, markedUpPrice?: number, agentPercentage?: number) => Promise<{ success: boolean; message: string }>;
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

// Utility function to safely handle amenities data
const getAmenitiesArray = (amenities: any): string[] => {
  if (Array.isArray(amenities)) {
    return amenities.filter(item => item != null).map(item => item.toString().trim());
  }
  if (typeof amenities === 'string') {
    return amenities.split(',').map(item => item.trim()).filter(item => item !== '');
  }
  return [];
};

// Enhanced error handler utility
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error('API Error:', error);

  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return serverMessage || 'Bad request. Please check your input.';
      case 401:
        return serverMessage || 'Session expired. Please log in again.';
      case 403:
        return serverMessage || 'Access denied. You do not have permission for this action.';
      case 404:
        return serverMessage || 'Resource not found.';
      case 409:
        return serverMessage || 'Conflict. This resource already exists.';
      case 422:
        return serverMessage || 'Validation error. Please check your input data.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return serverMessage || 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return serverMessage || `Error ${status}. Please try again.`;
    }
  } else if (error.request) {
    return 'Network error. Please check your internet connection and try again.';
  } else if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please try again.';
  } else {
    return defaultMessage;
  }
};

// Auth validation utility
const validateAuth = (token: string | null, isAuthenticated: boolean): { valid: boolean; message?: string } => {
  if (!isAuthenticated || !token) {
    return { valid: false, message: 'Please log in to access this feature.' };
  }
  return { valid: true };
};

const useAgentStore = create<AgentState & AgentActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      login: async (email, password, remember) => {
        set({ isLoading: true, error: null });
        try {
          // Input validation
          if (!email || !password) {
            throw new Error('Email and password are required.');
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/auth/agent-login`,
            { email, password },
            { timeout: 15000 }
          );

          const { data } = response.data;
          
          if (!data || !data.token) {
            throw new Error('Invalid response from server.');
          }
          
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
          const errorMessage = handleApiError(error, 'Login failed. Please check your credentials.');
          set({ 
            error: errorMessage,
            isAuthenticated: false,
          });
          throw new Error(errorMessage);
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
          
          if (!data || !data.token) {
            throw new Error('Invalid response from server.');
          }
          
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
          const errorMessage = handleApiError(error, 'Registration failed. Please try again.');
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
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/agent/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 15000,
            }
          );
          
          const data = response.data.result;
          
          if (!data) {
            throw new Error('Invalid profile data received.');
          }
          
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
          const errorMessage = handleApiError(error, 'Failed to fetch profile.');
          set({ 
            error: errorMessage,
          });
          if (error.response?.status === 401) {
            // Auto-logout on unauthorized
            setTimeout(() => get().logout(), 2000);
          }
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      updateAgentProfile: async (updatedData) => {
        set({ isLoading: true });
        try {
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          const response = await axios.patch(
            `${API_BASE_URL}/api/v1/agent/profile`,
            updatedData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': updatedData instanceof FormData ? 'multipart/form-data' : 'application/json',
              },
              timeout: 15000,
            }
          );
          
          const data = response.data.data;
          
          if (!data) {
            throw new Error('Invalid response from server.');
          }
          
          set({
            agentInfo: {
              ...get().agentInfo!,
              ...data,
            },
          });
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to update profile.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          if (!email) {
            throw new Error('Email is required.');
          }

          await axios.post(
            `${API_BASE_URL}/api/v1/auth/forgot-password`,
            { email },
            { timeout: 15000 }
          );
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to send password reset email.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          if (!token || !password) {
            throw new Error('Token and password are required.');
          }

          if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long.');
          }

          await axios.post(
            `${API_BASE_URL}/api/v1/auth/reset-password`,
            { token, password },
            { timeout: 15000 }
          );
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to reset password.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      enlistApartment: async (apartmentId: string, markedUpPrice?: number, agentPercentage?: number) => {
        set({ isLoading: true, error: null });
        
        try {
          const { token, agentInfo, isAuthenticated } = get();
          
          console.log('🔍 Enlist Property Debug:', {
            token: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
            agentInfo: {
              id: agentInfo?.id,
              status: agentInfo?.status,
              isVerified: agentInfo?.isVerified,
              email: agentInfo?.email
            },
            isAuthenticated,
            apartmentId,
            markedUpPrice,
            agentPercentage
          });

          // 1. Verify agent is logged in and token is valid
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            return { 
              success: false, 
              message: authValidation.message ?? "Authentication failed." 
            };
          }

          // 2. Check if agent is verified - Enhanced check
          if (!agentInfo?.isVerified && agentInfo?.status !== "VERIFIED") {
            return { 
              success: false, 
              message: "Your account needs to be verified before you can enlist properties. Please complete verification." 
            };
          }

          // 3. Validate input parameters
          if (!apartmentId || apartmentId.trim() === '') {
            return { 
              success: false, 
              message: "Property ID is required." 
            };
          }

          // 4. Validate that we have exactly one pricing option
          const hasMarkupPrice = markedUpPrice !== undefined && markedUpPrice !== null;
          const hasAgentPercentage = agentPercentage !== undefined && agentPercentage !== null;
          
          if (hasMarkupPrice && hasAgentPercentage) {
            return { 
              success: false, 
              message: "Please select only one pricing option: either markup price OR agent percentage." 
            };
          }
          
          if (!hasMarkupPrice && !hasAgentPercentage) {
            return { 
              success: false, 
              message: "Please select a pricing option." 
            };
          }

          if (hasMarkupPrice && markedUpPrice < 0) {
            return { 
              success: false, 
              message: "Marked up price cannot be negative." 
            };
          }

          if (hasAgentPercentage && (agentPercentage <= 0 || agentPercentage > 100)) {
            return { 
              success: false, 
              message: "Agent percentage must be between 1 and 100." 
            };
          }

          console.log('Making API request to enlist property...');

          // 5. Prepare request data based on selected option
          const requestData: any = { 
            apartmentId: apartmentId.trim()
          };
          
          if (hasMarkupPrice) {
            requestData.markedUpPrice = markedUpPrice;
          } else if (hasAgentPercentage) {
            requestData.agentPercentage = agentPercentage;
          }

          console.log('Request data:', requestData);

          // 6. Make API request with enhanced headers
          const response = await axios.post(
            `${API_BASE_URL}/api/v1/agent/enlist-property`,
            requestData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              timeout: 15000,
            }
          );
          
          console.log('Enlist property response:', response);

          // 7. Handle different response formats
          let successMessage = "Property added successfully to your listings!";
          
          if (response.data?.message) {
            successMessage = response.data.message;
          } else if (response.data?.data?.message) {
            successMessage = response.data.data.message;
          }

          // 8. Refresh the enlisted properties
          await get().fetchEnlistedProperties(1, 10);
          
          return { success: true, message: successMessage };
          
        } catch (error: any) {
          console.error('❌ Enlist property error:', error);
          
          // Enhanced error logging
          if (error.response) {
            console.error('Error response:', {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers
            });
          } else if (error.request) {
            console.error('No response received:', error.request);
          }
          
          const errorMessage = handleApiError(error, 'Failed to add property. Please try again.');
          
          set({ 
            error: errorMessage,
          });
          
          return { success: false, message: errorMessage };
        } finally {
          set({ isLoading: false });
        }
      },
      
      removeApartment: async (apartmentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          if (!apartmentId) {
            throw new Error('Apartment ID is required.');
          }

          await axios.delete(
            `${API_BASE_URL}/api/v1/agent/remove-apartment`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              data: { apartmentId },
              timeout: 15000,
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
          const errorMessage = handleApiError(error, 'Failed to remove apartment.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchEnlistedProperties: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/agent/agent-listing`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { page, limit },
              timeout: 15000,
            }
          );
          
          const { data } = response.data;
          
          if (!data) {
            throw new Error('Invalid response format.');
          }
          
          set({
            enlistedProperties: page === 1 ? data.properties || data : [...get().enlistedProperties, ...(data.properties || data)],
            currentPropertyPage: page,
            totalProperties: data.totalCount || data.length || 0,
            hasMoreProperties: data.hasMore || ((data.properties || data) && (data.properties || data).length === limit),
          });
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to fetch enlisted properties.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      fetchPropertiesBySlug: async (slug: string, page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          if (!slug) {
            throw new Error('Slug is required.');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/agent/${slug}/properties`,
            {
              params: { page, limit },
              timeout: 15000,
            }
          );
          
          const { data } = response.data;
          return data;
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to fetch properties by slug.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
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
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/list-agents`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: { page, limit },
              timeout: 15000,
            }
          );
          
          const result = response.data;
          
          if (!result) {
            throw new Error('Invalid response from server.');
          }
          
          set({
            agents: result?.data?.agentDataWithoutPassword || [],
            totalAgents: result.pagination?.totalAgents || 0,
            totalPages: result.pagination?.totalPages || 1,
            currentAgentPage: result.pagination?.currentPage || page,
            itemsPerPage: result.pagination?.itemsPerPage || limit,
          });
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to fetch agents.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      updateAgentVerification: async (agentId: string, field: 'front_id_status' | 'back_id_status', status: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          if (!agentId) {
            throw new Error('Agent ID is required.');
          }

          await axios.patch(
            `${API_BASE_URL}/api/v1/admin/agents/${agentId}/verification`,
            { [field]: status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 15000,
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
          const errorMessage = handleApiError(error, 'Failed to update agent verification.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },

      updateAgentStatus: async (agentId: string, status: string) => {
        set({ isLoading: true, error: null });
        try {
          const { token, isAuthenticated } = get();
          const authValidation = validateAuth(token, isAuthenticated);
          if (!authValidation.valid) {
            throw new Error(authValidation.message);
          }

          if (!agentId || !status) {
            throw new Error('Agent ID and status are required.');
          }

          const response = await axios.put(
            `${API_BASE_URL}/api/v1/admin/verify-agent`,
            { agentId, status },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              timeout: 15000,
            }
          );

          const updatedAgent = response.data.data;
          
          if (!updatedAgent) {
            throw new Error('Invalid response from server.');
          }
          
          set({
            agents: get().agents.map(agent => 
              agent.id === agentId 
                ? { ...agent, status: updatedAgent.status }
                : agent
            ),
          });
        } catch (error: any) {
          const errorMessage = handleApiError(error, 'Failed to update agent status.');
          set({ 
            error: errorMessage,
          });
          throw new Error(errorMessage);
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
              timeout: 15000,
            }
          );
          
          console.log('API Response:', response.data);
          
          const result = response.data;
          
          if (!result) {
            throw new Error('Invalid response from server.');
          }
          
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
            status: prop.status === 'unavailable' ? 'unavailable' : 'available',
            location: prop.location || prop.address || '',
            amenities: getAmenitiesArray(prop.amenities),
            agentPercentage: prop.agentPercentage || 10,
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
          const errorMessage = handleApiError(error, 'Failed to fetch properties');
          set({ 
            error: errorMessage,
            loading: false,
            publicProperties: [],
          });
          throw new Error(errorMessage);
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