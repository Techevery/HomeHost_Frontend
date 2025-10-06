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
} from "@mui/icons-material";
import useAdminStore from "../../../stores/admin";

const AdminProfile = () => {
  const { adminInfo, fetchAdminProfile, isLoading } = useAdminStore();
  const [loading, setLoading] = useState(true);

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

  if (loading || isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
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
        gap={3}
      >
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

  const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
    <Box display="flex" alignItems="center" gap={2} py={2}>
      <Box
        sx={{
          backgroundColor: "primary.light",
          borderRadius: "50%",
          p: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
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
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
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
          component={Link}
          to="/edit-profile"
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
          }}
        >
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
            }}
          >
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
                }}
              >
                <Avatar
                  src={adminInfo.profilePicture}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  }}
                >
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
                <Box display="flex" justifyContent="space-between" textAlign="center">
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
                        (new Date().getTime() - new Date(adminInfo.createdAt).getTime()) / 
                        (1000 * 60 * 60 * 24)
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
          <Card sx={{ mt: 3, borderRadius: 3, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
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
          <Card sx={{ borderRadius: 3, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
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

          {/* System Information
          <Card sx={{ mt: 3, borderRadius: 3, boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                System Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="primary">
                      {adminInfo.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
                  >
                    <Typography variant="h4" fontWeight="bold" color="secondary">
                      {adminInfo.isSuperAdmin ? "Yes" : "No"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Super Admin
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card> */}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminProfile;