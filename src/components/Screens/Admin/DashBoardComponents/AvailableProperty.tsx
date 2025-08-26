import React from 'react'
import { MdOutlineFavoriteBorder } from 'react-icons/md'
import { Link } from 'react-router-dom'

const AvailableProperty = () => {
  return (
    <div>
        <div className='bg-white rounded-[20px] p-3'>
<h4 className='text-[20px] font-bold'>Available Property</h4>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-3'>
      <div className="rounded-[15px] border overflow-hidden">
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
                      <h5 className="text-[14px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[12px] ">Lekki, Lagos</h6>
                        </div>
                        <Link
                          to="/"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-1 px-1 md:py-2 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
{/* 
                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                   
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="rounded-[15px] border overflow-hidden">
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
                      <h5 className="text-[14px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[12px] ">Lekki, Lagos</h6>
                        </div>
                        <Link
                          to="/"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-1 px-1 md:py-2 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
{/* 
                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                   
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="rounded-[15px] border overflow-hidden">
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
                      <h5 className="text-[14px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[12px] ">Lekki, Lagos</h6>
                        </div>
                        <Link
                          to="/"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-1 px-1 md:py-2 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
{/* 
                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                   
                      </div> */}
                    </div>
                  </div>
                </div>

                <div className="rounded-[15px] border overflow-hidden">
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
                      <h5 className="text-[14px] md:text-[18px] font-[600]">
                        Spacious 2 Bedroom Flat
                      </h5>

                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src="/images/location 1.svg"
                            alt=""
                            className=""
                          />
                          <h6 className="text-[12px] ">Lekki, Lagos</h6>
                        </div>
                        <Link
                          to="/"
                          className="bg-[#000000] text-white rounded-[5px] md:rounded-[10px] md:px-1 px-1 md:py-2 py-2"
                        >
                          Book Now
                        </Link>
                      </div>
{/* 
                      <div className="flex justify-between items-center">
                        <h4 className="text-[16px]  font-[700]">
                          NGN 20,000/Night
                        </h4>

                   
                      </div> */}
                    </div>
                  </div>
                </div>
      </div>
        </div>
    </div>
  )
}

export default AvailableProperty