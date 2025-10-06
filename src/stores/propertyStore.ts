// stores/propertyStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Property {
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

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;
}

interface PropertyActions {
  fetchProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (formData: FormData) => Promise<void>;
  updateProperty: (id: string, updatedData: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentProperty: () => void;
}

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
};


const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || 'https://homeyhost.ng/api'

const usePropertyStore = create<PropertyState & PropertyActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchProperties: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/properties`
          );
          set({ properties: response.data.data });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch properties',
          });
          toast.error('Failed to fetch properties');
        } finally {
          set({ loading: false });
        }
      },
      
      fetchPropertyById: async (id) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/properties/${id}`
          );
          set({ currentProperty: response.data.data });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch property details',
          });
          toast.error('Failed to fetch property details');
        } finally {
          set({ loading: false });
        }
      },
      
      createProperty: async (formData) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/admin/upload-property`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            properties: [...state.properties, response.data.data],
          }));
          
          toast.success('Property created successfully!');
          return response.data.data;
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || 'Failed to create property';
          set({ error: errorMsg });
          toast.error(errorMsg);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      updateProperty: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.patch(
            `${API_BASE_URL}/api/v1/admin/properties/${id}`,
            updatedData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            properties: state.properties.map(property => 
              property.id === id ? { ...property, ...response.data.data } : property
            ),
            currentProperty: state.currentProperty?.id === id ? 
              { ...state.currentProperty, ...response.data.data } : 
              state.currentProperty,
          }));
          
          toast.success('Property updated successfully!');
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update property',
          });
          toast.error('Failed to update property');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      deleteProperty: async (id) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          await axios.delete(
            `${API_BASE_URL}/api/v1/admin/properties/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            properties: state.properties.filter(property => property.id !== id),
            currentProperty: state.currentProperty?.id === id ? null : state.currentProperty,
          }));
          
          toast.success('Property deleted successfully!');
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to delete property',
          });
          toast.error('Failed to delete property');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      clearCurrentProperty: () => {
        set({ currentProperty: null });
      },
    }),
    {
      name: 'property-storage',
      partialize: (state) => ({
        properties: state.properties,
        currentProperty: state.currentProperty,
      }),
    }
  )
);

export default usePropertyStore;