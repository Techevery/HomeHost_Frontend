import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import person from "../../assets/Mask group.svg";

// Define the type for an apartment
interface Apartment {
  id: string;
  name: string;
  address: string;
  price: number;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState(false);
  const [search, setSearch] = useState("");
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);

  const [values, setValues] = useState({
    showLogOut: false,
  });

  const handleCancel = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDisplay(false);
    setValues({
      showLogOut: false,
    });
  };

  const handleSearch = async () => {
    if (!search.trim()) return; // Prevent empty search
    setLoading(true);
    try {
      const response = await axios.get(
        `https://homey-host.onrender.com/api/v1/admin/search-apartment?searchTerm=akobo=${search}`
      );
      if (response.status === 200) {
        setApartments(response.data.data.apartments);
      }
    } catch (error) {
      console.error("Error fetching apartments:", error);
      setApartments([]); // Clear results on error
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = () => {
    setOpen((prev) => !prev);
  };

  const handleEditProfile = () => {
    navigate("/personal-info");
  };

  return (
    <div className="bg-white rounded-[12px] w-full px-3">
      <div className="flex justify-between items-center gap-7">
        {/* Search Bar */}
        <div className="relative w-auto md:w-[200px] lg:w-[500px] w-9/12">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="search-dropdown"
            className="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type Keyword here..."
          />
          <button
            type="button"
            onClick={handleSearch}
            className="absolute top-0 right-0 p-2.5 text-sm font-medium text-white rounded-r-lg border border-blue-200"
            style={{ backgroundColor: "#2196F3" }}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
            <span className="sr-only">Search</span>
          </button>
        </div>

        {/* Profile Picture */}
        <div className="relative">
          <img
            src={person}
            alt="Admin Profile"
            className="w-[60px] h-[60px] rounded-full cursor-pointer"
            onClick={handleProfileClick}
          />
          {open && (
            <div className="absolute top-[50px] right-0 bg-white shadow-md rounded-lg p-2 z-10">
              <button
                className="text-sm text-black-500 hover:underline"
                onClick={handleEditProfile}
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="mt-4">
        {loading && <p>Loading...</p>}
        {!loading && apartments.length > 0 && (
          <div>
            <h3 className="text-lg font-bold">Search Results:</h3>
            <ul>
              {apartments.map((apartment) => (
                <li
                  key={apartment.id}
                  className="border-b py-2 cursor-pointer"
                  onClick={() => navigate(`/apartment/${apartment.id}`)}
                >
                  <h4 className="font-semibold">{apartment.name}</h4>
                  <p>{apartment.address}</p>
                  <p>Price: ₦{apartment.price}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {!loading && apartments.length === 0 && search && (
          <p>No apartments found for "{search}".</p>
        )}
      </div>

      <div
        className={`${
          display && "w-full h-full bg-[#747380D1] opacity-[82%] z-[1000]"
        } fixed top-0 left-0`}
        onClick={(e) => handleCancel(e)}
      ></div>

      {display && (
        <div className="fixed top-1/2 left-1/2 translate-x-[-50%] translate-y-[-50%] shadow-[0_4px_10px_rgba(0,0,0,0.1)] bg-white z-[200] rounded-[10px] overflow-hidden h-fit">
          {/* {showDefaultConnectors()} */}
        </div>
      )}
    </div>
  );
};

export default Header;