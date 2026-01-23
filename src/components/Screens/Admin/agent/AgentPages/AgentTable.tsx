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
  Snackbar,
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
  Fingerprint,
  Payment,
  VerifiedUser,
  PersonPin,
  Close,
  AccountBalanceWallet,
  Home,
  ArrowUpward,
  People,
  AttachMoney,
  Assessment,
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
  updatedAt?: string;
  totals?: {
    totalBalance: number;
    totalPending: number;
    totalEarning: number;
    totalActiveProperties: number;
  } | null;
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

  // The backend returns: { message, data: { totals, data: [...] } }
  if (response.data && typeof response.data === 'object') {
  
    // Extract totals
    totals = response.data.totals || null;

    // Extract data array
    if (Array.isArray(response.data.data)) {
      dataArray = response.data.data;
   
    } 
    // If data is an object (like for 'info' endpoint), wrap it in array
    else if (response.data.data && typeof response.data.data === 'object') {
      dataArray = [response.data.data];
   
    }
    // Fallback: check if response.data itself has agent data
    else if (response.data.id || response.data.email || response.data.name) {
      dataArray = [response.data];
     
    }
  }
  // Fallback for direct array response
  else if (Array.isArray(response)) {
    dataArray = response;
  
  }
  // Fallback for direct object with id/email
  else if (response.id || response.agentId || response.email || response.name || response.reference) {
    dataArray = [response];

  }

  return {
    totals: totals,
    data: dataArray
  };
};

// Dashboard Component for Modal - UPDATED
const AgentDashboard: React.FC<{ agent: AgentData | null }> = ({ agent }) => {
  // Format number with commas (no currency symbol)
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-NG').format(amount);
  };

  // Get metrics from agent's totals - using your exact field names
  const totalBalance = agent?.totals?.totalBalance || 0;
  const totalPending = agent?.totals?.totalPending || 0;
  const totalEarning = agent?.totals?.totalEarning || 0;
  const totalActiveProperties = agent?.totals?.totalActiveProperties || 0;
  
  // Mock percentage changes (you can get these from your API)
  const earningChange = 0; // +12.5%
  const balanceChange = 0; // +18.2%
  const pendingCount = 0; // 5 pending approvals

  const dashboardCards = [
    {
      title: "Total Earnings",
      value: formatNumber(totalEarning),
    
      trend: "up",
      icon: <Payment sx={{ fontSize: 40, color: "primary.main" }} />,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      tooltip: "Total amount earned by this agent",
      field: "totalEarning"
    },
    {
      title: " Total Pending",
      value: formatNumber(totalPending),
      secondaryValue: `${totalPending} Pending`,
      description: "Total pending approvals",
      icon: <Assessment sx={{ fontSize: 40, color: "warning.main" }} />,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      tooltip: "Total pending approvals for this agent",
      field: "totalPending"
    },
    {
      title: " Active Properties",
      value: formatNumber(totalActiveProperties),
      icon: <Home sx={{ fontSize: 40, color: "success.main" }} />,
      description: "Registered agents",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      tooltip: "Number of active properties managed by agent",
      field: "totalActiveProperties"
    },
    {
      title: "Total Balance",
      value: formatNumber(totalBalance),
      change: `${balanceChange}%`,

      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      tooltip: "Current available balance",
      field: "totalBalance"
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Agent Performance Dashboard
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
                    
                    {card.change && (
                      <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
                        <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {card.change}
                        </Typography>
                        <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                          This month
                        </Typography>
                      </Box>
                    )}
                    
                    {card.secondaryValue && (
                      <Typography variant="h6" fontWeight="medium" sx={{ mt: 1 }}>
                        {card.secondaryValue}
                      </Typography>
                    )}
                    
                    {card.description && (
                      <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 1 }}>
                        {card.description}
                      </Typography>
                    )}
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
                
                {/* Progress indicator */}
                {card.change && (
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: 4,
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: card.trend === "up" ? "70%" : "30%",
                          height: "100%",
                          backgroundColor: "white",
                          borderRadius: 2,
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Statistics */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
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
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                      totalActiveProperties
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="success" fontWeight="bold">
                      {formatNumber(totalEarning)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Earnings
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                      totalEarning
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="warning" fontWeight="bold">
                      {formatNumber(totalPending)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Balance
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                      totalPending
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="info" fontWeight="bold">
                      {formatNumber(totalBalance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                      totalBalance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Performance Trend
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    This Month Growth
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    +{earningChange}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Based on earnings
                  </Typography>
                </Box>
                <ArrowUpward sx={{ fontSize: 48, color: "success.main" }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Earnings increased by {earningChange}% this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Agent Info Summary */}
      <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Agent Information
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

      {/* Data Source Info */}
      <Card sx={{ mt: 3, borderRadius: 2, boxShadow: 2, backgroundColor: "grey.50" }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
           Agent totals 
          </Typography>
          <Box sx={{ mt: 1, p: 1, backgroundColor: "white", borderRadius: 1, fontFamily: "monospace", fontSize: "0.8rem" }}>
            totals: 
            <br />
            &nbsp;&nbsp;totalBalance: {totalBalance},
            <br />
            &nbsp;&nbsp;totalPending: {totalPending},
            <br />
            &nbsp;&nbsp;totalEarning: {totalEarning},
            <br />
            &nbsp;&nbsp;totalActiveProperties: {totalActiveProperties}
            <br />
      
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

// Agent Profile Modal Component
const AgentProfileModal: React.FC<{
  open: boolean;
  agent: AgentData | null;
  onClose: () => void;
}> = ({ open, agent, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [idCardModal, setIdCardModal] = useState({
    open: false,
    imageUrl: "",
  });

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
              {/* Dashboard Tab - Now showing actual dashboard */}
              <AgentDashboard agent={agent} />
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
              {/* Personal Info Tab - Keep existing content */}
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
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Gender:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {agent.gender ? agent.gender.charAt(0).toUpperCase() + agent.gender.slice(1) : 'N/A'}
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
                              {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Last Updated:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {agent.updatedAt ? new Date(agent.updatedAt).toLocaleDateString() : 'N/A'}
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
                              {agent.address || 'N/A'}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Personal URL:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {agent.slug ? `https://homeyhost.ng/shortlet/${agent.slug}` : 'N/A'}
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
                              {agent.bank_name || agent.bankName || 'N/A'}
                            </Typography>
                          </Box>
                          <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2" color="text.secondary">
                              Account Number:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {agent.account_number || agent.accountNumber || 'N/A'}
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
                                label={agent.id_card ? "Uploaded" : "Not Provided"}
                                color={agent.id_card ? "success" : "default"}
                                size="small"
                                icon={agent.id_card ? <CheckCircle /> : undefined}
                              />
                              {agent.front_id_status && (
                                <Chip
                                  label="Front Verified"
                                  color="success"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {agent.back_id_status && (
                                <Chip
                                  label="Back Verified"
                                  color="success"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          
                          {agent.id_card && (
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
                                  onClick={() => handleOpenIdCardModal(agent.id_card!)}
                                >
                                  <img
                                    src={agent.id_card}
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
                                  onClick={() => handleOpenIdCardModal(agent.id_card!)}
                                  fullWidth
                                >
                                  View ID Card
                                </Button>
                              </Box>
                            </>
                          )}
                          
                          {agent.nextOfKinName && (
                            <>
                              <Divider />
                              <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                  Next of Kin:
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {agent.nextOfKinName}
                                </Typography>
                                {agent.nextOfKinPhone && (
                                  <Typography variant="caption" color="text.secondary">
                                    Phone: {agent.nextOfKinPhone}
                                  </Typography>
                                )}
                              </Box>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Additional Information (if available) */}
                  {(agent.nextOfKinFullName || agent.nextOfKinEmail || agent.nextOfKinAddress) && (
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom fontWeight="bold">
                            <PersonPin sx={{ fontSize: 18, mr: 1 }} />
                            Next of Kin Information
                          </Typography>
                          <Grid container spacing={2}>
                            {agent.nextOfKinFullName && (
                              <Grid item xs={12} md={4}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Full Name:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {agent.nextOfKinFullName}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {agent.nextOfKinEmail && (
                              <Grid item xs={12} md={4}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Email:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {agent.nextOfKinEmail}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {agent.nextOfKinPhone && (
                              <Grid item xs={12} md={4}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Phone:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {agent.nextOfKinPhone}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {agent.nextOfKinAddress && (
                              <Grid item xs={12}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Address:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {agent.nextOfKinAddress}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {agent.nextOfKinOccupation && (
                              <Grid item xs={12} md={6}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Occupation:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {agent.nextOfKinOccupation}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {agent.nextOfKinStatus && (
                              <Grid item xs={12} md={6}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    Relationship:
                                  </Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {agent.nextOfKinStatus}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
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

// Main AgentTable Component (simplified - no dashboard at top)
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
       
        const result = await listAgents(currentPage, itemsPerPage);
      
        const agentsData = result?.data?.agents || result?.data?.data?.agents || [];
        const pagination = result?.data?.pagination || result?.data?.data?.pagination || {};

        setData(Array.isArray(agentsData) ? agentsData : []);
        setTotalAgents(pagination.totalAgents || pagination.total || 0);
        setTotalPages(pagination.totalPages || Math.ceil(totalAgents / itemsPerPage) || 1);
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
  }, [token, currentPage, itemsPerPage, listAgents]);

  const openAgentDetailModal = (agent: AgentData) => {
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
        {/* Header (no dashboard at top) */}
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

        {/* Agent Profile Modal with Dashboard inside */}
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