// AdminProfile.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
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
} from "@mui/icons-material";
import useAdminStore from "../../../stores/admin";

const AdminProfile = () => {
  const { adminInfo, fetchAdminProfile, isLoading } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchAdminProfile();
      } catch (error) {
        console.error("Error fetching admin profile:", error);
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
      });
    }
  }, [adminInfo]);

  const handleEditModalOpen = () => {
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    if (!isUpdating) {
      setEditModalOpen(false);
      // Reset form data to original values when closing
      if (adminInfo) {
        setFormData({
          name: adminInfo.name || "",
          email: adminInfo.email || "",
          phoneNumber: adminInfo.phoneNumber || "",
          address: adminInfo.address || "",
          gender: adminInfo.gender || "",
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Your update logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call

      // In a real application, you would call an update API here
      // await updateAdminProfile(formData);

      // Refresh the profile data
      await fetchAdminProfile();
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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

      {/* Edit Profile Modal */}
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
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
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
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isUpdating}
                />
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
                />
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
              disabled={isUpdating}
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
    </Box>
  );
};

export default AdminProfile;
