import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEnquiries,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  clearMessages,
} from "../../../state/admissionEnquirySlice";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid2,
  IconButton,
  MenuItem,
  Stack,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Avatar,
  Badge,
  Divider,
  Fade,
  LinearProgress,
  Menu,
  Paper,
  Drawer,
  InputAdornment,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Collapse,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Backdrop,
  Autocomplete,
} from "@mui/material";
import { alpha, styled, keyframes } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import NotesIcon from "@mui/icons-material/Notes";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CancelIcon from "@mui/icons-material/Cancel";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SortIcon from "@mui/icons-material/Sort";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StarIcon from "@mui/icons-material/Star";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import HistoryIcon from "@mui/icons-material/History";
import PrintIcon from "@mui/icons-material/Print";
import PageHeader from "../../ui/PageHeader";
import SectionCard from "../../ui/SectionCard";
import EmptyState from "../../ui/EmptyState";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const BRAND = {
  primary: "#7C3AED",
  primaryLight: "#A78BFA",
  accent: "#6D28D9",
  accentDark: "#5B21B6",
  success: "#059669",
  warning: "#7C3AED",
  error: "#dc2626",
  info: "#7C3AED",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const defaultForm = {
  studentName: "",
  guardianName: "",
  contactNumber: "",
  alternateNumber: "",
  email: "",
  address: "",
  classInterested: "",
  section: "",
  source: "",
  referredBy: "",
  status: "",
  followUpDate: "",
  notes: "",
  priority: "Medium",
  assignedTo: "",
};

const STATUS_CONFIG = {
  New: {
    color: "secondary",
    icon: FiberNewIcon,
    bg: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
    solidBg: "#7C3AED",
    text: "#5B21B6",
    border: "#DDD6FE",
    label: "New",
  },
  Contacted: {
    color: "secondary",
    icon: PhoneIcon,
    bg: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    solidBg: "#6D28D9",
    text: "#92400E",
    border: "#A78BFA",
    label: "Contacted",
  },
  "Follow-up": {
    color: "secondary",
    icon: AccessTimeIcon,
    bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
    solidBg: "#7C3AED",
    text: "#6D28D9",
    border: "#A78BFA",
    label: "Follow-up",
  },
  Converted: {
    color: "success",
    icon: CheckCircleIcon,
    bg: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    solidBg: "#059669",
    text: "#047857",
    border: "#6ee7b7",
    label: "Converted",
  },
  Closed: {
    color: "default",
    icon: CancelIcon,
    bg: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
    solidBg: "#6b7280",
    text: "#4b5563",
    border: "#d1d5db",
    label: "Closed",
  },
};

const PRIORITY_CONFIG = {
  High: {
    color: "#dc2626",
    bg: "#F5F3FF",
    border: "#fca5a5",
    dot: "#ef4444",
    label: "High",
  },
  Medium: {
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#A78BFA",
    dot: "#8B5CF6",
    label: "Medium",
  },
  Low: {
    color: "#059669",
    bg: "#f0fdf4",
    border: "#6ee7b7",
    dot: "#10b981",
    label: "Low",
  },
};

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Newest First" },
  { value: "createdAt_asc", label: "Oldest First" },
  { value: "studentName_asc", label: "Name A–Z" },
  { value: "studentName_desc", label: "Name Z–A" },
  { value: "followUpDate_asc", label: "Follow-up Soon" },
  { value: "priority_desc", label: "High Priority First" },
];

// ─── Animations ───────────────────────────────────────────────────────────────
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === "dark"
    ? "rgba(30,41,59,0.8)"
    : "rgba(255,255,255,0.9)",
  backdropFilter: "blur(12px)",
  border: `1px solid ${alpha('#7C3AED', 0.25)}`,
  borderRadius: 16,
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background 0.15s ease",
  animation: `${slideIn} 0.3s ease`,
  "&:hover": {
    background: `linear-gradient(90deg, ${alpha(BRAND.primary, 0.04)} 0%, ${alpha(BRAND.primaryLight, 0.02)} 100%)`,
  },
  "&:last-child td, &:last-child th": { border: 0 },
}));

const PriorityDot = styled(Box)(({ color }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: color,
  boxShadow: `0 0 0 2px ${color}30`,
  flexShrink: 0,
}));

// ─── Helper Functions ─────────────────────────────────────────────────────────
const getAvatarColor = (name = "") => {
  const colors = [
    "#4C1D95", "#7c3aed", "#059669", "#dc2626", "#0284c7",
    "#7C3AED", "#db2777", "#0891b2", "#65a30d", "#9333ea",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

const formatDate = (date, format = "short") => {
  if (!date) return "—";
  const d = new Date(date);
  if (format === "short") return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (format === "long") return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  if (format === "time") return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return d.toLocaleDateString("en-IN");
};

const isOverdue = (date) => date && new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();
const isToday = (date) => date && new Date(date).toDateString() === new Date().toDateString();

// ─── StatCard Component ───────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, trend, trendLabel, loading, subtitle }) {
  if (loading) {
    return (
      <GlassCard elevation={0} sx={{ p: 2.5 }}>
        <Skeleton width="55%" height={14} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={44} sx={{ mb: 1 }} />
        <Skeleton width="70%" height={12} />
      </GlassCard>
    );
  }

  const isPositive = trend >= 0;

  return (
    <GlassCard
      elevation={0}
      sx={{
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 12px 32px ${alpha(color, 0.2)}`,
          borderColor: alpha(color, 0.4),
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: color,
          borderRadius: "16px 16px 0 0",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -30,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: alpha(color, 0.06),
        },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={1}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontSize: "0.68rem",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: color,
              lineHeight: 1,
              mt: 0.5,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
            }}
          >
            {value ?? 0}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
            border: `1px solid ${alpha(color, 0.2)}`,
          }}
        >
          <Icon sx={{ fontSize: 22, color }} />
        </Box>
      </Stack>

      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
          {subtitle}
        </Typography>
      )}

      {trend !== undefined && (
        <Stack direction="row" alignItems="center" spacing={0.4} sx={{ mt: 0.8 }}>
          {isPositive ? (
            <TrendingUpIcon sx={{ fontSize: 13, color: BRAND.success }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 13, color: BRAND.error }} />
          )}
          <Typography
            variant="caption"
            sx={{
              color: isPositive ? BRAND.success : BRAND.error,
              fontWeight: 700,
              fontSize: "0.72rem",
            }}
          >
            {isPositive ? "+" : ""}{trend} {trendLabel || "this week"}
          </Typography>
        </Stack>
      )}
    </GlassCard>
  );
}

// ─── StatusBadge Component ────────────────────────────────────────────────────
function StatusBadge({ status, size = "small" }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.New;
  const Icon = cfg.icon;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: size === "small" ? 1.2 : 1.8,
        py: size === "small" ? 0.4 : 0.6,
        borderRadius: 20,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
      }}
    >
      <Icon sx={{ fontSize: size === "small" ? 11 : 14, color: cfg.text }} />
      <Typography
        sx={{
          fontSize: size === "small" ? "0.68rem" : "0.8rem",
          fontWeight: 700,
          color: cfg.text,
          lineHeight: 1,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {status}
      </Typography>
    </Box>
  );
}

// ─── PriorityBadge Component ──────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.6,
        px: 1,
        py: 0.3,
        borderRadius: 20,
        bgcolor: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <PriorityDot color={cfg.dot} />
      <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
        {priority}
      </Typography>
    </Box>
  );
}

// ─── FollowUpChip ─────────────────────────────────────────────────────────────
function FollowUpChip({ date }) {
  if (!date) return <Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>—</Typography>;
  const overdue = isOverdue(date);
  const today = isToday(date);
  const color = overdue ? BRAND.error : today ? BRAND.warning : "text.secondary";
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {overdue && <WarningAmberIcon sx={{ fontSize: 13, color: BRAND.error, animation: `${pulse} 2s infinite` }} />}
      {today && <NotificationsActiveIcon sx={{ fontSize: 13, color: BRAND.warning }} />}
      <Typography sx={{ fontSize: "0.8rem", color, fontWeight: overdue || today ? 700 : 500 }}>
        {overdue ? `Overdue · ${formatDate(date)}` : today ? `Today` : formatDate(date)}
      </Typography>
    </Stack>
  );
}

// ─── EnquiryCard (Grid View) ──────────────────────────────────────────────────
function EnquiryCard({ row, onEdit, onDelete, onViewDetail, onStatusChange, statusOptions }) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.New;
  const avatarColor = getAvatarColor(row.studentName);

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    const num = row.contactNumber?.replace(/\D/g, "");
    if (num) window.open(`https://wa.me/91${num}`, "_blank");
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(row.contactNumber || "");
  };

  return (
    <GlassCard
      elevation={0}
      sx={{
        p: 0,
        height: "100%",
        overflow: "hidden",
        cursor: "pointer",
        "&:hover": {
          boxShadow: `0 8px 32px ${alpha(BRAND.primary, 0.14)}`,
          borderColor: alpha(BRAND.primary, 0.25),
          transform: "translateY(-2px)",
        },
      }}
      onClick={() => onViewDetail(row)}
    >
      {/* Top color bar */}
      <Box sx={{ height: 4, background: cfg.solidBg }} />

      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
            <Avatar
              sx={{
                bgcolor: avatarColor,
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                fontWeight: 800,
                fontSize: { xs: "0.9rem", sm: "1rem" },
                boxShadow: `0 4px 12px ${alpha(avatarColor, 0.4)}`,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {getInitials(row.studentName)}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.85rem", sm: "0.92rem" },
                  lineHeight: 1.2,
                  color: "text.primary",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {row.studentName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                {row.guardianName || "Guardian not added"}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); }}
              sx={{ color: "text.secondary" }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Status & Priority Row */}
        <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={0.5}>
          <StatusBadge status={row.status} />
          <PriorityBadge priority={row.priority} />
        </Stack>

        {/* Info Grid */}
        <Stack spacing={{ xs: 0.8, sm: 1 }} mb={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 28, display: "flex", justifyContent: "center" }}>
              <PhoneIcon sx={{ fontSize: { xs: 13, sm: 14 }, color: "text.disabled" }} />
            </Box>
            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" }, fontWeight: 500, flex: 1 }}>
              {row.contactNumber}
            </Typography>
            <IconButton size="small" sx={{ p: 0.3, color: "text.disabled", "&:hover": { color: "#25D366" } }} onClick={handleWhatsApp}>
              <WhatsAppIcon sx={{ fontSize: { xs: 13, sm: 14 } }} />
            </IconButton>
            <IconButton size="small" sx={{ p: 0.3, color: "text.disabled" }} onClick={handleCopy}>
              <ContentCopyIcon sx={{ fontSize: { xs: 12, sm: 13 } }} />
            </IconButton>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ width: 28, display: "flex", justifyContent: "center" }}>
              <SchoolIcon sx={{ fontSize: { xs: 13, sm: 14 }, color: "text.disabled" }} />
            </Box>
            <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" } }}>
              Class {row.classInterested}
            </Typography>
          </Stack>

          {row.followUpDate && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 28, display: "flex", justifyContent: "center" }}>
                <CalendarTodayIcon sx={{ fontSize: { xs: 13, sm: 14 }, color: "text.disabled" }} />
              </Box>
              <FollowUpChip date={row.followUpDate} />
            </Stack>
          )}
        </Stack>

        <Divider sx={{ my: 1.5, opacity: 0.5 }} />

        {/* Footer */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box
            sx={{
              px: { xs: 1, sm: 1.2 },
              py: 0.4,
              borderRadius: 6,
              bgcolor: alpha(BRAND.primary, 0.06),
              border: `1px solid ${alpha(BRAND.primary, 0.1)}`,
            }}
          >
            <Typography sx={{ fontSize: { xs: "0.65rem", sm: "0.7rem" }, fontWeight: 600, color: BRAND.primary }}>
              {row.source || "Unknown Source"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.3} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                sx={{ color: "text.secondary", "&:hover": { color: BRAND.primary, bgcolor: alpha(BRAND.primary, 0.08) } }}
                onClick={(e) => { e.stopPropagation(); onEdit(row); }}
              >
                <EditIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                sx={{ color: "text.secondary", "&:hover": { color: BRAND.error, bgcolor: alpha(BRAND.error, 0.08) } }}
                onClick={(e) => { e.stopPropagation(); onDelete(row._id); }}
              >
                <DeleteIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", minWidth: 180 } }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Change Status
          </Typography>
        </Box>
        {statusOptions.map((s) => {
          const sc = STATUS_CONFIG[s] || {};
          const Icon = sc.icon || FiberNewIcon;
          return (
            <MenuItem
              key={s}
              onClick={() => { onStatusChange(row._id, s); setMenuAnchor(null); }}
              sx={{ fontSize: "0.85rem", py: 0.8, gap: 1 }}
              selected={row.status === s}
            >
              <Icon sx={{ fontSize: 16, color: sc.text }} />
              <Typography sx={{ fontSize: "0.85rem", color: sc.text, fontWeight: 600 }}>{s}</Typography>
            </MenuItem>
          );
        })}
        <Divider />
        <MenuItem onClick={() => { onEdit(row); setMenuAnchor(null); }} sx={{ fontSize: "0.85rem", py: 0.8 }}>
          <EditIcon sx={{ fontSize: 15, mr: 1.5, color: "text.secondary" }} />
          Edit Enquiry
        </MenuItem>
        <MenuItem onClick={() => { onDelete(row._id); setMenuAnchor(null); }} sx={{ fontSize: "0.85rem", color: "error.main", py: 0.8 }}>
          <DeleteIcon sx={{ fontSize: 15, mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>
    </GlassCard>
  );
}

// ─── DetailDialog Component ───────────────────────────────────────────────────
function DetailDialog({ row, open, onClose, onEdit, statusOptions, onStatusChange }) {
  const theme = useTheme();
  if (!row) return null;

  const cfg = STATUS_CONFIG[row.status] || STATUS_CONFIG.New;
  const pCfg = PRIORITY_CONFIG[row.priority] || PRIORITY_CONFIG.Medium;
  const avatarColor = getAvatarColor(row.studentName);

  const detailRows = [
    { icon: PhoneIcon, label: "Primary Contact", value: row.contactNumber, action: row.contactNumber ? (
      <Stack direction="row" spacing={0.5}>
        <Tooltip title="Copy">
          <IconButton size="small" onClick={() => navigator.clipboard.writeText(row.contactNumber)}>
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="WhatsApp">
          <IconButton size="small" sx={{ color: "#25D366" }} onClick={() => window.open(`https://wa.me/91${row.contactNumber?.replace(/\D/g, "")}`, "_blank")}>
            <WhatsAppIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Stack>
    ) : null },
    { icon: PhoneIcon, label: "Alternate Contact", value: row.alternateNumber || null },
    { icon: EmailIcon, label: "Email Address", value: row.email || null },
    { icon: LocationOnIcon, label: "Address", value: row.address || null },
    { icon: SchoolIcon, label: "Class Interested", value: row.classInterested ? `Class ${row.classInterested}` : null },
    { icon: PeopleAltIcon, label: "Lead Source", value: row.source || null },
    { icon: AssignmentIndIcon, label: "Assigned To", value: row.assignedTo || null },
    { icon: CalendarTodayIcon, label: "Follow-up Date", value: row.followUpDate ? formatDate(row.followUpDate, "long") : null, isDate: true, rawDate: row.followUpDate },
    { icon: NotesIcon, label: "Notes", value: row.notes || null },
  ].filter((r) => r.value);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
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
      <Box
        sx={{
          background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
          p: 3,
          color: "white",
          position: "relative",
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ 
            position: "absolute", 
            top: 12, 
            right: 12, 
            color: "white",
            bgcolor: "rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ pr: 5 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: avatarColor,
              fontWeight: 900,
              fontSize: "1.4rem",
              border: "3px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {getInitials(row.studentName)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: "white", lineHeight: 1.2, fontFamily: "'DM Sans', sans-serif" }}>
              {row.studentName}
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)", mt: 0.3 }}>
              {row.guardianName || "Guardian not specified"}
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={0.5}>
              <StatusBadge status={row.status} />
              <PriorityBadge priority={row.priority} />
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Body */}
      <DialogContent sx={{ p: 3 }}>
        {/* Detail Fields */}
        <Stack spacing={0.5} mb={3}>
          {detailRows.map(({ icon: Icon, label, value, action, isDate, rawDate }) => (
            <Box
              key={label}
              sx={{
                p: 1.5,
                borderRadius: 2,
                "&:hover": { bgcolor: alpha(BRAND.primary, 0.03) },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 2,
                    bgcolor: alpha(BRAND.primary, 0.08),
                    flexShrink: 0,
                    mt: 0.1,
                  }}
                >
                  <Icon sx={{ fontSize: 15, color: BRAND.primary }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.disabled",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      fontSize: "0.63rem",
                    }}
                  >
                    {label}
                  </Typography>
                  {isDate ? (
                    <FollowUpChip date={rawDate} />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, mt: 0.2, wordBreak: "break-word", lineHeight: 1.5 }}
                    >
                      {value}
                    </Typography>
                  )}
                </Box>
                {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
              </Stack>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ mb: 2.5 }} />

        {/* Status Update */}
        <Box mb={3}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.09em",
              color: "text.secondary",
              display: "block",
              mb: 1.5,
              fontSize: "0.68rem",
            }}
          >
            Update Status
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {statusOptions.map((s) => {
              const sc = STATUS_CONFIG[s] || {};
              const Icon = sc.icon || FiberNewIcon;
              const isActive = row.status === s;
              return (
                <Chip
                  key={s}
                  clickable
                  size="small"
                  icon={<Icon style={{ fontSize: 13 }} />}
                  label={s}
                  onClick={() => onStatusChange(row._id, s)}
                  sx={{
                    height: 28,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: isActive ? sc.solidBg : "transparent",
                    color: isActive ? "white" : sc.text,
                    border: `1.5px solid ${isActive ? sc.solidBg : sc.border}`,
                    transition: "all 0.2s",
                    "& .MuiChip-icon": { color: isActive ? "white" : sc.text },
                    "&:hover": { background: sc.solidBg, color: "white", "& .MuiChip-icon": { color: "white" } },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* Metadata */}
        {row.createdAt && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(BRAND.primary, 0.04),
              border: `1px solid ${alpha(BRAND.primary, 0.08)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <HistoryIcon sx={{ fontSize: 14, color: "text.disabled" }} />
              <Typography variant="caption" color="text.disabled">
                Created on {formatDate(row.createdAt, "time")}
                {row.updatedAt && ` · Updated ${formatDate(row.updatedAt, "time")}`}
              </Typography>
            </Stack>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(BRAND.primary, 0.02),
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ width: "100%" }}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<WhatsAppIcon />}
            onClick={() => window.open(`https://wa.me/91${row.contactNumber?.replace(/\D/g, "")}`, "_blank")}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              color: "#25D366",
              borderColor: "#25D366",
              "&:hover": { bgcolor: "#25D36610", borderColor: "#25D366" },
            }}
          >
            WhatsApp
          </Button>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EditIcon />}
            onClick={() => { onEdit(row); onClose(); }}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 800,
              background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
              boxShadow: `0 4px 16px ${alpha(BRAND.primary, 0.35)}`,
              "&:hover": { boxShadow: `0 6px 20px ${alpha(BRAND.primary, 0.45)}` },
            }}
          >
            Edit Enquiry
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

// ─── EnquiryFormDrawer Component ──────────────────────────────────────────────
function EnquiryFormDrawer({
  open,
  onClose,
  formData,
  setFormData,
  onSubmit,
  editId,
  sourceOptions,
  referenceOptions,
  statusOptions,
  priorityOptions,
  classes,
  submitting,
}) {
  const update = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const sectionTitle = (title) => (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: BRAND.primary,
          fontSize: "0.68rem",
          display: "flex",
          alignItems: "center",
          gap: 1,
          "&::after": {
            content: '""',
            flex: 1,
            height: 1,
            bgcolor: alpha(BRAND.primary, 0.15),
          },
        }}
      >
        {title}
      </Typography>
    </Box>
  );

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      fontSize: "0.88rem",
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.primaryLight },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.primary, borderWidth: 2 },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: BRAND.primary },
  };

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
      <DialogTitle
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: editId
            ? `linear-gradient(90deg, ${alpha(BRAND.primaryLight, 0.06)} 0%, transparent 100%)`
            : `linear-gradient(90deg, ${alpha(BRAND.accent, 1.08)} 0%, transparent 100%)`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                background: editId
                  ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`
                  : `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentDark} 100%)`,
                boxShadow: editId
                  ? `0 4px 12px ${alpha(BRAND.primary, 0.35)}`
                  : `0 4px 12px ${alpha(BRAND.accent, 0.35)}`,
              }}
            >
              {editId ? (
                <EditIcon sx={{ fontSize: 18, color: "white" }} />
              ) : (
                <PersonAddAltIcon sx={{ fontSize: 18, color: "white" }} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900, fontSize: "1rem", lineHeight: 1.1, fontFamily: "'DM Sans', sans-serif" }}>
                {editId ? "Edit Enquiry" : "New Admission Enquiry"}
              </Typography>
              <Typography variant="caption" color="#f9eefeff">
                {editId ? "Update existing enquiry details" : "Register a new admission lead"}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Form Body */}
      <DialogContent sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          {sectionTitle("Student Information")}

          <TextField
            size="small"
            label="Student Name *"
            value={formData.studentName}
            onChange={(e) => update("studentName", e.target.value)}
            sx={inputSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonAddAltIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            size="small"
            label="Guardian / Parent Name"
            value={formData.guardianName}
            onChange={(e) => update("guardianName", e.target.value)}
            sx={inputSx}
          />

          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label="Contact Number *"
                value={formData.contactNumber}
                onChange={(e) => update("contactNumber", e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label="Alternate Number"
                value={formData.alternateNumber || ""}
                onChange={(e) => update("alternateNumber", e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => update("email", e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><EmailIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                label="Address / Locality"
                value={formData.address || ""}
                onChange={(e) => update("address", e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>,
                }}
              />
            </Grid2>
          </Grid2>

          {sectionTitle("Enquiry Details")}

          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
               <Autocomplete
                freeSolo
                options={classes}
                value={formData.classInterested || ""}
                onInputChange={(_, value, reason) => {
                  if (reason !== "reset") update("classInterested", value);
                }}
                onChange={(_, value) => update("classInterested", value || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    size="small"
                    label="Class Interested *"
                    placeholder="Select or type class"
                    sx={inputSx}
                  />
                )}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Status *" value={formData.status} onChange={(e) => update("status", e.target.value)} sx={inputSx}>
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {STATUS_CONFIG[s]?.icon && (() => { const Icon = STATUS_CONFIG[s].icon; return <Icon sx={{ fontSize: 15, color: STATUS_CONFIG[s].text }} />; })()}
                      <span>{s}</span>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Lead Source" value={formData.source} onChange={(e) => update("source", e.target.value)} sx={inputSx}>
                {sourceOptions.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" select label="Priority" value={formData.priority || "Medium"} onChange={(e) => update("priority", e.target.value)} sx={inputSx}>
                {(priorityOptions?.length ? priorityOptions : ["High", "Medium", "Low"]).map((p) => {
                  const cfg = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.Medium;
                  return (
                    <MenuItem key={p} value={p}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PriorityDot color={cfg.dot} />
                        <span>{p}</span>
                      </Stack>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid2>
          </Grid2>

          {sectionTitle("Follow-up & Assignment")}

          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                type="date"
                label="Follow-up Date"
                InputLabelProps={{ shrink: true }}
                value={formData.followUpDate?.slice(0, 10) || ""}
                onChange={(e) => update("followUpDate", e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth size="small"
                label="Assigned To"
                placeholder="Staff member name"
                value={formData.assignedTo || ""}
                onChange={(e) => update("assignedTo", e.target.value)}
                sx={inputSx}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><AssignmentIndIcon sx={{ fontSize: 16, color: "text.disabled" }} /></InputAdornment>,
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth size="small"
                select
                label="Referred By"
                value={formData.referredBy || ""}
                onChange={(e) => update("referredBy", e.target.value)}
                sx={inputSx}
                helperText={referenceOptions.length === 0 ? "No references configured in Setup" : ""}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {referenceOptions.map((ref) => (
                  <MenuItem key={ref} value={ref}>
                    {ref}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
          </Grid2>

          {sectionTitle("Additional Notes")}

          <TextField
            size="small"
            label="Notes & Remarks"
            multiline
            rows={4}
            value={formData.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="Any additional details about the enquiry..."
            sx={{
              ...inputSx,
              "& .MuiOutlinedInput-root": {
                ...inputSx["& .MuiOutlinedInput-root"],
                alignItems: "flex-start",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                  <NotesIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          p: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={submitting}
          sx={{
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={submitting}
          sx={{
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            px: 3,
            background: editId
              ? `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`
              : `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentDark} 100%)`,
            boxShadow: editId
              ? `0 4px 16px ${alpha(BRAND.primary, 0.4)}`
              : `0 4px 16px ${alpha(BRAND.accent, 0.4)}`,
            "&:hover": {
              boxShadow: editId
                ? `0 6px 24px ${alpha(BRAND.primary, 0.5)}`
                : `0 6px 24px ${alpha(BRAND.accent, 0.5)}`,
            },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} sx={{ color: "white" }} />
          ) : editId ? "Update Enquiry" : "Create Enquiry"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────
function DeleteConfirmDialog({ open, onClose, onConfirm, loading }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          maxWidth: 380,
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 900, fontFamily: "'DM Sans', sans-serif", pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(BRAND.error, 0.1) }}>
            <DeleteIcon sx={{ color: BRAND.error, fontSize: 20 }} />
          </Box>
          Delete Enquiry
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ fontSize: "0.9rem" }}>
          Are you sure you want to delete this enquiry? This action cannot be undone and all associated data will be permanently removed.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 800, minWidth: 100 }}
        >
          {loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdmissionEnquiry() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();

  // ── Redux state ─────────────────────────────────────────────────────────────
  const {
    items: rows,
    stats,
    pagination,
    statusOptions,
    sourceOptions,
    referenceOptions,
    priorityOptions,
    classes,
    filters: reduxFilters,
    loading,
    submitLoading,
    error: reduxError,
    successMsg,
  } = useSelector((s) => s.admissionEnquiry);

  // ── Local UI state (not persisted in Redux) ──────────────────────────────────
  const [formData, setFormData] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [filterOpen, setFilterOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ q: "", status: "all", source: "all", classInterested: "all", page: 1, limit: 10 });
  const debounceRef = useRef(null);

  const showSnack = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  // ── Fetch via Redux ──────────────────────────────────────────────────────────
  const fetchData = useCallback(() => {
    dispatch(fetchEnquiries({ ...filters, sortBy }));
  }, [dispatch, filters, sortBy]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Mirror Redux success/error to local snackbar ─────────────────────────────
  useEffect(() => {
    if (successMsg) { showSnack(successMsg, "success"); dispatch(clearMessages()); }
  }, [successMsg, dispatch]);

  useEffect(() => {
    if (reduxError) { showSnack(reduxError, "error"); dispatch(clearMessages()); }
  }, [reduxError, dispatch]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const updateFilter = (key, value) => {
    if (key === "q") {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
      }, 350);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value, page: key === "page" ? value : 1 }));
    }
  };

  const handleSearch = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, q: val, page: 1 }));
    }, 400);
  };

  const handleSubmit = async () => {
    if (!formData.studentName?.trim()) return showSnack("Student name is required.", "error");
    if (!formData.contactNumber?.trim()) return showSnack("Contact number is required.", "error");
    if (!formData.classInterested?.trim()) return showSnack("Please select or type class interested.", "error");

    const payload = { ...formData, classInterested: formData.classInterested.trim() };
    let result;
    if (editId) {
      result = await dispatch(updateEnquiry({ id: editId, data: payload }));
    } else {
      result = await dispatch(createEnquiry(payload));
    }

    if (!result.error) {
      setFormData(defaultForm);
      setEditId(null);
      setFormOpen(false);
      fetchData(); // re-fetch to sync pagination/stats
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await dispatch(deleteEnquiry(deleteTarget));
    if (!result.error) {
      setDeleteTarget(null);
      fetchData();
    }
  };

  const handleEdit = (row) => {
    setEditId(row._id);
    setFormData({ ...defaultForm, ...row, followUpDate: row.followUpDate ? row.followUpDate.slice(0, 10) : "" });
    setFormOpen(true);
    if (detailRow) setDetailRow(null);
  };

  const handleStatusChange = async (id, status) => {
    const result = await dispatch(updateEnquiry({ id, data: { status } }));
    if (!result.error) {
      if (detailRow?._id === id) setDetailRow((prev) => ({ ...prev, status }));
    }
  };

  const handleExport = () => {
    const csvRows = [
      ["Student Name", "Guardian", "Contact", "Alternate", "Email", "Address", "Class", "Source", "Status", "Priority", "Follow-up Date", "Assigned To", "Notes"],
      ...rows.map((r) => [
        r.studentName, r.guardianName, r.contactNumber, r.alternateNumber, r.email,
        r.address, r.classInterested, r.source, r.status, r.priority || "",
        r.followUpDate ? formatDate(r.followUpDate) : "", r.assignedTo, r.notes,
      ]),
    ];
    const csv = csvRows.map((r) => r.map((cell) => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `admission-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    showSnack("CSV exported successfully!");
  };

  // ── Computed ──────────────────────────────────────────────────────────────────
  const total = useMemo(() => stats.reduce((sum, s) => sum + (s.count || 0), 0), [stats]);
  const statusMap = useMemo(() => Object.fromEntries(stats.map((s) => [s._id, s.count])), [stats]);
  const todayFollowUps = useMemo(() => rows.filter((r) => isToday(r.followUpDate)).length, [rows]);
  const overdueFollowUps = useMemo(() => rows.filter((r) => isOverdue(r.followUpDate)).length, [rows]);
  const activeFiltersCount = [filters.q, filters.status !== "all", filters.source !== "all", filters.classInterested !== "all"].filter(Boolean).length;

  const STAT_CARDS = [
    { label: "Total Enquiries", value: total, icon: PeopleAltIcon, color: BRAND.primary, trend: 3, subtitle: `${pagination.totalItems} across all pages` },
    { label: "New Leads", value: statusMap["New"] || 0, icon: FiberNewIcon, color: BRAND.info },
    { label: "Follow-ups Due", value: statusMap["Follow-up"] || 0, icon: AccessTimeIcon, color: BRAND.warning, subtitle: overdueFollowUps > 0 ? `${overdueFollowUps} overdue` : undefined },
    { label: "Converted", value: statusMap["Converted"] || 0, icon: CheckCircleIcon, color: BRAND.success, trend: 1 },
    { label: "Today's Follow-ups", value: todayFollowUps, icon: NotificationsActiveIcon, color: BRAND.accent },
  ];

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        minHeight: "100vh",
        background: theme.palette.mode === "dark"
          ? "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)"
          : "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #ffffff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Google Font Import ── */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── Page Header ── */}
      <PageHeader
        title="Admission Enquiry"
        subtitle="Track, manage & convert admission leads efficiently"
        breadcrumbs={[
          { label: "School", to: "/school" },
          { label: "Front Office" },
          { label: "Admission Enquiry" },
        ]}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Tooltip title="Export to CSV">
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
                sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, borderColor: alpha(BRAND.primary, 0.3), color: BRAND.primary }}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Refresh data">
              <IconButton
                size="small"
                onClick={fetchData}
                sx={{
                  border: `1px solid ${alpha(BRAND.primary, 0.2)}`,
                  borderRadius: 2,
                  color: BRAND.primary,
                  "&:hover": { bgcolor: alpha(BRAND.primary, 0.06) },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => { setEditId(null); setFormData(defaultForm); setFormOpen(true); }}
              sx={{
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 800,
                px: 2.5,
                background: `linear-gradient(135deg, ${BRAND.accent} 0%, ${BRAND.accentDark} 100%)`,
                boxShadow: `0 4px 16px ${alpha(BRAND.accent, 0.4)}`,
                "&:hover": { boxShadow: `0 6px 24px ${alpha(BRAND.accent, 0.55)}` },
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              New Enquiry
            </Button>
          </Stack>
        }
      />

      {/* ── Stat Cards ── */}
      <Grid2 container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, md: 3 }, mt: 0.5 }}>
        {STAT_CARDS.map((s, i) => (
          <Grid2 key={s.label} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Box sx={{ animation: `${slideIn} 0.4s ease ${i * 0.07}s both` }}>
              <StatCard {...s} loading={loading} />
            </Box>
          </Grid2>
        ))}
      </Grid2>

      {/* ── Toolbar ── */}
      <GlassCard elevation={0} sx={{ p: { xs: 1.5, sm: 1.8 }, mb: 2, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
          {/* Search */}
          <TextField
            size="small"
            placeholder="Search by student, guardian, contact..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", md: 240 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: alpha(BRAND.primary, 0.03),
                "&:hover": { bgcolor: alpha(BRAND.primary, 0.05) },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: searchInput && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => { setSearchInput(""); setFilters((p) => ({ ...p, q: "", page: 1 })); }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Desktop Filters */}
          {!isMobile && (
            <>
              <TextField
                size="small" select label="Status" value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
                sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              >
                {["all", ...statusOptions].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s === "all" ? "All Status" : (
                      <Stack direction="row" alignItems="center" spacing={0.8}>
                        {STATUS_CONFIG[s]?.icon && (() => { const Icon = STATUS_CONFIG[s].icon; return <Icon sx={{ fontSize: 13, color: STATUS_CONFIG[s].text }} />; })()}
                        <span>{s}</span>
                      </Stack>
                    )}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small" select label="Source" value={filters.source}
                onChange={(e) => setFilters((p) => ({ ...p, source: e.target.value, page: 1 }))}
                sx={{ minWidth: 140, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              >
                {["all", ...sourceOptions].map((s) => (
                  <MenuItem key={s} value={s}>{s === "all" ? "All Sources" : s}</MenuItem>
                ))}
              </TextField>
              <TextField
                size="small" select label="Class" value={filters.classInterested}
                onChange={(e) => setFilters((p) => ({ ...p, classInterested: e.target.value, page: 1 }))}
                sx={{ minWidth: 110, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
              >
                {["all", ...classes].map((c) => (
                  <MenuItem key={c} value={c}>{c === "all" ? "All Classes" : c}</MenuItem>
                ))}
              </TextField>
            </>
          )}

          {/* Mobile Filter Toggle */}
          {isMobile && (
            <Badge badgeContent={activeFiltersCount} color="error" invisible={activeFiltersCount === 0}>
              <Button
                variant={filterOpen ? "contained" : "outlined"}
                size="small"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterOpen(!filterOpen)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  ...(filterOpen && {
                    background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(BRAND.primary, 0.35)}`,
                  }),
                }}
              >
                Filters
              </Button>
            </Badge>
          )}

          {/* Sort */}
          <TextField
            size="small" select value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ minWidth: 170, "& .MuiOutlinedInput-root": { borderRadius: 2.5 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SortIcon sx={{ fontSize: 15, color: "text.disabled" }} /></InputAdornment>,
            }}
          >
            {SORT_OPTIONS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
          </TextField>

          {/* View Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && setViewMode(v)}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.8,
                borderRadius: "10px !important",
                border: `1px solid ${alpha(BRAND.primary, 0.2)} !important`,
                color: "text.secondary",
                mx: "1px !important",
                "&.Mui-selected": {
                  background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%)`,
                  color: "white",
                  "& svg": { color: "white" },
                },
              },
            }}
          >
            <ToggleButton value="table">
              <Tooltip title="Table View"><ListIcon fontSize="small" /></Tooltip>
            </ToggleButton>
            <ToggleButton value="grid">
              <Tooltip title="Card View"><GridViewIcon fontSize="small" /></Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Mobile Filter Collapse */}
        {isMobile && (
          <Collapse in={filterOpen}>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }} gap={1}>
              <TextField size="small" select label="Status" value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))} sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                {["all", ...statusOptions].map((s) => <MenuItem key={s} value={s}>{s === "all" ? "All Status" : s}</MenuItem>)}
              </TextField>
              <TextField size="small" select label="Source" value={filters.source} onChange={(e) => setFilters((p) => ({ ...p, source: e.target.value, page: 1 }))} sx={{ minWidth: 130, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                {["all", ...sourceOptions].map((s) => <MenuItem key={s} value={s}>{s === "all" ? "All Sources" : s}</MenuItem>)}
              </TextField>
              <TextField size="small" select label="Class" value={filters.classInterested} onChange={(e) => setFilters((p) => ({ ...p, classInterested: e.target.value, page: 1 }))} sx={{ minWidth: 110, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                {["all", ...classes].map((c) => <MenuItem key={c} value={c}>{c === "all" ? "All Classes" : c}</MenuItem>)}
              </TextField>
            </Stack>
          </Collapse>
        )}
      </GlassCard>

      {/* ── Active Filter Chips ── */}
      {activeFiltersCount > 0 && (
        <Fade in>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap" gap={0.5}>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center", fontWeight: 600 }}>
              Active filters:
            </Typography>
            {filters.q && (
              <Chip
                size="small"
                label={`Search: "${filters.q}"`}
                onDelete={() => { setSearchInput(""); setFilters((p) => ({ ...p, q: "", page: 1 })); }}
                sx={{ height: 24, fontSize: "0.75rem", fontWeight: 600, bgcolor: alpha(BRAND.primary, 0.08), color: BRAND.primary }}
              />
            )}
            {filters.status !== "all" && (
              <Chip
                size="small"
                label={`Status: ${filters.status}`}
                onDelete={() => setFilters((p) => ({ ...p, status: "all", page: 1 }))}
                sx={{ height: 24, fontSize: "0.75rem", fontWeight: 600, bgcolor: alpha(STATUS_CONFIG[filters.status]?.text || BRAND.primary, 0.08), color: STATUS_CONFIG[filters.status]?.text || BRAND.primary }}
              />
            )}
            {filters.source !== "all" && (
              <Chip size="small" label={`Source: ${filters.source}`} onDelete={() => setFilters((p) => ({ ...p, source: "all", page: 1 }))} sx={{ height: 24, fontSize: "0.75rem" }} />
            )}
            {filters.classInterested !== "all" && (
              <Chip size="small" label={`Class: ${filters.classInterested}`} onDelete={() => setFilters((p) => ({ ...p, classInterested: "all", page: 1 }))} sx={{ height: 24, fontSize: "0.75rem" }} />
            )}
            <Chip
              size="small"
              label="Clear All"
              color="error"
              variant="outlined"
              onClick={() => { setSearchInput(""); setFilters((p) => ({ ...p, q: "", status: "all", source: "all", classInterested: "all", page: 1 })); }}
              sx={{ height: 24, fontSize: "0.75rem", fontWeight: 700 }}
            />
          </Stack>
        </Fade>
      )}

      {/* ── Loading Bar ── */}
      {loading && <LinearProgress sx={{ mb: 1.5, borderRadius: 1, height: 3, bgcolor: alpha(BRAND.primary, 0.1) }} />}

      {/* ── Table View ── */}
      {viewMode === "table" && (
        <GlassCard elevation={0} sx={{ p: 0, overflow: "hidden" }}>
          {!loading && rows.length === 0 ? (
            <Box sx={{ p: 6 }}>
              <EmptyState title="No enquiries found" subtitle="Try adjusting the filters or add a new enquiry to get started." />
            </Box>
          ) : (
            <TableContainer sx={{ 
              overflowX: "auto",
              "& .MuiTable-root": {
                minWidth: { xs: 800, md: "auto" }
              }
            }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {["Student / Guardian", "Contact", "Class", "Source", "Priority", "Status", "Follow-up", "Actions"].map((col) => (
                      <TableCell
                        key={col}
                        align={col === "Actions" ? "right" : "left"}
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "text.secondary",
                          bgcolor: alpha(BRAND.primary, 0.04),
                          borderBottom: `2px solid ${alpha(BRAND.primary, 0.1)}`,
                          py: { xs: 1.2, sm: 1.5 },
                          px: { xs: 1, sm: 2 },
                          fontFamily: "'DM Sans', sans-serif",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <TableCell key={j}><Skeleton height={20} /></TableCell>
                        ))}
                      </TableRow>
                    ))
                    : rows.map((row) => {
                      const avatarColor = getAvatarColor(row.studentName);
                      return (
                        <StyledTableRow key={row._id}>
                          {/* Student */}
                          <TableCell onClick={() => setDetailRow(row)} sx={{ cursor: "pointer", maxWidth: 180, px: { xs: 1, sm: 2 } }}>
                            <Stack direction="row" spacing={1.3} alignItems="center">
                              <Avatar
                                sx={{
                                  width: { xs: 30, sm: 34 },
                                  height: { xs: 30, sm: 34 },
                                  bgcolor: avatarColor,
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                  fontWeight: 800,
                                  boxShadow: `0 2px 8px ${alpha(avatarColor, 0.4)}`,
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(row.studentName)}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                                    lineHeight: 1.2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    color: BRAND.primary,
                                    fontFamily: "'DM Sans', sans-serif",
                                  }}
                                >
                                  {row.studentName}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.3, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                                  {row.guardianName || "—"}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Contact */}
                          <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" }, fontWeight: 500 }}>{row.contactNumber}</Typography>
                              <Tooltip title="WhatsApp">
                                <IconButton
                                  size="small"
                                  sx={{ p: 0.3, color: "#ccc", "&:hover": { color: "#25D366" } }}
                                  onClick={() => window.open(`https://wa.me/91${row.contactNumber?.replace(/\D/g, "")}`, "_blank")}
                                >
                                  <WhatsAppIcon sx={{ fontSize: { xs: 12, sm: 13 } }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            {row.email && (
                              <Typography variant="caption" color="text.disabled" sx={{ display: "block", fontSize: { xs: "0.65rem", sm: "0.7rem" } }}>
                                {row.email}
                              </Typography>
                            )}
                          </TableCell>

                          {/* Class */}
                          <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: { xs: 0.8, sm: 1 }, py: 0.3, borderRadius: 1.5, bgcolor: alpha(BRAND.primary, 0.06) }}>
                              <SchoolIcon sx={{ fontSize: { xs: 10, sm: 11 }, color: BRAND.primary }} />
                              <Typography sx={{ fontSize: { xs: "0.7rem", sm: "0.8rem" }, fontWeight: 700, color: BRAND.primary }}>
                                Class {row.classInterested}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Source */}
                          <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                            <Typography sx={{ fontSize: { xs: "0.75rem", sm: "0.82rem" }, color: "text.secondary" }}>
                              {row.source || "—"}
                            </Typography>
                          </TableCell>

                          {/* Priority */}
                          <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                            <PriorityBadge priority={row.priority} />
                          </TableCell>

                          {/* Status */}
                          <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                            <StatusBadge status={row.status} />
                          </TableCell>

                          {/* Follow-up */}
                          <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
                            <FollowUpChip date={row.followUpDate} />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ px: { xs: 1, sm: 2 } }}>
                            <Stack direction="row" spacing={0.3} justifyContent="flex-end">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => setDetailRow(row)}
                                  sx={{ color: "text.disabled", "&:hover": { color: BRAND.primary, bgcolor: alpha(BRAND.primary, 0.08) } }}
                                >
                                  <VisibilityIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(row)}
                                  sx={{ color: "text.disabled", "&:hover": { color: BRAND.primaryLight, bgcolor: alpha(BRAND.primaryLight, 0.08) } }}
                                >
                                  <EditIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteTarget(row._id)}
                                  sx={{ color: "text.disabled", "&:hover": { color: BRAND.error, bgcolor: alpha(BRAND.error, 0.08) } }}
                                >
                                  <DeleteIcon sx={{ fontSize: { xs: 14, sm: 15 } }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </StyledTableRow>
                      );
                    })
                  }
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassCard>
      )}

      {/* ── Grid View ── */}
      {viewMode === "grid" && (
        !loading && rows.length === 0 ? (
          <GlassCard elevation={0} sx={{ p: { xs: 4, sm: 6 } }}>
            <EmptyState title="No enquiries found" subtitle="Try adjusting the filters or add a new enquiry." />
          </GlassCard>
        ) : (
          <Grid2 container spacing={{ xs: 1.5, sm: 2 }}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                <Grid2 key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
                </Grid2>
              ))
              : rows.map((row, i) => (
                <Grid2 key={row._id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <Box sx={{ animation: `${slideIn} 0.35s ease ${i * 0.05}s both` }}>
                    <EnquiryCard
                      row={row}
                      onEdit={handleEdit}
                      onDelete={(id) => setDeleteTarget(id)}
                      onViewDetail={setDetailRow}
                      onStatusChange={handleStatusChange}
                      statusOptions={statusOptions}
                    />
                  </Box>
                </Grid2>
              ))}
          </Grid2>
        )
      )}

      {/* ── Pagination ── */}
      {!loading && rows.length > 0 && (
        <GlassCard elevation={0} sx={{ mt: 2, p: { xs: 1.5, sm: 1.8 }, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            spacing={1.5}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
              Showing page <b>{pagination.page}</b> of <b>{pagination.totalPages}</b> &nbsp;·&nbsp; Total <b>{pagination.totalItems}</b> enquiries
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="small"
                select
                label="Per page"
                value={filters.limit}
                onChange={(e) => setFilters((p) => ({ ...p, limit: +e.target.value, page: 1 }))}
                sx={{ width: 95, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              >
                {[10, 20, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </TextField>
              <Pagination
                color="primary"
                page={pagination.page}
                count={pagination.totalPages}
                onChange={(_, v) => setFilters((p) => ({ ...p, page: v }))}
                size="small"
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  },
                  "& .Mui-selected": {
                    background: `linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%) !important`,
                    color: "white !important",
                  },
                }}
              />
            </Stack>
          </Stack>
        </GlassCard>
      )}

      {/* ── Drawers & Dialogs ── */}
      <EnquiryFormDrawer
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditId(null); setFormData(defaultForm); }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editId={editId}
        sourceOptions={sourceOptions}
        referenceOptions={referenceOptions}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        classes={classes}
        submitting={submitLoading}
      />

      <DetailDialog
        row={detailRow}
        open={Boolean(detailRow)}
        onClose={() => setDetailRow(null)}
        onEdit={handleEdit}
        statusOptions={statusOptions}
        onStatusChange={handleStatusChange}
      />

      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={submitLoading}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        TransitionProps={{ timeout: 300 }}
      >
        <Alert
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}