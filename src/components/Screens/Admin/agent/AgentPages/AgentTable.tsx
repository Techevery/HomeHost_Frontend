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
import { useNavigate } from "react-router-dom";
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

// Agent Dashboard Component
const AgentDashboard: React.FC<{ agent: any; details: any }> = ({ agent, details }) => {
  const dashboardData = {
    availableBalance: '₦29,950',
    pendingClearance: '₦45,000',
    totalEarnings: '₦185,950',
    activeProperties: 12,
    monthlyGrowth: '+22.5%',
    recentPayouts: [
      {
        property: 'Luxury 2BR Apartment - Lekki Phase 1',
        method: 'Percentage (10%)',
        calculation: '₦100,000 × 10%',
        net: '₦9,950',
        booking: 'BK-7829',
        checkout: 'Nov 20, 2025',
        processed: 'Nov 20, 2025',
      },
      {
        property: 'Studio Apartment - Ikeja GRA',
        method: 'Markup (₦5,000/day)',
        calculation: '₦5,000 × 4 days',
        net: '₦19,950',
        booking: 'BK-9921',
        checkout: 'Nov 22, 2025',
        processed: 'Nov 22, 2025',
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Welcome back, {agent.name?.split(' ')[0] || 'Agent'}
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Here's your payout summary and recent activity
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Available Balance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <AccountBalanceWallet />
                <Typography variant="h6">Available Balance</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {dashboardData.availableBalance}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {dashboardData.availableBalance} this month
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Cleaned funds ready for payout
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending Clearance */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <CalendarToday />
                <Typography variant="h6">Pending Clearance</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {dashboardData.pendingClearance}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {dashboardData.pendingClearance} this month
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Funds held until guest checkout
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Earnings */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Payment />
                <Typography variant="h6">Total Earnings</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {dashboardData.totalEarnings}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {dashboardData.monthlyGrowth} this month
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total commissions this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Properties */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Home />
                <Typography variant="h6">Active Properties</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {dashboardData.activeProperties}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                +2 this month
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Properties generating commissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Payouts */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Recent Payouts
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Payouts are processed on checkout dates
          </Typography>

          {dashboardData.recentPayouts.map((payout, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {payout.property}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Method: {payout.method}
                  </Typography>
                  <Typography variant="body2">
                    Calculation: {payout.calculation}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    Net: {payout.net}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Chip
                      label={`Booking: ${payout.booking}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Checkout: ${payout.checkout}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`Processed: ${payout.processed}`}
                      variant="outlined"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
              
              {index < dashboardData.recentPayouts.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

// Agent Payouts Component
const AgentPayouts: React.FC<{ agent: any }> = ({ agent }) => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    setLoading(true);
    setTimeout(() => {
      setPayouts([
        {
          id: '1',
          amount: '₦9,950',
          status: 'processed',
          method: 'Percentage (10%)',
          bookingReference: 'BK-7829',
          property: 'Luxury 2BR Apartment - Lekki Phase 1',
          checkoutDate: 'Nov 20, 2025',
          processedDate: 'Nov 20, 2025',
          calculation: '₦100,000 × 10%',
        },
        {
          id: '2',
          amount: '₦19,950',
          status: 'pending',
          method: 'Markup (₦5,000/day)',
          bookingReference: 'BK-9921',
          property: 'Studio Apartment - Ikeja GRA',
          checkoutDate: 'Nov 22, 2025',
          processedDate: 'Nov 22, 2025',
          calculation: '₦5,000 × 4 days',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [agent]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Payout History
      </Typography>

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Booking Reference</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Checkout Date</TableCell>
                  <TableCell>Processed Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {payout.property}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payout.calculation}
                      </Typography>
                    </TableCell>
                    <TableCell>{payout.bookingReference}</TableCell>
                    <TableCell>{payout.method}</TableCell>
                    <TableCell>
                      <Typography fontWeight="bold">
                        {payout.amount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status}
                        color={getStatusColor(payout.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{payout.checkoutDate}</TableCell>
                    <TableCell>{payout.processedDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {payouts.length === 0 && !loading && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No payout history found
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// Agent Properties Component
const AgentProperties: React.FC<{ agent: any }> = ({ agent }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data - replace with actual API call
    setLoading(true);
    setTimeout(() => {
      setProperties([
        {
          id: '1',
          title: 'Luxury 2BR Apartment',
          location: 'Lekki Phase 1',
          type: 'Apartment',
          status: 'active',
          price: '₦100,000',
          commission: '₦9,950',
          bookings: 15,
          lastBooking: 'Nov 20, 2025',
        },
        {
          id: '2',
          title: 'Studio Apartment',
          location: 'Ikeja GRA',
          type: 'Studio',
          status: 'active',
          price: '₦20,000',
          commission: '₦19,950',
          bookings: 8,
          lastBooking: 'Nov 22, 2025',
        },
        {
          id: '3',
          title: '3BR Duplex',
          location: 'Victoria Island',
          type: 'Duplex',
          status: 'inactive',
          price: '₦150,000',
          commission: '₦11,950',
          bookings: 12,
          lastBooking: 'Nov 18, 2025',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, [agent]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Agent Properties
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {properties.length} properties
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {properties.map((property) => (
          <Grid item xs={12} md={6} key={property.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                    }}
                  >
                    <Home />
                  </Box>
                  <Box flex={1}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" fontWeight="bold">
                        {property.title}
                      </Typography>
                      <Chip
                        label={property.status}
                        color={getStatusColor(property.status) as any}
                        size="small"
                      />
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                      <PersonPin fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {property.location}
                      </Typography>
                    </Box>
                    <Chip label={property.type} variant="outlined" size="small" />
                  </Box>
                </Box>

                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {property.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Commission
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {property.commission}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Bookings
                    </Typography>
                    <Typography variant="body1">
                      {property.bookings}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Last Booking
                    </Typography>
                    <Typography variant="body1">
                      {property.lastBooking}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {properties.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No properties found for this agent
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// Agent Personal Info Component
const AgentPersonalInfo: React.FC<{ agent: any; details: any }> = ({ agent, details }) => {
  const personalInfo = {
    profilePicture: null,
    frontId: agent.front_id || null,
    backId: agent.back_id || null,
    frontIdStatus: agent.front_id_status || false,
    backIdStatus: agent.back_id_status || false,
    account: agent.account || 'N/A',
    email: agent.email,
    phone: agent.phone_number || 'N/A',
    slug: agent.slug || 'N/A',
    status: agent.status || 'Unknown',
    createdAt: agent.createdAt,
    
    // New Personal Information fields
    gender: agent.gender || null,
    address: agent.address || null,
    
    // Next of Kin Information
    nextOfKinFullName: agent.nextOfKinFullName || null,
    nextOfKinEmail: agent.nextOfKinEmail || null,
    nextOfKinPhone: agent.nextOfKinPhone || null,
    
    // Bank Information
    bankName: agent.bankName || null,
    accountNumber: agent.accountNumber || null,
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

  const handleDocumentUpload = (documentType: string) => {
    console.log(`Upload ${documentType}`);
  };

  return (
    <Grid container spacing={3}>
      {/* Profile Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                src={personalInfo.profilePicture || undefined}
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
                <Chip
                  label={personalInfo.status}
                  color={getStatusColor(personalInfo.status) as any}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Basic Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <Fingerprint sx={{ fontSize: 18, mr: 1 }} />
              Basic Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Account:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.account}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Slug/URL:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  https://homeyhost.ng/shortlet/{personalInfo.slug}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Registration Date:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {new Date(personalInfo.createdAt).toLocaleDateString()}
                </Typography>
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
                  {personalInfo.email}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Phone:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.phone}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Personal Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <Person sx={{ fontSize: 18, mr: 1 }} />
              Personal Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Gender:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.gender || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Address:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.address || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Next of Kin Information */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <Person sx={{ fontSize: 18, mr: 1 }} />
              Next of Kin Information
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Full Name:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.nextOfKinFullName || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Email Address:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.nextOfKinEmail || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Phone Number:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {personalInfo.nextOfKinPhone || 'Not specified'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Bank Information */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <AccountBalanceWallet sx={{ fontSize: 18, mr: 1 }} />
              Bank Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Bank Name:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {personalInfo.bankName || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Account Number:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {personalInfo.accountNumber || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Document Verification */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <VerifiedUser sx={{ fontSize: 18, mr: 1 }} />
              Document Verification
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleDocumentUpload('front_id')}
                >
                  {personalInfo.frontId ? (
                    <Box>
                      <CheckCircle color="success" sx={{ fontSize: 48 }} />
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        Front ID Uploaded
                      </Typography>
                      <Chip
                        icon={<CheckCircle />}
                        label={personalInfo.frontIdStatus ? 'Verified' : 'Pending Verification'}
                        color={personalInfo.frontIdStatus ? 'success' : 'warning'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Badge color="action" sx={{ fontSize: 48 }} />
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        Upload Front ID
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click to upload front identification document
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={() => handleDocumentUpload('back_id')}
                >
                  {personalInfo.backId ? (
                    <Box>
                      <CheckCircle color="success" sx={{ fontSize: 48 }} />
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        Back ID Uploaded
                      </Typography>
                      <Chip
                        icon={<CheckCircle />}
                        label={personalInfo.backIdStatus ? 'Verified' : 'Pending Verification'}
                        color={personalInfo.backIdStatus ? 'success' : 'warning'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Badge color="action" sx={{ fontSize: 48 }} />
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        Upload Back ID
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click to upload back identification document
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

// Agent Profile Modal Component
const AgentProfileModal: React.FC<{
  open: boolean;
  agent: any;
  onClose: () => void;
}> = ({ open, agent, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [agentDetails, setAgentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAdminStore();

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agent?.id || !token) return;

      try {
        setLoading(true);
        setError(null);
        // Mock API call - replace with actual endpoint
        setTimeout(() => {
          setAgentDetails({
            ...agent,
            profilePicture: null,
            totalEarnings: '₦185,950',
            activeProperties: 12,
          });
          setLoading(false);
        }, 1000);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agent details');
        setLoading(false);
      }
    };

    if (open && agent) {
      fetchAgentDetails();
      setActiveTab(0);
    }
  }, [open, agent, token]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!agent) return null;

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
              src={agentDetails?.profilePicture || undefined}
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
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
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
            <Box sx={{ px: 3, overflow: 'auto', maxHeight: '60vh' }}>
              <TabPanel value={activeTab} index={0}>
                <AgentDashboard agent={agent} details={agentDetails} />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <AgentPayouts agent={agent} />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <AgentProperties agent={agent} />
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <AgentPersonalInfo agent={agent} details={agentDetails} />
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
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    agentId: string;
    field: "front_id_status" | "back_id_status";
    currentStatus: boolean;
    agentName: string;
    documentType: string;
  } | null>(null);

  const [agentDetailModal, setAgentDetailModal] = useState<{
    open: boolean;
    agent: AgentData | null;
  }>({
    open: false,
    agent: null,
  });

  // const navigate = useNavigate();
  const {
    token,
    isLoading: storeLoading,
    listAgents,
    verifyAgent,
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

        const agentsData = result?.data?.agents || [];
        const pagination = result?.data?.pagination || {};

        setData(Array.isArray(agentsData) ? agentsData : []);
        setTotalAgents(pagination.totalAgents || 0);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || 1);
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

  // const openVerificationDialog = (
  //   agentId: string,
  //   field: "front_id_status" | "back_id_status",
  //   currentStatus: boolean,
  //   agentName: string,
  //   documentType: string,
  // ) => {
  //   setVerificationDialog({
  //     open: true,
  //     agentId,
  //     field,
  //     currentStatus,
  //     agentName,
  //     documentType,
  //   });
  // };

  const closeVerificationDialog = () => {
    setVerificationDialog(null);
  };

  const handleStatusChange = async () => {
    if (!verificationDialog) return;

    const { agentId, field, currentStatus } =
      verificationDialog;

    try {
      const newStatus = !currentStatus ? "VERIFIED" : "UNVERIFIED";

      await verifyAgent(agentId, newStatus);

      setData((prevData) =>
        prevData.map((agent) =>
          agent.id === agentId ? { ...agent, [field]: !currentStatus } : agent,
        ),
      );

      closeVerificationDialog();
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Failed to update verification status");
    }
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

  const getVerificationStatus = (
    frontStatus?: boolean,
    backStatus?: boolean,
  ) => {
    if (frontStatus && backStatus) return "Verified";
    if (frontStatus || backStatus) return "Partial";
    return "Not Verified";
  };

  const getVerificationColor = (
    frontStatus?: boolean,
    backStatus?: boolean,
  ) => {
    if (frontStatus && backStatus) return "success";
    if (frontStatus || backStatus) return "warning";
    return "error";
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
        justifyContent="center"
        alignItems="center"
        minHeight="400px">
        <CircularProgress />
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
                  {data.map((agent) => (
                    <TableRow
                      key={agent.id}
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
                          <Person color="primary" sx={{ fontSize: 32 }} />
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
                              {new Date(agent.createdAt).toLocaleDateString()}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary">
                              {new Date(agent.createdAt).toLocaleTimeString()}
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

        {/* Verification Confirmation Dialog */}
        <Dialog
          open={!!verificationDialog}
          onClose={closeVerificationDialog}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>
            {verificationDialog?.currentStatus
              ? "Revoke Verification"
              : "Approve Verification"}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to{" "}
              {verificationDialog?.currentStatus ? "revoke" : "approve"} the{" "}
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
              variant="contained">
              {verificationDialog?.currentStatus ? "Revoke" : "Approve"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </ThemeProvider>
  );
};

export default AgentTable;