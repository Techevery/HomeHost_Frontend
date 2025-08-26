import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import EditModal from "../profile/EditModal";
import CircularProgress from "@mui/material/CircularProgress";

const PersonalInfo = () => {
  const [userInfo, setUserInfo] = useState({
    legalName: "",
    preferredName: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    profilePicture: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch user information from the backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/edit-profile`
        );
        if (response.status === 200) {
          const data = response.data.data;
          setUserInfo({
            legalName: data.name || "",
            preferredName: data.name || "",
            email: data.email || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            gender: data.gender || "",
            profilePicture: data.profilePicture || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

   if (loading) {
     return (
       <div className="text-center mt-10">
         <CircularProgress />
       </div>
     );
   }
  return (
    <div className="w-[80%] px-3 lg:px-10 mx-auto lg:gap-8 xl:gap-12">
      {/* Header Section */}
      <div className="pt-[40px] flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Link to="/profile">
            <img
              src="/images/Frame 67.svg"
              alt="Back to Profile"
              className="w-[35px] h-[35px]"
            />
          </Link>
          <h4 className="text-[#002221] text-[20px]">Personal Info</h4>
        </div>
        <Link
          to="/profile"
          className="bg-[#002221] text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Edit
        </Link>
      </div>

      {/* Profile Picture Section */}
      <div className="flex justify-center mt-8">
        <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
          {userInfo.profilePicture ? (
            <img
              src={userInfo.profilePicture}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
        </div>
      </div>

      {/* User Information Section */}
      <div className="pt-10 pb-16">
        {/* Legal Name */}
        <div className="flex items-center md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Legal name
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {userInfo.legalName}
            </h4>
          </div>
        </div>

        {/* Preferred Name */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Preferred name
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {userInfo.preferredName}
            </h4>
          </div>
        </div>

        {/* Email Address */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Email address
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {userInfo.email}
            </h4>
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Phone Number
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {userInfo.phoneNumber}
            </h4>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Address
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {userInfo.address}
            </h4>
          </div>
        </div>

        {/* Gender */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Gender
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {userInfo.gender}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
