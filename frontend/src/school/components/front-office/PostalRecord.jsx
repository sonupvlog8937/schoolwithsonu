import { useEffect, useCallback, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Card, CardContent, Stack, Avatar, Tooltip,
  Badge, InputAdornment, Select, FormControl, InputLabel, Alert,
  Snackbar, LinearProgress, Pagination, PaginationItem, Drawer,
  Divider, Checkbox,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled } from "@mui/material/styles";
import {
  Add, Edit, Delete, Search, Clear, CalendarToday, Notes,
  Visibility, DeleteSweep, LocalShipping, MoveToInbox,
  ConfirmationNumber, LocationOn, Person, ArrowUpward, ArrowDownward,
} from "@mui/icons-material";
import {
  fetchPostalRecords, createPostalRecord, updatePostalRecord,
  deletePostalRecord, bulkDeletePostalRecords,
  setFilters, clearMessages, selectPostalFilters,
} from "../../../state/postalRecordSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLORS = {
  receive:  "#6D28D9",
  dispatch: "#7C3AED",
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
  "&:hover": { background: alpha(COLORS.receive, 0.07) },
  "&:last-child td": { border: 0 },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const SORT_OPTIONS = [
  { value: "date_desc",   label: "Newest First" },
  { value: "date_asc",    label: "Oldest First" },
  { value: "fromTo_asc",  label: "Title A–Z" },
  { value: "fromTo_desc", label: "Title Z–A" },
];

// ─── TypeBadge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const isReceive = type === "Receive";
  const color = isReceive ? COLORS.receive : COLORS.dispatch;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.5,
      px: 1.2, py: 0.35, borderRadius: 20,
      bgcolor: alpha(color, 0.1), border: `1px solid ${alpha(color, 0.25)}`,
    }}>
      {isReceive
        ? <MoveToInbox sx={{ fontSize: 12, color }} />
        : <LocalShipping sx={{ fontSize: 12, color }} />}
      <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, color }}>{type}</Typography>
    </Box>
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
function DetailDrawer({ record, open, onClose, onEdit }) {
  if (!record) return null;
  const isReceive = record.type === "Receive";
  const accentColor = isReceive ? COLORS.receive : COLORS.dispatch;

  const rows = [
    { label: isReceive ? "From Title" : "To Title", value: record.fromTo },
    { label: isReceive ? "To Title"   : "From Title", value: record.toTitle || "—" },
    { label: "Reference No",  value: record.referenceNo || "—" },
    { label: "Date",          value: fmtDate(record.date) },
    { label: "Address",       value: record.address || "—" },
    { label: "Note",          value: record.note || "—" },
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
        background: isReceive
          ? "linear-gradient(135deg,#0369a1,#0284c7)"
          : "linear-gradient(135deg,#6d28d9,#7c3aed)",
        p: 3, color: "#fff",
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 56, height: 56, bgcolor: alpha("#fff", 0.2), border: "2px solid rgba(255,255,255,0.4)", fontSize: "1.4rem" }}>
            {isReceive ? <MoveToInbox sx={{ fontSize: 26 }} /> : <LocalShipping sx={{ fontSize: 26 }} />}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={900} color="#fff">{record.fromTo}</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mt: 0.3 }}>
              {isReceive ? "Postal Receive" : "Postal Dispatch"}
            </Typography>
            <Box mt={0.8}><TypeBadge type={record.type} /></Box>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "text.secondary", fontSize: "0.68rem" }}>
          Record Details
        </Typography>
        <Stack spacing={0} mt={1.5}>
          {rows.map(({ label, value }) => (
            <Box key={label} sx={{ py: 1.3, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0 } }}>
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
        <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, px: 3 }}>Close</Button>
        <Button variant="contained" startIcon={<Edit />} onClick={() => { onEdit(record); onClose(); }}
          sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 800, px: 3, background: isReceive ? "linear-gradient(135deg,#0369a1,#0284c7)" : "linear-gradient(135deg,#6d28d9,#7c3aed)" }}>
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── FormDrawer ───────────────────────────────────────────────────────────────
function FormDrawer({ open, onClose, form, setForm, onSubmit, editId, submitLoading, recordType }) {
  const isReceive = recordType === "Receive";
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
        background: isReceive ? alpha(COLORS.receive, 0.05) : alpha(COLORS.dispatch, 0.05),
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              p: 1.2, borderRadius: 2.5,
              background: isReceive ? "linear-gradient(135deg,#0369a1,#0284c7)" : "linear-gradient(135deg,#6d28d9,#7c3aed)",
              boxShadow: `0 4px 12px ${alpha(isReceive ? COLORS.receive : COLORS.dispatch, 0.35)}`,
            }}>
              {editId ? <Edit sx={{ fontSize: 18, color: "#fff" }} /> : <Add sx={{ fontSize: 18, color: "#fff" }} />}
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={900} fontSize="1rem" lineHeight={1.1}>
                {editId ? `Edit ${recordType}` : `Add Postal ${recordType}`}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {editId ? "Update existing record" : `Log a new postal ${recordType.toLowerCase()}`}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small"><Clear /></IconButton>
        </Stack>
      </DialogTitle>

      {/* Form */}
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Grid2 container spacing={1.5} sx={{ pt: 1.5 }}>
            {/* Primary title */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small"
                label={`${isReceive ? "From Title" : "To Title"} *`}
                value={form.fromTo}
                onChange={(e) => upd("fromTo", e.target.value)}
                error={!form.fromTo} helperText={!form.fromTo ? "Required" : ""}
                sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Secondary title */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small"
                label={isReceive ? "To Title" : "From Title"}
                value={form.toTitle}
                onChange={(e) => upd("toTitle", e.target.value)}
                sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Reference No */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Reference No"
                value={form.referenceNo}
                onChange={(e) => upd("referenceNo", e.target.value)}
                sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><ConfirmationNumber sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Date */}
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" type="date" label="Date *"
                value={form.date}
                onChange={(e) => upd("date", e.target.value)}
                sx={sx}
                slotProps={{ inputLabel: { shrink: true }, input: { startAdornment: <InputAdornment position="start"><CalendarToday sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Address */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Address" multiline rows={2}
                value={form.address}
                onChange={(e) => upd("address", e.target.value)}
                sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}><LocationOn sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
              />
            </Grid2>

            {/* Note */}
            <Grid2 size={{ xs: 12 }}>
              <TextField fullWidth size="small" label="Note" multiline rows={3}
                value={form.note}
                onChange={(e) => upd("note", e.target.value)}
                placeholder="Additional notes…"
                sx={sx}
                slotProps={{ input: { startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}><Notes sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment> } }}
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
        <Button variant="contained" onClick={onSubmit}
          disabled={submitLoading || !form.fromTo}
          sx={{
            borderRadius: 2.5, textTransform: "none", fontWeight: 800, py: 1.1, px: 3,
            background: isReceive ? "linear-gradient(135deg,#0369a1,#0284c7)" : "linear-gradient(135deg,#6d28d9,#7c3aed)",
            boxShadow: `0 4px 16px ${alpha(isReceive ? COLORS.receive : COLORS.dispatch, 0.4)}`,
          }}>
          {submitLoading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : editId ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
// recordType prop: "Receive" | "Dispatch" | undefined (shows both with tab)
export default function PostalRecord({ recordType }) {
  const isReceivePage  = recordType === "Receive";
  const isDispatchPage = recordType === "Dispatch";
  const pageTitle = isReceivePage ? "Postal Receive" : isDispatchPage ? "Postal Dispatch" : "Postal Records";
  useDocumentTitle(pageTitle);

  const dispatch = useDispatch();
  const { records, stats, pagination, loading, submitLoading, error, successMsg } =
    useSelector((s) => s.postalRecord);
  const filters = useSelector(selectPostalFilters(recordType));

  // local UI — searchInput mirrors filters.search but updates immediately (debounced)
  const [searchInput,  setSearchInput]  = useState(filters.search);
  const [formOpen,     setFormOpen]     = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [editId,       setEditId]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selected,     setSelected]     = useState([]);
  const [form,         setForm]         = useState({
    fromTo: "", toTitle: "", referenceNo: "",
    date: new Date().toISOString().slice(0, 10),
    address: "", note: "",
  });
  const debounceRef = useRef(null);

  // Sync local searchInput when recordType changes (e.g. navigating Receive ↔ Dispatch)
  useEffect(() => {
    setSearchInput(filters.search);
  }, [recordType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── fetch ──────────────────────────────────────────────────────────────────
  const buildParams = useCallback((f) => {
    const p = { page: f.page, limit: f.limit, sortBy: f.sortBy };
    // If page-level recordType is set, always filter by it
    const typeFilter = recordType || (f.type !== "all" ? f.type : "");
    if (typeFilter) p.type = typeFilter;
    if (f.search) p.search = f.search;
    if (f.date)   p.date   = f.date;
    return p;
  }, [recordType]);

  const load = useCallback(() => {
    dispatch(fetchPostalRecords(buildParams(filters)));
  }, [dispatch, filters, buildParams]);

  useEffect(() => { load(); }, [load]);

  // auto-clear messages
  useEffect(() => {
    if (successMsg || error) {
      const t = setTimeout(() => dispatch(clearMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error, dispatch]);

  // ── search debounce — fires DB fetch after 400ms ──────────────────────────
  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => dispatch(setFilters({ recordType, search: val })),
      400
    );
  };

  const handleFilter = (key, val) =>
    dispatch(setFilters({ recordType, [key]: val }));

  const clearAll = () => {
    setSearchInput("");
    dispatch(setFilters({ recordType, search: "", type: "all", date: "", sortBy: "date_desc" }));
  };

  // ── form helpers ───────────────────────────────────────────────────────────
  const EMPTY = { fromTo: "", toTitle: "", referenceNo: "", date: new Date().toISOString().slice(0, 10), address: "", note: "" };

  const openAdd = () => { setEditId(null); setForm(EMPTY); setFormOpen(true); };

  const openEdit = (rec) => {
    setEditId(rec._id);
    setForm({
      fromTo:      rec.fromTo      || "",
      toTitle:     rec.toTitle     || "",
      referenceNo: rec.referenceNo || "",
      date:        rec.date ? new Date(rec.date).toISOString().slice(0, 10) : "",
      address:     rec.address     || "",
      note:        rec.note        || "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    const payload = { ...form, type: recordType || filters.type || "Receive" };
    const thunk = editId
      ? updatePostalRecord({ id: editId, data: payload })
      : createPostalRecord(payload);
    const res = await dispatch(thunk);
    if (!res.error) { setFormOpen(false); load(); }
  };

  const handleDelete = async (id) => {
    const res = await dispatch(deletePostalRecord(id));
    if (!res.error) { setDeleteTarget(null); load(); }
  };

  const handleBulkDelete = async () => {
    if (!selected.length) return;
    const res = await dispatch(bulkDeletePostalRecords(selected));
    if (!res.error) { setSelected([]); load(); }
  };

  const toggleSelect = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll    = () => setSelected(selected.length === records.length ? [] : records.map((r) => r._id));

  const activeCount = [filters.search, !recordType && filters.type !== "all", filters.date].filter(Boolean).length;

  const accentColor = isReceivePage ? COLORS.receive : isDispatchPage ? COLORS.dispatch : "#4C1D95";

  // ── stat cards ─────────────────────────────────────────────────────────────
  const STATS = isReceivePage ? [
    { label: "Total Received",  value: stats.receiveCount,  color: COLORS.receive,  icon: <MoveToInbox sx={{ fontSize: 20, color: COLORS.receive }} /> },
    { label: "Total Dispatched",value: stats.dispatchCount, color: COLORS.dispatch, icon: <LocalShipping sx={{ fontSize: 20, color: COLORS.dispatch }} /> },
    { label: "All Records",     value: stats.total,         color: "#4C1D95",       icon: <ArrowDownward sx={{ fontSize: 20, color: "#4C1D95" }} /> },
  ] : isDispatchPage ? [
    { label: "Total Dispatched",value: stats.dispatchCount, color: COLORS.dispatch, icon: <LocalShipping sx={{ fontSize: 20, color: COLORS.dispatch }} /> },
    { label: "Total Received",  value: stats.receiveCount,  color: COLORS.receive,  icon: <MoveToInbox sx={{ fontSize: 20, color: COLORS.receive }} /> },
    { label: "All Records",     value: stats.total,         color: "#4C1D95",       icon: <ArrowUpward sx={{ fontSize: 20, color: "#4C1D95" }} /> },
  ] : [
    { label: "All Records",     value: stats.total,         color: "#4C1D95",       icon: <Notes sx={{ fontSize: 20, color: "#4C1D95" }} /> },
    { label: "Received",        value: stats.receiveCount,  color: COLORS.receive,  icon: <MoveToInbox sx={{ fontSize: 20, color: COLORS.receive }} /> },
    { label: "Dispatched",      value: stats.dispatchCount, color: COLORS.dispatch, icon: <LocalShipping sx={{ fontSize: 20, color: COLORS.dispatch }} /> },
  ];

  // ── table columns ──────────────────────────────────────────────────────────
  const primaryLabel   = isReceivePage ? "From Title" : "To Title";
  const secondaryLabel = isReceivePage ? "To Title"   : "From Title";

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, minHeight: "100vh", bgcolor: COLORS.bg }}>
      {/* ── Header ── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(accentColor, 0.1) }}>
              {isReceivePage
                ? <MoveToInbox sx={{ fontSize: 24, color: accentColor }} />
                : <LocalShipping sx={{ fontSize: 24, color: accentColor }} />}
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: accentColor, letterSpacing: -0.5 }}>
                {pageTitle}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isReceivePage ? "Track all incoming postal items" : isDispatchPage ? "Track all outgoing postal items" : "Manage all postal records"}
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
              background: isReceivePage
                ? "linear-gradient(135deg,#0369a1,#0284c7)"
                : isDispatchPage
                  ? "linear-gradient(135deg,#6d28d9,#7c3aed)"
                  : "linear-gradient(135deg,#4C1D95,#7C3AED)",
              boxShadow: `0 4px 16px ${alpha(accentColor, 0.4)}`,
              "&:hover": { boxShadow: `0 6px 24px ${alpha(accentColor, 0.55)}` },
            }}>
            Add {isReceivePage ? "Receive" : isDispatchPage ? "Dispatch" : "Record"}
          </Button>
        </Stack>
      </Stack>

      {/* ── Stat Cards ── */}
      <Grid2 container spacing={2} mb={3}>
        {STATS.map((s) => (
          <Grid2 key={s.label} size={{ xs: 12, sm: 4 }}>
            <StatCard {...s} loading={loading} />
          </Grid2>
        ))}
      </Grid2>

      {/* ── Toolbar ── */}
      <GlassCard elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Grid2 container spacing={1.5} alignItems="center">
          {/* Search */}
          <Grid2 size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" placeholder="Search title, reference, address…"
              value={searchInput} onChange={(e) => handleSearch(e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: alpha(accentColor, 0.03) } }}
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

          {/* Type filter — only show when not on a specific type page */}
          {!recordType && (
            <Grid2 size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filters.type} onChange={(e) => handleFilter("type", e.target.value)} label="Type"
                  sx={{ borderRadius: 2.5 }}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Receive">Receive</MenuItem>
                  <MenuItem value="Dispatch">Dispatch</MenuItem>
                </Select>
              </FormControl>
            </Grid2>
          )}

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

        {/* Active chips */}
        {activeCount > 0 && (
          <Stack direction="row" spacing={1} mt={1.5} flexWrap="wrap" gap={0.5} alignItems="center">
            <Typography variant="caption" color="text.secondary" fontWeight={700}>Active:</Typography>
            {filters.search && <Chip size="small" label={`Search: "${filters.search}"`} onDelete={() => handleSearch("")} sx={{ height: 22, fontSize: "0.72rem" }} />}
            {!recordType && filters.type !== "all" && <Chip size="small" label={`Type: ${filters.type}`} onDelete={() => handleFilter("type", "all")} sx={{ height: 22, fontSize: "0.72rem" }} />}
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
              <TableRow sx={{ bgcolor: alpha(accentColor, 0.04) }}>
                <TableCell padding="checkbox">
                  <Checkbox size="small"
                    checked={records.length > 0 && selected.length === records.length}
                    indeterminate={selected.length > 0 && selected.length < records.length}
                    onChange={toggleAll} />
                </TableCell>
                {[primaryLabel, "Reference No", secondaryLabel, "Date", "Address", "Note", !recordType && "Type", "Actions"]
                  .filter(Boolean)
                  .map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 800, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "text.secondary", whiteSpace: "nowrap", py: 1.5 }}>
                      {h}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 6 }}>
                      {isReceivePage
                        ? <MoveToInbox sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />
                        : <LocalShipping sx={{ fontSize: 52, color: "text.disabled", mb: 1 }} />}
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>No records found</Typography>
                      {activeCount > 0 && <Typography variant="caption" color="text.disabled">Try clearing the filters</Typography>}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                records.map((rec) => (
                  <HoverRow key={rec._id} selected={selected.includes(rec._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" checked={selected.includes(rec._id)} onChange={() => toggleSelect(rec._id)} />
                    </TableCell>

                    {/* Primary title */}
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: alpha(accentColor, 0.12), color: accentColor, fontSize: 12, fontWeight: 800 }}>
                          {rec.fromTo?.[0]?.toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={700} sx={{ color: accentColor }}>{rec.fromTo}</Typography>
                      </Stack>
                    </TableCell>

                    {/* Reference No */}
                    <TableCell>
                      {rec.referenceNo
                        ? <Chip icon={<ConfirmationNumber sx={{ fontSize: 12 }} />} label={rec.referenceNo} size="small" variant="outlined" sx={{ height: 22, fontSize: "0.72rem" }} />
                        : <Typography variant="caption" color="text.disabled">—</Typography>}
                    </TableCell>

                    {/* Secondary title */}
                    <TableCell>
                      <Typography variant="body2">{rec.toTitle || "—"}</Typography>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{fmtDate(rec.date)}</Typography>
                    </TableCell>

                    {/* Address */}
                    <TableCell sx={{ maxWidth: 140 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>{rec.address || "—"}</Typography>
                    </TableCell>

                    {/* Note */}
                    <TableCell sx={{ maxWidth: 140 }}>
                      <Typography variant="caption" color="text.secondary" noWrap>{rec.note || "—"}</Typography>
                    </TableCell>

                    {/* Type badge — only on combined view */}
                    {!recordType && (
                      <TableCell><TypeBadge type={rec.type} /></TableCell>
                    )}

                    {/* Actions */}
                    <TableCell>
                      <Stack direction="row" spacing={0.3}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => setDetailRecord(rec)}
                            sx={{ color: "text.disabled", "&:hover": { color: accentColor, bgcolor: alpha(accentColor, 0.08) } }}>
                            <Visibility sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(rec)}
                            sx={{ color: "text.disabled", "&:hover": { color: accentColor, bgcolor: alpha(accentColor, 0.08) } }}>
                            <Edit sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteTarget(rec._id)}
                            sx={{ color: "text.disabled", "&:hover": { color: "#dc2626", bgcolor: alpha("#dc2626", 0.08) } }}>
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
        {!loading && records.length > 0 && (
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
                    onChange={(e) => dispatch(setFilters({ recordType, limit: Number(e.target.value) }))}
                    sx={{ fontSize: "0.8rem", minWidth: 70, borderRadius: 2 }}>
                    {[5, 10, 20, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                  </Select>
                </Stack>
                <Pagination count={pagination.pages} page={filters.page}
                  onChange={(_, p) => dispatch(setFilters({ recordType, page: p }))}
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
        recordType={recordType || filters.type || "Receive"}
      />

      <DetailDrawer record={detailRecord} open={Boolean(detailRecord)}
        onClose={() => setDetailRecord(null)} onEdit={openEdit} />

      {/* ── Delete Confirm ── */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}
        PaperProps={{ sx: { borderRadius: 4, p: 1, maxWidth: 360 } }}>
        <DialogTitle fontWeight={900}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha("#dc2626", 0.1) }}>
              <Delete sx={{ color: "#dc2626", fontSize: 20 }} />
            </Box>
            Delete Record
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this postal record? This action cannot be undone.
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