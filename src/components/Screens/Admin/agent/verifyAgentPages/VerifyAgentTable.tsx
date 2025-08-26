import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Switch,
    CircularProgress,
    Tooltip,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material";

interface Agent {
    id: string;
    name: string;
    slug: string;
    phone_number: number;
    email: string;
    apartment_managed: string;
    status: string;
}

const VerifyAgentTable: React.FC = () => {
    const authToken = localStorage.getItem("token");
    const [data, setData] = useState<Agent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingAgents, setLoadingAgents] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (!authToken) return;

        const fetchAgents = async () => {
            try {
                const response = await axios.get(
                    "https://homey-host.onrender.com/api/v1/admin/list-agents",
                    {
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                setData(response?.data?.data?.agentDataWithoutPassword || []);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching agents:", error);
                setError("Failed to fetch agents. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAgents();
    }, [authToken]);

    const handleToggle = async (id: string, status: string) => {
        const newStatus = status === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
        const payload = { agentId: id, status: newStatus };
        setLoadingAgents(prev => ({ ...prev, [id]: true }));
        try {
            const response = await axios.put(
                "https://homey-host.onrender.com/api/v1/admin/verify-agent",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const updatedAgent = response.data.data;
            setData(data =>
                data.map(agent =>
                    agent.id === id
                        ? { ...agent, status: updatedAgent.status }
                        : agent
                )
            );
        } catch (error) {
            console.error("Error updating status:", error);
            setError("Failed to update agent status. Please try again later.");
        } finally {
            setLoadingAgents(prev => ({ ...prev, [id]: false }));
        }
    };

    const theme = createTheme();

    if (!authToken) return <div>Please log in as an admin to view this data.</div>;

    return (
        <ThemeProvider theme={theme}>
            <div className="py-[20px]">
                <h4 className="text-[20px] text-[#958F8F]">Verified Agent</h4>
            </div>
            {error && <div className="error">{error}</div>}
            {loading ? (
                <div className="flex justify-center items-center">
                    <CircularProgress />
                </div>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Agent URL</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Apartment Managed</TableCell>
                                <TableCell>Deactivate Agent</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((agent) => (
                                <TableRow key={agent.id}>
                                    <TableCell>{agent.name}</TableCell>
                                    <TableCell>{agent.slug}</TableCell>
                                    <TableCell>{agent.phone_number}</TableCell>
                                    <TableCell>{agent.email}</TableCell>
                                    <TableCell>{agent.apartment_managed}</TableCell>
                                    <TableCell>
                                        <Tooltip title={agent.status === "VERIFIED" ? "Verified" : "Unverified"}>
                                            <div>
                                                {loadingAgents[agent.id] ? (
                                                    <CircularProgress size={24} />
                                                ) : (
                                                    <Switch
                                                        checked={agent.status === "VERIFIED"}
                                                        onChange={() => handleToggle(agent.id, agent.status)}
                                                    />
                                                )}
                                            </div>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </ThemeProvider>
    );
};

export default VerifyAgentTable;