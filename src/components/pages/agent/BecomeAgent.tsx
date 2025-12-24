import { Field, Form, Formik } from "formik";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";
import BecomeAgentModal from "./BecomeAgentModal";
import { Eye, EyeOff, User, Plus, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import useAgentStore from "../../../stores/agentstore";
import useBannerStore from "../../../stores/bannerStore";

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

const BecomeAgent = () => {
  const [display, setDisplay] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { registerAgent, isLoading, error, clearError } = useAgentStore();
  const { banners, fetchBanners, isLoading: bannersLoading } = useBannerStore();

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length > 0 && isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length, isAutoPlaying]);

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

      formData.append("name", values.name);
      formData.append("email", values.email);
      formData.append("phone_number", values.phoneNumber);
      formData.append("address", values.address);
      formData.append("gender", values.gender);
      formData.append("bank_name", values.bankName);
      formData.append("account_number", values.accountNumber);
      formData.append("password", values.password);
      formData.append("personalUrl", values.personalUrl);

      formData.append("nextOfKinName", values.nextOfKin);
      formData.append("nextOfKinPhone", values.kinPhone);
      formData.append("nextOfKinEmail", values.kinEmail);
      formData.append("nextOfKinAddress", values.kinAddress);
      formData.append("nextOfKinOccupation", values.kinOccupation);
      formData.append("nextOfKinStatus", values.kinStatus);

      if (values.image) {
        formData.append("profile_picture", values.image);
      }
      if (values.idCard) {
        formData.append("id_card", values.idCard);
      }

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
      if (!file.type.startsWith("image/")) {
        setFieldError("image", "Please select an image file");
        return;
      }

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

  const handlePrevBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleNextBanner = () => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentBannerIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 3000);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="grid lg:grid-cols-12 min-h-screen">
          {/* Form Section */}
          <div className="lg:col-span-7 bg-white lg:rounded-r-3xl shadow-xl">
            <div className="h-full overflow-y-auto">
              <div className="lg:px-16 px-6 pt-10 pb-12 flex flex-col max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 mb-10">
                  <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#002221] to-[#004d4d] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                      <img
                        src="/images/Frame 67.svg"
                        alt="Home"
                        className="w-7 h-7"
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        Join Our Agent Network
                      </h1>
                      <p className="text-gray-600 mt-1">
                        Start your journey in real estate with comprehensive support
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Global Error Display */}
                {error && (
                  <div className="mb-8 p-5 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 rounded-lg shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">!</span>
                          </div>
                          <strong className="font-semibold text-red-800">
                            Registration Error
                          </strong>
                        </div>
                        <p className="text-red-700 mt-2 pl-8">{error}</p>
                      </div>
                      <button
                        onClick={clearError}
                        className="text-red-600 hover:text-red-800 text-xl font-bold transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                <Formik
                  initialValues={initialData}
                  validationSchema={validation}
                  onSubmit={onSubmit}
                  validateOnChange={true}
                  validateOnBlur={true}
                >
                  {({
                    errors,
                    values,
                    setFieldValue,
                    setFieldError,
                    isSubmitting,
                    touched,
                  }) => (
                    <Form className="w-full space-y-10">
                      {/* Profile & Basic Info Section */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
                          {/* Profile Image Upload */}
                          <div className="flex flex-col items-center">
                            <label
                              htmlFor="image-upload"
                              className="cursor-pointer group relative"
                            >
                              <div className="relative">
                                {imagePreview ? (
                                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl">
                                    <img
                                      src={imagePreview}
                                      alt="Avatar Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-3 ${errors.image && touched.image
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300 group-hover:border-[#002221]"
                                    } transition-all duration-300 group-hover:shadow-lg`}>
                                    <User className={`w-12 h-12 ${errors.image && touched.image
                                        ? "text-red-400"
                                        : "text-gray-400 group-hover:text-[#002221]"
                                      } transition-colors`}
                                    />
                                  </div>
                                )}
                                <div className={`absolute -bottom-3 -right-3 rounded-full p-3 shadow-xl transition-all ${errors.image && touched.image
                                    ? "bg-red-500"
                                    : "bg-gradient-to-r from-[#002221] to-[#004d4d] group-hover:scale-110"
                                  }`}>
                                  <Plus className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            </label>
                            <span className="text-sm font-medium text-gray-700 mt-6">
                              Profile Photo
                            </span>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              JPG or PNG, max 5MB
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
                              <p className="text-red-600 text-xs mt-3 font-medium bg-red-50 px-4 py-2 rounded-lg">
                                {errors.image}
                              </p>
                            )}
                          </div>

                          {/* Personal Info Fields */}
                          <div className="flex-1 space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900 pb-3 border-b border-gray-200">
                              Personal Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Full Name *
                                </label>
                                <Field
                                  className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.name && touched.name
                                      ? "border-red-500 bg-red-50 focus:ring-red-200"
                                      : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                    }`}
                                  name="name"
                                  type="text"
                                  placeholder="John Doe"
                                />
                                {errors.name && touched.name && (
                                  <p className="text-red-600 text-sm mt-2 font-medium">
                                    {errors.name}
                                  </p>
                                )}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Phone Number *
                                </label>
                                <Field
                                  className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.phoneNumber && touched.phoneNumber
                                      ? "border-red-500 bg-red-50 focus:ring-red-200"
                                      : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                    }`}
                                  name="phoneNumber"
                                  type="text"
                                  placeholder="08012345678"
                                />
                                {errors.phoneNumber && touched.phoneNumber && (
                                  <p className="text-red-600 text-sm mt-2 font-medium">
                                    {errors.phoneNumber}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
                              </label>
                              <Field
                                className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.email && touched.email
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                              />
                              {errors.email && touched.email && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.email}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username *
                              </label>
                              <div className="flex items-center">
                                <span className="h-14 px-4 flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm lg:text-base">
                                  https://homeyhost.ng/
                                </span>
                                <Field
                                  className={`flex-1 h-14 px-4 rounded-r-xl border focus:outline-none focus:ring-2 transition-all ${errors.personalUrl && touched.personalUrl
                                      ? "border-red-500 bg-red-50 focus:ring-red-200"
                                      : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                    }`}
                                  name="personalUrl"
                                  type="text"
                                  placeholder="username"
                                />
                              </div>
                              {errors.personalUrl && touched.personalUrl && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.personalUrl}
                                </p>
                              )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Gender *
                                </label>
                                <Field
                                  as="select"
                                  className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${errors.gender && touched.gender
                                      ? "border-red-500 bg-red-50 focus:ring-red-200"
                                      : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                    }`}
                                  name="gender"
                                >
                                  <option value="">Select Gender</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </Field>
                                {errors.gender && touched.gender && (
                                  <p className="text-red-600 text-sm mt-2 font-medium">
                                    {errors.gender}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Address *
                              </label>
                              <Field
                                as="textarea"
                                className={`w-full h-28 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none ${errors.address && touched.address
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="address"
                                placeholder="Your complete address"
                              />
                              {errors.address && touched.address && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.address}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bank Information */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                          Bank Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bank Name *
                            </label>
                            <Field
                              className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.bankName && touched.bankName
                                  ? "border-red-500 bg-red-50 focus:ring-red-200"
                                  : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                }`}
                              name="bankName"
                              type="text"
                              placeholder="Bank Name"
                            />
                            {errors.bankName && touched.bankName && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {errors.bankName}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Account Number *
                            </label>
                            <Field
                              className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.accountNumber && touched.accountNumber
                                  ? "border-red-500 bg-red-50 focus:ring-red-200"
                                  : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                }`}
                              name="accountNumber"
                              type="text"
                              placeholder="Account Number"
                            />
                            {errors.accountNumber && touched.accountNumber && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {errors.accountNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Account Security */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                          Account Security
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Password *
                            </label>
                            <div className="relative">
                              <Field
                                className={`w-full h-14 px-4 pr-12 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.password && touched.password
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create password"
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
                            {errors.password && touched.password && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {errors.password}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm Password *
                            </label>
                            <div className="relative">
                              <Field
                                className={`w-full h-14 px-4 pr-12 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword && touched.confirmPassword
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm password"
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
                            {errors.confirmPassword && touched.confirmPassword && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {errors.confirmPassword}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Next of Kin Information */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                          Next of Kin Information
                        </h3>
                        <div className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                              </label>
                              <Field
                                className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.nextOfKin && touched.nextOfKin
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="nextOfKin"
                                type="text"
                                placeholder="Next of kin name"
                              />
                              {errors.nextOfKin && touched.nextOfKin && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.nextOfKin}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Relationship *
                              </label>
                              <Field
                                as="select"
                                className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${errors.kinStatus && touched.kinStatus
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="kinStatus"
                              >
                                <option value="">Select Relationship</option>
                                <option value="spouse">Spouse</option>
                                <option value="parent">Parent</option>
                                <option value="sibling">Sibling</option>
                                <option value="child">Child</option>
                                <option value="other">Other</option>
                              </Field>
                              {errors.kinStatus && touched.kinStatus && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.kinStatus}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number *
                              </label>
                              <Field
                                className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.kinPhone && touched.kinPhone
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="kinPhone"
                                type="text"
                                placeholder="Kin phone number"
                              />
                              {errors.kinPhone && touched.kinPhone && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.kinPhone}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email *
                              </label>
                              <Field
                                className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.kinEmail && touched.kinEmail
                                    ? "border-red-500 bg-red-50 focus:ring-red-200"
                                    : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                  }`}
                                name="kinEmail"
                                type="email"
                                placeholder="Kin email address"
                              />
                              {errors.kinEmail && touched.kinEmail && (
                                <p className="text-red-600 text-sm mt-2 font-medium">
                                  {errors.kinEmail}
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Occupation *
                            </label>
                            <Field
                              className={`w-full h-14 px-4 rounded-xl border focus:outline-none focus:ring-2 transition-all ${errors.kinOccupation && touched.kinOccupation
                                  ? "border-red-500 bg-red-50 focus:ring-red-200"
                                  : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                }`}
                              name="kinOccupation"
                              type="text"
                              placeholder="Kin occupation"
                            />
                            {errors.kinOccupation && touched.kinOccupation && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {errors.kinOccupation}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Address *
                            </label>
                            <Field
                              as="textarea"
                              className={`w-full h-28 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none ${errors.kinAddress && touched.kinAddress
                                  ? "border-red-500 bg-red-50 focus:ring-red-200"
                                  : "border-gray-300 focus:border-[#002221] focus:ring-[#002221]/20"
                                }`}
                              name="kinAddress"
                              placeholder="Kin complete address"
                            />
                            {errors.kinAddress && touched.kinAddress && (
                              <p className="text-red-600 text-sm mt-2 font-medium">
                                {errors.kinAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ID Card Upload */}
                      <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
                          Identity Verification
                        </h3>
                        <div className="flex flex-col items-center justify-center">
                          <label
                            htmlFor="id-card-upload"
                            className={`cursor-pointer w-full max-w-md rounded-2xl border-3 p-10 text-center transition-all hover:shadow-lg ${errors.idCard && touched.idCard
                                ? "border-red-300 bg-red-50"
                                : "border-gray-300 border-dashed hover:border-[#002221]"
                              }`}
                          >
                            {idCardPreview ? (
                              <div className="space-y-4">
                                <div className="w-48 h-32 mx-auto border rounded-xl overflow-hidden">
                                  <img
                                    src={idCardPreview}
                                    alt="ID Card Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="text-center">
                                  <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">✓</span>
                                    </div>
                                    ID Card Uploaded Successfully
                                  </span>
                                  <p className="text-sm text-gray-500 mt-2">
                                    Click to change file
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors ${errors.idCard && touched.idCard
                                    ? "bg-red-100"
                                    : "bg-gray-100 group-hover:bg-[#002221]/10"
                                  }`}>
                                  <Upload className={`w-8 h-8 ${errors.idCard && touched.idCard
                                      ? "text-red-400"
                                      : "text-gray-400 group-hover:text-[#002221]"
                                    }`}
                                  />
                                </div>
                                <div>
                                  <p className="text-lg font-semibold text-gray-800">
                                    Upload ID Card
                                  </p>
                                  <p className="text-sm text-gray-500 mt-2">
                                    Supported formats: JPG, PNG, PDF (Max 5MB)
                                  </p>
                                </div>
                              </div>
                            )}
                          </label>
                          <input
                            id="id-card-upload"
                            name="idCard"
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(e) =>
                              handleIDCardChange(e, setFieldValue, setFieldError)
                            }
                          />
                          {errors.idCard && touched.idCard && (
                            <p className="text-red-600 text-sm mt-4 font-medium bg-red-50 px-4 py-2 rounded-lg">
                              {errors.idCard}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="sticky bottom-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-xl">
                        <Button
                          text={isLoading ? "Processing..." : "Submit Application"}
                          type="submit"
                          disabled={isLoading || isSubmitting}
                          className={`w-full h-16 text-lg font-semibold rounded-xl transition-all ${isLoading || isSubmitting
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-xl transform hover:-translate-y-1"
                            }`}
                        />
                        <p className="text-center text-sm text-gray-500 mt-4">
                          By submitting, you agree to our Terms of Service and Privacy Policy
                        </p>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>

          {/* Banner Carousel Section */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#002221] to-[#004d4d] lg:pt-8">
            <div className="h-full flex flex-col items-center justify-start lg:items-start lg:justify-start">
              <div className="text-center lg:text-left text-white mb-8 lg:mb-12 px-8">
                <h2 className="text-4xl font-bold mb-6">
                  Why Join as an Agent?
                </h2>
                <p className="text-gray-200 text-lg leading-relaxed max-w-xl lg:max-w-none">
                  Become part of Nigeria's fastest-growing real estate network
                </p>
              </div>

              {/* Banner Carousel */}
              <div className="w-full max-w-2xl lg:max-w-full px-8">
                {bannersLoading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : banners.length > 0 ? (
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl lg:max-w-2xl lg:mx-auto">
                    {/* Banner Image */}
                    <div className="h-[400px] overflow-hidden">
                      <img
                        src={banners[currentBannerIndex]?.image_url || ''}
                        alt={banners[currentBannerIndex]?.name || 'Banner'}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>

                    {/* Banner Content */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {banners[currentBannerIndex]?.name || 'Featured Banner'}
                      </h3>
                      <p className="text-gray-200 line-clamp-2">
                        {banners[currentBannerIndex]?.description || ''}
                      </p>
                    </div>

                    {/* Navigation Arrows */}
                    {banners.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevBanner}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                          onClick={handleNextBanner}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                      </>
                    )}

                    {/* Dots Indicator */}
                    {banners.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => handleDotClick(index)}
                            className={`w-3 h-3 rounded-full transition-all ${
                              index === currentBannerIndex
                                ? "bg-white w-8"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Status Indicator */}
                    {banners[currentBannerIndex]?.status && (
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          banners[currentBannerIndex]?.status === 'active'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-500 text-white'
                        }`}>
                          {banners[currentBannerIndex]?.status?.toUpperCase() || ''}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center bg-white/10 rounded-3xl p-8 lg:max-w-2xl lg:mx-auto">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                      <img
                        src="/images/Frame 38.svg"
                        alt="Real Estate"
                        className="w-12 h-12"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Join Our Network
                    </h3>
                    <p className="text-gray-200 text-center">
                      Start your journey as a real estate agent and unlock new opportunities
                    </p>
                  </div>
                )}

                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-6 mt-8 lg:mt-12 lg:max-w-2xl lg:mx-auto">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">50+</div>
                    <div className="text-gray-300">Active Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">10M+</div>
                    <div className="text-gray-300">Property Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">98%</div>
                    <div className="text-gray-300">Satisfaction Rate</div>
                  </div>
                </div>

                {/* Features List */}
                <div className="mt-8 lg:mt-12 space-y-4 lg:max-w-2xl lg:mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <span className="text-white">Access to premium property listings</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <span className="text-white">Dedicated support team</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <span className="text-white">Marketing & promotional tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <span className="text-white">Competitive commission rates</span>
                  </div>
                </div>

                {/* Additional content */}
                <div className="mt-8 lg:mt-12 text-center lg:text-left px-8 lg:px-0 lg:max-w-2xl lg:mx-auto">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-medium">Applications reviewed within 48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {display && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[150] transition-opacity"
          onClick={handleCancel}
        ></div>
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