import React, { useState, ChangeEvent } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';  
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteImageIcon,
} from '@mui/icons-material';
import usePropertyStore from "../../../../stores/propertyStore";

interface AddPropertyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (propertyData: any) => Promise<void>;
  loading?: boolean;
}

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  open,
  onClose,
  onSave,
  loading = false,
}) => {
  const { createProperty } = usePropertyStore();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    location: '',
    type: '',
    servicing: '',
    bedroom: '',
    price: '',
    agentPercentage: '',
    amenities: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      
      // Validate file sizes
      const oversizedFiles = newImages.filter(file => file.size > 1024 * 1024 * 5);
      if (oversizedFiles.length > 0) {
        setErrors(prev => ({ ...prev, images: 'One or more images exceed the 5MB size limit' }));
        return;
      }

      // Validate file types
      const invalidFiles = newImages.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        setErrors(prev => ({ ...prev, images: 'Please select only image files (JPG, PNG, etc.)' }));
        return;
      }

      setImages(prev => [...prev, ...newImages]);
      
      // Create preview URLs
      const newPreviews = newImages.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      
      // Clear image error
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: '' }));
      }
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) newErrors.name = 'Property name is required';
    if (!formData.address?.trim()) newErrors.address = 'Address is required';
    if (!formData.location?.trim()) newErrors.location = 'Location is required';
    if (!formData.type) newErrors.type = 'Property type is required';
    if (!formData.servicing?.trim()) newErrors.servicing = 'Services information is required';
    if (!formData.bedroom || parseInt(formData.bedroom) <= 0) newErrors.bedroom = 'Valid number of bedrooms is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.agentPercentage || parseFloat(formData.agentPercentage) <= 0) newErrors.agentPercentage = 'Valid agent percentage is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError('');
      const submitFormData = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value as string);
      });
      
      // Append images
      images.forEach((image) => {
        submitFormData.append('images', image);
      });

      await createProperty(submitFormData);
      await onSave(formData);
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        location: '',
        type: '',
        servicing: '',
        bedroom: '',
        price: '',
        agentPercentage: '',
        amenities: '',
      });
      setImages([]);
      setImagePreviews([]);
      setErrors({});
      
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create property');
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      address: '',
      location: '',
      type: '',
      servicing: '',
      bedroom: '',
      price: '',
      agentPercentage: '',
      amenities: '',
    });
    setImages([]);
    setImagePreviews([]);
    setErrors({});
    setSubmitError('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <Typography variant="h5" fontWeight="bold">
          Add New Property
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom color="primary">
              Basic Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Property Name *"
              value={formData.name}
              onChange={handleInputChange('name')}
              error={!!errors.name}
              helperText={errors.name}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location/Area *"
              value={formData.location}
              onChange={handleInputChange('location')}
              error={!!errors.location}
              helperText={errors.location}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Address *"
              value={formData.address}
              onChange={handleInputChange('address')}
              error={!!errors.address}
              helperText={errors.address}
              multiline
              rows={2}
            />
          </Grid>

          {/* Property Details */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">
              Property Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Property Type *</InputLabel>
              <Select
                value={formData.type}
                label="Property Type *"
                onChange={handleSelectChange('type')}
              >
                <MenuItem value="Flat">Flat</MenuItem>
                <MenuItem value="House">House</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
                <MenuItem value="Condo">Condo</MenuItem>
                <MenuItem value="Studio">Studio</MenuItem>
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                  {errors.type}
                </Typography>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Services *"
              value={formData.servicing}
              onChange={handleInputChange('servicing')}
              error={!!errors.servicing}
              helperText={errors.servicing}
              placeholder="e.g., Water, Electricity, Security"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Bedrooms *"
              value={formData.bedroom}
              onChange={handleInputChange('bedroom')}
              error={!!errors.bedroom}
              helperText={errors.bedroom}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Amenities"
              value={formData.amenities}
              onChange={handleInputChange('amenities')}
              placeholder="e.g., Pool, Gym, Parking (comma separated)"
              helperText="Separate multiple amenities with commas"
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">
              Pricing Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Monthly Price (₦) *"
              value={formData.price}
              onChange={handleInputChange('price')}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Agent Percentage (%) *"
              value={formData.agentPercentage}
              onChange={handleInputChange('agentPercentage')}
              error={!!errors.agentPercentage}
              helperText={errors.agentPercentage}
              inputProps={{ min: 0, max: 100, step: "0.01" }}
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom color="primary">
              Property Images
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="property-images"
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="property-images">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Images
                </Button>
              </label>
              {errors.images && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {errors.images}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Upload at least one image. Maximum 5MB per image. Supported formats: JPG, PNG, WebP
              </Typography>
            </Box>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {imagePreviews.map((preview, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Avatar
                      src={preview}
                      variant="rounded"
                      sx={{ width: 100, height: 100 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'error.dark',
                        },
                      }}
                    >
                      <DeleteImageIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Creating Property...' : 'Create Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPropertyModal;