import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { apiFetch } from '../../utils/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const data = await apiFetch(`/auth/admin/users?page=${page + 1}&size=${rowsPerPage}`);
      setUsers(data.users);
      setTotalUsers(data.total);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangePage = (event, newPage) => {
    clearMessages();
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    clearMessages();
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteClick = (user) => {
    const token = localStorage.getItem('adminToken');
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    
    if (tokenPayload.role === 'viewer') {
      setError('Viewers are not allowed to delete users');
      return;
    }
    
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete?.id) {
      setError('No user selected for deletion');
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      await apiFetch(`/auth/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      setSuccessMessage(`User ${userToDelete.username} has been successfully deleted`);
      fetchUsers();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ width: '100%', mb: 2, mt: 2 }}>
        <TableContainer>
          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ m: 2 }}>
              {successMessage}
            </Alert>
          )}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Field</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.field}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const token = localStorage.getItem('adminToken');
                      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                      return tokenPayload.role !== 'viewer' ? (
                        <Tooltip title="Delete User">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(user)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      ) : null;
                    })()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete user "{userToDelete?.username}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserList;
