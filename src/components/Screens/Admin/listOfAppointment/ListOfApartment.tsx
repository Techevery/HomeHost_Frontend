import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Grid,
  IconButton,
  Button,
  Alert,
  Tooltip,
  Container,
  Paper,
  alpha,
  useTheme,
  Fab,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  LocationOn,
  Hotel,
  Bathtub,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Star,
  Favorite,
  FavoriteBorder,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAdminStore from "../../../../stores/admin";
import EditPropertyModal from "../listOfAppointment/EditPropertyModal";
import ViewDetailsModal from "../listOfAppointment/ViewPropertyModal";
import DeleteConfirmationModal from "../listOfAppointment/DeletePropertyModal";
import AddPropertyModal from "../listOfAppointment/AddPropertyModal"; // Add this import

interface Property {
  id: string;
  name: string;
  price: string;
  address: string;
  images: string[];
  status: string;
  type: string;
  bedroom: string;
  servicing: string;
  amenities: string[];
  reviews?: number;
  description?: string;
  rating?: number;
  location?: string;
  agentPercentage?: string;
}

const ApartmentsList: React.FC = () => {
  const {
    token,
    isLoading: storeLoading,
    error: storeError,
    listProperties,
    deleteApartment,
    clearError,
    searchApartment,
    updateAdminProfile,
  } = useAdminStore();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  // const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false); // Add this state
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const theme = useTheme();
  const navigate = useNavigate();

  // Enhanced utility functions
  const safeString = (value: any, fallback: string = 'Not specified'): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return fallback;
  };

  const safeArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      // Try to parse if it's a JSON string
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }
    if (value) return [value];
    return [];
  };

  // Fetch properties on component mount
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await listProperties(1, 50);
      
        let propertiesData: Property[] = [];
        
        if (result?.data?.apartments) {
          propertiesData = result.data.apartments;
        } else if (result?.data) {
          propertiesData = result.data;
        } else if (result?.apartments) {
          propertiesData = result.apartments;
        } else if (Array.isArray(result)) {
          propertiesData = result;
        } else {
          propertiesData = [];
        }
        
        // Add mock ratings and ensure amenities are arrays
        const propertiesWithRatings = propertiesData.map(property => ({
          ...property,
          rating: Math.random() * 2 + 3, // Random rating between 3-5
          reviews: Math.floor(Math.random() * 100) + 1,
          description: property.description || "A beautiful property with modern amenities and great location.",
          // Ensure amenities is always an array
          amenities: safeArray(property.amenities),
          // Ensure other array fields are safe
          images: safeArray(property.images),
        }));
        
        setProperties(propertiesWithRatings);
        setFilteredProperties(propertiesWithRatings);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to load properties';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      fetchProperties();
    } else {
      setError('Authentication required. Please log in.');
      setLoading(false);
    }
  }, [token, listProperties]);

  // Filter properties based on search and filters
  useEffect(() => {
    let filtered = properties;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(property =>
        safeString(property.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        safeString(property.address).toLowerCase().includes(searchQuery.toLowerCase()) ||
        safeString(property.type).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    // if (statusFilter !== "all") {
    //   filtered = filtered.filter(property =>
    //     safeString(property.status).toLowerCase() === statusFilter.toLowerCase()
    //   );
    // }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(property =>
        safeString(property.type).toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, typeFilter]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      // Reset to all properties when search is cleared
      return;
    }
    
    try {
      setLoading(true);
      const result = await searchApartment(query);
      let propertiesData: Property[] = [];
      
      if (result?.data) {
        propertiesData = result.data;
      } else if (Array.isArray(result)) {
        propertiesData = result;
      }
      
      // Add mock ratings and ensure arrays for search results
      const propertiesWithRatings = propertiesData.map(property => ({
        ...property,
        reviews: Math.floor(Math.random() * 100) + 1,
        description: property.description || "A beautiful property with modern amenities and great location.",
        amenities: safeArray(property.amenities),
        images: safeArray(property.images),
      }));
      
      setProperties(propertiesWithRatings);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced modal handlers with safe data
  const handleEditClick = (property: Property) => {
    setSelectedProperty({
      ...property,
      amenities: safeArray(property.amenities),
      images: safeArray(property.images),
    });
    setEditModalOpen(true);
  };

  const handleViewClick = (property: Property) => {
    setSelectedProperty({
      ...property,
      amenities: safeArray(property.amenities),
      images: safeArray(property.images),
    });
    setViewModalOpen(true);
  };

  const handleDeleteClick = (property: Property) => {
    setSelectedProperty({
      ...property,
      amenities: safeArray(property.amenities),
      images: safeArray(property.images),
    });
    setDeleteModalOpen(true);
  };

  const handleAddProperty = () => {
    setAddModalOpen(true);
  };

  const handleAddSave = async (propertyData: any) => {
    try {
      setUpdateLoading(true);
      // This will be handled by the AddPropertyModal
      // Refresh the properties list after adding
      const result = await listProperties(1, 50);
      if (result?.data?.apartments) {
        setProperties(result.data.apartments);
      }
      setAddModalOpen(false);
    } catch (error) {
      console.error('Add property error:', error);
      setError('Failed to add property');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleEditSave = async (propertyData: any) => {
    try {
      setUpdateLoading(true);
      
      // Ensure amenities is an array before saving
      const dataToSave = {
        ...propertyData,
        amenities: safeArray(propertyData.amenities),
        images: safeArray(propertyData.images),
      };
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state with safe arrays
      setProperties(prev => prev.map(prop => 
        prop.id === selectedProperty?.id 
          ? { ...prop, ...dataToSave }
          : prop
      ));
      
      setEditModalOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update property');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProperty) return;
    
    try {
      setLoading(true);
      await deleteApartment(selectedProperty.id);
      
      // Update local state
      setProperties(prev => prev.filter(prop => prop.id !== selectedProperty.id));
      setDeleteModalOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error('Delete error:', error);
      setError("Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (propertyId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  // Utility functions
  // const getStatusColor = (status: string | undefined) => {
  //   if (!status) return 'default';
  //   const statusLower = status.toLowerCase();
  //   if (statusLower === 'available') return 'success';
  //   if (statusLower === 'rented') return 'error';
  //   if (statusLower === 'maintenance') return 'warning';
  //   return 'default';
  // };

  // const getStatusText = (status: string | undefined) => {
  //   if (!status) return 'UNKNOWN';
  //   return status.toUpperCase();
  // };

  const formatPrice = (price: string | undefined) => {
    if (!price) return '₦0';
    try {
      return `₦${parseInt(price).toLocaleString()}`;
    } catch {
      return `₦${price}`;
    }
  };

  const displayError = error || storeError;

  if (loading || storeLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
        flexDirection="column"
        gap={3}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading Properties...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              Property Listings
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your property listings with ease
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h2" fontWeight="bold">
              {filteredProperties.length}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {filteredProperties.length === 1 ? 'Property' : 'Properties'} Listed
            </Typography>
          </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search properties by name, location, or type..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              flexGrow: 1,
              minWidth: 300,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                borderRadius: 2,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          {/* <FormControl sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'white' }}>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ 
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiSelect-select': {
                  color: 'text.primary',
                }
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="rented">Rented</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl> */}

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel sx={{ color: 'white' }}>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ 
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiSelect-select': {
                  color: 'text.primary',
                }
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="villa">Flat</MenuItem>
              {/* <MenuItem value="condo">Condo</MenuItem> */}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {displayError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => {
              setError(null);
              clearError();
            }}>
              DISMISS
            </Button>
          }
        >
          {displayError}
        </Alert>
      )}

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                },
              }}
              onClick={() => handleViewClick(property)}
            >
              {/* Image Section with Overlay */}
              <Box sx={{ position: 'relative', height: 200 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={safeArray(property.images)[0] || '/default-property.jpg'}
                  alt={safeString(property.name, 'Property')}
                  sx={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                />
                
                {/* Top Overlay */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  p: 2,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)',
                }}>
                  {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Chip
                      label={getStatusText(property.status)}
                      color={getStatusColor(property.status)}
                      size="small"
                      sx={{ 
                        fontWeight: 'bold',
                        backdropFilter: 'blur(10px)',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      }}
                    />
                    <IconButton
                      onClick={(e) => toggleFavorite(property.id, e)}
                      sx={{
                        color: favorites.has(property.id) ? theme.palette.error.main : 'white',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        },
                      }}
                    >
                      {favorites.has(property.id) ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>
                  </Box> */}
                </Box>

                {/* Bottom Overlay */}
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  p: 2,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    color="white"
                    noWrap
                  >
                    {safeString(property.name, 'Unnamed Property')}
                  </Typography>
                  <Typography variant="body2" color="rgba(255,255,255,0.8)" noWrap>
                    {safeString(property.type, 'Property')}
                  </Typography>
                </Box>
              </Box>

              {/* Content Section */}
              <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
                {/* Price and Rating */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatPrice(property.price)}
                    <Typography component="span" variant="body2" color="text.secondary">
                      /month
                    </Typography>
                  </Typography>
                  {property.rating && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Star sx={{ fontSize: 18, color: 'warning.main', mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {property.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary', mr: 1, mt: 0.25 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                    {safeString(property.address, 'Address not specified')}
                  </Typography>
                </Box>

                {/* Property Features */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mb: 2,
                  p: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Hotel sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {safeString(property.bedroom, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Beds
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Bathtub sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {safeString(property.servicing, '0')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                       Services
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Amenities */}
                {safeArray(property.amenities).length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="medium" gutterBottom>
                      KEY AMENITIES
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {safeArray(property.amenities).slice(0, 2).map((amenity, index) => (
                        <Chip
                          key={index}
                          label={safeString(amenity)}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: '0.65rem',
                            borderRadius: 1,
                          }}
                        />
                      ))}
                      {safeArray(property.amenities).length > 2 && (
                        <Chip
                          label={`+${safeArray(property.amenities).length - 2}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.65rem', borderRadius: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Tooltip title="Edit Property">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(property);
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewClick(property);
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: 'info.main',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.info.main, 0.2),
                        },
                      }}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Property">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(property);
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: 'error.main',
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredProperties.length === 0 && !loading && (
        <Paper
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            borderRadius: 3,
            mt: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          }}
        >
          <Box sx={{ maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h4" color="text.secondary" gutterBottom fontWeight="medium">
              No Properties Found
            </Typography>
            {/* <Typography variant="body1" color="text.secondary" sx={{ mb: 4, opacity: 0.8 }}>
              {searchQuery || statusFilter !== "all" || typeFilter !== "all" 
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Get started by adding your first property to your portfolio."}
            </Typography> */}
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddProperty}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Add First Property
            </Button>
          </Box>
        </Paper>
      )}

      {/* Floating Add Button */}
      <Fab
        color="primary"
        aria-label="add property"
        onClick={handleAddProperty}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 60,
          height: 60,
          borderRadius: 3,
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          '&:hover': {
            boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <AddIcon />
      </Fab>

      {/* Modals */}
      <AddPropertyModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddSave}
        loading={updateLoading}
      />
      
      <EditPropertyModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        property={selectedProperty}
        onSave={handleEditSave}
        loading={updateLoading}
      />
      
      <ViewDetailsModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        property={selectedProperty}
        onEdit={() => {
          setViewModalOpen(false);
          setEditModalOpen(true);
        }}
      />
      
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        property={selectedProperty}
        loading={loading}
      />
    </Container>
  );
};

export default ApartmentsList;