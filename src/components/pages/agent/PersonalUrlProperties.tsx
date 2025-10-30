// PersonalUrlProperties.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useAgentStore from "../../../stores/agentstore";
import useBannerStore from "../../../stores/bannerStore";
import usePaymentStore from "../../../stores/paymentstore";
import useBookingStore from "../../../stores/bookingStore";

import Carousel from "react-grid-carousel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Enhanced Property Interface with Agent Info
interface PropertyAgent {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  status: string;
  isVerified: boolean;
  profile_picture: string;
  personalUrl: string;
  createdAt?: string;
}

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
  agent?: PropertyAgent;
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

// Custom hook to get property and agent information
const usePropertyAgentInfo = () => {
  const { agentInfo, fetchAgentProfile } = useAgentStore();

  useEffect(() => {
    if (!agentInfo) {
      fetchAgentProfile();
    }
  }, [agentInfo, fetchAgentProfile]);

  return {
    agentInfo,
    agentId: agentInfo?.id || "",
    isAgentVerified: agentInfo?.isVerified || false,
    agentStatus: agentInfo?.status || "",
    agentPhone: agentInfo?.phone_number || "",
    agentName: agentInfo?.name || "",
    agentEmail: agentInfo?.email || "",
    agentProfilePicture: agentInfo?.profile_picture || "",
    agentPersonalUrl: agentInfo?.personalUrl || "",
    agentCreatedAt: agentInfo?.createdAt || "",
  };
};

// Banner Carousel Component (same as before)
const BannerCarousel: React.FC = () => {
  const { banners } = useBannerStore();

  if (!banners || banners.length === 0) {
    return null;
  }

  const activeBanners = banners
    .filter((banner) => banner.status === "active")
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

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
              <img
                src={
                  banner.images && banner.images.length > 0
                    ? banner.images[0]
                    : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUY0QThGIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDE1MCAyNTBIMjUwTDIwMCAyMDBaIiBmaWxsPSIjMDA3N0VGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiMwMDc3RUYiLz4KPHN2ZyB4PSI4MDAiIHk9IjE1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgOUg4VjRIM1Y5Wk0zIDE0SDhWMTlIM1YxNFpNMTMgNEgxOFY5SDEzVjRaTTEzIDE0SDE4VjE5SDEzVjE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg=="
                }
                alt={banner.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUY0QThGIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDE1MCAyNTBIMjUwTDIwMCAyMDBaIiBmaWxsPSIjMDA3N0VGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiMwMDc3RUYiLz4KPHN2ZyB4PSI4MDAiIHk9IjE1MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgOUg4VjRIM1Y5Wk0zIDE0SDhWMTlIM1YxNFpNMTMgNEgxOFY5SDEzVjRaTTEzIDE0SDE4VjE5SDEzVjE0WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cjwvc3ZnPg==";
                }}
              />

              <div className="absolute inset-0 bg-black bg-opacity-40"></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-lg">
                  {banner.name}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-6 drop-shadow-md max-w-2xl">
                  {banner.description}
                </p>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

// Property Carousel Component (same as before)
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

// Property Detail View Component (same as before)
const PropertyDetailView: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: () => void;
}> = ({ property, isOpen, onClose, onBookNow }) => {
  const { agentInfo } = useAgentStore();

  if (!isOpen || !property) return null;

  // Use agent info from property or fallback to store
  const displayAgent = property?.agent || agentInfo;

  const getRegistrationTime = (createdAt: string) => {
    if (!createdAt) return "Unknown";

    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor((diffDays % 365) / 30);

    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  };

  const getBedroomText = (bedroom: string | number): string => {
    if (bedroom === null || bedroom === undefined) return "0";
    const text = typeof bedroom === "number" ? bedroom.toString() : bedroom;
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
                {/* Agent Information Section */}
                {displayAgent && (
                  <>
                    {/* Agent Verification Status */}
                    <div className="flex gap-3 items-center">
                      <img
                        src={
                          displayAgent.profile_picture ||
                          "/images/Group 1505.svg"
                        }
                        alt="Agent"
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="leading-6">
                        <h6 className="text-lg text-gray-700">
                          {displayAgent.isVerified ? "Verified Agent" : "Agent"}
                        </h6>
                        <h6 className="text-sm text-gray-500">
                          {displayAgent.status === "VERIFIED"
                            ? "Professional Host"
                            : "Host"}
                        </h6>
                      </div>
                    </div>

                    {/* Agent Phone Number */}
                    <div className="flex gap-4 items-center">
                      <img
                        src="/images/Group 1497.svg"
                        alt="Phone"
                        className="w-8 h-8"
                      />
                      <h6 className="text-lg text-gray-700">
                        {displayAgent.phone_number || "Phone not available"}
                      </h6>
                    </div>

                    {/* Contact Agent */}
                    <div className="flex gap-4 items-center">
                      <img
                        src="/images/Group 1496.svg"
                        alt="Contact"
                        className="w-8 h-8"
                      />
                      <h6 className="text-lg text-gray-700">
                        Contact {displayAgent.name || "Agent"}
                      </h6>
                    </div>

                    {/* Registration Date */}
                    <div className="flex gap-4 items-center">
                      <img
                        src="/images/Group 1503.svg"
                        alt="Registration"
                        className="w-8 h-8"
                      />
                      <h6 className="text-lg text-gray-700">
                        Registered{" "}
                        {getRegistrationTime(displayAgent.createdAt || "")}
                      </h6>
                    </div>

                    {/* View All Properties */}
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
                  </>
                )}

                {/* Property Specific Details */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">Type:</span>
                      <span className="ml-2">{property.type}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Name:</span>
                      <span className="ml-2">{property.name}</span>
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
                    {displayAgent?.name && (
                      <div>
                        <span className="font-semibold">Agent Name:</span>
                        <span className="ml-2">{displayAgent.name}</span>
                      </div>
                    )}
                    {property.location && (
                      <div className="col-span-2">
                        <span className="font-semibold">Location:</span>
                        <span className="ml-2">{property.location}</span>
                      </div>
                    )}

                    {property.amenities && property.amenities.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-semibold">Amenities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {property.amenities
                            .slice(0, 5)
                            .map((amenity, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {amenity}
                              </span>
                            ))}
                          {property.amenities.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{property.amenities.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
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
                      alt={`${property.name} - ${index + 1}`}
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

// Booking Modal Component with Enhanced Booking Summary
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

  const { initiatePayment, isInitializingPayment, clearPaymentInitError } =
    usePaymentStore();

  const { fetchBookings, bookings } = useBookingStore();

  useEffect(() => {
    const fetchBookedDates = async (propertyId: string) => {
      try {
        setLoadingBookedDates(true);
        await fetchBookings();

        const propertyBookings = bookings.filter(
          (booking) => booking.apartment_id === propertyId,
        );

        const dates: Date[] = [];

        propertyBookings.forEach((booking) => {
          if (booking.booking_start_date && booking.booking_end_date) {
            const start = new Date(booking.booking_start_date);
            const end = new Date(booking.booking_end_date);

            const currentDate = new Date(start);
            while (currentDate <= end) {
              dates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
            }
          }

          if (booking.selected_dates && booking.selected_dates.length > 0) {
            booking.selected_dates.forEach((date: Date) => {
              dates.push(new Date(date));
            });
          }
        });

        const uniqueDates = Array.from(
          new Set(dates.map((date) => date.toISOString().split("T")[0])),
        ).map((dateStr) => new Date(dateStr));

        setBookedDates(uniqueDates);
      } catch (error) {
        console.error("Failed to fetch booked dates:", error);
        toast.warning(
          "Unable to load booked dates. Some dates may be unavailable.",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
        setBookedDates([]);
      } finally {
        setLoadingBookedDates(false);
      }
    };

    if (property && isOpen) {
      fetchBookedDates(property.id);
    }
  }, [property, isOpen, fetchBookings, bookings]); // Add fetchBookings and bookings to dependencies

  const isDateBooked = (date: Date) => {
    return bookedDates.some(
      (bookedDate) => bookedDate.toDateString() === date.toDateString(),
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDates.some(
      (selectedDate) => selectedDate.toDateString() === date.toDateString(),
    );
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

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

  // Group selected dates into clusters (consecutive dates)
  const getDateClusters = (dates: Date[]): Date[][] => {
    if (dates.length === 0) return [];

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const clusters: Date[][] = [];
    let currentCluster: Date[] = [sortedDates[0]];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const previousDate = sortedDates[i - 1];

      // Check if dates are consecutive
      const timeDiff = currentDate.getTime() - previousDate.getTime();
      const isConsecutive = timeDiff === 86400000; // 24 hours in milliseconds

      if (isConsecutive) {
        currentCluster.push(currentDate);
      } else {
        clusters.push([...currentCluster]);
        currentCluster = [currentDate];
      }
    }

    clusters.push(currentCluster);
    return clusters;
  };

  // Calculate total nights across all clusters
  const calculateTotalNights = (clusters: Date[][]): number => {
    return clusters.reduce((total, cluster) => total + cluster.length, 0);
  };

  // Format date for display
  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderDayContents = (day: number, date: Date) => {
    const isBooked = isDateBooked(date);
    const isSelected = isDateSelected(date);
    const isToday = new Date().toDateString() === date.toDateString();

    const handleDateClick = () => {
      if (!isBooked) {
        handleDateChange(date);
      }
    };

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
        onClick={handleDateClick}
        onMouseEnter={() => !isBooked && setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
        title={
          isBooked
            ? "Already booked"
            : isSelected
            ? "Selected - click to remove"
            : "Click to select"
        }>
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

    if (bookingData.number_of_nxt_of_kin.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid next of kin phone number", {
        position: "top-right",
        autoClose: 4000,
      });
      return false;
    }

    return true;
  };

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

    const finalAgentId =
      property?.agentId ||
      property?.agent?.id ||
      useAgentStore.getState().agentInfo?.id;

    if (!finalAgentId) {
      toast.error("Agent information is missing. Please contact support.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

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
      const dateClusters = getDateClusters(selectedDates);
      const totalNights = calculateTotalNights(dateClusters);
      const totalAmount = property.price * totalNights;

      const paymentData = {
        email: bookingData.email,
        channels: ["card", "bank"],
        currency: "NGN",
        agentId: finalAgentId,
        apartmentId: property.id,
        startDate: selectedDates[0].toISOString().split("T")[0],
        endDate: new Date(
          selectedDates[selectedDates.length - 1].getTime() + 86400000,
        )
          .toISOString()
          .split("T")[0],
        phoneNumber: bookingData.phone,
        nextofKinName: bookingData.name_of_nxt_of_kin,
        nextofKinNumber: bookingData.number_of_nxt_of_kin,
        fullName: bookingData.name,
      };

      console.log("🚀 Payment data being sent:", paymentData);

      const toastId = toast.loading("Initializing payment...", {
        position: "top-right",
      });

      const paymentResult = await initiatePayment(
        paymentData.email,
        paymentData.channels,
        paymentData.currency,
        paymentData.apartmentId,
        paymentData.startDate,
        paymentData.endDate,
        paymentData.phoneNumber,
        paymentData.nextofKinName,
        paymentData.nextofKinNumber,
        paymentData.fullName,
        paymentData.agentId,
      );

      if (paymentResult.success && paymentResult.data) {
        toast.update(toastId, {
          render: "Payment initialized successfully! Redirecting...",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        const bookingInfo = {
          ...bookingData,
          propertyId: property.id,
          propertyName: property.name,
          selectedDates: selectedDates,
          dateClusters: dateClusters,
          totalNights: totalNights,
          totalPrice: totalAmount,
          paymentReference: paymentResult.data.reference,
          agentId: finalAgentId,
          authorizationUrl:
            paymentResult.data.authorization_url ||
            paymentResult.data.paymentUrl,
        };

        console.log("💾 Storing booking info:", bookingInfo);
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingInfo));
        onSubmit(bookingInfo);

        setTimeout(() => {
          if (paymentResult.data.authorization_url) {
            window.location.href = paymentResult.data.authorization_url;
          } else if (paymentResult.data.paymentUrl) {
            window.location.href = paymentResult.data.paymentUrl;
          } else {
            console.error("No payment URL received");
            toast.error("Payment URL not received. Please try again.");
          }
        }, 1500);
      } else {
        throw new Error(paymentResult.message || "Payment initiation failed");
      }
    } catch (error: any) {
      console.error("❌ Payment initiation failed:", error);
      toast.error(`Payment failed: ${error.message || "Please try again"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
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

    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, clearPaymentInitError]);

  if (!isOpen || !property) return null;

  const dateClusters = getDateClusters(selectedDates);
  const totalNights = calculateTotalNights(dateClusters);

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
                      {totalNights} night{totalNights > 1 ? "s" : ""} total
                    </span>
                  </div>

                  {/* Individual Booking Clusters */}
                  <div className="space-y-4 mb-4">
                    {dateClusters.map((cluster, clusterIndex) => (
                      <div
                        key={clusterIndex}
                        className="p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-700">
                            Booking {clusterIndex + 1}
                          </span>
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {cluster.length} night
                            {cluster.length > 1 ? "s" : ""}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-in:</span>
                            <span>{formatDisplayDate(cluster[0])} (1pm)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Check-out:</span>
                            <span>
                              {formatDisplayDate(
                                new Date(
                                  cluster[cluster.length - 1].getTime() +
                                    86400000,
                                ),
                              )}{" "}
                              (12noon)
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Nights:</span>
                            <span>{cluster.length}</span>
                          </div>
                          {property.price && (
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(property.price * cluster.length)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Amount */}
                  {property.price && (
                    <div className="pt-4 border-t border-gray-200">
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
                          }).format(property.price * totalNights)}
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

  // Get agent information
  const { agentInfo, agentId } = usePropertyAgentInfo();

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

  // Enhanced property transformation with agent info - using useCallback
  const transformPropertiesWithAgentInfo = useCallback(
    (properties: any[]): Property[] => {
      return properties.map((prop) => ({
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
        amenities: prop.amenities || [],
        agentId: prop.agentId || agentId,
        agent: agentInfo
          ? {
              id: agentInfo.id,
              name: agentInfo.name,
              email: agentInfo.email,
              phone_number: agentInfo.phone_number,
              status: agentInfo.status,
              isVerified: agentInfo.isVerified,
              profile_picture: agentInfo.profile_picture,
              personalUrl: agentInfo.personalUrl,
              createdAt: agentInfo.createdAt,
            }
          : undefined,
      }));
    },
    [agentInfo, agentId],
  );

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

  // Load properties - using useCallback to avoid infinite re-renders
  const loadProperties = useCallback(
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
            const propertiesWithAgentInfo = transformPropertiesWithAgentInfo(
              response.properties,
            );

            setProperties(propertiesWithAgentInfo);
            setFilteredProperties(propertiesWithAgentInfo);
            setPagination(response.pagination);
          }
        } else {
          await fetchEnlistedProperties(page, 9);
          const transformedProperties =
            transformPropertiesWithAgentInfo(enlistedProperties);

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
      dataSource,
      clearError,
      fetchPropertiesBySlug,
      fetchEnlistedProperties,
      transformPropertiesWithAgentInfo,
      enlistedProperties,
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
      const transformedProperties =
        transformPropertiesWithAgentInfo(enlistedProperties);

      setProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
      setPagination({
        total: transformedProperties.length,
        page: currentPage,
        limit: 9,
        totalPages: Math.ceil(transformedProperties.length / 9),
      });
    }
  }, [
    enlistedProperties,
    dataSource,
    currentPage,
    transformPropertiesWithAgentInfo,
  ]);

  // Ensure properties have agentId when agentInfo is loaded
  useEffect(() => {
    if (properties.length > 0 && agentInfo) {
      const propertiesWithAgentId = properties.map((property) => ({
        ...property,
        agentId: property.agentId || agentInfo.id,
      }));

      if (
        JSON.stringify(propertiesWithAgentId) !== JSON.stringify(properties)
      ) {
        setProperties(propertiesWithAgentId);
        setFilteredProperties(propertiesWithAgentId);
      }
    }
  }, [properties, agentInfo]);

  // Filter and sort properties
  useEffect(() => {
    let result = [...properties];

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
        result.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || "";
          const nameB = b.name?.toLowerCase() || "";
          return nameA.localeCompare(nameB);
        });
        break;

      case "name-desc":
        result.sort((a, b) => {
          const nameA = a.name?.toLowerCase() || "";
          const nameB = b.name?.toLowerCase() || "";
          return nameB.localeCompare(nameA);
        });
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
          const locationA = (a.location || a.address || "").toLowerCase();
          const locationB = (b.location || b.address || "").toLowerCase();
          return locationA.localeCompare(locationB);
        });
        break;

      default:
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

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      console.log("✅ Booking submitted successfully:", bookingData);

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

      <BannerCarousel />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
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
                  <PropertyCarousel
                    images={property.images}
                    propertyName={property.name}
                  />

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

      <PropertyDetailView
        property={selectedProperty}
        isOpen={isDetailViewOpen}
        onClose={handleCloseDetailView}
        onBookNow={() => {
          setIsDetailViewOpen(false);
          setIsBookingModalOpen(true);
        }}
      />

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
