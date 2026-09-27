import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Paper, Typography, Stack, Avatar, Chip, TextField, InputAdornment,
  IconButton, CircularProgress, LinearProgress, Pagination, PaginationItem,
  Select, MenuItem, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, Button, Snackbar, Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import { baseUrl } from "../../environment";

export default function SchoolsList() {
  const navigate = useNavigate();
  const [schools, setSchools]     = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage]           = useState(1);
  const [limit, setLimit]         = useState(15);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]   = useState(false);
  const [snack, setSnack]         = useState({ open: false, msg: "", sev: "success" });
  const debounceRef = useRef(null);

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${baseUrl}/super-admin/schools`, { params: { search, page, limit } })
      .then((r) => { setSchools(r.data.data || []); setPagination(r.data.pagination || {}); })
      .catch(() => setSnack({ open: true, msg: "Failed to fetch schools", sev: "error" }))
      .finally(() => setLoading(false));
  }, [search, page, limit]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${baseUrl}/super-admin/schools/${deleteTarget}`);
      setSnack({ open: true, msg: "School deleted successfully", sev: "success" });
      setDeleteTarget(null);
      load();
    } catch (e) {
      setSnack({ open: true, msg: e.response?.data?.message || "Delete failed", sev: "error" });
    } finally { setDeleting(false); }
  };

  const handleToggleStatus = async (schoolId, currentStatus) => {
    try {
      await axios.patch(`${baseUrl}/super-admin/schools/${schoolId}/toggle-status`);
      setSnack({ open: true, msg: `Status updated`, sev: "success" });
      load();
    } catch (e) {
      setSnack({ open: true, msg: "Status update failed", sev: "error" });
    }
  };

  return (
    <Box sx={{ p: 3, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#1a1a2e", letterSpacing: -0.5 }}>All Schools</Typography>
          <Typography variant="body2" color="text.secondary">Manage all registered schools — {pagination.total} total</Typography>
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
        {/* Toolbar */}
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
            <TextField fullWidth size="small" placeholder="Search by school name, email, owner…"
              value={searchInput} onChange={(e) => handleSearch(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">{loading && search ? <CircularProgress size={15} /> : <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />}</InputAdornment>,
                  endAdornment: searchInput ? <InputAdornment position="end"><IconButton size="small" onClick={() => handleSearch("")}><ClearIcon sx={{ fontSize: 14 }} /></IconButton></InputAdornment> : null,
                },
              }}
            />
            <Stack direction="row" alignItems="center" spacing={1} flexShrink={0}>
              <Typography variant="caption" color="text.secondary">Per page:</Typography>
              <Select size="small" value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} sx={{ minWidth: 70, borderRadius: 2 }}>
                {[10, 15, 25, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </Select>
            </Stack>
          </Stack>
        </Box>

        {loading && <LinearProgress sx={{ height: 2 }} />}

        {/* Table header */}
        <Box sx={{ px: 2, py: 1, bgcolor: alpha("#1a3c6e", 0.04), display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px 100px", gap: 1 }}>
          {["School", "Owner / Email", "Registered", "Status", "Actions"].map((h) => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem" }}>{h}</Typography>
          ))}
        </Box>

        {!loading && schools.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <SchoolIcon sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>No schools found</Typography>
          </Box>
        ) : schools.map((school) => (
          <Box key={school._id}
            sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 }, "&:hover": { bgcolor: alpha("#1a3c6e", 0.02) }, display: "grid", gridTemplateColumns: "1fr 1fr 120px 100px 100px", gap: 1, alignItems: "center" }}>
            {/* School */}
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: alpha("#1a3c6e", 0.12), color: "#1a3c6e", fontWeight: 800, fontSize: 14 }}>
                {school.school_name?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" fontWeight={700} noWrap sx={{ color: "#1a3c6e" }}>{school.school_name}</Typography>
            </Stack>
            {/* Owner / Email */}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>{school.owner_name}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>{school.email}</Typography>
            </Box>
            {/* Date */}
            <Typography variant="caption" color="text.secondary">
              {school.createdAt ? new Date(school.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
            </Typography>
            {/* Status */}
            <Chip label={school.status || "Active"} size="small"
              color={school.status === "Inactive" ? "error" : "success"}
              sx={{ height: 22, fontSize: "0.72rem", fontWeight: 700, width: "fit-content" }} />
            {/* Actions */}
            <Stack direction="row" spacing={0.3}>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => navigate(`/super-admin/schools/${school._id}`)}
                  sx={{ color: "text.disabled", "&:hover": { color: "#1a3c6e", bgcolor: alpha("#1a3c6e", 0.08) } }}>
                  <VisibilityIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={school.status === "Inactive" ? "Activate" : "Deactivate"}>
                <IconButton size="small" onClick={() => handleToggleStatus(school._id, school.status)}
                  sx={{ color: "text.disabled", "&:hover": { color: school.status === "Inactive" ? "#059669" : "#d97706", bgcolor: alpha(school.status === "Inactive" ? "#059669" : "#d97706", 0.08) } }}>
                  {school.status === "Inactive" ? <ToggleOffIcon sx={{ fontSize: 15 }} /> : <ToggleOnIcon sx={{ fontSize: 15 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete School">
                <IconButton size="small" onClick={() => setDeleteTarget(school._id)}
                  sx={{ color: "text.disabled", "&:hover": { color: "#dc2626", bgcolor: alpha("#dc2626", 0.08) } }}>
                  <DeleteIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        ))}

        {/* Pagination */}
        {!loading && schools.length > 0 && (
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}</strong> of <strong>{pagination.total}</strong> schools
              </Typography>
              <Pagination count={pagination.pages || 1} page={page} onChange={(_, p) => setPage(p)}
                color="primary" size="small" showFirstButton showLastButton
                renderItem={(item) => <PaginationItem {...item} />}
                sx={{ "& .MuiPaginationItem-root": { borderRadius: 1.5, fontWeight: 600 } }}
              />
            </Stack>
          </Box>
        )}
      </Paper>

      {/* Delete Confirm */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 380 } }}>
        <DialogTitle fontWeight={900}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#dc2626", 0.1) }}><DeleteIcon sx={{ color: "#dc2626", fontSize: 20 }} /></Box>
            Delete School
          </Stack>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>This will permanently delete the school and cannot be undone. All associated data may be affected.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={deleting} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={deleting} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, minWidth: 90 }}>
            {deleting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack((p) => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((p) => ({ ...p, open: false }))} sx={{ borderRadius: 3, fontWeight: 700 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
