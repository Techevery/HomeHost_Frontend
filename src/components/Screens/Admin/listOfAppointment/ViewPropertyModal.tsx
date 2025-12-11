import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Divider,
  Avatar,
  Button,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Close as CloseIcon,
  LocationOn,
  Hotel,
  Bathtub,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";

interface ViewDetailsModalProps {
  open: boolean;
  onClose: () => void;
  property: any;
  onEdit?: () => void;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  open,
  onClose,
  property,
  onEdit,
}) => {
  const theme = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [property]);

  if (!property) return null;

  const safeString = (value: any, fallback: string = "") => {
    return value?.toString() || fallback;
  };

  const safeArray = (value: any) => {
    return Array.isArray(value) ? value : [];
  };

  const formatPrice = (price: string | undefined) => {
    if (!price) return "₦0";
    try {
      return `₦${parseInt(price).toLocaleString()}`;
    } catch {
      return `₦${price}`;
    }
  };

  const getStatusDisplay = (status: string | undefined) => {
    if (!status) return "Unknown";
    const statusUpper = status.toUpperCase();
    if (statusUpper === "COMPLETED") return "AVAILABLE";
    return statusUpper;
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return "default";
    const statusUpper = status.toUpperCase();
    if (statusUpper === "AVAILABLE" || statusUpper === "COMPLETED") return "success";
    if (statusUpper === "RENTED") return "error";
    if (statusUpper === "MAINTENANCE") return "warning";
    return "default";
  };

  const images = safeArray(property.images);
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: "90vh" },
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
          Property Details
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* Image Gallery with Carousel */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: "relative", height: 400 }}>
              {/* Main Image */}
              <Avatar
                variant="square"
                src={images[currentImageIndex] || "/default-property.jpg"}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 0,
                }}
              />

              {/* Status and Type Chips */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  gap: 1,
                }}>
                <Chip
                  label={getStatusDisplay(property.status)}
                  color={getStatusColor(property.status)}
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  }}
                />
                <Chip
                  label={safeString(property.type)}
                  color="primary"
                  sx={{
                    fontWeight: "bold",
                    backgroundColor: alpha(theme.palette.primary.main, 0.9),
                    color: "white",
                  }}
                />
              </Box>

              {/* Carousel Navigation Arrows */}
              {hasMultipleImages && (
                <>
                  <IconButton
                    onClick={prevImage}
                    sx={{
                      position: "absolute",
                      left: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.8,
                      ),
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.background.paper,
                          0.9,
                        ),
                      },
                    }}>
                    <ChevronLeft />
                  </IconButton>
                  <IconButton
                    onClick={nextImage}
                    sx={{
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      backgroundColor: alpha(
                        theme.palette.background.paper,
                        0.8,
                      ),
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.background.paper,
                          0.9,
                        ),
                      },
                    }}>
                    <ChevronRight />
                  </IconButton>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 16,
                    backgroundColor: alpha(theme.palette.common.black, 0.7),
                    color: "white",
                    padding: "4px 12px",
                    borderRadius: 2,
                    fontSize: "0.875rem",
                    fontWeight: "bold",
                  }}>
                  {currentImageIndex + 1} / {images.length}
                </Box>
              )}

              {/* Image Dots Indicator */}
              {hasMultipleImages && images.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    gap: 1,
                  }}>
                  {images.map((_, index) => (
                    <Box
                      key={index}
                      onClick={() => goToImage(index)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor:
                          currentImageIndex === index
                            ? theme.palette.primary.main
                            : alpha(theme.palette.common.white, 0.5),
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor:
                            currentImageIndex === index
                              ? theme.palette.primary.dark
                              : alpha(theme.palette.common.white, 0.8),
                        },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Thumbnail Strip */}
            {hasMultipleImages && (
              <Box
                sx={{
                  p: 2,
                  display: "flex",
                  gap: 1,
                  overflowX: "auto",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                }}>
                {images.map((image: string, index: number) => (
                  <Avatar
                    key={index}
                    variant="rounded"
                    src={image}
                    sx={{
                      width: 80,
                      height: 60,
                      cursor: "pointer",
                      border:
                        currentImageIndex === index
                          ? `2px solid ${theme.palette.primary.main}`
                          : "2px solid transparent",
                      opacity: currentImageIndex === index ? 1 : 0.7,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                        border: `2px solid ${theme.palette.primary.main}`,
                      },
                    }}
                    onClick={() => goToImage(index)}
                  />
                ))}
              </Box>
            )}
          </Grid>

          {/* Details Section */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  gutterBottom
                  color="primary">
                  {safeString(property.name)}
                </Typography>
                <Typography
                  variant="h4"
                  color="primary"
                  fontWeight="bold"
                  gutterBottom>
                  {formatPrice(property.price)}
                  <Typography
                    component="span"
                    variant="h6"
                    color="text.secondary">
                    /month
                  </Typography>
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>

              {/* Location */}
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
                <LocationOn
                  sx={{ color: "primary.main", mr: 1, mt: 0.5, flexShrink: 0 }}
                />
                <Typography variant="body1" color="text.secondary">
                  {safeString(property.address)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Key Features */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  fontWeight="bold"
                  color="primary">
                  Key Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1,
                        )}`,
                        borderRadius: 2,
                      }}>
                      <Hotel
                        sx={{ color: "primary.main", fontSize: 32, mb: 1 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary">
                        {safeString(property.bedroom)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bedrooms
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1,
                        )}`,
                        borderRadius: 2,
                      }}>
                      <Bathtub
                        sx={{ color: "primary.main", fontSize: 32, mb: 1 }}
                      />
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary">
                        {safeString(property.servicing)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Bathrooms
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Agent Commission */}
              {property.agentPercentage && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    color="primary">
                    Agent Commission
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.1,
                      )}`,
                      borderRadius: 2,
                    }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                      textAlign="center">
                      {safeString(property.agentPercentage)}%
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      textAlign="center">
                      Commission Rate
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Amenities */}
              {safeArray(property.amenities).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    color="primary">
                    Amenities
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {safeArray(property.amenities).map(
                      (amenity: string, index: number) => (
                        <Chip
                          key={index}
                          label={amenity}
                          variant="outlined"
                          color="primary"
                          sx={{
                            fontWeight: 500,
                          }}
                        />
                      ),
                    )}
                  </Box>
                </Box>
              )}

              {/* Description */}
              {property.description && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    fontWeight="bold"
                    color="primary">
                    Description
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}>
                      {property.description}
                    </Typography>
                  </Paper>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: "auto", pt: 2, display: "flex", gap: 1 }}>
                {onEdit && (
                  <Button
                    variant="contained"
                    onClick={onEdit}
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: "bold",
                    }}>
                    Edit Property
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ViewDetailsModal;