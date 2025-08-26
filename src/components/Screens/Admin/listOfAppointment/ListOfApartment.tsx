import React, { useState, useEffect } from "react";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../../../UI/DeleteButton"; // Import DeleteButton
import EditButton from "../../../UI/EditButton"; // Import EditButton

interface Apartment {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: number;
  price: number;
  images: string[];
}

const ApartmentsList: React.FC = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "https://homey-host.onrender.com/api/v1/admin/list-apartments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setApartments(response.data.data.apartments);
        console.log(response.data);
      } catch (err) {
        setError("Failed to fetch apartments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  const handleDeleteSuccess = (apartmentId: string) => {
    setApartments((prev) => prev.filter((apartment) => apartment.id !== apartmentId));
    console.log(`Apartment with ID: ${apartmentId} deleted successfully.`);
  };

  const handleEditSuccess = () => {
    // Optionally refetch apartments or update the state
    console.log("Apartment edited successfully.");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 font-semibold">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apartment) => (
          <div
            key={apartment.id}
            className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200"
          >
            {apartment.images && apartment.images.length > 0 && (
              <img
                src={apartment.images[0]}
                alt={apartment.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {apartment.name}
              </h2>
              <p className="text-gray-700">Address: {apartment.address}</p>
              <p className="text-gray-700">Type: {apartment.type}</p>
              <p className="text-gray-700">Servicing: {apartment.servicing}</p>
              <p className="text-gray-700">Bedrooms: {apartment.bedroom}</p>
              <p className="text-gray-900 font-semibold">
                Price: ₦{apartment.price.toLocaleString()}
              </p>
              <div className="flex justify-between items-center mt-4">
                {/* Edit Button */}
                <EditButton
                  apartmentId={apartment.id}
                  onEditSuccess={handleEditSuccess}
                />
                {/* Delete Button */}
                <DeleteButton
                  apartmentId={apartment.id}
                  onDeleteSuccess={() => handleDeleteSuccess(apartment.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/Apartment")}
          className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ApartmentsList;