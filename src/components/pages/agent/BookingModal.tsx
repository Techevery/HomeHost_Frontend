import React, { useState, useEffect } from 'react';
import useBookingStore from '../../../stores/bookingStore'; // Adjust import path as needed

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
  apartmentId?: string;
  markedUpPrice?: number;
  agentPercentage?: number;
}

interface BookingModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (bookingData: any) => void; // Make optional since we're using store
}

const BookingModal: React.FC<BookingModalProps> = ({ property, isOpen, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
  });

  const { createBooking, loading, error, clearError } = useBookingStore();

  const getNumberOfNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!property) return;

    const nights = getNumberOfNights();
    const totalPrice = property.price * nights;

    try {
      const bookingPayload = {
        apartment_id: property.id,
        check_in: bookingData.checkIn,
        check_out: bookingData.checkOut,
        guests: bookingData.guests,
        special_requests: bookingData.specialRequests,
        total_price: totalPrice,
        duration_days: nights,
        // Additional guest info can be added here if available
        guest_name: '', // You might want to collect this separately
        guest_email: '', // You might want to collect this separately
        guest_phone: '', // You might want to collect this separately
      };

      // Use the store to create booking
      await createBooking(bookingPayload);
      
      // Call the original onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        onSubmit({
          ...bookingData,
          propertyId: property.id,
          propertyName: property.name,
          totalPrice: totalPrice,
        });
      }
      
      // Close modal on success
      onClose();
    } catch (error) {
      // Error is handled by the store and will show toast
      console.error('Booking failed:', error);
    }
  };

  const resetForm = () => {
    setBookingData({
      checkIn: '',
      checkOut: '',
      guests: 1,
      specialRequests: '',
    });
    clearError();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Book Now</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Property Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900">{property.name}</h3>
            <p className="text-gray-600 text-sm mt-1">{property.address}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">{property.type} • {property.bedroom} Beds</span>
              <span className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                }).format(property.price)}/night
              </span>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.checkIn}
                  onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  required
                  value={bookingData.checkOut}
                  onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })}
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Guests
              </label>
              <select
                value={bookingData.guests}
                onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Special Requests
              </label>
              <textarea
                value={bookingData.specialRequests}
                onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special requirements or requests..."
                disabled={loading}
              />
            </div>

            {/* Price Summary */}
            {bookingData.checkIn && bookingData.checkOut && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Price per night:</span>
                  <span>
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                    }).format(property.price)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Number of nights:</span>
                  <span>{getNumberOfNights()}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t border-blue-200">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {new Intl.NumberFormat('en-NG', {
                      style: 'currency',
                      currency: 'NGN',
                      minimumFractionDigits: 0,
                    }).format(property.price * getNumberOfNights())}
                  </span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
                <p className="text-gray-600 mt-2">Processing your booking...</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !bookingData.checkIn || !bookingData.checkOut}
                className="flex-1 px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors font-semibold disabled:bg-amber-200 disabled:cursor-not-allowed"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;