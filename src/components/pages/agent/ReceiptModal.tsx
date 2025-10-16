import React from 'react';
import useBookingStore from '../../../stores/bookingStore'; // Adjust import path as needed

interface ReceiptData {
  propertyName: string;
  nights: number;
  startDate: string;
  endDate: string;
  transactionDate: string;
  transactionTime: string;
  totalAmount: number;
  bookingId?: string;
}

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: ReceiptData | null;
  onGetReceipt?: () => void; // Make optional since we're using store
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receiptData, onGetReceipt }) => {
  const { generateReceipt, loading } = useBookingStore();

  const handleGetReceipt = async (type: 'download' | 'email' = 'download') => {
    if (!receiptData?.bookingId) {
      console.error('No booking ID available for receipt generation');
      return;
    }

    try {
      await generateReceipt(receiptData.bookingId, type);
      
      // Call the original onGetReceipt if provided (for backward compatibility)
      if (onGetReceipt) {
        onGetReceipt();
      }
    } catch (error) {
      console.error('Failed to generate receipt:', error);
    }
  };

  if (!isOpen || !receiptData) return null;

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Receipt</h1>
            <div className="mt-2">
              <h2 className="text-xl font-semibold text-gray-800">H Horney Host</h2>
            </div>
          </div>

          <div className="border-t border-b border-gray-300 py-4 my-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Successful paid {formatPrice(receiptData.totalAmount)}
              </h3>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-900 text-lg">{receiptData.propertyName}</h4>
              <p className="text-gray-600">{receiptData.nights} Night{receiptData.nights > 1 ? 's' : ''}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-700">Start Date</h5>
                <p className="text-gray-900">{receiptData.startDate}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700">End Date</h5>
                <p className="text-gray-900">{receiptData.endDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <h5 className="font-semibold text-gray-700">Date of Transaction:</h5>
                <p className="text-gray-900">{receiptData.transactionDate}</p>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700">Time</h5>
                <p className="text-gray-900">{receiptData.transactionTime}</p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              <p className="text-gray-600 mt-2">Generating receipt...</p>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={() => handleGetReceipt('download')}
              disabled={loading}
              className="w-full bg-amber-400 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-colors duration-200 disabled:bg-amber-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Get Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;