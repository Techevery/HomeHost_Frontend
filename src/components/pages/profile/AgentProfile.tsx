import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Button,
  Chip,
  Container,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import useAgentStore from "../../../stores/agentstore";
import { PropertyCard, Property } from "../../pages/agent/PropertyCard";

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  markedUpPrice: number;
  location: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  agentPercentage: number;
  status: string;
}

const AgentProfile = () => {
  const navigate = useNavigate();
  const {
    agentInfo,
    fetchAgentProfile,
    fetchEnlistedProperties,
    enlistedProperties,
    isLoading,
    error,
    clearError,
    removeApartment,
    logout,
    enlistApartment
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  
  // Property Modal States
  const [addPropertyModalOpen, setAddPropertyModalOpen] = useState(false);
  const [editPropertyModalOpen, setEditPropertyModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Property Form State
  const [propertyForm, setPropertyForm] = useState<PropertyFormData>({
    title: "",
    description: "",
    price: 0,
    markedUpPrice: 0,
    location: "",
    type: "Residential",
    bedrooms: 1,
    bathrooms: 1,
    area: 0,
    agentPercentage: 10,
    status: "active"
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAgentProfile();
      } catch (error) {
        console.error("Error fetching agent profile:", error);
        showSnackbar("Failed to load agent profile", "error");
      }
    };

    loadData();
  }, [fetchAgentProfile]);

  useEffect(() => {
    if (activeTab === "properties" && agentInfo?.id) {
      loadProperties();
    }
  }, [activeTab, agentInfo?.id]);

  const loadProperties = async () => {
    setPropertiesLoading(true);
    try {
      await fetchEnlistedProperties(1, 12);
    } catch (error) {
      console.error("Error fetching properties:", error);
      showSnackbar("Failed to load properties", "error");
    } finally {
      setPropertiesLoading(false);
    }
  };

  const handleAddPropertyClick = () => {
    setAddPropertyModalOpen(true);
    setPropertyForm({
      title: "",
      description: "",
      price: 0,
      markedUpPrice: 0,
      location: "",
      type: "Residential",
      bedrooms: 1,
      bathrooms: 1,
      area: 0,
      agentPercentage: 10,
      status: "active"
    });
    setActiveStep(0);
    setFormErrors({});
  };

  const handleEditPropertyClick = (property: Property) => {
    setPropertyToEdit(property);
    setPropertyForm({
      title: property.title ?? "",
      description: property.description ?? "",
      price: property.price ?? 0,
      markedUpPrice: property.markedUpPrice ?? 0,
      location: property.location ?? "",
      type: property.type ?? "Residential",
      bedrooms: property.bedrooms ?? 1,
      bathrooms: property.bathrooms ?? 1,
      area: property.area ?? 0,
      agentPercentage: property.agentPercentage ?? 10,
      status: property.status ?? "active"
    });
    setEditPropertyModalOpen(true);
    setActiveStep(0);
    setFormErrors({});
  };

  const handleDeleteProperty = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof PropertyFormData, string>> = {};

    if (!propertyForm.title.trim()) {
      errors.title = "Title is required";
    }
    if (!propertyForm.description.trim()) {
      errors.description = "Description is required";
    }
    if (propertyForm.price <= 0) {
      errors.price = "Price must be greater than 0";
    }
    if (propertyForm.markedUpPrice <= 0) {
      errors.markedUpPrice = "Marked up price must be greater than 0";
    }
    if (!propertyForm.location.trim()) {
      errors.location = "Location is required";
    }
    if (propertyForm.area <= 0) {
      errors.area = "Area must be greater than 0";
    }
    if (propertyForm.agentPercentage < 0 || propertyForm.agentPercentage > 100) {
      errors.agentPercentage = "Agent percentage must be between 0 and 100";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (activeStep === 0 && validateForm()) {
      setActiveStep(1);
    }
  };

  const handleBackStep = () => {
    setActiveStep(0);
  };

  const handleSubmitProperty = async () => {
    if (!validateForm()) return;

    try {
      // Since the API expects apartmentId, we'll generate a temporary one
      // In a real app, this would come from selecting an existing apartment or creating a new one
      const apartmentId = `temp-${Date.now()}`;
      
      await enlistApartment(
        apartmentId,
        propertyForm.markedUpPrice,
        propertyForm.agentPercentage
      );

      showSnackbar("Property added successfully", "success");
      setAddPropertyModalOpen(false);
      await loadProperties();
    } catch (error) {
      console.error("Error adding property:", error);
      showSnackbar("Failed to add property", "error");
    }
  };

  const handleUpdateProperty = async () => {
    if (!propertyToEdit || !validateForm()) return;

    try {
      // For editing, we would typically have an update endpoint
      // Since it's not in the store, we'll simulate the update by removing and re-adding
      await removeApartment(propertyToEdit.id);
      
      const apartmentId = `temp-${Date.now()}`;
      await enlistApartment(
        apartmentId,
        propertyForm.markedUpPrice,
        propertyForm.agentPercentage
      );

      showSnackbar("Property updated successfully", "success");
      setEditPropertyModalOpen(false);
      await loadProperties();
    } catch (error) {
      console.error("Error updating property:", error);
      showSnackbar("Failed to update property", "error");
    }
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      await removeApartment(propertyToDelete);
      showSnackbar("Property deleted successfully", "success");
      await loadProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      showSnackbar("Failed to delete property", "error");
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    showSnackbar("Logged out successfully", "success");
  };

  const handleWalletClick = () => {
    navigate("/earnings");
  };

  const handleChangePassword = () => {
    navigate("/security");
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const transformPropertyData = (property: any): Property => {
    return {
      id: property.id || property._id,
      apartmentId: property.apartmentId || "",
      title: property.title || property.name || "Untitled Property",
      description: property.description || "No description available",
      price: property.price || property.basePrice || 0,
      markedUpPrice: property.markedUpPrice || property.finalPrice || property.price || 0,
      location: property.location || property.address || "Location not specified",
      images: property.images || property.photos || [property.image] || [],
      status: property.status || 'active',
      type: property.type || property.propertyType || "Residential",
      bedrooms: property.bedrooms || property.beds || 0,
      bathrooms: property.bathrooms || property.baths || 0,
      area: property.area || property.squareFootage || 0,
      agentPercentage: property.agentPercentage || property.commission || 0,
      createdAt: property.createdAt || property.createdDate,
      isFeatured: property.isFeatured || property.featured || false
    };
  };

  const propertyTypes = [
    "Residential",
    "Commercial",
    "Industrial",
    "Land",
    "Special Purpose"
  ];

  const steps = ['Property Details', 'Review & Submit'];

  if (isLoading && !agentInfo) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!agentInfo) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load agent profile. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={agentInfo.profilePicture}
              sx={{ width: 120, height: 120, border: 4, borderColor: 'primary.light' }}
            >
              {!agentInfo.profilePicture && agentInfo.name?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box>
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                {agentInfo.name}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <EmailIcon color="action" fontSize="small" />
                <Typography variant="body1" color="text.secondary">
                  {agentInfo.email}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body1" color="text.secondary">
                  {agentInfo.phoneNumber || "Not provided"}
                </Typography>
              </Box>
              
              <Box display="flex" gap={1} sx={{ mt: 2 }}>
                <Chip
                  label={agentInfo.isVerified ? "Verified Agent" : "Unverified"}
                  color={agentInfo.isVerified ? "success" : "default"}
                  size="small"
                />
                <Chip
                  label={agentInfo.status || "Active"}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPropertyClick}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Add Property
            </Button>
            
            {/* Action Buttons */}
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<WalletIcon />}
                onClick={handleWalletClick}
                size="small"
              >
                Wallet
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={handleChangePassword}
                size="small"
              >
                Change Password
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size="small"
                color="error"
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Box display="flex">
          <Button
            fullWidth
            variant={activeTab === "profile" ? "contained" : "text"}
            onClick={() => setActiveTab("profile")}
            sx={{ py: 2, borderRadius: 0 }}
          >
            Profile Information
          </Button>
          <Button
            fullWidth
            variant={activeTab === "properties" ? "contained" : "text"}
            onClick={() => setActiveTab("properties")}
            sx={{ py: 2, borderRadius: 0 }}
          >
            My Properties ({enlistedProperties.length})
          </Button>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Profile Tab Content */}
      {activeTab === "profile" && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Personal Information
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.name}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Gender
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.gender || "Not specified"}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.email}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.phoneNumber || "Not provided"}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Profile Slug
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                      {agentInfo.slug}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.address || "Not provided"}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Bank Information
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Bank Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {agentInfo.bankName || "Not provided"}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                    {agentInfo.accountNumber || "Not provided"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 3, mt: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Quick Actions
                </Typography>
                
                <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    component={Link}
                    to="/profile/edit"
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<WalletIcon />}
                    onClick={handleWalletClick}
                    fullWidth
                  >
                    View Earnings
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={handleChangePassword}
                    fullWidth
                  >
                    Change Password
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddPropertyClick}
                    fullWidth
                  >
                    Add New Property
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    fullWidth
                    color="error"
                  >
                    Logout
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Properties Tab Content */}
      {activeTab === "properties" && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              My Listed Properties ({enlistedProperties.length})
            </Typography>
            
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<WalletIcon />}
                onClick={handleWalletClick}
              >
                Wallet
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPropertyClick}
              >
                Add Property
              </Button>
            </Box>
          </Box>

          {propertiesLoading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Box>
          ) : enlistedProperties.length > 0 ? (
            <Grid container spacing={3}>
              {enlistedProperties.map((property: any) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={property.id || property._id}>
                  <PropertyCard
                    property={transformPropertyData(property)}
                    onEdit={handleEditPropertyClick}
                    onDelete={handleDeleteProperty}
                    onView={handleViewProperty}
                    variant="agent"
                    showActions={true}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ textAlign: 'center', py: 8, borderRadius: 3 }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Properties Listed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by adding your first property to showcase to potential clients.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPropertyClick}
                size="large"
              >
                Add Your First Property
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Add Property Modal */}
      <Dialog
        open={addPropertyModalOpen}
        onClose={() => setAddPropertyModalOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Add New Property
            </Typography>
            <Button
              startIcon={<CloseIcon />}
              onClick={() => setAddPropertyModalOpen(false)}
              color="inherit"
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Stepper activeStep={activeStep} orientation="vertical" sx={{ mt: 2 }}>
            {/* Step 1: Property Details */}
            <Step>
              <StepLabel>Property Details</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Property Title"
                      value={propertyForm.title}
                      onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
                      error={!!formErrors.title}
                      helperText={formErrors.title}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      multiline
                      rows={3}
                      value={propertyForm.description}
                      onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                      error={!!formErrors.description}
                      helperText={formErrors.description}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={propertyForm.location}
                      onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})}
                      error={!!formErrors.location}
                      helperText={formErrors.location}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel>Property Type</InputLabel>
                      <Select
                        value={propertyForm.type}
                        label="Property Type"
                        onChange={(e) => setPropertyForm({...propertyForm, type: e.target.value})}
                      >
                        {propertyTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Base Price ($)"
                      type="number"
                      value={propertyForm.price}
                      onChange={(e) => setPropertyForm({...propertyForm, price: Number(e.target.value)})}
                      error={!!formErrors.price}
                      helperText={formErrors.price}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Marked Up Price ($)"
                      type="number"
                      value={propertyForm.markedUpPrice}
                      onChange={(e) => setPropertyForm({...propertyForm, markedUpPrice: Number(e.target.value)})}
                      error={!!formErrors.markedUpPrice}
                      helperText={formErrors.markedUpPrice}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Agent Percentage (%)"
                      type="number"
                      value={propertyForm.agentPercentage}
                      onChange={(e) => setPropertyForm({...propertyForm, agentPercentage: Number(e.target.value)})}
                      error={!!formErrors.agentPercentage}
                      helperText={formErrors.agentPercentage}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Bedrooms"
                      type="number"
                      value={propertyForm.bedrooms}
                      onChange={(e) => setPropertyForm({...propertyForm, bedrooms: Number(e.target.value)})}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Bathrooms"
                      type="number"
                      value={propertyForm.bathrooms}
                      onChange={(e) => setPropertyForm({...propertyForm, bathrooms: Number(e.target.value)})}
                      margin="normal"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Area (sq ft)"
                      type="number"
                      value={propertyForm.area}
                      onChange={(e) => setPropertyForm({...propertyForm, area: Number(e.target.value)})}
                      error={!!formErrors.area}
                      helperText={formErrors.area}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={!propertyForm.title || !propertyForm.description}
                  >
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 2: Review & Submit */}
            <Step>
              <StepLabel>Review & Submit</StepLabel>
              <StepContent>
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Property Summary</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                      <Typography>{propertyForm.title}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                      <Typography>{propertyForm.type}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Location</Typography>
                      <Typography>{propertyForm.location}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                      <Typography>${propertyForm.price.toLocaleString()}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Marked Up Price</Typography>
                      <Typography>${propertyForm.markedUpPrice.toLocaleString()}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">Agent Commission</Typography>
                      <Typography>{propertyForm.agentPercentage}%</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Bedrooms</Typography>
                      <Typography>{propertyForm.bedrooms}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Bathrooms</Typography>
                      <Typography>{propertyForm.bathrooms}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2" color="text.secondary">Area</Typography>
                      <Typography>{propertyForm.area} sq ft</Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Box sx={{ mt: 2 }}>
                  <Button onClick={handleBackStep} sx={{ mr: 1 }}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmitProperty}
                    startIcon={<AddIcon />}
                  >
                    Add Property
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </DialogContent>
      </Dialog>

      {/* Edit Property Modal */}
      <Dialog
        open={editPropertyModalOpen}
        onClose={() => setEditPropertyModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" fontWeight="bold">
              Edit Property
            </Typography>
            <Button
              startIcon={<CloseIcon />}
              onClick={() => setEditPropertyModalOpen(false)}
              color="inherit"
            >
              Close
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Title"
                value={propertyForm.title}
                onChange={(e) => setPropertyForm({...propertyForm, title: e.target.value})}
                error={!!formErrors.title}
                helperText={formErrors.title}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={propertyForm.description}
                onChange={(e) => setPropertyForm({...propertyForm, description: e.target.value})}
                error={!!formErrors.description}
                helperText={formErrors.description}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={propertyForm.location}
                onChange={(e) => setPropertyForm({...propertyForm, location: e.target.value})}
                error={!!formErrors.location}
                helperText={formErrors.location}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={propertyForm.type}
                  label="Property Type"
                  onChange={(e) => setPropertyForm({...propertyForm, type: e.target.value})}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Base Price ($)"
                type="number"
                value={propertyForm.price}
                onChange={(e) => setPropertyForm({...propertyForm, price: Number(e.target.value)})}
                error={!!formErrors.price}
                helperText={formErrors.price}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Marked Up Price ($)"
                type="number"
                value={propertyForm.markedUpPrice}
                onChange={(e) => setPropertyForm({...propertyForm, markedUpPrice: Number(e.target.value)})}
                error={!!formErrors.markedUpPrice}
                helperText={formErrors.markedUpPrice}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Agent Percentage (%)"
                type="number"
                value={propertyForm.agentPercentage}
                onChange={(e) => setPropertyForm({...propertyForm, agentPercentage: Number(e.target.value)})}
                error={!!formErrors.agentPercentage}
                helperText={formErrors.agentPercentage}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={propertyForm.bedrooms}
                onChange={(e) => setPropertyForm({...propertyForm, bedrooms: Number(e.target.value)})}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={propertyForm.bathrooms}
                onChange={(e) => setPropertyForm({...propertyForm, bathrooms: Number(e.target.value)})}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Area (sq ft)"
                type="number"
                value={propertyForm.area}
                onChange={(e) => setPropertyForm({...propertyForm, area: Number(e.target.value)})}
                error={!!formErrors.area}
                helperText={formErrors.area}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setEditPropertyModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateProperty}
            startIcon={<EditIcon />}
          >
            Update Property
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this property? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Container>
  );
};

export default AgentProfile;