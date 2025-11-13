import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import useAdminStore from "../../../../../stores/admin"; 
import { toast } from "react-toastify";

const BanAgentTable = () => {
  const { listAgents, suspendAgent, isLoading } = useAdminStore();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await listAgents(1, 100); // Get all agents
      if (response?.data?.agents) {
        setAgents(response.data.agents);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendAgent = async (agentId: string, currentSuspendedStatus: boolean) => {
    try {
      const response = await suspendAgent(agentId);
      if (response?.message) {
        toast.success(response.message);
        
        // Update local state to reflect the change
        setAgents(prevAgents => 
          prevAgents.map(agent => 
            agent.id === agentId 
              ? { ...agent, suspended: !currentSuspendedStatus }
              : agent
          )
        );
      }
    } catch (error: any) {
      console.error("Error suspending agent:", error);
      toast.error(error.response?.data?.message || "Failed to suspend agent");
    }
  };

  const handleCustomerComplaintToggle = async (agentId: string, hasComplaint: boolean) => {
    // This would typically call an endpoint to update customer complaint status
    // For now, we'll just show a toast
    const action = hasComplaint ? "removed from" : "added to";
    toast.info(`Agent ${action} customer complaints list`);
    
    // Update local state
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, hasCustomerComplaint: !hasComplaint }
          : agent
      )
    );
  };

  const handleAvailabilityToggle = async (agentId: string, isAvailable: boolean) => {
    // This would typically call an endpoint to update availability status
    // For now, we'll just show a toast
    const status = isAvailable ? "marked as unavailable" : "marked as available";
    toast.info(`Agent ${status}`);
    
    // Update local state
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, isAvailable: !isAvailable }
          : agent
      )
    );
  };

  const handleStrikeToggle = async (agentId: string, hasStrike: boolean) => {
    // This would typically call an endpoint to update strike status
    // For now, we'll just show a toast
    const action = hasStrike ? "removed from" : "added to";
    toast.info(`Agent ${action} strike list`);
    
    // Update local state
    setAgents(prevAgents => 
      prevAgents.map(agent => 
        agent.id === agentId 
          ? { ...agent, hasStrike: !hasStrike }
          : agent
      )
    );
  };

  const COLUMNS = [
    {
      title: "Personal URL",
      field: "personal_url",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className='w-full whitespace-nowrap'>
          {rowData.slug ? `${process.env.REACT_APP_AGENT_BASE_URL || 'https://homeyhost.ng'}/shortlet/${rowData.slug}` : 'N/A'}
        </div>
      ),
    },
    {
      title: "Agent Name",
      field: "name",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="w-full whitespace-nowrap">{rowData.name}</div>
      ),
    },
    {
      title: "Email",
      field: "email",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="w-full whitespace-nowrap">{rowData.email}</div>
      ),
    },
    {
      title: "Status",
      field: "status",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="w-full whitespace-nowrap">
          <span className={`px-2 py-1 rounded-full text-xs ${
            rowData.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 
            rowData.status === 'UNVERIFIED' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {rowData.status || 'PENDING'}
          </span>
        </div>
      ),
    },
    {
      title: "Customer Complains",
      field: "customer_complaints",
      cellStyle: { paddingLeft: "2%" },
      render: (rowData: any) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={rowData.hasCustomerComplaint || false}
            onChange={() => handleCustomerComplaintToggle(rowData.id, rowData.hasCustomerComplaint || false)}
            className="w-4 h-4 text-white checked:bg-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
          />
        </div>
      ),
    },
    {
      title: "Not Always Available",
      field: "availability",
      cellStyle: { minWidth: "260px" },
      render: (rowData: any) => (
        <div className="flex whitespace-nowrap justify-center">
          <input
            type="checkbox"
            checked={!rowData.isAvailable || false}
            onChange={() => handleAvailabilityToggle(rowData.id, !rowData.isAvailable || false)}
            className="w-4 h-4 text-white checked:bg-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
          />
        </div>
      ),
    },
    {
      title: "Strikes",
      field: "strikes",
      render: (rowData: any) => (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={rowData.hasStrike || false}
            onChange={() => handleStrikeToggle(rowData.id, rowData.hasStrike || false)}
            className="w-4 h-4 text-white checked:bg-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
          />
        </div>
      ),
    },
    {
      title: "Suspend Agent",
      field: "suspended",
      cellStyle: { borderBottom: 0, paddingLeft: "2%" },
      render: (rowData: any) => (
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={rowData.suspended || false}
                onChange={() => handleSuspendAgent(rowData.id, rowData.suspended || false)}
                className="hidden"
              />
              <div className={`toggle__line w-12 h-6 rounded-full shadow-inner ${
                rowData.suspended ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <div className={`toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 ${
                rowData.suspended ? 'left-6' : 'left-0'
              }`}></div>
            </div>
          </label>
        </div>
      ),
    },
  ];

  const defaultMaterialTheme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return (
    <div className="overflow-hidden">
      <div className="py-[10px]">
        <h4 className="text-[20px] text-[#958F8F]">Agent Management</h4>
      </div>
      
      <ThemeProvider theme={defaultMaterialTheme}>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />

        <div className="w-full border rounded-bl-none p-3 rounded-[15px]">
          <MaterialTable
            components={{
              Container: (props) => <Paper {...props} elevation={0} />,
            }}
            columns={COLUMNS}
            data={agents}
            isLoading={loading || isLoading}
            title="Agent Management"
            options={{
              search: true,
              showTitle: true,
              toolbar: true,
              rowStyle: {
                color: "#474E70",
                backgroundColor: "transparent",
                fontWeight: 400,
                fontSize: "16px",
                padding: "5px",
              },
              headerStyle: {
                color: "#000",
                fontWeight: 600,
                fontSize: "16px",
                backgroundColor: "#F7F7F7",
                border: 0,
                paddingLeft: "2%",
              },
              searchFieldStyle: {
                border: "0px",
                borderRadius: "0px",
                borderBottom: "1px solid #E8E9ED",
                width: "192px",
                height: "36px",
                backgroundColor: "transparent",
              },
              searchFieldVariant: "standard",
              actionsColumnIndex: -1,
              actionsCellStyle: {
                border: "0",
                paddingLeft: "2%",
              },
              paging: true,
              pageSize: 10,
              pageSizeOptions: [5, 10, 20],
              minBodyHeight: "400px",
            }}
          />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default BanAgentTable;