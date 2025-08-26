import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import Button from "../../UI/Button";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./custom-datepicker.css";

const BookNowModal = (props: any) => {
  const { handleCancel } = props;

  const [selectedDates, setSelectedDates] = useState([]);
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);

  const handleDateChange = (date:any) => {
    // Toggle the date selection
    const dateIndex = selectedDates.findIndex(
      (selectedDate:any) => selectedDate.toDateString() === date.toDateString()
    );

    if (dateIndex >= 0) {
      // If the date is already selected, remove it (deselect)
      const newDates = selectedDates.filter((_, index) => index !== dateIndex);
      setSelectedDates(newDates);

      // Reset start and end dates if needed
      if (date.getTime() === startDate?.getTime()) {
        setStartDate(null);
        setEndDate(null);
      }
      if (date.getTime() === endDate?.getTime()) {
        setEndDate(null);
      }
    } else {
      // If the date is not selected, add it to the selectedDates array
      const newDates:any = [...selectedDates, date].sort((a, b) => a - b);
      setSelectedDates(newDates);

      // Determine start and end dates
      if (newDates.length === 1) {
        // For a single date, set startDate to the picked date and endDate to the following day
        setStartDate(date);
        setEndDate(new Date(date.getTime() + 86400000)); // Adding one day
      } else {
        // For consecutive dates, adjust startDate and endDate
        const firstDate = newDates[0];
        const lastDate = newDates[newDates.length - 1];
        setStartDate(firstDate);
        setEndDate(new Date(lastDate.getTime() + 86400000)); // Adding one day after the last date
      }
    }
  };

  const formatSelectedDates = () => {
    const formattedDates = [];
    let i = 0;

    while (i < selectedDates.length) {
      const currentDate:any = selectedDates[i];
      let consecutiveDates:any = [currentDate];

      // Check for consecutive dates
      while (i < selectedDates.length - 1 && (selectedDates[i + 1] - selectedDates[i]) === 86400000) {
        consecutiveDates.push(selectedDates[i + 1]);
        i++;
      }

      if (consecutiveDates.length > 1) {
        // If there are consecutive dates, format with a hyphen
        formattedDates.push(
          <li key={i}>
            {`${consecutiveDates[0].toDateString()} - ${consecutiveDates[consecutiveDates.length - 1].toDateString()}`}
          </li>
        );
      } else {
        // If there's only one date, display it as a single bullet point
        formattedDates.push(<li key={i}>{currentDate.toDateString()}</li>);
      }

      i++;
    }

    return formattedDates;
  };

// Helper function to get the ordinal suffix
const getOrdinalSuffix = (n: number) => {
  const s = ["th", "st", "nd", "rd"],
        v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatSelected = () => {
  const formattedDates = [];
  let i = 0;
  let prefixCount = 1;

  while (i < selectedDates.length) {
    const currentDate = selectedDates[i];
    let consecutiveDates = [currentDate];

    // Check for consecutive dates
    while (
      i < selectedDates.length - 1 &&
      selectedDates[i + 1] - selectedDates[i] === 86400000
    ) {
      consecutiveDates.push(selectedDates[i + 1]);
      i++;
    }

    const prefixLabel1 = `${getOrdinalSuffix(prefixCount)} Check-in:`;
    const prefixLabel2 = `${getOrdinalSuffix(prefixCount)} Check-out:`;

    if (consecutiveDates.length > 1) {
      // If there are consecutive dates, set start date as the first date
      // and end date as the day after the last consecutive date
      const startDate: any = consecutiveDates[0];
      const endDate = new Date(consecutiveDates[consecutiveDates.length - 1]);
      endDate.setDate(endDate.getDate() + 1);

      formattedDates.push(
        <li key={i}>
          {`${prefixLabel2} ${startDate.toDateString()} - ${prefixLabel2} ${endDate.toDateString()}`}
        </li>
      );
    } else {
      // If there's only one date, set start date as the picked date
      // and end date as the day after the picked date
      const startDate: any = currentDate;
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      formattedDates.push(
        <li key={i} className="space-y-4 gap-4">
          {`${prefixLabel1} ${startDate.toDateString()} (1pm) - ${prefixLabel2} ${endDate.toDateString()} (12noon)`}
        </li>
      );
    }

    i++;
    prefixCount++;
  }

  return formattedDates;
};

  
  

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

  const onSubmit = () => {};
  return (
    <div>
      <Formik
        initialValues={initialData}
        validationSchema={validation}
        onSubmit={onSubmit}
      >
        {({ errors, values, setFieldValue }) => (
          <Form className="w-full overflow-y-scroll max-h-[550px] px-10  mt-10 lg:mt-5 mb-6 flex flex-col justify-between">
            <h3 className="text-[#000000] text-[20px] pb-2">
              Please fill the information
            </h3>
            <div className="mb-5">
              <div className=" mb-3 relative">
                {/* <label
                      className=" text-[#958F8F] text-[15px] font-[600] "
                      htmlFor="email"
                    >
                     Email
                    </label> */}
                <Field
                  className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Name"
                />
                <p className="text-red-700 text-xs mt-1 ">
                  <ErrorMessage name="name" />
                </p>
              </div>
              <div className="flex w-full gap-4 mb-3">
                <div className=" w-full relative">
                  <Field
                    className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                    name="phone"
                    type="number"
                    id="phone"
                    placeholder="Phone Number"
                  />
                  <p className="text-red-700 text-xs mt-1 ">
                    <ErrorMessage name="phone" />
                  </p>
                </div>
                <div className="w-full relative">
                  <Field
                    className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                    name="email"
                    type="email"
                    id="email"
                    placeholder="Email"
                  />
                  <p className="text-red-700 text-xs mt-1 ">
                    <ErrorMessage name="email" />
                  </p>
                </div>
              </div>

              <div className="flex w-full gap-4 mb-3">
                <div className="w-full  relative">
                  <Field
                    className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                    name="name_of_nxt_of_kin"
                    type="name"
                    id="name_of_nxt_of_kin"
                    placeholder="Name of Next of Kin"
                  />
                  <p className="text-red-700 text-xs mt-1 ">
                    <ErrorMessage name="name_of_nxt_of_kin" />
                  </p>
                </div>
                <div className="w-full relative">
                  <Field
                    className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                    name="nunmer_of_nxt_of_kin"
                    type="number"
                    id="nunmer_of_nxt_of_kin"
                    placeholder="nunmer_of_nxt_of_kin"
                  />
                  <p className="text-red-700 text-xs mt-1 ">
                    <ErrorMessage name="nunmer_of_nxt_of_kin" />
                  </p>
                </div>
              </div>

              <div className=" mb-6 relative">
                {/* <label
                      className=" text-[#958F8F] text-[15px] font-[600] "
                      htmlFor="email"
                    >
                     Email
                    </label> */}
                <Field
                  className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                  name="discount"
                  type="number"
                  id="discount"
                  placeholder="Discount Code"
                />
                <p className="text-red-700 text-xs mt-1 ">
                  <ErrorMessage name="discount" />
                </p>
              </div>

              <div className=" mb-3">
               
                <DatePicker
        selected={null}
        onChange={handleDateChange}
        inline
        className="w-full"
        minDate={new Date()} // Prevent selection of past dates
        highlightDates={[
          {
            'react-datepicker__day--highlighted-custom': selectedDates,
          },
        ]}
        dateFormat="yyyy/MM/dd"
      />
                <div className="mt-4">
        <h3 className="text-md">Selected Dates:</h3>
        <ul className="list-disc pl-6">
        {formatSelectedDates()}
        </ul>

      
        <p className="my-2">
          Night: {selectedDates.length}
        </p>
        {/* <div className="mt-4">
          <h3 className="text-md">Start Date: {startDate?.toDateString() || 'None'}</h3>
          <h3 className="text-md">End Date: {endDate?.toDateString() || 'None'}</h3>
        </div> */}
          <ul className="list-disc pl-6 space-y-1">
        {formatSelected()}
        </ul>
      </div>
                {/* <div className=" relative">
               
                    <Field
                      className=" block w-full h-10 border  pl-3 rounded-[15px] focus:outline-none border-[#8A8787] "
                      name="check_out_date"
                      type="date"
                      id="check_out_date"
                      placeholder="Check out Date"
                    />
                    <p className="text-red-700 text-xs mt-1 ">
                      <ErrorMessage name="check_out_date" />
                    </p>
                  </div> */}
              </div>
            </div>
            <Button
              text={"Send"}
              // disabled={loading}
              //   action={onSubmit}
              type="submit"
            />
            {/* <p onClick={onSubmit} className="flex items-center justify-center gap-x-1 text-sm">
                  Don't have an account yet?{"  "}
                 
                </p> */}
            {/* <p className="flex items-center justify-center gap-x-1 text-sm">
                  Don't have an account yet?{"  "}
                  <Link
                    to="/signup"
                    className="text-primary text-lg  font-bold  hover:underline"
                  >
                    Sign up
                  </Link>
                </p> */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default BookNowModal;
