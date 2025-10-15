import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import useAgentStore from "../../../../../stores/agentstore";

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  servicing: string;
  bedroom: string;
  price: string;
  images: string[];
  status: 'available' | 'unavailable';
  location: string;
  amenities: string[];
  video_link?: string | null;
  adminId?: string;
  agentPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PropertyDetailModalProps {
  open: boolean;
  property: Property | null;
  onClose: () => void;
  onPropertyAdded: () => void;
}

type PricingOption = 'accept-percentage' | 'add-markup';

const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  open,
  property,
  onClose,
  onPropertyAdded,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [markupPrice, setMarkupPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [pricingOption, setPricingOption] = useState<PricingOption>('accept-percentage');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const { enlistApartment, agentInfo } = useAgentStore();

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getAmenitiesArray = (amenities: any): string[] => {
    if (Array.isArray(amenities)) {
      return amenities.filter((item: any) => item != null).map((item: any) => item.toString().trim());
    }
    if (typeof amenities === 'string') {
      return amenities.split(',').map((item: string) => item.trim()).filter((item: string) => item !== '');
    }
    return [];
  };

  const nextImage = () => {
    if (property && property.images) {
      setCurrentImageIndex((prev) => 
        (prev + 1) % property.images.length
      );
    }
  };

  const prevImage = () => {
    if (property && property.images) {
      setCurrentImageIndex((prev) => 
        (prev - 1 + property.images.length) % property.images.length
      );
    }
  };

  const getCurrentModalImage = () => {
    if (!property || !property.images) return "/images/house1.svg";
    return property.images[currentImageIndex] || "/images/house1.svg";
  };

  const calculateFinalPrice = () => {
    if (!property) return "0";
    const basePrice = parseFloat(property.price || "0");
    const markup = pricingOption === 'add-markup' ? parseFloat(markupPrice) || 0 : 0;
    
    const finalPrice = basePrice + markup;
    return finalPrice.toLocaleString();
  };

  const calculateCommission = () => {
    if (!property) return "0";
    const basePrice = parseFloat(property.price || "0");
    const markup = pricingOption === 'add-markup' ? parseFloat(markupPrice) || 0 : 0;
    const agentPercentage = property.agentPercentage || 10;
    
    const finalPrice = basePrice + markup;
    const commission = (finalPrice * agentPercentage) / 100;
    return commission.toLocaleString();
  };

  const isFormValid = () => {
    if (pricingOption === 'add-markup') {
      const markupValue = parseFloat(markupPrice);
      return !isNaN(markupValue) && markupValue >= 0;
    }
    return true;
  };

  const validateMarkupPrice = (): string | null => {
    if (pricingOption === 'add-markup') {
      if (!markupPrice.trim()) {
        return "Markup price is required when adding markup";
      }
      
      const markupValue = parseFloat(markupPrice);
      if (isNaN(markupValue)) {
        return "Please enter a valid number for markup price";
      }
      
      if (markupValue < 0) {
        return "Markup price cannot be negative";
      }
      
      if (markupValue > 1000000) {
        return "Markup price seems too high. Please verify the amount";
      }
    }
    return null;
  };

  const getErrorMessage = (errorMessage: string): string => {
    // Handle generic "Error" messages from backend
    if (errorMessage === 'Error' || errorMessage.includes('Error')) {
      return "Unable to add property at this time. Please try again later.";
    }

    // Handle specific known error patterns
    if (errorMessage.toLowerCase().includes('verified')) {
      return "Your account needs to be verified before adding properties. Please complete your verification.";
    }

    if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exists')) {
      return "This property is already in your listings.";
    }

    if (errorMessage.toLowerCase().includes('not found')) {
      return "Property not found. It may have been removed from the system.";
    }

    if (errorMessage.toLowerCase().includes('permission') || errorMessage.toLowerCase().includes('unauthorized')) {
      return "You don't have permission to add properties. Please contact support.";
    }

    if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('connection')) {
      return "Network connection error. Please check your internet connection and try again.";
    }

    // Return the original message if it's specific enough
    return errorMessage;
  };

  const handleAddProperty = async () => {
    if (!property) {
      showSnackbar("No property selected", "error");
      return;
    }

    // Validate form
    const validationError = validateMarkupPrice();
    if (validationError) {
      showSnackbar(validationError, "error");
      return;
    }

    if (!isFormValid()) {
      showSnackbar("Please check your inputs and try again", "error");
      return;
    }

    // Enhanced agent verification check
    const isAgentVerified = agentInfo?.isVerified || agentInfo?.status === "VERIFIED";
    if (!isAgentVerified) {
      showSnackbar(
        "Your account needs to be verified before you can add properties. Please complete your verification process.",
        "error"
      );
      return;
    }

    setIsAdding(true);
    try {
      const markedUpPrice = pricingOption === 'add-markup' ? parseFloat(markupPrice) : 0;
      const agentPercentage = property.agentPercentage || 10;
      
      console.log('🚀 Adding property with:', {
        apartmentId: property.id,
        markedUpPrice,
        agentPercentage,
        agentStatus: agentInfo?.status,
        isVerified: agentInfo?.isVerified,
        pricingOption
      });
      
      // Call enlistApartment with only the relevant parameters based on pricing option
      const result = pricingOption === 'add-markup' 
        ? await enlistApartment(property.id, markedUpPrice, undefined) // Send only markup price
        : await enlistApartment(property.id, undefined, agentPercentage); // Send only agent percentage
      
      console.log('📦 Enlist property result:', result);
      
      if (result.success) {
        showSnackbar(result.message || "Property successfully added to your listings!", "success");
        onPropertyAdded();
        // Close modal after successful addition
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        // Use the improved error message handling
        const userFriendlyMessage = getErrorMessage(result.message);
        console.log('❌ Add property failed:', {
          originalMessage: result.message,
          userFriendlyMessage: userFriendlyMessage,
          agentStatus: agentInfo?.status,
          isVerified: agentInfo?.isVerified
        });
        showSnackbar(userFriendlyMessage, "error");
      }
    } catch (error: any) {
      console.error('💥 Unexpected error adding property:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error?.response?.status === 401) {
        errorMessage = "Your session has expired. Please log in again.";
      } else if (error?.response?.status === 403) {
        errorMessage = "You don't have permission to perform this action. Please ensure your account is verified.";
      } else if (error?.response?.status === 409) {
        errorMessage = "This property is already in your listings.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Property not found. It may have been removed from the system.";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error?.message?.includes("Network Error")) {
        errorMessage = "Network connection error. Please check your internet connection.";
      } else if (error?.message) {
        errorMessage = getErrorMessage(error.message);
      }
      
      showSnackbar(errorMessage, "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setMarkupPrice("");
    setPricingOption('accept-percentage');
    setCurrentImageIndex(0);
    onClose();
  };

  const handleMarkupPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setMarkupPrice(value);
    }
  };

  // Debug function to check current state
  const debugState = () => {
    console.log('🔍 Current Modal State:', {
      property,
      agentInfo: {
        id: agentInfo?.id,
        status: agentInfo?.status,
        isVerified: agentInfo?.isVerified,
        email: agentInfo?.email
      },
      pricingOption,
      markupPrice,
      isFormValid: isFormValid(),
      validationError: validateMarkupPrice(),
      isAdding
    });
  };

  if (!property) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Property Details
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              {/* Debug button - remove in production */}
              <Button 
                variant="outlined" 
                size="small" 
                onClick={debugState}
                sx={{ mr: 1 }}
              >
                Debug
              </Button>
              <IconButton onClick={handleClose} disabled={isAdding}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={4}>
            {/* Image Carousel */}
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: 300, borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={getCurrentModalImage()}
                  alt={property.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Navigation Arrows */}
                {property.images && property.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={prevImage}
                      disabled={isAdding}
                      sx={{ 
                        position: 'absolute', 
                        left: 8, 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        bgcolor: 'white', 
                        '&:hover': { bgcolor: 'grey.100' },
                        '&:disabled': { opacity: 0.5 }
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                      onClick={nextImage}
                      disabled={isAdding}
                      sx={{ 
                        position: 'absolute', 
                        right: 8, 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        bgcolor: 'white', 
                        '&:hover': { bgcolor: 'grey.100' },
                        '&:disabled': { opacity: 0.5 }
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </>
                )}
                
                {/* Image Indicators */}
                {property.images && property.images.length > 1 && (
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 8, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    display: 'flex', 
                    gap: 1 
                  }}>
                    {property.images.map((_, index) => (
                      <Box
                        key={index}
                        onClick={() => !isAdding && setCurrentImageIndex(index)}
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: index === currentImageIndex ? 'white' : 'white',
                          opacity: index === currentImageIndex ? 1 : 0.5,
                          cursor: isAdding ? 'default' : 'pointer',
                          transition: 'all 0.3s'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* Property Info */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {property.name}
                </Typography>
                <Typography variant="h5" color="primary.main" fontWeight="bold" gutterBottom>
                  NGN {parseFloat(property.price || "0").toLocaleString()}/Night
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                  <LocationIcon color="action" />
                  <Typography variant="body1" color="text.secondary">
                    {property.location || property.address}
                  </Typography>
                </Box>

                {/* Property Details */}
                <Box display="flex" gap={3} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {property.type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Bedrooms
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {property.bedroom}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Servicing
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {property.servicing}
                    </Typography>
                  </Box>
                </Box>

                {/* Amenities */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {getAmenitiesArray(property.amenities).map((amenity, index) => (
                      <Chip 
                        key={index} 
                        label={amenity} 
                        variant="outlined" 
                        size="small" 
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Pricing Options */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, height: 'fit-content' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Add to Your Listings
                </Typography>
                
                {/* Agent Commission Info */}
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, mb: 3 }}>
                  <Typography variant="body2" color="primary.dark" fontWeight="medium">
                    <CheckIcon sx={{ fontSize: 16, mr: 1 }} />
                    Agent Commission: {property.agentPercentage || 10}%
                  </Typography>
                </Box>

                {/* Agent Verification Status */}
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: (agentInfo?.isVerified || agentInfo?.status === "VERIFIED") ? 'success.light' : 'warning.light', 
                    borderRadius: 1, 
                    mb: 3 
                  }}
                >
                  <Typography variant="body2" color={(agentInfo?.isVerified || agentInfo?.status === "VERIFIED") ? 'success.dark' : 'warning.dark'} fontWeight="medium">
                    <CheckIcon sx={{ fontSize: 16, mr: 1 }} />
                    Account Status: {(agentInfo?.isVerified || agentInfo?.status === "VERIFIED") ? "Verified ✓" : "Pending Verification"}
                  </Typography>
                  {!(agentInfo?.isVerified || agentInfo?.status === "VERIFIED") && (
                    <Typography variant="caption" color="warning.dark" sx={{ display: 'block', mt: 0.5 }}>
                      You need to complete verification to add properties.
                    </Typography>
                  )}
                </Box>

                {/* Pricing Options */}
                <FormControl fullWidth sx={{ mb: 3 }} disabled={isAdding}>
                  <InputLabel>Pricing Option</InputLabel>
                  <Select
                    value={pricingOption}
                    onChange={(e) => setPricingOption(e.target.value as PricingOption)}
                    label="Pricing Option"
                  >
                    <MenuItem value="accept-percentage">
                      Accept {property.agentPercentage || 10}% Commission
                    </MenuItem>
                    <MenuItem value="add-markup">
                      Add Markup Price
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Markup Price Input */}
                {pricingOption === 'add-markup' && (
                  <TextField
                    fullWidth
                    label="Markup Price (NGN)"
                    type="text"
                    value={markupPrice}
                    onChange={handleMarkupPriceChange}
                    sx={{ mb: 3 }}
                    helperText="Additional amount you want to add to the base price"
                    disabled={isAdding}
                    error={!!validateMarkupPrice()}
                  />
                )}

                {/* Price Summary */}
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'white', 
                  borderRadius: 1, 
                  border: 1, 
                  borderColor: 'grey.300', 
                  mb: 3 
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Price Summary
                  </Typography>
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Base Price:</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      NGN {parseFloat(property.price || "0").toLocaleString()}
                    </Typography>
                  </Box>
                  {pricingOption === 'add-markup' && (
                    <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2">Markup:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        + NGN {parseFloat(markupPrice || "0").toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2">Your Commission ({property.agentPercentage || 10}%):</Typography>
                    <Typography variant="body2" fontWeight="medium" color="primary.main">
                      NGN {calculateCommission()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ 
                    borderTop: 1, 
                    borderColor: 'grey.300', 
                    pt: 1, 
                    mt: 1 
                  }}>
                    <Typography variant="body1" fontWeight="bold">Final Price:</Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      NGN {calculateFinalPrice()}
                    </Typography>
                  </Box>
                </Box>

                {/* Add Button */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleAddProperty}
                  disabled={!isFormValid() || isAdding || !(agentInfo?.isVerified || agentInfo?.status === "VERIFIED")}
                  startIcon={isAdding ? <CircularProgress size={20} /> : <AddIcon />}
                  sx={{
                    mb: 2
                  }}
                >
                  {isAdding ? 'Adding Property...' : 
                   !(agentInfo?.isVerified || agentInfo?.status === "VERIFIED") ? 'Complete Verification to Add' : 
                   'Add to My Listings'}
                </Button>

                {/* Validation Error Display */}
                {validateMarkupPrice() && (
                  <Typography 
                    variant="body2" 
                    color="error" 
                    sx={{ mt: 1, textAlign: 'center' }}
                  >
                    {validateMarkupPrice()}
                  </Typography>
                )}

                {/* Help Text */}
                {!(agentInfo?.isVerified || agentInfo?.status === "VERIFIED") && (
                  <Typography 
                    variant="caption" 
                    color="warning.main"
                    sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                  >
                    Please complete your account verification to add properties.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Snackbar for user feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PropertyDetailModal;