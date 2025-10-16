import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any;
  onPaymentSuccess: (paymentData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  onPaymentSuccess 
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'wallet'>('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    const paymentData = {
      method: paymentMethod,
      amount: bookingData.totalPrice,
      transactionId: 'TX' + Date.now(),
      status: 'success'
    };
    onPaymentSuccess(paymentData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Booking Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg text-gray-900">{bookingData?.propertyName}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">
                {bookingData?.checkIn} to {bookingData?.checkOut}
              </span>
              <span className="text-lg font-bold text-blue-600">
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  minimumFractionDigits: 0,
                }).format(bookingData?.totalPrice || 0)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border mr-3 ${
                    paymentMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}></div>
                  <span className="font-medium">Credit/Debit Card</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`w-full p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border mr-3 ${
                    paymentMethod === 'transfer' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}></div>
                  <span className="font-medium">Bank Transfer</span>
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full p-4 border rounded-lg text-left transition-colors ${
                  paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border mr-3 ${
                    paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}></div>
                  <span className="font-medium">Digital Wallet</span>
                </div>
              </button>
            </div>
          </div>

          {/* Card Form */}
          {paymentMethod === 'card' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors font-semibold"
                >
                  Pay Now
                </button>
              </div>
            </form>
          )}

          {/* Other Payment Methods */}
          {paymentMethod !== 'card' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  {paymentMethod === 'transfer' 
                    ? 'You will be redirected to complete your bank transfer.'
                    : 'You will be redirected to your digital wallet.'}
                </p>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="flex-1 px-4 py-2 bg-amber-400 text-white rounded-lg hover:bg-amber-500 transition-colors font-semibold"
                >
                  Continue to Pay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;