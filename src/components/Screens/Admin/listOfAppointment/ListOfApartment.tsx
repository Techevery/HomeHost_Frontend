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
  Favorite,
  FavoriteBorder,
  Visibility,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAdminStore from "../../../../stores/admin";
import usePropertyStore from "../../../../stores/propertyStore";
import EditPropertyModal from "../listOfAppointment/EditPropertyModal";
import ViewDetailsModal from "../listOfAppointment/ViewPropertyModal";
import DeleteConfirmationModal from "../listOfAppointment/DeletePropertyModal";
import AddPropertyModal from "../listOfAppointment/AddPropertyModal";

interface ApartmentLog {
  availability: boolean;
  status: string;
  booking_period: {
    start_date: string;
    end_date: string;
  };
}

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
  ApartmentLog?: ApartmentLog[];
}

const ApartmentsList: React.FC = () => {
  const {
    token,
    isLoading: storeLoading,
    error: storeError,
    listProperties,
    deleteApartment,
    clearError,
  } = useAdminStore();
   
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [updateLoading, setUpdateLoading] = useState(false);

  const theme = useTheme();

  // Enhanced utility functions
  const safeString = (
    value: any,
    fallback: string = "Not specified",
  ): string => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return fallback;
  };

  const safeArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
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

  // Check if property is booked
  const isPropertyBooked = (property: Property): boolean => {
    return safeString(property.status).toLowerCase() === "booked";
  };

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

        const propertiesWithRatings = propertiesData.map((property) => ({
          ...property,
          rating: Math.random() * 2 + 3, 
          reviews: Math.floor(Math.random() * 100) + 1,
          description:
            property.description ||
            "A beautiful property with modern amenities and great location.",
          amenities: safeArray(property.amenities),
          images: safeArray(property.images),
          
          status: property.ApartmentLog?.[0]?.status || property.status || "available",
        }));

        setProperties(propertiesWithRatings);
        setFilteredProperties(propertiesWithRatings);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to load properties";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const currentToken = token || localStorage.getItem("token");
    if (currentToken) {
      fetchProperties();
    } else {
      setError("Authentication required. Please log in.");
      setLoading(false);
    }
  }, [token, listProperties]);

  useEffect(() => {
    let filtered = properties;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (property) =>
          safeString(property.name).toLowerCase().includes(query) ||
          safeString(property.address).toLowerCase().includes(query) ||
          safeString(property.type).toLowerCase().includes(query) ||
          safeString(property.location).toLowerCase().includes(query) ||
          safeString(property.description).toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (property) =>
          safeString(property.status).toLowerCase() ===
          statusFilter.toLowerCase(),
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (property) =>
          safeString(property.type).toLowerCase() === typeFilter.toLowerCase(),
      );
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, statusFilter, typeFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

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
    // Prevent deletion if property is booked
    if (isPropertyBooked(property)) {
      return;
    }
    
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

 const handleAddSave = async (newPropertyData: any) => {
  try {
    setUpdateLoading(true);
    console.log('🔄 Adding new property to local state:', newPropertyData);

    // Refresh the entire list from server for new properties to ensure we have all data
    const result = await listProperties(1, 50);
    if (result?.data?.apartments) {
      setProperties(
        result.data.apartments.map((property: Property) => ({
          ...property,
          rating: Math.random() * 2 + 3,
          reviews: Math.floor(Math.random() * 100) + 1,
          description:
            property.description ||
            "A beautiful property with modern amenities and great location.",
          amenities: safeArray(property.amenities),
          images: safeArray(property.images),
          status: property.ApartmentLog?.[0]?.status || property.status || "available",
        })),
      );
    }
    
    setAddModalOpen(false);
    console.log('✅ New property added successfully');
    
  } catch (error) {
    console.error('❌ Failed to add property:', error);
    setError("Failed to add property");
  } finally {
    setUpdateLoading(false);
  }
};

 const handleEditSave = async (updatedPropertyData: any) => {
  try {
    setUpdateLoading(true);
    console.log('🔄 Updating property in local state:', updatedPropertyData);

    // Update the specific property in local state with the data returned from the API
    setProperties(prevProperties => 
      prevProperties.map(property => 
        property.id === updatedPropertyData.id 
          ? {
              ...property,
              ...updatedPropertyData,
              // Preserve existing fields that might not be in the response
              rating: property.rating,
              reviews: property.reviews,
              description: property.description,
              // Ensure arrays are properly handled
              amenities: safeArray(updatedPropertyData.amenities),
              images: safeArray(updatedPropertyData.images),
              // Update status if provided
              status: updatedPropertyData.ApartmentLog?.[0]?.status || updatedPropertyData.status || property.status,
            }
          : property
      )
    );

    // Also update filtered properties
    setFilteredProperties(prevFiltered => 
      prevFiltered.map(property => 
        property.id === updatedPropertyData.id 
          ? {
              ...property,
              ...updatedPropertyData,
              rating: property.rating,
              reviews: property.reviews,
              description: property.description,
              amenities: safeArray(updatedPropertyData.amenities),
              images: safeArray(updatedPropertyData.images),
              status: updatedPropertyData.ApartmentLog?.[0]?.status || updatedPropertyData.status || property.status,
            }
          : property
      )
    );

    console.log('✅ Property updated successfully in local state');
    
    setEditModalOpen(false);
    setSelectedProperty(null);
    
    // Optional: Show success message
    // You can add a snackbar or toast notification here
    
  } catch (error) {
    console.error('❌ Failed to update property in local state:', error);
    setError("Failed to update property");
  } finally {
    setUpdateLoading(false);
  }
};

  const handleDeleteConfirm = async () => {
    if (!selectedProperty) return;

    // Double check if property is booked before deletion
    if (isPropertyBooked(selectedProperty)) {
      setError("Cannot delete a booked property");
      setDeleteModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      await deleteApartment(selectedProperty.id);

      // Update local state
      setProperties((prev) =>
        prev.filter((prop) => prop.id !== selectedProperty.id),
      );
      setFilteredProperties((prev) =>
        prev.filter((prop) => prop.id !== selectedProperty.id),
      );
      setDeleteModalOpen(false);
      setSelectedProperty(null);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (propertyId: string, event: React.MouseEvent) => {
    event.stopPropagation(); 
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(propertyId)) {
        newFavorites.delete(propertyId);
      } else {
        newFavorites.add(propertyId);
      }
      return newFavorites;
    });
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "default";
    const statusLower = status.toLowerCase();
    if (statusLower === "available") return "success";
    if (statusLower === "rented") return "error";
    if (statusLower === "maintenance") return "warning";
    if (statusLower === "booked") return "error";
    return "default";
  };

  const getStatusBackgroundColor = (status: string | undefined) => {
    if (!status) return theme.palette.grey[500];
    const statusLower = status.toLowerCase();
    if (statusLower === "available") return theme.palette.success.main;
    if (statusLower === "rented") return theme.palette.error.main;
    if (statusLower === "maintenance") return theme.palette.warning.main;
    if (statusLower === "booked") return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  const formatPrice = (price: string | undefined) => {
    if (!price) return "₦0";
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
        gap={3}>
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
          background: `linear-gradient(135deg, ${
            theme.palette.primary.main
          } 0%, ${alpha(theme.palette.primary.dark, 0.8)} 100%)`,
          color: "white",
          borderRadius: 3,
        }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
          }}>
          <Box>
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              gutterBottom>
              Property Management
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your property portfolio with ease
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h2" fontWeight="bold">
              {filteredProperties.length}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {filteredProperties.length === 1 ? "Property" : "Properties"}{" "}
              Listed
            </Typography>
          </Box>
        </Box>

        {/* Search and Filter Bar */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            placeholder="Search properties by name, location, address, or type..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              flexGrow: 1,
              minWidth: 300,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
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

          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                "& .MuiSelect-select": {
                  color: "text.primary",
                },
              }}>
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="rented">Rented</MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{
                backgroundColor: "white",
                borderRadius: 2,
                "& .MuiSelect-select": {
                  color: "text.primary",
                },
              }}>
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="apartment">Apartment</MenuItem>
              <MenuItem value="house">House</MenuItem>
              <MenuItem value="flat">Flat</MenuItem>
              <MenuItem value="villa">Villa</MenuItem>
              <MenuItem value="condo">Condo</MenuItem>
              <MenuItem value="studio">Studio</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {displayError && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                setError(null);
                clearError();
              }}>
              DISMISS
            </Button>
          }>
          {displayError}
        </Alert>
      )}

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => {
          const isBooked = isPropertyBooked(property);
          const deleteTooltipTitle = isBooked 
            ? `${safeString(property.name)} is booked and cannot be deleted`
            : "Delete Property";

          return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={property.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease-in-out",
                borderRadius: 3,
                overflow: "hidden",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                },
              }}>
              {/* Image Section with Professional Layout */}
              <Box
                sx={{ 
                  position: "relative", 
                  height: 240,
                  overflow: "hidden"
                }}
                onClick={() => handleViewClick(property)}>
                <CardMedia
                  component="img"
                  image={
                    safeArray(property.images)[0] || "/default-property.jpg"
                  }
                  alt={safeString(property.name, "Property")}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.5s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                />

                {/* Top Overlay with Status and Favorite */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}>
                  
                  {/* Status Chip */}
                  <Chip
                    label={safeString(property.status).toUpperCase()}
                    size="small"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "0.7rem",
                      height: 24,
                      color: "white",
                      backgroundColor: getStatusBackgroundColor(property.status),
                    }}
                  />

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(property.id, e);
                    }}
                    sx={{
                      color: favorites.has(property.id)
                        ? theme.palette.error.main
                        : "white",
                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                      backdropFilter: "blur(10px)",
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.background.paper, 0.9),
                        transform: "scale(1.1)",
                      },
                      transition: "all 0.2s ease",
                    }}>
                    {favorites.has(property.id) ? (
                      <Favorite />
                    ) : (
                      <FavoriteBorder />
                    )}
                  </IconButton>
                </Box>

                {/* Bottom Overlay with Price */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                  }}>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="white"
                    noWrap
                    sx={{
                      textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}>
                    {formatPrice(property.price)}
                    <Typography
                      component="span"
                      variant="body2"
                      color="rgba(255,255,255,0.8)"
                      sx={{ ml: 0.5 }}>
                      {/* /month */}
                    </Typography>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="rgba(255,255,255,0.9)"
                    noWrap
                    sx={{ 
                      textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                      fontWeight: 500 
                    }}>
                    {safeString(property.name, "Unnamed Property")}
                  </Typography>
                </Box>

                {/* Image Count Badge */}
                {safeArray(property.images).length > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                    }}>
                    <Chip
                      label={`+${safeArray(property.images).length - 1}`}
                      size="small"
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.95),
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Content Section */}
              <CardContent
                sx={{
                  flexGrow: 1,
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  '&:last-child': {
                    pb: 3
                  }
                }}>
                {/* Property Type and Location */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="caption" 
                    color="primary" 
                    fontWeight="bold"
                    sx={{ 
                      textTransform: "uppercase",
                      letterSpacing: 0.5
                    }}>
                    {safeString(property.type, "Property")}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "flex-start", mt: 1 }}>
                    <LocationOn
                      sx={{
                        fontSize: 18,
                        color: "text.secondary",
                        mr: 1,
                        mt: 0.25,
                        flexShrink: 0
                      }}
                    />
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                      {safeString(property.address, "Address not specified")}
                    </Typography>
                  </Box>
                </Box>

                {/* Property Features */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 3,
                    p: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}>
                  <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <Hotel
                      sx={{ fontSize: 20, color: "primary.main", mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {safeString(property.bedroom, "0")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bedrooms
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                    <Bathtub
                      sx={{ fontSize: 20, color: "primary.main", mr: 1 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {safeString(property.servicing, "0")}
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
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="medium"
                      gutterBottom
                      sx={{ textTransform: "uppercase" }}>
                      Amenities
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {safeArray(property.amenities)
                        .slice(0, 3)
                        .map((amenity, index) => (
                          <Chip
                            key={index}
                            label={safeString(amenity)}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "0.65rem",
                              borderRadius: 1,
                              height: 24,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              color: "text.primary",
                            }}
                          />
                        ))}
                      {safeArray(property.amenities).length > 3 && (
                        <Chip
                          label={`+${safeArray(property.amenities).length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ 
                            fontSize: "0.65rem", 
                            borderRadius: 1,
                            height: 24,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
                  <Tooltip title="Edit Property">
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(property);
                      }}
                      sx={{
                        flex: 1,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        borderRadius: 2,
                        py: 1,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease",
                      }}>
                      <EditIcon fontSize="small" />
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
                        color: "info.main",
                        borderRadius: 2,
                        py: 1,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.info.main, 0.2),
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.2s ease",
                      }}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={deleteTooltipTitle}>
                    <span> {/* Wrapper span for disabled tooltip */}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(property);
                        }}
                        disabled={isBooked}
                        sx={{
                          flex: 1,
                          backgroundColor: isBooked 
                            ? alpha(theme.palette.grey[400], 0.1)
                            : alpha(theme.palette.error.main, 0.1),
                          color: isBooked 
                            ? theme.palette.grey[400]
                            : "error.main",
                          borderRadius: 2,
                          py: 1,
                          "&:hover": !isBooked ? {
                            backgroundColor: alpha(theme.palette.error.main, 0.2),
                            transform: "translateY(-1px)",
                          } : {},
                          transition: "all 0.2s ease",
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                        }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )})}
      </Grid>

      {/* Empty State */}
      {filteredProperties.length === 0 && !loading && (
        <Paper
          sx={{
            textAlign: "center",
            py: 8,
            px: 2,
            borderRadius: 3,
            mt: 4,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.background.default,
              0.8,
            )} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
          }}>
          <Box sx={{ maxWidth: 400, mx: "auto" }}>
            <Typography
              variant="h4"
              color="text.secondary"
              gutterBottom
              fontWeight="medium">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "No Properties Found"
                : "No Properties Listed"}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, opacity: 0.8 }}>
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Get started by adding your first property to your portfolio."}
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleAddProperty}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontSize: "1rem",
              }}>
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
          position: "fixed",
          bottom: 32,
          right: 32,
          width: 60,
          height: 60,
          borderRadius: 3,
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          "&:hover": {
            boxShadow: "0 12px 35px rgba(0,0,0,0.25)",
            transform: "translateY(-2px)",
          },
          transition: "all 0.3s ease",
        }}>
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