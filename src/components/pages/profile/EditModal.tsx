import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import Button from "../../UI/Button";
import useAdminStore from "../../../stores/admin";

interface FormValues {
  name: string;
  address: string;
  password: string;
  confirmPassword: string;
}

const EditModal: React.FC<{ handleCancel: () => void }> = ({ handleCancel }) => {
  const { adminInfo, updateAdminProfile, isLoading, error, clearError } = useAdminStore();
  const [initialData, setInitialData] = useState<FormValues>({
    name: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  // const navigate = useNavigate();

  // Initialize form with admin data
  useEffect(() => {
    if (adminInfo) {
      setInitialData({
        name: adminInfo.name || "",
        address: adminInfo.address || "",
        password: "",
        confirmPassword: "",
      });
      setLoading(false);
    }
  }, [adminInfo]);

  // Validation schema - password validation is conditional
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    address: Yup.string().required("Address is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .when('$showPasswordFields', (showPasswordFields, schema) => {
        return showPasswordFields ? schema.required("Password is required when changing") : schema;
      }),
    confirmPassword: Yup.string()
      .when('$showPasswordFields', (showPasswordFields, schema) => {
        return showPasswordFields ? schema.required("Confirm Password is required") : schema;
      })
      .when('password', (password, schema) => {
        return password ? schema.oneOf([Yup.ref('password')], "Passwords must match") : schema;
      }),
  });

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    clearError();
    
    try {
      // Prepare data for backend
      const updateData: any = {
        name: values.name,
        address: values.address,
      };

      // Only include password fields if user wants to change password
      if (showPasswordFields && values.password) {
        updateData.password = values.password;
        updateData.confirmPassword = values.confirmPassword;
      }

      await updateAdminProfile(updateData);

      // Only close if there was no error
      if (!error) {
        handleCancel();
      }
    } catch (submitError) {
      // Error handling is done in the store
      console.error("Error updating profile:", submitError);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div>
      {/* Back Arrow */}
      <div className="flex items-center gap-4 m-6">
        <img
          src="/images/Frame 67.svg"
          alt="Back"
          className="w-[35px] h-[35px] cursor-pointer"
          onClick={handleCancel}
        />
        <h3 className="text-[#000000] font-[600] text-[20px] md:text-[26px]">
          Edit Profile
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <Formik
        initialValues={initialData}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
        validateOnChange={true}
        validateOnBlur={true}
      >
        {({ values, errors, touched, setFieldValue }) => (
          <Form className="w-full overflow-y-scroll max-h-[550px] px-10 mt-10 lg:mt-5 mb-6 flex flex-col justify-between">
            <div className="w-[85%] m-auto">
              <h3 className="text-[#000000] text-[14px] pb-6 md:text-[18px]">
                Update your profile details below
              </h3>
              
              <div className="mb-5">
                {/* Name Field */}
                <div className="w-full relative mb-6">
                  <label htmlFor="name" className="text-[#3F3F3F] pt-2 text-sm block mb-2">
                    Name
                  </label>
                  <Field
                    className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787]"
                    name="name"
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                  />
                  <p className="text-red-700 text-xs mt-1">
                    <ErrorMessage name="name" />
                  </p>
                </div>

                {/* Email Field (Read-only) */}
                <div className="w-full relative mb-6">
                  <label htmlFor="email" className="text-[#3F3F3F] pt-2 text-sm block mb-2">
                    Email
                  </label>
                  <input
                    className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787] bg-gray-100 cursor-not-allowed"
                    type="email"
                    id="email"
                    value={adminInfo?.email || ""}
                    disabled
                    placeholder="Email"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* Address Field */}
                <div className="w-full relative mb-6">
                  <label htmlFor="address" className="text-[#3F3F3F] pt-2 text-sm block mb-2">
                    Address
                  </label>
                  <Field
                    className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787]"
                    name="address"
                    type="text"
                    id="address"
                    placeholder="Enter your address"
                  />
                  <p className="text-red-700 text-xs mt-1">
                    <ErrorMessage name="address" />
                  </p>
                </div>

                {/* Gender Field (Read-only) */}
                <div className="w-full relative mb-6">
                  <label htmlFor="gender" className="text-[#3F3F3F] pt-2 text-sm block mb-2">
                    Gender
                  </label>
                  <input
                    className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787] bg-gray-100 cursor-not-allowed"
                    type="text"
                    id="gender"
                    value={adminInfo?.gender || "Not specified"}
                    disabled
                    placeholder="Gender"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Gender cannot be changed
                  </p>
                </div>

                {/* Change Password Toggle */}
                <div className="w-full mb-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="changePassword"
                      checked={showPasswordFields}
                      onChange={(e) => {
                        setShowPasswordFields(e.target.checked);
                        if (!e.target.checked) {
                          setFieldValue("password", "");
                          setFieldValue("confirmPassword", "");
                          setShowPassword(false);
                          setShowConfirmPassword(false);
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor="changePassword" className="text-[#3F3F3F] text-sm">
                      Change Password
                    </label>
                  </div>

                  {/* Password Field (conditional) */}
                  {showPasswordFields && (
                    <div className="space-y-4 mb-6">
                      <div className="relative">
                        <label htmlFor="password" className="text-[#3F3F3F] pt-2 text-sm block mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Field
                            className="block w-full h-12 border pl-3 pr-10 rounded-[10px] focus:outline-none border-[#8A8787]"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="password" />
                        </p>
                      </div>

                      <div className="relative">
                        <label htmlFor="confirmPassword" className="text-[#3F3F3F] pt-2 text-sm block mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Field
                            className="block w-full h-12 border pl-3 pr-10 rounded-[10px] focus:outline-none border-[#8A8787]"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-red-700 text-xs mt-1">
                          <ErrorMessage name="confirmPassword" />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button 
                  text="Cancel" 
                  type="button" 
                 
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  text={isLoading ? "Saving..." : "Save Changes"} 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditModal;