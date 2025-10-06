import React, { useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BsPersonVcard } from "react-icons/bs";
import { MdPayment, MdSecurity } from "react-icons/md";
import { GoCreditCard } from "react-icons/go";
import useAdminStore from "../../../stores/admin";

const Profile = () => {
  const { 
    adminInfo, 
    isAuthenticated, 
    fetchAdminProfile,
    logout 
  } = useAdminStore();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminProfile();
    }
  }, [isAuthenticated, fetchAdminProfile]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfilePictureClick = () => {
    navigate("/personal-info");
  };
       
  

  if (!isAuthenticated) {
    return (
      <div className="max-w-screen-xl px-3 lg:px-10 mx-auto lg:gap-8 xl:gap-12 pt-[100px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Please log in to view your profile</h2>
          <NavLink 
            to="/login" 
            className="text-amber-400 hover:underline mt-4 inline-block"
          >
            Go to Login
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-screen-xl px-3 lg:px-10 mx-auto lg:gap-8 xl:gap-12 pt-[100px]">
        <div className="pt-[40px]">
          <div className="flex gap-4 items-center">
            <Link to="/">
              <img
                src="/images/Frame 67.svg"
                alt="Back to home"
                className="w-[35px] h-[35px]"
              />
            </Link>
            <h4 className="text-[#002221] text-[20px]">Profile Details</h4>
          </div>
          
          <div className="flex items-center gap-4 mt-6">
            <div 
              onClick={handleProfilePictureClick}
              className="cursor-pointer"
            >
              {adminInfo?.profilePicture ? (
                <img 
                  src={adminInfo.profilePicture} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center text-white text-2xl font-semibold">
                  {adminInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h4 className="text-[#000000] text-[25px] md:text-[30px]">
                {adminInfo?.name || 'User'}
              </h4>
              <p className="text-gray-600">{adminInfo?.email}</p>
              {adminInfo && (
                <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                  {adminInfo.role} {adminInfo.isSuperAdmin && '(Super Admin)'}
                </span>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="md:grid md:grid-cols-12 items-center">
            <div className="col-span-8">
              <div className="md:grid md:grid-cols-2 mt-10 md:gap-10 gap-6">
                <NavLink to="/edit-modal">
                  <div className="p-4 shadow-xl border rounded-[10px] hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2">
                      <BsPersonVcard className="w-10 h-10 text-amber-400" />
                      <h5 className="text-[#000000] font-[500] text-[20px]">
                        Personal Info
                      </h5>
                    </div>
                    <h5 className="text-[#000000] text-[15px] max-w-[300px] mt-2">
                      Provide Personal details and how we can reach you
                    </h5>
                  </div>
                </NavLink>

                {/* <NavLink to="/security">
                  <div className="p-4 shadow-xl border rounded-[10px] hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2">
                      <MdSecurity className="w-10 h-10 text-amber-400" />
                      <h5 className="text-[#000000] font-[500] text-[20px]">
                        Login & Security
                      </h5>
                    </div>
                    <h5 className="text-[#000000] text-[15px] max-w-[300px] mt-2">
                      Update your password and Secure your Account
                    </h5>
                  </div>
                </NavLink> */}

                <div className="p-4 shadow-xl border rounded-[10px] hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-2">
                    <MdSecurity className="w-10 h-10 text-amber-400" />
                    <h5 className="text-[#000000] font-[500] text-[20px]">
                      Admin Permissions
                    </h5>
                  </div>
                  <h5 className="text-[#000000] text-[15px] max-w-[300px] mt-2">
                    Manage your administrative permissions and access levels
                  </h5>
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Permissions: {adminInfo?.permissions?.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;