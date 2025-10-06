import React from 'react'
import { MdOutlineFavoriteBorder, MdLocationOn } from 'react-icons/md'
import { Link } from 'react-router-dom'

const AvailableProperty = () => {
  const properties = [
    {
      id: 1,
      title: "Spacious 2 Bedroom Flat",
      location: "Lekki, Lagos",
      image: "/images/house1.svg",
      price: "NGN 20,000/Night"
    },
    {
      id: 2,
      title: "Modern Studio Apartment",
      location: "Victoria Island, Lagos",
      image: "/images/house2.svg",
      price: "NGN 15,000/Night"
    },
    {
      id: 3,
      title: "Luxury 3 Bedroom Penthouse",
      location: "Ikoyi, Lagos",
      image: "/images/house3.svg",
      price: "NGN 35,000/Night"
    },
    {
      id: 4,
      title: "Cozy 1 Bedroom Suite",
      location: "Yaba, Lagos",
      image: "/images/house4.svg",
      price: "NGN 12,000/Night"
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h4 className="text-2xl font-bold text-gray-900">Available Properties</h4>
        <Link 
          to="/properties" 
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <div 
            key={property.id}
            className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary-200 group"
          >
            <div className="relative h-48">
              <img
                src={property.image}
                alt={property.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              <button className="absolute top-3 right-3 flex items-center justify-center z-20 hover:scale-110 transition-transform">
                <div className="bg-white text-gray-600 rounded-full p-2 hover:text-red-500 transition-colors shadow-sm">
                  <MdOutlineFavoriteBorder size={18} />
                </div>
              </button>
              
              <div className="absolute bottom-3 left-3">
                <span className="bg-primary-600 text-white px-2 py-1 rounded-md text-sm font-medium">
                  {property.price}
                </span>
              </div>
            </div>

            <div className="bg-white p-4">
              <div className="flex flex-col gap-3">
                <h5 className="text-lg font-semibold text-gray-900 line-clamp-1">
                  {property.title}
                </h5>

                <div className="flex items-center gap-2 text-gray-600">
                  <MdLocationOn size={16} className="text-primary-600" />
                  <span className="text-sm">{property.location}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Available</span>
                  </div>
                  <Link
                    to={`/property/${property.id}`}
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
    </div>
  )
}

export default AvailableProperty