import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Use standard modal props interface
interface EditModalProps {
  open: boolean;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ open, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Add your form fields here
    field1: "",
    field2: "",
    field3: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Your submit logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      onClose();
    } catch (error) {
      console.error("Error updating:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleDialogClose = (
    event: {},
    reason: "backdropClick" | "escapeKeyDown",
  ) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      handleClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isLoading}>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            Edit Information
          </Typography>
          <IconButton onClick={handleClose} disabled={isLoading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Field 1"
                name="field1"
                value={formData.field1}
                onChange={handleInputChange}
                variant="outlined"
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Field 2"
                name="field2"
                value={formData.field2}
                onChange={handleInputChange}
                variant="outlined"
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Field 3"
                name="field3"
                value={formData.field3}
                onChange={handleInputChange}
                variant="outlined"
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            type="button"
            onClick={handleClose}
            variant="outlined"
            disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
            sx={{
              backgroundColor: "#002221",
              "&:hover": {
                backgroundColor: "#003833",
              },
            }}>
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditModal;
