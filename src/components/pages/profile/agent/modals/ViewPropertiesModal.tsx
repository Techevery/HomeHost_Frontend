import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
  Modal,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  FavoriteBorder as FavoriteIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Sort as SortIcon,
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

interface ViewPropertiesModalProps {
  open: boolean;
  onClose: () => void;
  onViewProperty: (property: Property) => void;
}

const ViewPropertiesModal: React.FC<ViewPropertiesModalProps> = ({
  open,
  onClose,
  onViewProperty,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { publicProperties, fetchPublicProperties, isLoading } = useAgentStore();
  
  // Sort modal state
  const [sortModalOpen, setSortModalOpen] = useState(false);
  
  // Sort state - all as strings for input fields
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [shared, setShared] = useState("");
  const [propertyRef, setPropertyRef] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [servicing, setServicing] = useState("");
  const [addedToSite, setAddedToSite] = useState("");

  // Fetch properties when modal opens
  React.useEffect(() => {
    if (open) {
      fetchPublicProperties(1, 12);
    }
  }, [open, fetchPublicProperties]);

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(publicProperties) || publicProperties.length === 0) {
      return [];
    }
    
    let filtered = publicProperties;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((property: Property) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (property.name && property.name.toLowerCase().includes(searchLower)) ||
          (property.address && property.address.toLowerCase().includes(searchLower)) ||
          (property.location && property.location.toLowerCase().includes(searchLower)) ||
          (property.type && property.type.toLowerCase().includes(searchLower)) ||
          (property.price && property.price.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply additional filters based on sort criteria
    if (location) {
      filtered = filtered.filter((property: Property) => 
        property.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter((property: Property) => 
        property.type?.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (type) {
      filtered = filtered.filter((property: Property) => 
        property.type?.toLowerCase().includes(type.toLowerCase())
      );
    }

    if (minPrice) {
      filtered = filtered.filter((property: Property) => 
        parseFloat(property.price || "0") >= parseFloat(minPrice)
      );
    }

    if (maxPrice) {
      filtered = filtered.filter((property: Property) => 
        parseFloat(property.price || "0") <= parseFloat(maxPrice)
      );
    }

    if (bedrooms) {
      filtered = filtered.filter((property: Property) => 
        property.bedroom === bedrooms
      );
    }

    if (servicing) {
      filtered = filtered.filter((property: Property) => 
        property.servicing?.toLowerCase().includes(servicing.toLowerCase())
      );
    }

    return filtered;
  }, [
    publicProperties, 
    searchTerm, 
    location, 
    category, 
    type, 
    minPrice, 
    maxPrice, 
    bedrooms, 
    servicing
  ]);

  const getPropertyImage = (property: Property) => {
    return property.images && property.images.length > 0 
      ? property.images[0] 
      : "/images/house1.svg";
  };

  const handleOpenSortModal = () => {
    setSortModalOpen(true);
  };

  const handleCloseSortModal = () => {
    setSortModalOpen(false);
  };

  const handleApplySort = () => {
    handleCloseSortModal();
  };

  const handleClearSort = () => {
    setLocation("");
    setCategory("");
    setType("");
    setMinPrice("");
    setFurnishing("");
    setShared("");
    setPropertyRef("");
    setBedrooms("");
    setMaxPrice("");
    setServicing("");
    setAddedToSite("");
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Add Properties to Your Listings
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {/* Search and Sort Section */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Search Bar */}
              <Box sx={{ position: 'relative', flex: 1 }}>
                <SearchIcon sx={{ 
                  position: 'absolute', 
                  left: 12, 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'text.secondary' 
                }} />
                <TextField
                  fullWidth
                  placeholder="Search properties, locations, prices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      pl: 4,
                      borderRadius: 2
                    }
                  }}
                />
              </Box>

              {/* Sort Button */}
              <Button
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={handleOpenSortModal}
                sx={{
                  minWidth: '120px',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'medium'
                }}
              >
                Sort By
              </Button>
            </Box>
          </Box>

          {/* Properties Grid */}
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Available Properties ({filteredProperties.length})
            </Typography>

            {isLoading && (!Array.isArray(publicProperties) || publicProperties.length === 0) ? (
              <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 8 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  Loading properties...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProperties.map((property: Property) => (
                  <Grid item xs={12} sm={6} md={4} key={property.id}>
                    <Card sx={{ 
                      borderRadius: 3, 
                      overflow: 'hidden', 
                      transition: 'all 0.3s', 
                      '&:hover': { 
                        transform: 'translateY(-4px)', 
                        boxShadow: 6 
                      } 
                    }}>
                      <Box sx={{ position: 'relative', height: 200 }}>
                        <img
                          src={getPropertyImage(property)}
                          alt={property.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8, 
                          bgcolor: 'white', 
                          '&:hover': { bgcolor: 'grey.100' } 
                        }}>
                          <FavoriteIcon />
                        </IconButton>
                        
                        {/* Availability Badge */}
                        <Chip
                          label={property.status === 'available' ? "Available" : "Unavailable"}
                          color={property.status === 'available' ? "success" : "error"}
                          size="small"
                          sx={{ position: 'absolute', top: 8, left: 8 }}
                        />
                      </Box>

                      <CardContent>
                        <Typography variant="h6" gutterBottom noWrap>
                          {property.name}
                        </Typography>

                        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                          <LocationIcon color="action" fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {property.location || property.address}
                          </Typography>
                        </Box>

                        {/* Display Agent Percentage if available */}
                        {property.agentPercentage && (
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <CheckCircleIcon color="primary" fontSize="small" />
                            <Typography variant="body2" color="primary.main" fontWeight="medium">
                              Agent Commission: {property.agentPercentage}%
                            </Typography>
                          </Box>
                        )}

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            NGN {parseFloat(property.price || "0").toLocaleString()}/Night
                          </Typography>

                          <Button
                            onClick={() => onViewProperty(property)}
                            variant={property.status === 'available' ? "contained" : "outlined"}
                            disabled={property.status !== 'available'}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Empty State */}
            {!isLoading && filteredProperties.length === 0 && (
              <Box textAlign="center" sx={{ py: 8 }}>
                <Box sx={{ fontSize: 64, mb: 2 }}>🏠</Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No properties found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Array.isArray(publicProperties) && publicProperties.length === 0 
                    ? "No properties available at the moment." 
                    : "Try adjusting your search terms to find what you're looking for."}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Sort Modal */}
      <Modal
        open={sortModalOpen}
        onClose={handleCloseSortModal}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          p: 2,
          mt: 4
        }}
      >
        <Paper
          sx={{
            width: '90%',
            maxWidth: 600,
            maxHeight: '80vh',
            overflow: 'auto',
            borderRadius: 3,
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Sort By
            </Typography>
            <IconButton onClick={handleCloseSortModal}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            {/* Column 1 */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                size="small"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                size="small"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                size="small"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                size="small"
                margin="normal"
                type="number"
              />
              <TextField
                fullWidth
                label="Furnishing"
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                size="small"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Shared"
                value={shared}
                onChange={(e) => setShared(e.target.value)}
                size="small"
                margin="normal"
              />
            </Grid>

            {/* Column 2 */}
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Property Ref."
                value={propertyRef}
                onChange={(e) => setPropertyRef(e.target.value)}
                size="small"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Bedrooms"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                size="small"
                margin="normal"
                type="number"
              />
              <TextField
                fullWidth
                label="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                size="small"
                margin="normal"
                type="number"
              />
              <TextField
                fullWidth
                label="Servicing"
                value={servicing}
                onChange={(e) => setServicing(e.target.value)}
                size="small"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Added to site"
                value={addedToSite}
                onChange={(e) => setAddedToSite(e.target.value)}
                size="small"
                margin="normal"
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Button
              onClick={handleClearSort}
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Clear All
            </Button>
            <Button
              onClick={handleApplySort}
              variant="contained"
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Apply Filters
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default ViewPropertiesModal;