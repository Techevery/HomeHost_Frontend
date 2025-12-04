import React, { useState } from 'react';
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
  Pagination
} from '@mui/material';
import { 
  Close as CloseIcon, 
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as ArrowUpIcon,
  AccountBalance as BalanceIcon,
  Schedule as PendingIcon,
  TrendingUp as EarningsIcon,
  Home as PropertiesIcon,
} from '@mui/icons-material';
// import Payout from '@/components/Screens/Admin/payout/PayoutPages/Payout';

// Interfaces
interface Payout {
  id: string;
  property: string;
  method: string;
  booking: string;
  checkout: string;
  amount: number;
  status: 'pending' | 'upcoming' | 'processed';
  percentage?: number;
  markup?: number;
  calculation?: string;
  processedDate?: string;
  netAmount?: number;
}

interface WalletStats {
  PendingPayout: number;
  upcoming: number;
  totalEarnings: number;
  activeProperties: number;
  PendingPayoutChange: number;
   upcomingChange: number;
  totalEarningsChange: number;
  activePropertiesChange: number;
}

// Reusable Stats Cards Component with Icons
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
                ₦{stats.PendingPayout.toLocaleString()}
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
          <Box display="flex" alignItems="center" mb={1}>
            <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
            <Typography variant="body2" sx={{ color: 'black' }}>
              +₦{stats.PendingPayoutChange.toLocaleString()} Month
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(24, 23, 23, 0.8)' }}>
            Cleaned funds ready for payout
          </Typography>
        </CardContent>
      </Card>
    </Grid>
    
    {/* Upcoming */}
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
                Upcoming
              </Typography>
              <Typography variant="h4" fontWeight="bold" mb={1}>
                ₦{stats.upcoming.toLocaleString()}
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
          <Box display="flex" alignItems="center" mb={1}>
            <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
            <Typography variant="body2" sx={{ color: 'black' }}>
              +₦{stats.upcomingChange.toLocaleString()} this month
            </Typography>
          </Box>
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
          <Box display="flex" alignItems="center" mb={1}>
            <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
            <Typography variant="body2" sx={{ color: 'black' }}>
              +{stats.totalEarningsChange}% this month
            </Typography>
          </Box>
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
          <Box display="flex" alignItems="center" mb={1}>
            <ArrowUpIcon sx={{ fontSize: 16, mr: 0.5, color: 'black' }} />
            <Typography variant="body2" sx={{ color: 'black' }}>
              +{stats.activePropertiesChange} this month
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(24, 24, 24, 0.8)' }}>
            Properties generating income
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// Recent Payouts Section matching the image with New Details for each payout
const RecentPayoutsSection: React.FC<{
  payouts: Payout[];
  onViewDetails: (payout: Payout) => void;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}> = ({ payouts, onViewDetails, page, onPageChange }) => {
  const itemsPerPage = 3;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPayouts = payouts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(payouts.length / itemsPerPage);

  return (
    <Card sx={{ borderRadius: 3, mb: 3, width: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Recent Payouts
          </Typography>
          <Button variant="text" size="small">
            View All
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          Payouts are processed on checkout dates
        </Typography>
        
        {paginatedPayouts.map((payout, index) => (
          <Box key={payout.id} mb={3}>
            <Grid container spacing={2} alignItems="flex-start">
              {/* First Grid - Property Information */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {payout.property}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Method: {payout.method}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Booking: {payout.booking}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Checkout: {payout.checkout}
                </Typography>
              </Grid>
              
              {/* Second Grid - New Details */}
              <Grid item xs={12} md={4}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  New Details
                </Typography>
                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Calculations
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                    {payout.calculation}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Processed
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                    {payout.processedDate}
                  </Typography>
                </Box>
              </Grid>
              
              {/* Third Grid - Processed and View Details */}
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label="Processed"
                      color="success"
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
                </Box>
              </Grid>
            </Grid>
            
            {index < paginatedPayouts.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
        
        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={onPageChange}
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Bank Details Section
const BankDetailsSection: React.FC<{
  bankName: string;
  accountNumber: string;
  accountName: string;
}> = ({ bankName, accountNumber, accountName }) => (
  <Card sx={{ borderRadius: 3, mb: 3 }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Bank Details
      </Typography>
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Bank
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {bankName}
        </Typography>
      </Box>
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Account
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {accountNumber}
        </Typography>
      </Box>
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary">
          Name
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {accountName}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

// Next Payout Section
const NextPayoutSection: React.FC<{
  amount: number;
  expectedDate: string;
  property: string;
  onViewDetails: () => void;
}> = ({ amount, expectedDate, property, onViewDetails }) => (
  <Card sx={{ 
    borderRadius: 3, 
    background: 'white',
    color: 'black'
  }}>
    <CardContent>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Next Payout
      </Typography>
      <Box mb={2}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Amount
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          ₦{amount.toLocaleString()}
        </Typography>
      </Box>
      <Box mb={2}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Expected
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {expectedDate}
        </Typography>
      </Box>
      <Box mb={3}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Property
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {property}
        </Typography>
      </Box>
      
    </CardContent>
  </Card>
);

// Pending Payouts Section
const PendingPayoutsSection: React.FC<{
  payouts: Payout[];
  onViewDetails: (payout: Payout) => void;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}> = ({ payouts, onViewDetails, page, onPageChange }) => {
  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const itemsPerPage = 3;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPayouts = pendingPayouts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(pendingPayouts.length / itemsPerPage);

  return (
    <Card sx={{ borderRadius: 3, mb: 3, width: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Pending Payouts
          </Typography>
          <Button variant="text" size="small">
            View All
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          Payouts awaiting guest checkout
        </Typography>
        
        {paginatedPayouts.map((payout, index) => (
          <Box key={payout.id} mb={3}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {payout.property}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Method: {payout.method}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Booking: {payout.booking}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Checkout: {payout.checkout}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  New Details
                </Typography>
                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Calculations
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                    {payout.calculation}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Net
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                    ₦{payout.netAmount?.toLocaleString() || '9,950'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label="Pending"
                      color="warning"
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
                </Box>
              </Grid>
            </Grid>
            
            {index < paginatedPayouts.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
        
        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={onPageChange}
            color="primary"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Upcoming Payouts Section
const UpcomingPayoutsSection: React.FC<{
  payouts: Payout[];
  onViewDetails: (payout: Payout) => void;
  page: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
}> = ({ payouts, onViewDetails, page, onPageChange }) => {
  const upcomingPayouts = payouts.filter(p => p.status === 'upcoming');
  const itemsPerPage = 3;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedPayouts = upcomingPayouts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(upcomingPayouts.length / itemsPerPage);

  return (
    <Card sx={{ borderRadius: 3, mb: 3, width: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Upcoming Payouts
          </Typography>
          <Button variant="text" size="small">
            View All
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          Future payouts based on confirmed bookings
        </Typography>
        
        {paginatedPayouts.map((payout, index) => (
          <Box key={payout.id} mb={3}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {payout.property}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Method: {payout.method}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Booking: {payout.booking}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Checkout: {payout.checkout}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  New Details
                </Typography>
                <Box mb={1}>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Calculations
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                    {payout.calculation}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                    Net
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontSize="0.9rem">
                    ₦{payout.netAmount?.toLocaleString() || '9,950'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box display="flex" flexDirection="column" gap={1} alignItems="flex-start">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label="Upcoming"
                      color="info"
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
                </Box>
              </Grid>
            </Grid>
            
            {index < paginatedPayouts.length - 1 && (
              <Divider sx={{ my: 2 }} />
            )}
          </Box>
        ))}
        
        {/* Pagination */}
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={onPageChange}
            color="primary"
          />
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

  const [walletStats] = useState<WalletStats>({
    PendingPayout: 29950,
    upcoming: 45000,
    totalEarnings: 185950,
    activeProperties: 12,
    PendingPayoutChange: 15000,
    upcomingChange: 20000,
    totalEarningsChange: 22.5,
    activePropertiesChange: 2
  });

  const [payouts] = useState<Payout[]>([
    {
      id: '1',
      property: 'Luxury 2BR Apartment - Lekki Phase 1',
      method: 'Percentage (10%)',
      booking: 'BK-7829',
      checkout: 'Nov 20, 2025',
      amount: 45000,
      status: 'processed',
      percentage: 10,
      calculation: 'N100,000 × 10%',
      processedDate: 'Nov 20, 2025',
      netAmount: 45000
    },
    {
      id: '2',
      property: 'Studio Apartment - Ikeja GRA',
      method: 'Markup (₦5000/day)',
      booking: 'BK-7830',
      checkout: 'Nov 22, 2025',
      amount: 19950,
      status: 'processed',
      markup: 5000,
      calculation: 'N100,000 × 10%',
      processedDate: 'Nov 20, 2025',
      netAmount: 19950
    },
    {
      id: '3',
      property: '3BR Duplex - Victoria Island',
      method: 'Percentage (8%)',
      booking: 'BK-7831',
      checkout: 'Nov 25, 2025',
      amount: 32000,
      status: 'processed',
      percentage: 8,
      calculation: 'N100,000 × 10%',
      processedDate: 'Nov 20, 2025',
      netAmount: 32000
    },
    {
      id: '4',
      property: 'Penthouse - Banana Island',
      method: 'Percentage (12%)',
      booking: 'BK-7832',
      checkout: 'Dec 05, 2025',
      amount: 75000,
      status: 'pending',
      percentage: 12,
      calculation: 'N150,000 × 12%',
      netAmount: 9950
    },
    {
      id: '5',
      property: '1BR Apartment - Yaba',
      method: 'Markup (₦3000/day)',
      booking: 'BK-7833',
      checkout: 'Dec 10, 2025',
      amount: 15000,
      status: 'upcoming',
      markup: 3000,
      calculation: 'N50,000 × 10%',
      netAmount: 9950
    },
    {
      id: '6',
      property: '2BR Apartment - Surulere',
      method: 'Percentage (10%)',
      booking: 'BK-7834',
      checkout: 'Dec 15, 2025',
      amount: 25000,
      status: 'pending',
      percentage: 10,
      calculation: 'N80,000 × 10%',
      netAmount: 9950
    },
    {
      id: '7',
      property: '4BR Duplex - Ikoyi',
      method: 'Markup (₦8000/day)',
      booking: 'BK-7835',
      checkout: 'Dec 20, 2025',
      amount: 120000,
      status: 'upcoming',
      markup: 8000,
      calculation: 'N200,000 × 10%',
      netAmount: 9950
    }
  ]);

  const handleWalletClick = () => {
    setWalletModalOpen(true);
  };

  const handleViewDetails = (payout: Payout) => {
    setSelectedPayout(payout);
    setDetailModalOpen(true);
  };

  const handleCloseWalletModal = () => {
    setWalletModalOpen(false);
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
             
            </Box>
            <IconButton onClick={handleCloseWalletModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Payout" />
              <Tab label="Pending Payout" />
              <Tab label="Upcoming Payout" />
            </Tabs>
          </Box>

          {/* Stats Cards - Now available on all tabs with Total Earnings included */}
          <StatsCards stats={walletStats} />

          {/* Main Content - Different content for each tab */}
          {activeTab === 0 && (
            <Box>
              {/* Recent Payouts - Full Width */}
              <RecentPayoutsSection 
                payouts={payouts} 
                onViewDetails={handleViewDetails}
                page={payoutPage}
                onPageChange={handlePayoutPageChange}
              />

              {/* Bottom Section - Bank Details and Next Payout */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <BankDetailsSection
                    bankName="GTBank"
                    accountNumber="......8789"
                    accountName="John Doe"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <NextPayoutSection
                    amount={19950}
                    expectedDate="Nov 22, 2025"
                    property="Studio Apartment - Ikeja"
                    onViewDetails={() => {/* Implement view details */}}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Pending Payout Tab */}
          {activeTab === 1 && (
            <Box>
              <PendingPayoutsSection 
                payouts={payouts} 
                onViewDetails={handleViewDetails}
                page={pendingPage}
                onPageChange={handlePendingPageChange}
              />
              
              {/* Additional content for pending payouts tab can go here */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <BankDetailsSection
                    bankName="GTBank"
                    accountNumber="......8789"
                    accountName="John Doe"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <NextPayoutSection
                    amount={19950}
                    expectedDate="Nov 22, 2025"
                    property="Studio Apartment - Ikeja"
                    onViewDetails={() => {/* Implement view details */}}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Upcoming Payout Tab */}
          {activeTab === 2 && (
            <Box>
              <UpcomingPayoutsSection 
                payouts={payouts} 
                onViewDetails={handleViewDetails}
                page={upcomingPage}
                onPageChange={handleUpcomingPageChange}
              />
              
              {/* Additional content for upcoming payouts tab can go here */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <BankDetailsSection
                    bankName="GTBank"
                    accountNumber="......8789"
                    accountName="John Doe"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <NextPayoutSection
                    amount={19950}
                    expectedDate="Nov 22, 2025"
                    property="Studio Apartment - Ikeja"
                    onViewDetails={() => {/* Implement view details */}}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Modal>

      {/* Payout Details Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="sm"
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
              <Typography variant="h6" gutterBottom>
                {selectedPayout.property}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Method: {selectedPayout.method}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Booking: {selectedPayout.booking}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Checkout: {selectedPayout.checkout}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Amount: ₦{selectedPayout.amount.toLocaleString()}
              </Typography>
              {selectedPayout.netAmount && (
                <Typography variant="body1" gutterBottom>
                  Net: ₦{selectedPayout.netAmount.toLocaleString()}
                </Typography>
              )}
              <Typography variant="body1" gutterBottom>
                Status: {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
              </Typography>
              {selectedPayout.percentage && (
                <Typography variant="body1" gutterBottom>
                  Commission: {selectedPayout.percentage}%
                </Typography>
              )}
              {selectedPayout.markup && (
                <Typography variant="body1" gutterBottom>
                  Markup: ₦{selectedPayout.markup.toLocaleString()}/day
                </Typography>
              )}
              {selectedPayout.calculation && (
                <Typography variant="body1" gutterBottom>
                  Calculation: {selectedPayout.calculation}
                </Typography>
              )}
              {selectedPayout.processedDate && (
                <Typography variant="body1" gutterBottom>
                  Processed: {selectedPayout.processedDate}
                </Typography>
              )}
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