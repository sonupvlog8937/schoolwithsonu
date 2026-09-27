import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";
import { Add, Edit, Delete, DirectionsBus } from "@mui/icons-material";
import axios from "axios";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const TransportRoutes = () => {
  useDocumentTitle("Transport Routes");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [formData, setFormData] = useState({
    route_name: "",
    route_number: "",
    start_point: "",
    end_point: "",
    stops: "",
    fare: 0,
    distance: 0,
    status: "Active",
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/transport/route/all");
      setRoutes(response.data.data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      setSnackbar({ open: true, message: "Error fetching routes", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (route = null) => {
    if (route) {
      setSelectedRoute(route);
      setFormData({
        route_name: route.route_name || "",
        route_number: route.route_number || "",
        start_point: route.start_point || "",
        end_point: route.end_point || "",
        stops: route.stops?.join(", ") || "",
        fare: route.fare || 0,
        distance: route.distance || 0,
        status: route.status || "Active",
      });
    } else {
      setSelectedRoute(null);
      setFormData({
        route_name: "",
        route_number: "",
        start_point: "",
        end_point: "",
        stops: "",
        fare: 0,
        distance: 0,
        status: "Active",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRoute(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        stops: formData.stops.split(",").map((s) => s.trim()).filter((s) => s),
      };

      if (selectedRoute) {
        await axios.put(`/api/transport/route/${selectedRoute._id}`, payload);
        setSnackbar({ open: true, message: "Route updated successfully", severity: "success" });
      } else {
        await axios.post("/api/transport/route/create", payload);
        setSnackbar({ open: true, message: "Route created successfully", severity: "success" });
      }
      handleCloseDialog();
      fetchRoutes();
    } catch (error) {
      console.error("Error saving route:", error);
      setSnackbar({ open: true, message: "Error saving route", severity: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        await axios.delete(`/api/transport/route/${id}`);
        setSnackbar({ open: true, message: "Route deleted successfully", severity: "success" });
        fetchRoutes();
      } catch (error) {
        console.error("Error deleting route:", error);
        setSnackbar({ open: true, message: "Error deleting route", severity: "error" });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Transport Routes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Route
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Route Number</TableCell>
                <TableCell>Route Name</TableCell>
                <TableCell>Start Point</TableCell>
                <TableCell>End Point</TableCell>
                <TableCell>Fare</TableCell>
                <TableCell>Distance (km)</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No routes found
                  </TableCell>
                </TableRow>
              ) : (
                routes.map((route) => (
                  <TableRow key={route._id}>
                    <TableCell>{route.route_number}</TableCell>
                    <TableCell>{route.route_name}</TableCell>
                    <TableCell>{route.start_point}</TableCell>
                    <TableCell>{route.end_point}</TableCell>
                    <TableCell>₹{route.fare}</TableCell>
                    <TableCell>{route.distance}</TableCell>
                    <TableCell>
                      <Chip
                        label={route.status}
                        color={route.status === "Active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(route)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(route._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedRoute ? "Edit Route" : "Add Route"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Route Name"
                value={formData.route_name}
                onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Route Number"
                value={formData.route_number}
                onChange={(e) => setFormData({ ...formData, route_number: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Point"
                value={formData.start_point}
                onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Point"
                value={formData.end_point}
                onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Stops (comma separated)"
                value={formData.stops}
                onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                placeholder="Stop 1, Stop 2, Stop 3"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fare"
                type="number"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Distance (km)"
                type="number"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedRoute ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomizedSnackbars
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default TransportRoutes;
