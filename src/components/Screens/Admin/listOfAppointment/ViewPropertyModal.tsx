import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,

  Avatar,
  Button,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn,
  Hotel,
  Bathtub,
 
} from '@mui/icons-material';

interface ViewDetailsModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onEdit?: () => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  open,
  onClose,
  property,
  onEdit,
}) => {
  const theme = useTheme();

  if (!property) return null;

  const safeString = (value: any, fallback: string = 'Not specified') => {
    return value?.toString() || fallback;
  };

  const safeArray = (value: any) => {
    return Array.isArray(value) ? value : [];
  };

  const formatPrice = (price: string | undefined) => {
    if (!price) return '₦0';
    try {
      return `₦${parseInt(price).toLocaleString()}`;
    } catch {
      return `₦${price}`;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'default';
    const statusLower = status.toLowerCase();
    if (statusLower === 'available') return 'success';
    if (statusLower === 'rented') return 'error';
    if (statusLower === 'maintenance') return 'warning';
    return 'default';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h5" fontWeight="bold">
          Property Details
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Image Gallery */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: 'relative', height: 400 }}>
              <Avatar
                variant="square"
                src={safeArray(property.images)[0] || '/default-property.jpg'}
                sx={{ 
                  width: '100%', 
                  height: '100%',
                  borderRadius: 0,
                }}
              />
              <Box sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16,
                display: 'flex',
                gap: 1,
              }}>
                <Chip
                  label={safeString(property.status).toUpperCase()}
                  color={getStatusColor(property.status)}
                  sx={{ fontWeight: 'bold' }}
                />
                <Chip
                  label={safeString(property.type)}
                  color="primary"
                  variant="filled"
                />
              </Box>
            </Box>
            
            {/* Additional Images */}
            {safeArray(property.images).length > 1 && (
              <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
                {safeArray(property.images).slice(1).map((image: string, index: number) => (
                  <Avatar
                    key={index}
                    variant="rounded"
                    src={image}
                    sx={{ width: 80, height: 60, cursor: 'pointer' }}
                  />
                ))}
              </Box>
            )}
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={5}>
            <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {safeString(property.name)}
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                  {formatPrice(property.price)}
                  <Typography component="span" variant="h6" color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 3 }}>
                <LocationOn sx={{ color: 'primary.main', mr: 1, mt: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  {safeString(property.address)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Key Features */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Key Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Hotel sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {safeString(property.bedroom)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bedrooms
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <Bathtub sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        {safeString(property.servicing)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bathrooms
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Amenities */}
              {safeArray(property.amenities).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Amenities
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {safeArray(property.amenities).map((amenity: string, index: number) => (
                      <Chip
                        key={index}
                        label={amenity}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Description */}
              {property.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {property.description}
                  </Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 'auto', pt: 2, display: 'flex', gap: 1 }}>
               
                
                {onEdit && (
                  <Button
                    variant="contained"
                    onClick={onEdit}
                    sx={{ flex: 1 }}
                  >
                    Edit Property
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;