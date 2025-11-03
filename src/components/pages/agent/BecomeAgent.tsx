import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";
import BecomeAgentModal from "./BecomeAgentModal";
import { Eye, EyeOff, User, Plus, Upload } from "lucide-react";
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
    e.stopPropagation();
    setDisplay(false);
    clearError();
  };

  const handleModal = () => {
    setDisplay(true);
  };

  const showDefaultConnectors = () => {
    return <BecomeAgentModal handleCancel={handleCancel} />;
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
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    name: Yup.string().required("Full name is required"),
    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits")
      .max(15, "Must be 15 digits or less"),
    address: Yup.string().required("Address is required"),
    gender: Yup.string().required("Gender is required"),
    bankName: Yup.string().required("Bank name is required"),
    accountNumber: Yup.string()
      .required("Account number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Account number must be at least 10 digits")
      .max(15, "Account number must be 15 digits or less"),
    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
    nextOfKin: Yup.string().required("Next of kin name is required"),
    kinPhone: Yup.string()
      .required("Kin phone number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits")
      .max(15, "Must be 15 digits or less"),
    kinEmail: Yup.string()
      .email("Invalid email address")
      .required("Kin email is required"),
    kinAddress: Yup.string().required("Kin address is required"),
    kinOccupation: Yup.string().required("Kin occupation is required"),
    kinStatus: Yup.string().required("Kin relationship is required"),
    personalUrl: Yup.string()
      .required("Username is required")
      .matches(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens",
      ),
    idCard: Yup.mixed().required("ID Card is required"),
    image: Yup.mixed().required("Profile image is required"),
  });

  const onSubmit = async (values: AgentFormData, { setSubmitting }: any) => {
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

      console.log("=== FormData Contents ===");
      Array.from(formData.entries()).forEach(([key, value]) => {
        console.log(
          `${key}:`,
          value instanceof File ? `File: ${value.name}` : value,
        );
      });
      console.log("=========================");

      const success = await registerAgent(formData);
      if (success) {
        handleModal();
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any,
    setFieldError: any,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setFieldError("image", "Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFieldError("image", "Image must be less than 5MB");
        return;
      }

      setFieldValue("image", file);
      setFieldError("image", undefined);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIDCardChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: any,
    setFieldError: any,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        setFieldError("idCard", "Please select a JPG, PNG, or PDF file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setFieldError("idCard", "File must be less than 5MB");
        return;
      }

      setFieldValue("idCard", file);
      setFieldError("idCard", undefined);

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIdCardPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setIdCardPreview(null);
      }
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
                    <img
                      src="/images/Frame 67.svg"
                      alt="Home"
                      className="w-[35px] h-[35px]"
                    />
                  </Link>
                  <div>
                    <h4 className="text-[#002221] text-[24px] font-bold">
                      Become an Agent
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Join our network of professional real estate agents
                    </p>
                  </div>
                </div>

                {/* Global Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <div className="flex-1">
                      <strong className="font-medium text-red-800">
                        Registration Error:
                      </strong>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                    <button
                      onClick={clearError}
                      className="text-red-700 hover:text-red-900 ml-4 text-lg font-bold">
                      ×
                    </button>
                  </div>
                )}

                <Formik
                  initialValues={initialData}
                  validationSchema={validation}
                  onSubmit={onSubmit}
                  validateOnChange={true}
                  validateOnBlur={true}>
                  {({
                    errors,
                    values,
                    setFieldValue,
                    setFieldError,
                    isSubmitting,
                    touched,
                  }) => (
                    <Form className="w-full mt-6 flex flex-col">
                      {/* Profile Image Upload */}
                      <div className="mb-8 flex flex-col items-center">
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer group">
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
                              <div
                                className={`w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-dashed ${
                                  errors.image && touched.image
                                    ? "border-red-500"
                                    : "border-gray-300 group-hover:border-green-500"
                                } transition-colors`}>
                                <User
                                  className={`w-10 h-10 ${
                                    errors.image && touched.image
                                      ? "text-red-400"
                                      : "text-gray-400 group-hover:text-green-500"
                                  }`}
                                />
                              </div>
                            )}
                            <div
                              className={`absolute -bottom-2 -right-2 rounded-full p-2 shadow-lg transition-colors ${
                                errors.image && touched.image
                                  ? "bg-red-500"
                                  : "bg-green-500 group-hover:bg-green-600"
                              }`}>
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </label>
                        <span className="text-sm text-gray-600 mt-3 font-medium">
                          Profile Photo
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Recommended: 500x500px, JPG or PNG
                        </p>
                        <input
                          id="image-upload"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleImageChange(e, setFieldValue, setFieldError)
                          }
                        />
                        {errors.image && touched.image && (
                          <p className="text-red-600 text-xs mt-2 text-center font-medium bg-red-50 px-3 py-1 rounded">
                            {errors.image}
                          </p>
                        )}
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
                                errors.name && touched.name
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="name"
                              type="text"
                              id="name"
                              placeholder="Full Name *"
                            />
                            {errors.name && touched.name && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.name}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.phoneNumber && touched.phoneNumber
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="phoneNumber"
                                type="text"
                                id="phoneNumber"
                                placeholder="Phone Number *"
                              />
                              {errors.phoneNumber && touched.phoneNumber && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.phoneNumber}
                                </p>
                              )}
                            </div>
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.email && touched.email
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="email"
                                type="email"
                                id="email"
                                placeholder="Email Address *"
                              />
                              {errors.email && touched.email && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.email}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Field
                              as="textarea"
                              className={`block w-full h-[90px] border pl-4 pt-3 rounded-[12px] focus:outline-none transition-colors resize-none ${
                                errors.address && touched.address
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="address"
                              id="address"
                              placeholder="Full Address *"
                            />
                            {errors.address && touched.address && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.address}
                              </p>
                            )}
                          </div>

                          <div>
                            <Field
                              as="select"
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors appearance-none bg-white ${
                                errors.gender && touched.gender
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="gender"
                              id="gender">
                              <option value="">Select Gender *</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </Field>
                            {errors.gender && touched.gender && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.gender}
                              </p>
                            )}
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
                                errors.bankName && touched.bankName
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="bankName"
                              type="text"
                              id="bankName"
                              placeholder="Bank Name *"
                            />
                            {errors.bankName && touched.bankName && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.bankName}
                              </p>
                            )}
                          </div>
                          <div>
                            <Field
                              className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                errors.accountNumber && touched.accountNumber
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="accountNumber"
                              type="text"
                              id="accountNumber"
                              placeholder="Account Number *"
                            />
                            {errors.accountNumber && touched.accountNumber && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.accountNumber}
                              </p>
                            )}
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
                                  errors.personalUrl && touched.personalUrl
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="personalUrl"
                                type="text"
                                id="personalUrl"
                                placeholder="username *"
                              />
                              {errors.personalUrl && touched.personalUrl && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.personalUrl}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="relative">
                                <Field
                                  className={`block w-full h-[50px] border pl-4 pr-12 rounded-[12px] focus:outline-none transition-colors ${
                                    errors.password && touched.password
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300 focus:border-[#002221]"
                                  }`}
                                  name="password"
                                  type={showPassword ? "text" : "password"}
                                  id="password"
                                  placeholder="Password *"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                                  {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                              {errors.password && touched.password && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.password}
                                </p>
                              )}
                            </div>

                            <div>
                              <div className="relative">
                                <Field
                                  className={`block w-full h-[50px] border pl-4 pr-12 rounded-[12px] focus:outline-none transition-colors ${
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                      ? "border-red-500 bg-red-50"
                                      : "border-gray-300 focus:border-[#002221]"
                                  }`}
                                  name="confirmPassword"
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
                                  id="confirmPassword"
                                  placeholder="Confirm Password *"
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                  }
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors">
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                  ) : (
                                    <Eye className="h-5 w-5" />
                                  )}
                                </button>
                              </div>
                              {errors.confirmPassword &&
                                touched.confirmPassword && (
                                  <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                    {errors.confirmPassword}
                                  </p>
                                )}
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
                                errors.nextOfKin && touched.nextOfKin
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="nextOfKin"
                              type="text"
                              id="nextOfKin"
                              placeholder="Next of Kin Full Name *"
                            />
                            {errors.nextOfKin && touched.nextOfKin && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.nextOfKin}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.kinPhone && touched.kinPhone
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="kinPhone"
                                type="text"
                                id="kinPhone"
                                placeholder="Kin Phone Number *"
                              />
                              {errors.kinPhone && touched.kinPhone && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.kinPhone}
                                </p>
                              )}
                            </div>
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.kinEmail && touched.kinEmail
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="kinEmail"
                                type="email"
                                id="kinEmail"
                                placeholder="Kin Email Address *"
                              />
                              {errors.kinEmail && touched.kinEmail && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.kinEmail}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Field
                              as="textarea"
                              className={`block w-full h-[90px] border pl-4 pt-3 rounded-[12px] focus:outline-none transition-colors resize-none ${
                                errors.kinAddress && touched.kinAddress
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#002221]"
                              }`}
                              name="kinAddress"
                              id="kinAddress"
                              placeholder="Kin Full Address *"
                            />
                            {errors.kinAddress && touched.kinAddress && (
                              <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                {errors.kinAddress}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Field
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors ${
                                  errors.kinOccupation && touched.kinOccupation
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="kinOccupation"
                                type="text"
                                id="kinOccupation"
                                placeholder="Kin Occupation *"
                              />
                              {errors.kinOccupation &&
                                touched.kinOccupation && (
                                  <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                    {errors.kinOccupation}
                                  </p>
                                )}
                            </div>
                            <div>
                              <Field
                                as="select"
                                className={`block w-full h-[50px] border pl-4 rounded-[12px] focus:outline-none transition-colors appearance-none bg-white ${
                                  errors.kinStatus && touched.kinStatus
                                    ? "border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#002221]"
                                }`}
                                name="kinStatus"
                                id="kinStatus">
                                <option value="">Kin Relationship *</option>
                                <option value="spouse">Spouse</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="child">Child</option>
                                <option value="other">Other</option>
                              </Field>
                              {errors.kinStatus && touched.kinStatus && (
                                <p className="text-red-600 text-xs mt-2 font-medium bg-red-50 px-3 py-1 rounded">
                                  {errors.kinStatus}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ID Card Upload */}
                      <div className="mb-8">
                        <h5 className="text-[#002221] text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
                          Identity Verification
                        </h5>

                        <div
                          className={`border-2 border-dashed rounded-[15px] p-6 transition-colors group ${
                            errors.idCard && touched.idCard
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:border-green-500"
                          }`}>
                          <label
                            htmlFor="id-card-upload"
                            className="cursor-pointer flex flex-col items-center gap-4">
                            {idCardPreview ? (
                              <div className="text-center">
                                <img
                                  src={idCardPreview}
                                  alt="ID Card Preview"
                                  className="w-48 h-32 object-contain rounded-lg border mx-auto"
                                />
                                <span className="text-sm text-green-600 font-medium mt-2 block">
                                  ID Card Uploaded ✓
                                </span>
                              </div>
                            ) : (
                              <>
                                <div
                                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                                    errors.idCard && touched.idCard
                                      ? "bg-red-100"
                                      : "bg-gray-100 group-hover:bg-green-50"
                                  }`}>
                                  <Upload
                                    className={`w-8 h-8 ${
                                      errors.idCard && touched.idCard
                                        ? "text-red-400"
                                        : "text-gray-400 group-hover:text-green-500"
                                    }`}
                                  />
                                </div>
                                <div className="text-center">
                                  <span className="text-sm text-gray-700 font-medium block">
                                    Upload ID Card
                                  </span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    Supported formats: JPG, PNG, PDF
                                  </span>
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
                            onChange={(e) =>
                              handleIDCardChange(
                                e,
                                setFieldValue,
                                setFieldError,
                              )
                            }
                          />
                          {errors.idCard && touched.idCard && (
                            <p className="text-red-600 text-xs mt-3 text-center font-medium bg-red-50 px-3 py-1 rounded">
                              {errors.idCard}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        text={
                          isLoading ? "Processing..." : "Submit Application"
                        }
                        type="submit"
                        disabled={isLoading || isSubmitting}
                        className={
                          isLoading || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
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
                <h3 className="text-3xl font-bold mb-6">
                  Join Our Network of Professional Agents
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed">
                  Start your journey as a real estate agent and unlock new
                  opportunities in the property market. Connect with clients,
                  showcase properties, and grow your career with our
                  comprehensive platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {display && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[150] transition-opacity"
          onClick={handleCancel}></div>
      )}

      {/* Success Modal */}
      {display && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl bg-white z-[200] rounded-2xl overflow-hidden w-[95%] max-w-md">
          {showDefaultConnectors()}
        </div>
      )}
    </>
  );
};

export default BecomeAgent;
