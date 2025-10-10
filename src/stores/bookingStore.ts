// stores/bookingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Transaction {
  reference: string;
}

interface Apartment {
  name: string;
  address: string;
  type: string;
  servicing: string;
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
}

interface BookingActions {
  fetchBookings: () => Promise<void>;
  fetchBookingById: (id: string) => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<void>;
  updateBooking: (id: string, updatedData: Partial<Booking>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
  fetchReceipts: (bookingId: string) => Promise<void>;
  generateReceipt: (bookingId: string, type: 'download' | 'email') => Promise<void>;
  setSelectedDates: (dates: Date[]) => void;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  clearError: () => void;
  clearCurrentBooking: () => void;
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
};

const API_BASE_URL = process.env.REACT_APP_DEV_BASE_URL || 'https://homeyhost.ng/api';

const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      fetchBookings: async () => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/booking`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          // Handle different response structures
          const bookingsData = response.data.data || response.data || [];
          set({ bookings: bookingsData });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch bookings';
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
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/bookings/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const bookingData = response.data.data || response.data;
          set({ 
            currentBooking: bookingData,
            selectedDates: bookingData.selected_dates || [],
            startDate: bookingData.start_date ? new Date(bookingData.start_date) : null,
            endDate: bookingData.end_date ? new Date(bookingData.end_date) : null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch booking details';
          set({ 
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
      
      createBooking: async (bookingData: Partial<Booking>) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const { selectedDates, startDate, endDate } = get();
          const data = {
            ...bookingData,
            selected_dates: selectedDates,
            start_date: startDate,
            end_date: endDate,
            nights: selectedDates.length,
          };

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/bookings`,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const newBooking = response.data.data || response.data;
          set((state) => ({
            bookings: [...state.bookings, newBooking],
            currentBooking: newBooking,
          }));
          
          toast.success('Booking created successfully!');
          return newBooking;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create booking';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      updateBooking: async (id: string, updatedData: Partial<Booking>) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.patch(
            `${API_BASE_URL}/api/v1/bookings/${id}`,
            updatedData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const updatedBooking = response.data.data || response.data;
          set((state) => ({
            bookings: state.bookings.map(booking => 
              booking.id === id ? { ...booking, ...updatedBooking } : booking
            ),
            currentBooking: state.currentBooking?.id === id ? 
              { ...state.currentBooking, ...updatedBooking } : 
              state.currentBooking,
          }));
          
          toast.success('Booking updated successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update booking';
          set({ 
            error: errorMessage,
          });
          toast.error('Failed to update booking');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      cancelBooking: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          await axios.delete(
            `${API_BASE_URL}/api/v1/bookings/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            bookings: state.bookings.filter(booking => booking.id !== id),
            currentBooking: state.currentBooking?.id === id ? null : state.currentBooking,
          }));
          
          toast.success('Booking cancelled successfully!');
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to cancel booking';
          set({ 
            error: errorMessage,
          });
          toast.error('Failed to cancel booking');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      fetchReceipts: async (bookingId: string) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${API_BASE_URL}/api/v1/bookings/${bookingId}/receipts`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const receiptsData = response.data.data || response.data || [];
          set({ 
            receipts: receiptsData,
            currentReceipt: receiptsData[0] || null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch receipts';
          set({ 
            error: errorMessage,
          });
          toast.error(errorMessage);
        } finally {
          set({ loading: false });
        }
      },
      
      generateReceipt: async (bookingId: string, type: 'download' | 'email') => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.post(
            `${API_BASE_URL}/api/v1/bookings/${bookingId}/receipts`,
            { type },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          const newReceipt = response.data.data || response.data;
          if (type === 'download' && newReceipt.download_url) {
            // Handle PDF download
            window.open(newReceipt.download_url, '_blank');
          } else {
            toast.success('Receipt sent to email successfully!');
          }
          
          set((state) => ({
            receipts: [...state.receipts, newReceipt],
            currentReceipt: newReceipt,
          }));
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to generate receipt';
          set({ error: errorMessage });
          toast.error(errorMessage);
          throw error;
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
      name: 'booking-storage',
      partialize: (state) => ({
        bookings: state.bookings,
        currentBooking: state.currentBooking,
        receipts: state.receipts,
        currentReceipt: state.currentReceipt,
      }),
    }
  )
);

export default useBookingStore;