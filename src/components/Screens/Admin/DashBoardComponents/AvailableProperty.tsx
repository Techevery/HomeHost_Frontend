import React, { useState, useEffect } from "react";
import { MdOutlineFavoriteBorder, MdLocationOn } from "react-icons/md";
import { Link } from "react-router-dom";
import useAgentStore from "../../../../stores/agentstore";
import usePaymentStore from "../../../../stores/paymentstore";
import DatePicker from "react-datepicker";
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
  agentId?: string;
}

// Booking Modal Component
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
    name_of_nxt_of_kin: "",
    nunmer_of_nxt_of_kin: "",
    discount: "",
  });

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [bookedRanges, setBookedRanges] = useState<
    { startDate: Date; endDate: Date }[]
  >([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  // Payment store integration
  const {
    initiatePayment,
    isInitializingPayment,
    paymentInitError,
    clearPaymentInitError,
  } = usePaymentStore();

  // Fetch booked date ranges for the property from API
  useEffect(() => {
    if (property && isOpen) {
      fetchBookedDates(property.id);
    }
  }, [property, isOpen]);

  // Fetch booked date ranges from API
  const fetchBookedDates = async (propertyId: string) => {
    try {
      setLoadingBookedDates(true);
      const response = await fetch(`/api/properties/${propertyId}/bookings`);

      if (!response.ok) {
        throw new Error("Failed to fetch booked dates");
      }

      const { bookedRanges } = await response.json();

      // Convert date strings to Date objects
      const ranges = bookedRanges.map((range: any) => ({
        startDate: new Date(range.startDate),
        endDate: new Date(range.endDate),
      }));

      setBookedRanges(ranges);
    } catch (error) {
      console.error("Failed to fetch booked dates:", error);
      setBookedRanges([]);
    } finally {
      setLoadingBookedDates(false);
    }
  };

  // Check if a date is within any booked range
  const isDateBooked = (date: Date) => {
    return bookedRanges.some((range) => {
      return date >= range.startDate && date < range.endDate;
    });
  };

  // Check if a date range conflicts with existing bookings
  const hasDateConflict = (testStartDate: Date, testEndDate: Date) => {
    return bookedRanges.some((range) => {
      return (
        (testStartDate >= range.startDate && testStartDate < range.endDate) ||
        (testEndDate > range.startDate && testEndDate <= range.endDate) ||
        (testStartDate <= range.startDate && testEndDate >= range.endDate)
      );
    });
  };

  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      (selectedDate) => selectedDate.toDateString() === date.toDateString(),
    );
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    // Don't allow selection of booked dates
    if (isDateBooked(date)) {
      return;
    }

    const dateIndex = selectedDates.findIndex(
      (selectedDate) => selectedDate.toDateString() === date.toDateString(),
    );

    if (dateIndex >= 0) {
      const newDates = selectedDates.filter((_, index) => index !== dateIndex);
      setSelectedDates(newDates);

      if (date.getTime() === startDate?.getTime()) {
        setStartDate(null);
        setEndDate(null);
      }
      if (date.getTime() === endDate?.getTime()) {
        setEndDate(null);
      }
    } else {
      const newDates = [...selectedDates, date].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      setSelectedDates(newDates);

      if (newDates.length === 1) {
        setStartDate(date);
        setEndDate(new Date(date.getTime() + 86400000));
      } else {
        const firstDate = newDates[0];
        const lastDate = newDates[newDates.length - 1];
        setStartDate(firstDate);
        setEndDate(new Date(lastDate.getTime() + 86400000));
      }
    }
  };

  // Custom day component for DatePicker
  const renderDayContents = (day: number, date: Date) => {
    const isBooked = isDateBooked(date);
    const isSelected = isDateSelected(date);
    const isToday = new Date().toDateString() === date.toDateString();

    return (
      <div
        className={`relative flex items-center justify-center w-8 h-8 rounded-full text-sm
          ${isToday ? "bg-blue-100 font-semibold" : ""}
          ${isSelected ? "bg-blue-600 text-white" : ""}
          ${
            isBooked
              ? "bg-red-100 text-red-600 cursor-not-allowed"
              : "hover:bg-gray-100 cursor-pointer"
          }
          transition-colors duration-200
        `}
        onMouseEnter={() => setHoveredDate(isBooked ? date : null)}
        onMouseLeave={() => setHoveredDate(null)}>
        {day}
        {isBooked && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
        )}
      </div>
    );
  };

  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return null;

    const checkInDate = selectedDates[0];
    const checkOutDate = new Date(selectedDates[selectedDates.length - 1]);
    checkOutDate.setDate(checkOutDate.getDate() + 1);

    return (
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Check-in:</span>
          <span>
            {checkInDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            (1pm)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Check-out:</span>
          <span>
            {checkOutDate.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            (12noon)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Nights:</span>
          <span>{selectedDates.length}</span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      alert("Please select at least one date");
      return;
    }

    if (!property) {
      alert("Property information is missing");
      return;
    }

    // Enhanced conflict checking with date ranges
    const selectedStartDate = selectedDates[0];
    const selectedEndDate = new Date(selectedDates[selectedDates.length - 1]);
    selectedEndDate.setDate(selectedEndDate.getDate() + 1);

    const hasConflict = hasDateConflict(selectedStartDate, selectedEndDate);
    if (hasConflict) {
      alert(
        "The selected dates conflict with existing bookings. Please choose different dates.",
      );
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = property.price * selectedDates.length;

      // Prepare payment data
      const paymentData = {
        email: bookingData.email,
        phone_number: bookingData.phone,
        name: bookingData.name,
        nextkin_name: bookingData.name_of_nxt_of_kin,
        nextkin_phone: bookingData.nunmer_of_nxt_of_kin,
        discount_code: bookingData.discount
          ? parseInt(bookingData.discount)
          : 0,
        channels: ["card", "bank", "ussd"],
        currency: "NGN",
        agentId: property.agentId || "default-agent-id",
        apartmentId: property.id,
        startDate: selectedDates[0].toISOString().split("T")[0],
        endDate: new Date(
          selectedDates[selectedDates.length - 1].getTime() + 86400000,
        )
          .toISOString()
          .split("T")[0],
        amount: totalAmount,
      };

      // Initiate payment
      const paymentResult = await initiatePayment(paymentData);

      // If payment initiation is successful, redirect to payment page
      if (paymentResult.authorization_url) {
        // Store booking data temporarily before redirect
        const bookingInfo = {
          ...bookingData,
          propertyId: property.id,
          propertyName: property.name,
          selectedDates: selectedDates,
          startDate: selectedDates[0],
          endDate: new Date(
            selectedDates[selectedDates.length - 1].getTime() + 86400000,
          ),
          totalPrice: totalAmount,
          paymentReference: paymentResult.reference,
        };

        // Store in session storage for retrieval after payment
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingInfo));

        // Redirect to payment gateway
        window.location.href = paymentResult.authorization_url;
      } else {
        throw new Error("Payment initiation failed - no authorization URL");
      }
    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      alert(`Payment initiation failed: ${error.message}`);
    }
  };

  const resetForm = () => {
    setBookingData({
      name: "",
      phone: "",
      email: "",
      name_of_nxt_of_kin: "",
      nunmer_of_nxt_of_kin: "",
      discount: "",
    });
    setSelectedDates([]);
    setStartDate(null);
    setEndDate(null);
    setBookedRanges([]);
    setHoveredDate(null);
    clearPaymentInitError();
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Book {property.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors">
              ✕
            </button>
          </div>

          {paymentInitError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {paymentInitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  />
                </div>
              </div>
            </div>

            {/* Next of Kin Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Next of Kin Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    value={bookingData.name_of_nxt_of_kin}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        name_of_nxt_of_kin: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Name of Next of Kin"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    value={bookingData.nunmer_of_nxt_of_kin}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        nunmer_of_nxt_of_kin: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Next of Kin Phone Number"
                  />
                </div>
              </div>
            </div>

            {/* Discount Code */}
            <div>
              <input
                type="text"
                value={bookingData.discount}
                onChange={(e) =>
                  setBookingData({ ...bookingData, discount: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Discount Code (Optional)"
              />
            </div>

            {/* Date Selection Section */}
            <div className="border rounded-lg p-4 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Dates
              </h3>

              {/* Legend for date colors */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full relative">
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  </div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
                  <span>Today</span>
                </div>
              </div>

              {loadingBookedDates ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <DatePicker
                    selected={null}
                    onChange={handleDateChange}
                    inline
                    className="w-full"
                    minDate={new Date()}
                    dateFormat="yyyy/MM/dd"
                    renderDayContents={renderDayContents}
                    filterDate={(date) => !isDateBooked(date)}
                    dayClassName={(date) => {
                      if (isDateBooked(date)) {
                        return "react-datepicker__day--disabled";
                      }
                      return "";
                    }}
                  />

                  {/* Tooltip for booked dates */}
                  {hoveredDate && (
                    <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg top-4 right-4">
                      <div className="font-semibold">Already Booked</div>
                      <div className="text-gray-300">
                        Please pick another date
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {hoveredDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="absolute w-3 h-3 bg-gray-900 transform rotate-45 -top-1 right-6"></div>
                    </div>
                  )}
                </>
              )}

              {selectedDates.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-900">
                      Booking Summary:
                    </span>
                    <span className="text-blue-600 font-medium">
                      {selectedDates.length} night
                      {selectedDates.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  {formatSelectedDates()}

                  {property.price && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per night:</span>
                        <span className="text-gray-900">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(property.price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-green-600">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(property.price * selectedDates.length)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isInitializingPayment}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium">
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isInitializingPayment ||
                  selectedDates.length === 0 ||
                  loadingBookedDates
                }
                className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center">
                {isInitializingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  "Proceed to Payment"
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

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    // Fetch public properties when component mounts
    fetchPublicProperties(1, 12);
  }, [fetchPublicProperties]);

  const handleBookNow = (property: any) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProperty(null);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    // This function is called after payment initiation
    console.log("Booking data submitted:", bookingData);
    // You can store this data or send it to your backend after payment verification
  };

  // Show loading state
  if (loading && publicProperties.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
          <div className="text-primary-600 font-medium text-sm">View All →</div>
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

  // Show error state
  if (error && publicProperties.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
          <Link
            to="/view-properties"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">
            Failed to load properties. Please try again.
          </p>
          <button
            onClick={() => fetchPublicProperties(1, 12)}
            className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">
            Available Properties
          </h4>
          <Link
            to="/view-properties"
            className="text-primary-600 hover:text-primary-700 font-medium text-sm">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {publicProperties.map((property) => (
            <div
              key={property.id}
              className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary-200 group">
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
                    // Fallback image if the main image fails to load
                    e.currentTarget.src = "/images/house1.svg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <button className="absolute top-3 right-3 flex items-center justify-center z-20 hover:scale-110 transition-transform">
                  <div className="bg-white text-gray-600 rounded-full p-2 hover:text-red-500 transition-colors shadow-sm">
                    <MdOutlineFavoriteBorder size={18} />
                  </div>
                </button>

                <div className="absolute bottom-3 left-3">
                  <span className="bg-primary-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                    NGN {parseInt(property.price).toLocaleString()}/Night
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
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors">
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
