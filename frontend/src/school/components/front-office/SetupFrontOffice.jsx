import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Paper, Typography, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Stack, Tabs, Tab,
  InputAdornment, Pagination, CircularProgress, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled } from "@mui/material/styles";

// ─── Purple-White Theme Tokens ────────────────────────────────────────────────
const PURPLE = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  primaryDark: "#6D28D9",
  primaryDeep: "#5B21B6",
  bg: "#F5F3FF",
  bgLight: "#FAFAFF",
  border: "#DDD6FE",
  text: "#3B0764",
  textMid: "#4C1D95",
};
import {
  Search, Edit, Delete, Clear, Settings,
  FolderOpen, Category, Source as SourceIcon, Link as LinkIcon,
} from "@mui/icons-material";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import {
  fetchSetupData,
  createSetupItem,
  updateSetupItem,
  deleteSetupItem,
  setActiveTab,
  setFilters,
  clearMessages,
  selectActiveTab,
  selectSetupData,
  selectSetupLoading,
  selectSetupSubmitLoading,
  selectSetupError,
  selectSetupSuccessMsg,
} from "../../../state/setupFrontOfficeSlice";

// ─── Styled ───────────────────────────────────────────────────────────────────
const GlassCard = styled(Paper)(() => ({
  background: "#fff",
  border: `1px solid ${alpha('#7C3AED', 0.22)}`,
  borderRadius: 14,
  transition: "box-shadow .2s, transform .2s",
}));

// ─── Constants ────────────────────────────────────────────────────────────────
const TABS = [
  { value: "purpose", label: "Purpose", icon: <FolderOpen sx={{ fontSize: 18 }} /> },
  { value: "complaintType", label: "Complaint Type", icon: <Category sx={{ fontSize: 18 }} /> },
  { value: "source", label: "Source", icon: <SourceIcon sx={{ fontSize: 18 }} /> },
  { value: "reference", label: "Reference", icon: <LinkIcon sx={{ fontSize: 18 }} /> },
];

const EMPTY_FORM = { name: "", description: "" };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SetupFrontOffice() {
  useDocumentTitle("Setup Front Office");

  const dispatch = useDispatch();

  // Redux state
  const activeTab = useSelector(selectActiveTab);
  const setupData = useSelector(selectSetupData(activeTab));
  const loading = useSelector(selectSetupLoading);
  const submitLoading = useSelector(selectSetupSubmitLoading);
  const error = useSelector(selectSetupError);
  const successMsg = useSelector(selectSetupSuccessMsg);

  // Local state for form and UI
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const data = setupData?.data || [];
  const pagination = setupData?.pagination || { total: 0, page: 1, limit: 10, pages: 1 };
  const filters = setupData?.filters || { search: "", page: 1, limit: 10 };

  // ── Fetch Data on Mount and Filter Changes ────────────────────────────────
  useEffect(() => {
    dispatch(fetchSetupData({ type: activeTab, params: filters }));
  }, [dispatch, activeTab, filters]);

  // ── Reset Form on Tab Change ──────────────────────────────────────────────
  useEffect(() => {
    setForm(EMPTY_FORM);
    setEditId(null);
  }, [activeTab]);

  // ── Handle Tab Change ─────────────────────────────────────────────────────
  const handleTabChange = (_, newTab) => {
    dispatch(setActiveTab(newTab));
  };

  // ── Handle Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editId) {
      await dispatch(updateSetupItem({ type: activeTab, id: editId, data: form }));
    } else {
      await dispatch(createSetupItem({ type: activeTab, data: form }));
    }

    // Refresh data after create/update
    dispatch(fetchSetupData({ type: activeTab, params: filters }));
    setForm(EMPTY_FORM);
    setEditId(null);
  };

  // ── Handle Edit ────────────────────────────────────────────────────────────
  const handleEdit = (item) => {
    setEditId(item._id);
    setForm({ name: item.name || "", description: item.description || "" });
  };

  // ── Handle Delete ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteSetupItem({ type: activeTab, id: deleteTarget }));
    setDeleteTarget(null);
    // Refresh data after delete
    dispatch(fetchSetupData({ type: activeTab, params: filters }));
  };

  // ── Handle Search ──────────────────────────────────────────────────────────
  const handleSearch = (value) => {
    dispatch(setFilters({ type: activeTab, filters: { search: value, page: 1 } }));
  };

  // ── Handle Page Change ─────────────────────────────────────────────────────
  const handlePageChange = (_, page) => {
    dispatch(setFilters({ type: activeTab, filters: { page } }));
  };

  // ── Get Display Names ──────────────────────────────────────────────────────
  const getDisplayName = () => {
    const names = {
      purpose: "Purpose",
      complaintType: "Complaint Type",
      source: "Source",
      reference: "Reference",
    };
    return names[activeTab] || "Item";
  };

  // ── Handle Snackbar Close ──────────────────────────────────────────────────
  const handleSnackbarClose = () => {
    dispatch(clearMessages());
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: "100vh", bgcolor: "#FAFAFF" }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={2} mb={3}>
        <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha("#7C3AED", 0.1), border: `1px solid ${alpha("#7C3AED", 0.2)}` }}>
          <Settings sx={{ fontSize: 28, color: "#7C3AED" }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1e293b", letterSpacing: -0.5 }}>
            Setup Front Office
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage purposes, complaint types, sources, and references
          </Typography>
        </Box>
      </Stack>

      <Grid2 container spacing={{ xs: 2, sm: 3 }}>
        {/* Left Sidebar - Tabs */}
        <Grid2 size={{ xs: 12, md: 2.5 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #EDE9FE", overflow: "hidden" }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  alignItems: "flex-start",
                  textAlign: "left",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  py: 1.5,
                  px: 2,
                  minHeight: 48,
                  color: "#64748b",
                  "&.Mui-selected": {
                    color: "#7C3AED",
                    bgcolor: alpha("#7C3AED", 0.08),
                    borderLeft: "3px solid #7C3AED",
                  },
                },
                "& .MuiTabs-indicator": { display: "none" },
              }}
            >
              {TABS.map((tab) => (
                <Tab
                  key={tab.value}
                  value={tab.value}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {tab.icon}
                      <span>{tab.label}</span>
                    </Stack>
                  }
                />
              ))}
            </Tabs>
          </Paper>
        </Grid2>

        {/* Middle - Add Form */}
        <Grid2 size={{ xs: 12, md: 4 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #EDE9FE" }}>
            <Typography variant="h6" fontWeight={800} mb={2.5} sx={{ color: "#1e293b" }}>
              {editId ? `Edit ${getDisplayName()}` : `Add ${getDisplayName()}`}
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  label={`${getDisplayName()} *`}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { borderColor: "#7C3AED", borderWidth: 2 },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused fieldset": { borderColor: "#7C3AED", borderWidth: 2 },
                    },
                  }}
                />
                <Stack direction="row" spacing={1.5}>
                  {editId && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setForm(EMPTY_FORM);
                        setEditId(null);
                      }}
                      disabled={submitLoading}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 700,
                        borderColor: "#cbd5e1",
                        color: "#64748b",
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitLoading}
                    fullWidth={!editId}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 800,
                      background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
                      boxShadow: "0 4px 16px rgba(147,51,234,0.4)",
                      "&:hover": {
                        boxShadow: "0 6px 24px rgba(147,51,234,0.55)",
                        background: "linear-gradient(135deg,#8B2FDB,#6D28D9)",
                      },
                    }}
                  >
                    {submitLoading ? (
                      <CircularProgress size={20} sx={{ color: "#fff" }} />
                    ) : editId ? (
                      "Update"
                    ) : (
                      "Save"
                    )}
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Paper>
        </Grid2>

        {/* Right - List */}
        <Grid2 size={{ xs: 12, md: 5.5 }}>
          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid #EDE9FE", overflow: "hidden" }}>
            {/* List Header */}
            <Box sx={{ p: 2.5, borderBottom: "1px solid #e2e8f0" }}>
              <Typography variant="h6" fontWeight={800} mb={2} sx={{ color: "#1e293b" }}>
                {getDisplayName()} List
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#FAFAFF",
                    "&.Mui-focused fieldset": { borderColor: "#7C3AED" },
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 18, color: "#94a3b8" }} />
                      </InputAdornment>
                    ),
                    endAdornment: filters.search && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => handleSearch("")}>
                          <Clear sx={{ fontSize: 16 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {/* Table */}
            <TableContainer sx={{ maxHeight: 500 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", bgcolor: "#FAFAFF", color: "#64748b" }}>
                      {getDisplayName()}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", bgcolor: "#FAFAFF", color: "#64748b" }}>
                      Description
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", bgcolor: "#FAFAFF", color: "#64748b" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} sx={{ color: "#7C3AED" }} />
                      </TableCell>
                    </TableRow>
                  ) : data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <Box sx={{ textAlign: "center" }}>
                          <FolderOpen sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                          <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            No data available in table
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            ← Add new record or search with different criteria.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item._id} hover sx={{ "&:hover": { bgcolor: alpha("#7C3AED", 0.06) } }}>
                        <TableCell sx={{ fontWeight: 600, color: "#1e293b" }}>{item.name}</TableCell>
                        <TableCell sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                          {item.description || "—"}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(item)}
                                sx={{
                                  color: "#64748b",
                                  "&:hover": { color: "#7C3AED", bgcolor: alpha("#7C3AED", 0.08) },
                                }}
                              >
                                <Edit sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => setDeleteTarget(item._id)}
                                sx={{
                                  color: "#64748b",
                                  "&:hover": { color: "#dc2626", bgcolor: alpha("#dc2626", 0.08) },
                                }}
                              >
                                <Delete sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {!loading && data.length > 0 && (
              <Box sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Records: {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Pagination
                      count={pagination.pages}
                      page={pagination.page}
                      onChange={handlePageChange}
                      size="small"
                      color="warning"
                      sx={{
                        "& .MuiPaginationItem-root": {
                          borderRadius: 1.5,
                          fontWeight: 600,
                          "&.Mui-selected": {
                            bgcolor: "#7C3AED",
                            "&:hover": { bgcolor: "#7C3AED" },
                          },
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid2>
      </Grid2>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { sx: { borderRadius: 4, p: 1, maxWidth: 360 } } }}
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#dc2626", 0.1) }}>
              <Delete sx={{ color: "#dc2626", fontSize: 20 }} />
            </Box>
            Delete {getDisplayName()}
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this {getDisplayName().toLowerCase()}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            variant="outlined"
            disabled={submitLoading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={submitLoading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, minWidth: 90 }}
          >
            {submitLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={Boolean(error || successMsg)}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={error ? "error" : "success"}
          onClose={handleSnackbarClose}
          sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}
        >
          {error || successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}