import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FaQuestionCircle } from "react-icons/fa";
import { RiHome6Line } from "react-icons/ri";
import { MdFormatListBulleted, MdOutlinePayments } from 'react-icons/md';
import { BsPersonFillCheck } from 'react-icons/bs';
import { PiBuildingApartmentThin } from "react-icons/pi";
import { AiOutlineClose, AiOutlineMenu } from 'react-icons/ai';
import dashboard from "../../assets/dashboard/homeIcon.svg";
import booking from "../../assets/dashboard/bookingIcon.svg";
import agent from "../../assets/dashboard/agentIcon.svg";
import payout from "../../assets/dashboard/payoutIcon.svg";
import list from "../../assets/dashboard/listIcon.svg";

type Props = {
  toggle: () => void;
  DrawerOpen: boolean;
  open: () => void;
};

const AdminSidebar = (props: Props) => {
  const url = useLocation();
  const { pathname } = url;
  const pathnames = pathname.split("/").filter((x) => x);
  const [collapseShow, setCollapseShow] = React.useState("hidden");

  return (
    <>
       <aside
      className={`${
        props.DrawerOpen ? "" : "rounded-[20px]"
      } relative  w-[300px] z-[100]  bg-white border-r border-[#ECEDEF] h-full`}
    >
      <div className="flex border-b items-center justify-between px-2 md:px-4">
        
        <div></div>
        <div className="flex justify-center  mx-[14.5px] py-4">
        <NavLink to="/" className="">
          <img src="/images/logo2.svg" alt="location" className="md:w-[60%] w-[40%]" />
        </NavLink>
        </div>

        <button
          onClick={() => {
            // setShowInfoTag(false)
            props.toggle();
          }}
          className=""
        >
          {props.DrawerOpen ? (
            <AiOutlineClose className="w-4 h-4 md:w-6 md:h-6 font-bold " />
          ) : (
            <AiOutlineMenu className="w-4 h-4 md:w-6 md:h-6  font-bold hidden " />
          )}
        </button>
      </div>

      <h1 className=" text-md pt-12 pl-12 text-[#B0B0B0] font-semibold">MAIN MENU</h1>
 
      <div className="mt-7">
        <div className="">
          <div>
            <Link to="/dashboard/home" className="relative gap-1  ">
              {/* {['dashboard', 'home'].every(ai => pathnames.includes(ai)) && <div className="absolute top-0 left-0 h-full rounded-r-[10px] border-[3px] border-primary"></div>} */}
              <div
                className={`${
                  ["dashboard", "home"].every((ai) => pathnames.includes(ai))
                    ? "bg-[#EBF2FF] text-[#000000]"
                    : "bg-white text-[#958F8F]"
                } gap-x-1 pl-12  flex  items-center  rounded-[15px] py-[10px] `}
              >
                <img
                  src={
                    ["dashboard", "home"].every((ai) => pathnames.includes(ai))
                      ? dashboard
                      : dashboard
                  }
                  alt="Logo"
                  className=""
                />

                <h5 className="text-[20px] font-[500]   ">Dashboard</h5>
              </div>
            </Link>
          </div>
        </div>

    
        <div className="mt-3">
          <div>
            <Link to="/dashboard/booking" className="relative gap-1 ">
              {/* {['dashboard', 'home'].every(ai => pathnames.includes(ai)) && <div className="absolute top-0 left-0 h-full rounded-r-[10px] border-[3px] border-primary"></div>} */}
              <div
                className={`${
                  ["dashboard", "booking"].every((ai) =>
                    pathnames.includes(ai)
                  )
                  ? "bg-[#EBF2FF] text-[#000000]"
                  : "bg-white text-[#958F8F]"
              } gap-x-1 pl-12  flex  items-center  rounded-[15px] py-[10px] `}
              >
                <img
                  src={
                    ["dashboard", "booking"].every((ai) =>
                      pathnames.includes(ai)
                    )
                      ? booking
                      : booking
                  }
                  alt="Logo"
                  className=""
                />

                <h5 className="text-[20px] font-[500]   ">Booking</h5>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-3">
          <div>
            <Link to="/dashboard/agent" className="relative gap-1 ">
              {/* {['dashboard', 'home'].every(ai => pathnames.includes(ai)) && <div className="absolute top-0 left-0 h-full rounded-r-[10px] border-[3px] border-primary"></div>} */}
              <div
                className={`${
                  ["dashboard", "agent"].every((ai) =>
                    pathnames.includes(ai)
                  )
                  ? "bg-[#EBF2FF] text-[#000000]"
                  : "bg-white text-[#958F8F]"
              } gap-x-1 pl-12  flex  items-center  rounded-[15px] py-[10px] `}
              >
                <img
                  src={
                    ["dashboard", "agent"].every((ai) =>
                      pathnames.includes(ai)
                    )
                      ? agent
                      : agent
                  }
                  alt="Logo"
                  className=""
                />

                <h5 className="text-[20px] font-[500]   ">
                  {" "}
                Agent
                </h5>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-3">
          <div>
            <Link to="/dashboard/payout" className="relative gap-1 ">
              {/* {['dashboard', 'home'].every(ai => pathnames.includes(ai)) && <div className="absolute top-0 left-0 h-full rounded-r-[10px] border-[3px] border-primary"></div>} */}
              <div
                className={`${
                  ["dashboard", "payout"].every((ai) =>
                    pathnames.includes(ai)
                  )
                  ? "bg-[#EBF2FF] text-[#000000]"
                  : "bg-white text-[#958F8F]"
              } gap-x-1 pl-12  flex  items-center  rounded-[15px] py-[10px] `}
              >
                <img
                  src={
                    ["dashboard", "payout"].every((ai) =>
                      pathnames.includes(ai)
                    )
                      ? payout
                      : payout
                  }
                  alt="Logo"
                  className=""
                />

                <h5 className="text-[20px] font-[500]   ">
                  {" "}
           Payout
                </h5>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-3">
          <div>
            <Link to="/dashboard/list-of-apartment" className="relative gap-1 ">
              {/* {['dashboard', 'home'].every(ai => pathnames.includes(ai)) && <div className="absolute top-0 left-0 h-full rounded-r-[10px] border-[3px] border-primary"></div>} */}
              <div
                className={`${
                  ["dashboard", "list-of-apartment"].every((ai) =>
                    pathnames.includes(ai)
                  )
                  ? "bg-[#EBF2FF] text-[#000000]"
                  : "bg-white text-[#958F8F]"
              } gap-x-1 pl-12  flex  items-center  rounded-[15px] py-[10px] `}
              >
                <img
                  src={
                    ["dashboard", "list-of-apartment"].every((ai) =>
                      pathnames.includes(ai)
                    )
                      ? list
                      : list
                  }
                  alt="Logo"
                  className=""
                />

                <h5 className="text-[20px] font-[500]   ">
                  {" "}
                  List Of Apartment
                </h5>
              </div>
            </Link>
          </div>
        </div>

  
      </div>
    </aside>
 
    {/* <div className='p-3'>
    <nav className="bg-white m-3 rounded-2xl md:left-0 md:block md:fixed md:top-0 md:bottom-0 md:overflow-y-auto md:flex-row md:flex-nowrap md:overflow-hidden shadow-xl  flex flex-wrap items-center justify-between relative md:w-[300px] z-10 py-4 px-6">
      <div className="md:flex-col md:items-stretch md:min-h-full md:flex-nowrap px-0 flex flex-wrap items-center justify-between w-full mx-auto">
     
        <button
          className="cursor-pointer  opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
          type="button"
          onClick={() => setCollapseShow("bg-[#000000] m-2 py-3 px-6")}
        >
          <b className="fas fa-bars"> ≡ </b>
        </button>
     
        <ul className="md:hidden items-center flex flex-wrap list-none">
          <li className="inline-block relative">
      </li>
          <li className="inline-block relative">
       </li>
        </ul>
      <div
          className={
            "bg-white md:flex md:flex-col md:items-stretch md:opacity-100 md:relative md:mt-4 md:shadow-none shadow absolute top-0 left-0 right-0 z-40 overflow-y-auto overflow-x-hidden h-auto items-center flex-1 rounded " +
            collapseShow
          }
        >
     
          <div className=" md:min-w-full md:hidden block pb-4 mb-4 border-b border-solid border-blueGray-200">
            <div className="flex flex-wrap">

              <div className="w-6/12 flex justify-end">
                <button
                  type="button"
                  className="cursor-pointer  opacity-50 md:hidden px-3 py-1 text-xl leading-none bg-transparent rounded border border-solid border-transparent"
                  onClick={() => setCollapseShow("hidden")}
                >
                  <b className="fas fa-times"> X </b>
                </button>
              </div>
            </div>
          </div>
    


          <div className=" py-2">
    
            <div>
            <NavLink to="/" className="">
          <img src="/images/logo2.svg" alt="location" className="md:w-[60%] w-[40%]" />
        </NavLink>
      
            </div>
            <h1 className=" text-md pt-12 text-[#B0B0B0] font-semibold">MAIN MENU</h1>

       
          </div>


          <ul className="md:flex-col md:min-w-full flex flex-col list-none md:mt-6 mt-6">
          <li className="items-center">
              <NavLink
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#EBF2FF', paddingLeft: "12px", borderRadius: "12px", fontSize: "18px", fontWeight: '800' } : { color: '#000000', fontSize: "18px", fontWeight: '400' }
                }
                className={
                  "text-sm  py-2 pl-3 font-light flex gap-2  items-center" +
                  (window.location.href.indexOf("/admin-dashboard") !== -1
                    ? "text-[#000000] hover:text-lightBlue-600"
                    : "text-[#000000] hover:text-blueGray-500")
                }
                to="/admin-dashboard"
              >
            <RiHome6Line />
                <p>Dashboard</p>
              </NavLink>
            </li> 

               <li className="items-center mt-3">
              <NavLink
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#EBF2FF', paddingLeft: "12px", borderRadius: "12px",fontSize: "18px", fontWeight: '800' } : { color: '#000000', fontSize: "18px", fontWeight: '400' }
                }
                className={
                  "text-sm  py-2 pl-3 font-light flex gap-2 items-center" +
                  (window.location.href.indexOf("/admin/booking") !== -1
                    ? "text-[#000000] hover:text-lightBlue-600"
                    : "text-[#000000] hover:text-blueGray-500")
                }
                to="/admin/booking"
              >
             <MdFormatListBulleted />
                <p>Booking</p>
              </NavLink>
            </li> 

            <li className="items-center mt-3">
              <NavLink
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#EBF2FF', paddingLeft: "12px", borderRadius: "12px",fontSize: "18px", fontWeight: '800' } : { color: '#000000', fontSize: "18px", fontWeight: '400' }
                }
                className={
                  "text-sm  py-2 pl-3 font-light flex gap-2 items-center" +
                  (window.location.href.indexOf("/admin/agent") !== -1
                    ? "text-[#000000] hover:text-lightBlue-600"
                    : "text-[#000000] hover:text-blueGray-500")
                }
                to="/admin/agent"
              >
             <BsPersonFillCheck />
                <p>Agent</p>
              </NavLink>
            </li> 

            <li className="items-center mt-3">
              <NavLink
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#EBF2FF', paddingLeft: "12px", borderRadius: "12px",fontSize: "18px", fontWeight: '800' } : { color: '#000000', fontSize: "18px", fontWeight: '400' }
                }
                className={
                  "text-sm  py-2 pl-3 font-light flex gap-2 items-center" +
                  (window.location.href.indexOf("/admin/payout") !== -1
                    ? "text-[#000000] hover:text-lightBlue-600"
                    : "text-white hover:text-blueGray-500")
                }
                to="/admin/payout"
              >
           <MdOutlinePayments />
                <p>Payout</p>
              </NavLink>
            </li> 

            <li className="items-center mt-3">
              <NavLink
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#EBF2FF', paddingLeft: "12px", borderRadius: "12px",fontSize: "18px", fontWeight: '800' } : { color: '#000000', fontSize: "18px", fontWeight: '400' }
                }
                className={
                  "text-sm  py-2 pl-3 font-light flex gap-2 items-center" +
                  (window.location.href.indexOf("/admin/list-of-apartment") !== -1
                    ? "text-[#000000] hover:text-lightBlue-600"
                    : "text-white hover:text-blueGray-500")
                }
                to="/admin/list-of-apartment"
              >
             <PiBuildingApartmentThin />
                <p>List of Apartment</p>
              </NavLink>
            </li> 
           
      
            <li className="flex justify-start py-10" style={{ cursor: 'pointer' }} 
      
            >

              <svg width="20" className="mr-2" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.3337 11.3334V9.66675H5.83366V7.16675L1.66699 10.5001L5.83366 13.8334V11.3334H13.3337Z" fill="white" />
                <path d="M16.6667 3H9.16667C8.2475 3 7.5 3.7475 7.5 4.66667V8H9.16667V4.66667H16.6667V16.3333H9.16667V13H7.5V16.3333C7.5 17.2525 8.2475 18 9.16667 18H16.6667C17.5858 18 18.3333 17.2525 18.3333 16.3333V4.66667C18.3333 3.7475 17.5858 3 16.6667 3Z" fill="white" />
              </svg>

              <span className=" ">Logout</span>

            </li>
          </ul>











        </div>
      </div>
    </nav>
  </div> */}
  </>
  )
}

export default AdminSidebar