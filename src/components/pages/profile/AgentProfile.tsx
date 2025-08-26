import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

const AgentProfile = () => {
  const [agentInfo, setAgentInfo] = useState({
    name: "",
    email: "",
    status: "",
    slug: "",
    phoneNumber: "",
    address: "",
    gender: "",
    profilePicture: "",
  });

  const [loading, setLoading] = useState(true);

  // Fetch agent information from the backend
  useEffect(() => {
    const fetchAgentInfo = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_DEV_BASE_URL}/api/v1/admin/agent-profile`
        );
        if (response.status === 200) {
          const data = response.data.data;
          setAgentInfo({
            name: data.name || "",
            email: data.email || "",
            status: data.status || "",
            slug: data.slug || "",
            phoneNumber: data.phoneNumber || "",
            address: data.address || "",
            gender: data.gender || "",
            profilePicture: data.profilePicture || "",
          });
        }
      } catch (error) {
        console.error("Error fetching agent info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentInfo();
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
          <h4 className="text-[#002221] text-[20px]">Agent Profile</h4>
        </div>
      </div>

      {/* Profile Picture Section */}
      <div className="flex justify-center mt-8">
        <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
          {agentInfo.profilePicture ? (
            <img
              src={agentInfo.profilePicture}
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

      {/* Agent Information Section */}
      <div className="pt-10 pb-16">
        {/* Name */}
        <div className="flex items-center md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Name
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {agentInfo.name}
            </h4>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Email
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {agentInfo.email}
            </h4>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Status
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {agentInfo.status}
            </h4>
          </div>
        </div>

        {/* Slug */}
        <div className="flex items-center pt-2 md:pt-4 md:pl-5 md:pr-8 px-3 justify-between border-b-[3px] pb-2">
          <div className="flex flex-col">
            <h4 className="text-[#000000] md:text-[24px] text-[18px] font-[500]">
              Slug
            </h4>
            <h4 className="text-[#000000] md:text-[20px] text-[16px]">
              {agentInfo.slug}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentProfile;