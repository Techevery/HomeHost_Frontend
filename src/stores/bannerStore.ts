// stores/bannerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cloudinaryId: string;
  isActive: boolean;
  order: number;
  targetUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface BannerState {
  banners: Banner[];
  currentBanner: Banner | null;
  loading: boolean;
  error: string | null;
}

interface BannerActions {
  fetchBanners: () => Promise<void>;
  fetchBannerById: (id: string) => Promise<void>;
  createBanner: (formData: FormData) => Promise<void>;
  updateBanner: (id: string, updatedData: Partial<Banner> | FormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentBanner: () => void;
}

const initialState: BannerState = {
  banners: [],
  currentBanner: null,
  loading: false,
  error: null,
};


const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || 'https://homeyhost.ng/api'


const useBannerStore = create<BannerState & BannerActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchBanners: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL }/api/v1/admin/banners`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ banners: response.data.data });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch banners',
          });
          toast.error('Failed to fetch banners');
        } finally {
          set({ loading: false });
        }
      },
      
      fetchBannerById: async (id) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/banners/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ currentBanner: response.data.data });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch banner details',
          });
          toast.error('Failed to fetch banner details');
        } finally {
          set({ loading: false });
        }
      },
      
      createBanner: async (formData) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/banners`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            banners: [...state.banners, response.data.data],
          }));
          
          toast.success('Banner created successfully!');
          return response.data.data;
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || 'Failed to create banner';
          set({ error: errorMsg });
          toast.error(errorMsg);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      updateBanner: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
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
            `${API_BASE_URL}/api/v1/admin/banners/${id}`,
            isFormData ? updatedData : JSON.stringify(updatedData),
            config
          );
          
          set((state) => ({
            banners: state.banners.map(banner => 
              banner.id === id ? { ...banner, ...response.data.data } : banner
            ),
            currentBanner: state.currentBanner?.id === id ? 
              { ...state.currentBanner, ...response.data.data } : 
              state.currentBanner,
          }));
          
          toast.success('Banner updated successfully!');
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update banner',
          });
          toast.error('Failed to update banner');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      deleteBanner: async (id) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          await axios.delete(
            `${API_BASE_URL}/api/v1/admin/banners/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            banners: state.banners.filter(banner => banner.id !== id),
            currentBanner: state.currentBanner?.id === id ? null : state.currentBanner,
          }));
          
          toast.success('Banner deleted successfully!');
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete banner',
          });
          toast.error('Failed to delete banner');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      clearCurrentBanner: () => {
        set({ currentBanner: null });
      },
    }),
    {
      name: 'banner-storage',
      partialize: (state) => ({
        banners: state.banners,
        currentBanner: state.currentBanner,
      }),
    }
  )
);

export default useBannerStore;