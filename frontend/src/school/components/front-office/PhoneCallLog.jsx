import { useEffect, useCallback, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Card, CardContent, Stack, Avatar, Tooltip,
  Badge, InputAdornment, Select, FormControl, InputLabel, Alert,
  Snackbar, LinearProgress, Pagination, PaginationItem, Drawer,
  Divider, ToggleButton, ToggleButtonGroup, Checkbox,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled } from "@mui/material/styles";
import {
  Add, Edit, Delete, Search, Clear, Phone, PhoneCallback,
  PhoneForwarded, CalendarToday, AccessTime, Notes, Person,
  FilterList, Sort, Visibility, MoreVert, CheckCircle,
  NotificationsActive, WarningAmber, DeleteSweep,
} from "@mui/icons-material";
import {
  fetchLogs, createLog, updateLog, deleteLog, bulkDeleteLogs,
  setFilters, clearMessages, selectCallFilters,
} from "../../../state/phoneCallLogSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  incoming: "#7C3AED",
  outgoing: "#6D28D9",
  followUp: "#5B21B6",
  success:  "#059669",
  danger:   "#dc2626",
  bg:       "#FAFAFF",
};

// ─── Styled ───────────────────────────────────────────────────────────────────
const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === "dark" ? "rgba(30,41,59,0.85)" : "#fff",
  border: `1px solid ${alpha('#7C3AED', 0.22)}`,
  borderRadius: 14,
  transition: "box-shadow .2s, transform .2s",
}));

const HoverRow = styled(TableRow)(({ theme }) => ({
  transition: "background .15s",
  "&:hover": { background: alpha(C.incoming, 0.06) },
  "&:last-child td": { border: 0 },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const isOverdue = (d) => d && new Date(d) < new Date() && new Date(d).toDateString() !== new Date().toDateString();
const isToday   = (d) => d && new Date(d).toDateString() === new Date().toDateString();

const EMPTY_FORM = {
  name: "", phone: "", date: new Date().toISOString().slice(0, 10),
  description: "", callType: "Incoming", followUpDate: "",
  duration: "", note: "",
};

const SORT_OPTIONS = [
  { value: "date_desc",        label: "Newest First" },
  { value: "date_asc",         label: "Oldest First" },
  { value: "name_asc",         label: "Name A–Z" },
  { value: "name_desc",        label: "Name Z–A" },
  { value: "followUpDate_asc", label: "Follow-up Soon" },
];

// ─── CallTypeBadge ────────────────────────────────────────────────────────────
function CallTypeBadge({ type }) {
  const isIn = type === "Incoming";
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1.2, py: 0.35, borderRadius: 20,
      bgcolor: alpha(isIn ? C.incoming : C.outgoing, 0.1),
      border: `1px solid ${alpha(isIn ? C.incoming : C.outgoing, 0.25)}`,
    }}>
      {isIn
        ? <PhoneCallback sx={{ fontSize: 12, color: C.incoming }} />
        : <PhoneForwarded sx={{ fontSize: 12, color: C.outgoing }} />}
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color: isIn ? C.incoming : C.outgoing }}>
        {type}
      </Typography>
    </Box>
  );
}

// ─── FollowUpChip ─────────────────────────────────────────────────────────────
function FollowUpChip({ date }) {
  if (!date) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const over  = isOverdue(date);
  const today = isToday(date);
  const color = over ? C.danger : today ? C.followUp : "text.secondary";
  return (
    <Stack direction="row" alignItems="center" spacing={0.4}>
      {over  && <WarningAmber sx={{ fontSize: 13, color: C.danger }} />}
      {today && <NotificationsActive sx={{ fontSize: 13, color: C.followUp }} />}
      <Typography sx={{ fontSize: "0.8rem", color, fontWeight: over || today ? 700 : 400 }}>
        {over ? `Overdue · ${fmtDate(date)}` : today ? "Today" : fmtDate(date)}
      </Typography>
    </Stack>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, loading }) {
  return (
    <GlassCard elevation={0} sx={{
      p: 2.5, position: "relative", overflow: "hidden",
      "&::before": { content: '""', position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: color, borderRadius: "14px 14px 0 0" },
      "&:hover": { boxShadow: `0 8px 28px ${alpha(color, 0.18)}`, transform: "translateY(-2px)" },
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
function DetailDrawer({ log, open, onClose, onEdit }) {
  if (!log) return null;
  const rows = [
    { label: "Name",            value: log.name },
    { label: "Phone",           value: log.phone },
    { label: "Date",            value: fmtDate(log.date) },
    { label: "Call Type",       value: <CallTypeBadge type={log.callType} /> },
    { label: "Duration",        value: log.duration || "—" },
    { label: "Next Follow Up",  value: <FollowUpChip date={log.followUpDate} /> },
    { label: "Description",     value: log.description || "—" },
    { label: "Note",            value: log.note || "—" },
  ];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <Box sx={{
        background: `linear-gradient(135deg, #4C1D95 0%, #7C3AED 100%)`,
        p: 3, color: "white",
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 56, height: 56, bgcolor: alpha("#fff", 0.2), border: "2px solid rgba(255,255,255,0.4)", fontSize: "1.3rem", fontWeight: 800 }}>
            {log.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "#fff" }}>{log.name}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.3}>
              <Phone sx={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }} />
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>{log.phone}</Typography>
            </Stack>
            <Box mt={0.8}><CallTypeBadge type={log.callType} /></Box>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary", fontSize: "0.68rem" }}>
          Call Details
        </Typography>
        <Stack spacing={0} mt={1.5}>
          {rows.map(({ label, value }) => (
            <Box key={label} sx={{ py: 1.2, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", fontSize: "0.63rem", flexShrink: 0, minWidth: 110 }}>
                  {label}
                </Typography>
                <Box sx={{ textAlign: "right" }}>
                  {typeof value === "string"
                    ? <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-word" }}>{value}</Typography>
                    : value}
                </Box>
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
        <Button variant="contained" startIcon={<Edit />} onClick={() => { onEdit(log); onClose(); }}
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 800, px: 3, background: "linear-gradient(135deg,#4C1D95,#7C3AED)" }}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── LogFormDrawer ────────────────────────────────────────────────────────────
function LogFormDrawer({ open, onClose, form, setForm, onSubmit, editId, submitLoading }) {
  const upd = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const sx = { "& .MuiOutlinedInput-root": { borderRadius: 2.5, fontSize: "0.88rem" } };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        p: 2, borderBottom: "1px solid", borderColor: "divider",
        background: editId ? alpha("#4C1D95", 0.05) : alpha("#7C3AED", 0.06),
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              p: 1.2, borderRadius: 2.5,
              background: editId ? "linear-gradient(135deg,#4C1D95,#7C3AED)" : "linear-gradient(135deg,#7C3AED,#5B21B6)",
              boxShadow: `0 4px 12px ${alpha(editId ? "#4C1D95" : "#7C3AED", 0.35)}`,
            }}>
              {editId ? <Edit sx={{ fontSize: 18, color: "#fff" }} /> : <Add sx={{ fontSize: 18, color: "#fff" }} />}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: "1rem", lineHeight: 1.1 }}>
                {editId ? "Edit Call Log" : "Add Call Log"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editId ? "Update existing record" : "Log a new phone call"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small"><Clear /></IconButton>
        </Stack>
      </DialogTitle>

      {/* Form */}
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {/* Call Type toggle */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "0.68rem", display: "block", mb: 1 }}>
              Call Type *
            </Typography>
            <ToggleButtonGroup exclusive value={form.callType} onChange={(_, v) => v && upd("callType", v)} fullWidth size="small"
              sx={{ "& .MuiToggleButton-root": { borderRadius: "10px !important", border: "1px solid", borderColor: "divider", fontWeight: 700, textTransform: "none", mx: "2px !important", "&.Mui-selected": { color: "#fff" } } }}>
              <ToggleButton value="Incoming" sx={{ "&.Mui-selected": { bgcolor: C.incoming, borderColor: C.incoming } }}>
                <PhoneCallback sx={{ fontSize: 16, mr: 0.7 }} /> Incoming
              </ToggleButton>
              <ToggleButton value="Outgoing" sx={{ "&.Mui-selected": { bgcolor: C.outgoing, borderColor: C.outgoing } }}>
                <PhoneForwarded sx={{ fontSize: 16, mr: 0.7 }} /> Outgoing
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Name *" value={form.name}
                onChange={(e) => upd("name", e.target.value)}
                error={!form.name} helperText={!form.name ? "Required" : ""}
                sx={sx} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Phone *" value={form.phone}
                onChange={(e) => upd("phone", e.target.value)}
                error={!form.phone} helperText={!form.phone ? "Required" : ""}
                sx={sx} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" type="date" label="Date *" value={form.date}
                onChange={(e) => upd("date", e.target.value)} sx={sx}
                slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Duration" placeholder="e.g. 5 min" value={form.duration}
                onChange={(e) => upd("duration", e.target.value)} sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><AccessTime sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" type="date" label="Next Follow Up Date" value={form.followUpDate}
                onChange={(e) => upd("followUpDate", e.target.value)} sx={sx}
                slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><NotificationsActive sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Description" multiline rows={3} value={form.description}
                onChange={(e) => upd("description", e.target.value)} placeholder="Brief description of the call…"
                sx={sx} slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}><Notes sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Note" multiline rows={3} value={form.note}
                onChange={(e) => upd("note", e.target.value)} placeholder="Additional notes…" sx={sx}
              />
            </Grid2>
          </Grid2>
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Button variant="outlined" onClick={onClose} disabled={submitLoading}
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, py: 1.1, px: 3 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSubmit} disabled={submitLoading || !form.name || !form.phone}
          sx={{
            borderRadius: 2.5, textTransform: "none", fontWeight: 800, py: 1.1, px: 3,
            background: editId ? "linear-gradient(135deg,#4C1D95,#7C3AED)" : "linear-gradient(135deg,#7C3AED,#5B21B6)",
            boxShadow: `0 4px 16px ${alpha(editId ? "#4C1D95" : "#7C3AED", 0.4)}`,
          }}>
          {submitLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editId ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PhoneCallLog() {
  useDocumentTitle("Phone Call Log");
  const dispatch = useDispatch();
  const { logs, stats, pagination, loading, submitLoading, error, successMsg } =
    useSelector((s) => s.phoneCallLog);
  const filters = useSelector(selectCallFilters);

  // local UI state
  const [searchInput, setSearchInput] = useState(filters.search);
  const [formOpen,    setFormOpen]    = useState(false);
  const [detailLog,   setDetailLog]   = useState(null);
  const [editId,      setEditId]      = useState(null);
  const [deleteTarget,setDeleteTarget]= useState(null);
  const [selected,    setSelected]    = useState([]);   // bulk select ids
  const [form,        setForm]        = useState(EMPTY_FORM);
  const debounceRef = useRef(null);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const buildParams = useCallback((f) => {
    const p = { page: f.page, limit: f.limit, sortBy: f.sortBy };
    if (f.callType !== "all") p.callType = f.callType;
    if (f.search)      p.search      = f.search;
    if (f.date)        p.date        = f.date;
    if (f.followUpDate) p.followUpDate = f.followUpDate;
    return p;
  }, []);

  const load = useCallback(() => {
    dispatch(fetchLogs(buildParams(filters)));
  }, [dispatch, filters, buildParams]);

  useEffect(() => { load(); }, [load]);

  // auto-clear messages
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
    dispatch(setFilters({ search: "", callType: "all", date: "", followUpDate: "", sortBy: "date_desc" }));
  };

  // ── form helpers ───────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (log) => {
    setEditId(log._id);
    setForm({
      name:         log.name        || "",
      phone:        log.phone       || "",
      date:         log.date        ? new Date(log.date).toISOString().slice(0, 10) : "",
      description:  log.description || "",
      callType:     log.callType    || "Incoming",
      followUpDate: log.followUpDate ? new Date(log.followUpDate).toISOString().slice(0, 10) : "",
      duration:     log.duration    || "",
      note:         log.note        || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      date:         form.date        || new Date().toISOString().slice(0, 10),
      followUpDate: form.followUpDate || null,
    };
    const thunk = editId ? updateLog({ id: editId, data: payload }) : createLog(payload);
    const res = await dispatch(thunk);
    if (!res.error) { setFormOpen(false); load(); }
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deleteLog(id));
    if (!res.error) { setDeleteTarget(null); load(); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    const res = await dispatch(bulkDeleteLogs(selected));
    if (!res.error) { setSelected([]); load(); }
  };

  // ── select helpers ─────────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () =>
    setSelected(selected.length === logs.length ? [] : logs.map((l) => l._id));

  const activeCount = [filters.search, filters.callType !== "all", filters.date, filters.followUpDate].filter(Boolean).length;

  // ── stat cards config ──────────────────────────────────────────────────────
  const STATS = [
    { label: "Total Calls",    value: stats.total,         color: "#4C1D95", icon: <Phone sx={{ fontSize: 20, color: "#4C1D95" }} /> },
    { label: "Incoming",       value: stats.incomingCount, color: C.incoming, icon: <PhoneCallback sx={{ fontSize: 20, color: C.incoming }} /> },
    { label: "Outgoing",       value: stats.outgoingCount, color: C.outgoing, icon: <PhoneForwarded sx={{ fontSize: 20, color: C.outgoing }} /> },
    { label: "Pending Follow-ups", value: stats.followUpCount, color: C.followUp, icon: <NotificationsActive sx={{ fontSize: 20, color: C.followUp }} /> },
  ];

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: "100vh", bgcolor: C.bg }}>
      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={900} sx={{ color: "#4C1D95", letterSpacing: -0.5 }}>
            Phone Call Log
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track all incoming and outgoing calls
          </Typography>
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
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 800, px: 2.5,
              background: "linear-gradient(135deg,#7C3AED,#5B21B6)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
              "&:hover": { boxShadow: "0 6px 24px rgba(124,58,237,0.55)" } }}>
            Add Call Log
          </Button>
        </Stack>
      </Stack>

      {/* ── Stat Cards ── */}
      <Grid2 container spacing={{ xs: 1.5, sm: 2 }} mb={{ xs: 2, sm: 3 }}>
        {STATS.map((s) => (
          <Grid2 key={s.label} size={{ xs: 6, sm: 6, md: 3 }}>
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
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: alpha("#7C3AED", 0.03) } }}
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

          {/* Call Type */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Call Type</InputLabel>
              <Select value={filters.callType} onChange={(e) => handleFilter("callType", e.target.value)} label="Call Type"
                sx={{ borderRadius: 2.5 }}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="Incoming">Incoming</MenuItem>
                <MenuItem value="Outgoing">Outgoing</MenuItem>
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

          {/* Sort */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select value={filters.sortBy} onChange={(e) => handleFilter("sortBy", e.target.value)} label="Sort By"
                sx={{ borderRadius: 2.5 }}>
                {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid2>

          {/* Clear */}
          <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
            <Badge badgeContent={activeCount} color="error" invisible={!activeCount}>
              <Button fullWidth variant="outlined" size="small" onClick={clearAll} disabled={!activeCount}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700 }}>
                Clear Filters
              </Button>
            </Badge>
          </Grid2>
        </Grid2>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={0.5} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={700}>Active:</Typography>
            {filters.search && <Chip size="small" label={`Search: "${filters.search}"`} onDelete={() => handleSearch("")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.callType !== "all" && <Chip size="small" label={`Type: ${filters.callType}`} onDelete={() => handleFilter("callType", "all")} color={filters.callType === "Incoming" ? "info" : "secondary"} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.date && <Chip size="small" label={`Date: ${filters.date}`} onDelete={() => handleFilter("date", "")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {filters.followUpDate && <Chip size="small" label={`Follow-up: ${filters.followUpDate}`} onDelete={() => handleFilter("followUpDate", "")} sx={{ height: 22, fontSize: "0.72rem" }} />}
          </Stack>
        )}
      </GlassCard>

      {/* Loading bar */}
      {loading && <LinearProgress sx={{ mb: 1.5, borderRadius: 1, height: 3 }} />}

      {/* ── Table ── */}
      <GlassCard elevation={0} sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha("#7C3AED", 0.04) }}>
                <TableCell padding="checkbox">
                  <Checkbox size="small" checked={logs.length > 0 && selected.length === logs.length}
                    indeterminate={selected.length > 0 && selected.length < logs.length}
                    onChange={toggleAll} />
                </TableCell>
                {["Name", "Phone", "Date", "Call Type", "Duration", "Next Follow Up", "Description", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", whiteSpace: "nowrap", py: 1.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 6 }}>
                      <Phone sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>No call logs found</Typography>
                      {activeCount > 0 && <Typography variant="caption" color="text.disabled">Try clearing the filters</Typography>}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <HoverRow key={log._id} selected={selected.includes(log._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={selected.includes(log._id)} onChange={() => toggleSelect(log._id)} />
                    </TableCell>

                    {/* Name */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha("#4C1D95", 0.12), color: "#4C1D95", fontSize: 13, fontWeight: 800 }}>
                          {log.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} sx={{ color: "#5B21B6" }}>{log.name}</Typography>
                      </Stack>
                    </TableCell>

                    {/* Phone */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Phone sx={{ fontSize: 13, color: "text.disabled" }} />
                        <Typography variant="body2">{log.phone}</Typography>
                      </Stack>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{fmtDate(log.date)}</Typography>
                    </TableCell>

                    {/* Call Type */}
                    <TableCell><CallTypeBadge type={log.callType} /></TableCell>

                    {/* Duration */}
                    <TableCell>
                      {log.duration
                        ? <Chip icon={<AccessTime sx={{ fontSize: 12 }} />} label={log.duration} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} />
                        : <Typography variant="caption" color="text.disabled">—</Typography>}
                    </TableCell>

                    {/* Follow Up */}
                    <TableCell><FollowUpChip date={log.followUpDate} /></TableCell>

                    {/* Description */}
                    <TableCell sx={{ maxWidth: 160 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {log.description || "—"}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.3}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setDetailLog(log)}
                            sx={{ color: "text.disabled", "&:hover": { color: "#4C1D95", bgcolor: alpha("#4C1D95", 0.08) } }}>
                            <Visibility sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(log)}
                            sx={{ color: "text.disabled", "&:hover": { color: "#7C3AED", bgcolor: alpha("#7C3AED", 0.08) } }}>
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteTarget(log._id)}
                            sx={{ color: "text.disabled", "&:hover": { color: C.danger, bgcolor: alpha(C.danger, 0.08) } }}>
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
        {!loading && logs.length > 0 && (
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Showing{" "}
                <strong>{(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, pagination.total)}</strong>
                {" "}of <strong>{pagination.total}</strong> records
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
      <LogFormDrawer open={formOpen} onClose={() => setFormOpen(false)}
        form={form} setForm={setForm} onSubmit={handleSubmit}
        editId={editId} submitLoading={submitLoading} />

      <DetailDrawer log={detailLog} open={Boolean(detailLog)}
        onClose={() => setDetailLog(null)} onEdit={openEdit} />

      {/* ── Delete Confirm ── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 360 } }}>
        <DialogTitle sx={{ fontWeight: 900 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(C.danger, 0.1) }}>
              <Delete sx={{ color: C.danger, fontSize: 20 }} />
            </Box>
            Delete Call Log
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this call log? This action cannot be undone.
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