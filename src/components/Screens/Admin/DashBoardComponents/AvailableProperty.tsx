import React, { useState, useEffect } from "react";
import { MdLocationOn } from "react-icons/md";
import DatePicker from "react-datepicker";
import useAgentStore from "../../../../stores/agentstore";
import useAdminStore from "../../../../stores/admin";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";

// Define the property interface
interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string | number;
  price: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  status: string;
  apartmentId?: string;
  location?: string;
  amenities?: string[];
  agentId: string;
}

const BookingModal: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
}> = ({ property, isOpen, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { offlineBooking } = useAdminStore();

  const validateForm = () => {
    const requiredFields = [
      { field: bookingData.name, message: "Full name is required" },
      { field: bookingData.phone, message: "Phone number is required" },
      { field: bookingData.email, message: "Email is required" },
    ];

    for (const { field, message } of requiredFields) {
      if (!field?.trim()) {
        toast.error(message, {
          position: "top-right",
          autoClose: 4000,
        });
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (bookingData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    if (startDate >= endDate) {
      toast.error("End date must be after start date", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!property) {
      toast.error("Property information is missing", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Format dates for the backend
      const startDates = [startDate!.toISOString().split('T')[0]];
      const endDates = [endDate!.toISOString().split('T')[0]];

      const offlineBookingData = {
        apartmentId: property.id,
        startDate: startDates,
        endDate: endDates,
        name: bookingData.name,
        email: bookingData.email,
      };

      console.log("📤 Sending offline booking data:", offlineBookingData);

      const result = await offlineBooking(offlineBookingData);

      toast.success("Booking created successfully!", {
        position: "top-right",
        autoClose: 3000,
      });

      const bookingInfo = {
        ...bookingData,
        propertyId: property.id,
        propertyName: property.name,
        startDate: startDate,
        endDate: endDate,
        totalNights: Math.ceil((endDate!.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24)),
        totalPrice: property.price * Math.ceil((endDate!.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24)),
      };

      console.log("✅ Booking completed:", bookingInfo);
      onSubmit(bookingInfo);
      
      // Close modal after successful booking
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      console.error("❌ Offline booking failed:", error);
      toast.error(`Booking failed: ${error.message || "Please try again"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBookingData({
      name: "",
      phone: "",
      email: "",
    });
    setStartDate(null);
    setEndDate(null);
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  const totalNights = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const totalAmount = property.price * totalNights;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Book {property.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Info Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={property.images && property.images.length > 0 ? property.images[0] : "/images/house1.svg"}
                  alt={property.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MdLocationOn size={14} />
                    <span>{property.address}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div>Type: {property.type}</div>
                <div>Price: NGN {property.price.toLocaleString()}/night</div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>

              <div>
                <input
                  type="text"
                  required
                  value={bookingData.name}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <input
                    type="tel"
                    required
                    value={bookingData.phone}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone Number"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <input
                    type="email"
                    required
                    value={bookingData.email}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Email Address"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Date Selection Section */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Dates
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-in Date
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select start date"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check-out Date
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholderText="Select end date"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Booking Summary */}
              {startDate && endDate && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span>
                        {startDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span>
                        {endDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nights:</span>
                      <span>{totalNights}</span>
                    </div>
                    {property.price && (
                      <>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Price per night:</span>
                          <span>
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 0,
                            }).format(property.price)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center font-semibold text-lg pt-2 border-t border-gray-200">
                          <span>Total Amount:</span>
                          <span className="text-green-600">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 0,
                            }).format(totalAmount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !startDate || !endDate}
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AvailableProperty = () => {
  const { publicProperties, fetchPublicProperties, loading, error } =
    useAgentStore();
    
    console.log({publicProperties})
    console.log({fetchPublicProperties})

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    // Fetch public properties when component mounts
    fetchPublicProperties(1, 12);
  }, [fetchPublicProperties]);

  // Show error toast when fetching properties fails
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load properties: ${error}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);

  const handleBookNow = (property: any) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProperty(null);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log("✅ Booking submitted successfully:", bookingData);
      toast.success("Booking completed successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Failed to process booking:", error);
    }
  };

  // Show loading state
  if (loading && publicProperties.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="relative h-48 bg-gray-200"></div>
                <div className="bg-white p-4">
                  <div className="flex flex-col gap-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {publicProperties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary-200 group"
            >
              <div className="relative h-48">
                <img
                  src={
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : "/images/house1.svg"
                  }
                  alt={property.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/images/house1.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <div className="absolute bottom-3 left-3">
                  <span className="bg-primary-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                    NGN {parseInt(property.price as any).toLocaleString()}/Night
                  </span>
                </div>
              </div>

              <div className="bg-white p-4">
                <div className="flex flex-col gap-3">
                  <h5 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {property.name}
                  </h5>

                  <div className="flex items-center gap-2 text-gray-600">
                    <MdLocationOn size={16} className="text-primary-600" />
                    <span className="text-sm">{property.address}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {property.amenities &&
                      property.amenities.slice(0, 2).map((amenity, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    {property.amenities && property.amenities.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{property.amenities.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 font-medium capitalize">
                        {property.status || "Available"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleBookNow(property)}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show message if no properties found */}
        {publicProperties.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No properties available at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookingModal
        property={selectedProperty}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSubmit={handleBookingSubmit}
      />
    </>
  );
};

export default AvailableProperty;