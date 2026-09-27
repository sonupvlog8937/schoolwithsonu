import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
  Tab, Tabs, Checkbox, FormControlLabel, Alert, Snackbar
} from "@mui/material";
import {
  Send, Refresh, Close, FilterList, Search, Delete, Visibility, CheckCircle,
  PendingActions, ErrorOutline, Message, Group, Person
} from "@mui/icons-material";
import {
  fetchCommunication, sendCommunication, deleteCommunication, clearCommunicationNotice
} from "../../../state/communicationSlice";
import { fetchClassesForDropdown, fetchSectionsForDropdown } from "../../../state/academicModuleSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function GroupMessage() {
  useDocumentTitle("Group Message");
  const dispatch = useDispatch();
  const { records, loading, saving, error, success } = useSelector((state) => state.communication);
  const { dropdownData } = useSelector((state) => state.academicModule);
  const classes = dropdownData.classes || [];
  const sections = dropdownData.sections || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewDialog, setViewDialog] = useState({ open: false, message: null });

  const [formData, setFormData] = useState({
    messageType: "group", // group, class, section, individual
    title: "",
    message: "",
    channel: "both", // sms, email, both
    recipients: {
      classes: [],
      sections: [],
      roles: [], // parent, teacher, staff
      individuals: ""
    },
    priority: "normal", // low, normal, high, urgent
    scheduleType: "now", // now, scheduled
    scheduledDate: "",
    scheduledTime: "",
    includeAbsentees: true
  });

  useEffect(() => {
    dispatch(fetchCommunication("group-message"));
    dispatch(fetchClassesForDropdown());
    dispatch(fetchSectionsForDropdown());
  }, [dispatch]);

  useEffect(() => () => dispatch(clearCommunicationNotice()), [dispatch]);

  const handleOpenDialog = () => {
    setFormData({
      messageType: "group",
      title: "",
      message: "",
      channel: "both",
      recipients: { classes: [], sections: [], roles: [], individuals: "" },
      priority: "normal",
      scheduleType: "now",
      scheduledDate: "",
      scheduledTime: "",
      includeAbsentees: true
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = () => {
    if (!formData.message.trim()) {
      alert("Please enter a message");
      return;
    }

    const payload = {
      channel: formData.channel,
      messageType: formData.messageType,
      title: formData.title,
      message: formData.message,
      recipients: formData.recipients,
      priority: formData.priority,
      scheduleType: formData.scheduleType,
      scheduledDate: formData.scheduleType === "scheduled" ? formData.scheduledDate : null,
      scheduledTime: formData.scheduleType === "scheduled" ? formData.scheduledTime : null,
      includeAbsentees: formData.includeAbsentees
    };

    dispatch(sendCommunication(payload)).then((result) => {
      if (result.type.includes("fulfilled")) {
        handleCloseDialog();
        dispatch(fetchCommunication("group-message"));
      }
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      dispatch(deleteCommunication({ resource: "group-message", id })).then(() => {
        dispatch(fetchCommunication("group-message"));
      });
    }
  };

  const handleViewMessage = (message) => {
    setViewDialog({ open: true, message });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sent": return "success";
      case "pending": return "warning";
      case "failed": return "error";
      case "scheduled": return "info";
      default: return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "sent": return <CheckCircle fontSize="small" />;
      case "pending": return <PendingActions fontSize="small" />;
      case "failed": return <ErrorOutline fontSize="small" />;
      default: return <Message fontSize="small" />;
    }
  };

  const filteredRecords = records.filter((record) => {
    if (filterStatus !== "all" && record.status?.toLowerCase() !== filterStatus) return false;
    if (searchQuery && !record.message?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: records.length,
    sent: records.filter((r) => r.status?.toLowerCase() === "sent").length,
    pending: records.filter((r) => r.status?.toLowerCase() === "pending").length,
    failed: records.filter((r) => r.status?.toLowerCase() === "failed").length
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f3f6", p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
            <Box>
              <Typography sx={{ color: "#fb542d", fontWeight: 700, fontSize: 20, mb: 0.5 }}>
                GROUP MESSAGE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send messages to groups, classes, or individuals
              </Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Button
                startIcon={<Refresh />}
                onClick={() => dispatch(fetchCommunication("group-message"))}
                sx={{ textTransform: "none" }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Send />}
                onClick={handleOpenDialog}
                sx={{
                  bgcolor: "#fb542d",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#e94724" }
                }}
              >
                Compose Message
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Messages", value: stats.total, color: "#3b82f6", icon: <Message /> },
          { label: "Sent", value: stats.sent, color: "#10b981", icon: <CheckCircle /> },
          { label: "Pending", value: stats.pending, color: "#f59e0b", icon: <PendingActions /> },
          { label: "Failed", value: stats.failed, color: "#ef4444", icon: <ErrorOutline /> }
        ].map((stat, index) => (
          <Grid item xs={6} md={3} key={index}>
            <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: stat.color, mt: 0.5 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color, opacity: 0.3 }}>
                    {stat.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredRecords.length} of {records.length} messages
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#fb542d" }} />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>TITLE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>MESSAGE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>CHANNEL</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>RECIPIENTS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record._id} hover>
                        <TableCell sx={{ fontSize: 12 }}>
                          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, maxWidth: 150 }}>
                          {record.title || "-"}
                        </TableCell>
                        <TableCell sx={{ fontSize: 12, maxWidth: 250 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 250
                            }}
                          >
                            {record.message || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          <Chip
                            label={record.channel?.toUpperCase() || "SMS"}
                            size="small"
                            sx={{ fontSize: 10 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          {record.recipientCount || 0} recipients
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          <Chip
                            icon={getStatusIcon(record.status)}
                            label={record.status || "Sent"}
                            size="small"
                            color={getStatusColor(record.status)}
                            sx={{ fontSize: 10 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12 }}>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewMessage(record)}
                              sx={{ color: "#3b82f6" }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(record._id)}
                              sx={{ color: "#ef4444" }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8, color: "text.secondary" }}>
                        <Message sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                        <Typography>No messages found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: "#fb542d", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Compose Group Message</Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            {/* Message Type */}
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Message Type</InputLabel>
                <Select
                  value={formData.messageType}
                  label="Message Type"
                  onChange={(e) => setFormData({ ...formData, messageType: e.target.value })}
                >
                  <MenuItem value="group">Group (All Users)</MenuItem>
                  <MenuItem value="class">By Class</MenuItem>
                  <MenuItem value="section">By Section</MenuItem>
                  <MenuItem value="role">By Role</MenuItem>
                  <MenuItem value="individual">Individual Numbers</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Recipients based on type */}
            {formData.messageType === "class" && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Classes</InputLabel>
                  <Select
                    multiple
                    value={formData.recipients.classes}
                    label="Select Classes"
                    onChange={(e) => setFormData({
                      ...formData,
                      recipients: { ...formData.recipients, classes: e.target.value }
                    })}
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.class_text}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.messageType === "section" && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Sections</InputLabel>
                  <Select
                    multiple
                    value={formData.recipients.sections}
                    label="Select Sections"
                    onChange={(e) => setFormData({
                      ...formData,
                      recipients: { ...formData.recipients, sections: e.target.value }
                    })}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section._id} value={section._id}>
                        {section.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.messageType === "role" && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Roles</InputLabel>
                  <Select
                    multiple
                    value={formData.recipients.roles}
                    label="Select Roles"
                    onChange={(e) => setFormData({
                      ...formData,
                      recipients: { ...formData.recipients, roles: e.target.value }
                    })}
                  >
                    <MenuItem value="parent">Parents</MenuItem>
                    <MenuItem value="teacher">Teachers</MenuItem>
                    <MenuItem value="staff">Staff</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.messageType === "individual" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Phone Numbers"
                  placeholder="Enter comma-separated phone numbers"
                  value={formData.recipients.individuals}
                  onChange={(e) => setFormData({
                    ...formData,
                    recipients: { ...formData.recipients, individuals: e.target.value }
                  })}
                  multiline
                  rows={3}
                />
              </Grid>
            )}

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Message Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>

            {/* Message */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Message *"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                multiline
                rows={5}
                required
              />
            </Grid>

            {/* Channel */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Channel</InputLabel>
                <Select
                  value={formData.channel}
                  label="Channel"
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                >
                  <MenuItem value="sms">SMS Only</MenuItem>
                  <MenuItem value="email">Email Only</MenuItem>
                  <MenuItem value="both">Both SMS & Email</MenuItem>
                  <MenuItem value="app">App Notification</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Schedule Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Send</InputLabel>
                <Select
                  value={formData.scheduleType}
                  label="Send"
                  onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                >
                  <MenuItem value="now">Send Now</MenuItem>
                  <MenuItem value="scheduled">Schedule for Later</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.scheduleType === "scheduled" && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Schedule Date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    type="time"
                    label="Schedule Time"
                    value={formData.scheduledTime}
                    onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}

            {/* Additional Options */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeAbsentees}
                    onChange={(e) => setFormData({ ...formData, includeAbsentees: e.target.checked })}
                  />
                }
                label="Include absent students"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, bgcolor: "#f8f9fa" }}>
          <Button onClick={handleCloseDialog} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving || !formData.message.trim()}
            sx={{
              bgcolor: "#fb542d",
              textTransform: "none",
              "&:hover": { bgcolor: "#e94724" }
            }}
          >
            {saving ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Message Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, message: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: "#f8f9fa" }}>
          Message Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewDialog.message && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Title</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {viewDialog.message.title || "No Title"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Message</Typography>
                <Typography variant="body1">
                  {viewDialog.message.message}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Channel</Typography>
                <Chip label={viewDialog.message.channel?.toUpperCase() || "SMS"} size="small" sx={{ mt: 0.5 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={viewDialog.message.status || "Sent"}
                  color={getStatusColor(viewDialog.message.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Date</Typography>
                <Typography variant="body1">
                  {viewDialog.message.createdAt
                    ? new Date(viewDialog.message.createdAt).toLocaleString()
                    : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, message: null })} sx={{ textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={Boolean(error || success)}
        autoHideDuration={4000}
        onClose={() => dispatch(clearCommunicationNotice())}
      >
        <Alert severity={error ? "error" : "success"} onClose={() => dispatch(clearCommunicationNotice())}>
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
}