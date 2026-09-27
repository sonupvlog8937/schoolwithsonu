import { useEffect, useCallback, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Card, CardContent, Stack, Avatar, Tooltip,
  Badge, InputAdornment, Select, FormControl, InputLabel, Alert,
  Snackbar, LinearProgress, Pagination, PaginationItem, Drawer,
  Checkbox, Menu,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled } from "@mui/material/styles";
import {
  Add, Edit, Delete, Search, Clear, CalendarToday, Notes,
  Visibility, DeleteSweep, ReportProblem, CheckCircle,
  HourglassTop, Cancel, Person, Phone, Assignment,
  MoreVert, FiberManualRecord,
} from "@mui/icons-material";
import {
  fetchComplaints, createComplaint, updateComplaint,
  updateComplaintStatus, deleteComplaint, bulkDeleteComplaints,
  setFilters, clearMessages, selectComplaintFilters,
} from "../../../state/complaintSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

// ─── Constants ────────────────────────────────────────────────────────────────
// COMPLAINT_TYPES and SOURCES are now dynamic from Setup (fetched via Redux)
const STATUSES        = ["Open", "In Progress", "Resolved", "Closed"];
const PRIORITIES      = ["High", "Medium", "Low"];

const STATUS_CFG = {
  "Open":        { color: "#6D28D9", bg: "#F5F3FF", border: "#fca5a5", icon: ReportProblem },
  "In Progress": { color: "#7C3AED", bg: "#F5F3FF", border: "#A78BFA", icon: HourglassTop },
  "Resolved":    { color: "#059669", bg: "#f0fdf4", border: "#6ee7b7", icon: CheckCircle },
  "Closed":      { color: "#6b7280", bg: "#f9fafb", border: "#d1d5db", icon: Cancel },
};

const PRIORITY_CFG = {
  High:   { color: "#6D28D9", dot: "#ef4444" },
  Medium: { color: "#7C3AED", dot: "#8B5CF6" },
  Low:    { color: "#059669", dot: "#10b981" },
};

const SORT_OPTIONS = [
  { value: "date_desc",        label: "Newest First" },
  { value: "date_asc",         label: "Oldest First" },
  { value: "complaintNo_desc", label: "Complaint # ↓" },
  { value: "complaintNo_asc",  label: "Complaint # ↑" },
  { value: "name_asc",         label: "Name A–Z" },
];

// ─── Styled ───────────────────────────────────────────────────────────────────
const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === "dark" ? "rgba(30,41,59,0.85)" : "#fff",
  border: `1px solid ${alpha('#7C3AED', 0.22)}`,
  borderRadius: 14,
  transition: "box-shadow .2s, transform .2s",
}));

const HoverRow = styled(TableRow)(() => ({
  transition: "background .15s",
  "&:hover": { background: alpha('#7C3AED', 0.05) },
  "&:last-child td": { border: 0 },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG["Open"];
  const Icon = cfg.icon;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1.2, py: 0.35, borderRadius: 20,
      bgcolor: cfg.bg, border: `1px solid ${cfg.border}`,
    }}>
      <Icon sx={{ fontSize: 11, color: cfg.color }} />
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: cfg.color }}>{status}</Typography>
    </Box>
  );
}

// ─── PriorityDot ─────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CFG[priority] || PRIORITY_CFG.Medium;
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <FiberManualRecord sx={{ fontSize: 10, color: cfg.dot }} />
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: cfg.color }}>{priority}</Typography>
    </Stack>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, loading }) {
  return (
    <GlassCard elevation={0} sx={{
      p: 2.5, position: "relative", overflow: "hidden",
      "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: color, borderRadius: "14px 14px 0 0" },
      "&:hover": { boxShadow: `0 8px 24px ${alpha(color, 0.2)}`, transform: "translateY(-2px)" },
    }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem" }}>
            {label}
          </Typography>
          {loading
            ? <Box sx={{ width: 60, height: 36, bgcolor: "action.hover", borderRadius: 1, mt: 0.5 }} />
            : <Typography variant="h4" sx={{ fontWeight: 900, color, lineHeight: 1.1, mt: 0.5 }}>{value ?? 0}</Typography>}
        </Box>
        <Box sx={{ p: 1.2, borderRadius: 2.5, bgcolor: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.2)}` }}>
          {icon}
        </Box>
      </Stack>
    </GlassCard>
  );
}

// ─── DetailDrawer ─────────────────────────────────────────────────────────────
function DetailDrawer({ complaint, open, onClose, onEdit, onStatusChange }) {
  if (!complaint) return null;
  const rows = [
    { label: "Complain #",      value: complaint.complaintNo ?? "—" },
    { label: "Complaint Type",  value: complaint.complaintType },
    { label: "Source",          value: complaint.source },
    { label: "Name",            value: complaint.complaintBy },
    { label: "Phone",           value: complaint.phone || "—" },
    { label: "Date",            value: fmtDate(complaint.date) },
    { label: "Assigned",        value: complaint.assignedTo || "—" },
    { label: "Action Taken",    value: complaint.actionTaken || "—" },
    { label: "Description",     value: complaint.description || "—" },
    { label: "Note",            value: complaint.note || "—" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ background: "linear-gradient(135deg,#5B21B6,#7C3AED)", p: 3, color: "#fff" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 56, height: 56, bgcolor: alpha("#fff", 0.2), border: "2px solid rgba(255,255,255,0.4)", fontSize: "1.3rem", fontWeight: 800 }}>
            {complaint.complaintBy?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={900} color="#fff">{complaint.complaintBy}</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.3 }}>
              Complaint #{complaint.complaintNo} · {complaint.complaintType}
            </Typography>
            <Stack direction="row" spacing={1} mt={0.8}>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        {/* Quick status change */}
        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary", fontSize: "0.68rem", display: "block", mb: 1 }}>
          Update Status
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={0.8} mb={2.5}>
          {STATUSES.map((s) => {
            const cfg = STATUS_CFG[s];
            const Icon = cfg.icon;
            const active = complaint.status === s;
            return (
              <Chip key={s} clickable size="small"
                icon={<Icon style={{ fontSize: 13 }} />}
                label={s}
                onClick={() => onStatusChange(complaint._id, s)}
                sx={{
                  height: 28, fontSize: "0.75rem", fontWeight: 700,
                  bgcolor: active ? cfg.color : "transparent",
                  color: active ? "#fff" : cfg.color,
                  border: `1.5px solid ${active ? cfg.color : cfg.border}`,
                  "& .MuiChip-icon": { color: active ? "#fff" : cfg.color },
                  "&:hover": { bgcolor: cfg.color, color: "#fff", "& .MuiChip-icon": { color: "#fff" } },
                }}
              />
            );
          })}
        </Stack>

        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary", fontSize: "0.68rem" }}>
          Details
        </Typography>
        <Stack spacing={0} mt={1.5}>
          {rows.map(({ label, value }) => (
            <Box key={label} sx={{ py: 1.2, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.63rem", flexShrink: 0, minWidth: 110 }}>
                  {label}
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{ textAlign: "right", wordBreak: "break-word" }}>
                  {value}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, px: 3 }}>
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => { onEdit(complaint); onClose(); }}
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 800, px: 3, background: "linear-gradient(135deg,#5B21B6,#7C3AED)" }}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── FormDrawer ───────────────────────────────────────────────────────────────
function FormDrawer({ open, onClose, form, setForm, onSubmit, editId, submitLoading, complaintTypes, sources }) {
  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const sx = { "& .MuiOutlinedInput-root": { borderRadius: 2.5, fontSize: "0.88rem" } };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          maxHeight: { xs: "100vh", sm: "90vh" },
          margin: { xs: 0, sm: 2 },
          width: { xs: "100%", sm: "auto" },
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
        background: editId ? alpha("#dc2626", 0.05) : alpha("#c77ff1ff", 1.06),
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              p: 1.2, borderRadius: 2.5,
              background: editId ? "linear-gradient(135deg,#7f1d1d,#dc2626)" : "linear-gradient(135deg,#7C3AED,#5B21B6)",
              boxShadow: `0 4px 12px ${alpha(editId ? "#dc2626" : "#7C3AED", 0.35)}`,
            }}>
              {editId ? <Edit sx={{ fontSize: 18, color: "#fff" }} /> : <Add sx={{ fontSize: 18, color: "#fff" }} />}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} fontSize="1rem" lineHeight={1.1}>
                {editId ? "Edit Complaint" : "Add Complaint"}
              </Typography>
              <Typography variant="caption" color="#f9eefeff">
                {editId ? "Update existing record" : "Register a new complaint"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small"><Clear /></IconButton>
        </Stack>
      </DialogTitle>

      {/* Form */}
    
      <DialogContent sx={{ p: 2.5 }}>
  <Stack spacing={2} sx={{ pt: 1.5 }}>
          <Grid2 container spacing={1.5}>
            {/* Complaint Type */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Complaint Type" value={form.complaintType}
                onChange={(e) => upd("complaintType", e.target.value)} sx={sx}>
                {complaintTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid2>

            {/* Source */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Source" value={form.source}
                onChange={(e) => upd("source", e.target.value)} sx={sx}>
                {sources.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid2>

            {/* Complain By */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Complain By *" value={form.complaintBy}
                onChange={(e) => upd("complaintBy", e.target.value)}
                error={!form.complaintBy} helperText={!form.complaintBy ? "Required" : ""}
                sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Phone */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Phone" value={form.phone}
                onChange={(e) => upd("phone", e.target.value)} sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Date */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" type="date" label="Date" value={form.date}
                onChange={(e) => upd("date", e.target.value)} sx={sx}
                slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Priority */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Priority" value={form.priority}
                onChange={(e) => upd("priority", e.target.value)} sx={sx}>
                {PRIORITIES.map((p) => {
                  const cfg = PRIORITY_CFG[p];
                  return (
                    <MenuItem key={p} value={p}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <FiberManualRecord sx={{ fontSize: 10, color: cfg.dot }} />
                        <span>{p}</span>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid2>

            {/* Status */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Status" value={form.status}
                onChange={(e) => upd("status", e.target.value)} sx={sx}>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid2>

            {/* Assigned To */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Assigned To" value={form.assignedTo}
                onChange={(e) => upd("assignedTo", e.target.value)} sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Assignment sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Description */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Description" multiline rows={3}
                value={form.description} onChange={(e) => upd("description", e.target.value)}
                placeholder="Describe the complaint…" sx={sx}
              />
            </Grid2>

            {/* Action Taken */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Action Taken" multiline rows={2}
                value={form.actionTaken} onChange={(e) => upd("actionTaken", e.target.value)}
                placeholder="What action was taken…" sx={sx}
              />
            </Grid2>

            {/* Note */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Note" multiline rows={2}
                value={form.note} onChange={(e) => upd("note", e.target.value)}
                placeholder="Additional notes…" sx={sx}
              />
            </Grid2>
          </Grid2>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={submitLoading}
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitLoading || !form.complaintBy}
          sx={{
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            px: 3,
            background: editId ? "linear-gradient(135deg,#7f1d1d,#dc2626)" : "linear-gradient(135deg,#7C3AED,#5B21B6)",
            boxShadow: `0 4px 16px ${alpha(editId ? "#dc2626" : "#7C3AED", 0.4)}`,
          }}
        >
          {submitLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editId ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Complaint() {
  useDocumentTitle("Complaint");
  const dispatch = useDispatch();
  const { complaints, stats, pagination, loading, submitLoading, error, successMsg, complaintTypeOptions, sourceOptions } =
    useSelector((s) => s.complaint);
  const filters = useSelector(selectComplaintFilters);

  // Use dynamic options from Redux, fallback to defaults if empty
  const COMPLAINT_TYPES = complaintTypeOptions.length > 0 ? complaintTypeOptions : ["Other"];
  const SOURCES = sourceOptions.length > 0 ? sourceOptions : ["Other"];

  // Dynamic EMPTY_FORM based on available options
  const EMPTY_FORM = {
    complaintBy: "", 
    phone: "", 
    date: new Date().toISOString().slice(0, 10),
    complaintType: COMPLAINT_TYPES[0] || "Other", 
    source: SOURCES[0] || "Other", 
    description: "",
    actionTaken: "", 
    assignedTo: "", 
    note: "", 
    status: "Open", 
    priority: "Medium",
  };

  const [searchInput,  setSearchInput]  = useState(filters.search);
  const [formOpen,     setFormOpen]     = useState(false);
  const [detailItem,   setDetailItem]   = useState(null);
  const [editId,       setEditId]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected,     setSelected]     = useState([]);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [menuAnchor,   setMenuAnchor]   = useState(null);
  const [menuRow,      setMenuRow]      = useState(null);
  const debounceRef = useRef(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const buildParams = useCallback((f) => {
    const p = { page: f.page, limit: f.limit, sortBy: f.sortBy };
    if (f.search)        p.search        = f.search;
    if (f.status        !== "all") p.status        = f.status;
    if (f.complaintType !== "all") p.complaintType = f.complaintType;
    if (f.source        !== "all") p.source        = f.source;
    if (f.priority      !== "all") p.priority      = f.priority;
    if (f.date)          p.date          = f.date;
    return p;
  }, []);

  const load = useCallback(() => {
    dispatch(fetchComplaints(buildParams(filters)));
  }, [dispatch, filters, buildParams]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => dispatch(clearMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error, dispatch]);

  // ── search debounce ────────────────────────────────────────────────────────
  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => dispatch(setFilters({ search: val })), 400);
  };

  const handleFilter = (key, val) => dispatch(setFilters({ [key]: val }));

  const clearAll = () => {
    setSearchInput("");
    dispatch(setFilters({ search: "", status: "all", complaintType: "all", source: "all", priority: "all", date: "", sortBy: "date_desc" }));
  };

  // ── form helpers ───────────────────────────────────────────────────────────
  const openAdd = () => { setEditId(null); setForm(EMPTY_FORM); setFormOpen(true); };

  const openEdit = (c) => {
    setEditId(c._id);
    setForm({
      complaintBy:   c.complaintBy   || "",
      phone:         c.phone         || "",
      date:          c.date ? new Date(c.date).toISOString().slice(0, 10) : "",
      complaintType: c.complaintType || "Other",
      source:        c.source        || "Other",
      description:   c.description   || "",
      actionTaken:   c.actionTaken   || "",
      assignedTo:    c.assignedTo    || "",
      note:          c.note          || "",
      status:        c.status        || "Open",
      priority:      c.priority      || "Medium",
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const thunk = editId
      ? updateComplaint({ id: editId, data: form })
      : createComplaint(form);
    const res = await dispatch(thunk);
    if (!res.error) { setFormOpen(false); load(); }
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deleteComplaint(id));
    if (!res.error) { setDeleteTarget(null); load(); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    const res = await dispatch(bulkDeleteComplaints(selected));
    if (!res.error) { setSelected([]); load(); }
  };

  const handleStatusChange = async (id, status) => {
    await dispatch(updateComplaintStatus({ id, status }));
    if (detailItem?._id === id) setDetailItem((p) => ({ ...p, status }));
  };

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll    = () => setSelected(selected.length === complaints.length ? [] : complaints.map((c) => c._id));

  const activeCount = [
    filters.search,
    filters.status        !== "all",
    filters.complaintType !== "all",
    filters.source        !== "all",
    filters.priority      !== "all",
    filters.date,
  ].filter(Boolean).length;

  const STATS = [
    { label: "Total",       value: stats.total,      color: "#4C1D95", icon: <ReportProblem sx={{ fontSize: 20, color: "#4C1D95" }} /> },
    { label: "Open",        value: stats.open,        color: "#6D28D9", icon: <ReportProblem sx={{ fontSize: 20, color: "#6D28D9" }} /> },
    { label: "In Progress", value: stats.inProgress,  color: "#7C3AED", icon: <HourglassTop  sx={{ fontSize: 20, color: "#7C3AED" }} /> },
    { label: "Resolved",    value: stats.resolved,    color: "#059669", icon: <CheckCircle   sx={{ fontSize: 20, color: "#059669" }} /> },
    { label: "High Priority",value: stats.high,       color: "#ef4444", icon: <FiberManualRecord sx={{ fontSize: 20, color: "#ef4444" }} /> },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: "100vh", bgcolor: "#FAFAFF" }}>
      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7C3AED', 0.1) }}>
              <ReportProblem sx={{ fontSize: 24, color: "#6D28D9" }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: "#4C1D95", letterSpacing: -0.5 }}>
                Complaint
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and resolve all school complaints
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1}>
          {selected.length > 0 && (
            <Button variant="outlined" color="error" startIcon={<DeleteSweep />}
              onClick={handleBulkDelete} disabled={submitLoading}
              sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}>
              Delete ({selected.length})
            </Button>
          )}
          <Button variant="contained" startIcon={<Add />} onClick={openAdd}
            sx={{
              borderRadius: 2.5, textTransform: "none", fontWeight: 800, px: 2.5,
              background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
              boxShadow: "0 4px 16px rgba(147,51,234,0.4)",
              "&:hover": { boxShadow: "0 6px 24px rgba(147,51,234,0.55)" },
            }}>
            Add Complaint
          </Button>
        </Stack>
      </Stack>

      {/* ── Stat Cards ── */}
      <Grid2 container spacing={2} mb={3}>
        {STATS.map((s) => (
          <Grid2 key={s.label} size={{ xs: 12, sm: 6, md: 2.4 }}>
            <StatCard {...s} loading={loading} />
          </Grid2>
        ))}
      </Grid2>

      {/* ── Toolbar ── */}
      <GlassCard elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Grid2 container spacing={1.5} alignItems="center">
          {/* Search */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" placeholder="Search name, phone, description…"
              value={searchInput} onChange={(e) => handleSearch(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: alpha("#dc2626", 0.02) } }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">
                    {loading && filters.search ? <CircularProgress size={15} /> : <Search sx={{ fontSize: 18, color: "text.disabled" }} />}
                  </InputAdornment>,
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleSearch("")}><Clear sx={{ fontSize: 14 }} /></IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Grid2>

          {/* Status */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filters.status} onChange={(e) => handleFilter("status", e.target.value)} label="Status" sx={{ borderRadius: 2.5 }}>
                <MenuItem value="all">All Status</MenuItem>
                {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid2>

          {/* Type */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={filters.complaintType} onChange={(e) => handleFilter("complaintType", e.target.value)} label="Type" sx={{ borderRadius: 2.5 }}>
                <MenuItem value="all">All Types</MenuItem>
                {COMPLAINT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid2>

          {/* Priority */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={filters.priority} onChange={(e) => handleFilter("priority", e.target.value)} label="Priority" sx={{ borderRadius: 2.5 }}>
                <MenuItem value="all">All</MenuItem>
                {PRIORITIES.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid2>

          {/* Date */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField fullWidth size="small" type="date" label="Date"
              value={filters.date} onChange={(e) => handleFilter("date", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid2>

          {/* Clear */}
          <Grid2 size={{ xs: 12, sm: 3, md: 2 }}>
            <Badge badgeContent={activeCount} color="error" invisible={!activeCount}>
              <Button fullWidth variant="outlined" size="small" onClick={clearAll} disabled={!activeCount}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}>
                Clear Filters
              </Button>
            </Badge>
          </Grid2>
        </Grid2>

        {/* Active chips */}
        {activeCount > 0 && (
          <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={0.5} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={700}>Active:</Typography>
            {filters.search && <Chip size="small" label={`Search: "${filters.search}"`} onDelete={() => handleSearch("")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.status !== "all" && <Chip size="small" label={`Status: ${filters.status}`} onDelete={() => handleFilter("status", "all")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.complaintType !== "all" && <Chip size="small" label={`Type: ${filters.complaintType}`} onDelete={() => handleFilter("complaintType", "all")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.source !== "all" && <Chip size="small" label={`Source: ${filters.source}`} onDelete={() => handleFilter("source", "all")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.priority !== "all" && <Chip size="small" label={`Priority: ${filters.priority}`} onDelete={() => handleFilter("priority", "all")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.date && <Chip size="small" label={`Date: ${filters.date}`} onDelete={() => handleFilter("date", "")} sx={{ height: 22, fontSize: "0.72rem" }} />}
          </Stack>
        )}
      </GlassCard>

      {loading && <LinearProgress sx={{ mb: 1.5, borderRadius: 1, height: 3 }} />}

      {/* ── Table ── */}
      <GlassCard elevation={0} sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha("#dc2626", 0.04) }}>
                <TableCell padding="checkbox">
                  <Checkbox size="small"
                    checked={complaints.length > 0 && selected.length === complaints.length}
                    indeterminate={selected.length > 0 && selected.length < complaints.length}
                    onChange={toggleAll} />
                </TableCell>
                {["#", "Complain By", "Phone", "Type", "Source", "Date", "Priority", "Status", "Assigned", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", whiteSpace: "nowrap", py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && complaints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    <Box sx={{ py: 6 }}>
                      <ReportProblem sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>No complaints found</Typography>
                      {activeCount > 0 && <Typography variant="caption" color="text.disabled">Try clearing the filters</Typography>}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                complaints.map((c) => (
                  <HoverRow key={c._id} selected={selected.includes(c._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={selected.includes(c._id)} onChange={() => toggleSelect(c._id)} />
                    </TableCell>

                    {/* # */}
                    <TableCell>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        #{c.complaintNo ?? "—"}
                      </Typography>
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha("#dc2626", 0.12), color: "#6D28D9", fontSize: 12, fontWeight: 800 }}>
                          {c.complaintBy?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#4C1D95" }}>{c.complaintBy}</Typography>
                      </Stack>
                    </TableCell>

                    {/* Phone */}
                    <TableCell>
                      <Typography variant="caption">{c.phone || "—"}</Typography>
                    </TableCell>

                    {/* Type */}
                    <TableCell>
                      <Chip label={c.complaintType} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} />
                    </TableCell>

                    {/* Source */}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{c.source}</Typography>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{fmtDate(c.date)}</Typography>
                    </TableCell>

                    {/* Priority */}
                    <TableCell><PriorityBadge priority={c.priority} /></TableCell>

                    {/* Status */}
                    <TableCell><StatusBadge status={c.status} /></TableCell>

                    {/* Assigned */}
                    <TableCell sx={{ maxWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>{c.assignedTo || "—"}</Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.3}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setDetailItem(c)}
                            sx={{ color: "text.disabled", "&:hover": { color: "#4C1D95", bgcolor: alpha('#7C3AED', 0.08) } }}>
                            <Visibility sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(c)}
                            sx={{ color: "text.disabled", "&:hover": { color: "#7C3AED", bgcolor: alpha("#7C3AED", 0.08) } }}>
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteTarget(c._id)}
                            sx={{ color: "text.disabled", "&:hover": { color: "#6D28D9", bgcolor: alpha('#7C3AED', 0.08) } }}>
                            <Delete sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </HoverRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Pagination ── */}
        {!loading && complaints.length > 0 && (
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Showing{" "}
                <strong>{(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, pagination.total)}</strong>
                {" "}of <strong>{pagination.total}</strong> complaints
                {activeCount > 0 && " (filtered)"}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" color="text.secondary">Per page:</Typography>
                  <Select size="small" value={filters.limit}
                    onChange={(e) => dispatch(setFilters({ limit: Number(e.target.value) }))}
                    sx={{ fontSize: "0.8rem", minWidth: 70, borderRadius: 2 }}>
                    {[5, 10, 20, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </Select>
                </Stack>
                <Pagination count={pagination.pages} page={filters.page}
                  onChange={(_, p) => dispatch(setFilters({ page: p }))}
                  color="primary" size="small" showFirstButton showLastButton
                  renderItem={(item) => <PaginationItem {...item} />}
                  sx={{ "& .MuiPaginationItem-root": { borderRadius: 1.5, fontWeight: 600 } }}
                />
              </Stack>
            </Stack>
          </Box>
        )}
      </GlassCard>

      {/* ── Drawers ── */}
      <FormDrawer open={formOpen} onClose={() => setFormOpen(false)}
        form={form} setForm={setForm} onSubmit={handleSubmit}
        editId={editId} submitLoading={submitLoading}
        complaintTypes={COMPLAINT_TYPES} sources={SOURCES} />

      <DetailDrawer complaint={detailItem} open={Boolean(detailItem)}
        onClose={() => setDetailItem(null)} onEdit={openEdit}
        onStatusChange={handleStatusChange} />

      {/* ── Delete Confirm ── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 360 } }}>
        <DialogTitle fontWeight={900}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#7C3AED', 0.1) }}>
              <Delete sx={{ color: "#6D28D9", fontSize: 20 }} />
            </Box>
            Delete Complaint
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this complaint? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" disabled={submitLoading}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}>Cancel</Button>
          <Button onClick={() => handleDelete(deleteTarget)} variant="contained" color="error"
            disabled={submitLoading} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, minWidth: 90 }}>
            {submitLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbars ── */}
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => dispatch(clearMessages())}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="success" onClose={() => dispatch(clearMessages())} sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => dispatch(clearMessages())}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" onClose={() => dispatch(clearMessages())} sx={{ width: "100%", borderRadius: 3, fontWeight: 700 }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}