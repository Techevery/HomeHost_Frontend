import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";

const ManageBooking = () => {
  const navigate = useNavigate();

  // Initial form data
  const initialData = {
    email:
      localStorage.getItem("remember") === "true"
        ? localStorage.getItem("username")
        : "",

    password: "",
    remember: localStorage.getItem("remember") === "true" ? true : false,
  };

  const validation = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    password: Yup.string()
      .min(6, "Password must be minimum of 6 characters")
      .required("Required"),
  });

  const onSubmit = () => {
    navigate("/view-booking");
  };
  return (
    <div className="md:pl-[50px] pt-[40px]">
      <div className="flex pl-[50px] gap-4 items-center">
        <Link
          to="/"
          // className="text-primary text-lg  font-bold  hover:underline"
        >
          <img
            src="/images/Frame 67.svg"
            alt=""
            className="w-[35px] h-[35px] "
          />
        </Link>

        <h4 className="text-[#002221] text-[20px]">Manage Booking</h4>
      </div>
      <div className="md:grid md:grid-cols-12 items-center">
        <div className="col-span-5">
          <div className="pl-[50px] pt-[25px] md:pt-[40px] pr-[20px] flex flex-col">
            <h4 className="text-[#000000] py-8 text-[25px] md:text-[30px]">
              Enter your email or your phone number
            </h4>

            <Formik
              initialValues={initialData}
              validationSchema={validation}
              onSubmit={onSubmit}
            >
              {({ errors, values, setFieldValue }) => (
                <Form className="w-full   lg:mt-5 mb-6 flex flex-col justify-between">
                  <div className="mb-5">
                    <div className=" relative mb-3">
                      <Field
                        className=" block w-full h-14 text-center border  pl-3 rounded-[15px] focus:outline-none border-[#002221] "
                        name="email"
                        type="email"
                        id="email"
                        placeholder="Email or Phone Number"
                      />
                      <p className="text-red-700 text-xs mt-1 ">
                        <ErrorMessage name="email" />
                      </p>
                    </div>
                  </div>
                  <Button
                    text={"View"}
                    // disabled={loading}
                      action={onSubmit}
                    type="submit"
                  />
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="col-span-7 md:block hidden">
          <img src="/images/cuate.svg" alt="" className=" w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default ManageBooking;
