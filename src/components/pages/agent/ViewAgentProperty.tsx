import React, { useState } from "react";
import Navbar from "../Navbar";
import { Link, NavLink } from "react-router-dom";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import BookNowModal from "../bookNow/BookNowModal";
import Carousel from "react-grid-carousel";

const ViewAgentProperty = () => {
  const [display, setDisplay] = useState(false);
  const [itemData, setItemData] = useState<any>([]);
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (e:any) => {
    setSelectedOption(e.target.value);
  };
  const [values, setValues] = useState({
    bookInfo: false,
  });

  const handleCancel = (e: any) => {
    e.preventDefault();
    setDisplay(false);
    setValues({
      bookInfo: false,
    });
  };

  const handleModal = (e: any) => {
    e.preventDefault();
    // setItemData(itemData);
    setDisplay(true);
    setValues({
      ...values,
      bookInfo: true,
    });
  };

  const showDefaultConnectors = () => {
    return (
      <>{values.bookInfo && <BookNowModal handleCancel={handleCancel} />}</>
    );
  };
  return (
    <div>
      <div className="grid md:grid-cols-12 gap-4">
        <div className="col-span-5">
          <div className="md:pl-[50px] pl-[20px] pt-[40px] pr-[20px] flex flex-col">
            <div className="flex gap-4">
              <Link
                to="/agent-all-property"
                // className="text-primary text-lg  font-bold  hover:underline"
              >
                <img
                  src="/images/Frame 67.svg"
                  alt=""
                  className="w-[35px] h-[35px] "
                />
              </Link>
              <h4 className="text-[#002221] text-[20px]">View Prperty</h4>
            </div>
            <h4 className="text-[#000000] pt-8 pb-4 text-[30px]">
              Spacious 2 Bedroom Flat
            </h4>
            <h4 className="text-[18px] pb-4  font-[700]">NGN 20,000/Night</h4>
            <div className="flex flex-col gap-3">
              <div className="flex gap-5 items-center">
                <img
                  src="/images/location 1.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[20px] max-w-[280px] text-[#3F3F3F] ">
                  13 Olu Street, Sango itedo, Ibeju Lekki Lagos
                </h6>
              </div>

              <div className="">
                <h4 className="text-[18px]  font-[600]">Amenities</h4>
                <div className="flex items-center gap-1 pt-1">
                  <div className="bg-[#FF0000] h-2 w-2"></div>
                  <h5 className="text-[#000000] text-[20px]">
                    Stably Power supply
                  </h5>
                </div>

                <div className="flex items-center gap-1 pt-1">
                  <div className="bg-[#FF0000] h-2 w-2"></div>
                  <h5 className="text-[#000000] text-[20px]">High Security</h5>
                </div>

                <div className="flex items-center gap-1 pt-1">
                  <div className="bg-[#FF0000] h-2 w-2"></div>
                  <h5 className="text-[#000000] text-[20px]">
                    Nice Environment
                  </h5>
                </div>
              </div>

              <div className="flex flex-col mt-10 gap-4">
      {/* Option 1 */}
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

  {/* Conditional Input Field */}
  {selectedOption === 'option1' && (
        <div className="mt-2">
          <input
            type="number"
            placeholder="Enter your Price"
            className="border border-gray-300 rounded-[15px] p-4 w-full"
          />
        </div>
      )}
      {/* Option 2 */}
      <label className="cursor-pointer flex justify-between items-center border border-gray-300 rounded-[15px] p-4 peer-checked:border-primary">
        <input
          type="radio"
          name="options"
          value="option2"
          className="peer hidden"
          onChange={handleOptionChange}
        />
        <span className="mr-2">Accept the 10%</span>
        <div className="w-4 h-4 border border-gray-300 rounded-full peer-checked:bg-primary peer-checked:border-primary"></div>
      </label>

    
    </div>
         
         
            </div>

            <Link to="/agent-all-property"
              // onClick={(e) => handleModal(e)}
              className="bg-[#000000] flex justify-center mt-10 w-full text-white rounded-[5px] md:rounded-[10px]  md:py-3 py-2"
            >
             Add Property
            </Link>
          </div>
        </div>
        <div className="col-span-7">
        <Carousel cols={1} rows={1} loop>
            <Carousel.Item>
          <img src="/images/Frame 38.svg" alt="" className=" w-full h-full" />
            
            </Carousel.Item>
            <Carousel.Item>
            <img src="/images/bg.svg" alt="" className=" w-full h-full" />

            </Carousel.Item>
           
          </Carousel>
          </div>
      </div>

      <div
        className={`${
          display && "w-full h-full bg-[#747380D1] opacity-[82%] z-[150]"
        } fixed top-0 left-0`}
        onClick={(e) => handleCancel(e)}
      ></div>

      {display && (
        <div className="w-full md:w-[500px] fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white  z-[200] rounded-[10px] overflow-hidden h-fit ">
          {showDefaultConnectors()}
        </div>
      )}
    </div>
  );
};

export default ViewAgentProperty;
