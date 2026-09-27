import { useEffect, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Paper, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  CircularProgress, Card, CardContent, Tabs, Tab, Stack, Avatar,
  Tooltip, Badge, InputAdornment, Select, FormControl, InputLabel,
  Alert, Snackbar, LinearProgress, Pagination, PaginationItem,
  Collapse,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import { alpha, styled, keyframes } from "@mui/material/styles";
import {
  Add, Edit, Delete, Logout as LogoutIcon, Search, PersonAdd,
  ExitToApp, CheckCircle, Schedule, People, Group, Phone, Email,
  Badge as BadgeIcon, DirectionsCar, Thermostat, LocationOn, Clear,
  TuneRounded, FilterAltOff, AccessTime, KeyboardArrowRight,
  VisibilityOff, HowToReg, ManageAccounts, Bookmark, Close as CloseIcon,
} from "@mui/icons-material";
import {
  fetchVisitors, fetchVisitorStats, addVisitor, updateVisitor,
  checkoutVisitor, deleteVisitor, setFilters, clearMessages, selectVisitorFilters,
} from "../../../state/visitorBookSlice";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  blue:      "#7C3AED",
  blueLight: "#F5F3FF",
  blueDark:  "#5B21B6",
  purple:    "#7C3AED",
  purpleDark:"#6D28D9",
  green:     "#047857",
  greenLight:"#ecfdf5",
  amber:     "#7C3AED",
  amberLight:"#F5F3FF",
  red:       "#dc2626",
  redLight:  "#fef2f2",
  violet:    "#6D28D9",
  violetLight:"#EDE9FE",
  slate50:   "#FAFAFF",
  slate100:  "#F5F3FF",
  slate200:  "#EDE9FE",
  slate300:  "#DDD6FE",
  slate400:  "#94a3b8",
  slate500:  "#64748b",
  slate600:  "#475569",
  slate700:  "#334155",
  slate800:  "#1e293b",
  slate900:  "#2E1065",
  white:     "#ffffff",
  surface:   "#ffffff",
};

const R = { xs: "8px", sm: "10px", md: "14px", lg: "18px" };
const FONT = "'DM Sans', 'Segoe UI', sans-serif";

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`;
const shimmer = keyframes`
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
`;

// ─── Styled ───────────────────────────────────────────────────────────────────
const PageWrap = styled(Box)({
  padding: "clamp(12px, 3vw, 28px) clamp(12px, 4vw, 32px)",
  background: C.slate50,
  minHeight: "100vh",
  fontFamily: FONT,
  animation: `${fadeUp} 0.4s ease both`,
});

const SurfaceCard = styled(Paper)({
  background: C.white,
  borderRadius: R.md,
  border: `1px solid ${C.slate200}`,
  boxShadow: "0 1px 3px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.04)",
  overflow: "hidden",
});

const GlassHeader = styled(Box)({
  background: `linear-gradient(135deg, ${C.slate900} 0%, #4C1D95 50%, ${C.blueDark} 100%)`,
  borderRadius: R.lg,
  padding: "28px 32px",
  position: "relative",
  overflow: "hidden",
  marginBottom: 24,
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse at 70% 50%, ${alpha(C.blue, 0.35)} 0%, transparent 60%)`,
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: -40, right: -40,
    width: 180, height: 180,
    borderRadius: "50%",
    border: `1px solid ${alpha(C.white, 0.06)}`,
    pointerEvents: "none",
  },
});

const StatBox = styled(Card)(({ accent = C.blue }) => ({
  background: C.white,
  borderRadius: R.md,
  border: `1px solid ${C.slate200}`,
  boxShadow: "none",
  overflow: "hidden",
  position: "relative",
  transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
  cursor: "default",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `0 8px 24px ${alpha(accent, 0.15)}, 0 2px 8px rgba(15,23,42,0.06)`,
    borderColor: alpha(accent, 0.3),
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    height: 3,
    background: accent,
    borderRadius: "0 0 14px 14px",
  },
}));

const StyledTab = styled(Tab)({
  fontFamily: FONT,
  fontWeight: 600,
  fontSize: "0.8125rem",
  textTransform: "none",
  letterSpacing: "-0.01em",
  minHeight: 48,
  color: C.slate500,
  padding: "0 20px",
  "&.Mui-selected": { color: C.blue, fontWeight: 700 },
  "&:hover": { color: C.slate700 },
});

const HeadCell = styled(TableCell)({
  fontFamily: FONT,
  fontWeight: 700,
  fontSize: "0.68rem",
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: C.slate500,
  background: C.slate50,
  borderBottom: `2px solid ${C.slate200}`,
  padding: "11px 16px",
  whiteSpace: "nowrap",
  "&:first-of-type": { paddingLeft: 24 },
});

const BodyCell = styled(TableCell)({
  fontFamily: FONT,
  borderBottom: `1px solid ${C.slate100}`,
  padding: "13px 16px",
  verticalAlign: "middle",
  "&:first-of-type": { paddingLeft: 24 },
});

const ActionBtn = styled(IconButton)(({ variant: v }) => ({
  borderRadius: R.sm,
  padding: 6,
  border: `1px solid ${v === "danger" ? alpha(C.red, 0.2) : v === "checkout" ? alpha(C.amber, 0.25) : C.slate200}`,
  color: v === "danger" ? C.red : v === "checkout" ? C.amber : C.slate500,
  background: "transparent",
  transition: "all 0.18s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    background: v === "danger" ? alpha(C.red, 0.06) : v === "checkout" ? alpha(C.amber, 0.08) : alpha(C.blue, 0.06),
    borderColor: v === "danger" ? alpha(C.red, 0.45) : v === "checkout" ? alpha(C.amber, 0.5) : alpha(C.blue, 0.35),
    color: v === "danger" ? C.red : v === "checkout" ? C.amber : C.blue,
    boxShadow: v === "danger" ? `0 4px 12px ${alpha(C.red, 0.15)}` : v === "checkout" ? `0 4px 12px ${alpha(C.amber, 0.15)}` : `0 4px 12px ${alpha(C.blue, 0.12)}`,
  },
}));

const PrimaryBtn = styled(Button)({
  fontFamily: FONT,
  borderRadius: R.sm,
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.875rem",
  letterSpacing: "-0.01em",
  padding: "9px 20px",
  background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`,
  boxShadow: `0 2px 8px ${alpha(C.purple, 0.3)}`,
  transition: "all 0.2s ease",
  "&:hover": {
    background: `linear-gradient(135deg, #8B2FDB 0%, #6D28D9 100%)`,
    boxShadow: `0 6px 18px ${alpha(C.purple, 0.4)}`,
    transform: "translateY(-1px)",
  },
});

const FilterPill = styled(Box)(({ active }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 12px",
  borderRadius: 20,
  fontSize: "0.72rem",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.15s",
  background: active ? alpha(C.blue, 0.1) : C.slate100,
  color: active ? C.blue : C.slate500,
  border: `1px solid ${active ? alpha(C.blue, 0.25) : "transparent"}`,
  "&:hover": { background: alpha(C.blue, 0.08), color: C.blue },
}));

const InputSx = {
  "& .MuiOutlinedInput-root": {
    fontFamily: FONT,
    fontSize: "0.875rem",
    borderRadius: R.sm,
    background: C.white,
    "& fieldset": { borderColor: C.slate200 },
    "&:hover fieldset": { borderColor: C.slate300 },
    "&.Mui-focused fieldset": { borderColor: C.blue, borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root": { fontFamily: FONT, fontSize: "0.875rem" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const calcDuration = (inT, outT) => {
  if (!inT || !outT) return null;
  const diff = new Date(outT) - new Date(inT);
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const AVATAR_GRADIENTS = [
  `linear-gradient(135deg, #7C3AED, #6366f1)`,
  `linear-gradient(135deg, #047857, #0d9488)`,
  `linear-gradient(135deg, #5B21B6, #7C3AED)`,
  `linear-gradient(135deg, #6D28D9, #a855f7)`,
  `linear-gradient(135deg, #dc2626, #f43f5e)`,
];
const avatarGrad = (name) => AVATAR_GRADIENTS[(name?.charCodeAt(0) || 0) % AVATAR_GRADIENTS.length];

// ─── Status Pill ──────────────────────────────────────────────────────────────
const STATUS_MAP = {
  In:        { color: C.green,  bg: C.greenLight,  dot: C.green,  label: "Active" },
  Out:       { color: C.slate500, bg: C.slate100,  dot: C.slate400, label: "Checked Out" },
  Cancelled: { color: C.red,    bg: C.redLight,    dot: C.red,    label: "Cancelled" },
};

const StatusPill = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.Out;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.6,
      px: 1.25, py: 0.4,
      borderRadius: 20,
      bgcolor: s.bg,
      color: s.color,
      fontWeight: 700, fontSize: "0.7rem",
      letterSpacing: "0.02em",
      border: `1px solid ${alpha(s.dot, 0.2)}`,
    }}>
      <Box sx={{
        width: 5.5, height: 5.5, borderRadius: "50%", bgcolor: s.dot,
        ...(status === "In" && {
          animation: `${pulse} 2s ease-in-out infinite`,
          boxShadow: `0 0 0 2px ${alpha(s.dot, 0.25)}`,
        }),
      }} />
      {s.label}
    </Box>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({ hasFilters }) => (
  <Box sx={{ py: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
    <Box sx={{
      width: 72, height: 72, borderRadius: R.lg,
      background: `linear-gradient(135deg, ${alpha(C.purple, 0.08)}, ${alpha(C.violet, 0.08)})`,
      border: `2px dashed ${C.slate200}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <HowToReg sx={{ fontSize: 30, color: C.slate400 }} />
    </Box>
    <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9375rem", color: C.slate700 }}>
      No visitors found
    </Typography>
    <Typography sx={{ fontFamily: FONT, fontSize: "0.8125rem", color: C.slate400, textAlign: "center", maxWidth: 280 }}>
      {hasFilters ? "Try adjusting your filters to see more results" : "Add a new visitor to get started tracking"}
    </Typography>
  </Box>
);

const EMPTY_FORM = {
  visitorName: "", phone: "", email: "", idCard: "", idCardType: "Aadhar",
  numberOfPersons: 1, purpose: "", meetingWith: "Teacher",
  meetingPersonName: "", vehicleNumber: "", temperature: "", address: "", note: "",
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function VisitorBook() {
  useDocumentTitle("Visitor Book");
  const dispatch = useDispatch();

  const { visitors, stats, loading, submitLoading, error, successMsg, pagination, purposeOptions } =
    useSelector((s) => s.visitorBook);
  const filters = useSelector(selectVisitorFilters);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [checkoutForm, setCheckoutForm] = useState({ outTime: "", note: "" });
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef(null);

  const buildParams = useCallback((f) => {
    const p = { page: f.page, limit: f.limit };
    if (f.tab === 1) p.status = "In";
    if (f.tab === 2) p.status = "Out";
    if (f.status)      p.status     = f.status;
    if (f.search)      p.search     = f.search;
    if (f.meetingWith) p.meetingWith = f.meetingWith;
    if (f.date)        p.date       = f.date;
    return p;
  }, []);

  const load = useCallback(() => {
    dispatch(fetchVisitors(buildParams(filters)));
    dispatch(fetchVisitorStats());
  }, [dispatch, filters, buildParams]);

  useEffect(() => { 
    console.log("Loading visitors and stats..."); // Debug log
    load(); 
  }, [load]);

  // Debug: Log stats when it changes
  useEffect(() => {
    console.log("Stats updated:", stats);
  }, [stats]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setFilters({ search: value }));
    }, 400);
  };

  const handleFilterChange = (key, value) => dispatch(setFilters({ [key]: value }));

  const handleTabChange = (_, newTab) =>
    dispatch(setFilters({ tab: newTab, status: "" }));

  const clearAllFilters = () => {
    setSearchInput("");
    dispatch(setFilters({ search: "", status: "", meetingWith: "", date: "", tab: 0 }));
  };

  useEffect(() => {
    if (successMsg || error) {
      console.log("Message received - Success:", successMsg, "Error:", error); // Debug log
      const t = setTimeout(() => dispatch(clearMessages()), 3500);
      return () => clearTimeout(t);
    }
  }, [successMsg, error, dispatch]);

  const openAdd  = () => { setSelected(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (v) => {
    setSelected(v);
    setForm({
      visitorName: v.visitorName || "", phone: v.phone || "", email: v.email || "",
      idCard: v.idCard || "", idCardType: v.idCardType || "Aadhar",
      numberOfPersons: v.numberOfPersons || 1, purpose: v.purpose || "",
      meetingWith: v.meetingWith || "Teacher", meetingPersonName: v.meetingPersonName || "",
      vehicleNumber: v.vehicleNumber || "", temperature: v.temperature || "",
      address: v.address || "", note: v.note || "",
    });
    setDialogOpen(true);
  };
  const openCheckout = (v) => {
    setSelected(v);
    setCheckoutForm({ outTime: new Date().toISOString().slice(0, 16), note: "" });
    setCheckoutOpen(true);
  };

  const handleSave = async () => {
    if (!form.visitorName.trim() || !form.purpose.trim() || !form.meetingWith) return;
    const payload = {
      ...form,
      numberOfPersons: Number(form.numberOfPersons) || 1,
      temperature: form.temperature !== "" ? Number(form.temperature) : undefined,
    };
    const thunk = selected
      ? updateVisitor({ id: selected._id, data: payload })
      : addVisitor(payload);
    const result = await dispatch(thunk);
    console.log("Save result:", result); // Debug log
    if (!result.error) { 
      setDialogOpen(false); 
      load(); 
    }
  };

  const handleCheckout = async () => {
    const result = await dispatch(checkoutVisitor({ id: selected._id, data: checkoutForm }));
    if (!result.error) { setCheckoutOpen(false); load(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this visitor record?")) return;
    await dispatch(deleteVisitor(id));
    load();
  };

  const activeCount = [filters.search, filters.status, filters.meetingWith, filters.date]
    .filter(Boolean).length;

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const STATS = [
    { label: "Total Visitors",  value: stats?.totalVisitors ?? stats?.summary?.totalVisitors ?? 0,  icon: People,     accent: C.blue,   iconBg: alpha(C.blue, 0.09),   iconColor: C.blue   },
    { label: "Currently In",    value: stats?.currentlyIn ?? stats?.summary?.currentlyIn ?? 0,    icon: CheckCircle, accent: C.green,  iconBg: alpha(C.green, 0.09),  iconColor: C.green  },
    { label: "Checked Out",     value: stats?.checkedOut ?? stats?.summary?.checkedOut ?? 0,     icon: ExitToApp,  accent: C.violet, iconBg: alpha(C.violet, 0.09), iconColor: C.violet },
    { label: "Total Persons",   value: stats?.totalPersons ?? stats?.summary?.totalPersons ?? 0,   icon: Group,      accent: C.amber,  iconBg: alpha(C.amber, 0.09),  iconColor: C.amber  },
  ];

  return (
    <PageWrap>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5} mb={3}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(C.purple, 0.1) }}>
              <Bookmark sx={{ fontSize: 24, color: C.purple }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: C.purple, letterSpacing: -0.5 }}>
                Visitor Book
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time visitor tracking & management
              </Typography>
            </Box>
          </Stack>
        </Box>
        <PrimaryBtn
          variant="contained"
          startIcon={<Add />}
          onClick={openAdd}
        >
          Add Visitor
        </PrimaryBtn>
      </Stack>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <Grid2 container spacing={2} sx={{ mb: 3 }}>
        {STATS.map(({ label, value, icon: Icon, accent, iconBg, iconColor }, i) => (
          <Grid2 key={label} size={{ xs: 6, sm: 6, md: 3 }}
            sx={{ animation: `${fadeUp} 0.4s ease ${i * 0.06}s both` }}
          >
            <StatBox accent={accent}>
              <CardContent sx={{ p: "18px 20px !important" }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box>
                    <Typography sx={{
                      fontFamily: FONT, fontSize: "0.7rem", fontWeight: 700,
                      color: C.slate400, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.75,
                    }}>
                      {label}
                    </Typography>
                    <Typography sx={{
                      fontFamily: FONT, fontSize: "2.25rem", fontWeight: 900,
                      color: C.slate900, lineHeight: 1, letterSpacing: "-0.04em",
                    }}>
                      {value}
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: 42, height: 42, borderRadius: R.sm,
                    bgcolor: iconBg, display: "flex",
                    alignItems: "center", justifyContent: "center", color: iconColor,
                    flexShrink: 0,
                  }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </Box>
                </Stack>
              </CardContent>
            </StatBox>
          </Grid2>
        ))}
      </Grid2>

      {/* ── Search + Filters ─────────────────────────────────────────────── */}
      <SurfaceCard sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
            <TextField
              sx={{ flex: 1, ...InputSx }}
              size="small"
              placeholder="Search by name, phone, email, ID card…"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {loading && filters.search
                        ? <CircularProgress size={14} sx={{ color: C.blue }} />
                        : <Search sx={{ fontSize: 17, color: C.slate400 }} />}
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => handleSearchChange("")}
                        sx={{ p: 0.4, color: C.slate400, "&:hover": { color: C.slate700 } }}>
                        <Clear sx={{ fontSize: 14 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            <Stack direction="row" spacing={1}>
              <Badge badgeContent={activeCount} color="error" invisible={activeCount === 0}
                sx={{ "& .MuiBadge-badge": { fontSize: "0.6rem", minWidth: 16, height: 16 } }}>
                <Button
                  size="small"
                  onClick={() => setShowFilters((v) => !v)}
                  startIcon={<TuneRounded sx={{ fontSize: 15 }} />}
                  sx={{
                    fontFamily: FONT, borderRadius: R.sm, textTransform: "none",
                    fontWeight: 700, fontSize: "0.8125rem",
                    borderColor: showFilters ? C.blue : C.slate200,
                    color: showFilters ? C.blue : C.slate600,
                    background: showFilters ? alpha(C.blue, 0.06) : "transparent",
                    border: `1px solid ${showFilters ? alpha(C.blue, 0.3) : C.slate200}`,
                    "&:hover": { background: alpha(C.blue, 0.05), borderColor: alpha(C.blue, 0.3) },
                  }}
                >
                  Filters
                </Button>
              </Badge>

              {activeCount > 0 && (
                <Button
                  size="small"
                  startIcon={<FilterAltOff sx={{ fontSize: 14 }} />}
                  onClick={clearAllFilters}
                  sx={{
                    fontFamily: FONT, borderRadius: R.sm, textTransform: "none",
                    fontWeight: 600, fontSize: "0.8125rem",
                    color: C.red, border: `1px solid ${alpha(C.red, 0.2)}`,
                    "&:hover": { background: alpha(C.red, 0.05), borderColor: alpha(C.red, 0.4) },
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Expanded filters */}
          <Collapse in={showFilters}>
            <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${C.slate100}` }}>
              <Grid2 container spacing={1.5}>
                <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                  <FormControl fullWidth size="small" sx={InputSx}>
                    <InputLabel>Status</InputLabel>
                    <Select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} label="Status">
                      <MenuItem value="" sx={{ fontFamily: FONT }}>All Statuses</MenuItem>
                      <MenuItem value="In"  sx={{ fontFamily: FONT }}>In</MenuItem>
                      <MenuItem value="Out" sx={{ fontFamily: FONT }}>Out</MenuItem>
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                  <FormControl fullWidth size="small" sx={InputSx}>
                    <InputLabel>Meeting With</InputLabel>
                    <Select value={filters.meetingWith} onChange={(e) => handleFilterChange("meetingWith", e.target.value)} label="Meeting With">
                      <MenuItem value="" sx={{ fontFamily: FONT }}>All</MenuItem>
                      {["Student", "Teacher", "Principal", "Staff", "Other"].map((o) => (
                        <MenuItem key={o} value={o} sx={{ fontFamily: FONT }}>{o}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 4, md: 3 }}>
                  <TextField fullWidth size="small" type="date" label="Date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={InputSx}
                  />
                </Grid2>
              </Grid2>
            </Box>
          </Collapse>

          {/* Active filter chips */}
          {activeCount > 0 && (
            <Stack direction="row" spacing={0.75} mt={1.75} flexWrap="wrap" alignItems="center">
              <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 700, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Filters:
              </Typography>
              {filters.search && (
                <Chip size="small" label={`"${filters.search}"`}
                  onDelete={() => handleSearchChange("")}
                  sx={{ height: 22, fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, bgcolor: alpha(C.blue, 0.08), color: C.blue, border: `1px solid ${alpha(C.blue, 0.2)}`, "& .MuiChip-deleteIcon": { color: C.blue, fontSize: 13 } }}
                />
              )}
              {filters.status && (
                <Chip size="small" label={filters.status}
                  onDelete={() => handleFilterChange("status", "")}
                  sx={{ height: 22, fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, bgcolor: alpha(C.green, 0.08), color: C.green, border: `1px solid ${alpha(C.green, 0.2)}`, "& .MuiChip-deleteIcon": { color: C.green, fontSize: 13 } }}
                />
              )}
              {filters.meetingWith && (
                <Chip size="small" label={`Meets: ${filters.meetingWith}`}
                  onDelete={() => handleFilterChange("meetingWith", "")}
                  sx={{ height: 22, fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, bgcolor: alpha(C.violet, 0.08), color: C.violet, border: `1px solid ${alpha(C.violet, 0.2)}`, "& .MuiChip-deleteIcon": { color: C.violet, fontSize: 13 } }}
                />
              )}
              {filters.date && (
                <Chip size="small" label={`Date: ${filters.date}`}
                  onDelete={() => handleFilterChange("date", "")}
                  sx={{ height: 22, fontFamily: FONT, fontSize: "0.7rem", fontWeight: 600, borderRadius: 20, bgcolor: alpha(C.amber, 0.08), color: C.amber, border: `1px solid ${alpha(C.amber, 0.2)}`, "& .MuiChip-deleteIcon": { color: C.amber, fontSize: 13 } }}
                />
              )}
            </Stack>
          )}
        </Box>
      </SurfaceCard>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <SurfaceCard sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: `1px solid ${C.slate100}` }}>
          <Tabs
            value={filters.tab}
            onChange={handleTabChange}
            sx={{
              px: 1, minHeight: 48,
              "& .MuiTabs-indicator": {
                height: 2.5, borderRadius: "2px 2px 0 0",
                backgroundColor: C.blue,
              },
            }}
          >
            <StyledTab label="All Visitors" />
            <StyledTab
              label={
                <Stack direction="row" alignItems="center" spacing={0.75}>
                  <span>Currently In</span>
                  {((stats?.currentlyIn ?? stats?.summary?.currentlyIn ?? 0) > 0) && (
                    <Box sx={{
                      background: `linear-gradient(135deg, ${C.green}, #059669)`,
                      color: C.white,
                      fontSize: "0.6rem", fontWeight: 800,
                      borderRadius: 20, px: 0.85, py: 0.1, lineHeight: 1.7,
                      minWidth: 20, textAlign: "center",
                    }}>
                      {stats?.currentlyIn ?? stats?.summary?.currentlyIn ?? 0}
                    </Box>
                  )}
                </Stack>
              }
            />
            <StyledTab label="Checked Out" />
          </Tabs>
        </Box>
        {loading && (
          <LinearProgress sx={{
            height: 2,
            backgroundColor: C.slate100,
            "& .MuiLinearProgress-bar": { background: `linear-gradient(90deg, ${C.purple}, #a855f7)` },
          }} />
        )}
      </SurfaceCard>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <SurfaceCard>
        {loading && visitors.length === 0 ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, p: 8 }}>
            <CircularProgress size={36} thickness={4} sx={{ color: C.blue }} />
            <Typography sx={{ fontFamily: FONT, fontSize: "0.8125rem", color: C.slate400, fontWeight: 600 }}>
              Loading visitors…
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {["Visitor", "Contact", "Purpose", "Meeting With", "Date", "In", "Out", "Duration", "Persons", "Status", "Actions"]
                    .map((h) => <HeadCell key={h}>{h}</HeadCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {visitors.length === 0 ? (
                  <TableRow>
                    <BodyCell colSpan={11}>
                      <EmptyState hasFilters={activeCount > 0} />
                    </BodyCell>
                  </TableRow>
                ) : (
                  visitors.map((v, idx) => {
                    const duration = calcDuration(v.inTime, v.outTime);
                    return (
                      <TableRow
                        key={v._id}
                        hover
                        sx={{
                          bgcolor: idx % 2 === 0 ? C.white : C.slate50,
                          "&:hover": { bgcolor: alpha(C.blue, 0.025) },
                          "&:hover td": { borderColor: alpha(C.blue, 0.06) },
                          transition: "background 0.15s ease",
                        }}
                      >
                        {/* Visitor */}
                        <BodyCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar sx={{
                              width: 34, height: 34, flexShrink: 0,
                              background: avatarGrad(v.visitorName),
                              fontSize: "0.875rem", fontWeight: 800,
                              boxShadow: `0 2px 8px ${alpha(C.blue, 0.2)}`,
                            }}>
                              {v.visitorName?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontFamily: FONT, fontSize: "0.8375rem", fontWeight: 700, color: C.slate800, lineHeight: 1.3 }}>
                                {v.visitorName}
                              </Typography>
                              {v.idCard && (
                                <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: C.slate400 }}>
                                  {v.idCardType}: {v.idCard}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </BodyCell>

                        {/* Contact */}
                        <BodyCell>
                          <Stack spacing={0.5}>
                            {v.phone && (
                              <Stack direction="row" alignItems="center" spacing={0.6}>
                                <Phone sx={{ fontSize: 11, color: C.slate400 }} />
                                <Typography sx={{ fontFamily: FONT, fontSize: "0.77rem", color: C.slate600 }}>{v.phone}</Typography>
                              </Stack>
                            )}
                            {v.email && (
                              <Stack direction="row" alignItems="center" spacing={0.6}>
                                <Email sx={{ fontSize: 11, color: C.slate400 }} />
                                <Typography sx={{ fontFamily: FONT, fontSize: "0.77rem", color: C.slate600 }}>{v.email}</Typography>
                              </Stack>
                            )}
                            {!v.phone && !v.email && (
                              <Typography sx={{ fontFamily: FONT, fontSize: "0.77rem", color: C.slate300 }}>—</Typography>
                            )}
                          </Stack>
                        </BodyCell>

                        {/* Purpose */}
                        <BodyCell sx={{ maxWidth: 150 }}>
                          <Tooltip title={v.purpose} placement="top" arrow>
                            <Typography sx={{
                              fontFamily: FONT, fontSize: "0.8125rem", color: C.slate700,
                              overflow: "hidden", textOverflow: "ellipsis",
                              whiteSpace: "nowrap", maxWidth: 140,
                            }}>
                              {v.purpose}
                            </Typography>
                          </Tooltip>
                        </BodyCell>

                        {/* Meeting With */}
                        <BodyCell>
                          <Box sx={{
                            display: "inline-block",
                            px: 1.25, py: 0.3,
                            borderRadius: R.sm,
                            border: `1px solid ${C.slate200}`,
                            fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700,
                            color: C.slate600, bgcolor: C.slate50,
                          }}>
                            {v.meetingWith}
                          </Box>
                          {v.meetingPersonName && (
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.7rem", color: C.slate400, mt: 0.3 }}>
                              {v.meetingPersonName}
                            </Typography>
                          )}
                        </BodyCell>

                        {/* Date */}
                        <BodyCell>
                          <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: C.slate500, whiteSpace: "nowrap" }}>
                            {fmtDate(v.date)}
                          </Typography>
                        </BodyCell>

                        {/* In Time */}
                        <BodyCell>
                          <Box sx={{
                            display: "inline-flex", alignItems: "center", gap: 0.5,
                            px: 1, py: 0.3, borderRadius: 20,
                            bgcolor: C.greenLight,
                            border: `1px solid ${alpha(C.green, 0.2)}`,
                            fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: C.green,
                          }}>
                            <AccessTime sx={{ fontSize: 11 }} />
                            {fmtTime(v.inTime)}
                          </Box>
                        </BodyCell>

                        {/* Out Time */}
                        <BodyCell>
                          {v.outTime ? (
                            <Box sx={{
                              display: "inline-flex", alignItems: "center", gap: 0.5,
                              px: 1, py: 0.3, borderRadius: 20,
                              bgcolor: C.slate100,
                              border: `1px solid ${C.slate200}`,
                              fontFamily: FONT, fontSize: "0.72rem", fontWeight: 700, color: C.slate500,
                            }}>
                              <ExitToApp sx={{ fontSize: 11 }} />
                              {fmtTime(v.outTime)}
                            </Box>
                          ) : (
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.77rem", color: C.slate300 }}>—</Typography>
                          )}
                        </BodyCell>

                        {/* Duration */}
                        <BodyCell>
                          {duration ? (
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", fontWeight: 700, color: C.slate700 }}>
                              {duration}
                            </Typography>
                          ) : (
                            <Typography sx={{ fontFamily: FONT, fontSize: "0.77rem", color: C.slate300 }}>—</Typography>
                          )}
                        </BodyCell>

                        {/* Persons */}
                        <BodyCell>
                          <Box sx={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 28, height: 28, borderRadius: R.sm,
                            bgcolor: alpha(C.blue, 0.08), border: `1px solid ${alpha(C.blue, 0.15)}`,
                            fontFamily: FONT, fontWeight: 800, fontSize: "0.8rem", color: C.blue,
                          }}>
                            {v.numberOfPersons}
                          </Box>
                        </BodyCell>

                        {/* Status */}
                        <BodyCell>
                          <StatusPill status={v.status} />
                        </BodyCell>

                        {/* Actions */}
                        <BodyCell>
                          <Stack direction="row" spacing={0.5}>
                            {v.status === "In" && (
                              <Tooltip title="Check Out" arrow placement="top">
                                <ActionBtn variant="checkout" size="small" onClick={() => openCheckout(v)}>
                                  <LogoutIcon sx={{ fontSize: 14 }} />
                                </ActionBtn>
                              </Tooltip>
                            )}
                            <Tooltip title="Edit" arrow placement="top">
                              <ActionBtn size="small" onClick={() => openEdit(v)}>
                                <Edit sx={{ fontSize: 14 }} />
                              </ActionBtn>
                            </Tooltip>
                            <Tooltip title="Delete" arrow placement="top">
                              <ActionBtn variant="danger" size="small" onClick={() => handleDelete(v._id)}>
                                <Delete sx={{ fontSize: 14 }} />
                              </ActionBtn>
                            </Tooltip>
                          </Stack>
                        </BodyCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </SurfaceCard>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {!loading && visitors.length > 0 && (
        <SurfaceCard sx={{ mt: 2, px: 3, py: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.5}>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.8rem", color: C.slate500, fontWeight: 600 }}>
              Showing{" "}
              <Box component="span" sx={{ color: C.slate800, fontWeight: 800 }}>
                {(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, pagination.total)}
              </Box>
              {" "}of{" "}
              <Box component="span" sx={{ color: C.slate800, fontWeight: 800 }}>
                {pagination.total}
              </Box>
              {" "}visitors{activeCount > 0 && (
                <Box component="span" sx={{ color: C.blue, fontWeight: 700 }}> (filtered)</Box>
              )}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography sx={{ fontFamily: FONT, fontSize: "0.78rem", color: C.slate400, whiteSpace: "nowrap" }}>
                  Per page:
                </Typography>
                <Select
                  size="small"
                  value={filters.limit}
                  onChange={(e) => dispatch(setFilters({ limit: Number(e.target.value) }))}
                  sx={{
                    fontFamily: FONT, fontSize: "0.8rem", minWidth: 68, borderRadius: R.sm,
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.slate200 },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: C.slate300 },
                  }}
                >
                  {[5, 10, 20, 50].map((n) => (
                    <MenuItem key={n} value={n} sx={{ fontFamily: FONT, fontSize: "0.8rem" }}>{n}</MenuItem>
                  ))}
                </Select>
              </Stack>

              <Pagination
                count={pagination.pages}
                page={filters.page}
                onChange={(_, p) => dispatch(setFilters({ page: p }))}
                color="primary"
                size="small"
                showFirstButton showLastButton
                renderItem={(item) => <PaginationItem {...item} />}
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontFamily: FONT, borderRadius: R.sm, fontWeight: 600,
                    fontSize: "0.78rem", border: `1px solid ${C.slate200}`,
                    color: C.slate600,
                    "&.Mui-selected": {
                      background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
                      color: C.white, borderColor: C.blue, fontWeight: 800,
                      boxShadow: `0 2px 8px ${alpha(C.blue, 0.35)}`,
                    },
                    "&:hover:not(.Mui-selected)": {
                      background: alpha(C.blue, 0.06), borderColor: alpha(C.blue, 0.3),
                      color: C.blue,
                    },
                  },
                }}
              />
            </Stack>
          </Stack>
        </SurfaceCard>
      )}

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "18px", boxShadow: "0 24px 64px rgba(15,23,42,0.15)", overflow: "hidden" },
        }}
      >
        {/* Dialog Header */}
        <Box sx={{
          background: `linear-gradient(135deg, ${C.slate900} 0%, #4C1D95 100%)`,
          px: 3, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "relative",
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: R.xs,
              background: alpha(C.white, 0.1),
              border: `1px solid ${alpha(C.white, 0.15)}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ManageAccounts sx={{ color: C.white, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "1rem", color: C.white, letterSpacing: "-0.02em" }}>
                {selected ? "Edit Visitor" : "Add New Visitor"}
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: alpha(C.white, 0.5) }}>
                {selected ? "Update visitor details" : "Fill in visitor information"}
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ 
              color: "white",
              bgcolor: alpha(C.white, 0.1),
              "&:hover": { bgcolor: alpha(C.white, 0.2) }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, bgcolor: C.slate50 }}>
          {/* Section: Personal Info */}
          <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 800, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.75 }}>
              Personal Information
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Visitor Name *"
                  value={form.visitorName}
                  onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                  error={!form.visitorName}
                  helperText={!form.visitorName ? "Required" : ""}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonAdd sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Email" type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth size="small" select label="ID Card Type"
                  value={form.idCardType}
                  onChange={(e) => setForm({ ...form, idCardType: e.target.value })}
                  sx={InputSx}
                >
                  {["Aadhar", "PAN", "Driving License", "Voter ID", "Passport", "Other"].map((o) => (
                    <MenuItem key={o} value={o} sx={{ fontFamily: FONT }}>{o}</MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 3 }}>
                <TextField fullWidth size="small" label="ID Number"
                  value={form.idCard}
                  onChange={(e) => setForm({ ...form, idCard: e.target.value })}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
            </Grid2>
          </Box>

          <Box sx={{ mx: 3, borderTop: `1px solid ${C.slate200}` }} />

          {/* Section: Visit Info */}
          <Box sx={{ px: 3, pt: 2, pb: 2 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 800, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.75 }}>
              Visit Details
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  size="small" 
                  select
                  label="Purpose of Visit *"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  error={!form.purpose}
                  helperText={!form.purpose ? "Required" : purposeOptions.length === 0 ? "No purposes configured in Setup" : ""}
                  sx={InputSx}
                >
                  {purposeOptions.map((p) => (
                    <MenuItem key={p} value={p} sx={{ fontFamily: FONT }}>
                      {p}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" select label="Meeting With *"
                  value={form.meetingWith}
                  onChange={(e) => setForm({ ...form, meetingWith: e.target.value })}
                  error={!form.meetingWith}
                  helperText={!form.meetingWith ? "Required" : ""}
                  sx={InputSx}
                >
                  {["Student", "Teacher", "Principal", "Staff", "Other"].map((o) => (
                    <MenuItem key={o} value={o} sx={{ fontFamily: FONT }}>{o}</MenuItem>
                  ))}
                </TextField>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Person Name"
                  value={form.meetingPersonName}
                  onChange={(e) => setForm({ ...form, meetingPersonName: e.target.value })}
                  placeholder="Name of person to meet"
                  sx={InputSx}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 4 }}>
                <TextField fullWidth size="small" label="Number of Persons" type="number"
                  value={form.numberOfPersons}
                  onChange={(e) => setForm({ ...form, numberOfPersons: e.target.value })}
                  slotProps={{ input: { inputProps: { min: 1 } } }}
                  sx={InputSx}
                />
              </Grid2>
            </Grid2>
          </Box>

          <Box sx={{ mx: 3, borderTop: `1px solid ${C.slate200}` }} />

          {/* Section: Additional */}
          <Box sx={{ px: 3, pt: 2, pb: 2.5 }}>
            <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 800, color: C.slate400, textTransform: "uppercase", letterSpacing: "0.1em", mb: 1.75 }}>
              Additional Information
            </Typography>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Vehicle Number"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><DirectionsCar sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth size="small" label="Temperature (°F)" type="number"
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><Thermostat sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Address" multiline rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  sx={InputSx}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocationOn sx={{ fontSize: 16, color: C.slate400 }} /></InputAdornment> } }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <TextField fullWidth size="small" label="Note" multiline rows={2}
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  sx={InputSx}
                />
              </Grid2>
            </Grid2>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${C.slate200}`,
          background: C.white,
          gap: 1,
        }}>
          <Button onClick={() => setDialogOpen(false)} sx={{
            fontFamily: FONT, borderRadius: R.sm, textTransform: "none",
            fontWeight: 700, color: C.slate500,
            border: `1px solid ${C.slate200}`,
            "&:hover": { bgcolor: C.slate50, borderColor: C.slate300 },
          }}>
            Cancel
          </Button>
          <PrimaryBtn
            variant="contained"
            onClick={handleSave}
            disabled={submitLoading || !form.visitorName || !form.purpose || !form.meetingWith}
          >
            {submitLoading
              ? <CircularProgress size={17} sx={{ color: C.white }} />
              : selected ? "Update Visitor" : "Add Visitor"}
          </PrimaryBtn>
        </DialogActions>
      </Dialog>

      {/* ── Checkout Dialog ───────────────────────────────────────────────── */}
      <Dialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "18px", boxShadow: "0 24px 64px rgba(15,23,42,0.15)", overflow: "hidden" } }}
      >
        <Box sx={{
          background: `linear-gradient(135deg, ${C.purple} 0%, ${C.purpleDark} 100%)`,
          px: 3, py: 2.5,
          position: "relative",
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: R.xs,
              background: alpha(C.white, 0.15),
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <LogoutIcon sx={{ color: C.white, fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: FONT, fontWeight: 800, fontSize: "1rem", color: C.white, letterSpacing: "-0.02em" }}>
                Check Out Visitor
              </Typography>
              <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: alpha(C.white, 0.7) }}>
                Record the exit time
              </Typography>
            </Box>
          </Stack>
          <IconButton
            onClick={() => setCheckoutOpen(false)}
            sx={{ 
              position: "absolute",
              top: 12,
              right: 12,
              color: "white",
              bgcolor: alpha(C.white, 0.1),
              "&:hover": { bgcolor: alpha(C.white, 0.2) }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 3, bgcolor: C.white }}>
          {selected && (
            <Stack spacing={2.5}>
              {/* Visitor card */}
              <Box sx={{
                display: "flex", alignItems: "center", gap: 1.75,
                p: 2, borderRadius: R.sm,
                border: `1px solid ${C.slate200}`,
                background: C.slate50,
              }}>
                <Avatar sx={{
                  width: 42, height: 42,
                  background: avatarGrad(selected.visitorName),
                  fontWeight: 800, fontSize: "1rem",
                  boxShadow: `0 2px 8px ${alpha(C.blue, 0.2)}`,
                }}>
                  {selected.visitorName?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "0.9375rem", color: C.slate800 }}>
                    {selected.visitorName}
                  </Typography>
                  <Typography sx={{ fontFamily: FONT, fontSize: "0.75rem", color: C.slate400 }}>
                    Checked in at {fmtTime(selected.inTime)} · {selected.purpose}
                  </Typography>
                </Box>
                <StatusPill status="In" />
              </Box>

              {/* Time picker */}
              <TextField
                fullWidth size="small" label="Out Time" type="datetime-local"
                value={checkoutForm.outTime}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, outTime: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={InputSx}
              />

              {/* Duration */}
              {calcDuration(selected.inTime, checkoutForm.outTime) && (
                <Box sx={{
                  p: 2, borderRadius: R.sm,
                  background: `linear-gradient(135deg, ${alpha(C.green, 0.06)}, ${alpha(C.purple, 0.04)})`,
                  border: `1px solid ${alpha(C.green, 0.15)}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <Box>
                    <Typography sx={{ fontFamily: FONT, fontSize: "0.68rem", fontWeight: 800, color: C.green, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Total Duration
                    </Typography>
                    <Typography sx={{ fontFamily: FONT, fontSize: "1.75rem", fontWeight: 900, color: C.slate800, letterSpacing: "-0.04em", lineHeight: 1.15 }}>
                      {calcDuration(selected.inTime, checkoutForm.outTime)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 44, height: 44, borderRadius: R.sm, bgcolor: alpha(C.green, 0.1), display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Schedule sx={{ fontSize: 22, color: C.green }} />
                  </Box>
                </Box>
              )}

              {/* Remarks */}
              <TextField
                fullWidth size="small" label="Remarks (optional)" multiline rows={3}
                value={checkoutForm.note}
                onChange={(e) => setCheckoutForm({ ...checkoutForm, note: e.target.value })}
                placeholder="Any notes about the visit…"
                sx={InputSx}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{
          px: 3, py: 2,
          borderTop: `1px solid ${C.slate200}`,
          gap: 1,
        }}>
          <Button onClick={() => setCheckoutOpen(false)} sx={{
            fontFamily: FONT, borderRadius: R.sm, textTransform: "none",
            fontWeight: 700, color: C.slate500,
            border: `1px solid ${C.slate200}`,
            "&:hover": { bgcolor: C.slate50 },
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleCheckout}
            disabled={submitLoading}
            sx={{
              fontFamily: FONT, borderRadius: R.sm, textTransform: "none",
              fontWeight: 800, boxShadow: "none",
              background: `linear-gradient(135deg, ${C.purple}, ${C.purpleDark})`,
              "&:hover": { boxShadow: `0 6px 16px ${alpha(C.purple, 0.4)}`, transform: "translateY(-1px)" },
              transition: "all 0.2s ease",
            }}
          >
            {submitLoading ? <CircularProgress size={17} sx={{ color: C.white }} /> : "Check Out"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbars ─────────────────────────────────────────────────────── */}
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => dispatch(clearMessages())}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert severity="success" onClose={() => dispatch(clearMessages())} sx={{ fontFamily: FONT, borderRadius: R.sm, fontWeight: 600, boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => dispatch(clearMessages())}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: 9999 }}
      >
        <Alert severity="error" onClose={() => dispatch(clearMessages())} sx={{ fontFamily: FONT, borderRadius: R.sm, fontWeight: 600, boxShadow: "0 8px 24px rgba(15,23,42,0.12)" }}>
          {error}
        </Alert>
      </Snackbar>
    </PageWrap>
  );
}