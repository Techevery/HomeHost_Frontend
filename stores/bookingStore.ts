// stores/bookingStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Booking {
  id: string;
  apartment_name: string;
  date: string;
  receipt_id: string;
  amount: string;
  status: 'Successful' | 'Rejected' | 'Pending';
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  next_of_kin_name: string;
  next_of_kin_phone: string;
  discount_code?: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  property_id: string;
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
            `${process.env.REACT_APP_DEV_BASE_URL}api/v1/bookings`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ bookings: response.data.data });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch bookings',
          });
          toast.error('Failed to fetch bookings');
        } finally {
          set({ loading: false });
        }
      },
      
      fetchBookingById: async (id) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/bookings/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ 
            currentBooking: response.data.data,
            selectedDates: response.data.data.selected_dates || [],
            startDate: response.data.data.start_date || null,
            endDate: response.data.data.end_date || null,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch booking details',
          });
          toast.error('Failed to fetch booking details');
        } finally {
          set({ loading: false });
        }
      },
      
      createBooking: async (bookingData) => {
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
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/bookings`,
            data,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            bookings: [...state.bookings, response.data.data],
            currentBooking: response.data.data,
          }));
          
          toast.success('Booking created successfully!');
          return response.data.data;
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || 'Failed to create booking';
          set({ error: errorMsg });
          toast.error(errorMsg);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      updateBooking: async (id, updatedData) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.patch(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/bookings/${id}`,
            updatedData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set((state) => ({
            bookings: state.bookings.map(booking => 
              booking.id === id ? { ...booking, ...response.data.data } : booking
            ),
            currentBooking: state.currentBooking?.id === id ? 
              { ...state.currentBooking, ...response.data.data } : 
              state.currentBooking,
          }));
          
          toast.success('Booking updated successfully!');
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to update booking',
          });
          toast.error('Failed to update booking');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      cancelBooking: async (id) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          await axios.delete(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/bookings/${id}`,
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
          set({ 
            error: error.response?.data?.message || 'Failed to cancel booking',
          });
          toast.error('Failed to cancel booking');
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      fetchReceipts: async (bookingId) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.get(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/bookings/${bookingId}/receipts`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          set({ 
            receipts: response.data.data,
            currentReceipt: response.data.data[0] || null,
          });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.message || 'Failed to fetch receipts',
          });
          toast.error('Failed to fetch receipts');
        } finally {
          set({ loading: false });
        }
      },
      
      generateReceipt: async (bookingId, type) => {
        set({ loading: true, error: null });
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Authentication token not found');
          }

          const response = await axios.post(
            `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/bookings/${bookingId}/receipts`,
            { type },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          
          if (type === 'download') {
            // Handle PDF download
            window.open(response.data.data.download_url, '_blank');
          } else {
            toast.success('Receipt sent to email successfully!');
          }
          
          set((state) => ({
            receipts: [...state.receipts, response.data.data],
            currentReceipt: response.data.data,
          }));
        } catch (error: any) {
          const errorMsg = error.response?.data?.message || 'Failed to generate receipt';
          set({ error: errorMsg });
          toast.error(errorMsg);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      setSelectedDates: (dates) => {
        set({ selectedDates: dates });
      },
      
      setStartDate: (date) => {
        set({ startDate: date });
      },
      
      setEndDate: (date) => {
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