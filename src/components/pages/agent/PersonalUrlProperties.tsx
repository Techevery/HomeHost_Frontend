import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useAgentStore from '../../../stores/agentstore';
import useBannerStore from '../../../stores/bannerStore';
import BookingModal from '../agent/BookingModal';
import ReceiptModal from '../agent/ReceiptModal';
import GetReceiptModal from '../agent/GetReceiptModal';
import PaymentModal from '../agent/PaymentModal';

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

// Property Detail Modal Component
const PropertyDetailModal: React.FC<{
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (property: Property) => void;
}> = ({ property, isOpen, onClose, onBookNow }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (property && isOpen) {
      setCurrentImageIndex(0);
    }
  }, [property, isOpen]);

  if (!isOpen || !property) return null;

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{property.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative h-80 bg-gray-200 rounded-lg overflow-hidden mb-4">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIndex]}
                    alt={`${property.name} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTUwTDE1MCAyMDBIMjUwTDIwMCAxNTBaIiBmaWxsPSIjOEU5MEEwIi8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjExMCIgcj0iMjAiIGZpbGw9IiM4RTkwQTAiLz4KPC9zdmc+';
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        aria-label="Previous image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        aria-label="Next image"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {property.images && property.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-gray-300'
                    }`}
                    aria-label={`View ${property.name} - ${index + 1}`}
                    aria-current={currentImageIndex === index}
                  >
                    <img
                      src={image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEwzMCA1MEg1MEw0MCA0MFoiIGZpbGw9IiM4RTkwQTAiLz4KPGNpcmNsZSBjeD0iNDAiIGN5PSIzNSIgcj0iNSIgZmlsbD0iIzhFOTBBMCIvPgo8L3N2Zz4=';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Property Information</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Price</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatPrice(property.price)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Type</span>
                  <span className="text-gray-900">{property.type}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Bedrooms</span>
                  <span className="text-gray-900">
                    {property.bedroom || 'N/A'} {parseInt(property.bedroom) === 1 ? 'Bed' : 'Beds'}
                  </span>
                </div>

                <div className="flex justify-between items-start py-2 border-b">
                  <span className="font-medium text-gray-600">Address</span>
                  <span className="text-gray-900 text-right">{property.address}</span>
                </div>

                {property.servicing && (
                  <div className="py-2 border-b">
                    <span className="font-medium text-gray-600">Amenities</span>
                    <p className="text-gray-900 mt-1">{property.servicing}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Details</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    property.status === 'available' ? 'bg-green-100 text-green-800' : 
                    property.status === 'unavailable' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {property.status}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onBookNow(property);
              onClose();
            }}
            className="px-6 py-2 bg-amber-400 text-white rounded-lg font-semibold hover:bg-amber-500 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Book Now</span>
          </button>
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
  
  // Modal states
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isGetReceiptModalOpen, setIsGetReceiptModalOpen] = useState(false);
  const [isPropertyDetailModalOpen, setIsPropertyDetailModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [dataSource, setDataSource] = useState<'slug' | 'enlisted'>('slug');

  const loadProperties = React.useCallback(
    async (page: number = 1) => {
      if (!personalUrl) return;
      
      try {
        clearError();
        
        if (dataSource === 'slug' && personalUrl) {
          const response: AgentPropertiesResponse = await fetchPropertiesBySlug(personalUrl, page, 9);
          
          if (response && response.properties) {
            setProperties(response.properties);
            setFilteredProperties(response.properties);
            setPagination(response.pagination);
          }
        } else {
          await fetchEnlistedProperties(page, 9);
          
          const transformedProperties: Property[] = enlistedProperties.map(prop => ({
            id: prop.id,
            name: prop.name,
            address: prop.address,
            type: prop.type,
            servicing: '',
            bedroom: '',
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

  // Update properties when enlistedProperties changes
  useEffect(() => {
    if (dataSource === 'enlisted' && enlistedProperties.length > 0) {
      const transformedProperties: Property[] = enlistedProperties.map(prop => ({
        id: prop.id,
        name: prop.name,
        address: prop.address,
        type: prop.type,
        servicing: '',
        bedroom: '',
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
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setIsSortOpen(false);
  };

  // Property Detail Modal Handlers
  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsPropertyDetailModalOpen(true);
  };

  // Booking Flow Handlers
  const handleBookNow = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = (bookingData: any) => {
    setBookingData(bookingData);
    setIsBookingModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    const receiptData = {
      propertyName: bookingData.propertyName,
      nights: Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 3600 * 24)),
      startDate: new Date(bookingData.checkIn).toLocaleDateString('en-GB'),
      endDate: new Date(bookingData.checkOut).toLocaleDateString('en-GB'),
      transactionDate: new Date().toLocaleDateString('en-GB'),
      transactionTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      totalAmount: bookingData.totalPrice,
    };
    
    setReceiptData(receiptData);
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleGetReceipt = () => {
    setIsReceiptModalOpen(false);
    setIsGetReceiptModalOpen(true);
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF receipt...');
    // Implement PDF download logic
    alert('Receipt downloaded successfully!');
    setIsGetReceiptModalOpen(false);
  };

  const handleSendEmail = () => {
    console.log('Sending receipt via email...');
    // Implement email sending logic
    alert('Receipt sent to your email!');
    setIsGetReceiptModalOpen(false);
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
                aria-label="Search properties"
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
                aria-label="Sort properties"
                aria-expanded={isSortOpen}
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
              <div 
                className="relative h-48 bg-gray-200 cursor-pointer"
                onClick={() => handleViewDetails(property)}
              >
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
                  <h3 
                    className="text-lg font-semibold text-gray-900 line-clamp-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleViewDetails(property)}
                  >
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
                
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Status:</span> 
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                        property.status === 'available' ? 'bg-green-100 text-green-800' : 
                        property.status === 'unavailable' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(property)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => handleBookNow(property)}
                    className="flex-1 bg-amber-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-amber-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery
                ? 'No properties match your search criteria. Try adjusting your search terms.'
                : 'No properties are currently available. Please check back later.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isPropertyDetailModalOpen}
        onClose={() => setIsPropertyDetailModalOpen(false)}
        onBookNow={handleBookNow}
      />

      {/* Booking Flow Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookingSubmit}
        property={selectedProperty}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        bookingData={bookingData}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onGetReceipt={handleGetReceipt}
        receiptData={receiptData}
      />

      <GetReceiptModal
        isOpen={isGetReceiptModalOpen}
        onClose={() => setIsGetReceiptModalOpen(false)}
        onDownloadPDF={handleDownloadPDF}
        onSendEmail={handleSendEmail}
      />
    </div>
  );
};

export default AgentPropertiesGallery;