// EditProfileModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  MenuItem,
  Grid,
} from "@mui/material";
import { Edit, Close } from "@mui/icons-material";
import useAdminStore from "../../../stores/admin";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose }) => {
  const { adminInfo, updateAdminProfile, isLoading } = useAdminStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    gender: "",
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (adminInfo) {
      setFormData({
        name: adminInfo.name || "",
        email: adminInfo.email || "",
        phoneNumber: adminInfo.phoneNumber || "",
        address: adminInfo.address || "",
        gender: adminInfo.gender || "",
      });
      setPreviewUrl(adminInfo.profilePicture || "");
    }
  }, [adminInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value);
      });
      
      // Append profile picture if changed
      if (profilePicture) {
        submitData.append("profilePicture", profilePicture);
      }

      await updateAdminProfile(submitData);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Handle backdrop click and escape key
  const handleDialogClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      handleClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            Edit Profile
          </Typography>
          <IconButton 
            onClick={handleClose} 
            disabled={isLoading}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            {/* Profile Picture Section */}
            <Grid item xs={12} display="flex" justifyContent="center">
              <Box position="relative" display="inline-block">
                <Avatar
                  src={previewUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "3px solid",
                    borderColor: "primary.main",
                  }}
                >
                  {formData.name?.charAt(0).toUpperCase() || "A"}
                </Avatar>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <label htmlFor="profile-picture-upload">
                  <IconButton
                    component="span"
                    disabled={isLoading}
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "grey.400",
                      },
                    }}
                  >
                    <Edit />
                  </IconButton>
                </label>
              </Box>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                variant="outlined"
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                variant="outlined"
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                variant="outlined"
                disabled={isLoading}
              >
                <MenuItem value="">Not specified</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
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
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            type="button"
            onClick={handleClose} 
            variant="outlined" 
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: "#002221",
              "&:hover": {
                backgroundColor: "#003833",
              },
            }}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditProfileModal;