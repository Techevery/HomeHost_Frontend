import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";
import BecomeAgentModal from "./BecomeAgentModal";
import { Eye, EyeOff, User, Plus, Upload } from 'lucide-react';
import useAgentStore from "../../../stores/agentstore";

interface AgentFormData {
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  bankName: string;
  accountNumber: string;
  password: string;
  confirmPassword: string;
  nextOfKin: string;
  kinPhone: string;
  kinEmail: string;
  kinAddress: string;
  kinOccupation: string;
  kinStatus: string;
  personalUrl: string;
  image: File | null;
  idCard: File | null;
}

interface Props {
  text: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
}

const BecomeAgent = () => {
  const navigate = useNavigate();
  const [display, setDisplay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  
  const { registerAgent, isLoading, error, clearError } = useAgentStore();

  const handleCancel = (e: React.MouseEvent) => {
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

  const initialData: AgentFormData = {
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
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
    personalUrl: "",
    image: null,
    idCard: null,
  };

  const validation = Yup.object({
    email: Yup.string().email("Invalid email address").required("Required"),
    name: Yup.string().required("Required"),
    phoneNumber: Yup.string()
      .required("Required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits")
      .max(15, "Must be 15 digits or less"),
    address: Yup.string().required("Required"),
    gender: Yup.string().required("Required"),
    bankName: Yup.string().required("Required"),
    accountNumber: Yup.string()
      .required("Required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Account number must be at least 10 digits")
      .max(15, "Account number must be 15 digits or less"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref('password')], "Passwords must match"),
    nextOfKin: Yup.string().required("Required"),
    kinPhone: Yup.string()
      .required("Required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits")
      .max(15, "Must be 15 digits or less"),
    kinEmail: Yup.string().email("Invalid email address").required("Required"),
    kinAddress: Yup.string().required("Required"),
    kinOccupation: Yup.string().required("Required"),
    kinStatus: Yup.string().required("Required"),
    personalUrl: Yup.string()
      .required("Required")
      .matches(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
    idCard: Yup.mixed().required("ID Card is required"),
    image: Yup.mixed().required("Profile image is required"),
  });

  const onSubmit = async (values: AgentFormData) => {
    try {
      clearError();
      const formData = new FormData();
      
      // Append all fields to FormData with EXACT field names from backend schema
      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone_number", values.phoneNumber);
      formData.append("address", values.address);
      formData.append("gender", values.gender);
      formData.append("bank_name", values.bankName);
      formData.append("account_number", values.accountNumber);
      formData.append("password", values.password);
      formData.append("personalUrl", values.personalUrl);
      
      // Next of Kin fields - exact names from schema
      formData.append("nextOfKinName", values.nextOfKin);
      formData.append("nextOfKinPhone", values.kinPhone);
      formData.append("nextOfKinEmail", values.kinEmail);
      formData.append("nextOfKinAddress", values.kinAddress);
      formData.append("nextOfKinOccupation", values.kinOccupation);
      formData.append("nextOfKinStatus", values.kinStatus);

      // File uploads - exact names from schema
      if (values.image) {
        formData.append("profile_picture", values.image);
      }
      if (values.idCard) {
        formData.append("id_card", values.idCard);
      }

      // DEBUG: Log all FormData entries
      console.log("=== FormData Contents ===");
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}` : value);
      });
      console.log("=========================");

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
      <div className="min-h-screen bg-gray-50">
        <div className="grid md:grid-cols-12 min-h-screen">
          {/* Form Section */}
          <div className="col-span-12 md:col-span-5 bg-white">
            <div className="h-full overflow-y-auto">
              <div className="md:pl-[50px] pl-[20px] pt-[40px] pr-[20px] flex flex-col max-w-2xl mx-auto pb-8">
                <div className="flex gap-4 items-center mb-8">
                  <Link to="/" className="flex-shrink-0">
                    <img src="/images/Frame 67.svg" alt="Home" className="w-[35px] h-[35px]" />
                  </Link>
                  <div>
                    <h4 className="text-[#002221] text-[24px] font-bold">Become an Agent</h4>
                    <p className="text-gray-600 text-sm">Join our network of professional real estate agents</p>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
                    <div className="flex-1">
                      <strong className="font-medium">Error:</strong> {error}
                    </div>
                    <button
                      onClick={clearError}
                      className="text-red-700 hover:text-red-900 ml-4"
                    >
                      ×
                    </button>
                  </div>
                )}

                <Formik
                  initialValues={initialData}
                  validationSchema={validation}
                  onSubmit={onSubmit}
                >
                  {({ errors, values, setFieldValue, isSubmitting, touched }) => (
                    <Form className="w-full mt-6 flex flex-col">
                      {/* Profile Image Upload */}
                      <div className="mb-8 flex flex-col items-center">
                        <label htmlFor="image-upload" className="cursor-pointer group">
                          <div className="relative">
                            {imagePreview ? (
                              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                <img 
                                  src={imagePreview} 
                                  alt="Avatar Preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-green-500 transition-colors">
                                <User className="w-10 h-10 text-gray-400 group-hover:text-green-500" />
                              </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg group-hover:bg-green-600 transition-colors">
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </label>
                        <span className="text-sm text-gray-600 mt-3 font-medium">Profile Photo</span>
                        <p className="text-xs text-gray-500 mt-1">Recommended: 500x500px, JPG or PNG</p>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                        <p className="text-red-600 text-xs mt-2 text-center">
                          <ErrorMessage name="image" />
                        </p>
                      </div>

                      {/* Personal Information Section */}
                      <div className="mb-8">
                        <h5 className="text-[#002221] text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                          Personal Information
                        </h5>
                        
                        <div className="space-y-4">
                          <div>
                            <Field
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                errors.name && touched.name ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="name"
                              type="text"
                              id="name"
                              placeholder="Full Name *"
                            />
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="name" />
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.phoneNumber && touched.phoneNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="phoneNumber"
                                type="text"
                                id="phoneNumber"
                                placeholder="Phone Number *"
                              />
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="phoneNumber" />
                              </p>
                            </div>
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.email && touched.email ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="email"
                                type="email"
                                id="email"
                                placeholder="Email Address *"
                              />
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="email" />
                              </p>
                            </div>
                          </div>

                          <div>
                            <Field
                              as="textarea"
                              className={`block w-full h-[90px] border pl-4 pt-3 rounded-[12px] focus:outline-none transition-colors resize-none ${
                                errors.address && touched.address ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="address"
                              id="address"
                              placeholder="Full Address *"
                            />
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="address" />
                            </p>
                          </div>

                          <div>
                            <Field
                              as="select"
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors appearance-none bg-white ${
                                errors.gender && touched.gender ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="gender"
                              id="gender"
                            >
                              <option value="">Select Gender *</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </Field>
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="gender" />
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bank Information Section */}
                      <div className="mb-8">
                        <h5 className="text-[#002221] text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                          Bank Information
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Field
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                errors.bankName && touched.bankName ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="bankName"
                              type="text"
                              id="bankName"
                              placeholder="Bank Name *"
                            />
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="bankName" />
                            </p>
                          </div>
                          <div>
                            <Field
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                errors.accountNumber && touched.accountNumber ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="accountNumber"
                              type="text"
                              id="accountNumber"
                              placeholder="Account Number *"
                            />
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="accountNumber" />
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Security Section */}
                      <div className="mb-8">
                        <h5 className="text-[#002221] text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                          Account Security
                        </h5>
                        
                        <div className="space-y-4">
                          <div className="flex gap-4 items-center">
                            <div className="flex-shrink-0">
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                https://homeyhost.ng/
                              </span>
                            </div>
                            <div className="flex-1">
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.personalUrl && touched.personalUrl ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="personalUrl"
                                type="text"
                                id="personalUrl"
                                placeholder="username *"
                              />
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="personalUrl" />
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="relative">
                                <Field
                                  className={`block w-full h-[50px] border pl-4 pr-12 rounded-[12px] focus:outline-none transition-colors ${
                                    errors.password && touched.password ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                  }`}
                                  name="password"
                                  type={showPassword ? "text" : "password"}
                                  id="password"
                                  placeholder="Password *"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="password" />
                              </p>
                            </div>

                            <div>
                              <div className="relative">
                                <Field
                                  className={`block w-full h-[50px] border pl-4 pr-12 rounded-[12px] focus:outline-none transition-colors ${
                                    errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                  }`}
                                  name="confirmPassword"
                                  type={showConfirmPassword ? "text" : "password"}
                                  id="confirmPassword"
                                  placeholder="Confirm Password *"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="confirmPassword" />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Next of Kin Information */}
                      <div className="mb-8">
                        <h5 className="text-[#002221] text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                          Next of Kin Information
                        </h5>
                        
                        <div className="space-y-4">
                          <div>
                            <Field
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                errors.nextOfKin && touched.nextOfKin ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="nextOfKin"
                              type="text"
                              id="nextOfKin"
                              placeholder="Next of Kin Full Name *"
                            />
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="nextOfKin" />
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.kinPhone && touched.kinPhone ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="kinPhone"
                                type="text"
                                id="kinPhone"
                                placeholder="Kin Phone Number *"
                              />
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="kinPhone" />
                              </p>
                            </div>
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.kinEmail && touched.kinEmail ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="kinEmail"
                                type="email"
                                id="kinEmail"
                                placeholder="Kin Email Address *"
                              />
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="kinEmail" />
                              </p>
                            </div>
                          </div>

                          <div>
                            <Field
                              as="textarea"
                              className={`block w-full h-[90px] border pl-4 pt-3 rounded-[12px] focus:outline-none transition-colors resize-none ${
                                errors.kinAddress && touched.kinAddress ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                              }`}
                              name="kinAddress"
                              id="kinAddress"
                              placeholder="Kin Full Address *"
                            />
                            <p className="text-red-600 text-xs mt-2">
                              <ErrorMessage name="kinAddress" />
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.kinOccupation && touched.kinOccupation ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="kinOccupation"
                                type="text"
                                id="kinOccupation"
                                placeholder="Kin Occupation *"
                              />
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="kinOccupation" />
                              </p>
                            </div>
                            <div>
                              <Field
                                as="select"
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors appearance-none bg-white ${
                                  errors.kinStatus && touched.kinStatus ? 'border-red-500' : 'border-gray-300 focus:border-[#002221]'
                                }`}
                                name="kinStatus"
                                id="kinStatus"
                              >
                                <option value="">Kin Relationship *</option>
                                <option value="spouse">Spouse</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="child">Child</option>
                                <option value="other">Other</option>
                              </Field>
                              <p className="text-red-600 text-xs mt-2">
                                <ErrorMessage name="kinStatus" />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ID Card Upload */}
                      <div className="mb-8">
                        <h5 className="text-[#002221] text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                          Identity Verification
                        </h5>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-[15px] p-6 hover:border-green-500 transition-colors group">
                          <label htmlFor="id-card-upload" className="cursor-pointer flex flex-col items-center gap-4">
                            {idCardPreview ? (
                              <div className="text-center">
                                <img src={idCardPreview} alt="ID Card Preview" className="w-48 h-32 object-contain rounded-lg border mx-auto" />
                                <span className="text-sm text-green-600 font-medium mt-2 block">ID Card Uploaded ✓</span>
                              </div>
                            ) : (
                              <>
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-500" />
                                </div>
                                <div className="text-center">
                                  <span className="text-sm text-gray-700 font-medium block">Upload ID Card</span>
                                  <span className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, PDF</span>
                                </div>
                              </>
                            )}
                          </label>
                          <input
                            id="id-card-upload"
                            name="idCard"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) => handleIDCardChange(e, setFieldValue)}
                          />
                          <p className="text-red-600 text-xs mt-3 text-center">
                            <ErrorMessage name="idCard" />
                          </p>
                        </div>
                      </div>

                      {/* Submit Button */}
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
          </div>
          
          {/* Image Section - Equal Height */}
          <div className="hidden md:block col-span-7 bg-gradient-to-br from-[#002221] to-[#004d4d]">
            <div className="h-full flex items-center justify-center p-12">
              <div className="text-center text-white max-w-lg">
                <img 
                  src="/images/Frame 38.svg" 
                  alt="Real Estate Agent" 
                  className="w-full max-w-md mx-auto mb-8"
                />
                <h3 className="text-3xl font-bold mb-6">Join Our Network of Professional Agents</h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Start your journey as a real estate agent and unlock new opportunities in the property market. 
                  Connect with clients, showcase properties, and grow your career with our comprehensive platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      <div
        className={`${display ? "block" : "hidden"} w-full h-full bg-black bg-opacity-50 z-[150] fixed top-0 left-0 transition-opacity`}
        onClick={handleCancel}
      ></div>

      {/* Success Modal */}
      {display && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl bg-white z-[200] rounded-2xl overflow-hidden w-[95%] max-w-md animate-fade-in">
          {showDefaultConnectors()}
        </div>
      )}
    </>
  );
};

export default BecomeAgent;