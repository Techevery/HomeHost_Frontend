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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Close,
  Person,
} from "@mui/icons-material";
import useAdminStore from "../../../../../stores/admin";

interface AgentPayoutsModalProps {
  open: boolean;
  agent: any;
  onClose: () => void;
}

const AgentPayoutsModal: React.FC<AgentPayoutsModalProps> = ({ open, agent, onClose }) => {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAdminStore();

  useEffect(() => {
    const fetchPayouts = async () => {
      if (!agent?.id || !token) return;

      try {
        setLoading(true);
        setError(null);
        // Mock API call - replace with actual endpoint
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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payouts');
        setLoading(false);
      }
    };

    if (open && agent) {
      fetchPayouts();
    }
  }, [open, agent, token]);

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
            >
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {agent?.name || 'Unnamed Agent'} - Payouts
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

export default AgentPayoutsModal;