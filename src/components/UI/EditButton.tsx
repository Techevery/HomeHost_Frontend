import React, { useState } from 'react';
import axios from 'axios';
import { IconButton, Modal, Box, Typography, TextField, Button, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface EditButtonProps {
  apartmentId: string;
  onEditSuccess: () => void;
}

const EditButton: React.FC<EditButtonProps> = ({ apartmentId, onEditSuccess }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apartmentDetails, setApartmentDetails] = useState({
    name: '',
    address: '',
    type: '',
    servicing: '',
    bedroom: '',
    price: 0,
    image: null as File | null, // Added image field
    imageUrl: '', // URL for displaying the current or uploaded image
  });

  const handleOpen = async () => {
    setOpen(true);
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage or cookies
      if (!token) {
        alert('You must be logged in as an admin to edit apartments.');
        setOpen(false);
        return;
      }

      const response = await axios.get(
        `https://homey-host.onrender.com/api/v1/admin/get-apartment/${apartmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { apartment } = response.data.data;
      setApartmentDetails({
        name: apartment.name,
        address: apartment.address,
        type: apartment.type,
        servicing: apartment.servicing,
        bedroom: apartment.bedroom,
        price: apartment.price,
        image: null, // Reset image field
        imageUrl: apartment.images?.[0] || '', // Use the first image URL if available
      });
    } catch (error) {
      console.error('Error fetching apartment details:', error);
      // alert('Failed to fetch apartment details. Please try again.');
      setOpen(false);
    }
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage or cookies
      if (!token) {
        // alert('You must be logged in as an admin to edit apartments.');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('name', apartmentDetails.name);
      formData.append('address', apartmentDetails.address);
      formData.append('type', apartmentDetails.type);
      formData.append('servicing', apartmentDetails.servicing);
      formData.append('bedroom', apartmentDetails.bedroom);
      formData.append('price', apartmentDetails.price.toString());
      if (apartmentDetails.image) {
        formData.append('image', apartmentDetails.image); // Append image if uploaded
      }

      await axios.put(
        `https://homey-host.onrender.com/api/v1/admin/edit-apartment/${apartmentId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Apartment updated successfully.');
      onEditSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating apartment:', error);
      // alert('Failed to update the apartment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApartmentDetails((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setApartmentDetails((prev) => ({
          ...prev,
          image: file,
          imageUrl: reader.result as string, // Update the avatar preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Edit Icon Button */}
      <IconButton onClick={handleOpen} color="primary" aria-label="edit">
        <EditIcon />
      </IconButton>

      {/* Edit Modal */}
      <Modal open={open} onClose={handleClose} aria-labelledby="edit-apartment-modal">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography id="edit-apartment-modal" variant="h6" component="h2" gutterBottom>
            Edit Apartment
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={apartmentDetails.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Address"
              name="address"
              value={apartmentDetails.address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Type"
              name="type"
              value={apartmentDetails.type}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Servicing"
              name="servicing"
              value={apartmentDetails.servicing}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Bedrooms"
              name="bedroom"
              value={apartmentDetails.bedroom}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Price"
              name="price"
              type="number"
              value={apartmentDetails.price}
              onChange={handleChange}
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
              <Avatar
                src={apartmentDetails.imageUrl}
                alt="Apartment Image"
                sx={{ width: 80, height: 80 }}
              />
              <Button
                variant="outlined"
                component="label"
              >
                Upload Apartment
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
            {apartmentDetails.image && (
              <Typography variant="body2" color="textSecondary">
                Selected File: {apartmentDetails.image.name}
              </Typography>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={handleClose} variant="outlined" color="primary">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default EditButton;