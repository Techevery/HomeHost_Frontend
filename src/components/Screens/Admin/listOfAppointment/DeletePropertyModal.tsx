import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  property: any;
  loading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  property,
  loading = false,
}) => {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon sx={{ fontSize: 32, color: 'error.main' }} />
          </Box>
        </Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Delete Property
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Are you sure you want to delete the following property? This action cannot be undone and all associated data will be permanently removed.
        </Typography>

        {property && (
          <Alert 
            severity="warning" 
            sx={{ 
              textAlign: 'left',
              mb: 2,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {property.name || 'Unnamed Property'}
                </Typography>
                <Typography variant="body2">
                  {property.address || 'No address specified'}
                </Typography>
              </Box>
              <Typography variant="h6" color="error.main" fontWeight="bold">
                {property.price ? `₦${parseInt(property.price).toLocaleString()}` : '₦0'}
              </Typography>
            </Box>
          </Alert>
        )}

        <Alert severity="error" sx={{ textAlign: 'left' }}>
          <Typography variant="body2" fontWeight="bold">
            Warning: This action is irreversible!
          </Typography>
          <Typography variant="body2">
            • Property listing will be permanently deleted<br />
            • All associated images will be removed<br />
            • Any active bookings will be cancelled<br />
            • This cannot be undone
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: 2, flex: 1 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          sx={{ borderRadius: 2, flex: 1 }}
        >
          {loading ? 'Deleting...' : 'Delete Property'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;