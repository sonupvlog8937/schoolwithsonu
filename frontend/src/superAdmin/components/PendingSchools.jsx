import { useEffect, useState } from "react";
import {
  Box, Card, CardContent, Typography, Stack, Avatar, Button,
  Chip, CircularProgress, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Paper, IconButton, Tooltip, Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { baseUrl } from "../../environment";
import CustomizedSnackbars from "../../basic utility components/CustomizedSnackbars";

export default function PendingSchools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState({ open: false, school: null });
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, type: "success", message: "" });

  const fetchPendingSchools = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${baseUrl}/super-admin/schools/pending`, {
        headers: { Authorization: token },
      });
      setSchools(response.data.data || []);
    } catch (error) {
      console.error("Error fetching pending schools:", error);
      setSnackbar({
        open: true,
        type: "error",
        message: error.response?.data?.message || "Failed to fetch pending schools",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSchools();
  }, []);

  const handleApprove = async (schoolId, schoolName) => {
    if (!window.confirm(`Are you sure you want to approve "${schoolName}"?`)) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${baseUrl}/super-admin/schools/${schoolId}/approve`,
        {},
        { headers: { Authorization: token } }
      );

      setSnackbar({
        open: true,
        type: "success",
        message: response.data.message || "School approved successfully!",
      });

      // Refresh list
      fetchPendingSchools();
    } catch (error) {
      console.error("Error approving school:", error);
      setSnackbar({
        open: true,
        type: "error",
        message: error.response?.data?.message || "Failed to approve school",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectClick = (school) => {
    setRejectDialog({ open: true, school });
    setRejectReason("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setSnackbar({
        open: true,
        type: "error",
        message: "Rejection reason is required",
      });
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${baseUrl}/super-admin/schools/${rejectDialog.school._id}/reject`,
        { reason: rejectReason.trim() },
        { headers: { Authorization: token } }
      );

      setSnackbar({
        open: true,
        type: "success",
        message: response.data.message || "School registration rejected",
      });

      setRejectDialog({ open: false, school: null });
      setRejectReason("");

      // Refresh list
      fetchPendingSchools();
    } catch (error) {
      console.error("Error rejecting school:", error);
      setSnackbar({
        open: true,
        type: "error",
        message: error.response?.data?.message || "Failed to reject school",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetSnackbar = () => setSnackbar({ open: false, type: "success", message: "" });

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {snackbar.open && (
        <CustomizedSnackbars
          type={snackbar.type}
          message={snackbar.message}
          reset={resetSnackbar}
        />
      )}

      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#f59e0b", 0.1) }}>
          <PendingIcon sx={{ fontSize: 28, color: "#f59e0b" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1a1a2e", letterSpacing: -0.5 }}>
            Pending School Approvals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and approve new school registrations
          </Typography>
        </Box>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : schools.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            p: 6,
            textAlign: "center",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h6" fontWeight={700} mb={1}>
            All Caught Up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no pending school registrations at the moment.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {schools.map((school) => (
            <Card
              key={school._id}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                  {/* School Image */}
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                    <Avatar
                      src={school.school_image}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: alpha("#1a3c6e", 0.1),
                        color: "#1a3c6e",
                        fontSize: 32,
                        fontWeight: 800,
                        border: "3px solid",
                        borderColor: "divider",
                      }}
                    >
                      {school.school_name?.[0]?.toUpperCase()}
                    </Avatar>
                  </Box>

                  {/* School Details */}
                  <Box sx={{ flex: 1 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <SchoolIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                          <Typography variant="h6" fontWeight={800}>
                            {school.school_name}
                          </Typography>
                          <Chip
                            label="Pending"
                            size="small"
                            icon={<PendingIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              bgcolor: alpha("#f59e0b", 0.1),
                              color: "#f59e0b",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                            }}
                          />
                        </Stack>
                      </Box>

                      <Stack spacing={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <PersonIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            Owner:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {school.owner_name}
                          </Typography>
                        </Stack>

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <EmailIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                          <Typography variant="body2" color="text.secondary">
                            Email:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {school.email}
                          </Typography>
                        </Stack>

                        {school.address && (
                          <Stack direction="row" alignItems="flex-start" spacing={1}>
                            <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary", mt: 0.2 }} />
                            <Typography variant="body2" color="text.secondary">
                              Address:
                            </Typography>
                            <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                              {school.address}
                            </Typography>
                          </Stack>
                        )}

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            Registered on:{" "}
                            {new Date(school.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Box>

                  {/* Action Buttons */}
                  <Stack
                    direction={{ xs: "row", md: "column" }}
                    spacing={1}
                    sx={{ minWidth: { md: 140 } }}
                  >
                    <Tooltip title="Approve this school registration">
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<CheckCircleIcon />}
                        disabled={submitting}
                        onClick={() => handleApprove(school._id, school.school_name)}
                        sx={{
                          bgcolor: "#10b981",
                          fontWeight: 700,
                          py: 1.2,
                          "&:hover": { bgcolor: "#059669" },
                        }}
                      >
                        Approve
                      </Button>
                    </Tooltip>

                    <Tooltip title="Reject this school registration">
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<CancelIcon />}
                        disabled={submitting}
                        onClick={() => handleRejectClick(school)}
                        sx={{
                          borderColor: "#ef4444",
                          color: "#ef4444",
                          fontWeight: 700,
                          py: 1.2,
                          "&:hover": {
                            borderColor: "#dc2626",
                            bgcolor: alpha("#ef4444", 0.05),
                          },
                        }}
                      >
                        Reject
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog.open}
        onClose={() => !submitting && setRejectDialog({ open: false, school: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          Reject School Registration
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please provide a clear reason for rejection. This will be shown to the school owner.
          </Alert>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Rejection Reason"
            placeholder="e.g., Incomplete documentation, Invalid information, etc."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={submitting}
            helperText={`Rejecting: ${rejectDialog.school?.school_name || ""}`}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setRejectDialog({ open: false, school: null })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRejectSubmit}
            disabled={submitting || !rejectReason.trim()}
            sx={{ bgcolor: "#ef4444", "&:hover": { bgcolor: "#dc2626" } }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
