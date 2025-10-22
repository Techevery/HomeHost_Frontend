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
import usePropertyStore from "../../../../stores/propertyStore";

interface EditPropertyModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onSave: (propertyData: any) => Promise<void>;
  loading?: boolean;
}

const EditPropertyModal: React.FC<EditPropertyModalProps> = ({
  open,
  onClose,
  property,
  onSave,
  loading = false,
}) => {
  const { updateProperty } = usePropertyStore();
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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>("");

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        address: property.address || "",

        type: property.type || "",
        servicing: property.servicing || "",
        bedroom: property.bedroom || "",
        price: property.price || "",
        agentPercentage: property.agentPercentage || "",
        amenities: Array.isArray(property.amenities)
          ? property.amenities.join(", ")
          : property.amenities || "",
      });
      setExistingImages(property.images || []);
      setImagePreviews([]);
      setImages([]);
      setImagesToDelete([]);
    }
  }, [property]);

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
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);

      // Validate total images count (max 10 as per backend)
      if (
        images.length +
          newImages.length +
          existingImages.length -
          imagesToDelete.length >
        10
      ) {
        setErrors((prev) => ({ ...prev, images: "Maximum 10 images allowed" }));
        return;
      }

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
    }
  };

  const removeNewImage = (index: number) => {
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
    if (!formData.servicing?.trim())
      newErrors.servicing = "Services information is required";
    if (!formData.bedroom || parseInt(formData.bedroom) <= 0)
      newErrors.bedroom = "Valid number of bedrooms is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.agentPercentage || parseFloat(formData.agentPercentage) <= 0)
      newErrors.agentPercentage = "Valid agent percentage is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitError("");
      const submitFormData = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "amenities") {
          // Convert comma-separated amenities to array
          const amenitiesArray = (value as string)
            .split(",")
            .map((a) => a.trim())
            .filter((a) => a);
          submitFormData.append(key, JSON.stringify(amenitiesArray));
        } else {
          submitFormData.append(key, value as string);
        }
      });

      // Append new images
      images.forEach((image) => {
        submitFormData.append("images", image);
      });

      // Add deleteExistingImages flag if there are images to delete
      if (imagesToDelete.length > 0) {
        submitFormData.append("deleteExistingImages", "true");
      }

      if (property?.id) {
        await updateProperty(property.id, submitFormData);
        await onSave({ ...formData, id: property.id });
      }
    } catch (error: any) {
      setSubmitError(error.message || "Failed to update property");
    }
  };

  const handleClose = () => {
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
    setExistingImages([]);
    setImagesToDelete([]);
    setErrors({});
    setSubmitError("");
    onClose();
  };

  const allImages = [...existingImages, ...imagePreviews];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
              onChange={handleInputChange("name")}
              error={!!errors.name}
              helperText={errors.name}
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
                onChange={handleSelectChange("type")}>
                <MenuItem value="Flat">Flat</MenuItem>
                <MenuItem value="House">House</MenuItem>
                <MenuItem value="Apartment">Apartment</MenuItem>
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
              />
              <label htmlFor="edit-property-images">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 2 }}
                  disabled={allImages.length >= 10}>
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
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "error.dark",
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
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        backgroundColor: "error.main",
                        color: "white",
                        "&:hover": {
                          backgroundColor: "error.dark",
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
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}>
          {loading ? "Updating Property..." : "Update Property"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPropertyModal;
