import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import useAgentStore from "../../../stores/agentstore";
import useBannerStore from "../../../stores/bannerStore";
import usePaymentStore from "../../../stores/paymentstore";
import Carousel from "react-grid-carousel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define the property interface based on your API response
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
  agentId: string; // Changed from optional to required
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AgentPropertiesResponse {
  properties: Property[];
  pagination: PaginationInfo;
}

// Sort options - UPDATED
type SortOption =
  | "newest"
  | "oldest"
  | "price-low-high"
  | "price-high-low"
  | "name-asc"
  | "name-desc"
  | "bedrooms-low-high"
  | "bedrooms-high-low"
  | "location";

// Banner Carousel Component
const BannerCarousel: React.FC = () => {
  const { banners } = useBannerStore();

  if (!banners || banners.length === 0) {
    return null;
  }

  const activeBanners = banners
    .filter((banner) => banner.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-blue-600 to-purple-700">
      <Carousel
        cols={1}
        rows={1}
        loop
        autoplay={3000}
        showDots={activeBanners.length > 1}
        dotColorActive="#ffffff"
        dotColorInactive="#ffffff80"
        mobileBreakpoint={768}>
        {activeBanners.map((banner) => (
          <Carousel.Item key={banner.id}>
            <div className="relative h-64 md:h-80 lg:h-96">
              {/* Background Image */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUY0QThGIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDE1MCAyNTBIMjUwTDIwMCAyMDBaIiBmaWxsPSIjMDA3N0VGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiMwMDc3RUYiLz4KPHN2ZyB4PSI4MDAiIHk9IjE1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgOUg4VjRIM1Y5Wk0zIDE0SDhWMTlIM1YxNFpNMTMgNEgxOFY5SDEzVjRaTTEzIDE0SDE4VjE5SDEzVjE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==";
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  {banner.title}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-md max-w-2xl">
                  {banner.description}
                </p>
                {banner.targetUrl && (
                  <Link
                    to={banner.targetUrl}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                    Learn More
                  </Link>
                )}
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

// Property Carousel Component
const PropertyCarousel: React.FC<{
  images: string[];
  propertyName: string;
}> = ({ images, propertyName }) => {
  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="relative h-48 bg-gray-200">
      <Carousel cols={1} rows={1} loop>
        {images.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              src={image}
              alt={`${propertyName} - ${index + 1}`}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE1MCAyMDBIMjUwTDIwMCAxNTBaIiBmaWxsPSIjOEU5MEEwIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjExMCIgcj0iMjAiIGZpbGw9IiM4RTkwQTAiLz4KPC9zdmc+";
              }}
            />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

// Property Detail View Component
const PropertyDetailView: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: () => void;
}> = ({ property, isOpen, onClose, onBookNow }) => {
  if (!isOpen || !property) return null;

  // Enhanced helper function to ensure bedroom is displayed as string
  const getBedroomText = (bedroom: string | number): string => {
    if (bedroom === null || bedroom === undefined) return "0";

    const text = typeof bedroom === "number" ? bedroom.toString() : bedroom;

    // Handle empty strings and non-numeric values
    if (!text || text.trim() === "" || isNaN(parseInt(text))) {
      return "0";
    }

    return text;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-12 gap-6">
          {/* Left Column - Property Info */}
          <div className="md:col-span-5 p-6">
            <div className="flex flex-col h-full">
              <button
                onClick={onClose}
                className="self-start mb-4 text-gray-600 hover:text-gray-800">
                <img
                  src="/images/Frame 67.svg"
                  alt="Back"
                  className="w-8 h-8"
                />
              </button>

              <h4 className="text-2xl font-bold text-gray-900 py-4">
                {property.name}
              </h4>

              <div className="flex flex-col gap-4 flex-1">
                <div className="flex gap-4 items-center">
                  <img
                    src="/images/location 1.svg"
                    alt="Location"
                    className="w-8 h-8"
                  />
                  <h6 className="text-lg text-gray-700">{property.address}</h6>
                </div>

                <div className="flex gap-3 items-center">
                  <img
                    src="/images/Group 1505.svg"
                    alt="Agent"
                    className="w-8 h-8"
                  />
                  <div className="leading-6">
                    <h6 className="text-lg text-gray-700">Verified Agent</h6>
                    <h6 className="text-sm text-gray-500">Professional Host</h6>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src="/images/Group 1497.svg"
                    alt="Phone"
                    className="w-8 h-8"
                  />
                  <h6 className="text-lg text-gray-700">+234 7065345534</h6>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src="/images/Group 1496.svg"
                    alt="Contact"
                    className="w-8 h-8"
                  />
                  <h6 className="text-lg text-gray-700">Contact Agent</h6>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src="/images/Group 1503.svg"
                    alt="Registration"
                    className="w-8 h-8"
                  />
                  <h6 className="text-lg text-gray-700">
                    Registered 2 years ago
                  </h6>
                </div>

                <div className="flex gap-4 items-center">
                  <img
                    src="/images/Group 1502.svg"
                    alt="Properties"
                    className="w-8 h-8"
                  />
                  <h6 className="text-lg text-gray-700">
                    View all properties from this agent
                  </h6>
                </div>

                {/* Property Specific Details */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Type:</span>
                      <span className="ml-2">{property.type}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Bedrooms:</span>
                      <span className="ml-2">
                        {getBedroomText(property.bedroom)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Servicing:</span>
                      <span className="ml-2">{property.servicing}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          property.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {property.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Agent ID:</span>
                      <span className="ml-2 text-xs font-mono">
                        {property.agentId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={onBookNow}
                className="bg-black text-white rounded-lg py-3 px-6 font-semibold hover:bg-gray-800 transition-colors mt-6">
                Book Now
              </button>
            </div>
          </div>

          {/* Right Column - Property Images */}
          <div className="md:col-span-7">
            <Carousel cols={1} rows={1} loop>
              {property.images && property.images.length > 0 ? (
                property.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      src={image}
                      alt={`${property.name} -${index + 1}`}
                      className="w-full h-64 md:h-96 object-cover"
                    />
                  </Carousel.Item>
                ))
              ) : (
                <Carousel.Item>
                  <div className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </Carousel.Item>
              )}
            </Carousel>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated Booking Modal Component with proper payment initiation
const BookingModal: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  personalUrl?: string;
}> = ({ property, isOpen, onClose, onSubmit, personalUrl }) => {
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    email: "",
    name_of_nxt_of_kin: "",
    number_of_nxt_of_kin: "",
  });

  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [loadingBookedDates, setLoadingBookedDates] = useState(false);

  // Payment store integration
  const {
    initiatePayment,
    isInitializingPayment,
    paymentInitError,
    clearPaymentInitError,
  } = usePaymentStore();

  // Fetch booked dates for the property
  useEffect(() => {
    if (property && isOpen) {
      fetchBookedDates(property.id);
    }
  }, [property, isOpen]);

  // Show error toast when payment initiation fails
  useEffect(() => {
    if (paymentInitError) {
      toast.error(`Payment Error: ${paymentInitError}`, {
        position: "top-right",
        autoClose: 5000,
      });
      clearPaymentInitError();
    }
  }, [paymentInitError, clearPaymentInitError]);

  // Fetch booked dates from API
  const fetchBookedDates = async (propertyId: string) => {
    try {
      setLoadingBookedDates(true);
      // Mock API call - replace with your actual API endpoint
      const response = await fetch(`/api/properties/${propertyId}/bookings`);

      if (!response.ok) {
        throw new Error("Failed to fetch booked dates");
      }

      const { bookedDates } = await response.json();
      const dates = bookedDates.map((dateStr: string) => new Date(dateStr));
      setBookedDates(dates);
    } catch (error) {
      console.error("Failed to fetch booked dates:", error);
      toast.warning(
        "Unable to load booked dates. Some dates may be unavailable.",
        {
          position: "top-right",
          autoClose: 3000,
        },
      );
      // Fallback to mock data
      const mockBookedDates = [
        new Date(new Date().setDate(new Date().getDate() + 2)),
        new Date(new Date().setDate(new Date().getDate() + 3)),
        new Date(new Date().setDate(new Date().getDate() + 7)),
        new Date(new Date().setDate(new Date().getDate() + 8)),
        new Date(new Date().setDate(new Date().getDate() + 9)),
        new Date(new Date().setDate(new Date().getDate() + 15)),
      ];
      setBookedDates(mockBookedDates);
    } finally {
      setLoadingBookedDates(false);
    }
  };

  // Check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === date.toDateString(),
    );
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
      toast.info("This date is already booked. Please select another date.", {
        position: "top-center",
        autoClose: 3000,
      });
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

  const validateForm = () => {
    const requiredFields = [
      { field: bookingData.name, message: "Full name is required" },
      { field: bookingData.phone, message: "Phone number is required" },
      { field: bookingData.email, message: "Email is required" },
      {
        field: bookingData.name_of_nxt_of_kin,
        message: "Next of kin name is required",
      },
      {
        field: bookingData.number_of_nxt_of_kin,
        message: "Next of kin phone number is required",
      },
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

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      toast.error("Please enter a valid email address", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Phone validation (basic)
    if (bookingData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid phone number", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    // Next of kin phone validation
    if (bookingData.number_of_nxt_of_kin.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid next of kin phone number", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

  // FIXED: Updated payment initiation function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDates.length === 0) {
      toast.error("Please select at least one date", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    if (!property) {
      toast.error("Property information is missing", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    // Validate that we have agentId
    if (!property.agentId) {
      toast.error("Agent information is missing. Please contact support.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Validate form fields
    if (!validateForm()) {
      return;
    }

    // Check if any selected date is booked
    const hasBookedDate = selectedDates.some((date) => isDateBooked(date));
    if (hasBookedDate) {
      toast.error(
        "Some selected dates are already booked. Please choose different dates.",
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
      return;
    }

    try {
      // Calculate total amount
      const totalAmount = property.price * selectedDates.length;

      // FIXED: Prepare payment data with correct field names and structure
      const paymentData = {
        email: bookingData.email,
        phoneNumber: bookingData.phone,
        nextofKinName: bookingData.name_of_nxt_of_kin,
        nextOfKinNumber: bookingData.number_of_nxt_of_kin,
        channels: ["card", "bank"], // Provide multiple options
        currency: "NGN",
        agentId: property.agentId,
        apartmentId: property.id,
        startDate: selectedDates[0].toISOString().split("T")[0], // Format: YYYY-MM-DD
        endDate: new Date(
          selectedDates[selectedDates.length - 1].getTime() + 86400000,
        )
          .toISOString()
          .split("T")[0], // Format: YYYY-MM-DD
        amount: totalAmount, // CRITICAL: Add amount field
        metadata: {
          propertyName: property.name,
          nights: selectedDates.length,
          guestName: bookingData.name,
          checkIn: selectedDates[0].toISOString(),
          checkOut: new Date(
            selectedDates[selectedDates.length - 1].getTime() + 86400000,
          ).toISOString(),
          personalUrl: personalUrl || "direct",
        },
      };

      console.log("🚀 Payment data being sent:", paymentData);

      // Show loading toast
      const toastId = toast.loading("Initializing payment...", {
        position: "top-right",
      });

      // Initiate payment
      const paymentResult = await initiatePayment(paymentData);

      // If payment initiation is successful, redirect to payment page
      if (paymentResult.authorization_url) {
        toast.update(toastId, {
          render: "Payment initialized successfully! Redirecting...",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

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
          agentId: property.agentId,
          authorizationUrl: paymentResult.authorization_url,
        };

        console.log("💾 Storing booking info:", bookingInfo);

        // Store in session storage for retrieval after payment
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingInfo));

        // Call the onSubmit prop to notify parent component
        onSubmit(bookingInfo);

        // Redirect to payment gateway after a short delay
        setTimeout(() => {
          window.location.href = paymentResult.authorization_url;
        }, 1500);
      } else {
        throw new Error(
          "Payment initiation failed - no authorization URL received",
        );
      }
    } catch (error: any) {
      console.error("❌ Payment initiation failed:", error);

      // Show specific error message
      toast.error(`Payment failed: ${error.message || "Please try again"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const resetForm = () => {
    setBookingData({
      name: "",
      phone: "",
      email: "",
      name_of_nxt_of_kin: "",
      number_of_nxt_of_kin: "",
    });
    setSelectedDates([]);
    setStartDate(null);
    setEndDate(null);
    setBookedDates([]);
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
                    value={bookingData.number_of_nxt_of_kin}
                    onChange={(e) =>
                      setBookingData({
                        ...bookingData,
                        number_of_nxt_of_kin: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Next of Kin Phone Number"
                  />
                </div>
              </div>
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

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Check-in:</span>
                      <span>
                        {selectedDates[0].toLocaleDateString("en-US", {
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
                        {new Date(
                          selectedDates[selectedDates.length - 1].getTime() +
                            86400000,
                        ).toLocaleDateString("en-US", {
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

const AgentPropertiesGallery: React.FC = () => {
  const { personalUrl } = useParams<{ personalUrl: string }>();
  const {
    fetchPropertiesBySlug,
    fetchEnlistedProperties,
    isLoading,
    error,
    clearError,
    enlistedProperties,
  } = useAgentStore();

  const { banners, fetchBanners } = useBannerStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<"slug" | "enlisted">("slug");

  // Enhanced helper function to ensure bedroom is displayed as string
  const getBedroomText = (bedroom: string | number): string => {
    if (bedroom === null || bedroom === undefined) return "0";

    const text = typeof bedroom === "number" ? bedroom.toString() : bedroom;

    // Handle empty strings and non-numeric values
    if (!text || text.trim() === "" || isNaN(parseInt(text))) {
      return "0";
    }

    return text;
  };

  // Helper function to get display names for sort options
  const getSortOptionDisplayName = (option: SortOption): string => {
    const displayNames: Record<SortOption, string> = {
      newest: "Newest First",
      oldest: "Oldest First",
      "price-low-high": "Price: Low to High",
      "price-high-low": "Price: High to Low",
      "name-asc": "Name: A to Z",
      "name-desc": "Name: Z to A",
      "bedrooms-low-high": "Bedrooms: Fewest",
      "bedrooms-high-low": "Bedrooms: Most",
      location: "Location",
    };

    return displayNames[option] || option;
  };

  // Show error toast when fetching properties fails
  useEffect(() => {
    if (error) {
      toast.error(`Failed to load properties: ${error}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".sort-dropdown")) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortOpen]);

  // Load properties
  const loadProperties = React.useCallback(
    async (page: number = 1) => {
      if (!personalUrl && dataSource === "slug") return;

      try {
        clearError();

        if (dataSource === "slug" && personalUrl) {
          const response: AgentPropertiesResponse = await fetchPropertiesBySlug(
            personalUrl,
            page,
            9,
          );

          if (response && response.properties) {
            setProperties(response.properties);
            setFilteredProperties(response.properties);
            setPagination(response.pagination);
          }
        } else {
          await fetchEnlistedProperties(page, 9);

          const transformedProperties: Property[] = enlistedProperties.map(
            (prop) => ({
              id: prop.id,
              name: prop.name,
              address: prop.address,
              type: prop.type,
              servicing: prop.servicing || "",
              bedroom: prop.bedroom || "",
              price: prop.price,
              images: prop.images,
              createdAt: prop.createdAt,
              updatedAt: prop.updatedAt || prop.createdAt,
              status: prop.status,
              apartmentId: prop.apartmentId,
              location: prop.location,
              agentId: prop.agentId, // Ensure agentId is properly mapped
            }),
          );

          setProperties(transformedProperties);
          setFilteredProperties(transformedProperties);
          setPagination({
            total: transformedProperties.length,
            page: page,
            limit: 9,
            totalPages: Math.ceil(transformedProperties.length / 9),
          });
        }
      } catch (err) {
        console.error("Failed to load properties:", err);
      }
    },
    [
      personalUrl,
      clearError,
      fetchPropertiesBySlug,
      fetchEnlistedProperties,
      enlistedProperties,
      dataSource,
    ],
  );

  // Determine data source
  useEffect(() => {
    if (personalUrl) {
      setDataSource("slug");
    } else {
      setDataSource("enlisted");
    }
  }, [personalUrl]);

  // Fetch properties
  useEffect(() => {
    loadProperties(currentPage);
  }, [personalUrl, currentPage, loadProperties, dataSource]);

  // Fetch banners
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Update properties when enlistedProperties changes
  useEffect(() => {
    if (dataSource === "enlisted" && enlistedProperties.length > 0) {
      const transformedProperties: Property[] = enlistedProperties.map(
        (prop) => ({
          id: prop.id,
          name: prop.name,
          address: prop.address,
          type: prop.type,
          servicing: prop.servicing || "",
          bedroom: prop.bedroom || "",
          price: prop.price,
          images: prop.images,
          createdAt: prop.createdAt,
          updatedAt: prop.updatedAt || prop.createdAt,
          status: prop.status,
          apartmentId: prop.apartmentId,
          location: prop.location,
          agentId: prop.agentId, // Make sure this field exists in your API response
        }),
      );

      setProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
      setPagination({
        total: transformedProperties.length,
        page: currentPage,
        limit: 9,
        totalPages: Math.ceil(transformedProperties.length / 9),
      });
    }
  }, [enlistedProperties, dataSource, currentPage]);

  // Filter and sort properties - UPDATED VERSION
  useEffect(() => {
    let result = [...properties];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (property) =>
          property.name.toLowerCase().includes(query) ||
          property.address.toLowerCase().includes(query) ||
          property.type.toLowerCase().includes(query) ||
          (property.servicing &&
            property.servicing.toLowerCase().includes(query)) ||
          getBedroomText(property.bedroom).toLowerCase().includes(query) ||
          property.price.toString().includes(query) ||
          (property.location &&
            property.location.toLowerCase().includes(query)),
      );
    }

    // Apply sorting - FIXED IMPLEMENTATION
    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;

      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        break;

      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;

      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;

      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "bedrooms-low-high":
        result.sort((a, b) => {
          const aBedrooms = parseInt(getBedroomText(a.bedroom)) || 0;
          const bBedrooms = parseInt(getBedroomText(b.bedroom)) || 0;
          return aBedrooms - bBedrooms;
        });
        break;

      case "bedrooms-high-low":
        result.sort((a, b) => {
          const aBedrooms = parseInt(getBedroomText(a.bedroom)) || 0;
          const bBedrooms = parseInt(getBedroomText(b.bedroom)) || 0;
          return bBedrooms - aBedrooms;
        });
        break;

      case "location":
        result.sort((a, b) => {
          const locationA = a.location || a.address || "";
          const locationB = b.location || b.address || "";
          return locationA.localeCompare(locationB);
        });
        break;

      default:
        // Default to newest if no valid sort option
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    setFilteredProperties(result);
  }, [properties, searchQuery, sortOption]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      loadProperties(newPage);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the useEffect that watches searchQuery
    // This prevents form submission and page refresh
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailViewOpen(true);
  };

  const handleBookNow = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  // FIXED: Enhanced booking submission handler
  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log("✅ Booking submitted successfully:", bookingData);

      // You can add additional logic here like:
      // - Send booking confirmation email
      // - Update property availability
      // - Create booking record in your database

      toast.success(
        "Booking initiated successfully! Redirecting to payment...",
        {
          position: "top-right",
          autoClose: 3000,
        },
      );
    } catch (error) {
      console.error("Failed to process booking:", error);
      toast.error("Failed to process booking. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const handleCloseDetailView = () => {
    setIsDetailViewOpen(false);
    setSelectedProperty(null);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProperty(null);
  };

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">
            Error loading properties
          </div>
          <button
            onClick={() => loadProperties(1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add ToastContainer at the top level */}
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

      {/* Banner Carousel Header */}
      <BannerCarousel />

      {/* Search and Sort Controls */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search properties by name, location, or price..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Sort Dropdown - UPDATED */}
          <div className="relative sort-dropdown">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[200px]">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
                />
              </svg>
              <span className="text-gray-700 capitalize">
                {getSortOptionDisplayName(sortOption)}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isSortOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                    Sort Properties By
                  </div>

                  {/* Date Sorting */}
                  <div className="px-3 py-1">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      Date
                    </div>
                    {[
                      { value: "newest", label: "Newest First" },
                      { value: "oldest", label: "Oldest First" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleSortChange(option.value as SortOption)
                        }
                        className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          sortOption === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Price Sorting */}
                  <div className="px-3 py-1">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      Price
                    </div>
                    {[
                      { value: "price-low-high", label: "Price: Low to High" },
                      { value: "price-high-low", label: "Price: High to Low" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleSortChange(option.value as SortOption)
                        }
                        className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          sortOption === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Name Sorting */}
                  <div className="px-3 py-1">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      Name
                    </div>
                    {[
                      { value: "name-asc", label: "Name: A to Z" },
                      { value: "name-desc", label: "Name: Z to A" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleSortChange(option.value as SortOption)
                        }
                        className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          sortOption === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Bedrooms Sorting */}
                  <div className="px-3 py-1">
                    <div className="text-xs font-medium text-gray-400 mb-1">
                      Bedrooms
                    </div>
                    {[
                      {
                        value: "bedrooms-low-high",
                        label: "Bedrooms: Fewest First",
                      },
                      {
                        value: "bedrooms-high-low",
                        label: "Bedrooms: Most First",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleSortChange(option.value as SortOption)
                        }
                        className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          sortOption === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}>
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {/* Location Sorting */}
                  <div className="px-3 py-1">
                    <button
                      onClick={() => handleSortChange("location" as SortOption)}
                      className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                        sortOption === "location"
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}>
                      Location: A to Z
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No properties found</div>
            <p className="text-gray-400 mt-2">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "No properties available at the moment"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewProperty(property)}>
                  {/* Property Carousel */}
                  <PropertyCarousel
                    images={property.images}
                    propertyName={property.name}
                  />

                  {/* Property Details */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {property.name}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {property.type}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {property.address}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{getBedroomText(property.bedroom)} Beds</span>
                        <span>{property.servicing}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {formatPrice(property.price)}
                        </div>
                        <div className="text-xs text-gray-500">per night</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Added {formatDate(property.createdAt)}</span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          property.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                        {property.status}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProperty(property);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(property);
                        }}
                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {currentPage} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Property Detail View Modal */}
      <PropertyDetailView
        property={selectedProperty}
        isOpen={isDetailViewOpen}
        onClose={handleCloseDetailView}
        onBookNow={() => {
          setIsDetailViewOpen(false);
          setIsBookingModalOpen(true);
        }}
      />

      {/* Booking Modal */}
      <BookingModal
        property={selectedProperty}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSubmit={handleBookingSubmit}
        personalUrl={personalUrl}
      />
    </div>
  );
};

export default AgentPropertiesGallery;
