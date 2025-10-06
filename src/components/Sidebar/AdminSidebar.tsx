import React, { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { 
  AiOutlineClose, 
  AiOutlineMenu, 
  AiOutlineLogout, 
  AiOutlineUserAdd,
  AiOutlineDashboard,
  AiOutlineShopping,
  AiOutlineTeam,
  AiOutlineDollar,
  AiOutlinePicture,
  AiOutlineHome,
  AiOutlineSetting
} from 'react-icons/ai';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import useAdminStore from '../../stores/admin';
import RegisterAdminModal from '../Screens/Admin/DashBoardComponents/RegisterAdminModal/RegisterAdminModal';

type Props = {
  toggle: () => void;
  DrawerOpen: boolean;
  open: () => void;
};

const AdminSidebar = (props: Props) => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const { adminInfo, logout } = useAdminStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/admin-login';
  };

  const handleRegisterSuccess = () => {
    // Optional: Add any success actions here
    console.log('Admin registered successfully');
  };

  const menuItems = [
    {
      path: ['dashboard', 'home'],
      label: 'Dashboard',
      icon: <AiOutlineDashboard className="w-5 h-5" />,
      activeIcon: <AiOutlineDashboard className="w-5 h-5" />
    },
    {
      path: ['dashboard', 'booking'],
      label: 'Booking',
      icon: <AiOutlineShopping className="w-5 h-5" />,
      activeIcon: <AiOutlineShopping className="w-5 h-5" />
    },
    {
      path: ['dashboard', 'agent'],
      label: 'Agent Management',
      icon: <AiOutlineTeam className="w-5 h-5" />,
      activeIcon: <AiOutlineTeam className="w-5 h-5" />
    },
    {
      path: ['dashboard', 'payout'],
      label: 'Payout',
      icon: <AiOutlineDollar className="w-5 h-5" />,
      activeIcon: <AiOutlineDollar className="w-5 h-5" />
    },
    {
      path: ['dashboard', 'banner'],
      label: 'Banner Management',
      icon: <AiOutlinePicture className="w-5 h-5" />,
      activeIcon: <AiOutlinePicture className="w-5 h-5" />
    },
    {
      path: ['dashboard', 'list-of-apartment'],
      label: 'Apartment Listings',
      icon: <AiOutlineHome className="w-5 h-5" />,
      activeIcon: <AiOutlineHome className="w-5 h-5" />
    }
   
  ];

  const adminManagementItems = [
    {
      label: 'Register Admin',
      icon: <AiOutlineUserAdd className="w-5 h-5" />,
      onClick: () => setShowRegisterModal(true),
      show: adminInfo?.isSuperAdmin
    }
  ];

  const isActive = (path: string[]) => path.every(ai => pathnames.includes(ai));

  return (
    <>
      <aside
        className={`${
          props.DrawerOpen ? "" : "rounded-[20px]"
        } relative w-[280px] z-[100] bg-white border-r border-[#ECEDEF] h-full flex flex-col shadow-sm`}
      >
        {/* Header with Admin Info */}
        <div className="flex border-b border-gray-100 items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white">
         
          <button
            onClick={props.toggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            {props.DrawerOpen ? (
              <AiOutlineClose className="w-4 h-4" />
            ) : (
              <AiOutlineMenu className="w-4 h-4 hidden" />
            )}
          </button>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center py-5 border-b border-gray-100 bg-white">
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <AiOutlineHome className="w-5 h-5 text-white" />
            </div>
            <div>
              <img 
                src="/images/logo2.svg" 
                alt="HomeyHost" 
                className="h-6" 
              />
              <p className="text-xs text-gray-400 text-center mt-1">Admin Portal</p>
            </div>
          </NavLink>
        </div>

        {/* Quick Actions - Register Admin Only */}
        {adminInfo?.isSuperAdmin && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 mx-4 mt-4 rounded-xl p-4 shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <AiOutlineUserAdd className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">Add Team Member</h3>
              <p className="text-blue-100 text-xs mb-3">Register a new administrator</p>
              
              <button
                onClick={() => setShowRegisterModal(true)}
                className="w-full bg-white text-blue-600 rounded-lg py-2.5 px-4 hover:bg-blue-50 transition-all duration-200 group shadow-sm font-medium flex items-center justify-center space-x-2"
              >
                <AiOutlineUserAdd className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Register Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <h1 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 mb-3">
            Navigation
          </h1>

          <nav className="space-y-1 px-3">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={`/${item.path.join('/')}`}
                className="block"
              >
                <div
                  className={`${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  } flex items-center px-4 py-3 rounded-xl transition-all duration-200 group mx-2`}
                >
                  <div className={`${
                    isActive(item.path) 
                      ? "text-blue-600" 
                      : "text-gray-400 group-hover:text-gray-600"
                  } transition-colors`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm ml-3">{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Admin Management Section */}
          {adminInfo?.isSuperAdmin && (
            <>
              <h1 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-6 mb-3 mt-6">
                Administration
              </h1>

              <div className="space-y-1 px-3">
                {adminManagementItems.map((item, index) => (
                  item.show && (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className="w-full flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded-xl transition-all duration-200 group mx-2 border border-dashed border-gray-300 hover:border-blue-300"
                    >
                      <div className="text-gray-400 group-hover:text-blue-500 mr-3">
                        {item.icon}
                      </div>
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  )
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Profile & Logout Section */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex items-center space-x-3 mb-3 px-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
              {adminInfo?.profilePicture ? (
                <img
                  src={adminInfo.profilePicture}
                  alt={adminInfo.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {adminInfo?.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {adminInfo?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {adminInfo?.email || 'admin@example.com'}
              </p>
              {adminInfo?.isSuperAdmin && (
                <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                  Super Admin
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200 group shadow-sm"
          >
            <AiOutlineLogout className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Register Admin Modal */}
      <RegisterAdminModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
      />
    </>
  );
};

export default AdminSidebar;