import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Agent {
  name: string;
}

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
  agent?: Agent;
  name: string;
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
  duration_days?: number;
  transaction_id: string;
  booking_period_id?: string;
  transaction?: Transaction;
  apartment?: Apartment;
  booking_period?: {
    id?: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    isEdited?: boolean;
    isDeleted?: boolean;
    expired?: boolean;
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
  bookingRequests: Booking[];
  expiredBookings: Booking[];
  deletedBookings: Booking[];
  agentBookings: Booking[]; 
  isEditing: boolean;
  isDeleting: boolean;
}

interface BookingActions {
  fetchBookings: () => Promise<void>;
  fetchBookingRequests: () => Promise<void>;
  fetchExpiredBookings: () => Promise<void>;
  fetchDeletedBookings: () => Promise<void>;
  fetchAgentBookings: () => Promise<void>; 
  fetchBookingById: (id: string) => Promise<void>;
  setSelectedDates: (dates: Date[]) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  clearError: () => void;
  clearCurrentBooking: () => void;
  fetchBookingDates: (apartmentId: string) => Promise<void>;
  manageBooking: (email?: string, phoneNumber?: string) => Promise<void>;
  fetchAllBookingsForAdmin: () => Promise<void>;
  editBookingDates: (bookingPeriodId: string, newStartDate: Date, newEndDate: Date) => Promise<void>;
  deleteBooking: (bookingPeriodId: string) => Promise<void>;
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
  bookingRequests: [],
  expiredBookings: [],
  deletedBookings: [],
  agentBookings: [],
  isEditing: false,
  isDeleting: false,
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

          const bookingsData = response.data || [];

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
                  agent: booking.transaction.agent,
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
                  id: booking.booking_period.id,
                  start_date: booking.booking_period.start_date,
                  end_date: booking.booking_period.end_date,
                  duration_days: booking.booking_period.duration_days || 0,
                  isEdited: booking.booking_period.isEdited || false,
                  isDeleted: booking.booking_period.isDeleted || false,
                  expired: booking.booking_period.expired || false,
                }
              : undefined,
            booking_start_date:
              booking.booking_start_date || booking.booking_period?.start_date || "",
            booking_end_date:
              booking.booking_end_date || booking.booking_period?.end_date || "",
            duration_days:
              booking.duration_days || booking.booking_period?.duration_days || 0,
            guest_name: booking.transaction?.metadata?.fullName || booking.guest_name,
            guest_phone: booking.transaction?.phone_number || booking.guest_phone,
            guest_email: booking.transaction?.email || booking.guest_email,
          }));

          set({ bookings: processedBookings });
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

      fetchBookingRequests: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(`${API_BASE_URL}/api/v1/booking/request`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const bookingsData = response.data || [];

          const processedRequests = bookingsData.map((bookingPeriod: any) => ({
            id: bookingPeriod.id,
            apartment_id: bookingPeriod.apartment_id || bookingPeriod.apartment?.id || "",
            availability: true,
            status: bookingPeriod.status || "pending",
            created_at: bookingPeriod.created_at || new Date().toISOString(),
            transaction_id: bookingPeriod.transaction_id || bookingPeriod.transaction?.id || "",
            booking_period_id: bookingPeriod.id,
            transaction: bookingPeriod.transaction
              ? {
                  id: bookingPeriod.transaction.id,
                  reference: bookingPeriod.transaction.reference || "",
                  status: bookingPeriod.transaction.status || "pending",
                  amount: bookingPeriod.transaction.amount || 0,
                  email: bookingPeriod.transaction.email || "",
                  phone_number: bookingPeriod.transaction.phone_number || "",
                  booking_start_date: bookingPeriod.transaction.booking_start_date,
                  booking_end_date: bookingPeriod.transaction.booking_end_date,
                  duration_days: bookingPeriod.transaction.duration_days,
                  created_at: bookingPeriod.transaction.created_at,
                  metadata: bookingPeriod.transaction.metadata,
                  agent: bookingPeriod.transaction.agent,
                }
              : undefined,
            apartment: bookingPeriod.apartment
              ? {
                  id: bookingPeriod.apartment.id || "",
                  name: bookingPeriod.apartment.name || "Unknown Apartment",
                  address: bookingPeriod.apartment.address || "",
                  type: bookingPeriod.apartment.type || "",
                  servicing: bookingPeriod.apartment.servicing || "",
                  agent: bookingPeriod.transaction?.agent?.name || "",
                }
              : undefined,
            booking_period: {
              id: bookingPeriod.id,
              start_date: bookingPeriod.start_date || "",
              end_date: bookingPeriod.end_date || "",
              duration_days: bookingPeriod.duration_days || 0,
              isEdited: bookingPeriod.isEdited || false,
              isDeleted: bookingPeriod.isDeleted || false,
              expired: bookingPeriod.expired || false,
            },
            booking_start_date: bookingPeriod.start_date || "",
            booking_end_date: bookingPeriod.end_date || "",
            duration_days: bookingPeriod.duration_days || 0,
            guest_name: bookingPeriod.transaction?.metadata?.fullName || "",
            guest_phone: bookingPeriod.transaction?.phone_number || "",
            guest_email: bookingPeriod.transaction?.email || "",
          }));

          set({ bookingRequests: processedRequests });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch booking requests";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

      fetchExpiredBookings: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(`${API_BASE_URL}/api/v1/booking/expire-bookings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

     

          const bookingsData = response.data.data || response.data || [];
          
          const processedExpiredBookings = bookingsData.map((bookingPeriod: any) => {
            const transaction = bookingPeriod.transaction || {};
            const apartment = bookingPeriod.apartment || {};
            const metadata = transaction.metadata || {};
            
            return {
              id: bookingPeriod.id,
              apartment_id: bookingPeriod.apartment_id || apartment.id || "",
              availability: false,
              status: bookingPeriod.isDeleted ? "deleted" : 
                     bookingPeriod.expired ? "expired" : 
                     "unknown",
              created_at: bookingPeriod.created_at || new Date().toISOString(),
              transaction_id: bookingPeriod.transaction_id || transaction.id || "",
              booking_period_id: bookingPeriod.id,
              transaction: {
                id: transaction.id || "",
                reference: transaction.reference || "",
                status: transaction.status || (bookingPeriod.isDeleted ? "cancelled" : "successful"),
                amount: transaction.amount || 0,
                email: transaction.email || "",
                phone_number: transaction.phone_number || metadata.phoneNumber || "",
                apartment_id: transaction.apartment_id || "",
                agent_id: transaction.agent?.id || "",
                booking_start_date: transaction.booking_start_date || bookingPeriod.start_date,
                booking_end_date: transaction.booking_end_date || bookingPeriod.end_date,
                duration_days: transaction.duration_days || bookingPeriod.duration_days,
                created_at: transaction.created_at || bookingPeriod.created_at,
                metadata: metadata,
                agent: transaction.agent || {},
              },
              apartment: {
                id: apartment.id || "",
                name: apartment.name || "Unknown Apartment",
                address: apartment.address || "",
                type: apartment.type || "",
                servicing: apartment.servicing || "",
                price: apartment.price || 0,
                agent: transaction.agent?.name || apartment.agent || "",
              },
              booking_period: {
                id: bookingPeriod.id,
                start_date: bookingPeriod.start_date || "",
                end_date: bookingPeriod.end_date || "",
                duration_days: bookingPeriod.duration_days || 0,
                isEdited: bookingPeriod.isEdited || false,
                isDeleted: bookingPeriod.isDeleted || false,
                expired: bookingPeriod.expired || false,
                new_start_date: bookingPeriod.new_start_date || null,
                new_end_date: bookingPeriod.new_end_date || null,
              },
              booking_start_date: bookingPeriod.start_date || "",
              booking_end_date: bookingPeriod.end_date || "",
              duration_days: bookingPeriod.duration_days || 0,
              guest_name: metadata.fullName || "",
              guest_phone: transaction.phone_number || metadata.phoneNumber || "",
              guest_email: transaction.email || "",
              amount: transaction.amount?.toString() || "0",
            };
          });

          set({ expiredBookings: processedExpiredBookings });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch expired bookings";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
      
      fetchDeletedBookings: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(`${API_BASE_URL}/api/v1/booking/deleted-bookings`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const bookingsData = response.data || [];

          const processedDeletedBookings = bookingsData.map((deletedBooking: any) => {
            const bookingPeriod = deletedBooking.booking_period;
            const transaction = bookingPeriod?.transaction;
            const apartment = bookingPeriod?.apartment;
            
            return {
              id: deletedBooking.id,
              apartment_id: bookingPeriod?.apartment_id || "",
              availability: false,
              status: "deleted",
              created_at: deletedBooking.created_at || new Date().toISOString(),
              transaction_id: transaction?.id || "",
              booking_period_id: bookingPeriod?.id || "",
              transaction: transaction
                ? {
                    id: transaction.id,
                    reference: transaction.reference || "",
                    status: transaction.status || "deleted",
                    amount: transaction.amount || 0,
                    email: transaction.email || "",
                    phone_number: transaction.phone_number || "",
                    booking_start_date: transaction.booking_start_date,
                    booking_end_date: transaction.booking_end_date,
                    duration_days: transaction.duration_days,
                    created_at: transaction.created_at,
                    metadata: transaction.metadata,
                  }
                : undefined,
              apartment: apartment
                ? {
                    id: apartment.id || "",
                    name: apartment.name || "Unknown Apartment",
                    address: apartment.address || "",
                  }
                : undefined,
              booking_period: bookingPeriod
                ? {
                    id: bookingPeriod.id,
                    start_date: bookingPeriod.start_date || "",
                    end_date: bookingPeriod.end_date || "",
                    duration_days: bookingPeriod.duration_days || 0,
                    isEdited: bookingPeriod.isEdited || false,
                    isDeleted: true,
                    expired: bookingPeriod.expired || false,
                  }
                : undefined,
              booking_start_date: bookingPeriod?.start_date || "",
              booking_end_date: bookingPeriod?.end_date || "",
              duration_days: bookingPeriod?.duration_days || 0,
              guest_name: transaction?.metadata?.fullName || "",
              guest_phone: transaction?.phone_number || "",
              guest_email: transaction?.email || "",
            };
          });

          set({ deletedBookings: processedDeletedBookings });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch deleted bookings";
          set({
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },

    
      fetchAgentBookings: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            throw new Error("Authentication token not found");
          }

          const response = await axios.get(`${API_BASE_URL}/api/v1/booking/agent-booking`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log("Agent bookings response:", response.data);

          const bookingsData = response.data || [];
          
          const processedAgentBookings = bookingsData.map((booking: any) => {
            const transaction = booking.transaction || {};
            const apartment = booking.apartment || {};
            
            return {
              id: booking.id,
              apartment_id: booking.apartment_id || "",
              availability: booking.availability || false,
              status: booking.status || "booked",
              created_at: booking.created_at || new Date().toISOString(),
              transaction_id: booking.transaction_id || "",
              booking_period_id: booking.booking_period_id || "",
              transaction: transaction
                ? {
                    id: transaction.id,
                    reference: transaction.reference || "",
                    status: transaction.status || "",
                    amount: transaction.amount || 0,
                    email: transaction.email || "",
                    phone_number: transaction.phone_number || "",
                    apartment_id: transaction.apartment_id || "",
                    agent_id: transaction.agent_id || "",
                    booking_start_date: transaction.booking_start_date,
                    booking_end_date: transaction.booking_end_date,
                    duration_days: transaction.duration_days,
                    created_at: transaction.created_at,
                    metadata: transaction.metadata,
                  }
                : undefined,
              apartment: apartment
                ? {
                    id: apartment.id,
                    name: apartment.name || "Unknown Apartment",
                    address: apartment.address || "",
                    type: apartment.type || "",
                    servicing: apartment.servicing || "",
                    price: apartment.price || 0,
                    agent: apartment.agent || "",
                  }
                : undefined,
              booking_period: booking.booking_period
                ? {
                    id: booking.booking_period.id,
                    start_date: booking.booking_period.start_date || "",
                    end_date: booking.booking_period.end_date || "",
                    duration_days: booking.booking_period.duration_days || 0,
                    isEdited: booking.booking_period.isEdited || false,
                    isDeleted: booking.booking_period.isDeleted || false,
                    expired: booking.booking_period.expired || false,
                  }
                : undefined,
              booking_start_date: booking.booking_start_date || "",
              booking_end_date: booking.booking_end_date || "",
              duration_days: booking.duration_days || 0,
              guest_name: transaction.metadata?.fullName || "",
              guest_phone: transaction.phone_number || "",
              guest_email: transaction.email || "",
              amount: transaction.amount?.toString() || "0",
            };
          });

          set({ agentBookings: processedAgentBookings });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to fetch agent bookings";
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
            bookingsData = [response.data.data];
          } else if (response.data && typeof response.data === "object") {
            bookingsData = [response.data];
          } else {
            bookingsData = [];
          }

          const processedBookings = bookingsData.map((booking: any) => ({
            id: booking.id || `temp-${Math.random()}`,
            apartment_id: booking.apartment_id || "",
            availability: booking.availability || false,
            status: booking.status || "pending",
            created_at: booking.created_at || new Date().toISOString(),
            transaction_id: booking.transaction_id || "",
            booking_period_id: booking.booking_period_id || "",
            guest_name: booking.transaction?.metadata?.fullName || booking.guest_name || "",
            guest_phone: booking.transaction?.phone_number || booking.guest_phone || "",
            guest_email: booking.transaction?.email || booking.guest_email || "",
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
                  metadata: booking.transaction.metadata || {},
                  agent: booking.transaction.agent || { name: "" }
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
                  id: booking.booking_period.id || "",
                  start_date: booking.booking_period.start_date || "",
                  end_date: booking.booking_period.end_date || "",
                  duration_days: booking.booking_period.duration_days || 0,
                  isEdited: booking.booking_period.isEdited || false,
                  isDeleted: booking.booking_period.isDeleted || false,
                  expired: booking.booking_period.expired || false,
                }
              : undefined,
          }));

          set({ bookings: processedBookings });
        } catch (error: any) {
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

          const bookingData = response.data.data || response.data;

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
                  id: bookingData.booking_period.id || "",
                  start_date: bookingData.booking_period.start_date
                    ? new Date(bookingData.booking_period.start_date)
                    : null,
                  end_date: bookingData.booking_period.end_date
                    ? new Date(bookingData.booking_period.end_date)
                    : null,
                  duration_days: bookingData.booking_period.duration_days || 0,
                  isEdited: bookingData.booking_period.isEdited || false,
                  isDeleted: bookingData.booking_period.isDeleted || false,
                  expired: bookingData.booking_period.expired || false,
                }
              : undefined,
          };

          set({
            currentBooking: processedBooking,
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
            `${API_BASE_URL}/api/v1/booking/booking-dates/${apartmentId}`,
            {
              headers,
            },
          );

          let bookingDatesData = [];

          if (Array.isArray(response.data)) {
            bookingDatesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            bookingDatesData = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            bookingDatesData = response.data;
          } else {
            bookingDatesData = [response.data];
          }

          const processedBookingDates = bookingDatesData
            .map((bookingDate: any) => {
              let startDate = null;
              let endDate = null;

              if (bookingDate.booking_period) {
                startDate = bookingDate.booking_period.start_date
                  ? new Date(bookingDate.booking_period.start_date)
                  : null;
                endDate = bookingDate.booking_period.end_date
                  ? new Date(bookingDate.booking_period.end_date)
                  : null;
              } else if (bookingDate.start_date || bookingDate.end_date) {
                startDate = bookingDate.start_date
                  ? new Date(bookingDate.start_date)
                  : null;
                endDate = bookingDate.end_date
                  ? new Date(bookingDate.end_date)
                  : null;
              }

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

          set({ bookingDates: processedBookingDates });
        } catch (error: any) {
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

          const managedBookingsData = response.data.data || response.data || [];

          const processedBookings = managedBookingsData.map((booking: any) => {
            const bookingStartDate =
              booking.transaction?.booking_start_date ||
              booking.booking_start_date || "";
            const bookingEndDate =
              booking.transaction?.booking_end_date || booking.booking_end_date || "";
            const durationDays =
              booking.transaction?.duration_days || booking.duration_days || 0;

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
              guest_name: booking.transaction?.metadata?.fullName || booking.guest_name,
              guest_phone: booking.transaction?.phone_number || booking.guest_phone,
              guest_email: booking.transaction?.email || booking.guest_email,

              apartment: booking.apartment
                ? {
                    id: booking.apartment.id,
                    name: booking.apartment.name,
                    address: booking.apartment.address,
                    price: booking.apartment.price,
                    agent: booking.apartment.agent,
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
                    duration_days: booking.transaction.duration_days || 0,
                    reference: booking.transaction.reference,
                    metadata: booking.transaction.metadata,
                    agent: booking.transaction.agent,
                  }
                : undefined,
              booking_period: booking.booking_period
                ? {
                    id: booking.booking_period.id,
                    start_date: booking.booking_period.start_date,
                    end_date: booking.booking_period.end_date,
                    duration_days: booking.booking_period.duration_days || 0,
                    isEdited: booking.booking_period.isEdited || false,
                    isDeleted: booking.booking_period.isDeleted || false,
                    expired: booking.booking_period.expired || false,
                  }
                : undefined,
            };
          });

          set({ managedBookings: processedBookings });

          if (processedBookings.length > 0) {
            toast.success(`Found ${processedBookings.length} booking(s)`);
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

 editBookingDates: async (bookingId: string, newStartDate: Date, newEndDate: Date) => {
  set({ isEditing: true, error: null });
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const requestUrl = `${API_BASE_URL}/api/v1/booking/edit-booking/${bookingId}`;
    const requestBody = {
      newStartDate: newStartDate.toISOString(),
      newEndDate: newEndDate.toISOString(),
    };
    
  

    const response = await axios.patch(
      requestUrl,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );


    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format from server");
    }

    const updatedBooking = response.data.data;

    const timeDiff = newStartDate.getTime() - newEndDate.getTime();
    const newDurationDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const { bookings, managedBookings, bookingRequests, expiredBookings, agentBookings, currentBooking } = get();

    const updateBookingInArray = (booking: Booking) => {
      if (booking.booking_period?.id === bookingId || booking.id === bookingId) {
        const updatedBookingData = {
          ...booking,
          booking_start_date: newStartDate.toISOString(),
          booking_end_date: newEndDate.toISOString(),
          duration_days: newDurationDays,
          booking_period: booking.booking_period
            ? {
                ...booking.booking_period,
                start_date: newStartDate.toISOString(),
                end_date: newEndDate.toISOString(),
                duration_days: newDurationDays,
                isEdited: true,
                isDeleted: booking.booking_period.isDeleted || false,
                expired: booking.booking_period.expired || false,
              }
            : {
                id: bookingId,
                start_date: newStartDate.toISOString(),
                end_date: newEndDate.toISOString(),
                duration_days: newDurationDays,
                isEdited: true,
                isDeleted: false,
                expired: false,
              },
        };
        return updatedBookingData;
      }
      return booking;
    };

    const updatedBookings = bookings.map(updateBookingInArray);
    const updatedManagedBookings = managedBookings.map(updateBookingInArray);
    const updatedBookingRequests = bookingRequests.map(updateBookingInArray);
    const updatedExpiredBookings = expiredBookings.map(updateBookingInArray);
    const updatedAgentBookings = agentBookings.map(updateBookingInArray);

    const updatedCurrentBooking = currentBooking ? updateBookingInArray(currentBooking) : currentBooking;

    set({
      bookings: updatedBookings,
      managedBookings: updatedManagedBookings,
      bookingRequests: updatedBookingRequests,
      expiredBookings: updatedExpiredBookings,
      agentBookings: updatedAgentBookings,
      currentBooking: updatedCurrentBooking,
    });

    toast.success(response.data.message || "Booking dates updated successfully!");
    
    return updatedBooking;
  } catch (error: any) {
  
    
    let errorMessage = "Failed to edit booking dates";
    
    if (error.response) {
    
      
      errorMessage = error.response.data?.error || 
                     error.response.data?.message || 
                     errorMessage;
    } else if (error.request) {
      errorMessage = "No response received from server";
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    set({
      error: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  } finally {
    set({ isEditing: false });
  }
},

    deleteBooking: async (bookingId: string) => {
  set({ isDeleting: true, error: null });
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const requestUrl = `${API_BASE_URL}/api/v1/booking/delete-booking/${bookingId}`;
    
  

    const response = await axios.post(
      requestUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

  

    if (!response.data) {
      throw new Error("No response received from server");
    }

    const deletedBookingData = response.data.data || response.data;

    const { bookings, managedBookings, bookingRequests, expiredBookings, agentBookings, currentBooking } = get();

    const updateBookingToDeleted = (booking: Booking) => {
      if (booking.booking_period?.id === bookingId || booking.id === bookingId) {
        return {
          ...booking,
          status: "cancelled",
          availability: true,
          booking_period: booking.booking_period
            ? {
                ...booking.booking_period,
                isDeleted: true,
              }
            : { 
                id: bookingId,  
                isDeleted: true, 
                start_date: booking.start_date || "", 
                end_date: booking.end_date || "", 
                duration_days: booking.duration_days || 0,
              },
        };
      }
      return booking;
    };

    const updatedBookings = bookings.map(updateBookingToDeleted);
    const updatedManagedBookings = managedBookings.map(updateBookingToDeleted);
    const updatedBookingRequests = bookingRequests.map(updateBookingToDeleted);
    const updatedExpiredBookings = expiredBookings.map(updateBookingToDeleted);
    const updatedAgentBookings = agentBookings.map(updateBookingToDeleted);

    const updatedCurrentBooking = currentBooking?.booking_period?.id === bookingId || currentBooking?.id === bookingId
      ? updateBookingToDeleted(currentBooking)
      : currentBooking;

    set({
      bookings: updatedBookings,
      managedBookings: updatedManagedBookings,
      bookingRequests: updatedBookingRequests,
      expiredBookings: updatedExpiredBookings,
      agentBookings: updatedAgentBookings,
      currentBooking: updatedCurrentBooking,
    });

    toast.success(response.data.message || "Booking deleted successfully!");
    
    return deletedBookingData;
  } catch (error: any) {
  
    
    let errorMessage = "Failed to delete booking";
    
    if (error.response) {
     
      
      errorMessage = error.response.data?.error || 
                     error.response.data?.message || 
                     errorMessage;
    } else if (error.request) {
      errorMessage = "No response received from server";
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    set({
      error: errorMessage,
    });
    toast.error(errorMessage);
    throw error;
  } finally {
    set({ isDeleting: false });
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
        bookingRequests: state.bookingRequests,
        expiredBookings: state.expiredBookings,
        deletedBookings: state.deletedBookings,
        agentBookings: state.agentBookings, 
      }),
    },
  ),
);

export default useBookingStore;