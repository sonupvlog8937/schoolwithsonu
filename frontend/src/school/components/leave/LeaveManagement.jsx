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
  Tabs,
  Tab,
} from "@mui/material";
import { Add, Check, Close, Visibility } from "@mui/icons-material";
import axios from "axios";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const LeaveManagement = () => {
  useDocumentTitle("Leave Management");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openApprovalDialog, setOpenApprovalDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState({
    leave_type: "Sick Leave",
    from_date: "",
    to_date: "",
    reason: "",
  });

  const [approvalData, setApprovalData] = useState({
    status: "Approved",
    remarks: "",
  });

  useEffect(() => {
    fetchLeaves();
  }, [tabValue]);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (tabValue === 1) params.status = "Pending";
      if (tabValue === 2) params.status = "Approved";
      if (tabValue === 3) params.status = "Rejected";

      const response = await axios.get("/api/leave/all", { params });
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setSnackbar({ open: true, message: "Error fetching leaves", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      leave_type: "Sick Leave",
      from_date: "",
      to_date: "",
      reason: "",
    });
    setOpenDialog(true);
  };

  const handleOpenApprovalDialog = (leave) => {
    setSelectedLeave(leave);
    setApprovalData({
      status: "Approved",
      remarks: "",
    });
    setOpenApprovalDialog(true);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("/api/leave/apply", formData);
      setSnackbar({ open: true, message: "Leave application submitted successfully", severity: "success" });
      setOpenDialog(false);
      fetchLeaves();
    } catch (error) {
      console.error("Error applying leave:", error);
      setSnackbar({ open: true, message: "Error applying leave", severity: "error" });
    }
  };

  const handleApproval = async () => {
    try {
      await axios.put(`/api/leave/${selectedLeave._id}/status`, approvalData);
      setSnackbar({
        open: true,
        message: `Leave ${approvalData.status.toLowerCase()} successfully`,
        severity: "success",
      });
      setOpenApprovalDialog(false);
      fetchLeaves();
    } catch (error) {
      console.error("Error updating leave status:", error);
      setSnackbar({ open: true, message: "Error updating leave status", severity: "error" });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      case "Pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Leave Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
          Apply Leave
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="All Leaves" />
          <Tab label="Pending" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Leave Type</TableCell>
                <TableCell>From Date</TableCell>
                <TableCell>To Date</TableCell>
                <TableCell>Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No leave applications found
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>{leave.applicant?.name}</TableCell>
                    <TableCell>{leave.applicant_type}</TableCell>
                    <TableCell>{leave.leave_type}</TableCell>
                    <TableCell>{new Date(leave.from_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.to_date).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip label={leave.status} color={getStatusColor(leave.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {leave.status === "Pending" && (
                        <IconButton size="small" onClick={() => handleOpenApprovalDialog(leave)}>
                          <Check />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              select
              label="Leave Type"
              value={formData.leave_type}
              onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
              required
            >
              <MenuItem value="Sick Leave">Sick Leave</MenuItem>
              <MenuItem value="Casual Leave">Casual Leave</MenuItem>
              <MenuItem value="Emergency Leave">Emergency Leave</MenuItem>
              <MenuItem value="Maternity Leave">Maternity Leave</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </TextField>

            <TextField
              label="From Date"
              type="date"
              value={formData.from_date}
              onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="To Date"
              type="date"
              value={formData.to_date}
              onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              label="Reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              multiline
              rows={4}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={openApprovalDialog} onClose={() => setOpenApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve/Reject Leave</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <Typography>
                Applicant: <strong>{selectedLeave.applicant?.name}</strong>
              </Typography>
              <Typography>
                Leave Type: <strong>{selectedLeave.leave_type}</strong>
              </Typography>
              <Typography>
                Duration: <strong>{selectedLeave.days} days</strong>
              </Typography>
              <Typography>
                Reason: <strong>{selectedLeave.reason}</strong>
              </Typography>

              <TextField
                select
                label="Decision"
                value={approvalData.status}
                onChange={(e) => setApprovalData({ ...approvalData, status: e.target.value })}
                required
              >
                <MenuItem value="Approved">Approve</MenuItem>
                <MenuItem value="Rejected">Reject</MenuItem>
              </TextField>

              <TextField
                label="Remarks"
                value={approvalData.remarks}
                onChange={(e) => setApprovalData({ ...approvalData, remarks: e.target.value })}
                multiline
                rows={3}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApproval} variant="contained">
            Submit
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

export default LeaveManagement;
