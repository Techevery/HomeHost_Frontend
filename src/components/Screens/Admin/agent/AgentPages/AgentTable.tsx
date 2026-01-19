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
  Button,
  Grid,
  Divider,
  Avatar,
  Tabs,
  Tab,
  TextField,
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  Person,
  Email,
  Phone,
  CalendarToday,
  Link as LinkIcon,
  Badge,
  CheckCircle,
  Fingerprint,
  Payment,
  VerifiedUser,
  PersonPin,
  Close,
  AccountBalanceWallet,
  Home,
} from "@mui/icons-material";
import useAdminStore from "../../../../../stores/admin";

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
  gender?: string;
  address?: string;
  nextOfKinFullName?: string;
  nextOfKinEmail?: string;
  nextOfKinPhone?: string;
  bankName?: string;
  accountNumber?: string;
  profile_picture?: string;
  id_card?: string;
  personalUrl?: string;
  accountBalance?: number;
  nextOfKinAddress?: string;
  nextOfKinOccupation?: string;
  nextOfKinStatus?: string;
  nextOfKinName?: string;
  bank_name?: string;
  account_number?: string;
  suspended?: boolean;
}

interface PropertyData {
  id: string;
  agent_id: string;
  apartment_id: string;
  base_price: number;
  markedup_price: number;
  price_changed_by: string | null;
  price_changed_at: string;
  updated_at: string;
  agent_commission_percent: number;
  apartment: {
    id: string;
    name: string;
    address: string;
    type: string;
    servicing: string;
    bedroom: string;
    price: number;
    images: string[];
    video_link: string | null;
    agentPercentage: number | null;
    amenities: string;
    isBooked: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface PayoutData {
  id: string;
  agentId: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  status: string;
  createdAt: string;
  amount: number;
  proof: string | null;
  reference: string;
  remark: string | null;
  transactionId: string;
  reason: string | null;
  charges: number;
  transaction?: {
    id: string;
    email: string;
    status: string;
    amount: number;
    channel: string | null;
    charge: number | null;
    metadata: {
      bookingPeriods: Array<{
        endDate: string;
        startDate: string;
        durationDays: number;
      }>;
    };
    reference: string;
    date_paid: string;
    apartment_id: string;
    agent_id: string;
    created_at: string;
    updated_at: string;
    booking_end_date: string;
    booking_start_date: string;
    duration_days: number;
    phone_number: string;
    payment_month: string | null;
    payment_year: string | null;
    credited: boolean;
    agentPercentage: number;
    mockupPrice: number;
    bookingPeriods: Array<{
      id: string;
      transaction_id: string;
      apartment_id: string;
      start_date: string;
      end_date: string;
      duration_days: number;
      created_at: string;
      isDeleted: boolean;
      isEdited: boolean;
      expired: boolean;
      status: string;
      newBookingDuration: string | null;
    }>;
  };
}

interface AgentProfileResponse {
  totals?: {
    totalBalance: number;
    totalPending: number;
    totalEarning: number;
    totalActiveProperties: number;
  } | null;
  data: any[];
}

// Tab Panel Component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`agent-tabpanel-${index}`}
      aria-labelledby={`agent-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const extractAgentData = (response: any): AgentProfileResponse => {
  
  if (!response) {
    return { data: [], totals: null };
  }

  if (response.error || response.message?.toLowerCase().includes('error')) {
    return { data: [], totals: null };
  }

  let totals = null;
  let dataArray = [];

  console.log('🔍 [FRONTEND] extractAgentData received:', {
    hasResponse: !!response,
    hasMessage: !!response.message,
    hasData: !!response.data,
    responseType: typeof response,
    responseKeys: Object.keys(response || {})
  });

  // The backend returns: { message, data: { totals, data: [...] } }
  if (response.data && typeof response.data === 'object') {
    console.log('📊 [FRONTEND] Processing response.data:', {
      hasTotals: !!response.data.totals,
      hasDataArray: Array.isArray(response.data.data),
      dataType: typeof response.data.data,
      dataKeys: response.data.data ? Object.keys(response.data.data) : 'no data'
    });

    // Extract totals
    totals = response.data.totals || null;

    // Extract data array
    if (Array.isArray(response.data.data)) {
      dataArray = response.data.data;
      console.log('✅ [FRONTEND] Found array data, length:', dataArray.length);
    } 
    // If data is an object (like for 'info' endpoint), wrap it in array
    else if (response.data.data && typeof response.data.data === 'object') {
      dataArray = [response.data.data];
      console.log('✅ [FRONTEND] Found object data, wrapped in array');
    }
    // Fallback: check if response.data itself has agent data
    else if (response.data.id || response.data.email || response.data.name) {
      dataArray = [response.data];
      console.log('✅ [FRONTEND] Found agent data in response.data');
    }
  }
  // Fallback for direct array response
  else if (Array.isArray(response)) {
    dataArray = response;
    console.log('✅ [FRONTEND] Response is direct array');
  }
  // Fallback for direct object with id/email
  else if (response.id || response.agentId || response.email || response.name || response.reference) {
    dataArray = [response];
    console.log('✅ [FRONTEND] Response is direct object');
  }

  console.log('📦 [FRONTEND] Final extraction result:', {
    hasTotals: !!totals,
    totalsKeys: totals ? Object.keys(totals) : 'no totals',
    dataLength: dataArray.length,
    firstItem: dataArray.length > 0 ? dataArray[0] : 'no data'
  });

  return {
    totals: totals,
    data: dataArray
  };
};

// Agent Profile Modal Component - SIMPLIFIED VERSION THAT WILL DEFINITELY SHOW
const AgentProfileModal: React.FC<{
  open: boolean;
  agent: AgentData | null;
  onClose: () => void;
}> = ({ open, agent, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // If modal is not open or no agent, don't render anything
  if (!open || !agent) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}
              src={agent.profile_picture || undefined}
            >
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {agent.name || 'Unnamed Agent'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agent ID: {agent.id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tabs - ALWAYS SHOW THESE */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab
              icon={<AccountBalanceWallet />}
              label="Dashboard"
              id="agent-tab-0"
            />
            <Tab
              icon={<Payment />}
              label="Payouts"
              id="agent-tab-1"
            />
            <Tab 
              icon={<Home />} 
              label="Properties" 
              id="agent-tab-2" 
            />
            <Tab 
              icon={<Badge />} 
              label="Personal Info" 
              id="agent-tab-3" 
            />
          </Tabs>
        </Box>

        {/* Tab Content - SIMPLIFIED TO SHOW IMMEDIATELY */}
        <Box sx={{ px: 3, overflow: 'auto', maxHeight: '60vh', minHeight: '300px', py: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading dashboard data for {agent.name}...
              </Typography>
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Payouts
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading payout history for {agent.name}...
              </Typography>
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Properties
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Loading properties for {agent.name}...
              </Typography>
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Box>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Personal Info
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Avatar
                          sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                          src={agent.profile_picture || undefined}
                        >
                          <Person sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h5" fontWeight="bold">
                            {agent.name || 'Unnamed Agent'}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            Agent ID: {agent.id}
                          </Typography>
                          <Box display="flex" gap={1} mt={1}>
                            <Chip
                              label={agent.status || 'Unknown'}
                              color={
                                agent.status?.toLowerCase() === 'active' || agent.status?.toLowerCase() === 'verified' 
                                  ? 'success' 
                                  : agent.status?.toLowerCase() === 'pending' 
                                    ? 'warning' 
                                    : 'error'
                              }
                              size="small"
                            />
                            {agent.suspended && (
                              <Chip
                                label="Suspended"
                                color="error"
                                size="small"
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        <Email sx={{ fontSize: 18, mr: 1 }} />
                        Contact Information
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Email:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {agent.email || 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Phone:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {agent.phone_number || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom fontWeight="bold">
                        <CalendarToday sx={{ fontSize: 18, mr: 1 }} />
                        Registration
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={2}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Joined:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Status:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {agent.status || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main AgentTable Component
const AgentTable: React.FC = () => {
  const [data, setData] = useState<AgentData[]>([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agentDetailModal, setAgentDetailModal] = useState<{
    open: boolean;
    agent: AgentData | null;
  }>({
    open: false,
    agent: null,
  });

  const {
    token,
    isLoading: storeLoading,
    listAgents,
    clearError,
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
       
        console.log('🔍 [Main] Fetching agents list, page:', currentPage);
        const result = await listAgents(currentPage, itemsPerPage);
        console.log('✅ [Main] Agents list response:', result);
      
        const agentsData = result?.data?.agents || result?.data?.data?.agents || [];
        const pagination = result?.data?.pagination || result?.data?.data?.pagination || {};

        setData(Array.isArray(agentsData) ? agentsData : []);
        setTotalAgents(pagination.totalAgents || pagination.total || 0);
        setTotalPages(pagination.totalPages || Math.ceil(totalAgents / itemsPerPage) || 1);
        setCurrentPage(pagination.currentPage || currentPage);
        setItemsPerPage(pagination.itemsPerPage || itemsPerPage);
        setError(null);
      } catch (error: any) {
        console.error('❌ [Main] Error fetching agents:', error);
        setError(error.message || "Failed to fetch agents data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentPage, itemsPerPage, listAgents]);

  const openAgentDetailModal = (agent: AgentData) => {
    console.log('📱 Opening agent detail modal for:', agent.id, agent.name);
    setAgentDetailModal({
      open: true,
      agent,
    });
  };

  const closeAgentDetailModal = () => {
    console.log('📱 Closing agent detail modal');
    setAgentDetailModal({
      open: false,
      agent: null,
    });
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "suspended":
      case "rejected":
      case "unverified":
        return "error";
      default:
        return "default";
    }
  };

  const defaultMaterialTheme = createTheme({
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  if (loading || storeLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="400px">
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading agents data...
        </Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={defaultMaterialTheme}>
      <div className="p-6">
        {/* Header */}
        <Card sx={{ mb: 3, backgroundColor: "primary.main", color: "white" }}>
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center">
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
            }}>
            {error}
          </Alert>
        )}

        {/* Agent Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table sx={{ minWidth: 1200 }}>
                <TableHead sx={{ backgroundColor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", py: 3 }}>
                      Agent Information
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 3 }}>
                      Contact Details
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 3 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 3 }}>
                      Registration
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", py: 3 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((agent, index) => (
                    <TableRow
                      key={agent.id || index}
                      sx={{
                        "&:hover": {
                          backgroundColor: "grey.50",
                        },
                        transition: "background-color 0.2s",
                      }}>
                      {/* Agent Information */}
                      <TableCell sx={{ py: 2 }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={2}
                          sx={{ cursor: "pointer" }}
                          onClick={() => openAgentDetailModal(agent)}>
                          <Avatar
                            sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                            src={agent.profile_picture || undefined}
                          >
                            <Person />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {agent.name || "Unnamed Agent"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {agent.id}
                            </Typography>
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mt={0.5}>
                              <LinkIcon fontSize="small" color="action" />
                              <Typography
                                variant="caption"
                                color="text.secondary">
                                https://homeyhost.ng/shortlet/
                                {agent.slug || "No URL"}
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
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                              }}
                              onClick={() => openAgentDetailModal(agent)}>
                              {agent.email}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Phone fontSize="small" color="primary" />
                            <Typography
                              variant="body2"
                              sx={{
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                              }}
                              onClick={() => openAgentDetailModal(agent)}>
                              {agent.phone_number || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={agent.status || "Unknown"}
                          color={getStatusColor(agent.status) as any}
                          size="medium"
                          variant="filled"
                        />
                      </TableCell>

                      {/* Registration Date */}
                      <TableCell
                        sx={{ py: 2, cursor: "pointer" }}
                        onClick={() => openAgentDetailModal(agent)}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              {agent.createdAt ? new Date(agent.createdAt).toLocaleTimeString() : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ py: 2 }}>
                        <Tooltip title="View Agent Details">
                          <IconButton
                            color="primary"
                            onClick={() => openAgentDetailModal(agent)}
                            sx={{
                              backgroundColor: "primary.light",
                              color: "white",
                              "&:hover": {
                                backgroundColor: "primary.main",
                              },
                              mr: 1,
                            }}>
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
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={8}>
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

        {/* Agent Profile Modal */}
        <AgentProfileModal
          open={agentDetailModal.open}
          agent={agentDetailModal.agent}
          onClose={closeAgentDetailModal}
        />
      </div>
    </ThemeProvider>
  );
};

export default AgentTable;