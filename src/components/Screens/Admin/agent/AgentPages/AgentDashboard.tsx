import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Close,
  AccountBalanceWallet,
  CalendarToday,
  Payment,
  Home,
  Person,
} from "@mui/icons-material";
import useAdminStore from "../../../../../stores/admin";

interface AgentDashboardModalProps {
  open: boolean;
  agent: any;
  onClose: () => void;
}

const AgentDashboardModal: React.FC<AgentDashboardModalProps> = ({ open, agent, onClose }) => {
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
    }
  }, [open, agent, token]);

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
                {agent?.name || 'Unnamed Agent'} - Dashboard
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Agent ID: {agent?.id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Box>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Welcome back, {agent?.name?.split(' ')[0] || 'Agent'}
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

export default AgentDashboardModal;