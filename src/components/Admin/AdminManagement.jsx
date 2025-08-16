import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

const API_URL = 'https://api.smartcareerassistant.online';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    role: 'viewer' // Default role
  });

  const fetchAdmins = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const tokenType = localStorage.getItem('tokenType');
      
      // Log request details
      const requestUrl = `${API_URL}/auth/admin/list?page=${page + 1}&size=${rowsPerPage}`;
      const authHeader = `Bearer ${token}`;
      
      console.log('Making request to:', requestUrl);
      console.log('Full request headers:', {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      });
      
      // Parse the token to see what's in it
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', tokenPayload);
      } catch (e) {
        console.log('Could not parse token:', e);
      }
      
      if (!token || !tokenType) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_URL}/auth/admin/list?page=${page + 1}&size=${rowsPerPage}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers));
        console.log('Full error data:', JSON.stringify(errorData, null, 2));
        
        if (response.status === 422) {
          const errorDetail = typeof errorData?.detail === 'object' 
            ? JSON.stringify(errorData.detail) 
            : errorData?.detail;
          throw new Error(`Authentication error: ${errorDetail || 'Token is missing or invalid'}`);
        }
        throw new Error(errorData?.detail || 'Failed to fetch admins');
      }

      const data = await response.json();
      console.log('Admin response:', data);
      
      if (data && Array.isArray(data.admins)) {
        setAdmins(data.admins);
        setTotalAdmins(data.total || data.admins.length);
        setError(null);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admins:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        statusText: err.statusText,
        type: err.type
      });
      
      let errorMessage = 'Failed to fetch admin list';
      if (err.message.includes('CORS')) {
        errorMessage = 'CORS error: Please ensure the API server is configured to accept requests from this origin';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Please check if the API server is running';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    // Get user role from token when component mounts
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(tokenPayload.role);
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreateAdmin = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const tokenType = localStorage.getItem('tokenType');

      const response = await fetch(`${API_URL}/auth/admin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `${tokenType} ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify(newAdmin)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || 'Failed to create admin');
      }

      setSuccessMessage('Admin created successfully');
      setCreateDialogOpen(false);
      setNewAdmin({ username: '', password: '', role: 'viewer' });
      fetchAdmins();
    } catch (err) {
      setError(err.message);
      console.error('Error creating admin:', err);
    }
  };

  const handleDeleteClick = (admin) => {
    try {
      // Get current user's ID and role from token
      const token = localStorage.getItem('adminToken');
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      
      // Check if trying to delete own account
      if (admin.id === tokenPayload.id) {
        setError('You cannot delete your own account');
        return;
      }
      
      // Check if user has super_admin role
      if (tokenPayload.role !== 'super_admin') {
        setError('Only super admins can delete other admins');
        return;
      }
      
      setAdminToDelete(admin);
      setDeleteDialogOpen(true);
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to validate permissions');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete?.id) {
      setError('No admin selected for deletion');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_URL}/auth/admin/${adminToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          throw new Error('Only super admins can delete other admins');
        } else if (response.status === 400) {
          throw new Error('You cannot delete your own account');
        } else if (response.status === 404) {
          throw new Error('Admin not found');
        } else {
          throw new Error(errorData.detail || 'Failed to delete admin');
        }
      }

      const deletedAdmin = await response.json();
      console.log('Deleted admin:', deletedAdmin);
      
      setDeleteDialogOpen(false);
      setSuccessMessage(`Admin ${deletedAdmin.username} deleted successfully`);
      setAdminToDelete(null);
      fetchAdmins(); // Refresh the list
    } catch (error) {
      console.error('Error deleting admin:', error);
      setError(error.message);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {userRole === 'super_admin' && (
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setCreateDialogOpen(true)}
                  startIcon={<AddIcon />}
                >
                  Create Admin
                </Button>
              </Box>
            )}

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {admins?.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.username}</TableCell>
                      <TableCell>{admin.role}</TableCell>
                      <TableCell>
                        {admin.last_login ? new Date(admin.last_login).toLocaleString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        {userRole === 'super_admin' && (
                          <Tooltip title="Delete Admin">
                            <IconButton
                              onClick={() => handleDeleteClick(admin)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalAdmins}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>

      {/* Create Admin Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={newAdmin.role}
              onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
            >
              <MenuItem value="viewer">Viewer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="super_admin">Super Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} color="primary" variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Admin Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete admin {adminToDelete?.username}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteAdmin} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
