import React, { useState } from 'react';
import axios from 'axios';
import { IconButton, Modal, Box, Typography, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeleteButtonProps {
    apartmentId: string;
    onDeleteSuccess: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ apartmentId, onDeleteSuccess }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await axios.delete(
                `https://homey-host.onrender.com/api/v1/admin/delete-apartment/${apartmentId}`
            );
            alert('Apartment deleted successfully.');
            onDeleteSuccess();
            handleClose();
        } catch (error) {
            console.error('Error deleting apartment:', error);
            alert('Failed to delete the apartment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Delete Icon Button */}
            <IconButton onClick={handleOpen} color="error" aria-label="delete">
                <DeleteIcon />
            </IconButton>

            {/* Confirmation Modal */}
            <Modal open={open} onClose={handleClose} aria-labelledby="delete-confirmation-modal">
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography id="delete-confirmation-modal" variant="h6" component="h2" gutterBottom>
                        Confirm Deletion
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to delete this apartment? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                        <Button onClick={handleClose} variant="outlined" color="primary">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="contained"
                            color="error"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default DeleteButton;