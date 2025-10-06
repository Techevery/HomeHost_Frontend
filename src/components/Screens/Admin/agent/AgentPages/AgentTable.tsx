import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
  CircularProgress,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import {
  Visibility,
  Person,
  Email,
  Phone,
  CalendarToday,
  Link as LinkIcon,
  Badge,
  CreditCard,
  CheckCircle,
  Cancel
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAdminStore from '../../../../../stores/admin';

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
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    agentId: string;
    field: 'front_id_status' | 'back_id_status';
    currentStatus: boolean;
    agentName: string;
    documentType: string;
  } | null>(null);
  
  const navigate = useNavigate();
  const { 
    token, 
    isLoading: storeLoading, 
    listAgents, 
    verifyAgent,
    clearError 
  } = useAdminStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await listAgents(currentPage, itemsPerPage);
        
        console.log("API Response:", result); // Debug log
        
        // Handle the actual API response structure
        const agentsData = result?.data?.agents || [];
        const pagination = result?.data?.pagination || {};
        
        console.log("Agents data:", agentsData); // Debug log
        console.log("Pagination data:", pagination); // Debug log
        
        setData(Array.isArray(agentsData) ? agentsData : []);
        setTotalAgents(pagination.totalAgents || 0);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || 1);
        setItemsPerPage(pagination.itemsPerPage || itemsPerPage);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch agents data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentPage, itemsPerPage, listAgents]);

  const handleViewProfile = (agent: AgentData) => {
    navigate(`/admin/agents/${agent.id}`, { 
      state: { 
        agent,
        from: 'agent-table'
      } 
    });
  };

  const openVerificationDialog = (
    agentId: string,
    field: 'front_id_status' | 'back_id_status',
    currentStatus: boolean,
    agentName: string,
    documentType: string
  ) => {
    setVerificationDialog({
      open: true,
      agentId,
      field,
      currentStatus,
      agentName,
      documentType
    });
  };

  const closeVerificationDialog = () => {
    setVerificationDialog(null);
  };

  const handleStatusChange = async () => {
    if (!verificationDialog) return;

    const { agentId, field, currentStatus, agentName, documentType } = verificationDialog;
    
    try {
      // The verifyAgent method expects "VERIFIED" or "UNVERIFIED" status
      const newStatus = !currentStatus ? "VERIFIED" : "UNVERIFIED";
      
      await verifyAgent(agentId, newStatus);

      // Update local state to reflect the change
      setData(prevData => 
        prevData.map(agent => 
          agent.id === agentId 
            ? { ...agent, [field]: !currentStatus }
            : agent
        )
      );

      closeVerificationDialog();
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update verification status");
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': 
      case 'verified': 
        return 'success';
      case 'pending': 
        return 'warning';
      case 'suspended': 
      case 'rejected': 
      case 'unverified': 
        return 'error';
      default: 
        return 'default';
    }
  };

  const getVerificationStatus = (frontStatus?: boolean, backStatus?: boolean) => {
    if (frontStatus && backStatus) return 'Verified';
    if (frontStatus || backStatus) return 'Partial';
    return 'Not Verified';
  };

  const getVerificationColor = (frontStatus?: boolean, backStatus?: boolean) => {
    if (frontStatus && backStatus) return 'success';
    if (frontStatus || backStatus) return 'warning';
    return 'error';
  };

  const defaultMaterialTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  if (loading || storeLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={defaultMaterialTheme}>
      <div className="p-6">
        {/* Header */}
        <Card sx={{ mb: 3, backgroundColor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" component="h1" fontWeight="bold">
                Agent Management
              </Typography>
              <Box display="flex" flexDirection="column" alignItems="flex-end">
                <Typography variant="h6" component="div">
                  Total Agents: {totalAgents}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Page {currentPage} of {totalPages}
                </Typography>
              </Box>
            </Box>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Manage agent registrations and verifications
            </Typography>
          </CardContent>
        </Card>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => {
              setError(null);
              clearError();
            }}
          >
            {error}
          </Alert>
        )}

        {/* Agent Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead sx={{ backgroundColor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', py: 3 }}>Agent Information</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 3 }}>Contact Details</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 3 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 3 }}>Registration</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', py: 3 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((agent) => (
                    <TableRow 
                      key={agent.id}
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: 'grey.50',
                        },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {/* Agent Information */}
                      <TableCell sx={{ py: 2 }}>
                        <Box 
                          display="flex" 
                          alignItems="center" 
                          gap={2}
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleViewProfile(agent)}
                        >
                          <Person color="primary" sx={{ fontSize: 32 }} />
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {agent.name || 'Unnamed Agent'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {agent.id}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                              <LinkIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {agent.slug || 'No URL'}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Contact Information */}
                      <TableCell sx={{ py: 2 }}>
                        <Box display="flex" flexDirection="column" gap={1}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Email fontSize="small" color="primary" />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => handleViewProfile(agent)}
                            >
                              {agent.email}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone fontSize="small" color="primary" />
                            <Typography 
                              variant="body2"
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => handleViewProfile(agent)}
                            >
                              {agent.phone_number || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 2 }}>
                        <Chip 
                          label={agent.status || 'Unknown'} 
                          color={getStatusColor(agent.status) as any}
                          size="medium"
                          variant="filled"
                        />
                      </TableCell>

                      {/* Registration Date */}
                      <TableCell 
                        sx={{ py: 2, cursor: 'pointer' }}
                        onClick={() => handleViewProfile(agent)}
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {new Date(agent.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(agent.createdAt).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ py: 2 }}>
                        <Tooltip title="View Full Profile & Details">
                          <IconButton 
                            color="primary"
                            onClick={() => handleViewProfile(agent)}
                            sx={{
                              backgroundColor: 'primary.light',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                              }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Empty State */}
            {data.length === 0 && !loading && (
              <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <Typography variant="h6" color="text.secondary">
                  No agents found
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" p={3}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                  size="large"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Verification Confirmation Dialog */}
        <Dialog
          open={!!verificationDialog}
          onClose={closeVerificationDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {verificationDialog?.currentStatus ? 'Revoke Verification' : 'Approve Verification'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {verificationDialog?.currentStatus ? 'revoke' : 'approve'} the{" "}
              {verificationDialog?.documentType?.toLowerCase()} for agent{" "}
              <strong>{verificationDialog?.agentName}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeVerificationDialog} color="inherit">
              Cancel
            </Button>
            <Button 
              onClick={handleStatusChange} 
              color={verificationDialog?.currentStatus ? "warning" : "success"}
              variant="contained"
            >
              {verificationDialog?.currentStatus ? 'Revoke' : 'Approve'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default AgentTable;