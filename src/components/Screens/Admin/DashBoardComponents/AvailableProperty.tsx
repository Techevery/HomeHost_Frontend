import React, { useEffect } from 'react'
import { MdOutlineFavoriteBorder, MdLocationOn } from 'react-icons/md'
import { Link } from 'react-router-dom'
import useAgentStore from '../../../../stores/agentstore'

const AvailableProperty = () => {
  const { 
    publicProperties, 
    fetchPublicProperties, 
    loading, 
    error 
  } = useAgentStore()

  useEffect(() => {
    // Fetch public properties when component mounts
    fetchPublicProperties(1, 12)
  }, [fetchPublicProperties])

  // Show loading state
  if (loading && publicProperties.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">Available Properties</h4>
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
    )
  }

  // Show error state
  if (error && publicProperties.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-2xl font-bold text-gray-900">Available Properties</h4>
          <Link 
            to="/view-properties" 
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load properties. Please try again.</p>
          <button 
            onClick={() => fetchPublicProperties(1, 12)}
            className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-2xl font-bold text-gray-900">Available Properties</h4>
        <Link 
          to="/view-properties" 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {publicProperties.map((property) => (
          <div 
            key={property.id}
            className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary-200 group"
          >
            <div className="relative h-48">
              <img
                src={property.images && property.images.length > 0 ? property.images[0] : '/images/house1.svg'}
                alt={property.name}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback image if the main image fails to load
                  e.currentTarget.src = '/images/house1.svg'
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
                  {property.amenities && property.amenities.slice(0, 2).map((amenity, index) => (
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
                      {property.status || 'Available'}
                    </span>
                  </div>
                  <Link
                    to={`/book-apartment`}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show message if no properties found */}
      {publicProperties.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No properties available at the moment.</p>
        </div>
      )}
    </div>
  )
}

export default AvailableProperty