import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
//   Typography,
  Box,
  Chip,
  IconButton,
  CardActions,
  Button,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AttachMoney as PriceIcon,
  Star as StarIcon,
  Bathtub as BathIcon,
  Hotel as BedIcon,
  SquareFoot as SizeIcon
} from '@mui/icons-material';

import Typography from "@mui/material/Typography";

export interface Property {
  id: string;
  apartmentId?: string;
  title: string;
  description: string;
  price: number;
  markedUpPrice?: number;
  location: string;
  images: string[];
  status: 'active' | 'inactive' | 'pending' | 'sold';
  type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  agentPercentage?: number;
  createdAt?: string;
   isFeatured?: boolean;
  



}

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (propertyId: string) => void;
  onView?: (propertyId: string) => void;
  showActions?: boolean;
  variant?: 'agent' | 'public';
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  variant = 'agent'
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
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'pending': return 'warning';
      case 'sold': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending';
      case 'sold': return 'Sold';
      default: return status;
    }
  };

  const calculateProfit = () => {
    if (!property.markedUpPrice) return 0;
    return property.markedUpPrice - property.price;
  };

  const profit = calculateProfit();
  const profitPercentage = property.price > 0 ? (profit / property.price) * 100 : 0;

  return (
    <Card 
      sx={{ 
        borderRadius: 3, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        },
        cursor: onView ? 'pointer' : 'default'
      }}
      onClick={handleView}
    >
      {/* Property Image with Badges */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={property.images?.[0] || '/images/placeholder-property.jpg'}
          alt={property.title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Status Badge */}
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Chip
            label={getStatusLabel(property.status)}
            color={getStatusColor(property.status)}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        {/* Featured Badge */}
        {property.isFeatured && (
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <Chip
              icon={<StarIcon />}
              label="Featured"
              color="warning"
              size="small"
              variant="filled"
            />
          </Box>
        )}

        {/* Profit Badge for Agent View */}
        {variant === 'agent' && property.markedUpPrice && (
          <Box sx={{ position: 'absolute', bottom: 12, right: 12 }}>
            <Tooltip title={`Profit: $${profit} (${profitPercentage.toFixed(1)}%)`}>
              <Chip
                label={`+${profitPercentage.toFixed(1)}%`}
                color={profitPercentage > 0 ? 'success' : 'error'}
                size="small"
                variant="filled"
                sx={{ fontWeight: 'bold' }}
              />
            </Tooltip>
          </Box>
        )}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Property Title and Type */}
       <Box sx={{ mb: 2 }}>
  <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
    {property.title}
  </Typography>
  {property.type && (
    <Typography variant="body2" color="text.secondary">
      {property.type}
    </Typography>
  )}
</Box>

        {/* Property Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {property.description}
        </Typography>

        {/* Property Features */}
        <Box display="flex" gap={2} sx={{ mb: 2, flexWrap: 'wrap' }}>
          {property.bedrooms !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <BedIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
              </Typography>
            </Box>
          )}
          
          {property.bathrooms !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <BathIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
              </Typography>
            </Box>
          )}
          
          {property.area !== undefined && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <SizeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {property.area} sqft
              </Typography>
            </Box>
          )}
        </Box>

        {/* Location */}
        <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
          <LocationIcon color="action" fontSize="small" />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {property.location}
          </Typography>
        </Box>

        {/* Pricing Information */}
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 2 }}>
          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
            {/* <PriceIcon color="primary" fontSize="small" /> */}
            <Typography variant="h6" color="primary.main" fontWeight="bold">
              ₦{property.markedUpPrice ? property.markedUpPrice.toLocaleString() : property.price.toLocaleString()}
            </Typography>
            
            {/* Original Price with Strikethrough */}
            {property.markedUpPrice && property.markedUpPrice !== property.price && (
              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
              Amount: ₦{property.price.toLocaleString()}
              </Typography>
            )}
          </Box>

          {/* Agent Commission */}
          {variant === 'agent' && property.agentPercentage && (
            <Typography variant="body2" color="success.main" fontWeight="medium">
              Commission: {property.agentPercentage}%
            </Typography>
          )}

          {/* Profit Display for Agent */}
          {variant === 'agent' && property.markedUpPrice && profit > 0 && (
            <Typography variant="body2" color="success.main">
              Profit: ₦{profit.toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Action Buttons - Only show for agent view and when actions are enabled */}
      {showActions && variant === 'agent' && (
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ mr: 1 }}
            variant="outlined"
          >
            Edit
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            variant="outlined"
          >
            Remove
          </Button>
        </CardActions>
      )}

      {/* View Details Button for Public View */}
      {variant === 'public' && onView && (
        <CardActions sx={{ p: 3, pt: 0 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleView}
            size="medium"
          >
            View Details
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default PropertyCard;