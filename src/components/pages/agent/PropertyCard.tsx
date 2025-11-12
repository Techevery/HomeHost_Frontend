import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Chip,
  IconButton,
  CardActions,
  Button,
  Badge,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Star as StarIcon,
  Bathtub as BathIcon,
  Hotel as BedIcon,
  SquareFoot as SizeIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalanceWallet as WalletIcon,
  PriceChange as PriceChangeIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";

import Typography from "@mui/material/Typography";

export interface Property {
  id: string;
  apartmentId?: string;
  title: string;
  services?: string[];
  amenities?: string[];
  price: number;
  markedUpPrice?: number; // This is the markup AMOUNT (2000), not the final price
  location: string;
  images: string[];
  status: "active" | "inactive" | "pending" | "sold";
  type?: string;
  bedroom?: number;
  agentPercentage?: number;
  createdAt?: string;
  
  // Enhanced pricing fields
  basePrice?: number;
  totalPrice?: number;
  priceChangedAt?: string;
  servicing?: string;
}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (propertyId: string) => void;
  onView?: (propertyId: string) => void;
  showActions?: boolean;
  variant?: "agent" | "public";
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  variant = "agent",
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(property);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(property.id);
  };

  const handleView = () => {
    onView?.(property.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "pending":
        return "warning";
      case "sold":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "inactive":
        return "Inactive";
      case "pending":
        return "Pending";
      case "sold":
        return "Sold";
      default:
        return status;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Use data directly from backend
  const basePrice = property.basePrice || property.price || 0;
  const totalPrice = property.totalPrice || property.price || 0;
  const markupAmount = property.markedUpPrice || 0;
  const hasMarkup = markupAmount > 0;
  const markupPercentage = basePrice > 0 ? (markupAmount / basePrice) * 100 : 0;

  console.log('Property Card Data (All Properties):', {
    basePrice,
    totalPrice,
    markupAmount,
    hasMarkup,
    markupPercentage,
    priceChangedAt: property.priceChangedAt,
    agentPercentage: property.agentPercentage
  });

  return (
    <Card
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        cursor: onView ? "pointer" : "default",
      }}
      onClick={handleView}>
      
      {/* Property Image with Badges */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={property.images?.[0] || "/images/placeholder-property.jpg"}
          alt={property.title}
          sx={{ objectFit: "cover" }}
        />

        {/* Status Badge */}
        <Box sx={{ position: "absolute", top: 12, left: 12 }}>
          <Chip
            label={getStatusLabel(property.status)}
            color={getStatusColor(property.status)}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        {/* Markup Badge for Agent View - Show for ALL properties */}
        {variant === "agent" && (
          <Box sx={{ position: "absolute", bottom: 12, right: 12 }}>
            <Tooltip title={hasMarkup ? 
              `Markup: ${formatPrice(markupAmount)} (${markupPercentage.toFixed(1)}%)` : 
              'No markup applied'
            }>
              <Chip
                icon={hasMarkup ? <TrendingUpIcon /> : <RemoveIcon />}
                label={hasMarkup ? `+${markupPercentage.toFixed(1)}%` : 'No Markup'}
                color={hasMarkup ? "success" : "default"}
                size="small"
                variant="filled"
                sx={{ fontWeight: "bold" }}
              />
            </Tooltip>
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Property Title and Type */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component="h3"
            fontWeight="bold"
            gutterBottom>
            {property.title}
          </Typography>
          {property.type && (
            <Typography variant="body2" color="text.secondary">
              {property.type}
            </Typography>
          )}
        </Box>

        {/* Property Features */}
        <Box display="flex" gap={2} sx={{ mb: 2, flexWrap: "wrap" }}>
          {property.bedroom !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <BedIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {property.bedroom} {property.bedroom === 1 ? "Bed" : "Beds"}
              </Typography>
            </Box>
          )}

          {/* Servicing Information */}
          {property.servicing && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <BathIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {property.servicing}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Location */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
          <LocationIcon color="action" fontSize="small" />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
            {property.location}
          </Typography>
        </Box>

        {/* PRICING INFORMATION - Show for ALL properties */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>

          {/* FINAL PRICE */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 2, 
            p: 1, 
            backgroundColor: hasMarkup ? 'primary.light' : 'grey.300',
            borderRadius: 1 
          }}>
            <Typography variant="caption" color={hasMarkup ? "primary.contrastText" : "text.secondary"} display="block" gutterBottom>
              FINAL PRICE
            </Typography>
            <Typography variant="h5" color={hasMarkup ? "primary.contrastText" : "text.primary"} fontWeight="bold">
              {formatPrice(totalPrice)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* BASE PRICE - Always show */}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
               ₦ 
              <Typography variant="body2" color="text.secondary">
             Property Price:
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="medium">
              {formatPrice(basePrice)}
            </Typography>
          </Box>

          {/* MARKUP AMOUNT - Always show, even if 0 */}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon color={hasMarkup ? "success" : "action"} fontSize="small" />
              <Typography variant="body2" color={hasMarkup ? "success.main" : "text.secondary"}>
                Markup Price:
              </Typography>
            </Box>
            <Typography variant="body2" color={hasMarkup ? "success.main" : "text.secondary"} fontWeight="bold">
              {hasMarkup ? `+${formatPrice(markupAmount)}` : formatPrice(markupAmount)}
            </Typography>
          </Box>

          {/* MARKUP PERCENTAGE - Always show, even if 0
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary">
              Markup Percentage:
            </Typography>
            <Typography variant="body2" color={hasMarkup ? "success.main" : "text.secondary"} fontWeight="bold">
              {hasMarkup ? `+${markupPercentage.toFixed(2)}%` : `${markupPercentage.toFixed(2)}%`}
            </Typography>
          </Box> */}

          {/* TOTAL PRICE - Always show */}
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Box display="flex" alignItems="center" gap={1}>
              ₦
              <Typography variant="body2" color="info.main">
                Total Price:
              </Typography>
            </Box>
            <Typography variant="body2" color="info.main" fontWeight="bold">
              {formatPrice(totalPrice)}
            </Typography>
          </Box>

          {/* PRICE UPDATE DATE - Show if available */}
          {property.priceChangedAt && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarIcon color="action" fontSize="small" />
                  <Typography variant="caption" color="text.secondary">
                    Price Updated:
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDate(property.priceChangedAt)}
                </Typography>
              </Box>
            </>
          )}

          

          {/* CREATED DATE */}
          {property.createdAt && (
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Listed:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(property.createdAt)}
              </Typography>
            </Box>
          )}

        </Box>

      </CardContent>

      {/* Action Buttons - Only show for agent view and when actions are enabled */}
      {showActions && variant === "agent" && (
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="outlined">
            Remove
          </Button>
        </CardActions>
      )}

      {/* View Details Button for Public View */}
      {variant === "public" && onView && (
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleView}
            size="medium">
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default PropertyCard;