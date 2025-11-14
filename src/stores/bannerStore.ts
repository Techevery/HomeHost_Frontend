import { create } from "zustand";
import axios from "axios";

interface Banner {
  id: string;
  name: string;
  description: string;
  image_url: string;
  status?: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

interface BannerState {
  banners: Banner[];
  currentBanner: Banner | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface BannerActions {
  fetchBanners: () => Promise<void>;
  fetchBanner: () => Promise<void>;
  fetchBannerById: (id: string) => Promise<void>;
  createBanner: (formData: FormData) => Promise<void>;
  updateBanner: (id: string, formData: FormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  clearError: () => void;
  checkAuth: () => boolean;
  handleAuthError: (error: any) => void;
}

// Helper function to get authentication token
const getAuthToken = (): string | null => {
  // Check multiple possible storage locations
  return localStorage.getItem('authToken') || 
         localStorage.getItem('token') ||
         sessionStorage.getItem('authToken') ||
         sessionStorage.getItem('token');
};

// Helper function to handle API errors
const handleApiError = (error: any): string => {
  console.error('API Error:', error);
  
  // Handle authentication errors
  if (error.response?.status === 401) {
    return "Your session has expired. Please log in again.";
  }
  
  if (error.response?.status === 403) {
    return "You don't have permission to perform this action.";
  }
  
  return error.response?.data?.message || 
         error.response?.data?.error || 
         error.message || 
         "An unexpected error occurred";
};

const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

const useBannerStore = create<BannerState & BannerActions>((set, get) => ({
  banners: [],
  currentBanner: null,
  isLoading: false,
  error: null,
  isAuthenticated: !!getAuthToken(),

  checkAuth: () => {
    const isAuth = !!getAuthToken();
    set({ isAuthenticated: isAuth });
    return isAuth;
  },

  handleAuthError: (error: any) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      set({ isAuthenticated: false });
    }
  },

  fetchBanners: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/banner`);
      
      console.log('API Response:', response);
      
      let banners = [];
      if (response.data && response.data.data) {
        banners = response.data.data;
      } else if (Array.isArray(response.data)) {
        banners = response.data;
      } else if (response.data) {
        banners = [response.data];
      }
      
      set({ 
        banners: banners,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchBanner: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/banner`);
      
      console.log('Fetch Banner API Response:', response);
      
      let banners = [];
      if (response.data && response.data.data) {
        banners = response.data.data;
      } else if (Array.isArray(response.data)) {
        banners = response.data;
      } else if (response.data) {
        banners = [response.data];
      }
      
      set({ 
        banners: banners,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchBannerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      const headers: any = {};
      
      // Only add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await axios.get(`${API_BASE_URL}/api/v1/banner/${id}`, {
        headers
      });
      
      const banner = response.data.data || response.data.result || response.data;
      
      set({ 
        currentBanner: banner,
        isLoading: false 
      });
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: error.response?.status === 401 ? false : get().isAuthenticated
      });
      throw error;
    }
  },

  createBanner: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        set({ isAuthenticated: false });
        throw new Error("Authentication required. Please log in.");
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/banner/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Refresh banners list after creation
      const { fetchBanners } = get();
      await fetchBanners();

      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: error.response?.status === 401 ? false : get().isAuthenticated
      });
      throw error;
    }
  },

  updateBanner: async (id: string, formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        set({ isAuthenticated: false });
        throw new Error("Authentication required. Please log in.");
      }

      const response = await axios.patch(`${API_BASE_URL}/api/v1/banner/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });

      // Refresh banners list after update
      const { fetchBanners } = get();
      await fetchBanners();

      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: error.response?.status === 401 ? false : get().isAuthenticated
      });
      throw error;
    }
  },

  deleteBanner: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        set({ isAuthenticated: false });
        throw new Error("Authentication required. Please log in.");
      }

      const response = await axios.delete(`${API_BASE_URL}/api/v1/banner/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // Update local state immediately
      const { banners } = get();
      const updatedBanners = banners.filter(banner => banner.id !== id);
      
      set({ 
        banners: updatedBanners,
        isLoading: false 
      });
      
      return response.data;
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: error.response?.status === 401 ? false : get().isAuthenticated
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
export default useBannerStore;