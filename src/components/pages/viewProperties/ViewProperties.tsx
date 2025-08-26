import React from "react";
import Navbar from "../Navbar";
import { Link, NavLink } from "react-router-dom";
import { MdOutlineFavoriteBorder } from "react-icons/md";

const ViewProperties = () => {
  return (
    <div>
      <Navbar />
      <div className="relative font-inter h-full">
        <div className="  pb-20 object-cover h-full w-full ">
          <img
            src="/images/bg.svg"
            alt=""
            className="object-cover absolute w-full h-full"
          />
          <div className="max-w-screen-xl px-3 lg:px-10  mx-auto lg:gap-8 xl:gap-12 ">
            <div className="flex flex-col gap-2 md:pt-[130px] pt-[100px] h-full text-white">
              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-2 lg:gap-10 z-10">
                <div className="rounded-[15px] overflow-hidden">
                  <div className="relative h-[200px]">
                    <img
                      src="/images/house1.svg"
                      alt=""
                      className="object-cover  w-full h-full"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center  z-20">
                      <div className="bg-white text-black rounded-full p-2">
                        <MdOutlineFavoriteBorder />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[16px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[16px] ">Lekki, Lagos</h6>
                        </div>
                        <div className="flex items-center gap-1">
                          <h6 className="text-[16px]">Available</h6>
                          <div className="bg-[#44D003] h-3 w-3 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                        <Link
                          to="/book-apartment"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="rounded-[15px] overflow-hidden">
                  <div className="relative h-[200px]">
                    <img
                      src="/images/house 2.svg"
                      alt=""
                      className="object-cover  w-full h-full"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center  z-20">
                      <div className="bg-white text-black rounded-full p-2">
                        <MdOutlineFavoriteBorder />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[16px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[16px] ">Lekki, Lagos</h6>
                        </div>
                        <div className="flex items-center gap-1">
                          <h6 className="text-[16px]">Unavailable</h6>
                          <div className="bg-[#FF0909] h-3 w-3 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                        <Link
                          to="/book-apartment"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[15px] overflow-hidden">
                  <div className="relative h-[200px]">
                    <img
                      src="/images/house 3.svg"
                      alt=""
                      className="object-cover  w-full h-full"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center  z-20">
                      <div className="bg-white text-black rounded-full p-2">
                        <MdOutlineFavoriteBorder />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[16px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[16px] ">Lekki, Lagos</h6>
                        </div>
                        <div className="flex items-center gap-1">
                          <h6 className="text-[16px]">Unavailable</h6>
                          <div className="bg-[#FF0909] h-3 w-3 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                        <Link
                          to="/book-apartment"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[15px] overflow-hidden">
                  <div className="relative h-[200px]">
                    <img
                      src="/images/house1.svg"
                      alt=""
                      className="object-cover  w-full h-full"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center  z-20">
                      <div className="bg-white text-black rounded-full p-2">
                        <MdOutlineFavoriteBorder />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[16px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[16px] ">Lekki, Lagos</h6>
                        </div>
                        <div className="flex items-center gap-1">
                          <h6 className="text-[16px]">Available</h6>
                          <div className="bg-[#44D003] h-3 w-3 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                        <Link
                          to="/book-apartment"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[15px] overflow-hidden">
                  <div className="relative h-[200px]">
                    <img
                      src="/images/house 2.svg"
                      alt=""
                      className="object-cover  w-full h-full"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center  z-20">
                      <div className="bg-white text-black rounded-full p-2">
                        <MdOutlineFavoriteBorder />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[16px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[16px] ">Lekki, Lagos</h6>
                        </div>
                        <div className="flex items-center gap-1">
                          <h6 className="text-[16px]">Unavailable</h6>
                          <div className="bg-[#FF0909] h-3 w-3 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                        <Link
                          to="/book-apartment"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[15px] overflow-hidden">
                  <div className="relative h-[200px]">
                    <img
                      src="/images/house 2.svg"
                      alt=""
                      className="object-cover  w-full h-full"
                    />
                    <button className="absolute top-4 right-4 flex items-center justify-center  z-20">
                      <div className="bg-white text-black rounded-full p-2">
                        <MdOutlineFavoriteBorder />
                      </div>
                    </button>
                  </div>

                  <div className="bg-white text-[#000000] pt-2 px-2 pb-5">
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[16px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex gap-2">
                          <img
                            src="/images/location 3.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[16px] ">Lekki, Lagos</h6>
                        </div>
                        <div className="flex items-center gap-1">
                          <h6 className="text-[16px]">Unavailable</h6>
                          <div className="bg-[#FF0909] h-3 w-3 rounded-full"></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                        <Link
                          to="/book-apartment"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-7 px-5 md:py-3 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
            
              
              </div>
            </div>
          </div>
          <div className="overlay absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export default ViewProperties;
