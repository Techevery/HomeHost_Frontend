import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Agent {
  name: string;
  id: string;
  email?: string;
  phone_number?: string;
  contact?: string;
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
  location: string;
}

interface BookingPeriod {
  id?: string;
  start_date?: string;
  end_date?: string;
  booking_start_date: Date | null;
  booking_end_date: Date | null;
  apartment_id?: string;
  status?: string;
  transaction_id?: string;
  booking_period_id?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  expired?: boolean;
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
  // New fields for grouped bookings
  booking_periods?: Array<{
    id: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    isEdited: boolean;
    isDeleted: boolean;
    expired: boolean;
  }>;
  agent?: Agent;
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
  start_date?: string;
  end_date?: string;
  booking_start_date: Date | null;
  booking_end_date: Date | null;
  apartment_id?: string;
  status?: string;
  transaction_id?: string;
  booking_period_id?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  expired?: boolean;
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
  isFetchingBookings: boolean;
  isFetchingRequests: boolean;
  isFetchingAgentBookings: boolean;
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
  fetchBookingDates: (apartmentId: string) => Promise<BookingDate[]>;
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
  isFetchingBookings: false,
  isFetchingRequests: false,
  isFetchingAgentBookings: false,
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

      fetchBookingById: async (id: string): Promise<void> => {
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

          const rawData = response.data;
          let bookingData: any;

          if (rawData && rawData.data !== undefined) {
            bookingData = rawData.data;
          } else if (rawData) {
            bookingData = rawData;
          } else {
            throw new Error("No booking data received from server");
          }

          const processedBooking: Booking = {
            id: bookingData.id || id,
            apartment_id: bookingData.apartment_id || "",
            availability: bookingData.availability || false,
            status: bookingData.status || "pending",
            created_at: bookingData.created_at || new Date().toISOString(),
            transaction_id: bookingData.transaction_id || "",
            booking_period_id: bookingData.booking_period_id || "",

            booking_start_date:
              bookingData.booking_start_date ||
              bookingData.booking_period?.start_date ||
              bookingData.transaction?.booking_start_date ||
              "",
            booking_end_date:
              bookingData.booking_end_date ||
              bookingData.booking_period?.end_date ||
              bookingData.transaction?.booking_end_date ||
              "",
            duration_days:
              bookingData.duration_days ||
              bookingData.booking_period?.duration_days ||
              bookingData.transaction?.duration_days ||
              0,

            guest_name:
              bookingData.guest_name ||
              bookingData.transaction?.metadata?.fullName ||
              "",
            guest_phone:
              bookingData.guest_phone ||
              bookingData.transaction?.phone_number ||
              "",
            guest_email:
              bookingData.guest_email ||
              bookingData.transaction?.email ||
              "",

            amount: bookingData.amount || bookingData.transaction?.amount?.toString() || "",
            receipt_id: bookingData.receipt_id || "",
            special_requests: bookingData.special_requests || "",

            transaction: bookingData.transaction
              ? {
                  id: bookingData.transaction.id || "",
                  reference: bookingData.transaction.reference || "",
                  status: bookingData.transaction.status || "",
                  amount: bookingData.transaction.amount || 0,
                  email: bookingData.transaction.email || "",
                  phone_number: bookingData.transaction.phone_number || "",
                  apartment_id: bookingData.transaction.apartment_id || "",
                  agent_id: bookingData.transaction.agent_id || "",
                  booking_start_date: bookingData.transaction.booking_start_date || undefined,
                  booking_end_date: bookingData.transaction.booking_end_date || undefined,
                  duration_days: bookingData.transaction.duration_days || 0,
                  created_at: bookingData.transaction.created_at || "",
                  channel: bookingData.transaction.channel || "",
                  charge: bookingData.transaction.charge || 0,
                  date_paid: bookingData.transaction.date_paid || "",
                  payment_month: bookingData.transaction.payment_month,
                  payment_year: bookingData.transaction.payment_year,
                  metadata: bookingData.transaction.metadata || {},
                  agent: bookingData.transaction.agent || { name: "" },
                  name: bookingData.transaction.metadata?.fullName || "",
                }
              : undefined,

            apartment: bookingData.apartment
              ? {
                  id: bookingData.apartment.id || "",
                  name: bookingData.apartment.name || "Unknown Apartment",
                  address: bookingData.apartment.address || "",
                  type: bookingData.apartment.type || "",
                  servicing: bookingData.apartment.servicing || "",
                  price: bookingData.apartment.price || 0,
                  agent: bookingData.apartment.agent || "",
                  location: bookingData.apartment.location || "",
                }
              : undefined,

            booking_period: bookingData.booking_period
              ? {
                  id: bookingData.booking_period.id || "",
                  start_date: bookingData.booking_period.start_date || "",
                  end_date: bookingData.booking_period.end_date || "",
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
            error.message ||
            "Failed to fetch booking details";

          set({
            error: errorMessage,
          });
          toast.error(errorMessage);

          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchBookingDates: async (apartmentId: string): Promise<BookingDate[]> => {
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
              timeout: 10000,
            },
          );

          let bookingDatesData = [];

          if (Array.isArray(response.data)) {
            bookingDatesData = response.data;
          } else if (response.data && Array.isArray(response.data.data)) {
            bookingDatesData = response.data.data;
          } else if (response.data && response.data.data) {
            bookingDatesData = [response.data.data];
          } else if (response.data && typeof response.data === "object") {
            const keys = Object.keys(response.data);
            if (keys.length > 0 && Array.isArray(response.data[keys[0]])) {
              bookingDatesData = response.data[keys[0]];
            } else {
              bookingDatesData = [response.data];
            }
          } else {
            bookingDatesData = [];
          }

          const processedBookingDates = bookingDatesData
            .map((item: any, index: number) => {
              try {
                const startDateStr = item.start_date || item.booking_start_date;
                const endDateStr = item.end_date || item.booking_end_date;

                if (!startDateStr || !endDateStr) {
                  return null;
                }

                const startDate = new Date(startDateStr);
                const endDate = new Date(endDateStr);

                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  return null;
                }

                return {
                  id: item.id || `booking-${index}-${Date.now()}`,
                  start_date: startDateStr,
                  end_date: endDateStr,
                  booking_start_date: startDate,
                  booking_end_date: endDate,
                  apartment_id: apartmentId,
                  status: "booked",
                  transaction_id: item.transaction_id,
                  booking_period_id: item.booking_period_id || item.id,
                };
              } catch (error) {
                return null;
              }
            })
            .filter((item: any) => item !== null);

          set({ bookingDates: processedBookingDates });

          return processedBookingDates;

        } catch (error: any) {
          let errorMessage = "Failed to fetch booking dates";

          if (error.response) {
            errorMessage = error.response.data?.error ||
              error.response.data?.message ||
              errorMessage;
          } else if (error.request) {
            errorMessage = "No response received from server. Please check your connection.";
          } else {
            errorMessage = error.message || errorMessage;
          }

          set({
            error: errorMessage,
          });

          if (!error.response || error.response.status !== 404) {
            toast.error(errorMessage);
          }

          return [];
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

          // Group bookings by transaction_id to combine multiple booking periods
          const bookingsByTransaction = new Map();

          managedBookingsData.forEach((booking: any) => {
            const transactionId = booking.transaction_id;

            if (!bookingsByTransaction.has(transactionId)) {
              // Create a new booking entry for this transaction
              bookingsByTransaction.set(transactionId, {
                id: booking.id,
                apartment_id: booking.apartment_id,
                status: booking.status,
                created_at: booking.created_at,
                transaction_id: transactionId,
                booking_start_date: booking.transaction?.booking_start_date || booking.start_date,
                booking_end_date: booking.transaction?.booking_end_date || booking.end_date,
                duration_days: booking.transaction?.duration_days || 0,
                amount: booking.transaction?.amount?.toString(),
                guest_name: booking.transaction?.metadata?.fullName || booking.guest_name,
                guest_phone: booking.transaction?.phone_number || booking.guest_phone,
                guest_email: booking.transaction?.email || booking.guest_email,

                // Collect all booking periods for this transaction
                booking_periods: [{
                  id: booking.id,
                  start_date: booking.start_date,
                  end_date: booking.end_date,
                  duration_days: booking.duration_days || 1,
                  isEdited: booking.isEdited || false,
                  isDeleted: booking.isDeleted || false,
                  expired: booking.expired || false,
                }],

                // Add agent directly from backend response
                agent: booking.transaction?.agent ? {
                  id: booking.transaction.agent.id,
                  name: booking.transaction.agent.name,
                  email: booking.transaction.agent.email,
                  phone_number: booking.transaction.agent.phone_number,
                  contact: booking.transaction.agent.phone_number,
                } : undefined,

                apartment: booking.apartment
                  ? {
                      id: booking.apartment.id,
                      name: booking.apartment.name,
                      address: booking.apartment.address,
                      price: booking.apartment.price,
                      agent: booking.apartment.agent,
                      type: booking.apartment.type || "",
                      servicing: booking.apartment.servicing || "",
                      location: booking.apartment.location || "",
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
                      name: booking.transaction.metadata?.fullName || "",
                      apartment_id: booking.transaction.apartment_id,
                      agent_id: booking.transaction.agent_id,
                      created_at: booking.transaction.created_at,
                    }
                  : undefined,
              });
            } else {
              // Add this booking period to existing transaction
              const existingBooking = bookingsByTransaction.get(transactionId);
              existingBooking.booking_periods.push({
                id: booking.id,
                start_date: booking.start_date,
                end_date: booking.end_date,
                duration_days: booking.duration_days || 1,
                isEdited: booking.isEdited || false,
                isDeleted: booking.isDeleted || false,
                expired: booking.expired || false,
              });
            }
          });

          // Convert map to array
          const processedBookings = Array.from(bookingsByTransaction.values());

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