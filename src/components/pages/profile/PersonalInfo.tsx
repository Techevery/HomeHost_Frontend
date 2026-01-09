// AdminProfile.tsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CircularProgress,
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CardMedia,
} from "@mui/material";
import {
  Edit,
  ArrowBack,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  Security,
  Close,
  CloudUpload,
  Delete,
  CameraAlt,
} from "@mui/icons-material";
import useAdminStore from "../../../stores/admin";

const AdminProfile = () => {
  const { adminInfo, fetchAdminProfile, isLoading, updateAdminProfile } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
    { value: "prefer-not-to-say", label: "Prefer not to say" },
  ];

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchAdminProfile();
      } catch (error) {
        console.error("Error fetching admin profile:", error);
        showSnackbar("Failed to load profile data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [fetchAdminProfile]);

  // Initialize form data when adminInfo is available
  useEffect(() => {
    if (adminInfo) {
      setFormData({
        name: adminInfo.name || "",
        email: adminInfo.email || "",
        phoneNumber: adminInfo.phoneNumber || "",
        address: adminInfo.address || "",
        gender: adminInfo.gender || "",
        password: "",
        confirmPassword: "",
      });
      setProfilePreview(adminInfo.profilePicture || null);
    }
  }, [adminInfo]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditModalOpen = () => {
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    if (!isUpdating) {
      setEditModalOpen(false);
      // Reset form data when closing
      if (adminInfo) {
        setFormData({
          name: adminInfo.name || "",
          email: adminInfo.email || "",
          phoneNumber: adminInfo.phoneNumber || "",
          address: adminInfo.address || "",
          gender: adminInfo.gender || "",
          password: "",
          confirmPassword: "",
        });
        setProfilePreview(adminInfo.profilePicture || null);
        setProfileImage(null);
      }
      setPasswordError("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Validate password match
    if (name === "password" || name === "confirmPassword") {
      if (formData.password && formData.confirmPassword) {
        if (formData.password !== formData.confirmPassword) {
          setPasswordError("Passwords do not match");
        } else {
          setPasswordError("");
        }
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showSnackbar("Please upload a valid image file (JPEG, PNG, GIF, WebP)", "error");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showSnackbar("Image size should be less than 5MB", "error");
        return;
      }

      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfilePreview(adminInfo?.profilePicture || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const hasPasswordMismatch = 
    (formData.password || formData.confirmPassword) && 
    formData.password !== formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasPasswordMismatch) {
      showSnackbar("Passwords do not match", "error");
      return;
    }

    setIsUpdating(true);

    try {
      // Prepare FormData for the request
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("gender", formData.gender);
      
      // Only include password fields if they are filled
      if (formData.password) {
        formDataToSend.append("password", formData.password);
        formDataToSend.append("confirmPassword", formData.confirmPassword);
      }
      
      // Add profile image if selected
      if (profileImage) {
        formDataToSend.append("profilePicture", profileImage);
      }

      console.log("🔄 Updating admin profile with FormData:", {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        gender: formData.gender,
        hasPassword: !!formData.password,
        hasProfileImage: !!profileImage
      });

      // Call the updateAdminProfile method from the store with FormData
      await updateAdminProfile(formDataToSend);

      // Refresh the profile data
      await fetchAdminProfile();
      
      showSnackbar("Profile updated successfully!", "success");
      setEditModalOpen(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.message || "Failed to update profile. Please try again.";
      showSnackbar(errorMessage, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDialogClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown",
  ) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      handleEditModalClose();
    }
  };

  if (loading || isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!adminInfo) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        flexDirection="column"
        gap={3}>
        <Typography variant="h5" color="error">
          Failed to load profile data
        </Typography>
        <Button variant="contained" onClick={fetchAdminProfile}>
          Retry
        </Button>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <Box display="flex" alignItems="center" gap={2} py={2}>
      <Box
        sx={{
          backgroundColor: "primary.light",
          borderRadius: "50%",
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        {icon}
      </Box>
      <Box flex={1}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={500}>
          {value || "Not provided"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            component={Link}
            to="/dashboard"
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{
              borderRadius: "50%",
              minWidth: "auto",
              width: 48,
              height: 48,
              p: 0,
            }}
          />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Hello Admin {adminInfo.name}
          </Typography>
        </Box>
        <Button
          onClick={handleEditModalOpen}
          variant="contained"
          startIcon={<Edit />}
          sx={{
            backgroundColor: "#002221",
            "&:hover": {
              backgroundColor: "#003833",
            },
            px: 3,
            py: 1,
            borderRadius: 2,
          }}>
          Edit Profile
        </Button>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Profile Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              overflow: "visible",
            }}>
            <CardContent sx={{ p: 0 }}>
              {/* Profile Header */}
              <Box
                sx={{
                  backgroundColor: "primary.main",
                  height: 120,
                  position: "relative",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              />

              {/* Profile Picture */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: -8,
                  position: "relative",
                  zIndex: 2,
                }}>
                <Avatar
                  src={adminInfo.profilePicture}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  }}>
                  {adminInfo.name?.charAt(0).toUpperCase() || "A"}
                </Avatar>

                <Typography variant="h5" fontWeight="bold" mt={2}>
                  {adminInfo.name}
                </Typography>

                <Chip
                  label={adminInfo.role}
                  color="primary"
                  variant="filled"
                  sx={{ mt: 1, fontWeight: 600 }}
                />

                {adminInfo.isSuperAdmin && (
                  <Chip
                    label="Super Admin"
                    color="secondary"
                    variant="filled"
                    sx={{ mt: 1, fontWeight: 600 }}
                  />
                )}
              </Box>

              {/* Quick Stats */}
              <Box p={3}>
                <Divider sx={{ my: 2 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  textAlign="center">
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {adminInfo.permissions?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Permissions
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {Math.ceil(
                        (new Date().getTime() -
                          new Date(adminInfo.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Days Active
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Permissions Card */}
          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Security color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Permissions
                </Typography>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {adminInfo.permissions?.map((permission: any, index: any) => (
                  <Chip
                    key={index}
                    label={permission}
                    variant="outlined"
                    color="primary"
                    size="small"
                  />
                )) || (
                  <Typography variant="body2" color="text.secondary">
                    No specific permissions assigned
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Detailed Information */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Personal Information
              </Typography>

              <Box>
                <InfoRow
                  icon={<Person />}
                  label="Full Name"
                  value={adminInfo.name}
                />
                <Divider />

                <InfoRow
                  icon={<Email />}
                  label="Email Address"
                  value={adminInfo.email}
                />
                <Divider />

                <InfoRow
                  icon={<Phone />}
                  label="Phone Number"
                  value={adminInfo.phoneNumber || "Not provided"}
                />
                <Divider />

                <InfoRow
                  icon={<LocationOn />}
                  label="Address"
                  value={adminInfo.address || "Not provided"}
                />
                <Divider />

                <InfoRow
                  icon={<Person />}
                  label="Gender"
                  value={adminInfo.gender || "Not specified"}
                />
                <Divider />

                <InfoRow
                  icon={<CalendarToday />}
                  label="Member Since"
                  value={formatDate(adminInfo.createdAt)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Profile Modal - Includes ALL fields with Profile Picture */}
      <Dialog
        open={editModalOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={isUpdating}>
        <DialogTitle>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between">
            <Typography variant="h5" fontWeight="bold">
              Edit Profile Information
            </Typography>
            <IconButton onClick={handleEditModalClose} disabled={isUpdating}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Profile Picture Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Profile Picture
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    p: 3,
                    border: '2px dashed',
                    borderColor: 'primary.light',
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={profilePreview || undefined}
                      sx={{
                        width: 120,
                        height: 120,
                        border: '3px solid',
                        borderColor: 'primary.main',
                        fontSize: '2.5rem',
                      }}
                    >
                      {adminInfo?.name?.charAt(0).toUpperCase() || 'A'}
                    </Avatar>
                    <IconButton
                      onClick={handleTriggerFileInput}
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      <CameraAlt />
                    </IconButton>
                  </Box>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      onClick={handleTriggerFileInput}
                      disabled={isUpdating}
                    >
                      Upload Photo
                    </Button>
                    {profileImage && (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={handleRemoveImage}
                        disabled={isUpdating}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>

                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    Upload a profile picture (JPEG, PNG, GIF, WebP). Max size: 5MB.
                    {profileImage && ` Selected: ${profileImage.name}`}
                  </Typography>
                </Box>
              </Grid>

              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                  required
                  helperText="Your display name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                  required
                  helperText="Your email address"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                  helperText="Your contact number"
                  placeholder="+1234567890"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" disabled={isUpdating}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleSelectChange}
                  >
                    <MenuItem value="">
                      <em>Select Gender</em>
                    </MenuItem>
                    {genderOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                  helperText="Your complete address"
                  placeholder="Street, City, State, Country, Postal Code"
                />
              </Grid>

              {/* Password Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Password Change (Optional)
                  </Typography>
                </Divider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                  helperText="Minimum 8 characters"
                  placeholder="Enter new password"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                  error={!!passwordError}
                  helperText={passwordError || "Re-enter new password"}
                  placeholder="Confirm new password"
                />
              </Grid>

              {/* Information Alert */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> All form fields are now fully functional, including profile picture upload.
                    Your changes will be saved to your profile.
                  </Typography>
                </Alert>
              </Grid>
            </Grid>
          </DialogContent>

         <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              type="button"
              onClick={handleEditModalClose}
              variant="outlined"
              disabled={isUpdating}>
              Cancel
            </Button>
              <Button
              type="submit"
              variant="contained"
              disabled={isUpdating || !!hasPasswordMismatch}
              startIcon={isUpdating ? <CircularProgress size={20} /> : null}
              sx={{
                backgroundColor: "#002221",
                "&:hover": {
                  backgroundColor: "#003833",
                },
              }}>
              {isUpdating ? "Updating..." : "Update Profile"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminProfile;