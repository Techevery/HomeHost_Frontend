import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './components/pages/Home';
import About from './components/pages/About';
import ViewProperties from './components/pages/viewProperties/ViewProperties';
import BookNow from './components/pages/bookNow/BookNow';
import ManageBooking from './components/pages/manageBooking/ManageBooking';
import ViewBooking from './components/pages/viewBooking.tsx/ViewBooking';
import DownloadReceipt from './components/pages/viewBooking.tsx/DownloadReceipt';
import LoginAgent from './components/pages/agent/LoginAgent';
import AddProperty from './components/pages/agent/AddApartment';
import AllProperty from './components/pages/agent/AllProperty';
import ViewAgentProperty from './components/pages/agent/ViewAgentProperty';
import BecomeAgent from './components/pages/agent/BecomeAgent';
import Profile from './components/pages/profile/Profile';
import PersonalInfo from './components/pages/profile/PersonalInfo';
import Security from './components/pages/profile/security/Security';
import Earnings from './components/pages/profile/earnings/Earnings';
import EarningsReport from './components/pages/profile/earnings/EarningsReport';
import AdminDashboard from './components/Screens/Admin/AdminDashboard';
import AdminBooking from './components/Screens/Admin/adminBooking/AdminBooking';
import AdminLogin from './components/Screens/Admin/auth/AdminLogin';
import Agent from './components/Screens/Admin/agent/AgentHome';
import ListOfApartment from './components/Screens/Admin/listOfAppointment/ListOfApartment';
import Payout from './components/Screens/Admin/payout/PayoutHome';

import Dashboard from './components/Screens/Dashboard';
import AgentHome from './components/Screens/Admin/agent/AgentHome';
import AddApartment from './components/Screens/Admin/listOfAppointment/AddApartment';
import Apartment from './components/pages/agent/AddApartment';
import Forgottenpassword from './components/pages/agent/forgottenpassword';
import EditModal from './components/pages/profile/EditModal';
import ContactUs from './components/shared/ContactUs';
import BannerList from './components/banner/BannerList';



function App() {
  const handleCancel = () => {
   
  };
  return (
    <div className="App">
    <Routes>
      <Route path="/" element={<Home />} />    
      <Route path="/about" element={<About />} />
      <Route path="/view-properties" element={<ViewProperties />} />
      <Route path="/book-apartment" element={<BookNow />} />
      <Route path="/manage-booking" element={<ManageBooking />} />
      <Route path="/view-booking" element={<ViewBooking />} />
      <Route path="/download-receipt" element={<DownloadReceipt />} />
      <Route path="/agent-login" element={<LoginAgent />} />
      <Route path="/add-property" element={<AddProperty />} />
      <Route path="/add-apartment" element={<AddApartment />} />
      <Route path="/apartment" element={<Apartment />} />
      <Route path="/agent-all-property" element={<AllProperty />} />
      <Route path="/agent-view-property" element={<ViewAgentProperty />} />
      <Route path="/become-agent" element={<BecomeAgent />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/personal-info" element={<PersonalInfo />} /> 
      <Route path="/security" element={<Security />} />
      <Route path="/earnings" element={<Earnings />} />
      <Route path="/earnings-report" element={<EarningsReport />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/forgotten-password" element={<Forgottenpassword />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/edit-modal" element={<EditModal handleCancel={handleCancel} />} />


      {/* Admin section */}
      <Route
      path="/dashboard"
      element={
        // <ProtectedRoute>
        <Dashboard />
        // </ProtectedRoute>
      }
      >
      <Route
        path="/dashboard"
        element={<Navigate to="/dashboard/home" replace />}
      />
      <Route path="/dashboard/home" element={<AdminDashboard />} />
      <Route path="booking" element={<AdminBooking />} />
      <Route path="agent" element={<AgentHome />} />
      <Route path="payout" element={<Payout />} />
      <Route path="list-of-apartment" element={<ListOfApartment />} />
      <Route path="add-apartment" element={<AddApartment />} />
      <Route path="Banner" element={<BannerList />} />
      </Route>
    </Routes>
</div>
  );
}

export default App;
