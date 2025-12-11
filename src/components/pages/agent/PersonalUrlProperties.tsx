import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAgentStore from "../../../stores/agentstore";
import usePaymentStore from "../../../stores/paymentstore";
import useBookingStore from "../../../stores/bookingStore";
import Carousel from "react-grid-carousel";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";

interface PropertyAgent {
  contact: string;
  id: string;
  name: string;
  email: string;
  phone_number: string;
  status: string;
  image: string;
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
  agent: PropertyAgent;
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

const useAgentDataFromSlug = () => {
  const [agentData, setAgentData] = useState<PropertyAgent | null>(null);
  const { personalUrl } = useParams<{ personalUrl: string }>();
  const { fetchPropertiesBySlug } = useAgentStore();

  const fetchAgentData = useCallback(async () => {
    if (!personalUrl) return;

    try {
      const response = await fetchPropertiesBySlug(personalUrl, 1, 1);
      if (response && response.agent) {
        setAgentData(response.agent);
      }
    } catch (error) {
      toast.error("Failed to fetch agent data");
    }
  }, [personalUrl, fetchPropertiesBySlug]);

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  return agentData;
};

// Professional Banner Carousel Component
const BannerCarousel: React.FC<{ agentId?: string }> = ({ agentId }) => {
  const { personalUrl } = useParams<{ personalUrl: string }>();
  const { fetchPropertiesBySlug } = useAgentStore();
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      if (!personalUrl) return;

      try {
        setLoading(true);
        const response = await fetchPropertiesBySlug(personalUrl, 1, 1);
        
        if (response && response.banners) {
          setBanners(response.banners);
        } else {
          setBanners([]);
        }
      } catch (error) {
       
        toast.error("Failed to load banners");
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [personalUrl, fetchPropertiesBySlug]);

  
  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative w-full bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="h-80 md:h-96 lg:h-[500px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
            <p className="text-white text-lg font-medium">Loading featured properties...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  const activeBanners = banners.filter((banner) => {
    if (!banner.hasOwnProperty('status')) return true;
    return banner.status === "active";
  });

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden bg-gray-900">
    
      <Carousel
        cols={1}
        rows={1}
        loop
        autoplay={5000}
        showDots={false}
        mobileBreakpoint={768}
        onChange={handleSlideChange}
        containerClassName="carousel-container"
      >
        {activeBanners.map((banner, index) => (
          <Carousel.Item key={banner.id}>
            <div className="relative h-80 md:h-96 lg:h-[500px] group">
              
              <div className="absolute inset-0">
                <img
                  src={banner.image_url}
                  alt={banner.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMUY0QThGIi8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDE1MCAyNTBIMjUwTDIwMCAyMDBaIiBmaWxsPSIjMDA3N0VGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiMwMDc3RUYiLz4KPC9zdmc+";
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/20 to-black/40"></div>
              </div>

          
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-6 lg:px-8">
                  <div className="max-w-2xl">
                  
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-white text-sm font-medium uppercase tracking-wide">
                        Featured Property
                      </span>
                    </div>

                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                      {banner.name}
            
                    </h1>

                    
                    <p className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 lg:text-5xl md:text-4xl text-2xl">
                      {banner.description || "Discover exceptional properties with premium amenities and unmatched comfort"}
                    </p>

                  
                  
                  </div>
                </div>
              </div>

          
              <div className="absolute bottom-8 right-8">
                <div className="flex items-center space-x-2 text-white">
                  <span className="text-2xl font-bold">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-400">{String(activeBanners.length).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

  
      {activeBanners.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      
      {activeBanners.length > 1 && (
        <>
          <button 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group hover:scale-110"
            onClick={() => handleSlideChange((currentSlide - 1 + activeBanners.length) % activeBanners.length)}
          >
            <svg className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group hover:scale-110"
            onClick={() => handleSlideChange((currentSlide + 1) % activeBanners.length)}
          >
            <svg className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
    </div>
  );
};


const PropertyImageCarousel: React.FC<{ 
  images: string[]; 
  propertyName: string;
}> = ({ images, propertyName }) => {
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
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
    <Carousel cols={1} rows={1} loop>
      {images.map((image, index) => (
        <Carousel.Item key={index}>
          <img
            src={image}
            alt={`${propertyName} - ${index + 1}`}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMjAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMjAwTDE1MCAyNTBIMjUwTDIwMCAyMDBaIiBmaWxsPSIjRURFRUVGIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iMzAiIGZpbGw9IiNFRkVFRUYiLz4KPC9zdmc+";
            }}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
};


const PropertyDetailView: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: () => void;
  agentData: PropertyAgent | null;
}> = ({ property, isOpen, onClose, onBookNow, agentData }) => {
  if (!isOpen || !property) return null;


  const displayAgent = agentData;
  console.log({displayAgent})

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


  const getAmenitiesArray = (amenities: any): string[] => {
    if (Array.isArray(amenities)) {
      return amenities
        .filter((item) => item != null)
        .map((item) => item.toString().trim())
        .filter((item) => item !== "");
    }
    if (typeof amenities === "string") {
      return amenities
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "");
    }
    return [];
  };


  const safeAmenities = getAmenitiesArray(property.amenities);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-12 gap-6">
        
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

              <div className="flex flex-col gap-4 flex-1 ">
          

                {displayAgent && (
                  <>
                    <div className="flex gap-3 items-center ">
                      <img
                        src={displayAgent.image || "/images/Group 1505.svg"}
                        alt="Agent"
                        className="w-12 h-12 rounded-full"
                      />
                    </div>
                    <div>
                      <span className="font-semibold">Agent Name:</span>
                      <span className="ml-2">{displayAgent.name}</span>
                    </div>
                    <div className="leading-6">
                      <span className="font-semibold">Agent Status:</span>
                      <h6 className="text-sm text-gray-700">
                        {displayAgent.status}
                      </h6>
                    </div>

                
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold">Agent Phone Number:</span>
                      <h6 className="text-lg text-gray-700">
                        {displayAgent.contact || displayAgent.phone_number || "Phone not available"}
                      </h6>
                    </div>

                    
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold">Agent Email:</span>
                      <h6 className="text-lg text-gray-700">
                        {displayAgent.email || "Email not available"}
                      </h6>
                    </div>

                    
                    <div className="flex gap-4 items-center">
                      <span className="font-semibold">Registered:</span>
                      <h6 className="text-lg text-gray-700">
                        {getRegistrationTime(displayAgent.createdAt || "")}
                      </h6>
                    </div>
                  </>
                )}

                
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

                  
                    {safeAmenities.length > 0 && (
                      <div className="col-span-2">
                        <span className="font-semibold">Amenities:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {safeAmenities.slice(0, 5).map((amenity, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {amenity}
                            </span>
                          ))}
                          {safeAmenities.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{safeAmenities.length - 5} more
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


const ManageBookingModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { manageBooking, managedBookings, loading, error } = useBookingStore();
  const [searchPerformed, setSearchPerformed] = useState(false);

  
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);


  const initialData = {
    email:
      localStorage.getItem("remember") === "true"
        ? localStorage.getItem("username") || ""
        : "",
    phone: "",
  };

  const validation = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .test(
        "email-or-phone",
        "Either email or phone number is required",
        function (value) {
          const { phone } = this.parent;
          return !!(value || phone);
        },
      ),
    phone: Yup.string()
      .matches(/^[0-9]+$/, "Phone number must contain only digits")
      .min(10, "Phone number must be at least 10 digits")
      .test(
        "email-or-phone",
        "Either email or phone number is required",
        function (value) {
          const { email } = this.parent;
          return !!(email || value);
        },
      ),
  });

  const onSubmit = async (values: { email: string; phone: string }) => {
    try {
      setSearchPerformed(false);


      await manageBooking(values.email, values.phone);
      setSearchPerformed(true);
    } catch (error) {
    
      toast.error("Failed to search bookings. Please try again.", {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { class: string; text: string } } = {
      confirmed: { class: "bg-green-100 text-green-800", text: "Confirmed" },
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      cancelled: { class: "bg-red-100 text-red-800", text: "Cancelled" },
      completed: { class: "bg-blue-100 text-blue-800", text: "Completed" },
      booked: { class: "bg-purple-100 text-purple-800", text: "Booked" },
    };

    const config = statusConfig[status.toLowerCase()] || {
      class: "bg-gray-100 text-gray-800",
      text: status,
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${config.class}`}>
        {config.text}
      </span>
    );
  };


  const handleViewBookingDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  
  const handleDownloadBooking = (booking: any) => {
    const content = generateDownloadContent(booking);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-details-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Booking details downloaded successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  
  const generateDownloadContent = (booking: any) => {
    
    const checkInDate =
      booking.booking_start_date || booking.transaction?.booking_start_date;
    const checkOutDate =
      booking.booking_end_date || booking.transaction?.booking_end_date;
    const duration =
      booking.duration_days || booking.transaction?.duration_days;
    const amount = booking.amount || booking.transaction?.amount;

    const content = `
Booking Details Receipt
=======================

Booking ID: ${booking.id}
Property: ${booking.apartment?.name || "N/A"}
Address: ${booking.apartment?.address || "N/A"}

Booking Information:
-------------------
Status: ${booking.status}
Check-in: ${checkInDate ? formatDate(checkInDate) : "N/A"}
Check-out: ${checkOutDate ? formatDate(checkOutDate) : "N/A"}
Duration: ${duration || "N/A"} days

Payment Details:
----------------
Amount: ${amount ? formatPrice(Number(amount)) : "N/A"}
Transaction Status: ${booking.transaction?.status || "N/A"}
Transaction Reference: ${booking.transaction?.reference || "N/A"}

Contact Information:
-------------------
Email: ${booking.transaction?.email || "N/A"}
Phone: ${booking.transaction?.phone_number || "N/A"}

Booking Date: ${booking.created_at ? formatDate(booking.created_at) : "N/A"}
Generated on: ${new Date().toLocaleDateString()}
    `;

    return content;
  };

  
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
        
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800 transition-colors">
                <img
                  src="/images/Frame 67.svg"
                  alt="Back"
                  className="w-8 h-8"
                />
              </button>
              <h4 className="text-[#002221] text-[20px] font-semibold">
                Manage Booking
              </h4>
            </div>

            <div className="grid md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5">
                <div className="flex flex-col">
                  <h4 className="text-[#000000] py-4 text-[20px] md:text-[24px] font-semibold">
                    Enter your email or your phone number
                  </h4>

                  <Formik
                    initialValues={initialData}
                    validationSchema={validation}
                    onSubmit={onSubmit}>
                    {({ isSubmitting }) => (
                      <Form className="w-full lg:mt-5 mb-6 flex flex-col justify-between">
                        <div className="mb-5">
                          <div className="relative mb-4">
                            <Field
                              className="block w-full h-14 text-center border pl-3 rounded-[15px] focus:outline-none border-[#002221]"
                              name="email"
                              type="email"
                              id="email"
                              placeholder="Email Address"
                            />
                            <p className="text-red-700 text-xs mt-1 text-left">
                              <ErrorMessage name="email" />
                            </p>
                          </div>

                          <div className="relative mb-4">
                            <Field
                              className="block w-full h-14 text-center border pl-3 rounded-[15px] focus:outline-none border-[#002221]"
                              name="phone"
                              type="tel"
                              id="phone"
                              placeholder="Phone Number"
                            />
                            <p className="text-red-700 text-xs mt-1 text-left">
                              <ErrorMessage name="phone" />
                            </p>
                          </div>

                          <div className="text-xs text-gray-500 text-center mb-4">
                            Enter either your email or phone number to search
                            for bookings
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={loading || isSubmitting}
                          className="w-full bg-black text-white rounded-lg py-3 px-6 font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center">
                          {loading || isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Searching...
                            </>
                          ) : (
                            "Search Bookings"
                          )}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>

            
              <div className="md:col-span-7">
                {!searchPerformed ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <img
                      src="/images/cuate.svg"
                      alt="Search bookings"
                      className="w-48 h-48 mb-4"
                    />
                    <p className="text-gray-500">
                      Enter your email or phone number to search for your
                      bookings
                    </p>
                  </div>
                ) : managedBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Bookings Found
                    </h3>
                    <p className="text-gray-500">
                      No bookings were found with the provided information.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Your Bookings ({managedBookings.length})
                    </h3>
                    <div className="space-y-4">
                      {managedBookings.map((booking) => {
                      
                        const checkInDate =
                          booking.booking_start_date ||
                          booking.transaction?.booking_start_date;
                        const checkOutDate =
                          booking.booking_end_date ||
                          booking.transaction?.booking_end_date;
                        const duration =
                          booking.duration_days ||
                          booking.transaction?.duration_days;
                        const amount =
                          booking.amount || booking.transaction?.amount;

                        return (
                          <div
                            key={booking.id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleViewBookingDetails(booking)}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {booking.apartment?.name || "Unknown Property"}
                              </h4>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                              <div>
                                <span className="font-medium">Check-in:</span>
                                <span className="ml-1">
                                  {checkInDate
                                    ? formatDate(checkInDate)
                                    : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Check-out:</span>
                                <span className="ml-1">
                                  {checkOutDate
                                    ? formatDate(checkOutDate)
                                    : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span>
                                <span className="ml-1">
                                  {amount ? formatPrice(Number(amount)) : "N/A"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Duration:</span>
                                <span className="ml-1">
                                  {duration || "N/A"} days
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>
                                Ref: {booking.transaction?.reference || "N/A"}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewBookingDetails(booking);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium">
                                View Details →
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Booking Details
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDownloadBooking(selectedBooking)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={handleCloseDetailsModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              
              <div className="space-y-6">
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Property Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Property Name
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.apartment?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Address
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.apartment?.address || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Price per Night
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.apartment?.price
                          ? formatPrice(Number(selectedBooking.apartment.price))
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Booking Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Booking ID
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {selectedBooking.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(selectedBooking.status)}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Check-in Date
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.booking_start_date ||
                        selectedBooking.transaction?.booking_start_date
                          ? formatDate(
                              selectedBooking.booking_start_date ||
                                selectedBooking.transaction?.booking_start_date,
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Check-out Date
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.booking_end_date ||
                        selectedBooking.transaction?.booking_end_date
                          ? formatDate(
                              selectedBooking.booking_end_date ||
                                selectedBooking.transaction?.booking_end_date,
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Duration
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.duration_days ||
                          selectedBooking.transaction?.duration_days ||
                          "N/A"}{" "}
                        days
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Booking Date
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.created_at
                          ? formatDate(selectedBooking.created_at)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Total Amount
                      </label>
                      <p className="text-gray-900 text-lg font-semibold">
                        {selectedBooking.amount ||
                        selectedBooking.transaction?.amount
                          ? formatPrice(
                              Number(
                                selectedBooking.amount ||
                                  selectedBooking.transaction?.amount,
                              ),
                            )
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Transaction Status
                      </label>
                      <div className="mt-1">
                        {getStatusBadge(
                          selectedBooking.transaction?.status || "N/A",
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Transaction Reference
                      </label>
                      <p className="text-gray-900 font-mono text-sm">
                        {selectedBooking.transaction?.reference || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Payment Method
                      </label>
                      <p className="text-gray-900">Online Payment</p>
                    </div>
                  </div>
                </div>

                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.transaction?.email || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone Number
                      </label>
                      <p className="text-gray-900">
                        {selectedBooking.transaction?.phone_number || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCloseDetailsModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
    );
};


const BookingModal: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
  personalUrl?: string;
  agentData: PropertyAgent | null;
}> = ({ property, isOpen, onClose, onSubmit, personalUrl, agentData }) => {
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

  const { fetchBookingDates, bookingDates, loading, error } = useBookingStore();

  // Fetch booked dates when modal opens
  useEffect(() => {
    const fetchBookedDates = async (propertyId: string) => {
      try {
        setLoadingBookedDates(true);
       

        // Clear previous dates
        setBookedDates([]);

        // Fetch booking dates
        await fetchBookingDates(propertyId);

        const dates: Date[] = [];

        // Process booking dates
        if (bookingDates && bookingDates.length > 0) {
          bookingDates.forEach((bookingDate) => {
           

            // Check if booking has valid dates
            if (bookingDate.booking_start_date && bookingDate.booking_end_date) {
              const start = new Date(bookingDate.booking_start_date);
              const end = new Date(bookingDate.booking_end_date);

              // Validate dates
              if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                console.warn("Invalid date found:", bookingDate);
                return;
              }

              // Normalize dates to start of day
              start.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);

              // Add all dates in the range to booked dates
              const currentDate = new Date(start);
              while (currentDate <= end) {
                const dateToAdd = new Date(currentDate);
                dates.push(dateToAdd);
                currentDate.setDate(currentDate.getDate() + 1);
              }
            }
          });
        }

        // Remove duplicates and sort
        const uniqueDates = Array.from(
          new Set(dates.map((date) => date.getTime())),
        ).map((timestamp) => new Date(timestamp));

        uniqueDates.sort((a, b) => a.getTime() - b.getTime());

        setBookedDates(uniqueDates);
      } catch (error) {
        console.error("Error fetching booked dates:", error);
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

    if (property && isOpen && property.id) {
      fetchBookedDates(property.id);
    }
  }, [property, isOpen, fetchBookingDates, bookingDates]);

  // Clear booked dates when property changes
  useEffect(() => {
    if (property && isOpen) {
      setBookedDates([]);
    }
  }, [property?.id, isOpen]);

  // Improved isDateBooked function
  const isDateBooked = (date: Date) => {
    if (!date || bookedDates.length === 0) return false;

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    const isBooked = bookedDates.some((bookedDate) => {
      if (!bookedDate) return false;

      const normalizedBookedDate = new Date(bookedDate);
      normalizedBookedDate.setHours(0, 0, 0, 0);

      return normalizedBookedDate.getTime() === dateToCheck.getTime();
    });

    return isBooked;
  };

  const isDateSelected = (date: Date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    return selectedDates.some((selectedDate) => {
      const normalizedSelectedDate = new Date(selectedDate);
      normalizedSelectedDate.setHours(0, 0, 0, 0);
      return normalizedSelectedDate.getTime() === dateToCheck.getTime();
    });
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    if (isDateBooked(dateToCheck)) {
      toast.info("This date is already booked. Please select another date.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const dateIndex = selectedDates.findIndex((selectedDate) => {
      const normalizedSelectedDate = new Date(selectedDate);
      normalizedSelectedDate.setHours(0, 0, 0, 0);
      return normalizedSelectedDate.getTime() === dateToCheck.getTime();
    });

    if (dateIndex >= 0) {
      const newDates = selectedDates.filter((_, index) => index !== dateIndex);
      setSelectedDates(newDates);

      if (dateToCheck.getTime() === startDate?.getTime()) {
        setStartDate(null);
        setEndDate(null);
      }
      if (dateToCheck.getTime() === endDate?.getTime()) {
        setEndDate(null);
      }
    } else {
      const newDates = [...selectedDates, dateToCheck].sort(
        (a, b) => a.getTime() - b.getTime(),
      );
      setSelectedDates(newDates);

      if (newDates.length === 1) {
        setStartDate(dateToCheck);
        setEndDate(new Date(dateToCheck.getTime() + 86400000));
      } else {
        const firstDate = newDates[0];
        const lastDate = newDates[newDates.length - 1];
        setStartDate(firstDate);
        setEndDate(new Date(lastDate.getTime() + 86400000));
      }
    }
  };

  // Get date clusters for multiple booking periods
  const getDateClusters = (dates: Date[]): Date[][] => {
    if (dates.length === 0) return [];

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());
    const clusters: Date[][] = [];
    let currentCluster: Date[] = [sortedDates[0]];

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const previousDate = sortedDates[i - 1];

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

  // Convert clusters to date arrays for API
  const convertClustersToDateArrays = (
    clusters: Date[][],
  ): { startDates: string[]; endDates: string[] } => {
    const startDates: string[] = [];
    const endDates: string[] = [];

    clusters.forEach((cluster) => {
      if (cluster.length > 0) {
        // Start date is the first date in the cluster
        startDates.push(cluster[0].toISOString().split("T")[0]);

        // End date is the day after the last date in the cluster
        const endDate = new Date(cluster[cluster.length - 1]);
        endDate.setDate(endDate.getDate() + 1);
        endDates.push(endDate.toISOString().split("T")[0]);
      }
    });

    return { startDates, endDates };
  };

  const renderDayContents = (day: number, date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    const isBooked = isDateBooked(normalizedDate);
    const isSelected = isDateSelected(normalizedDate);
    const isToday =
      new Date().setHours(0, 0, 0, 0) === normalizedDate.getTime();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = normalizedDate < today;

    const handleDateClick = () => {
      if (!isBooked && !isPast) {
        handleDateChange(normalizedDate);
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
          : isPast
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "hover:bg-gray-100 cursor-pointer"
      }
      transition-colors duration-200
    `}
        onClick={handleDateClick}
        onMouseEnter={() =>
          !isBooked && !isPast && setHoveredDate(normalizedDate)
        }
        onMouseLeave={() => setHoveredDate(null)}
        title={
          isBooked
            ? "Already booked"
            : isPast
            ? "Cannot select past dates"
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

    // Determine agent ID - prioritize agentData, fall back to property.agentId
    const finalAgentId = agentData?.id || property.agentId;

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

     

      
      const { startDates, endDates } =
        convertClustersToDateArrays(dateClusters);

      
      const paymentData = {
        email: bookingData.email,
        channels: ["card", "bank"],
        currency: "NGN",
        agentId: finalAgentId,
        apartmentId: property.id,
        startDates: startDates,
        endDates: endDates,
        phoneNumber: bookingData.phone,
        nextofKinName: bookingData.name_of_nxt_of_kin,
        nextofKinNumber: bookingData.number_of_nxt_of_kin,
        fullName: bookingData.name,
        // personalUrl: personalUrl || agentData?.personalUrl, 
      };

      console.log("Payment data with personalUrl:", paymentData);

      const toastId = toast.loading("Initializing payment...", {
        position: "top-right",
        autoClose: 3000,
      });

      
      const paymentResult = await initiatePayment(
        paymentData.email,
        paymentData.channels,
        paymentData.currency,
        paymentData.apartmentId,
        paymentData.startDates,
        paymentData.endDates,
        paymentData.phoneNumber,
        paymentData.nextofKinName,
        paymentData.nextofKinNumber,
        paymentData.fullName,
        paymentData.agentId,
        // paymentData.personalUrl 
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
          // personalUrl: paymentData.personalUrl, 
          authorizationUrl:
            paymentResult.data.paymentUrl ||
            paymentResult.data.authorizationUrl,
        };

        
        sessionStorage.setItem("pendingBooking", JSON.stringify(bookingInfo));
        onSubmit(bookingInfo);

        
        setTimeout(() => {
          if (paymentResult.data.paymentUrl) {
            window.location.href = paymentResult.data.paymentUrl;
          } else if (paymentResult.data.authorizationUrl) {
            window.location.href = paymentResult.data.authorizationUrl;
          } else {
            console.error("No payment URL received");
            toast.error("Payment URL not received. Please try again.");
          }
        }, 1500);
      } else {
        throw new Error(paymentResult.message || "Payment initiation failed");
      }
    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast.error(`Payment failed: ${error.message || "Please try again"}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  // Reset form when modal closes
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
  const totalAmount = property.price * totalNights;

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

            {/* Next of Kin Information Section */}
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
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                  <span>Past</span>
                </div>
              </div>

              {loadingBookedDates ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    Loading availability...
                  </span>
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
                      {isDateBooked(hoveredDate) ? (
                        <>
                          <div className="font-semibold">Already Booked</div>
                          <div className="text-gray-300">
                            Please pick another date
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold">Available</div>
                          <div className="text-gray-300">
                            Click to select this date
                          </div>
                        </>
                      )}
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

                  {/* Individual booking periods */}
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

                  {/* Total amount */}
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

                      {/* Individual booking amounts (if multiple periods) */}
                      {dateClusters.length > 1 && (
                        <div className="flex justify-between items-center mb-2 text-sm">
                          <span className="text-gray-600">
                            Individual bookings:
                          </span>
                          <span className="text-gray-900 text-right">
                            {dateClusters.map((cluster, index) => (
                              <div key={index} className="text-right">
                                Booking {index + 1}:{" "}
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(property.price * cluster.length)}
                              </div>
                            ))}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center font-semibold text-lg">
                        <span>Total Amount:</span>
                        <span className="text-green-600">
                          {new Intl.NumberFormat("en-NG", {
                            style: "currency",
                            currency: "NGN",
                            minimumFractionDigits: 0,
                          }).format(totalAmount)}
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
  const { fetchPropertiesBySlug, isLoading, error, clearError } =
    useAgentStore();

 
  const agentData = useAgentDataFromSlug();

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
  const [isManageBookingModalOpen, setIsManageBookingModalOpen] =
    useState(false);

 
  const getBedroomText = (bedroom: string | number): string => {
    if (bedroom === null || bedroom === undefined) return "0";
    const text = typeof bedroom === "number" ? bedroom.toString() : bedroom;
    if (!text || text.trim() === "" || isNaN(parseInt(text))) {
      return "0";
    }
    return text;
  };


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


  const transformProperties = useCallback((properties: any[]): Property[] => {
    return properties.map((prop) => {
     
      const getAmenitiesArray = (amenities: any): string[] => {
        if (Array.isArray(amenities)) {
          return amenities
            .filter((item) => item != null)
            .map((item) => item.toString().trim());
        }
        if (typeof amenities === "string") {
          return amenities
            .split(",")
            .map((item) => item.trim())
            .filter((item) => item !== "");
        }
        return [];
      };

      return {
        id: prop.id,
        name: prop.name,
        address: prop.address,
        type: prop.type,
        servicing: prop.servicing || "",
        bedroom: prop.bedroom || "",
        price: prop.price,
        images: prop.images || [],
        createdAt: prop.createdAt,
        updatedAt: prop.updatedAt || prop.createdAt,
        status: prop.status || "available",
        apartmentId: prop.apartmentId || prop.id,
        location: prop.location,
        amenities: getAmenitiesArray(prop.amenities),
        agentId: prop.agentId,
       
      };
    });
  }, []);


  useEffect(() => {
    if (error) {
      toast.error(`Failed to load properties: ${error}`, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  }, [error]);


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

 
  const loadProperties = useCallback(
    async (page: number = 1) => {
      if (!personalUrl) return;

      try {
        clearError();
      

        const response = await fetchPropertiesBySlug(personalUrl, page, 9);

       

        if (response) {
          const transformedProperties = transformProperties(
            response.properties || [],
          );

          

          setProperties(transformedProperties);
          setFilteredProperties(transformedProperties);
          setPagination(
            response.pagination || {
              total: transformedProperties.length,
              page,
              limit: 9,
              totalPages: Math.ceil(transformedProperties.length / 9),
            },
          );
        }
      } catch (err) {
       
      }
    },
    [personalUrl, clearError, fetchPropertiesBySlug, transformProperties],
  );

 
  useEffect(() => {
    loadProperties(currentPage);
  }, [personalUrl, currentPage, loadProperties]);

 
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
    
      if (bookingData.dateClusters && bookingData.dateClusters.length > 1) {
        toast.success(
          `Booking initiated successfully! You have ${bookingData.dateClusters.length} separate booking periods. Redirecting to payment...`,
          {
            position: "top-right",
            autoClose: 4000,
          },
        );
      } else {
        toast.success(
          "Booking initiated successfully! Redirecting to payment...",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
      }
    } catch (error) {
    
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

      <BannerCarousel agentId={agentData?.id} />

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsManageBookingModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Manage My Booking
          </button>
        </div>
      </div>
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
                 <PropertyImageCarousel
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

      <ManageBookingModal
        isOpen={isManageBookingModalOpen}
        onClose={() => setIsManageBookingModalOpen(false)}
      />

      <PropertyDetailView
        property={selectedProperty}
        isOpen={isDetailViewOpen}
        onClose={handleCloseDetailView}
        onBookNow={() => {
          setIsDetailViewOpen(false);
          setIsBookingModalOpen(true);
        }}
        agentData={agentData}
      />

      <BookingModal
        property={selectedProperty}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSubmit={handleBookingSubmit}
        personalUrl={personalUrl}
        agentData={agentData}
      />
    </div>
  );
};

export default AgentPropertiesGallery;
