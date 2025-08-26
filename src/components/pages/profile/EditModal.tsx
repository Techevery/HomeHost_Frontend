import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import Button from "../../UI/Button";

interface FormValues {
  name: string;
  email: string;
  address: string;
  gender: string;
  profilePicture: File | null;
}

const EditModal: React.FC<{ handleCancel: () => void }> = ({ handleCancel }) => {
  const [initialData, setInitialData] = useState<FormValues>({
    name: "",
    email: "",
    address: "",
    gender: "",
    profilePicture: null,
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook for navigation

  // Fetch existing user data to prefill the form
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/edit-profile`
        );
        if (response.status === 200) {
          const data = response.data.data;
          setInitialData({
            name: data.name || "",
            email: data.email || "",
            address: data.address || "",
            gender: data.gender || "",
            profilePicture: null,
          });
          if (data.profilePicture) {
            setProfilePreview(data.profilePicture);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    address: Yup.string().required("Address is required"),
    gender: Yup.string().oneOf(["Male", "Female"], "Invalid gender").required("Gender is required"),
  });

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("address", values.address);
    formData.append("gender", values.gender);
    if (values.profilePicture) {
      formData.append("profilePicture", values.profilePicture);
    }

    try {
      const response = await axios.patch(
        `https://homey-host.onrender.com/api/v1/admin/edit-profile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Profile updated successfully!");
        navigate("/personal-info"); // Navigate back to the profile page
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setInitialData((prev) => ({ ...prev, profilePicture: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
          onClick={() => navigate("/profile")} // Navigate back to PersonalInfo
        />
        <h3 className="text-[#000000] font-[600] text-[20px] md:text-[26px]">
          Edit Profile
        </h3>
      </div>

      <Formik
        initialValues={initialData}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize // Ensures the form is updated with fetched data
      >
        {({ setFieldValue }) => (
          <Form className="w-full overflow-y-scroll max-h-[550px] px-10 mt-10 lg:mt-5 mb-6 flex flex-col justify-between">
            <div className="w-[85%] m-auto">


            <h3 className="text-[#000000] text-[14px] pb-10 md:text-[18px]">
              Update your profile details below
            </h3>
            <div className="mb-5">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-4"
                  onChange={(event) => {
                    handleProfilePictureChange(event);
                    setFieldValue("profilePicture", event.target.files?.[0] || null);
                  }}
                />
              </div>

              {/* Name Field */}
              <div className="w-full relative mb-6">
                <Field
                  className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787]"
                  name="name"
                  type="text"
                  id="name"
                  placeholder="Name"
                />
                <label htmlFor="name" className="text-[#3F3F3F] pt-2 text-sm">
                  Name
                </label>
                <p className="text-red-700 text-xs mt-1">
                  <ErrorMessage name="name" />
                </p>
              </div>

              {/* Email Field */}
              <div className="w-full relative mb-6">
                <Field
                  className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787]"
                  name="email"
                  type="email"
                  id="email"
                  placeholder="Email"
                />
                <label htmlFor="email" className="text-[#3F3F3F] pt-2 text-sm">
                  Email
                </label>
                <p className="text-red-700 text-xs mt-1">
                  <ErrorMessage name="email" />
                </p>
              </div>

              {/* Address Field */}
              <div className="w-full relative mb-6">
                <Field
                  className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787]"
                  name="address"
                  type="text"
                  id="address"
                  placeholder="Address"
                />
                <label htmlFor="address" className="text-[#3F3F3F] pt-2 text-sm">
                  Address
                </label>
                <p className="text-red-700 text-xs mt-1">
                  <ErrorMessage name="address" />
                </p>
              </div>

              {/* Gender Field */}
              <div className="w-full relative mb-6">
                <Field
                  as="select"
                  className="block w-full h-12 border pl-3 rounded-[10px] focus:outline-none border-[#8A8787]"
                  name="gender"
                  id="gender"
                >
                  <option value="" label="Select gender" />
                  <option value="Male" label="Male" />
                  <option value="Female" label="Female" />
                </Field>
                <label htmlFor="gender" className="text-[#3F3F3F] pt-2 text-sm">
                  Gender
                </label>
                <p className="text-red-700 text-xs mt-1">
                  <ErrorMessage name="gender" />
                </p>
              </div>
            </div>
            <Button text={"Save"} type="submit" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditModal;