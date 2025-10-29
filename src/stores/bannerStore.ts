// banner.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface Banner {
  id: string;
  name: string;
  description: string;
  images: string[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface BannerState {
  banners: Banner[];
  currentBanner: Banner | null;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalBanners: number;
  totalPages: number;
  hasMore: boolean;
}

interface BannerActions {
  createBanner: (formData: FormData) => Promise<void>;
  fetchBanners: (page?: number, limit?: number) => Promise<void>;
  fetchBannerById: (id: string) => Promise<void>;
  updateBanner: (id: string, formData: FormData) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;

  // State Management
  clearError: () => void;
  clearCurrentBanner: () => void;
  setLoading: (loading: boolean) => void;
}

const initialState: BannerState = {
  banners: [],
  currentBanner: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalBanners: 0,
  totalPages: 1,
  hasMore: false,
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

// Enhanced error handler utility (reused from agentstore)
const handleApiError = (error: any, defaultMessage: string): string => {
  console.error("API Error:", error);

  if (error.response) {
    const status = error.response.status;
    const serverMessage =
      error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return serverMessage || "Bad request. Please check your input.";
      case 401:
        return serverMessage || "Session expired. Please log in again.";
      case 403:
        return (
          serverMessage ||
          "Access denied. You do not have permission for this action."
        );
      case 404:
        return serverMessage || "Resource not found.";
      case 409:
        return serverMessage || "Conflict. This resource already exists.";
      case 422:
        return (
          serverMessage || "Validation error. Please check your input data."
        );
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return serverMessage || "Server error. Please try again later.";
      case 502:
        return "Service temporarily unavailable. Please try again later.";
      case 503:
        return "Service unavailable. Please try again later.";
      default:
        return serverMessage || `Error ${status}. Please try again.`;
    }
  } else if (error.request) {
    return "Network error. Please check your internet connection and try again.";
  } else if (error.code === "ECONNABORTED") {
    return "Request timeout. Please try again.";
  } else {
    return defaultMessage;
  }
};

const getAdminToken = (): string | null => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    return token;
  }

  try {
    const adminStoreModule = require("./admin");
    const adminStore = adminStoreModule.default;
    const state = adminStore.getState();
    return state.token;
  } catch (error) {
    // If we can't access the admin store, return null
    return null;
  }
};

// Check if admin is authenticated
const isAdminAuthenticated = (): boolean => {
  const token = getAdminToken();
  return !!token;
};

const useBannerStore = create<BannerState & BannerActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      createBanner: async (formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          // Get admin token
          const token = getAdminToken();

          if (!token || !isAdminAuthenticated()) {
            throw new Error("Please log in as admin to access this feature.");
          }

          // Input validation
          const name = formData.get("name") as string;
          const description = formData.get("description") as string;
          const images = formData.getAll("image") as File[];

          if (!name || !description) {
            throw new Error("Name and description are required.");
          }

          if (!images || images.length === 0) {
            throw new Error("At least one image is required.");
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/banner/create`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              timeout: 30000,
            },
          );

          const { data } = response.data;

          if (!data) {
            throw new Error("Invalid response from server.");
          }

          // Add the new banner to the list
          const newBanner: Banner = {
            id: data.id,
            name: data.name,
            description: data.description,
            images: data.images || [],
            status: data.status || "active",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          set((state) => ({
            banners: [newBanner, ...state.banners],
            totalBanners: state.totalBanners + 1,
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = handleApiError(
            error,
            "Failed to create banner. Please try again.",
          );
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // In the fetchBanners method of bannerStore.ts
      fetchBanners: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.get(`${API_BASE_URL}/api/v1/banner`, {
            params: { page, limit },
            timeout: 15000,
          });

          const result = response.data;

          if (!result) {
            throw new Error("Invalid response from server.");
          }

          // Handle different response formats
          let banners: any[] = [];
          let totalCount = 0;

          if (result.data?.banners && Array.isArray(result.data.banners)) {
            banners = result.data.banners;
            totalCount = result.data.totalCount || banners.length;
          } else if (Array.isArray(result.data)) {
            banners = result.data;
            totalCount = result.totalCount || banners.length;
          } else if (Array.isArray(result.banners)) {
            banners = result.banners;
            totalCount = result.totalCount || banners.length;
          } else if (Array.isArray(result)) {
            banners = result;
            totalCount = banners.length;
          }

          console.log("Raw banner data from API:", banners); // Debug log

          const validatedBanners: Banner[] = banners.map((banner) => {
            // Convert backend format to frontend format
            const images = banner.image_url ? [banner.image_url] : [];
            const description = banner.description || banner.desscription || "";

            console.log("Processing banner:", {
              id: banner.id,
              image_url: banner.image_url,
              images,
              description,
            }); // Debug log

            return {
              id: banner.id || "",
              name: banner.name || "",
              description: description,
              images: images,
              status: banner.status === "inactive" ? "inactive" : "active",
              createdAt:
                banner.created_at ||
                banner.createdAt ||
                new Date().toISOString(),
              updatedAt:
                banner.updated_at ||
                banner.updatedAt ||
                new Date().toISOString(),
            };
          });

          set({
            banners:
              page === 1
                ? validatedBanners
                : [...get().banners, ...validatedBanners],
            currentPage: page,
            totalBanners: totalCount,
            totalPages: Math.ceil(totalCount / limit),
            hasMore: validatedBanners.length === limit,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = handleApiError(
            error,
            "Failed to fetch banners. Please try again.",
          );
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      // Also update fetchBannerById method similarly
      fetchBannerById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          if (!id) {
            throw new Error("Banner ID is required.");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/banner/${id}`,
            {
              timeout: 15000,
            },
          );

          const result = response.data;

          if (!result) {
            throw new Error("Invalid response from server.");
          }

          const bannerData = result.result || result.data || result;

          console.log("Raw single banner data:", bannerData); // Debug log

          // Convert backend format to frontend format
          const images = bannerData.image_url ? [bannerData.image_url] : [];
          const description =
            bannerData.description || bannerData.desscription || "";

          const validatedBanner: Banner = {
            id: bannerData.id || "",
            name: bannerData.name || "",
            description: description,
            images: images,
            status: bannerData.status === "inactive" ? "inactive" : "active",
            createdAt:
              bannerData.created_at ||
              bannerData.createdAt ||
              new Date().toISOString(),
            updatedAt:
              bannerData.updated_at ||
              bannerData.updatedAt ||
              new Date().toISOString(),
          };

          set({
            currentBanner: validatedBanner,
            isLoading: false,
          });
        } catch (error: any) {
          const errorMessage = handleApiError(
            error,
            "Failed to fetch banner details. Please try again.",
          );
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      updateBanner: async (id: string, formData: FormData) => {
        set({ isLoading: true, error: null });
        try {
          const token = getAdminToken();

          if (!token || !isAdminAuthenticated()) {
            throw new Error("Please log in as admin to access this feature.");
          }

          if (!id) {
            throw new Error("Banner ID is required.");
          }

          const response = await axios.put(
            `${API_BASE_URL}/api/v1/banner/${id}`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              timeout: 30000,
            },
          );

          const { data } = response.data;

          if (!data) {
            throw new Error("Invalid response from server.");
          }

          const updatedBanner: Banner = {
            id: data.id,
            name: data.name,
            description: data.description,
            images: data.images || [],
            status: data.status || "active",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };

          set((state) => ({
            banners: state.banners.map((banner) =>
              banner.id === id ? updatedBanner : banner,
            ),
            currentBanner:
              state.currentBanner?.id === id
                ? updatedBanner
                : state.currentBanner,
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = handleApiError(
            error,
            "Failed to update banner. Please try again.",
          );
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      deleteBanner: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const token = getAdminToken();

          if (!token || !isAdminAuthenticated()) {
            throw new Error("Please log in as admin to access this feature.");
          }

          if (!id) {
            throw new Error("Banner ID is required.");
          }

          await axios.delete(`${API_BASE_URL}/api/v1/banner/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 15000,
          });

          set((state) => ({
            banners: state.banners.filter((banner) => banner.id !== id),
            totalBanners: state.totalBanners - 1,
            currentBanner:
              state.currentBanner?.id === id ? null : state.currentBanner,
            isLoading: false,
          }));
        } catch (error: any) {
          const errorMessage = handleApiError(
            error,
            "Failed to delete banner. Please try again.",
          );
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentBanner: () => {
        set({ currentBanner: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "banner-storage",
      partialize: (state) => ({
        banners: state.banners,
        currentBanner: state.currentBanner,
        currentPage: state.currentPage,
        totalBanners: state.totalBanners,
      }),
    },
  ),
);

export default useBannerStore;
