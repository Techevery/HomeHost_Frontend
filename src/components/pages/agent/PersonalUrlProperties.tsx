import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAgentStore from '../../../stores/agentstore';
import useBannerStore from '../../../stores/bannerStore';

// Define the property interface based on your API response
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

// Sort options
type SortOption = 'newest' | 'price-low-high' | 'price-high-low' | 'name' | 'bedrooms';

// Booking Modal Component
const BookingModal: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
}> = ({ property, isOpen, onClose, onSubmit }) => {
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    specialRequests: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...bookingData,
      propertyId: property?.id,
      propertyName: property?.name,
      totalPrice: property?.price ? property.price * (getNumberOfNights() || 1) : 0,
    });
  };

  const getNumberOfNights = () => {
    if (bookingData.checkIn && bookingData.checkOut) {
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }
    return 0;
  };

  const resetForm = () => {
    setBookingData({
      checkIn: '',
      checkOut: '',
      guests: 1,
      specialRequests: '',
    });
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

            {/* Action Buttons */}
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
                Confirm Booking
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
    enlistedProperties
  } = useAgentStore();

  const { banners, fetchBanners } = useBannerStore();

  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState<'slug' | 'enlisted'>('slug');

  const loadProperties = React.useCallback(
    async (page: number = 1) => {
      if (!personalUrl) return;
      
      try {
        clearError();
        
        if (dataSource === 'slug' && personalUrl) {
          // Fetch properties by slug (public view)
          const response: AgentPropertiesResponse = await fetchPropertiesBySlug(personalUrl, page, 9);
          
          if (response && response.properties) {
            setProperties(response.properties);
            setFilteredProperties(response.properties);
            setPagination(response.pagination);
          }
        } else {
          // Fetch enlisted properties (agent's own properties)
          await fetchEnlistedProperties(page, 9);
          
          // Transform enlisted properties to match our Property interface
          const transformedProperties: Property[] = enlistedProperties.map(prop => ({
            id: prop.id,
            name: prop.name,
            address: prop.address,
            type: prop.type,
            servicing: '', // You might want to add this field to your EnlistedProperty interface
            bedroom: '', // You might want to add this field to your EnlistedProperty interface
            price: prop.price,
            images: prop.images,
            createdAt: prop.createdAt,
            updatedAt: prop.createdAt, // Use createdAt if updatedAt is not available
            status: prop.status,
            apartmentId: prop.apartmentId,
            markedUpPrice: prop.markedUpPrice,
            agentPercentage: prop.agentPercentage
          }));
          
          setProperties(transformedProperties);
          setFilteredProperties(transformedProperties);
          setPagination({
            total: transformedProperties.length,
            page: page,
            limit: 9,
            totalPages: Math.ceil(transformedProperties.length / 9)
          });
        }
      } catch (err) {
        console.error('Failed to load properties:', err);
      }
    },
    [personalUrl, clearError, fetchPropertiesBySlug, fetchEnlistedProperties, enlistedProperties, dataSource]
  );

  // Determine data source based on whether personalUrl is provided
  useEffect(() => {
    if (personalUrl) {
      setDataSource('slug');
    } else {
      setDataSource('enlisted');
    }
  }, [personalUrl]);

  // Fetch properties when component mounts or personalUrl/page changes
  useEffect(() => {
    loadProperties(currentPage);
  }, [personalUrl, currentPage, loadProperties, dataSource]);

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Update properties when enlistedProperties changes (for agent's own view)
  useEffect(() => {
    if (dataSource === 'enlisted' && enlistedProperties.length > 0) {
      const transformedProperties: Property[] = enlistedProperties.map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        type: prop.type,
        servicing: '', // Add default or map from your data
        bedroom: '', // Add default or map from your data
        price: prop.price,
        images: prop.images,
        createdAt: prop.createdAt,
        updatedAt: prop.createdAt,
        status: prop.status,
        apartmentId: prop.apartmentId,
        markedUpPrice: prop.markedUpPrice,
        agentPercentage: prop.agentPercentage
      }));
      
      setProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
      setPagination({
        total: transformedProperties.length,
        page: currentPage,
        limit: 9,
        totalPages: Math.ceil(transformedProperties.length / 9)
      });
    }
  }, [enlistedProperties, dataSource, currentPage]);

  // Filter and sort properties when search query or sort option changes
  useEffect(() => {
    let result = [...properties];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(property => 
        property.name.toLowerCase().includes(query) ||
        property.address.toLowerCase().includes(query) ||
        property.type.toLowerCase().includes(query) ||
        property.servicing.toLowerCase().includes(query) ||
        property.bedroom.toLowerCase().includes(query) ||
        property.price.toString().includes(query)
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low-high':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'bedrooms':
        result.sort((a, b) => parseInt(b.bedroom) - parseInt(a.bedroom));
        break;
    }
    
    setFilteredProperties(result);
  }, [properties, searchQuery, sortOption]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
    // Search is handled in the useEffect above
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  const handleBookNow = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = (bookingData: any) => {
    // Here you would typically send the booking data to your API
    console.log('Booking submitted:', bookingData);
    
    // Show success message
    alert(`Booking confirmed for ${bookingData.propertyName}! Total: ${new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(bookingData.totalPrice)}`);
    
    // Close modal
    setIsBookingModalOpen(false);
    setSelectedProperty(null);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedProperty(null);
  };

  // Get active banners for carousel
  const activeBanners = banners.filter(banner => banner.isActive).sort((a, b) => a.order - b.order);

  // Handle case where no properties are available
  if (!personalUrl && dataSource === 'slug') {
    return (
      <div className="min-h-64 flex items-center justify-center">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg max-w-md">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold mb-2">Invalid Agent URL</h3>
          <p>Unable to load agent properties. Please check the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/images/logo2.svg" alt="HomeyHost" className="h-8" />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/manage-booking'}
                className="px-4 py-2 rounded-md bg-amber-400 text-white font-semibold shadow hover:bg-amber-500 transition-colors duration-200 text-sm"
              >
                Manage Booking
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Banner Carousel */}
      {activeBanners.length > 0 && (
        <div className="relative h-80 bg-gray-200 overflow-hidden">
          <div className="absolute inset-0 flex">
            {activeBanners.map((banner, index) => (
              <div
                key={banner.id}
                className="w-full h-full flex-shrink-0"
                style={{ transform: `translateX(-${0}%)` }}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-3xl font-bold mb-2">{banner.title}</h2>
                    <p className="text-lg">{banner.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Search Bar */}
          <div className="absolute top-4 right-4 z-10">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Sort Dropdown */}
          <div className="absolute top-4 left-4 z-10">
            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span className="text-sm font-medium">Sort By</span>
              </button>

              {isSortOpen && (
                <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-20">
                  <button
                    onClick={() => handleSortChange('newest')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOption === 'newest' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    onClick={() => handleSortChange('price-low-high')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOption === 'price-low-high' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => handleSortChange('price-high-low')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOption === 'price-high-low' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => handleSortChange('name')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOption === 'name' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    Name
                  </button>
                  <button
                    onClick={() => handleSortChange('bedrooms')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                      sortOption === 'bedrooms' ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    Bedrooms
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {dataSource === 'slug' ? 'Agent Properties' : 'My Listed Properties'}
          </h1>
          <p className="text-gray-600 mt-2">
            Showing {filteredProperties.length} of {pagination.total} properties
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col"
            >
              {/* Property Image */}
              <div className="relative h-48 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE1MCAyMDBIMjUwTDIwMCAxNTBaIiBmaWxsPSIjOEU5MEEwIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjExMCIgcj0iMjAiIGZpbGw9IiM4RTkwQTAiLz4KPC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {property.type}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {property.bedroom || 'N/A'} {parseInt(property.bedroom) === 1 ? 'Bed' : 'Beds'}
                  </span>
                </div>
              </div>

              {/* Property Details */}
              <div className="p-4 flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {property.name}
                  </h3>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.address}
                </p>

                {property.servicing && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      <span className="font-semibold">Amenities:</span> {property.servicing}
                    </p>
                  </div>
                )}

                {/* Additional info for enlisted properties */}
                {dataSource === 'enlisted' && (
                  <div className="mb-3 space-y-1">
                    {property.markedUpPrice && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Marked Up Price:</span> {formatPrice(property.markedUpPrice)}
                      </p>
                    )}
                    {property.agentPercentage && (
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Agent Percentage:</span> {property.agentPercentage}%
                      </p>
                    )}
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Status:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        property.status === 'available' ? 'bg-green-100 text-green-800' : 
                        property.status === 'unavailable' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-3 mt-auto">
                  <span>Listed: {formatDate(property.createdAt)}</span>
                  <span>Updated: {formatDate(property.updatedAt)}</span>
                </div>
              </div>

              {/* Book Now Button */}
              <div className="p-4 border-t">
                <button
                  onClick={() => handleBookNow(property)}
                  className="w-full bg-amber-400 text-white py-3 rounded-lg font-semibold hover:bg-amber-500 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Book Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Loading overlay for subsequent loads */}
        {isLoading && properties.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading more properties...</p>
            </div>
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
    </div>
  );
};

export default AgentPropertiesGallery;