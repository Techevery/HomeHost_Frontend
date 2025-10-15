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
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  Lock as LockIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import useAgentStore from "../../../stores/agentstore";
import { PropertyCard, Property } from "../../pages/agent/PropertyCard";

// Import Modal Components
import ViewPropertiesModal from "../../pages/profile/agent/modals/ViewPropertiesModal";
import PropertyDetailModal from "../../pages/profile/agent/modals/PropertyDetailModal";
import EditProfileModal from "../../pages/profile/agent/modals/EditProfileModal";

interface ProfileFormData {
  name: string;
  avatar?: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  personalUrl: string;
  nextOfKinName: string;
  nextOfKinEmail: string;
  bankName: string;
  accountNumber: string;
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
    updateAgentProfile
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });
  
  // Modal States
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [viewPropertiesModalOpen, setViewPropertiesModalOpen] = useState(false);
  const [propertyDetailModalOpen, setPropertyDetailModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    avatar: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    personalUrl: "",
    nextOfKinName: "",
    nextOfKinEmail: "",
    bankName: "",
    accountNumber: ""
  });

  const [profileFormErrors, setProfileFormErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

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

  // Initialize profile form when agentInfo is available
  useEffect(() => {
    if (agentInfo) {
      setProfileForm({
        name: agentInfo.name || "",
        avatar: agentInfo.profile_picture || "",
        email: agentInfo.email || "",
        phoneNumber: agentInfo.phone_number || "",
        address: agentInfo.address || "",
        gender: agentInfo.gender || "",
        personalUrl: agentInfo.personalUrl || "",
        nextOfKinName: agentInfo.next_of_kin_full_name || "",
        nextOfKinEmail: agentInfo.next_of_kin_email || "",
        bankName: agentInfo.bank_name || "",
        accountNumber: agentInfo.account_number || ""
      });
      setAvatarPreview(agentInfo.profile_picture || "");
    }
  }, [agentInfo]);

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
    setViewPropertiesModalOpen(true);
  };

  const handleViewPropertyDetails = (property: any) => {
    setSelectedProperty(property);
    setPropertyDetailModalOpen(true);
  };

  const handlePropertyAdded = () => {
    setViewPropertiesModalOpen(false);
    setPropertyDetailModalOpen(false);
    setSelectedProperty(null);
    loadProperties(); // Refresh the properties list
    showSnackbar("Property added successfully to your listings!", "success");
  };

  const handleDeleteProperty = (propertyId: string) => {
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
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

  // Edit Profile Functions
  const handleEditProfileClick = () => {
    setEditProfileModalOpen(true);
    setProfileFormErrors({});
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
    
  };

// Add these functions to your AgentProfile component, before the transformPropertyData function

// Handle avatar file selection
const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setProfileForm(prev => ({ ...prev, avatar: previewUrl }));
  }
};

const validateProfileForm = (): boolean => {
  const errors: Partial<Record<keyof ProfileFormData, string>> = {};

  if (!profileForm.name.trim()) {
    errors.name = "Name is required";
  }
  if (!profileForm.email.trim()) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
    errors.email = "Email is invalid";
  }
  if (!profileForm.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required";
  }

  setProfileFormErrors(errors);
  return Object.keys(errors).length === 0;
};

const handleUpdateProfile = async () => {
  if (!validateProfileForm()) return;

  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Append all profile data
    formData.append('name', profileForm.name);
    formData.append('email', profileForm.email);
    formData.append('phoneNumber', profileForm.phoneNumber);
    formData.append('address', profileForm.address);
    formData.append('gender', profileForm.gender);
    formData.append('personalUrl', profileForm.personalUrl);
    formData.append('nextOfKinName', profileForm.nextOfKinName);
    formData.append('nextOfKinEmail', profileForm.nextOfKinEmail);
    formData.append('bankName', profileForm.bankName);
    formData.append('accountNumber', profileForm.accountNumber);
    
    // Append avatar file if selected
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    await updateAgentProfile(formData);
    showSnackbar("Profile updated successfully", "success");
    setEditProfileModalOpen(false);
    setAvatarFile(null);
    await fetchAgentProfile(); // Refresh agent info
  } catch (error: any) {
    console.error("Error updating profile:", error);
    showSnackbar(error.message || "Failed to update profile", "error");
  }
};

// Add this function for removing avatar
const handleAvatarRemove = () => {
  setAvatarFile(null);
  setAvatarPreview(agentInfo?.profile_picture || "");
  setProfileForm(prev => ({ ...prev, avatar: agentInfo?.profile_picture || "" }));
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
              src={agentInfo.profile_picture || ""}
              sx={{ width: 120, height: 120, border: 4, borderColor: 'primary.light' }}
            >
              {!agentInfo.profile_picture && agentInfo.name?.charAt(0).toUpperCase()}
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
                  {agentInfo.phone_number || "Not provided"}
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

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Personal URL
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.personalUrl || "Not specified"}
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
                      {agentInfo.phone_number || "Not provided"}
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

                {/* Next of Kin Information */}
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
                  Next of Kin Information
                </Typography>
                
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.next_of_kin_full_name || "Not specified"}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.next_of_kin_email || "Not specified"}
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
                    {agentInfo.bank_name || "Not provided"}
                  </Typography>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Account Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" fontFamily="monospace">
                    {agentInfo.account_number || "Not provided"}
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
                    onClick={handleEditProfileClick}
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

      {/* Modals */}
      <ViewPropertiesModal
        open={viewPropertiesModalOpen}
        onClose={() => setViewPropertiesModalOpen(false)}
        onViewProperty={handleViewPropertyDetails}
      />

      <PropertyDetailModal
        open={propertyDetailModalOpen}
        property={selectedProperty}
        onClose={() => {
          setPropertyDetailModalOpen(false);
          setSelectedProperty(null);
        }}
        onPropertyAdded={handlePropertyAdded}
      />

      <EditProfileModal
        open={editProfileModalOpen}
        onClose={() => setEditProfileModalOpen(false)}
        profileForm={profileForm}
        profileFormErrors={profileFormErrors}
        avatarPreview={avatarPreview}
        onProfileFormChange={setProfileForm}
        onProfileFormErrorsChange={setProfileFormErrors}
        onAvatarChange={handleAvatarChange}
        onUpdateProfile={handleUpdateProfile}
        onAvatarRemove={() => {
          setAvatarFile(null);
          setAvatarPreview(agentInfo?.profile_picture || "");
          setProfileForm(prev => ({ ...prev, avatar: agentInfo?.profile_picture || "" }));
        }}
      />

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