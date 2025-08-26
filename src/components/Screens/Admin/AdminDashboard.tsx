import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaQuestionCircle } from "react-icons/fa";
import AdminSidebar from '../../Sidebar/AdminSidebar';
import TotalNumbers from './DashBoardComponents/TotalNumbers';
import AvailableProperty from './DashBoardComponents/AvailableProperty';
import BookingDetails from './DashBoardComponents/BookingDetails';

const AdminDashboard = () => {


  const [collapseShow, setCollapseShow] = React.useState("hidden");

  return (
    <div className=''>
   {/* <AdminSidebar /> */}
   <div className="flex flex-col gap-4">
<TotalNumbers />
<AvailableProperty />
<BookingDetails />

</div>
  </div>
  )
}

export default AdminDashboard