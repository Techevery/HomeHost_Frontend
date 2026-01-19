import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Modal,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  Pagination,
  CircularProgress,
  Alert,
  Avatar
} from '@mui/material';
import { 
  Close as CloseIcon, 
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as ArrowUpIcon,
  AccountBalance as BalanceIcon,
  Schedule as PendingIcon,
  TrendingUp as EarningsIcon,
  Home as PropertiesIcon,
  AttachMoney as ChargesIcon,
  Receipt as ProofIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useAgentStore from '../../../../../../stores/agentstore'; // Updated import path

// Updated Interfaces to match backend data
interface Payout {
  id: string;
  agentId: string;
  transactionId?: string;
  amount: number;
  status: "pending" | "success" | "cancelled" | "rejected"; // Added "rejected"
  proof?: string;
  remark?: string;
  reason?: string;
  createdAt: Date;
  updatedAt?: Date;
  agent?: {
    id: string;
    name: string;
  };
  transaction?: {
    status: string;
    amount: number;
    agentPercentage: number;
    mockupPrice?: number;
    booking_end_date: Date;
    booking_start_date: Date;
    duration_days: number;
    date_paid?: Date;
    apartment?: {
      name: string;
    };
    bookingPeriods?: any[];
  };
  // New fields from backend
  accountNumber?: string;
  accountName?: string;
  bankName?: string;
  reference?: string;
  charges?: number;
}

interface WalletStats {
  totalEarnings: number;
  totalPending: number;
  totalSuccess: number;
  pendingPayout: number;
  upcomingPayout?: number;
  activeProperties: number;
  totalEarningsChange?: number;
  pendingPayoutChange?: number;
  upcomingChange?: number;
  activePropertiesChange?: number;
}

// Helper function to format date
const formatDate = (dateString: Date | string | null) => {
  if (!dateString) return 'N/A';
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to calculate net amount with charges
const calculateNetAmount = (payout: Payout): number => {
  const amount = payout.amount || 0;
  const charges = payout.charges || 0;
  return Math.max(0, amount - charges);
};

// Helper function to get payment method description
const getPaymentMethod = (payout: Payout): string => {
  if (payout.transaction?.agentPercentage) {
    return `Percentage (${payout.transaction.agentPercentage}%)`;
  }
  if (payout.transaction?.mockupPrice) {
    return `Markup (₦${payout.transaction.mockupPrice?.toLocaleString() || 0}/day)`;
  }
  return 'Standard';
};

// Helper function to get calculation string
const getCalculationString = (payout: Payout): string => {
  if (payout.transaction) {
    if (payout.transaction.agentPercentage && payout.transaction.amount) {
      return `₦${payout.transaction.amount.toLocaleString()} × ${payout.transaction.agentPercentage}%`;
    }
    if (payout.transaction.mockupPrice && payout.transaction.duration_days) {
      return `₦${payout.transaction.mockupPrice.toLocaleString()} × ${payout.transaction.duration_days} days`;
    }
  }
  return payout.amount ? `₦${payout.amount.toLocaleString()}` : 'N/A';
};

// Stats Cards Component
const StatsCards: React.FC<{ stats: WalletStats }> = ({ stats }) => (
  <Grid container spacing={3} mb={4}>
    {/* Pending Payout */}
    <Grid item xs={12} md={3}>
      <Card sx={{ 
        borderRadius: 3, 
        border: '1px solid #e0e0e0',
        background: 'linear-gradient(135deg, #acebdbc9 0%, #c6ececff 100%)',
        color: 'black',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Pending Payout
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                ₦{stats.pendingPayout.toLocaleString()}
              </Typography>
            </Box>
            <BalanceIcon sx={{ 
              fontSize: 40, 
              opacity: 0.8,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1
            }} />
          </Box>
          {stats.pendingPayoutChange !== undefined && (
            <Box display="flex" alignItems="center" mb={1}>
              <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
              <Typography variant="body2" sx={{ color: 'black' }}>
                +₦{stats.pendingPayoutChange.toLocaleString()} Month
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ color: 'rgba(24, 23, 23, 0.8)' }}>
            Cleaned funds ready for payout
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    
    {/* Upcoming Payout */}
    <Grid item xs={12} md={3}>
      <Card sx={{ 
        borderRadius: 3, 
        border: '1px solid #e0e0e0',
        background: 'linear-gradient(135deg, #f8d6deff 0%, #f3dfe2ff 100%)',
        color: 'black',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Upcoming Payout
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                ₦{(stats.upcomingPayout || 0).toLocaleString()}
              </Typography>
            </Box>
            <PendingIcon sx={{ 
              fontSize: 40, 
              opacity: 0.8,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1
            }} />
          </Box>
          {stats.upcomingChange !== undefined && (
            <Box display="flex" alignItems="center" mb={1}>
              <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
              <Typography variant="body2" sx={{ color: 'black' }}>
                +₦{stats.upcomingChange.toLocaleString()} this month
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ color: 'rgba(24, 23, 23, 0.8)' }}>
            Funds held until guest checkout
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    
    {/* Total Earnings */}
    <Grid item xs={12} md={3}>
      <Card sx={{ 
        borderRadius: 3, 
        border: '1px solid #e0e0e0',
        background: 'linear-gradient(135deg, #abecdcc9 0%, #c6ececff 100%)',
        color: 'black',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Total Earnings
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                ₦{stats.totalEarnings.toLocaleString()}
              </Typography>
            </Box>
            <EarningsIcon sx={{ 
              fontSize: 40, 
              opacity: 0.8,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1
            }} />
          </Box>
          {stats.totalEarningsChange !== undefined && (
            <Box display="flex" alignItems="center" mb={1}>
              <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
              <Typography variant="body2" sx={{ color: 'black' }}>
                +{stats.totalEarningsChange}% this month
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ color: 'rgba(26, 25, 25, 0.8)' }}>
            Total commissions this month
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    
    {/* Active Properties */}
    <Grid item xs={12} md={3}>
      <Card sx={{ 
        borderRadius: 3, 
        border: '1px solid #e0e0e0',
        background: 'linear-gradient(135deg, #98a79dff 0%, #b9c2c0ff 100%)',
        color: 'black',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Active Properties
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                {stats.activeProperties}
              </Typography>
            </Box>
            <PropertiesIcon sx={{ 
              fontSize: 40, 
              opacity: 0.8,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              p: 1
            }} />
          </Box>
          {stats.activePropertiesChange !== undefined && (
            <Box display="flex" alignItems="center" mb={1}>
              <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
              <Typography variant="body2" sx={{ color: 'black' }}>
                +{stats.activePropertiesChange} this month
              </Typography>
            </Box>
          )}
          <Typography variant="body2" sx={{ color: 'rgba(24, 24, 24, 0.8)' }}>
            Properties generating income
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Reusable Payout Section Component
const PayoutsSection: React.FC<{
  title: string;
  description: string;
  payouts: Payout[];
  status: "pending" | "success" | "cancelled" | "rejected";
  onViewDetails: (payout: Payout) => void;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}> = ({ title, description, payouts, status, onViewDetails, page, onPageChange }) => {
  const itemsPerPage = 3;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPayouts = payouts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(payouts.length / itemsPerPage);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return 'success';
      case "pending":
        return 'warning';
      case "cancelled":
        return 'error';
      case "rejected":
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return 'Processed';
      case "pending":
        return 'Pending';
      case "cancelled":
        return 'Cancelled';
      case "rejected":
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <Card sx={{ borderRadius: 3, mb: 3, width: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          <Button variant="text" size="small">
            View All
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          {description}
        </Typography>
        
        {paginatedPayouts.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No payouts found
          </Typography>
        ) : (
          <>
            {paginatedPayouts.map((payout, index) => (
              <Box key={payout.id} mb={3}>
                <Grid container spacing={2} alignItems="flex-start">
                  {/* Property Information */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {payout.transaction?.apartment?.name || payout.reference || 'Transaction N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Method: {getPaymentMethod(payout)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Reference: {payout.reference || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Created: {formatDate(payout.createdAt)}
                    </Typography>
                    {payout.transaction?.booking_end_date && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Checkout: {formatDate(payout.transaction.booking_end_date)}
                      </Typography>
                    )}
                  </Grid>
                  
                  {/* Calculation Details */}
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Payment Details
                    </Typography>
                    <Box mb={1}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                        Gross Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                        ₦{(payout.amount || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box mb={1}>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                        Charges
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" fontSize="0.9rem" color="error">
                        - ₦{(payout.charges || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                        Net Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                        ₦{calculateNetAmount(payout).toLocaleString()}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  {/* Status and Actions */}
                  <Grid item xs={12} md={4}>
                    <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Chip
                          label={getStatusLabel(payout.status)}
                          color={getStatusColor(payout.status) as any}
                          size="small"
                        />
                        <Button 
                          variant="outlined" 
                          size="small"
                          onClick={() => onViewDetails(payout)}
                        >
                          View Details
                        </Button>
                      </Box>
                      {payout.bankName && (
                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                          Bank: {payout.bankName}
                        </Typography>
                      )}
                      {payout.accountNumber && (
                        <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                          Account: {payout.accountNumber}
                        </Typography>
                      )}
                      {/* Show rejection reason if available in list view */}
                      {payout.status === "rejected" && payout.reason && (
                        <Box mt={1}>
                          <Typography variant="body2" color="error" fontSize="0.8rem" fontWeight="medium">
                            <ErrorIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                            Reason: {payout.reason}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                {index < paginatedPayouts.length - 1 && (
                  <Divider sx={{ my: 2 }} />
                )}
              </Box>
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={onPageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Bank Details Section
const BankDetailsSection: React.FC<{
  agentInfo: any;
}> = ({ agentInfo }) => (
  <Card sx={{ borderRadius: 3, mb: 3 }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Bank Details
      </Typography>
      {agentInfo?.bank_name ? (
        <>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Bank
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {agentInfo.bank_name}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Account
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {agentInfo.account_number || 'N/A'}
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Account Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {agentInfo.name || 'N/A'}
            </Typography>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Please update your bank details in profile settings
        </Typography>
      )}
    </CardContent>
  </Card>
);

// Next Payout Section
const NextPayoutSection: React.FC<{
  payouts: Payout[];
}> = ({ payouts }) => {
  // Find the next upcoming payout (pending status)
  const nextPayout = payouts
    .filter(p => p.status === "pending")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  if (!nextPayout) {
    return (
      <Card sx={{ borderRadius: 3, background: 'white', color: 'black' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Next Payout
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No upcoming payouts
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, background: 'white', color: 'black' }}>
      <CardContent>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Next Payout
        </Typography>
        <Box mb={2}>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.8)' }}>
            Amount
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            ₦{calculateNetAmount(nextPayout).toLocaleString()}
          </Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.8)' }}>
            Expected
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {nextPayout.transaction?.booking_end_date 
              ? formatDate(nextPayout.transaction.booking_end_date)
              : formatDate(nextPayout.createdAt)}
          </Typography>
        </Box>
        <Box mb={3}>
          <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.8)' }}>
            Reference
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {nextPayout.reference || 'N/A'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Wallet Dashboard Component
const WalletDashboard: React.FC = () => {
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Pagination states for each tab
  const [payoutPage, setPayoutPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);

  // Use agent store instead of wallet store
  const { 
    agentInfo,
    agentPayouts,
    agentTransactions,
    transactionsLoading,
    error,
    fetchAgentTransactions,
    fetchAgentPayouts,
    clearError,
    clearAgentTransactions
  } = useAgentStore();

  // Calculate wallet stats from agent payouts and transactions
  const calculateWalletStats = (): WalletStats => {
    const successfulPayouts = agentPayouts.filter(p => p.status === "success");
    const pendingPayouts = agentPayouts.filter(p => p.status === "pending");
    const rejectedPayouts = agentPayouts.filter(p => p.status === "rejected");
    
    const totalEarnings = successfulPayouts.reduce((sum, payout) => sum + calculateNetAmount(payout), 0);
    const totalPending = pendingPayouts.reduce((sum, payout) => sum + calculateNetAmount(payout), 0);
    
    // Calculate unique properties from payouts
    const uniqueProperties = new Set(
      agentPayouts
        .filter(p => p.transaction?.apartment?.name)
        .map(p => p.transaction!.apartment!.name)
    ).size;

    return {
      totalEarnings,
      totalPending,
      totalSuccess: successfulPayouts.length + rejectedPayouts.length,
      pendingPayout: totalPending,
      upcomingPayout: totalPending,
      activeProperties: uniqueProperties,
      totalEarningsChange: 0,
      pendingPayoutChange: 0,
      upcomingChange: 0,
      activePropertiesChange: 0
    };
  };

  const walletStats = calculateWalletStats();

  const processedPayouts = agentPayouts.filter(p => 
    p.status === "success" || p.status === "cancelled" || p.status === "rejected"
  );

  const pendingPayouts = agentPayouts.filter(p => p.status === "pending");

  const upcomingPayouts = agentPayouts.filter(p => {
    const transactionStatus = p.transaction?.status?.toLowerCase();
    return transactionStatus === "upcoming" || transactionStatus === "ongoing" || 
           transactionStatus === "booked" || transactionStatus === "pending";
  });

  useEffect(() => {
    if (walletModalOpen) {
      fetchAgentTransactions();
      fetchAgentPayouts();
    }
  }, [walletModalOpen, fetchAgentTransactions, fetchAgentPayouts]);

  const handleWalletClick = () => {
    setWalletModalOpen(true);
  };

  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setDetailModalOpen(true);
  };

  const handleCloseWalletModal = () => {
    setWalletModalOpen(false);
    clearError();
    clearAgentTransactions();
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPayout(null);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handlePayoutPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPayoutPage(value);
  };

  const handlePendingPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPendingPage(value);
  };

  const handleUpcomingPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setUpcomingPage(value);
  };

  return (
    <>
      {/* Wallet Button */}
      <Button
        variant="outlined"
        startIcon={<WalletIcon />}
        onClick={handleWalletClick}
        size="small"
      >
        Wallet
      </Button>

      {/* Main Wallet Dashboard Modal */}
      <Modal
        open={walletModalOpen}
        onClose={handleCloseWalletModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Paper
          sx={{
            width: '95%',
            maxWidth: 1400,
            maxHeight: '95vh',
            overflow: 'auto',
            borderRadius: 3,
            p: 3
          }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                View Your Earnings 
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track your commissions and payouts
              </Typography>
            </Box>
            <IconButton onClick={handleCloseWalletModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
              {error}
            </Alert>
          )}

          {/* Loading Indicator */}
          {transactionsLoading && (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          )}

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label={`Processed (${processedPayouts.length})`} />
              <Tab label={`Pending (${pendingPayouts.length})`} />
              <Tab label={`Upcoming (${upcomingPayouts.length})`} />
            </Tabs>
          </Box>

          {/* Stats Cards */}
          <StatsCards stats={walletStats} />

          {/* Main Content - Different content for each tab */}
          {!transactionsLoading && (
            <>
              {activeTab === 0 && (
                <Box>
                  <PayoutsSection 
                    title="Processed Payouts"
                    description="Successfully processed, cancelled, and rejected payouts"
                    payouts={processedPayouts}
                    status={"success"}
                    onViewDetails={handleViewDetails}
                    page={payoutPage}
                    onPageChange={handlePayoutPageChange}
                  />

                  {/* Bottom Section - Bank Details and Next Payout */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <BankDetailsSection agentInfo={agentInfo} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <NextPayoutSection payouts={agentPayouts} />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <PayoutsSection 
                    title="Pending Payouts"
                    description="Payouts awaiting processing"
                    payouts={pendingPayouts}
                    status={"pending"}
                    onViewDetails={handleViewDetails}
                    page={pendingPage}
                    onPageChange={handlePendingPageChange}
                  />
                  
                  {/* Bottom Section */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <BankDetailsSection agentInfo={agentInfo} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <NextPayoutSection payouts={agentPayouts} />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <PayoutsSection 
                    title="Upcoming Payouts"
                    description="Future payouts based on upcoming and ongoing bookings"
                    payouts={upcomingPayouts}
                    status={"pending"}
                    onViewDetails={handleViewDetails}
                    page={upcomingPage}
                    onPageChange={handleUpcomingPageChange}
                  />
                  
                  {/* Bottom Section */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <BankDetailsSection agentInfo={agentInfo} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <NextPayoutSection payouts={agentPayouts} />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Modal>

      {/* Payout Details Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Payout Details
            </Typography>
            <IconButton onClick={handleCloseDetailModal}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPayout && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom mb={3}>
                Transaction Reference: {selectedPayout.reference || 'N/A'}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  {/* Payment Information */}
                  <Box mb={4}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      Payment Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Typography 
                          variant="body1" 
                          gutterBottom 
                          fontWeight="medium"
                          sx={{
                            color: selectedPayout.status === "rejected" ? "error.main" : "inherit"
                          }}
                        >
                          {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
                          {selectedPayout.status === "rejected" && " ⚠️"}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body1" gutterBottom fontWeight="medium">
                          {formatDate(selectedPayout.createdAt)}
                        </Typography>
                      </Grid>
                      
                      {selectedPayout.updatedAt && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Updated
                          </Typography>
                          <Typography variant="body1" gutterBottom fontWeight="medium">
                            {formatDate(selectedPayout.updatedAt)}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Amount Breakdown */}
                  <Box mb={4}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      Amount Breakdown
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Gross Amount:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            ₦{(selectedPayout.amount || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Charges:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium" color="error">
                            - ₦{(selectedPayout.charges || 0).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body1" fontWeight="bold">
                            Net Amount:
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            ₦{calculateNetAmount(selectedPayout).toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Bank Information */}
                  {(selectedPayout.bankName || selectedPayout.accountNumber) && (
                    <Box mb={4}>
                      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        Bank Information
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {selectedPayout.bankName && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Bank
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedPayout.bankName}
                            </Typography>
                          </Grid>
                        )}
                        
                        {selectedPayout.accountNumber && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Account Number
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedPayout.accountNumber}
                            </Typography>
                          </Grid>
                        )}
                        
                        {selectedPayout.accountName && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Account Name
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedPayout.accountName}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  {/* Proof of Payment */}
                  {selectedPayout.proof && (
                    <Box mb={4}>
                      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        Proof of Payment
                      </Typography>
                      <Box display="flex" flexDirection="column" alignItems="center">
                        <Avatar
                          src={selectedPayout.proof}
                          variant="rounded"
                          sx={{ width: 200, height: 150, mb: 2 }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<ProofIcon />}
                          href={selectedPayout.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View Full Image
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Remarks & Reasons */}
                  <Box>
                    {/* Enhanced Rejection Details Section */}
                    {selectedPayout.status === "rejected" && (
                      <Box mb={4}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2} color="error">
                          <ErrorIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Rejection Details
                        </Typography>
                        
                        {selectedPayout.reason ? (
                          <>
                            <Card variant="outlined" sx={{ 
                              p: 2, 
                              mb: 2,
                              bgcolor: 'error.light',
                              borderColor: 'error.main',
                              borderWidth: 2
                            }}>
                              <Box display="flex" alignItems="flex-start">
                                <ErrorIcon sx={{ mr: 1, mt: 0.5, color: 'error.main' }} />
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="bold" mb={1} color="error.dark">
                                    Reason for Rejection
                                  </Typography>
                                  <Typography variant="body2" color="error.dark">
                                    {selectedPayout.reason}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                            
                            {selectedPayout.remark && (
                              <Card variant="outlined" sx={{ p: 2, bgcolor: 'warning.light', borderColor: 'warning.main' }}>
                                <Box display="flex" alignItems="flex-start">
                                  <InfoIcon sx={{ mr: 1, mt: 0.5, color: 'warning.dark' }} />
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={1} color="warning.dark">
                                      Additional Remarks
                                    </Typography>
                                    <Typography variant="body2" color="warning.dark">
                                      {selectedPayout.remark}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Card>
                            )}
                          </>
                        ) : (
                          <Card variant="outlined" sx={{ 
                            p: 2, 
                            bgcolor: 'error.light',
                            borderColor: 'error.main'
                          }}>
                            <Box display="flex" alignItems="flex-start">
                              <ErrorIcon sx={{ mr: 1, mt: 0.5, color: 'error.main' }} />
                              <Box>
                            
                                <Typography variant="body2" color="error.dark">
                                  This payout has been rejected. Please contact support for more information.
                                </Typography>
                                {selectedPayout.remark && (
                                  <>
                                    <Typography variant="body2" color="error.dark">
                                      {selectedPayout.remark}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Box>
                          </Card>
                        )}
                        
                     
                      </Box>
                    )}

                    {/* Original remarks for non-rejected payouts */}
                    {selectedPayout.remark && selectedPayout.status !== "rejected" && (
                      <Box mb={4}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                          Remarks
                        </Typography>
                        <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body2">
                            {selectedPayout.remark}
                          </Typography>
                        </Card>
                      </Box>
                    )}

                    {/* Original reason for non-rejected payouts */}
                    {selectedPayout.reason && selectedPayout.status !== "rejected" && (
                      <Box mb={4}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                          Reason
                        </Typography>
                        <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="body2">
                            {selectedPayout.reason}
                          </Typography>
                        </Card>
                      </Box>
                    )}
                  </Box>

                  {/* Transaction Details */}
                  {selectedPayout.transaction && (
                    <Box mb={4}>
                      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        Transaction Details
                      </Typography>
                      
                      <Grid container spacing={2}>
                        {selectedPayout.transaction.booking_start_date && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Booking Start
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {formatDate(selectedPayout.transaction.booking_start_date)}
                            </Typography>
                          </Grid>
                        )}
                        
                        {selectedPayout.transaction.booking_end_date && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Booking End
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {formatDate(selectedPayout.transaction.booking_end_date)}
                            </Typography>
                          </Grid>
                        )}
                        
                        {selectedPayout.transaction.duration_days && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Duration
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedPayout.transaction.duration_days} days
                            </Typography>
                          </Grid>
                        )}
                        
                        {selectedPayout.transaction.agentPercentage && (
                          <Grid item xs={6}>
                            <Typography variant="body2" color="text.secondary">
                              Commission
                            </Typography>
                            <Typography variant="body1" fontWeight="medium">
                              {selectedPayout.transaction.agentPercentage}%
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WalletDashboard;