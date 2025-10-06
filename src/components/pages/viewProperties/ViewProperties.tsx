import React, { useState, useEffect } from "react";
import Navbar from "../Navbar";
import { Link, useNavigate } from "react-router-dom";
import { MdOutlineFavoriteBorder, MdSearch, MdPerson, MdChevronLeft, MdChevronRight } from "react-icons/md";

const ViewProperties = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselImages = [
    "/images/bg.svg",
    "/images/house1.svg",
    "/images/house 2.svg",
    "/images/house 3.svg"
  ];

  const properties = [
    {
      id: 1,
      image: "/images/house1.svg",
      title: "Luxury 2 Bedroom Apartment",
      location: "Lekki, Lagos",
      price: "NGN 20,000/Night",
      available: true
    },
    {
      id: 2,
      image: "/images/house 2.svg",
      title: "Modern Studio Apartment",
      location: "Victoria Island, Lagos",
      price: "NGN 15,000/Night",
      available: false
    },
    {
      id: 3,
      image: "/images/house 3.svg",
      title: "Executive 3 Bedroom Flat",
      location: "Ikoyi, Lagos",
      price: "NGN 35,000/Night",
      available: false
    },
    {
      id: 4,
      image: "/images/house1.svg",
      title: "Beachfront Luxury Villa",
      location: "Eko Atlantic, Lagos",
      price: "NGN 50,000/Night",
      available: true
    },
    {
      id: 5,
      image: "/images/house 2.svg",
      title: "City View Apartment",
      location: "Yaba, Lagos",
      price: "NGN 12,000/Night",
      available: false
    },
    {
      id: 6,
      image: "/images/house 3.svg",
      title: "Garden Duplex",
      location: "GRA, Lagos",
      price: "NGN 28,000/Night",
      available: true
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const filteredProperties = properties.filter(property =>
    Object.values(property).some(value =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
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
                {/* <button
                  onClick={() => navigate("/manage-booking")}
                  className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Manage Booking
                </button> */}
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

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-64">
                <img
                  src={property.image}
                  alt={property.title}
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
                    property.available 
                      ? "bg-green-500 text-white" 
                      : "bg-red-500 text-white"
                  }`}>
                    {property.available ? "Available" : "Unavailable"}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-4">
                  <h5 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {property.title}
                  </h5>

                  <div className="flex items-center gap-2 text-gray-600">
                    <img
                      src="/images/location 1.svg"
                      alt="Location"
                      className="w-5 h-5"
                    />
                    <span className="text-lg">{property.location}</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <h4 className="text-2xl font-bold text-blue-600">
                      {property.price}
                    </h4>

                    <Link
                      to={property.available ? "/book-apartment" : "#"}
                      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        property.available
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                    >
                      {property.available ? "Book Now" : "Unavailable"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🏠</div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No properties found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewProperties;