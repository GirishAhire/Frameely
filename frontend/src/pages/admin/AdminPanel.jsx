import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Typography,
  Button,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const AdminPanel = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data - replace with actual API call
  const frames = [
    { id: 1, name: 'Classic Black', size: '8x10', price: 29.99, stock: 50 },
    { id: 2, name: 'Modern White', size: '11x14', price: 39.99, stock: 30 },
    { id: 3, name: 'Vintage Gold', size: '16x20', price: 49.99, stock: 20 },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditFrame = (frameId) => {
    // Implement edit frame functionality
    console.log('Edit frame:', frameId);
  };

  const handleDeleteFrame = (frameId) => {
    // Implement delete frame functionality
    console.log('Delete frame:', frameId);
  };

  const handleAddFrame = () => {
    // Implement add frame functionality
    console.log('Add new frame');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Frame Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddFrame}
        >
          Add New Frame
        </Button>
      </Box>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {frames
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((frame) => (
                  <TableRow key={frame.id}>
                    <TableCell>{frame.name}</TableCell>
                    <TableCell>{frame.size}</TableCell>
                    <TableCell>${frame.price}</TableCell>
                    <TableCell>{frame.stock}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit Frame">
                        <IconButton onClick={() => handleEditFrame(frame.id)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Frame">
                        <IconButton onClick={() => handleDeleteFrame(frame.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={frames.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AdminPanel; 