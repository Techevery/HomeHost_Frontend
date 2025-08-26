import React, { useState } from "react";
import { Link } from "react-router-dom";
import BookNowModal from "./BookNowModal";
import Carousel from "react-grid-carousel";

const BookNow = () => {
  const [display, setDisplay] = useState(false);
  const [itemData, setItemData] = useState<any>([]);

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
      <div className="grid md:grid-cols-12 gap-4 mb-4">
        <div className="col-span-5">
          <div className="pl-[50px] pt-[40px] pr-[20px] flex flex-col">
          <Link
                    to="/view-properties"
                    // className="text-primary text-lg  font-bold  hover:underline"
                  >
            <img
              src="/images/Frame 67.svg"
              alt=""
              className="w-[35px] h-[35px] "
            />
</Link>
            <h4 className="text-[#000000] py-8 text-[30px]">
              Spacious 2 Bedroom Flat
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex gap-5 items-center">
                <img
                  src="/images/location 1.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[22px] text-[#3F3F3F] ">Lekki, Lagos</h6>
              </div>
              <div className="flex gap-2 items-center">
                <img
                  src="/images/Group 1505.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <div className="leading-[25px]">
                  <h6 className="text-[22px] text-[#3F3F3F] ">Mark John</h6>
                  <h6 className="text-[17px] text-[#8A8787] ">
                    Verified Agent
                  </h6>
                </div>
              </div>

              <div className="flex gap-5 items-center">
                <img
                  src="/images/Group 1497.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[22px] text-[#3F3F3F] ">+234 7065345534</h6>
              </div>

              <div className="flex gap-5 items-center">
                <img
                  src="/images/Group 1496.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[22px] text-[#3F3F3F] ">+234 7065345534</h6>
              </div>

              <div className="flex gap-5 items-center">
                <img
                  src="/images/Group 1503.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[22px] text-[#3F3F3F] ">
                  Registered 2 years ago
                </h6>
              </div>

              <div className="flex gap-5 items-center">
                <img
                  src="/images/Group 1502.svg"
                  alt=""
                  className="w-[40px] h-[40px]"
                />
                <h6 className="text-[22px] text-[#3F3F3F] ">
                  View all properties from this agent
                </h6>
              </div>
            </div>

            <button
              onClick={(e) => handleModal(e)}
              className="bg-[#000000] flex justify-center mt-10 w-full text-white rounded-[5px] md:rounded-[10px]  md:py-3 py-2"
            >
              Book Now
            </button>
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
        <div className="md:w-[500px] w-full fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white  z-[200] rounded-[10px] overflow-hidden h-fit ">
          {showDefaultConnectors()}
        </div>
      )}
    </div>
  );
};

export default BookNow;
