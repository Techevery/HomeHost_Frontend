import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom';
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import AdminSidebar from '../Sidebar/AdminSidebar';
import BreadcrumbsDisplay from '../Screens/BreadcrumbsDisplay';
import Header from './Header';

const InnerBody = () => {
  const navigate = useNavigate();

  const [openDrawer, setOpenDrawer] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);



   // Toggle Side Drawer
   const toggleDrawer = () => {
    setOpenDrawer((prev) => !prev);
    setShowSideBar((prev) => !prev);
  };
  // open side Drawer
  const open = () => {
    setOpenDrawer(true);
    setShowNotification(false);
  };
  return (
    <div className="flex w-full bg-[#E5E5E5] h-screen">
    {/* //sidebar */}
    <div
      className={`${
        openDrawer ? "w-0 xl:w-[310px]" : " pl-2 pt-7 pb-5 hidden lg:block"
      } relative left-0  top-0 h-screen`}
    >
      <AdminSidebar toggle={toggleDrawer} DrawerOpen={openDrawer} open={open} />
    </div>

    {/* background shadow for sidebar */}
    {(showSideBar || openDrawer) && (
      <div
        className={`w-full h-full block lg:hidden  bg-[#747380D1] opacity-[82%] z-[90] fixed top-0 left-0`}
        onClick={() => {
          setOpenDrawer(false);
          setShowSideBar(false);
        }}
      ></div>
    )}
    <div className="w-[100%] pl-2 h-screen overflow-y-scroll  ">
      <div className="pt-7 lg:pr-[100px] pr-[10px] fixed left-0  w-full backdrop-filter backdrop-blur-md ">
        <div className="flex gap-5 left-0 justify-between row-reverse items-center">
          <button
            onClick={() => {
              setShowNotification(false);
              setOpenDrawer(!openDrawer);
              setShowSideBar(!showSideBar);
            }}
            className="flex lg:hidden  items-center gap-3"
          >
            {openDrawer ? (
              <AiOutlineClose className="w-4 h-4 md:w-6 md:h-6 font-bold " />
            ) : (
              <AiOutlineMenu className="w-4 h-4 md:w-6 md:h-6  font-bold " />
            )}
            {/* <h1 className=" text-primary text-xl md:text-2xl">
              {formatedPath}
            </h1> */}
          </button>
          <div></div>
          <div className="bg-white rounded-[12px] relative">
          <Header />
          </div>
        </div>
      </div>
      {/* <div className='border-b border-[#E8E9ED] dark:border-darkaccent w-full fixed top-[75px]'></div> */}

      <div className=" lg:mx-[3%] mx-[1%]  h-[calc(100vh-75px)] pt-[75px]">
        <BreadcrumbsDisplay />

        <Outlet />
      </div>
    </div>
  </div>
  )
}

export default InnerBody