import React, { useState, ChangeEvent, useEffect } from "react";
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
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteImageIcon,
} from "@mui/icons-material";
import useAdminStore from "../../../../stores/admin"; 

interface EditPropertyModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onSave: (propertyData: any) => Promise<void>;
  loading?: boolean;
}

// Define all possible property types to match backend
const PROPERTY_TYPES = ['Flat', 'House', 'Apartment', 'Villa'] as const;

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  open,
  onClose,
  property,
  onSave,
  loading = false,
}) => {
  const { updateApartment } = useAdminStore();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "",
    servicing: "",
    bedroom: "",
    location: "",
    price: "",
    agentPercentage: "",
    amenities: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safe data loading with validation
  useEffect(() => {
    if (property && open) {
      console.log('📝 Loading property data for editing:', property);
      
      // Validate and set property type safely
      const safeType = PROPERTY_TYPES.includes(property.type as any) 
        ? property.type 
        : 'Apartment'; // Fallback to default

      setFormData({
        name: property.name || "",
        address: property.address || "",
        type: safeType,
        servicing: property.servicing || "",
        bedroom: property.bedroom?.toString() || "",
        price: property.price ? property.price.toString() : "",
        location: property.location || "",
        agentPercentage: property.agentPercentage ? property.agentPercentage.toString() : "",
        amenities: Array.isArray(property.amenities)
          ? property.amenities.join(", ")
          : property.amenities || "",
      });
      setExistingImages(property.images || []);
      setImagePreviews([]);
      setImages([]);
      setImagesToDelete([]);
      setErrors({});
      setSubmitError("");
    }
  }, [property, open]);

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);

      // Validate total images count (max 10 as per backend)
      const totalImagesAfterUpload = images.length + newImages.length + existingImages.length - imagesToDelete.length;
      if (totalImagesAfterUpload > 10) {
        setErrors((prev) => ({ ...prev, images: "Maximum 10 images allowed" }));
        return;
      } 

      // Validate file sizes
      const oversizedFiles = newImages.filter(
        (file) => file.size > 1024 * 1024 * 5, // 5MB limit
      );
      if (oversizedFiles.length > 0) {
        setErrors((prev) => ({
          ...prev,
          images: "One or more images exceed the 5MB size limit",
        }));
        return;
      }

      // Validate file types
      const invalidFiles = newImages.filter(
        (file) => !file.type.startsWith("image/"),
      );
      if (invalidFiles.length > 0) {
        setErrors((prev) => ({
          ...prev,
          images: "Please select only image files",
        }));
        return;
      }

      setImages((prev) => [...prev, ...newImages]);

      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }));
      }
      
      // Reset file input
      event.target.value = '';
    }
  };

  const removeNewImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    const imageToRemove = existingImages[index];
    setImagesToDelete((prev) => [...prev, imageToRemove]);
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Property name is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";
    if (!formData.type) newErrors.type = "Property type is required";
    if (!formData.servicing?.trim()) newErrors.servicing = "Services information is required";
    if (!formData.location?.trim()) newErrors.location = "Location is required";

    if (!formData.bedroom || parseInt(formData.bedroom) <= 0) {
      newErrors.bedroom = "Valid number of bedrooms is required";
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }
    
    if (!formData.agentPercentage || parseFloat(formData.agentPercentage) <= 0) {
      newErrors.agentPercentage = "Valid agent percentage is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    setIsSubmitting(true);
    setSubmitError("");

    // Format data exactly like create property
    const updateData: any = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      location: formData.location.trim(),
      type: formData.type,
      servicing: formData.servicing.trim(),
      bedroom: formData.bedroom,
      price: parseFloat(formData.price),
      agentPercentage: parseFloat(formData.agentPercentage),
    };

    // Handle amenities - convert to JSON string like in create
    if (formData.amenities.trim()) {
      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a);
      updateData.amenities = JSON.stringify(amenitiesArray);
    } else {
      updateData.amenities = JSON.stringify([]);
    }

    // Add images to delete if any
    if (imagesToDelete.length > 0) {
      updateData.imagesToDelete = imagesToDelete;
    }

    console.log('📦 Calling updateApartment with:', {
      updateData,
      imagesCount: images.length,
      existingImagesCount: existingImages.length,
      imagesToDeleteCount: imagesToDelete.length,
      imagesToDelete: imagesToDelete
    });

    // Check if there are any changes
    const hasChanges = 
      formData.name !== property?.name ||
      formData.address !== property?.address ||
      formData.type !== property?.type ||
      formData.servicing !== property?.servicing ||
      formData.bedroom !== property?.bedroom?.toString() ||
      formData.location !== property?.location ||
      parseFloat(formData.price) !== property?.price ||
      parseFloat(formData.agentPercentage) !== property?.agentPercentage ||
      formData.amenities !== (Array.isArray(property?.amenities) ? property.amenities.join(", ") : property?.amenities);

    const hasImageChanges = images.length > 0 || imagesToDelete.length > 0;

    if (!hasChanges && !hasImageChanges) {
      setSubmitError("No changes detected");
      setIsSubmitting(false);
      return;
    }

    if (property?.id) {
      console.log('🔄 Final update data:', updateData);

      // Call updateApartment with images to delete
      const result = await updateApartment(
        property.id,
        updateData,
        images.length > 0 ? images : undefined
      );

      console.log('✅ Update result:', result);
      
      if (result && result.data) {
        await onSave(result.data);
      } else if (result) {
        await onSave(result);
      } else {
        throw new Error("No response data received from server");
      }

      console.log('✅ Property updated successfully');
      handleClose();
    }
  } catch (error: any) {
    console.error('❌ Update failed:', error);
    
    let errorMessage = "Failed to update property";
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific error cases
    if (errorMessage.includes('Unexpected field')) {
      errorMessage = "File upload error: Please check the field names";
    } else if (errorMessage.includes('File upload error')) {
      errorMessage = "Image upload failed: " + errorMessage;
    } else if (error.response?.status === 400) {
      errorMessage = "Bad request: " + (error.response.data.message || "Please check your input data");
    } else if (error.response?.status === 401) {
      errorMessage = "Authentication failed. Please log in again.";
    } else if (error.response?.status === 403) {
      errorMessage = "You don't have permission to update this property";
    } else if (error.response?.status === 404) {
      errorMessage = "Property not found";
    } else if (error.response?.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }

    setSubmitError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleClose = () => {
    console.log('🔒 Closing modal and cleaning up...');
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    
    setFormData({
      name: "",
      address: "",
      type: "",
      servicing: "",
      bedroom: "",
      price: "",
      agentPercentage: "",
      amenities: "",
      location:""
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setImagesToDelete([]);
    setErrors({});
    setSubmitError("");
    onClose();
  };

  const allImages = [...existingImages, ...imagePreviews];
  const isLoading = loading || isSubmitting;

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}>
        <Typography variant="h5" fontWeight="bold">
          Edit Property
        </Typography>
        <IconButton 
          onClick={handleClose} 
          size="small"
          disabled={isLoading}
        >
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
              onChange={handleInputChange("name")}
              error={!!errors.name}
              helperText={errors.name}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Address *"
              value={formData.address}
              onChange={handleInputChange("address")}
              error={!!errors.address}
              helperText={errors.address}
              multiline
              rows={2}
              disabled={isLoading}
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
            <FormControl fullWidth error={!!errors.type} disabled={isLoading}>
              <InputLabel>Property Type *</InputLabel>
              <Select
                value={formData.type}
                label="Property Type *"
                onChange={handleSelectChange("type")}
              >
                {PROPERTY_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
              {errors.type && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, display: "block" }}>
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
              onChange={handleInputChange("servicing")}
              error={!!errors.servicing}
              helperText={errors.servicing}
              placeholder="e.g., Full Service, Cleaning, Maintenance"
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Number of Bedrooms *"
              value={formData.bedroom}
              onChange={handleInputChange("bedroom")}
              error={!!errors.bedroom}
              helperText={errors.bedroom}
              inputProps={{ min: 0 }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleInputChange("location")}
              placeholder="e.g., City, Neighborhood"
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amenities"
              value={formData.amenities}
              onChange={handleInputChange("amenities")}
              placeholder="e.g., Pool, Gym, Parking (comma separated)"
              helperText="Separate multiple amenities with commas"
              disabled={isLoading}
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
              onChange={handleInputChange("price")}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 0, step: "0.01" }}
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Agent Percentage (%) *"
              value={formData.agentPercentage}
              onChange={handleInputChange("agentPercentage")}
              error={!!errors.agentPercentage}
              helperText={errors.agentPercentage}
              inputProps={{ min: 0, max: 100, step: "0.01" }}
              disabled={isLoading}
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
                style={{ display: "none" }}
                id="edit-property-images"
                type="file"
                multiple
                onChange={handleImageUpload}
                disabled={isLoading}
              />
              <label htmlFor="edit-property-images">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={isLoading || allImages.length >= 10}>
                  Add More Images
                </Button>
              </label>
              {errors.images && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", mt: 1 }}>
                  {errors.images}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}>
                {`Add new images or remove existing ones. Maximum 10 images total. ${allImages.length}/10 images selected. Maximum 5MB per image.`}
              </Typography>
              {imagesToDelete.length > 0 && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {imagesToDelete.length} existing image(s) will be removed
                </Alert>
              )}
            </Box>

            {/* Image Previews */}
            {allImages.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {existingImages.map((image, index) => (
                  <Box key={`existing-${index}`} sx={{ position: "relative" }}>
                    <Avatar
                      src={image}
                      variant="rounded"
                      sx={{ width: 100, height: 100 }}
                    />
                    <Chip
                      label="Existing"
                      size="small"
                      color="primary"
                      sx={{ position: "absolute", top: -8, left: -8 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeExistingImage(index)}
                      disabled={isLoading}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "error.dark",
                        },
                        "&:disabled": {
                          backgroundColor: "grey.400",
                        },
                      }}>
                      <DeleteImageIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {imagePreviews.map((preview, index) => (
                  <Box key={`new-${index}`} sx={{ position: "relative" }}>
                    <Avatar
                      src={preview}
                      variant="rounded"
                      sx={{ width: 100, height: 100 }}
                    />
                    <Chip
                      label="New"
                      size="small"
                      color="success"
                      sx={{ position: "absolute", top: -8, left: -8 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeNewImage(index)}
                      disabled={isLoading}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "error.dark",
                        },
                        "&:disabled": {
                          backgroundColor: "grey.400",
                        },
                      }}>
                      <DeleteImageIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={handleClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}>
          {isLoading ? "Updating Property..." : "Update Property"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPropertyModal;