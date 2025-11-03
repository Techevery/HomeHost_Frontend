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
  id?: string;
  booking_start_date: Date | null;
  booking_end_date: Date | null;
  apartment_id?: string;
  status?: string;
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
  bookingDates: BookingDate[];
  managedBookings: Booking[];
}

interface BookingActions {
  fetchBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  setSelectedDates: (dates: Date[]) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  clearError: () => void;
  clearCurrentBooking: () => void;

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
  bookingDates: [],
  managedBookings: [],
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

          const bookingsData = response.data.data || response.data || [];

          const processedBookings = bookingsData.map((booking: any) => ({
            ...booking,
            selected_dates: booking.selected_dates || [],
            start_date: booking.start_date
              ? new Date(booking.start_date)
              : null,
            end_date: booking.end_date ? new Date(booking.end_date) : null,
            booking_start_date: booking.booking_start_date
              ? new Date(booking.booking_start_date)
              : null,
            booking_end_date: booking.booking_end_date
              ? new Date(booking.booking_end_date)
              : null,
          }));

          set({ bookings: processedBookings });
        } catch (error: any) {
          console.error("❌ Failed to fetch bookings:", error);
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

          console.log("📖 Fetch booking by ID response:", response.data);

          const bookingData = response.data.data || response.data;

          // Process the booking data
          const processedBooking = {
            ...bookingData,
            selected_dates: bookingData.selected_dates || [],
            start_date: bookingData.start_date
              ? new Date(bookingData.start_date)
              : null,
            end_date: bookingData.end_date
              ? new Date(bookingData.end_date)
              : null,
            booking_start_date: bookingData.booking_start_date
              ? new Date(bookingData.booking_start_date)
              : null,
            booking_end_date: bookingData.booking_end_date
              ? new Date(bookingData.booking_end_date)
              : null,
          };

          set({
            currentBooking: processedBooking,
            selectedDates: processedBooking.selected_dates || [],
            startDate: processedBooking.start_date,
            endDate: processedBooking.end_date,
          });
        } catch (error: any) {
          console.error("❌ Failed to fetch booking details:", error);
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

      fetchBookingDates: async (apartmentId: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          const headers: any = {
            "Content-Type": "application/json",
          };

          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/booking-dates`,
            {
              params: {
                apartmentId: apartmentId,
              },
              headers,
            },
          );

          console.log("📅 Booking dates API response:", response.data);

          const bookingDatesData = response.data.data || response.data || [];

          const processedBookingDates = bookingDatesData.map(
            (bookingDate: any) => ({
              booking_start_date: bookingDate.booking_start_date
                ? new Date(bookingDate.booking_start_date)
                : null,
              booking_end_date: bookingDate.booking_end_date
                ? new Date(bookingDate.booking_end_date)
                : null,
              ...bookingDate,
            }),
          );

          console.log("📅 Processed booking dates:", processedBookingDates);

          set({ bookingDates: processedBookingDates });
        } catch (error: any) {
          console.error("❌ Failed to fetch booking dates:", error);
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

      manageBooking: async (email?: string, phoneNumber?: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");

          const headers: any = {
            "Content-Type": "application/json",
          };

          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/manage-booking`,
            {
              params: {
                ...(email && { email }),
                ...(phoneNumber && { phoneNumber }),
              },
              headers,
            },
          );

          console.log("🔍 Manage booking API response:", response.data);

          const managedBookingsData = response.data.data || response.data || [];

          const processedBookings = managedBookingsData.map((booking: any) => ({
            ...booking,
            selected_dates: booking.selected_dates || [],
            start_date: booking.start_date
              ? new Date(booking.start_date)
              : null,
            end_date: booking.end_date ? new Date(booking.end_date) : null,
            booking_start_date: booking.booking_start_date
              ? new Date(booking.booking_start_date)
              : null,
            booking_end_date: booking.booking_end_date
              ? new Date(booking.booking_end_date)
              : null,
          }));

          set({ managedBookings: processedBookings });

          if (processedBookings.length > 0) {
            toast.success(`Found ${processedBookings.length} booking(s)`);
          } else {
            toast.error("No bookings found with the provided criteria");
          }
        } catch (error: any) {
          console.error("❌ Failed to manage booking:", error);
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
        bookingDates: state.bookingDates,
        managedBookings: state.managedBookings,
      }),
    },
  ),
);

export default useBookingStore;
