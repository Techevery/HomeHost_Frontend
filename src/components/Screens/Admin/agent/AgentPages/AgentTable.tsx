import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";

const API_ENDPOINT = 'https://homey-host.onrender.com/api/v1/admin/list-agents';

const getToken = () => {
  return localStorage.getItem("token");
};

interface AgentData {
  id: string;
  account: string;
  email: string;
  front_id?: string;
  front_id_status?: boolean;
  back_id?: string;
  back_id_status?: boolean;
  profit?: string;
  shopperData?: boolean;
  userData?: { notificationID?: string };
  createdAt: string;
  name: string;
  phone_number: string;
  slug: string;
  status: string;
}

const AgentTable: React.FC = () => {
  const [data, setData] = useState<AgentData[]>([]);
  const [display, setDisplay] = useState(false);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(API_ENDPOINT, {
          headers: { Authorization: `Bearer ${token}` },
        });
       
    
        setData(response?.data.data.agentDataWithoutPassword||[]);
        setTotalAgents(response.data.pagination.totalAgents);
        setTotalPages(response.data.pagination.totalPages);
        setCurrentPage(response.data.pagination.currentPage);
        
        setItemsPerPage(response.data.pagination.itemsPerPage);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setDisplay(false);
  };

  const handleApproveChange = (
    id: string,
    notificationID: string | undefined,
    statusField: keyof AgentData,
    idField: keyof AgentData,
    newStatus: boolean
  ) => {
    console.log("Handle approval change", {
      id,
      notificationID,
      statusField,
      idField,
      newStatus,
    });
    // API logic to handle status change can be added here
  };

  const defaultMaterialTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Implement server-side pagination fetch here if needed
    }
  };

  return (
    <div className="overflow-hidden">
      <div className="py-[10px]">
        <h4 className="text-[20px] text-[#958F8F]">Agent Request</h4>
      </div>
      <ThemeProvider theme={defaultMaterialTheme}>
        <div className="w-full border rounded-[15px] p-3">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg font-semibold">Loading...</div>
            </div>
          ) : (
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone Number</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created At</th>
                  <th className="py-2">Agent Url</th>
                  <th className="py-2">Id Card</th>
                  <th className="py-2">Passport</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((agent) => (
                  <tr key={agent.id}>
                    <td className="border px-4 py-2">{agent.name}</td>
                    <td className="border px-4 py-2">{agent.email}</td>
                    <td className="border px-4 py-2">{agent.phone_number}</td>
                    <td className="border px-4 py-2">{agent.status}</td>
                    <td className="border px-4 py-2">{new Date(agent.createdAt).toLocaleString()}</td>
                    <td className="border px-4 py-2">{agent.slug}</td>
                    <td className="border px-4 py-2">
                      <div className="flex text-sm gap-2 items-center">
                        <div className="cursor-pointer text-blue-600">See Upload</div>
                        <input
                          checked={!!agent.front_id_status}
                          type="checkbox"
                          onChange={() =>
                            handleApproveChange(
                              agent.id,
                              agent.userData?.notificationID,
                              "front_id_status",
                              "front_id",
                              !agent.front_id_status
                            )
                          }
                          className="w-4 h-4"
                        />
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex text-sm gap-2 items-center">
                        <div className="cursor-pointer text-blue-600">See Upload</div>
                        <input
                          checked={!!agent.back_id_status}
                          type="checkbox"
                          onChange={() =>
                            handleApproveChange(
                              agent.id,
                              agent.userData?.notificationID,
                              "back_id_status",
                              "back_id",
                              !agent.back_id_status
                            )
                          }
                          className="w-4 h-4"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </ThemeProvider>

      {display && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Approval</h2>
            <p>Are you sure you want to approve this request?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleCancel}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-green-500 text-white rounded">Approve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentTable;
