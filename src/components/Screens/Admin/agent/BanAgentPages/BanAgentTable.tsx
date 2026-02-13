import MaterialTable from "material-table";
import React, { useEffect, useState } from "react";
import { Paper } from "@material-ui/core";
import { ThemeProvider, createTheme } from "@mui/material";
import useAdminStore from "../../../../../stores/admin"; 
import { toast } from "react-toastify";

const BanAgentTable = () => {
  const { listAgents, getAgentManagement, suspendAgent, isLoading, agentSuspensionStates, updateAgentSuspensionState } = useAdminStore();
  const [agents, setAgents] = useState<any[]>([]);
  const [verifiedAgents, setVerifiedAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifiedAgentsWithManagement();
  }, []);

  useEffect(() => {
 
    const agentsWithPersistedState = agents.map(agent => ({
      ...agent,
   
      suspended: agentSuspensionStates[agent.id] !== undefined 
        ? agentSuspensionStates[agent.id] 
        : agent.suspended || false
    }));
    
    const verified = agentsWithPersistedState.filter(agent => agent.status === 'VERIFIED');
    setVerifiedAgents(verified);
  }, [agents, agentSuspensionStates]);

  const fetchVerifiedAgentsWithManagement = async () => {
    try {
      setLoading(true);
      
      
      const listResponse = await listAgents(1, 100);
      const allAgents = listResponse?.data?.agents || [];
      
     
      const verifiedAgentIds = allAgents
        .filter((agent: any) => agent.status === 'VERIFIED')
        .map((agent: any) => agent.id);

      if (verifiedAgentIds.length === 0) {
        setAgents([]);
        setLoading(false);
        return;
      }

      const agentPromises = verifiedAgentIds.map(async (id: string) => {
        try {
          const managementData = await getAgentManagement(id);
      
          return managementData?.info || null;
        } catch (error) {
          console.error(`Failed to fetch management data for agent ${id}:`, error);
          return null;
        }
      });

      const agentResults = await Promise.all(agentPromises);
      
    
      const validAgents = agentResults.filter(agent => agent !== null);
      setAgents(validAgents);
      
    } catch (error) {
      console.error("Error fetching verified agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendAgent = async (agentId: string, currentSuspendedStatus: boolean) => {
    try {
      const response = await suspendAgent(agentId);

      const newSuspendedStatus = response?.data?.suspended;
      
      if (typeof newSuspendedStatus === 'boolean') {
        toast.success(response.message);
        
     
        updateAgentSuspensionState(agentId, newSuspendedStatus);
        
      
        setAgents(prevAgents => 
          prevAgents.map(agent => 
            agent.id === agentId 
              ? { ...agent, suspended: newSuspendedStatus }
              : agent
          )
        );
      } else {
  
        const isSuspended = !currentSuspendedStatus;
        toast.success(response?.message || (isSuspended ? "Agent suspended" : "Agent unsuspended"));
        
        updateAgentSuspensionState(agentId, isSuspended);
        
  
        setAgents(prevAgents => 
          prevAgents.map(agent => 
            agent.id === agentId 
              ? { ...agent, suspended: isSuspended }
              : agent
          )
        );
      }
    } catch (error: any) {
      console.error("Error suspending agent:", error);
      toast.error(error.response?.data?.message || "Failed to suspend agent");
    }
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
              <div className={`toggle__line w-12 h-6 rounded-full shadow-inner transition-colors duration-300 ${
                rowData.suspended ? 'bg-red-500' : 'bg-gray-300'
              }`}></div>
              <div className={`toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 transition-all duration-300 ${
                rowData.suspended ? 'left-6' : 'left-0'
              }`}></div>
            </div>
            <span className="ml-2 text-sm">
              {rowData.suspended ? 'Suspended' : 'Active'}
            </span>
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
      <div className="py-[10px] flex justify-between items-center">
        <p className="text-sm text-gray-500 mt-1">
          Showing {verifiedAgents.length} verified agent(s)
        </p>
        <button
          onClick={fetchVerifiedAgentsWithManagement}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
        >
          Refresh
        </button>
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
            data={verifiedAgents}
            isLoading={loading || isLoading}
            title="Verified Agent Management"
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