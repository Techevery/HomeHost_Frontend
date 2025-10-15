import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

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

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profileForm: ProfileFormData;
  profileFormErrors: Partial<Record<keyof ProfileFormData, string>>;
  avatarPreview: string;
  onProfileFormChange: (form: ProfileFormData) => void;
  onProfileFormErrorsChange: (errors: Partial<Record<keyof ProfileFormData, string>>) => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarRemove: () => void;
  onUpdateProfile: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  profileForm,
  profileFormErrors,
  avatarPreview,
  onProfileFormChange,
  onProfileFormErrorsChange,
  onAvatarChange,
  onAvatarRemove,
  onUpdateProfile,
}) => {
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    onProfileFormChange({
      ...profileForm,
      [field]: value
    });

    // Clear error when user starts typing
    if (profileFormErrors[field]) {
      onProfileFormErrorsChange({
        ...profileFormErrors,
        [field]: ""
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Edit Profile
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Avatar Upload */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 80, height: 80 }}
              >
                {!avatarPreview && profileForm.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Button variant="outlined" component="label" startIcon={<EditIcon />}>
                  Upload Photo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={onAvatarChange}
                  />
                </Button>
                {avatarPreview && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={onAvatarRemove}
                    sx={{ ml: 1 }}
                  >
                    Remove
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name *"
              value={profileForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!profileFormErrors.name}
              helperText={profileFormErrors.name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={profileForm.gender}
                label="Gender"
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address *"
              value={profileForm.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!profileFormErrors.email}
              helperText={profileFormErrors.email}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number *"
              value={profileForm.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              error={!!profileFormErrors.phoneNumber}
              helperText={profileFormErrors.phoneNumber}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={profileForm.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Personal URL"
              value={profileForm.personalUrl}
              onChange={(e) => handleInputChange('personalUrl', e.target.value)}
              helperText="Your personal website or social media link"
            />
          </Grid>

          {/* Next of Kin Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Next of Kin Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Next of Kin Full Name"
              value={profileForm.nextOfKinName}
              onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Next of Kin Email"
              value={profileForm.nextOfKinEmail}
              onChange={(e) => handleInputChange('nextOfKinEmail', e.target.value)}
            />
          </Grid>

          {/* Bank Information */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
              Bank Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Name"
              value={profileForm.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Number"
              value={profileForm.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onUpdateProfile} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;