import { Transition } from "@headlessui/react";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdMenu } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import useAdminStore from "../../stores/admin";
import useAgentStore from "../../stores/agentstore";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get state from stores
  const { 
    adminInfo, 
    isAuthenticated: isAdminAuthenticated, 
    logout: adminLogout 
  } = useAdminStore();
  
  const { 
    agentInfo, 
    isAuthenticated: isAgentAuthenticated, 
    logout: agentLogout 
  } = useAgentStore();

  const isAuthenticated = isAdminAuthenticated || isAgentAuthenticated;
  const userInfo = adminInfo || agentInfo;

  const handleLogout = () => {
    if (isAdminAuthenticated) {
      adminLogout();
    } else if (isAgentAuthenticated) {
      agentLogout();
    }
    navigate("/");
  };

  const handleManageBooking = () => {
    navigate("/manage-booking");
    setIsOpen(false);
  };

  return (
    <div>
      <nav className="bg-[#ffffff] fixed py-4 w-full z-20 top-0 left-0 shadow-md px-2 md:px-4 body-font font-poppins">
        <div className="flex justify-between md:justify-between items-center px-4 mx-auto lg:px-5">
          <NavLink to="/" className="">
            <img src="/images/logo2.svg" alt="location" className="" />
          </NavLink>

          {/* Move Manage Booking button to the left and style it */}
          <div className="hidden md:flex items-center space-x-6 flex-1 ml-10">
            <button
              onClick={() => navigate("/manage-booking")}
              className="px-4 py-2 rounded-md bg-amber-400 text-white font-semibold shadow hover:bg-amber-500 transition-colors duration-200 text-sm"
              style={{ marginRight: "auto" }}
            >
              Manage Booking
            </button>
          </div>

          <div className="md:hidden block">
            <div className="md:order-2 pl-44 md:pl-1">
              <button
                onClick={() => setIsOpen(!isOpen)}
                data-collapse-toggle="mobile-menu-2"
                type="button"
                className="inline-flex items-center p-2 ml-1 text-sm rounded-lg md:hidden hover:bg-gray-100"
                aria-controls="mobile-menu-2"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isOpen ? (
                  <MdMenu className="w-7 h-7 text-amber-400" />
                ) : (
                  <IoMdClose className="w-7 h-7 text-amber-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <NavLink to="/profile">
                  {userInfo?.profilePicture ? (
                    <img 
                      src={userInfo.profilePicture} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-white font-semibold">
                      {userInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </NavLink>
              </>
            ) : (
              <>
                {/* Login/Register buttons can go here */}
              </>
            )}
          </div>
        </div>

        <Transition
          show={isOpen}
          enter="transition ease-out duration-500 transform"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-400 transform"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
          className="absolute top-20 right-0 mt-20 mr-4 w-[200px]"
        >
          {(ref) => (
            <div className="lg:hidden bg-amber-400 mt-3" id="mobile-menu">
              <div ref={ref} className="pt-6 pb-3 space-y-1">
                <NavLink
                  to="/About"
                  onClick={() => setIsOpen(!isOpen)}
                  className="block text-[#616161] pl-3 font-medium hover:bg-gray-100"
                >
                  About
                </NavLink>
                <hr className="pb-3" />

                <NavLink
                  to="/Contact-us"
                  onClick={() => setIsOpen(!isOpen)}
                  className="block text-[#616161] pl-3 font-medium hover:bg-gray-100"
                >
                  Contact Us
                </NavLink>
                <hr className="pb-3" />

                <NavLink
                  to="/book-now"
                  onClick={() => setIsOpen(!isOpen)}
                  className="block text-[#616161] pl-3 font-medium hover:bg-gray-100"
                >
                  Book Now
                </NavLink>
                
                {/* Manage Booking Button */}
                <hr className="pb-3" />
                <button
                  onClick={handleManageBooking}
                  className="block w-full text-left px-4 py-2 rounded-md bg-white text-amber-500 font-semibold shadow hover:bg-gray-100 transition-colors duration-200"
                >
                  Manage Booking
                </button>
                
                {isAuthenticated && (
                  <>
                    <hr className="pb-3" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="block text-[#616161] pl-3 font-medium hover:bg-gray-100 w-full text-left"
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </Transition>
      </nav>
    </div>
  );
};

export default Navbar;