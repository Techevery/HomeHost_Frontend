import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Navbar";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import useAgentStore from "../../../stores/agentstore";
import { CircularProgress } from "@mui/material";

const AllProperty = () => {
  const { enlistedProperties,isLoading, fetchEnlistedProperties } = useAgentStore();

  useEffect(() => {
    fetchEnlistedProperties(1, 10);
  }, [fetchEnlistedProperties]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="relative font-inter h-full">
        <div className="pb-20 object-cover h-full w-full">
          <img
            src="/images/bg.svg"
            alt=""
            className="object-cover absolute w-full h-full"
          />
          <div className="max-w-screen-xl px-3 lg:px-10 mx-auto lg:gap-8 xl:gap-12">
            <div className="flex flex-col gap-2 md:pt-[130px] pt-[100px] h-full text-white">
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-2 lg:gap-10 z-10">
                {enlistedProperties.length === 0 ? (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-xl">No properties found</p>
                    <Link 
                      to="/add-apartment" 
                      className="mt-4 inline-block bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add Your First Property
                    </Link>
                  </div>
                ) : (
                  enlistedProperties.map((property) => (
                    <div key={property.id || property.apartmentId} className="rounded-[15px] overflow-hidden">
                      <div className="relative h-[200px]">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0]}
                            alt={property.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <img
                            src="/images/house1.svg"
                            alt="Default property"
                            className="object-cover w-full h-full"
                          />
                        )}
                        <button className="absolute top-4 right-4 flex items-center justify-center z-20">
                          <div className="bg-white text-black rounded-full p-2">
                            <MdOutlineFavoriteBorder />
                          </div>
                        </button>
                      </div>

                      <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                        <div className="flex flex-col gap-2">
                          <h5 className="text-[16px] md:text-[18px] font-[600]">
                            {property.name || "Property Name"}
                          </h5>

                          <div className="flex justify-between">
                            <div className="flex gap-2">
                              <img
                                src="/images/location 1.svg"
                                alt="Location"
                                className=""
                              />
                              <h6 className="text-[16px]">{property.location || property.address || "Location not specified"}</h6>
                            </div>
                            <div className="flex items-center gap-1">
                              <h6 className="text-[16px] capitalize">{property.status || "available"}</h6>
                              <div className={`h-3 w-3 rounded-full ${(property.status || "available") === 'available' ? 'bg-[#44D003]' : 'bg-[#FF0909]'}`}></div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <h4 className="text-[16px] font-[700]">
                              NGN {property.price || property.markedUpPrice}/Night
                            </h4>

                            <Link
                              to={`/agent-view-property/${property.id || property.apartmentId}`}
                              className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="overlay absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export default AllProperty;