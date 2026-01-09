import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Logout as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  Delete as DeleteIcon,
  PhotoCamera as CameraIcon,
} from "@mui/icons-material";
import useAgentStore from "../../../stores/agentstore";
import { PropertyCard, Property } from "../../pages/agent/PropertyCard";


import ViewPropertiesModal from "../../pages/profile/agent/modals/ViewPropertiesModal";
import PropertyDetailModal from "../../pages/profile/agent/modals/PropertyDetailModal";
import EditProfileModal from "../../pages/profile/agent/modals/EditProfileModal";
import WalletDashboard from "../../../components/pages/profile/agent/modals/wallet/WalletDashboard"; 
import BookingViewModal from "../../pages/profile/agent/modals/BookingViewModal"



interface ProfileFormData {
  name: string;
  avatar?: string;
  email: string;
  phoneNumber: string;
  address: string;
  gender: string;
  personalUrl: string;
  nextOfKinName: string;
  nextOfkinEmail: string;
  bankName: string;
  accountNumber: string;
}

interface BannerFormData {
  name: string;
  description: string;
  image?: File;
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
    updateAgentProfile,
    agentBanners,
    fetchBanner,
    createBanner,
    updateBanner,
    deleteBanner,
    loading: bannersLoading,
  } = useAgentStore();

  const [activeTab, setActiveTab] = useState("profile");
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Modal States
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [viewPropertiesModalOpen, setViewPropertiesModalOpen] = useState(false);
  const [propertyDetailModalOpen, setPropertyDetailModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);

  // Banner Modal States
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editBannerModalOpen, setEditBannerModalOpen] = useState(false);
  const [deleteBannerDialogOpen, setDeleteBannerDialogOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [bannerToEdit, setBannerToEdit] = useState<any>(null);
  const [bannerImagePreview, setBannerImagePreview] = useState<string>("");

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    avatar: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    personalUrl: "",
    nextOfKinName: "",
    nextOfkinEmail: "",
    bankName: "",
    accountNumber: "",
  });

  const [bannerForm, setBannerForm] = useState<BannerFormData>({
    name: "",
    description: "",
  });

  const [profileFormErrors, setProfileFormErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});
  
  const [bannerFormErrors, setBannerFormErrors] = useState<
    Partial<Record<keyof BannerFormData, string>>
  >({});

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
    } else if (activeTab === "banners" && agentInfo?.id) {
      loadBanners();
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
        nextOfkinEmail: agentInfo.next_of_kin_email || "",
        bankName: agentInfo.bank_name || "",
        accountNumber: agentInfo.account_number || "",
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

  const loadBanners = async () => {
    try {
      console.log("🔄 Loading banners using fetchBanner endpoint...");
      await fetchBanner();
      console.log("✅ Banners loaded successfully");
    } catch (error) {
      console.error("Error fetching banners:", error);
      showSnackbar("Failed to load banners", "error");
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
    loadProperties();
    showSnackbar("Property added successfully to your listings!", "success");
  };

  const handleDeleteProperty = async (propertyId: string) => {
    // Find the property to verify we have the right ID
    const propertyToDelete = enlistedProperties.find(p => 
      p.apartmentId === propertyId || p.id === propertyId
    );
    console.log("🔍 Property to delete:", propertyToDelete);
    
    setPropertyToDelete(propertyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      const result = await removeApartment(propertyToDelete);
      if (result.success) {
        showSnackbar("Property removed from listing successfully", "success");
        await loadProperties();
      } else {
        showSnackbar(result.message, "error");
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to delete property", "error");
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    showSnackbar("Logged out successfully", "success");
  };

  const handleEditProfileClick = () => {
    setEditProfileModalOpen(true);
    setProfileFormErrors({});
  };

  // Banner Functions
  const handleAddBannerClick = () => {
    setBannerForm({ name: "", description: "" });
    setBannerImagePreview("");
    setBannerFormErrors({});
    setBannerModalOpen(true);
  };

  const handleEditBannerClick = (banner: any) => {
    setBannerToEdit(banner);
    setBannerForm({
      name: banner.name || "",
      description: banner.description || "",
    });
    setBannerImagePreview(banner.image_url || "");
    setBannerFormErrors({});
    setEditBannerModalOpen(true);
  };

  const handleDeleteBannerClick = (bannerId: string) => {
    setBannerToDelete(bannerId);
    setDeleteBannerDialogOpen(true);
  };

  const confirmBannerDelete = async () => {
    if (!bannerToDelete) return;

    try {
      const result = await deleteBanner(bannerToDelete);
      if (result.success) {
        showSnackbar("Banner deleted successfully", "success");
        await loadBanners();
      } else {
        showSnackbar(result.message, "error");
      }
    } catch (error) {
      showSnackbar("Failed to delete banner", "error");
    } finally {
      setDeleteBannerDialogOpen(false);
      setBannerToDelete(null);
    }
  };

  const handleBannerImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBannerForm(prev => ({ ...prev, image: file }));
      const previewUrl = URL.createObjectURL(file);
      setBannerImagePreview(previewUrl);
    }
  };

  const validateBannerForm = (): boolean => {
    const errors: Partial<Record<keyof BannerFormData, string>> = {};

    if (!bannerForm.name.trim()) {
      errors.name = "Banner name is required";
    }
    if (!bannerImagePreview && !bannerForm.image) {
      errors.image = "Banner image is required";
    }

    setBannerFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBanner = async () => {
    if (!validateBannerForm()) return;

    try {
      const files = bannerForm.image ? [bannerForm.image] : [];
      const result = await createBanner(bannerForm.name, bannerForm.description, files);
      
      if (result.success) {
        showSnackbar("Banner created successfully", "success");
        setBannerModalOpen(false);
        await loadBanners();
      } else {
        showSnackbar(result.message, "error");
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to create banner", "error");
    }
  };

  const handleUpdateBanner = async () => {
    if (!bannerToEdit || !validateBannerForm()) return;

    try {
      const files = bannerForm.image ? [bannerForm.image] : [];
      const result = await updateBanner(
        bannerToEdit.id,
        bannerForm.name,
        bannerForm.description,
        files
      );
      
      if (result.success) {
        showSnackbar("Banner updated successfully", "success");
        setEditBannerModalOpen(false);
        setBannerToEdit(null);
        await loadBanners();
      } else {
        showSnackbar(result.message, "error");
      }
    } catch (error: any) {
      showSnackbar(error.message || "Failed to update banner", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setProfileForm((prev) => ({ ...prev, avatar: previewUrl }));
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
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      formData.append("phoneNumber", profileForm.phoneNumber);
      formData.append("address", profileForm.address);
      formData.append("gender", profileForm.gender);
      formData.append("personalUrl", profileForm.personalUrl);
      formData.append("nextOfKinName", profileForm.nextOfKinName);
      formData.append("nextOfKinEmail", profileForm.nextOfkinEmail);
      formData.append("bankName", profileForm.bankName);
      formData.append("accountNumber", profileForm.accountNumber);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      await updateAgentProfile(formData);
      showSnackbar("Profile updated successfully", "success");
      setEditProfileModalOpen(false);
      setAvatarFile(null);
      await fetchAgentProfile();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to update profile", "error");
    }
  };


  const [bookingModalOpen, setBookingModalOpen] = useState(false);


const handleViewBookingClick = () => {
  setBookingModalOpen(true);
};


  const transformPropertyData = (property: any): Property => {
    console.log("Transforming property data:", property);
    
    const agentPricing = property.agentPricing || {};
    
    // Get the actual base price - use property.price directly
    const basePrice = property.price || 0;
    const markedUpPrice = agentPricing.markedUpPrice || 0; 
    
    // Calculate total based on actual base price + markup
    const totalPrice = basePrice + markedUpPrice;
    
    // Make sure we're using the correct apartment ID
    const apartmentId = property.apartmentId || property.id || property._id;
    
    return {
      id: property.id || property._id,
      apartmentId: apartmentId,
      title: property.title || property.name || "Untitled Property",
      price: basePrice,  
      markedUpPrice: markedUpPrice,
      location: property.location || property.address || "Location not specified",
      images: property.images || property.photos || [property.image] || [],
      status: property.status || "active",
      type: property.type || property.propertyType || "Residential",
      bedroom: property.bedroom || property.bedrooms || 0,
      agentPercentage: property.agentPercentage || property.commission || 0,
      createdAt: property.createdAt || property.createdDate,
      
      basePrice: basePrice, 
      totalPrice: totalPrice, 
      priceChangedAt: agentPricing.priceChangedAt, 
      servicing: property.servicing,
      amenities: property.amenities || []
    };
  };

  if (isLoading && !agentInfo) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh">
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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={3}>
            <Avatar
              src={agentInfo.profile_picture || ""}
              sx={{
                width: 120,
                height: 120,
                border: 4,
                borderColor: "primary.light",
              }}>
              {!agentInfo.profile_picture &&
                agentInfo.name?.charAt(0).toUpperCase()}
            </Avatar>

            <Box>
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom>
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
              sx={{ borderRadius: 2 }}>
              Add Property
            </Button>

            {/* Action Buttons - Replaced Wallet button with WalletDashboard */}
            <Box display="flex" gap={1}>
              {/* Wallet Dashboard Component */}
              <WalletDashboard />

              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                size="small"
                color="error">
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
            sx={{ py: 2, borderRadius: 0 }}>
            Profile Information
          </Button>
          <Button
            fullWidth
            variant={activeTab === "properties" ? "contained" : "text"}
            onClick={() => setActiveTab("properties")}
            sx={{ py: 2, borderRadius: 0 }}>
            My Properties 
          </Button>
          <Button
            fullWidth
            variant={activeTab === "banners" ? "contained" : "text"}
            onClick={() => setActiveTab("banners")}
            sx={{ py: 2, borderRadius: 0 }}>
            My Banners 
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
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.name}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Gender
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.gender || "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Personal URL
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.personalUrl || "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Email Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.email}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Phone Number
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.phone_number || "Not provided"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.address || "Not provided"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Next of Kin Information */}
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="bold"
                  sx={{ mt: 4 }}>
                  Next of Kin Information
                </Typography>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
                      Full Name
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {agentInfo.next_of_kin_full_name || "Not specified"}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom>
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
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom>
                    Bank Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {agentInfo.bank_name || "Not provided"}
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom>
                    Account Number
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    fontFamily="monospace">
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

                <Box
                  display="flex"
                  flexDirection="column"
                  gap={2}
                  sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfileClick}
                    fullWidth>
                    Edit Profile
                  </Button>

                  {/* This button is now handled by WalletDashboard component */}
                  <Button
                    variant="outlined"
                    startIcon={<WalletIcon />}
                    onClick={handleViewBookingClick}
                    fullWidth
                    
                  >
                    View Booking
                  </Button>


          <BookingViewModal
  open={bookingModalOpen}
  onClose={() => setBookingModalOpen(false)}
/>

          


                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddPropertyClick}
                    fullWidth>
                    Add New Property
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddBannerClick}
                    fullWidth>
                    Add Banner
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    fullWidth
                    color="error">
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              My Listed Properties ({enlistedProperties.length})
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPropertyClick}>
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
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={property.id || property._id}>
                  <PropertyCard
                    property={transformPropertyData(property)}
                    onDelete={handleDeleteProperty}
                    variant="agent"
                    showActions={true}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ textAlign: "center", py: 8, borderRadius: 3 }}>
              <BusinessIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Properties Listed
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by adding your first property to showcase to potential
                clients.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddPropertyClick}
                size="large">
                Add Your First Property
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Banners Tab Content */}
      {activeTab === "banners" && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold">
              My Banners ({agentBanners.length})
            </Typography>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddBannerClick}>
              Add New Banner
            </Button>
          </Box>

          {bannersLoading ? (
            <Box display="flex" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Box>
          ) : agentBanners.length > 0 ? (
            <ImageList cols={3} gap={16}>
              {agentBanners.map((banner) => (
                <ImageListItem key={banner.id} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <img
                    src={banner.image_url}
                    alt={banner.name}
                    loading="lazy"
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                  <ImageListItemBar
                    title={banner.name}
                    subtitle={banner.description}
                    actionIcon={
                      <Box>
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => handleEditBannerClick(banner)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => handleDeleteBannerClick(banner.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            <Paper sx={{ textAlign: "center", py: 8, borderRadius: 3 }}>
              <CameraIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Banners Created
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create banners to showcase your brand and attract more clients
                to your profile.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddBannerClick}
                size="large">
                Create Your First Banner
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
  agentInfo={agentInfo}
  onProfileUpdateSuccess={() => {

    fetchAgentProfile(); 
    setEditProfileModalOpen(false); 
    showSnackbar("Profile updated successfully", "success");
  }}
/>

      {/* Create Banner Modal */}
      <Dialog
        open={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Create New Banner</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Banner Name"
              value={bannerForm.name}
              onChange={(e) => setBannerForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!bannerFormErrors.name}
              helperText={bannerFormErrors.name}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={bannerForm.description}
              onChange={(e) => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Banner Image *
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CameraIcon />}
                fullWidth
                sx={{ py: 2 }}>
                Upload Banner Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleBannerImageChange}
                />
              </Button>
              {bannerFormErrors.image && (
                <Typography color="error" variant="caption">
                  {bannerFormErrors.image}
                </Typography>
              )}
            </Box>

            {bannerImagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={bannerImagePreview}
                  alt="Banner preview"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBannerModalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateBanner} variant="contained">
            Create Banner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Banner Modal */}
      <Dialog
        open={editBannerModalOpen}
        onClose={() => setEditBannerModalOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Edit Banner</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Banner Name"
              value={bannerForm.name}
              onChange={(e) => setBannerForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!bannerFormErrors.name}
              helperText={bannerFormErrors.name}
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={bannerForm.description}
              onChange={(e) => setBannerForm(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 3 }}
            />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Banner Image
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CameraIcon />}
                fullWidth
                sx={{ py: 2 }}>
                Change Banner Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleBannerImageChange}
                />
              </Button>
            </Box>

            {bannerImagePreview && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img
                  src={bannerImagePreview}
                  alt="Banner preview"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBannerModalOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateBanner} variant="contained">
            Update Banner
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialogs */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Confirm Remove</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to Remove this property? 
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteBannerDialogOpen}
        onClose={() => setDeleteBannerDialogOpen(false)}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this banner? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteBannerDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmBannerDelete} color="error" variant="contained">
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