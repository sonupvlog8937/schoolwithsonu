import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Grid2 from "@mui/material/Grid2";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  AccountBalance as AccountBalanceIcon,
  Payments as PaymentsIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  TrendingUp as TrendingUpIcon,
  Layers as LayersIcon,
  PeopleAlt as PeopleAltIcon,
} from "@mui/icons-material";
import { alpha, styled, keyframes } from "@mui/material/styles";
import { useDocumentTitle } from "../../../hooks/useDocumentTitle";
import {
  fetchFeeStudents,
  setFeeFilters,
  clearFeeMessages,
  selectFeeCollectionFilters,
  getAllClasses,
  getStudentFeeDetails,
  getStudentFeesForCollection,
} from "../../../state/feeCollectionSlice";
import PrintReceipt from "./PrintReceipt";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  purple900: "#3B0764",
  purple800: "#4C1D95",
  purple700: "#5B21B6",
  purple600: "#7C3AED",
  purple500: "#8B5CF6",
  purple400: "#A78BFA",
  purple300: "#C4B5FD",
  purple100: "#EDE9FE",
  purple50:  "#F5F3FF",
  white:     "#FFFFFF",
  gray900:   "#111827",
  gray700:   "#374151",
  gray500:   "#6B7280",
  gray300:   "#D1D5DB",
  gray100:   "#F3F4F6",
  emerald:   "#059669",
  amber:     "#D97706",
  rose:      "#DC2626",
  sky:       "#0284C7",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const slideRight = keyframes`from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}`;
const shimmer = keyframes`0%{background-position:-200% 0}100%{background-position:200% 0}`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Root = styled(Box)({
  padding: "clamp(12px,2.5vw,28px)",
  minHeight: "100vh",
  background: `linear-gradient(160deg, ${T.purple50} 0%, ${T.white} 45%, ${T.purple50} 100%)`,
  fontFamily: "'DM Sans', sans-serif",
});

const Surface = styled(Paper)({
  background: T.white,
  border: `1px solid ${alpha(T.purple600, 0.12)}`,
  borderRadius: 12,
  boxShadow: `0 1px 3px ${alpha(T.purple800, 0.06)}, 0 4px 16px ${alpha(T.purple800, 0.04)}`,
  animation: `${fadeUp} 0.35s ease`,
});

const StatCard = styled(Card)(({ gradient }) => ({
  background: gradient || `linear-gradient(135deg, ${T.purple600} 0%, ${T.purple800} 100%)`,
  color: T.white,
  borderRadius: 12,
  border: "none",
  boxShadow: `0 4px 20px ${alpha(T.purple800, 0.2)}`,
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  cursor: "default",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 8px 28px ${alpha(T.purple800, 0.28)}`,
  },
}));

const FilterInput = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    fontSize: "0.78rem",
    background: T.white,
    "& fieldset": { borderColor: alpha(T.purple600, 0.2) },
    "&:hover fieldset": { borderColor: alpha(T.purple600, 0.4) },
    "&.Mui-focused fieldset": { borderColor: T.purple600, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root": { fontSize: "0.78rem" },
});

const FilterSelect = styled(FormControl)({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    fontSize: "0.78rem",
    background: T.white,
    "& fieldset": { borderColor: alpha(T.purple600, 0.2) },
    "&:hover fieldset": { borderColor: alpha(T.purple600, 0.4) },
    "&.Mui-focused fieldset": { borderColor: T.purple600, borderWidth: 1.5 },
  },
  "& .MuiInputLabel-root": { fontSize: "0.78rem" },
  "& .MuiMenuItem-root": { fontSize: "0.78rem" },
});

const PrimaryBtn = styled(Button)({
  borderRadius: 8,
  textTransform: "none",
  fontWeight: 600,
  fontSize: "0.78rem",
  letterSpacing: 0.2,
  background: `linear-gradient(135deg, ${T.purple600} 0%, ${T.purple700} 100%)`,
  color: T.white,
  boxShadow: `0 2px 8px ${alpha(T.purple600, 0.3)}`,
  "&:hover": {
    background: `linear-gradient(135deg, ${T.purple700} 0%, ${T.purple800} 100%)`,
    boxShadow: `0 4px 12px ${alpha(T.purple600, 0.4)}`,
  },
  "&:disabled": { opacity: 0.5 },
});

const GhostBtn = styled(IconButton)({
  borderRadius: 8,
  border: `1px solid ${alpha(T.purple600, 0.18)}`,
  color: T.purple600,
  padding: "6px",
  transition: "all 0.15s ease",
  "&:hover": {
    background: alpha(T.purple600, 0.07),
    borderColor: alpha(T.purple600, 0.35),
  },
});

// ─── Helper Functions ─────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

// ─── Stat Card Component ──────────────────────────────────────────────────────
function KPICard({ label, value, icon: Icon, gradient, delay = 0 }) {
  return (
    <StatCard gradient={gradient} sx={{ animation: `${slideRight} 0.4s ease ${delay}s both` }}>
      <CardContent sx={{ p: "14px 16px !important" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{ fontSize: "0.68rem", opacity: 0.82, fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase", mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.1 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ p: 0.8, borderRadius: 2, bgcolor: alpha(T.white, 0.18) }}>
            <Icon sx={{ fontSize: 20 }} />
          </Box>
        </Stack>
      </CardContent>
    </StatCard>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeeCollection() {
  useDocumentTitle("Collect Fees");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { students, studentsPagination, studentsLoading, classes, error, successMsg, studentFeesForCollection, feeAssignments } =
    useSelector((s) => s.feeCollection);
  const filters = useSelector(selectFeeCollectionFilters);

  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [receiptsDialog, setReceiptsDialog] = useState(false);
  const [studentDetailsDialog, setStudentDetailsDialog] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState(null);
  const [showFilters, setShowFilters] = useState(true);
  const [printDialog, setPrintDialog] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => { dispatch(getAllClasses()); }, [dispatch]);

  const fetchData = useCallback(() => { dispatch(fetchFeeStudents(filters)); }, [dispatch, filters]);
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { dispatch(setFeeFilters({ search: value, page: 1 })); }, 400);
  };

  const handleFilterChange = (key, value) => {
    if (key === "page") dispatch(setFeeFilters({ [key]: value }));
    else dispatch(setFeeFilters({ [key]: value, page: 1 }));
  };

  const handleCollectFeesClick = (student) => navigate(`/school/fees/student/${student._id}`);

  const handleViewDetails = async (student) => {
    setSelectedStudentForDetails(student);
    setStudentDetailsDialog(true);
    await dispatch(getStudentFeeDetails(student._id));
  };

  const handleViewReceipts = async (student) => {
    setSelectedStudentForFee(student);
    setReceiptsDialog(true);
    await dispatch(getStudentFeesForCollection(student._id));
  };

  const handleExport = () => {
    const headers = ["Class", "Section", "Admission No", "Student Name", "Father Name", "DOB", "Mobile"];
    const rows = students.map((s) => [
      s.class?.class_text || "N/A",
      s.section || "N/A",
      s.admissionNo || "N/A",
      `${s.firstName} ${s.lastName || ""}`.trim(),
      s.fatherName || "N/A",
      fmtDate(s.dateOfBirth),
      s.mobileNumber || "N/A",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })), download: `fee-students-${Date.now()}.csv` });
    a.click();
  };

  useEffect(() => {
    if (error || successMsg) { const t = setTimeout(() => dispatch(clearFeeMessages()), 3500); return () => clearTimeout(t); }
  }, [error, successMsg, dispatch]);

  const sections = [...new Set(students.map((s) => s.section).filter(Boolean))];
  const activeFilters = [filters.classId, filters.section, filters.search].filter(Boolean).length;

  return (
    <Root>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ p: 1, borderRadius: 2, background: `linear-gradient(135deg, ${T.purple600}, ${T.purple800})`, boxShadow: `0 3px 12px ${alpha(T.purple600, 0.35)}` }}>
            <AccountBalanceIcon sx={{ fontSize: 20, color: T.white }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: T.purple700, fontSize: "1.05rem", letterSpacing: "-0.3px" }}>
              Fee Collection
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: T.gray500 }}>
              Search and collect student fees
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.75}>
          <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
            <GhostBtn onClick={() => setShowFilters(!showFilters)}>
              <FilterListIcon sx={{ fontSize: 18 }} />
            </GhostBtn>
          </Tooltip>
          <Tooltip title="Export CSV">
            <GhostBtn onClick={handleExport} disabled={students.length === 0}>
              <DownloadIcon sx={{ fontSize: 18 }} />
            </GhostBtn>
          </Tooltip>
          <Tooltip title="Refresh">
            <GhostBtn onClick={fetchData}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </GhostBtn>
          </Tooltip>
        </Stack>
      </Stack>

      {/* ── KPI Cards ── */}
      <Grid2 container spacing={1.5} mb={2.5}>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <KPICard label="Total Students" value={studentsPagination.total || 0} icon={PeopleAltIcon} delay={0} />
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <KPICard label="Page" value={`${studentsPagination.page || 1} / ${studentsPagination.pages || 1}`} icon={LayersIcon}
            gradient={`linear-gradient(135deg, ${T.emerald} 0%, #047857 100%)`} delay={0.07} />
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <KPICard label="Showing" value={students.length} icon={TrendingUpIcon}
            gradient={`linear-gradient(135deg, ${T.sky} 0%, #0369A1 100%)`} delay={0.14} />
        </Grid2>
        <Grid2 size={{ xs: 6, sm: 3 }}>
          <KPICard label="Active Filters" value={activeFilters} icon={FilterListIcon}
            gradient={`linear-gradient(135deg, ${T.amber} 0%, #B45309 100%)`} delay={0.21} />
        </Grid2>
      </Grid2>

      {/* ── Alerts ── */}
      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2, fontSize: "0.78rem" }} onClose={() => dispatch(clearFeeMessages())}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 1.5, borderRadius: 2, fontSize: "0.78rem" }} onClose={() => dispatch(clearFeeMessages())}>{successMsg}</Alert>}

      {/* ── Filters Panel ── */}
      {showFilters && (
        <Surface elevation={0} sx={{ p: 2, mb: 2, animation: `${fadeUp} 0.25s ease` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: T.purple700, letterSpacing: 0.3 }}>
              FILTER CRITERIA
            </Typography>
            <Chip
              label={`${studentsPagination.total || 0} results`}
              size="small"
              sx={{ bgcolor: alpha(T.purple600, 0.1), color: T.purple700, fontWeight: 700, fontSize: "0.68rem", height: 22 }}
            />
          </Stack>

          <Grid2 container spacing={1.5} alignItems="flex-end">
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <FilterSelect fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.78rem" }}>Class</InputLabel>
                <Select value={filters.classId || ""} label="Class" onChange={(e) => handleFilterChange("classId", e.target.value)} sx={{ fontSize: "0.78rem" }}>
                  <MenuItem value="" sx={{ fontSize: "0.78rem" }}>All Classes</MenuItem>
                  {classes.map((c) => <MenuItem key={c._id} value={c._id} sx={{ fontSize: "0.78rem" }}>{c.class_text}</MenuItem>)}
                </Select>
              </FilterSelect>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2 }}>
              <FilterSelect fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.78rem" }}>Section</InputLabel>
                <Select value={filters.section || ""} label="Section" onChange={(e) => handleFilterChange("section", e.target.value)} sx={{ fontSize: "0.78rem" }}>
                  <MenuItem value="" sx={{ fontSize: "0.78rem" }}>All</MenuItem>
                  {sections.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: "0.78rem" }}>{s}</MenuItem>)}
                </Select>
              </FilterSelect>
            </Grid2>

            <Grid2 size={{ xs: 12, md: 5 }}>
              <FilterInput
                fullWidth size="small"
                placeholder="Search by name, roll no, admission no…"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        {studentsLoading ? <CircularProgress size={14} sx={{ color: T.purple600 }} /> : <SearchIcon sx={{ fontSize: 17, color: T.gray500 }} />}
                      </InputAdornment>
                    ),
                    endAdornment: searchInput ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => handleSearchChange("")}><ClearIcon sx={{ fontSize: 15 }} /></IconButton>
                      </InputAdornment>
                    ) : null,
                  },
                }}
              />
            </Grid2>

            <Grid2 size={{ xs: 12, md: 2 }}>
              <PrimaryBtn fullWidth onClick={fetchData} startIcon={<SearchIcon sx={{ fontSize: 16 }} />}>
                Search
              </PrimaryBtn>
            </Grid2>
          </Grid2>
        </Surface>
      )}

      {/* ── Student Table ── */}
      <Surface elevation={0} sx={{ overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${alpha(T.purple600, 0.08)}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography sx={{ fontWeight: 700, fontSize: "0.8rem", color: T.purple700, letterSpacing: 0.3 }}>
            STUDENT LIST
          </Typography>
          {students.length > 0 && (
            <Typography sx={{ fontSize: "0.68rem", color: T.gray500 }}>
              {((studentsPagination.page - 1) * studentsPagination.limit) + 1}–{Math.min(studentsPagination.page * studentsPagination.limit, studentsPagination.total)} of {studentsPagination.total}
            </Typography>
          )}
        </Box>

        {studentsLoading && students.length === 0 ? (
          <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={32} sx={{ color: T.purple600 }} />
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Box sx={{ width: 52, height: 52, borderRadius: 3, bgcolor: T.purple100, display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
              <PersonIcon sx={{ fontSize: 26, color: T.purple400 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: T.gray700, mb: 0.5 }}>No students found</Typography>
            <Typography sx={{ fontSize: "0.73rem", color: T.gray500 }}>Try different filter criteria</Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha(T.purple600, 0.04) }}>
                    {["Class", "Section", "Admission No", "Student Name", "Father Name", "Date of Birth", "Mobile", "Actions"].map((h, i) => (
                      <TableCell key={h} align={i === 7 ? "center" : "left"}
                        sx={{ fontWeight: 700, fontSize: "0.68rem", color: T.gray500, py: 1.25, letterSpacing: 0.4, textTransform: "uppercase", borderBottom: `1px solid ${alpha(T.purple600, 0.1)}` }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student, i) => {
                    const name = student.firstName ? `${student.firstName} ${student.lastName || ""}`.trim() : student.studentName || "—";
                    return (
                      <TableRow key={student._id} hover
                        sx={{ "&:hover": { bgcolor: alpha(T.purple600, 0.025) }, animation: `${fadeUp} 0.25s ease ${i * 0.025}s both`, borderBottom: `1px solid ${alpha(T.gray300, 0.5)}` }}>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1, color: T.gray700 }}>{student.class?.class_text || "—"}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1, color: T.gray700 }}>{student.section || "—"}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1, color: T.gray700, fontFamily: "monospace" }}>{student.admissionNo || student.admissionNumber || "—"}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1 }}>
                          <Stack direction="row" alignItems="center" spacing={0.75}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: "0.62rem", bgcolor: T.purple100, color: T.purple700, fontWeight: 700 }}>
                              {(student.firstName || "?").charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: T.purple700 }}>{name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1, color: T.gray700 }}>{student.fatherName || "—"}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1, color: T.gray700 }}>{fmtDate(student.dateOfBirth)}</TableCell>
                        <TableCell sx={{ fontSize: "0.85rem", py: 1.1, color: T.gray700 }}>{student.mobileNumber || "—"}</TableCell>
                        <TableCell align="center" sx={{ py: 1.1 }}>
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Collect Fees">
                              <IconButton size="small" onClick={() => handleCollectFeesClick(student)}
                                sx={{ bgcolor: alpha(T.purple600, 0.08), color: T.purple600, borderRadius: 1.5, p: 0.6, "&:hover": { bgcolor: alpha(T.purple600, 0.16) } }}>
                                <PaymentsIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Student Details">
                              <IconButton size="small" onClick={() => handleViewDetails(student)}
                                sx={{ bgcolor: alpha(T.sky, 0.08), color: T.sky, borderRadius: 1.5, p: 0.6, "&:hover": { bgcolor: alpha(T.sky, 0.16) } }}>
                                <PersonIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="View Receipts">
                              <IconButton size="small" onClick={() => handleViewReceipts(student)}
                                sx={{ bgcolor: alpha(T.emerald, 0.08), color: T.emerald, borderRadius: 1.5, p: 0.6, "&:hover": { bgcolor: alpha(T.emerald, 0.16) } }}>
                                <ReceiptIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Surface>

      {/* ── Pagination ── */}
      {studentsPagination.pages > 1 && (
        <Surface elevation={0} sx={{ p: 1.5, mt: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: "0.7rem", color: T.gray500 }}>
              Page {studentsPagination.page} of {studentsPagination.pages}
            </Typography>
            <Pagination
              count={studentsPagination.pages}
              page={studentsPagination.page}
              onChange={(_, p) => handleFilterChange("page", p)}
              color="primary"
              size="small"
              sx={{
                "& .MuiPaginationItem-root": { borderRadius: 2, fontSize: "0.72rem", fontWeight: 600, minWidth: 28, height: 28 },
                "& .Mui-selected": { background: `${T.purple600} !important`, color: `${T.white} !important` },
              }}
            />
          </Stack>
        </Surface>
      )}

      {/* ── Student Details Dialog ── */}
      <Dialog open={studentDetailsDialog} onClose={() => { setStudentDetailsDialog(false); setSelectedStudentForDetails(null); }}
        maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${T.purple600} 0%, ${T.purple800} 100%)`, color: T.white, py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(T.white, 0.2) }}><PersonIcon sx={{ fontSize: 20 }} /></Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Student Details</Typography>
                <Typography sx={{ fontSize: "0.68rem", opacity: 0.85 }}>Complete profile information</Typography>
              </Box>
            </Stack>
            <GhostBtn size="small" onClick={() => { setStudentDetailsDialog(false); setSelectedStudentForDetails(null); }}
              sx={{ color: T.white, border: `1px solid ${alpha(T.white, 0.3)}`, "&:hover": { bgcolor: alpha(T.white, 0.15) } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </GhostBtn>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, pb: 2.5 }}>
          {selectedStudentForDetails && (
            <Stack spacing={2.5}>
              {/* Profile Header */}
              <Box sx={{ p: 2, borderRadius: 2.5, background: alpha(T.purple50, 0.8), border: `1px solid ${alpha(T.purple600, 0.15)}` }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={selectedStudentForDetails.photo}
                    sx={{ width: 72, height: 72, bgcolor: T.purple600, fontSize: "1.8rem", fontWeight: 700, border: `3px solid ${T.white}`, boxShadow: `0 3px 10px ${alpha(T.purple800, 0.25)}` }}>
                    {selectedStudentForDetails.firstName?.charAt(0)}
                  </Avatar>
                  <Box flex={1}>
                    <Typography sx={{ fontWeight: 800, color: T.purple700, fontSize: "1rem", mb: 0.5 }}>
                      {selectedStudentForDetails.firstName} {selectedStudentForDetails.lastName}
                    </Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" sx={{ gap: 0.5 }}>
                      <Chip icon={<SchoolIcon sx={{ fontSize: 13 }} />}
                        label={`${selectedStudentForDetails.class?.class_text || "N/A"} — ${selectedStudentForDetails.section || "N/A"}`}
                        size="small" sx={{ bgcolor: alpha(T.purple600, 0.1), color: T.purple700, fontWeight: 600, fontSize: "0.68rem", height: 22 }} />
                      <Chip label={`Roll: ${selectedStudentForDetails.rollNumber || "N/A"}`}
                        size="small" sx={{ bgcolor: alpha(T.sky, 0.1), color: T.sky, fontWeight: 600, fontSize: "0.68rem", height: 22 }} />
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Info Grid */}
              {[
                {
                  title: "Personal Information",
                  fields: [
                    ["Full Name", `${selectedStudentForDetails.firstName || ""} ${selectedStudentForDetails.middleName || ""} ${selectedStudentForDetails.lastName || ""}`.trim()],
                    ["Date of Birth", fmtDate(selectedStudentForDetails.dateOfBirth)],
                    ["Gender", selectedStudentForDetails.gender],
                    ["Blood Group", selectedStudentForDetails.bloodGroup],
                    ["Religion", selectedStudentForDetails.religion],
                    ["Caste", selectedStudentForDetails.caste],
                  ],
                },
                {
                  title: "Parent Information",
                  fields: [
                    ["Father's Name", selectedStudentForDetails.fatherName],
                    ["Father's Phone", selectedStudentForDetails.fatherPhone],
                    ["Mother's Name", selectedStudentForDetails.motherName],
                    ["Mother's Phone", selectedStudentForDetails.motherPhone],
                    ["Guardian Name", selectedStudentForDetails.guardianName],
                    ["Mobile Number", selectedStudentForDetails.mobileNumber],
                  ],
                },
                {
                  title: "Academic Information",
                  fields: [
                    ["Admission No", selectedStudentForDetails.admissionNo || selectedStudentForDetails.admissionNumber],
                    ["Admission Date", fmtDate(selectedStudentForDetails.admissionDate)],
                    ["Academic Year", selectedStudentForDetails.academicYear],
                    ["Current Address", selectedStudentForDetails.currentAddress, true],
                  ],
                },
              ].map(({ title, fields }) => (
                <Box key={title}>
                  <Typography sx={{ fontWeight: 700, fontSize: "0.72rem", color: T.purple600, letterSpacing: 0.5, textTransform: "uppercase", mb: 1.25 }}>
                    {title}
                  </Typography>
                  <Grid2 container spacing={1}>
                    {fields.map(([label, value, wide]) => (
                      <Grid2 key={label} size={{ xs: 12, sm: wide ? 12 : 6 }}>
                        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: T.gray100, border: `1px solid ${alpha(T.gray300, 0.6)}` }}>
                          <Typography sx={{ fontSize: "0.64rem", color: T.gray500, mb: 0.3, letterSpacing: 0.3, textTransform: "uppercase" }}>{label}</Typography>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.75rem", color: T.gray900 }}>{value || "—"}</Typography>
                        </Box>
                      </Grid2>
                    ))}
                  </Grid2>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.75, borderTop: `1px solid ${alpha(T.purple600, 0.1)}`, bgcolor: alpha(T.purple50, 0.5) }}>
          <Button onClick={() => { setStudentDetailsDialog(false); setSelectedStudentForDetails(null); }}
            sx={{ textTransform: "none", fontSize: "0.78rem", color: T.gray700, fontWeight: 600 }}>Close</Button>
          <PrimaryBtn onClick={() => handleCollectFeesClick(selectedStudentForDetails)} startIcon={<PaymentsIcon sx={{ fontSize: 15 }} />}>
            Collect Fees
          </PrimaryBtn>
        </DialogActions>
      </Dialog>

      {/* ── Receipts Dialog ── */}
      <Dialog open={receiptsDialog} onClose={() => { setReceiptsDialog(false); setSelectedStudentForFee(null); }}
        maxWidth="lg" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, overflow: "hidden" } } }}>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${T.emerald} 0%, #047857 100%)`, color: T.white, py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(T.white, 0.2) }}><ReceiptIcon sx={{ fontSize: 20 }} /></Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Fee Summary</Typography>
                {selectedStudentForFee && (
                  <Typography sx={{ fontSize: "0.68rem", opacity: 0.85 }}>
                    {selectedStudentForFee.firstName} {selectedStudentForFee.lastName} · {selectedStudentForFee.admissionNo || selectedStudentForFee.admissionNumber}
                  </Typography>
                )}
              </Box>
            </Stack>
            <GhostBtn size="small" onClick={() => { setReceiptsDialog(false); setSelectedStudentForFee(null); }}
              sx={{ color: T.white, border: `1px solid ${alpha(T.white, 0.3)}`, "&:hover": { bgcolor: alpha(T.white, 0.15) } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </GhostBtn>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, minHeight: 250 }}>
          {studentsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress size={36} sx={{ color: T.emerald }} /></Box>
          ) : !feeAssignments || feeAssignments.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <ReceiptIcon sx={{ fontSize: 48, color: T.gray300, mb: 1.5 }} />
              <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: T.gray500 }}>No fee records found</Typography>
            </Box>
          ) : (
            <Box>
              <Grid2 container spacing={1.5} sx={{ mb: 2.5 }}>
                {[
                  ["Total", feeAssignments.reduce((s, f) => s + f.amount, 0), T.purple600],
                  ["Paid", feeAssignments.reduce((s, f) => s + f.paidAmount, 0), T.emerald],
                  ["Discount", feeAssignments.reduce((s, f) => s + f.discountAmount, 0), T.amber],
                  ["Balance", feeAssignments.reduce((s, f) => s + f.balance, 0), T.rose],
                ].map(([label, val, color]) => (
                  <Grid2 key={label} size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(color, 0.06), border: `1px solid ${alpha(color, 0.2)}` }}>
                      <Typography sx={{ fontSize: "0.65rem", color: T.gray500, mb: 0.25 }}>{label}</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color }}>{fmt(val)}</Typography>
                    </Box>
                  </Grid2>
                ))}
              </Grid2>

              <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(T.gray300, 0.7)}`, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha(T.purple600, 0.04) }}>
                      {["Fees Group", "Fees Code", "Due Date", "Status", "Amount", "Paid", "Discount", "Fine", "Balance"].map((h, i) => (
                        <TableCell key={h} align={i > 3 ? "right" : "left"}
                          sx={{ fontWeight: 700, fontSize: "0.65rem", color: T.gray500, py: 1, letterSpacing: 0.4, textTransform: "uppercase" }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {feeAssignments.map((fee, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontSize: "0.72rem", py: 1 }}>{fee.feeMaster?.feesGroup || "—"}</TableCell>
                        <TableCell sx={{ fontSize: "0.72rem", py: 1 }}>{fee.feeMaster?.feesCode || "—"}</TableCell>
                        <TableCell sx={{ fontSize: "0.72rem", py: 1 }}>{fmtDate(fee.dueDate)}</TableCell>
                        <TableCell sx={{ py: 1 }}>
                          <Chip label={fee.status} size="small"
                            sx={{ height: 18, fontSize: "0.62rem", fontWeight: 700,
                              bgcolor: fee.status === "Paid" ? alpha(T.emerald, 0.1) : fee.status === "Partial" ? alpha(T.amber, 0.1) : alpha(T.rose, 0.1),
                              color: fee.status === "Paid" ? T.emerald : fee.status === "Partial" ? T.amber : T.rose }} />
                        </TableCell>
                        {[fee.amount, fee.paidAmount, fee.discountAmount, fee.fineAmount, fee.balance].map((v, vi) => (
                          <TableCell key={vi} align="right" sx={{ fontSize: "0.72rem", py: 1, fontWeight: vi === 4 ? 700 : 400,
                            color: vi === 1 ? T.emerald : vi === 4 ? T.rose : "inherit" }}>{fmt(v)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${alpha(T.gray300, 0.5)}` }}>
          <Button onClick={() => { setReceiptsDialog(false); setSelectedStudentForFee(null); }}
            sx={{ textTransform: "none", fontSize: "0.78rem" }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Root>
  );
}