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
  channel?: string;
  charge?: number;
  date_paid?: string;
  payment_month?: number;
  payment_year?: number;
  metadata?: any;
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

interface BookingPeriod {
  id: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  transaction_id: string;
  apartment_id: string;
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
  booking_period_id?: string;
  transaction?: Transaction;
  apartment?: Apartment;
  booking_period?: {
    start_date: string;
    end_date: string;
    duration_days: number;
  };
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
  fetchAllBookingsForAdmin: () => Promise<void>;
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

          // Handle different response structures
          const bookingsData = response.data.data || response.data || [];

          const processedBookings = bookingsData.map((booking: any) => ({
            id: booking.id,
            apartment_id: booking.apartment_id,
            availability: booking.availability,
            status: booking.status,
            created_at: booking.created_at,
            transaction_id: booking.transaction_id,
            booking_period_id: booking.booking_period_id,
            transaction: booking.transaction
              ? {
                  id: booking.transaction.id,
                  reference: booking.transaction.reference,
                  status: booking.transaction.status,
                  amount: booking.transaction.amount,
                  email: booking.transaction.email,
                  phone_number: booking.transaction.phone_number,
                  apartment_id: booking.transaction.apartment_id,
                  agent_id: booking.transaction.agent_id,
                  booking_start_date: booking.transaction.booking_start_date,
                  booking_end_date: booking.transaction.booking_end_date,
                  duration_days: booking.transaction.duration_days,
                  created_at: booking.transaction.created_at,
                  channel: booking.transaction.channel,
                  charge: booking.transaction.charge,
                  date_paid: booking.transaction.date_paid,
                  payment_month: booking.transaction.payment_month,
                  payment_year: booking.transaction.payment_year,
                  metadata: booking.transaction.metadata,
                }
              : undefined,
            apartment: booking.apartment
              ? {
                  id: booking.apartment.id,
                  name: booking.apartment.name,
                  address: booking.apartment.address,
                  type: booking.apartment.type,
                  servicing: booking.apartment.servicing,
                  price: booking.apartment.price,
                  agent: booking.apartment.agent,
                }
              : undefined,
            booking_period: booking.booking_period
              ? {
                  start_date: booking.booking_period.start_date,
                  end_date: booking.booking_period.end_date,
                  duration_days: booking.booking_period.duration_days,
                }
              : undefined,
            // Backward compatibility fields
            booking_start_date:
              booking.booking_start_date || booking.booking_period?.start_date,
            booking_end_date:
              booking.booking_end_date || booking.booking_period?.end_date,
            duration_days:
              booking.duration_days || booking.booking_period?.duration_days,
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

      fetchAllBookingsForAdmin: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/admin`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          console.log("🔍 RAW API RESPONSE:", response);
          console.log("🔍 Response data:", response.data);
          console.log("🔍 Response data type:", typeof response.data);
          console.log("🔍 Is array?", Array.isArray(response.data));

          // Handle different response structures safely
          let bookingsData = [];

          if (Array.isArray(response.data)) {
            bookingsData = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            bookingsData = response.data.data;
          } else if (response.data && Array.isArray(response.data.bookings)) {
            bookingsData = response.data.bookings;
          } else if (
            response.data &&
            response.data.data &&
            typeof response.data.data === "object"
          ) {
            // Handle case where data is a single object
            bookingsData = [response.data.data];
          } else if (response.data && typeof response.data === "object") {
            // If it's a single booking object, wrap it in array
            bookingsData = [response.data];
          } else {
            console.warn(
              "⚠️ Unexpected API response structure, using empty array",
            );
            bookingsData = [];
          }

          console.log("📊 Final bookingsData to process:", bookingsData);

          const processedBookings = bookingsData.map((booking: any) => ({
            id: booking.id || `temp-${Math.random()}`,
            apartment_id: booking.apartment_id || "",
            availability: booking.availability || false,
            status: booking.status || "pending",
            created_at: booking.created_at || new Date().toISOString(),
            transaction_id: booking.transaction_id || "",
            booking_period_id: booking.booking_period_id || "",
            guest_name: booking.guest_name || "",
            guest_phone: booking.guest_phone || "",
            guest_email: booking.guest_email || "",
            duration_days: booking.duration_days || 0,
            booking_start_date: booking.booking_start_date || "",
            booking_end_date: booking.booking_end_date || "",
            amount: booking.amount || "",
            transaction: booking.transaction
              ? {
                  id: booking.transaction.id,
                  reference: booking.transaction.reference || "",
                  status: booking.transaction.status || "",
                  amount: booking.transaction.amount || 0,
                  email: booking.transaction.email || "",
                  phone_number: booking.transaction.phone_number || "",
                  booking_start_date:
                    booking.transaction.booking_start_date || "",
                  booking_end_date: booking.transaction.booking_end_date || "",
                  duration_days: booking.transaction.duration_days || 0,
                }
              : undefined,
            apartment: booking.apartment
              ? {
                  id: booking.apartment.id || "",
                  name: booking.apartment.name || "Unknown Apartment",
                  address: booking.apartment.address || "",
                  type: booking.apartment.type || "",
                  servicing: booking.apartment.servicing || "",
                  agent: booking.apartment.agent || "",
                }
              : {
                  id: "",
                  name: "Unknown Apartment",
                  address: "",
                  type: "",
                  servicing: "",
                  agent: "",
                },
            booking_period: booking.booking_period
              ? {
                  start_date: booking.booking_period.start_date || "",
                  end_date: booking.booking_period.end_date || "",
                  duration_days: booking.booking_period.duration_days || 0,
                }
              : undefined,
          }));

          console.log("✅ Final processed bookings:", processedBookings);
          set({ bookings: processedBookings });
        } catch (error: any) {
          console.error("❌ Failed to fetch admin bookings:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
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

          // Process the booking data according to backend structure
          const processedBooking = {
            ...bookingData,
            transaction: bookingData.transaction
              ? {
                  ...bookingData.transaction,
                  booking_start_date: bookingData.transaction.booking_start_date
                    ? new Date(bookingData.transaction.booking_start_date)
                    : null,
                  booking_end_date: bookingData.transaction.booking_end_date
                    ? new Date(bookingData.transaction.booking_end_date)
                    : null,
                }
              : undefined,
            booking_period: bookingData.booking_period
              ? {
                  ...bookingData.booking_period,
                  start_date: bookingData.booking_period.start_date
                    ? new Date(bookingData.booking_period.start_date)
                    : null,
                  end_date: bookingData.booking_period.end_date
                    ? new Date(bookingData.booking_period.end_date)
                    : null,
                }
              : undefined,
          };

          set({
            currentBooking: processedBooking,
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

  // Update the fetchBookingDates method in bookingStore.ts

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

    // Updated to use params instead of query string in URL
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/booking/booking-dates/${apartmentId}`,
      {
        headers,
      },
    );

    console.log("📅 Booking dates API response:", response.data);

    let bookingDatesData = [];

    if (Array.isArray(response.data)) {
      bookingDatesData = response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      bookingDatesData = response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      bookingDatesData = response.data;
    } else {
      // Handle single object response
      bookingDatesData = [response.data];
    }

    const processedBookingDates = bookingDatesData
      .map((bookingDate: any) => {
        // Based on the backend service, the data comes from apartmentLog with booking_period
        let startDate = null;
        let endDate = null;

        // Primary: Use booking_period data from apartmentLog
        if (bookingDate.booking_period) {
          startDate = bookingDate.booking_period.start_date
            ? new Date(bookingDate.booking_period.start_date)
            : null;
          endDate = bookingDate.booking_period.end_date
            ? new Date(bookingDate.booking_period.end_date)
            : null;
        }
        // Fallback: Check for direct date fields in apartmentLog
        else if (bookingDate.start_date || bookingDate.end_date) {
          startDate = bookingDate.start_date
            ? new Date(bookingDate.start_date)
            : null;
          endDate = bookingDate.end_date
            ? new Date(bookingDate.end_date)
            : null;
        }

        // Only return valid date ranges
        if (startDate && endDate) {
          return {
            id: bookingDate.id || `booking-${Math.random()}`,
            booking_start_date: startDate,
            booking_end_date: endDate,
            apartment_id: bookingDate.apartment_id || apartmentId,
            status: bookingDate.status || "booked",
          };
        }
        
        return null;
      })
      .filter((bookingDate: any) => bookingDate !== null);

    console.log("📅 Processed booking dates:", processedBookingDates);
    console.log(
      "📅 Processed booking dates count:",
      processedBookingDates.length,
    );

    set({ bookingDates: processedBookingDates });
  } catch (error: any) {
    console.error("❌ Failed to fetch booking dates:", error);
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
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

          const params: any = {};
          if (email) params.email = email;
          if (phoneNumber) params.phoneNumber = phoneNumber;

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking/manage-booking`,
            {
              params,
              headers,
            },
          );

          console.log("🔍 Manage booking API response:", response.data);

          const managedBookingsData = response.data.data || response.data || [];

          const processedBookings = managedBookingsData.map((booking: any) => {
            const bookingStartDate =
              booking.transaction?.booking_start_date ||
              booking.booking_start_date;
            const bookingEndDate =
              booking.transaction?.booking_end_date || booking.booking_end_date;
            const durationDays =
              booking.transaction?.duration_days || booking.duration_days;

            return {
              id: booking.id,
              apartment_id: booking.apartment_id,
              availability: booking.availability,
              status: booking.status,
              created_at: booking.created_at,
              transaction_id: booking.transaction_id,
              booking_period_id: booking.booking_period_id,
              booking_start_date: bookingStartDate,
              booking_end_date: bookingEndDate,
              duration_days: durationDays,
              amount: booking.transaction?.amount?.toString(),

              apartment: booking.apartment
                ? {
                    id: booking.apartment.id,
                    name: booking.apartment.name,
                    address: booking.apartment.address,
                    price: booking.apartment.price,
                  }
                : undefined,
              transaction: booking.transaction
                ? {
                    id: booking.transaction.id,
                    email: booking.transaction.email,
                    phone_number: booking.transaction.phone_number,
                    status: booking.transaction.status,
                    amount: booking.transaction.amount,
                    booking_start_date: booking.transaction.booking_start_date,
                    booking_end_date: booking.transaction.booking_end_date,
                    duration_days: booking.transaction.duration_days,
                    reference: booking.transaction.reference,
                  }
                : undefined,
            };
          });

          console.log("✅ Processed bookings:", processedBookings);
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
        managedBookings: state.managedBookings,
      }),
    },
  ),
);

export default useBookingStore;
