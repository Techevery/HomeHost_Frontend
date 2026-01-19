import React, { useState, useEffect } from "react";
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
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import useAgentStore from "../../../../../stores/agentstore"; 

interface ProfileFormData {
  name: string;
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

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  agentInfo: {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    address: string;
    gender: string;
    personalUrl: string;
    next_of_kin_full_name: string;
    next_of_kin_email: string;
    bank_name: string;
    account_number: string;
    profile_picture: string;
  } | null;
  onProfileUpdateSuccess?: () => void;
    profileForm?: ProfileFormData;
  profileFormErrors?: Partial<Record<keyof ProfileFormData, string>>;
  avatarPreview?: string;
  onAvatarChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarRemove?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  open,
  onClose,
  agentInfo,
  onProfileUpdateSuccess,
}) => {
  const { updateAgentProfile, isLoading, error, clearError, fetchAgentProfile } = useAgentStore();
  
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
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

  const [profileFormErrors, setProfileFormErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [generalError, setGeneralError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Initialize form with agent data
  useEffect(() => {
    if (agentInfo && open) {
      setProfileForm({
        name: agentInfo.name || "",
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
      setAvatarFile(null);
      setProfileFormErrors({});
      setGeneralError("");
      setSuccessMessage("");
      clearError();
    }
  }, [agentInfo, open, clearError]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProfileFormData, string>> = {};
    let isValid = true;

    // Required fields validation
    if (!profileForm.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!profileForm.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileForm.email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    if (!profileForm.phoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
      isValid = false;
    } else if (!/^[0-9+\-\s()]{10,}$/.test(profileForm.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number";
      isValid = false;
    }

    // Optional fields with specific validations
    if (profileForm.bankName && !profileForm.accountNumber) {
      errors.accountNumber = "Account number is required when bank name is provided";
      isValid = false;
    }

    if (profileForm.accountNumber && !profileForm.bankName) {
      errors.bankName = "Bank name is required when account number is provided";
      isValid = false;
    }

    if (profileForm.accountNumber && !/^[0-9]{10}$/.test(profileForm.accountNumber)) {
      errors.accountNumber = "Account number must be 10 digits";
      isValid = false;
    }

    if (profileForm.nextOfkinEmail && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(profileForm.nextOfkinEmail)) {
      errors.nextOfkinEmail = "Invalid email address for next of kin";
      isValid = false;
    }

    setProfileFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setProfileForm({
      ...profileForm,
      [field]: value,
    });

    // Clear error for this field when user starts typing
    if (profileFormErrors[field]) {
      setProfileFormErrors({
        ...profileFormErrors,
        [field]: "",
      });
    }

    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleGenderChange = (event: SelectChangeEvent) => {
    handleInputChange('gender', event.target.value);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setGeneralError("Please select an image file (JPG, PNG, etc.)");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setGeneralError("Image size must be less than 5MB");
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setGeneralError("");
    }
  };

  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setAvatarPreview(agentInfo?.profile_picture || "");
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      clearError();
      setGeneralError("");
      setSuccessMessage("");

      const formData = new FormData();
      
      // Append all profile data with correct backend field names
      formData.append('name', profileForm.name.trim());
      formData.append('email', profileForm.email.trim());
      formData.append('phone_number', profileForm.phoneNumber.trim()); // Changed to phone_number
      
      if (profileForm.address.trim()) {
        formData.append('address', profileForm.address.trim());
      }
      
      if (profileForm.gender) {
        formData.append('gender', profileForm.gender);
      }
      
      if (profileForm.personalUrl.trim()) {
        formData.append('personalUrl', profileForm.personalUrl.trim());
      }
      
      if (profileForm.nextOfKinName.trim()) {
        formData.append('nextOfKinName', profileForm.nextOfKinName.trim());
      }
      
      if (profileForm.nextOfkinEmail.trim()) {
        formData.append('nextOfKinEmail', profileForm.nextOfkinEmail.trim()); // Important: backend expects 'nextOfKinEmail'
      }
      
      if (profileForm.bankName.trim()) {
        formData.append('bank_name', profileForm.bankName.trim()); // Changed to bank_name
      }
      
      if (profileForm.accountNumber.trim()) {
        formData.append('account_number', profileForm.accountNumber.trim()); // Changed to account_number
      }
      
      // Append profile picture if changed
      if (avatarFile) {
        formData.append('profile_picture', avatarFile);
      }

      const result = await updateAgentProfile(formData);
      
      if (result.success) {
        setSuccessMessage("Profile updated successfully!");
        
        // Refresh agent profile data
        await fetchAgentProfile();
        
        // Call success callback if provided
        if (onProfileUpdateSuccess) {
          onProfileUpdateSuccess();
        }
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setGeneralError(result.message || "Failed to update profile");
      }
    } catch (error: any) {
      setGeneralError(error.message || "An unexpected error occurred");
    }
  };

  const handleClose = () => {
    // Reset form state
    if (agentInfo) {
      setProfileForm({
        name: agentInfo.name || "",
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
    setAvatarFile(null);
    setProfileFormErrors({});
    setGeneralError("");
    setSuccessMessage("");
    clearError();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="edit-profile-dialog-title"
    >
      <DialogTitle id="edit-profile-dialog-title">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold">
            Edit Profile
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {/* Error and Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {generalError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {generalError}
          </Alert>
        )}
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Avatar Upload Section */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" gap={3} mb={2}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 80, height: 80, border: "2px solid #e0e0e0" }}
              >
                {!avatarPreview && profileForm.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="avatar-upload"
                  type="file"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    disabled={isLoading}
                  >
                    Upload Photo
                  </Button>
                </label>
                {avatarFile && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleAvatarRemove}
                    sx={{ ml: 1 }}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  JPG, PNG up to 5MB
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Personal Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Full Name *"
              value={profileForm.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!profileFormErrors.name}
              helperText={profileFormErrors.name}
              disabled={isLoading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" error={!!profileFormErrors.gender}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={profileForm.gender}
                label="Gender"
                onChange={handleGenderChange}
                disabled={isLoading}
              >
                <MenuItem value="">Select Gender</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
              {profileFormErrors.gender && (
                <Typography variant="caption" color="error">
                  {profileFormErrors.gender}
                </Typography>
              )}
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
              disabled={isLoading}
              margin="normal"
              type="email"
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
              disabled={isLoading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={profileForm.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={isLoading}
              margin="normal"
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
              disabled={isLoading}
              margin="normal"
              helperText="Your personal website or social media link"
            />
          </Grid>

          {/* Next of Kin Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'primary.main', fontWeight: 'bold' }}>
              Next of Kin Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Next of Kin Full Name"
              value={profileForm.nextOfKinName}
              onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
              disabled={isLoading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Next of Kin Email"
              value={profileForm.nextOfkinEmail}
              onChange={(e) => handleInputChange('nextOfkinEmail', e.target.value)}
              error={!!profileFormErrors.nextOfkinEmail}
              helperText={profileFormErrors.nextOfkinEmail}
              disabled={isLoading}
              margin="normal"
              type="email"
            />
          </Grid>

          {/* Bank Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: 'primary.main', fontWeight: 'bold' }}>
              Bank Information
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Name"
              value={profileForm.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              error={!!profileFormErrors.bankName}
              helperText={profileFormErrors.bankName}
              disabled={isLoading}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Account Number"
              value={profileForm.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              error={!!profileFormErrors.accountNumber}
              helperText={profileFormErrors.accountNumber}
              disabled={isLoading}
              margin="normal"
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isLoading}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleUpdateProfile} 
          variant="contained" 
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{ 
            minWidth: 120,
            bgcolor: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;