import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";
const DownloadReceipt = () => {
    const navigate = useNavigate();


  
    const onSubmit = () => {
      navigate("/");
    };

  return (
    <div>
          <div className="md:pl-[50px] pt-[40px]">
      <div className="flex pl-[50px] gap-4 items-center">
        <Link
          to="/view-booking"
          // className="text-primary text-lg  font-bold  hover:underline"
        >
          <img
            src="/images/Frame 67.svg"
            alt=""
            className="w-[35px] h-[35px] "
          />
        </Link>

        <h4 className="text-[#002221] text-[20px]">Download Booking</h4>
      </div>
      <div className="md:grid md:grid-cols-12 items-center">
        <div className="col-span-5">
          <div className="pl-[50px] pt-[40px] pr-[20px] flex flex-col">
            <h4 className="text-[#000000] py-8 text-[25px] md:text-[30px]">
             Your receipt has been successfully sent to your Email
            </h4>

            <Button
                    text={"Home"}
                    // disabled={loading}
                      action={onSubmit}
                    type="submit"
                  />
          </div>
        </div>
        <div className="col-span-7 md:block hidden">
          <img src="/images/download.svg" alt="" className=" " />
        </div>
      </div>
    </div>
    </div>
  )
}

export default DownloadReceipt