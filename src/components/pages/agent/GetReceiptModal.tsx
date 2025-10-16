import React from 'react';
import useBookingStore from '../../../stores/bookingStore'; // Adjust import path as needed

interface GetReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPDF?: () => void;
  onSendEmail?: () => void;
  bookingId?: string; // Add bookingId to use with store
}

const GetReceiptModal: React.FC<GetReceiptModalProps> = ({ 
  isOpen, 
  onClose, 
  onDownloadPDF, 
  onSendEmail,
  bookingId 
}) => {
  const { generateReceipt, loading } = useBookingStore();

  const handleDownloadPDF = async () => {
    if (bookingId) {
      try {
        await generateReceipt(bookingId, 'download');
      } catch (error) {
        console.error('Failed to download receipt:', error);
      }
    }
    
    // Call the original onDownloadPDF if provided (for backward compatibility)
    if (onDownloadPDF) {
      onDownloadPDF();
    }
  };

  const handleSendEmail = async () => {
    if (bookingId) {
      try {
        await generateReceipt(bookingId, 'email');
      } catch (error) {
        console.error('Failed to send receipt email:', error);
      }
    }
    
    // Call the original onSendEmail if provided (for backward compatibility)
    if (onSendEmail) {
      onSendEmail();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Get Receipt</h1>
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

          {/* Loading State */}
          {loading && (
            <div className="mb-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              <p className="text-gray-600 mt-2">Processing...</p>
            </div>
          )}

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-gray-700 font-medium">Download PDF</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={loading}
              className="w-full flex items-center justify-between p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-gray-700 font-medium">Send Email</span>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Download Button */}
          <div className="mt-6">
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="w-full bg-amber-400 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-colors duration-200 disabled:bg-amber-200 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetReceiptModal;