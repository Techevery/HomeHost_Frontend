import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { Link, useNavigate } from "react-router-dom";
import { 
  MdOutlineFavoriteBorder, 
  MdSearch, 
  MdPerson, 
  MdChevronLeft, 
  MdChevronRight,
  MdClose,
  MdAdd,
  MdCheckCircle,
  MdCheck,
  MdError
} from "react-icons/md";
import useAgentStore from "../../../stores/agentstore";

// Define the Property interface based on your API response
interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: string;
  images: string[];
  status: 'available' | 'unavailable';
  location: string;
  amenities: string[];
  video_link?: string | null;
  adminId?: string;
  agentPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Notification type
interface Notification {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

// Option type for selection
type PricingOption = 'accept-percentage' | 'add-markup';

// Utility function to safely handle amenities data
const getAmenitiesArray = (amenities: any): string[] => {
  if (Array.isArray(amenities)) {
    return amenities.filter((item: any) => item != null).map((item: any) => item.toString().trim());
  }
  if (typeof amenities === 'string') {
    return amenities.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '');
  }
  return [];
};

const ViewProperties = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [markupPrice, setMarkupPrice] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [notification, setNotification] = useState<Notification>({ 
    type: 'success', 
    message: '', 
    show: false 
  });
  const [pricingOption, setPricingOption] = useState<PricingOption>('accept-percentage');

  // Use agent store to fetch public properties
  const { 
    publicProperties, 
    fetchPublicProperties, 
    loading, 
    currentPublicPage, 
    hasMorePublicProperties,
    enlistApartment,
    agentInfo,
    error
  } = useAgentStore();

  const carouselImages = [
    "/images/bg.svg",
    "/images/house1.svg",
    "/images/house 2.svg",
    "/images/house 3.svg"
  ];

  // Fetch public properties on component mount
  useEffect(() => {
    fetchPublicProperties(1, 12);
  }, [fetchPublicProperties]);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Auto-hide notification
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const nextImage = () => {
    if (selectedProperty && selectedProperty.images) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % selectedProperty.images.length
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty && selectedProperty.images) {
      setCurrentImageIndex((prev) => 
        (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length
      );
    }
  };

  // Fixed: Safe property filtering with array check
  const filteredProperties = React.useMemo(() => {
    if (!Array.isArray(publicProperties) || publicProperties.length === 0) {
      return [];
    }
    
    if (!searchTerm.trim()) {
      return publicProperties;
    }
    
    return publicProperties.filter((property: Property) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (property.name && property.name.toLowerCase().includes(searchLower)) ||
        (property.address && property.address.toLowerCase().includes(searchLower)) ||
        (property.location && property.location.toLowerCase().includes(searchLower)) ||
        (property.type && property.type.toLowerCase().includes(searchLower)) ||
        (property.price && property.price.toLowerCase().includes(searchLower))
      );
    });
  }, [publicProperties, searchTerm]);

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setMarkupPrice("");
    setPricingOption('accept-percentage');
  };

  const handleAddProperty = async () => {
    if (!selectedProperty) return;

    // Validate based on selected option
    if (pricingOption === 'add-markup' && !markupPrice) {
      showNotification('error', "Please enter a markup price");
      return;
    }

    setIsAdding(true);
    try {
      const markedUpPrice = pricingOption === 'add-markup' ? parseFloat(markupPrice) : 0;
      const agentPercentage = selectedProperty.agentPercentage || 10;
      
      const result = await enlistApartment(selectedProperty.id, markedUpPrice, agentPercentage);
      
      if (result.success) {
        // Close modal on success
        setSelectedProperty(null);
        setMarkupPrice("");
        setPricingOption('accept-percentage');
        showNotification('success', result.message || "Property added successfully to your listings!");
      } else {
        showNotification('error', result.message || "Failed to add property. Please try again.");
      }
    } catch (error) {
      console.error("Failed to add property:", error);
      showNotification('error', "Failed to add property. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const calculateFinalPrice = () => {
    if (!selectedProperty) return "0";
    const basePrice = parseFloat(selectedProperty.price || "0");
    const markup = pricingOption === 'add-markup' ? parseFloat(markupPrice) || 0 : 0;
    
    const finalPrice = basePrice + markup;
    return finalPrice.toLocaleString();
  };

  const calculateCommission = () => {
    if (!selectedProperty) return "0";
    const basePrice = parseFloat(selectedProperty.price || "0");
    const markup = pricingOption === 'add-markup' ? parseFloat(markupPrice) || 0 : 0;
    const agentPercentage = selectedProperty.agentPercentage || 10;
    
    const finalPrice = basePrice + markup;
    const commission = (finalPrice * agentPercentage) / 100;
    return commission.toLocaleString();
  };

  // Helper function to get property image safely
  const getPropertyImage = (property: Property) => {
    return property.images && property.images.length > 0 
      ? property.images[0] 
      : "/images/house1.svg";
  };

  // Helper function to get current modal image safely
  const getCurrentModalImage = () => {
    if (!selectedProperty || !selectedProperty.images) return "/images/house1.svg";
    return selectedProperty.images[currentImageIndex] || "/images/house1.svg";
  };

  // Load more properties when scrolling (optional)
  const loadMoreProperties = () => {
    if (hasMorePublicProperties && !loading) {
      fetchPublicProperties(currentPublicPage + 1, 12);
    }
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (pricingOption === 'add-markup') {
      return !!markupPrice;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Notification Modal */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className={`mr-3 ${
              notification.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {notification.type === 'success' ? (
                <MdCheck className="text-2xl" />
              ) : (
                <MdError className="text-2xl" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {notification.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="text-sm">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className={`ml-4 ${
                notification.type === 'success' ? 'text-green-500' : 'text-red-500'
              } hover:opacity-70`}
            >
              <MdClose className="text-xl" />
            </button>
          </div>
        </div>
      )}
      
      {/* Header Section with Carousel */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden mt-16">
        {/* Carousel Container */}
        <div className="relative w-full h-full">
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt={`Property showcase ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black opacity-40"></div>
            </div>
          ))}
        </div>

        {/* Carousel Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-opacity-30 transition-all duration-200 z-20"
        >
          <MdChevronLeft className="text-2xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 text-white hover:bg-opacity-30 transition-all duration-200 z-20"
        >
          <MdChevronRight className="text-2xl" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
            />
          ))}
        </div>

        {/* Header Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="relative max-w-screen-xl mx-auto px-4 lg:px-8 w-full">
            {/* Top Navigation Bar */}
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                {/* Optional: Add back manage booking button if needed */}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MdSearch className="text-gray-400 text-xl" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search properties, locations, prices..."
                    className="pl-10 pr-4 py-3 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-64 lg:w-80"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Hero Text */}
            <div className="text-center text-white">
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
                Discover Your Dream Home
              </h1>
              <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto drop-shadow-md">
                Experience luxury living with our curated selection of premium apartments and villas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse through our handpicked selection of luxury accommodations
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-600 font-semibold">Error loading properties</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchPublicProperties(1, 12)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (!Array.isArray(publicProperties) || publicProperties.length === 0) ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading properties...</span>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
              {filteredProperties.map((property: Property) => (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative h-64">
                    <img
                      src={getPropertyImage(property)}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center z-20 hover:scale-110 transition-transform duration-200">
                      <div className="bg-white text-black rounded-full p-3 shadow-lg hover:shadow-xl">
                        <MdOutlineFavoriteBorder className="text-xl" />
                      </div>
                    </button>
                    
                    {/* Availability Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        property.status === 'available' 
                          ? "bg-green-500 text-white" 
                          : "bg-red-500 text-white"
                      }`}>
                        {property.status === 'available' ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-4">
                      <h5 className="text-xl font-semibold text-gray-900 line-clamp-2">
                        {property.name}
                      </h5>

                      <div className="flex items-center gap-2 text-gray-600">
                        <img
                          src="/images/location 1.svg"
                          alt="Location"
                          className="w-5 h-5"
                        />
                        <span className="text-lg">{property.location || property.address}</span>
                      </div>

                      {/* Display Agent Percentage if available */}
                      {property.agentPercentage && (
                        <div className="flex items-center gap-2 text-blue-600 font-semibold">
                          <MdCheckCircle className="text-blue-500" />
                          <span>Agent Commission: {property.agentPercentage}%</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <h4 className="text-2xl font-bold text-blue-600">
                          NGN {parseFloat(property.price || "0").toLocaleString()}/Night
                        </h4>

                        <button
                          onClick={() => handleViewProperty(property)}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                            property.status === 'available'
                              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMorePublicProperties && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={loadMoreProperties}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Loading..." : "Load More Properties"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500">
              {Array.isArray(publicProperties) && publicProperties.length === 0 
                ? "No properties available at the moment." 
                : "Try adjusting your search terms to find what you're looking for."}
            </p>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
              <button
                onClick={() => setSelectedProperty(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MdClose className="text-2xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Carousel */}
                <div className="relative">
                  <div className="relative h-80 rounded-xl overflow-hidden">
                    <img
                      src={getCurrentModalImage()}
                      alt={selectedProperty.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Navigation Arrows - Only show if multiple images */}
                    {selectedProperty.images && selectedProperty.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 transition-all duration-200"
                        >
                          <MdChevronLeft className="text-xl" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 text-gray-800 hover:bg-opacity-100 transition-all duration-200"
                        >
                          <MdChevronRight className="text-xl" />
                        </button>
                      </>
                    )}
                    
                    {/* Image Indicators - Only show if multiple images */}
                    {selectedProperty.images && selectedProperty.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {selectedProperty.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? "bg-white scale-125"
                                : "bg-white bg-opacity-50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Property Info */}
                  <div className="mt-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedProperty.name}
                    </h3>
                    <p className="text-3xl font-bold text-blue-600 mb-4">
                      NGN {parseFloat(selectedProperty.price || "0").toLocaleString()}/Night
                    </p>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <img
                        src="/images/location 1.svg"
                        alt="Location"
                        className="w-5 h-5"
                      />
                      <span className="text-lg">{selectedProperty.address}</span>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Amenities</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {getAmenitiesArray(selectedProperty.amenities).length > 0 ? (
                          getAmenitiesArray(selectedProperty.amenities).map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <MdCheckCircle className="text-green-500" />
                              <span className="text-gray-700">{amenity}</span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-2 text-gray-500 text-center py-2">
                            No amenities listed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Options Section */}
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Add to Your Listings
                    </h3>
                    
                    {/* Agent Commission Display */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MdCheckCircle className="text-yellow-600 text-xl" />
                        <h4 className="font-semibold text-yellow-800">Agent Commission</h4>
                      </div>
                      <p className="text-yellow-700 text-lg font-bold">
                        {selectedProperty.agentPercentage || 10}% Commission
                      </p>
                      <p className="text-yellow-600 text-sm mt-1">
                        This commission rate is set by the property owner
                      </p>
                    </div>

                    {/* Pricing Options Selection */}
                    <div className="space-y-4">
                      {/* Option 1: Accept Percentage Only */}
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="pricingOption"
                            value="accept-percentage"
                            checked={pricingOption === 'accept-percentage'}
                            onChange={(e) => setPricingOption(e.target.value as PricingOption)}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              Use Base Price Only
                            </div>
                            <div className="text-sm text-gray-600">
                              List the property at the original price with {selectedProperty.agentPercentage || 10}% commission
                            </div>
                            <div className="mt-2 text-green-600 font-semibold">
                              Final Price: NGN {parseFloat(selectedProperty.price || "0").toLocaleString()}/Night
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Option 2: Add Markup Price */}
                      <div className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="pricingOption"
                            value="add-markup"
                            checked={pricingOption === 'add-markup'}
                            onChange={(e) => setPricingOption(e.target.value as PricingOption)}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900 mb-1">
                              Add Your Markup
                            </div>
                            <div className="text-sm text-gray-600 mb-3">
                              Add your markup to the base price
                            </div>
                            
                            {/* Markup Input - Only show when this option is selected */}
                            {pricingOption === 'add-markup' && (
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                  Your Markup Price (NGN)
                                </label>
                                <input
                                  type="number"
                                  value={markupPrice}
                                  onChange={(e) => setMarkupPrice(e.target.value)}
                                  placeholder="Enter your markup amount"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-gray-500 text-sm">
                                  This will be added to the base price
                                </p>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Price Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span className="font-medium">
                            NGN {parseFloat(selectedProperty.price || "0").toLocaleString()}
                          </span>
                        </div>
                        {pricingOption === 'add-markup' && markupPrice && (
                          <div className="flex justify-between">
                            <span>Your Markup:</span>
                            <span className="font-medium text-blue-600">
                              + NGN {parseFloat(markupPrice).toLocaleString()}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between border-t pt-2">
                          <span className="font-semibold">Final Price:</span>
                          <span className="font-bold text-green-600">
                            NGN {calculateFinalPrice()}/Night
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Commission ({selectedProperty.agentPercentage || 10}%):</span>
                          <span className="font-bold text-blue-600">
                            NGN {calculateCommission()}/Night
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={handleAddProperty}
                      disabled={!isFormValid() || isAdding}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 mt-4 ${
                        isFormValid() && !isAdding
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {isAdding ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <MdAdd className="text-xl" />
                          Add to My Listings
                        </>
                      )}
                    </button>
                  </div>

                  {/* Property Details */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Property Details</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{selectedProperty.type || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bedrooms:</span>
                        <span className="font-medium">{selectedProperty.bedroom || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servicing:</span>
                        <span className="font-medium">{selectedProperty.servicing || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`font-medium ${
                          selectedProperty.status === 'available' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedProperty.status || "Unknown"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agent Commission:</span>
                        <span className="font-medium text-blue-600">
                          {selectedProperty.agentPercentage || 10}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProperties;