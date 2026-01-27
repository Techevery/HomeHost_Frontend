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
  Modal,
  Fade,
  Backdrop,
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
  Payment,
  PersonPin,
  Close,
  AccountBalanceWallet,
  Home,
  ArrowUpward,
  Receipt,
  TableChart,
} from "@mui/icons-material";
import useAdminStore from "../../../../../stores/admin";

// Interface for the backend response structure
interface AgentTotals {
  totalBalance: number;
  totalPending: number;
  totalEarning: number;
  totalActiveProperties: number;
}

interface BookingPeriod {
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
}

interface Transaction {
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
  bookingPeriods: BookingPeriod[];
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
  transaction?: Transaction;
}

interface PropertyApartment {
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
  apartment: PropertyApartment;
}

interface AgentInfo {
  id: string;
  name: string;
  email: string;
  address: string;
  phone_number: string;
  bank_name: string;
  account_number: string;
  gender: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  profile_picture: string;
  id_card: string;
  slug: string;
  personalUrl: string;
  accountBalance: number;
  nextOfKinAddress: string;
  nextOfKinEmail: string;
  nextOfKinName: string;
  nextOfKinOccupation: string;
  nextOfKinPhone: string;
  nextOfKinStatus: string;
  suspended: boolean;
}

interface AgentManagementData {
  totals: AgentTotals;
  info: AgentInfo;
  payouts: PayoutData[];
  properties: PropertyData[];
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

// Dashboard Component for Modal
const AgentDashboard: React.FC<{ 
  agent: AgentInfo | null;
  totals: AgentTotals | null;
}> = ({ agent, totals }) => {
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  const totalBalance = totals?.totalBalance || 0;
  const totalPending = totals?.totalPending || 0;
  const totalEarning = totals?.totalEarning || 0;
  const totalActiveProperties = totals?.totalActiveProperties || 0;

  const dashboardCards = [
    {
      title: "Total Earnings",
      value: `₦${formatNumber(totalEarning)}`,
      icon: <Payment sx={{ fontSize: 40, color: "primary.main" }} />,
      color: "linear-gradient(135deg, #667eea 0%, #746485 100%)",
      tooltip: "Total amount earned by this agent",
    },
    {
      title: "Total Pending",
      value: `₦${formatNumber(totalPending)}`,
      icon: <Receipt sx={{ fontSize: 40, color: "warning.main" }} />,
      color: "linear-gradient(135deg, #f093fb 0%, #8a525a 100%)",
      tooltip: "Total pending payouts",
    },
    {
      title: "Active Properties",
      value: formatNumber(totalActiveProperties),
      icon: <Home sx={{ fontSize: 40, color: "success.main" }} />,
      color: "linear-gradient(135deg, #4facfe 0%, #73a6a8 100%)",
      tooltip: "Number of active properties managed by agent",
    },
    {
      title: "Total Balance",
      value: `₦${formatNumber(totalBalance)}`,
      icon: <AccountBalanceWallet sx={{ fontSize: 40, color: "info.main" }} />,
      color: "linear-gradient(135deg, #43e97b 0%, #6eb9ac 100%)",
      tooltip: "Current available balance",
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
       {agent?.name} Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Overview of {agent?.name}'s performance and earnings
      </Typography>
      
      <Grid container spacing={3}>
        {dashboardCards.map((card, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: "100%",
                background: card.color,
                color: "white",
                borderRadius: 2,
                boxShadow: 3,
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ opacity: 0.9, fontSize: "0.875rem" }}
                    >
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  
                  <Tooltip title={card.tooltip}>
                    <IconButton
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.3)",
                        },
                      }}
                    >
                      {card.icon}
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Statistics */}
      <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Detailed Statistics
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {formatNumber(totalActiveProperties)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Properties
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="success" fontWeight="bold">
                  ₦{formatNumber(totalEarning)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Earnings
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning" fontWeight="bold">
                  ₦{formatNumber(totalPending)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending Balance
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box textAlign="center">
                <Typography variant="h4" color="info" fontWeight="bold">
                  ₦{formatNumber(totalBalance)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Balance
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Agent Info Summary */}
      <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
          {agent?.name} Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Agent Name:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {agent?.name || 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={agent?.status || 'Unknown'}
                  color={
                    agent?.status?.toLowerCase() === 'active' || agent?.status?.toLowerCase() === 'verified' 
                      ? 'success' 
                      : agent?.status?.toLowerCase() === 'pending' 
                        ? 'warning' 
                        : 'error'
                  }
                  size="small"
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Joined:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {agent?.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Properties:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatNumber(totalActiveProperties)} Active
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

// Properties Tab Component
const AgentPropertiesTab: React.FC<{ properties: PropertyData[] }> = ({ properties }) => {
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  if (properties.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Home sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No properties found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This agent doesn't have any properties assigned yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Managed Properties ({properties.length})
      </Typography>
      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} md={6} key={property.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {/* Property Images */}
                {property.apartment.images && property.apartment.images.length > 0 && (
                  <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden', height: 200 }}>
                    <img
                      src={property.apartment.images[0]}
                      alt={property.apartment.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/400x200?text=Property+Image';
                      }}
                    />
                  </Box>
                )}

                <Typography variant="h6" gutterBottom>
                  {property.apartment.name}
                </Typography>

                <Grid container spacing={1} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {property.apartment.type}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Bedrooms:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {property.apartment.bedroom}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Servicing:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {property.apartment.servicing}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={property.apartment.isBooked ? "Booked" : "Available"}
                      color={property.apartment.isBooked ? "error" : "success"}
                      size="small"
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Base Price:
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      ₦{formatNumber(property.base_price)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Commission:
                    </Typography>
                    <Typography variant="h6" color="success" fontWeight="bold">
                      {property.agent_commission_percent}%
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Last updated: {new Date(property.updated_at).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Payouts Tab Component
const AgentPayoutsTab: React.FC<{ payouts: PayoutData[] }> = ({ payouts }) => {
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (payouts.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Receipt sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No payouts found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This agent doesn't have any payout history yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Payout History ({payouts.length})
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Bank Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {payout.reference}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Transaction: {payout.transactionId}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    ₦{formatNumber(payout.amount)}
                  </Typography>
                  {payout.charges > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Charges: ₦{formatNumber(payout.charges)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {payout.bankName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {payout.accountNumber} • {payout.accountName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={payout.status}
                    color={getStatusColor(payout.status) as any}
                    size="small"
                  />
                  {payout.reason && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {payout.reason}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(payout.createdAt)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Statistics */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Payouts
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {payouts.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
                <Typography variant="body2" color="text.secondary">
                Total Successful
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success">
                ₦{formatNumber(payouts.filter(p => p.status.toLowerCase() === 'success').reduce((sum, p) => sum + p.amount, 0))}
                </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Successful
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="success">
                {payouts.filter(p => p.status.toLowerCase() === 'success').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="warning">
                {payouts.filter(p => p.status.toLowerCase() === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Agent Profile Modal Component
const AgentProfileModal: React.FC<{
  open: boolean;
  agent: any;
  onClose: () => void;
}> = ({ open, agent, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [idCardModal, setIdCardModal] = useState({
    open: false,
    imageUrl: "",
  });
  const [managementData, setManagementData] = useState<AgentManagementData | null>(null);
  const [loadingManagement, setLoadingManagement] = useState(false);
  const [managementError, setManagementError] = useState<string | null>(null);

  const { getAgentManagement, debugToken } = useAdminStore();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenIdCardModal = (imageUrl: string) => {
    setIdCardModal({
      open: true,
      imageUrl,
    });
  };

  const handleCloseIdCardModal = () => {
    setIdCardModal({
      open: false,
      imageUrl: "",
    });
  };

  // Fetch agent management data when modal opens
  useEffect(() => {
    if (open && agent?.id) {
      fetchAgentManagementData();
    } else {
      // Reset data when modal closes
      setManagementData(null);
      setManagementError(null);
    }
  }, [open, agent?.id]);

  const fetchAgentManagementData = async () => {
    if (!agent?.id) return;

    try {
      setLoadingManagement(true);
      setManagementError(null);

      console.log('Fetching agent management data for:', agent.id);
      
      // Debug token before making request
      debugToken();
      
      // Fetch agent management data
      const response = await getAgentManagement(agent.id);
      
      console.log('Agent management response:', response);
      
      // Store the response data directly
      setManagementData(response);
    } catch (error: any) {
      console.error('Error fetching agent management data:', error);
      
      // Check if it's an auth error
      if (error.response?.status === 401) {
        setManagementError('Authentication expired. Please log in again.');
      } else {
        setManagementError(error.message || 'Failed to fetch agent management data');
      }
    } finally {
      setLoadingManagement(false);
    }
  };

  // If modal is not open or no agent, don't render anything
  if (!open || !agent) {
    return null;
  }

  return (
    <>
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
          {/* Loading state for management data */}
          {loadingManagement && (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Loading agent management data...
              </Typography>
            </Box>
          )}

          {/* Error state */}
          {managementError && !loadingManagement && (
            <Alert severity="error" sx={{ m: 2 }}>
              {managementError}
            </Alert>
          )}

          {/* Content when not loading */}
          {!loadingManagement && managementData && (
            <>
              {/* Tabs */}
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

              {/* Tab Content */}
              <Box sx={{ px: 3, overflow: 'auto', maxHeight: '60vh', minHeight: '300px', py: 3 }}>
                <TabPanel value={activeTab} index={0}>
                  {/* Dashboard Tab */}
                  <AgentDashboard 
                    agent={managementData.info} 
                    totals={managementData.totals} 
                  />
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {/* Payouts Tab */}
                  <AgentPayoutsTab payouts={managementData.payouts} />
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  {/* Properties Tab */}
                  <AgentPropertiesTab properties={managementData.properties} />
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  {/* Personal Info Tab */}
                  <Box>
                    <Typography variant="h5" gutterBottom fontWeight="bold">
                      Personal Info
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Profile Header Card */}
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={3}>
                              <Avatar
                                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                                src={managementData.info.profile_picture || undefined}
                              >
                                <Person sx={{ fontSize: 40 }} />
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="h5" fontWeight="bold">
                                  {managementData.info.name || 'Unnamed Agent'}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  Agent ID: {managementData.info.id}
                                </Typography>
                                <Box display="flex" gap={1} mt={1}>
                                  <Chip
                                    label={managementData.info.status || 'Unknown'}
                                    color={
                                      managementData.info.status?.toLowerCase() === 'active' || managementData.info.status?.toLowerCase() === 'verified' 
                                        ? 'success' 
                                        : managementData.info.status?.toLowerCase() === 'pending' 
                                          ? 'warning' 
                                          : 'error'
                                    }
                                    size="small"
                                  />
                                  {managementData.info.suspended && (
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

                      {/* Contact Information */}
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
                                  {managementData.info.email || 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Phone:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.phone_number || 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Gender:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.gender ? managementData.info.gender.charAt(0).toUpperCase() + managementData.info.gender.slice(1) : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Registration Info */}
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
                                  {managementData.info.createdAt ? new Date(managementData.info.createdAt).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Last Updated:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.updatedAt ? new Date(managementData.info.updatedAt).toLocaleDateString() : 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Status:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.status || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Address Information */}
                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              <Home sx={{ fontSize: 18, mr: 1 }} />
                              Address Information
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Residential Address:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.address || 'N/A'}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Personal URL:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.slug ? `https://homeyhost.ng/shortlet/${managementData.info.slug}` : 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Bank Details */}
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              <AccountBalanceWallet sx={{ fontSize: 18, mr: 1 }} />
                              Bank Details
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Bank Name:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.bank_name || 'N/A'}
                                </Typography>
                              </Box>
                              <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                  Account Number:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {managementData.info.account_number || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Identification */}
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                              <Badge sx={{ fontSize: 18, mr: 1 }} />
                              Identification & Verification
                            </Typography>
                            <Box display="flex" flexDirection="column" gap={2}>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  ID Card Status:
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    label={managementData.info.id_card ? "Uploaded" : "Not Provided"}
                                    color={managementData.info.id_card ? "success" : "default"}
                                    size="small"
                                    icon={managementData.info.id_card ? <CheckCircle /> : undefined}
                                  />
                                </Box>
                              </Box>
                              
                              {managementData.info.id_card && (
                                <>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      ID Card Preview:
                                    </Typography>
                                    <Box
                                      sx={{
                                        width: '100%',
                                        maxWidth: 300,
                                        height: 180,
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: 'grey.300',
                                        '&:hover': {
                                          boxShadow: 4,
                                          borderColor: 'primary.main',
                                          '& .overlay': {
                                            opacity: 1,
                                          }
                                        }
                                      }}
                                      onClick={() => handleOpenIdCardModal(managementData.info.id_card)}
                                    >
                                      <img
                                        src={managementData.info.id_card}
                                        alt="ID Card Preview"
                                        style={{
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'cover',
                                        }}
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = 'https://via.placeholder.com/300x180?text=ID+Card';
                                        }}
                                      />
                                      <Box
                                        className="overlay"
                                        sx={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          right: 0,
                                          bottom: 0,
                                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          opacity: 0,
                                          transition: 'opacity 0.3s',
                                        }}
                                      >
                                        <Box textAlign="center">
                                          <Visibility sx={{ color: 'white', fontSize: 32, mb: 1 }} />
                                          <Typography variant="body2" color="white" fontWeight="medium">
                                            Click to View
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </Box>
                                  </Box>
                                  
                                  <Box display="flex" gap={1}>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<Visibility />}
                                      onClick={() => handleOpenIdCardModal(managementData.info.id_card)}
                                      fullWidth
                                    >
                                      View ID Card
                                    </Button>
                                  </Box>
                                </>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      {/* Next of Kin Information */}
                      {managementData.info.nextOfKinName && (
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom fontWeight="bold">
                                <PersonPin sx={{ fontSize: 18, mr: 1 }} />
                                Next of Kin Information
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Full Name:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {managementData.info.nextOfKinName}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Email:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {managementData.info.nextOfKinEmail}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Phone:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {managementData.info.nextOfKinPhone}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Address:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {managementData.info.nextOfKinAddress}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Occupation:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {managementData.info.nextOfKinOccupation}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Relationship:
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">
                                      {managementData.info.nextOfKinStatus}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </TabPanel>
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ID Card Preview Modal */}
      <Modal
        open={idCardModal.open}
        onClose={handleCloseIdCardModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={idCardModal.open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
              maxWidth: 800,
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              overflow: 'hidden',
              outline: 'none',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: 'grey.50',
              }}
            >
              <Typography variant="h6" fontWeight="bold">
                ID Card Verification
              </Typography>
              <IconButton onClick={handleCloseIdCardModal} size="small">
                <Close />
              </IconButton>
            </Box>
            
            <Box
              sx={{
                p: 3,
                maxHeight: 'calc(90vh - 64px)',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  borderRadius: 1,
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid',
                  borderColor: 'grey.300',
                }}
              >
                <img
                  src={idCardModal.imageUrl}
                  alt="ID Card"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/600x400?text=ID+Card+Not+Available';
                  }}
                />
              </Box>
              
              <Box sx={{ width: '100%', maxWidth: 600 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  This is the official ID card submitted by the agent for verification purposes.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => window.open(idCardModal.imageUrl, '_blank')}
                  size="small"
                >
                  View
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

// Main AgentTable Component
const AgentTable: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [agentDetailModal, setAgentDetailModal] = useState<{
    open: boolean;
    agent: any | null;
  }>({
    open: false,
    agent: null,
  });

  const {
    listAgents,
    clearError,
  } = useAdminStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
       
        const result = await listAgents(currentPage, itemsPerPage);
      
        const agentsData = result?.data?.agents || [];
        const pagination = result?.data?.pagination || {};

        setAgents(Array.isArray(agentsData) ? agentsData : []);
        setTotalAgents(pagination.totalAgents || 0);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || currentPage);
        setItemsPerPage(pagination.itemsPerPage || itemsPerPage);
        setError(null);
      } catch (error: any) {
        setError(error.message || "Failed to fetch agents data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, listAgents]);

  const openAgentDetailModal = (agent: any) => {
    setAgentDetailModal({
      open: true,
      agent,
    });
  };

  const closeAgentDetailModal = () => {
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

  if (loading) {
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
                  {agents.map((agent, index) => (
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
            {agents.length === 0 && !loading && (
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