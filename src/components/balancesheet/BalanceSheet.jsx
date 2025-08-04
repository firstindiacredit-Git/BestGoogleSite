import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { message } from 'antd';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  ButtonGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Zoom,
  Fab,
  CircularProgress,
  Skeleton,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Menu,
  ListItemIcon,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import CloseIcon from '@mui/icons-material/Close';
import BlockIcon from '@mui/icons-material/Block';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import './BalanceSheet.css';
import {
  UserOutlined,
  PlusOutlined,
  LogoutOutlined,
  MoreOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

const API_URL = 'https://balance-sheet-backend-three.vercel.app/api';
// const API_URL = 'http://localhost:5000/api';

function BalanceSheet({ sheetId }) {
  const params = useParams();
  const id = sheetId || params.id;
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [sheet, setSheet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEntry, setNewEntry] = useState({
    description: '',
    amount: '',
    type: 'expense',
    photo: null,
  });
  const [editEntry, setEditEntry] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [sharedBy, setSharedBy] = useState('');
  const [openSharedUsersDialog, setOpenSharedUsersDialog] = useState(false);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [isRemovingAccess, setIsRemovingAccess] = useState(false);
  const [removeAccessError, setRemoveAccessError] = useState('');
  const [shareHistory, setShareHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [viewMode, setViewMode] = useState(() => {
    // Initialize viewMode from localStorage or default to 'table'
    const savedViewMode = localStorage.getItem('balanceSheetViewMode');
    return savedViewMode || 'table';
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Add useEffect to save viewMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('balanceSheetViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    console.log('BalanceSheet useEffect triggered');
    console.log('Sheet ID from params:', params.id);
    console.log('Sheet ID from props:', sheetId);
    console.log('Final ID to use:', id);
    
    if (!id) {
      console.error('No sheet ID provided');
      navigate('/balancesheetdashboard');
      return;
    }
    
    fetchSheet();
    fetchEntries();
  }, [id]);

  // Monitor authentication state
  useEffect(() => {
    const checkAuth = () => {
      // Only check token if user is actually logged in
      if (!user || !user._id) {
        message.warning('Login to use this Feature');
        // Redirect to search page after showing message
        setTimeout(() => {
          navigate('/search');
        }, 2000);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        // Show alert instead of redirecting
        message.warning('Login to use this Feature');
        // Redirect to search page after showing message
        setTimeout(() => {
          navigate('/search');
        }, 2000);
        return;
      }
    };

    // Check auth on mount and set up interval
    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, navigate]);

  // Add token validation function
  const validateToken = (token) => {
    try {
      if (!token || typeof token !== 'string') {
        return false;
      }
      
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format: not a valid JWT');
        return false;
      }
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        console.error('Token has expired');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  const fetchSheet = async () => {
    try {
      setIsLoading(true);
      
      // Only read token if user is actually logged in
      if (!user || !user._id) {
        message.warning('Login to use this Feature');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        // Show alert instead of redirecting
        message.warning('Login to use this Feature');
        return;
      }

      // Validate token format
      if (!validateToken(token)) {
        console.error('Invalid token format');
        localStorage.removeItem('token');
        message.warning('Login to use this Feature');
        return;
      }

      console.log('Fetching sheet with ID:', id);
      console.log('Using API URL:', `${API_URL}/sheets/${id}`);
      console.log('Token:', token.substring(0, 20) + '...');

      // First, let's test if the API is accessible
      try {
        const healthCheck = await axios.get(`${API_URL.replace('/api', '')}/health`);
        console.log('API health check response:', healthCheck.data);
      } catch (healthError) {
        console.error('API health check failed:', healthError);
      }

      const response = await axios.get(`${API_URL}/sheets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Sheet response:', response.data);
      setSheet(response.data);
      
      // Check if current user is the owner
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const isOwner = response.data.user === decoded.userId;
          setIsOwner(isOwner);
          
          // If not the owner, set the sharedBy information
          if (!isOwner && response.data.sharedBy) {
            setSharedBy(response.data.sharedBy);
          }
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // Token is invalid, redirect to login
          localStorage.removeItem('token');
          navigate('/balancesheetlogin');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching sheet:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        // Unauthorized - clear token and show alert
        localStorage.removeItem('token');
        message.warning('Login to use this Feature');
      } else if (error.response?.status === 500) {
        // Server error - show user-friendly message
        message.error('Server error. Please try again later.');
      } else {
        message.error('Failed to load balance sheet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEntries = async () => {
    try {
      setIsLoading(true);
      
      // Only read token if user is actually logged in
      if (!user || !user._id) {
        message.warning('Login to use this Feature');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        message.warning('Login to use this Feature');
        return;
      }

      // Validate token format
      if (!validateToken(token)) {
        console.error('Invalid token format');
        localStorage.removeItem('token');
        message.warning('Login to use this Feature');
        return;
      }

      console.log('Fetching entries for sheet ID:', id);
      console.log('Using API URL:', `${API_URL}/sheets/${id}/entries`);

      const response = await axios.get(`${API_URL}/sheets/${id}/entries`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Entries response:', response.data);
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.status === 401) {
        // Unauthorized - clear token and show alert
        localStorage.removeItem('token');
        message.warning('Login to use this Feature');
      } else if (error.response?.status === 500) {
        // Server error - show user-friendly message
        message.error('Server error. Please try again later.');
      } else {
        message.error('Failed to load entries. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSharedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_URL}/sheets/${id}/shared-users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSharedUsers(response.data);
    } catch (error) {
      console.error('Error fetching shared users:', error);
      // Show error to user
      setShareError('Failed to fetch shared users');
    }
  };

  const fetchShareHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setShareError('');
      const token = localStorage.getItem('token');
      if (!token) {
        setShareError('Please log in to view share history');
        return;
      }

      const response = await axios.get(`${API_URL}/users/share-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Share history response:', response.data);
      setShareHistory(response.data);
    } catch (error) {
      console.error('Error fetching share history:', error);
      setShareError(error.response?.data?.error || 'Failed to fetch share history');
      setShareHistory([]); // Reset history on error
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newEntry.description || !newEntry.amount || !newEntry.type) {
        alert('Please fill in all required fields');
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('description', newEntry.description);
    formData.append('amount', newEntry.amount);
    formData.append('type', newEntry.type);
    if (newEntry.photo) {
        formData.append('photo', newEntry.photo);
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in again');
            return;
        }

        console.log('Submitting entry:', {
            description: newEntry.description,
            amount: newEntry.amount,
            type: newEntry.type,
            hasPhoto: !!newEntry.photo,
            photoType: newEntry.photo?.type,
            photoSize: newEntry.photo?.size
        });

        const response = await axios.post(
            `${API_URL}/sheets/${id}/entries`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('Server response:', response.data);

        if (response.data) {
            setNewEntry({
                description: '',
                amount: '',
                type: 'expense',
                photo: null,
            });
            setPreviewImage(null);
            setOpenAddDialog(false);
            fetchEntries();
        }
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });

        let errorMessage = 'Failed to add entry. Please try again.';
        if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
            if (error.response.data.details) {
                errorMessage += `\nDetails: ${JSON.stringify(error.response.data.details)}`;
            }
        }
        alert(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const calculateTotals = () => {
    const income = entries
      .filter((entry) => entry.type === 'income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const expenses = entries
      .filter((entry) => entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const getFilteredEntries = () => {
    let filtered = entries;
    
    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(entry => entry.type === filter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        entry.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const downloadCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount'];
    const csvData = entries.map(entry => [
      new Date(entry.createdAt).toLocaleDateString(),
      entry.description,
      entry.type,
      entry.amount
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${sheet.name}_balance_sheet.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add watermark
    const img = new Image();
    img.src = '/logo.png';
    img.onload = function() {
      // Calculate watermark size and position
      const imgWidth = 100;
      const imgHeight = (imgWidth * img.height) / img.width;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Add watermark with reduced opacity
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({opacity: 0.2}));
      doc.addImage(img, 'PNG', (pageWidth - imgWidth) / 2, (pageHeight - imgHeight) / 2, imgWidth, imgHeight);
      doc.restoreGraphicsState();
      
      // Add title with color
      doc.setFontSize(16);
      doc.setTextColor(25, 118, 210); // Material-UI primary blue color
      doc.text(sheet.name, 14, 15);
      
      // Reset text color for other content
      doc.setTextColor(0, 0, 0); // Reset to black

      // Add summary table
      autoTable(doc, {
        head: [['Summary', 'Value']],
        body: [
          ['Total Income', totals.income.toLocaleString('en-IN')],
          ['Total Expenses', totals.expenses.toLocaleString('en-IN')],
          ['Balance', totals.balance.toLocaleString('en-IN')]
        ],
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold' },
          1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' }
        }
      });

      // Add transactions table
      const tableData = entries.map(entry => [
        new Date(entry.createdAt).toLocaleString('en-IN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        entry.description,
        entry.type.charAt(0).toUpperCase() + entry.type.slice(1),
        entry.amount.toLocaleString('en-IN')
      ]);

      autoTable(doc, {
        head: [['Date', 'Description', 'Type', 'Amount']],
        body: tableData,
        startY: doc.lastAutoTable.finalY + 10,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 70 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' }
        },
        didParseCell: function(data) {
          // Add color to income/expense cells
          if (data.column.index === 2) {
            if (data.cell.raw === 'Income') {
              data.cell.styles.textColor = [76, 175, 80]; // Green for income
            } else if (data.cell.raw === 'Expense') {
              data.cell.styles.textColor = [244, 67, 54]; // Red for expense
            }
          }
          // Add color to amount cells
          if (data.column.index === 3) {
            const type = data.row.cells[2].raw;
            if (type === 'Income') {
              data.cell.styles.textColor = [76, 175, 80]; // Green for income
            } else if (type === 'Expense') {
              data.cell.styles.textColor = [244, 67, 54]; // Red for expense
            }
          }
        }
      });

      doc.save(`${sheet.name}_balance_sheet.pdf`);
    };
  };

  const handleEdit = (entry) => {
    setEditEntry({
      _id: entry._id,
      description: entry.description,
      amount: entry.amount,
      type: entry.type,
      photo: null
    });
    setOpenEditDialog(true);
  };

  const handleDelete = (entry) => {
    setEntryToDelete(entry);
    setOpenDeleteDialog(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editEntry?.description || !editEntry?.amount || !editEntry?.type) {
        alert('Please fill in all required fields');
        return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('description', editEntry.description);
    formData.append('amount', editEntry.amount);
    formData.append('type', editEntry.type);
    if (editEntry.photo) {
        formData.append('photo', editEntry.photo);
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in again');
            return;
        }

        console.log('Updating entry:', {
            id: editEntry._id,
            description: editEntry.description,
            amount: editEntry.amount,
            type: editEntry.type,
            hasPhoto: !!editEntry.photo
        });

        const response = await axios.put(
            `${API_URL}/sheets/${id}/entries/${editEntry._id}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        console.log('Update response:', response.data);
        setOpenEditDialog(false);
        fetchEntries();
    } catch (error) {
        console.error('Error updating entry:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        let errorMessage = 'Failed to update entry. Please try again.';
        if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
            if (error.response.data.details) {
                errorMessage += `\nDetails: ${JSON.stringify(error.response.data.details)}`;
            }
        }
        alert(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/delete/sheets/${id}/entries/${entryToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setOpenDeleteDialog(false);
      fetchEntries();
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handlePhotoClick = (photo) => {
    if (photo) {
        setSelectedPhoto(photo);
        setOpenPhotoDialog(true);
    }
  };

  const handleShare = async () => {
    if (!shareEmail) {
      setShareError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shareEmail)) {
      setShareError('Please enter a valid email address');
      return;
    }

    setIsSharing(true);
    setShareError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again');
        return;
      }

      console.log('Attempting to share sheet:', {
        sheetId: id,
        email: shareEmail,
        url: `${API_URL}/sheets/share/${id}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await axios.post(
        `${API_URL}/sheets/share/${id}`,
        { email: shareEmail },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Share response:', response.data);
      if (response.data.sharedBy) {
        setSharedBy(response.data.sharedBy);
      }

      setShareSuccess(true);
      setOpenShareDialog(false);
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing sheet:', error);
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      const errorMessage = error.response?.data?.error || 'Failed to share balance sheet';
      setShareError(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemoveAccess = async (userId) => {
    try {
      setIsRemovingAccess(true);
      setRemoveAccessError('');

      const token = localStorage.getItem('token');
      if (!token) {
        setRemoveAccessError('Please log in again');
        return;
      }

      console.log('Removing user access:', { sheetId: id, userId });

      const response = await axios.delete(
        `${API_URL}/sheets/${id}/shared-users/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Remove access response:', response.data);
      setShareSuccess(true);
      await fetchSharedUsers();
      
      // If this was the last shared user, close the dialog
      if (sharedUsers.length === 1) {
        setOpenShareDialog(false);
      }
    } catch (error) {
      console.error('Error removing user access:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove user access';
      setRemoveAccessError(errorMessage);
    } finally {
      setIsRemovingAccess(false);
    }
  };

  // Add this function to check if user has edit permissions
  const hasEditPermissions = () => {
    return isOwner;
  };

  // Update useEffect to fetch share history when share dialog opens
  useEffect(() => {
    if (openShareDialog) {
      fetchShareHistory();
    }
  }, [openShareDialog]);

  // Add these new handlers
  const handleMenuClick = (event, entry) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedEntry(entry);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedEntry(null);
  };

  const handleMenuEdit = () => {
    handleEdit(selectedEntry);
    handleMenuClose();
  };

  const handleMenuDelete = () => {
    handleDelete(selectedEntry);
    handleMenuClose();
  };

  // Add this new function to render grid view
  const renderGridView = () => (
    <Grid container spacing={{ xs: 1, sm: 2 }}>
      {getFilteredEntries().map((entry) => (
        <Grid item xs={12} sm={6} md={4} key={entry._id}>
          <Card 
            elevation={2}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: { xs: 2, sm: 2 },
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }
            }}
          >
            {/* Type Indicator Bar - Side */}
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: '2px',
              background: entry.type === 'income' 
                ? 'linear-gradient(180deg, #4caf50, #81c784)' 
                : 'linear-gradient(180deg, #f44336, #e57373)'
            }} />

            <CardContent sx={{ 
              flex: 1, 
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              pl: { xs: 2, sm: 2.5 } // Add left padding to account for the side bar
            }}>
              {/* Header Section with Photo and Menu */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                mb: 0.5,
                position: 'relative'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 0.5,
                  flex: 1,
                  pr: entry.photo ? 3 : 0
                }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="currentColor"/>
                    </svg>
                    {new Date(entry.createdAt).toLocaleString('en-IN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color={entry.type === 'income' ? 'success.main' : 'error.main'}
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    ₹{entry.amount.toFixed(2)}
                  </Typography>
                </Box>

                {/* Photo in Corner */}
                {entry.photo && (
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: { xs: '48px', sm: '64px' },
                    height: { xs: '48px', sm: '64px' },
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      '& .photo-overlay': {
                        opacity: 1
                      }
                    }
                  }}>
                    <img
                      src={entry.photo}
                      alt="Entry photo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onClick={() => handlePhotoClick(entry.photo)}
                    />
                    <Box 
                      className="photo-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s ease'
                      }}
                      onClick={() => handlePhotoClick(entry.photo)}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="white"/>
                      </svg>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={entry.type}
                    size="small"
                    sx={{
                      bgcolor: entry.type === 'income' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                      color: entry.type === 'income' ? '#4caf50' : '#f44336',
                      fontWeight: 'bold',
                      fontSize: { xs: '0.625rem', sm: '0.75rem' },
                      height: { xs: '20px', sm: '24px' }
                    }}
                  />
                  {hasEditPermissions() && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, entry)}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.04)'
                        }
                      }}
                    >
                      <MoreVertIcon sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Description Section */}
              <Typography 
                variant="body1" 
                sx={{ 
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4
                }}
              >
                {entry.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}

      {/* Menu for Edit/Delete Options */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 2,
            mt: 1,
            minWidth: '180px'
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleMenuEdit} sx={{ py: 1 }}>
          <ListItemIcon>
            <EditIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Edit" 
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          />
        </MenuItem>
        <MenuItem onClick={handleMenuDelete} sx={{ py: 1 }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText 
            primary="Delete" 
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'error.main'
            }}
          />
        </MenuItem>
      </Menu>
    </Grid>
  );

  if (isLoading) {
    return (
      <Container>
        {/* Header Skeleton */}
        <Box sx={{ 
          mt: 4, 
          mb: 4, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          gap: '3px',
          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          borderRadius: 2,
          p: 2,
          color: 'white'
        }}>
          <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={36} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)', borderRadius: 1 }} />
          </Box>
        </Box>

        {/* Summary Card Skeleton */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, bgcolor: '#1976d2' }}>
                  <Skeleton variant="text" width={150} height={30} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                </Box>
                <Grid container spacing={0}>
                  {[1, 2, 3].map((item) => (
                    <Grid item xs={12} md={4} key={item}>
                      <Box sx={{ p: 3, borderRight: item !== 3 ? '1px solid #e0e0e0' : 'none' }}>
                        <Skeleton variant="text" width={100} height={24} />
                        <Skeleton variant="text" width={150} height={40} />
                        <Skeleton variant="text" width={120} height={20} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Table Skeleton */}
          <Grid item xs={12}>
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1976d2' }}>
                    {['Date', 'Description', 'Type', 'Amount', 'Photo', 'Actions'].map((header) => (
                      <TableCell key={header} sx={{ color: 'white', fontWeight: 'bold' }}>
                        <Skeleton variant="text" width={80} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <TableRow key={row}>
                      <TableCell><Skeleton variant="text" width={120} /></TableCell>
                      <TableCell><Skeleton variant="text" width={200} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Skeleton variant="circular" width={32} height={32} />
                          <Skeleton variant="circular" width={32} height={32} />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!sheet) return null;

  const totals = calculateTotals();

  // Update the share dialog to include history
  const renderShareDialog = () => (
    <Dialog 
      open={openShareDialog} 
      onClose={() => {
        setOpenShareDialog(false);
        setShareEmail('');
        setShareError('');
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShareIcon />
          <Typography variant="h6">Share Balance Sheet</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={() => {
            setOpenShareDialog(false);
            setShareEmail('');
            setShareError('');
          }}
          sx={{
            color: 'white',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={shareEmail}
          onChange={(e) => {
            setShareEmail(e.target.value);
            setShareError('');
          }}
          margin="normal"
          required
          variant="outlined"
          error={!!shareError}
          helperText={shareError}
          disabled={isSharing}
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
          Recently Shared With
        </Typography>
        
        {isLoadingHistory ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : shareHistory.length > 0 ? (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1,
            mb: 2
          }}>
            {shareHistory.map((user) => (
              <Chip
                key={user._id}
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {(user.username || user.email)[0].toUpperCase()}
                  </Avatar>
                }
                label={user.username || user.email}
                onClick={() => setShareEmail(user.email)}
                sx={{
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            No recent sharing history
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
        <Button 
          onClick={() => {
            setOpenShareDialog(false);
            setShareEmail('');
            setShareError('');
          }}
          disabled={isSharing}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleShare}
          variant="contained" 
          color="primary"
          disabled={isSharing}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)'
            }
          }}
        >
          {isSharing ? <CircularProgress size={24} /> : 'Share'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl" sx={{ 
      px: { xs: 0.5, sm: 2, md: 3 },
      py: { xs: 1, sm: 3 },
      overflow: 'hidden',
      pb: { xs: '80px', sm: 3 }
    }}>
      {/* Mobile Header */}
      <Box className="css-35ijrp" sx={{
        p: { xs: 1.5, sm: 3 },
        mb: { xs: 1, sm: 3 },
        borderRadius: { xs: 0, sm: 2 },
        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 1, sm: 0 }
        }}>
          {/* Sheet Name Section */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                color: 'white',
                fontSize: { xs: '1.25rem', sm: '2rem', md: '2.125rem' },
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              {sheet.name}
            </Typography>
            {!isOwner && sharedBy && (
              <Typography 
                variant="subtitle1" 
                component="span" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: { xs: '0.75rem', sm: '1rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                <PeopleIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                Shared by {sharedBy}
              </Typography>
            )}
          </Box>
<div className='csvcss'>
          {/* Action Buttons Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'row' },
            gap: { xs: 0.5, sm: 2 },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-end', sm: 'flex-end' }
          }}>
            <ButtonGroup 
              variant="contained" 
              size="small"
              sx={{ 
                width: { xs: 'auto', sm: 'auto' },
                '& .MuiButton-root': {
                  flex: { xs: 1, sm: 'none' },
                  fontSize: { xs: '0.625rem', sm: '0.875rem' },
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 0.75, sm: 2 },
                  whiteSpace: 'nowrap',
                  minWidth: { xs: 'auto', sm: 'auto' }
                }
              }}
            >
              <Button
                startIcon={<FileDownloadIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />}
                onClick={downloadCSV}
                sx={{ 
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#388e3c' }
                }}
              >
                CSV
              </Button>
              <Button
                startIcon={<PictureAsPdfIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />}
                onClick={downloadPDF}
                sx={{ 
                  bgcolor: '#f44336',
                  '&:hover': { bgcolor: '#d32f2f' }
                }}
              >
                PDF
              </Button>
              {hasEditPermissions() && (
                <Button
                  startIcon={<ShareIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />}
                  onClick={() => setOpenShareDialog(true)}
                  sx={{ 
                    bgcolor: '#9c27b0',
                    '&:hover': { bgcolor: '#7b1fa2' }
                  }}
                >
                  Share
                </Button>
              )}
            </ButtonGroup>
            {/* <Button 
              variant="outlined" 
              size="small"
              onClick={() => navigate('/balancesheetdashboard')}
              sx={{ 
                color: 'white',
                borderColor: 'white',
                fontSize: { xs: '0.625rem', sm: '0.875rem' },
                py: { xs: 0.5, sm: 1 },
                px: { xs: 0.75, sm: 2 },
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Back
            </Button> */}
          </Box>
          </div>
        </Box>
      </Box>

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12}>
          <Card 
            elevation={3}
            sx={{ 
              borderRadius: { xs: 0, sm: 2 },
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #e0e0e0',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
              <Box sx={{ 
                p: { xs: 1.5, sm: 3 }, 
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                color: 'white'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                    fontSize: { xs: '0.875rem', sm: '1.25rem' }
                  }}
                >
                  Financial Summary
                </Typography>
              </Box>
              <Grid container spacing={0}>
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(76, 175, 80, 0.05)',
                      borderRight: { xs: 'none', md: '1px solid #e0e0e0' },
                      borderBottom: { xs: '1px solid #e0e0e0', md: 'none' }
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      gutterBottom
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '1rem' }
                      }}
                    >
                      Total Income
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color="success.main"
                      sx={{ 
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                        mb: 0.5,
                        fontSize: { xs: '1.25rem', sm: '2rem' }
                      }}
                    >
                      ₹{totals.income.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="success.main"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' }
                      }}
                    >
                      Income Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'rgba(244, 67, 54, 0.05)',
                      borderRight: { md: '1px solid #e0e0e0' },
                      borderBottom: { xs: '1px solid #e0e0e0', md: 'none' }
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      gutterBottom
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '1rem' }
                      }}
                    >
                      Total Expenses
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color="error.main"
                      sx={{ 
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                        mb: 0.5,
                        fontSize: { xs: '1.25rem', sm: '2rem' }
                      }}
                    >
                      ₹{totals.expenses.toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="error.main"
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' }
                      }}
                    >
                      Expense Transactions
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 3 },
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: totals.balance >= 0 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : 'rgba(244, 67, 54, 0.1)',
                      borderRadius: { xs: '0 0 8px 8px', md: '0 8px 8px 0' }
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      color="text.secondary"
                      gutterBottom
                      sx={{ 
                        fontWeight: 500,
                        fontSize: { xs: '0.75rem', sm: '1rem' }
                      }}
                    >
                      Current Balance
                    </Typography>
                    <Typography 
                      variant="h4" 
                      color={totals.balance >= 0 ? 'success.main' : 'error.main'}
                      sx={{ 
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                        mb: 0.5,
                        fontSize: { xs: '1.25rem', sm: '2rem' }
                      }}
                    >
                      ₹{Math.abs(totals.balance).toFixed(2)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={totals.balance >= 0 ? 'success.main' : 'error.main'}
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontSize: { xs: '0.625rem', sm: '0.875rem' },
                        fontWeight: 500
                      }}
                    >
                      {totals.balance >= 0 ? 'Positive Balance' : 'Negative Balance'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ 
            mb: { xs: 1, sm: 2 }, 
            display: 'flex', 
            gap: { xs: 0.5, sm: 2 }, 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap'
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 2 },
              width: { xs: '100%', sm: 'auto' },
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <TextField
                placeholder="Search entries..."
                variant="outlined"
                size="small"
                value={searchQuery}
                className='dark:outline-none dark:border-white rounded-lg dark:text-white'
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: '100%', sm: '250px' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: { xs: 1, sm: 2 },
                    '&:hover fieldset': {
                      borderColor: '#1976d2',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 0.75, sm: 1 }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box className='dark:text-white dark:border-white' sx={{ mr: 1, color: 'text.secondary' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
                      </svg>
                    </Box>
                  ),
                  endAdornment: searchQuery && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ mr: -1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <ButtonGroup 
                variant="contained" 
                size="small"
                aria-label="filter buttons"
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                  '& .MuiButton-root': {
                    flex: { xs: 1, sm: 'none' },
                    fontSize: { xs: '0.625rem', sm: '0.875rem' },
                    py: { xs: 0.5, sm: 1 },
                    px: { xs: 0.75, sm: 2 },
                    minWidth: { xs: '0', sm: 'auto' }
                  }
                }}
              >
                <Button
                  onClick={() => setFilter('all')}
                  variant={filter === 'all' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: filter === 'all' ? '#1976d2' : 'transparent',
                    color: filter === 'all' ? 'white' : '#1976d2',
                    '&:hover': {
                      bgcolor: filter === 'all' ? '#1565c0' : 'rgba(25, 118, 210, 0.1)'
                    }
                  }}
                >
                  All
                </Button>
                <Button
                  onClick={() => setFilter('income')}
                  variant={filter === 'income' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: filter === 'income' ? '#4caf50' : 'transparent',
                    color: filter === 'income' ? 'white' : '#4caf50',
                    '&:hover': {
                      bgcolor: filter === 'income' ? '#388e3c' : 'rgba(76, 175, 80, 0.1)'
                    }
                  }}
                >
                  Income
                </Button>
                <Button
                  onClick={() => setFilter('expense')}
                  variant={filter === 'expense' ? 'contained' : 'outlined'}
                  sx={{
                    bgcolor: filter === 'expense' ? '#f44336' : 'transparent',
                    color: filter === 'expense' ? 'white' : '#f44336',
                    '&:hover': {
                      bgcolor: filter === 'expense' ? '#d32f2f' : 'rgba(244, 67, 54, 0.1)'
                    }
                  }}
                >
                  Expenses
                </Button>
              </ButtonGroup>
            </Box>

            <ButtonGroup 
              variant="outlined" 
              size="small"
              aria-label="view toggle"
              sx={{
                width: { xs: '100%', sm: 'auto' },
                '& .MuiButton-root': {
                  flex: { xs: 1, sm: 'none' },
                  fontSize: { xs: '0.625rem', sm: '0.875rem' },
                  py: { xs: 0.5, sm: 1 },
                  px: { xs: 0.75, sm: 2 }
                }
              }}
            >
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                startIcon={<ViewListIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                sx={{
                  bgcolor: viewMode === 'table' ? '#1976d2' : 'transparent',
                  color: viewMode === 'table' ? 'white' : '#1976d2',
                  '&:hover': {
                    bgcolor: viewMode === 'table' ? '#1565c0' : 'rgba(25, 118, 210, 0.1)'
                  }
                }}
              >
                Table
              </Button>
              <Button
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                startIcon={<ViewModuleIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                sx={{
                  bgcolor: viewMode === 'grid' ? '#1976d2' : 'transparent',
                  color: viewMode === 'grid' ? 'white' : '#1976d2',
                  '&:hover': {
                    bgcolor: viewMode === 'grid' ? '#1565c0' : 'rgba(25, 118, 210, 0.1)'
                  }
                }}
              >
                Grid
              </Button>
            </ButtonGroup>
          </Box>

          {viewMode === 'table' ? (
            // Existing table view code
            <Box sx={{ 
              width: '100%',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              '&::-webkit-scrollbar': {
                height: '4px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '2px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '2px',
                '&:hover': {
                  background: '#555',
                },
              },
            }}>
              <TableContainer 
                component={Paper}
                sx={{ 
                  borderRadius: { xs: 0, sm: 2 },
                  overflow: 'hidden',
                  boxShadow: 3,
                  minWidth: { xs: '600px', sm: '100%' }
                }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#1976d2' }}>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.625rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        px: { xs: 0.75, sm: 2 },
                        py: { xs: 0.75, sm: 1 }
                      }}>Date</TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.625rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        px: { xs: 0.75, sm: 2 },
                        py: { xs: 0.75, sm: 1 }
                      }}>Description</TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.625rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        px: { xs: 0.75, sm: 2 },
                        py: { xs: 0.75, sm: 1 }
                      }}>Type</TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.625rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        px: { xs: 0.75, sm: 2 },
                        py: { xs: 0.75, sm: 1 }
                      }}>Amount</TableCell>
                      <TableCell sx={{ 
                        color: 'white', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.625rem', sm: '0.875rem' },
                        whiteSpace: 'nowrap',
                        px: { xs: 0.75, sm: 2 },
                        py: { xs: 0.75, sm: 1 }
                      }}>Photo</TableCell>
                      {hasEditPermissions() && (
                        <TableCell sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.625rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                          px: { xs: 0.75, sm: 2 },
                          py: { xs: 0.75, sm: 1 }
                        }}>Actions</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredEntries().map((entry, index) => (
                      <TableRow 
                        key={entry._id}
                        sx={{ 
                          bgcolor: index % 2 === 0 ? 'white' : '#f5f5f5',
                          '&:hover': { bgcolor: '#e3f2fd' }
                        }}
                      >
                        <TableCell sx={{ 
                          fontSize: { xs: '0.625rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                          px: { xs: 0.75, sm: 2 },
                          py: { xs: 0.75, sm: 1 }
                        }}>
                          {new Date(entry.createdAt).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.625rem', sm: '0.875rem' },
                          maxWidth: { xs: '120px', sm: 'none' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          px: { xs: 0.75, sm: 2 },
                          py: { xs: 0.75, sm: 1 }
                        }}>
                          {entry.description}
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.625rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                          px: { xs: 0.75, sm: 2 },
                          py: { xs: 0.75, sm: 1 }
                        }}>
                          <Typography
                            color={entry.type === 'income' ? 'success.main' : 'error.main'}
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.625rem', sm: '0.875rem' }
                            }}
                          >
                            {entry.type}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ 
                          fontSize: { xs: '0.625rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap',
                          px: { xs: 0.75, sm: 2 },
                          py: { xs: 0.75, sm: 1 }
                        }}>
                          <Typography
                            color={entry.type === 'income' ? 'success.main' : 'error.main'}
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: { xs: '0.625rem', sm: '0.875rem' }
                            }}
                          >
                            ₹{entry.amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ 
                          px: { xs: 0.75, sm: 2 },
                          py: { xs: 0.75, sm: 1 }
                        }}>
                          {entry.photo && (
                            <IconButton
                              onClick={() => handlePhotoClick(entry.photo)}
                              size="small"
                              sx={{ p: { xs: 0.25, sm: 0.5 } }}
                            >
                              <img
                                src={entry.photo}
                                alt="Entry photo"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                            </IconButton>
                          )}
                        </TableCell>
                        {hasEditPermissions() && (
                          <TableCell sx={{ 
                            px: { xs: 0.75, sm: 2 },
                            py: { xs: 0.75, sm: 1 }
                          }}>
                            <ButtonGroup size="small">
                              <IconButton
                                color="primary"
                                onClick={() => handleEdit(entry)}
                                size="small"
                                sx={{ 
                                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.1)' },
                                  padding: { xs: '2px', sm: '8px' }
                                }}
                              >
                                <EditIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(entry)}
                                size="small"
                                sx={{ 
                                  '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                                  padding: { xs: '2px', sm: '8px' }
                                }}
                              >
                                <DeleteIcon sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }} />
                              </IconButton>
                            </ButtonGroup>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            // Grid view
            renderGridView()
          )}
        </Grid>
      </Grid>

      {/* Floating Action Buttons */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: { xs: 12, sm: 24 }, 
        right: { xs: 12, sm: 24 }, 
        display: { xs: 'none', sm: 'flex' }, 
        flexDirection: 'column', 
        gap: 1,
        zIndex: 1000
      }}>
        {hasEditPermissions() && (
          <>
            <Fab
              color="primary"
              aria-label="share"
              onClick={() => {
                fetchSharedUsers();
                setOpenSharedUsersDialog(true);
              }}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)'
                },
                width: { xs: 40, sm: 56 },
                height: { xs: 40, sm: 56 },
                top: { xs: 12, sm: -60 },
                right: { xs: 12, sm: -3 }
              }}
            >
              <PeopleIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
            </Fab>
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setOpenAddDialog(true)}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
                },
                width: { xs: 40, sm: 56 },
                height: { xs: 40, sm: 56 },
                right: { xs: 12, sm: -5 }
              }}
            >
              <AddIcon sx={{ fontSize: { xs: '1rem', sm: '1.5rem' } }} />
            </Fab>
          </>
        )}
      </Box>

      {/* Add Entry Dialog */}
      <Dialog 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Add New Entry
          {isSubmitting && (
            <CircularProgress 
              size={20} 
              sx={{ 
                ml: 2,
                color: 'primary.main'
              }} 
            />
          )}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Description"
                  value={newEntry.description}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, description: e.target.value })
                  }
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newEntry.amount}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, amount: e.target.value })
                  }
                  required
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2 },
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newEntry.type}
                    onChange={(e) =>
                      setNewEntry({ ...newEntry, type: e.target.value })
                    }
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="income">Income</MenuItem>
                    <MenuItem value="expense">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="photo-upload"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Validate file size (5MB limit)
                        if (file.size > 5 * 1024 * 1024) {
                          alert('File size should be less than 5MB');
                          e.target.value = null;
                          return;
                        }
                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                          alert('Please upload an image file');
                          e.target.value = null;
                          return;
                        }
                        setNewEntry({ ...newEntry, photo: file });
                        // Create preview URL
                        const previewUrl = URL.createObjectURL(file);
                        setPreviewImage(previewUrl);
                      }
                    }}
                  />
                  <label htmlFor="photo-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      Upload Photo
                    </Button>
                  </label>
                  {previewImage && (
                    <Box sx={{ mt: 1, textAlign: 'center' }}>
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain'
                        }}
                      />
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setNewEntry({ ...newEntry, photo: null });
                          setPreviewImage(null);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Remove Photo
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenAddDialog(false);
            setNewEntry({
              description: '',
              amount: '',
              type: 'expense',
              photo: null,
            });
            setPreviewImage(null);
          }}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)'
              }
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={openEditDialog} 
        onClose={() => setOpenEditDialog(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Edit Entry
          {isSubmitting && (
            <CircularProgress 
              size={20} 
              sx={{ 
                ml: 2,
                color: 'primary.main'
              }} 
            />
          )}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <TextField
              fullWidth
              label="Description"
              value={editEntry?.description || ''}
              onChange={(e) =>
                setEditEntry({ ...editEntry, description: e.target.value })
              }
              margin="normal"
              required
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={editEntry?.amount || ''}
              onChange={(e) =>
                setEditEntry({ ...editEntry, amount: e.target.value })
              }
              margin="normal"
              required
              variant="outlined"
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
              }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={editEntry?.type || 'expense'}
                onChange={(e) =>
                  setEditEntry({ ...editEntry, type: e.target.value })
                }
                variant="outlined"
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="file"
              onChange={(e) =>
                setEditEntry({ ...editEntry, photo: e.target.files[0] })
              }
              margin="normal"
              inputProps={{ accept: 'image/*' }}
            />
            {editEntry?.photo && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={URL.createObjectURL(editEntry.photo)}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>
          Confirm Delete
          {isSubmitting && (
            <CircularProgress 
              size={20} 
              sx={{ 
                ml: 2,
                color: 'error.main'
              }} 
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained" 
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Dialog */}
      <Dialog
        open={openPhotoDialog}
        onClose={() => setOpenPhotoDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Photo Preview</DialogTitle>
        <DialogContent>
          {selectedPhoto && (
            <img
              src={selectedPhoto}
              alt="Entry photo"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPhotoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      {renderShareDialog()}

      {/* Success Snackbar */}
      <Snackbar
        open={shareSuccess}
        autoHideDuration={6000}
        onClose={() => setShareSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShareSuccess(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Balance sheet shared successfully!
        </Alert>
      </Snackbar>

      {/* Shared Users Dialog */}
      <Dialog
        open={openSharedUsersDialog}
        onClose={() => setOpenSharedUsersDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon />
            <Typography variant="h6">Shared With</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={() => setOpenSharedUsersDialog(false)}
            sx={{
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {removeAccessError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                borderRadius: 1,
                '& .MuiAlert-icon': {
                  color: 'error.main'
                }
              }}
            >
              {removeAccessError}
            </Alert>
          )}
          {sharedUsers.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 4,
              color: 'text.secondary'
            }}>
              <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Not Shared Yet
              </Typography>
              <Typography variant="body2">
                Share this balance sheet with others to collaborate
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {sharedUsers.map((user) => (
                <ListItem
                  key={user._id}
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                  secondaryAction={
                    <Tooltip title="Remove Access">
                      <IconButton
                        edge="end"
                        aria-label="remove access"
                        onClick={() => handleRemoveAccess(user._id)}
                        disabled={isRemovingAccess}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        {isRemovingAccess ? (
                          <CircularProgress size={24} color="error" />
                        ) : (
                          <BlockIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white'
                    }}>
                      {(user.username || user.email)[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {user.username || user.email}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        Shared on {new Date(user.sharedAt).toLocaleDateString()}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.default' }}>
          <Button
            onClick={() => setOpenSharedUsersDialog(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            
            onClick={() => {
              setOpenSharedUsersDialog(false);
              setOpenShareDialog(true);
            }}
            startIcon={<PersonAddIcon />}
            sx={{
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            Share with More
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      {hasEditPermissions() && (
        <div className="mobile-bottom-nav">
          <div className="nav-item" onClick={() => setOpenShareDialog(true)}>
            <ShareAltOutlined />
            <span>Share</span>
          </div>
          <div className="nav-item" onClick={() => setOpenAddDialog(true)}>
            <PlusOutlined />
            <span>Add Entry</span>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 576px) {
          .mobile-bottom-nav {
            display: flex;
          }
        }
        @media (min-width: 577px) {
          .mobile-bottom-nav {
            display: none !important;
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
          }
        }
        .mobile-bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: white;
          display: flex;
          justify-content: space-around;
          align-items: center;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          cursor: pointer;
          color: #666;
          transition: all 0.3s ease;
        }
        .nav-item:hover {
          color: #1976d2;
        }
        .nav-item span {
          font-size: 12px;
          margin-top: 4px;
        }
        .nav-item .anticon {
          font-size: 20px;
        }
      `}</style>
    </Container>
  );
}

export default BalanceSheet; 