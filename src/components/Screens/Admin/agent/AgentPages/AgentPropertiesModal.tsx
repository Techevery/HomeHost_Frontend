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
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Close,
  Person,
  Home,
  PersonPin,
} from "@mui/icons-material";
import useAdminStore from "../../../../../stores/admin";

interface AgentPropertiesModalProps {
  open: boolean;
  agent: any;
  onClose: () => void;
}

const AgentPropertiesModal: React.FC<AgentPropertiesModalProps> = ({ open, agent, onClose }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAdminStore();

  useEffect(() => {
    const fetchProperties = async () => {
      if (!agent?.id || !token) return;

      try {
        setLoading(true);
        setError(null);
        // Mock API call - replace with actual endpoint
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
      } catch (err: any) {
        setError(err.message || 'Failed to fetch properties');
        setLoading(false);
      }
    };

    if (open && agent) {
      fetchProperties();
    }
  }, [open, agent, token]);

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
                {agent?.name || 'Unnamed Agent'} - Properties
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

export default AgentPropertiesModal;