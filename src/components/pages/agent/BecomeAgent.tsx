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
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  
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
    phoneNumber: "",
    address: "",
    gender: "",
    status: "",
    bankName: "",
    accountNumber: "",
    password: "",
    confirmPassword: "",
    nextOfKin: "",
    kinPhone: "",
    kinEmail: "",
    kinAddress: "",
    kinOccupation: "",
    kinStatus: "",
    remember: localStorage.getItem("remember") === "true",
    image: null,
    idCard: null,
  };

  const validation = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    name: Yup.string().required("Required"),
    phoneNumber: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    gender: Yup.string().required("Required"),
    status: Yup.string().required("Required"),
    bankName: Yup.string().required("Required"),
    accountNumber: Yup.string().required("Required"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref('password')], "Passwords must match"),
    nextOfKin: Yup.string().required("Required"),
    kinPhone: Yup.string().required("Required"),
    kinEmail: Yup.string().email("Invalid email address").required("Required"),
    kinAddress: Yup.string().required("Required"),
    kinOccupation: Yup.string().required("Required"),
    kinStatus: Yup.string().required("Required"),
    idCard: Yup.mixed().required("ID Card is required"),
    image: Yup.mixed().required("Profile image is required"),
  });

  const onSubmit = async (values: any) => {
    try {
      clearError();
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.keys(values).forEach(key => {
        if (values[key] !== null && values[key] !== "" && values[key] !== undefined) {
          if (key === 'image' || key === 'idCard') {
            if (values[key]) {
              formData.append(key, values[key]);
            }
          } else {
            formData.append(key, values[key].toString());
          }
        }
      });

      await registerAgent(formData);
      handleModal();
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
      setFieldValue("idCard", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
              {({ errors, values, setFieldValue, isSubmitting }) => (
                <Form className="w-full mt-10 lg:mt-5 mb-6 flex flex-col justify-between">
                  <div className="mb-5 flex flex-col items-center relative">
                    <label htmlFor="image-upload" className="cursor-pointer relative">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-gray-300" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-md">
                        <Plus className="w-5 h-5 text-green-500" />
                      </div>
                    </label>
                    <span className="text-xs text-gray-500 mt-3">Upload Profile Photo</span>
                    <input
                      id="image-upload"
                      name="image"
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
                        className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                        name="name"
                        type="text"
                        id="name"
                        placeholder="Full Name"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="name" />
                      </p>
                    </div>

                    <div className="flex gap-4 w-full relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="phoneNumber"
                          type="text"
                          id="phoneNumber"
                          placeholder="Phone Number"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="phoneNumber" />
                        </p>
                      </div>
                      <div className="w-full relative">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="email"
                          type="email"
                          id="email"
                          placeholder="Email Address"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="email" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Field
                        as="textarea"
                        className="block w-full h-[80px] border pl-3 pt-2 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors resize-none"
                        name="address"
                        id="address"
                        placeholder="Full Address"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="address" />
                      </p>
                    </div>

                    <div className="flex gap-4 relative mb-3">
                      <div className="w-full">
                        <Field
                          as="select"
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors bg-white"
                          name="gender"
                          id="gender"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Field>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="gender" />
                        </p>
                      </div>
                      <div className="relative w-full">
                        <Field
                          as="select"
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors bg-white"
                          name="status"
                          id="status"
                        >
                          <option value="">Select Status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                          <option value="divorced">Divorced</option>
                        </Field>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="status" />
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="bankName"
                          type="text"
                          id="bankName"
                          placeholder="Bank Name"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="bankName" />
                        </p>
                      </div>
                      <div className="relative w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="accountNumber"
                          type="text"
                          id="accountNumber"
                          placeholder="Account Number"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="accountNumber" />
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
                            className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                            name="personalUrl"
                            type="text"
                            id="personalUrl"
                            placeholder="username"
                          />
                        </div>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="personalUrl" />
                        </p>
                      </div> 
                      
                      <div className="flex-1">
                        <div className="relative">
                          <Field
                            className="block w-full h-[45px] border pl-3 pr-10 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
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
                          className="block w-full h-[45px] border pl-3 pr-10 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          placeholder="Confirm Password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="confirmPassword" />
                      </p>
                    </div>

                    <div className="h-[2px] mb-6 w-full bg-gray-300"></div>

                    <h5 className="text-[#002221] text-lg font-semibold mb-4">Next of Kin Information</h5>

                    <div className="relative mb-3">
                      <Field
                        className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                        name="nextOfKin"
                        type="text"
                        id="nextOfKin"
                        placeholder="Next of Kin Full Name"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="nextOfKin" />
                      </p>
                    </div>

                    <div className="flex gap-4 w-full relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="kinPhone"
                          type="text"
                          id="kinPhone"
                          placeholder="Kin Phone Number"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kinPhone" />
                        </p>
                      </div>
                      <div className="w-full relative">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="kinEmail"
                          type="email"
                          id="kinEmail"
                          placeholder="Kin Email Address"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kinEmail" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Field
                        as="textarea"
                        className="block w-full h-[80px] border pl-3 pt-2 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors resize-none"
                        name="kinAddress"
                        id="kinAddress"
                        placeholder="Kin Full Address"
                      />
                      <p className="text-red-700 text-xs mt-1">
                        <ErrorMessage name="kinAddress" />
                      </p>
                    </div>

                    <div className="flex gap-4 w-full relative mb-3">
                      <div className="w-full">
                        <Field
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors"
                          name="kinOccupation"
                          type="text"
                          id="kinOccupation"
                          placeholder="Kin Occupation"
                        />
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kinOccupation" />
                        </p>
                      </div>
                      <div className="w-full relative">
                        <Field
                          as="select"
                          className="block w-full h-[45px] border pl-3 rounded-[15px] focus:outline-none border-[#8A8787] focus:border-[#002221] transition-colors bg-white"
                          name="kinStatus"
                          id="kinStatus"
                        >
                          <option value="">Kin Relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="child">Child</option>
                          <option value="other">Other</option>
                        </Field>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="kinStatus" />
                        </p>
                      </div>
                    </div>

                    <div className="mb-5 flex flex-col items-center relative border-2 border-dashed border-gray-300 rounded-[15px] p-6">
                      <label htmlFor="id-card-upload" className="cursor-pointer relative flex flex-col items-center gap-3">
                        {idCardPreview ? (
                          <img src={idCardPreview} alt="ID Card Preview" className="w-32 h-20 object-cover rounded border" />
                        ) : (
                          <IdCard className="w-12 h-12 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-700 font-medium">Upload ID Card</span>
                        <span className="text-xs text-gray-500">Supported formats: JPG, PNG, PDF</span>
                      </label>
                      <input
                        id="id-card-upload"
                        name="idCard"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleIDCardChange(e, setFieldValue)}
                      />
                      <p className="text-red-700 text-xs mt-2 text-center">
                        <ErrorMessage name="idCard" />
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    text={isLoading ? "Processing..." : "Submit Application"}
                    type="submit"
                    disabled={isLoading}
                  />
                </Form>
              )}
            </Formik>
          </div>
        </div>
        <div className="hidden md:block col-span-7">
          <img src="/images/Frame 38.svg" alt="" className="w-full h-full object-cover" />
        </div>
      </div>

      <div
        className={`${display ? "block" : "hidden"} w-full h-full bg-[#747380D1] opacity-[82%] z-[150] fixed top-0 left-0`}
        onClick={(e) => handleCancel(e)}
      ></div>

      {display && (
        <div className="w-full md:w-[500px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white z-[200] rounded-[10px] overflow-hidden h-fit">
          {showDefaultConnectors()}
        </div>
      )}
    </>
  );
};

export default BecomeAgent;