// stores/bookingStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Transaction {
  id: string;
  reference: string;
  status: string;
  amount: number;
  email: string;
  phone_number?: string;
  apartment_id: string;
  agent_id: string;
  booking_start_date?: string;
  booking_end_date?: string;
  duration_days?: number;
  created_at: string;
}

interface Apartment {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  price?: number;
  agent: string;
}

interface Booking {
  id: string;
  apartment_id: string;
  availability: boolean;
  booking_start_date: string;
  booking_end_date: string;
  status: string;
  created_at: string;
  duration_days: number;
  transaction_id: string;
  transaction?: Transaction;
  apartment?: Apartment;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
  next_of_kin_name?: string;
  next_of_kin_phone?: string;
  discount_code?: string;
  amount?: string;
  receipt_id?: string;
  special_requests?: string;
  selected_dates?: Date[];
  start_date?: string;
  end_date?: string;
  guests?: number;
  email?: string;
  phone_number?: string;
}

interface Receipt {
  id: string;
  booking_id: string;
  amount: string;
  payment_date: string;
  payment_time: string;
  download_url?: string;
  email_sent: boolean;
}

interface BookingDate {
  booking_start_date: Date | null;
  booking_end_date: Date | null;
}

interface BookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  receipts: Receipt[];
  currentReceipt: Receipt | null;
  loading: boolean;
  error: string | null;
  selectedDates: Date[];
  startDate: Date | null;
  endDate: Date | null;
  bookingDates: BookingDate[]; // Added for fetchBookingDates
  managedBookings: Booking[]; // Added for manageBooking
}

interface BookingActions {
  fetchBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  setSelectedDates: (dates: Date[]) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  clearError: () => void;
  clearCurrentBooking: () => void;
  // New actions
  fetchBookingDates: (apartmentId: string) => Promise<void>;
  manageBooking: (email?: string, phoneNumber?: string) => Promise<void>;
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  receipts: [],
  currentReceipt: null,
  loading: false,
  error: null,
  selectedDates: [],
  startDate: null,
  endDate: null,
  bookingDates: [], // Added
  managedBookings: [], // Added
};

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      fetchBookings: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(`${API_BASE_URL}/api/v1/booking`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Handle different response structures
          const bookingsData = response.data.data || response.data || [];
          set({ bookings: bookingsData });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch bookings";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      fetchBookingById: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const bookingData = response.data.data || response.data;
          set({
            currentBooking: bookingData,
            selectedDates: bookingData.selected_dates || [],
            startDate: bookingData.start_date
              ? new Date(bookingData.start_date)
              : null,
            endDate: bookingData.end_date
              ? new Date(bookingData.end_date)
              : null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch booking details";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      // New function: Fetch booking dates for a specific apartment
      fetchBookingDates: async (apartmentId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/booking-dates`,
            {
              params: { apartmentId },
            },
          );

          const bookingDatesData = response.data.data || response.data || [];
          set({ bookingDates: bookingDatesData });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch booking dates";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      // New function: Manage booking by email and/or phone number
      manageBooking: async (email?: string, phoneNumber?: string) => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/manage-booking`,
            {
              params: {
                ...(email && { email }),
                ...(phoneNumber && { phoneNumber }),
              },
            },
          );

          const managedBookingsData = response.data.data || [];
          set({ managedBookings: managedBookingsData });

          // Show success message if bookings were found
          if (managedBookingsData.length > 0) {
            toast.success(`Found ${managedBookingsData.length} booking(s)`);
          } else {
            toast.error("No bookings found with the provided criteria");
          }
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to manage booking";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      setSelectedDates: (dates: Date[]) => {
        set({ selectedDates: dates });
      },

      setStartDate: (date: Date | null) => {
        set({ startDate: date });
      },

      setEndDate: (date: Date | null) => {
        set({ endDate: date });
      },

      clearError: () => {
        set({ error: null });
      },

      clearCurrentBooking: () => {
        set({
          currentBooking: null,
          selectedDates: [],
          startDate: null,
          endDate: null,
        });
      },
    }),
    {
      name: "booking-storage",
      partialize: (state) => ({
        bookings: state.bookings,
        currentBooking: state.currentBooking,
        receipts: state.receipts,
        currentReceipt: state.currentReceipt,
        bookingDates: state.bookingDates, // Added to persistence
        managedBookings: state.managedBookings, // Added to persistence
      }),
    },
  ),
);

export default useBookingStore;
