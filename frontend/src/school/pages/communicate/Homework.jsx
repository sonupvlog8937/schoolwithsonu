import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
  Tab, Tabs, Alert, Snackbar, Badge
} from "@mui/material";
import {
  Add, Refresh, Close, FilterList, Search, Delete, Visibility, Edit, Assignment,
  CheckCircle, PendingActions, ErrorOutline, CalendarToday, AttachFile, Class as ClassIcon
} from "@mui/icons-material";
import {
  fetchCommunication, createCommunication, deleteCommunication, clearCommunicationNotice
} from "../../../state/communicationSlice";
import { fetchClassesForDropdown } from "../../../state/academicModuleSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

export default function Homework() {
  useDocumentTitle("Homework");
  const dispatch = useDispatch();
  const { records, loading, saving, error, success } = useSelector((state) => state.communication);
  const { dropdownData } = useSelector((state) => state.academicModule);
  const classes = dropdownData.classes || [];

  const [openDialog, setOpenDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState({ open: false, homework: null });
  const [editingId, setEditingId] = useState(null);
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    class: "",
    subject: "",
    homework_date: "",
    submission_date: "",
    attachment: "",
    status: "Active"
  });

  // Sample subjects - ideally should come from API
  const subjects = [
    { _id: "1", subject_name: "Mathematics" },
    { _id: "2", subject_name: "Science" },
    { _id: "3", subject_name: "English" },
    { _id: "4", subject_name: "Hindi" },
    { _id: "5", subject_name: "Social Studies" },
    { _id: "6", subject_name: "Computer" }
  ];

  useEffect(() => {
    dispatch(fetchCommunication("homework"));
    dispatch(fetchClassesForDropdown());
  }, [dispatch]);

  useEffect(() => () => dispatch(clearCommunicationNotice()), [dispatch]);

  const handleOpenDialog = () => {
    setFormData({
      title: "",
      description: "",
      class: "",
      subject: "",
      homework_date: new Date().toISOString().split('T')[0],
      submission_date: "",
      attachment: "",
      status: "Active"
    });
    setEditingId(null);
    setOpenDialog(true);
  };

  const handleEdit = (homework) => {
    setFormData({
      title: homework.title || "",
      description: homework.description || "",
      class: homework.class?._id || "",
      subject: homework.subject?._id || "",
      homework_date: homework.homework_date ? new Date(homework.homework_date).toISOString().split('T')[0] : "",
      submission_date: homework.submission_date ? new Date(homework.submission_date).toISOString().split('T')[0] : "",
      attachment: homework.attachment || "",
      status: homework.status || "Active"
    });
    setEditingId(homework._id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.class || !formData.subject) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.submission_date && formData.homework_date) {
      if (new Date(formData.submission_date) < new Date(formData.homework_date)) {
        alert("Submission date cannot be before homework date");
        return;
      }
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      classId: formData.class,
      subjectId: formData.subject,
      homework_date: formData.homework_date,
      submission_date: formData.submission_date,
      attachment: formData.attachment,
      status: formData.status
    };

    if (editingId) {
      // Update logic - would need updateCommunication action
      console.log("Update homework:", editingId, payload);
    } else {
      dispatch(createCommunication({ resource: "homework", data: payload })).then((result) => {
        if (result.type.includes("fulfilled")) {
          handleCloseDialog();
          dispatch(fetchCommunication("homework"));
        }
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this homework?")) {
      dispatch(deleteCommunication({ resource: "homework", id })).then(() => {
        dispatch(fetchCommunication("homework"));
      });
    }
  };

  const handleView = (homework) => {
    setViewDialog({ open: true, homework });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "success";
      case "completed": return "info";
      case "expired": return "error";
      default: return "default";
    }
  };

  const isExpired = (submissionDate) => {
    return new Date(submissionDate) < new Date();
  };

  const getDaysRemaining = (submissionDate) => {
    const today = new Date();
    const submission = new Date(submissionDate);
    const diffTime = submission - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredRecords = records.filter((record) => {
    if (filterClass && record.class?._id !== filterClass) return false;
    if (filterStatus !== "all" && record.status?.toLowerCase() !== filterStatus) return false;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        record.title?.toLowerCase().includes(searchLower) ||
        record.description?.toLowerCase().includes(searchLower) ||
        record.subject?.subject_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: records.length,
    active: records.filter((r) => r.status?.toLowerCase() === "active").length,
    completed: records.filter((r) => r.status?.toLowerCase() === "completed").length,
    expired: records.filter((r) => r.status?.toLowerCase() === "expired" || isExpired(r.submission_date)).length
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f1f3f6", p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={2}>
            <Box>
              <Typography sx={{ color: "#fb542d", fontWeight: 700, fontSize: 20, mb: 0.5 }}>
                HOMEWORK MANAGEMENT
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage homework assignments
              </Typography>
            </Box>
            <Stack direction="row" gap={1}>
              <Button
                startIcon={<Refresh />}
                onClick={() => dispatch(fetchCommunication("homework"))}
                sx={{ textTransform: "none" }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleOpenDialog}
                sx={{
                  bgcolor: "#fb542d",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#e94724" }
                }}
              >
                Add Homework
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Homework", value: stats.total, color: "#3b82f6", icon: <Assignment /> },
          { label: "Active", value: stats.active, color: "#10b981", icon: <CheckCircle /> },
          { label: "Completed", value: stats.completed, color: "#8b5cf6", icon: <CheckCircle /> },
          { label: "Expired", value: stats.expired, color: "#ef4444", icon: <ErrorOutline /> }
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search homework..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Class</InputLabel>
                <Select
                  value={filterClass}
                  label="Filter by Class"
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <MenuItem value="">All Classes</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      {cls.class_text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="body2" color="text.secondary">
                {filteredRecords.length} of {records.length}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Homework Table */}
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
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>CLASS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>SUBJECT</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>TITLE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>DESCRIPTION</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>HOMEWORK DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>SUBMISSION DATE</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>STATUS</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>ACTIONS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((homework) => {
                      const daysRemaining = getDaysRemaining(homework.submission_date);
                      return (
                        <TableRow key={homework._id} hover>
                          <TableCell sx={{ fontSize: 12 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <ClassIcon fontSize="small" sx={{ color: "#6b7280" }} />
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {homework.class?.class_text || "-"}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            <Chip
                              label={homework.subject?.subject_name || "N/A"}
                              size="small"
                              sx={{ fontSize: 10, bgcolor: "#eff6ff", color: "#3b82f6" }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, maxWidth: 200 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {homework.title}
                            </Typography>
                            {homework.attachment && (
                              <Chip
                                icon={<AttachFile fontSize="small" />}
                                label="Has attachment"
                                size="small"
                                sx={{ fontSize: 9, height: 20, mt: 0.5 }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ fontSize: 12, maxWidth: 250 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap"
                              }}
                            >
                              {homework.description}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <CalendarToday fontSize="small" sx={{ color: "#6b7280" }} />
                              {homework.homework_date
                                ? new Date(homework.homework_date).toLocaleDateString()
                                : "-"}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            <Box>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <CalendarToday fontSize="small" sx={{ color: "#6b7280" }} />
                                {homework.submission_date
                                  ? new Date(homework.submission_date).toLocaleDateString()
                                  : "-"}
                              </Box>
                              {daysRemaining > 0 && daysRemaining <= 3 && (
                                <Chip
                                  label={`${daysRemaining} days left`}
                                  size="small"
                                  color="warning"
                                  sx={{ fontSize: 9, height: 18, mt: 0.5 }}
                                />
                              )}
                              {daysRemaining < 0 && (
                                <Chip
                                  label="Expired"
                                  size="small"
                                  color="error"
                                  sx={{ fontSize: 9, height: 18, mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            <Chip
                              label={homework.status || "Active"}
                              size="small"
                              color={getStatusColor(homework.status)}
                              sx={{ fontSize: 10 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: 12 }}>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                onClick={() => handleView(homework)}
                                sx={{ color: "#3b82f6" }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(homework)}
                                sx={{ color: "#10b981" }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(homework._id)}
                                sx={{ color: "#ef4444" }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8, color: "text.secondary" }}>
                        <Assignment sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
                        <Typography>No homework found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: "#fb542d", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">{editingId ? "Edit" : "Add"} Homework</Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            {/* Class */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.class}
                  label="Class"
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls._id} value={cls._id}>
                      {cls.class_text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Subject */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Subject</InputLabel>
                <Select
                  value={formData.subject}
                  label="Subject"
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  {subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Homework Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                required
              />
            </Grid>

            {/* Homework Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Homework Date"
                value={formData.homework_date}
                onChange={(e) => setFormData({ ...formData, homework_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Submission Date */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Submission Date"
                value={formData.submission_date}
                onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            {/* Attachment URL */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                size="small"
                label="Attachment URL (Optional)"
                value={formData.attachment}
                onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
                placeholder="https://example.com/file.pdf"
              />
            </Grid>

            {/* Status */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
              </FormControl>
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
            disabled={saving}
            sx={{
              bgcolor: "#fb542d",
              textTransform: "none",
              "&:hover": { bgcolor: "#e94724" }
            }}
          >
            {saving ? "Saving..." : editingId ? "Update" : "Create"} Homework
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialog.open}
        onClose={() => setViewDialog({ open: false, homework: null })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ bgcolor: "#f8f9fa" }}>
          Homework Details
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewDialog.homework && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Class</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {viewDialog.homework.class?.class_text || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Subject</Typography>
                <Chip
                  label={viewDialog.homework.subject?.subject_name || "N/A"}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Title</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {viewDialog.homework.title}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Description</Typography>
                <Typography variant="body1">
                  {viewDialog.homework.description}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Homework Date</Typography>
                <Typography variant="body1">
                  {viewDialog.homework.homework_date
                    ? new Date(viewDialog.homework.homework_date).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Submission Date</Typography>
                <Typography variant="body1">
                  {viewDialog.homework.submission_date
                    ? new Date(viewDialog.homework.submission_date).toLocaleDateString()
                    : "N/A"}
                </Typography>
              </Grid>
              {viewDialog.homework.attachment && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Attachment</Typography>
                  <Button
                    size="small"
                    startIcon={<AttachFile />}
                    href={viewDialog.homework.attachment}
                    target="_blank"
                    sx={{ textTransform: "none", mt: 0.5 }}
                  >
                    View Attachment
                  </Button>
                </Grid>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Chip
                  label={viewDialog.homework.status || "Active"}
                  color={getStatusColor(viewDialog.homework.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              {viewDialog.homework.teacher && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Teacher</Typography>
                  <Typography variant="body1">
                    {viewDialog.homework.teacher.name || "N/A"}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, homework: null })} sx={{ textTransform: "none" }}>
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