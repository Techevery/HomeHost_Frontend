import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";
import BecomeAgentModal from "./BecomeAgentModal";
import { Eye, EyeOff, User, Plus, IdCard } from 'lucide-react';
import useAgentStore from "../../../stores/agentstore";

const BecomeAgent = () => {
  const navigate = useNavigate();
  const [display, setDisplay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { registerAgent, isLoading, error, clearError } = useAgentStore();

  const handleCancel = (e: any) => {
    e.preventDefault();
    setDisplay(false);
    clearError();
  };

  const handleModal = () => {
    setDisplay(true);
  };

  const showDefaultConnectors = () => {
    return (
      <>{display && <BecomeAgentModal handleCancel={handleCancel} />}</>
    );
  };

  const initialData = {
    name: "",
    email: localStorage.getItem("remember") === "true" ? localStorage.getItem("username") || "" : "",
    phone_number: "",
    address: "",
    gender: "",
    status: "",
    bank_name: "",
    account_number: "",
    password: "",
    confirmPassword: "",
    next_of_kin: "",
    kin_phone: "",
    kin_email: "",
    kin_address: "",
    kin_occupation: "",
    kin_status: "",
    remember: localStorage.getItem("remember") === "true",
    image: null,
    id_card: null,
  };

  const validation = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    name: Yup.string().required("Required"),
    phone_number: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    gender: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    bank_name: Yup.string().required("Required"),
    account_number: Yup.string().required("Required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref('password')], "Passwords must match"),
    next_of_kin: Yup.string().required("Required"),
    kin_phone: Yup.string().required("Required"),
    kin_email: Yup.string().email("Invalid email address").required("Required"),
    kin_address: Yup.string().required("Required"),
    kin_occupation: Yup.string().required("Required"),
    kin_status: Yup.string().required("Required"),
    id_card: Yup.mixed().required("ID Card is required"),
  });

  const onSubmit = async (values: any) => {
    try {
      clearError();
      const formData = new FormData();
      
      for (const key in values) {
        if (values[key] !== null && values[key] !== "") {
          if (key === 'image' || key === 'id_card') {
            formData.append(key, values[key]);
          } else {
            formData.append(key, values[key].toString());
          }
        }
      }

      await registerAgent(formData);
      handleModal();
      setTimeout(() => {
        setDisplay(false);
        navigate("/add-property");
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIDCardChange = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue("id_card", file);
    }
  };

  return (
    <>
      <div className="grid md:grid-cols-12">
        <div className="col-span-5">
          <div className="md:pl-[50px] pl-[20px] pt-[40px] pr-[20px] flex flex-col">
            <div className="flex gap-4">
              <Link to="/">
                <img src="/images/Frame 67.svg" alt="" className="w-[35px] h-[35px]" />
              </Link>
              <h4 className="text-[#002221] text-[20px]">Become Agent</h4>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <Formik
              initialValues={initialData}
              validationSchema={validation}
              onSubmit={onSubmit}
            >
              {({ errors, values, setFieldValue }) => (
                <Form className="w-full mt-10 lg:mt-5 mb-6 flex flex-col justify-between">
                  <div className="mb-5 flex flex-col items-center relative">
                    <label htmlFor="image-upload" className="cursor-pointer relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <User className="w-20 h-20 text-gray-500" />
                      )}
                      <div className="absolute bottom-0 right-16 flex items-center">
                        <Plus className="w-10 h-6 text-green-500" />
                        <span className="text-sm text-gray-700 ml-1">Upload Image</span>
                      </div>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setFieldValue)}
                    />
                    <p className="text-red-700 text-xs mt-1">
                      <ErrorMessage name="image" />
                    </p>
                  </div>

                  <div className="mb-5">
                    <div className="mb-3">
                      <Field
                        className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                        name="name"
                        type="text"
                        id="name"
                        placeholder="Name"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="name" />
                      </p>
                    </div>

                    <div className="flex gap-4 w-full relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="phone_number"
                          type="text"
                          id="phone_number"
                          placeholder="Phone Number"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="phone_number" />
                        </p>
                      </div>
                      <div className="w-full relative">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="email"
                          type="email"
                          id="email"
                          placeholder="Email"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="email" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Field
                        className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                        name="address"
                        type="text"
                        id="address"
                        placeholder="Address"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="address" />
                      </p>
                    </div>

                    <div className="flex gap-4 relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="gender"
                          type="text"
                          id="gender"
                          placeholder="Gender"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="gender" />
                        </p>
                      </div>
                      <div className="relative w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="status"
                          type="text"
                          id="status"
                          placeholder="Status"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="status" />
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="bank_name"
                          type="text"
                          id="bank_name"
                          placeholder="Bank Name"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="bank_name" />
                        </p>
                      </div>
                      <div className="relative w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="account_number"
                          type="text"
                          id="account_number"
                          placeholder="Account Number"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="account_number" />
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 w-full items-center relative mb-3">
                       <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h6 className="text-[#8A8787] text-[14px] whitespace-nowrap">
                            https://homeyhost.ng/
                          </h6> 
                          <Field
                            className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                            name="personal_url"
                            type="text"
                            id="personal_url"
                            placeholder="Personal URL"
                          />
                        </div>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="personal_url" />
                        </p>
                      </div> 
                      
                      <div className="flex-1">
                        <div className="relative">
                          <Field
                            className="block w-full h-[45px] border pl-3 pr-10 rounded-[15px] focus:outline-none border-[#8A8787]"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-500" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-500" />
                            )}
                          </button>
                        </div>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="password" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="relative">
                        <Field
                          className="block w-full h-[45px] border pl-3 pr-10 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Confirm Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="confirmPassword" />
                      </p>
                    </div>

                    <div className="h-[3px] mb-3 w-full bg-black"></div>

                    <div className="relative mb-3">
                      <Field
                        className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                        name="next_of_kin"
                        type="text"
                        id="next_of_kin"
                        placeholder="Next of Kin"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="next_of_kin" />
                      </p>
                    </div>

                    <div className="flex gap-4 w-full relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="kin_phone"
                          type="text"
                          id="kin_phone"
                          placeholder="Kin Phone Number"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kin_phone" />
                        </p>
                      </div>
                      <div className="w-full relative">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="kin_email"
                          type="email"
                          id="kin_email"
                          placeholder="Kin Email"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kin_email" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Field
                        className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                        name="kin_address"
                        type="text"
                        id="kin_address"
                        placeholder="Kin Address"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="kin_address" />
                      </p>
                    </div>

                    <div className="flex gap-4 w-full relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="kin_occupation"
                          type="text"
                          id="kin_occupation"
                          placeholder="Kin Occupation"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kin_occupation" />
                        </p>
                      </div>
                      <div className="w-full relative">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787]"
                          name="kin_status"
                          type="text"
                          id="kin_status"
                          placeholder="Kin Status"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kin_status" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 flex flex-col items-center relative">
                      <label htmlFor="id-card-upload" className="cursor-pointer relative flex items-center gap-2">
                        <IdCard className="w-12 h-12 text-gray-500" /> 
                        <span className="text-sm text-gray-700 ml-1">Upload ID Card</span>
                      </label>
                      <input
                        id="id-card-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleIDCardChange(e, setFieldValue)}
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="id_card" />
                      </p>
                    </div>
                  </div>
                  <Button
                    text={"Submit"}
                    action={handleModal}
                    type="submit"
                  />
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="hidden md:block col-span-7">
          <img src="/images/Frame 38.svg" alt="" className="w-full h-full" />
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
    </>
  );
};

export default BecomeAgent;