import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAdminStore from "../../stores/admin";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const { adminInfo, logout } = useAdminStore();
  
 

  const handleProfileToggle = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleEditProfile = () => {
    navigate("/personal-info");
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsProfileOpen(false);
  };

  // Get the first letter of the admin's name for avatar
  const getInitial = () => {
    return adminInfo?.name ? adminInfo.name.charAt(0).toUpperCase() : "A";
  };

  // Format role for display
  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
       
        

        {/* Profile Section */}
        <div className="relative">
          <div className="flex items-center space-x-4">
         

            {/* Admin Profile */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden md:block">
                <p className="font-medium text-gray-900 text-sm">
                  {adminInfo?.name || "Administrator"}
                </p>
                <p className="text-xs text-gray-500">
                  {adminInfo?.role ? formatRole(adminInfo.role) : "System Administrator"}
                </p>
              </div>
              
              <div className="relative">
                <button
                  onClick={handleProfileToggle}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {adminInfo?.profilePicture ? (
                    <img
                      src={adminInfo.profilePicture}
                      alt="Admin Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{getInitial()}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                      {/* Profile Summary */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-semibold text-gray-900 text-sm">
                          {adminInfo?.name || "Administrator"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {adminInfo?.email || "admin@example.com"}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {adminInfo?.role ? formatRole(adminInfo.role) : "Admin"}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleEditProfile}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile Settings
                        </button>
                        
                        
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;