import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import BookNowModal from "../bookNow/BookNowModal";
import Carousel from "react-grid-carousel";
import useAgentStore from "../../../stores/agentstore";

const ViewAgentProperty = () => {
  const { id } = useParams();
  const [display, setDisplay] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [markedUpPrice, setMarkedUpPrice] = useState('');
  const [agentPercentage, setAgentPercentage] = useState('10');
  
  const { enlistedProperties, fetchEnlistedProperties, enlistApartment, isLoading } = useAgentStore();

  const [values, setValues] = useState({
    bookInfo: false,
  });

  useEffect(() => {
    fetchEnlistedProperties(1, 10);
  }, [fetchEnlistedProperties]);

  // Find the current property
  const currentProperty = enlistedProperties.find(
    property => property.id === id || property.apartmentId === id
  );

  const handleOptionChange = (e: any) => {
    setSelectedOption(e.target.value);
    if (e.target.value === 'option2') {
      setAgentPercentage('10');
      if (currentProperty?.price) {
        setMarkedUpPrice((parseFloat(currentProperty.price) * 1.1).toString());
      }
    }
  };

  const handlePriceChange = (e: any) => {
    setMarkedUpPrice(e.target.value);
    if (currentProperty?.price && e.target.value) {
      const basePrice = parseFloat(currentProperty.price);
      const newPrice = parseFloat(e.target.value);
      const percentage = ((newPrice - basePrice) / basePrice) * 100;
      setAgentPercentage(percentage.toFixed(2));
    }
  };

  const handleCancel = (e: any) => {
    e.preventDefault();
    setDisplay(false);
    setValues({
      bookInfo: false,
    });
  };

  const handleModal = (e: any) => {
    e.preventDefault();
    setDisplay(true);
    setValues({
      ...values,
      bookInfo: true,
    });
  };

  const handleEnlistProperty = async () => {
    if (!currentProperty) return;

    try {
      const apartmentId = currentProperty.id || currentProperty.apartmentId;
      const finalMarkedUpPrice = selectedOption === 'option1' 
        ? parseFloat(markedUpPrice) 
        : parseFloat(currentProperty.price) * 1.1;
      
      const finalAgentPercentage = selectedOption === 'option1'
        ? parseFloat(agentPercentage)
        : 10;

      await enlistApartment(apartmentId, finalMarkedUpPrice, finalAgentPercentage);
      
      // Show success message or redirect
      alert("Property enlisted successfully!");
      
    } catch (error) {
      console.error("Failed to enlist property:", error);
      alert("Failed to enlist property. Please try again.");
    }
  };

  const showDefaultConnectors = () => {
    return (
      <>{values.bookInfo && <BookNowModal handleCancel={handleCancel} />}</>
    );
  };

  if (!currentProperty) {
    return (
      <div>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <p>Property not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-12 gap-4">
        <div className="col-span-5">
          <div className="md:pl-[50px] pl-[20px] pt-[40px] pr-[20px] flex flex-col">
            <div className="flex gap-4">
              <Link to="/agent-all-property">
                <img
                  src="/images/Frame 67.svg"
                  alt=""
                  className="w-[35px] h-[35px] "
                />
              </Link>
              <h4 className="text-[#002221] text-[20px]">View Property</h4>
            </div>
            <h4 className="text-[#000000] pt-8 pb-4 text-[30px]">
              {currentProperty.name || "Spacious Property"}
            </h4>
            <h4 className="text-[18px] pb-4 font-[700]">
              NGN {currentProperty.price}/Night
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex gap-5 items-center">
                <img
                  src="/images/location 1.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[20px] max-w-[280px] text-[#3F3F3F] ">
                  {currentProperty.address || currentProperty.location || "Address not specified"}
                </h6>
              </div>

              <div className="">
                <h4 className="text-[18px] font-[600]">Amenities</h4>
                {currentProperty.amenities && currentProperty.amenities.length > 0 ? (
                  currentProperty.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-1 pt-1">
                      <div className="bg-[#FF0000] h-2 w-2"></div>
                      <h5 className="text-[#000000] text-[20px]">{amenity}</h5>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No amenities listed</p>
                )}
              </div>

              <div className="flex flex-col mt-10 gap-4">
                <label className="cursor-pointer flex justify-between items-center border border-gray-300 rounded-[15px] p-4 peer-checked:border-primary">
                  <input
                    type="radio"
                    name="options"
                    value="option1"
                    className="peer hidden"
                    onChange={handleOptionChange}
                  />
                  <span className="mr-2">Markup the price</span>
                  <div className="w-4 h-4 border border-gray-300 rounded-full peer-checked:bg-primary peer-checked:border-primary"></div>
                </label>

                {selectedOption === 'option1' && (
                  <div className="mt-2">
                    <input
                      type="number"
                      placeholder="Enter your Price"
                      value={markedUpPrice}
                      onChange={handlePriceChange}
                      className="border border-gray-300 rounded-[15px] p-4 w-full"
                    />
                    {agentPercentage && (
                      <p className="mt-2 text-sm text-gray-600">
                        Your commission: {agentPercentage}%
                      </p>
                    )}
                  </div>
                )}

                <label className="cursor-pointer flex justify-between items-center border border-gray-300 rounded-[15px] p-4 peer-checked:border-primary">
                  <input
                    type="radio"
                    name="options"
                    value="option2"
                    className="peer hidden"
                    onChange={handleOptionChange}
                  />
                  <span className="mr-2">Accept the 10% commission</span>
                  <div className="w-4 h-4 border border-gray-300 rounded-full peer-checked:bg-primary peer-checked:border-primary"></div>
                </label>
              </div>
            </div>

            <button
              onClick={handleEnlistProperty}
              disabled={isLoading || !selectedOption}
              className="bg-[#000000] flex justify-center mt-10 w-full text-white rounded-[5px] md:rounded-[10px] md:py-3 py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Processing..." : "Enlist Property"}
            </button>
          </div>
        </div>
        <div className="col-span-7">
          <Carousel cols={1} rows={1} loop>
            {currentProperty.images && currentProperty.images.length > 0 ? (
              currentProperty.images.map((image: string, index: number) => (
                <Carousel.Item key={index}>
                  <img src={image} alt={`${currentProperty.name} ${index + 1}`} className="w-full h-full object-cover" />
                </Carousel.Item>
              ))
            ) : (
              <Carousel.Item>
                <img src="/images/Frame 38.svg" alt="Default property" className="w-full h-full" />
              </Carousel.Item>
            )}
          </Carousel>
        </div>
      </div>

      <div
        className={`${display && "w-full h-full bg-[#747380D1] opacity-[82%] z-[150]"} fixed top-0 left-0`}
        onClick={(e) => handleCancel(e)}
      ></div>

      {display && (
        <div className="w-full md:w-[500px] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white z-[200] rounded-[10px] overflow-hidden h-fit">
          {showDefaultConnectors()}
        </div>
      )}
    </div>
  );
};

export default ViewAgentProperty;