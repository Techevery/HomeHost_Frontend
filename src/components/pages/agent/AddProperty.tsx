import React from "react";
import Navbar from "../Navbar";
import { Link, NavLink } from "react-router-dom";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";

const AddProperty = () => {
  return (
    <div>
      <Navbar />
      <div className="relative font-inter h-screen">
        <div className="  pb-20 object-cover h-full w-full ">
          <img
            src="/images/bg.svg"
            alt=""
            className="object-cover absolute w-full h-full"
          />
          <div className="max-w-screen-xl px-3 lg:px-10  mx-auto lg:gap-8 xl:gap-12 ">
            <div className="flex flex-col gap-2 md:pt-[130px] pt-[100px] h-full text-white">
              <h4 className="text-white z-10 text-[20px] md:text-[40px]  pb-6">
                Add Properties{" "}
              </h4>
              <div className="grid lg:grid-cols-3 grid-cols-2 gap-2 lg:gap-10 z-10">
                <Link
                  to="/agent-all-property"
                  className="rounded-[15px] w-[150px] flex justify-center text-center items-center border border-white overflow-hidden"
                >
                  <div className="relative flex justify-center">
                    <FaPlus className="text-white  w-[100px] h-[100px]" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="overlay absolute inset-0 bg-black opacity-40"></div>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;
