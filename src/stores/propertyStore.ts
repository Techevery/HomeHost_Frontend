import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: string;
  images: string[];
  location: string;
  amenities: string[];
  agentPercentage: string;
  adminId: string;
  description?: string;
  rating?: number;
  reviews?: number;
}

interface PropertyState {
  properties: Property[];
  currentProperty: Property | null;
  loading: boolean;
  error: string | null;
}

interface PropertyActions {
  fetchProperties: (page?: number, limit?: number) => Promise<void>;
  fetchPropertyById: (id: string) => Promise<void>;
  createProperty: (formData: FormData) => Promise<void>;
  updateProperty: (
    id: string,
    propertyData: FormData | Partial<Property>,
  ) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  searchProperties: (query: string) => Promise<Property[]>;
  clearError: () => void;
  clearCurrentProperty: () => void;
  updatePropertiesList: (updatedProperty: Property) => void;
  removePropertyFromList: (propertyId: string) => void;
}

const initialState: PropertyState = {
  properties: [],
  currentProperty: null,
  loading: false,
  error: null,
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

const usePropertyStore = create<PropertyState & PropertyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchProperties: async (page = 1, limit = 50) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Please login to continue");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/properties`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                page,
                limit,
              },
            },
          );

          let propertiesData: Property[] = [];

          if (response?.data?.data?.apartments) {
            propertiesData = response.data.data.apartments;
          } else if (response?.data?.data) {
            propertiesData = response.data.data;
          } else if (response?.data?.apartments) {
            propertiesData = response.data.apartments;
          } else if (Array.isArray(response.data)) {
            propertiesData = response.data;
          }

          // Ensure proper data structure
          const processedProperties = propertiesData.map((property) => ({
            ...property,
            amenities: Array.isArray(property.amenities)
              ? property.amenities
              : typeof property.amenities === "string"
              ? [property.amenities]
              : [],
            images: Array.isArray(property.images)
              ? property.images
              : typeof property.images === "string"
              ? [property.images]
              : [],
            price: property.price?.toString() || "0",
            agentPercentage: property.agentPercentage?.toString() || "0",
          }));

          set({ properties: processedProperties });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch properties";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchPropertyById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Please login to continue");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/properties/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const propertyData = response.data.data;
          const processedProperty = {
            ...propertyData,
            amenities: Array.isArray(propertyData.amenities)
              ? propertyData.amenities
              : typeof propertyData.amenities === "string"
              ? [propertyData.amenities]
              : [],
            images: Array.isArray(propertyData.images)
              ? propertyData.images
              : typeof propertyData.images === "string"
              ? [propertyData.images]
              : [],
            price: propertyData.price?.toString() || "0",
            agentPercentage: propertyData.agentPercentage?.toString() || "0",
          };

          set({ currentProperty: processedProperty });
          return processedProperty;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to fetch property details";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      createProperty: async (formData: FormData) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Please login to continue");
          }

          // Ensure numeric fields are properly formatted
          const price = formData.get("price");
          const agentPercentage = formData.get("agentPercentage");
          const bedroom = formData.get("bedroom");

          if (price) formData.set("price", price.toString());
          if (agentPercentage)
            formData.set("agentPercentage", agentPercentage.toString());
          if (bedroom) formData.set("bedroom", bedroom.toString());

          // Ensure location field is set
          const location = formData.get("location");
          if (!location) {
            formData.set("location", "");
          }

          // Calculate and log total payload size
          let totalPayloadSize = 0;
          formData.forEach((value, key) => {
            if (value instanceof File) {
              totalPayloadSize += value.size;
              console.log(`${key}: ${(value.size / (1024 * 1024)).toFixed(2)}MB`);
            } else if (typeof value === 'string') {
              totalPayloadSize += new Blob([value]).size;
            }
          });
          console.log(`Total payload size: ${(totalPayloadSize / (1024 * 1024)).toFixed(2)}MB`);

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/admin/upload-property`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
              // Set timeout and maxContentLength for better error handling
              timeout: 60000, // 60 seconds timeout
              maxContentLength: 100 * 1024 * 1024, // 100MB max response size
              maxBodyLength: 50 * 1024 * 1024, // 50MB max request body size
            },
          );

          const newProperty = response.data.data;
          const processedProperty = {
            ...newProperty,
            amenities: Array.isArray(newProperty.amenities)
              ? newProperty.amenities
              : typeof newProperty.amenities === "string"
              ? [newProperty.amenities]
              : [],
            images: Array.isArray(newProperty.images)
              ? newProperty.images
              : typeof newProperty.images === "string"
              ? [newProperty.images]
              : [],
            price: newProperty.price?.toString() || "0",
            agentPercentage: newProperty.agentPercentage?.toString() || "0",
          };

          // Update local state
          set((state) => ({
            properties: [processedProperty, ...state.properties],
          }));

          toast.success("Property created successfully!");
          return processedProperty;
        } catch (error: any) {
          let errorMessage = "Failed to create property";
          
          // Handle specific error cases
          if (error.response?.status === 413) {
            errorMessage = "Payload too large. Please reduce the size of images or text content.";
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = "Request timed out. The upload may be too large. Try reducing image sizes.";
          } else if (error.message?.includes('Network Error')) {
            errorMessage = "Network error. Please check your connection and try again.";
          } else if (error.response?.status === 504) {
            errorMessage = "Gateway timeout. The server took too long to respond. Try uploading smaller files.";
          } else {
            errorMessage = error.response?.data?.message ||
              error.response?.data?.error ||
              error.message ||
              "Failed to create property";
          }
          
          set({ error: errorMessage });
          toast.error(errorMessage);
          
          // Log detailed error information for debugging
          console.error("Create property error details:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            code: error.code,
          });
          
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateProperty: async (
        id: string,
        propertyData: FormData | Partial<Property>,
      ) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          let response;

          if (propertyData instanceof FormData) {
            // For FormData (with images)
            response = await axios.patch(
              `${API_BASE_URL}/api/v1/admin/update-apartment/${id}`,
              propertyData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${token}`,
                },
                timeout: 60000,
                maxContentLength: 100 * 1024 * 1024,
                maxBodyLength: 50 * 1024 * 1024,
              },
            );
          } else {
            // For JSON data
            const dataToSend = { ...propertyData };
            let sendData = { ...dataToSend };
            if (Array.isArray(dataToSend.amenities)) {
              sendData = { ...dataToSend, amenities: dataToSend.amenities };
            }

            response = await axios.patch(
              `${API_BASE_URL}/api/v1/admin/properties/${id}`,
              sendData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );
          }

          const updatedProperty = response.data.data;
          const processedProperty = {
            ...updatedProperty,
            amenities: Array.isArray(updatedProperty.amenities)
              ? updatedProperty.amenities
              : typeof updatedProperty.amenities === "string"
              ? [updatedProperty.amenities]
              : [],
            images: Array.isArray(updatedProperty.images)
              ? updatedProperty.images
              : typeof updatedProperty.images === "string"
              ? [updatedProperty.images]
              : [],
            price: updatedProperty.price?.toString() || "0",
            agentPercentage: updatedProperty.agentPercentage?.toString() || "0",
          };

          // Update local state
          set((state) => ({
            properties: state.properties.map((property) =>
              property.id === id ? processedProperty : property,
            ),
            currentProperty:
              state.currentProperty?.id === id
                ? processedProperty
                : state.currentProperty,
          }));

          toast.success("Property updated successfully!");
          return processedProperty;
        } catch (error: any) {
          let errorMessage = "Failed to update property";
          
          if (error.response?.status === 413) {
            errorMessage = "Payload too large. Please reduce image sizes.";
          } else if (error.code === 'ECONNABORTED') {
            errorMessage = "Request timed out. Try uploading smaller images.";
          } else {
            errorMessage = error.response?.data?.message ||
              error.response?.data?.error ||
              "Failed to update property";
          }
          
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteProperty: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          await axios.delete(
            `${API_BASE_URL}/api/v1/admin/delete-apartment/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          // Update local state
          set((state) => ({
            properties: state.properties.filter(
              (property) => property.id !== id,
            ),
            currentProperty:
              state.currentProperty?.id === id ? null : state.currentProperty,
          }));

          toast.success("Property deleted successfully!");
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to delete property";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      searchProperties: async (query: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/admin/search-apartment`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              params: {
                searchTerm: query,
              },
            },
          );

          let propertiesData: Property[] = [];

          if (response?.data?.data?.apartments) {
            propertiesData = response.data.data.apartments;
          } else if (response?.data?.data) {
            propertiesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            propertiesData = response.data;
          }

          // Ensure proper data structure
          const processedProperties = propertiesData.map((property) => ({
            ...property,
            amenities: Array.isArray(property.amenities)
              ? property.amenities
              : typeof property.amenities === "string"
              ? [property.amenities]
              : [],
            images: Array.isArray(property.images)
              ? property.images
              : typeof property.images === "string"
              ? [property.images]
              : [],
            price: property.price?.toString() || "0",
            agentPercentage: property.agentPercentage?.toString() || "0",
          }));

          return processedProperties;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to search properties";
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updatePropertiesList: (updatedProperty: Property) => {
        set((state) => ({
          properties: state.properties.map((property) =>
            property.id === updatedProperty.id ? updatedProperty : property,
          ),
        }));
      },

      removePropertyFromList: (propertyId: string) => {
        set((state) => ({
          properties: state.properties.filter(
            (property) => property.id !== propertyId,
          ),
        }));
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentProperty: () => {
        set({ currentProperty: null });
      },
    }),
    {
      name: "property-storage",
      partialize: (state) => ({
        properties: state.properties,
        currentProperty: state.currentProperty,
      }),
    },
  ),
);

export default usePropertyStore;