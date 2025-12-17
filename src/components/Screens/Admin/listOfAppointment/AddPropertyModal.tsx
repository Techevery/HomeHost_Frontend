import React, { useState, ChangeEvent } from "react";
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
    name: "",
    address: "",

    type: "",
    servicing: "",
    bedroom: "",
    price: "",
    agentPercentage: "",
    amenities: "",
  });
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);

      // Validate total images count (max 10 as per backend)
      if (images.length + newImages.length > 10) {
        setErrors((prev) => ({ ...prev, images: "Maximum 10 images allowed" }));
        return;
      }

      // Validate file sizes
      const oversizedFiles = newImages.filter(
        (file) => file.size > 1024 * 1024 * 5,
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
          images: "Please select only image files (JPG, PNG, WebP, etc.)",
        }));
        return;
      }

      setImages((prev) => [...prev, ...newImages]);

      // Create preview URLs
      const newPreviews = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);

      // Clear image error
      if (errors.images) {
        setErrors((prev) => ({ ...prev, images: "" }));
      }
    }
  };

  const removeImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviews[index]);

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Property name is required";
    if (!formData.address?.trim()) newErrors.address = "Address is required";

    if (!formData.type) newErrors.type = "Property type is required";
    if (!formData.servicing?.trim())
      newErrors.servicing = "Services information is required";
    if (!formData.bedroom || parseInt(formData.bedroom) <= 0)
      newErrors.bedroom = "Valid number of bedrooms is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.agentPercentage || parseFloat(formData.agentPercentage) <= 0)
      newErrors.agentPercentage = "Valid agent percentage is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError("");
      const submitFormData = new FormData();

      // Append form data - matching backend expectations
      submitFormData.append("name", formData.name);
      submitFormData.append("address", formData.address);

      submitFormData.append("type", formData.type);
      submitFormData.append("servicing", formData.servicing);
      submitFormData.append("bedroom", formData.bedroom);
      submitFormData.append("price", formData.price);
      submitFormData.append("agentPercentage", formData.agentPercentage);

      // Handle amenities - convert to array if provided
      if (formData.amenities.trim()) {
        const amenitiesArray = formData.amenities
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a);
        submitFormData.append("amenities", JSON.stringify(amenitiesArray));
      } else {
        submitFormData.append("amenities", JSON.stringify([]));
      }

      // Append all images
      images.forEach((image) => {
        submitFormData.append("images", image);
      });

      // Create property using the store
      await createProperty(submitFormData);

      // Call the parent onSave callback
      await onSave(formData);

      // Reset form and close
      handleClose();
    } catch (error: any) {
      console.error("Add property error:", error);
      setSubmitError(
        error.message || "Failed to create property. Please try again.",
      );
    }
  };

  const handleClose = () => {
    // Clean up image preview URLs to avoid memory leaks
    imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));

    setFormData({
      name: "",
      address: "",

      type: "",
      servicing: "",
      bedroom: "",
      price: "",
      agentPercentage: "",
      amenities: "",
    });
    setImages([]);
    setImagePreviews([]);
    setErrors({});
    setSubmitError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
          backgroundColor: "primary.main",
          color: "white",
        }}>
        <Typography variant="h5" fontWeight="bold">
          Add New Property
        </Typography>
        <IconButton onClick={handleClose} size="small" sx={{ color: "white" }}>
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
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold">
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
              placeholder="e.g., Luxury Apartment in Lekki"
            />
          </Grid>

          {/* <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Location/Area *"
              value={formData.location}
              onChange={handleInputChange("location")}
              error={!!errors.location}
              helperText={errors.location}
              placeholder="e.g., Lekki Phase 1"
            />
          </Grid> */}

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
              placeholder="Enter complete property address"
            />
          </Grid>

          {/* Property Details */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold">
              Property Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.type}>
              <InputLabel>Property Type *</InputLabel>
              <Select
                value={formData.type}
                label="Property Type *"
                onChange={handleSelectChange("type")}>
                <MenuItem value="Flat">Flat</MenuItem>
                <MenuItem value="House">House</MenuItem>
                <MenuItem value="Villa">Villa</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
                {/* <MenuItem value="Condo">Condo</MenuItem>
                <MenuItem value="Studio">Studio</MenuItem> */}
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

          {/* <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={handleSelectChange("status")}>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="rented">Rented</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Grid> */}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Services *"
              value={formData.servicing}
              onChange={handleInputChange("servicing")}
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
              onChange={handleInputChange("bedroom")}
              error={!!errors.bedroom}
              helperText={errors.bedroom}
              inputProps={{ min: 0, max: 20 }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Amenities"
              value={formData.amenities}
              onChange={handleInputChange("amenities")}
              placeholder="e.g., Swimming Pool, Gym, Parking, WiFi"
              helperText="Separate multiple amenities with commas"
              multiline
              rows={2}
            />
          </Grid>

          {/* Pricing */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold">
              Pricing Information
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Daily Price (₦) *"
              value={formData.price}
              onChange={handleInputChange("price")}
              error={!!errors.price}
              helperText={errors.price}
              inputProps={{ min: 0, step: "1000" }}
              placeholder="e.g., 500000"
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
              inputProps={{ min: 0, max: 100, step: "0.1" }}
              placeholder="e.g., 5.0"
            />
          </Grid>

          {/* Image Upload */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography
              variant="h6"
              gutterBottom
              color="primary"
              fontWeight="bold">
              Property Images
            </Typography>

            <Box sx={{ mb: 2 }}>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="property-images"
                type="file"
                multiple
                onChange={handleImageUpload}
              />
              <label htmlFor="property-images">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={images.length >= 10}>
                  Upload Images ({images.length}/10)
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
                Upload at least one image. Maximum 10 images allowed. Each image
                should be less than 5MB. Supported formats: JPG, PNG, WebP, GIF
              </Typography>
            </Box>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Uploaded Images ({imagePreviews.length}):
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    maxHeight: 200,
                    overflowY: "auto",
                    p: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}>
                  {imagePreviews.map((preview, index) => (
                    <Box key={index} sx={{ position: "relative" }}>
                      <Avatar
                        src={preview}
                        variant="rounded"
                        sx={{
                          width: 100,
                          height: 100,
                          border: "2px solid",
                          borderColor: "primary.main",
                        }}
                      />
                      <Chip
                        label={`${index + 1}`}
                        size="small"
                        color="primary"
                        sx={{
                          position: "absolute",
                          top: -8,
                          left: -8,
                          fontSize: "0.7rem",
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => removeImage(index)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          backgroundColor: "error.main",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "error.dark",
                          },
                          width: 24,
                          height: 24,
                        }}>
                        <DeleteImageIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Image Requirements */}
            <Box
              sx={{ mt: 2, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom color="primary">
                Image Requirements:
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                component="div">
                • Minimum 1 image, maximum 10 images
                <br />
                • Each image should be less than 5MB
                <br />
                • Supported formats: JPG, PNG, WebP, GIF
                <br />
                • Recommended aspect ratio: 4:3 or 16:9
                <br />• Clear, well-lit photos work best
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{ p: 3, borderTop: "1px solid", borderColor: "divider", gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || images.length === 0}
          startIcon={loading ? <CircularProgress size={16} /> : null}
          sx={{ minWidth: 140 }}>
          {loading ? "Creating..." : "Create Property"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPropertyModal;
