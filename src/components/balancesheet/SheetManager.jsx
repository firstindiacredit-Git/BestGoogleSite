import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';

const SheetManager = ({ sheet, onSheetUpdated, onSheetDeleted }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editedName, setEditedName] = useState(sheet.name);
    const [error, setError] = useState('');

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditClick = () => {
        setEditedName(sheet.name);
        setIsEditDialogOpen(true);
        handleMenuClose();
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
        handleMenuClose();
    };

    const handleEditSubmit = async () => {
        try {
            setError('');
            if (!editedName.trim()) {
                setError('Sheet name cannot be empty');
                return;
            }

            const response = await axios.put(`/sheets/${sheet._id}`, {
                name: editedName.trim()
            });

            onSheetUpdated(response.data);
            setIsEditDialogOpen(false);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update sheet');
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`/sheets/${sheet._id}`);
            onSheetDeleted(sheet._id);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to delete sheet');
        }
    };

    return (
        <>
            <IconButton onClick={handleMenuClick}>
                <MoreVertIcon style={{ color: 'white' }} />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleEditClick}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit Sheet</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleDeleteClick}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>
                        <Typography color="error">Delete Sheet</Typography>
                    </ListItemText>
                </MenuItem>
            </Menu>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)}>
                <DialogTitle>Edit Sheet</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Sheet Name"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            error={!!error}
                            helperText={error}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleEditSubmit} variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogTitle>Delete Sheet</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{sheet.name}"? This action cannot be undone.
                    </Typography>
                    {error && (
                        <Typography color="error" sx={{ mt: 2 }}>
                            {error}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        variant="contained" 
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SheetManager; 