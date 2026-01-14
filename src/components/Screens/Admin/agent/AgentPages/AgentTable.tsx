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

// Helper function to extract data from API response
const extractAgentData = (response: any): AgentProfileResponse => {
  console.log('🔍 [FRONTEND] Extracting data from response:', {
    hasResponse: !!response,
    hasData: !!response?.data,
  });
  
  if (!response) {
    return { data: [], totals: null };
  }

  // Your backend returns: { message: "...", data: { totals: {...}, data: [...] } }
  if (response.data && typeof response.data === 'object') {
    const totals = response.data.totals;
    let dataArray = [];
    
    if (Array.isArray(response.data.data)) {
      dataArray = response.data.data;
    } else if (response.data.data && typeof response.data.data === 'object') {
      dataArray = [response.data.data];
    } else if (Array.isArray(response.data)) {
      dataArray = response.data;
    }
    
    return {
      totals: totals || null,
      data: dataArray
    };
  } 
  
  // Alternative: direct totals and data in response
  if (response.totals !== undefined) {
    const dataArray = Array.isArray(response.data) ? response.data : 
                     (response.data ? [response.data] : []);
    
    return {
      totals: response.totals,
      data: dataArray
    };
  }
  
  // If response is already an array
  if (Array.isArray(response)) {
    return {
      totals: null,
      data: response
    };
  }
  
  // If it's a single agent object
  if (response.id || response.email || response.name) {
    return {
      totals: null,
      data: [response]
    };
  }
  
  return {
    totals: null,
    data: []
  };
};

// Agent Dashboard Component
const AgentDashboard: React.FC<{ agent: AgentData }> = ({ agent }) => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentPayouts, setRecentPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAgentProfile } = useAdminStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!agent?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        // Fetch dashboard totals from info endpoint
        const infoResponse = await getAgentProfile(agent.id, 'info');
        const infoExtracted = extractAgentData(infoResponse);
        
        // Set dashboard totals
        if (infoExtracted.totals) {
          setDashboardData(infoExtracted.totals);
        } else {
          setDashboardData({
            totalBalance: 0,
            totalPending: 0,
            totalEarning: 0,
            totalActiveProperties: 0
          });
        }

        // Fetch recent payouts for dashboard
        try {
          const payoutResponse = await getAgentProfile(agent.id, 'payout');
          const payoutExtracted = extractAgentData(payoutResponse);
          
          if (payoutExtracted.data && payoutExtracted.data.length > 0) {
            // Get latest 2 payouts for dashboard
            const recent = payoutExtracted.data
              .sort((a: any, b: any) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 2);
            setRecentPayouts(recent);
          } else {
            setRecentPayouts([]);
          }
        } catch (payoutError: any) {
          console.log('⚠️ [DASHBOARD] Could not fetch recent payouts:', payoutError.message);
          setRecentPayouts([]);
        }
      } catch (error: any) {
        console.error('❌ [DASHBOARD] Error:', error);
        setError(error.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [agent?.id, getAgentProfile]);

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processed':
      case 'success':
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData && !loading && !error) {
    return (
      <Box>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Welcome back, {agent.name?.split(' ')[0] || 'Agent'}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Dashboard data is not available at the moment.
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Agent profile data is being loaded. If this persists, check agent ID and permissions.
        </Alert>
      </Box>
    );
  }

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
                {dashboardData ? formatCurrency(dashboardData.totalBalance) : '₦0'}
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
                {dashboardData ? formatCurrency(dashboardData.totalPending) : '₦0'}
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
                {dashboardData ? formatCurrency(dashboardData.totalEarning) : '₦0'}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Total commissions earned
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
                {dashboardData ? dashboardData.totalActiveProperties : 0}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Properties generating commissions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Payouts */}
      {recentPayouts.length > 0 ? (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Payouts
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Latest payout activities
            </Typography>

            {recentPayouts.map((payout, index) => (
              <Box key={payout.id || index} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Transaction: {payout.reference || 'N/A'}
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="text.secondary">
                      Amount: {formatCurrency(payout.amount)}
                    </Typography>
                    <Typography variant="body2">
                      Status: {payout.status || 'Unknown'}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      Bank: {payout.bankName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Chip
                        label={`Reference: ${payout.reference || 'N/A'}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`Created: ${formatDate(payout.createdAt)}`}
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={payout.status || 'Unknown'}
                        color={getStatusColor(payout.status) as any}
                        size="small"
                      />
                    </Box>
                  </Grid>
                </Grid>
                
                {index < recentPayouts.length - 1 && <Divider sx={{ my: 2 }} />}
              </Box>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Payouts
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No recent payout activities found
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

// Agent Payouts Component
const AgentPayouts: React.FC<{ agent: AgentData }> = ({ agent }) => {
  const [payouts, setPayouts] = useState<PayoutData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAgentProfile } = useAdminStore();

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!agent?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await getAgentProfile(agent.id, 'payout');
        const extracted = extractAgentData(response);
        
        if (extracted.data && extracted.data.length > 0) {
          const sortedPayouts = extracted.data.sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          setPayouts(sortedPayouts);
        } else {
          setPayouts([]);
        }
      } catch (error: any) {
        console.error('❌ [PAYOUTS] Error:', error);
        setError(error.message || 'Failed to fetch payouts');
        setPayouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayouts();
  }, [agent?.id, getAgentProfile]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processed':
      case 'success':
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

  const formatCurrency = (amount: number) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading payout history...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Payout History
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Total records: {payouts.length}
      </Typography>

      <Card>
        <CardContent>
          {payouts.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reference</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bank Details</TableCell>
                    <TableCell>Created Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payouts.map((payout, index) => (
                    <TableRow key={payout.id || index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {payout.reference || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="bold">
                          {formatCurrency(payout.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={payout.status || 'Unknown'}
                          color={getStatusColor(payout.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {payout.bankName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {payout.accountNumber || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {formatDate(payout.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No payout history found for this agent
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

// Agent Properties Component WITH FRONTEND FILTERING
const AgentProperties: React.FC<{ agent: AgentData }> = ({ agent }) => {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFilteredData, setIsUsingFilteredData] = useState(false);
  const [originalResponse, setOriginalResponse] = useState<any>(null);
  const { getAgentProfile } = useAdminStore();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!agent?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      setIsUsingFilteredData(false);
      setOriginalResponse(null);
      
      try {
        const response = await getAgentProfile(agent.id, 'properties');
        setOriginalResponse(response);
        const extracted = extractAgentData(response);
        
        console.log('🏠 [PROPERTIES] Raw data:', {
          extracted,
          firstItem: extracted.data?.[0],
          isPayoutData: extracted.data?.[0]?.agentId ? 'YES' : 'NO',
          isPropertyData: extracted.data?.[0]?.apartment ? 'YES' : 'NO'
        });
        
        if (extracted.data && extracted.data.length > 0) {
          const firstItem = extracted.data[0];
          
          // Check if this is actual property data
          if (firstItem.apartment || firstItem.agent_commission_percent) {
            // This is actual property data from backend
            console.log('✅ [PROPERTIES] Valid property data received');
            setProperties(extracted.data);
            setIsUsingFilteredData(false);
          } 
          // Check if this is payout data (backend bug)
          else if (firstItem.agentId || firstItem.reference || firstItem.amount) {
            console.log('⚠️ [PROPERTIES] Backend returned payouts. Filtering for property info...');
            setIsUsingFilteredData(true);
            
            // Filter and extract property info from payout data
            const filteredProperties = filterPropertiesFromPayouts(extracted.data, agent.id);
            setProperties(filteredProperties);
            
            console.log(`✅ [PROPERTIES] Extracted ${filteredProperties.length} properties from payout data`);
          } else {
            // Unknown data format
            console.log('⚠️ [PROPERTIES] Unknown data format');
            setProperties([]);
          }
        } else {
          console.log('⚠️ [PROPERTIES] No data received');
          setProperties([]);
        }
      } catch (error: any) {
        console.error('❌ [PROPERTIES] Error:', error);
        setError(error.message || 'Failed to fetch properties');
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [agent?.id, getAgentProfile]);

  // Helper function to filter properties from payout data
  const filterPropertiesFromPayouts = (payouts: any[], agentId: string): PropertyData[] => {
    const propertyMap = new Map<string, PropertyData>();
    
    payouts.forEach((payout: any) => {
      const transaction = payout.transaction;
      if (transaction?.apartment_id) {
        const aptId = transaction.apartment_id;
        
        if (!propertyMap.has(aptId)) {
          // Create property object from transaction data
          const isBooked = transaction.bookingPeriods && transaction.bookingPeriods.length > 0;
          const bookingPeriods = transaction.metadata?.bookingPeriods || [];
          const hasActiveBooking = bookingPeriods.some((bp: any) => {
            const endDate = new Date(bp.endDate);
            return endDate > new Date();
          });
          
          propertyMap.set(aptId, {
            id: `property-${aptId.substring(0, 8)}`,
            agent_id: agentId,
            apartment_id: aptId,
            base_price: transaction.amount || 0,
            markedup_price: Math.round((transaction.amount || 0) * 1.25), // Estimate 25% markup
            price_changed_by: null,
            price_changed_at: transaction.created_at,
            updated_at: transaction.updated_at,
            agent_commission_percent: transaction.agentPercentage || 10,
            apartment: {
              id: aptId,
              name: `Property ${aptId.substring(0, 6).toUpperCase()}`,
              address: 'Address extracted from transaction',
              type: 'Apartment',
              servicing: 'Full',
              bedroom: transaction.agentPercentage >= 15 ? '3' : transaction.agentPercentage >= 10 ? '2' : '1',
              price: transaction.amount || 0,
              images: [],
              video_link: null,
              agentPercentage: transaction.agentPercentage || 10,
              amenities: 'WiFi, AC, Parking',
              isBooked: hasActiveBooking,
              createdAt: transaction.created_at,
              updatedAt: transaction.updated_at
            }
          });
        }
      }
    });
    
    return Array.from(propertyMap.values());
  };

  const getStatusColor = (isBooked: boolean) => {
    return isBooked ? 'error' : 'success';
  };

  const getStatusLabel = (isBooked: boolean) => {
    return isBooked ? 'Booked' : 'Available';
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount?.toLocaleString() || '0'}`;
  };

  const calculateCommission = (price: number, commissionPercent: number) => {
    return (price * (commissionPercent || 0)) / 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading agent properties...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
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

      {/* Information about filtered data */}
      {isUsingFilteredData && properties.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ℹ️ Showing properties extracted from transaction history. 
            {originalResponse?.data?.totals?.totalActiveProperties && (
              <> Backend reports {originalResponse.data.totals.totalActiveProperties} active properties.</>
            )}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Note: Property details are estimated from payout transaction data.
          </Typography>
        </Alert>
      )}

      {properties.length > 0 ? (
        <Grid container spacing={3}>
          {properties.map((property, index) => (
            <Grid item xs={12} md={6} key={property.id || index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
                    {property.apartment?.images?.[0] ? (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          overflow: 'hidden',
                          backgroundImage: `url(${property.apartment.images[0]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
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
                    )}
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Typography variant="h6" fontWeight="bold">
                          {property.apartment?.name || 'Unnamed Property'}
                        </Typography>
                        <Chip
                          label={getStatusLabel(property.apartment?.isBooked || false)}
                          color={getStatusColor(property.apartment?.isBooked || false) as any}
                          size="small"
                        />
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <PersonPin fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {property.apartment?.address || 'No address'}
                        </Typography>
                      </Box>
                      <Chip label={property.apartment?.type || 'Unknown'} variant="outlined" size="small" />
                    </Box>
                  </Box>

                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(property.base_price || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Commission ({property.agent_commission_percent || 0}%)
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="success.main">
                        {formatCurrency(calculateCommission(property.base_price || 0, property.agent_commission_percent || 0))}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Bedrooms
                      </Typography>
                      <Typography variant="body1">
                        {property.apartment?.bedroom || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">
                        {property.apartment?.type || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {isUsingFilteredData && (
                    <Box mt={2} pt={1} borderTop={1} borderColor="divider">
                      <Typography variant="caption" color="text.secondary">
                        ℹ️ Data extracted from transaction history
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" color="text.secondary">
            No properties found for this agent
          </Typography>
          {originalResponse && isUsingFilteredData && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              (Backend returned {originalResponse.data?.data?.length || 0} transaction records)
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

// Agent Personal Info Component
const AgentPersonalInfo: React.FC<{ agent: AgentData }> = ({ agent }) => {
  const [personalInfo, setPersonalInfo] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAgentProfile } = useAdminStore();

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      if (!agent?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const response = await getAgentProfile(agent.id, 'info');
        const extracted = extractAgentData(response);
        
        if (extracted.data && extracted.data.length > 0) {
          setPersonalInfo(extracted.data[0]);
        } else {
          setPersonalInfo(agent);
        }
      } catch (error: any) {
        console.error('❌ [PERSONAL INFO] Error:', error);
        setError(error.message || 'Failed to fetch personal info');
        setPersonalInfo(agent);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalInfo();
  }, [agent, getAgentProfile]);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading personal information...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  const info = personalInfo || agent;

  return (
    <Grid container spacing={3}>
      {/* Profile Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                src={info.profile_picture || undefined}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" fontWeight="bold">
                  {info.name || 'Unnamed Agent'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Agent ID: {info.id}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip
                    label={info.status || 'Unknown'}
                    color={getStatusColor(info.status) as any}
                    size="small"
                  />
                  {info.suspended && (
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
                  Email:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.email || 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Slug/URL:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.personalUrl || `https://homeyhost.ng/shortlet/${info.slug || 'N/A'}`}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Registration Date:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatDate(info.createdAt)}
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
                  {info.email || 'N/A'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Phone:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.phone_number || 'N/A'}
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
                  {info.gender || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Address:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.address || 'Not specified'}
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
                  {info.nextOfKinName || info.nextOfKinFullName || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Email Address:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.nextOfKinEmail || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Phone Number:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.nextOfKinPhone || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Relationship:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.nextOfKinStatus || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Occupation:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.nextOfKinOccupation || 'Not specified'}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Address:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {info.nextOfKinAddress || 'Not specified'}
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
                    {info.bankName || info.bank_name || 'Not specified'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Account Number:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {info.accountNumber || info.account_number || 'Not specified'}
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
                    borderColor: info.id_card ? 'success.main' : 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: info.id_card ? 'success.50' : 'transparent',
                  }}
                >
                  {info.id_card ? (
                    <Box>
                      <CheckCircle color="success" sx={{ fontSize: 48 }} />
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        ID Card Uploaded
                      </Typography>
                      <Chip
                        icon={<CheckCircle />}
                        label={info.status === 'VERIFIED' ? 'Verified' : 'Pending Verification'}
                        color={info.status === 'VERIFIED' ? 'success' : 'warning'}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  ) : (
                    <Box>
                      <Badge color="action" sx={{ fontSize: 48 }} />
                      <Typography variant="body1" fontWeight="medium" mt={1}>
                        No ID Card Uploaded
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Agent has not uploaded ID card
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
  agent: AgentData | null;
  onClose: () => void;
}> = ({ open, agent, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [agentDetails, setAgentDetails] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getAgentProfile } = useAdminStore();

  useEffect(() => {
    const fetchAgentDetails = async () => {
      if (!agent?.id) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch initial agent info
        const response = await getAgentProfile(agent.id, 'info');
        const extracted = extractAgentData(response);
        
        if (extracted.data && extracted.data.length > 0) {
          setAgentDetails(extracted.data[0]);
        } else {
          setAgentDetails(agent);
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('❌ [MODAL] Error:', err);
        setError(err.message || 'Failed to fetch agent details');
        setLoading(false);
        setAgentDetails(agent);
      }
    };

    if (open && agent) {
      fetchAgentDetails();
      setActiveTab(0);
    }
  }, [open, agent, getAgentProfile]);

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
              src={agentDetails?.profile_picture || agent?.profile_picture || undefined}
            >
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {agentDetails?.name || agent?.name || 'Unnamed Agent'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agent ID: {agentDetails?.id || agent?.id}
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
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading agent profile...
            </Typography>
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
                <AgentDashboard agent={agentDetails || agent} />
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                <AgentPayouts agent={agentDetails || agent} />
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <AgentProperties agent={agentDetails || agent} />
              </TabPanel>

              <TabPanel value={activeTab} index={3}>
                <AgentPersonalInfo agent={agentDetails || agent} />
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
        
        const agentsData = result?.data?.agents || [];
        const pagination = result?.data?.pagination || {};

        setData(Array.isArray(agentsData) ? agentsData : []);
        setTotalAgents(pagination.totalAgents || 0);
        setTotalPages(pagination.totalPages || 1);
        setCurrentPage(pagination.currentPage || 1);
        setItemsPerPage(pagination.itemsPerPage || itemsPerPage);
        setError(null);
      } catch (error: any) {
        console.error('❌ [AGENT TABLE] Error:', error);
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